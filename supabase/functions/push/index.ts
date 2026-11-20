// Fonction Edge « push » : envoie les notifications Web Push de Méridien.
//   GET                          -> { publicKey } (crée les clés VAPID au premier appel, rangées dans la table push_keys)
//   POST { type: "daily" }       -> « Nouveau jeu du jour » à 14 h 30 (heure de Barcelone), une seule fois par jour
//   POST { type: "message", id } -> message de groupe : prévient les autres membres abonnés (sauf ceux qui ont bloqué l'auteur)
// À déployer avec « Verify JWT » désactivé : la base l'appelle sans jeton. Chaque envoi est idempotent (table push_log) :
// l'appeler plusieurs fois ne prévient personne deux fois. SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournies par Supabase.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

// clé de service fournie par Supabase à la fonction (ancien nom, sinon les nouvelles clés « secret »)
function serviceKey(): string {
  const old = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (old) return old;
  try { const k = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); const v = k.default ?? Object.values(k)[0]; if (typeof v === "string") return v; } catch (_) { /* ignoré */ }
  return Deno.env.get("SUPABASE_SECRET_KEY") ?? "";
}
const sb = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey(), { auth: { persistSession: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const reply = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const SITE = "https://chemsbellaza.github.io/Meridien-App/";

async function vapid() {
  const read = () => sb.from("push_keys").select("public_key, private_key").eq("id", 1).maybeSingle();
  let { data } = await read();
  if (!data) {
    const k = webpush.generateVAPIDKeys();
    await sb.from("push_keys").upsert({ id: 1, public_key: k.publicKey, private_key: k.privateKey }, { onConflict: "id", ignoreDuplicates: true });
    ({ data } = await read());
  }
  if (!data) throw new Error("push_keys");
  webpush.setVapidDetails(SITE, data.public_key, data.private_key);
  return data.public_key as string;
}

type Sub = { endpoint: string; p256dh: string; auth: string };
async function sendAll(subs: Sub[], payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  let sent = 0, gone: string[] = [];
  await Promise.allSettled(subs.map(async (s) => {
    try { await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 3600, urgency: "normal" }); sent++; }
    catch (e) { const code = (e as { statusCode?: number }).statusCode; if (code === 404 || code === 410) gone.push(s.endpoint); }
  }));
  if (gone.length) await sb.from("push_subs").delete().in("endpoint", gone); // abonnements périmés
  return { sent, removed: gone.length };
}

// date et heure à Barcelone
function madrid() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "long", hour12: false }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, minutes: (Number(p.hour) % 24) * 60 + Number(p.minute), sunday: p.weekday === "Sunday" };
}

// true si cet envoi est nouveau (la clé n'existait pas encore dans push_log)
async function once(kind: string, day: string) {
  const { data } = await sb.from("push_log").upsert({ kind, day }, { onConflict: "kind,day", ignoreDuplicates: true }).select("kind");
  return !!(data && data.length);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const publicKey = await vapid();
    if (req.method === "GET") return reply({ publicKey });
    const b = await req.json().catch(() => ({}));
    await sb.from("push_log").delete().lt("sent_at", new Date(Date.now() - 3 * 864e5).toISOString()); // ménage

    if (b.type === "daily") {
      const m = madrid();
      if (m.minutes < 870 || m.minutes >= 930) return reply({ ok: true, skipped: "not_time" }); // 14 h 30 – 15 h 30 seulement
      if (!(await once("daily", m.day))) return reply({ ok: true, skipped: "already_sent" });
      const { data: subs } = await sb.from("push_subs").select("endpoint, p256dh, auth").eq("daily", true);
      const r = await sendAll(subs ?? [], {
        title: m.sunday ? "Jeu spécial du dimanche 🌟" : "Nouveau jeu du jour 🌍",
        body: m.sunday ? "Le Méga-quiz t'attend : un seul essai, points ×2 !" : "Un nouveau jeu vient d'arriver. Viens le découvrir !",
        tag: "daily", url: "./",
      });
      return reply({ ok: true, ...r });
    }

    if (b.type === "message" && typeof b.id === "string") {
      const { data: msg } = await sb.from("messages").select("id, group_id, user_id, body, created_at").eq("id", b.id).maybeSingle();
      if (!msg || Date.now() - Date.parse(msg.created_at) > 10 * 60e3) return reply({ ok: true, skipped: "stale" });
      if (!(await once("msg:" + msg.id, madrid().day))) return reply({ ok: true, skipped: "already_sent" });
      const [{ data: mem }, { data: blocks }, { data: pr }, { data: grp }] = await Promise.all([
        sb.from("group_members").select("user_id").eq("group_id", msg.group_id),
        sb.from("blocks").select("blocker_id").eq("blocked_id", msg.user_id),
        sb.from("profiles").select("pseudo").eq("id", msg.user_id).maybeSingle(),
        sb.from("groups").select("name").eq("id", msg.group_id).maybeSingle(),
      ]);
      const blocked = new Set((blocks ?? []).map((x) => x.blocker_id));
      const ids = (mem ?? []).map((x) => x.user_id).filter((u) => u !== msg.user_id && !blocked.has(u));
      if (!ids.length) return reply({ ok: true, sent: 0 });
      const { data: subs } = await sb.from("push_subs").select("endpoint, p256dh, auth").in("user_id", ids).eq("msgs", true);
      const who = pr?.pseudo ?? "Un ami", sticker = String(msg.body).startsWith("::s:"), gif = String(msg.body).startsWith("::g:");
      const text = sticker ? `${who} a envoyé un autocollant` : gif ? `${who} a envoyé un GIF` : `${who} : ${String(msg.body).slice(0, 110)}`;
      const r = await sendAll(subs ?? [], { title: grp?.name ?? "Méridien", body: text, tag: "msg-" + msg.group_id, url: `./?chat=${msg.group_id}&msg=${msg.id}` });
      return reply({ ok: true, ...r });
    }
    // un essai terminé : « X vient de jouer », « nouveau record », « X t'a dépassé »
    if (b.type === "attempt" && typeof b.id === "string") {
      const { data: a } = await sb.from("attempts").select("id, user_id, group_id, day, fmt, score, catchup, try_idx, submitted_at").eq("id", b.id).maybeSingle();
      if (!a || a.score == null || !a.group_id || Date.now() - Date.parse(a.submitted_at) > 10 * 60e3) return reply({ ok: true, skipped: "stale" });
      if (!(await once("att:" + a.id, madrid().day))) return reply({ ok: true, skipped: "already_sent" });
      const [{ data: mem }, { data: blocks }, { data: pr }, { data: grp }, { data: others }, { data: past }] = await Promise.all([
        sb.from("group_members").select("user_id").eq("group_id", a.group_id),
        sb.from("blocks").select("blocker_id").eq("blocked_id", a.user_id),
        sb.from("profiles").select("pseudo").eq("id", a.user_id).maybeSingle(),
        sb.from("groups").select("name").eq("id", a.group_id).maybeSingle(),
        // meilleur score de chacun ce jour-là dans ce groupe (hors rattrapages et hors cet essai)
        sb.from("attempts").select("user_id, score").eq("group_id", a.group_id).eq("day", a.day).eq("catchup", false).not("submitted_at", "is", null).neq("id", a.id),
        // meilleur score de tous les temps sur ce jeu dans ce groupe (avant cet essai)
        sb.from("attempts").select("score").eq("group_id", a.group_id).eq("fmt", a.fmt).not("submitted_at", "is", null).neq("id", a.id).order("score", { ascending: false }).limit(1),
      ]);
      const blocked = new Set((blocks ?? []).map((x) => x.blocker_id));
      const best = new Map<string, number>(); // meilleur score du jour par joueur
      for (const o of others ?? []) best.set(o.user_id, Math.max(best.get(o.user_id) ?? -1, o.score));
      const mine = best.get(a.user_id) ?? -1; // mon meilleur avant cet essai
      const prevRecord = past && past.length ? past[0].score : null;
      const record = prevRecord !== null && a.score > prevRecord;
      const passed = new Set<string>(); // ceux que je viens de dépasser (rattrapage : le classement ne bouge pas)
      if (!a.catchup) for (const [u, s] of best) if (u !== a.user_id && a.score > s && mine <= s) passed.add(u);
      const ids = (mem ?? []).map((x) => x.user_id).filter((u) => u !== a.user_id && !blocked.has(u));
      if (!ids.length) return reply({ ok: true, sent: 0 });
      const { data: subs } = await sb.from("push_subs").select("endpoint, p256dh, auth, user_id, plays, rivals").in("user_id", ids);
      const who = pr?.pseudo ?? "Un ami", n = a.score, title = grp?.name ?? "Méridien", url = `./?chat=${a.group_id}`;
      const pick = (arr: string[]) => arr[[...String(a.id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % arr.length];
      const game = a.catchup ? "le jeu de la veille" : "le jeu du jour";
      const recordTxt = pick([`${who} a établi un nouveau record sur ${game} : ${n} pts`, `Nouveau record ! ${who} fait ${n} pts sur ${game}`, `${who} vient de battre le record de ${game} (${n} pts)`]);
      const both = pick([`${who} a établi un nouveau record et t'a dépassé :O`, `${who} t'a dépassé et bat le record de ${game} :O`]);
      const passTxt = pick([`${who} t'a dépassé :O`, `${who} vient de passer devant toi. Tu ripostes ?`, `Aïe, ${who} t'a dépassé`]);
      const playTxt = a.catchup ? `${who} rattrape le jeu de la veille : ${n} pts` : a.try_idx > 0 ? `${who} retente sa chance : ${n} pts` : pick([`${who} vient de jouer : ${n} pts`, `${who} a fait son essai : ${n} pts`, `${who} a joué : ${n} pts`]);
      // une notification par personne, la plus importante d'abord : record (et dépassé), dépassé, sinon essai
      const plays: Sub[] = [], bothS: Sub[] = [], recS: Sub[] = [], passS: Sub[] = [];
      for (const s of subs ?? []) {
        const hit = passed.has(s.user_id);
        if (record && hit && s.rivals) bothS.push(s);
        else if (record && s.rivals) recS.push(s);
        else if (hit && s.rivals) passS.push(s);
        else if (s.plays) plays.push(s);
      }
      const out = await Promise.all([
        sendAll(bothS, { title, body: both, tag: "rival-" + a.id, url }),
        sendAll(recS, { title, body: recordTxt, tag: "record-" + a.group_id, url }),
        sendAll(passS, { title, body: passTxt, tag: "pass-" + a.id, url }),
        sendAll(plays, { title, body: playTxt, tag: "plays-" + a.group_id, url }), // même étiquette : les « X a joué » se remplacent au lieu de s'empiler
      ]);
      return reply({ ok: true, record, passed: passed.size, sent: out.reduce((t, x) => t + x.sent, 0) });
    }
    return reply({ ok: false, error: "bad_request" }, 400);
  } catch (e) {
    return reply({ ok: false, error: String((e as Error).message ?? e) }, 500);
  }
});

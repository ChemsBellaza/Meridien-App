/* =================== MÉRIDIEN — prototype =================== */
"use strict";

/* ---------- réglages du jeu (faciles à modifier) ---------- */
const CONFIG = {
  tries: 2,                         // essais par jour
  mult: [1, 1.25, 1.5],             // multiplicateurs Facile / Moyen / Difficile
  gemsPerRank: 16,                  // boussoles gagnées par place devancée
  seasonDays: 28,                   // durée d'une saison (= un tour de tous les jeux)
  seasonAnchor: "2026-10-19",       // début de la saison 1 (et défi n°1)
  formatAnchor: "2026-10-25",       // ce jour-là = premier jeu de la liste
  jokerCost: 25,                    // prix d'un joker en boussoles
  formatOrder: ["sprint", "quiz", "motdujour", "carte", "petitbac", "paysmystere", "drapeaux", "connexions", "anagrammes", "frise", "capitales",
    "neavant", "intrus", "plusmoins", "comptebon", "quisuisje", "top10", "distance", "silhouettes", "relier", "sigles", "vraifaux", "rebus",
    "chaine", "voisins", "citations", "classement", "blocs"]
};

const THEMES = {
  hist:     { label: "Histoire",       color: "#E8664F" },
  geopo:    { label: "Géopolitique",   color: "#4A72E0" },
  geo:      { label: "Géographie",     color: "#1E9A73" },
  cine:     { label: "Cinéma et séries", color: "#C2417A" },
  musique:  { label: "Musique",        color: "#8A4FD6" },
  sport:    { label: "Sport",          color: "#E08A2E" },
  sciences: { label: "Sciences",       color: "#2BA3B8" },
  arts:     { label: "Arts et lettres", color: "#B8577A" },
  gastro:   { label: "Gastronomie",    color: "#D4A017" },
  nature:   { label: "Nature",         color: "#5A8F3C" },
  expr:     { label: "Expressions",    color: "#E5534B" }
};
const STATS = {
  pop:    { label: "Population",  color: "#E0663A", unit: "hab.", q: "le plus peuplé" },
  area:   { label: "Superficie",  color: "#1E9A73", unit: "km²", q: "le plus grand" },
  alt:    { label: "Sommets",     color: "#4A72E0", unit: "m", q: "le plus haut" },
  len:    { label: "Fleuves",     color: "#2BA3B8", unit: "km", q: "le plus long" },
  chrono: { label: "Chronologie", color: "#8A4FD6", unit: "", q: "le plus ancien" }
};

/* Chaque jeu : moteur, manches (thèmes, continents, statistiques, catégories ou cases), barème.
   max = points de base maximum d'une manche, avant multiplicateur. */
const FORMATS = {
  carte:      { name: "La Carte", color: "#1E8C72", eng: "carte", per: 2, max: 200, man: "themes", themes: ["hist", "geopo", "geo", "sport", "cine"],
                sub: "Place chaque lieu le plus près possible sur la carte." },
  frise:      { name: "La Frise", color: "#2F5AA8", eng: "frise", per: 2, max: 200, man: "themes", themes: ["hist", "geopo", "geo", "sport", "sciences", "cine"],
                sub: "Retrouve l'année de chaque événement sur la frise." },
  quiz:       { name: "Le Quiz éclair", color: "#6A4FD6", eng: "mcq", per: 3, max: 300, secs: 15, man: "themes", themes: ["hist", "geopo", "geo", "cine", "musique", "sport", "sciences", "arts", "gastro", "nature"],
                sub: "Quatre réponses, une seule bonne, 15 secondes par question." },
  sprint:     { name: "Sprint Carte", color: "#E0663A", eng: "sprint", max: 300, secs: 60, man: "conts", conts: ["af", "eu", "as", "am"],
                sub: "Un pays s'affiche : touche-le sur la carte. Le plus possible en 60 secondes." },
  capitales:  { name: "Sprint Capitales", color: "#C2417A", eng: "capitales", max: 300, secs: 60, man: "conts", conts: ["af", "eu", "as", "am"],
                sub: "Écris la capitale de chaque pays. Le plus possible en 60 secondes." },
  petitbac:   { name: "Le Petit Bac", color: "#D99A12", eng: "petitbac", max: 300, secs: 60, man: "slots", slot: "Lettre",
                sub: "Une lettre, 6 à 10 catégories, 60 secondes. Une réponse que personne d'autre n'a trouvée rapporte plus." },
  plusmoins:  { name: "Plus ou moins", color: "#2E8FC6", eng: "plusmoins", max: 300, man: "stats", stats: ["pop", "area", "alt", "len"],
                sub: "Le second est-il plus ou moins grand que le premier ? La série s'arrête à la première erreur." },
  drapeaux:   { name: "Drapeaux", color: "#D9483B", eng: "mcq", per: 5, max: 300, secs: 10, man: "conts", conts: ["af", "eu", "as", "am"],
                sub: "Reconnais le pays de chaque drapeau. 10 secondes par drapeau." },
  intrus:     { name: "L'intrus", color: "#7A5BD0", eng: "mcq", per: 3, max: 300, secs: 20, man: "themes", themes: ["hist", "geo", "sport", "cine"],
                sub: "Quatre propositions : trouve celle qui ne va pas avec les autres." },
  quisuisje:  { name: "Qui suis-je ?", color: "#3D7DD8", eng: "clues", per: 2, max: 200, man: "themes", themes: ["hist", "geo", "sport", "cine", "sciences"],
                sub: "Des indices de plus en plus faciles. Réponds le plus tôt possible." },
  connexions: { name: "Connexions", color: "#8E44AD", eng: "connex", max: 300, man: "slots", slot: "Grille", shared: true,
                sub: "Seize mots, quatre familles cachées. Quatre erreurs maximum." },
  motdujour:  { name: "Le Mot du jour", color: "#3A9D5D", eng: "wordle", max: 300, man: "slots", slot: "Mot", shared: true,
                sub: "Six essais pour trouver le mot. Vert : bien placé. Jaune : mal placé." },
  top10:      { name: "Top 10", color: "#E5534B", eng: "listtype", max: 300, secs: 75, man: "slots", slot: "Liste", shared: true,
                sub: "Cite le plus d'éléments du classement en 75 secondes." },
  silhouettes:{ name: "Silhouettes", color: "#4C5BD4", eng: "mcq", per: 4, max: 300, secs: 12, man: "conts", conts: ["af", "eu", "as", "am"], map: true,
                sub: "Reconnais chaque pays à sa forme. 12 secondes par silhouette." },
  relier:     { name: "Relier", color: "#1F9E8F", eng: "pairs", max: 300, man: "themes", themes: ["geo", "hist", "arts", "sciences", "cine", "sport"],
                sub: "Relie chaque élément de gauche à son partenaire de droite." },
  vraifaux:   { name: "Vrai ou faux", color: "#F07A2D", eng: "rafale", max: 300, secs: 40, man: "kinds",
                kinds: { geo: { label: "Capitales", color: "#1E9A73", btn: ["Vrai", "Faux"] }, pays: { label: "Chiffres des pays", color: "#E0663A", btn: ["Vrai", "Faux"] },
                         hist: { label: "Dates d'histoire", color: "#E8664F", btn: ["Vrai", "Faux"] }, culture: { label: "Sport et sciences", color: "#2BA3B8", btn: ["Vrai", "Faux"] } },
                sub: "Le plus d'affirmations possible en 40 secondes. Trois erreurs et la manche s'arrête." },
  rebus:      { name: "Rébus emoji", color: "#E8A317", eng: "mcq", per: 3, max: 300, secs: 20, man: "themes", themes: ["cine", "geo", "expr"],
                sub: "Que cachent ces emojis ? Un film, un lieu ou une expression." },
  voisins:    { name: "Voisins", color: "#5A8F3C", eng: "listtype", max: 300, secs: 45, man: "slots", slot: "Pays", shared: true,
                sub: "Cite tous les pays frontaliers en 45 secondes." },
  citations:  { name: "Qui a dit ça ?", color: "#B8577A", eng: "mcq", per: 2, max: 200, secs: 20, man: "themes", themes: ["hist", "geopo", "arts", "sciences"],
                sub: "Une phrase célèbre, quatre auteurs possibles." },
  classement: { name: "Classement", color: "#6B7D24", eng: "order", per: 2, max: 300, man: "stats", stats: ["pop", "area", "alt", "len", "chrono"],
                sub: "Touche les cinq éléments dans l'ordre, du plus grand au plus petit." },
  blocs:      { name: "Blocs et alliances", color: "#2D5BA8", eng: "rafale", max: 300, secs: 40, man: "kinds",
                kinds: { ueotan: { label: "UE et OTAN", color: "#2D5BA8", btn: ["UE seule", "OTAN seule", "Les deux", "Aucune"] },
                         euro: { label: "Zone euro", color: "#D99A12", btn: ["Oui", "Non"] },
                         mon: { label: "Monarchie ?", color: "#B8577A", btn: ["Monarchie", "République"] } },
                sub: "Classe un maximum de pays en 40 secondes. Trois erreurs et la manche s'arrête." },
  paysmystere:{ name: "Pays mystère", color: "#0E8C9A", eng: "mystere", max: 300, man: "conts", conts: ["af", "eu", "as", "am"], map: true,
                sub: "Devine le pays caché en 8 essais. Chaque pays proposé se colore selon sa distance : plus c'est chaud, plus tu es près." },
  neavant:    { name: "Qui est né avant ?", color: "#C25A2E", eng: "rafale", max: 300, secs: 45, man: "kinds",
                kinds: { nperso: { label: "Personnalités", color: "#C25A2E" }, nevent: { label: "Événements", color: "#E8664F" }, nculture: { label: "Sport, sciences, cinéma", color: "#2BA3B8" } },
                sub: "Deux noms, un seul choix : lequel est le plus ancien ? Le plus possible en 45 secondes, trois erreurs maximum." },
  chaine:     { name: "Chaîne de mots", color: "#3B8F6E", eng: "chaine", max: 300, secs: 60, man: "kinds",
                kinds: { pays: { label: "Pays", color: "#1E9A73" }, ville: { label: "Villes", color: "#4A72E0" }, animal: { label: "Animaux", color: "#5A8F3C" }, prenom: { label: "Prénoms", color: "#C2417A" } },
                sub: "Chaque mot commence par la dernière lettre du précédent. Le plus long enchaînement en 60 secondes." },
  anagrammes: { name: "Anagrammes", color: "#B5476B", eng: "anagram", max: 300, secs: 90, man: "kinds",
                kinds: { pays: { label: "Pays", color: "#1E9A73" }, capitale: { label: "Capitales", color: "#C2417A" }, animal: { label: "Animaux", color: "#5A8F3C" }, film: { label: "Films", color: "#8A4FD6" } },
                sub: "Remets les lettres dans l'ordre. Cinq mots par manche, 90 secondes." },
  comptebon:  { name: "Le compte est bon", color: "#4D6BC6", eng: "calc", max: 300, secs: 45, man: "kinds",
                kinds: { eclair: { label: "Calcul éclair", color: "#E08A2E" }, compte: { label: "Le compte est bon", color: "#4D6BC6" }, suite: { label: "Suites logiques", color: "#8A4FD6" } },
                sub: "Calcul mental, suites logiques et le grand classique : atteindre le nombre cible avec six plaques." },
  sigles:     { name: "Sigles", color: "#7B4FC9", eng: "mcq", per: 4, max: 300, secs: 20, man: "kinds",
                kinds: { inst: { label: "Institutions", color: "#4A72E0" }, quot: { label: "Vie quotidienne", color: "#E08A2E" }, tech: { label: "Sciences et techno", color: "#2BA3B8" } },
                sub: "ONU, SMIC, LASER… Que signifie chaque sigle ? 20 secondes par question." },
  distance:   { name: "Distance", color: "#2C7FB8", eng: "distance", per: 3, max: 300, man: "kinds",
                kinds: { france: { label: "En France", color: "#4A72E0" }, europe: { label: "En Europe", color: "#1E9A73" }, monde: { label: "Dans le monde", color: "#E0663A" } },
                sub: "Estime la distance à vol d'oiseau entre deux villes. Plus tu es précis, plus tu marques." }
};
const DIFFS = [
  { label: "Facile", sub: "Les grands classiques", color: "#2FA36B" },
  { label: "Moyen", sub: "Pour les curieux", color: "#F0A13A" },
  { label: "Difficile", sub: "Pour les experts", color: "#E5534B" }
];
const REGIONS = { // lonMin, lonMax, latMin, latMax, échelle de points (km)
  europe:   { box: [-12, 45, 34, 62], k: 300, label: "Europe" },
  africa:   { box: [-20, 62, -36, 40], k: 600, label: "Afrique et Moyen-Orient" },
  asia:     { box: [25, 150, -12, 56], k: 650, label: "Asie" },
  americas: { box: [-130, -30, -56, 60], k: 600, label: "Amériques" },
  world:    { box: [-170, 180, -50, 72], k: 900, label: "Monde" },
  france:   { box: [-5.5, 9.8, 41.2, 51.3], k: 120, label: "France" }
};

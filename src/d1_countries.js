/* ====== PAYS ======
   iso3;iso2;nom;variantes;continent;capitale;variantes capitale;population (millions, ~2024);superficie (milliers de km²);niveau 1-3;drapeaux
   continent : af Afrique, eu Europe, as Asie, am Amériques, oc Océanie
   drapeaux : e Union européenne, n OTAN, z zone euro (2026), m monarchie, l sans accès à la mer */
const COUNTRY_ROWS = `
DZA;DZ;Algérie;;af;Alger;;46.8;2382;1;
AGO;AO;Angola;;af;Luanda;;37.9;1247;2;
BEN;BJ;Bénin;;af;Porto-Novo;;14.5;115;2;
BWA;BW;Botswana;;af;Gaborone;;2.5;582;3;l
BFA;BF;Burkina Faso;Burkina;af;Ouagadougou;Ouaga;23.5;274;2;l
BDI;BI;Burundi;;af;Gitega;;14;27.8;3;l
CPV;CV;Cap-Vert;Cabo Verde;af;Praia;;0.53;4;3;
CMR;CM;Cameroun;;af;Yaoundé;;29.1;475;2;
CAF;CF;République centrafricaine;Centrafrique|RCA;af;Bangui;;5.3;623;3;l
TCD;TD;Tchad;;af;N'Djaména;Ndjamena;20.3;1284;2;l
COM;KM;Comores;;af;Moroni;;0.87;2.2;3;
COG;CG;République du Congo;Congo|Congo-Brazzaville;af;Brazzaville;;6.3;342;3;
COD;CD;République démocratique du Congo;RDC|RD Congo|Congo-Kinshasa;af;Kinshasa;;109;2345;2;
CIV;CI;Côte d'Ivoire;;af;Yamoussoukro;;31.9;322;1;
DJI;DJ;Djibouti;;af;Djibouti;;1.2;23;3;
EGY;EG;Égypte;;af;Le Caire;Caire;116.5;1002;1;
GNQ;GQ;Guinée équatoriale;;af;Malabo;;1.9;28;3;
ERI;ER;Érythrée;;af;Asmara;;3.5;121;3;
SWZ;SZ;Eswatini;Swaziland;af;Mbabane;Lobamba;1.2;17.4;3;ml
ETH;ET;Éthiopie;;af;Addis-Abeba;Addis Abeba;132;1104;1;l
GAB;GA;Gabon;;af;Libreville;;2.5;268;2;
GMB;GM;Gambie;;af;Banjul;;2.8;11.3;3;
GHA;GH;Ghana;;af;Accra;;34.4;239;1;
GIN;GN;Guinée;Guinée-Conakry;af;Conakry;;14.8;246;2;
GNB;GW;Guinée-Bissau;;af;Bissau;;2.2;36;3;
KEN;KE;Kenya;;af;Nairobi;;56.4;580;1;
LSO;LS;Lesotho;;af;Maseru;;2.3;30;3;ml
LBR;LR;Liberia;;af;Monrovia;;5.6;111;3;
LBY;LY;Libye;;af;Tripoli;;7.4;1760;1;
MDG;MG;Madagascar;;af;Antananarivo;Tananarive;31.9;587;1;
MWI;MW;Malawi;;af;Lilongwe;;21.7;118;3;l
MLI;ML;Mali;;af;Bamako;;24.5;1240;1;l
MRT;MR;Mauritanie;;af;Nouakchott;;5.2;1031;2;
MUS;MU;Maurice;Île Maurice;af;Port-Louis;;1.27;2;3;
MAR;MA;Maroc;;af;Rabat;;38.1;447;1;m
MOZ;MZ;Mozambique;;af;Maputo;;34.6;802;2;
NAM;NA;Namibie;;af;Windhoek;;3;824;2;
NER;NE;Niger;;af;Niamey;;27;1267;2;l
NGA;NG;Nigeria;Nigéria;af;Abuja;;232.7;924;1;
RWA;RW;Rwanda;;af;Kigali;;14.3;26;2;l
STP;ST;Sao Tomé-et-Principe;São Tomé-et-Príncipe;af;Sao Tomé;São Tomé;0.23;1;3;
SEN;SN;Sénégal;;af;Dakar;;18.5;197;1;
SYC;SC;Seychelles;;af;Victoria;;0.13;0.46;3;
SLE;SL;Sierra Leone;;af;Freetown;;8.6;72;3;
SOM;SO;Somalie;;af;Mogadiscio;Mogadishu;19;638;2;
ZAF;ZA;Afrique du Sud;;af;Pretoria;Le Cap|Bloemfontein|Tshwane;64;1221;1;
SSD;SS;Soudan du Sud;;af;Djouba;Juba;11.9;644;3;l
SDN;SD;Soudan;;af;Khartoum;;50.4;1886;2;
TZA;TZ;Tanzanie;;af;Dodoma;;68.6;945;1;
TGO;TG;Togo;;af;Lomé;;9.5;57;2;
TUN;TN;Tunisie;;af;Tunis;;12.3;164;1;
UGA;UG;Ouganda;;af;Kampala;;50;241;2;l
ZMB;ZM;Zambie;;af;Lusaka;;21.3;753;2;l
ZWE;ZW;Zimbabwe;;af;Harare;;16.6;391;2;l
ALB;AL;Albanie;;eu;Tirana;;2.8;28.7;2;n
AND;AD;Andorre;;eu;Andorre-la-Vieille;;0.08;0.47;2;ml
AUT;AT;Autriche;;eu;Vienne;;9.1;84;1;ezl
BLR;BY;Biélorussie;Bélarus;eu;Minsk;;9.1;208;2;l
BEL;BE;Belgique;;eu;Bruxelles;;11.8;30.7;1;enzm
BIH;BA;Bosnie-Herzégovine;Bosnie;eu;Sarajevo;;3.2;51;2;
BGR;BG;Bulgarie;;eu;Sofia;;6.4;111;2;enz
HRV;HR;Croatie;;eu;Zagreb;;3.9;56.6;1;enz
CYP;CY;Chypre;;eu;Nicosie;;1.36;9.25;2;ez
CZE;CZ;Tchéquie;République tchèque;eu;Prague;;10.9;78.9;1;enl
DNK;DK;Danemark;;eu;Copenhague;;6;43;1;enm
EST;EE;Estonie;;eu;Tallinn;;1.37;45;2;enz
FIN;FI;Finlande;;eu;Helsinki;;5.6;338;1;enz
FRA;FR;France;;eu;Paris;;68.4;552;1;enz
DEU;DE;Allemagne;;eu;Berlin;;84.5;357;1;enz
GRC;GR;Grèce;;eu;Athènes;;10.4;132;1;enz
HUN;HU;Hongrie;;eu;Budapest;;9.6;93;1;enl
ISL;IS;Islande;;eu;Reykjavik;Reykjavík;0.39;103;1;n
IRL;IE;Irlande;;eu;Dublin;;5.3;70;1;ez
ITA;IT;Italie;;eu;Rome;;59;301;1;enz
LVA;LV;Lettonie;;eu;Riga;;1.87;64.6;2;enz
LIE;LI;Liechtenstein;;eu;Vaduz;;0.04;0.16;3;ml
LTU;LT;Lituanie;;eu;Vilnius;;2.87;65;2;enz
LUX;LU;Luxembourg;;eu;Luxembourg;;0.67;2.6;1;enzml
MLT;MT;Malte;;eu;La Valette;Valette|Valletta;0.54;0.32;2;ez
MDA;MD;Moldavie;Moldova;eu;Chisinau;Kichinev;2.4;33.8;3;l
MCO;MC;Monaco;;eu;Monaco;;0.04;0.002;2;m
MNE;ME;Monténégro;;eu;Podgorica;;0.62;13.8;3;n
NLD;NL;Pays-Bas;Hollande;eu;Amsterdam;;18;41.5;1;enzm
MKD;MK;Macédoine du Nord;Macédoine;eu;Skopje;;1.8;25.7;3;nl
NOR;NO;Norvège;;eu;Oslo;;5.6;385;1;nm
POL;PL;Pologne;;eu;Varsovie;;37.6;313;1;en
PRT;PT;Portugal;;eu;Lisbonne;;10.6;92;1;enz
ROU;RO;Roumanie;;eu;Bucarest;;19;238;1;en
RUS;RU;Russie;;eu;Moscou;;144;17098;1;
SMR;SM;Saint-Marin;;eu;Saint-Marin;;0.034;0.061;3;l
SRB;RS;Serbie;;eu;Belgrade;;6.6;88.4;2;l
SVK;SK;Slovaquie;;eu;Bratislava;;5.4;49;2;enzl
SVN;SI;Slovénie;;eu;Ljubljana;;2.1;20.3;2;enz
ESP;ES;Espagne;;eu;Madrid;;48.6;506;1;enzm
SWE;SE;Suède;;eu;Stockholm;;10.6;450;1;enm
CHE;CH;Suisse;;eu;Berne;Bern;8.9;41.3;1;l
TUR;TR;Turquie;;eu;Ankara;;85.5;784;1;n
UKR;UA;Ukraine;;eu;Kiev;Kyiv|Kyïv;37.9;604;1;
GBR;GB;Royaume-Uni;Grande-Bretagne|UK|Angleterre;eu;Londres;;69;244;1;nm
VAT;VA;Vatican;Saint-Siège;eu;Vatican;Cité du Vatican;0.0008;0.00044;2;ml
AFG;AF;Afghanistan;;as;Kaboul;Kabul;42.6;652;1;l
ARM;AM;Arménie;;as;Erevan;Yerevan;3;29.7;2;l
AZE;AZ;Azerbaïdjan;;as;Bakou;Baku;10.2;86.6;2;l
BHR;BH;Bahreïn;;as;Manama;;1.6;0.78;3;m
BGD;BD;Bangladesh;;as;Dacca;Dhaka;173.6;148;2;
BTN;BT;Bhoutan;;as;Thimphou;Thimphu;0.79;38.4;3;ml
BRN;BN;Brunei;;as;Bandar Seri Begawan;;0.46;5.8;3;m
KHM;KH;Cambodge;;as;Phnom Penh;;17.6;181;2;m
CHN;CN;Chine;;as;Pékin;Beijing;1419;9597;1;
GEO;GE;Géorgie;;as;Tbilissi;Tbilisi;3.8;69.7;2;
IND;IN;Inde;;as;New Delhi;Delhi|New Dehli;1450;3287;1;
IDN;ID;Indonésie;;as;Jakarta;;283.5;1905;1;
IRN;IR;Iran;;as;Téhéran;Teheran;91.6;1648;1;
IRQ;IQ;Irak;Iraq;as;Bagdad;Baghdad;46;438;1;
ISR;IL;Israël;;as;Jérusalem;Tel-Aviv;9.4;22;1;
JPN;JP;Japon;;as;Tokyo;;124;378;1;m
JOR;JO;Jordanie;;as;Amman;;11.6;89;2;m
KAZ;KZ;Kazakhstan;;as;Astana;;20.6;2725;1;l
KWT;KW;Koweït;;as;Koweït;Koweït City;4.9;17.8;2;m
KGZ;KG;Kirghizistan;;as;Bichkek;Bishkek;7.2;200;3;l
LAO;LA;Laos;;as;Vientiane;;7.8;237;2;l
LBN;LB;Liban;;as;Beyrouth;Beirut;5.8;10.5;2;
MYS;MY;Malaisie;;as;Kuala Lumpur;;35.6;331;2;m
MDV;MV;Maldives;;as;Malé;;0.53;0.3;3;
MNG;MN;Mongolie;;as;Oulan-Bator;Oulan Bator|Ulaanbaatar;3.5;1564;1;l
MMR;MM;Birmanie;Myanmar;as;Naypyidaw;Naypyitaw|Nay Pyi Taw;54.5;677;2;
NPL;NP;Népal;;as;Katmandou;Kathmandu;29.7;147;1;l
PRK;KP;Corée du Nord;;as;Pyongyang;;26.5;121;1;
OMN;OM;Oman;;as;Mascate;Muscat;5.3;310;2;m
PAK;PK;Pakistan;;as;Islamabad;;251;796;1;
PHL;PH;Philippines;;as;Manille;Manila;115.8;300;1;
QAT;QA;Qatar;;as;Doha;;3;11.6;2;m
SAU;SA;Arabie saoudite;;as;Riyad;Riyadh;33.9;2150;1;m
SGP;SG;Singapour;;as;Singapour;;5.9;0.73;1;
KOR;KR;Corée du Sud;;as;Séoul;Seoul;51.7;100;1;
LKA;LK;Sri Lanka;;as;Sri Jayawardenapura Kotte;Colombo|Kotte;23.1;65.6;2;
SYR;SY;Syrie;;as;Damas;;24.7;185;1;
TJK;TJ;Tadjikistan;;as;Douchanbé;Dushanbe;10.6;143;3;l
THA;TH;Thaïlande;;as;Bangkok;;71.7;513;1;m
TLS;TL;Timor oriental;Timor-Leste;as;Dili;;1.4;14.9;3;
TKM;TM;Turkménistan;;as;Achgabat;Ashgabat|Achkhabad;7.5;488;3;l
ARE;AE;Émirats arabes unis;EAU|Émirats;as;Abou Dabi;Abu Dhabi;11;83.6;1;m
UZB;UZ;Ouzbékistan;;as;Tachkent;Tashkent;36.4;449;2;l
VNM;VN;Viêt Nam;Vietnam;as;Hanoï;Hanoi;100.9;331;1;
YEM;YE;Yémen;;as;Sanaa;;40.6;528;2;
AUS;AU;Australie;;oc;Canberra;;26.7;7692;1;m
FJI;FJ;Fidji;;oc;Suva;;0.93;18.3;3;
KIR;KI;Kiribati;;oc;Tarawa-Sud;Tarawa;0.13;0.81;3;
MHL;MH;Îles Marshall;Marshall;oc;Majuro;;0.04;0.18;3;
FSM;FM;Micronésie;;oc;Palikir;;0.11;0.7;3;
NRU;NR;Nauru;;oc;;;0.012;0.021;3;
NZL;NZ;Nouvelle-Zélande;;oc;Wellington;;5.2;268;1;m
PLW;PW;Palaos;Palau;oc;Ngerulmud;Melekeok;0.018;0.46;3;
PNG;PG;Papouasie-Nouvelle-Guinée;;oc;Port Moresby;;10.6;463;2;m
WSM;WS;Samoa;;oc;Apia;;0.22;2.8;3;
SLB;SB;Îles Salomon;Salomon;oc;Honiara;;0.82;28.9;3;m
TON;TO;Tonga;;oc;Nuku'alofa;Nukualofa;0.1;0.75;3;m
TUV;TV;Tuvalu;;oc;Funafuti;;0.01;0.026;3;m
VUT;VU;Vanuatu;;oc;Port-Vila;;0.33;12.2;3;
ATG;AG;Antigua-et-Barbuda;Antigua;am;Saint John's;Saint Johns;0.09;0.44;3;m
ARG;AR;Argentine;;am;Buenos Aires;;45.7;2780;1;
BHS;BS;Bahamas;;am;Nassau;;0.4;13.9;3;m
BRB;BB;Barbade;;am;Bridgetown;;0.28;0.43;3;
BLZ;BZ;Belize;;am;Belmopan;;0.42;23;3;m
BOL;BO;Bolivie;;am;Sucre;La Paz;12.4;1099;2;l
BRA;BR;Brésil;;am;Brasilia;Brasília;211;8516;1;
CAN;CA;Canada;;am;Ottawa;;41;9985;1;nm
CHL;CL;Chili;;am;Santiago;Santiago du Chili;19.8;756;1;
COL;CO;Colombie;;am;Bogota;Bogotá;52.9;1142;1;
CRI;CR;Costa Rica;;am;San José;;5.1;51;2;
CUB;CU;Cuba;;am;La Havane;Havane;11;110;1;
DMA;DM;Dominique;;am;Roseau;;0.07;0.75;3;
DOM;DO;République dominicaine;;am;Saint-Domingue;Santo Domingo;11.4;48.7;2;
ECU;EC;Équateur;;am;Quito;;18.1;256;2;
SLV;SV;Salvador;El Salvador;am;San Salvador;;6.3;21;2;
GRD;GD;Grenade;;am;Saint-Georges;Saint George's;0.12;0.34;3;m
GTM;GT;Guatemala;;am;Guatemala;Ciudad de Guatemala;18.4;109;2;
GUY;GY;Guyana;;am;Georgetown;;0.83;215;3;
HTI;HT;Haïti;;am;Port-au-Prince;;11.8;27.8;2;
HND;HN;Honduras;;am;Tegucigalpa;;10.8;112;3;
JAM;JM;Jamaïque;;am;Kingston;;2.8;11;2;m
MEX;MX;Mexique;;am;Mexico;Ciudad de Mexico|Mexico City;130.9;1964;1;
NIC;NI;Nicaragua;;am;Managua;;7;130;3;
PAN;PA;Panama;;am;Panama;Panama City;4.5;75;2;
PRY;PY;Paraguay;;am;Asuncion;Asunción;6.9;407;2;l
PER;PE;Pérou;;am;Lima;;34.2;1285;1;
KNA;KN;Saint-Christophe-et-Niévès;Saint-Kitts-et-Nevis;am;Basseterre;;0.05;0.26;3;m
LCA;LC;Sainte-Lucie;;am;Castries;;0.18;0.62;3;m
VCT;VC;Saint-Vincent-et-les-Grenadines;Saint-Vincent;am;Kingstown;;0.1;0.39;3;m
SUR;SR;Suriname;;am;Paramaribo;;0.63;164;3;
TTO;TT;Trinité-et-Tobago;;am;Port-d'Espagne;Port of Spain;1.5;5.1;3;
USA;US;États-Unis;USA|Amérique;am;Washington;Washington DC;345;9834;1;n
URY;UY;Uruguay;;am;Montevideo;;3.4;176;2;
VEN;VE;Venezuela;;am;Caracas;;28.4;916;1;
`;

const CONTS = {
  af: { label: "Afrique", color: "#E08A2E", box: [-20, 55, -36, 38] },
  eu: { label: "Europe", color: "#4A72E0", box: [-25, 45, 34, 71] },
  as: { label: "Asie", color: "#D9534F", box: [34, 146, -11, 55] },
  am: { label: "Amériques", color: "#1E9A73", box: [-128, -32, -56, 60] },
  oc: { label: "Océanie", color: "#2BA3B8", box: [110, 180, -48, 0] }
};
const COUNTRIES = COUNTRY_ROWS.trim().split("\n").map(line => {
  const [id, iso2, name, alt, cont, cap, capAlt, pop, area, tier, fl = ""] = line.split(";");
  return { id, iso2, name, alt: alt ? alt.split("|") : [], cont, cap, capAlt: capAlt ? capAlt.split("|") : [], pop: +pop, area: +area, tier: +tier,
    eu: fl.includes("e"), nato: fl.includes("n"), euro: fl.includes("z"), mon: fl.includes("m"), land: fl.includes("l") };
});
const CBY = Object.fromEntries(COUNTRIES.map(c => [c.id, c]));
// continent regroupé pour les manches : l'Océanie joue avec l'Asie
const contGroup = c => c.cont === "oc" ? "as" : c.cont;
const flagOf = c => c.iso2.replace(/./g, ch => String.fromCodePoint(127397 + ch.charCodeAt(0)));
// articles : « la France », « le Mali », « l'Iran », « les Philippines », « Cuba »
const NO_ART = new Set(["CUB", "HTI", "MDG", "MLT", "MCO", "SGP", "CYP", "DJI", "BHR", "OMN", "ISR", "MUS", "STP", "SMR", "LCA", "VCT", "KNA", "ATG", "KIR", "TUV", "NRU", "BRN", "TTO"]);
const PLUR = new Set(["COM", "MDV", "SYC", "BHS", "PHL", "NLD", "USA", "ARE", "MHL", "SLB", "FJI", "PLW", "WSM", "TON"]);
const MASC_E = new Set(["MEX", "KHM", "MOZ", "ZWE", "BLZ", "SUR", "GBR"]), FEM_X = new Set(["SLE"]);
function artOf(c) {
  if (NO_ART.has(c.id)) return "";
  if (PLUR.has(c.id)) return "les ";
  if (/^[AEIOUÉÈÊÎÏÔÂ]/.test(c.name)) return "l'";
  const w = c.name.split(/[ -]/)[0], fem = (/[eé]$/.test(w) && !MASC_E.has(c.id)) || FEM_X.has(c.id);
  return fem ? "la " : "le ";
}
const leN = c => artOf(c) + c.name;                                   // le Mali
const LeN = c => { const s = leN(c); return s[0].toUpperCase() + s.slice(1); };
const deN = c => { const a = artOf(c); return a === "le " ? "du " + c.name : a === "les " ? "des " + c.name : a ? "de " + a + c.name : (/^[AEIOUÉÈÎÏÔ]/.test(c.name) ? "d'" : "de ") + c.name; };
// clé de pays d'une forme de la carte (les entités sans code sont rattachées ou ignorées)
const MAP_ALIAS = { "Somaliland": "SOM", "Northern Cyprus": "CYP", "Kosovo": "XKX" };

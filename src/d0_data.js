/* ====== BANQUE DE QUESTIONS (prototype) ======
   Par format → thème → [facile, moyen, difficile]
   carte : [lieu, indice, lat, lon, région, le saviez-vous]
   frise : [événement, année, min, max, le saviez-vous]   (années négatives = av. J.-C.)
   quiz  : [question, [bonne réponse, leurre, leurre, leurre], le saviez-vous]
*/
const DATA = {
carte: {
  hist: [
    [
      ["Pompéi", "Ville romaine ensevelie par le Vésuve", 40.75, 14.49, "europe", "L'éruption du Vésuve en 79 apr. J.-C. a figé la ville sous les cendres. Les fouilles ont commencé au XVIIIe siècle."],
      ["Les pyramides de Gizeh", "Tombeaux des pharaons Khéops, Khéphren et Mykérinos", 29.98, 31.13, "africa", "La pyramide de Khéops, bâtie vers 2560 av. J.-C., est restée la plus haute construction humaine pendant près de 4 000 ans."],
      ["Waterloo", "Dernière bataille de Napoléon, en 1815", 50.68, 4.41, "europe", "Waterloo se trouve en Belgique, au sud de Bruxelles. La défaite du 18 juin 1815 met fin aux Cent-Jours."],
      ["Omaha Beach", "Plage du Débarquement du 6 juin 1944", 49.37, -0.87, "europe", "Le 6 juin 1944, plus de 150 000 soldats alliés débarquent sur cinq plages de Normandie."]
    ],
    [
      ["Hastings", "Bataille de 1066", 50.91, 0.49, "europe", "Guillaume le Conquérant, duc de Normandie, y bat le roi Harold II et devient roi d'Angleterre."],
      ["Carthage", "Grande rivale de Rome", 36.85, 10.33, "africa", "Carthage, près de l'actuelle Tunis, est détruite par Rome en 146 av. J.-C., à la fin de la troisième guerre punique."],
      ["Troie", "Cité de la guerre chantée par Homère", 39.96, 26.24, "europe", "Le site de Troie se trouve en Turquie, près du détroit des Dardanelles. Heinrich Schliemann l'a fouillé à partir de 1870."],
      ["Verdun", "Bataille de 1916", 49.16, 5.38, "europe", "La bataille de Verdun a duré 300 jours et fait environ 700 000 victimes : tués, blessés et disparus."]
    ],
    [
      ["Samarcande", "Carrefour de la route de la soie", 39.65, 66.96, "asia", "Capitale de Tamerlan au XIVe siècle, Samarcande (Ouzbékistan) reliait la Chine, la Perse et la Méditerranée."],
      ["Angkor", "Capitale de l'Empire khmer", 13.41, 103.87, "asia", "Angkor Vat, construit au XIIe siècle au Cambodge, est le plus grand monument religieux du monde."],
      ["Tombouctou", "Cité des manuscrits", 16.77, -3.01, "africa", "Aux XVe et XVIe siècles, Tombouctou (Mali) était un grand centre intellectuel, riche de milliers de manuscrits."],
      ["Austerlitz", "La « bataille des Trois Empereurs », 1805", 49.13, 16.76, "europe", "Le 2 décembre 1805, près de Brno (actuelle Tchéquie), Napoléon remporte sa victoire la plus célèbre."]
    ]
  ],
  geopo: [
    [
      ["Siège de l'ONU", "New York", 40.75, -73.97, "americas", "Le siège de l'ONU, à Manhattan, a un statut international. L'organisation compte 193 États membres."],
      ["Bruxelles", "Siège de la Commission européenne et de l'OTAN", 50.85, 4.35, "europe", "Bruxelles accueille la Commission européenne et le siège de l'OTAN, d'où son surnom de « capitale de l'Europe »."],
      ["Canal de Suez", "Lien entre Méditerranée et mer Rouge", 30.6, 32.33, "africa", "Inauguré en 1869, le canal de Suez évite aux navires de contourner l'Afrique. Environ 12 % du commerce mondial y transitait."],
      ["Taïwan", "Île au large de la Chine", 23.7, 121.0, "asia", "Taïwan est gouvernée de façon autonome depuis 1949. Pékin la considère comme une province chinoise."]
    ],
    [
      ["Détroit d'Ormuz", "Passage stratégique du pétrole", 26.57, 56.25, "africa", "Environ un cinquième du pétrole consommé dans le monde passe par ce détroit, entre l'Iran et Oman."],
      ["Strasbourg", "Sessions plénières du Parlement européen", 48.58, 7.75, "europe", "Le Parlement européen siège à Strasbourg pour ses sessions plénières, mais travaille aussi à Bruxelles et Luxembourg."],
      ["La Haye", "Cour internationale de justice", 52.08, 4.30, "europe", "La Haye abrite la Cour internationale de justice de l'ONU et la Cour pénale internationale."],
      ["Genève", "Siège de l'OMS et du CICR", 46.23, 6.13, "europe", "Genève accueille l'OMS, le Comité international de la Croix-Rouge et le siège européen de l'ONU."]
    ],
    [
      ["Corridor de Suwałki", "Entre Pologne et Lituanie", 54.1, 23.3, "europe", "Cette bande d'environ 65 km sépare l'enclave russe de Kaliningrad de la Biélorussie, alliée de Moscou."],
      ["Détroit de Bab el-Mandeb", "Entre mer Rouge et golfe d'Aden", 12.58, 43.33, "africa", "Large d'environ 30 km, il sépare le Yémen de Djibouti et commande l'accès sud de la mer Rouge."],
      ["Haut-Karabagh", "Région disputée du Caucase", 39.82, 46.75, "asia", "Peuplée d'Arméniens mais reconnue comme azerbaïdjanaise, la région passe sous contrôle de l'Azerbaïdjan en 2023, provoquant l'exode de sa population."],
      ["Transnistrie", "Territoire séparatiste de Moldavie", 46.84, 29.63, "europe", "Séparatiste depuis 1990-1992 et reconnue par aucun État de l'ONU, la Transnistrie accueille des troupes russes."]
    ]
  ],
  geo: [
    [
      ["Le mont Everest", "Point culminant de la planète", 27.99, 86.93, "asia", "L'Everest (8 849 m) se dresse à la frontière entre le Népal et la Chine."],
      ["Le Caire", "Capitale de l'Égypte", 30.04, 31.24, "africa", "Fondée en 969, Le Caire est l'une des plus grandes agglomérations d'Afrique."],
      ["Madrid", "Capitale de l'Espagne", 40.42, -3.70, "europe", "À environ 650 m d'altitude, Madrid est la capitale la plus haute de l'Union européenne."],
      ["Rio de Janeiro", "Ville du Pain de Sucre", -22.91, -43.17, "americas", "Rio a été la capitale du Brésil jusqu'en 1960, année où Brasília l'a remplacée."]
    ],
    [
      ["Le lac Baïkal", "Lac le plus profond du monde", 53.5, 108.0, "asia", "Profond de 1 642 m, le Baïkal (Sibérie) contient environ 20 % de l'eau douce liquide de surface de la planète."],
      ["L'embouchure de l'Amazone", "Là où le fleuve rejoint l'Atlantique", 0.0, -50.0, "americas", "L'Amazone apporte à elle seule environ un cinquième de l'eau douce déversée par les fleuves dans les océans."],
      ["Le Kilimandjaro", "Toit de l'Afrique", -3.07, 37.35, "africa", "Ce volcan de 5 895 m se dresse en Tanzanie, près de la frontière kényane."],
      ["Le détroit de Gibraltar", "Porte de la Méditerranée", 35.97, -5.5, "europe", "Il sépare l'Europe de l'Afrique sur seulement 14 km dans sa partie la plus étroite."]
    ],
    [
      ["Le désert d'Atacama", "Désert non polaire le plus aride", -24.5, -69.25, "americas", "Dans le nord du Chili, certaines stations de l'Atacama n'ont presque jamais enregistré de pluie."],
      ["Le lac Titicaca", "Entre Pérou et Bolivie", -15.9, -69.3, "americas", "À 3 812 m d'altitude, il est souvent présenté comme le plus haut lac navigable du monde."],
      ["Oulan-Bator", "Capitale de la Mongolie", 47.89, 106.91, "asia", "Avec une moyenne annuelle proche de 0 °C, c'est la capitale la plus froide du monde."],
      ["Le mont Elbrouz", "Sommet du Caucase", 43.35, 42.44, "europe", "Dans le Caucase russe, l'Elbrouz (5 642 m) est souvent considéré comme le point culminant de l'Europe."]
    ]
  ]
},
frise: {
  hist: [
    [
      ["Prise de la Bastille", 1789, 1650, 1900, "Le 14 juillet 1789, la prise de cette prison royale devient le symbole de la Révolution française."],
      ["Chute du mur de Berlin", 1989, 1940, 2010, "Le 9 novembre 1989, l'ouverture du mur annonce la réunification allemande, effective en 1990."],
      ["Couronnement de Charlemagne", 800, 600, 1100, "Le pape Léon III le couronne empereur à Rome, le jour de Noël de l'an 800."],
      ["Premier pas sur la Lune", 1969, 1900, 2000, "Le 21 juillet 1969 (heure française), Neil Armstrong pose le pied sur la Lune lors de la mission Apollo 11."]
    ],
    [
      ["Fin de la guerre de Cent Ans", 1453, 1250, 1600, "La victoire française de Castillon en 1453 met fin à une guerre qui a en réalité duré 116 ans."],
      ["Édit de Nantes", 1598, 1500, 1800, "Henri IV accorde la liberté de culte aux protestants. Louis XIV révoquera l'édit en 1685."],
      ["Abolition de l'esclavage dans les colonies françaises", 1848, 1780, 2000, "Le décret du 27 avril 1848, porté par Victor Schœlcher, abolit définitivement l'esclavage dans les colonies françaises."],
      ["Fondation de Rome (selon la tradition)", -753, -1000, -300, "Selon la légende, Romulus fonde Rome en 753 av. J.-C. sur le mont Palatin."]
    ],
    [
      ["Bataille de Poitiers (Charles Martel)", 732, 550, 1100, "En 732 (ou 733), Charles Martel y arrête une armée omeyyade venue d'Al-Andalus."],
      ["Traités de Westphalie", 1648, 1450, 1750, "Ils mettent fin à la guerre de Trente Ans et posent le principe de la souveraineté des États."],
      ["Mort d'Alexandre le Grand", -323, -600, -150, "Il meurt à Babylone à 32 ans, à la tête d'un empire allant de la Grèce à l'Indus."],
      ["Arrivée de la peste noire à Marseille", 1347, 1150, 1450, "Venue par des navires génois, la peste noire tue entre un tiers et la moitié des Européens en quelques années."]
    ]
  ],
  geopo: [
    [
      ["Signature de la Charte des Nations unies", 1945, 1880, 1990, "La Charte est signée à San Francisco le 26 juin 1945. L'ONU compte aujourd'hui 193 États membres."],
      ["Attentats du 11 Septembre", 2001, 1970, 2020, "Les attaques contre le World Trade Center et le Pentagone déclenchent la guerre en Afghanistan."],
      ["Arrivée des pièces et billets en euros", 2002, 1990, 2026, "L'euro existe pour les banques depuis 1999, mais les pièces et billets arrivent le 1er janvier 2002."],
      ["Dissolution de l'URSS", 1991, 1960, 2010, "Le 26 décembre 1991, l'URSS est officiellement dissoute et laisse place à 15 États indépendants."]
    ],
    [
      ["Traité de Rome (naissance de la CEE)", 1957, 1930, 2010, "Six pays fondent la Communauté économique européenne, ancêtre de l'Union européenne."],
      ["Indépendance de l'Algérie", 1962, 1940, 2010, "Après près de huit ans de guerre et les accords d'Évian, l'Algérie devient indépendante le 5 juillet 1962."],
      ["Création de l'OTAN", 1949, 1910, 2000, "Douze pays signent le traité de l'Atlantique Nord à Washington, le 4 avril 1949."],
      ["Sortie effective du Royaume-Uni de l'UE", 2020, 1995, 2026, "Après le référendum de 2016, le Royaume-Uni quitte l'Union européenne le 31 janvier 2020."]
    ],
    [
      ["Accords Sykes-Picot", 1916, 1870, 1990, "Ces accords secrets franco-britanniques partagent le Moyen-Orient en zones d'influence."],
      ["Ouverture de la conférence de Berlin sur l'Afrique", 1884, 1800, 1930, "Les puissances européennes y fixent les règles du partage colonial de l'Afrique, sans aucun représentant africain."],
      ["Conférence de Bandung", 1955, 1930, 2000, "29 pays d'Asie et d'Afrique s'y réunissent et posent les bases du mouvement des non-alignés."],
      ["Accords d'Oslo", 1993, 1960, 2015, "Signés à Washington, ils prévoient une reconnaissance mutuelle entre Israël et l'OLP."]
    ]
  ],
  geo: [
    [
      ["Christophe Colomb atteint l'Amérique", 1492, 1300, 1600, "Le 12 octobre 1492, il débarque aux Bahamas en pensant avoir atteint les Indes."],
      ["Ouverture du canal de Panama", 1914, 1860, 2000, "Le canal évite aux navires de contourner l'Amérique du Sud par le cap Horn."],
      ["Première ascension de l'Everest", 1953, 1900, 2020, "Le 29 mai 1953, Edmund Hillary et le Sherpa Tenzing Norgay atteignent le sommet."],
      ["Youri Gagarine, premier homme dans l'espace", 1961, 1940, 2020, "Le 12 avril 1961, Gagarine fait le tour de la Terre en 108 minutes."]
    ],
    [
      ["Retour du premier tour du monde (expédition de Magellan)", 1522, 1400, 1700, "Magellan meurt aux Philippines en 1521. C'est Elcano qui ramène 18 survivants en Espagne."],
      ["Vasco de Gama atteint l'Inde par la mer", 1498, 1400, 1650, "En contournant l'Afrique, il ouvre la route maritime des épices jusqu'à Calicut."],
      ["Amundsen atteint le pôle Sud", 1911, 1820, 1980, "Le Norvégien devance de cinq semaines l'expédition britannique de Robert Scott."],
      ["Ouverture du canal de Suez", 1869, 1780, 1940, "Construit sous la direction de Ferdinand de Lesseps, il raccourcit fortement la route entre l'Europe et l'Asie."]
    ],
    [
      ["Éruption du Krakatoa", 1883, 1820, 2000, "L'explosion, en Indonésie, fut entendue à près de 5 000 km et refroidit le climat mondial l'année suivante."],
      ["Lewis et Clark atteignent le Pacifique", 1805, 1750, 1900, "Partis de Saint-Louis en 1804, ils traversent l'Ouest américain jusqu'à l'océan Pacifique."],
      ["Première expédition de Zheng He", 1405, 1300, 1550, "Ce navigateur chinois mène sept expéditions jusqu'aux côtes de l'Afrique de l'Est, avec des flottes de centaines de navires."],
      ["Ibn Battûta quitte Tanger pour son grand voyage", 1325, 1150, 1450, "Ce voyageur marocain parcourt environ 120 000 km en près de 30 ans, de l'Afrique de l'Ouest à la Chine."]
    ]
  ]
},
quiz: {
  hist: [
    [
      ["Qui fut le premier empereur des Français ?", ["Napoléon Ier", "Louis XIV", "Charlemagne", "Napoléon III"], "Napoléon Bonaparte est sacré empereur le 2 décembre 1804 à Notre-Dame de Paris."],
      ["Quelle civilisation a bâti le Machu Picchu ?", ["Les Incas", "Les Aztèques", "Les Mayas", "Les Olmèques"], "Cette cité du XVe siècle, perchée dans les Andes péruviennes, n'est révélée au grand public qu'en 1911."],
      ["En quelle année commence la Première Guerre mondiale ?", ["1914", "1912", "1916", "1918"], "L'assassinat de l'archiduc François-Ferdinand à Sarajevo, le 28 juin 1914, déclenche l'engrenage des alliances."],
      ["Quelle reine d'Égypte fut l'alliée de Jules César puis de Marc Antoine ?", ["Cléopâtre VII", "Néfertiti", "Hatchepsout", "Néfertari"], "Dernière souveraine de la dynastie ptolémaïque, elle meurt en 30 av. J.-C. L'Égypte devient alors province romaine."],
      ["Quelle ville était la capitale de l'Empire byzantin ?", ["Constantinople", "Rome", "Athènes", "Alexandrie"], "Fondée par Constantin en 330 sur le site de Byzance, elle tombe aux mains des Ottomans en 1453 et devient Istanbul."],
      ["Qui est le principal rédacteur de la Déclaration d'indépendance américaine ?", ["Thomas Jefferson", "George Washington", "Benjamin Franklin", "Abraham Lincoln"], "Adoptée le 4 juillet 1776, elle est surtout l'œuvre de Jefferson, futur troisième président des États-Unis."]
    ],
    [
      ["Quel traité met fin à la Première Guerre mondiale avec l'Allemagne ?", ["Le traité de Versailles", "Le traité de Paris", "Le traité de Rome", "Le traité de Vienne"], "Il est signé le 28 juin 1919 dans la galerie des Glaces, cinq ans jour pour jour après l'attentat de Sarajevo."],
      ["Sous quelle dynastie chinoise la Cité interdite est-elle construite ?", ["Les Ming", "Les Qing", "Les Han", "Les Tang"], "La Cité interdite est achevée en 1420 sous l'empereur Yongle, qui fait de Pékin sa capitale."],
      ["Qui réalise l'unification de l'Allemagne en 1871 ?", ["Otto von Bismarck", "Guillaume II", "Frédéric le Grand", "Metternich"], "L'Empire allemand est proclamé dans la galerie des Glaces de Versailles, le 18 janvier 1871."],
      ["Quel empire dirige Soliman le Magnifique ?", ["L'Empire ottoman", "La Perse séfévide", "L'Empire moghol", "L'Empire byzantin"], "Sous son règne (1520-1566), l'Empire ottoman atteint son apogée et assiège Vienne en 1529."],
      ["Quelle bataille de 1942-1943 marque un tournant sur le front de l'Est ?", ["Stalingrad", "Koursk", "Leningrad", "Moscou"], "La capitulation de la 6e armée allemande, en février 1943, brise l'élan de l'Allemagne en URSS."],
      ["Quel pharaon est célèbre pour son tombeau retrouvé presque intact en 1922 ?", ["Toutânkhamon", "Ramsès II", "Khéops", "Akhenaton"], "Howard Carter découvre la tombe dans la Vallée des Rois, avec plus de 5 000 objets."]
    ],
    [
      ["Quel empereur moghol fait construire le Taj Mahal ?", ["Shah Jahan", "Akbar", "Babur", "Aurangzeb"], "Il l'édifie au XVIIe siècle à Agra, en mémoire de son épouse Mumtaz Mahal."],
      ["Quelle cité grecque remporte la bataille de Marathon en 490 av. J.-C. ?", ["Athènes", "Sparte", "Thèbes", "Corinthe"], "Les Athéniens, aidés des Platéens, y repoussent les Perses de Darius Ier."],
      ["Qui fut le dernier tsar de Russie ?", ["Nicolas II", "Alexandre III", "Pierre le Grand", "Alexandre II"], "Il abdique en 1917 et est exécuté avec sa famille à Iekaterinbourg en juillet 1918."],
      ["Quel empire africain dirige Mansa Moussa au XIVe siècle ?", ["L'Empire du Mali", "L'Empire du Ghana", "Le royaume du Kongo", "L'Empire songhaï"], "Son pèlerinage à La Mecque en 1324 est resté célèbre pour la quantité d'or distribuée en chemin."],
      ["Quel événement de 1453 retient-on souvent comme la fin du Moyen Âge ?", ["La prise de Constantinople", "La découverte de l'Amérique", "L'invention de l'imprimerie", "La Réforme protestante"], "Le sultan Mehmed II prend la ville le 29 mai 1453, ce qui met fin à l'Empire byzantin."],
      ["Quelle période ouvre le Japon à la modernisation à partir de 1868 ?", ["L'ère Meiji", "Le shogunat Tokugawa", "La révolution Xinhai", "L'époque Edo"], "L'empereur Meiji retrouve le pouvoir, et le Japon s'industrialise en quelques décennies."]
    ]
  ],
  geopo: [
    [
      ["Combien de membres permanents compte le Conseil de sécurité de l'ONU ?", ["5", "3", "7", "10"], "Chine, États-Unis, France, Royaume-Uni et Russie y disposent d'un droit de veto."],
      ["Quelle est la monnaie du Japon ?", ["Le yen", "Le yuan", "Le won", "Le baht"], "Le yen est l'une des monnaies les plus échangées au monde, après le dollar et l'euro."],
      ["Combien d'États compte l'Union européenne ?", ["27", "25", "28", "30"], "L'UE compte 27 membres depuis la sortie du Royaume-Uni en 2020."],
      ["Quelle est la capitale de l'Australie ?", ["Canberra", "Sydney", "Melbourne", "Perth"], "Canberra a été créée au début du XXe siècle pour départager Sydney et Melbourne."],
      ["Quel pays est le plus peuplé du monde ?", ["L'Inde", "La Chine", "Les États-Unis", "L'Indonésie"], "Selon les estimations de l'ONU, l'Inde a dépassé la Chine en 2023, avec plus de 1,4 milliard d'habitants."],
      ["Que signifie le sigle OTAN ?", ["Organisation du traité de l'Atlantique Nord", "Organisation des territoires alliés du Nord", "Office transatlantique des armées nationales", "Organisation transnationale d'assistance navale"], "Créée en 1949, l'alliance repose sur l'article 5 : une attaque contre un membre est une attaque contre tous."]
    ],
    [
      ["Quel pays n'est PAS membre de l'Union européenne ?", ["La Norvège", "L'Autriche", "L'Irlande", "Le Portugal"], "La Norvège a rejeté l'adhésion par référendum en 1972 et en 1994, mais participe à l'espace Schengen."],
      ["Quelle organisation regroupe de grands pays exportateurs de pétrole ?", ["L'OPEP", "L'OMC", "L'OCDE", "L'ASEAN"], "Fondée en 1960 à Bagdad, l'OPEP a aujourd'hui son siège à Vienne."],
      ["Quel pays rejoint l'OTAN en avril 2023 ?", ["La Finlande", "La Suède", "L'Ukraine", "La Suisse"], "Après l'invasion de l'Ukraine, la Finlande adhère en avril 2023, puis la Suède en mars 2024."],
      ["Quelle est la capitale du Canada ?", ["Ottawa", "Toronto", "Montréal", "Vancouver"], "Choisie par la reine Victoria en 1857, Ottawa se trouve à la limite entre l'Ontario et le Québec."],
      ["Quels pays forment à l'origine le groupe des BRICS ?", ["Brésil, Russie, Inde, Chine, Afrique du Sud", "Belgique, Roumanie, Irlande, Chypre, Slovaquie", "Bolivie, Russie, Iran, Chili, Soudan", "Bangladesh, Russie, Indonésie, Corée, Sri Lanka"], "Le groupe s'est élargi à partir de 2024, notamment à l'Égypte, à l'Éthiopie, à l'Iran et aux Émirats arabes unis."],
      ["Dans quel pays se trouve le siège de l'Union africaine ?", ["L'Éthiopie", "Le Kenya", "L'Afrique du Sud", "Le Nigeria"], "Son siège est à Addis-Abeba. L'Union africaine a succédé en 2002 à l'Organisation de l'unité africaine."]
    ],
    [
      ["Quel pays exerce sa souveraineté sur le Groenland ?", ["Le Danemark", "La Norvège", "Le Canada", "L'Islande"], "Le Groenland est un territoire autonome du royaume de Danemark, aux compétences élargies depuis 2009."],
      ["Combien d'États membres compte l'ONU ?", ["193", "179", "201", "211"], "Le dernier admis est le Soudan du Sud, en 2011. Le Vatican et la Palestine y sont observateurs."],
      ["Quel est le plus petit pays du monde par sa superficie ?", ["Le Vatican", "Monaco", "Saint-Marin", "Nauru"], "Le Vatican s'étend sur environ 0,44 km², au cœur de Rome."],
      ["Lequel de ces pays n'a aucun accès à la mer ?", ["La Bolivie", "Le Pérou", "Le Chili", "L'Équateur"], "La Bolivie a perdu son littoral face au Chili lors de la guerre du Pacifique (1879-1884)."],
      ["Quelle ligne sépare approximativement les deux Corées ?", ["Le 38e parallèle", "Le 17e parallèle", "La ligne Durand", "La ligne Curzon"], "La zone démilitarisée suit à peu près le 38e parallèle depuis l'armistice de 1953. Le 17e séparait les deux Vietnam."],
      ["Quelle organisation, basée à Vienne, inspecte les programmes nucléaires civils ?", ["L'AIEA", "L'OIAC", "L'OSCE", "L'UNESCO"], "L'Agence internationale de l'énergie atomique, créée en 1957, contrôle les installations des États signataires du TNP."]
    ]
  ],
  geo: [
    [
      ["Quel est le plus long fleuve de France ?", ["La Loire", "La Seine", "Le Rhône", "La Garonne"], "La Loire parcourt environ 1 000 km, du mont Gerbier-de-Jonc à l'Atlantique."],
      ["Quel est le plus grand océan ?", ["Le Pacifique", "L'Atlantique", "L'océan Indien", "L'océan Arctique"], "Le Pacifique couvre environ un tiers de la surface du globe, plus que toutes les terres émergées réunies."],
      ["Quelle chaîne de montagnes sépare la France de l'Espagne ?", ["Les Pyrénées", "Les Alpes", "Le Jura", "Les Vosges"], "Elles s'étendent sur environ 430 km entre l'Atlantique et la Méditerranée. L'Andorre se niche en leur cœur."],
      ["Quel pays a la plus grande superficie ?", ["La Russie", "Le Canada", "La Chine", "Les États-Unis"], "La Russie couvre plus de 17 millions de km² et s'étend sur 11 fuseaux horaires."],
      ["Quel fleuve traverse Londres ?", ["La Tamise", "La Seine", "Le Rhin", "Le Danube"], "La Tamise mesure 346 km. Ses marées remontent jusqu'à Teddington, en amont de Londres."],
      ["Sur quel continent se trouve le Sahara ?", ["L'Afrique", "L'Asie", "L'Océanie", "L'Amérique"], "Le Sahara est le plus grand désert chaud du monde, d'une superficie comparable à celle des États-Unis."]
    ],
    [
      ["Quel est le plus long fleuve d'Europe ?", ["La Volga", "Le Danube", "Le Rhin", "Le Dniepr"], "La Volga, longue d'environ 3 500 km, se jette dans la mer Caspienne."],
      ["Quelle est la capitale du Maroc ?", ["Rabat", "Casablanca", "Marrakech", "Fès"], "Casablanca est la plus grande ville du pays, mais le pouvoir siège à Rabat."],
      ["Combien de pays le Danube traverse-t-il ?", ["10", "6", "8", "12"], "C'est le fleuve qui traverse le plus de pays au monde, de l'Allemagne à la mer Noire."],
      ["Quel pays compte le plus de fuseaux horaires, outre-mer compris ?", ["La France", "La Russie", "Les États-Unis", "Le Royaume-Uni"], "Grâce à ses territoires d'outre-mer, la France s'étend sur 12 fuseaux horaires."],
      ["Quelle mer borde à la fois la Turquie, la Roumanie et l'Ukraine ?", ["La mer Noire", "La mer Caspienne", "La mer Égée", "La mer d'Azov"], "Reliée à la Méditerranée par le Bosphore, la mer Noire est presque privée d'oxygène en profondeur."],
      ["Quel désert couvre le sud de la Mongolie et le nord de la Chine ?", ["Le Gobi", "Le Taklamakan", "Le Kalahari", "Le Thar"], "Le Gobi est un désert froid : en hiver, la température y descend souvent sous -30 °C."]
    ],
    [
      ["Quelle est la capitale du Kazakhstan ?", ["Astana", "Almaty", "Bichkek", "Tachkent"], "Elle a changé plusieurs fois de nom (Akmola, Astana, Noursoultan) avant de redevenir Astana en 2022."],
      ["Quel pays compte le plus de lacs ?", ["Le Canada", "La Finlande", "La Russie", "La Suède"], "Le Canada concentre plus de la moitié des lacs de la planète."],
      ["Où se trouve le point le plus bas des terres émergées ?", ["Au bord de la mer Morte", "Dans la dépression de Qattara", "Dans la vallée de la Mort", "Au lac Assal"], "Les rives de la mer Morte se trouvent à plus de 430 m sous le niveau de la mer."],
      ["Quelle est la capitale de la Nouvelle-Zélande ?", ["Wellington", "Auckland", "Christchurch", "Queenstown"], "Wellington est la capitale d'État souverain la plus australe du monde."],
      ["Quel fleuve forme une grande partie de la frontière États-Unis – Mexique ?", ["Le Rio Grande", "Le Colorado", "Le Mississippi", "Le Pecos"], "Les Mexicains l'appellent Río Bravo. Il sert de frontière sur environ 2 000 km."],
      ["Quel pays est entièrement entouré par l'Afrique du Sud ?", ["Le Lesotho", "L'Eswatini", "Le Botswana", "Le Malawi"], "Le Lesotho est l'un des trois pays enclavés dans un seul autre État, avec le Vatican et Saint-Marin."]
    ]
  ]
}
};

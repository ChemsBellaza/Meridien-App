/* ============ 6 jeux de culture générale en plus (v39) : Histoire de France, Histoire du monde, Sports, Gastronomie, Sciences et nature, Langues du monde ============
   Même principe que pQ_more.js : NEWQ[format][catégorie][niveau] = 8 questions [question, [bonne réponse, faux, faux, faux], « le saviez-vous »].
   Q3(question, bonne, faux1, faux2, faux3, fait) est un simple raccourci d'écriture. Partie A : histoire. */
const Q3 = (t, a, b, c, d, f) => [t, [a, b, c, d], f];
Object.assign(NEWQ, {
  histoirefr: {
    moyen: [
      [
        Q3("En quelle année Charlemagne est-il couronné empereur ?", "800", "476", "987", "1066", "Il est couronné à Rome, la nuit de Noël 800, par le pape Léon III."),
        Q3("Quelle jeune héroïne délivre Orléans en 1429 ?", "Jeanne d'Arc", "Aliénor d'Aquitaine", "Blanche de Castille", "Catherine de Médicis", "Capturée puis jugée, elle est brûlée à Rouen en 1431."),
        Q3("Quelle guerre oppose la France et l'Angleterre de 1337 à 1453 ?", "La guerre de Cent Ans", "La guerre de Trente Ans", "La guerre des Deux-Roses", "La guerre de Sept Ans", "Elle dure en réalité 116 ans, avec de longues trêves."),
        Q3("Qui conquiert l'Angleterre en 1066 ?", "Guillaume le Conquérant", "Richard Cœur de Lion", "Philippe Auguste", "Hugues Capet", "Duc de Normandie, il gagne la bataille de Hastings."),
        Q3("Quelle cathédrale parisienne, commencée en 1163, domine l'île de la Cité ?", "Notre-Dame", "Saint-Sulpice", "La Madeleine", "Le Sacré-Cœur", "Sa construction a duré près de deux siècles."),
        Q3("Comment appelle-t-on l'épidémie qui ravage l'Europe vers 1348 ?", "La Peste noire", "Le choléra", "La variole", "La grippe espagnole", "Elle aurait fait disparaître un tiers de la population européenne."),
        Q3("Quel roi franc est baptisé à Reims vers 496 ?", "Clovis", "Dagobert", "Charles Martel", "Pépin le Bref", "Son baptême est considéré comme un acte fondateur du royaume."),
        Q3("Comment appelle-t-on la période entre l'Antiquité et la Renaissance ?", "Le Moyen Âge", "Les Temps modernes", "Le siècle des Lumières", "La Préhistoire", "Elle s'étend d'environ 476 à 1492.")
      ],
      [
        Q3("Qui est le premier roi de la dynastie capétienne, élu en 987 ?", "Hugues Capet", "Charles Martel", "Louis le Gros", "Philippe Auguste", "Ses descendants règneront pendant plus de 800 ans."),
        Q3("Quel roi de France est surnommé « le Sage » ?", "Charles V", "Charles VII", "Louis IX", "Philippe IV", "Il reprend aux Anglais une grande partie du royaume."),
        Q3("Quel roi fait construire la Sainte-Chapelle à Paris ?", "Saint Louis", "Philippe le Bel", "François Ier", "Charles VII", "Elle abrite la couronne d'épines, achetée à prix d'or."),
        Q3("Quelle bataille de 1214 est remportée par Philippe Auguste ?", "Bouvines", "Poitiers", "Azincourt", "Crécy", "Elle est souvent vue comme la première victoire « nationale »."),
        Q3("Quelle ville accueille les papes de 1309 à 1377 ?", "Avignon", "Rome", "Marseille", "Lyon", "On parle de la « papauté d'Avignon »."),
        Q3("Quelle bataille de 1415 est une lourde défaite française face aux Anglais ?", "Azincourt", "Bouvines", "Marignan", "Valmy", "Les archers anglais déciment la chevalerie française."),
        Q3("Quel roi protège les arts et fait construire le château de Chambord ?", "François Ier", "Henri IV", "Louis XIII", "Charles VIII", "Il accueille Léonard de Vinci en France."),
        Q3("Quelle invention de Gutenberg, vers 1450, accélère la diffusion du savoir ?", "L'imprimerie à caractères mobiles", "La boussole", "La poudre à canon", "Le papier", "Le premier grand livre imprimé est la Bible de Gutenberg.")
      ],
      [
        Q3("Quel traité de 843 partage l'empire de Charlemagne entre ses petits-fils ?", "Le traité de Verdun", "Le traité de Troyes", "Le traité de Brétigny", "Le traité de Westphalie", "Il donne naissance à la France, la Germanie et la Lotharingie."),
        Q3("Quel roi de France meurt à Tunis lors d'une croisade en 1270 ?", "Saint Louis", "Philippe Auguste", "Philippe III", "Louis VII", "Louis IX est canonisé en 1297."),
        Q3("Quel ordre de moines-chevaliers est supprimé sous Philippe le Bel en 1312 ?", "Les Templiers", "Les Hospitaliers", "Les Teutoniques", "Les Cisterciens", "Leur grand maître Jacques de Molay est brûlé en 1314."),
        Q3("Quelle bataille de 1356 voit le roi Jean II le Bon fait prisonnier ?", "Poitiers", "Crécy", "Azincourt", "Castillon", "Il est emmené en captivité à Londres."),
        Q3("Quel traité de 1420 désigne Henri V d'Angleterre comme héritier du roi de France ?", "Le traité de Troyes", "Le traité de Verdun", "Le traité de Brétigny", "Le traité d'Arras", "Il écarte le futur Charles VII de la succession."),
        Q3("Quelle bataille de 1453 marque la fin de la guerre de Cent Ans ?", "Castillon", "Formigny", "Patay", "Rouvray", "Elle est la première où l'artillerie joue un rôle décisif."),
        Q3("Quel roi, surnommé « l'Universelle Araigne », règne de 1461 à 1483 ?", "Louis XI", "Charles VII", "Louis XII", "Charles VIII", "Rusé et méfiant, il renforce le pouvoir royal."),
        Q3("Quelle bataille de 732 arrête une armée venue d'Espagne, sous Charles Martel ?", "Poitiers", "Tolbiac", "Roncevaux", "Bouvines", "Son petit-fils sera Charlemagne.")
      ]
    ],
    revol: [
      [
        Q3("En quelle année éclate la Révolution française ?", "1789", "1792", "1804", "1830", "Le point de départ est la réunion des États généraux."),
        Q3("Quel bâtiment est pris par les Parisiens le 14 juillet 1789 ?", "La Bastille", "Les Tuileries", "La Conciergerie", "Le Louvre", "Cette prison symbolisait l'arbitraire royal."),
        Q3("Quelle machine sert à exécuter pendant la Révolution ?", "La guillotine", "La potence", "Le bûcher", "La roue", "Elle est présentée comme une méthode plus égalitaire."),
        Q3("Qui se fait sacrer empereur des Français en 1804 ?", "Napoléon Bonaparte", "Louis XVI", "Robespierre", "Charles X", "Il se couronne lui-même à Notre-Dame, devant le pape."),
        Q3("Sur quelle île lointaine Napoléon meurt-il en 1821 ?", "Sainte-Hélène", "La Corse", "Madère", "Malte", "Elle se trouve au milieu de l'océan Atlantique Sud."),
        Q3("Quelle est la devise de la République française ?", "Liberté, Égalité, Fraternité", "Travail, Famille, Patrie", "Dieu et mon droit", "Un pour tous, tous pour un", "Elle est inscrite dans la Constitution."),
        Q3("Quel roi est guillotiné en janvier 1793 ?", "Louis XVI", "Louis XIV", "Louis XV", "Louis XVIII", "Il est jugé par la Convention nationale."),
        Q3("Quel texte de 1789 proclame les droits de chacun ?", "La Déclaration des droits de l'homme et du citoyen", "Le Code civil", "La Magna Carta", "Le Concordat", "Elle est toujours l'un des textes fondateurs du droit français.")
      ],
      [
        Q3("Quelle reine est surnommée « l'Autrichienne » ?", "Marie-Antoinette", "Catherine de Médicis", "Joséphine", "Aliénor d'Aquitaine", "Archiduchesse d'Autriche, elle épouse Louis XVI à 14 ans."),
        Q3("Quelle bataille de 1792 arrête les Prussiens et sauve la Révolution ?", "Valmy", "Austerlitz", "Waterloo", "Marengo", "Le lendemain, la République est proclamée."),
        Q3("Quel chef de la Terreur est guillotiné en juillet 1794 ?", "Robespierre", "Marat", "Mirabeau", "La Fayette", "Sa chute met fin à la Terreur."),
        Q3("Quelle bataille de 1805 est surnommée « la bataille des Trois Empereurs » ?", "Austerlitz", "Iéna", "Wagram", "Eylau", "Napoléon y bat les armées russe et autrichienne."),
        Q3("Quel code de 1804 régit encore une grande partie du droit français ?", "Le Code civil", "Le Code noir", "Le Code du travail", "Le Code de la route", "On l'appelle aussi « Code Napoléon »."),
        Q3("Quelle bataille de 1815 met fin à l'Empire de Napoléon ?", "Waterloo", "Trafalgar", "Austerlitz", "Wagram", "Elle a lieu en Belgique, contre Wellington et Blücher."),
        Q3("Comment appelle-t-on le calendrier de 1793 aux mois comme Thermidor ?", "Le calendrier républicain", "Le calendrier julien", "Le calendrier grégorien", "Le calendrier maya", "Il sera abandonné par Napoléon en 1806."),
        Q3("Qui prête le serment du Jeu de paume en juin 1789 ?", "Les députés du tiers état", "Les nobles", "Le clergé", "Les généraux", "Ils jurent de ne pas se séparer avant d'avoir donné une constitution.")
      ],
      [
        Q3("Quelle bataille navale de 1805 détruit la flotte franco-espagnole ?", "Trafalgar", "Aboukir", "Lépante", "Actium", "L'amiral anglais Nelson y trouve la mort."),
        Q3("À quelle date a lieu le coup d'État du 18 brumaire de Bonaparte ?", "9 novembre 1799", "14 juillet 1789", "2 décembre 1851", "18 juin 1815", "Il met fin au Directoire et ouvre le Consulat."),
        Q3("Comment s'appelle le régime de 1795 à 1799, dirigé par cinq membres ?", "Le Directoire", "Le Consulat", "La Convention", "La Terreur", "Il est renversé par Bonaparte."),
        Q3("Quelle campagne de 1812 est un désastre pour la Grande Armée ?", "La campagne de Russie", "La campagne d'Égypte", "La campagne d'Italie", "La campagne d'Espagne", "Le froid et la faim déciment l'armée en retraite."),
        Q3("Quel congrès de 1814-1815 redessine l'Europe après Napoléon ?", "Le congrès de Vienne", "Le congrès de Berlin", "Le congrès de Westphalie", "Le congrès de Versailles", "Il rétablit un équilibre entre les grandes puissances."),
        Q3("Quel révolutionnaire est surnommé « l'Incorruptible » ?", "Robespierre", "Danton", "Marat", "Saint-Just", "Il est l'une des figures du Comité de salut public."),
        Q3("Quelle expédition de 1798 emmène Bonaparte avec des savants ?", "L'expédition d'Égypte", "L'expédition de Russie", "L'expédition d'Espagne", "L'expédition d'Irlande", "On y découvre la pierre de Rosette en 1799."),
        Q3("Quel frère de Louis XVI est rétabli sur le trône en 1814 ?", "Louis XVIII", "Charles X", "Louis-Philippe", "Louis XVII", "C'est le début de la Restauration.")
      ]
    ],
    contemp: [
      [
        Q3("Quel conflit se déroule de 1914 à 1918 ?", "La Première Guerre mondiale", "La Seconde Guerre mondiale", "La guerre de Cent Ans", "La guerre de Crimée", "On l'a longtemps appelée « la Grande Guerre »."),
        Q3("Quel général lance l'appel du 18 juin 1940 depuis Londres ?", "Charles de Gaulle", "Philippe Pétain", "Ferdinand Foch", "Philippe Leclerc", "Il appelle à continuer le combat contre l'Allemagne."),
        Q3("En quelle année les Françaises votent-elles pour la première fois ?", "1945", "1848", "1914", "1968", "Le droit de vote leur a été accordé par une ordonnance de 1944."),
        Q3("Quel événement secoue la France en mai 1968 ?", "Des manifestations étudiantes et une grève générale", "Une invasion étrangère", "Un tremblement de terre", "Un coup d'État militaire", "Le mouvement est parti des universités."),
        Q3("Quelle tour est construite pour l'Exposition universelle de 1889 ?", "La tour Eiffel", "La tour Montparnasse", "La tour Saint-Jacques", "La tour Pey-Berland", "Elle devait être démontée au bout de vingt ans."),
        Q3("Quel président de la République fait abolir la peine de mort en 1981 ?", "François Mitterrand", "Valéry Giscard d'Estaing", "Charles de Gaulle", "Georges Pompidou", "La loi est défendue par le garde des Sceaux Robert Badinter."),
        Q3("En quelle année tombe le mur de Berlin ?", "1989", "1961", "1975", "1991", "Il séparait la ville depuis 1961."),
        Q3("Quel empereur est fait prisonnier à Sedan en 1870 ?", "Napoléon III", "Napoléon Ier", "Louis-Philippe", "Charles X", "Sa chute entraîne la proclamation de la IIIe République.")
      ],
      [
        Q3("En quelle année la première ligne du métro parisien est-elle inaugurée ?", "1900", "1870", "1925", "1945", "La ligne 1 relie Porte de Vincennes à Porte Maillot."),
        Q3("Quel traité de 1919 met fin à la guerre avec l'Allemagne ?", "Le traité de Versailles", "Le traité de Rome", "Le traité d'Utrecht", "Le traité de Vienne", "Il est signé dans la galerie des Glaces."),
        Q3("Quelle bataille de 1916, longue de dix mois, est l'une des plus meurtrières de la Grande Guerre ?", "Verdun", "Valmy", "Austerlitz", "Waterloo", "Elle a lieu dans le nord-est de la France."),
        Q3("Quel maréchal dirige le régime de Vichy ?", "Philippe Pétain", "Ferdinand Foch", "Joseph Joffre", "Hubert Lyautey", "Il est le héros de Verdun, devenu chef de l'État français en 1940."),
        Q3("À quelle date a lieu le débarquement allié en Normandie ?", "6 juin 1944", "8 mai 1945", "14 juillet 1789", "11 novembre 1918", "C'est le « jour J »."),
        Q3("Qui est le premier président de la Ve République ?", "Charles de Gaulle", "Georges Pompidou", "René Coty", "Vincent Auriol", "Il est élu en 1958."),
        Q3("Quelle affaire divise la France autour d'un capitaine accusé de trahison ?", "L'affaire Dreyfus", "L'affaire Stavisky", "L'affaire Calas", "L'affaire Fualdès", "Il sera innocenté en 1906."),
        Q3("Quel roi est renversé par les « Trois Glorieuses » de 1830 ?", "Charles X", "Louis XVIII", "Louis-Philippe", "Napoléon III", "Il est remplacé par Louis-Philippe.")
      ],
      [
        Q3("Quelle loi de 1905 organise la laïcité en France ?", "La loi de séparation des Églises et de l'État", "Le Concordat de 1801", "La loi Falloux", "La loi Veil", "L'État ne reconnaît plus aucun culte."),
        Q3("Qui publie « J'accuse » dans L'Aurore en 1898 ?", "Émile Zola", "Victor Hugo", "Jean Jaurès", "Georges Clemenceau", "Sa lettre ouverte défend le capitaine Dreyfus."),
        Q3("Quelle loi de 1975 autorise l'interruption volontaire de grossesse ?", "La loi Veil", "La loi Badinter", "La loi Auroux", "La loi Neuwirth", "Simone Veil la défend devant l'Assemblée."),
        Q3("Quel organisme Jean Moulin préside-t-il en 1943 ?", "Le Conseil national de la Résistance", "Le Front populaire", "La Ligue des droits de l'homme", "Le Comité de salut public", "Il unifie les mouvements de la Résistance."),
        Q3("Quel gouvernement de 1936 accorde les premiers congés payés ?", "Le Front populaire", "Le Cartel des gauches", "Le Bloc national", "Le Directoire", "Ils sont alors de deux semaines."),
        Q3("Quelle guerre se termine par les accords d'Évian en 1962 ?", "La guerre d'Algérie", "La guerre d'Indochine", "La guerre du Vietnam", "La guerre de Corée", "L'Algérie devient indépendante."),
        Q3("En quelle année la Commune de Paris est-elle écrasée pendant la Semaine sanglante ?", "1871", "1848", "1789", "1905", "Elle avait duré environ deux mois."),
        Q3("Quel traité de 1992 crée l'Union européenne ?", "Le traité de Maastricht", "Le traité de Rome", "Le traité de Lisbonne", "Le traité de Nice", "Il prépare aussi l'arrivée de l'euro.")
      ]
    ]
  },
  histoiremonde: {
    antiquite: [
      [
        Q3("Quelle civilisation a construit les pyramides de Gizeh ?", "Les Égyptiens", "Les Romains", "Les Grecs", "Les Mayas", "Celle de Khéops date d'environ 2560 av. J.-C."),
        Q3("Quel général carthaginois franchit les Alpes avec des éléphants ?", "Hannibal", "Spartacus", "Jules César", "Scipion", "Il voulait attaquer Rome par le nord."),
        Q3("Quelle cité grecque est célèbre pour ses guerriers ?", "Sparte", "Athènes", "Corinthe", "Thèbes", "Les jeunes y suivaient un entraînement militaire dès l'enfance."),
        Q3("Qui est assassiné aux ides de mars, en 44 av. J.-C. ?", "Jules César", "Auguste", "Néron", "Caligula", "Il est poignardé au Sénat."),
        Q3("Comment s'appelle la grande arène de Rome ?", "Le Colisée", "Le Panthéon", "Le Forum", "Le Capitole", "Elle pouvait accueillir des dizaines de milliers de spectateurs."),
        Q3("Où ont lieu les Jeux olympiques de l'Antiquité ?", "À Olympie", "À Athènes", "À Delphes", "À Sparte", "Ils sont consacrés au dieu Zeus."),
        Q3("Quel philosophe fut le précepteur d'Alexandre le Grand ?", "Aristote", "Socrate", "Platon", "Épicure", "Il était l'élève de Platon."),
        Q3("Quelle écriture les Égyptiens de l'Antiquité utilisaient-ils ?", "Les hiéroglyphes", "Le cunéiforme", "Les runes", "L'alphabet phénicien", "Champollion les a déchiffrés en 1822.")
      ],
      [
        Q3("Quelle bataille de 480 av. J.-C. oppose les Spartiates de Léonidas aux Perses ?", "Les Thermopyles", "Marathon", "Salamine", "Actium", "Les Grecs y résistent héroïquement avant d'être encerclés."),
        Q3("Quel empereur romain adopte le christianisme et fonde Constantinople ?", "Constantin", "Néron", "Dioclétien", "Hadrien", "La ville est inaugurée en 330."),
        Q3("Comment appelle-t-on les guerres entre Rome et Carthage ?", "Les guerres puniques", "Les guerres médiques", "Les guerres du Péloponnèse", "Les guerres gauloises", "Rome sort victorieuse et détruit Carthage en 146 av. J.-C."),
        Q3("Quel roi de Macédoine conquiert l'empire perse ?", "Alexandre le Grand", "Darius III", "Xerxès Ier", "Périclès", "Il meurt à Babylone à 32 ans."),
        Q3("Qui est le premier empereur romain ?", "Auguste", "Jules César", "Trajan", "Tibère", "Il règne de 27 av. J.-C. à 14 ap. J.-C."),
        Q3("Quel chef gaulois est vaincu à Alésia en 52 av. J.-C. ?", "Vercingétorix", "Brennus", "Astérix", "Clovis", "Il se rend à César."),
        Q3("Quelle cité est détruite par l'éruption du Vésuve en 79 ?", "Pompéi", "Carthage", "Troie", "Alésia", "Les cendres l'ont admirablement conservée."),
        Q3("Quelle muraille l'empereur Hadrien fait-il construire en Bretagne ?", "Le mur d'Hadrien", "La muraille Aurélienne", "La Grande Muraille", "Le mur de Trajan", "Il marque la frontière nord de l'Empire romain.")
      ],
      [
        Q3("Quelle bataille de 31 av. J.-C. oppose Octave à Antoine et Cléopâtre ?", "Actium", "Pharsale", "Philippes", "Zama", "Octave en sort vainqueur et devient Auguste."),
        Q3("Quel général romain bat Hannibal à Zama en 202 av. J.-C. ?", "Scipion l'Africain", "Fabius Maximus", "Paul-Émile", "Marius", "Cette victoire met fin à la deuxième guerre punique."),
        Q3("Quelle innovation est attribuée à Clisthène à Athènes vers 508 av. J.-C. ?", "La naissance de la démocratie", "La monarchie héréditaire", "La tyrannie des Trente", "L'oligarchie spartiate", "Les citoyens votent directement les lois."),
        Q3("En quelle année tombe l'Empire romain d'Occident ?", "476", "395", "800", "1453", "Le dernier empereur, Romulus Augustule, est déposé."),
        Q3("Quel peuple, mené par Attila, menace Rome au Ve siècle ?", "Les Huns", "Les Vikings", "Les Mongols", "Les Goths", "Attila est surnommé « le fléau de Dieu »."),
        Q3("Quelle bataille de 490 av. J.-C. voit Athènes battre les Perses ?", "Marathon", "Salamine", "Platées", "Leuctres", "Un messager aurait couru jusqu'à Athènes pour l'annoncer."),
        Q3("Quel roi perse est battu par Alexandre à Gaugamèles ?", "Darius III", "Xerxès", "Cyrus", "Artaxerxès", "C'est la bataille décisive de la conquête de la Perse."),
        Q3("Quelle pierre découverte en 1799 aide à déchiffrer les hiéroglyphes ?", "La pierre de Rosette", "La pierre de Palerme", "Le disque de Phaistos", "La stèle de Mésha", "Le même texte y est écrit en trois écritures.")
      ]
    ],
    civs: [
      [
        Q3("Quelle civilisation a construit le Machu Picchu ?", "Les Incas", "Les Aztèques", "Les Mayas", "Les Olmèques", "La cité se trouve dans les Andes péruviennes."),
        Q3("Quel empire a pour capitale Tenochtitlan ?", "L'empire aztèque", "L'empire inca", "L'empire maya", "L'empire mongol", "Elle se trouvait à l'emplacement de Mexico."),
        Q3("Dans quel pays se trouve la cité de Pétra ?", "La Jordanie", "L'Égypte", "La Syrie", "Israël", "Ses monuments sont taillés dans la roche rose."),
        Q3("Quel pharaon est célèbre pour son tombeau découvert en 1922 ?", "Toutânkhamon", "Ramsès II", "Khéops", "Akhenaton", "Howard Carter y trouve un trésor intact."),
        Q3("Quelle civilisation a inventé l'écriture cunéiforme ?", "Les Sumériens", "Les Égyptiens", "Les Phéniciens", "Les Perses", "On écrivait sur des tablettes d'argile."),
        Q3("Quel peuple de navigateurs explore l'Atlantique Nord autour de l'an mille ?", "Les Vikings", "Les Vandales", "Les Huns", "Les Wisigoths", "Leif Erikson atteint l'Amérique avant Colomb."),
        Q3("Quel fleuve est au cœur de l'Égypte antique ?", "Le Nil", "Le Tigre", "L'Indus", "L'Euphrate", "Ses crues fertilisaient les terres."),
        Q3("Dans quel pays se trouve la cité maya de Chichén Itzá ?", "Le Mexique", "Le Pérou", "Le Guatemala", "La Colombie", "Sa pyramide d'El Castillo est célèbre.")
      ],
      [
        Q3("Quel chef mongol fonde un immense empire au XIIIe siècle ?", "Gengis Khan", "Tamerlan", "Attila", "Soliman", "Son empire s'étendait de la Chine à l'Europe de l'Est."),
        Q3("Comment appelle-t-on la route qui relie la Chine à l'Occident pour le commerce de la soie ?", "La route de la soie", "La route du sel", "La route de l'ambre", "La route de l'encens", "Elle traversait l'Asie centrale."),
        Q3("Quel voyageur italien décrit son séjour à la cour de Kublai Khan ?", "Marco Polo", "Christophe Colomb", "Vasco de Gama", "Magellan", "Son récit s'appelle « Le Livre des merveilles »."),
        Q3("Quel empire d'Afrique de l'Ouest est célèbre pour son roi Mansa Moussa ?", "L'empire du Mali", "L'empire du Ghana", "L'empire songhaï", "L'Éthiopie", "Son pèlerinage à La Mecque, au XIVe siècle, est resté célèbre pour ses richesses."),
        Q3("Quel pharaon a fait construire le temple d'Abou Simbel ?", "Ramsès II", "Khéops", "Toutânkhamon", "Thoutmosis III", "Son règne dure plus de 60 ans."),
        Q3("Quelle dynastie unifie la Chine en 221 av. J.-C. ?", "Les Qin", "Les Han", "Les Ming", "Les Tang", "Le premier empereur est enterré avec l'armée de terre cuite."),
        Q3("Quelle ville est la capitale de l'Empire byzantin ?", "Constantinople", "Athènes", "Alexandrie", "Antioche", "Elle s'appelle aujourd'hui Istanbul."),
        Q3("Quel conquistador renverse l'empire aztèque en 1521 ?", "Hernán Cortés", "Pizarro", "Colomb", "Magellan", "Il s'allie à des peuples ennemis des Aztèques.")
      ],
      [
        Q3("Quel conquistador capture l'empereur inca Atahualpa en 1532 ?", "Francisco Pizarro", "Hernán Cortés", "Vasco Núñez de Balboa", "Francisco de Orellana", "Il obtient une énorme rançon en or avant de le faire exécuter."),
        Q3("Quelle dynastie construit l'essentiel de la Grande Muraille visible aujourd'hui ?", "Les Ming", "Les Han", "Les Qin", "Les Song", "Elle a été renforcée du XIVe au XVIIe siècle."),
        Q3("Quel traité de 1494 partage le monde entre l'Espagne et le Portugal ?", "Le traité de Tordesillas", "Le traité d'Utrecht", "Le traité de Westphalie", "Le traité de Vienne", "Une ligne imaginaire est tracée dans l'Atlantique."),
        Q3("Quel site du Cambodge est le plus grand monument religieux du monde ?", "Angkor Vat", "Borobudur", "Bagan", "Ayutthaya", "Il a d'abord été hindou, puis bouddhiste."),
        Q3("Quelle cité de l'Indus (Pakistan) est un grand site de l'âge du bronze ?", "Mohenjo-daro", "Ur", "Babylone", "Çatal Höyük", "Elle comptait un système d'égouts très avancé."),
        Q3("Quel roi babylonien est célèbre pour son code de lois gravé sur une stèle ?", "Hammurabi", "Nabuchodonosor II", "Sargon", "Gilgamesh", "On y trouve la loi du talion."),
        Q3("Quel empire s'empare de Constantinople en 1453 ?", "L'empire ottoman", "L'empire perse safavide", "L'empire mongol", "L'empire byzantin", "Le sultan Mehmed II devient « le Conquérant »."),
        Q3("Quelle reine d'Égypte s'allie à César puis à Marc Antoine ?", "Cléopâtre VII", "Néfertiti", "Hatshepsout", "Nitocris", "Elle est la dernière souveraine de la dynastie des Ptolémées.")
      ]
    ],
    mondial: [
      [
        Q3("En quelle année Christophe Colomb atteint-il l'Amérique ?", "1492", "1453", "1519", "1789", "Il pensait avoir rejoint les Indes."),
        Q3("Quel pays lance le premier satellite, Spoutnik, en 1957 ?", "L'URSS", "Les États-Unis", "La France", "La Chine", "C'est le début de la conquête spatiale."),
        Q3("Quel astronaute américain marche le premier sur la Lune en 1969 ?", "Neil Armstrong", "Buzz Aldrin", "Youri Gagarine", "John Glenn", "Sa phrase : « un petit pas pour l'homme »."),
        Q3("Quel pays est dirigé par Hitler pendant la Seconde Guerre mondiale ?", "L'Allemagne", "L'Italie", "Le Japon", "L'Autriche", "Il prend le pouvoir en 1933."),
        Q3("Quelle guerre oppose le Nord et le Sud des États-Unis de 1861 à 1865 ?", "La guerre de Sécession", "La guerre d'indépendance", "La guerre de Corée", "La guerre du Vietnam", "Elle aboutit à l'abolition de l'esclavage."),
        Q3("Qui est le premier homme dans l'espace, en 1961 ?", "Youri Gagarine", "Alan Shepard", "Neil Armstrong", "Valentina Terechkova", "Il fait un tour de la Terre en 108 minutes."),
        Q3("Quel paquebot célèbre coule en 1912 après avoir heurté un iceberg ?", "Le Titanic", "Le Lusitania", "Le Queen Mary", "L'Olympic", "Il effectuait sa première traversée."),
        Q3("Quel navigateur portugais atteint l'Inde en contournant l'Afrique en 1498 ?", "Vasco de Gama", "Magellan", "Colomb", "Pedro Cabral", "Il ouvre la route maritime des épices.")
      ],
      [
        Q3("Quel navigateur lance la première expédition autour du monde en 1519 ?", "Magellan", "Colomb", "James Cook", "Vasco de Gama", "Il meurt aux Philippines avant la fin du voyage."),
        Q3("Quel texte proclame l'indépendance des États-Unis en 1776 ?", "La Déclaration d'indépendance", "Le Bill of Rights", "Le Mayflower Compact", "Les Articles de la Confédération", "Elle est rédigée surtout par Thomas Jefferson."),
        Q3("Quel président américain abolit l'esclavage pendant la guerre de Sécession ?", "Abraham Lincoln", "George Washington", "Thomas Jefferson", "Ulysses Grant", "Il est assassiné en 1865."),
        Q3("En quelle année la révolution d'Octobre porte-t-elle Lénine au pouvoir ?", "1917", "1905", "1921", "1939", "C'est l'origine de l'URSS."),
        Q3("Quel événement de 1929 déclenche la Grande Dépression ?", "Le krach de Wall Street", "La guerre de Corée", "La chute du mur de Berlin", "La crise du pétrole", "Elle touche le monde entier."),
        Q3("Quelle bombe est larguée sur Hiroshima en 1945 ?", "Une bombe atomique", "Une bombe à hydrogène", "Une bombe au napalm", "Une bombe à neutrons", "C'est la première utilisation de l'arme nucléaire en temps de guerre."),
        Q3("Quel dirigeant sud-africain est libéré en 1990 après 27 ans de prison ?", "Nelson Mandela", "Desmond Tutu", "Steve Biko", "Thabo Mbeki", "Il devient président en 1994."),
        Q3("Quelle organisation est fondée en 1945 pour préserver la paix ?", "L'ONU", "L'OTAN", "La SDN", "L'UNESCO", "Son siège principal est à New York.")
      ],
      [
        Q3("Quelle crise de 1962 oppose les États-Unis et l'URSS au sujet de missiles à Cuba ?", "La crise des missiles de Cuba", "Le blocus de Berlin", "La guerre du Kippour", "La crise de Suez", "Le monde frôle la guerre nucléaire."),
        Q3("Quel traité de 1648 met fin à la guerre de Trente Ans ?", "Le traité de Westphalie", "Le traité d'Utrecht", "Le traité de Vienne", "Le traité de Tordesillas", "Il pose les bases de la souveraineté des États."),
        Q3("Quel événement de 1914 déclenche la Première Guerre mondiale ?", "L'assassinat de l'archiduc François-Ferdinand", "L'invasion de la Pologne", "Le naufrage du Lusitania", "La révolution russe", "Il est tué à Sarajevo."),
        Q3("Quel mode d'action Gandhi défend-il pour obtenir l'indépendance de l'Inde ?", "La résistance non violente", "La guérilla", "Le coup d'État", "La guerre éclair", "L'Inde devient indépendante en 1947."),
        Q3("Comment s'appelle la politique de transparence lancée par Gorbatchev ?", "La glasnost", "La perestroïka", "La détente", "Le dégel", "La perestroïka désigne, elle, la restructuration de l'économie."),
        Q3("En quelle année l'URSS est-elle dissoute ?", "1991", "1985", "1989", "1993", "Quinze républiques deviennent indépendantes."),
        Q3("Quelle bataille de 1942-1943 marque le tournant de la guerre à l'Est ?", "Stalingrad", "Moscou", "Berlin", "Dunkerque", "L'armée allemande y est encerclée."),
        Q3("Quel dirigeant prend le pouvoir en Chine en 1949 ?", "Mao Zedong", "Deng Xiaoping", "Sun Yat-sen", "Chiang Kai-shek", "Il proclame la République populaire de Chine.")
      ]
    ]
  }
});

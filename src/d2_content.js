/* ====== CONTENU DES NOUVEAUX JEUX ====== */

/* L'intrus : [intrus, a, b, c, explication] — la première proposition est toujours l'intrus */
const INTRUS = {
hist: [
  [
    ["Napoléon", "Louis XIV", "François Ier", "Henri IV", "Louis XIV, François Ier et Henri IV étaient rois de France. Napoléon était empereur des Français."],
    ["Jules César", "Cléopâtre", "Toutânkhamon", "Ramsès II", "Cléopâtre, Toutânkhamon et Ramsès II ont régné sur l'Égypte. César était un général romain."],
    ["Verdun", "Austerlitz", "Iéna", "Wagram", "Austerlitz, Iéna et Wagram sont des victoires de Napoléon. Verdun est une bataille de 1916."],
    ["Benito Mussolini", "Winston Churchill", "Franklin Roosevelt", "Charles de Gaulle", "Churchill, Roosevelt et de Gaulle étaient dans le camp allié. Mussolini était l'allié d'Hitler."],
    ["Le Parthénon", "Le Colisée", "Le Panthéon de Rome", "Le Circus Maximus", "Le Colisée, le Panthéon et le Circus Maximus sont à Rome. Le Parthénon est à Athènes."],
    ["Élisabeth Ire", "Marie-Antoinette", "Catherine de Médicis", "Joséphine de Beauharnais", "Marie-Antoinette, Catherine de Médicis et Joséphine ont été reines ou impératrice des Français. Élisabeth Ire était reine d'Angleterre."]
  ],
  [
    ["Vercingétorix", "Clovis", "Charlemagne", "Hugues Capet", "Clovis, Charlemagne et Hugues Capet ont été rois des Francs ou de France. Vercingétorix était un chef gaulois."],
    ["Trotski", "Lénine", "Staline", "Khrouchtchev", "Lénine, Staline et Khrouchtchev ont dirigé l'URSS. Trotski, rival de Staline, a été exilé puis assassiné au Mexique en 1940."],
    ["Marignan", "La prise de la Bastille", "La fuite à Varennes", "Valmy", "La Bastille, Varennes et Valmy datent de la Révolution française. Marignan est une bataille de 1515."],
    ["Les Mongols", "Les Incas", "Les Aztèques", "Les Mayas", "Incas, Aztèques et Mayas sont des civilisations d'Amérique. Les Mongols ont bâti un empire en Asie."],
    ["Napoléon III", "Louis XVI", "Charles Ier d'Angleterre", "Nicolas II", "Louis XVI, Charles Ier et Nicolas II ont été exécutés. Napoléon III est mort en exil en Angleterre."],
    ["Stalingrad", "Pearl Harbor", "Midway", "Hiroshima", "Pearl Harbor, Midway et Hiroshima appartiennent à la guerre du Pacifique. Stalingrad se trouve en Russie."]
  ],
  [
    ["Philippe le Bel", "Pépin le Bref", "Louis le Pieux", "Charles le Chauve", "Pépin, Louis le Pieux et Charles le Chauve sont des Carolingiens. Philippe le Bel est un Capétien."],
    ["Westphalie (1648)", "Versailles (1919)", "Saint-Germain-en-Laye (1919)", "Trianon (1920)", "Versailles, Saint-Germain et Trianon sont des traités de la fin de la Première Guerre mondiale. Celui de Westphalie clôt la guerre de Trente Ans."],
    ["Frédéric II", "Ivan le Terrible", "Pierre le Grand", "Catherine II", "Ivan, Pierre et Catherine ont régné sur la Russie. Frédéric II était roi de Prusse."],
    ["Charles Martel", "Jeanne d'Arc", "Du Guesclin", "Dunois", "Jeanne d'Arc, Du Guesclin et Dunois ont combattu pendant la guerre de Cent Ans. Charles Martel a vécu au VIIIe siècle."],
    ["Hannibal", "Ptolémée", "Séleucos", "Antigone le Borgne", "Ptolémée, Séleucos et Antigone sont des généraux d'Alexandre qui se sont partagé son empire. Hannibal était carthaginois."],
    ["Ming", "Tokugawa", "Minamoto", "Ashikaga", "Les Tokugawa, Minamoto et Ashikaga ont fourni des shoguns au Japon. Les Ming sont une dynastie chinoise."]
  ]
],
geo: [
  [
    ["Le Nil", "La Seine", "La Loire", "La Garonne", "La Seine, la Loire et la Garonne coulent en France. Le Nil traverse l'Afrique."],
    ["Barcelone", "Madrid", "Lisbonne", "Rome", "Madrid, Lisbonne et Rome sont des capitales. Barcelone est la capitale de la Catalogne, pas de l'Espagne."],
    ["Le Kilimandjaro", "L'Everest", "Le K2", "L'Annapurna", "L'Everest, le K2 et l'Annapurna se trouvent en Asie. Le Kilimandjaro est en Tanzanie."],
    ["Le Mexique", "Le Brésil", "L'Argentine", "Le Chili", "Le Brésil, l'Argentine et le Chili sont en Amérique du Sud. Le Mexique est en Amérique du Nord."],
    ["L'Amazonie", "Le Sahara", "Le Gobi", "Le Kalahari", "Le Sahara, le Gobi et le Kalahari sont des déserts. L'Amazonie est une forêt tropicale."],
    ["La Méditerranée", "Le Pacifique", "L'Atlantique", "L'océan Indien", "Le Pacifique, l'Atlantique et l'océan Indien sont des océans. La Méditerranée est une mer."]
  ],
  [
    ["Sydney", "Canberra", "Ottawa", "Brasilia", "Canberra, Ottawa et Brasilia sont des capitales, préférées à des villes plus grandes. Sydney n'est pas la capitale de l'Australie."],
    ["La Croatie", "La Suisse", "L'Autriche", "La Hongrie", "La Suisse, l'Autriche et la Hongrie n'ont pas d'accès à la mer. La Croatie borde l'Adriatique."],
    ["Le Zambèze", "Le Mékong", "Le Gange", "Le Yangtsé", "Le Mékong, le Gange et le Yangtsé coulent en Asie. Le Zambèze est un fleuve africain."],
    ["La Suisse", "Le Portugal", "L'Irlande", "La Belgique", "Le Portugal, l'Irlande et la Belgique sont membres de l'Union européenne. La Suisse ne l'est pas."],
    ["Le Ghana", "Le Kenya", "La Tanzanie", "L'Ouganda", "Le Kenya, la Tanzanie et l'Ouganda bordent le lac Victoria, en Afrique de l'Est. Le Ghana est en Afrique de l'Ouest."],
    ["Shanghai", "Tokyo", "Séoul", "Pékin", "Tokyo, Séoul et Pékin sont des capitales. Shanghai est la plus grande ville de Chine, mais pas sa capitale."]
  ],
  [
    ["Monaco", "Le Lesotho", "Le Vatican", "Saint-Marin", "Le Lesotho, le Vatican et Saint-Marin sont entièrement entourés par un seul pays. Monaco a une façade maritime."],
    ["Le Cambodge", "Le Bhoutan", "Le Népal", "Le Laos", "Le Bhoutan, le Népal et le Laos n'ont pas d'accès à la mer. Le Cambodge borde le golfe de Thaïlande."],
    ["Le lac Titicaca", "Le lac Victoria", "Le lac Tanganyika", "Le lac Malawi", "Les lacs Victoria, Tanganyika et Malawi sont des grands lacs africains. Le Titicaca est en Amérique du Sud."],
    ["L'Uruguay", "Le Paraguay", "La Bolivie", "Le Mali", "Le Paraguay, la Bolivie et le Mali n'ont pas d'accès à la mer. L'Uruguay borde l'Atlantique."],
    ["Le Grand Paradis", "Le mont Blanc", "Le Cervin", "Le mont Rose", "Le mont Blanc, le Cervin et le mont Rose sont à cheval sur une frontière. Le Grand Paradis est entièrement italien."],
    ["Le canal de Suez", "Le détroit de Gibraltar", "Le Bosphore", "Le détroit de Béring", "Gibraltar, le Bosphore et Béring sont des détroits naturels. Le canal de Suez a été creusé par l'homme, en 1869."]
  ]
],
sport: [
  [
    ["Le tennis", "Le football", "Le rugby", "Le basket-ball", "Le football, le rugby et le basket se jouent en équipe avec un ballon. Le tennis se joue avec une raquette."],
    ["Tony Parker", "Zinédine Zidane", "Kylian Mbappé", "Thierry Henry", "Zidane, Mbappé et Henry sont des footballeurs. Tony Parker a fait carrière au basket."],
    ["Le Tour de France", "Roland-Garros", "Wimbledon", "L'US Open", "Roland-Garros, Wimbledon et l'US Open sont des tournois de tennis du Grand Chelem. Le Tour de France est une course cycliste."],
    ["Le cricket", "Le judo", "Le karaté", "Le taekwondo", "Le judo, le karaté et le taekwondo sont des arts martiaux. Le cricket se joue avec une batte."],
    ["Usain Bolt", "Rafael Nadal", "Roger Federer", "Novak Djokovic", "Nadal, Federer et Djokovic sont des joueurs de tennis. Usain Bolt est un sprinteur."],
    ["Le carton rouge", "Le maillot jaune", "Le maillot vert", "Le maillot à pois", "Les maillots jaune, vert et à pois récompensent les leaders du Tour de France. Le carton rouge sanctionne un joueur au football."]
  ],
  [
    ["La Juventus", "Le Real Madrid", "Le FC Barcelone", "L'Atlético de Madrid", "Le Real, le Barça et l'Atlético sont des clubs espagnols. La Juventus est un club de Turin."],
    ["Le biathlon", "Le slalom", "La descente", "Le super-G", "Le slalom, la descente et le super-G sont des épreuves de ski alpin. Le biathlon associe ski de fond et tir."],
    ["Tom Brady", "Michael Jordan", "LeBron James", "Kobe Bryant", "Jordan, LeBron James et Kobe Bryant sont des basketteurs. Tom Brady est une star du football américain."],
    ["Wembley", "Le Stade de France", "Le Parc des Princes", "L'Orange Vélodrome", "Le Stade de France, le Parc des Princes et le Vélodrome sont en France. Wembley est à Londres."],
    ["Le water-polo", "Le marathon", "Le 100 mètres", "Le saut en longueur", "Le marathon, le 100 m et le saut en longueur sont des épreuves d'athlétisme. Le water-polo se joue dans l'eau."],
    ["Sébastien Loeb", "Alain Prost", "Lewis Hamilton", "Ayrton Senna", "Prost, Hamilton et Senna sont des champions de Formule 1. Sébastien Loeb a été neuf fois champion du monde des rallyes."]
  ],
  [
    ["Roland-Garros", "Le Masters", "L'Open britannique", "L'US Open", "Le Masters, l'Open britannique et l'US Open sont des tournois majeurs de golf. Roland-Garros est un tournoi de tennis."],
    ["Le hockey sur gazon", "Le curling", "Le skeleton", "Le bobsleigh", "Le curling, le skeleton et le bobsleigh sont des sports d'hiver. Le hockey sur gazon est aux Jeux d'été."],
    ["Le Chili", "Le Brésil", "L'Uruguay", "L'Argentine", "Le Brésil, l'Uruguay et l'Argentine ont remporté la Coupe du monde de football. Pas le Chili."],
    ["Paris-Roubaix", "Le Tour de France", "Le Giro", "La Vuelta", "Le Tour, le Giro et la Vuelta sont les trois grands tours, courus en trois semaines. Paris-Roubaix est une course d'un jour."],
    ["Le javelot", "Le fleuret", "L'épée", "Le sabre", "Le fleuret, l'épée et le sabre sont les trois armes de l'escrime. Le javelot est une épreuve d'athlétisme."],
    ["Simone Biles", "Serena Williams", "Steffi Graf", "Martina Navrátilová", "Serena Williams, Steffi Graf et Martina Navrátilová sont des légendes du tennis. Simone Biles est gymnaste."]
  ]
],
cine: [
  [
    ["Bugs Bunny", "Mickey", "Donald", "Dingo", "Mickey, Donald et Dingo sont des personnages Disney. Bugs Bunny vient de chez Warner Bros."],
    ["Jurassic Park", "Titanic", "Avatar", "Terminator", "Titanic, Avatar et Terminator sont de James Cameron. Jurassic Park est de Steven Spielberg."],
    ["Spotify", "Netflix", "Disney+", "Prime Video", "Netflix, Disney+ et Prime Video proposent des films et des séries. Spotify diffuse de la musique et des podcasts."],
    ["Frodon Sacquet", "Harry Potter", "Hermione Granger", "Ron Weasley", "Harry, Hermione et Ron sont les héros de Harry Potter. Frodon est celui du Seigneur des anneaux."],
    ["Spider-Man", "Batman", "Superman", "Wonder Woman", "Batman, Superman et Wonder Woman viennent de DC Comics. Spider-Man est un héros Marvel."],
    ["Shrek", "Le Roi lion", "La Reine des neiges", "Aladdin", "Le Roi lion, La Reine des neiges et Aladdin sont des Disney. Shrek vient de DreamWorks."]
  ],
  [
    ["Luc Besson", "Steven Spielberg", "Martin Scorsese", "Quentin Tarantino", "Spielberg, Scorsese et Tarantino sont américains. Luc Besson est français."],
    ["Breaking Bad", "Friends", "How I Met Your Mother", "The Big Bang Theory", "Friends, How I Met Your Mother et The Big Bang Theory sont des sitcoms. Breaking Bad est une série dramatique."],
    ["Penélope Cruz", "Omar Sy", "Jean Dujardin", "Marion Cotillard", "Omar Sy, Jean Dujardin et Marion Cotillard sont français. Penélope Cruz est espagnole."],
    ["Le César", "La Palme d'or", "Le Lion d'or", "L'Ours d'or", "La Palme, le Lion et l'Ours d'or sont les grands prix des festivals de Cannes, Venise et Berlin. Le César récompense le cinéma français."],
    ["Pikachu", "Totoro", "Chihiro", "Ponyo", "Totoro, Chihiro et Ponyo viennent des films du studio Ghibli. Pikachu vient de Pokémon."],
    ["Dumbledore", "Gandalf", "Aragorn", "Legolas", "Gandalf, Aragorn et Legolas sont des héros du Seigneur des anneaux. Dumbledore est le directeur de Poudlard."]
  ],
  [
    ["Pedro Almodóvar", "Federico Fellini", "Sergio Leone", "Pier Paolo Pasolini", "Fellini, Leone et Pasolini sont italiens. Almodóvar est espagnol."],
    ["Lost", "Les Soprano", "The Wire", "Six Feet Under", "Les Soprano, The Wire et Six Feet Under ont été diffusées par HBO. Lost l'a été par ABC."],
    ["Jean Renoir", "Jean-Luc Godard", "François Truffaut", "Éric Rohmer", "Godard, Truffaut et Rohmer sont des figures de la Nouvelle Vague. Jean Renoir l'a précédée."],
    ["Citizen Kane", "Psychose", "Les Oiseaux", "Sueurs froides", "Psychose, Les Oiseaux et Sueurs froides sont d'Alfred Hitchcock. Citizen Kane est d'Orson Welles."],
    ["Wong Kar-wai", "Akira Kurosawa", "Yasujirō Ozu", "Kenji Mizoguchi", "Kurosawa, Ozu et Mizoguchi sont japonais. Wong Kar-wai est hongkongais."],
    ["Taxi Driver", "Le Parrain", "Apocalypse Now", "Conversation secrète", "Le Parrain, Apocalypse Now et Conversation secrète sont de Francis Ford Coppola. Taxi Driver est de Martin Scorsese."]
  ]
]
};

/* Qui suis-je : [réponse, variantes acceptées, 4 indices du plus dur au plus facile, le saviez-vous] */
const CLUES = {
hist: [
  [
    ["Napoléon Bonaparte", ["Napoléon", "Bonaparte", "Napoléon Ier"], ["Je suis né en Corse en 1769.", "J'ai fait rédiger le Code civil.", "J'ai été exilé à l'île d'Elbe puis à Sainte-Hélène.", "J'ai été sacré empereur des Français en 1804."], "Il meurt à Sainte-Hélène en 1821. Ses cendres reposent aux Invalides depuis 1840."],
    ["Jeanne d'Arc", ["Jeanne"], ["Je suis née à Domrémy vers 1412.", "J'entendais des voix.", "J'ai fait sacrer Charles VII à Reims.", "On m'appelait la Pucelle d'Orléans."], "Brûlée vive à Rouen en 1431, elle a été canonisée en 1920."],
    ["Cléopâtre", ["Cléopâtre VII"], ["Ma dynastie a été fondée par un général d'Alexandre le Grand.", "J'ai été l'alliée de Jules César puis de Marc Antoine.", "Je régnais depuis Alexandrie.", "Je suis la plus célèbre reine d'Égypte."], "Selon la tradition, elle se donne la mort en 30 av. J.-C., peut-être grâce à un serpent."],
    ["Christophe Colomb", ["Colomb"], ["Je suis né à Gênes.", "Les Rois catholiques ont financé mon expédition.", "Mes navires s'appelaient la Santa María, la Pinta et la Niña.", "En 1492, j'ai atteint l'Amérique en croyant arriver aux Indes."], "Il fera quatre voyages sans jamais admettre qu'il avait atteint un nouveau continent."]
  ],
  [
    ["Louis XIV", ["Louis 14", "Roi-Soleil"], ["Je suis devenu roi à 4 ans.", "J'ai révoqué l'édit de Nantes.", "J'ai régné 72 ans.", "On m'appelait le Roi-Soleil."], "Il fait de Versailles le siège du pouvoir en 1682."],
    ["Nelson Mandela", ["Mandela", "Madiba"], ["Je suis né en 1918 dans le village de Mvezo.", "J'ai passé 27 ans en prison.", "J'ai reçu le prix Nobel de la paix en 1993.", "J'ai été le premier président noir d'Afrique du Sud."], "Il préside l'Afrique du Sud de 1994 à 1999 et meurt en 2013."],
    ["Charlemagne", ["Charles le Grand", "Charles Ier"], ["Mon père s'appelait Pépin le Bref.", "Ma capitale était Aix-la-Chapelle.", "J'ai été couronné empereur à Rome le jour de Noël de l'an 800.", "Une chanson populaire m'accuse d'avoir inventé l'école."], "Il encourage la renaissance carolingienne : écoles, copie de manuscrits, nouvelle écriture."],
    ["Gandhi", ["Mahatma Gandhi", "Mohandas Gandhi"], ["J'ai été avocat en Afrique du Sud.", "J'ai mené la marche du sel en 1930.", "J'ai prôné la non-violence.", "On m'appelle Mahatma, la « grande âme »."], "L'Inde obtient son indépendance en 1947. Gandhi est assassiné l'année suivante."]
  ],
  [
    ["Soliman le Magnifique", ["Soliman", "Suleyman"], ["J'ai régné de 1520 à 1566.", "J'ai assiégé Vienne en 1529.", "J'ai été l'allié de François Ier.", "Je suis le plus célèbre des sultans ottomans."], "Sous son règne, l'Empire ottoman atteint son apogée."],
    ["Simón Bolívar", ["Bolivar"], ["Je suis né à Caracas en 1783.", "Un pays porte mon nom.", "J'ai rêvé d'une grande Colombie unie.", "On m'appelle El Libertador."], "Il a mené l'indépendance de plusieurs pays d'Amérique du Sud contre l'Espagne."],
    ["Aliénor d'Aquitaine", ["Aliénor"], ["J'ai participé à la deuxième croisade.", "J'ai été reine de France puis reine d'Angleterre.", "Deux de mes fils sont devenus rois d'Angleterre, dont Richard Cœur de Lion.", "J'étais duchesse d'Aquitaine."], "Elle épouse Louis VII puis Henri II Plantagenêt, et meurt en 1204 à plus de 80 ans."],
    ["Toussaint Louverture", ["Louverture", "Toussaint"], ["Je suis né esclave vers 1743.", "J'ai dirigé la révolte de Saint-Domingue.", "Napoléon m'a fait emprisonner au fort de Joux, dans le Jura.", "Je suis le grand héros de l'indépendance d'Haïti."], "Il meurt en captivité en 1803. Haïti proclame son indépendance en 1804."]
  ]
],
geo: [
  [
    ["Italie", [], ["Je compte parmi les pays qui ont le plus de sites inscrits à l'UNESCO.", "J'entoure deux petits États.", "Selon la légende, ma capitale a été fondée en 753 av. J.-C.", "J'ai la forme d'une botte."], "L'Italie entoure entièrement Saint-Marin et le Vatican."],
    ["Égypte", [], ["Je suis à cheval sur deux continents grâce au Sinaï.", "Le canal de Suez traverse mon territoire.", "Un grand fleuve me traverse du sud au nord.", "On y trouve les pyramides de Gizeh."], "Environ 95 % des Égyptiens vivent dans la vallée et le delta du Nil."],
    ["Japon", [], ["Je compte plus de 14 000 îles.", "Mon Parlement s'appelle la Diète.", "Mon plus haut sommet est un volcan de 3 776 m.", "Ma capitale est Tokyo."], "Le mont Fuji est inscrit au patrimoine mondial de l'UNESCO depuis 2013."],
    ["Brésil", [], ["Je suis le cinquième pays du monde par la superficie.", "Je touche presque tous les pays d'Amérique du Sud.", "On y parle portugais.", "Mon carnaval le plus célèbre a lieu à Rio de Janeiro."], "Seuls le Chili et l'Équateur n'ont pas de frontière avec le Brésil."]
  ],
  [
    ["Canada", [], ["J'ai le plus long littoral du monde.", "Je compte des centaines de milliers de lacs.", "Deux langues y sont officielles.", "Une feuille d'érable orne mon drapeau."], "Le littoral canadien dépasse 200 000 km."],
    ["Australie", [], ["Je suis à la fois un pays et presque un continent.", "Ma capitale n'est pas ma plus grande ville.", "On y trouve le rocher d'Uluru.", "Le kangourou est mon emblème."], "Canberra a été choisie comme compromis entre Sydney et Melbourne."],
    ["Islande", [], ["La dorsale médio-atlantique me traverse.", "Mon Parlement, l'Althing, est l'un des plus anciens du monde.", "Je n'ai pas d'armée.", "Ma capitale est Reykjavik."], "L'Althing a été fondé en 930."],
    ["Venise", [], ["Je suis bâtie sur plus de 100 îles.", "Mon ancienne république était dirigée par un doge.", "Mon carnaval est célèbre pour ses masques.", "On s'y déplace en gondole."], "La ville compte environ 400 ponts."]
  ],
  [
    ["Mongolie", [], ["Je suis le pays le moins densément peuplé du monde.", "Ma capitale est souvent citée comme la plus froide du monde.", "Je suis coincée entre deux géants.", "Gengis Khan y est né."], "La Mongolie compte environ 2 habitants au km². Sa capitale est Oulan-Bator."],
    ["Bolivie", [], ["J'ai deux capitales.", "Je possède le plus grand désert de sel du monde.", "Je partage le lac Titicaca avec un voisin.", "J'ai perdu mon accès à la mer face au Chili."], "Le salar d'Uyuni couvre plus de 10 000 km²."],
    ["Lesotho", [], ["Tout mon territoire est à plus de 1 000 m d'altitude.", "Je suis un royaume.", "On me surnomme le « royaume dans le ciel ».", "Je suis entièrement entouré par l'Afrique du Sud."], "Son point le plus bas, à environ 1 400 m, est le plus élevé du monde pour un point bas."],
    ["Istanbul", ["Constantinople"], ["J'ai porté trois noms au cours de mon histoire.", "J'ai été la capitale de deux empires.", "Je suis à cheval sur l'Europe et l'Asie.", "Le Bosphore me traverse."], "Byzance, Constantinople puis Istanbul : elle fut la capitale des Empires byzantin et ottoman."]
  ]
],
sport: [
  [
    ["Zinédine Zidane", ["Zidane", "Zizou"], ["Je suis né à Marseille en 1972.", "J'ai remporté le Ballon d'or en 1998.", "J'ai entraîné le Real Madrid.", "J'ai marqué deux buts de la tête en finale de la Coupe du monde 1998."], "Il a remporté trois Ligues des champions de suite comme entraîneur du Real Madrid, de 2016 à 2018."],
    ["Usain Bolt", ["Bolt"], ["Je suis né en Jamaïque en 1986.", "J'ai remporté huit titres olympiques.", "Mon geste fétiche imite un archer.", "J'ai couru le 100 m en 9,58 s."], "Il a établi les records du monde du 100 m et du 200 m en 2009."],
    ["Roger Federer", ["Federer"], ["Je suis né à Bâle en 1981.", "J'ai gagné Wimbledon huit fois.", "J'ai pris ma retraite en 2022.", "Je suis le plus célèbre joueur de tennis suisse."], "Il a remporté 20 tournois du Grand Chelem."],
    ["Michael Jordan", ["Jordan"], ["J'ai aussi joué au baseball.", "J'ai remporté six titres NBA.", "J'ai porté le numéro 23.", "J'ai fait la gloire des Chicago Bulls."], "Ses chaussures Air Jordan, lancées en 1985, sont devenues une marque à part entière."]
  ],
  [
    ["Serena Williams", ["Serena", "Williams"], ["J'ai remporté 23 tournois du Grand Chelem en simple.", "Ma sœur aînée est aussi une championne.", "J'ai gagné l'Open d'Australie en étant enceinte.", "Je suis une joueuse de tennis américaine."], "Elle a gagné l'Open d'Australie 2017 enceinte d'environ deux mois."],
    ["Pelé", ["Edson Arantes do Nascimento"], ["Mon vrai prénom est Edson.", "J'ai joué à Santos puis au Cosmos de New York.", "Je suis le seul joueur à avoir gagné trois Coupes du monde.", "On m'appelle le « Roi » du football brésilien."], "Il a gagné les Coupes du monde 1958, 1962 et 1970. Il est mort en 2022."],
    ["Teddy Riner", ["Riner"], ["Je suis né en Guadeloupe en 1989.", "Je mesure plus de 2 mètres.", "J'ai allumé la vasque olympique de Paris 2024 avec Marie-José Pérec.", "Je suis le judoka le plus titré de l'histoire."], "Il a notamment remporté l'or olympique individuel à Londres, à Rio et à Paris."],
    ["Michael Phelps", ["Phelps"], ["Je suis né à Baltimore en 1985.", "J'ai participé à cinq Jeux olympiques.", "J'ai remporté huit médailles d'or à Pékin en 2008.", "Je suis le sportif le plus médaillé de l'histoire olympique."], "Il compte 28 médailles olympiques, dont 23 en or."]
  ],
  [
    ["Nadia Comăneci", ["Nadia Comaneci", "Comaneci", "Nadia"], ["Je suis née en Roumanie en 1961.", "J'ai été entraînée par Béla Károlyi.", "J'avais 14 ans lors de mon exploit.", "J'ai reçu le premier 10 de l'histoire de la gymnastique olympique."], "À Montréal, en 1976, elle obtient sept fois la note parfaite."],
    ["Eddy Merckx", ["Merckx"], ["Je suis né en 1945.", "On me surnommait « le Cannibale ».", "J'ai gagné cinq Tours de France.", "Je suis le plus grand cycliste belge."], "Ses 34 victoires d'étape sur le Tour ont été égalées puis dépassées par Mark Cavendish en 2024."],
    ["Muhammad Ali", ["Ali", "Cassius Clay", "Mohamed Ali"], ["Je suis né Cassius Clay.", "J'ai refusé de partir faire la guerre au Viêt Nam.", "J'ai affronté George Foreman à Kinshasa.", "Je « volais comme un papillon et piquais comme une abeille »."], "Le combat de Kinshasa, en 1974, est resté célèbre sous le nom de « Rumble in the Jungle »."],
    ["Jesse Owens", ["Owens"], ["Je suis né en Alabama en 1913.", "J'ai battu trois records du monde en 45 minutes en 1935.", "J'ai remporté quatre médailles d'or en 1936.", "J'ai triomphé aux Jeux de Berlin, sous les yeux d'Hitler."], "Il gagne le 100 m, le 200 m, le saut en longueur et le relais 4 × 100 m."]
  ]
],
cine: [
  [
    ["Charlie Chaplin", ["Chaplin", "Charlot"], ["Je suis né à Londres en 1889.", "J'ai réalisé Le Dictateur.", "J'ai longtemps refusé le cinéma parlant.", "Mon personnage porte un chapeau melon, une canne et une petite moustache."], "Son personnage s'appelle Charlot en français, the Tramp en anglais."],
    ["Mickey", ["Mickey Mouse"], ["Je suis né en 1928 dans Steamboat Willie.", "Mon créateur voulait d'abord m'appeler Mortimer.", "Ma compagne s'appelle Minnie.", "Je suis la mascotte de Disney."], "Steamboat Willie est l'un des premiers dessins animés avec un son synchronisé."],
    ["James Bond", ["Bond", "007"], ["Ian Fleming m'a créé en 1953.", "Sean Connery a été le premier à m'incarner au cinéma.", "Je travaille pour les services secrets britanniques.", "Mon matricule est 007."], "Le premier film, James Bond 007 contre Dr No, sort en 1962."],
    ["Dark Vador", ["Vador", "Darth Vader", "Anakin Skywalker", "Anakin"], ["J'ai été esclave sur la planète Tatooine.", "J'ai été formé par Obi-Wan Kenobi.", "Je respire bruyamment derrière un masque noir.", "Je suis le père de Luke Skywalker."], "En version originale, c'est James Earl Jones qui lui prête sa voix."]
  ],
  [
    ["Alfred Hitchcock", ["Hitchcock"], ["Je suis né à Londres en 1899.", "J'apparais brièvement dans presque tous mes films.", "J'ai réalisé Les Oiseaux.", "On m'appelle le maître du suspense."], "Il n'a jamais reçu l'Oscar du meilleur réalisateur, malgré cinq nominations."],
    ["Marilyn Monroe", ["Marilyn", "Monroe", "Norma Jeane"], ["Mon vrai nom était Norma Jeane.", "J'ai épousé le joueur de baseball Joe DiMaggio.", "J'ai chanté « Happy Birthday » au président Kennedy.", "Ma robe blanche se soulève au-dessus d'une grille de métro."], "La scène de la robe vient du film Sept ans de réflexion (1955)."],
    ["Louis de Funès", ["De Funès", "Funès"], ["J'ai longtemps été pianiste de bar.", "J'ai joué un gendarme de Saint-Tropez.", "J'ai partagé l'affiche de La Grande Vadrouille avec Bourvil.", "Je suis célèbre pour mes grimaces et mes colères."], "La Grande Vadrouille (1966) a attiré plus de 17 millions de spectateurs en France."],
    ["Hayao Miyazaki", ["Miyazaki"], ["Je suis né à Tokyo en 1941.", "J'ai cofondé le studio Ghibli.", "J'ai réalisé Princesse Mononoké.", "Mon Voisin Totoro est mon personnage le plus célèbre."], "Il a reçu un deuxième Oscar en 2024 pour Le Garçon et le Héron."]
  ],
  [
    ["Agnès Varda", ["Varda"], ["Je suis née à Bruxelles en 1928.", "J'ai réalisé Cléo de 5 à 7.", "On m'a surnommée la « grand-mère de la Nouvelle Vague ».", "J'ai reçu un Oscar d'honneur en 2017."], "Elle a aussi réalisé Les Glaneurs et la Glaneuse, en 2000."],
    ["Stanley Kubrick", ["Kubrick"], ["Je suis né à New York en 1928.", "J'ai vécu en Angleterre à partir des années 1960.", "J'ai adapté Orange mécanique.", "J'ai réalisé 2001, l'Odyssée de l'espace."], "Il est mort en 1999, quelques jours après avoir achevé Eyes Wide Shut."],
    ["Sergio Leone", ["Leone"], ["Je suis né à Rome en 1929.", "Ennio Morricone a composé la musique de mes films.", "J'ai tourné en Espagne des films situés dans l'Ouest américain.", "Je suis le père du western spaghetti."], "Sa « trilogie du dollar » a révélé Clint Eastwood."],
    ["Federico Fellini", ["Fellini"], ["Je suis né à Rimini en 1920.", "J'ai remporté cinq Oscars, dont un d'honneur.", "Marcello Mastroianni était mon acteur fétiche.", "J'ai filmé Anita Ekberg dans la fontaine de Trevi."], "La scène de la fontaine de Trevi vient de La dolce vita (1960)."]
  ]
],
sciences: [
  [
    ["Albert Einstein", ["Einstein"], ["Je suis né en Allemagne en 1879.", "J'ai travaillé dans un bureau des brevets à Berne.", "J'ai reçu le prix Nobel de physique en 1921.", "Je suis l'auteur de E = mc²."], "Il a reçu le Nobel pour l'effet photoélectrique, pas pour la relativité."],
    ["Marie Curie", ["Curie", "Marie Sklodowska"], ["Je suis née à Varsovie en 1867.", "J'ai découvert le polonium, nommé d'après mon pays natal.", "J'ai été la première femme professeure à la Sorbonne.", "J'ai reçu deux prix Nobel."], "Elle repose au Panthéon depuis 1995, avec son mari Pierre."],
    ["Isaac Newton", ["Newton"], ["Je suis né en Angleterre en 1643.", "J'ai décomposé la lumière blanche avec un prisme.", "J'ai présidé la Royal Society.", "Une pomme m'aurait inspiré la gravitation."], "L'histoire de la pomme vient de Newton lui-même, qui la racontait dans sa vieillesse."],
    ["Louis Pasteur", ["Pasteur"], ["Je suis né à Dole, dans le Jura, en 1822.", "J'ai montré que la génération spontanée n'existe pas.", "Un procédé de conservation porte mon nom.", "J'ai mis au point le vaccin contre la rage."], "La pasteurisation consiste à chauffer un aliment pour détruire les microbes."]
  ],
  [
    ["Galilée", ["Galileo", "Galileo Galilei"], ["Je suis né à Pise en 1564.", "J'ai observé les montagnes de la Lune.", "J'ai été condamné par l'Inquisition en 1633.", "J'ai défendu l'idée que la Terre tourne autour du Soleil."], "L'Église l'a officiellement réhabilité en 1992."],
    ["Charles Darwin", ["Darwin"], ["Je suis né en Angleterre en 1809.", "J'ai fait le tour du monde à bord du Beagle.", "Les pinsons des Galápagos m'ont inspiré.", "J'ai expliqué l'évolution par la sélection naturelle."], "L'Origine des espèces paraît en 1859."],
    ["Léonard de Vinci", ["De Vinci", "Vinci", "Léonard"], ["J'écrivais souvent de droite à gauche.", "J'ai dessiné des machines volantes.", "Je suis mort à Amboise en 1519.", "J'ai peint La Joconde."], "Il passe ses dernières années au Clos Lucé, invité par François Ier."],
    ["Nikola Tesla", ["Tesla"], ["Je suis né en 1856 dans l'actuelle Croatie.", "J'ai brièvement travaillé pour Thomas Edison.", "J'ai défendu le courant alternatif.", "Une marque de voitures électriques porte mon nom."], "L'unité de mesure du champ magnétique, le tesla, porte aussi son nom."]
  ],
  [
    ["Rosalind Franklin", ["Franklin"], ["Je suis née à Londres en 1920.", "J'étais cristallographe.", "Mon « cliché 51 » a été décisif.", "Mes images aux rayons X ont révélé la structure de l'ADN."], "Morte en 1958, elle n'a pas pu partager le Nobel de 1962, qui n'est pas décerné à titre posthume."],
    ["Alan Turing", ["Turing"], ["Je suis né à Londres en 1912.", "Un test d'intelligence des machines porte mon nom.", "J'ai travaillé à Bletchley Park.", "J'ai aidé à casser le code Enigma."], "Condamné en 1952 pour homosexualité, il a été gracié à titre posthume en 2013."],
    ["Nicolas Copernic", ["Copernic"], ["Je suis né en Pologne en 1473.", "J'étais chanoine.", "Mon grand ouvrage a paru l'année de ma mort, en 1543.", "J'ai placé le Soleil au centre de l'Univers."], "Son modèle héliocentrique bouleverse la vision du monde héritée de Ptolémée."],
    ["Ada Lovelace", ["Lovelace", "Ada"], ["Je suis née en 1815.", "Mon père était le poète Lord Byron.", "J'ai travaillé sur la machine analytique de Charles Babbage.", "On me considère comme la première programmeuse de l'histoire."], "Un langage informatique, Ada, porte son nom depuis 1980."]
  ]
]
};

/* Connexions : 6 grilles par difficulté, 4 familles de 4 mots */
const CONNEX = [
  [
    [["Capitales", ["Paris", "Rome", "Lima", "Oslo"]], ["Fleuves", ["Nil", "Seine", "Loire", "Volga"]], ["Planètes", ["Mars", "Vénus", "Saturne", "Jupiter"]], ["Sports", ["Judo", "Golf", "Rugby", "Tennis"]]],
    [["Fruits", ["Pomme", "Poire", "Kiwi", "Mangue"]], ["Instruments", ["Piano", "Violon", "Flûte", "Harpe"]], ["Pays d'Afrique", ["Mali", "Kenya", "Togo", "Gabon"]], ["Océans", ["Pacifique", "Atlantique", "Indien", "Arctique"]]],
    [["Peintres", ["Monet", "Picasso", "Dalí", "Van Gogh"]], ["Animaux de la savane", ["Lion", "Zèbre", "Girafe", "Gnou"]], ["Monuments de Paris", ["Louvre", "Panthéon", "Sacré-Cœur", "Invalides"]], ["Desserts", ["Tarte", "Crêpe", "Éclair", "Macaron"]]],
    [["Super-héros", ["Batman", "Hulk", "Thor", "Flash"]], ["Langues", ["Arabe", "Russe", "Hindi", "Swahili"]], ["Continents", ["Asie", "Europe", "Afrique", "Océanie"]], ["Métaux", ["Fer", "Cuivre", "Zinc", "Plomb"]]],
    [["Îles", ["Corse", "Crète", "Malte", "Sicile"]], ["Races de chiens", ["Caniche", "Husky", "Beagle", "Boxer"]], ["Boissons chaudes", ["Thé", "Café", "Chocolat", "Tisane"]], ["Mois", ["Mai", "Juin", "Avril", "Août"]]],
    [["Montagnes", ["Alpes", "Andes", "Rocheuses", "Pyrénées"]], ["Dieux grecs", ["Zeus", "Hermès", "Apollon", "Athéna"]], ["Danses", ["Valse", "Tango", "Salsa", "Rumba"]], ["Légumes", ["Carotte", "Poireau", "Navet", "Radis"]]]
  ],
  [
    [["Notes de musique", ["Do", "Ré", "Mi", "Sol"]], ["Fleuves d'Afrique", ["Niger", "Congo", "Nil", "Orange"]], ["Pays", ["Tchad", "Mali", "Pérou", "Cuba"]], ["Fruits", ["Pomme", "Citron", "Kiwi", "Figue"]]],
    [["Monnaies", ["Euro", "Yen", "Rouble", "Peso"]], ["Chaînes de montagnes", ["Atlas", "Oural", "Andes", "Alpes"]], ["Mythologie grecque", ["Zeus", "Hadès", "Achille", "Méduse"]], ["Maisons de couture", ["Dior", "Chanel", "Cardin", "Hermès"]]],
    [["Pâtes", ["Penne", "Lasagne", "Farfalle", "Spaghetti"]], ["Volcans", ["Etna", "Vésuve", "Fuji", "Stromboli"]], ["Marques de voitures italiennes", ["Fiat", "Ferrari", "Lancia", "Maserati"]], ["Peintres italiens", ["Raphaël", "Titien", "Giotto", "Caravage"]]],
    [["Footballeurs français", ["Zidane", "Mbappé", "Henry", "Griezmann"]], ["Philosophes", ["Platon", "Kant", "Sartre", "Descartes"]], ["Prix littéraires", ["Goncourt", "Renaudot", "Femina", "Médicis"]], ["Explorateurs", ["Colomb", "Magellan", "Cook", "Cartier"]]],
    [["Mers", ["Égée", "Baltique", "Morte", "Caspienne"]], ["Couleurs", ["Rouge", "Noir", "Jaune", "Vert"]], ["Jeux de cartes", ["Belote", "Tarot", "Poker", "Bridge"]], ["Pierres précieuses", ["Rubis", "Saphir", "Diamant", "Émeraude"]]],
    [["Villes olympiques d'hiver", ["Albertville", "Grenoble", "Sotchi", "Nagano"]], ["Cépages", ["Merlot", "Syrah", "Gamay", "Chardonnay"]], ["Oiseaux", ["Moineau", "Merle", "Pie", "Mésange"]], ["Matériel informatique", ["Clavier", "Souris", "Écran", "Disque"]]]
  ],
  [
    [["Capitales d'Asie centrale", ["Astana", "Bichkek", "Tachkent", "Douchanbé"]], ["Nobel de littérature français", ["Camus", "Sartre", "Modiano", "Ernaux"]], ["Lunes de Jupiter", ["Io", "Europe", "Ganymède", "Callisto"]], ["Langues romanes", ["Roumain", "Catalan", "Occitan", "Portugais"]]],
    [["Affluents de la Seine", ["Marne", "Oise", "Yonne", "Aube"]], ["Départements bretons", ["Finistère", "Morbihan", "Côtes-d'Armor", "Ille-et-Vilaine"]], ["Dynasties chinoises", ["Ming", "Han", "Qing", "Tang"]], ["Constellations", ["Orion", "Cassiopée", "Pégase", "Andromède"]]],
    [["Opéras de Verdi", ["Aïda", "Nabucco", "Otello", "Rigoletto"]], ["Navires célèbres", ["Titanic", "Bounty", "Mayflower", "Nautilus"]], ["Plats traditionnels", ["Tajine", "Paella", "Moussaka", "Goulasch"]], ["Alphabet radio de l'OTAN", ["Alpha", "Bravo", "Tango", "Victor"]]],
    [["Peintres flamands", ["Rubens", "Bruegel", "Van Eyck", "Memling"]], ["Marques allemandes", ["Adidas", "Puma", "Siemens", "Bosch"]], ["Félins", ["Lynx", "Ocelot", "Serval", "Jaguar"]], ["Victoires de Napoléon", ["Austerlitz", "Iéna", "Wagram", "Eylau"]]],
    [["Grands ports d'Europe", ["Rotterdam", "Anvers", "Hambourg", "Le Havre"]], ["Fromages AOP", ["Comté", "Reblochon", "Munster", "Cantal"]], ["Avionneurs", ["Airbus", "Boeing", "Embraer", "Dassault"]], ["Langages informatiques", ["Python", "Java", "Ruby", "Rust"]]],
    [["Lacs alpins", ["Léman", "Annecy", "Garde", "Côme"]], ["Écrivains russes", ["Tolstoï", "Dostoïevski", "Pouchkine", "Tchekhov"]], ["Instruments à vent", ["Hautbois", "Basson", "Cor", "Tuba"]], ["Vins de Bordeaux", ["Saint-Émilion", "Margaux", "Pomerol", "Pauillac"]]]
  ]
];

/* Le Mot du jour : [mot, indice, le saviez-vous] — 5, 6 puis 7 lettres */
const WORDS = [
  [
    ["DAKAR", "Une capitale africaine", "Le rallye Paris-Dakar s'y terminait de 1979 à 2007."],
    ["TOKYO", "Une capitale", "Tokyo s'appelait Edo jusqu'en 1868."],
    ["NIGER", "Un fleuve, et un pays", "Le fleuve Niger, long d'environ 4 200 km, a donné son nom à deux pays : le Niger et le Nigeria."],
    ["ANDES", "Une chaîne de montagnes", "C'est la plus longue chaîne de montagnes continentale du monde : environ 7 000 km."],
    ["ROUEN", "Une ville française", "Jeanne d'Arc y a été brûlée en 1431."],
    ["TANGO", "Une danse", "Né à Buenos Aires et Montevideo à la fin du XIXe siècle, il est inscrit au patrimoine immatériel de l'UNESCO depuis 2009."],
    ["VOLGA", "Un fleuve", "Le plus long fleuve d'Europe se jette dans la mer Caspienne."],
    ["ZEBRE", "Un animal", "Chaque zèbre a des rayures uniques, comme une empreinte digitale."],
    ["OPERA", "Un art du spectacle", "L'Opéra Garnier, à Paris, a été inauguré en 1875."],
    ["MAYAS", "Une civilisation", "Les Mayas avaient un calendrier très précis et utilisaient le zéro."]
  ],
  [
    ["MADRID", "Une capitale", "Perchée à environ 650 m d'altitude, c'est la capitale la plus haute de l'Union européenne."],
    ["SAHARA", "Un désert", "Il couvre environ 9 millions de km², presque la taille des États-Unis."],
    ["VENISE", "Une ville italienne", "Elle compte environ 400 ponts."],
    ["TENNIS", "Un sport", "Il descend du jeu de paume, très populaire en France au Moyen Âge."],
    ["MOZART", "Un compositeur", "Il composait déjà de petites pièces à 5 ans."],
    ["CONDOR", "Un oiseau", "Le condor des Andes peut dépasser 3 m d'envergure."],
    ["BAOBAB", "Un arbre", "Certains baobabs vivent plus de 1 000 ans."],
    ["OLYMPE", "Une montagne", "Le plus haut sommet de Grèce culmine à 2 918 m. Les dieux grecs y vivaient."],
    ["CANADA", "Un pays", "Le Canada a le plus long littoral du monde."],
    ["GANDHI", "Un personnage historique", "Il a mené l'Inde vers l'indépendance par la non-violence."]
  ],
  [
    ["PICASSO", "Un peintre", "Il a peint Guernica en 1937."],
    ["ATHENES", "Une capitale", "Elle est habitée depuis plus de 3 000 ans."],
    ["MOLIERE", "Un dramaturge", "Son vrai nom était Jean-Baptiste Poquelin."],
    ["RISOTTO", "Un plat", "Il se prépare avec un riz rond, comme l'arborio ou le carnaroli."],
    ["AMAZONE", "Un fleuve", "Elle apporte environ un cinquième de l'eau douce qui se jette dans les océans."],
    ["KREMLIN", "Un monument", "Cette forteresse de Moscou abrite la présidence russe."],
    ["OCEANIE", "Un continent", "Elle regroupe l'Australie, la Nouvelle-Zélande et des milliers d'îles du Pacifique."],
    ["COLISEE", "Un monument", "Il pouvait accueillir environ 50 000 spectateurs."],
    ["ODYSSEE", "Une œuvre", "Ce poème attribué à Homère raconte le retour d'Ulysse à Ithaque."],
    ["TORNADE", "Un phénomène météo", "Les vents d'une tornade peuvent dépasser 400 km/h."]
  ]
];

/* Top 10 : titre, éléments (« @FRA » = un pays, avec ses variantes), le saviez-vous */
const TOPS = [
  [
    { t: "Les 8 planètes du Système solaire", items: ["Mercure", "Vénus", "Terre", "Mars", "Jupiter", "Saturne", "Uranus", "Neptune"], f: "Pluton est classée planète naine depuis 2006." },
    { t: "Les 6 pays fondateurs de la Communauté européenne (1957)", items: ["@FRA", "@DEU|RFA", "@ITA", "@BEL", "@NLD", "@LUX"], f: "Ils signent le traité de Rome le 25 mars 1957." },
    { t: "Les 5 membres permanents du Conseil de sécurité de l'ONU", items: ["@USA", "@CHN", "@RUS", "@FRA", "@GBR"], f: "Chacun dispose d'un droit de veto." },
    { t: "Les 8 pays voisins de la France métropolitaine", items: ["@BEL", "@LUX", "@DEU", "@CHE", "@ITA", "@MCO", "@ESP", "@AND"], f: "Hors métropole, la plus longue frontière de la France est celle entre la Guyane et le Brésil, environ 730 km." },
    { t: "Les 5 océans", items: ["Pacifique", "Atlantique", "Indien|océan indien", "Arctique|glacial arctique", "Austral|antarctique|glacial antarctique"], f: "Le Pacifique, à lui seul, couvre environ un tiers de la planète." },
    { t: "Les 7 pays du G7", items: ["@USA", "@JPN", "@DEU", "@GBR", "@FRA", "@ITA", "@CAN"], f: "L'Union européenne participe aussi aux sommets, sans en être membre à part entière." }
  ],
  [
    { t: "Les 10 plus grands pays du monde par la superficie", items: ["@RUS", "@CAN", "@USA", "@CHN", "@BRA", "@AUS", "@IND", "@ARG", "@KAZ", "@DZA"], f: "L'Algérie est le plus grand pays d'Afrique depuis l'indépendance du Soudan du Sud, en 2011." },
    { t: "Les 8 pays champions du monde de football (jusqu'en 2022)", items: ["@BRA", "@DEU", "@ITA", "@ARG", "@FRA", "@URY", "Angleterre", "@ESP"], f: "En 2022, le Brésil détenait le record avec cinq titres." },
    { t: "Les 7 merveilles du monde antique", items: ["Pyramide de Khéops|khéops|kheops|pyramide|pyramides|gizeh", "Jardins suspendus de Babylone|jardins suspendus|babylone", "Statue de Zeus|zeus", "Temple d'Artémis|artémis|artemis|éphèse|ephese", "Mausolée d'Halicarnasse|mausolée|halicarnasse", "Colosse de Rhodes|colosse|rhodes", "Phare d'Alexandrie|phare|alexandrie"], f: "Seule la pyramide de Khéops existe encore aujourd'hui." },
    { t: "Les 12 pays d'Amérique du Sud", items: ["@BRA", "@ARG", "@CHL", "@PER", "@COL", "@VEN", "@ECU", "@BOL", "@PRY", "@URY", "@GUY", "@SUR"], f: "La Guyane, territoire français, se trouve aussi en Amérique du Sud." },
    { t: "Les 9 pays qui bordent la mer Baltique", items: ["@SWE", "@FIN", "@RUS", "@EST", "@LVA", "@LTU", "@POL", "@DEU", "@DNK"], f: "Elle est peu salée : environ 7 g de sel par litre, contre 35 dans l'océan." },
    { t: "Les 12 pays fondateurs de l'OTAN (1949)", items: ["@USA", "@CAN", "@GBR", "@FRA", "@BEL", "@NLD", "@LUX", "@NOR", "@DNK", "@ISL", "@ITA", "@PRT"], f: "Le traité est signé à Washington le 4 avril 1949." }
  ],
  [
    { t: "Les 9 pays de plus de 140 millions d'habitants (2024)", items: ["@IND", "@CHN", "@USA", "@IDN", "@PAK", "@NGA", "@BRA", "@BGD", "@RUS"], f: "L'Inde a dépassé la Chine en 2023. Elle compte environ 1,45 milliard d'habitants." },
    { t: "Les 10 pays traversés par le Danube", items: ["@DEU", "@AUT", "@SVK", "@HUN", "@HRV", "@SRB", "@ROU", "@BGR", "@MDA", "@UKR"], f: "Il traverse quatre capitales : Vienne, Bratislava, Budapest et Belgrade." },
    { t: "Les 8 plus hauts sommets du monde", items: ["Everest", "K2", "Kangchenjunga|kanchenjunga|kangchendzonga", "Lhotse", "Makalu", "Cho Oyu", "Dhaulagiri", "Manaslu"], f: "Les 14 sommets de plus de 8 000 m se trouvent tous dans l'Himalaya et le Karakoram." },
    { t: "Les 7 pays d'Amérique centrale", items: ["@GTM", "@BLZ", "@HND", "@SLV", "@NIC", "@CRI", "@PAN"], f: "Le Costa Rica a supprimé son armée en 1948." },
    { t: "Les 5 pays qui bordent la mer Caspienne", items: ["@RUS", "@KAZ", "@TKM", "@IRN", "@AZE"], f: "Malgré son nom, la Caspienne est le plus grand lac du monde." },
    { t: "Les 12 pays d'Afrique de plus d'un million de km²", items: ["@DZA", "@COD", "@SDN", "@LBY", "@TCD", "@NER", "@AGO", "@MLI", "@ZAF", "@ETH", "@MRT", "@EGY"], f: "L'Algérie est la plus grande, avec près de 2,4 millions de km²." }
  ]
];

/* Voisins : pays et ses voisins terrestres (opt = acceptés en bonus) */
const NEIGHBORS = [
  [
    { id: "FRA", n: ["BEL", "LUX", "DEU", "CHE", "ITA", "MCO", "ESP", "AND"], opt: ["BRA", "SUR"], f: "En comptant la Guyane, la France touche aussi le Brésil et le Suriname." },
    { id: "ESP", n: ["PRT", "FRA", "AND", "MAR"], opt: ["GBR"], f: "L'Espagne touche le Maroc à Ceuta et Melilla, et le Royaume-Uni à Gibraltar." },
    { id: "DEU", n: ["DNK", "POL", "CZE", "AUT", "CHE", "FRA", "LUX", "BEL", "NLD"], f: "Avec neuf voisins, l'Allemagne est le pays d'Europe qui en compte le plus, après la Russie." },
    { id: "ITA", n: ["FRA", "CHE", "AUT", "SVN", "SMR", "VAT"], f: "L'Italie entoure entièrement Saint-Marin et le Vatican." },
    { id: "BEL", n: ["FRA", "LUX", "DEU", "NLD"], f: "La frontière belgo-néerlandaise traverse des maisons dans le village de Baarle." },
    { id: "CHE", n: ["FRA", "DEU", "AUT", "LIE", "ITA"], f: "Le lac Léman marque une partie de la frontière avec la France." }
  ],
  [
    { id: "BRA", n: ["URY", "ARG", "PRY", "BOL", "PER", "COL", "VEN", "GUY", "SUR", "FRA"], f: "La France est voisine du Brésil grâce à la Guyane. Seuls le Chili et l'Équateur ne touchent pas le Brésil." },
    { id: "POL", n: ["DEU", "CZE", "SVK", "UKR", "BLR", "LTU", "RUS"], f: "La Pologne touche la Russie par l'enclave de Kaliningrad." },
    { id: "AUT", n: ["DEU", "CZE", "SVK", "HUN", "SVN", "ITA", "CHE", "LIE"], f: "L'Autriche n'a pas d'accès à la mer mais compte huit voisins." },
    { id: "ARG", n: ["CHL", "BOL", "PRY", "BRA", "URY"], f: "La frontière avec le Chili, le long des Andes, mesure plus de 5 000 km." },
    { id: "IND", n: ["PAK", "CHN", "NPL", "BTN", "BGD", "MMR"], opt: ["AFG"], f: "L'Inde revendique aussi une frontière avec l'Afghanistan, au Cachemire." },
    { id: "TUR", n: ["GRC", "BGR", "GEO", "ARM", "AZE", "IRN", "IRQ", "SYR"], f: "La Turquie touche l'Azerbaïdjan par l'enclave du Nakhitchevan." }
  ],
  [
    { id: "CHN", n: ["IND", "PAK", "AFG", "TJK", "KGZ", "KAZ", "MNG", "RUS", "PRK", "VNM", "LAO", "MMR", "BTN", "NPL"], f: "Avec la Russie, la Chine est le pays qui compte le plus de voisins : 14." },
    { id: "RUS", n: ["NOR", "FIN", "EST", "LVA", "LTU", "POL", "BLR", "UKR", "GEO", "AZE", "KAZ", "CHN", "MNG", "PRK"], f: "La Russie touche la Lituanie et la Pologne par l'enclave de Kaliningrad." },
    { id: "COD", n: ["COG", "CAF", "SSD", "UGA", "RWA", "BDI", "TZA", "ZMB", "AGO"], f: "La RDC n'a que 40 km de côte, à l'embouchure du fleuve Congo." },
    { id: "TZA", n: ["KEN", "UGA", "RWA", "BDI", "COD", "ZMB", "MWI", "MOZ"], f: "La Tanzanie partage le lac Victoria avec le Kenya et l'Ouganda." },
    { id: "SAU", n: ["JOR", "IRQ", "KWT", "QAT", "ARE", "OMN", "YEM"], f: "L'Arabie saoudite est reliée à Bahreïn par une route de 25 km construite sur la mer." },
    { id: "NER", n: ["DZA", "LBY", "TCD", "NGA", "BEN", "BFA", "MLI"], f: "Le fleuve Niger traverse le pays et sa capitale, Niamey." }
  ]
];

/* Rébus emoji : [emojis, [réponse, leurre, leurre, leurre], le saviez-vous] */
const REBUS = {
cine: [
  [
    ["🦁👑", ["Le Roi lion", "Madagascar", "Le Livre de la jungle", "Zootopie"], "Sorti en 1994, Le Roi lion s'inspire en partie de Hamlet."],
    ["🚢🧊💔", ["Titanic", "Poseidon", "Pirates des Caraïbes", "Waterworld"], "Le film de James Cameron a remporté 11 Oscars en 1998."],
    ["🧙‍♂️⚡👓", ["Harry Potter", "Le Seigneur des anneaux", "Merlin l'enchanteur", "Les Animaux fantastiques"], "La cicatrice en forme d'éclair est la marque laissée par Voldemort."],
    ["🦖🏝️🚙", ["Jurassic Park", "King Kong", "Godzilla", "L'Âge de glace"], "Le film de Spielberg (1993) a révolutionné les effets numériques."],
    ["🐟🔍🐠", ["Le Monde de Nemo", "Les Dents de la mer", "La Petite Sirène", "Vaiana"], "Ce film Pixar de 2003 se déroule sur la Grande Barrière de corail."],
    ["❄️👸⛄", ["La Reine des neiges", "Blanche-Neige", "Cendrillon", "Raiponce"], "Sorti en 2013, le film s'inspire d'un conte d'Andersen."]
  ],
  [
    ["🕷️🧑", ["Spider-Man", "Ant-Man", "Batman", "Venom"], "Peter Parker est mordu par une araignée génétiquement modifiée."],
    ["👽📞🏠", ["E.T. l'extra-terrestre", "Men in Black", "Rencontres du troisième type", "Toy Story"], "Spielberg a tourné E.T. en 1982."],
    ["🧀🐀👨‍🍳", ["Ratatouille", "Stuart Little", "Le Chat potté", "Chicken Run"], "Le rat Rémy rêve de devenir chef dans un grand restaurant parisien."],
    ["🦈🏖️🎵", ["Les Dents de la mer", "Le Monde de Nemo", "Peur bleue", "Alerte à Malibu"], "La musique de John Williams, deux notes répétées, annonce le requin."],
    ["💍🌋🧝", ["Le Seigneur des anneaux", "Harry Potter", "Le Monde de Narnia", "Willow"], "L'anneau doit être détruit dans les flammes de la Montagne du Destin."],
    ["🏠🎈👴", ["Là-haut", "Toy Story", "Monstres et Cie", "Ça"], "Dans ce Pixar de 2009, un vieil homme fait voler sa maison avec des milliers de ballons."]
  ],
  [
    ["🍫🏭🎩", ["Charlie et la Chocolaterie", "Les Temps modernes", "Mary Poppins", "Le Magicien d'Oz"], "Le roman de Roald Dahl a été adapté au cinéma en 1971 puis par Tim Burton en 2005."],
    ["🐒🌍🗽", ["La Planète des singes", "King Kong", "Tarzan", "Le Livre de la jungle"], "Le film de 1968 est adapté du roman du Français Pierre Boulle."],
    ["⏰🔙🚗", ["Retour vers le futur", "Fast and Furious", "Interstellar", "Cars"], "La DeLorean voyage dans le temps à 88 miles à l'heure."],
    ["🚀🌽⏳", ["Interstellar", "Gravity", "Seul sur Mars", "Apollo 13"], "Le film de Christopher Nolan (2014) a bénéficié des conseils du physicien Kip Thorne."],
    ["🏹👧🔥", ["Hunger Games", "Rebelle", "Divergente", "Robin des bois"], "L'héroïne, Katniss, est surnommée « la fille du feu »."],
    ["🤡🎈🛶", ["Ça", "Joker", "Le Cirque", "Shining"], "Le clown Grippe-Sou est né sous la plume de Stephen King en 1986."]
  ]
],
geo: [
  [
    ["🗼🥖🧀", ["Paris", "Rome", "Londres", "Bruxelles"], "La tour Eiffel, construite pour l'Exposition universelle de 1889, devait être démontée."],
    ["🍕🛵🏛️", ["Rome", "Athènes", "Madrid", "Lisbonne"], "Rome est surnommée la Ville éternelle."],
    ["🗽🍎🚕", ["New York", "Los Angeles", "Chicago", "Washington"], "« Big Apple » est le surnom de New York depuis les années 1920."],
    ["🐨🦘🏄", ["Australie", "Nouvelle-Zélande", "Afrique du Sud", "Canada"], "Le koala et le kangourou ne vivent à l'état sauvage qu'en Australie."],
    ["🍁🏒🐻", ["Canada", "Suède", "Russie", "Finlande"], "Le hockey sur glace est le sport national d'hiver du Canada."],
    ["🌷🚲🧀", ["Pays-Bas", "Danemark", "Belgique", "Suisse"], "Les Pays-Bas comptent plus de vélos que d'habitants."]
  ],
  [
    ["🐫🔺☀️", ["Égypte", "Maroc", "Mexique", "Pérou"], "La pyramide de Khéops a été bâtie vers 2560 av. J.-C."],
    ["🎭🚤🌉", ["Venise", "Amsterdam", "Bruges", "Saint-Pétersbourg"], "Le carnaval de Venise est célèbre pour ses masques."],
    ["🍣🗻🌸", ["Japon", "Chine", "Corée du Sud", "Viêt Nam"], "La floraison des cerisiers, le hanami, est fêtée chaque printemps au Japon."],
    ["🐂💃🥘", ["Espagne", "Mexique", "Portugal", "Argentine"], "Le flamenco est inscrit au patrimoine immatériel de l'UNESCO depuis 2010."],
    ["🦙⛰️🏛️", ["Pérou", "Bolivie", "Chili", "Équateur"], "La cité inca du Machu Picchu a été construite au XVe siècle."],
    ["🍫⌚🏔️", ["Suisse", "Autriche", "Belgique", "Norvège"], "La Suisse est l'un des pays où l'on mange le plus de chocolat."]
  ],
  [
    ["🎻🍰🐎", ["Vienne", "Prague", "Budapest", "Salzbourg"], "La valse, la Sachertorte et l'École espagnole d'équitation font la réputation de Vienne."],
    ["☘️🍺🐑", ["Irlande", "Écosse", "Nouvelle-Zélande", "Islande"], "Le trèfle est le symbole de saint Patrick, patron de l'Irlande."],
    ["🌋🧊🐴", ["Islande", "Norvège", "Groenland", "Finlande"], "Depuis plus de 1 000 ans, aucun cheval étranger n'a le droit d'entrer en Islande."],
    ["🕌🐈🌉", ["Istanbul", "Le Caire", "Marrakech", "Dubaï"], "Les chats des rues d'Istanbul, des centaines de milliers, sont choyés par les habitants."],
    ["🐧❄️🔬", ["Antarctique", "Groenland", "Sibérie", "Alaska"], "Une trentaine de pays y entretiennent des bases scientifiques."],
    ["🏝️🗿", ["Île de Pâques", "Hawaï", "Tahiti", "Madagascar"], "L'île compte près de 900 statues appelées moaï."]
  ]
],
expr: [
  [
    ["😺🗣️", ["Avoir un chat dans la gorge", "Donner sa langue au chat", "Appeler un chat un chat", "Avoir d'autres chats à fouetter"], "Avoir la voix enrouée."],
    ["🌧️🪢", ["Il pleut des cordes", "Il pleut à verse", "Un temps de chien", "Après la pluie, le beau temps"], "Il pleut très fort. Les Anglais, eux, disent qu'il pleut des chats et des chiens."],
    ["🥚🧺", ["Mettre tous ses œufs dans le même panier", "Marcher sur des œufs", "Faire une omelette", "Plein comme un œuf"], "Ne pas tout risquer sur une seule chose."],
    ["💸🪟", ["Jeter l'argent par les fenêtres", "L'argent ne fait pas le bonheur", "Payer rubis sur l'ongle", "Avoir un oursin dans la poche"], "Dépenser sans compter."],
    ["🥕🔥", ["Les carottes sont cuites", "Raconter des salades", "Faire chou blanc", "Avoir la pêche"], "Tout est perdu. La phrase a aussi servi de message codé sur Radio Londres pendant la guerre."],
    ["🧠☁️", ["Avoir la tête dans les nuages", "Être sur un petit nuage", "Faire la pluie et le beau temps", "Tomber des nues"], "Être distrait, rêveur."]
  ],
  [
    ["💰🐻🏹", ["Vendre la peau de l'ours avant de l'avoir tué", "Avoir un caractère d'ours", "Tuer la poule aux œufs d'or", "Courir deux lièvres à la fois"], "Ne pas se réjouir d'un succès avant de l'avoir obtenu."],
    ["📍🐇", ["Poser un lapin", "Courir deux lièvres à la fois", "Rentrer dans sa coquille", "Ménager la chèvre et le chou"], "Ne pas venir à un rendez-vous."],
    ["🗣️🐄🇪🇸", ["Parler français comme une vache espagnole", "Faire des châteaux en Espagne", "Regarder passer les trains", "Une vache à lait"], "Mal parler le français. « Vache » serait peut-être une déformation de « Basque »."],
    ["💶👀", ["Coûter les yeux de la tête", "Avoir les yeux plus gros que le ventre", "Mon œil !", "Faire les yeux doux"], "Coûter très cher."],
    ["🍐✂️", ["Couper la poire en deux", "Garder une poire pour la soif", "Faire sa poire", "Tomber dans les pommes"], "Faire un compromis, partager équitablement."],
    ["🚜🐂", ["Mettre la charrue avant les bœufs", "Prendre le taureau par les cornes", "Un vent à décorner les bœufs", "Travailler comme un bœuf"], "Faire les choses dans le mauvais ordre."]
  ],
  [
    ["🐺🍽️", ["Avoir une faim de loup", "Se jeter dans la gueule du loup", "Quand on parle du loup", "Le loup dans la bergerie"], "Avoir très faim."],
    ["🙅🍞", ["Ça ne mange pas de pain", "Avoir du pain sur la planche", "Être bon comme du bon pain", "Pour une bouchée de pain"], "Cela ne coûte rien d'essayer."],
    ["🤐🐟", ["Être muet comme une carpe", "Être comme un poisson dans l'eau", "Noyer le poisson", "Avoir des yeux de merlan frit"], "Ne rien dire du tout."],
    ["🪱👃", ["Tirer les vers du nez", "Mener par le bout du nez", "Avoir le nez creux", "Ça lui pend au nez"], "Faire parler quelqu'un, lui soutirer des informations."],
    ["😞🪳", ["Avoir le cafard", "Avoir des fourmis dans les jambes", "Avoir une araignée au plafond", "Faire la mouche du coche"], "Être triste, déprimé. Baudelaire a popularisé l'expression."],
    ["😵🍎", ["Tomber dans les pommes", "Haut comme trois pommes", "La pomme de discorde", "Croquer la pomme"], "S'évanouir. Peut-être une déformation de « tomber en pâmoison »."]
  ]
]
};

/* Qui a dit ça ? : [phrase, [auteur, leurre, leurre, leurre], le saviez-vous] */
const QUOTES = {
hist: [
  [
    ["Veni, vidi, vici.", ["Jules César", "Napoléon", "Alexandre le Grand", "Charlemagne"], "César annonce ainsi au Sénat sa victoire éclair de Zéla, en 47 av. J.-C."],
    ["L'État, c'est moi.", ["Louis XIV", "Napoléon", "Louis XVI", "François Ier"], "Cette phrase, attribuée à Louis XIV, n'a sans doute jamais été prononcée."],
    ["Je vous ai compris !", ["Charles de Gaulle", "François Mitterrand", "Georges Pompidou", "Jacques Chirac"], "De Gaulle la lance à Alger le 4 juin 1958."],
    ["Paris vaut bien une messe.", ["Henri IV", "Louis XIV", "François Ier", "Charles IX"], "Attribuée à Henri IV, protestant qui se convertit au catholicisme en 1593 pour régner."]
  ],
  [
    ["Impossible n'est pas français.", ["Napoléon", "Charles de Gaulle", "Louis XIV", "Georges Clemenceau"], "Napoléon l'écrit en 1813 dans une lettre au général Lemarois."],
    ["Ich bin ein Berliner.", ["John F. Kennedy", "Ronald Reagan", "Willy Brandt", "Winston Churchill"], "Kennedy la prononce à Berlin-Ouest le 26 juin 1963."],
    ["Je n'ai à offrir que du sang, du labeur, des larmes et de la sueur.", ["Winston Churchill", "Charles de Gaulle", "Franklin Roosevelt", "Georges Clemenceau"], "Churchill prononce ce discours le 13 mai 1940, trois jours après être devenu Premier ministre."],
    ["C'est un petit pas pour l'homme, un bond de géant pour l'humanité.", ["Neil Armstrong", "Buzz Aldrin", "Youri Gagarine", "John Glenn"], "Armstrong la prononce le 21 juillet 1969, en posant le pied sur la Lune."]
  ],
  [
    ["Qu'ils mangent de la brioche !", ["Marie-Antoinette", "Catherine de Médicis", "Joséphine de Beauharnais", "Madame de Pompadour"], "Rousseau la cite vers 1765 en l'attribuant à « une grande princesse » : Marie-Antoinette n'avait alors que 10 ans."],
    ["Soldats, du haut de ces pyramides, quarante siècles vous contemplent.", ["Napoléon Bonaparte", "Jules César", "Alexandre le Grand", "Ramsès II"], "Bonaparte l'aurait lancée avant la bataille des Pyramides, en 1798."],
    ["La France a perdu une bataille ! Mais la France n'a pas perdu la guerre !", ["Charles de Gaulle", "Philippe Pétain", "Paul Reynaud", "Jean Moulin"], "Cette phrase figure sur une affiche placardée à Londres en août 1940."],
    ["Il faut savoir terminer une grève.", ["Maurice Thorez", "Léon Blum", "Jean Jaurès", "Georges Marchais"], "Le dirigeant communiste la prononce le 11 juin 1936, pendant les grèves du Front populaire."]
  ]
],
geopo: [
  [
    ["I have a dream.", ["Martin Luther King", "Barack Obama", "Malcolm X", "Nelson Mandela"], "Discours prononcé à Washington le 28 août 1963, devant 250 000 personnes."],
    ["Yes we can.", ["Barack Obama", "Bill Clinton", "Joe Biden", "John F. Kennedy"], "C'était le slogan de sa campagne présidentielle de 2008."],
    ["Vive le Québec libre !", ["Charles de Gaulle", "François Mitterrand", "Pierre Trudeau", "Valéry Giscard d'Estaing"], "Lancée du balcon de l'hôtel de ville de Montréal en juillet 1967, elle provoque une crise diplomatique."],
    ["Un rideau de fer s'est abattu sur le continent.", ["Winston Churchill", "Harry Truman", "Joseph Staline", "Charles de Gaulle"], "Churchill popularise l'image à Fulton, aux États-Unis, en 1946."]
  ],
  [
    ["Monsieur Gorbatchev, abattez ce mur !", ["Ronald Reagan", "John F. Kennedy", "George Bush", "Margaret Thatcher"], "Reagan prononce ces mots devant la porte de Brandebourg, à Berlin, le 12 juin 1987."],
    ["L'Europe ne se fera pas d'un coup, ni dans une construction d'ensemble.", ["Robert Schuman", "Jean Monnet", "Konrad Adenauer", "Jacques Delors"], "Extrait de la déclaration du 9 mai 1950, date devenue la Journée de l'Europe."],
    ["Ce n'est pas la fin. Ce n'est même pas le commencement de la fin.", ["Winston Churchill", "Franklin Roosevelt", "Charles de Gaulle", "Dwight Eisenhower"], "Churchill la prononce en novembre 1942, après la victoire d'El-Alamein."],
    ["Il n'y a pas d'alternative.", ["Margaret Thatcher", "Tony Blair", "Ronald Reagan", "Angela Merkel"], "Ce slogan, abrégé TINA en anglais, résume sa défense de l'économie de marché dans les années 1980."]
  ],
  [
    ["Le pouvoir est au bout du fusil.", ["Mao Zedong", "Lénine", "Fidel Castro", "Hô Chi Minh"], "Mao l'écrit en 1927. La phrase sera reprise dans le Petit Livre rouge."],
    ["Nous y arriverons.", ["Angela Merkel", "Helmut Kohl", "Gerhard Schröder", "Olaf Scholz"], "« Wir schaffen das » : Merkel le dit en août 2015, face à l'arrivée de centaines de milliers de réfugiés."],
    ["La guerre est une chose trop grave pour être confiée à des militaires.", ["Georges Clemenceau", "Napoléon", "Charles de Gaulle", "Talleyrand"], "La formule est attribuée à Clemenceau, président du Conseil pendant la Grande Guerre."],
    ["Vers l'Orient compliqué, je volais avec des idées simples.", ["Charles de Gaulle", "Lawrence d'Arabie", "Antoine de Saint-Exupéry", "Napoléon"], "De Gaulle l'écrit dans ses Mémoires de guerre, à propos de son départ pour le Levant en 1941."]
  ]
],
arts: [
  [
    ["Être ou ne pas être, telle est la question.", ["William Shakespeare", "Molière", "Victor Hugo", "Jean Racine"], "Hamlet prononce ces mots au troisième acte de la pièce."],
    ["Rien ne sert de courir ; il faut partir à point.", ["Jean de La Fontaine", "Molière", "Charles Perrault", "Voltaire"], "C'est la morale du Lièvre et la Tortue (1668)."],
    ["Le cœur a ses raisons que la raison ne connaît point.", ["Blaise Pascal", "René Descartes", "Voltaire", "Jean-Jacques Rousseau"], "Extrait des Pensées, publiées après la mort de Pascal, en 1670."],
    ["Va, je ne te hais point.", ["Pierre Corneille", "Jean Racine", "Molière", "Victor Hugo"], "Chimène le dit à Rodrigue dans Le Cid (1637). C'est une litote célèbre."]
  ],
  [
    ["Il faut cultiver notre jardin.", ["Voltaire", "Jean-Jacques Rousseau", "Montesquieu", "Denis Diderot"], "C'est la dernière phrase de Candide (1759)."],
    ["Que diable allait-il faire dans cette galère ?", ["Molière", "Jean Racine", "Beaumarchais", "Marivaux"], "Réplique de Géronte dans Les Fourberies de Scapin (1671)."],
    ["Mignonne, allons voir si la rose…", ["Pierre de Ronsard", "Joachim du Bellay", "Clément Marot", "François Villon"], "Ce poème de 1545 invite à profiter de la jeunesse."],
    ["Heureux qui, comme Ulysse, a fait un beau voyage…", ["Joachim du Bellay", "Pierre de Ronsard", "Homère", "Alphonse de Lamartine"], "Premier vers d'un sonnet des Regrets (1558), écrit à Rome."]
  ],
  [
    ["Familles, je vous hais !", ["André Gide", "Émile Zola", "Marcel Proust", "Jean Cocteau"], "Cette phrase vient des Nourritures terrestres (1897)."],
    ["Longtemps, je me suis couché de bonne heure.", ["Marcel Proust", "Gustave Flaubert", "Honoré de Balzac", "Émile Zola"], "C'est la première phrase de Du côté de chez Swann (1913)."],
    ["Je est un autre.", ["Arthur Rimbaud", "Paul Verlaine", "Charles Baudelaire", "Guillaume Apollinaire"], "Rimbaud l'écrit à 16 ans, en 1871, dans la « lettre du voyant »."],
    ["Ô temps, suspends ton vol !", ["Alphonse de Lamartine", "Victor Hugo", "Alfred de Musset", "Alfred de Vigny"], "Vers du poème Le Lac (1820)."]
  ]
],
sciences: [
  [
    ["Je pense, donc je suis.", ["René Descartes", "Blaise Pascal", "Voltaire", "Platon"], "La formule vient du Discours de la méthode (1637)."],
    ["Eurêka !", ["Archimède", "Pythagore", "Euclide", "Aristote"], "Selon la légende, il s'écrie « J'ai trouvé ! » dans son bain, en découvrant la poussée qui porte son nom."],
    ["Rien ne se perd, rien ne se crée, tout se transforme.", ["Antoine Lavoisier", "Louis Pasteur", "Isaac Newton", "Marie Curie"], "La formule résume sa loi de conservation de la masse, sans être une citation exacte."],
    ["Et pourtant, elle tourne.", ["Galilée", "Copernic", "Johannes Kepler", "Giordano Bruno"], "Galilée l'aurait murmurée après son procès de 1633, mais rien ne prouve qu'il l'ait dite."]
  ],
  [
    ["Donnez-moi un point d'appui et je soulèverai le monde.", ["Archimède", "Euclide", "Thalès", "Ératosthène"], "Archimède illustre ainsi le principe du levier."],
    ["Le hasard ne favorise que les esprits préparés.", ["Louis Pasteur", "Claude Bernard", "Marie Curie", "Pierre Curie"], "Pasteur le dit lors d'une conférence à Lille, en 1854."],
    ["Si j'ai vu plus loin, c'est en montant sur les épaules de géants.", ["Isaac Newton", "Galilée", "Albert Einstein", "Gottfried Leibniz"], "Newton l'écrit en 1676 à Robert Hooke. L'image remonte au Moyen Âge."],
    ["Dans la vie, rien n'est à craindre, tout est à comprendre.", ["Marie Curie", "Albert Einstein", "Louis Pasteur", "Rosalind Franklin"], "La phrase est attribuée à Marie Curie, deux fois prix Nobel."]
  ],
  [
    ["Dieu ne joue pas aux dés.", ["Albert Einstein", "Niels Bohr", "Max Planck", "Werner Heisenberg"], "Einstein exprime ainsi, dans une lettre à Max Born en 1926, son refus du hasard en physique quantique."],
    ["La nature a horreur du vide.", ["Aristote", "René Descartes", "Blaise Pascal", "Evangelista Torricelli"], "Héritée d'Aristote, l'idée est démentie au XVIIe siècle par les expériences de Torricelli et de Pascal."],
    ["Mesurer ce qui est mesurable, et rendre mesurable ce qui ne l'est pas.", ["Galilée", "Isaac Newton", "Johannes Kepler", "René Descartes"], "Cette devise de la science expérimentale est attribuée à Galilée."],
    ["Le silence éternel de ces espaces infinis m'effraie.", ["Blaise Pascal", "René Descartes", "Galilée", "Montaigne"], "Extrait des Pensées de Pascal, mathématicien et physicien autant que philosophe."]
  ]
]
};

/* Relier : paires [gauche, droite], 10 par thème et difficulté (deux grilles de 5) */
const PAIRS = {
hist: { h: ["Événement", "Date"], d: [
  [["Prise de la Bastille", "1789"], ["Chute du mur de Berlin", "1989"], ["Christophe Colomb atteint l'Amérique", "1492"], ["Armistice de la Grande Guerre", "1918"], ["Sacre de Charlemagne", "800"],
   ["Débarquement de Normandie", "1944"], ["Premier pas sur la Lune", "1969"], ["Bataille de Waterloo", "1815"], ["Attentats du 11 Septembre", "2001"], ["Bataille de Marignan", "1515"]],
  [["Gandhi", "Inde"], ["Simón Bolívar", "Venezuela"], ["Garibaldi", "Italie"], ["Atatürk", "Turquie"], ["Bismarck", "Allemagne"],
   ["Mao Zedong", "Chine"], ["Lénine", "Russie"], ["Hô Chi Minh", "Viêt Nam"], ["Nasser", "Égypte"], ["Patrice Lumumba", "Congo"]],
  [["Traité de Verdun", "843"], ["Traités de Westphalie", "1648"], ["Traité d'Utrecht", "1713"], ["Congrès de Vienne", "1815"], ["Traité de Versailles", "1919"],
   ["Traité de Rome", "1957"], ["Traité de Maastricht", "1992"], ["Édit de Nantes", "1598"], ["Traité de Tordesillas", "1494"], ["Accords d'Évian", "1962"]]
], hh: [["Événement", "Date"], ["Personnage", "Pays"], ["Traité", "Date"]] },
arts: { hh: [["Œuvre", "Artiste"], ["Œuvre", "Artiste"], ["Œuvre", "Artiste"]], d: [
  [["La Joconde", "Léonard de Vinci"], ["Les Misérables", "Victor Hugo"], ["Les Tournesols", "Van Gogh"], ["Guernica", "Picasso"], ["Le Penseur", "Rodin"],
   ["Roméo et Juliette", "Shakespeare"], ["Le Petit Prince", "Saint-Exupéry"], ["Les Fables", "La Fontaine"], ["Le Cri", "Edvard Munch"], ["Les Nymphéas", "Claude Monet"]],
  [["La Naissance de Vénus", "Botticelli"], ["Le Radeau de la Méduse", "Géricault"], ["La Liberté guidant le peuple", "Delacroix"], ["Germinal", "Zola"], ["Madame Bovary", "Flaubert"],
   ["Le Rouge et le Noir", "Stendhal"], ["La Persistance de la mémoire", "Dalí"], ["La Ronde de nuit", "Rembrandt"], ["Les Trois Mousquetaires", "Alexandre Dumas"], ["Don Quichotte", "Cervantès"]],
  [["Les Ménines", "Velázquez"], ["Le Jardin des délices", "Jérôme Bosch"], ["Le Déjeuner sur l'herbe", "Manet"], ["Les Glaneuses", "Millet"], ["La Grande Vague de Kanagawa", "Hokusai"],
   ["Les Fleurs du mal", "Baudelaire"], ["L'Étranger", "Camus"], ["Bal du moulin de la Galette", "Renoir"], ["La Divine Comédie", "Dante"], ["Faust", "Goethe"]]
] },
sciences: { hh: [["Découverte", "Savant"], ["Découverte", "Savant"], ["Découverte", "Savant"]], d: [
  [["La gravitation", "Newton"], ["La relativité", "Einstein"], ["Le radium", "Marie Curie"], ["Le vaccin contre la rage", "Pasteur"], ["L'évolution des espèces", "Darwin"],
   ["La pénicilline", "Fleming"], ["L'ampoule électrique", "Edison"], ["Le téléphone", "Graham Bell"], ["Les lunes de Jupiter", "Galilée"], ["L'imprimerie", "Gutenberg"]],
  [["Le tableau périodique", "Mendeleïev"], ["Les lois de l'hérédité", "Mendel"], ["L'héliocentrisme", "Copernic"], ["Les rayons X", "Röntgen"], ["La dynamite", "Alfred Nobel"],
   ["Le courant alternatif", "Tesla"], ["La conservation de la masse", "Lavoisier"], ["La pile électrique", "Volta"], ["Le cinématographe", "Frères Lumière"], ["La photographie", "Niépce"]],
  [["La double hélice de l'ADN", "Watson et Crick"], ["La machine universelle", "Turing"], ["Les orbites elliptiques des planètes", "Kepler"], ["Les équations de l'électromagnétisme", "Maxwell"], ["Les quanta d'énergie", "Max Planck"],
   ["La fission nucléaire", "Otto Hahn"], ["Les micro-organismes au microscope", "Van Leeuwenhoek"], ["Le vaccin contre la variole", "Edward Jenner"], ["Les logarithmes", "John Napier"], ["Le thermomètre à mercure", "Fahrenheit"]]
] },
cine: { hh: [["Film", "Réalisateur"], ["Film", "Réalisateur"], ["Film", "Réalisateur"]], d: [
  [["Titanic", "James Cameron"], ["E.T.", "Steven Spielberg"], ["Pulp Fiction", "Quentin Tarantino"], ["Le Voyage de Chihiro", "Hayao Miyazaki"], ["Intouchables", "Nakache et Toledano"],
   ["Le Parrain", "Francis Ford Coppola"], ["Psychose", "Alfred Hitchcock"], ["Star Wars (1977)", "George Lucas"], ["Le Cinquième Élément", "Luc Besson"], ["Inception", "Christopher Nolan"]],
  [["Taxi Driver", "Martin Scorsese"], ["Amélie Poulain", "Jean-Pierre Jeunet"], ["Parasite", "Bong Joon-ho"], ["Les Temps modernes", "Charlie Chaplin"], ["2001, l'Odyssée de l'espace", "Stanley Kubrick"],
   ["La Haine", "Mathieu Kassovitz"], ["Alien", "Ridley Scott"], ["Le Seigneur des anneaux", "Peter Jackson"], ["Les Quatre Cents Coups", "François Truffaut"], ["Barbie", "Greta Gerwig"]],
  [["La dolce vita", "Federico Fellini"], ["Les Sept Samouraïs", "Akira Kurosawa"], ["Le Bon, la Brute et le Truand", "Sergio Leone"], ["Citizen Kane", "Orson Welles"], ["Cléo de 5 à 7", "Agnès Varda"],
   ["À bout de souffle", "Jean-Luc Godard"], ["In the Mood for Love", "Wong Kar-wai"], ["Tout sur ma mère", "Pedro Almodóvar"], ["La Grande Illusion", "Jean Renoir"], ["Metropolis", "Fritz Lang"]]
] },
sport: { hh: [["Champion", "Sport"], ["Champion", "Sport"], ["Champion", "Sport"]], d: [
  [["Zinédine Zidane", "Football"], ["Roger Federer", "Tennis"], ["Usain Bolt", "Athlétisme"], ["Michael Jordan", "Basket-ball"], ["Teddy Riner", "Judo"],
   ["Michael Phelps", "Natation"], ["Lewis Hamilton", "Formule 1"], ["Antoine Dupont", "Rugby"], ["Tiger Woods", "Golf"], ["Simone Biles", "Gymnastique"]],
  [["Martin Fourcade", "Biathlon"], ["Tony Hawk", "Skateboard"], ["Mike Tyson", "Boxe"], ["Sébastien Loeb", "Rallye"], ["Laure Manaudou", "Natation"],
   ["Nikola Karabatić", "Handball"], ["Renaud Lavillenie", "Saut à la perche"], ["Kelly Slater", "Surf"], ["Bernard Hinault", "Cyclisme"], ["Shaun White", "Snowboard"]],
  [["Garry Kasparov", "Échecs"], ["Wayne Gretzky", "Hockey sur glace"], ["Sachin Tendulkar", "Cricket"], ["Jonah Lomu", "Rugby"], ["Valentino Rossi", "Moto"],
   ["Ronnie O'Sullivan", "Snooker"], ["Marie-José Pérec", "Athlétisme"], ["Babe Ruth", "Baseball"], ["Alberto Tomba", "Ski alpin"], ["Kim Yu-na", "Patinage artistique"]]
] }
};

/* Sommets (m) et fleuves (km) pour Plus ou moins et Classement */
const PEAKS = [["L'Everest", 8849], ["Le K2", 8611], ["Le Kangchenjunga", 8586], ["Le Lhotse", 8516], ["Le Makalu", 8485], ["L'Annapurna", 8091], ["Le Nanga Parbat", 8126],
  ["L'Aconcagua", 6961], ["L'Ojos del Salado", 6893], ["Le Huascarán", 6768], ["Le Chimborazo", 6263], ["Le Denali", 6190], ["Le mont Logan", 5959], ["Le Kilimandjaro", 5895],
  ["Le pic d'Orizaba", 5636], ["L'Elbrouz", 5642], ["Le Damavand", 5609], ["Le mont Kenya", 5199], ["Le mont Ararat", 5137], ["Le mont Vinson", 4892], ["Le puncak Jaya", 4884],
  ["Le mont Blanc", 4806], ["Le mont Rose", 4634], ["Le Cervin", 4478], ["Le mont Whitney", 4421], ["Le mont Kinabalu", 4095], ["Le Toubkal", 4167], ["La Barre des Écrins", 4102],
  ["Le mont Cameroun", 4040], ["Le Grossglockner", 3798], ["Le mont Fuji", 3776], ["Le mont Cook", 3724], ["Le Teide", 3715], ["Le pic d'Aneto", 3404], ["L'Olympe", 2918],
  ["La Zugspitze", 2962], ["Le mont Sinaï", 2285], ["Le mont Kosciuszko", 2228], ["Le mont Ventoux", 1910], ["Le puy de Dôme", 1465], ["Le Ben Nevis", 1345], ["Le Vésuve", 1281]];
const RIVERS = [["Le Nil", 6650], ["L'Amazone", 6400], ["Le Yangtsé", 6300], ["Le Mississippi-Missouri", 6275], ["L'Ienisseï", 5539], ["Le fleuve Jaune", 5464], ["L'Ob", 5410],
  ["Le Paraná", 4880], ["Le Congo", 4700], ["L'Amour", 4444], ["La Lena", 4400], ["Le Mékong", 4350], ["Le Mackenzie", 4241], ["Le Niger", 4180], ["La Volga", 3530],
  ["Le Yukon", 3185], ["L'Indus", 3180], ["Le Rio Grande", 3051], ["Le Brahmapoutre", 2900], ["Le Danube", 2850], ["L'Euphrate", 2800], ["Le Zambèze", 2574], ["Le Gange", 2525],
  ["L'Oural", 2428], ["Le Colorado", 2330], ["Le Dniepr", 2201], ["L'Orénoque", 2140], ["Le Don", 1870], ["Le Tigre", 1850], ["Le Limpopo", 1750], ["Le Rhin", 1233],
  ["L'Elbe", 1094], ["Le Sénégal", 1086], ["La Vistule", 1047], ["Le Tage", 1007], ["La Loire", 1006], ["La Meuse", 925], ["L'Èbre", 910], ["Le Douro", 897], ["L'Oder", 854],
  ["Le Rhône", 812], ["La Seine", 777], ["Le Pô", 652], ["La Garonne", 529], ["La Tamise", 346], ["Le Jourdain", 251]];

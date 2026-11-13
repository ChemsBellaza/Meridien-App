/* ============ Réserves de questions agrandies (v28) : Quiz éclair / Méga-quiz (+300), Qui a dit ça ? (+72), Intrus (+72), Sigles (+54) ============
   Les questions s'ajoutent aux listes existantes (même format) ; aucun doublon exact n'est ajouté. */
(function () {
  const Q = (p, ok, a, b, c, fact) => [p, [ok, a, b, c], fact];           // quiz : question, 4 réponses (la bonne en premier), « le saviez-vous »
  const S = (sig, ok, a, b, c, fact) => [sig, ok, a, b, c, fact];         // sigle : sigle, bonne signification, 3 fausses, fait
  const I = (intrus, a, b, c, fact) => [intrus, a, b, c, fact];           // intrus : l'intrus en premier
  const QUIZ = {
    hist: [
      [
        Q("En quelle année la Révolution française commence-t-elle ?", "1789", "1769", "1799", "1815", "La prise de la Bastille a lieu le 14 juillet 1789."),
        Q("Quel roi de France est surnommé le Roi-Soleil ?", "Louis XIV", "Louis XVI", "Henri IV", "Charles X", "Il règne pendant 72 ans, de 1643 à 1715."),
        Q("Quelle reine d'Égypte s'est alliée à Jules César puis à Marc Antoine ?", "Cléopâtre", "Néfertiti", "Hatchepsout", "Isis", "Elle règne sur l'Égypte de 51 à 30 av. J.-C."),
        Q("Qui a atteint l'Amérique en 1492 ?", "Christophe Colomb", "Vasco de Gama", "Magellan", "Marco Polo", "Il croyait avoir trouvé une route vers les Indes."),
        Q("Quelle guerre oppose les Alliés à l'Allemagne nazie de 1939 à 1945 ?", "La Seconde Guerre mondiale", "La guerre de Cent Ans", "La guerre froide", "La Première Guerre mondiale", "Elle s'achève en Europe le 8 mai 1945."),
        Q("Quelle héroïne française est brûlée à Rouen en 1431 ?", "Jeanne d'Arc", "Aliénor d'Aquitaine", "Catherine de Médicis", "Anne de Bretagne", "Elle est canonisée en 1920."),
        Q("Quel mur divisait Berlin jusqu'en 1989 ?", "Le mur de Berlin", "Le mur d'Hadrien", "La Grande Muraille", "La ligne Maginot", "Il est tombé le 9 novembre 1989."),
        Q("Quel peuple a construit les pyramides de Gizeh ?", "Les Égyptiens", "Les Romains", "Les Grecs", "Les Mayas", "La pyramide de Khéops date d'environ 2560 av. J.-C."),
        Q("Quel général devient empereur des Français en 1804 ?", "Napoléon Bonaparte", "Charles de Gaulle", "Lafayette", "Louis-Napoléon", "Il est sacré à Notre-Dame le 2 décembre 1804."),
        Q("Quel pays a offert la statue de la Liberté aux États-Unis ?", "La France", "L'Angleterre", "L'Espagne", "L'Italie", "Elle est inaugurée à New York en 1886.")
      ],
      [
        Q("Quelle bataille de 1815 marque la défaite finale de Napoléon ?", "Waterloo", "Austerlitz", "Trafalgar", "Wagram", "Elle a lieu en Belgique, le 18 juin 1815."),
        Q("Quel traité de 1919 impose ses conditions à l'Allemagne après la Première Guerre mondiale ?", "Le traité de Versailles", "Le traité de Rome", "Le traité de Westphalie", "Le traité de Vienne", "Il est signé dans la galerie des Glaces."),
        Q("Quel roi de France a fait du château de Versailles la résidence de la cour ?", "Louis XIV", "Louis XIII", "Henri IV", "François Ier", "La cour s'y installe en 1682."),
        Q("Qui a lancé l'Appel du 18 juin 1940 depuis Londres ?", "Charles de Gaulle", "Philippe Pétain", "Winston Churchill", "Georges Clemenceau", "Il appelle à poursuivre le combat contre l'Allemagne."),
        Q("Quel empire a été fondé par Gengis Khan ?", "L'Empire mongol", "L'Empire ottoman", "L'Empire perse", "L'Empire byzantin", "Il fut le plus grand empire d'un seul tenant de l'histoire."),
        Q("Quelle cité romaine fut ensevelie par l'éruption du Vésuve en 79 ?", "Pompéi", "Carthage", "Tarente", "Syracuse", "Les cendres l'ont conservée presque intacte."),
        Q("Quel ministre de Louis XIV a développé les manufactures du royaume ?", "Colbert", "Richelieu", "Mazarin", "Turgot", "Il dirige les Finances à partir de 1665."),
        Q("Quel dirigeant prend le pouvoir en Russie après la révolution d'Octobre 1917 ?", "Lénine", "Staline", "Trotski", "Nicolas II", "Il dirige le premier gouvernement bolchevique."),
        Q("Quelle dynastie chinoise a fait construire l'essentiel de la Grande Muraille visible aujourd'hui ?", "Les Ming", "Les Han", "Les Tang", "Les Qing", "Les travaux s'étendent du XIVe au XVIIe siècle."),
        Q("Quel pays a connu le régime de l'apartheid ?", "L'Afrique du Sud", "Le Brésil", "L'Inde", "Le Kenya", "Il a été aboli au début des années 1990.")
      ],
      [
        Q("Quel roi franc est baptisé vers 496, selon la tradition à Reims ?", "Clovis", "Charlemagne", "Pépin le Bref", "Dagobert", "Il est le fondateur du royaume des Francs."),
        Q("Quel édit de 1598 met fin aux guerres de Religion en France ?", "L'édit de Nantes", "L'édit de Fontainebleau", "L'édit de Villers-Cotterêts", "L'édit de Milan", "Henri IV l'accorde aux protestants ; Louis XIV le révoque en 1685."),
        Q("Quelle bataille de 732 arrête l'avancée musulmane en Gaule ?", "Poitiers", "Bouvines", "Tolbiac", "Marignan", "Charles Martel y est vainqueur."),
        Q("Quel empereur romain divise l'Empire entre ses deux fils à sa mort en 395 ?", "Théodose Ier", "Constantin", "Dioclétien", "Auguste", "Il sépare l'Empire d'Occident et l'Empire d'Orient."),
        Q("Quelle conférence de février 1945 réunit Churchill, Roosevelt et Staline ?", "Yalta", "Genève", "Locarno", "Bretton Woods", "Elle prépare l'après-guerre en Europe."),
        Q("Quel roi de France est guillotiné en janvier 1793 ?", "Louis XVI", "Louis XV", "Charles X", "Louis XVIII", "Il est condamné par la Convention."),
        Q("Quelle bataille de 1066 donne le trône d'Angleterre à Guillaume le Conquérant ?", "Hastings", "Azincourt", "Crécy", "Bouvines", "Elle est représentée sur la tapisserie de Bayeux."),
        Q("Quel pharaon a vu sa tombe découverte quasi intacte par Howard Carter en 1922 ?", "Toutânkhamon", "Ramsès II", "Khéops", "Akhenaton", "Elle se trouve dans la Vallée des Rois."),
        Q("Quelle ville a accueilli les papes au XIVe siècle, pendant la « captivité » ?", "Avignon", "Rome", "Florence", "Lyon", "Le palais des Papes y fut construit."),
        Q("Quels traités de 1648 ont mis fin à la guerre de Trente Ans ?", "Les traités de Westphalie", "Le traité de Tordesillas", "Le traité d'Utrecht", "Le traité de Verdun", "Ils posent les bases de l'Europe des États souverains.")
      ]
    ],
    geopo: [
      [
        Q("Combien d'États l'Union européenne compte-t-elle depuis le Brexit ?", "27", "25", "28", "30", "Le Royaume-Uni l'a quittée le 31 janvier 2020."),
        Q("Dans quelle ville se trouve le siège de l'ONU ?", "New York", "Genève", "Paris", "Bruxelles", "Elle a été fondée en 1945."),
        Q("Quel est le pays le plus peuplé du monde depuis 2023 ?", "L'Inde", "La Chine", "Les États-Unis", "L'Indonésie", "Elle a dépassé la Chine en 2023."),
        Q("Quel est le pays le plus étendu du monde ?", "La Russie", "Le Canada", "La Chine", "Les États-Unis", "Il couvre plus de 17 millions de km²."),
        Q("Quelle est la capitale des États-Unis ?", "Washington D.C.", "New York", "Los Angeles", "Chicago", "Elle porte le nom du premier président."),
        Q("Quel général a fondé la Ve République en 1958 ?", "Charles de Gaulle", "François Mitterrand", "Georges Pompidou", "Valéry Giscard d'Estaing", "La Constitution est adoptée par référendum."),
        Q("Quelle alliance militaire née en 1949 réunit des pays d'Amérique du Nord et d'Europe ?", "L'OTAN", "L'ONU", "L'OMC", "L'UNESCO", "Elle compte plus de 30 membres."),
        Q("Quel continent compte le plus de pays ?", "L'Afrique", "L'Asie", "L'Europe", "L'Amérique", "Elle en compte 54."),
        Q("Quelle ville est la capitale de la Chine ?", "Pékin", "Shanghai", "Hong Kong", "Canton", "Shanghai est la plus grande ville, mais pas la capitale."),
        Q("Quel est le plus petit État du monde ?", "Le Vatican", "Monaco", "Saint-Marin", "Le Liechtenstein", "Il couvre environ 0,44 km².")
      ],
      [
        Q("Quel pays a quitté l'Union européenne en 2020 ?", "Le Royaume-Uni", "La Suisse", "La Norvège", "La Turquie", "Le vote du Brexit date de 2016."),
        Q("Quelle organisation internationale basée à Genève s'occupe de santé ?", "L'OMS", "L'UNESCO", "L'OTAN", "Le FMI", "Elle a été créée en 1948."),
        Q("Combien de membres permanents compte le Conseil de sécurité de l'ONU ?", "5", "3", "7", "10", "États-Unis, Russie, Chine, France et Royaume-Uni."),
        Q("Qui est secrétaire général de l'ONU depuis 2017 ?", "António Guterres", "Ban Ki-moon", "Kofi Annan", "Boutros Boutros-Ghali", "Il est portugais."),
        Q("Dans quelle ville siège la Commission européenne ?", "Bruxelles", "Strasbourg", "Luxembourg", "La Haye", "Elle propose les lois européennes."),
        Q("Quelle est la capitale de la Corée du Sud ?", "Séoul", "Busan", "Pyongyang", "Tokyo", "Pyongyang est la capitale de la Corée du Nord."),
        Q("Quel détroit sépare l'Europe de l'Afrique à l'entrée de la Méditerranée ?", "Le détroit de Gibraltar", "Le Bosphore", "La Manche", "Les Dardanelles", "Il mesure environ 14 km de large."),
        Q("Quel pays africain est membre des BRICS depuis l'origine du groupe élargi en 2010 ?", "L'Afrique du Sud", "Le Nigeria", "Le Kenya", "Le Maroc", "Le S de BRICS correspond à South Africa."),
        Q("Quelle est la capitale du Brésil ?", "Brasilia", "Rio de Janeiro", "São Paulo", "Salvador", "Elle a été inaugurée en 1960."),
        Q("Quelle est la langue la plus parlée comme langue maternelle dans le monde ?", "Le mandarin", "L'anglais", "L'espagnol", "L'hindi", "Elle compte plus de 900 millions de locuteurs natifs.")
      ],
      [
        Q("Quel traité de 1992 a créé l'Union européenne ?", "Le traité de Maastricht", "Le traité de Rome", "Le traité de Lisbonne", "Le traité de Nice", "Il est entré en vigueur en 1993."),
        Q("Combien de pays ont fondé la CECA en 1951 ?", "6", "4", "9", "12", "Ce fut le premier pas vers l'Union européenne."),
        Q("Quel pays n'est pas membre de l'Union européenne ?", "La Norvège", "La Suède", "La Finlande", "Le Danemark", "Elle fait partie de l'espace Schengen sans être dans l'UE."),
        Q("Comment s'appelle le parlement allemand ?", "Le Bundestag", "Le Sénat", "La Douma", "Le Storting", "Il siège au Reichstag, à Berlin."),
        Q("Quel pays était gouverné par un shah avant la révolution de 1979 ?", "L'Iran", "L'Irak", "L'Afghanistan", "La Turquie", "Le dernier shah est Mohammad Reza Pahlavi."),
        Q("Quelle organisation regroupe des pays producteurs de pétrole, fondée en 1960 ?", "L'OPEP", "L'OMC", "L'OCDE", "L'ASEAN", "Elle siège à Vienne."),
        Q("Quelle est la capitale de l'Australie ?", "Canberra", "Sydney", "Melbourne", "Perth", "Sydney est la plus grande ville."),
        Q("Quelle est la capitale du Canada ?", "Ottawa", "Toronto", "Montréal", "Vancouver", "Elle est située en Ontario."),
        Q("Quel État est entièrement enclavé en Italie, en plus du Vatican ?", "Saint-Marin", "Monaco", "Andorre", "Le Liechtenstein", "C'est l'une des plus anciennes républiques du monde."),
        Q("Quelle est la monnaie du Japon ?", "Le yen", "Le won", "Le yuan", "La roupie", "Elle est utilisée depuis 1871.")
      ]
    ],
    geo: [
      [
        Q("Quel est le plus long fleuve de France ?", "La Loire", "La Seine", "Le Rhône", "La Garonne", "Elle mesure environ 1 000 km."),
        Q("Quel est le plus haut sommet des Alpes ?", "Le mont Blanc", "Le Cervin", "L'Eiger", "Le mont Rose", "Il culmine à environ 4 806 m."),
        Q("Quel océan borde la côte ouest de la France ?", "L'Atlantique", "Le Pacifique", "L'océan Indien", "L'Arctique", "Il borde aussi l'Espagne et le Portugal."),
        Q("Quelle est la capitale de l'Espagne ?", "Madrid", "Barcelone", "Séville", "Valence", "Elle est située au centre du pays."),
        Q("Quel est le plus grand désert chaud du monde ?", "Le Sahara", "Le Gobi", "Le Kalahari", "L'Atacama", "Il couvre environ 9 millions de km²."),
        Q("Quel pays a la forme d'une botte ?", "L'Italie", "La Grèce", "L'Espagne", "Le Portugal", "La Sicile est « le ballon » de la botte."),
        Q("Quel est le plus grand océan du monde ?", "Le Pacifique", "L'Atlantique", "L'océan Indien", "L'Arctique", "Il couvre près d'un tiers de la surface de la Terre."),
        Q("Quelle est la plus grande île du monde ?", "Le Groenland", "Madagascar", "Bornéo", "L'Islande", "L'Australie est considérée comme un continent."),
        Q("Quel pays est surnommé le « pays du Soleil-Levant » ?", "Le Japon", "La Chine", "La Corée", "Le Vietnam", "Son nom, Nihon, signifie « origine du soleil »."),
        Q("Quelle mer sépare l'Europe de l'Afrique ?", "La Méditerranée", "La mer du Nord", "La mer Rouge", "La Baltique", "Son nom signifie « au milieu des terres ».")
      ],
      [
        Q("Quel est le plus long fleuve d'Europe ?", "La Volga", "Le Danube", "Le Rhin", "La Loire", "Elle mesure environ 3 500 km."),
        Q("Quelle chaîne de montagnes sépare la France de l'Espagne ?", "Les Pyrénées", "Les Alpes", "Le Jura", "Les Vosges", "Le pic d'Aneto en est le sommet."),
        Q("Dans quel pays se trouve la plus grande partie de la forêt amazonienne ?", "Le Brésil", "Le Pérou", "La Colombie", "Le Venezuela", "Environ 60 % de l'Amazonie y est située."),
        Q("Quelle est la capitale de la Turquie ?", "Ankara", "Istanbul", "Izmir", "Bursa", "Istanbul est la plus grande ville."),
        Q("Quel est le lac le plus profond du monde ?", "Le lac Baïkal", "Le lac Victoria", "Le lac Supérieur", "Le lac Léman", "Il dépasse 1 600 m de profondeur."),
        Q("Quel fleuve traverse Vienne, Budapest et Belgrade ?", "Le Danube", "Le Rhin", "La Vistule", "L'Elbe", "Il traverse dix pays."),
        Q("Quel est le point le plus bas des terres émergées ?", "La mer Morte", "La vallée de la Mort", "Le lac Eyre", "Le lac Assal", "Elle se situe à environ 430 m sous le niveau de la mer."),
        Q("Quel détroit sépare l'Asie de l'Amérique du Nord ?", "Le détroit de Béring", "Le détroit de Gibraltar", "Le détroit de Magellan", "Le détroit de Malacca", "Il relie l'océan Arctique au Pacifique."),
        Q("Quelle est la capitale de la Suisse ?", "Berne", "Zurich", "Genève", "Bâle", "Zurich est la plus grande ville."),
        Q("Quel est le plus grand pays d'Afrique par la superficie ?", "L'Algérie", "La RD Congo", "Le Soudan", "La Libye", "Elle l'est devenue après la partition du Soudan en 2011.")
      ],
      [
        Q("Quelle est la capitale de l'Islande ?", "Reykjavik", "Oslo", "Helsinki", "Tórshavn", "C'est la capitale la plus septentrionale du monde pour un État souverain."),
        Q("Quel fleuve traverse Le Caire ?", "Le Nil", "Le Tigre", "L'Euphrate", "Le Niger", "Il est long d'environ 6 650 km."),
        Q("Quel est le plus haut sommet d'Afrique ?", "Le Kilimandjaro", "Le mont Kenya", "Le mont Toubkal", "Le Ruwenzori", "Il culmine à 5 895 m, en Tanzanie."),
        Q("Quel est le plus grand lac d'Afrique ?", "Le lac Victoria", "Le lac Tanganyika", "Le lac Tchad", "Le lac Malawi", "Trois pays le bordent : Ouganda, Kenya et Tanzanie."),
        Q("Quelle est la capitale de la Nouvelle-Zélande ?", "Wellington", "Auckland", "Christchurch", "Hamilton", "Auckland est la plus grande ville."),
        Q("Quel pays possède le plus de fuseaux horaires, outre-mer compris ?", "La France", "La Russie", "Les États-Unis", "La Chine", "Ses territoires d'outre-mer couvrent toute la planète."),
        Q("Quel désert couvre une partie de la Mongolie et du nord de la Chine ?", "Le Gobi", "Le Thar", "Le Karakoum", "Le Néguev", "Il est célèbre pour ses fossiles de dinosaures."),
        Q("Quel est le plus long fleuve d'Asie ?", "Le Yangzi Jiang", "Le Mékong", "Le Gange", "L'Indus", "Il mesure environ 6 300 km."),
        Q("Quel pays d'Amérique du Sud n'a pas d'accès à la mer ?", "La Bolivie", "Le Chili", "Le Pérou", "L'Équateur", "Le Paraguay est l'autre pays enclavé du continent."),
        Q("Quel est le point culminant de la France métropolitaine ?", "Le mont Blanc", "Le pic du Midi", "Le mont Ventoux", "Le puy de Sancy", "Il se situe en Haute-Savoie.")
      ]
    ],
    cine: [
      [
        Q("Quel film d'animation met en scène un lion nommé Simba ?", "Le Roi lion", "Madagascar", "Tarzan", "Le Livre de la jungle", "Il est sorti en 1994."),
        Q("Quel super-héros est mordu par une araignée radioactive ?", "Spider-Man", "Batman", "Superman", "Iron Man", "Il se nomme Peter Parker."),
        Q("Quel ogre vert est le héros d'un film de DreamWorks ?", "Shrek", "Gru", "Hulk", "Fiona", "Le premier film est sorti en 2001."),
        Q("Quel acteur incarne Iron Man dans les films Marvel ?", "Robert Downey Jr.", "Chris Evans", "Chris Hemsworth", "Mark Ruffalo", "Il a joué le rôle de 2008 à 2019."),
        Q("Quelle princesse Disney possède de très longs cheveux magiques ?", "Raiponce", "Ariel", "Belle", "Mulan", "Son film est sorti en 2010."),
        Q("Quel film de Spielberg (1993) met en scène des dinosaures ?", "Jurassic Park", "E.T.", "Les Dents de la mer", "Indiana Jones", "Il est tiré d'un roman de Michael Crichton."),
        Q("Quel est le nom du cow-boy de « Toy Story » ?", "Woody", "Buzz", "Rex", "Jessie", "Il est un jouet qui appartient à Andy."),
        Q("Quel film d'animation met en scène un petit robot qui nettoie la Terre ?", "WALL-E", "Cars", "Ratatouille", "Là-haut", "Il est sorti en 2008."),
        Q("Quel film met en scène des Minions jaunes ?", "Moi, moche et méchant", "Shrek", "Madagascar", "Les Croods", "Gru en est le héros."),
        Q("Quel acteur britannique a joué James Bond de 2006 à 2021 ?", "Daniel Craig", "Pierce Brosnan", "Sean Connery", "Roger Moore", "Son premier film est « Casino Royale »."),
      ],
      [
        Q("Qui a réalisé « Le Silence des agneaux » (1991) ?", "Jonathan Demme", "David Fincher", "Ridley Scott", "Brian De Palma", "Le film a remporté les cinq grands Oscars."),
        Q("Quel acteur incarne Forrest Gump ?", "Tom Hanks", "Tom Cruise", "Kevin Costner", "Robin Williams", "Le film est sorti en 1994."),
        Q("Quelle actrice joue Hermione Granger dans les films Harry Potter ?", "Emma Watson", "Emma Stone", "Keira Knightley", "Kate Winslet", "Elle a débuté à 11 ans."),
        Q("Quel film français de 2011, en noir et blanc, a pour héros un acteur du muet ?", "The Artist", "Intouchables", "Les Choristes", "Amélie", "Il a remporté cinq Oscars."),
        Q("Quel film de Luc Besson (1997) met en scène Bruce Willis et Milla Jovovich ?", "Le Cinquième Élément", "Léon", "Taxi", "Subway", "Les costumes sont de Jean Paul Gaultier."),
        Q("Quelle trilogie suit Frodon et la Communauté de l'Anneau ?", "Le Seigneur des anneaux", "Le Hobbit", "Matrix", "Hunger Games", "Les films sont sortis de 2001 à 2003."),
        Q("Quel film de Miyazaki a remporté l'Oscar du meilleur film d'animation en 2003 ?", "Le Voyage de Chihiro", "Princesse Mononoké", "Mon voisin Totoro", "Ponyo", "Il est sorti en 2001 au Japon."),
        Q("Quel acteur joue Jack Dawson dans « Titanic » ?", "Leonardo DiCaprio", "Brad Pitt", "Johnny Depp", "Matt Damon", "Il a reçu l'Oscar du meilleur acteur en 2016 pour « The Revenant »."),
        Q("Quel acteur joue François Pignon dans « Le Dîner de cons » aux côtés de Thierry Lhermitte ?", "Jacques Villeret", "Gérard Depardieu", "Michel Serrault", "Louis de Funès", "Le film est de Francis Veber."),
        Q("Quel film de Christopher Nolan met en scène des rêves dans des rêves ?", "Inception", "Interstellar", "Memento", "Tenet", "Il est sorti en 2010."),
      ],
      [
        Q("Quel film de Stanley Kubrick se déroule dans un hôtel isolé ?", "Shining", "Orange mécanique", "Barry Lyndon", "Full Metal Jacket", "Il est adapté d'un roman de Stephen King."),
        Q("Qui a réalisé « Pierrot le fou » (1965) ?", "Jean-Luc Godard", "François Truffaut", "Claude Chabrol", "Éric Rohmer", "Jean-Paul Belmondo y joue."),
        Q("Quel acteur joue dans « Taxi Driver » (1976) ?", "Robert De Niro", "Al Pacino", "Dustin Hoffman", "Jack Nicholson", "Martin Scorsese le réalise."),
        Q("Quel réalisateur a signé « Les Parapluies de Cherbourg » (1964) ?", "Jacques Demy", "Jean Renoir", "Louis Malle", "Claude Lelouch", "Il est entièrement chanté."),
        Q("Quel film de Fritz Lang (1927) est un classique de la science-fiction ?", "Metropolis", "Nosferatu", "Le Cabinet du docteur Caligari", "M le maudit", "C'est un film muet allemand."),
        Q("Quel acteur joue dans « Le Samouraï » (1967) de Jean-Pierre Melville ?", "Alain Delon", "Jean-Paul Belmondo", "Lino Ventura", "Yves Montand", "Il y incarne un tueur à gages."),
        Q("Quelle actrice joue dans « Belle de jour » (1967) de Luis Buñuel ?", "Catherine Deneuve", "Brigitte Bardot", "Romy Schneider", "Jeanne Moreau", "Il a reçu le Lion d'or à Venise."),
        Q("Quel film de Spielberg (1993), en noir et blanc, évoque la Shoah ?", "La Liste de Schindler", "Il faut sauver le soldat Ryan", "Munich", "Lincoln", "Il a remporté sept Oscars."),
        Q("Quel film coréen a obtenu la Palme d'or 2019 puis l'Oscar du meilleur film ?", "Parasite", "Oldboy", "Memories of Murder", "Burning", "Il est réalisé par Bong Joon-ho."),
        Q("Quel film de 1927 est considéré comme le premier film parlant de l'histoire ?", "Le Chanteur de jazz", "Metropolis", "Le Kid", "Les Temps modernes", "Il est sorti aux États-Unis."),
      ]
    ],
    musique: [
      [
        Q("Combien de cordes compte un violon ?", "4", "6", "5", "8", "Elles sont accordées en sol, ré, la, mi."),
        Q("Quel instrument est associé à Louis Armstrong ?", "La trompette", "Le saxophone", "Le piano", "La batterie", "Il est une figure majeure du jazz."),
        Q("Quel groupe a chanté « We Will Rock You » ?", "Queen", "AC/DC", "Kiss", "Aerosmith", "Brian May l'a écrite en 1977."),
        Q("Qui a composé « La Lettre à Élise » ?", "Beethoven", "Mozart", "Chopin", "Liszt", "C'est l'une des pièces pour piano les plus connues."),
        Q("Quelle chanteuse a interprété « Bad Romance » ?", "Lady Gaga", "Katy Perry", "Rihanna", "Madonna", "Le titre est sorti en 2009."),
        Q("De quel pays vient le tango ?", "L'Argentine", "Le Brésil", "L'Espagne", "Le Mexique", "Il est né à Buenos Aires et Montevideo."),
        Q("Quel instrument à cordes pincées possède des pédales ?", "La harpe", "La guitare", "Le luth", "Le banjo", "Elle compte 47 cordes environ."),
        Q("Qui a chanté « Gangnam Style » ?", "Psy", "BTS", "Rain", "G-Dragon", "Le clip est devenu viral en 2012."),
        Q("Quelle note vient juste après do ?", "Ré", "Mi", "Si", "Fa", "La gamme est : do, ré, mi, fa, sol, la, si."),
        Q("Quelle chanteuse est célèbre pour « Like a Prayer » ?", "Madonna", "Cher", "Tina Turner", "Kylie Minogue", "Elle est surnommée « la reine de la pop ».")
      ],
      [
        Q("Quel groupe a pour chanteur Mick Jagger ?", "The Rolling Stones", "The Who", "The Clash", "Led Zeppelin", "Le groupe s'est formé à Londres en 1962."),
        Q("Quel compositeur a écrit « La Flûte enchantée » ?", "Mozart", "Haydn", "Beethoven", "Verdi", "Cet opéra date de 1791."),
        Q("Qui a composé « La Symphonie fantastique » ?", "Hector Berlioz", "Franz Liszt", "Camille Saint-Saëns", "Charles Gounod", "Elle est créée en 1830."),
        Q("Quel instrument joue Jimi Hendrix ?", "La guitare électrique", "La batterie", "Le saxophone", "La basse", "Il est un virtuose gaucher."),
        Q("Quelle cantatrice grecque est surnommée « La Divina » ?", "Maria Callas", "Montserrat Caballé", "Renata Tebaldi", "Cecilia Bartoli", "Elle a triomphé à la Scala de Milan."),
        Q("Quel groupe a sorti l'album « Nevermind » en 1991 ?", "Nirvana", "Pearl Jam", "Soundgarden", "Foo Fighters", "Kurt Cobain en était le chanteur."),
        Q("Quel style de musique est associé à Bob Marley ?", "Le reggae", "Le ska", "Le blues", "La soul", "Il est jamaïcain."),
        Q("Quel rappeur américain a sorti « Lose Yourself » ?", "Eminem", "Jay-Z", "Kanye West", "50 Cent", "Elle a obtenu l'Oscar de la meilleure chanson en 2003."),
        Q("Qui est le chanteur du groupe Coldplay ?", "Chris Martin", "Thom Yorke", "Bono", "Brandon Flowers", "Le groupe est britannique."),
        Q("Quelle chanteuse a sorti l'album « 21 » en 2011 ?", "Adele", "Amy Winehouse", "Duffy", "Lorde", "Il contient « Someone Like You ».")
      ],
      [
        Q("Quel compositeur a écrit les « Nocturnes » pour piano les plus célèbres ?", "Frédéric Chopin", "Franz Liszt", "Robert Schumann", "Johannes Brahms", "Il en a composé 21."),
        Q("Quel compositeur français a écrit les « Gymnopédies » ?", "Erik Satie", "Claude Debussy", "Francis Poulenc", "Maurice Ravel", "Elles datent de 1888."),
        Q("Quel groupe a chanté « Love Will Tear Us Apart » ?", "Joy Division", "The Smiths", "Oasis", "New Order", "Il s'est formé à Manchester."),
        Q("Quel instrument à clavier et à tuyaux trône dans les églises ?", "L'orgue", "Le clavecin", "Le piano", "L'harmonium", "Il peut compter des milliers de tuyaux."),
        Q("Qui a composé « Pierre et le Loup » ?", "Sergueï Prokofiev", "Tchaïkovski", "Igor Stravinsky", "Dmitri Chostakovitch", "C'est un conte musical pour enfants (1936)."),
        Q("Quel chanteur américain est surnommé « le Boss » ?", "Bruce Springsteen", "Bob Dylan", "Billy Joel", "Neil Diamond", "Il vient du New Jersey."),
        Q("Qui a chanté « Les Bourgeois » ?", "Jacques Brel", "Georges Brassens", "Léo Ferré", "Jean Ferrat", "La chanson date de 1962."),
        Q("Quel DJ français est connu pour « Titanium », chanté avec Sia ?", "David Guetta", "Bob Sinclar", "Martin Solveig", "Kavinsky", "Le titre est sorti en 2011."),
        Q("Quel était le prénom de Mozart ?", "Wolfgang Amadeus", "Ludwig", "Johann Sebastian", "Franz", "Il est mort à 35 ans, en 1791."),
        Q("Comment appelle-t-on la voix d'homme la plus grave ?", "La basse", "Le ténor", "Le baryton", "Le contre-ténor", "Elle descend jusqu'au mi grave.")
      ]
    ],
    sport: [
      [
        Q("Combien de joueurs une équipe de football aligne-t-elle sur le terrain ?", "11", "9", "7", "15", "Gardien compris."),
        Q("Quel pays a remporté la Coupe du monde de football masculin en 2018 ?", "La France", "La Croatie", "L'Allemagne", "Le Brésil", "Elle a battu la Croatie 4 à 2 en finale."),
        Q("Quel sport se pratique à Roland-Garros ?", "Le tennis", "Le golf", "Le rugby", "La natation", "Le tournoi se joue sur terre battue."),
        Q("Dans quel sport marque-t-on des paniers ?", "Le basket-ball", "Le handball", "Le volley-ball", "Le water-polo", "Un panier vaut 1, 2 ou 3 points."),
        Q("Quelle distance parcourt-on dans un marathon ?", "42,195 km", "21 km", "50 km", "30 km", "La distance a été fixée en 1921."),
        Q("Quel footballeur est surnommé « CR7 » ?", "Cristiano Ronaldo", "Karim Benzema", "Lionel Messi", "Neymar", "Il est portugais."),
        Q("Combien d'anneaux compte le symbole olympique ?", "5", "4", "6", "7", "Ils représentent les cinq continents."),
        Q("Quel sport pratique Teddy Riner ?", "Le judo", "La boxe", "Le karaté", "L'escrime", "Il est multiple champion olympique et du monde."),
        Q("Quelle course cycliste se termine sur les Champs-Élysées ?", "Le Tour de France", "Le Giro", "La Vuelta", "Paris-Roubaix", "Elle a lieu chaque été."),
        Q("Dans quelle école anglaise, dit-on, le rugby est-il né ?", "Rugby School", "Eton", "Harrow", "Oxford", "La légende raconte que William Webb Ellis prit le ballon à la main en 1823.")
      ],
      [
        Q("Quel pays a accueilli les Jeux olympiques d'été de 2024 ?", "La France", "Le Japon", "Les États-Unis", "Le Brésil", "La cérémonie d'ouverture s'est tenue sur la Seine."),
        Q("Qui détient le record du monde du 100 m (9 s 58) ?", "Usain Bolt", "Carl Lewis", "Justin Gatlin", "Yohan Blake", "Il l'a établi à Berlin en 2009."),
        Q("Quel joueur a remporté le plus de tournois de Roland-Garros ?", "Rafael Nadal", "Roger Federer", "Novak Djokovic", "Björn Borg", "Il en compte 14."),
        Q("Combien de points vaut un essai au rugby à XV ?", "5", "3", "7", "2", "Il est suivi d'une transformation à 2 points."),
        Q("Quel club de football joue au Camp Nou ?", "Le FC Barcelone", "Le Real Madrid", "L'Atlético de Madrid", "Valence", "C'est le plus grand stade d'Europe."),
        Q("Quel sport pratique Tony Parker ?", "Le basket-ball", "Le football", "Le handball", "Le rugby", "Il a joué plus de 17 saisons en NBA."),
        Q("Quelle équipe a remporté la Coupe du monde de rugby 2023 ?", "L'Afrique du Sud", "La Nouvelle-Zélande", "La France", "L'Angleterre", "Elle s'est imposée d'un point en finale."),
        Q("Combien de sets faut-il gagner pour remporter un match masculin en Grand Chelem ?", "3", "2", "4", "5", "Les matchs se jouent au meilleur des cinq sets."),
        Q("Quel joueur était capitaine de l'équipe de France championne du monde en 1998 ?", "Didier Deschamps", "Zinédine Zidane", "Marcel Desailly", "Laurent Blanc", "Il soulève la Coupe au Stade de France."),
        Q("Combien de temps dure un match de football, hors prolongations ?", "90 minutes", "80 minutes", "100 minutes", "120 minutes", "Deux mi-temps de 45 minutes.")
      ],
      [
        Q("Quel pays a remporté la première Coupe du monde de football, en 1930 ?", "L'Uruguay", "Le Brésil", "L'Italie", "L'Argentine", "Il l'organisait aussi."),
        Q("Qui a inventé le basket-ball en 1891 ?", "James Naismith", "Pierre de Coubertin", "William Webb Ellis", "Abner Doubleday", "Il utilisait des paniers de pêches."),
        Q("Combien de Coupes du monde masculines la France avait-elle gagnées jusqu'en 2022 ?", "2", "1", "3", "4", "En 1998 et en 2018."),
        Q("Quelle ville a accueilli les premiers Jeux olympiques modernes en 1896 ?", "Athènes", "Paris", "Londres", "Stockholm", "Pierre de Coubertin les a relancés."),
        Q("Quel sport pratique Serena Williams ?", "Le tennis", "Le golf", "Le basket-ball", "L'athlétisme", "Elle a gagné 23 titres du Grand Chelem."),
        Q("Quel cycliste a remporté cinq Tours de France consécutifs de 1991 à 1995 ?", "Miguel Indurain", "Bernard Hinault", "Eddy Merckx", "Chris Froome", "Il est espagnol."),
        Q("Quel pilote compte sept titres mondiaux de F1, comme Lewis Hamilton ?", "Michael Schumacher", "Ayrton Senna", "Alain Prost", "Sebastian Vettel", "Il les a gagnés entre 1994 et 2004."),
        Q("À quelle hauteur est fixé un panier de basket officiel ?", "3,05 m", "2,5 m", "3,5 m", "2,8 m", "Soit 10 pieds."),
        Q("Quel pays détient le plus de Coupes du monde de football masculines ?", "Le Brésil", "L'Allemagne", "L'Italie", "L'Argentine", "Il en compte cinq."),
        Q("Quel nageur américain a remporté 23 médailles d'or olympiques ?", "Michael Phelps", "Mark Spitz", "Ryan Lochte", "Ian Thorpe", "C'est le recordman de l'histoire.")
      ]
    ],
    sciences: [
      [
        Q("Quelle planète est la plus proche du Soleil ?", "Mercure", "Vénus", "Mars", "La Terre", "Elle fait le tour du Soleil en 88 jours."),
        Q("Quel gaz respirons-nous pour vivre ?", "L'oxygène", "Le dioxyde de carbone", "L'hélium", "L'hydrogène", "Il représente environ 21 % de l'air."),
        Q("Quelle est la formule chimique de l'eau ?", "H2O", "CO2", "O2", "NaCl", "Deux atomes d'hydrogène pour un d'oxygène."),
        Q("Combien de planètes compte le système solaire ?", "8", "9", "7", "10", "Pluton a été reclassée planète naine en 2006."),
        Q("Quel astre est au centre du système solaire ?", "Le Soleil", "La Lune", "Jupiter", "Sirius", "C'est une étoile."),
        Q("À quelle température l'eau gèle-t-elle (à pression normale) ?", "0 °C", "10 °C", "-10 °C", "32 °C", "32 degrés, c'est en Fahrenheit."),
        Q("Quel animal est un mammifère ?", "La baleine", "Le requin", "Le thon", "La raie", "Elle allaite ses petits."),
        Q("Quelle planète est surnommée « la planète rouge » ?", "Mars", "Vénus", "Jupiter", "Mercure", "Sa couleur vient de l'oxyde de fer."),
        Q("Quelle force nous maintient au sol ?", "La gravité", "Le magnétisme", "La friction", "L'inertie", "Newton l'a décrite au XVIIe siècle."),
        Q("Quel est le plus grand animal terrestre ?", "L'éléphant d'Afrique", "La girafe", "Le rhinocéros", "L'hippopotame", "Il peut peser plus de 6 tonnes.")
      ],
      [
        Q("Quel est le symbole chimique du fer ?", "Fe", "Fr", "F", "Ir", "Fe vient du latin ferrum."),
        Q("Quelle est approximativement la vitesse de la lumière dans le vide ?", "300 000 km/s", "30 000 km/s", "3 000 km/s", "3 millions de km/s", "Elle fait sept fois et demie le tour de la Terre en une seconde."),
        Q("Quelle planète est célèbre pour ses anneaux ?", "Saturne", "Mars", "Vénus", "Mercure", "Jupiter et Neptune en ont aussi, mais plus discrets."),
        Q("Quel physicien est associé à la formule E = mc² ?", "Albert Einstein", "Isaac Newton", "Niels Bohr", "Max Planck", "Elle lie énergie et masse."),
        Q("Que fait la photosynthèse ?", "Elle fabrique des sucres à partir de lumière, d'eau et de CO2", "Elle digère les aliments", "Elle fait fermenter le vin", "Elle fait respirer les poissons", "Elle rejette de l'oxygène."),
        Q("Quelle est la plus petite particule d'un élément chimique ?", "L'atome", "La molécule", "La cellule", "Le grain", "Il est composé de protons, de neutrons et d'électrons."),
        Q("Quel gaz contribue le plus à l'effet de serre lié aux activités humaines ?", "Le dioxyde de carbone", "L'hélium", "L'argon", "Le néon", "Son taux augmente depuis la révolution industrielle."),
        Q("Quelle est l'unité de force dans le Système international ?", "Le newton", "Le joule", "Le watt", "Le pascal", "Elle honore Isaac Newton."),
        Q("Quelle est la plus grosse planète du système solaire ?", "Jupiter", "Saturne", "Neptune", "Uranus", "Elle est 11 fois plus large que la Terre."),
        Q("Quel est le pH d'une solution neutre ?", "7", "0", "14", "1", "En dessous de 7, c'est acide ; au-dessus, basique.")
      ],
      [
        Q("Quel élément chimique a pour numéro atomique 1 ?", "L'hydrogène", "L'hélium", "L'oxygène", "Le carbone", "C'est l'élément le plus abondant de l'Univers."),
        Q("Quel est le symbole chimique du sodium ?", "Na", "So", "S", "Sd", "Na vient du latin natrium."),
        Q("Quel scientifique a proposé la théorie de l'« atome primitif », à l'origine du Big Bang ?", "Georges Lemaître", "Edwin Hubble", "Stephen Hawking", "Fred Hoyle", "C'était un prêtre et astronome belge."),
        Q("Comment s'appelle la galaxie qui contient notre système solaire ?", "La Voie lactée", "Andromède", "Le Triangle", "Le Grand Nuage de Magellan", "Elle compte des centaines de milliards d'étoiles."),
        Q("Quelle particule porte une charge électrique négative ?", "L'électron", "Le proton", "Le neutron", "Le photon", "Il a été découvert en 1897."),
        Q("Quelle unité mesure la fréquence ?", "Le hertz", "Le volt", "L'ohm", "Le tesla", "Elle porte le nom de Heinrich Hertz."),
        Q("Quel métal est liquide à température ambiante ?", "Le mercure", "Le plomb", "L'étain", "Le zinc", "Son symbole est Hg."),
        Q("À quelle température l'eau bout-elle au niveau de la mer ?", "100 °C", "90 °C", "120 °C", "80 °C", "En altitude, elle bout plus tôt."),
        Q("Combien de temps la lumière du Soleil met-elle pour atteindre la Terre ?", "Environ 8 minutes", "Environ 8 secondes", "Environ 1 heure", "Environ 1 minute", "Elle parcourt environ 150 millions de km."),
        Q("Quel astronome a découvert les quatre grandes lunes de Jupiter ?", "Galilée", "Kepler", "Edwin Hubble", "Copernic", "C'était en 1610, avec une lunette.")
      ]
    ],
    arts: [
      [
        Q("Qui a peint « La Joconde » ?", "Léonard de Vinci", "Michel-Ange", "Raphaël", "Botticelli", "Le tableau a été peint au début du XVIe siècle."),
        Q("Dans quel musée est exposée la Joconde ?", "Le Louvre", "Le musée d'Orsay", "Le Prado", "Le Centre Pompidou", "Il se trouve à Paris."),
        Q("Qui a peint « La Nuit étoilée » ?", "Vincent van Gogh", "Claude Monet", "Pablo Picasso", "Paul Cézanne", "Il l'a peinte en 1889 à Saint-Rémy-de-Provence."),
        Q("Quel peintre est célèbre pour ses séries de nymphéas ?", "Claude Monet", "Edgar Degas", "Auguste Renoir", "Paul Gauguin", "Il les peignait dans son jardin de Giverny."),
        Q("Quel sculpteur a créé « Le Penseur » ?", "Auguste Rodin", "Camille Claudel", "Michel-Ange", "Donatello", "L'œuvre est d'abord conçue pour « La Porte de l'Enfer »."),
        Q("Quel poète américain a écrit « Le Corbeau » ?", "Edgar Allan Poe", "Charles Baudelaire", "Victor Hugo", "Arthur Rimbaud", "Baudelaire l'a traduit en français."),
        Q("Quelle célèbre statue grecque sans bras est exposée au Louvre ?", "La Vénus de Milo", "Le Discobole", "Le David", "Le Laocoon", "Elle a été découverte en 1820."),
        Q("Quel peintre espagnol a réalisé « Guernica » ?", "Pablo Picasso", "Salvador Dalí", "Joan Miró", "Francisco de Goya", "Le tableau dénonce un bombardement de 1937."),
        Q("Qui a créé le personnage de Tintin ?", "Hergé", "Goscinny", "Uderzo", "Peyo", "La première aventure paraît en 1929."),
        Q("Quel monument parisien possède une pyramide de verre dans sa cour ?", "Le Louvre", "Le Grand Palais", "Le Sacré-Cœur", "L'Opéra Garnier", "Elle a été inaugurée en 1989.")
      ],
      [
        Q("Quel mouvement artistique est associé à Monet et Renoir ?", "L'impressionnisme", "Le cubisme", "Le surréalisme", "Le baroque", "Son nom vient d'un tableau de Monet : « Impression, soleil levant »."),
        Q("Quel peintre est célèbre pour ses montres molles ?", "Salvador Dalí", "René Magritte", "Max Ernst", "Joan Miró", "« La Persistance de la mémoire » date de 1931."),
        Q("Qui a peint « Les Demoiselles d'Avignon » ?", "Pablo Picasso", "Henri Matisse", "Georges Braque", "Paul Cézanne", "Le tableau annonce le cubisme."),
        Q("Quel peintre néerlandais a réalisé « La Jeune Fille à la perle » ?", "Johannes Vermeer", "Rembrandt", "Frans Hals", "Jan Steen", "Il vivait à Delft au XVIIe siècle."),
        Q("Qui a peint le plafond de la chapelle Sixtine ?", "Michel-Ange", "Raphaël", "Léonard de Vinci", "Botticelli", "Il y travaille de 1508 à 1512."),
        Q("Quel poète a écrit « Le Bateau ivre » ?", "Arthur Rimbaud", "Paul Verlaine", "Charles Baudelaire", "Guillaume Apollinaire", "Il l'écrit à 16 ans."),
        Q("Quel musée new-yorkais est célèbre pour sa rotonde en spirale signée Frank Lloyd Wright ?", "Le Guggenheim", "Le MoMA", "Le Metropolitan", "Le Whitney", "Il a ouvert en 1959."),
        Q("Quel écrivain est l'auteur de « Germinal » ?", "Émile Zola", "Victor Hugo", "Honoré de Balzac", "Guy de Maupassant", "Le roman décrit la vie des mineurs."),
        Q("Quel sculpteur a créé « La Porte de l'Enfer » ?", "Auguste Rodin", "Antoine Bourdelle", "Aristide Maillol", "Constantin Brancusi", "Il y a travaillé près de quarante ans."),
        Q("Quel architecte a conçu la Sagrada Família ?", "Antoni Gaudí", "Le Corbusier", "Gustave Eiffel", "Oscar Niemeyer", "Le chantier a commencé en 1882.")
      ],
      [
        Q("Quel peintre a réalisé « Le Radeau de la Méduse » ?", "Théodore Géricault", "Eugène Delacroix", "Jacques-Louis David", "Jean-Auguste-Dominique Ingres", "Le tableau date de 1819."),
        Q("Quel peintre a créé « La Liberté guidant le peuple » ?", "Eugène Delacroix", "Théodore Géricault", "Gustave Courbet", "Édouard Manet", "Il illustre la révolution de 1830."),
        Q("Qui a peint « Le Cri » ?", "Edvard Munch", "Gustav Klimt", "Egon Schiele", "Paul Klee", "Il est norvégien."),
        Q("Quel artiste est une figure du pop art avec ses boîtes de soupe Campbell ?", "Andy Warhol", "Roy Lichtenstein", "Jasper Johns", "Keith Haring", "Il a fondé la « Factory » à New York."),
        Q("Quel peintre a réalisé « Le Baiser » doré (1908) ?", "Gustav Klimt", "Egon Schiele", "Edvard Munch", "Henri Matisse", "Il vivait à Vienne."),
        Q("Quel architecte a conçu la pyramide du Louvre ?", "Ieoh Ming Pei", "Renzo Piano", "Jean Nouvel", "Norman Foster", "Elle a été inaugurée en 1989."),
        Q("Quel poète a écrit « Alcools » ?", "Guillaume Apollinaire", "Paul Éluard", "Louis Aragon", "Paul Valéry", "Le recueil paraît en 1913."),
        Q("Quel écrivain a reçu le prix Nobel de littérature en 1957 ?", "Albert Camus", "Jean-Paul Sartre", "André Gide", "François Mauriac", "Il avait 44 ans."),
        Q("Quel peintre autodidacte est surnommé « le Douanier » ?", "Henri Rousseau", "Paul Gauguin", "Georges Seurat", "Paul Signac", "Il travaillait à l'octroi de Paris."),
        Q("Quel peintre flamand est l'auteur des « Époux Arnolfini » ?", "Jan van Eyck", "Pieter Bruegel", "Pierre Paul Rubens", "Rogier van der Weyden", "Le tableau date de 1434.")
      ]
    ],
    gastro: [
      [
        Q("De quel pays vient la pizza ?", "L'Italie", "La Grèce", "L'Espagne", "La France", "Elle est née à Naples."),
        Q("Quel fromage garnit une pizza margherita ?", "La mozzarella", "Le camembert", "Le roquefort", "Le comté", "Elle est d'origine italienne."),
        Q("Avec quel fruit fait-on le vin ?", "Le raisin", "La pomme", "La poire", "La figue", "La vigne est cultivée depuis des milliers d'années."),
        Q("Quel est l'ingrédient principal du guacamole ?", "L'avocat", "La banane", "La tomate", "Le concombre", "C'est une spécialité mexicaine."),
        Q("De quel pays vient le sushi ?", "Le Japon", "La Chine", "La Corée", "La Thaïlande", "Il est à base de riz vinaigré."),
        Q("Quel fromage à pâte persillée vient de l'Aveyron ?", "Le roquefort", "Le brie", "Le cantal", "Le comté", "Il est affiné dans les caves de Roquefort-sur-Soulzon."),
        Q("Comment s'appelle la galette fine roulée, fourrée de sucre ou de confiture ?", "La crêpe", "Le pancake", "Le blini", "La gaufre", "On la mange à la Chandeleur."),
        Q("Quel légume fait pleurer quand on le coupe ?", "L'oignon", "Le concombre", "La courgette", "La pomme de terre", "Il libère un gaz irritant."),
        Q("Quelle boisson est faite avec des grains torréfiés dont l'origine est l'Éthiopie ?", "Le café", "Le thé", "Le cacao", "Le soda", "On raconte que des chèvres l'auraient fait découvrir."),
        Q("Quel gâteau se partage à l'Épiphanie ?", "La galette des rois", "La bûche", "Le gâteau basque", "Le kouign-amann", "Elle cache une fève.")
      ],
      [
        Q("De quelle région est originaire la bouillabaisse ?", "La Provence", "La Bretagne", "L'Alsace", "La Normandie", "Marseille en est la capitale."),
        Q("Quel fromage normand a une croûte fleurie ?", "Le camembert", "Le comté", "Le roquefort", "Le cantal", "Il est AOP de Normandie."),
        Q("Quelle spécialité alsacienne associe chou fermenté et charcuterie ?", "La choucroute", "Le cassoulet", "La raclette", "La fondue", "On la sert avec des pommes de terre."),
        Q("De quel pays vient la paella ?", "L'Espagne", "L'Italie", "Le Portugal", "Le Mexique", "Elle vient de Valence."),
        Q("Quel est l'ingrédient principal du houmous ?", "Les pois chiches", "Les lentilles", "Les haricots", "Le soja", "On y ajoute du tahini et du citron."),
        Q("Quelle boisson mêle vin, fruits et sucre dans la cuisine espagnole ?", "La sangria", "Le cidre", "Le porto", "Le kir", "Elle se sert très fraîche."),
        Q("Quel dessert italien contient du mascarpone et du café ?", "Le tiramisu", "La panna cotta", "Les cannoli", "Le gelato", "Son nom signifie « remonte-moi le moral »."),
        Q("Quelle viande contient un bœuf bourguignon ?", "Le bœuf", "Le porc", "L'agneau", "Le veau", "Il mijote dans du vin rouge de Bourgogne."),
        Q("De quel pays vient le kebab tel qu'on le connaît en France ?", "La Turquie", "La Grèce", "Le Liban", "L'Égypte", "Le döner kebab date du XIXe siècle."),
        Q("De quelle plante provient la moutarde ?", "Les graines de moutarde", "Le raifort", "Le radis", "Le poivre", "Dijon en est la capitale française.")
      ],
      [
        Q("Quel fromage du Jura est AOP depuis 1958 ?", "Le comté", "Le beaufort", "Le reblochon", "Le maroilles", "Il est fabriqué avec du lait de vache cru."),
        Q("Quelle épice, l'une des plus chères du monde, vient d'une fleur de crocus ?", "Le safran", "La vanille", "Le curcuma", "La cardamome", "Il faut environ 150 fleurs pour un gramme."),
        Q("Quel plat du Sud-Ouest associe haricots blancs, saucisse et confit ?", "Le cassoulet", "Le pot-au-feu", "La potée", "Le petit salé", "Castelnaudary, Carcassonne et Toulouse s'en disputent la paternité."),
        Q("Dans quelle région produit-on le vin de Chablis ?", "La Bourgogne", "La Champagne", "La Loire", "L'Alsace", "Il est fait avec du chardonnay."),
        Q("Quel cuisinier est surnommé « le roi des cuisiniers et le cuisinier des rois » ?", "Auguste Escoffier", "Paul Bocuse", "Alain Ducasse", "Joël Robuchon", "Il a codifié la cuisine française au début du XXe siècle."),
        Q("Quel arbre donne les fèves dont on fait le chocolat ?", "Le cacaoyer", "Le caféier", "Le théier", "Le vanillier", "Il pousse près de l'équateur."),
        Q("Quel alcool traditionnel japonais est fabriqué à partir de riz ?", "Le saké", "Le soju", "Le baijiu", "Le mezcal", "On le sert chaud ou froid."),
        Q("Quel cuisinier lyonnais, surnommé « le pape de la gastronomie », a donné son nom à un grand concours ?", "Paul Bocuse", "Alain Ducasse", "Pierre Gagnaire", "Michel Guérard", "Il a été chef pendant plus de cinquante ans à Collonges-au-Mont-d'Or."),
        Q("Quel alcool est la base du mojito ?", "Le rhum", "La vodka", "Le gin", "La tequila", "Il est d'origine cubaine."),
        Q("Quelle céréale est la base du porridge ?", "L'avoine", "Le blé", "Le riz", "Le maïs", "C'est le petit-déjeuner traditionnel écossais.")
      ]
    ],
    nature: [
      [
        Q("Quel est le plus grand animal marin ?", "La baleine bleue", "Le requin blanc", "L'orque", "Le calmar géant", "Elle peut dépasser 30 mètres."),
        Q("Combien de pattes une araignée a-t-elle ?", "8", "6", "10", "4", "Ce n'est pas un insecte, qui en a six."),
        Q("Quel animal pond des œufs ?", "La poule", "La vache", "Le chat", "Le chien", "Une poule peut pondre environ un œuf par jour."),
        Q("Quel est l'animal terrestre le plus rapide ?", "Le guépard", "Le lion", "Le cheval", "La gazelle", "Il atteint plus de 100 km/h sur de courtes distances."),
        Q("Quel arbre produit des glands ?", "Le chêne", "Le hêtre", "Le pin", "Le bouleau", "Les cochons les aiment beaucoup."),
        Q("Quel insecte fabrique le miel ?", "L'abeille", "La guêpe", "La fourmi", "Le papillon", "Elle butine les fleurs pour récolter le nectar."),
        Q("Quel oiseau est le symbole de la paix ?", "La colombe", "L'aigle", "Le corbeau", "Le cygne", "Elle tient souvent un rameau d'olivier."),
        Q("Quel animal hiberne l'hiver ?", "L'ours", "Le loup", "Le renard", "Le cerf", "Il vit sur ses réserves de graisse."),
        Q("Quel animal est surnommé « le roi de la jungle » ?", "Le lion", "Le tigre", "L'éléphant", "Le gorille", "Il vit pourtant dans la savane."),
        Q("Quel animal peut changer de couleur pour se camoufler ?", "Le caméléon", "L'iguane", "Le gecko", "Le lézard vert", "Il peut aussi changer de couleur selon son humeur.")
      ],
      [
        Q("Quel est le plus grand félin du monde ?", "Le tigre", "Le lion", "Le jaguar", "Le léopard", "Le tigre de Sibérie peut peser plus de 300 kg."),
        Q("Quel est le plus grand oiseau du monde ?", "L'autruche", "L'albatros", "Le condor", "Le cygne", "Elle peut atteindre 2,5 m."),
        Q("Combien de cœurs possède une pieuvre ?", "3", "1", "2", "8", "Deux alimentent les branchies, un le reste du corps."),
        Q("Quel animal est surnommé le « vaisseau du désert » ?", "Le dromadaire", "Le cheval", "L'âne", "Le lama", "Il peut rester plusieurs jours sans boire."),
        Q("Quelle est la plus grande forêt tropicale du monde ?", "L'Amazonie", "Le Congo", "Bornéo", "La Daintree", "Elle s'étend sur neuf pays."),
        Q("Quel mammifère pond des œufs ?", "L'ornithorynque", "Le kangourou", "Le koala", "Le tatou", "Il vit en Australie."),
        Q("Quel arbre africain est surnommé « l'arbre à l'envers » ?", "Le baobab", "Le palmier", "L'acacia", "Le teck", "Ses branches ressemblent à des racines."),
        Q("Quel animal marin utilise l'écholocalisation ?", "Le dauphin", "Le requin", "Le thon", "La méduse", "Il émet des clics qui reviennent en écho."),
        Q("Quel papillon migre sur des milliers de kilomètres du Canada au Mexique ?", "Le monarque", "Le paon du jour", "Le citron", "Le machaon", "Il fait un voyage de plus de 4 000 km."),
        Q("Quel continent n'abrite aucun pays ?", "L'Antarctique", "L'Océanie", "L'Afrique", "L'Europe", "Il est géré par un traité international.")
      ],
      [
        Q("Quel est le plus grand poisson du monde ?", "Le requin-baleine", "Le requin blanc", "Le requin-marteau", "Le requin-tigre", "Il peut dépasser 12 mètres et ne mange que du plancton."),
        Q("Quel oiseau est capable de voler en arrière ?", "Le colibri", "Le martin-pêcheur", "Le pigeon", "Le moineau", "Il bat des ailes plus de 50 fois par seconde."),
        Q("Quelle est la plus grande barrière de corail du monde ?", "La Grande Barrière de corail", "Le récif de Belize", "Le récif de Floride", "Ningaloo", "Elle est visible depuis l'espace."),
        Q("Combien de temps vit environ une éphémère adulte ?", "Environ un jour", "Une semaine", "Un mois", "Un an", "Son nom vient de là."),
        Q("Quel animal a des empreintes digitales presque identiques à celles des humains ?", "Le koala", "Le chimpanzé", "Le chat", "Le singe-araignée", "Même la police aurait du mal à les distinguer."),
        Q("Quel est le plus grand reptile vivant ?", "Le crocodile marin", "L'anaconda", "Le dragon de Komodo", "La tortue luth", "Il peut dépasser 5 mètres."),
        Q("Quelle plante carnivore se referme sur les insectes ?", "La dionée attrape-mouche", "Le cactus", "L'orchidée", "Le lierre", "Elle compte les contacts avant de se refermer."),
        Q("Quel ours vit dans l'Arctique ?", "L'ours polaire", "L'ours brun", "L'ours noir", "Le panda", "Sa peau est noire sous son pelage."),
        Q("Quel animal peut régénérer sa queue ?", "Le lézard", "La grenouille", "Le serpent", "La tortue", "Il la perd pour échapper aux prédateurs."),
        Q("Quel gaz les plantes absorbent-elles pour fabriquer leurs sucres ?", "Le dioxyde de carbone", "L'oxygène", "L'azote", "L'hydrogène", "Elles rejettent de l'oxygène en retour.")
      ]
    ]
  };

  const QUOTES_ADD = {
    hist: [
      [
        ["Après moi, le déluge.", ["Louis XV", "Louis XIV", "Napoléon", "Louis XVI"], "Cette phrase est attribuée à Louis XV, qui pressentait la chute de la monarchie."],
        ["S'ils n'ont pas de pain, qu'ils mangent de la brioche.", ["Marie-Antoinette", "Catherine de Médicis", "Joséphine de Beauharnais", "Madame de Pompadour"], "Attribuée à la reine à tort : Rousseau l'écrivait déjà dans ses « Confessions »."],
        ["Alea jacta est : le sort en est jeté.", ["Jules César", "Auguste", "Pompée", "Néron"], "César franchit le Rubicon en 49 av. J.-C."],
        ["Soldats, du haut de ces pyramides, quarante siècles vous contemplent.", ["Napoléon", "Louis XIV", "Charles de Gaulle", "Alexandre le Grand"], "Il s'adresse à ses troupes avant la bataille des Pyramides, en 1798."],
        ["Tout est perdu, fors l'honneur.", ["François Ier", "Henri IV", "Louis XIV", "Napoléon"], "Phrase attribuée au roi après sa défaite de Pavie, en 1525."],
        ["La garde meurt mais ne se rend pas.", ["Le général Cambronne", "Napoléon", "Le maréchal Ney", "Joachim Murat"], "Attribuée à Cambronne à Waterloo, il aurait répondu plus crûment."]
      ],
      [
        ["Allez dire à votre maître que nous sommes ici par la volonté du peuple.", ["Mirabeau", "Robespierre", "Danton", "Sieyès"], "Mirabeau s'adresse au marquis de Dreux-Brézé, le 23 juin 1789."],
        ["De l'audace, encore de l'audace, toujours de l'audace !", ["Danton", "Robespierre", "Napoléon", "Mirabeau"], "Danton la prononce devant l'Assemblée, le 2 septembre 1792."],
        ["La France a perdu une bataille ! Mais la France n'a pas perdu la guerre !", ["Charles de Gaulle", "Philippe Pétain", "Léon Blum", "Georges Mandel"], "Elle figure sur l'affiche de 1940 apposée à Londres."],
        ["Le courage, c'est de chercher la vérité et de la dire.", ["Jean Jaurès", "Léon Blum", "Georges Clemenceau", "Aristide Briand"], "Jean Jaurès la prononce en 1903 devant des lycéens d'Albi."],
        ["Ce n'est pas la fin. Ce n'est même pas le commencement de la fin. Mais c'est peut-être la fin du commencement.", ["Winston Churchill", "Charles de Gaulle", "Franklin Roosevelt", "Georges Clemenceau"], "Il la prononce en novembre 1942, après la victoire d'El-Alamein."],
        ["Ne demandez pas ce que votre pays peut faire pour vous, demandez ce que vous pouvez faire pour votre pays.", ["John F. Kennedy", "Ronald Reagan", "Abraham Lincoln", "Franklin Roosevelt"], "Kennedy la prononce lors de son discours d'investiture, en 1961."]
      ],
      [
        ["Et toi aussi, mon fils !", ["Jules César", "Marc Antoine", "Brutus", "Cicéron"], "Suétone rapporte une phrase en grec ; la version « Tu quoque, Brute » est surtout dans Shakespeare."],
        ["Tuez-les tous, Dieu reconnaîtra les siens.", ["Arnaud Amaury", "Simon de Montfort", "Innocent III", "Saint Louis"], "Phrase attribuée à l'abbé de Cîteaux lors du siège de Béziers, en 1209."],
        ["Si tu veux la paix, prépare la guerre.", ["Végèce", "Cicéron", "Jules César", "Auguste"], "Le Romain Végèce écrit « Si vis pacem, para bellum » au IVe siècle."],
        ["Gouverner, c'est prévoir.", ["Émile de Girardin", "Adolphe Thiers", "François Guizot", "Léon Gambetta"], "Le journaliste Émile de Girardin la popularise au XIXe siècle."],
        ["Ô Liberté, que de crimes on commet en ton nom !", ["Madame Roland", "Olympe de Gouges", "Charlotte Corday", "Marie-Antoinette"], "Elle la prononcerait avant d'être guillotinée, en 1793."],
        ["Courage, on les aura !", ["Philippe Pétain", "Joseph Joffre", "Ferdinand Foch", "Georges Clemenceau"], "Il l'écrit dans un ordre du jour à Verdun, en 1916."]
      ]
    ],
    geopo: [
      [
        ["Yes, we can.", ["Barack Obama", "Bill Clinton", "Joe Biden", "Donald Trump"], "C'est le slogan de sa campagne de 2008."],
        ["Monsieur Gorbatchev, abattez ce mur !", ["Ronald Reagan", "George Bush", "Jimmy Carter", "Bill Clinton"], "Il le déclare à Berlin-Ouest en juin 1987."],
        ["Je fais un rêve.", ["Martin Luther King", "Malcolm X", "Nelson Mandela", "Rosa Parks"], "Il prononce ce discours à Washington, le 28 août 1963."],
        ["Le changement, c'est maintenant.", ["François Hollande", "Nicolas Sarkozy", "François Mitterrand", "Emmanuel Macron"], "C'est son slogan de campagne en 2012."],
        ["Travailler plus pour gagner plus.", ["Nicolas Sarkozy", "Jacques Chirac", "François Hollande", "François Fillon"], "Le slogan de sa campagne de 2007."],
        ["La force tranquille.", ["François Mitterrand", "Valéry Giscard d'Estaing", "Georges Pompidou", "Jacques Chirac"], "C'est l'affiche de sa campagne de 1981."]
      ],
      [
        ["Notre maison brûle et nous regardons ailleurs.", ["Jacques Chirac", "Nicolas Hulot", "Emmanuel Macron", "Al Gore"], "Il la prononce au sommet de Johannesburg, en 2002."],
        ["La démocratie est le pire des régimes, à l'exception de tous les autres.", ["Winston Churchill", "Charles de Gaulle", "Georges Clemenceau", "Franklin Roosevelt"], "Il la prononce aux Communes en 1947."],
        ["Tout ce qui est excessif est insignifiant.", ["Talleyrand", "Fouché", "Mazarin", "Richelieu"], "Attribuée au diplomate Talleyrand."],
        ["Nous n'avons pas d'amis éternels, nous n'avons pas d'ennemis perpétuels, nous n'avons que des intérêts éternels.", ["Lord Palmerston", "Winston Churchill", "Benjamin Disraeli", "William Gladstone"], "Il parle des intérêts du Royaume-Uni, en 1848."],
        ["Du pain et des jeux !", ["Juvénal", "Cicéron", "Sénèque", "Tacite"], "Il critique ainsi le peuple romain, qui ne demande plus que cela."],
        ["La liberté commence où l'ignorance finit.", ["Victor Hugo", "Voltaire", "Jules Ferry", "Jean Jaurès"], "Victor Hugo l'écrit en faveur de l'instruction pour tous."]
      ],
      [
        ["Le pouvoir tend à corrompre, et le pouvoir absolu corrompt absolument.", ["Lord Acton", "Nicolas Machiavel", "Montesquieu", "Thomas Hobbes"], "Il l'écrit dans une lettre de 1887."],
        ["L'homme est un loup pour l'homme.", ["Thomas Hobbes", "Jean-Jacques Rousseau", "John Locke", "Nicolas Machiavel"], "Hobbes la reprend du poète latin Plaute dans le « Léviathan »."],
        ["L'homme est né libre, et partout il est dans les fers.", ["Jean-Jacques Rousseau", "Montesquieu", "Voltaire", "Diderot"], "C'est le début du « Contrat social » (1762)."],
        ["Je désapprouve ce que vous dites, mais je me battrai jusqu'au bout pour que vous ayez le droit de le dire.", ["Voltaire", "Montesquieu", "Denis Diderot", "Jean-Jacques Rousseau"], "Elle est attribuée à tort à Voltaire : elle est d'Evelyn Beatrice Hall (1906)."],
        ["La fin justifie les moyens.", ["Nicolas Machiavel", "Thomas Hobbes", "Richelieu", "Marc Aurèle"], "Résumé populaire de « Le Prince », jamais écrit tel quel par Machiavel."],
        ["La guerre est la continuation de la politique par d'autres moyens.", ["Carl von Clausewitz", "Sun Tzu", "Napoléon", "Nicolas Machiavel"], "Elle est tirée de son traité « De la guerre »."]
      ]
    ],
    arts: [
      [
        ["Être ou ne pas être, telle est la question.", ["William Shakespeare", "Molière", "Victor Hugo", "Jean Racine"], "C'est une réplique de Hamlet."],
        ["Je pense, donc je suis.", ["René Descartes", "Blaise Pascal", "Voltaire", "Jean-Jacques Rousseau"], "Elle est tirée du « Discours de la méthode » (1637)."],
        ["Le cœur a ses raisons que la raison ne connaît point.", ["Blaise Pascal", "René Descartes", "Michel de Montaigne", "La Rochefoucauld"], "Elle est tirée des « Pensées »."],
        ["On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.", ["Antoine de Saint-Exupéry", "Albert Camus", "Jacques Prévert", "Victor Hugo"], "C'est le renard qui la dit au Petit Prince."],
        ["Un seul être vous manque, et tout est dépeuplé.", ["Alphonse de Lamartine", "Victor Hugo", "Alfred de Musset", "Alfred de Vigny"], "Elle est tirée du poème « L'Isolement »."],
        ["Ce qui ne me tue pas me rend plus fort.", ["Friedrich Nietzsche", "Sigmund Freud", "Arthur Schopenhauer", "Emmanuel Kant"], "Elle est tirée du « Crépuscule des idoles »."]
      ],
      [
        ["L'enfer, c'est les autres.", ["Jean-Paul Sartre", "Albert Camus", "Simone de Beauvoir", "Samuel Beckett"], "Elle est tirée de la pièce « Huis clos » (1944)."],
        ["Il faut imaginer Sisyphe heureux.", ["Albert Camus", "Jean-Paul Sartre", "Emil Cioran", "André Malraux"], "Elle conclut « Le Mythe de Sisyphe » (1942)."],
        ["Je est un autre.", ["Arthur Rimbaud", "Charles Baudelaire", "Paul Verlaine", "Stéphane Mallarmé"], "Il l'écrit en 1871 dans une lettre à Paul Demeny."],
        ["Longtemps, je me suis couché de bonne heure.", ["Marcel Proust", "Gustave Flaubert", "Émile Zola", "André Gide"], "C'est la première phrase de « Du côté de chez Swann »."],
        ["La beauté sauvera le monde.", ["Fiodor Dostoïevski", "Léon Tolstoï", "Anton Tchekhov", "Alexandre Pouchkine"], "Elle est prononcée dans « L'Idiot »."],
        ["L'art est un mensonge qui nous fait comprendre la vérité.", ["Pablo Picasso", "Henri Matisse", "Salvador Dalí", "Georges Braque"], "Il l'a dit en 1923."]
      ],
      [
        ["Ceci n'est pas une pipe.", ["René Magritte", "Salvador Dalí", "Max Ernst", "Joan Miró"], "Elle est écrite sous une pipe peinte dans « La Trahison des images » (1929)."],
        ["La terre est bleue comme une orange.", ["Paul Éluard", "Louis Aragon", "André Breton", "Jacques Prévert"], "Elle ouvre le recueil « L'Amour la poésie » (1929)."],
        ["Dieu est mort.", ["Friedrich Nietzsche", "Søren Kierkegaard", "Ludwig Feuerbach", "Karl Marx"], "Elle est tirée du « Gai Savoir »."],
        ["Il n'y a pas de hors-texte.", ["Jacques Derrida", "Michel Foucault", "Roland Barthes", "Jacques Lacan"], "Elle est tirée de « De la grammatologie » (1967)."],
        ["Le bonheur est une idée neuve en Europe.", ["Saint-Just", "Robespierre", "Danton", "Marat"], "Il la prononce à la Convention, en 1794."],
        ["Le style, c'est l'homme même.", ["Buffon", "Denis Diderot", "Montesquieu", "Voltaire"], "Il la prononce lors de son discours de réception à l'Académie, en 1753."]
      ]
    ],
    sciences: [
      [
        ["Eurêka !", ["Archimède", "Euclide", "Pythagore", "Aristote"], "On raconte qu'il la crie dans son bain, après avoir compris la poussée."],
        ["Et pourtant elle tourne.", ["Galilée", "Nicolas Copernic", "Johannes Kepler", "Isaac Newton"], "Elle lui est attribuée après son procès de 1633."],
        ["Rien ne se perd, rien ne se crée, tout se transforme.", ["Antoine Lavoisier", "Louis Pasteur", "Marie Curie", "Dmitri Mendeleïev"], "C'est un résumé de la conservation de la masse."],
        ["Houston, nous avons eu un problème.", ["Jim Lovell", "Neil Armstrong", "Buzz Aldrin", "Youri Gagarine"], "Cette phrase est lancée lors de la mission Apollo 13, en 1970."],
        ["Je ne sais qu'une chose, c'est que je ne sais rien.", ["Socrate", "Platon", "Aristote", "Diogène"], "Elle est attribuée à Socrate par Platon."],
        ["Dans les champs de l'observation, le hasard ne favorise que les esprits préparés.", ["Louis Pasteur", "Claude Bernard", "Marie Curie", "Alexander Fleming"], "Il la prononce en 1854 à Lille."]
      ],
      [
        ["Dieu ne joue pas aux dés.", ["Albert Einstein", "Niels Bohr", "Max Planck", "Werner Heisenberg"], "Il exprimait ainsi son désaccord avec la mécanique quantique."],
        ["Science sans conscience n'est que ruine de l'âme.", ["François Rabelais", "Michel de Montaigne", "Blaise Pascal", "René Descartes"], "Elle est tirée de « Pantagruel » (1532)."],
        ["Dans la vie, rien n'est à craindre, tout est à comprendre.", ["Marie Curie", "Rosalind Franklin", "Louise Michel", "Simone Veil"], "Elle est attribuée à Marie Curie."],
        ["Donnez-moi un point d'appui et je soulèverai le monde.", ["Archimède", "Galilée", "Isaac Newton", "Léonard de Vinci"], "Il parlait de la puissance du levier."],
        ["Le génie, c'est 1 % d'inspiration et 99 % de transpiration.", ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"], "Il la prononce à propos de son travail d'inventeur."],
        ["Le silence éternel de ces espaces infinis m'effraie.", ["Blaise Pascal", "Galilée", "Johannes Kepler", "René Descartes"], "Elle est tirée des « Pensées »."]
      ],
      [
        ["Si j'ai vu plus loin, c'est en me tenant sur les épaules de géants.", ["Isaac Newton", "Galilée", "Johannes Kepler", "Robert Hooke"], "Il l'écrit en 1675 dans une lettre."],
        ["Le livre de la nature est écrit en langage mathématique.", ["Galilée", "Isaac Newton", "René Descartes", "Johannes Kepler"], "Elle est tirée de « L'Essayeur » (1623)."],
        ["L'homme n'est qu'un roseau, le plus faible de la nature ; mais c'est un roseau pensant.", ["Blaise Pascal", "René Descartes", "Michel de Montaigne", "Jean de La Fontaine"], "Elle est tirée des « Pensées »."],
        ["Un esprit sain dans un corps sain.", ["Juvénal", "Cicéron", "Sénèque", "Ovide"], "Le poète latin écrit « Mens sana in corpore sano »."],
        ["Tout est nombre.", ["Pythagore", "Platon", "Euclide", "Thalès"], "C'est la devise de l'école pythagoricienne."],
        ["Une nouvelle vérité scientifique ne triomphe pas en convainquant ses adversaires, mais parce que ceux-ci finissent par mourir.", ["Max Planck", "Niels Bohr", "Werner Heisenberg", "Erwin Schrödinger"], "On parle du « principe de Planck »."]
      ]
    ]
  };

  const INTRUS_ADD = {
    hist: [
      [
        I("Gandhi", "Louis XIV", "Henri IV", "Napoléon", "Gandhi est indien ; les trois autres ont dirigé la France."),
        I("Napoléon", "Christophe Colomb", "Magellan", "Vasco de Gama", "Les trois autres étaient des navigateurs ; Napoléon était un empereur."),
        I("Les Vikings", "Les Romains", "Les Grecs", "Les Phéniciens", "Les trois autres dominaient la Méditerranée antique ; les Vikings venaient de Scandinavie."),
        I("Louis Pasteur", "Charles de Gaulle", "Georges Clemenceau", "Léon Blum", "Pasteur était un scientifique ; les trois autres ont dirigé le gouvernement français."),
        I("Verdun", "Austerlitz", "Waterloo", "Wagram", "Verdun date de 1916 ; les trois autres sont des batailles napoléoniennes."),
        I("Louis XVI", "Cléopâtre", "Néfertiti", "Hatchepsout", "Louis XVI était roi de France ; les trois autres, reines ou pharaonnes d'Égypte.")
      ],
      [
        I("Hannibal", "Jules César", "Auguste", "Néron", "Hannibal était carthaginois ; les trois autres étaient romains."),
        I("Charles Quint", "Louis XIV", "Louis XV", "Louis XVI", "Charles Quint régnait sur l'Empire et l'Espagne ; les autres, sur la France."),
        I("Winston Churchill", "Staline", "Lénine", "Trotski", "Churchill était britannique ; les trois autres, dirigeants soviétiques."),
        I("Philippe Pétain", "Charles de Gaulle", "Georges Pompidou", "Valéry Giscard d'Estaing", "Pétain n'a jamais été président de la Ve République."),
        I("Carthage", "Pompéi", "Herculanum", "Stabies", "Carthage, en Tunisie, n'a pas été touchée par l'éruption du Vésuve en 79."),
        I("La Déclaration d'indépendance", "Le Code civil", "Le Concordat", "La Légion d'honneur", "La Déclaration d'indépendance est américaine ; les autres sont des créations de Napoléon.")
      ],
      [
        I("Hugues Capet", "Clovis", "Pépin le Bref", "Charlemagne", "Hugues Capet règne à partir de 987 ; les autres sont des rois francs plus anciens."),
        I("Louis XIV", "Mazarin", "Richelieu", "Colbert", "Louis XIV était roi ; les trois autres étaient ministres."),
        I("Franklin Roosevelt", "Mussolini", "Hitler", "Franco", "Roosevelt dirigeait une démocratie ; les trois autres, des régimes autoritaires."),
        I("Versailles", "Yalta", "Potsdam", "Téhéran", "Versailles (1919) concerne la Première Guerre ; les autres, la Seconde."),
        I("Isaac Newton", "René Descartes", "Blaise Pascal", "Voltaire", "Newton était anglais ; les trois autres, français."),
        I("Cicéron", "Périclès", "Socrate", "Platon", "Cicéron était romain ; les trois autres, athéniens.")
      ]
    ],
    geo: [
      [
        I("Sydney", "Madrid", "Paris", "Rome", "Sydney n'est pas une capitale ; celle de l'Australie est Canberra."),
        I("Le Nil", "La Loire", "La Seine", "Le Rhône", "Le Nil est un fleuve africain ; les autres sont français."),
        I("Le Japon", "L'Espagne", "La France", "L'Italie", "Le Japon n'est pas en Europe."),
        I("L'Amazone", "Le Sahara", "Le Gobi", "Le Kalahari", "L'Amazone est un fleuve ; les autres sont des déserts."),
        I("La Méditerranée", "Le Pacifique", "L'Atlantique", "L'océan Indien", "La Méditerranée est une mer ; les autres sont des océans."),
        I("Lima", "Tokyo", "Pékin", "Séoul", "Lima est en Amérique du Sud ; les autres capitales sont en Asie.")
      ],
      [
        I("Le Mississippi", "Le Danube", "Le Rhin", "L'Elbe", "Le Mississippi est américain ; les autres coulent en Europe."),
        I("L'Everest", "Le mont Blanc", "Le Cervin", "Le mont Rose", "L'Everest est dans l'Himalaya ; les autres, dans les Alpes."),
        I("La Belgique", "La Suisse", "L'Autriche", "Le Luxembourg", "La Belgique a une côte ; les trois autres n'ont pas d'accès à la mer."),
        I("Le Brésil", "Le Kenya", "L'Éthiopie", "Le Nigeria", "Le Brésil est en Amérique du Sud ; les autres sont africains."),
        I("Lisbonne", "Barcelone", "Valence", "Séville", "Lisbonne est portugaise ; les autres villes sont espagnoles."),
        I("L'Islande", "La Corse", "La Sardaigne", "La Sicile", "L'Islande est dans l'Atlantique ; les autres sont des îles de la Méditerranée.")
      ],
      [
        I("Madrid", "Brasilia", "Lima", "Quito", "Madrid est en Europe ; les autres capitales sont sud-américaines."),
        I("La Vistule", "Le Tage", "Le Douro", "L'Èbre", "La Vistule coule en Pologne ; les autres, dans la péninsule ibérique."),
        I("L'Ukraine", "L'Arménie", "La Géorgie", "L'Azerbaïdjan", "Les trois autres pays sont dans le Caucase."),
        I("L'Égypte", "Le Maroc", "L'Algérie", "La Tunisie", "L'Égypte n'est pas dans le Maghreb."),
        I("Le Cervin", "Le Kilimandjaro", "Le mont Kenya", "Le Ruwenzori", "Le Cervin est dans les Alpes ; les autres sommets sont en Afrique."),
        I("La Loire", "Le Pô", "Le Tibre", "L'Arno", "La Loire coule en France ; les autres fleuves coulent en Italie.")
      ]
    ],
    sport: [
      [
        I("Le piano", "Le tennis", "Le football", "Le rugby", "Le piano est un instrument de musique."),
        I("Roger Federer", "Lionel Messi", "Cristiano Ronaldo", "Kylian Mbappé", "Federer joue au tennis ; les trois autres au football."),
        I("Un pinceau", "Un ballon", "Une raquette", "Un maillot", "Un pinceau sert à peindre, pas à jouer."),
        I("Les échecs", "La natation", "Le judo", "L'escrime", "Les échecs ne sont pas une discipline olympique."),
        I("Le Tour de France", "Roland-Garros", "Wimbledon", "L'US Open", "Le Tour est une course de vélo ; les autres sont des tournois de tennis."),
        I("Teddy Riner", "Zinédine Zidane", "Michel Platini", "Kylian Mbappé", "Riner est judoka ; les trois autres, footballeurs.")
      ],
      [
        I("Lionel Messi", "Rafael Nadal", "Roger Federer", "Novak Djokovic", "Messi joue au football ; les autres au tennis."),
        I("Le marathon", "Le slalom", "Le biathlon", "Le saut à ski", "Le marathon est une course à pied ; les autres sont des sports d'hiver."),
        I("Les Lakers", "Le Real Madrid", "Le FC Barcelone", "Le Bayern Munich", "Les Lakers jouent au basket ; les autres au football."),
        I("Un coup franc", "Un essai", "Une mêlée", "Une touche", "Le coup franc est une règle du football ; les autres, du rugby."),
        I("Le dribble", "Le smash", "Le lob", "Le revers", "Le dribble se fait au football ou au basket ; les autres sont des coups de tennis."),
        I("Tiger Woods", "Michael Jordan", "LeBron James", "Kobe Bryant", "Woods joue au golf ; les autres au basket.")
      ],
      [
        I("Michael Phelps", "Ayrton Senna", "Alain Prost", "Michael Schumacher", "Phelps est nageur ; les autres, pilotes de F1."),
        I("Le javelot", "L'épée", "Le fleuret", "Le sabre", "Le javelot est une épreuve d'athlétisme ; les autres sont des armes d'escrime."),
        I("L'ace", "Le hat-trick", "Le but", "Le penalty", "L'ace est un terme de tennis ; les autres, de football."),
        I("Rafael Nadal", "Bernard Hinault", "Eddy Merckx", "Miguel Indurain", "Nadal est tennisman ; les autres, cyclistes."),
        I("Le water-polo", "Le curling", "Le hockey sur glace", "Le patinage", "Le water-polo se joue en piscine ; les autres sur la glace."),
        I("Le Camp Nou", "Le Stade de France", "Le Parc des Princes", "Le Vélodrome", "Le Camp Nou est à Barcelone ; les autres stades sont en France.")
      ]
    ],
    cine: [
      [
        I("Les Simpson", "Titanic", "Avatar", "Jurassic Park", "Les Simpson est une série ; les trois autres sont des films."),
        I("Mercedes", "Pixar", "DreamWorks", "Disney", "Mercedes est un constructeur automobile ; les autres sont des studios d'animation."),
        I("Harry Potter", "Simba", "Nemo", "Woody", "Harry Potter est un héros de films en prises de vues réelles ; les autres, d'animation."),
        I("Sherlock Holmes", "Spider-Man", "Batman", "Superman", "Sherlock Holmes est un détective ; les autres, des super-héros."),
        I("Lionel Messi", "Leonardo DiCaprio", "Tom Cruise", "Brad Pitt", "Messi est footballeur ; les autres, acteurs."),
        I("Lourdes", "Cannes", "Venise", "Berlin", "Lourdes n'a pas de festival de cinéma de premier plan ; les autres, oui.")
      ],
      [
        I("Ernest Hemingway", "Steven Spielberg", "Martin Scorsese", "Christopher Nolan", "Hemingway était écrivain ; les autres, réalisateurs."),
        I("Alfred Hitchcock", "François Truffaut", "Jean-Luc Godard", "Éric Rohmer", "Hitchcock était britannique ; les autres, de la Nouvelle Vague."),
        I("Matrix", "Amélie", "Intouchables", "La Haine", "Matrix est américain ; les autres sont des films français."),
        I("Tom Hanks", "Omar Sy", "Jean Dujardin", "Marion Cotillard", "Hanks est américain ; les autres sont français."),
        I("Rocky", "Le Parrain", "Les Affranchis", "Scarface", "Rocky est un film de boxe ; les autres parlent de la mafia."),
        I("Shrek", "Cars", "Toy Story", "Ratatouille", "Shrek est de DreamWorks ; les autres, de Pixar.")
      ],
      [
        I("Ingmar Bergman", "Akira Kurosawa", "Hayao Miyazaki", "Yasujirō Ozu", "Bergman était suédois ; les autres, japonais."),
        I("Luis Buñuel", "Federico Fellini", "Luchino Visconti", "Pier Paolo Pasolini", "Buñuel était espagnol ; les autres, italiens."),
        I("Les Dents de la mer", "Alien", "Blade Runner", "Gladiator", "Les Dents de la mer est de Spielberg ; les autres, de Ridley Scott."),
        I("Le Parrain", "Psychose", "Les Oiseaux", "Vertigo", "Le Parrain est de Coppola ; les autres, d'Hitchcock."),
        I("Marlon Brando", "Gérard Depardieu", "Alain Delon", "Jean-Paul Belmondo", "Brando était américain ; les autres, français."),
        I("Les Visiteurs", "Amélie Poulain", "Delicatessen", "La Cité des enfants perdus", "Les Visiteurs est de Poiré ; les autres, de Jean-Pierre Jeunet.")
      ]
    ]
  };

  const SIGLES_ADD = {
    inst: [
      [
        S("UE", "Union européenne", "Union économique", "Unité européenne", "Union des États", "L'UE compte 27 États membres."),
        S("FMI", "Fonds monétaire international", "Fédération mondiale de l'industrie", "Fonds mondial des investisseurs", "Forum monétaire interne", "Il siège à Washington."),
        S("OMS", "Organisation mondiale de la santé", "Office mondial des sciences", "Organisation médicale suisse", "Ordre mondial de la santé", "Elle siège à Genève."),
        S("UNESCO", "Organisation des Nations unies pour l'éducation, la science et la culture", "Union nationale des écoles et centres d'organisation", "Union des nations pour l'éducation sociale", "Office national de la culture", "Elle classe les sites du patrimoine mondial."),
        S("PIB", "Produit intérieur brut", "Produit interne budgétaire", "Prix intérieur brut", "Plan d'investissement brut", "Il mesure la richesse produite dans un pays."),
        S("OMC", "Organisation mondiale du commerce", "Office mondial des cultures", "Organisation des marchés communs", "Ordre mondial du capital", "Elle siège à Genève.")
      ],
      [
        S("CNIL", "Commission nationale de l'informatique et des libertés", "Centre national d'information légale", "Comité national des internautes libres", "Conseil national de l'identité numérique", "Elle veille à la protection des données personnelles."),
        S("INSEE", "Institut national de la statistique et des études économiques", "Institut national des services économiques européens", "Institut national de la sécurité et de l'emploi", "Institut national des sciences et de l'économie", "Il publie l'inflation et le chômage."),
        S("OPEP", "Organisation des pays exportateurs de pétrole", "Organisation des producteurs européens de pétrole", "Office mondial du pétrole", "Organisation pour l'énergie propre", "Elle a été fondée en 1960."),
        S("CIO", "Comité international olympique", "Conseil international des organisations", "Comité interne des olympiades", "Centre international omnisports", "Il siège à Lausanne."),
        S("ONG", "Organisation non gouvernementale", "Office national de gestion", "Organisation nationale générale", "Ordre non gouvernemental", "Greenpeace et Médecins sans frontières en sont des exemples."),
        S("BCE", "Banque centrale européenne", "Banque commune d'Europe", "Bureau central de l'euro", "Banque de crédit européenne", "Elle siège à Francfort.")
      ],
      [
        S("OCDE", "Organisation de coopération et de développement économiques", "Office central de développement européen", "Organisation des contrats et du droit économique", "Organisation de contrôle des dettes européennes", "Elle a son siège à Paris."),
        S("AIEA", "Agence internationale de l'énergie atomique", "Association internationale des États africains", "Agence interne d'énergie alternative", "Alliance internationale pour l'environnement", "Elle siège à Vienne."),
        S("ASEAN", "Association des nations de l'Asie du Sud-Est", "Alliance des États d'Asie orientale", "Association des États africains du Nord", "Assemblée des nations d'Asie", "Elle a été fondée en 1967."),
        S("HCR", "Haut-Commissariat des Nations unies pour les réfugiés", "Haut Conseil de la recherche", "Haute Cour de la République", "Haut-Commissariat aux réformes", "Il aide les personnes réfugiées."),
        S("CPI", "Cour pénale internationale", "Conseil permanent international", "Comité pour la paix internationale", "Commission de la presse internationale", "Elle siège à La Haye."),
        S("CEDEAO", "Communauté économique des États de l'Afrique de l'Ouest", "Conseil européen des affaires ouest-africaines", "Comité économique des États d'Asie occidentale", "Centre des échanges de l'Afrique de l'Ouest", "Elle regroupe des pays d'Afrique de l'Ouest.")
      ]
    ],
    quot: [
      [
        S("SNCF", "Société nationale des chemins de fer français", "Société nationale du commerce ferroviaire", "Service national des chemins de fer", "Syndicat des cheminots français", "Fondée en 1938."),
        S("SMS", "Short Message Service", "Simple Mail System", "Send My Signal", "Smart Mobile Service", "Le premier SMS date de 1992."),
        S("TVA", "Taxe sur la valeur ajoutée", "Taxe de vente annuelle", "Taux de valeur ajoutée", "Taxe volontaire administrative", "Elle s'applique à la plupart des achats."),
        S("RIB", "Relevé d'identité bancaire", "Registre d'information bancaire", "Relevé interne de banque", "Reçu d'identité bancaire", "Il contient l'IBAN."),
        S("SMIC", "Salaire minimum interprofessionnel de croissance", "Salaire moyen interne de croissance", "Service minimum intérimaire collectif", "Salaire minimal indexé commun", "Il est révisé au moins une fois par an."),
        S("CDI", "Contrat à durée indéterminée", "Contrat de droit individuel", "Compte de dépôt indexé", "Certificat de droit d'intérim", "C'est la forme la plus courante de contrat de travail.")
      ],
      [
        S("QR code", "Quick Response code", "Quality Reference code", "Quantum Record code", "Quick Reader code", "Inventé au Japon par Denso Wave en 1994."),
        S("AOP", "Appellation d'origine protégée", "Association des origines publiques", "Appellation officielle de production", "Agrément d'origine particulière", "Elle protège des produits comme le roquefort."),
        S("HLM", "Habitation à loyer modéré", "Habitat léger modulable", "Hôtel de logement municipal", "Habitation de longue maintenance", "Ces logements sont destinés aux foyers modestes."),
        S("PACS", "Pacte civil de solidarité", "Plan d'aide à la consommation sociale", "Pacte d'assurance de couple", "Protocole administratif civil", "Il date de 1999."),
        S("DAB", "Distributeur automatique de billets", "Dépôt automatique de billets", "Distributeur d'argent bancaire", "Dispositif d'accès bancaire", "On l'appelle aussi guichet automatique."),
        S("GPS", "Global Positioning System", "General Position Signal", "Global Planet Satellite", "Geographic Path System", "Il repose sur des satellites américains.")
      ],
      [
        S("URSSAF", "Union de recouvrement des cotisations de sécurité sociale et d'allocations familiales", "Union régionale des services sociaux", "Union des régimes de sécurité", "Union de répartition des salaires", "Elle collecte les cotisations sociales."),
        S("IBAN", "International Bank Account Number", "Internal Bank Access Network", "International Banking Agreement Number", "Interbank Account Name", "Il identifie un compte bancaire à l'étranger."),
        S("RGPD", "Règlement général sur la protection des données", "Règlement général des paiements dématérialisés", "Régime général de protection numérique", "Registre des gestionnaires de données personnelles", "Il est applicable depuis 2018."),
        S("PEL", "Plan d'épargne logement", "Placement épargne long terme", "Plan d'économie locale", "Prêt à l'équipement du logement", "C'est un produit d'épargne."),
        S("CAF", "Caisse d'allocations familiales", "Centre d'aide familiale", "Caisse d'aide fiscale", "Comité d'accueil familial", "Elle verse les aides au logement."),
        S("RSA", "Revenu de solidarité active", "Régime de sécurité alimentaire", "Revenu social d'allocation", "Remboursement de la sécurité sociale", "Il a remplacé le RMI en 2009.")
      ]
    ],
    tech: [
      [
        S("USB", "Universal Serial Bus", "United System Box", "Ultra Speed Bluetooth", "Universal Signal Base", "Il permet de connecter des périphériques."),
        S("PDF", "Portable Document Format", "Printed Data File", "Personal Document Form", "Page Digital Format", "Il a été créé par Adobe."),
        S("IA", "Intelligence artificielle", "Interface automatique", "Information appliquée", "Ingénierie assistée", "Elle permet à des machines d'apprendre."),
        S("URL", "Uniform Resource Locator", "Universal Remote Link", "Unique Resource Line", "User Registered Location", "C'est l'adresse d'une page web."),
        S("PC", "Personal Computer", "Portable Console", "Power Core", "Private Circuit", "Le terme désigne un ordinateur personnel."),
        S("WWW", "World Wide Web", "Wide Web Window", "World Web Works", "Web Wide Wireless", "Inventé par Tim Berners-Lee en 1989.")
      ],
      [
        S("HTML", "HyperText Markup Language", "High Tech Machine Language", "Hyper Transfer Media Layer", "Home Text Markup Link", "C'est le langage des pages web."),
        S("LED", "Light Emitting Diode", "Low Energy Display", "Laser Emission Device", "Liquid Electric Display", "En français : diode électroluminescente."),
        S("CPU", "Central Processing Unit", "Computer Power Unit", "Core Processing Utility", "Central Program Update", "C'est le processeur d'un ordinateur."),
        S("ADN", "Acide désoxyribonucléique", "Acide diazoté nucléique", "Agent de duplication nucléaire", "Acide dynamique naturel", "Il porte l'information génétique."),
        S("IRM", "Imagerie par résonance magnétique", "Instrument de radiologie moderne", "Image de recherche médicale", "Imagerie à rayons mesurés", "Elle n'utilise pas de rayons X."),
        S("OGM", "Organisme génétiquement modifié", "Organisme géré par mutation", "Ordre génétique moléculaire", "Organisation des gènes mutés", "Son génome a été modifié par l'être humain.")
      ],
      [
        S("RAM", "Random Access Memory", "Rapid Access Module", "Read Application Memory", "Real Active Memory", "C'est la mémoire vive d'un ordinateur."),
        S("SONAR", "Sound Navigation and Ranging", "Sea Observation Network and Radar", "Sound Noise Analysis Radar", "Submarine Observation Navigation Alert Radar", "Il sert à détecter des objets sous l'eau."),
        S("RADAR", "Radio Detection And Ranging", "Rapid Aerial Detection And Radio", "Radio Analysis Device And Receiver", "Ray Detection And Recording", "Il détecte des objets grâce aux ondes radio."),
        S("PCR", "Polymerase Chain Reaction", "Protein Cell Research", "Pulse Control Reaction", "Particle Counting Radiation", "Cette technique amplifie l'ADN, notamment pour détecter le Covid."),
        S("ISS", "International Space Station", "Integrated Satellite System", "Interplanetary Space Shuttle", "International Solar System", "Elle orbite à environ 400 km d'altitude."),
        S("VPN", "Virtual Private Network", "Visual Protocol Node", "Verified Public Network", "Variable Port Number", "Il chiffre la connexion internet.")
      ]
    ]
  };

  // fusion : on ajoute à chaque case existante, sans doublon exact (même premier élément)
  const merge = (dest, add) => {
    Object.keys(add).forEach(theme => {
      if (!dest[theme]) return;
      add[theme].forEach((rows, lvl) => {
        if (!dest[theme][lvl]) return;
        const seen = new Set(dest[theme][lvl].map(r => r[0]));
        rows.forEach(r => { if (!seen.has(r[0])) { dest[theme][lvl].push(r); seen.add(r[0]); } });
      });
    });
  };
  merge(DATA.quiz, QUIZ);
  merge(QUOTES, QUOTES_ADD);
  merge(INTRUS, INTRUS_ADD);
  merge(SIGLES, SIGLES_ADD);
})();

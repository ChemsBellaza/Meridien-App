/* ============ v27 : 3 jeux de plus dans la rotation (Pop culture, Musique et chanson, Mythes et littérature) + Méga-quiz du dimanche ============
   Même principe que pQ_more.js : NEWQ[format][catégorie][niveau] = 8 questions [question, [bonne réponse, faux, faux, faux], « le saviez-vous »]. */
Object.assign(NEWQ, {
  popculture: {
    cinema: [
      [
        ["Qui a réalisé « Titanic » (1997) ?", ["James Cameron", "Steven Spielberg", "Ridley Scott", "Christopher Nolan"], "Le film a remporté 11 Oscars en 1998."],
        ["Dans quel film entend-on « Hakuna Matata » ?", ["Le Roi lion", "Aladdin", "La Reine des neiges", "Le Livre de la jungle"], "Cette chanson signifie « pas de soucis » en swahili."],
        ["Quel héros à lunettes étudie à Poudlard ?", ["Harry Potter", "Gandalf", "Merlin", "Percy Jackson"], "Il a une cicatrice en forme d'éclair sur le front."],
        ["Quel acteur joue le capitaine Jack Sparrow dans « Pirates des Caraïbes » ?", ["Johnny Depp", "Brad Pitt", "Orlando Bloom", "Tom Cruise"], "Il a été nommé à l'Oscar pour ce rôle dès le premier film."],
        ["Dans « La Reine des neiges », quel est le prénom de la reine aux pouvoirs de glace ?", ["Elsa", "Anna", "Raiponce", "Ariel"], "Sa sœur s'appelle Anna."],
        ["Dans quel film d'animation un poisson-clown cherche-t-il son fils Nemo ?", ["Le Monde de Nemo", "Shrek", "Cars", "Ratatouille"], "Il est sorti en 2003, produit par Pixar."],
        ["Dans quelle saga entend-on « Que la Force soit avec toi » ?", ["Star Wars", "Matrix", "Avatar", "Jurassic Park"], "La saga a été lancée par George Lucas en 1977."],
        ["De quel pays vient le réalisateur Hayao Miyazaki ?", ["Le Japon", "La Chine", "La Corée du Sud", "Les États-Unis"], "Il a fondé le studio Ghibli."]
      ],
      [
        ["Quel film a obtenu 11 Oscars lors de la cérémonie de 1998 ?", ["Titanic", "Gladiator", "Forrest Gump", "Avatar"], "Il a égalé le record de « Ben-Hur »."],
        ["Qui a réalisé « Pulp Fiction » ?", ["Quentin Tarantino", "Martin Scorsese", "David Fincher", "Steven Spielberg"], "Le film a reçu la Palme d'or à Cannes en 1994."],
        ["Quel acteur joue Neo dans « Matrix » ?", ["Keanu Reeves", "Brad Pitt", "Will Smith", "Tom Hanks"], "Le film est sorti en 1999."],
        ["« Intouchables » (2011) est réalisé par Olivier Nakache et…", ["Éric Toledano", "Michel Hazanavicius", "Luc Besson", "Jean-Pierre Jeunet"], "Le film met en scène Omar Sy et François Cluzet."],
        ["Quel film français de 2001 suit une serveuse de Montmartre ?", ["Le Fabuleux Destin d'Amélie Poulain", "Intouchables", "La Haine", "Taxi"], "Réalisé par Jean-Pierre Jeunet, avec Audrey Tautou."],
        ["Qui joue le Joker dans « The Dark Knight » (2008) ?", ["Heath Ledger", "Joaquin Phoenix", "Jack Nicholson", "Jared Leto"], "Il a reçu un Oscar à titre posthume."],
        ["Dans quelle saga trouve-t-on la Terre du Milieu ?", ["Le Seigneur des anneaux", "Harry Potter", "Narnia", "Star Wars"], "Les films de Peter Jackson sont sortis entre 2001 et 2003."],
        ["Quel studio a produit « Toy Story », premier long métrage entièrement en images de synthèse ?", ["Pixar", "DreamWorks", "Illumination", "Studio Ghibli"], "Il est sorti en 1995."]
      ],
      [
        ["Qui a réalisé « 2001, l'Odyssée de l'espace » ?", ["Stanley Kubrick", "Ridley Scott", "George Lucas", "Steven Spielberg"], "Le film est sorti en 1968."],
        ["Quel film d'Alfred Hitchcock contient la célèbre scène de la douche ?", ["Psychose", "Les Oiseaux", "Sueurs froides", "La Mort aux trousses"], "Psychose date de 1960."],
        ["Quel film d'Akira Kurosawa a inspiré « Les Sept Mercenaires » ?", ["Les Sept Samouraïs", "Rashōmon", "Ran", "Dersou Ouzala"], "Il date de 1954."],
        ["Qui a réalisé « Le Parrain » (1972) ?", ["Francis Ford Coppola", "Martin Scorsese", "Brian De Palma", "Sidney Lumet"], "Marlon Brando y joue Don Vito Corleone."],
        ["Quel film d'Orson Welles (1941) est souvent classé parmi les plus grands de l'histoire ?", ["Citizen Kane", "Le Troisième Homme", "Casablanca", "La Soif du mal"], "Welles l'a réalisé à 25 ans."],
        ["Qui a réalisé « Les Quatre Cents Coups » (1959) ?", ["François Truffaut", "Jean-Luc Godard", "Éric Rohmer", "Claude Chabrol"], "Un film phare de la Nouvelle Vague."],
        ["Quel festival décerne la Palme d'or ?", ["Cannes", "Venise", "Berlin", "Deauville"], "Il se tient chaque année sur la Côte d'Azur."],
        ["Quelle actrice française a reçu l'Oscar de la meilleure actrice en 2008 pour « La Môme » ?", ["Marion Cotillard", "Juliette Binoche", "Isabelle Huppert", "Audrey Tautou"], "Elle y incarne Édith Piaf."]
      ]
    ],
    series: [
      [
        ["Dans « Friends », comment s'appelle le café où se retrouvent les amis ?", ["Central Perk", "Le Bean", "Starbucks", "Café Nerd"], "La série a duré dix saisons, de 1994 à 2004."],
        ["Quelle série suit Walter White, professeur de chimie devenu fabricant de drogue ?", ["Breaking Bad", "Dexter", "Lost", "Prison Break"], "Elle est diffusée de 2008 à 2013."],
        ["Dans « Game of Thrones », quel animal est l'emblème de la maison Stark ?", ["Le loup", "Le lion", "Le dragon", "Le cerf"], "Un loup gris sur fond blanc."],
        ["Dans quelle décennie se déroule « Stranger Things » ?", ["Les années 1980", "Les années 1960", "Les années 1990", "Les années 2000"], "La série a démarré en 2016."],
        ["Combien d'amis principaux compte la série « Friends » ?", ["6", "4", "5", "8"], "Rachel, Monica, Phoebe, Joey, Chandler et Ross."],
        ["Dans « La Casa de Papel », quelle ville abrite la Fabrique nationale de la monnaie visée par le Professeur ?", ["Madrid", "Barcelone", "Séville", "Lisbonne"], "La série est d'origine espagnole."],
        ["Dans quelle ville se déroule « Les Simpson » ?", ["Springfield", "Quahog", "South Park", "Bedrock"], "La série est diffusée depuis 1989."],
        ["De quel pays vient la série « Squid Game » ?", ["La Corée du Sud", "Le Japon", "La Chine", "Les États-Unis"], "Elle est devenue en 2021 l'une des séries les plus vues sur Netflix."]
      ],
      [
        ["Quelle série suit la famille Shelby à Birmingham ?", ["Peaky Blinders", "Downton Abbey", "The Crown", "Vikings"], "Cillian Murphy y joue Tommy Shelby."],
        ["Qui joue Michael Scott dans « The Office » (version américaine) ?", ["Steve Carell", "Ricky Gervais", "Jim Parsons", "Bill Hader"], "Ricky Gervais joue le rôle équivalent dans la version britannique."],
        ["Quelle série française met en scène un gentleman cambrioleur joué par Omar Sy ?", ["Lupin", "Au service de la France", "Le Bureau des légendes", "Dix pour cent"], "Elle s'inspire du personnage d'Arsène Lupin."],
        ["Dans quel milieu se déroule la série « Dix pour cent » ?", ["Les agents d'acteurs", "La police", "La cuisine", "La mode"], "Elle a été créée par Fanny Herrero."],
        ["Quelle série contient la célèbre réplique « Winter is coming » ?", ["Game of Thrones", "Vikings", "The Witcher", "Narnia"], "C'est la devise de la maison Stark."],
        ["Quel personnage dit « Bazinga ! » dans « The Big Bang Theory » ?", ["Sheldon Cooper", "Ross Geller", "Barney Stinson", "Chandler Bing"], "Il est joué par Jim Parsons."],
        ["Quelle série médicale suit le brillant et cynique docteur Gregory House ?", ["Dr House", "Grey's Anatomy", "Urgences", "Scrubs"], "Hugh Laurie y joue le rôle principal."],
        ["Qui a créé la série d'anthologie « Black Mirror » ?", ["Charlie Brooker", "Matt Groening", "Vince Gilligan", "David Simon"], "Elle imagine des futurs inquiétants liés à la technologie."]
      ],
      [
        ["Dans quelle ville se déroule la série « The Wire » ?", ["Baltimore", "New York", "Chicago", "Los Angeles"], "Elle a été créée par David Simon, ancien journaliste."],
        ["Quel est le prénom du héros de « Les Soprano » ?", ["Tony", "Paulie", "Silvio", "Carmine"], "James Gandolfini l'a incarné pendant six saisons."],
        ["Qui est le cocréateur de « Twin Peaks » ?", ["David Lynch", "Quentin Tarantino", "Tim Burton", "David Fincher"], "La série est sortie en 1990."],
        ["Qui interprète le roi Arthur dans « Kaamelott » ?", ["Alexandre Astier", "Jean-Christophe Hembert", "Christian Clavier", "Lionnel Astier"], "Il en est aussi le créateur."],
        ["Pour quel service travaillent les personnages du « Bureau des légendes » ?", ["La DGSE", "La DGSI", "La CIA", "Le MI6"], "La série a été créée par Éric Rochant."],
        ["Dans quel secteur travaille Don Draper dans « Mad Men » ?", ["La publicité", "La banque", "La presse", "Le cinéma"], "La série se passe dans les années 1960 à New York."],
        ["Qui a créé « Les Simpson » ?", ["Matt Groening", "Seth MacFarlane", "Trey Parker", "Mike Judge"], "Il a nommé la famille d'après des membres de sa propre famille."],
        ["De quel pays vient la série « Dark » ?", ["L'Allemagne", "La Suède", "L'Espagne", "Le Royaume-Uni"], "Elle joue avec les voyages dans le temps."]
      ]
    ],
    jeuxvideo: [
      [
        ["Quel plombier moustachu est la mascotte de Nintendo ?", ["Mario", "Sonic", "Link", "Pikachu"], "Il est apparu pour la première fois dans « Donkey Kong » en 1981."],
        ["Quel jeu consiste à faire tomber et assembler des blocs géométriques ?", ["Tetris", "Pac-Man", "Pong", "Snake"], "Il a été créé en 1984 par Alexeï Pajitnov."],
        ["Quel jeu propose de construire et d'explorer un monde de blocs ?", ["Minecraft", "Zelda", "FIFA", "Candy Crush"], "Il est l'un des jeux les plus vendus de l'histoire."],
        ["Quel hérisson bleu est la mascotte de Sega ?", ["Sonic", "Mario", "Crash Bandicoot", "Spyro"], "Il est connu pour sa vitesse."],
        ["Dans quelle série de jeux capture-t-on des créatures avec des Poké Balls ?", ["Pokémon", "Zelda", "Animal Crossing", "Kirby"], "Elle est née au Japon en 1996."],
        ["Quelle console Nintendo, à la fois portable et de salon, est sortie en 2017 ?", ["La Switch", "La Wii", "La DS", "La GameCube"], "Elle se glisse en mode portable ou se branche sur la télé."],
        ["Que mange le héros de « Pac-Man » ?", ["Des pastilles", "Des fruits", "Des étoiles", "Des champignons"], "Il évite quatre fantômes."],
        ["Comment s'appelle la princesse que Mario doit sauver ?", ["Peach", "Zelda", "Daisy", "Samus"], "Elle vit dans le royaume Champignon."]
      ],
      [
        ["Dans quelle série de jeux incarne-t-on Link ?", ["The Legend of Zelda", "Mario", "Metroid", "Kirby"], "Link n'est pas Zelda : c'est le héros."],
        ["Quel studio a développé « The Witcher 3 » ?", ["CD Projekt RED", "Ubisoft", "Bethesda", "Rockstar"], "C'est un studio polonais."],
        ["Quelle entreprise française produit la série « Assassin's Creed » ?", ["Ubisoft", "Quantic Dream", "Focus", "Atari"], "Elle a été fondée en Bretagne en 1986."],
        ["Quel studio a créé « Minecraft » ?", ["Mojang", "Epic Games", "Valve", "Blizzard"], "Il a été racheté par Microsoft en 2014."],
        ["Quelle console de Sony est sortie en 1994 au Japon ?", ["La PlayStation", "La PlayStation 2", "La PSP", "La Saturn"], "La Saturn était la rivale de Sega."],
        ["Dans « Animal Crossing », comment s'appelle le raton laveur qui prête de l'argent pour la maison ?", ["Tom Nook", "Isabelle", "Kéké", "Rosalina"], "Il apparaît dès le premier jeu."],
        ["Dans quelle série incarne-t-on Kratos ?", ["God of War", "Uncharted", "Halo", "Gears of War"], "Elle puise dans la mythologie grecque puis nordique."],
        ["Quel studio a créé « Fortnite » ?", ["Epic Games", "Valve", "Blizzard", "Riot Games"], "Le jeu est sorti en 2017."]
      ],
      [
        ["Qui est le créateur de Mario et de Zelda ?", ["Shigeru Miyamoto", "Hideo Kojima", "Satoru Iwata", "Gabe Newell"], "Il travaille chez Nintendo depuis 1977."],
        ["Quel jeu de 1972, publié par Atari, est l'un des premiers grands succès du jeu vidéo ?", ["Pong", "Tetris", "Space Invaders", "Pac-Man"], "Deux raquettes et une balle."],
        ["Dans quelle série le héros s'appelle-t-il Master Chief ?", ["Halo", "Doom", "Call of Duty", "Mass Effect"], "Elle est née sur la première Xbox."],
        ["Quel studio japonais a créé la série « Dark Souls » ?", ["FromSoftware", "Capcom", "Square Enix", "Naughty Dog"], "Elle est réputée pour sa grande difficulté."],
        ["Quelle série de jeux met en scène l'aventurière Lara Croft ?", ["Tomb Raider", "Uncharted", "Resident Evil", "Prince of Persia"], "Le premier jeu date de 1996."],
        ["Quel jeu de cartes numérique de Blizzard est sorti en 2014 ?", ["Hearthstone", "Gwent", "Legends of Runeterra", "Magic Arena"], "Il se déroule dans l'univers de Warcraft."],
        ["Dans quel pays le jeu « Tetris » a-t-il été créé ?", ["L'Union soviétique", "Les États-Unis", "Le Japon", "Le Royaume-Uni"], "Alexeï Pajitnov l'a imaginé à Moscou."],
        ["Quel jeu Nintendo de 2017 propose un monde ouvert dans le royaume d'Hyrule ?", ["Breath of the Wild", "Ocarina of Time", "Skyward Sword", "Twilight Princess"], "Il est sorti avec la console Switch."]
      ]
    ]
  },

  chanson: {
    francaise: [
      [
        ["Qui chante « La Vie en rose » ?", ["Édith Piaf", "Dalida", "Mireille Mathieu", "Barbara"], "La chanson date de 1947."],
        ["Qui a chanté « Alors on danse » ?", ["Stromae", "Maître Gims", "Soprano", "Orelsan"], "Le titre est sorti en 2009."],
        ["De quel pays vient le chanteur Stromae ?", ["La Belgique", "La France", "La Suisse", "Le Canada"], "Il est né à Bruxelles."],
        ["Qui a chanté « Ne me quitte pas » ?", ["Jacques Brel", "Georges Brassens", "Charles Aznavour", "Serge Gainsbourg"], "Elle date de 1959."],
        ["Quel groupe français de musique électronique se cache derrière des casques de robots ?", ["Daft Punk", "Justice", "Air", "Phoenix"], "Il est formé de Thomas Bangalter et Guy-Manuel de Homem-Christo."],
        ["Qui a chanté « Je t'aime… moi non plus » avec Jane Birkin ?", ["Serge Gainsbourg", "Johnny Hallyday", "Michel Sardou", "Claude François"], "La chanson date de 1969."],
        ["Quel chanteur est surnommé « l'idole des jeunes » ?", ["Johnny Hallyday", "Eddy Mitchell", "Claude François", "Antoine"], "Il est décédé en 2017."],
        ["Quelle chanteuse québécoise a chanté « My Heart Will Go On » ?", ["Céline Dion", "Diane Dufresne", "Isabelle Boulay", "Alanis Morissette"], "C'est la chanson du film « Titanic »."]
      ],
      [
        ["Qui a chanté « Les Champs-Élysées » (1969) ?", ["Joe Dassin", "Michel Sardou", "Claude Nougaro", "Hervé Vilard"], "Elle est adaptée d'un titre anglais, « Waterloo Road »."],
        ["Qui a chanté « La Bohème » ?", ["Charles Aznavour", "Jacques Brel", "Yves Montand", "Georges Moustaki"], "Elle date de 1965."],
        ["Quelle chanteuse a chanté « Non, je ne regrette rien » ?", ["Édith Piaf", "Dalida", "Barbara", "Juliette Gréco"], "Elle l'a enregistrée en 1960."],
        ["Qui a chanté « Formidable » ?", ["Stromae", "Gims", "Soprano", "Vianney"], "Le clip a été tourné caméra cachée à Bruxelles."],
        ["Quel groupe de rap marseillais a chanté « Je danse le mia » ?", ["IAM", "NTM", "MC Solaar", "Assassin"], "Akhenaton en est le chanteur."],
        ["Qui a chanté « La Mer » en 1946 ?", ["Charles Trenet", "Georges Brassens", "Jacques Brel", "Yves Montand"], "Elle a été reprise par des centaines d'artistes."],
        ["Qui a chanté « Le Sud » ?", ["Nino Ferrer", "Michel Polnareff", "Claude François", "Jean Ferrat"], "La chanson date de 1975."],
        ["Qui a chanté « Tous les garçons et les filles » ?", ["Françoise Hardy", "Sylvie Vartan", "Sheila", "France Gall"], "Elle l'a chantée en 1962, à 18 ans."]
      ],
      [
        ["Qui a écrit et chanté « Le Déserteur » ?", ["Boris Vian", "Georges Brassens", "Léo Ferré", "Jean Ferrat"], "La chanson fut censurée en 1954."],
        ["Qui a chanté « Les Copains d'abord » ?", ["Georges Brassens", "Jacques Brel", "Léo Ferré", "Renaud"], "Elle évoque le bateau « Les Copains d'abord »."],
        ["Qui a chanté « Poupée de cire, poupée de son » ?", ["France Gall", "Sheila", "Sylvie Vartan", "Françoise Hardy"], "Elle a remporté l'Eurovision 1965 pour le Luxembourg."],
        ["Qui a gagné l'Eurovision 1977 pour la France avec « L'Oiseau et l'Enfant » ?", ["Marie Myriam", "Séverine", "Catherine Ferry", "Nicole"], "C'est la dernière victoire française au concours."],
        ["Qui chante « Les Lacs du Connemara » ?", ["Michel Sardou", "Johnny Hallyday", "Jean-Jacques Goldman", "Daniel Balavoine"], "La chanson date de 1981."],
        ["Qui chante « L'Aziza » ?", ["Daniel Balavoine", "Jean-Jacques Goldman", "Michel Berger", "Renaud"], "Il est décédé en 1986."],
        ["Qui a chanté « Le Poinçonneur des Lilas » ?", ["Serge Gainsbourg", "Léo Ferré", "Georges Brassens", "Boris Vian"], "C'est son premier succès, en 1958."],
        ["Qui a chanté « Né quelque part » ?", ["Maxime Le Forestier", "Yves Duteil", "Renaud", "Francis Cabrel"], "La chanson date de 1988."]
      ]
    ],
    internationale: [
      [
        ["Quel groupe a chanté « Bohemian Rhapsody » ?", ["Queen", "The Beatles", "Pink Floyd", "ABBA"], "Le chanteur du groupe était Freddie Mercury."],
        ["Quel artiste est surnommé « le roi de la pop » ?", ["Michael Jackson", "Elvis Presley", "Prince", "Justin Timberlake"], "Son album « Thriller » est sorti en 1982."],
        ["Quel groupe de Liverpool a chanté « Yesterday » ?", ["The Beatles", "The Rolling Stones", "Oasis", "Queen"], "C'est l'une des chansons les plus reprises de l'histoire."],
        ["Quelle chanteuse britannique a sorti « Rolling in the Deep » ?", ["Adele", "Beyoncé", "Rihanna", "Lady Gaga"], "Le titre est sorti en 2010."],
        ["Quel chanteur a sorti « Shape of You » ?", ["Ed Sheeran", "Bruno Mars", "Justin Bieber", "Harry Styles"], "Le titre est sorti en 2017."],
        ["Quel groupe suédois a chanté « Dancing Queen » ?", ["ABBA", "Roxette", "Europe", "The Cardigans"], "Il a remporté l'Eurovision 1974 avec « Waterloo »."],
        ["Qui a chanté « Billie Jean » ?", ["Michael Jackson", "Prince", "Stevie Wonder", "Lionel Richie"], "Elle contient une célèbre ligne de basse."],
        ["Quelle chanteuse est surnommée « Queen B » ?", ["Beyoncé", "Rihanna", "Shakira", "Adele"], "Elle a commencé avec les Destiny's Child."]
      ],
      [
        ["Qui a chanté « Like a Rolling Stone » ?", ["Bob Dylan", "Bruce Springsteen", "Neil Young", "Leonard Cohen"], "Il a reçu le prix Nobel de littérature en 2016."],
        ["Quel album de Pink Floyd (1973) montre un prisme sur sa pochette ?", ["The Dark Side of the Moon", "The Wall", "Animals", "Wish You Were Here"], "Il est resté plus de 900 semaines dans le classement américain."],
        ["Quelle chanteuse a chanté « Respect » ?", ["Aretha Franklin", "Tina Turner", "Diana Ross", "Whitney Houston"], "Elle est surnommée la reine de la soul."],
        ["Quel chanteur est surnommé « The King » du rock'n'roll ?", ["Elvis Presley", "Chuck Berry", "Little Richard", "Buddy Holly"], "Sa maison, Graceland, se trouve à Memphis."],
        ["Quel groupe irlandais est mené par le chanteur Bono ?", ["U2", "The Cranberries", "The Pogues", "Thin Lizzy"], "Le groupe s'est formé à Dublin en 1976."],
        ["Quelle chanteuse a sorti « Hips Don't Lie » ?", ["Shakira", "Jennifer Lopez", "Beyoncé", "Rihanna"], "Elle est née en Colombie."],
        ["Quel groupe américain a chanté « Smells Like Teen Spirit » ?", ["Nirvana", "Pearl Jam", "Green Day", "Metallica"], "Le titre est sorti en 1991."],
        ["Qui a sorti l'album « Purple Rain » ?", ["Prince", "Michael Jackson", "David Bowie", "Lenny Kravitz"], "Il est sorti en 1984 avec un film du même nom."]
      ],
      [
        ["Quel groupe a publié l'album « Abbey Road » ?", ["The Beatles", "The Rolling Stones", "The Who", "The Kinks"], "La pochette montre les quatre membres sur un passage piéton."],
        ["Qui a chanté « Your Song » ?", ["Elton John", "Billy Joel", "Freddie Mercury", "Paul McCartney"], "Les paroles sont de Bernie Taupin."],
        ["Qui a chanté « Back to Black » ?", ["Amy Winehouse", "Adele", "Duffy", "Lily Allen"], "L'album est sorti en 2006."],
        ["Quel groupe britannique a chanté « Wonderwall » ?", ["Oasis", "Blur", "Radiohead", "Coldplay"], "Les frères Gallagher en sont les figures."],
        ["Quel était le prénom de naissance de Freddie Mercury ?", ["Farrokh", "Freddy", "Fernando", "Frank"], "Il est né à Zanzibar."],
        ["Qui a chanté « Imagine » ?", ["John Lennon", "Paul McCartney", "George Harrison", "Ringo Starr"], "Elle est sortie en 1971."],
        ["Quel groupe a chanté « Hotel California » ?", ["Eagles", "Fleetwood Mac", "The Doors", "Led Zeppelin"], "Elle est sortie en 1976."],
        ["Quelle chanteuse est surnommée « la reine de la soul » ?", ["Aretha Franklin", "Tina Turner", "Diana Ross", "Gladys Knight"], "Elle a été la première femme admise au Rock and Roll Hall of Fame."]
      ]
    ],
    culture: [
      [
        ["Combien de cordes a une guitare classique ?", ["6", "4", "8", "12"], "Une guitare basse en a généralement 4."],
        ["Quel instrument a des touches noires et blanches ?", ["Le piano", "La flûte", "Le violon", "La trompette"], "Un piano à queue compte 88 touches."],
        ["Combien de notes compte la gamme : do, ré, mi, fa, sol, la, si ?", ["7", "5", "8", "12"], "La gamme est répétée sur plusieurs octaves."],
        ["Quel est le plus grand instrument de la famille du violon ?", ["La contrebasse", "Le violon", "L'alto", "Le violoncelle"], "Elle mesure environ 1,80 m."],
        ["Quel instrument à vent, en bois, se joue avec une anche ?", ["La clarinette", "La trompette", "Le trombone", "Le tuba"], "Elle appartient à la famille des bois."],
        ["Quel compositeur, devenu sourd, a écrit une célèbre 9e Symphonie ?", ["Beethoven", "Mozart", "Bach", "Chopin"], "Son finale contient l'« Ode à la joie »."],
        ["Comment s'appelle la personne qui dirige un orchestre ?", ["Le chef d'orchestre", "Le soliste", "Le choriste", "Le pianiste"], "Il utilise souvent une baguette."],
        ["Quel instrument à vent est le symbole de l'Écosse ?", ["La cornemuse", "Le banjo", "L'accordéon", "La harpe"], "Elle est souvent jouée avec un kilt."]
      ],
      [
        ["Qui a composé « Les Quatre Saisons » ?", ["Antonio Vivaldi", "Mozart", "Bach", "Haendel"], "Ce compositeur italien vivait à Venise."],
        ["Quel compositeur français a écrit le « Boléro » ?", ["Maurice Ravel", "Claude Debussy", "Erik Satie", "Georges Bizet"], "Il date de 1928."],
        ["Dans quel pays est né Mozart ?", ["En Autriche", "En Allemagne", "En Italie", "En Hongrie"], "Il est né à Salzbourg en 1756."],
        ["Quel opéra de Bizet contient la « Habanera » ?", ["Carmen", "La Traviata", "Tosca", "Faust"], "Il a été créé à Paris en 1875."],
        ["Quel instrument est associé au virtuose Yehudi Menuhin ?", ["Le violon", "Le piano", "La flûte", "Le violoncelle"], "Il est considéré comme l'un des plus grands violonistes du XXe siècle."],
        ["Comment appelle-t-on le chant sans accompagnement instrumental ?", ["A cappella", "En playback", "En duo", "En canon"], "L'expression vient de l'italien, « à la chapelle »."],
        ["Quelle ville est le berceau du jazz ?", ["La Nouvelle-Orléans", "Chicago", "New York", "Memphis"], "Il est né au début du XXe siècle."],
        ["Quel pays est le berceau du reggae ?", ["La Jamaïque", "Cuba", "Le Brésil", "Haïti"], "Bob Marley en est la figure la plus célèbre."]
      ],
      [
        ["Qui a composé « L'Après-midi d'un faune » ?", ["Claude Debussy", "Maurice Ravel", "Gabriel Fauré", "Camille Saint-Saëns"], "Cette œuvre date de 1894."],
        ["Quelle est la nationalité de naissance de Frédéric Chopin ?", ["Polonaise", "Française", "Russe", "Autrichienne"], "Il s'installe à Paris à 21 ans."],
        ["Combien de symphonies Beethoven a-t-il composées ?", ["9", "5", "12", "41"], "Mozart en a composé environ 41."],
        ["Que signifie « allegro » dans une partition ?", ["Vif, rapide", "Lent", "Fort", "Doux"], "Le mot italien veut aussi dire joyeux."],
        ["Que signifie « piano » dans une partition ?", ["Doucement", "Fort", "Vite", "Lentement"], "L'instrument porte le nom de « pianoforte », qui joue doux ou fort."],
        ["Quel est le plus petit instrument de la famille des cordes frottées de l'orchestre ?", ["Le violon", "L'alto", "Le violoncelle", "La contrebasse"], "Le violon est aussi le plus aigu."],
        ["Qui a composé « Le Lac des cygnes » ?", ["Tchaïkovski", "Stravinsky", "Prokofiev", "Rachmaninov"], "C'est un ballet créé en 1877."],
        ["Quelle salle de Vienne accueille le Concert du Nouvel An ?", ["Le Musikverein", "L'Opéra Garnier", "La Scala", "Carnegie Hall"], "Il est retransmis dans le monde entier chaque 1er janvier."]
      ]
    ]
  },

  mythes: {
    mythes: [
      [
        ["Qui est le roi des dieux dans la mythologie grecque ?", ["Zeus", "Poséidon", "Hadès", "Apollon"], "Il règne depuis le mont Olympe."],
        ["Quel dieu romain correspond à Zeus ?", ["Jupiter", "Mars", "Neptune", "Apollon"], "La planète géante porte son nom."],
        ["Quelle déesse grecque incarne la sagesse ?", ["Athéna", "Aphrodite", "Héra", "Artémis"], "Elle a donné son nom à la ville d'Athènes."],
        ["Quel héros grec a accompli douze travaux ?", ["Héraclès", "Persée", "Thésée", "Achille"], "Les Romains l'appellent Hercule."],
        ["Quel monstre à la chevelure de serpents pétrifie du regard ?", ["Méduse", "La Chimère", "Charybde", "Le Sphinx"], "Persée l'a vaincue."],
        ["Comment s'appelle le dieu grec de la guerre ?", ["Arès", "Hermès", "Dionysos", "Héphaïstos"], "Les Romains l'appellent Mars."],
        ["Quel dieu grec des mers porte un trident ?", ["Poséidon", "Zeus", "Hadès", "Apollon"], "Les Romains l'appellent Neptune."],
        ["Sur quelle montagne vivent les dieux grecs ?", ["Le mont Olympe", "Le mont Blanc", "L'Etna", "Le Vésuve"], "Il est situé en Grèce."]
      ],
      [
        ["Qui règne sur les Enfers dans la mythologie grecque ?", ["Hadès", "Arès", "Hermès", "Cronos"], "Les Romains l'appellent Pluton."],
        ["Quel héros tue le Minotaure ?", ["Thésée", "Persée", "Jason", "Ulysse"], "Il est aidé par le fil d'Ariane."],
        ["Quel dieu nordique du tonnerre porte le marteau Mjöllnir ?", ["Thor", "Odin", "Loki", "Freyr"], "Le jeudi (« Thursday ») lui doit son nom en anglais."],
        ["Comment s'appelle le cheval ailé de la mythologie grecque ?", ["Pégase", "Sleipnir", "Bucéphale", "Rossinante"], "Il est né du sang de Méduse."],
        ["Quel dieu égyptien à tête de chacal préside à l'embaumement ?", ["Anubis", "Horus", "Osiris", "Seth"], "Il guide les morts vers l'au-delà."],
        ["Quelle déesse égyptienne est représentée avec une tête de chat ?", ["Bastet", "Isis", "Hathor", "Sekhmet"], "Elle protège le foyer."],
        ["Quel fleuve des Enfers traverse-t-on avec le passeur Charon ?", ["Le Styx", "Le Nil", "Le Tibre", "Le Rhône"], "Les morts payaient le passage d'une pièce."],
        ["Quelle déesse romaine de l'amour correspond à Aphrodite ?", ["Vénus", "Junon", "Minerve", "Diane"], "Vendredi (« dies Veneris ») lui doit son nom."]
      ],
      [
        ["Qui a volé le feu aux dieux pour le donner aux hommes ?", ["Prométhée", "Épiméthée", "Atlas", "Hermès"], "Il fut puni par Zeus."],
        ["Comment s'appelle la mère d'Achille, une nymphe marine ?", ["Thétis", "Héra", "Léto", "Calypso"], "Elle plonge son fils dans le Styx, sauf le talon."],
        ["Quel est le nom du roi d'Ithaque dans « L'Odyssée » ?", ["Ulysse", "Agamemnon", "Ménélas", "Nestor"], "Il erre dix ans après la guerre de Troie."],
        ["Quel personnage est condamné à pousser éternellement un rocher en haut d'une colline ?", ["Sisyphe", "Tantale", "Ixion", "Atlas"], "Albert Camus lui a consacré un essai."],
        ["Comment s'appelle l'arbre cosmique de la mythologie nordique ?", ["Yggdrasil", "Asgard", "Valhalla", "Midgard"], "Il relie les neuf mondes."],
        ["Qui est la sœur jumelle d'Apollon ?", ["Artémis", "Athéna", "Déméter", "Perséphone"], "Elle est la déesse de la chasse."],
        ["Quel dieu nordique a perdu un œil en échange de la sagesse ?", ["Odin", "Thor", "Loki", "Baldr"], "Il est le chef des dieux nordiques."],
        ["Qui est le fils de Zeus et d'Alcmène ?", ["Héraclès", "Persée", "Dionysos", "Hermès"], "Héra s'acharne contre lui toute sa vie."]
      ]
    ],
    auteurs: [
      [
        ["Qui a écrit « Les Misérables » ?", ["Victor Hugo", "Émile Zola", "Honoré de Balzac", "Alexandre Dumas"], "Le roman paraît en 1862."],
        ["Qui a écrit « Le Petit Prince » ?", ["Antoine de Saint-Exupéry", "Jules Verne", "Albert Camus", "Marcel Pagnol"], "Il est l'un des livres les plus traduits au monde."],
        ["Qui a écrit « Harry Potter » ?", ["J. K. Rowling", "Roald Dahl", "J. R. R. Tolkien", "Suzanne Collins"], "Le premier tome paraît en 1997."],
        ["Qui a écrit « Les Trois Mousquetaires » ?", ["Alexandre Dumas", "Victor Hugo", "Molière", "Stendhal"], "Le roman paraît en feuilleton en 1844."],
        ["Qui a écrit « Vingt mille lieues sous les mers » ?", ["Jules Verne", "H. G. Wells", "Jack London", "Daniel Defoe"], "Le capitaine Nemo y commande le Nautilus."],
        ["Qui a écrit « Les Fables » ?", ["Jean de La Fontaine", "Molière", "Charles Perrault", "Racine"], "Il s'inspire d'Ésope et de Phèdre."],
        ["Qui a écrit « Roméo et Juliette » ?", ["William Shakespeare", "Molière", "Dante", "Goethe"], "La pièce date des années 1590."],
        ["Quel auteur a créé le détective Sherlock Holmes ?", ["Arthur Conan Doyle", "Agatha Christie", "Georges Simenon", "Edgar Poe"], "Holmes habite au 221B Baker Street."]
      ],
      [
        ["Qui a écrit « L'Étranger » ?", ["Albert Camus", "Jean-Paul Sartre", "André Gide", "Marcel Proust"], "Le roman paraît en 1942."],
        ["Qui a écrit « Madame Bovary » ?", ["Gustave Flaubert", "Honoré de Balzac", "Stendhal", "Émile Zola"], "Il a été jugé pour « outrage à la morale » à sa publication."],
        ["Qui a écrit « Le Seigneur des anneaux » ?", ["J. R. R. Tolkien", "C. S. Lewis", "George R. R. Martin", "T. H. White"], "Les trois tomes paraissent en 1954 et 1955."],
        ["Qui a écrit « 1984 » ?", ["George Orwell", "Aldous Huxley", "Ray Bradbury", "Isaac Asimov"], "Il y invente « Big Brother »."],
        ["Qui a écrit « Le Comte de Monte-Cristo » ?", ["Alexandre Dumas", "Victor Hugo", "Eugène Sue", "Honoré de Balzac"], "Edmond Dantès y est emprisonné au château d'If."],
        ["Qui a écrit « Le Rouge et le Noir » ?", ["Stendhal", "Gustave Flaubert", "Honoré de Balzac", "Guy de Maupassant"], "Le roman paraît en 1830."],
        ["Qui a écrit « Don Quichotte » ?", ["Miguel de Cervantès", "Lope de Vega", "Jorge Luis Borges", "Gabriel García Márquez"], "Il est considéré comme le premier roman moderne."],
        ["Quelle autrice a écrit « Orgueil et Préjugés » ?", ["Jane Austen", "Charlotte Brontë", "Mary Shelley", "George Eliot"], "Le roman paraît en 1813."]
      ],
      [
        ["Qui a écrit « À la recherche du temps perdu » ?", ["Marcel Proust", "Louis-Ferdinand Céline", "André Gide", "Colette"], "Elle compte sept tomes."],
        ["Qui a écrit « La Divine Comédie » ?", ["Dante Alighieri", "Pétrarque", "Boccace", "Machiavel"], "Il y décrit l'Enfer, le Purgatoire et le Paradis."],
        ["Qui a écrit « Cent ans de solitude » ?", ["Gabriel García Márquez", "Jorge Luis Borges", "Pablo Neruda", "Mario Vargas Llosa"], "Il a reçu le Nobel de littérature en 1982."],
        ["Qui a écrit « Les Fleurs du mal » ?", ["Charles Baudelaire", "Arthur Rimbaud", "Paul Verlaine", "Stéphane Mallarmé"], "Le recueil paraît en 1857."],
        ["Qui a écrit « Crime et Châtiment » ?", ["Fiodor Dostoïevski", "Léon Tolstoï", "Anton Tchekhov", "Nicolas Gogol"], "Raskolnikov en est le héros."],
        ["Qui a écrit « Le Vieil Homme et la Mer » ?", ["Ernest Hemingway", "John Steinbeck", "William Faulkner", "F. Scott Fitzgerald"], "Il a reçu le prix Nobel en 1954."],
        ["Qui a écrit « Les Liaisons dangereuses » ?", ["Choderlos de Laclos", "Denis Diderot", "Voltaire", "Marivaux"], "Le roman est écrit sous forme de lettres."],
        ["Quelle autrice a écrit « Le Deuxième Sexe » ?", ["Simone de Beauvoir", "Marguerite Duras", "Colette", "George Sand"], "Il paraît en 1949."]
      ]
    ],
    personnages: [
      [
        ["Quel personnage de conte perd sa pantoufle de verre ?", ["Cendrillon", "Blanche-Neige", "Raiponce", "La Belle au bois dormant"], "Le conte de Perrault date de 1697."],
        ["Comment s'appelle le pantin de bois qui rêve de devenir un vrai garçon ?", ["Pinocchio", "Peter Pan", "Mowgli", "Aladdin"], "Son nez s'allonge quand il ment."],
        ["Que poursuit Alice dans « Alice au pays des merveilles » ?", ["Un lapin blanc", "Un chat", "Une souris", "Un chapelier"], "Elle tombe dans son terrier."],
        ["Quel détective belge à grosses moustaches a été créé par Agatha Christie ?", ["Hercule Poirot", "Sherlock Holmes", "Arsène Lupin", "Jules Maigret"], "Il s'appuie sur ses « petites cellules grises »."],
        ["Quel gentleman cambrioleur a été créé par Maurice Leblanc ?", ["Arsène Lupin", "Fantômas", "Rouletabille", "Rocambole"], "Il apparaît dès 1905."],
        ["Quel garçon refuse de grandir et vit au Pays imaginaire ?", ["Peter Pan", "Tom Sawyer", "Huckleberry Finn", "Oliver Twist"], "Sa fée s'appelle Clochette."],
        ["Comment s'appelle le petit garçon élevé par les loups dans « Le Livre de la jungle » ?", ["Mowgli", "Tarzan", "Baloo", "Bagheera"], "Le livre est de Rudyard Kipling."],
        ["Comment s'appelle le sonneur de cloches bossu de Victor Hugo ?", ["Quasimodo", "Frollo", "Phoebus", "Gringoire"], "Il vit dans la cathédrale Notre-Dame de Paris."]
      ],
      [
        ["Comment s'appelle l'écuyer de Don Quichotte ?", ["Sancho Panza", "Rossinante", "Dulcinée", "Sganarelle"], "Il monte un âne."],
        ["Quel personnage de Molière est un avare ?", ["Harpagon", "Tartuffe", "Alceste", "Dom Juan"], "La pièce date de 1668."],
        ["Quel personnage d'Edmond Rostand est connu pour son grand nez ?", ["Cyrano de Bergerac", "Don Quichotte", "Pinocchio", "Tartarin"], "La pièce date de 1897."],
        ["Comment s'appelle le capitaine obsédé par la baleine blanche dans « Moby Dick » ?", ["Achab", "Nemo", "Crochet", "Barbe-Noire"], "Il a perdu une jambe à cause d'elle."],
        ["Comment s'appelle le capitaine du Nautilus chez Jules Verne ?", ["Nemo", "Achab", "Haddock", "Crochet"], "Son nom signifie « personne » en latin."],
        ["Comment s'appelle le héros des « Misérables » poursuivi par l'inspecteur Javert ?", ["Jean Valjean", "Marius", "Gavroche", "Thénardier"], "Il a volé du pain avant de purger une longue peine."],
        ["Quel orphelin de Charles Dickens ose demander « encore » du gruau ?", ["Oliver Twist", "David Copperfield", "Pip", "Scrooge"], "Le roman paraît en 1838."],
        ["Quel personnage de Perrault porte des bottes magiques ?", ["Le Chat botté", "Le Petit Poucet", "Barbe-Bleue", "Riquet à la houppe"], "Il aide son maître à devenir marquis."]
      ],
      [
        ["Quel est le prénom de l'héroïne de « Madame Bovary » ?", ["Emma", "Anna", "Nana", "Gervaise"], "Elle rêve d'une vie romanesque."],
        ["Quelle bohémienne apparaît dans « Notre-Dame de Paris » ?", ["Esmeralda", "Fantine", "Cosette", "Éponine"], "Elle danse sur le parvis avec sa chèvre."],
        ["Quel est le quatrième héros des « Trois Mousquetaires », jeune Gascon ?", ["D'Artagnan", "Athos", "Porthos", "Aramis"], "Il part de Gascogne pour devenir mousquetaire."],
        ["Quel est le nom de famille de Julien dans « Le Rouge et le Noir » ?", ["Sorel", "Valjean", "Rastignac", "Bovary"], "Il est fils de charpentier."],
        ["Quel jeune ambitieux dit « À nous deux, maintenant ! » dans « Le Père Goriot » ?", ["Rastignac", "Vautrin", "Goriot", "Grandet"], "Il défie Paris depuis le cimetière du Père-Lachaise."],
        ["Comment s'appelle le héros de « L'Étranger » d'Albert Camus ?", ["Meursault", "Rieux", "Caligula", "Sisyphe"], "Le roman s'ouvre sur « Aujourd'hui, maman est morte »."],
        ["Quel docteur se transforme en Mr Hyde ?", ["Le docteur Jekyll", "Le docteur Frankenstein", "Le docteur Watson", "Le docteur Moreau"], "Le roman est de Robert Louis Stevenson."],
        ["Comment s'appelle la baleine blanche du roman de Melville ?", ["Moby Dick", "Léviathan", "Willy", "Shamu"], "Elle est poursuivie par le capitaine Achab."]
      ]
    ]
  }
});

/* ---------- déclaration des 3 jeux de plus et du jeu spécial ---------- */
Object.assign(FORMATS, {
  popculture: { name: "Pop culture", color: "#C2417A", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                kinds: { cinema: { label: "Cinéma", color: "#C2417A" }, series: { label: "Séries", color: "#8A4FD6" }, jeuxvideo: { label: "Jeux vidéo", color: "#2BA3B8" } },
                sub: "Films cultes, séries et jeux vidéo : 20 secondes par question." },
  chanson:    { name: "Musique et chanson", color: "#8A4FD6", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                kinds: { francaise: { label: "Chanson française", color: "#4A72E0" }, internationale: { label: "Hits du monde", color: "#E0663A" }, culture: { label: "Instruments et grands noms", color: "#1E9A73" } },
                sub: "Qui chante quoi ? Quel instrument ? 20 secondes par question." },
  mythes:     { name: "Mythes et littérature", color: "#B8577A", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                kinds: { mythes: { label: "Mythologies", color: "#E8664F" }, auteurs: { label: "Qui a écrit ?", color: "#B8577A" }, personnages: { label: "Personnages célèbres", color: "#2BA3B8" } },
                sub: "Dieux, héros, auteurs et personnages de romans : 20 secondes par question." },
  // jeu spécial, hors rotation : le dimanche, tous les groupes jouent le même (un seul essai, boussoles ×2)
  megaquiz:   { name: "Méga-quiz du dimanche", color: "#E8A317", eng: "mcq", per: 4, max: 400, secs: 15, man: "themes", special: true,
                themes: ["hist", "geopo", "geo", "cine", "musique", "sport", "sciences", "arts", "gastro", "nature"],
                sub: "Le rendez-vous du dimanche : 12 questions de tous les thèmes, un seul essai, boussoles doublées." }
});
CONFIG.formatOrder.push("popculture", "chanson", "mythes");

Object.assign(ART2, {
  popculture: (r, rot) => bgr("#C2417A", "#CC5188", rot) + `
    <g transform="translate(7 8)" fill="#7C2149"><rect x="216" y="86" width="160" height="104" rx="14"/><path d="M216 86l24-34h40l-24 34zM292 86l24-34h40l-24 34z"/></g>
    <rect x="216" y="86" width="160" height="104" rx="14" fill="#FFF6EC" stroke="#2A2333" stroke-width="5"/><path d="M216 86l24-34h40l-24 34zM292 86l24-34h40l-24 34z" fill="#2A2333"/>
    <path d="M276 114v48l40-24z" fill="#C2417A" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    ${spark(390, 40, 9, "#FFD45C")}${spark(196, 200, 7, "#F6D3E3")}`,
  chanson: (r, rot) => bgr("#8A4FD6", "#975FDD", rot) + `
    <g transform="translate(7 8)" fill="#52279A"><ellipse cx="268" cy="168" rx="26" ry="20"/><ellipse cx="344" cy="150" rx="26" ry="20"/><path d="M286 168V70l76-18v98h-14V84l-48 12v72z"/></g>
    <ellipse cx="268" cy="168" rx="26" ry="20" fill="#FFF6EC" stroke="#2A2333" stroke-width="5"/><ellipse cx="344" cy="150" rx="26" ry="20" fill="#FFF6EC" stroke="#2A2333" stroke-width="5"/>
    <path d="M286 168V70l76-18v98" fill="none" stroke="#2A2333" stroke-width="8" stroke-linejoin="round"/><path d="M286 96l76-18" stroke="#2A2333" stroke-width="8"/>
    ${spark(390, 40, 9, "#FFD45C")}${spark(196, 200, 7, "#E6D5FA")}`,
  mythes: (r, rot) => bgr("#B8577A", "#C2688A", rot) + `
    <g transform="translate(7 8)" fill="#7A2F4B"><path d="M296 40c-30 20-50 54-50 92 18-6 34-6 50 4 16-10 32-10 50-4 0-38-20-72-50-92z"/><rect x="226" y="176" width="140" height="16" rx="5"/></g>
    <path d="M296 40c-30 20-50 54-50 92 18-6 34-6 50 4 16-10 32-10 50-4 0-38-20-72-50-92z" fill="#FFD45C" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    <rect x="226" y="176" width="140" height="16" rx="5" fill="#FFF6EC" stroke="#2A2333" stroke-width="5"/>
    <path d="M296 70v62" stroke="#2A2333" stroke-width="5" stroke-linecap="round"/>
    ${spark(390, 40, 9, "#FFD45C")}${spark(196, 200, 7, "#F6D3E3")}`,
  megaquiz: (r, rot) => bgr("#E8A317", "#EEB23A", rot) + `
    <g transform="translate(7 8)" fill="#8A5B08"><path d="M296 38l17 46 49 2-39 30 14 48-41-28-41 28 14-48-39-30 49-2z"/></g>
    <path d="M296 38l17 46 49 2-39 30 14 48-41-28-41 28 14-48-39-30 49-2z" fill="#FFF6EC" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    <text x="296" y="128" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="30" fill="#E8A317">×2</text>
    ${spark(390, 200, 9, "#FFD45C")}${spark(196, 60, 7, "#FBE6B4")}`
});

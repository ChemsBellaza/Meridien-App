/* ============ 4 jeux de culture générale en plus (v26) : Expressions françaises, Inventions et découvertes, Monuments du monde, Corps humain et santé ============
   Moteur : le QCM existant (ENG.mcq). Données : NEWQ[format][catégorie][difficulté] = liste de [question, [bonne réponse, faux, faux, faux], « le saviez-vous »].
   8 questions par case (3 catégories × 3 niveaux) : 2 essais × 3 questions ne se recoupent pas, puis la réserve tourne (voir fromPool). */
const NEWQ = {
  expressions: {
    sens: [
      [
        ["Que signifie « poser un lapin » à quelqu'un ?", ["Ne pas venir au rendez-vous", "Arriver en avance", "Lui offrir un cadeau", "Se moquer de lui"], "Poser un lapin, c'est ne pas se présenter à un rendez-vous sans prévenir."],
        ["Que signifie « avoir le cafard » ?", ["Avoir le moral bas", "Avoir peur", "Être très fatigué", "Avoir faim"], "Le cafard désigne ici une humeur noire, mélancolique."],
        ["Que signifie « tomber dans les pommes » ?", ["S'évanouir", "Tomber amoureux", "Rater un examen", "Faire une chute de vélo"], "Tomber dans les pommes, c'est perdre connaissance."],
        ["Que signifie « coûter les yeux de la tête » ?", ["Coûter très cher", "Faire très mal", "Ne rien coûter", "Rendre aveugle"], "L'expression exagère : ce serait si cher qu'on y laisserait ses yeux."],
        ["Que signifie « avoir un chat dans la gorge » ?", ["Être enroué", "Avoir peur des chats", "Avoir très faim", "Parler sans arrêt"], "On a la voix voilée, comme si quelque chose gênait dans la gorge."],
        ["Que signifie « être dans la lune » ?", ["Être distrait", "Être très riche", "Être endormi", "Voyager beaucoup"], "On pense à autre chose, l'esprit ailleurs."],
        ["Que signifie « casser les pieds à quelqu'un » ?", ["L'agacer", "Lui faire un cadeau", "Danser avec lui", "Le suivre partout en silence"], "Casser les pieds, c'est importuner, ennuyer quelqu'un."],
        ["Que signifie « prendre ses jambes à son cou » ?", ["S'enfuir en courant", "Se baisser", "Se blesser", "Faire du sport"], "On court si vite que les jambes semblent remonter jusqu'au cou."]
      ],
      [
        ["Que signifie « avoir le cœur sur la main » ?", ["Être très généreux", "Être malade du cœur", "Être timide", "Être amoureux"], "Une personne qui donne sans compter, avec sincérité."],
        ["Que signifie « mettre de l'eau dans son vin » ?", ["Modérer ses exigences", "Boire moins", "Se ruiner", "Faire une erreur"], "On adoucit sa position, comme on dilue un vin trop fort."],
        ["Que signifie « faire l'andouille » ?", ["Faire l'idiot", "Cuisiner", "Se cacher", "Se tromper de route"], "Faire l'andouille, c'est se comporter bêtement, pour faire rire ou par maladresse."],
        ["Que signifie « être sur son trente et un » ?", ["Être habillé avec élégance", "Avoir 31 ans", "Être en retard", "Être de bonne humeur"], "On porte ses plus beaux habits, ceux des grandes occasions."],
        ["Que signifie « revenir à ses moutons » ?", ["Revenir au sujet principal", "Rentrer chez soi", "Devenir berger", "Se reposer"], "L'expression vient de la farce médiévale de Maître Pathelin."],
        ["Que signifie « ne pas être sorti de l'auberge » ?", ["Ne pas être au bout de ses ennuis", "Avoir très faim", "Refuser de partir", "Être perdu en forêt"], "Les difficultés ne sont pas terminées."],
        ["Que signifie « avoir la dent dure » ?", ["Critiquer sévèrement", "Avoir mal aux dents", "Être gourmand", "Mordre fort"], "On juge les autres sans indulgence."],
        ["Que signifie « se mettre martel en tête » ?", ["Se faire beaucoup de souci", "Se frapper la tête", "Réfléchir en silence", "S'endormir"], "Le martel, ancien mot pour marteau, donne l'idée d'une inquiétude qui frappe l'esprit."]
      ],
      [
        ["Que signifie « chercher midi à quatorze heures » ?", ["Chercher des difficultés là où il n'y en a pas", "Être en retard", "Avoir très faim", "Perdre du temps au bureau"], "Midi est à midi : vouloir le trouver à quatorze heures, c'est compliquer les choses."],
        ["Que signifie « tirer le diable par la queue » ?", ["Avoir du mal à joindre les deux bouts", "Avoir très peur", "Jouer un mauvais tour", "Faire des cauchemars"], "Vivre dans la gêne, en ayant peine à payer ce qu'on doit."],
        ["Que signifie « avoir maille à partir avec quelqu'un » ?", ["Avoir un différend avec lui", "Partager un bien avec lui", "Coudre ensemble", "Être son ami"], "La maille était une toute petite monnaie : on se disputait pour des broutilles."],
        ["Que signifie « être à couteaux tirés » ?", ["Être en conflit ouvert", "Être très bon cuisinier", "Être pressé", "Être en pleine fête"], "Deux personnes prêtes à se battre, tant la tension est forte."],
        ["Que signifie « faire des gorges chaudes de quelqu'un » ?", ["Se moquer de lui avec plaisir", "Boire un chocolat chaud", "Avoir mal à la gorge", "Chanter très fort"], "À l'origine, la gorge chaude était la chair chaude donnée aux faucons."],
        ["Que signifie « battre la campagne » ?", ["Divaguer, dire n'importe quoi", "Faire une randonnée", "Partir en guerre", "Labourer un champ"], "Comme un chien de chasse qui court sans but dans les champs."],
        ["Que signifie « raconter des salades » ?", ["Raconter des mensonges", "Parler de cuisine", "Parler du jardin", "Chanter faux"], "On mélange les choses comme dans un saladier, pour embrouiller."],
        ["Que signifie « mener quelqu'un en bateau » ?", ["Le tromper par de fausses promesses", "L'emmener en mer", "Le conduire au port", "Le sauver de la noyade"], "On le promène sans jamais le mener où il veut."]
      ]
    ],
    complete: [
      [
        ["Complète : « Quand les poules auront des … »", ["dents", "ailes", "cornes", "lunettes"], "C'est-à-dire jamais : les poules n'ont pas de dents."],
        ["Complète : « Mettre les pieds dans le … »", ["plat", "four", "bain", "lit"], "Dire une maladresse, aborder un sujet délicat sans précaution."],
        ["Complète : « Avoir la tête dans les … »", ["nuages", "étoiles", "épaules", "mains"], "Être rêveur, distrait."],
        ["Complète : « Il pleut des … »", ["cordes", "pierres", "clous", "larmes"], "Il pleut très fort, à verse."],
        ["Complète : « Se jeter dans la gueule du … »", ["loup", "lion", "dragon", "requin"], "S'exposer imprudemment à un danger."],
        ["Complète : « Une hirondelle ne fait pas le … »", ["printemps", "bonheur", "voyage", "nid"], "Un seul signe ne suffit pas à conclure."],
        ["Complète : « Appeler un chat un … »", ["chat", "chien", "lion", "tigre"], "Parler franchement, sans détour."],
        ["Complète : « Couper l'herbe sous le … »", ["pied", "nez", "bras", "genou"], "Devancer quelqu'un pour lui ôter ses chances."]
      ],
      [
        ["Complète : « Ce n'est pas la mer à … »", ["boire", "traverser", "voir", "tenter"], "Ce n'est pas si difficile : la mer à boire, ce serait impossible."],
        ["Complète : « Il ne faut pas vendre la peau de l'ours avant de l'avoir … »", ["tué", "vu", "chassé", "lavé"], "Ne pas compter sur un gain avant de l'avoir obtenu (fable de La Fontaine)."],
        ["Complète : « Avoir d'autres chats à … »", ["fouetter", "nourrir", "caresser", "soigner"], "Avoir des affaires plus importantes à régler."],
        ["Complète : « Mieux vaut tard que … »", ["jamais", "tôt", "mal", "rien"], "Il vaut mieux faire une chose en retard que ne pas la faire."],
        ["Complète : « Les carottes sont … »", ["cuites", "crues", "fraîches", "rouges"], "La situation est sans remède : tout est fini."],
        ["Complète : « Faire d'une pierre deux … »", ["coups", "murs", "trous", "chemins"], "Obtenir deux résultats avec une seule action."],
        ["Complète : « Pas de nouvelles, bonnes … »", ["nouvelles", "idées", "raisons", "sœurs"], "Sans message, c'est que tout va bien."],
        ["Complète : « Qui sème le vent récolte la … »", ["tempête", "pluie", "moisson", "famine"], "Qui provoque des troubles subit de plus grands malheurs en retour."]
      ],
      [
        ["Complète : « Qui va à la chasse perd sa … »", ["place", "proie", "route", "chance"], "Quand on quitte sa place, un autre peut la prendre."],
        ["Complète : « Rira bien qui rira le … »", ["dernier", "premier", "mieux", "plus fort"], "Il ne faut pas se réjouir trop tôt."],
        ["Complète : « L'appétit vient en … »", ["mangeant", "dormant", "travaillant", "jeûnant"], "Une fois qu'on a commencé, l'envie vient."],
        ["Complète : « Un tiens vaut mieux que deux tu l'… »", ["auras", "as", "vois", "veux"], "Mieux vaut un petit avantage certain qu'une grosse promesse."],
        ["Complète : « À cheval donné, on ne regarde pas les … »", ["dents", "sabots", "harnais", "jambes"], "On ne critique pas un cadeau."],
        ["Complète : « Chat échaudé craint l'eau … »", ["froide", "chaude", "bouillante", "salée"], "Après une mauvaise expérience, on se méfie de tout ce qui y ressemble."],
        ["Complète : « Pierre qui roule n'amasse pas … »", ["mousse", "poussière", "gloire", "richesse"], "Qui change sans cesse ne s'enrichit pas."],
        ["Complète : « Petit à petit, l'oiseau fait son … »", ["nid", "chant", "vol", "trou"], "Avec de la patience, on arrive à son but."]
      ]
    ],
    animaux: [
      [
        ["Quel animal : « Têtu comme une … » ?", ["mule", "girafe", "grenouille", "souris"], "La mule a la réputation de n'en faire qu'à sa tête."],
        ["Quel animal : « Malin comme un … » ?", ["singe", "éléphant", "escargot", "poisson"], "Le singe est vu comme vif et rusé."],
        ["Quel animal : « Muet comme une … » ?", ["carpe", "girafe", "vache", "poule"], "La carpe ouvre la bouche sans qu'on entende un son."],
        ["Quel animal : « Doux comme un … » ?", ["agneau", "lion", "requin", "loup"], "L'agneau symbolise la douceur."],
        ["Quel animal : « Rusé comme un … » ?", ["renard", "éléphant", "mouton", "chien"], "Le renard est le héros ruse des fables."],
        ["Quel animal : « Bavard comme une … » ?", ["pie", "taupe", "sole", "carpe"], "La pie jacasse sans arrêt."],
        ["Quel animal : « Fort comme un … » ?", ["bœuf", "chat", "lapin", "pigeon"], "Le bœuf est le symbole de la force tranquille."],
        ["Quel animal : « Avoir une faim de … » ?", ["loup", "chat", "souris", "oiseau"], "Une faim dévorante, comme celle du loup l'hiver."]
      ],
      [
        ["Quel animal : « Myope comme une … » ?", ["taupe", "chouette", "libellule", "aigle"], "La taupe vit sous terre et voit très mal."],
        ["Quel animal : « Laid comme un … » ?", ["pou", "cygne", "paon", "lapin"], "Expression ancienne pour dire très laid."],
        ["Quel animal : « Gai comme un … » ?", ["pinson", "hibou", "corbeau", "escargot"], "Le pinson chante toute la journée."],
        ["Quel animal : « Bête comme une … » ?", ["oie", "chouette", "abeille", "panthère"], "L'oie passe, à tort, pour peu intelligente."],
        ["Quel animal : « Orgueilleux comme un … » ?", ["paon", "pigeon", "moineau", "canard"], "Le paon fait la roue pour se faire admirer."],
        ["Quel animal : « Courageux comme un … » ?", ["lion", "lapin", "mouton", "escargot"], "Le lion est le roi des animaux, symbole de bravoure."],
        ["Quel animal : « Agile comme un … » ?", ["chat", "ours", "hippopotame", "bœuf"], "Le chat tombe toujours sur ses pattes."],
        ["Quel animal : « Sale comme un … » ?", ["cochon", "chat", "oiseau", "lapin"], "Le cochon aime se vautrer dans la boue."]
      ],
      [
        ["Quel animal se cache dans : « Il y a … sous roche » ?", ["anguille", "serpent", "crabe", "poisson"], "Il y a anguille sous roche : il se prépare quelque chose de caché."],
        ["Quel animal : « Quand on parle du …, on en voit la queue » ?", ["loup", "lion", "renard", "ours"], "Quand on parle de quelqu'un, il arrive aussitôt."],
        ["Quel animal : « Avoir un … dans la gorge » ?", ["chat", "rat", "poisson", "lézard"], "Une voix enrouée."],
        ["Quel animal : « Revenons à nos … » ?", ["moutons", "vaches", "chevaux", "poules"], "Reprenons le sujet : expression tirée de Maître Pathelin."],
        ["Quel animal : « Donner sa langue au … » ?", ["chat", "chien", "loup", "lion"], "Renoncer à deviner une énigme."],
        ["Quel animal : « Faire la politique de l'… » ?", ["autruche", "taupe", "tortue", "lézard"], "Refuser de voir le danger, comme l'autruche qui cacherait sa tête dans le sable."],
        ["Quel animal : « Avoir une mémoire d'… » ?", ["éléphant", "escargot", "moustique", "papillon"], "L'éléphant est réputé ne rien oublier."],
        ["Quel animal : « Être une … mouillée » ?", ["poule", "souris", "oie", "cane"], "Une poule mouillée est une personne lâche, sans courage."]
      ]
    ]
  },

  inventions: {
    qui: [
      [
        ["Qui a déposé le brevet du téléphone en 1876 ?", ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Samuel Morse"], "Bell dépose son brevet le 14 février 1876."],
        ["Qui a perfectionné l'ampoule électrique à incandescence en 1879 ?", ["Thomas Edison", "Graham Bell", "Benjamin Franklin", "Guglielmo Marconi"], "Edison trouve un filament durable ; l'Anglais Joseph Swan y travaillait aussi."],
        ["Qui a inventé le cinématographe en 1895 ?", ["Les frères Lumière", "Georges Méliès", "Louis Daguerre", "Charles Pathé"], "La première projection publique payante a lieu à Paris le 28 décembre 1895."],
        ["Qui a mis au point le vaccin contre la rage en 1885 ?", ["Louis Pasteur", "Marie Curie", "Robert Koch", "Edward Jenner"], "Pasteur l'essaie d'abord sur le jeune Joseph Meister."],
        ["Qui a introduit l'imprimerie à caractères mobiles en Europe vers 1450 ?", ["Johannes Gutenberg", "Léonard de Vinci", "Galilée", "Christophe Colomb"], "Sa Bible à 42 lignes est l'un des premiers grands livres imprimés."],
        ["Qui a réalisé le premier vol motorisé et contrôlé en 1903 ?", ["Les frères Wright", "Louis Blériot", "Clément Ader", "Alberto Santos-Dumont"], "Leur Flyer s'élève à Kitty Hawk, aux États-Unis."],
        ["Qui a inventé le paratonnerre vers 1752 ?", ["Benjamin Franklin", "Thomas Edison", "Isaac Newton", "Alessandro Volta"], "Franklin prouve que la foudre est de l'électricité."],
        ["Qui a inventé la pile électrique en 1800 ?", ["Alessandro Volta", "Luigi Galvani", "Michael Faraday", "André-Marie Ampère"], "L'unité de tension, le volt, porte son nom."]
      ],
      [
        ["Qui a perfectionné la machine à vapeur avec un condenseur séparé en 1769 ?", ["James Watt", "Denis Papin", "Nicolas Cugnot", "Thomas Newcomen"], "L'unité de puissance, le watt, porte son nom."],
        ["Qui a mis au point l'écriture en points pour les aveugles ?", ["Louis Braille", "Valentin Haüy", "Louis Pasteur", "Charles Barbier"], "Louis Braille, aveugle à 3 ans, l'invente à 15 ans, en 1824-1825."],
        ["Qui a inventé la dynamite en 1867 ?", ["Alfred Nobel", "Ascanio Sobrero", "Pierre Curie", "Louis Pasteur"], "Sa fortune finance les prix Nobel."],
        ["Qui a inventé le daguerréotype, premier procédé photographique commercialisé ?", ["Louis Daguerre", "Nicéphore Niépce", "George Eastman", "Étienne-Jules Marey"], "Il est présenté à l'Académie des sciences en 1839."],
        ["Qui a donné son nom à un code de télégraphe électrique ?", ["Samuel Morse", "Claude Chappe", "Guglielmo Marconi", "Gustave Eiffel"], "Chappe, lui, avait inventé le télégraphe optique à bras."],
        ["Qui a inventé le thermomètre à mercure en 1714 ?", ["Daniel Fahrenheit", "Anders Celsius", "Galilée", "Lord Kelvin"], "Il crée aussi l'échelle de température qui porte son nom."],
        ["Qui a inventé le stéthoscope en 1816 ?", ["René Laennec", "Claude Bernard", "Ambroise Paré", "Louis Pasteur"], "Il roule une feuille de papier pour écouter le cœur d'une patiente."],
        ["Qui a réalisé les premières liaisons radio transatlantiques en 1901 ?", ["Guglielmo Marconi", "Nikola Tesla", "Heinrich Hertz", "Édouard Branly"], "Il reçoit le prix Nobel de physique en 1909."]
      ],
      [
        ["Qui a inventé la conserve alimentaire, ou « appertisation » ?", ["Nicolas Appert", "Louis Pasteur", "Antoine Parmentier", "Antoine Lavoisier"], "Il met au point le procédé entre 1795 et 1810 pour les armées de Napoléon."],
        ["Qui a construit le premier moteur à quatre temps en 1876 ?", ["Nikolaus Otto", "Rudolf Diesel", "Karl Benz", "Étienne Lenoir"], "Le « cycle d'Otto » équipe encore la plupart des moteurs à essence."],
        ["Qui a inventé la machine à coudre en 1830 ?", ["Barthélemy Thimonnier", "Isaac Singer", "Elias Howe", "Joseph Jacquard"], "Son atelier de couture est détruit par des ouvriers inquiets pour leur emploi."],
        ["Qui a mis au point le métier à tisser à cartes perforées en 1801 ?", ["Joseph Marie Jacquard", "Charles Babbage", "Blaise Pascal", "Thomas Newcomen"], "Ses cartes perforées inspireront les premiers ordinateurs."],
        ["Qui a inventé la machine à calculer appelée « Pascaline » ?", ["Blaise Pascal", "Gottfried Leibniz", "Charles Babbage", "René Descartes"], "Il la construit à 19 ans pour aider son père, collecteur d'impôts."],
        ["Qui a découvert la pénicilline en 1928 ?", ["Alexander Fleming", "Louis Pasteur", "Robert Koch", "Joseph Lister"], "Il remarque qu'une moisissure détruit les bactéries autour d'elle."],
        ["Qui a fait voler le premier ballon à air chaud en 1783 ?", ["Les frères Montgolfier", "Jacques Charles", "Henri Giffard", "Jean-Pierre Blanchard"], "Le premier vol humain en ballon a lieu à Paris le 21 novembre 1783."],
        ["Qui a inventé l'ascenseur de sécurité en 1853 ?", ["Elisha Otis", "Gustave Eiffel", "Werner Siemens", "Louis Renault"], "Son frein empêche la cabine de tomber si le câble casse."]
      ]
    ],
    quand: [
      [
        ["À quel siècle Gutenberg met-il au point l'imprimerie à caractères mobiles ?", ["Au XVe siècle", "Au XIIe siècle", "Au XVIIe siècle", "Au XIXe siècle"], "Vers 1450, à Mayence."],
        ["En quelle année les frères Wright réalisent-ils leur premier vol ?", ["1903", "1883", "1923", "1945"], "Le 17 décembre 1903, quatre vols, le plus long de 59 secondes."],
        ["En quelle année Christophe Colomb atteint-il l'Amérique ?", ["1492", "1415", "1515", "1610"], "Il débarque aux Bahamas le 12 octobre 1492."],
        ["En quelle année un homme marche-t-il pour la première fois sur la Lune ?", ["1969", "1959", "1975", "1981"], "Neil Armstrong, le 21 juillet 1969 (heure de Paris)."],
        ["En quelle année a lieu la première projection publique du cinématographe Lumière ?", ["1895", "1815", "1925", "1955"], "Au Grand Café, à Paris."],
        ["En quelle année le premier iPhone est-il présenté ?", ["2007", "1997", "2003", "2012"], "Steve Jobs le dévoile en janvier 2007."],
        ["En quelle année Tim Berners-Lee propose-t-il le World Wide Web ?", ["1989", "1969", "1999", "2004"], "Il travaille alors au CERN, à Genève."],
        ["En quelle année est lancé Spoutnik 1, premier satellite artificiel ?", ["1957", "1947", "1967", "1977"], "L'URSS le met en orbite le 4 octobre 1957."]
      ],
      [
        ["En quelle année Alexander Fleming découvre-t-il la pénicilline ?", ["1928", "1898", "1948", "1968"], "Une moisissure accidentelle dans une boîte de culture."],
        ["En quelle année Edward Jenner pratique-t-il le premier vaccin, contre la variole ?", ["1796", "1696", "1746", "1896"], "Il inocule à un enfant la variole de la vache."],
        ["En quelle année Graham Bell dépose-t-il son brevet du téléphone ?", ["1876", "1846", "1906", "1926"], "La première phrase au téléphone : « Monsieur Watson, venez ici, je veux vous voir »."],
        ["En quelle année Albert Einstein publie-t-il la relativité restreinte ?", ["1905", "1879", "1915", "1925"], "1905 est son « année miraculeuse » ; la relativité générale suit en 1915."],
        ["En quelle année Henri Becquerel découvre-t-il la radioactivité ?", ["1896", "1876", "1906", "1926"], "Il remarque que l'uranium voile des plaques photographiques."],
        ["En quelle année l'ordinateur ENIAC est-il présenté au public ?", ["1946", "1936", "1956", "1966"], "Il pèse 30 tonnes et occupe une grande salle."],
        ["En quelle année James Watt dépose-t-il son brevet de machine à vapeur améliorée ?", ["1769", "1669", "1869", "1739"], "Elle lance la révolution industrielle."],
        ["En quelle année le tout premier SMS est-il envoyé ?", ["1992", "1982", "2002", "1972"], "« Merry Christmas », envoyé le 3 décembre 1992 au Royaume-Uni."]
      ],
      [
        ["En quelle année Watson et Crick décrivent-ils la structure de l'ADN ?", ["1953", "1933", "1973", "1913"], "En double hélice, avec l'aide du cliché de Rosalind Franklin."],
        ["En quelle année Newton publie-t-il ses Principia, sur la gravitation ?", ["1687", "1587", "1787", "1637"], "Les Principia posent les lois du mouvement et de la gravitation universelle."],
        ["En quelle année Robert Koch découvre-t-il le bacille de la tuberculose ?", ["1882", "1862", "1902", "1922"], "Il annonce sa découverte le 24 mars 1882."],
        ["En quelle année a lieu la première greffe du cœur ?", ["1967", "1947", "1957", "1977"], "Le chirurgien sud-africain Christiaan Barnard opère au Cap."],
        ["En quelle année naît Dolly, premier mammifère cloné ?", ["1996", "1986", "2006", "1976"], "La brebis naît en Écosse et meurt en 2003."],
        ["En quelle année la découverte du boson de Higgs est-elle annoncée ?", ["2012", "2002", "2008", "2016"], "Au CERN, le 4 juillet 2012."],
        ["En quelle année le transistor est-il inventé ?", ["1947", "1927", "1967", "1907"], "Aux laboratoires Bell ; il ouvre l'ère de l'électronique moderne."],
        ["En quelle année le premier laser fonctionne-t-il ?", ["1960", "1940", "1980", "1930"], "Theodore Maiman le réalise avec un cristal de rubis."]
      ]
    ],
    decouverte: [
      [
        ["Qui a énoncé la loi de la gravitation universelle ?", ["Isaac Newton", "Galilée", "Albert Einstein", "Nicolas Copernic"], "La légende de la pomme est célèbre, mais ses calculs l'étaient davantage."],
        ["Qui a découvert le polonium et le radium avec son mari ?", ["Marie Curie", "Rosalind Franklin", "Irène Joliot-Curie", "Louise Weiss"], "Marie Curie reçoit deux prix Nobel, en physique (1903) et en chimie (1911)."],
        ["Qui a proposé que la Terre tourne autour du Soleil ?", ["Nicolas Copernic", "Aristote", "Ptolémée", "Christophe Colomb"], "Son livre paraît en 1543, l'année de sa mort."],
        ["Quelle planète Galilée observe-t-il avec ses quatre grandes lunes en 1610 ?", ["Jupiter", "Mars", "Saturne", "Vénus"], "Io, Europe, Ganymède et Callisto sont appelées lunes galiléennes."],
        ["Qui a décrit la circulation du sang en 1628 ?", ["William Harvey", "Hippocrate", "Ambroise Paré", "Claude Bernard"], "Il montre que le cœur fait circuler toujours le même sang."],
        ["Qui est le premier Européen à atteindre l'Amérique en 1492 ?", ["Christophe Colomb", "Vasco de Gama", "Magellan", "Amerigo Vespucci"], "Il croyait avoir atteint les Indes."],
        ["Qui est à l'origine de la théorie de l'évolution par sélection naturelle ?", ["Charles Darwin", "Gregor Mendel", "Louis Pasteur", "Isaac Newton"], "L'Origine des espèces paraît en 1859."],
        ["Avec Edmund Hillary, qui atteint le premier le sommet de l'Everest en 1953 ?", ["Tenzing Norgay", "George Mallory", "Reinhold Messner", "Maurice Herzog"], "Le 29 mai 1953, à 8 849 m."]
      ],
      [
        ["Qui a découvert les lois de l'hérédité grâce à des pois ?", ["Gregor Mendel", "Charles Darwin", "Louis Pasteur", "Francis Crick"], "Ce moine cultivait des pois dans le jardin de son monastère."],
        ["Quels chercheurs ont isolé le virus du sida en 1983 ?", ["Françoise Barré-Sinoussi et Luc Montagnier", "Marie Curie et Pierre Curie", "Louis Pasteur et Émile Roux", "Jonas Salk et Albert Sabin"], "Ils reçoivent le prix Nobel de médecine en 2008."],
        ["Qui a calculé la circonférence de la Terre vers 240 av. J.-C. ?", ["Ératosthène", "Archimède", "Pythagore", "Euclide"], "Il compare l'ombre du Soleil à deux endroits d'Égypte."],
        ["Qui a découvert les rayons X en 1895 ?", ["Wilhelm Röntgen", "Henri Becquerel", "Pierre Curie", "Max Planck"], "Premier prix Nobel de physique, en 1901."],
        ["Qui atteint l'Inde par la mer en 1498 en contournant l'Afrique ?", ["Vasco de Gama", "Ferdinand de Magellan", "Christophe Colomb", "Jacques Cartier"], "Il ouvre la route maritime des épices."],
        ["Qui a donné son nom à l'oxygène et formulé « rien ne se perd, rien ne se crée » ?", ["Antoine Lavoisier", "Joseph Priestley", "Dmitri Mendeleïev", "Robert Boyle"], "Il est guillotiné en 1794."],
        ["Qui publie la classification périodique des éléments en 1869 ?", ["Dmitri Mendeleïev", "Antoine Lavoisier", "Marie Curie", "Niels Bohr"], "Il laisse des cases vides pour des éléments encore inconnus."],
        ["Qui observe le premier des micro-organismes avec un microscope vers 1675 ?", ["Antoni van Leeuwenhoek", "Louis Pasteur", "Robert Hooke", "Galilée"], "Il les appelle « animalcules »."]
      ],
      [
        ["Qui découvre l'induction électromagnétique en 1831 ?", ["Michael Faraday", "James Clerk Maxwell", "Alessandro Volta", "Georg Ohm"], "Principe de base des générateurs et des transformateurs."],
        ["Quelle chercheuse a réalisé le célèbre « cliché 51 » de l'ADN ?", ["Rosalind Franklin", "Marie Curie", "Irène Joliot-Curie", "Dorothy Hodgkin"], "Cette image fut essentielle pour comprendre la double hélice."],
        ["Qui prouve l'existence des ondes électromagnétiques en 1887 ?", ["Heinrich Hertz", "James Clerk Maxwell", "Guglielmo Marconi", "Nikola Tesla"], "L'unité de fréquence, le hertz, porte son nom."],
        ["Qui est le premier humain dans l'espace, en 1961 ?", ["Youri Gagarine", "Alan Shepard", "Neil Armstrong", "Valentina Terechkova"], "Il boucle une orbite autour de la Terre en 108 minutes."],
        ["Qui découvre la planète Uranus en 1781 ?", ["William Herschel", "Galilée", "Johannes Kepler", "Edmond Halley"], "C'est la première planète découverte avec un télescope."],
        ["Qui découvre Neptune par le calcul en 1846 ?", ["Urbain Le Verrier", "Isaac Newton", "William Herschel", "Pierre-Simon de Laplace"], "Il la situe grâce aux perturbations de l'orbite d'Uranus."],
        ["Qui énonce que les planètes décrivent des ellipses autour du Soleil ?", ["Johannes Kepler", "Galilée", "Nicolas Copernic", "Tycho Brahe"], "Ses trois lois datent de 1609 et 1619."],
        ["Quel physicien danois propose un modèle de l'atome en 1913 ?", ["Niels Bohr", "Ernest Rutherford", "Max Planck", "Erwin Schrödinger"], "Les électrons y gravitent sur des niveaux d'énergie précis."]
      ]
    ]
  },

  monuments: {
    france: [
      [
        ["Dans quelle ville se trouve la tour Eiffel ?", ["Paris", "Lyon", "Bordeaux", "Lille"], "Achevée en 1889 pour l'Exposition universelle."],
        ["Dans quelle région se trouve le Mont-Saint-Michel ?", ["Normandie", "Bretagne", "Vendée", "Picardie"], "L'abbaye se dresse sur un îlot de la baie, entouré par de fortes marées."],
        ["Près de quelle grande ville se trouve le château de Versailles ?", ["Paris", "Lyon", "Tours", "Rouen"], "Louis XIV y installe la cour en 1682."],
        ["Dans quelle ville se trouve le Palais des Papes ?", ["Avignon", "Marseille", "Nîmes", "Orange"], "Les papes y résident au XIVe siècle."],
        ["Dans quelle région se trouve la cité fortifiée de Carcassonne ?", ["Occitanie", "Bretagne", "Alsace", "Centre-Val de Loire"], "Elle compte une cinquantaine de tours et de remparts restaurés par Viollet-le-Duc."],
        ["Près de quelle ville se trouve le pont du Gard, un aqueduc romain ?", ["Nîmes", "Dijon", "Nantes", "Strasbourg"], "Il alimentait Nîmes en eau il y a près de 2 000 ans."],
        ["Dans quelle vallée se trouve le château de Chambord ?", ["La Loire", "Le Rhin", "La Garonne", "La Seine"], "François Ier en fait bâtir un château de chasse démesuré."],
        ["Dans quelle ville se trouve la cathédrale Notre-Dame, touchée par l'incendie de 2019 ?", ["Paris", "Reims", "Chartres", "Amiens"], "La flèche et la charpente ont brûlé le 15 avril 2019."]
      ],
      [
        ["Le viaduc de Millau enjambe la vallée de quelle rivière ?", ["Le Tarn", "Le Rhône", "La Loire", "Le Lot"], "Ouvert en 2004, il mesure 343 m de hauteur au point le plus haut."],
        ["Dans quelle région se trouvent les gorges du Verdon ?", ["Provence", "Bretagne", "Alsace", "Normandie"], "Un canyon aux eaux turquoise, entre Alpes-de-Haute-Provence et Var."],
        ["Dans quel département se trouve le Palais idéal du facteur Cheval ?", ["La Drôme", "L'Ardèche", "L'Isère", "La Savoie"], "Il l'a bâti seul, pierre après pierre, pendant 33 ans, à Hauterives."],
        ["Dans quelle ville les rois de France étaient-ils sacrés ?", ["Reims", "Chartres", "Amiens", "Paris"], "Clovis y aurait été baptisé vers 496."],
        ["Sur quel fleuve le fameux pont d'Avignon était-il construit ?", ["Le Rhône", "La Seine", "La Loire", "La Durance"], "Le pont Saint-Bénézet, dont il ne reste que quatre arches."],
        ["Dans quelle région se trouvent les alignements de Carnac ?", ["Bretagne", "Normandie", "Alsace", "Corse"], "Plus de 3 000 menhirs dressés il y a environ 6 000 ans."],
        ["Dans quelle région se trouve l'abbaye de Cluny ?", ["Bourgogne", "Bretagne", "Alsace", "Provence"], "Au Moyen Âge, c'était le plus grand centre monastique d'Occident."],
        ["Dans quel département se trouve la grotte de Lascaux ?", ["La Dordogne", "L'Ardèche", "Les Pyrénées-Atlantiques", "La Savoie"], "Ses peintures ont environ 17 000 ans."]
      ],
      [
        ["Dans quelle région se trouve l'abbaye cistercienne de Fontenay, classée à l'UNESCO ?", ["Bourgogne", "Bretagne", "Alsace", "Provence"], "Elle date du XIIe siècle."],
        ["Peyrepertuse est un château de quel type ?", ["Un château cathare", "Un château gallo-romain", "Un château napoléonien", "Un château néoclassique"], "Perché à plus de 800 m, dans les Corbières."],
        ["Dans quel département se trouve la saline royale d'Arc-et-Senans ?", ["Le Doubs", "Les Landes", "Le Finistère", "Le Var"], "Conçue par Claude-Nicolas Ledoux, architecte des Lumières."],
        ["Quel ingénieur a fortifié de nombreuses villes frontières sous Louis XIV ?", ["Vauban", "Viollet-le-Duc", "Haussmann", "Eiffel"], "Douze sites de Vauban sont classés à l'UNESCO."],
        ["Dans quelle ville se trouve le château d'If, rendu célèbre par Alexandre Dumas ?", ["Marseille", "Toulon", "Nice", "Bordeaux"], "Le comte de Monte-Cristo y est emprisonné."],
        ["Dans quel estuaire se dresse le phare de Cordouan, « roi des phares » ?", ["La Gironde", "La Seine", "La Loire", "Le Rhône"], "Il est le plus ancien phare de France encore en activité."],
        ["Dans quel département se trouve le château de Fontainebleau ?", ["La Seine-et-Marne", "Les Yvelines", "L'Essonne", "L'Oise"], "Plusieurs rois et Napoléon y ont séjourné."],
        ["Qui a construit le pont du Gard ?", ["Les Romains", "Les Grecs", "Les Gaulois", "Les Carolingiens"], "Il date du Ier siècle de notre ère."]
      ]
    ],
    europe: [
      [
        ["Dans quelle ville se trouve le Colisée ?", ["Rome", "Athènes", "Florence", "Naples"], "Il pouvait accueillir environ 50 000 spectateurs."],
        ["Dans quelle ville se trouve la Sagrada Família ?", ["Barcelone", "Madrid", "Séville", "Valence"], "Elle est l'œuvre d'Antoni Gaudí, toujours en chantier."],
        ["Dans quelle ville se trouve Big Ben ?", ["Londres", "Édimbourg", "Dublin", "Manchester"], "C'est en fait le nom de la grosse cloche de la tour du palais de Westminster."],
        ["Dans quelle ville se trouve l'Acropole ?", ["Athènes", "Rome", "Istanbul", "Sparte"], "Le Parthénon y domine la cité depuis 2 500 ans."],
        ["Dans quel pays se trouve la tour de Pise ?", ["L'Italie", "L'Espagne", "La Grèce", "Le Portugal"], "Elle penche depuis sa construction à cause d'un sol meuble."],
        ["Dans quelle ville se trouve la porte de Brandebourg ?", ["Berlin", "Munich", "Vienne", "Prague"], "Elle est devenue le symbole de la réunification allemande."],
        ["Dans quelle ville se trouve la statue de la Petite Sirène ?", ["Copenhague", "Oslo", "Stockholm", "Helsinki"], "Elle illustre un conte d'Andersen."],
        ["Dans quelle ville se trouve la place Rouge ?", ["Moscou", "Saint-Pétersbourg", "Kiev", "Varsovie"], "Le Kremlin la borde d'un côté."]
      ],
      [
        ["Dans quelle ville se trouve l'Alhambra ?", ["Grenade", "Séville", "Cordoue", "Tolède"], "Un palais-forteresse de l'époque nasride."],
        ["Dans quelle région d'Allemagne se trouve le château de Neuschwanstein ?", ["La Bavière", "La Saxe", "La Hesse", "La Rhénanie"], "Il a inspiré le château de la Belle au bois dormant de Disney."],
        ["Dans quel pays se trouve Stonehenge ?", ["L'Angleterre", "L'Écosse", "L'Irlande", "Le pays de Galles"], "Un cercle de pierres dressées il y a environ 4 500 ans."],
        ["Dans quelle ville se trouve la cathédrale Saint-Basile-le-Bienheureux, aux coupoles colorées ?", ["Moscou", "Kiev", "Minsk", "Riga"], "Ivan le Terrible la fait construire au XVIe siècle."],
        ["Dans quelle ville se trouve le Duomo, coiffé de la coupole de Brunelleschi ?", ["Florence", "Venise", "Milan", "Pise"], "Une coupole construite sans échafaudage au XVe siècle."],
        ["Dans quelle ville se trouve le pont Charles, orné de statues ?", ["Prague", "Vienne", "Budapest", "Cracovie"], "Il enjambe la Vltava."],
        ["Dans quelle ville se trouve le Parlement hongrois, au bord du Danube ?", ["Budapest", "Prague", "Bratislava", "Belgrade"], "Un édifice néogothique long de 268 m."],
        ["Dans quelle ville se trouve Sainte-Sophie, ancienne basilique devenue mosquée ?", ["Istanbul", "Athènes", "Ankara", "Sofia"], "Construite au VIe siècle, elle a été église, mosquée, musée, puis de nouveau mosquée."]
      ],
      [
        ["Dans quelle ville croate se trouve le palais de Dioclétien ?", ["Split", "Zagreb", "Dubrovnik", "Zadar"], "L'empereur romain s'y retira au IVe siècle ; il abrite aujourd'hui le centre-ville."],
        ["Dans quelle ville se trouve la célèbre cathédrale gothique aux deux flèches, le Kölner Dom ?", ["Cologne", "Aix-la-Chapelle", "Düsseldorf", "Bonn"], "Sa construction a duré plus de 600 ans."],
        ["Dans quel pays se trouvent les monastères perchés des Météores ?", ["La Grèce", "La Bulgarie", "L'Albanie", "La Macédoine du Nord"], "Ils sont bâtis au sommet de colonnes rocheuses."],
        ["Dans quel pays se trouve le village lacustre de Hallstatt ?", ["L'Autriche", "La Suisse", "L'Allemagne", "La Slovénie"], "Il est classé à l'UNESCO pour sa tradition du sel."],
        ["Dans quelle partie du Royaume-Uni se trouve le village néolithique de Skara Brae ?", ["L'Écosse (Orcades)", "L'Irlande du Nord", "Le pays de Galles", "L'Angleterre"], "Il a plus de 5 000 ans."],
        ["Dans quelle ville se trouve le pont du Rialto ?", ["Venise", "Florence", "Vérone", "Padoue"], "Il enjambe le Grand Canal."],
        ["Dans quelle ville se trouve le pont Stari Most, reconstruit après la guerre ?", ["Mostar", "Sarajevo", "Belgrade", "Zagreb"], "Détruit en 1993, il a rouvert en 2004."],
        ["Dans quelle ville se trouve la tour de Belém ?", ["Lisbonne", "Porto", "Madrid", "Séville"], "Elle rappelle l'âge des grandes découvertes portugaises."]
      ]
    ],
    monde: [
      [
        ["Dans quelle ville se trouve la statue de la Liberté ?", ["New York", "Washington", "Boston", "Los Angeles"], "Offerte par la France aux États-Unis en 1886."],
        ["Dans quel pays se trouvent les pyramides de Gizeh ?", ["L'Égypte", "Le Mexique", "Le Pérou", "Le Soudan"], "La grande pyramide de Khéops a près de 4 500 ans."],
        ["Dans quel pays se trouve la Grande Muraille ?", ["La Chine", "Le Japon", "L'Inde", "La Corée"], "Elle s'étend sur des milliers de kilomètres."],
        ["Dans quel pays se trouve le Taj Mahal ?", ["L'Inde", "Le Pakistan", "L'Iran", "La Turquie"], "Un mausolée en marbre blanc, à Agra."],
        ["Dans quel pays se trouve l'opéra de Sydney ?", ["L'Australie", "La Nouvelle-Zélande", "L'Afrique du Sud", "Le Canada"], "Ses toits en forme de voiles sont célèbres."],
        ["Dans quelle ville se trouve la statue du Christ Rédempteur ?", ["Rio de Janeiro", "Buenos Aires", "Lima", "Mexico"], "Elle domine la ville depuis le Corcovado."],
        ["Dans quel pays se trouve la cité inca du Machu Picchu ?", ["Le Pérou", "Le Mexique", "La Bolivie", "La Colombie"], "Elle se dresse à environ 2 400 m d'altitude."],
        ["Dans quel pays se trouve le mont Fuji ?", ["Le Japon", "La Chine", "La Corée du Sud", "La Thaïlande"], "Un volcan de 3 776 m, symbole du pays."]
      ],
      [
        ["Dans quel pays se trouve le temple d'Angkor Vat ?", ["Le Cambodge", "La Thaïlande", "Le Viêt Nam", "Le Laos"], "Le plus grand monument religieux du monde."],
        ["Dans quel pays se trouve la cité rose de Pétra ?", ["La Jordanie", "L'Égypte", "Israël", "La Syrie"], "Elle est taillée dans la roche par les Nabatéens."],
        ["Dans quel pays se trouve le site maya de Chichén Itzá ?", ["Le Mexique", "Le Pérou", "Le Guatemala", "Le Honduras"], "Sa pyramide de Kukulkán est un calendrier de pierre."],
        ["Dans quelle ville se trouve la Cité interdite ?", ["Pékin", "Shanghai", "Hong Kong", "Tokyo"], "Palais des empereurs chinois pendant près de cinq siècles."],
        ["Dans quel pays se trouve le rocher sacré d'Uluru ?", ["L'Australie", "L'Afrique du Sud", "Le Brésil", "La Namibie"], "Un monolithe rouge au cœur du désert."],
        ["Dans quelle ville se trouve la tour Burj Khalifa, la plus haute du monde ?", ["Dubaï", "Doha", "Riyad", "Abou Dhabi"], "Elle dépasse 828 m."],
        ["Les chutes Victoria sont à la frontière de la Zambie et de quel pays ?", ["Le Zimbabwe", "Le Kenya", "La Tanzanie", "L'Angola"], "Les habitants les nomment « la fumée qui gronde »."],
        ["Dans quel pays se trouve le temple d'Abou Simbel ?", ["L'Égypte", "Le Soudan", "La Libye", "La Jordanie"], "Ramsès II l'a fait creuser dans la falaise."]
      ],
      [
        ["Dans quel pays se trouve le temple de Borobudur ?", ["L'Indonésie", "La Thaïlande", "La Birmanie", "Le Sri Lanka"], "Le plus grand temple bouddhiste du monde, sur l'île de Java."],
        ["Dans quel pays se trouve la cité antique de Persépolis ?", ["L'Iran", "L'Irak", "La Turquie", "La Syrie"], "Capitale cérémonielle de l'empire perse achéménide."],
        ["Dans quel pays se trouve Tombouctou et ses mosquées de terre ?", ["Le Mali", "Le Niger", "La Mauritanie", "Le Tchad"], "Un grand centre de savoir de l'Afrique de l'Ouest."],
        ["Dans quel pays se trouve la cité de Teotihuacán, aux pyramides du Soleil et de la Lune ?", ["Le Mexique", "Le Pérou", "La Bolivie", "La Colombie"], "Elle fut l'une des plus grandes villes du monde vers l'an 500."],
        ["Dans quel pays se trouve le site du Grand Zimbabwe ?", ["Le Zimbabwe", "L'Afrique du Sud", "Le Mozambique", "Le Botswana"], "Le pays tire son nom de ces ruines de pierre."],
        ["Dans quel pays se trouvent les grottes peintes d'Ajanta ?", ["L'Inde", "Le Népal", "Le Sri Lanka", "La Birmanie"], "Des fresques bouddhistes vieilles de plus de 1 500 ans."],
        ["Dans quel pays se trouve la plaine de Bagan et ses milliers de temples ?", ["La Birmanie", "La Thaïlande", "Le Laos", "Le Cambodge"], "Plus de 2 000 temples subsistent."],
        ["Où se dressent les statues géantes appelées moaïs ?", ["Sur l'île de Pâques", "À Hawaï", "À Tahiti", "En Nouvelle-Zélande"], "Elles sont attribuées au peuple rapa nui."]
      ]
    ]
  },

  corps: {
    anatomie: [
      [
        ["Combien d'os compte le squelette d'un adulte ?", ["206", "106", "306", "406"], "Un bébé en a environ 300, qui se soudent peu à peu."],
        ["Quel est le plus grand organe du corps humain ?", ["La peau", "Le foie", "Le cœur", "L'intestin"], "Elle couvre environ 2 m² chez un adulte."],
        ["Combien de dents compte un adulte, dents de sagesse comprises ?", ["32", "28", "36", "24"], "Vingt dents de lait tombent pendant l'enfance."],
        ["Quel organe pompe le sang dans tout le corps ?", ["Le cœur", "Le foie", "Le poumon", "Le rein"], "Il bat environ 100 000 fois par jour."],
        ["Comment s'appelle l'os de la cuisse ?", ["Le fémur", "L'humérus", "Le tibia", "Le radius"], "C'est le plus long et le plus solide du corps."],
        ["Où le sang se charge-t-il en oxygène ?", ["Dans les poumons", "Dans l'estomac", "Dans le foie", "Dans le cerveau"], "L'oxygène passe de l'air au sang dans de minuscules alvéoles."],
        ["Combien de reins a-t-on en général ?", ["2", "1", "3", "4"], "On peut vivre avec un seul rein."],
        ["Quels organes filtrent le sang et produisent l'urine ?", ["Les reins", "Le foie", "La rate", "Le pancréas"], "Ils filtrent environ 180 litres de sang par jour."]
      ],
      [
        ["Quel est le plus long os du corps ?", ["Le fémur", "Le tibia", "L'humérus", "Le péroné"], "Il mesure environ le quart de la taille d'un adulte."],
        ["Quel est le plus petit os du corps ?", ["L'étrier", "La phalange", "Le coccyx", "La rotule"], "Il se trouve dans l'oreille moyenne et mesure environ 3 mm."],
        ["Combien de côtes compte un adulte ?", ["24 (12 paires)", "12", "32", "20"], "Elles protègent le cœur et les poumons."],
        ["Quel organe fabrique la bile ?", ["Le foie", "L'estomac", "Le pancréas", "La rate"], "La bile aide à digérer les graisses."],
        ["Quelle glande produit l'insuline ?", ["Le pancréas", "Le foie", "La thyroïde", "La rate"], "Cette hormone régule le sucre dans le sang."],
        ["Quel muscle sépare le thorax de l'abdomen et sert à respirer ?", ["Le diaphragme", "Le biceps", "Le trapèze", "Le psoas"], "Il se contracte à chaque inspiration."],
        ["Quel est le plus gros muscle du corps humain ?", ["Le grand fessier", "Le biceps", "Le quadriceps", "Le deltoïde"], "Il permet de se tenir debout et de monter les escaliers."],
        ["Quel liquide circule dans les vaisseaux lymphatiques ?", ["La lymphe", "La bile", "La salive", "Le sérum"], "Elle participe à la défense contre les infections."]
      ],
      [
        ["Combien de vertèbres cervicales compte-t-on chez l'humain ?", ["7", "5", "9", "12"], "Même la girafe n'en a que 7."],
        ["Comment s'appelle l'os de la mâchoire inférieure ?", ["La mandibule", "Le maxillaire", "L'hyoïde", "Le sphénoïde"], "C'est le seul os mobile du crâne."],
        ["Le tendon d'Achille relie le mollet à quelle partie du pied ?", ["Au talon", "Au genou", "À la hanche", "À l'orteil"], "C'est le plus gros tendon du corps."],
        ["Quelle protéine des globules rouges transporte l'oxygène ?", ["L'hémoglobine", "L'insuline", "La mélanine", "La kératine"], "C'est elle qui donne sa couleur rouge au sang."],
        ["Quel os de l'avant-bras se trouve du côté du pouce ?", ["Le radius", "Le cubitus", "L'humérus", "La clavicule"], "L'autre os de l'avant-bras est le cubitus."],
        ["Quelle partie de l'œil contient les cellules sensibles à la lumière ?", ["La rétine", "La cornée", "L'iris", "Le cristallin"], "Elle envoie l'image au cerveau par le nerf optique."],
        ["Quelles cavités du cœur reçoivent le sang qui revient dans le cœur ?", ["Les oreillettes", "Les ventricules", "Les artères", "Les valves"], "Les ventricules, eux, envoient le sang dans les artères."],
        ["Combien de paires de chromosomes une cellule humaine compte-t-elle ?", ["23", "13", "33", "46"], "Soit 46 chromosomes au total."]
      ]
    ],
    cerveau: [
      [
        ["Quel sens utilise-t-on avec la langue ?", ["Le goût", "L'odorat", "Le toucher", "L'ouïe"], "La langue porte des milliers de papilles gustatives."],
        ["Quel organe contrôle la pensée et les mouvements ?", ["Le cerveau", "Le cœur", "Le foie", "L'estomac"], "Il pèse environ 1,4 kg."],
        ["Quelle partie colorée de l'œil entoure la pupille ?", ["L'iris", "La cornée", "La rétine", "Le cristallin"], "C'est elle qui donne sa couleur aux yeux."],
        ["Combien de sens traditionnels compte-t-on ?", ["5", "3", "7", "9"], "La vue, l'ouïe, l'odorat, le goût et le toucher."],
        ["Comment s'appellent les cellules qui transmettent les messages nerveux ?", ["Les neurones", "Les globules", "Les hormones", "Les fibres"], "Ils communiquent par de petits signaux électriques."],
        ["Quel organe permet d'entendre et de garder l'équilibre ?", ["L'oreille", "L'œil", "Le nez", "La langue"], "L'oreille interne contient le système de l'équilibre."],
        ["Quel sens utilise surtout la peau ?", ["Le toucher", "La vue", "L'ouïe", "L'odorat"], "Elle perçoit la chaleur, la pression, la douleur."],
        ["Combien d'hémisphères compte le cerveau ?", ["2", "1", "3", "4"], "Le droit et le gauche, reliés par le corps calleux."]
      ],
      [
        ["Combien de neurones contient environ le cerveau humain ?", ["Environ 86 milliards", "Environ 1 million", "Environ 10 milliards", "Environ 1 000 milliards"], "Chaque neurone peut être relié à des milliers d'autres."],
        ["Quelle partie du cerveau coordonne l'équilibre et les mouvements ?", ["Le cervelet", "L'hippocampe", "Le lobe frontal", "Le bulbe rachidien"], "Il se situe à l'arrière du crâne, sous le cerveau."],
        ["Quelle hormone du sommeil est fabriquée surtout la nuit ?", ["La mélatonine", "L'adrénaline", "L'insuline", "La cortisone"], "La lumière des écrans peut en freiner la production."],
        ["Quelle hormone prépare le corps à réagir au stress ou au danger ?", ["L'adrénaline", "L'insuline", "La mélatonine", "La thyroxine"], "Le cœur bat plus vite, la respiration s'accélère."],
        ["L'iris règle la taille de quelle partie de l'œil ?", ["La pupille", "La cornée", "La rétine", "Le cristallin"], "La pupille se resserre à la lumière vive."],
        ["Quel nerf relie l'œil au cerveau ?", ["Le nerf optique", "Le nerf vague", "Le nerf sciatique", "Le nerf facial"], "Il transporte environ un million de fibres."],
        ["Quel est le plus long nerf du corps humain ?", ["Le nerf sciatique", "Le nerf optique", "Le nerf vague", "Le nerf facial"], "Il descend du bas du dos jusqu'au pied."],
        ["Quelle structure du cerveau joue un rôle majeur dans la mémoire ?", ["L'hippocampe", "Le cervelet", "Le bulbe rachidien", "L'hypothalamus"], "Son nom vient de sa forme d'hippocampe, le petit cheval de mer."]
      ],
      [
        ["Dans quel lobe du cerveau se trouve l'aire de Broca, liée au langage ?", ["Le lobe frontal", "Le lobe occipital", "Le cervelet", "Le tronc cérébral"], "Paul Broca la décrit en 1861."],
        ["Dans quel lobe se trouve le cortex visuel ?", ["Le lobe occipital", "Le lobe frontal", "Le lobe temporal", "Le lobe pariétal"], "À l'arrière de la tête."],
        ["Combien d'osselets compte l'oreille moyenne ?", ["3", "2", "4", "5"], "Le marteau, l'enclume et l'étrier."],
        ["Quelle structure de l'oreille interne transforme les sons en signaux nerveux ?", ["La cochlée", "Le tympan", "L'enclume", "La trompe d'Eustache"], "Elle a la forme d'un escargot."],
        ["Quelles cellules de la rétine permettent de voir les couleurs ?", ["Les cônes", "Les bâtonnets", "Les cils", "Les papilles"], "Les bâtonnets, eux, servent surtout à voir dans la pénombre."],
        ["Combien de saveurs de base distingue-t-on classiquement ?", ["5", "4", "6", "3"], "Sucré, salé, acide, amer et umami."],
        ["La dopamine est surtout associée à quoi ?", ["La motivation et la récompense", "La digestion", "La croissance des os", "La vue"], "On l'appelle parfois la molécule du plaisir et de l'envie."],
        ["Quel organe contient les canaux semi-circulaires, qui détectent les mouvements de la tête ?", ["L'oreille interne", "L'œil", "Le nez", "La langue"], "Ils renseignent le cerveau sur la position de la tête."]
      ]
    ],
    sante: [
      [
        ["Quelle vitamine fabrique-t-on grâce au soleil ?", ["La vitamine D", "La vitamine C", "La vitamine A", "La vitamine B12"], "Elle aide à fixer le calcium dans les os."],
        ["Combien d'heures de sommeil recommande-t-on à un adulte ?", ["7 à 9 heures", "2 à 3 heures", "4 à 5 heures", "10 à 12 heures"], "Les enfants et les adolescents en ont besoin davantage."],
        ["Quel minéral renforce les os et les dents ?", ["Le calcium", "Le fer", "Le sodium", "L'iode"], "On en trouve dans le lait, le fromage ou certains légumes verts."],
        ["Quel aliment est riche en vitamine C ?", ["L'orange", "Le beurre", "Le riz", "Le pain"], "Le kiwi, le citron et le poivron aussi."],
        ["À quoi sert un vaccin ?", ["À préparer le corps à se défendre", "À soigner toutes les maladies", "À remplacer le sommeil", "À faire grandir"], "Il entraîne le système immunitaire avant la vraie maladie."],
        ["Quelle boisson hydrate le mieux le corps ?", ["L'eau", "Le soda", "Le café", "Le sirop"], "Le corps est composé d'environ 60 % d'eau."],
        ["Quel est le rôle des globules blancs ?", ["Défendre contre les infections", "Transporter l'oxygène", "Coaguler le sang", "Digérer les aliments"], "Ils sont les soldats du système immunitaire."],
        ["Quel gaz nos cellules utilisent-elles pour produire de l'énergie ?", ["L'oxygène", "L'azote", "L'hélium", "L'hydrogène"], "On le respire grâce aux poumons."]
      ],
      [
        ["Quelle vitamine prévient le scorbut ?", ["La vitamine C", "La vitamine D", "La vitamine A", "La vitamine K"], "Les marins en manquaient lors des longs voyages."],
        ["Quel minéral manque en cas d'anémie ferriprive ?", ["Le fer", "Le calcium", "L'iode", "Le zinc"], "Il sert à fabriquer l'hémoglobine."],
        ["Quelle vitamine est importante pour la vue, notamment la vision nocturne ?", ["La vitamine A", "La vitamine C", "La vitamine D", "La vitamine K"], "On la trouve dans les carottes, entre autres."],
        ["Quel groupe sanguin est donneur universel pour les globules rouges ?", ["O négatif", "AB positif", "A positif", "B négatif"], "Il peut être transfusé presque à tout le monde."],
        ["Quel organe est atteint par l'hépatite ?", ["Le foie", "Le rein", "Le poumon", "Le cœur"], "Le mot hépatite signifie « inflammation du foie »."],
        ["Quelle est la fréquence cardiaque normale d'un adulte au repos ?", ["60 à 100 battements par minute", "20 à 40", "120 à 160", "Plus de 200"], "Les sportifs ont souvent un cœur plus lent."],
        ["Quelle hormone régule le sucre dans le sang ?", ["L'insuline", "L'adrénaline", "La mélatonine", "La thyroxine"], "Le diabète vient d'un défaut de cette régulation."],
        ["L'indice de masse corporelle (IMC) se calcule à partir de quoi ?", ["Du poids et de la taille", "De l'âge et du poids", "De la taille et de l'âge", "Du tour de taille seul"], "IMC = poids en kg divisé par la taille en mètres, au carré."]
      ],
      [
        ["Quelle maladie touche les enfants carencés en vitamine D ?", ["Le rachitisme", "Le scorbut", "Le béribéri", "La pellagre"], "Les os se déforment faute de calcium fixé."],
        ["Une carence en vitamine B1 provoque quelle maladie ?", ["Le béribéri", "Le scorbut", "Le rachitisme", "Le goitre"], "Elle touchait surtout les populations vivant de riz poli."],
        ["Une carence en iode provoque souvent quelle affection ?", ["Le goitre", "L'anémie", "Le scorbut", "L'ostéoporose"], "La thyroïde grossit en cherchant à compenser."],
        ["Quel gaz rejette-t-on en plus grande quantité lorsqu'on expire (hors azote) ?", ["Le dioxyde de carbone", "L'hélium", "L'hydrogène", "Le méthane"], "Il est produit par les cellules quand elles consomment de l'oxygène."],
        ["Quel organe fabrique la plus grande partie du cholestérol du corps ?", ["Le foie", "Le cœur", "L'estomac", "Le poumon"], "Le reste vient de l'alimentation."],
        ["Que mesure la glycémie ?", ["Le taux de sucre dans le sang", "La tension", "Le cholestérol", "Le rythme du cœur"], "On la surveille notamment dans le diabète."],
        ["Que mesure la tension artérielle ?", ["La pression du sang sur les artères", "Le nombre de globules", "Le taux de sucre", "La température"], "Elle s'exprime en deux valeurs, par exemple 12/8."],
        ["Quel organe est surtout touché par la tuberculose ?", ["Les poumons", "Le foie", "Les reins", "La peau"], "Elle est causée par le bacille de Koch."]
      ]
    ]
  }
};

/* ---------- déclaration des 4 formats ---------- */
Object.assign(FORMATS, {
  expressions: { name: "Expressions françaises", color: "#D9534F", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                 kinds: { sens: { label: "Sens des expressions", color: "#E8664F" }, complete: { label: "Complète l'expression", color: "#C2417A" }, animaux: { label: "Expressions animales", color: "#5A8F3C" } },
                 sub: "Que veut dire cette expression ? Comment se termine ce proverbe ? 20 secondes par question." },
  inventions:  { name: "Inventions et découvertes", color: "#3F7CC4", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                 kinds: { qui: { label: "Qui l'a inventé ?", color: "#3F7CC4" }, quand: { label: "Quand ?", color: "#8A4FD6" }, decouverte: { label: "Grands découvreurs", color: "#2BA3B8" } },
                 sub: "Qui a inventé quoi, et quand ? 20 secondes par question." },
  monuments:   { name: "Monuments du monde", color: "#C8872E", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                 kinds: { france: { label: "En France", color: "#4A72E0" }, europe: { label: "En Europe", color: "#1E9A73" }, monde: { label: "Dans le monde", color: "#E0663A" } },
                 sub: "Où se trouve ce monument célèbre ? 20 secondes par question." },
  corps:       { name: "Corps humain et santé", color: "#D9487B", eng: "mcq", per: 3, max: 300, secs: 20, man: "kinds",
                 kinds: { anatomie: { label: "Anatomie", color: "#D9487B" }, cerveau: { label: "Cerveau et sens", color: "#8A4FD6" }, sante: { label: "Santé et nutrition", color: "#1E9A73" } },
                 sub: "Os, organes, sens, vitamines… Quatre réponses, 20 secondes par question." }
});
CONFIG.formatOrder.push("expressions", "inventions", "monuments", "corps");

/* ---------- illustrations ---------- */
Object.assign(ART2, {
  expressions: (r, rot) => bgr("#D9534F", "#E2645F", rot) + `
    <path d="M214 56h150a22 22 0 0 1 22 22v62a22 22 0 0 1-22 22h-92l-34 30 6-30h-30a22 22 0 0 1-22-22V78a22 22 0 0 1 22-22z" fill="#8F2E2B" transform="translate(7 8)"/>
    <path d="M214 56h150a22 22 0 0 1 22 22v62a22 22 0 0 1-22 22h-92l-34 30 6-30h-30a22 22 0 0 1-22-22V78a22 22 0 0 1 22-22z" fill="#FFF6EC"/>
    <text x="294" y="126" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="800" font-size="52" fill="#D9534F">« »</text>
    ${spark(390, 40, 9, "#FFD45C")}${spark(196, 196, 7, "#FBD9D6")}`,
  inventions: (r, rot) => bgr("#3F7CC4", "#4C89CF", rot) + `
    <circle cx="296" cy="104" r="52" fill="#245A94" transform="translate(7 8)"/><circle cx="296" cy="104" r="52" fill="#FFD45C" stroke="#2A2333" stroke-width="5"/>
    <path d="M276 150h40v22a10 10 0 0 1-10 10h-20a10 10 0 0 1-10-10z" fill="#FFF6EC" stroke="#2A2333" stroke-width="5"/>
    <path d="M280 108l10-16 8 20 8-20 10 16" fill="none" stroke="#2A2333" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    ${[[212, 60], [380, 150], [214, 170]].map(([x, y]) => spark(x, y, 8, "#FFD45C")).join("")}`,
  monuments: (r, rot) => bgr("#C8872E", "#D2963F", rot) + `
    <g transform="translate(7 8)" fill="#8A5A17"><path d="M214 190h164v18H214z"/><path d="M226 80h140l-70-36z"/>${[0, 1, 2, 3].map(i => `<rect x="${236 + i * 34}" y="84" width="18" height="102"/>`).join("")}</g>
    <path d="M214 190h164v18H214z" fill="#FFF6EC" stroke="#2A2333" stroke-width="5"/><path d="M226 80h140l-70-36z" fill="#FFF6EC" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    ${[0, 1, 2, 3].map(i => `<rect x="${236 + i * 34}" y="84" width="18" height="102" fill="#FFF6EC" stroke="#2A2333" stroke-width="5"/>`).join("")}
    ${spark(390, 40, 9, "#FFD45C")}${spark(196, 60, 7, "#FBE6C4")}`,
  corps: (r, rot) => bgr("#D9487B", "#E25A8B", rot) + `
    <path d="M296 190C226 142 212 108 212 84a40 40 0 0 1 84-14 40 40 0 0 1 84 14c0 24-14 58-84 106z" fill="#8F2350" transform="translate(7 8)"/>
    <path d="M296 190C226 142 212 108 212 84a40 40 0 0 1 84-14 40 40 0 0 1 84 14c0 24-14 58-84 106z" fill="#FFF6EC" stroke="#2A2333" stroke-width="5" stroke-linejoin="round"/>
    <path d="M226 110h34l12-22 20 44 14-30 14 8h40" fill="none" stroke="#D9487B" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    ${spark(390, 44, 9, "#FFD45C")}${spark(196, 200, 7, "#FBD3E1")}`
});

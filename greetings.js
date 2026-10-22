// Random welcome message, never the same twice in a row.
(function () {
  var any = [
    "Salut {n}", "Hey {n}", "Coucou {n}", "Hello {n}", "Yo {n}",
    "Bienvenue, {n}", "Te revoilà, {n}", "Bon retour, {n}", "Re-salut {n}",
    "Content de te voir, {n}", "Ravi de te revoir, {n}", "Heureux de te voir, {n}",
    "Quoi de neuf, {n} ?", "Ça roule, {n} ?", "Tout roule, {n} ?", "En forme, {n} ?",
    "Alors {n}, on code ?", "On s'y remet, {n} ?", "On construit quoi, {n} ?",
    "Une idée en tête, {n} ?", "Inspiré, {n} ?", "Prêt à créer, {n} ?",
    "Prêt à décoller, {n} ?", "Prêt pour la suite, {n} ?", "À toi de jouer, {n}",
    "Let's go {n}", "C'est parti {n}", "{n} est dans la place", "Le retour de {n}",
    "Encore toi ? Génial", "Salut le boss", "Salut capitaine {n}", "Mission du jour, {n} ?",
    "On fait des merveilles ?", "Un projet en vue, {n} ?", "On attaque, {n} ?",
    "Hop, au travail {n}", "Bienvenue à bord, {n}", "Prêt quand tu l'es, {n}",
    "Qu'est-ce qu'on invente ?", "{n}, le génie est là", "Toujours au top, {n} ?",
    "On casse tout, {n} ?", "Aujourd'hui, on brille", "Salut l'inventeur"
  ];
  var byTime = [
    { from: 5, to: 11, list: ["Bonjour {n}", "Bien dormi, {n} ?", "Café d'abord, {n} ?",
      "Belle matinée, {n}", "Debout {n}, on code", "Un matin productif ?", "Bon matin, {n}"] },
    { from: 11, to: 14, list: ["Bon appétit, {n}", "Pause déj, {n} ?", "Midi pile, {n}"] },
    { from: 14, to: 18, list: ["Bon après-midi, {n}", "Bien mangé, {n} ?", "La sieste attendra",
      "Un petit café, {n} ?", "L'après-midi est à toi"] }
  ];

  // From 18h the evening list replaces everything above
  var evening = [
    "Bonsoir {n}", "Bonne soirée, {n}", "Belle soirée, {n}", "Bonsoir chef",
    "Re-bonsoir {n}", "Bonsoir l'artiste", "Hello, bonsoir {n}", "Coucou, c'est le soir",
    "Session du soir, {n} ?", "Un peu de code ce soir ?", "On code au calme ?",
    "Le soir, c'est plus calme", "Ambiance du soir, {n}", "Projet du soir, {n} ?",
    "Encore un peu, {n} ?", "Dernière ligne droite ?", "Une petite dernière ?",
    "La journée n'est pas finie", "Prêt pour la soirée ?", "Soirée productive, {n} ?",
    "Bien rentré, {n} ?", "Journée bien remplie ?", "Alors, cette journée ?",
    "Le soleil se couche, on code", "Les idées du soir…", "Le calme après la journée",
    "Tisane et code, {n} ?", "Un dîner, puis on code ?", "Bon appétit ce soir, {n}",
    "Détente ou projet, {n} ?", "On finit en beauté ?", "On boucle la journée ?",
    "Mission du soir, {n} ?", "Soirée code, {n} ?", "Les étoiles sont sorties",
    "La lune est levée, {n}", "Petit projet du soir ?", "Heureux de te voir ce soir"
  ];
  var night = [
    "Encore debout, {n} ?", "Nuit blanche, {n} ?", "Les génies codent la nuit",
    "Chut… tout le monde dort", "Session de nuit, {n} ?", "Pense à dormir, {n}",
    "Il se fait tard, {n}", "Minuit passé, {n}…", "Hibou de nuit, {n} ?",
    "Un dernier commit ?", "Pas encore au lit ?", "La nuit porte conseil",
    "Bonsoir {n}", "Re-bonsoir {n}", "Les étoiles sont sorties", "La lune est levée, {n}",
    "On code au calme ?", "Tout est calme, {n}", "Insomnie créative ?", "Le monde dort, toi tu codes"
  ];

  var subtitles = ["Que veux-tu ouvrir ?", "Par où on commence ?", "On lance quoi ?",
    "Choisis ton outil", "Qu'est-ce qu'on ouvre ?", "Un clic et c'est parti", "Où va-t-on ?"];

  var now = new Date(), h = now.getHours(), day = now.getDay(), pool;
  if (h >= 23 || h < 5) {
    pool = night.slice();
  } else if (h >= 18) {
    pool = evening.slice();
    if (day === 5) pool.push("Bon vendredi soir, {n}");
    if (day === 6) pool.push("Bon samedi soir, {n}");
  } else {
    pool = any.slice();
    for (var i = 0; i < byTime.length; i++)
      if (h >= byTime[i].from && h < byTime[i].to)
        for (var k = 0; k < 3; k++) pool = pool.concat(byTime[i].list); // time of day weighs more
    if (day === 0 || day === 6) pool = pool.concat(["Bon week-end, {n}", "Même le week-end ?", "Projet du week-end ?"]);
    if (day === 1) pool.push("Bon lundi, {n}");
    if (day === 5) pool.push("Vendredi, enfin !");
  }

  // First name chosen in the installer; without one, only the nameless lines
  var user = readJson(dataDir + "\\user.json"), name = user && user.name ? user.name : "";
  var named = [];
  for (var j = 0; j < pool.length; j++)
    if (name || pool[j].indexOf("{n}") < 0) named.push(pool[j].replace(/\{n\}/g, esc(name)));
  pool = named;

  var lastFile = dataDir + "\\last-greeting.txt", last = "";
  try { if (fso.FileExists(lastFile)) last = fso.OpenTextFile(lastFile, 1, false, -1).ReadAll(); } catch (e) {}
  var msg;
  do { msg = pool[Math.floor(Math.random() * pool.length)]; } while (msg === last && pool.length > 1);
  try {
    if (!fso.FolderExists(dataDir)) fso.CreateFolder(dataDir);
    var f = fso.CreateTextFile(lastFile, true, true); f.Write(msg); f.Close();
  } catch (e) {}

  var el = document.getElementById("greet");
  el.innerHTML = '<span id="greetText">' + msg + "</span>";
  if (msg.length > 24) el.style.fontSize = "30px";
  document.getElementById("subtitle").innerHTML = subtitles[Math.floor(Math.random() * subtitles.length)];
})();

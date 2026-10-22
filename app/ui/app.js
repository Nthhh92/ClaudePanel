// ClaudePanel home screen: clock, weather, greeting, the three cards, the
// welcome tour on first launch, settings and the goodbye when uninstalling.

function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function call(cmd, args) { return window.__TAURI__.core.invoke(cmd, args || {}); }

var settings = { name: "", onboarded: false };

/* ---------- Clock and weather ---------- */

function updateClock() {
  var days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
    "août", "septembre", "octobre", "novembre", "décembre"];
  var d = new Date(), m = d.getMinutes();
  $("clock").innerHTML = "<b>" + d.getHours() + ":" + (m < 10 ? "0" + m : m) + "</b>" +
    days[d.getDay()] + " " + d.getDate() + " " + months[d.getMonth()];
}
updateClock();
setInterval(updateClock, 1000);

fetch("https://wttr.in/?format=j1&lang=fr")
  .then(function (r) { return r.json(); })
  .then(function (d) {
    var c = d.current_condition[0];
    var desc = c.lang_fr ? c.lang_fr[0].value : c.weatherDesc[0].value;
    $("weather").innerHTML = "<b>" + esc(c.temp_C) + "°</b>" + esc(desc) + "<br>" + esc(d.nearest_area[0].areaName[0].value);
  })
  .catch(function () {});

/* ---------- Greeting: random, never the same twice in a row ---------- */

function greet() {
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

  // Without a first name, only the nameless lines
  var name = settings.name, named = [];
  for (var j = 0; j < pool.length; j++)
    if (name || pool[j].indexOf("{n}") < 0) named.push(pool[j].replace(/\{n\}/g, name));

  var last = "";
  try { last = localStorage.getItem("lastGreeting") || ""; } catch (e) {}
  var msg;
  do { msg = named[Math.floor(Math.random() * named.length)]; } while (msg === last && named.length > 1);
  try { localStorage.setItem("lastGreeting", msg); } catch (e) {}

  var el = $("greet");
  el.innerHTML = '<span id="greetText">' + esc(msg) + "</span>";
  el.style.fontSize = msg.length > 24 ? "30px" : "";
  $("subtitle").innerHTML = subtitles[Math.floor(Math.random() * subtitles.length)];
}

/* ---------- Cards: what is installed and signed in ---------- */

// Re-checked every few seconds, so an install finished meanwhile shows up
var env = null, codeInstalling = false, appWaiting = false;

function setCard(id, need, hint) {
  $(id).className = "card" + (need ? " need" : "");
  $(id + "Hint").innerHTML = hint;
}

function refreshCards() {
  return call("detect").then(function (now) {
    if (env && now.code && !env.code) { codeInstalling = false; toast("Claude Code est installé ✓"); }
    if (env && now.app && !env.app) { appWaiting = false; toast("Claude est installé ✓"); }
    env = now;
    setCard("cardCode", !env.code || !env.code_in,
      env.code ? (env.code_in ? "Terminal" : "Non connecté · clique ici")
        : codeInstalling ? "Installation en cours…" : "Pas installé · clique ici");
    setCard("cardApp", !env.app || !env.app_in,
      env.app ? (env.app_in ? "Application" : "Non connecté · clique ici")
        : appWaiting ? "En attente d’installation…" : "Pas installé · clique ici");
  });
}
refreshCards();
setInterval(refreshCards, 3000);

function failed(e) { toast("Oups : " + e); }

function openCode() {
  if (!env) return;
  if (!env.code) {
    // Anthropic's official installer, in a visible window
    codeInstalling = true;
    call("install_code").then(refreshCards, failed);
    return;
  }
  // Signed out: Claude Code itself asks to log in on start
  call("open_code", { path: env.code }).then(function () { call("quit"); }, failed);
}

function openApp() {
  if (!env) return;
  if (!env.app) {
    appWaiting = true;
    call("open_url", { url: "https://claude.ai/download" }).then(refreshCards, failed);
    return;
  }
  call("open_app", { app: env.app }).then(function () { call("quit"); }, failed);
}

/* ---------- Views ---------- */

function showView(id) {
  $("home").style.display = "none";
  $("skills").style.display = id === "skills" ? "block" : "none";
  $("settings").style.display = id === "settings" ? "block" : "none";
}

function closeView() {
  $("skills").style.display = "none";
  $("settings").style.display = "none";
  $("home").style.display = "block";
}

var toastTimer;
function toast(t) {
  var el = $("toast");
  el.innerHTML = esc(t);
  el.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.style.display = "none"; }, 2400);
}

/* ---------- Settings ---------- */

function openSettings() {
  $("setName").value = settings.name;
  showView("settings");
}

function saveName() {
  settings.name = $("setName").value.trim();
  call("save_settings", { settings: settings }).then(function () {
    greet();
    toast("C’est noté ✓");
  }, failed);
}

/* ---------- Welcome tour (first launch) ---------- */

var tourStep = 0;

function tourShow(n) {
  tourStep = n;
  for (var i = 0; i < 3; i++) $("t" + i).className = "step" + (i === n ? " on" : "");
  var dots = $("tourDots").getElementsByTagName("i");
  for (var j = 0; j < dots.length; j++) dots[j].className = j === n ? "on" : "";
  $("tourBack").className = "btn ghost" + (n > 0 ? "" : " off");
  $("tourGo").innerHTML = ["Continuer", "J’ai compris", "C’est parti"][n];
  if (n === 2) {
    // Kept from ClaudePanel 1.x, if it was installed
    if (!$("tourName").value) $("tourName").value = settings.name;
    setTimeout(function () { $("tourName").focus(); }, 50);
  }
}

function tourBack() { if (tourStep > 0) tourShow(tourStep - 1); }

function tourNext() {
  if (tourStep < 2) { tourShow(tourStep + 1); return; }
  settings.name = $("tourName").value.trim();
  settings.onboarded = true;
  call("save_settings", { settings: settings });
  // Spin into the panel
  warp(function () {
    $("tour").style.display = "none";
    greet();
  });
}

/* ---------- Goodbye (uninstall from inside the app) ---------- */

var byeStep = 0, hello = null;

function byeShow(n) {
  byeStep = n;
  for (var i = 0; i < 3; i++) $("u" + i).className = "step" + (i === n ? " on" : "");
  $("byeCancel").className = "btn ghost" + (n === 0 ? "" : " off");
  $("byeGo").className = "btn" + (n === 0 ? " danger" : n === 1 ? " off" : "");
  $("byeGo").innerHTML = n === 0 ? "Désinstaller" : "Fermer";
}

function startGoodbye() {
  $("bye").style.display = "block";
  // Start over if a previous attempt was cancelled
  $("hiStage").innerHTML = "";
  $("byeStage").innerHTML = "";
  var old = $("uroad").getElementsByClassName("bot");
  while (old.length) old[0].parentNode.removeChild(old[0]);
  $("ufill").style.width = "0";
  $("uerr").innerHTML = "";
  byeShow(0);
  hello = stageBot("hiStage");
  hello.scale(0);
  setTimeout(function () { hello.pop(); }, 250);
  // Looks around while you decide
  (function look() {
    if (byeStep !== 0 || $("bye").style.display === "none") return;
    hello.face(-1);
    setTimeout(function () { hello.face(1); setTimeout(look, rand(2500, 4500)); }, 900);
  })();
}

function cancelGoodbye() { $("bye").style.display = "none"; }

function byeNext() {
  if (byeStep === 0) { byeShow(1); uninstallApp(); }
  else if (byeStep === 2) call("quit");
}

function uninstallApp() {
  var bot = walker("uroad");
  var labels = ["Préparation", "Suppression de tes réglages", "Retrait de l’application", "Terminé"];
  var i = 0;
  $("uerr").innerHTML = "";
  (function step() {
    $("udoing").innerHTML = labels[i];
    $("ufill").style.width = Math.round((i + 1) / labels.length * 100) + "%";
    bot.to((i + 1) / labels.length);
    setTimeout(function () {
      // The real work is scheduled once, at the start; it runs when the window closes
      var job = i === 0 ? call("uninstall_self") : Promise.resolve();
      job.then(function () {
        if (++i < labels.length) step();
        else { bot.stop(); bot.hop(18, function () { setTimeout(goodbye, 250); }); }
      }, function (e) {
        bot.stop(); bot.arms("droop"); bot.mood = "sad"; bot.eyes("sad");
        $("uerr").innerHTML = esc(e);
        $("byeCancel").className = "btn ghost";
      });
    }, 420);
  })();
}

// A sad little robot, with a tear now and then
function goodbye() {
  byeShow(2);
  var n = settings.name ? ", " + settings.name : "";
  var lines = [
    ["Au revoir" + n + "…", "Tu vas me manquer. Reviens quand tu veux."],
    ["Snif… déjà ?", "Merci d’avoir utilisé ClaudePanel" + n + ". À bientôt, j’espère."],
    ["C’était sympa" + n + "…", "Je range mes petites jambes. Prends soin de toi."]
  ];
  var l = lines[Math.floor(Math.random() * lines.length)];
  $("byeTitle").innerHTML = esc(l[0]);
  $("byeMsg").innerHTML = esc(l[1]);

  var b = stageBot("byeStage");
  b.scale(0);
  b.pop(function () {
    b.mood = "sad"; b.eyes("sad"); b.arms("droop");
    (function sigh() {
      tween(1600, function (t) { var q = Math.sin(t * Math.PI); b.scale(1 + 0.03 * q, 1 - 0.06 * q); }, function () {
        setTimeout(sigh, 600);
      });
    })();
    (function cry() {
      b.tear.style.display = "";
      var y = 9;
      var drip = setInterval(function () {
        b.tear.setAttribute("y", y++);
        if (y > 15) { clearInterval(drip); b.tear.style.display = "none"; setTimeout(cry, rand(900, 1800)); }
      }, 140);
    })();
  });
}

/* ---------- Updates ---------- */

var version = "";

// Compares "2.10.1" with "2.9.0": positive when a is newer
function compareVersions(a, b) {
  var x = String(a).split("."), y = String(b).split(".");
  for (var i = 0; i < 3; i++) {
    var d = (parseInt(x[i], 10) || 0) - (parseInt(y[i], 10) || 0);
    if (d) return d;
  }
  return 0;
}

// "2.1.0" -> "2.1"
function shortVersion(v) { return String(v).replace(/\.0$/, ""); }

function checkUpdate(manual) {
  return call("check_update").then(function (u) {
    if (u) {
      $("updText").innerHTML = "ClaudePanel " + esc(shortVersion(u.version)) + " est disponible";
      $("updBanner").className = "update on";
      if (manual) closeView();
    } else if (manual) {
      toast("Tu as déjà la dernière version ✓");
    }
  }, function (e) {
    if (manual) toast("Impossible de vérifier pour l’instant");
  });
}

// Downloads with the robot walking along the bar; the app restarts on its own
function startUpdate() {
  $("upd").style.display = "block";
  $("updErr").innerHTML = "";
  $("updClose").className = "btn ghost off";
  $("updFill").style.width = "0";
  $("updDoing").innerHTML = "Téléchargement…";
  var bot = walker("updRoad");
  var stopListening = window.__TAURI__.event.listen("update-progress", function (e) {
    $("updFill").style.width = Math.round(e.payload * 100) + "%";
    bot.to(e.payload);
    if (e.payload >= 1) $("updDoing").innerHTML = "Installation… ClaudePanel va redémarrer";
  });
  call("install_update").catch(function (e) {
    stopListening.then(function (stop) { stop(); });
    bot.stop(); bot.arms("droop"); bot.mood = "sad"; bot.eyes("sad");
    $("updErr").innerHTML = "La mise à jour n’a pas pu se faire : " + esc(e);
    $("updClose").className = "btn ghost";
  });
}

function closeUpdate() {
  $("upd").style.display = "none";
  var old = $("updRoad").getElementsByClassName("bot");
  while (old.length) old[0].parentNode.removeChild(old[0]);
}

// Once, after an update: what changed since the version seen last time
function showNews(since) {
  var rows = "", date = "";
  for (var i = 0; i < CHANGELOG.length; i++) {
    var c = CHANGELOG[i];
    if (compareVersions(c.version, since) <= 0 || compareVersions(c.version, version) > 0) continue;
    if (!date) date = c.date;
    for (var j = 0; j < c.items.length; j++)
      rows += '<div class="row"><div class="icon sm new">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e5ce6" stroke-width="2.2" stroke-linejoin="round">' +
        '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"></path></svg></div>' +
        '<div class="txt"><b>' + esc(c.items[j][0]) + '</b><span>' + esc(c.items[j][1]) + '</span></div></div>';
  }
  if (!rows) return;
  $("newsTitle").innerHTML = "Quoi de neuf dans la " + esc(shortVersion(version)) + " ?";
  $("newsDate").innerHTML = date ? "Mise à jour du " + esc(date) : "";
  $("newsList").innerHTML = rows;
  $("newsStage").innerHTML = "";
  $("news").style.display = "block";

  // A happy robot hopping around
  var b = stageBot("newsStage");
  b.scale(0);
  b.pop(function () {
    (function bounce() {
      if ($("news").style.display === "none") return;
      b.face(Math.random() < 0.5 ? 1 : -1);
      b.hop(14, function () { setTimeout(bounce, rand(500, 1300)); });
    })();
  });
}

function closeNews() { $("news").style.display = "none"; }

/* ---------- Start ---------- */

Promise.all([call("get_settings"), window.__TAURI__.app.getVersion()]).then(function (r) {
  settings = r[0];
  version = r[1];
  $("verText").innerHTML = "ClaudePanel " + esc(shortVersion(version));
  greet();
  if (!settings.onboarded) {
    $("tour").style.display = "block";
    tourShow(0);
  } else if (settings.lastVersion && compareVersions(version, settings.lastVersion) > 0) {
    showNews(settings.lastVersion);
  }
  // A fresh install has no "last version": it just starts counting from here
  if (settings.lastVersion !== version) {
    settings.lastVersion = version;
    call("save_settings", { settings: settings });
  }
  setTimeout(checkUpdate, 4000);
  setInterval(checkUpdate, 6 * 3600 * 1000);
});

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

// Time and date the way the system's language writes them
function updateClock() {
  var d = new Date();
  $("clock").innerHTML = "<b>" + esc(d.toLocaleTimeString(LANG, { hour: "numeric", minute: "2-digit" })) + "</b>" +
    esc(d.toLocaleDateString(LANG, { weekday: "long", day: "numeric", month: "long" }));
}
updateClock();
setInterval(updateClock, 1000);

fetch("https://wttr.in/?format=j1&lang=" + LANG)
  .then(function (r) { return r.json(); })
  .then(function (d) {
    var c = d.current_condition[0], local = c["lang_" + LANG];
    var desc = local ? local[0].value : c.weatherDesc[0].value;
    $("weather").innerHTML = "<b>" + esc(c.temp_C) + "°</b>" + esc(desc);
  })
  .catch(function () {});

/* ---------- Greeting: random, never the same twice in a row ---------- */

// The lines are in i18n.js (GREETINGS), one set per language
function greet() {
  var g = GREETINGS[LANG] || GREETINGS.en;
  var byTime = [{ from: 5, to: 11, list: g.morning }, { from: 11, to: 14, list: g.noon }, { from: 14, to: 18, list: g.afternoon }];

  var now = new Date(), h = now.getHours(), day = now.getDay(), pool;
  if (h >= 23 || h < 5) {
    pool = g.night.slice();
  } else if (h >= 18) {
    // From 18h the evening lines replace everything else
    pool = g.evening.slice();
    if (day === 5) pool = pool.concat(g.fridayEvening);
    if (day === 6) pool = pool.concat(g.saturdayEvening);
  } else {
    pool = g.any.slice();
    for (var i = 0; i < byTime.length; i++)
      if (h >= byTime[i].from && h < byTime[i].to)
        for (var k = 0; k < 3; k++) pool = pool.concat(byTime[i].list); // time of day weighs more
    if (day === 0 || day === 6) pool = pool.concat(g.weekend);
    if (day === 1) pool = pool.concat(g.monday);
    if (day === 5) pool = pool.concat(g.friday);
  }
  var subtitles = g.subtitles;

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
    if (env && now.code && !env.code) { codeInstalling = false; toast(t("toast.codeInstalled")); }
    if (env && now.app && !env.app) { appWaiting = false; toast(t("toast.appInstalled")); }
    env = now;
    setCard("cardCode", !env.code || !env.code_in, t(
      env.code ? (env.code_in ? "card.terminal" : "card.notSignedIn")
        : codeInstalling ? "card.installing" : "card.notInstalled"));
    setCard("cardApp", !env.app || !env.app_in, t(
      env.app ? (env.app_in ? "card.application" : "card.notSignedIn")
        : appWaiting ? "card.waiting" : "card.notInstalled"));
  });
}
refreshCards();
setInterval(refreshCards, 3000);

function failed(e) { toast(t("toast.oops", { e: errText(e) })); }

function openCode() {
  if (!env) return;
  if (!env.code) {
    // Anthropic's official installer, in a visible window that speaks the user's language
    codeInstalling = true;
    // {url} is filled in by the backend, which knows the platform's script
    call("install_code", { texts: {
      title: t("install.title"), source: t("install.source"), ok: t("install.ok"),
      fail: t("install.fail", { e: "$_" }), check: t("install.check"), close: t("install.close")
    } }).then(refreshCards, failed);
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
    toast(t("toast.saved"));
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
  $("tourGo").textContent = t(["btn.continue", "tour.gotIt", "tour.go"][n]);
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
  $("byeGo").textContent = t(n === 0 ? "btn.uninstall" : "btn.close");
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
  var labels = [t("bye.step1"), t("bye.step2"), t("bye.step3"), t("bye.step4")];
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
        $("uerr").innerHTML = esc(errText(e));
        $("byeCancel").className = "btn ghost";
      });
    }, 420);
  })();
}

// A sad little robot, with a tear now and then
function goodbye() {
  byeShow(2);
  var v = { n: settings.name ? ", " + settings.name : "" };
  var l = Math.floor(Math.random() * 3) + 1;
  $("byeTitle").textContent = t("bye.line" + l + "a", v);
  $("byeMsg").textContent = t("bye.line" + l + "b", v);

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
      $("updText").textContent = t("upd.available", { v: shortVersion(u.version) });
      $("updBanner").className = "update on";
      if (manual) closeView();
    } else if (manual) {
      toast(t("upd.latest"));
    }
  }, function (e) {
    if (manual) toast(t("upd.cantCheck"));
  });
}

// Downloads with the robot walking along the bar; the app restarts on its own
function startUpdate() {
  $("upd").style.display = "block";
  $("updErr").innerHTML = "";
  $("updClose").className = "btn ghost off";
  $("updFill").style.width = "0";
  $("updDoing").textContent = t("upd.downloading");
  var bot = walker("updRoad");
  var stopListening = window.__TAURI__.event.listen("update-progress", function (e) {
    $("updFill").style.width = Math.round(e.payload * 100) + "%";
    bot.to(e.payload);
    if (e.payload >= 1) $("updDoing").textContent = t("upd.installing");
  });
  call("install_update").catch(function (e) {
    stopListening.then(function (stop) { stop(); });
    bot.stop(); bot.arms("droop"); bot.mood = "sad"; bot.eyes("sad");
    $("updErr").textContent = t("upd.failed", { e: errText(e) });
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
    var items = c.items[LANG] || c.items.en;
    for (var j = 0; j < items.length; j++)
      rows += '<div class="row"><div class="icon sm new">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e5ce6" stroke-width="2.2" stroke-linejoin="round">' +
        '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"></path></svg></div>' +
        '<div class="txt"><b>' + esc(items[j][0]) + '</b><span>' + esc(items[j][1]) + '</span></div></div>';
  }
  if (!rows) return;
  $("newsTitle").textContent = t("news.title", { v: shortVersion(version) });
  $("newsDate").textContent = date ? t("news.date", { d: fmtDate(date) }) : "";
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
});

// Right away, alongside everything else, so the banner shows within a second or two
checkUpdate();
setInterval(checkUpdate, 6 * 3600 * 1000);

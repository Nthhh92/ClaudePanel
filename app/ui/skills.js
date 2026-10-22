// Skills view: installed skills grouped by plugin, popular or searched plugins
// to install, GitHub marketplaces to add. Unverified sources ask first.

var installed = [], available = [], catalog = {}, installedIds = {};
var opened = {}, busy = false, pending = null, confirmId = null;

// A skill is "verified" when it ships from a marketplace Anthropic maintains.
// Anything else — a GitHub repo added by hand — is unverified and warns first.
var OFFICIAL = { "claude-plugins-official": 1, "anthropic-plugin-directory": 1 };
function isVerified(mkt) { return !!OFFICIAL[mkt]; }

// Drawn warning triangle, one stroke, matches the app's Feather-style icons.
function warnSvg(size) {
  var s = size || 15;
  return '<svg class="warn" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="#c77800" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path>' +
    '<line x1="12" y1="9.5" x2="12" y2="13.5"></line>' +
    '<line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
}

// Consent sheet: a blocking confirm for actions that run third-party code.
var confirmAction = null;
function openSheet(title, msg, goLabel, onGo) {
  confirmAction = onGo;
  $("sheetMark").innerHTML = warnSvg(26);
  $("sheetTitle").innerHTML = esc(title);
  $("sheetMsg").innerHTML = msg;
  $("sheetGo").innerHTML = esc(goLabel);
  $("scrim").style.display = "block";
}
function closeSheet() { $("scrim").style.display = "none"; confirmAction = null; }
function sheetGo() { var a = confirmAction; closeSheet(); if (a) a(); }

function askInstall(id, name) {
  openSheet(t("sheet.skillTitle"), t("sheet.skillMsg", { name: esc(name) }), t("sheet.installAnyway"),
    function () { install(id); });
}
function askAddRepo(repo) {
  openSheet(t("sheet.repoTitle"), t("sheet.repoMsg", { name: esc(repo) }), t("sheet.addAnyway"),
    function () { addRepo(repo); });
}

function setLists(l) {
  installed = l.installed || [];
  available = l.available || [];
  catalog = l.catalog || {};
  installedIds = {};
  for (var i = 0; i < installed.length; i++) installedIds[installed[i].id] = true;
  // The CLI leaves installed plugins out of "available": put them back from the
  // catalog so the AI search can say "you already have this one"
  var listed = {};
  for (var a = 0; a < available.length; a++) listed[available[a].pluginId] = true;
  for (var id in installedIds) {
    var c = catalog[id], entry = c && c.marketplace_entry;
    if (listed[id] || !entry) continue;
    available.push({ pluginId: id, name: entry.name || c.plugin, description: entry.description || "",
      marketplaceName: id.split("@")[1] || "", installCount: c.unique_installs || 0 });
  }
  available.sort(function (a, b) { return (b.installCount || 0) - (a.installCount || 0); });
}

// Skill and command names an available plugin ships, from the catalog cache
function skillsOf(p) {
  var c = catalog[p.pluginId], out = [];
  if (!c || !c.components) return out;
  var lists = [c.components.skills || [], c.components.commands || []];
  for (var i = 0; i < lists.length; i++)
    for (var j = 0; j < lists[i].length; j++) out.push(lists[i][j].name || lists[i][j]);
  return out;
}

var listsReady = null;
function reload() {
  listsReady = call("skills_list").then(function (l) { setLists(l); render(); });
  return listsReady;
}

// Runs a `claude plugin` action, then reloads the lists.
function runAction(action, arg, onDone) {
  if (busy) { toast(t("toast.wait")); return; }
  busy = true;
  call("skills_action", { action: action, arg: arg })
    .then(function () { return { ok: true }; }, function (e) { return { ok: false, msg: String(e) }; })
    .then(function (res) {
      return reload().then(function () { busy = false; onDone(res); render(); },
        function () { busy = false; onDone(res); render(); });
    });
}

function setState(text) { $("state").textContent = text; }

function openSkills() {
  showView("skills");
  syncAi();
  setState(t("skills.updating"));
  reload().then(function () { setState(""); }, function () { setState(""); });
}

var searchTimer;
function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(render, 150);
}

function has(q, s) { return String(s || "").toLowerCase().indexOf(q) >= 0; }

function repoFrom(q) {
  var m = q.match(/github\.com\/([\w.-]+\/[\w.-]+?)(\.git)?\/?$/i) || q.match(/^([\w.-]+\/[\w.-]+)$/);
  return m ? m[1] : null;
}

function toggle(key) {
  opened[key] = !opened[key];
  render();
}

function stop(e) { if (e) e.stopPropagation(); }

function installedItem(g, q) {
  var key = "i:" + g.plugin, skills = g.skills, auto = false;
  if (q && !has(q, g.plugin)) {
    skills = [];
    for (var i = 0; i < g.skills.length; i++)
      if (has(q, g.skills[i].name) || has(q, g.skills[i].description)) skills.push(g.skills[i]);
    if (!skills.length) return "";
    auto = true;
  }
  var isOpen = opened[key] === undefined ? auto : opened[key];
  var body = "";
  for (var j = 0; j < skills.length; j++) {
    var s = skills[j];
    body += '<div class="skill" title="' + esc(s.description) + '"><div class="sname">' + esc(s.name) +
      '</div><div class="cmd" onclick="copyCmd(event, \'' + esc(s.command) + '\')">' + esc(s.command) + '</div></div>';
  }
  if (!skills.length) body = '<div class="about">' + esc(t("skills.noSkill")) + '</div>';
  if (g.id) {
    body += '<div class="foot"><span class="link" onclick="uninstall(\'' + esc(g.id) + '\')">' +
      esc(t(confirmId === g.id ? "skills.confirm" : "skills.uninstall")) + '</span></div>';
  }
  return '<div class="item' + (isOpen ? " open" : "") + '">' +
    '<div class="head" onclick="toggle(\'' + esc(key) + '\')"><div class="chev">&#8250;</div>' +
    '<div class="txt"><div class="name">' + esc(g.plugin) + '</div></div>' +
    '<div class="count">' + skills.length + '</div></div>' +
    '<div class="body">' + body + '</div></div>';
}

// why: the AI's reason, shown instead of the description
function availableItem(p, why) {
  var key = "a:" + p.pluginId, names = skillsOf(p), chips = "";
  for (var i = 0; i < names.length; i++) chips += '<span>' + esc(names[i]) + '</span>';
  var verified = isVerified(p.marketplaceName);
  var click = verified
    ? "install('" + esc(p.pluginId) + "')"
    : "askInstall('" + esc(p.pluginId) + "', '" + esc(p.name) + "')";
  var btn = installedIds[p.pluginId] ? '<div class="tag-installed">' + esc(t("skills.installed")) + '</div>'
    : pending === p.pluginId ? '<div class="pill busy">…</div>'
    : '<div class="pill' + (verified ? '' : ' caution') + '" onclick="stop(event); ' + click + '">' + esc(t("skills.install")) + '</div>';
  var note = verified ? "" :
    '<div class="note">' + warnSvg(14) +
    '<div>' + esc(t("skills.unverified")) + '</div></div>';
  return '<div class="item' + (opened[key] ? " open" : "") + '">' +
    '<div class="head" onclick="toggle(\'' + esc(key) + '\')"><div class="chev">&#8250;</div>' +
    '<div class="txt"><div class="name">' + esc(p.name) + (verified ? '' : warnSvg(15)) + '</div>' +
    (why ? '<div class="why">' + esc(why) + '</div>' : '<div class="desc">' + esc(p.description) + '</div>') + '</div>' +
    btn + '</div>' +
    '<div class="body">' + note + '<div class="about">' + esc(p.description) + '</div>' +
    (chips ? '<div class="chips">' + chips + '</div>' : '') + '</div></div>';
}

/* ---------- AI search ---------- */

// The AI result belongs to the text it was asked about; typing something else
// goes back to the instant local filter.
var ai = { query: "", state: "idle", shortlist: null, picks: null, run: 0 };


function setAiStatus(text, kind) {
  var el = $("aiStatus");
  el.className = "ai-status" + (kind ? " " + kind : "");
  el.innerHTML = esc(text);
}

function aiActive() { return ai.state !== "idle" && ai.query === $("q").value.trim(); }

function tryQuery(text) { $("q").value = text; aiSearch(); }

// Local first pass over the whole catalog, from the AI's English keywords
function shortlist(keywords) {
  var phrases = [], words = [];
  for (var i = 0; i < keywords.length; i++) {
    var k = String(keywords[i]).toLowerCase().replace(/[-_]/g, " ");
    phrases.push(k);
    var parts = k.split(/[^a-z0-9.+#]+/);
    for (var j = 0; j < parts.length; j++) if (parts[j].length > 2) words.push(parts[j]);
  }
  var scored = [], seen = {};
  for (var n = 0; n < available.length; n++) {
    var p = available[n];
    if (seen[p.name]) continue;
    seen[p.name] = true;
    // "frontend-design" must match the keyword "frontend design"
    var name = String(p.name).toLowerCase().replace(/[-_]/g, " ");
    var text = name + " " + (String(p.description || "") + " " + skillsOf(p).join(" ")).toLowerCase().replace(/[-_]/g, " ");
    var score = 0;
    for (var a = 0; a < phrases.length; a++) score += name.indexOf(phrases[a]) >= 0 ? 5 : text.indexOf(phrases[a]) >= 0 ? 3 : 0;
    for (var b = 0; b < words.length; b++) score += name.indexOf(words[b]) >= 0 ? 2 : text.indexOf(words[b]) >= 0 ? 1 : 0;
    if (!score) continue;
    score += Math.log(1 + (p.installCount || 0)) * 0.4 + (isVerified(p.marketplaceName) ? 3 : 0);
    scored.push({ p: p, score: score });
  }
  scored.sort(function (x, y) { return y.score - x.score; });
  return scored.slice(0, 60).map(function (s) { return s.p; });
}

// AI search spends the user's Claude usage: off until they turn it on, after
// an explanation (the backend refuses too while it is off).
function aiOn() { return !!settings.aiSearch; }

function syncAi() {
  $("aiSearch").classList.toggle("on", aiOn());
  $("aiSwitch").setAttribute("aria-checked", aiOn() ? "true" : "false");
  $("q").placeholder = t(aiOn() ? "search.phOn" : "search.phOff");
  render();
}

function toggleAi() {
  if (!aiOn()) { $("aiIntro").style.display = "block"; return; }
  settings.aiSearch = false;
  ai.run++;
  ai.state = "idle";
  $("aiSearch").classList.remove("thinking");
  call("save_settings", { settings: settings });
  syncAi();
  toast(t("ai.disabled"));
}

function closeAiIntro(accept) {
  $("aiIntro").style.display = "none";
  if (!accept) return;
  settings.aiSearch = true;
  call("save_settings", { settings: settings }).then(function () {
    syncAi();
    $("q").focus();
    toast(t("ai.enabled"));
  }, failed);
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && $("aiIntro").style.display === "block") closeAiIntro(false);
});

function aiSearch() {
  if (!aiOn()) return; // Enter only filters, as you type
  var q = $("q").value.trim();
  if (q.length < 3) { setAiStatus(t("err.tooShort"), "warn"); return; }
  if (ai.state === "busy" && ai.query === q) return;
  var run = ++ai.run;
  ai = { query: q, state: "busy", shortlist: null, picks: null, run: run };
  var bar = $("aiSearch");
  bar.classList.add("thinking");
  setAiStatus(t("ai.understanding"), "busy");
  render();

  function current() { return ai.run === run; }
  (listsReady || reload())
    .then(function () { return call("ai_understand", { query: q }); })
    .then(function (u) {
      if (!current()) return;
      if (!u.on_topic) throw { offTopic: true };
      ai.shortlist = shortlist(u.keywords);
      if (!ai.shortlist.length) throw { empty: true };
      setAiStatus(t("ai.comparing", { n: fmtNumber(available.length) }), "busy");
      render();
      var candidates = ai.shortlist.map(function (p) {
        return { id: p.pluginId, name: p.name, description: p.description || "", skills: skillsOf(p),
          official: isVerified(p.marketplaceName) };
      });
      return call("ai_pick", { query: q, candidates: candidates, lang: LANG }).then(function (picks) {
        if (!current()) return;
        ai.picks = picks;
        ai.state = "done";
        setAiStatus(picks.length > 1 ? t("ai.foundN", { n: picks.length }) : picks.length ? t("ai.found1") : t("ai.nothing"),
          picks.length ? "" : "warn");
        render();
      });
    })
    .catch(function (e) {
      if (!current()) return;
      ai.state = "done";
      ai.picks = [];
      if (e && e.offTopic) setAiStatus(t("ai.offTopic"), "warn");
      else if (e && e.empty) setAiStatus(t("ai.noMatch"), "warn");
      else setAiStatus(errText(e), "warn");
      render();
    })
    .then(function () { if (current()) bar.classList.remove("thinking"); });
}

function renderAi() {
  var html = "", byId = {};
  for (var i = 0; i < available.length; i++) byId[available[i].pluginId] = available[i];
  if (ai.picks) {
    for (var j = 0; j < ai.picks.length; j++) {
      var p = byId[ai.picks[j].id];
      if (p) html += availableItem(p, ai.picks[j].why);
    }
    if (html) html = '<div class="section">' + esc(t("sec.ai")) + '</div><div class="box">' + html + '</div>';
  } else if (ai.shortlist) {
    // First leads while the AI chooses
    for (var k = 0; k < Math.min(5, ai.shortlist.length); k++) html += availableItem(ai.shortlist[k]);
    html = '<div class="section">' + esc(t("sec.leads")) + '</div><div class="box pending">' + html + '</div>';
  }
  return html;
}

function render() {
  var raw = $("q").value.trim(), q = raw.toLowerCase();
  var html = "", items = "";

  if (aiActive()) {
    var list = $("list"), top = list.scrollTop;
    list.innerHTML = renderAi();
    list.scrollTop = top;
    return;
  }
  if (ai.state !== "idle") { ai.state = "idle"; ai.run++; $("aiSearch").classList.remove("thinking"); }
  if (aiOn()) setAiStatus(t(raw ? "ai.hintTyped" : "ai.hintEmpty"));
  else setAiStatus(raw ? "" : t("ai.hintOff"));
  if (!raw && aiOn()) {
    var tries = "", ideas = t("ai.tries");
    for (var x = 0; x < ideas.length; x++)
      tries += '<span onclick="tryQuery(\'' + esc(ideas[x]) + '\')">' + esc(ideas[x]) + '</span>';
    html += '<div class="section">' + esc(t("sec.try")) + '</div><div class="tries">' + tries + '</div>';
  }

  for (var i = 0; i < installed.length; i++) items += installedItem(installed[i], q);
  if (items) html += '<div class="section">' + esc(t("sec.installed")) + '</div><div class="box">' + items + '</div>';

  // Plugins to install: search results, or the most popular ones
  items = "";
  var n = 0, max = q ? 30 : 8, seen = {};
  for (var k = 0; k < available.length && n < max; k++) {
    var p = available[k];
    if (installedIds[p.pluginId] || seen[p.name]) continue;
    if (q && !has(q, p.name) && !has(q, p.description) && !has(q, p.marketplaceName) && !has(q, skillsOf(p).join(" "))) continue;
    seen[p.name] = true;
    n++;
    items += availableItem(p);
  }
  var repo = repoFrom(raw);
  if (repo) {
    items = '<div class="item"><div class="head"><div class="chev"></div><div class="txt"><div class="name">' + esc(repo) +
      warnSvg(15) + '</div><div class="desc">' + esc(t("skills.repo")) + '</div></div>' +
      '<div class="pill caution" onclick="askAddRepo(\'' + esc(repo) + '\')">' + esc(t("skills.add")) + '</div></div></div>' + items;
  }
  if (items) html += '<div class="section">' + esc(t(q ? "sec.toInstall" : "sec.popular")) + '</div><div class="box">' + items + '</div>';

  if (!html) html = '<div class="empty">' + esc(t(env && !env.code ? "skills.needCode" : "skills.none")) + '</div>';
  var list = $("list"), top = list.scrollTop;
  list.innerHTML = html;
  list.scrollTop = top;
}

function install(id) {
  pending = id;
  setState(t("skills.installing"));
  render();
  runAction("install", id, function (s) {
    pending = null;
    setState("");
    if (s.ok) opened["i:" + id.split("@")[0]] = true;
    toast(t(s.ok ? "toast.installedRestart" : "toast.installFail"));
  });
}

function uninstall(id) {
  if (confirmId !== id) { confirmId = id; render(); return; }
  confirmId = null;
  setState(t("skills.removing"));
  render();
  runAction("uninstall", id, function (s) {
    setState("");
    toast(t(s.ok ? "toast.uninstalled" : "toast.uninstallFail"));
  });
}

function addRepo(repo) {
  var before = {};
  for (var i = 0; i < available.length; i++) before[available[i].marketplaceName] = true;
  setState(t("skills.addingRepo"));
  runAction("add", repo, function (s) {
    setState("");
    if (s.ok) {
      // Show the plugins of the marketplace that just appeared
      for (var j = 0; j < available.length; j++)
        if (!before[available[j].marketplaceName]) { $("q").value = available[j].marketplaceName; break; }
      toast(t("toast.repoAdded"));
    } else toast(t("toast.repoNotFound"));
  });
}

function copyCmd(e, cmd) {
  stop(e);
  navigator.clipboard.writeText(cmd).then(function () { toast(t("toast.copied", { c: cmd })); });
}

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
  openSheet("Skill non vérifié",
    "<b>" + esc(name) + "</b> ne provient pas d’un marketplace vérifié par Anthropic. " +
    "Son code s’exécutera sur ta machine. En l’installant, tu acceptes d’en assumer les risques.",
    "Installer quand même", function () { install(id); });
}
function askAddRepo(repo) {
  openSheet("Dépôt non vérifié",
    "<b>" + esc(repo) + "</b> est un dépôt GitHub tiers, non vérifié par Anthropic. " +
    "Ses plugins s’exécuteront sur ta machine. En l’ajoutant, tu acceptes d’en assumer les risques.",
    "Ajouter quand même", function () { addRepo(repo); });
}

function setLists(l) {
  installed = l.installed || [];
  available = l.available || [];
  catalog = l.catalog || {};
  installedIds = {};
  for (var i = 0; i < installed.length; i++) installedIds[installed[i].id] = true;
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

function reload() {
  return call("skills_list").then(function (l) { setLists(l); render(); });
}

// Runs a `claude plugin` action, then reloads the lists.
function runAction(action, arg, onDone) {
  if (busy) { toast("Patiente une seconde…"); return; }
  busy = true;
  call("skills_action", { action: action, arg: arg })
    .then(function () { return { ok: true }; }, function (e) { return { ok: false, msg: String(e) }; })
    .then(function (res) {
      return reload().then(function () { busy = false; onDone(res); render(); },
        function () { busy = false; onDone(res); render(); });
    });
}

function setState(t) { $("state").innerHTML = t; }

function openSkills() {
  showView("skills");
  render();
  setState("Mise à jour…");
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
  if (!skills.length) body = '<div class="about">Aucun skill dans ce plugin.</div>';
  if (g.id) {
    body += '<div class="foot"><span class="link" onclick="uninstall(\'' + esc(g.id) + '\')">' +
      (confirmId === g.id ? "Confirmer la suppression" : "Désinstaller") + '</span></div>';
  }
  return '<div class="item' + (isOpen ? " open" : "") + '">' +
    '<div class="head" onclick="toggle(\'' + esc(key) + '\')"><div class="chev">&#8250;</div>' +
    '<div class="txt"><div class="name">' + esc(g.plugin) + '</div></div>' +
    '<div class="count">' + skills.length + '</div></div>' +
    '<div class="body">' + body + '</div></div>';
}

function availableItem(p) {
  var key = "a:" + p.pluginId, names = skillsOf(p), chips = "";
  for (var i = 0; i < names.length; i++) chips += '<span>' + esc(names[i]) + '</span>';
  var verified = isVerified(p.marketplaceName);
  var click = verified
    ? "install('" + esc(p.pluginId) + "')"
    : "askInstall('" + esc(p.pluginId) + "', '" + esc(p.name) + "')";
  var btn = pending === p.pluginId ? '<div class="pill busy">…</div>'
    : '<div class="pill' + (verified ? '' : ' caution') + '" onclick="stop(event); ' + click + '">Installer</div>';
  var note = verified ? "" :
    '<div class="note">' + warnSvg(14) +
    '<div>Skill non vérifié — publié hors des marketplaces Anthropic. Son code s’exécute sur ta machine à tes risques.</div></div>';
  return '<div class="item' + (opened[key] ? " open" : "") + '">' +
    '<div class="head" onclick="toggle(\'' + esc(key) + '\')"><div class="chev">&#8250;</div>' +
    '<div class="txt"><div class="name">' + esc(p.name) + (verified ? '' : warnSvg(15)) +
    '</div><div class="desc">' + esc(p.description) + '</div></div>' +
    btn + '</div>' +
    '<div class="body">' + note + '<div class="about">' + esc(p.description) + '</div>' +
    (chips ? '<div class="chips">' + chips + '</div>' : '') + '</div></div>';
}

function render() {
  var raw = $("q").value.trim(), q = raw.toLowerCase();
  var html = "", items = "";

  for (var i = 0; i < installed.length; i++) items += installedItem(installed[i], q);
  if (items) html += '<div class="section">Installés</div><div class="box">' + items + '</div>';

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
      warnSvg(15) + '</div><div class="desc">Dépôt GitHub · non vérifié</div></div>' +
      '<div class="pill caution" onclick="askAddRepo(\'' + esc(repo) + '\')">Ajouter</div></div></div>' + items;
  }
  if (items) html += '<div class="section">' + (q ? "À installer" : "Populaires") + '</div><div class="box">' + items + '</div>';

  if (!html) html = '<div class="empty">' + (env && !env.code ? "Installe d’abord Claude Code pour gérer tes skills." : "Aucun résultat") + '</div>';
  var list = $("list"), top = list.scrollTop;
  list.innerHTML = html;
  list.scrollTop = top;
}

function install(id) {
  pending = id;
  setState("Installation…");
  render();
  runAction("install", id, function (s) {
    pending = null;
    setState("");
    if (s.ok) opened["i:" + id.split("@")[0]] = true;
    toast(s.ok ? "Installé ✓  Relance Claude Code" : "Échec de l'installation");
  });
}

function uninstall(id) {
  if (confirmId !== id) { confirmId = id; render(); return; }
  confirmId = null;
  setState("Suppression…");
  render();
  runAction("uninstall", id, function (s) {
    setState("");
    toast(s.ok ? "Désinstallé" : "Échec de la suppression");
  });
}

function addRepo(repo) {
  var before = {};
  for (var i = 0; i < available.length; i++) before[available[i].marketplaceName] = true;
  setState("Ajout du dépôt…");
  runAction("add", repo, function (s) {
    setState("");
    if (s.ok) {
      // Show the plugins of the marketplace that just appeared
      for (var j = 0; j < available.length; j++)
        if (!before[available[j].marketplaceName]) { $("q").value = available[j].marketplaceName; break; }
      toast("Dépôt ajouté ✓");
    } else toast("Dépôt introuvable");
  });
}

function copyCmd(e, cmd) {
  stop(e);
  navigator.clipboard.writeText(cmd).then(function () { toast("Copié : " + cmd); });
}

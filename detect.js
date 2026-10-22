// Finds Claude Code and the Claude app on this PC, and whether each is signed in.
// Only looks at local files and the registry: nothing is read out or sent anywhere.
var detectClaude = (function () {
  var sh = new ActiveXObject("WScript.Shell");
  var fs = new ActiveXObject("Scripting.FileSystemObject");
  function env(v) { return sh.ExpandEnvironmentStrings("%" + v + "%"); }
  var home = env("USERPROFILE"), local = env("LOCALAPPDATA"), roaming = env("APPDATA");

  function reg(key) { try { return String(sh.RegRead(key)); } catch (e) { return ""; } }

  function readText(path) {
    if (!fs.FileExists(path)) return "";
    try {
      var st = new ActiveXObject("ADODB.Stream");
      st.Type = 2; st.Charset = "utf-8"; st.Open(); st.LoadFromFile(path);
      var txt = st.ReadText(); st.Close();
      return txt;
    } catch (e) { return ""; }
  }

  // The panel's own PATH is frozen at launch, so after an install we read the
  // fresh one from the registry instead.
  function codePath() {
    var dirs = [home + "\\.local\\bin", roaming + "\\npm"]
      .concat(reg("HKCU\\Environment\\Path").split(";"))
      .concat(reg("HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment\\Path").split(";"));
    for (var i = 0; i < dirs.length; i++) {
      if (!dirs[i]) continue;
      var d = sh.ExpandEnvironmentStrings(dirs[i]).replace(/\\+$/, "");
      if (fs.FileExists(d + "\\claude.exe")) return d + "\\claude.exe";
      if (fs.FileExists(d + "\\claude.cmd")) return d + "\\claude.cmd";
    }
    return "";
  }

  function codeSignedIn() {
    if (fs.FileExists(home + "\\.claude\\.credentials.json")) return true;
    if (env("ANTHROPIC_API_KEY") !== "%ANTHROPIC_API_KEY%" || reg("HKCU\\Environment\\ANTHROPIC_API_KEY")) return true;
    return /"oauthAccount"\s*:\s*\{/.test(readText(home + "\\.claude.json"));
  }

  // Store (MSIX) install, or the older standalone one
  var MSIX = local + "\\Packages\\Claude_pzs8sxrjxfjjc";
  var EXE = local + "\\AnthropicClaude\\claude.exe";

  function appSignedIn() {
    var cfg = [MSIX + "\\LocalCache\\Roaming\\Claude\\config.json", roaming + "\\Claude\\config.json"];
    for (var i = 0; i < cfg.length; i++)
      if (/"oauth:tokenCache(V2)?"\s*:\s*"[^"]/.test(readText(cfg[i]))) return true;
    return false;
  }

  return function () {
    var code = codePath();
    var app = fs.FolderExists(MSIX) ? "msix" : fs.FileExists(EXE) ? EXE : "";
    return {
      code: code, codeIn: !!code && codeSignedIn(),
      app: app, appIn: !!app && appSignedIn()
    };
  };
})();

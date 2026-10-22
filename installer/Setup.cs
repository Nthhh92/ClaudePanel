// ClaudePanel installer and uninstaller: shows setup.html in a native window and
// does the work itself (files, shortcuts, the Windows "Apps" entry).
// The installer copies itself into the install folder as the uninstaller.
// Built by build-installer.ps1 with the C# compiler that ships with Windows.
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Management;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("Installer ClaudePanel")]
[assembly: AssemblyProduct("ClaudePanel")]
[assembly: AssemblyVersion(ClaudePanelSetup.Program.Version + ".0.0")]
[assembly: AssemblyFileVersion(ClaudePanelSetup.Program.Version + ".0.0")]

namespace ClaudePanelSetup
{
  static class Program
  {
    public const string Version = "1.0";
    public const string UninstallerName = "Désinstaller ClaudePanel.exe";

    [DllImport("user32.dll")] static extern bool SetProcessDPIAware();

    // No arguments: installer. "/uninstall", or started as the uninstaller copy:
    // uninstaller, which first relaunches itself from %TEMP% with "/dir=<install folder>"
    // so that the folder, this exe included, can be deleted.
    [STAThread]
    static void Main(string[] args)
    {
      string exe = Application.ExecutablePath, dir = null;
      bool uninstall = string.Equals(Path.GetFileName(exe), UninstallerName, StringComparison.OrdinalIgnoreCase);
      foreach (var a in args) {
        if (a == "/uninstall") uninstall = true;
        else if (a.StartsWith("/dir=")) dir = a.Substring(5);
      }

      if (uninstall && dir == null) {
        dir = Path.GetDirectoryName(exe);
        if (!File.Exists(Path.Combine(dir, "panel.hta"))) {
          MessageBox.Show("ClaudePanel n’est pas installé dans ce dossier.", "ClaudePanel");
          return;
        }
        var tmp = Path.Combine(Path.GetTempPath(), "ClaudePanel-uninstall-" + Guid.NewGuid().ToString("N").Substring(0, 8) + ".exe");
        File.Copy(exe, tmp);
        Process.Start(tmp, "/uninstall \"/dir=" + dir + "\"");
        return;
      }

      SetProcessDPIAware();
      Application.EnableVisualStyles();
      Application.Run(new SetupForm(uninstall ? dir : null));

      // The temporary uninstaller copy removes itself once closed
      if (uninstall)
        Process.Start(new ProcessStartInfo("cmd.exe", "/c timeout /t 2 /nobreak >nul & del /f /q \"" + exe + "\"") {
          WindowStyle = ProcessWindowStyle.Hidden, CreateNoWindow = true
        });
    }
  }

  class SetupForm : Form
  {
    // uninstallDir is null when installing
    public SetupForm(string uninstallDir)
    {
      float scale;
      using (var g = CreateGraphics()) scale = g.DpiX / 96f;

      Text = uninstallDir == null ? "Installer ClaudePanel" : "Désinstaller ClaudePanel";
      Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
      FormBorderStyle = FormBorderStyle.FixedSingle;
      MaximizeBox = false;
      StartPosition = FormStartPosition.CenterScreen;
      ClientSize = new Size((int)(620 * scale), (int)(560 * scale));
      BackColor = Color.FromArgb(245, 245, 247);

      var web = new WebBrowser {
        Dock = DockStyle.Fill,
        ScriptErrorsSuppressed = true,
        IsWebBrowserContextMenuEnabled = false,
        WebBrowserShortcutsEnabled = false,
        AllowWebBrowserDrop = false,
        ScrollBarsEnabled = false,
        ObjectForScripting = new Bridge(this, scale, uninstallDir)
      };
      web.DocumentText = Resources.Text("setup.html");
      Controls.Add(web);
    }
  }

  static class Resources
  {
    static readonly Assembly Me = Assembly.GetExecutingAssembly();
    const string PayloadPrefix = "payload/";

    public static string Text(string name)
    {
      using (var r = new StreamReader(Me.GetManifestResourceStream(name), Encoding.UTF8)) return r.ReadToEnd();
    }

    // The panel's files, embedded as payload/<file name>
    public static string[] PayloadFiles()
    {
      var files = new System.Collections.Generic.List<string>();
      foreach (var n in Me.GetManifestResourceNames())
        if (n.StartsWith(PayloadPrefix)) files.Add(n.Substring(PayloadPrefix.Length));
      return files.ToArray();
    }

    public static void Extract(string dir)
    {
      foreach (var f in PayloadFiles())
        using (var src = Me.GetManifestResourceStream(PayloadPrefix + f))
        using (var dst = File.Create(Path.Combine(dir, f)))
          src.CopyTo(dst);
    }
  }

  // What setup.html reaches through window.external
  [ComVisible(true)]
  public class Bridge
  {
    const string UninstallKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\ClaudePanel";
    readonly Form form;
    readonly float scale;
    readonly string uninstallDir;

    public Bridge(Form form, float scale, string uninstallDir)
    {
      this.form = form;
      this.scale = scale;
      this.uninstallDir = uninstallDir;
    }

    public string Mode() { return uninstallDir == null ? "install" : "uninstall"; }

    // The page is laid out in 96-dpi pixels and zooms itself by this
    public float Scale() { return scale; }

    // Folder to uninstall, or to install into: where a previous install is, if any
    public string Dir()
    {
      if (uninstallDir != null) return uninstallDir;
      using (var k = Registry.CurrentUser.OpenSubKey(UninstallKey)) {
        var prev = k == null ? null : k.GetValue("InstallLocation") as string;
        if (!string.IsNullOrEmpty(prev)) return prev;
      }
      return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "ClaudePanel");
    }

    // First name saved at install, for the goodbye
    public string UserName()
    {
      try {
        var m = Regex.Match(File.ReadAllText(Path.Combine(Dir(), @"data\user.json")), "\"name\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
        return m.Success ? Regex.Unescape(m.Groups[1].Value) : "";
      } catch (Exception) { return ""; }
    }

    // Always installs into a "ClaudePanel" folder, so uninstalling never touches anything else
    public string PickDir(string current)
    {
      var picked = FolderPicker.Show(form.Handle, "Choisis où installer ClaudePanel", Path.GetDirectoryName(current));
      if (picked == null) return current;
      return string.Equals(Path.GetFileName(picked), "ClaudePanel", StringComparison.OrdinalIgnoreCase)
        ? picked : Path.Combine(picked, "ClaudePanel");
    }

    // Runs one install step; returns "" or a message for the user
    public string Step(int i, string dir, string name, bool desktop)
    {
      try {
        switch (i) {
          case 0:
            Directory.CreateDirectory(Path.Combine(dir, "data"));
            break;
          case 1:
            Resources.Extract(dir);
            File.Copy(Application.ExecutablePath, Path.Combine(dir, Program.UninstallerName), true);
            File.Delete(Path.Combine(dir, "uninstall.ps1")); // from older versions
            File.WriteAllText(Path.Combine(dir, @"data\user.json"),
              "{\"name\":\"" + name.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"}", new UTF8Encoding(false));
            break;
          case 2:
            Shortcut(Environment.GetFolderPath(Environment.SpecialFolder.Programs), dir);
            if (desktop) Shortcut(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), dir);
            break;
          case 3:
            Register(dir);
            break;
        }
        return "";
      } catch (UnauthorizedAccessException) {
        return "Ce dossier est protégé par Windows. Reviens en arrière et choisis un autre emplacement, par exemple celui proposé au départ.";
      } catch (Exception e) {
        return "L’installation n’a pas pu se terminer : " + e.Message;
      }
    }

    // Runs one uninstall step. Only removes what the installer put there:
    // the folder was picked by the user and may hold other things.
    public string UStep(int i)
    {
      var dir = uninstallDir;
      try {
        switch (i) {
          case 0:
            ClosePanel(dir);
            break;
          case 1:
            foreach (var folder in new[] { Environment.SpecialFolder.Programs, Environment.SpecialFolder.DesktopDirectory }) {
              var lnk = Path.Combine(Environment.GetFolderPath(folder), "ClaudePanel.lnk");
              if (File.Exists(lnk) && OpensPanelIn(lnk, dir)) File.Delete(lnk);
            }
            using (var k = Registry.CurrentUser.OpenSubKey(UninstallKey)) {
              var at = k == null ? null : k.GetValue("InstallLocation") as string;
              if (k != null && string.Equals(at, dir, StringComparison.OrdinalIgnoreCase)) {
                k.Close();
                Registry.CurrentUser.DeleteSubKeyTree(UninstallKey);
              }
            }
            break;
          case 2:
            foreach (var f in Resources.PayloadFiles()) File.Delete(Path.Combine(dir, f));
            File.Delete(Path.Combine(dir, "uninstall.ps1"));
            File.Delete(Path.Combine(dir, Program.UninstallerName));
            if (Directory.Exists(Path.Combine(dir, "data"))) Directory.Delete(Path.Combine(dir, "data"), true);
            break;
          case 3:
            if (Directory.Exists(dir) && Directory.GetFileSystemEntries(dir).Length == 0) Directory.Delete(dir);
            break;
        }
        return "";
      } catch (Exception e) {
        return "La désinstallation n’a pas pu se terminer : " + e.Message;
      }
    }

    public void Launch(string dir)
    {
      Process.Start(Path.Combine(Environment.SystemDirectory, "mshta.exe"), "\"" + Path.Combine(dir, "panel.hta") + "\"");
      form.Close();
    }

    public void Quit() { form.Close(); }

    // The panel window and its hidden PowerShell helpers
    static void ClosePanel(string dir)
    {
      using (var q = new ManagementObjectSearcher(
        "SELECT ProcessId, CommandLine FROM Win32_Process WHERE Name='mshta.exe' OR Name='powershell.exe'"))
        foreach (ManagementObject p in q.Get()) {
          var cmd = p["CommandLine"] as string;
          if (cmd == null || cmd.IndexOf(dir, StringComparison.OrdinalIgnoreCase) < 0) continue;
          try { Process.GetProcessById(Convert.ToInt32(p["ProcessId"])).Kill(); } catch (Exception) { }
        }
      Thread.Sleep(300);
    }

    static bool OpensPanelIn(string lnkPath, string dir)
    {
      dynamic shell = Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell"));
      string args = shell.CreateShortcut(lnkPath).Arguments;
      return args.IndexOf(Path.Combine(dir, "panel.hta"), StringComparison.OrdinalIgnoreCase) >= 0;
    }

    static void Shortcut(string folder, string dir)
    {
      dynamic shell = Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell"));
      dynamic lnk = shell.CreateShortcut(Path.Combine(folder, "ClaudePanel.lnk"));
      lnk.TargetPath = Path.Combine(Environment.SystemDirectory, "mshta.exe");
      lnk.Arguments = "\"" + Path.Combine(dir, "panel.hta") + "\"";
      lnk.WorkingDirectory = dir;
      lnk.IconLocation = Path.Combine(dir, "panel.ico");
      lnk.Description = "Ouvrir Claude, Claude Code et tes skills";
      lnk.Save();
    }

    static void Register(string dir)
    {
      using (var k = Registry.CurrentUser.CreateSubKey(UninstallKey)) {
        k.SetValue("DisplayName", "ClaudePanel");
        k.SetValue("DisplayVersion", Program.Version);
        k.SetValue("DisplayIcon", Path.Combine(dir, "panel.ico"));
        k.SetValue("InstallLocation", dir);
        k.SetValue("UninstallString", "\"" + Path.Combine(dir, Program.UninstallerName) + "\" /uninstall");
        k.SetValue("EstimatedSize", 300, RegistryValueKind.DWord);
        k.SetValue("NoModify", 1, RegistryValueKind.DWord);
        k.SetValue("NoRepair", 1, RegistryValueKind.DWord);
      }
    }
  }

  // The modern Windows folder picker (IFileOpenDialog in folder mode)
  static class FolderPicker
  {
    [ComImport, Guid("DC1C5A9C-E88A-4dde-A5A1-60F82A20AEF7")] class FileOpenDialog { }

    [ComImport, Guid("42f85136-db7e-439c-85f1-e4075d135fc8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IFileDialog
    {
      [PreserveSig] int Show(IntPtr parent);
      void SetFileTypes(uint count, IntPtr specs);
      void SetFileTypeIndex(uint index);
      void GetFileTypeIndex(out uint index);
      void Advise(IntPtr sink, out uint cookie);
      void Unadvise(uint cookie);
      void SetOptions(uint options);
      void GetOptions(out uint options);
      void SetDefaultFolder(IShellItem item);
      void SetFolder(IShellItem item);
      void GetFolder(out IShellItem item);
      void GetCurrentSelection(out IShellItem item);
      void SetFileName([MarshalAs(UnmanagedType.LPWStr)] string name);
      void GetFileName([MarshalAs(UnmanagedType.LPWStr)] out string name);
      void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string title);
      void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string label);
      void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string label);
      void GetResult(out IShellItem item);
    }

    [ComImport, Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IShellItem
    {
      void BindToHandler(IntPtr pbc, ref Guid bhid, ref Guid riid, out IntPtr ppv);
      void GetParent(out IShellItem item);
      void GetDisplayName(uint sigdn, [MarshalAs(UnmanagedType.LPWStr)] out string name);
      void GetAttributes(uint mask, out uint attributes);
      void Compare(IShellItem item, uint hint, out int order);
    }

    [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
    static extern void SHCreateItemFromParsingName(string path, IntPtr pbc, ref Guid riid, out IShellItem item);

    const uint PickFolders = 0x20, ForceFileSystem = 0x40, PathMustExist = 0x800;
    const uint FileSysPath = 0x80058000;

    public static string Show(IntPtr owner, string title, string start)
    {
      var dlg = (IFileDialog)new FileOpenDialog();
      dlg.SetOptions(PickFolders | ForceFileSystem | PathMustExist);
      dlg.SetTitle(title);
      dlg.SetOkButtonLabel("Choisir ce dossier");
      if (Directory.Exists(start)) {
        try {
          var iid = typeof(IShellItem).GUID;
          IShellItem folder;
          SHCreateItemFromParsingName(start, IntPtr.Zero, ref iid, out folder);
          dlg.SetFolder(folder);
        } catch (COMException) { }
      }
      if (dlg.Show(owner) != 0) return null; // cancelled
      IShellItem result;
      dlg.GetResult(out result);
      string path;
      result.GetDisplayName(FileSysPath, out path);
      return path;
    }
  }
}

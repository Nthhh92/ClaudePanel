# Started hidden by panel.hta: gives the window its icon and removes the
# maximize button (the HTA tag attributes are ignored in IE edge mode).
# Stays alive while the window is open, since the icon belongs to this process.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Add-Type @"
using System; using System.Runtime.InteropServices;
public class PanelWin {
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern IntPtr FindWindow(string c, string t);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern IntPtr LoadImage(IntPtr h, string name, int type, int cx, int cy, int flags);
  [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h, int msg, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr h, int i);
  [DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr h, int i, int v);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, int f);
  [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern int GetSystemMetrics(int i);
}
"@

$h = [IntPtr]::Zero
for ($i = 0; $i -lt 50 -and $h -eq [IntPtr]::Zero; $i++) {
  $h = [PanelWin]::FindWindow("HTML Application Host Window Class", "ClaudePanel")
  if ($h -eq [IntPtr]::Zero) { Start-Sleep -Milliseconds 100 }
}
if ($h -eq [IntPtr]::Zero) { exit }

$ico = Join-Path $dir "panel.ico"
$small = [PanelWin]::LoadImage([IntPtr]::Zero, $ico, 1, [PanelWin]::GetSystemMetrics(49), [PanelWin]::GetSystemMetrics(50), 0x10)
$big = [PanelWin]::LoadImage([IntPtr]::Zero, $ico, 1, [PanelWin]::GetSystemMetrics(11), [PanelWin]::GetSystemMetrics(12), 0x10)
[PanelWin]::SendMessage($h, 0x80, [IntPtr]0, $small) | Out-Null   # WM_SETICON, ICON_SMALL
[PanelWin]::SendMessage($h, 0x80, [IntPtr]1, $big) | Out-Null     # WM_SETICON, ICON_BIG

# no maximize button
$style = [PanelWin]::GetWindowLong($h, -16)
[PanelWin]::SetWindowLong($h, -16, $style -band (-bnot 0x10000)) | Out-Null
[PanelWin]::SetWindowPos($h, [IntPtr]::Zero, 0, 0, 0, 0, 0x27) | Out-Null  # NOSIZE|NOMOVE|NOZORDER|FRAMECHANGED

while ([PanelWin]::IsWindow($h)) { Start-Sleep -Seconds 2 }

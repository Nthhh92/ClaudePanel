# Run hidden by ClaudePanel 2 on first launch: removes ClaudePanel 1.x from -Dir.
# Only what 1.x put there: the folder was picked by the user and may hold other things.
param([string]$Dir, [string]$App)
if (-not (Test-Path (Join-Path $Dir "panel.hta"))) { exit }

# The 1.x panel window and its hidden PowerShell helpers, if open
Get-CimInstance Win32_Process -Filter "Name='mshta.exe' OR Name='powershell.exe'" |
  Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -like "*$Dir*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep -Milliseconds 500

# Shortcuts that open this 1.x panel (not the ones 2.x just created)
$wsh = New-Object -ComObject WScript.Shell
foreach ($lnk in "$([Environment]::GetFolderPath('Desktop'))\ClaudePanel.lnk", "$([Environment]::GetFolderPath('Programs'))\ClaudePanel.lnk") {
  if ((Test-Path $lnk) -and $wsh.CreateShortcut($lnk).Arguments -like "*$Dir\panel.hta*") { Remove-Item $lnk -Force }
}

# The 2.x shortcuts come with an empty icon path, and Windows keeps showing the
# cached 1.x icon (now deleted) as a blank page: point them at the exe's icon
$pinned = "$env:APPDATA\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar\ClaudePanel.lnk"
foreach ($lnk in "$([Environment]::GetFolderPath('Desktop'))\ClaudePanel.lnk", "$([Environment]::GetFolderPath('Programs'))\ClaudePanel.lnk", $pinned) {
  if ($App -and (Test-Path $lnk)) {
    $s = $wsh.CreateShortcut($lnk)
    if ($s.TargetPath -eq $App) { $s.IconLocation = "$App,0"; $s.Save() }
  }
}
& "$env:SystemRoot\System32\ie4uinit.exe" -show

$files = "panel.hta", "detect.js", "greetings.js", "robot.js", "panel.ico",
         "seticon.ps1", "skills.ps1", "install-code.ps1", "uninstall.ps1", "D*sinstaller ClaudePanel.exe"
foreach ($f in $files) { Remove-Item (Join-Path $Dir $f) -Force -ErrorAction SilentlyContinue }
Remove-Item (Join-Path $Dir "data") -Recurse -Force -ErrorAction SilentlyContinue
if (-not (Get-ChildItem $Dir -Force -ErrorAction SilentlyContinue)) { Remove-Item $Dir -Force -ErrorAction SilentlyContinue }

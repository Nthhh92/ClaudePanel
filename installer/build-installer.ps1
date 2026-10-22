# Builds dist\ClaudePanel-Setup.exe: Setup.cs compiled with the C# compiler that
# ships with Windows, with setup.html and the panel's files embedded in it.
# The same exe is the uninstaller: it copies itself into the install folder.

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $here
$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force $dist | Out-Null

$files = "panel.hta", "detect.js", "greetings.js", "robot.js", "panel.ico",
         "seticon.ps1", "skills.ps1", "install-code.ps1"

$csc = Join-Path ([Runtime.InteropServices.RuntimeEnvironment]::GetRuntimeDirectory()) "csc.exe"
$exe = Join-Path $dist "ClaudePanel-Setup.exe"
$cscArgs = @(
  "/nologo", "/target:winexe", "/optimize+", "/codepage:65001",
  "/out:$exe", "/win32icon:$root\panel.ico",
  "/r:System.Windows.Forms.dll", "/r:System.Drawing.dll", "/r:System.Core.dll", "/r:Microsoft.CSharp.dll", "/r:System.Management.dll",
  "/resource:$here\setup.html,setup.html"
) + ($files | ForEach-Object { "/resource:$root\$_,payload/$_" }) + "$here\Setup.cs"

& $csc @cscArgs
if ($LASTEXITCODE -ne 0) { throw "La compilation a échoué" }
Write-Host "OK  $exe"

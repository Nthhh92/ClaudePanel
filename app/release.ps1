# Publishes a new ClaudePanel version: builds the signed installer and puts it,
# with latest.json (what the app checks for updates), on the public
# ClaudePanel-releases repository.
#
#   .\release.ps1 2.1.0              add the version's news to ui\changelog.js first
#   .\release.ps1 2.1.0 -NoPublish   build and sign only (latest.json points at -BaseUrl)
#   -Config test.json                merged into tauri.conf.json for this build only
param(
  [Parameter(Mandatory)][string]$Version,
  [string]$BaseUrl = "",
  [string]$Config = "",
  [switch]$NoPublish
)
$ErrorActionPreference = "Stop"
$app = $PSScriptRoot
$repo = "Nthhh92/ClaudePanel-releases"
$gh = "C:\Program Files\GitHub CLI\gh.exe"
$key = "$env:USERPROFILE\.tauri\claudepanel.key"
$utf8 = New-Object Text.UTF8Encoding $false
if (-not $BaseUrl) { $BaseUrl = "https://github.com/$repo/releases/download/v$Version" }

if ($Version -notmatch '^\d+\.\d+\.\d+$') { throw "Version attendue sous la forme 2.1.0" }
if (-not (Test-Path $key)) { throw "Clé de signature introuvable : $key" }

# This version's news, from ui\changelog.js: they become the release notes
$changelog = [IO.File]::ReadAllText("$app\ui\changelog.js")
$block = [regex]::Match($changelog, 'version:\s*"' + [regex]::Escape($Version) + '"[\s\S]*?items:\s*\{[\s\S]*?fr:\s*\[([\s\S]*?)\]\]')
if (-not $block.Success) { throw "Ajoute d'abord les nouveautés de la $Version dans ui\changelog.js" }
# The capture stops before the last item's closing "]"
$items = [regex]::Matches($block.Groups[1].Value + "]",'\["((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"\]')
$notes = ($items | ForEach-Object { "- **$($_.Groups[1].Value)** : $($_.Groups[2].Value)" }) -join "`n"

# The version number lives in three files
function Set-FirstMatch($path, $pattern, $replacement) {
  $text = [IO.File]::ReadAllText($path)
  $text = ([regex]::new($pattern, 'Multiline')).Replace($text, $replacement, 1)
  [IO.File]::WriteAllText($path, $text, $utf8)
}
Set-FirstMatch "$app\src-tauri\tauri.conf.json" '"version": "[^"]+"' "`"version`": `"$Version`""
Set-FirstMatch "$app\src-tauri\Cargo.toml" '^version = "[^"]+"' "version = `"$Version`""
Set-FirstMatch "$app\package.json" '"version": "[^"]+"' "`"version`": `"$Version`""

# Signed build
$env:Path = [Environment]::GetEnvironmentVariable("Path", "User") + ";" + [Environment]::GetEnvironmentVariable("Path", "Machine")
$env:TAURI_SIGNING_PRIVATE_KEY = [IO.File]::ReadAllText($key)
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""
Push-Location $app
# The build logs to stderr: PowerShell 5 would stop on that with "Stop"
$ErrorActionPreference = "Continue"
$extra = if ($Config) { @("--config", $Config) } else { @() }
try { npx tauri build --bundles nsis @extra 2>&1 | ForEach-Object { "$_" } } finally { Pop-Location }
$ErrorActionPreference = "Stop"
if ($LASTEXITCODE) { throw "La compilation a échoué" }

$name = "ClaudePanel_${Version}_x64-setup.exe"
$bundle = "$app\src-tauri\target\release\bundle\nsis"
$latest = [ordered]@{
  version   = $Version
  notes     = $notes
  pub_date  = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  platforms = @{ "windows-x86_64" = @{ signature = [IO.File]::ReadAllText("$bundle\$name.sig").Trim(); url = "$BaseUrl/$name" } }
}
[IO.File]::WriteAllText("$bundle\latest.json", ($latest | ConvertTo-Json -Depth 5), $utf8)
Copy-Item "$bundle\$name" (Join-Path (Split-Path $app) "dist") -Force

if ($NoPublish) { Write-Host "Prêt (non publié) : $bundle"; return }
# Notes through a file: PowerShell 5 would mangle the accents as an argument
[IO.File]::WriteAllText("$bundle\notes.md", $notes, $utf8)
& $gh release create "v$Version" "$bundle\$name" "$bundle\latest.json" --repo $repo --title "ClaudePanel $Version" --notes-file "$bundle\notes.md"
if ($LASTEXITCODE) { throw "La publication a échoué" }
Write-Host "Publié : https://github.com/$repo/releases/tag/v$Version"

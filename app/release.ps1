# Publishes a new ClaudePanel version: builds the signed installer and puts it,
# with latest.json (what the app checks for updates), on the public
# ClaudePanel-releases repository, then starts the Mac build on GitHub.
#
#   .\release.ps1 2.1.0              add the version's news to ui\changelog.js first
#   .\release.ps1 2.1.0 -NoPublish   build and sign only (latest.json points at -BaseUrl)
#   -Config test.json                merged into tauri.conf.json for this build only
#   -Key <file> -NoPassword          sign with another key (2.2.3: the old one, which has
#                                    no password, so 2.2.2 accepts the switch to the new key)
#
# Asks for the signing key's password (claudepanel-v2.key), unless -NoPassword.
param(
  [Parameter(Mandatory)][string]$Version,
  [string]$BaseUrl = "",
  [string]$Config = "",
  [switch]$NoPublish,
  [string]$Key = "$env:USERPROFILE\.tauri\claudepanel-v2.key",
  [switch]$NoPassword
)
$ErrorActionPreference = "Stop"
$app = $PSScriptRoot
$repo = "Nthhh92/ClaudePanel-releases"
$gh = "C:\Program Files\GitHub CLI\gh.exe"
$utf8 = New-Object Text.UTF8Encoding $false
if (-not $BaseUrl) { $BaseUrl = "https://github.com/$repo/releases/download/v$Version" }

if ($Version -notmatch '^\d+\.\d+\.\d+$') { throw "Version attendue sous la forme 2.1.0" }
if (-not (Test-Path $Key)) { throw "Clé de signature introuvable : $Key" }

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

# Plugin repositories whose stars .github/workflows/stars.yml counts each day,
# from Claude Code's current catalog (commit the file with the version)
$stars = Join-Path (Split-Path $app) ".github\stars"
cmd /c "claude plugin list --json --available | python `"$stars\repos.py`" `"$stars\repos.txt`""
if ($LASTEXITCODE) { Write-Host "Liste des dépôts (stars) non mise à jour" -ForegroundColor Yellow }

# Signed build
$env:Path = [Environment]::GetEnvironmentVariable("Path", "User") + ";" + [Environment]::GetEnvironmentVariable("Path", "Machine")
$env:TAURI_SIGNING_PRIVATE_KEY = [IO.File]::ReadAllText($Key)
if ($NoPassword) { $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "" }
else {
  $secure = Read-Host "Mot de passe de la clé de signature" -AsSecureString
  $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}
Push-Location $app
# The build logs to stderr: PowerShell 5 would stop on that with "Stop"
$ErrorActionPreference = "Continue"
$extra = if ($Config) { @("--config", $Config) } else { @() }
try { npx tauri build --bundles nsis @extra 2>&1 | ForEach-Object { "$_" } }
finally {
  Pop-Location
  Remove-Item Env:TAURI_SIGNING_PRIVATE_KEY, Env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD -ErrorAction SilentlyContinue
}
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

# The Mac version is built on GitHub (.github/workflows/release-mac.yml) and
# added to this release a few minutes later
& $gh workflow run release-mac.yml --repo Nthhh92/ClaudePanel -f version=$Version
if ($LASTEXITCODE) { Write-Host "La version Mac n'a pas pu être lancée : relance-la depuis l'onglet Actions" -ForegroundColor Yellow }
else { Write-Host "Version Mac en cours : https://github.com/Nthhh92/ClaudePanel/actions" }

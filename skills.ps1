# Helper for panel.hta: lists installed skills, installs and removes plugins.
# Usage: skills.ps1 list | install <plugin@marketplace> | uninstall <plugin@marketplace> | add <owner/repo>
param([string]$Action = "list", [string]$Arg = "")

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$data = Join-Path $dir "data"
New-Item -ItemType Directory -Force $data | Out-Null
$status = Join-Path $data "status.json"
$utf8 = New-Object Text.UTF8Encoding $false
$claudeDir = "$env:USERPROFILE\.claude"

function Write-Json($path, $obj) {
  [IO.File]::WriteAllText($path, ($obj | ConvertTo-Json -Depth 6 -Compress), $utf8)
}

function Get-Description($file) {
  foreach ($l in ([IO.File]::ReadAllLines($file, $utf8) | Select-Object -First 30)) {
    if ($l -match '^description:\s*(.+)$') { return $Matches[1].Trim('"', "'", ' ') }
  }
  return ""
}

function New-Skill($name, $command, $file) {
  [pscustomobject]@{ name = $name; command = $command; description = (Get-Description $file) }
}

# Skills in <root>/<name>/SKILL.md (one level, like Claude Code does)
function Get-SkillsIn($root, $prefix) {
  $out = @()
  if (-not (Test-Path $root)) { return $out }
  Get-ChildItem $root -Directory | ForEach-Object {
    $md = Join-Path $_.FullName "SKILL.md"
    if (Test-Path $md) { $out += New-Skill $_.Name "/$prefix$($_.Name)" $md }
  }
  return $out
}

function Update-Lists {
  $groups = @()

  # Plugins
  $installedFile = "$claudeDir\plugins\installed_plugins.json"
  if (Test-Path $installedFile) {
    $inst = [IO.File]::ReadAllText($installedFile, $utf8) | ConvertFrom-Json
    foreach ($p in $inst.plugins.PSObject.Properties) {
      $name = $p.Name.Split('@')[0]
      $path = $p.Value[0].installPath
      $skills = @(Get-SkillsIn (Join-Path $path "skills") "${name}:")
      $rootSkill = Join-Path $path "SKILL.md"
      if (Test-Path $rootSkill) { $skills += New-Skill $name "/${name}:$name" $rootSkill }
      $cmdDir = Join-Path $path "commands"
      if (Test-Path $cmdDir) {
        Get-ChildItem $cmdDir -Filter *.md | ForEach-Object { $skills += New-Skill $_.BaseName "/${name}:$($_.BaseName)" $_.FullName }
      }
      $groups += [pscustomobject]@{ plugin = $name; id = $p.Name; skills = $skills }
    }
  }

  # Personal skills (~/.claude/skills/<name>)
  $personal = @(Get-SkillsIn "$claudeDir\skills" "")
  if ($personal.Count) { $groups += [pscustomobject]@{ plugin = "Mes skills"; id = ""; skills = $personal } }

  # Skills synced from claude.ai (~/.claude/skills/synced/<id>/<name>)
  $synced = @()
  if (Test-Path "$claudeDir\skills\synced") {
    Get-ChildItem "$claudeDir\skills\synced" -Directory | ForEach-Object { $synced += Get-SkillsIn $_.FullName "anthropic-skills:" }
  }
  if ($synced.Count) { $groups += [pscustomobject]@{ plugin = "Claude.ai"; id = ""; skills = $synced } }

  Write-Json (Join-Path $data "installed.json") @($groups)

  # Every plugin of the known marketplaces (raw CLI output, UTF-8)
  cmd /c "claude plugin list --json --available > `"$data\available.json`" 2>nul"
}

function Invoke-Claude($cmdArgs) {
  $out = (cmd /c "claude $cmdArgs 2>&1") -join "`n"
  if ($LASTEXITCODE -ne 0) { throw $out }
  return $out
}

try {
  $msg = ""
  switch ($Action) {
    "install"   { $msg = Invoke-Claude "plugin install `"$Arg`"" }
    "uninstall" { $msg = Invoke-Claude "plugin uninstall `"$Arg`"" }
    "add"       { $msg = Invoke-Claude "plugin marketplace add `"$Arg`"" }
  }
  Update-Lists
  Write-Json $status @{ done = $true; ok = $true; action = $Action; msg = $msg }
} catch {
  Update-Lists
  Write-Json $status @{ done = $true; ok = $false; action = $Action; msg = "$_" }
}

# Opened by ClaudePanel when Claude Code is missing: runs Anthropic's official installer.
# The {PLACEHOLDERS} are filled in by launch.rs with texts in the user's language.
$Host.UI.RawUI.WindowTitle = "{TITLE}"
Write-Host ""
Write-Host "  {TITLE}" -ForegroundColor Cyan
Write-Host "  {SOURCE}" -ForegroundColor DarkGray
Write-Host ""
try {
  Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
  Write-Host ""
  Write-Host "  {OK}" -ForegroundColor Green
} catch {
  Write-Host ""
  Write-Host "  {FAIL}" -ForegroundColor Red
  Write-Host "  {CHECK}" -ForegroundColor Red
}
Write-Host ""
Read-Host "  {CLOSE}"

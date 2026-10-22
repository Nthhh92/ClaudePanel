# Opened by panel.hta when Claude Code is missing: runs Anthropic's official installer.
$Host.UI.RawUI.WindowTitle = "Installation de Claude Code"
Write-Host ""
Write-Host "  Installation de Claude Code" -ForegroundColor Cyan
Write-Host "  Script officiel d'Anthropic : https://claude.ai/install.ps1" -ForegroundColor DarkGray
Write-Host ""
try {
  Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
  Write-Host ""
  Write-Host "  C'est fait ! Retourne sur ClaudePanel et clique sur Claude Code pour te connecter." -ForegroundColor Green
} catch {
  Write-Host ""
  Write-Host "  L'installation a échoué : $_" -ForegroundColor Red
  Write-Host "  Vérifie ta connexion Internet puis réessaie depuis ClaudePanel." -ForegroundColor Red
}
Write-Host ""
Read-Host "  Appuie sur Entrée pour fermer"

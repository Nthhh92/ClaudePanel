; ClaudePanel 1.x (the HTA panel) used the same "Apps" entry as this version.
; Before this installer overwrites it, note where 1.x was installed, so the app
; can keep its first name and remove it on first launch (see src/migrate.rs).
!macro NSIS_HOOK_PREINSTALL
  ReadRegStr $R8 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClaudePanel" "DisplayVersion"
  StrCmp $R8 "1.0" 0 +4
  ReadRegStr $R9 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClaudePanel" "InstallLocation"
  IfFileExists "$R9\panel.hta" 0 +2
  WriteRegStr HKCU "Software\ClaudePanel" "LegacyDir" "$R9"
!macroend

; ============================================================
;  Flowspace — Hooks personalizados do instalador NSIS
;  Compatível com Tauri v2
; ============================================================
!include "WinMessages.nsh"

; -----------------------------------------------------------
;  PRÉ-INSTALAÇÃO
;  Verifica se o app está aberto e pede para fechar.
; -----------------------------------------------------------
!macro NSIS_HOOK_PREINSTALL
  ; Detecta janela aberta do Flowspace
  FindWindow $0 "" "Flowspace"
  IntCmp $0 0 pre_done

    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
      "O Flowspace está em execução.$\nClique em OK para fechá-lo e continuar a instalação." \
      IDOK pre_close IDCANCEL pre_abort

    pre_close:
      SendMessage $0 ${WM_CLOSE} 0 0
      Sleep 1500
      Goto pre_done

    pre_abort:
      Abort "Instalação cancelada. Feche o Flowspace manualmente e tente novamente."

  pre_done:
!macroend

; -----------------------------------------------------------
;  PÓS-INSTALAÇÃO
;  Registra o protocolo flowspace:// e entradas de registro.
; -----------------------------------------------------------
!macro NSIS_HOOK_POSTINSTALL
  ; Registrar protocolo personalizado flowspace://
  WriteRegStr HKCR "flowspace"                          "" "URL:Flowspace Protocol"
  WriteRegStr HKCR "flowspace"                          "URL Protocol" ""
  WriteRegStr HKCR "flowspace\DefaultIcon"              "" "$INSTDIR\Flowspace.exe,0"
  WriteRegStr HKCR "flowspace\shell\open\command"       "" '"$INSTDIR\Flowspace.exe" "%1"'

  ; Informações do app no Painel de Controle (Programas e Recursos)
  WriteRegStr HKCU "Software\Flowspace" "InstallPath"   "$INSTDIR"
  WriteRegStr HKCU "Software\Flowspace" "Version"       "0.1.0"

  ; Mensagem de boas-vindas ao final da instalação
  MessageBox MB_ICONINFORMATION|MB_OK \
    "Flowspace instalado com sucesso!$\n$\nSeu workspace com Kanban, notas e Spotify — 100% local.$\n$\nClique em OK para iniciar."

  ; Abrir o app automaticamente após instalar
  Exec '"$INSTDIR\Flowspace.exe"'
!macroend

; -----------------------------------------------------------
;  PRÉ-DESINSTALAÇÃO
;  Fecha o app antes de remover os arquivos.
; -----------------------------------------------------------
!macro NSIS_HOOK_PREUNINSTALL
  FindWindow $0 "" "Flowspace"
  IntCmp $0 0 pre_un_done

    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
      "O Flowspace está em execução.$\nClique em OK para fechá-lo e continuar a desinstalação." \
      IDOK pre_un_close IDCANCEL pre_un_abort

    pre_un_close:
      SendMessage $0 ${WM_CLOSE} 0 0
      Sleep 1500
      Goto pre_un_done

    pre_un_abort:
      Abort "Desinstalação cancelada."

  pre_un_done:
!macroend

; -----------------------------------------------------------
;  PÓS-DESINSTALAÇÃO
;  Remove entradas de registro deixadas pelo app.
; -----------------------------------------------------------
!macro NSIS_HOOK_POSTUNINSTALL
  DeleteRegKey HKCR "flowspace"
  DeleteRegKey HKCU "Software\Flowspace"
!macroend

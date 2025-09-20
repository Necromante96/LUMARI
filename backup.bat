@echo off
echo =====================================================
echo           LUMARI - Sistema de Backup Local
echo =====================================================
echo.

if "%1"=="backup" goto backup
if "%1"=="restore" goto restore

:menu
echo Escolha uma opcao:
echo.
echo [1] Criar Backup
echo [2] Restaurar Backup
echo [3] Sair
echo.
set /p choice="Digite sua escolha (1-3): "

if "%choice%"=="1" goto backup
if "%choice%"=="2" goto restore
if "%choice%"=="3" goto exit
echo Opcao invalida! Tente novamente.
goto menu

:backup
echo.
echo 🚀 Criando backup...
node backup.js backup
if %errorlevel% equ 0 (
    echo.
    echo ✅ Backup criado com sucesso!
) else (
    echo.
    echo ❌ Erro ao criar backup!
)
echo.
pause
goto menu

:restore
echo.
echo ⚠️  ATENÇÃO: Esta ação irá sobrescrever os arquivos atuais!
set /p confirm="Tem certeza que deseja continuar? (s/N): "
if /i not "%confirm%"=="s" (
    echo Operacao cancelada.
    goto menu
)

echo.
echo 🔄 Restaurando backup...
node backup.js restore
if %errorlevel% equ 0 (
    echo.
    echo ✅ Backup restaurado com sucesso!
) else (
    echo.
    echo ❌ Erro ao restaurar backup!
)
echo.
pause
goto menu

:exit
echo.
echo Obrigado por usar o sistema de backup LUMARI!
echo.
pause
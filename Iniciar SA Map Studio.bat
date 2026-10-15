@echo off
title SA Map Studio
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
    py -3 serve.py %*
) else (
    python serve.py %*
)
if errorlevel 1 (
    echo.
    echo Nao consegui iniciar. Confira se o Python 3 esta instalado: https://www.python.org/downloads/
    pause
)

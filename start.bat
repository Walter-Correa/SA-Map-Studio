@echo off
title SA Map Studio
cd /d "%~dp0"
set "PYTHONDONTWRITEBYTECODE=1"
set "PYCMD="
if exist "%~dp0compile-sources\.venv-build\Scripts\python.exe" set "PYCMD="%~dp0compile-sources\.venv-build\Scripts\python.exe""
if not defined PYCMD where py >nul 2>nul && set "PYCMD=py -3"
if not defined PYCMD where python >nul 2>nul && set "PYCMD=python"
if defined PYCMD (
    %PYCMD% -B serve.py %*
) else (
    echo.
    echo Nao foi possivel iniciar. Certifique-se de que o Python 3 esta instalado.
    pause
)

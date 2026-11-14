@echo off
title SA Map Studio
cd /d "%~dp0"
set "PYTHONDONTWRITEBYTECODE=1"
set "PYCMD="
if exist "%~dp0compile-sources\.venv-build\Scripts\python.exe" set "PYCMD="%~dp0compile-sources\.venv-build\Scripts\python.exe""
if not defined PYCMD py -3 -c "import sys" >nul 2>nul && set "PYCMD=py -3"
if not defined PYCMD python -c "import sys" >nul 2>nul && set "PYCMD=python"
if not defined PYCMD if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set "PYCMD="%LOCALAPPDATA%\Programs\Python\Python313\python.exe""
if defined PYCMD (
    %PYCMD% -B serve.py %*
) else (
    echo.
    echo Could not start. Make sure Python 3 is installed.
    pause
)

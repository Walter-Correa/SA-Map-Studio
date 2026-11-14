@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "SRC=%~dp0"

rem Mode: no parameter = keeps the data | "clean" (or the old name "limpo") = clean single-file version
set "MODE=%~1"
title Building SA Map Studio
set "OUT=%~dp0compiled\SA Map Studio"
set "BASE=%OUT%\sa-map-studio"
set "STAGE=%SRC%build\staging\sa-map-studio"

if /i "%MODE%"=="clean" set "MODE=clean"
if /i "%MODE%"=="limpo" set "MODE=clean"

echo ============================================================
if /i "%MODE%"=="clean" (
echo  Building SA Map Studio - CLEAN VERSION (SINGLE FILE)
echo  Resultado: compiled\SA Map Studio\SA Map Studio.exe
echo  (The sa-map-studio folder is packed inside the executable)
) else (
echo  Building SA Map Studio - NORMAL VERSION
echo  Resultado: compiled\SA Map Studio\SA Map Studio.exe
)
echo ============================================================

set "VENV_DIR=%SRC%compile-sources\.venv-build"
set "VPY=%VENV_DIR%\Scripts\python.exe"

rem If there is an old venv in the root, moves it to compile-sources or removes it
if exist "%SRC%.venv-build" (
    if not exist "%VENV_DIR%" (
        move "%SRC%.venv-build" "%VENV_DIR%" >nul 2>nul
    ) else (
        rmdir /s /q "%SRC%.venv-build" 2>nul
    )
)

rem If the venv exists but is corrupted or points to a Python missing from another machine, recreates it
if exist "%VPY%" (
    "%VPY%" -c "import sys" >nul 2>nul
    if errorlevel 1 (
        echo The existing build environment is corrupted. Recreating it...
        rmdir /s /q "%VENV_DIR%" 2>nul
    )
)

rem Separate environment just for compiling (does not touch your Python)
if exist "%VPY%" goto venv_ready
echo Looking for a working Python installation...
call :find_python
if not defined PY (
    echo ERROR: No working Python installation was found!
    echo Install Python 3.10 or newer from https://www.python.org/downloads/ and run again.
    goto fail
)
echo Creating the build environment with: %PY%
%PY% -m venv "%VENV_DIR%"
if errorlevel 1 goto fail
:venv_ready

echo Updating pip, PyInstaller and pywebview to the latest versions...
"%VPY%" -m pip install --upgrade --quiet pip
if errorlevel 1 goto fail
"%VPY%" -m pip install --upgrade --quiet pyinstaller
if errorlevel 1 goto fail
"%VPY%" -m pip install --upgrade --quiet pywebview
if errorlevel 1 echo Warning: pywebview did not install. The program will open in the browser.

echo Closing SA Map Studio, if it is open...
rem Only closes what runs from this repository (the program and its test server): a game server or another copy
rem of the editor running from somewhere else is left alone
powershell -NoProfile -Command "Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path.StartsWith('%SRC%', [StringComparison]::OrdinalIgnoreCase) -and ($_.Name -in 'SA Map Studio','sa-map-studio','omp-server','samp-server') } | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>nul
ping 127.0.0.1 -n 3 >nul

rem Date and time of this build (shown in "What's new" inside the program)
for /f "usebackq delims=" %%T in (`powershell -NoProfile -Command "Get-Date -Format 'dd/MM/yyyy HH:mm:ss'"`) do set "BUILDTIME=%%T"
> "build-info.json" echo {"builtAt": "%BUILDTIME%"}

rem Prepares the temporary staging structure
if exist "build" rmdir /s /q "build"
if not exist "%STAGE%\system" mkdir "%STAGE%\system"
if not exist "%STAGE%\projects" mkdir "%STAGE%\projects"
if not exist "%STAGE%\exported" mkdir "%STAGE%\exported"
if not exist "%STAGE%\data\cache" mkdir "%STAGE%\data\cache"
if not exist "%STAGE%\test-server" mkdir "%STAGE%\test-server"

set "ICONFILE=%SRC%icon.ico"
set "VERFILE=%SRC%compile-sources\version_info.txt"
rem The version stored in the .exe always follows VERSION in serve.py
"%VPY%" "%SRC%compile-sources\sync_version.py"
if errorlevel 1 goto fail
rem Checks that every interface text has a translation in every language; a failure stops the build
"%VPY%" -X utf8 "%SRC%compile-sources\i18n_check.py"
if errorlevel 1 goto fail

rem ---------------- 1. Compiles the System Engine (sa-map-studio.exe)
echo Building the system engine...
set "ARGS=--noconfirm --clean --onedir --windowed --noupx"
set "ARGS=%ARGS% --name "sa-map-studio" --icon "%ICONFILE%""
if exist "%VERFILE%" set "ARGS=%ARGS% --version-file "%VERFILE%""
set "ARGS=%ARGS% --distpath "%SRC%build\engine" --workpath "%SRC%build\tmp_engine" --specpath "%SRC%build""
set "ARGS=%ARGS% --add-data "%SRC%index.html;." --add-data "%SRC%favicon.svg;.""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\css;css""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\js;js""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\fonts;fonts""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\anim-list.json;.""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\example-map.json;.""
rem The loose CJ files are only a fallback (the game's own clothes build him): the folder may not exist or be empty
if exist "%SRC%compile-sources\models\*.*" set "ARGS=%ARGS% --add-data "%SRC%compile-sources\models;models""
set "ARGS=%ARGS% --add-data "%SRC%build-info.json;.""

"%VPY%" -m PyInstaller %ARGS% "%SRC%serve.py"
if errorlevel 1 goto fail

echo Copying the engine to staging...
robocopy "%SRC%build\engine\sa-map-studio" "%STAGE%\system" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto fail
if exist "%STAGE%\system\webview\lib\pywebview-android.jar" del /q "%STAGE%\system\webview\lib\pywebview-android.jar" 2>nul
if exist "%STAGE%\system\pythonnet\runtime\Python.Runtime.xml" del /q "%STAGE%\system\pythonnet\runtime\Python.Runtime.xml" 2>nul

rem ---------------- 2. test-server
set "ST=%STAGE%\test-server"
if not exist "%ST%\gamemodes" mkdir "%ST%\gamemodes"
if not exist "%ST%\scriptfiles\samapstudio" mkdir "%ST%\scriptfiles\samapstudio"

if exist "omp-server-source\pawno\pawncc.exe" (
    echo Compiling gamemode samapstudio.pwn...
    rem Relative paths: the .amx comes out the same in any folder/PC
    "omp-server-source\pawno\pawncc.exe" "compile-sources\samapstudio.pwn" -o"compile-sources\samapstudio.amx" -i"omp-server-source\pawno\include" -d3 -Z+ >nul
)

if exist "%SRC%compile-sources\samapstudio.amx" copy /y "%SRC%compile-sources\samapstudio.amx" "%ST%\gamemodes\samapstudio.amx" >nul
if exist "%SRC%compile-sources\samapstudio.pwn" copy /y "%SRC%compile-sources\samapstudio.pwn" "%ST%\gamemodes\samapstudio.pwn" >nul
del /q "%ST%\LEIA-ME.txt" 2>nul

set "SRVSRC="
if exist "omp-server-source\omp-server.exe" set "SRVSRC=omp-server-source"
if not defined SRVSRC if exist "%BASE%\test-server\omp-server.exe" set "SRVSRC=%BASE%\test-server"
if not defined SRVSRC if exist "%BASE%\test-server\samp-server.exe" set "SRVSRC=%BASE%\test-server"
if defined SRVSRC (
    echo Copying the test server from: "%SRVSRC%"
    robocopy "%SRVSRC%" "%ST%" omp-server.exe samp-server.exe *.dll /NFL /NDL /NJH /NJS /NP >nul
    if exist "%SRVSRC%\components" robocopy "%SRVSRC%\components" "%ST%\components" /E /NFL /NDL /NJH /NJS /NP >nul
    if exist "%SRVSRC%\plugins" robocopy "%SRVSRC%\plugins" "%ST%\plugins" /E /NFL /NDL /NJH /NJS /NP >nul
)
if exist "omp-server-source\plugins" robocopy "omp-server-source\plugins" "%ST%\plugins" /E /NFL /NDL /NJH /NJS /NP >nul
del /q /s "%ST%\components\*.pdb" 2>nul
del /q /s "%ST%\components\*.dmp" 2>nul
del /q /s "%ST%\plugins\*.pdb" 2>nul
del /q /s "%ST%\plugins\*.dmp" 2>nul
del /q /s "%ST%\*.pdb" 2>nul
del /q /s "%ST%\*.dmp" 2>nul

if exist "omp-server-source\config.json" copy /y "omp-server-source\config.json" "%ST%\config.json" >nul
if not exist "%ST%\server.cfg" (
    > "%ST%\server.cfg" (
        echo echo Executing Server Config...
        echo lanmode 1
        echo rcon_password changeme1
        echo maxplayers 10
        echo port 7777
        echo hostname SA Map Studio - test
        echo gamemode0 samapstudio 1
        echo filterscripts
        echo plugins streamer.dll
        echo announce 0
        echo query 1
        echo chatlogging 0
        echo weburl localhost
        echo onfoot_rate 40
        echo incar_rate 40
        echo weapon_rate 40
        echo stream_distance 300.0
        echo stream_rate 1000
        echo maxnpc 0
        echo logtimeformat [%%H:%%M:%%S]
        echo language Portugues
    )
)
if not exist "%ST%\scriptfiles\samapstudio\mapa.txt" (
    echo S^|0.0^|0.0^|3.0^|0.0^|0^|0^|1> "%ST%\scriptfiles\samapstudio\mapa.txt"
)

rem ---------------- 3. Sounds of the catalog
rem Nothing else of the game is packed: the thumbnails, skins, sprites, map icons, radar and animations are made on the
rem first run (from the GTA folder of the user or downloaded). Only these short sounds go along: the preview of a few
rem PlayerPlaySound ids (1000-1190) has no source in the game files. Only what is in compile-sources\cache\sounds is
rem used here, never what an earlier build left in the data folder.
set "SOUNDSRC="
if exist "%SRC%compile-sources\cache\sounds\*.wav" set "SOUNDSRC=%SRC%compile-sources\cache\sounds"
if defined SOUNDSRC (
    if not exist "%STAGE%\data\cache\sounds" mkdir "%STAGE%\data\cache\sounds"
    robocopy "%SOUNDSRC%" "%STAGE%\data\cache\sounds" *.wav /NFL /NDL /NJH /NJS /NP /R:1 /W:1 >nul
)

rem Removes any unwanted stray file in staging
del /q /s "%STAGE%\*.pdb" 2>nul
del /q /s "%STAGE%\*.dmp" 2>nul
del /q /s "%STAGE%\*LEIA-ME*" 2>nul

rem ---------------- 4. Packs the sa-map-studio.zip bundle
echo Packing the sa-map-studio.zip bundle...
"%VPY%" "%SRC%compile-sources\package_bundle.py" "%STAGE%" "%SRC%build\sa-map-studio.zip"
if errorlevel 1 goto fail

rem ---------------- 5. Builds the self-extracting launcher (SA Map Studio.exe)
echo Generating the single executable SA Map Studio.exe...
set "LAUNCHER_ARGS=--noconfirm --clean --onefile --windowed --noupx"
set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --name "SA Map Studio" --icon "%ICONFILE%""
if exist "%VERFILE%" set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --version-file "%VERFILE%""
set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --distpath "%OUT%" --workpath "%SRC%build\tmp_launcher" --specpath "%SRC%build""
set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --add-data "%SRC%build\sa-map-studio.zip;.""
set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --add-data "%ICONFILE%;.""
if exist "%SRC%compile-sources\launcher_frames" set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --add-data "%SRC%compile-sources\launcher_frames;launcher_frames""
"%VPY%" -m PyInstaller %LAUNCHER_ARGS% "%SRC%compile-sources\launcher.py"
if errorlevel 1 goto fail

rem ---------------- 6. Clean vs Normal Mode Handling
if /i "%MODE%"=="clean" (
    rem In the clean version, keeps strictly ONLY the single executable
    if exist "%BASE%" rmdir /s /q "%BASE%" 2>nul
    echo Clean version ready: the sa-map-studio folder is created on the first run.
) else (
    rem In normal mode, if the development folder already exists, updates the engine
    if exist "%BASE%\system" robocopy "%STAGE%\system" "%BASE%\system" /MIR /NFL /NDL /NJH /NJS /NP >nul
    if exist "%BASE%\test-server\gamemodes" copy /y "%STAGE%\test-server\gamemodes\*.*" "%BASE%\test-server\gamemodes\" >nul
)

del /q "%OUT%\LEIA-ME.txt" 2>nul
del /q "%OUT%\*.txt" 2>nul
if exist "%BASE%\LEIA-ME.txt" del /q "%BASE%\LEIA-ME.txt" 2>nul

rem Cleans temporary build folders
rmdir /s /q "%SRC%build" 2>nul
del /q "%SRC%build-info.json" 2>nul
del /q "%SRC%sa-map-studio.spec" 2>nul
del /q "%SRC%SA Map Studio.spec" 2>nul
del /q "%SRC%mini_launcher.spec" 2>nul 2>nul
if exist "%SRC%__pycache__" rmdir /s /q "%SRC%__pycache__" 2>nul

echo.
echo ============================================================
echo  Done! Single executable generated successfully:
echo    %OUT%\SA Map Studio.exe
echo.
if /i "%MODE%"=="clean" (
echo  Clean single-file version: to share or move the program,
echo  just copy only 'SA Map Studio.exe'.
echo  On the first run it creates the sa-map-studio folder with everything inside.
) else (
echo    projects\, exported\, data\ - your maps and local settings ^(kept^)
)
if not defined NO_PAUSE pause
exit /b 0

:fail
echo.
echo The build failed. See the message above.
rmdir /s /q "%SRC%build" 2>nul
del /q "%SRC%build-info.json" 2>nul
if not defined NO_PAUSE pause
exit /b 1

rem Looks for a Python that really works (the Microsoft Store shortcut does not count)
:find_python
set "PY="
py -3 -c "import sys, venv" >nul 2>nul && set "PY=py -3"
if defined PY exit /b 0
python -c "import sys, venv" >nul 2>nul && set "PY=python"
if defined PY exit /b 0
for %%P in (
    "%LOCALAPPDATA%\Programs\Python\Python314\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    "%ProgramFiles%\Python314\python.exe"
    "%ProgramFiles%\Python313\python.exe"
    "%ProgramFiles%\Python312\python.exe"
    "%ProgramFiles%\Python311\python.exe"
    "%ProgramFiles%\Python310\python.exe"
    "C:\Python314\python.exe"
    "C:\Python313\python.exe"
    "C:\Python312\python.exe"
    "C:\Python311\python.exe"
    "C:\Python310\python.exe"
) do if not defined PY if exist %%P %%P -c "import sys, venv" >nul 2>nul && set PY=%%P
exit /b 0

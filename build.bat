@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "SRC=%~dp0"

rem Modo: sem parametro = mantem os dados | "clean"/"limpo" = versao limpa de arquivo unico
set "MODO=%~1"
title Compilando o SA Map Studio
set "OUT=%~dp0compiled\SA Map Studio"
set "BASE=%OUT%\sa-map-studio"
set "STAGE=%SRC%build\staging\sa-map-studio"

if /i "%MODO%"=="clean" set "MODO=clean"
if /i "%MODO%"=="limpo" set "MODO=clean"

echo ============================================================
if /i "%MODO%"=="clean" (
echo  Compilando o SA Map Studio - VERSAO LIMPA (ARQUIVO UNICO)
echo  Resultado: compiled\SA Map Studio\SA Map Studio.exe
echo  (A pasta sa-map-studio fica compactada dentro do executavel)
) else (
echo  Compilando o SA Map Studio - VERSAO NORMAL
echo  Resultado: compiled\SA Map Studio\SA Map Studio.exe
)
echo ============================================================

set "VENV_DIR=%SRC%compile-sources\.venv-build"
set "VPY=%VENV_DIR%\Scripts\python.exe"

rem Se houver um venv antigo na raiz, move para compile-sources ou remove
if exist "%SRC%.venv-build" (
    if not exist "%VENV_DIR%" (
        move "%SRC%.venv-build" "%VENV_DIR%" >nul 2>nul
    ) else (
        rmdir /s /q "%SRC%.venv-build" 2>nul
    )
)

rem Se o venv existir mas estiver corrompido ou apontando para Python inexistente de outra maquina, recria
if exist "%VPY%" (
    "%VPY%" -c "import sys" >nul 2>nul
    if errorlevel 1 (
        echo Ambiente de compilacao existente esta corrompido. Recriando...
        rmdir /s /q "%VENV_DIR%" 2>nul
    )
)

rem Ambiente separado so para a compilacao (nao mexe no seu Python)
if not exist "%VPY%" (
    echo Procurando instalacao funcional do Python...
    set "PY="
    py -3 -c "import sys" >nul 2>nul && set "PY=py -3"
    if not defined PY (
        python -c "import sys" >nul 2>nul && set "PY=python"
    )
    if not defined PY (
        for %%P in (
            "%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
            "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
            "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
            "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
            "C:\Python313\python.exe"
            "C:\Python312\python.exe"
            "C:\Python311\python.exe"
            "C:\Python310\python.exe"
            "C:\Program Files\Python313\python.exe"
            "C:\Program Files\Python312\python.exe"
            "C:\Program Files\Python311\python.exe"
            "C:\Program Files\Python310\python.exe"
        ) do (
            if not defined PY if exist %%P (
                %%P -c "import sys" >nul 2>nul && set "PY=%%P"
            )
        )
    )
    if not defined PY (
        echo ERRO: Nenhuma instalacao funcional do Python foi encontrada!
        echo Instale o Python para poder compilar o executavel.
        goto erro
    )
    echo Criando ambiente de compilacao com: %PY%...
    if not exist "%SRC%compile-sources" mkdir "%SRC%compile-sources"
    %PY% -m venv "%VENV_DIR%"
    if errorlevel 1 goto erro
)

echo Atualizando pip, PyInstaller e pywebview para as versoes mais recentes...
"%VPY%" -m pip install --upgrade --quiet pip
if errorlevel 1 goto erro
"%VPY%" -m pip install --upgrade --quiet pyinstaller
if errorlevel 1 goto erro
"%VPY%" -m pip install --upgrade --quiet pywebview
if errorlevel 1 echo Aviso: o pywebview nao instalou. O programa vai abrir no navegador.

echo Fechando o SA Map Studio, se estiver aberto...
taskkill /im "SA Map Studio.exe" /f >nul 2>nul
taskkill /im "sa-map-studio.exe" /f >nul 2>nul
taskkill /im "SA Map Studio.exe" /f >nul 2>nul
taskkill /im "sa-map-studio.exe" /f >nul 2>nul
powershell -NoProfile -Command "Stop-Process -Name 'SA Map Studio' -Force -ErrorAction SilentlyContinue" >nul 2>nul
powershell -NoProfile -Command "Stop-Process -Name 'sa-map-studio' -Force -ErrorAction SilentlyContinue" >nul 2>nul
taskkill /im "omp-server.exe" /f >nul 2>nul
taskkill /im "samp-server.exe" /f >nul 2>nul
ping 127.0.0.1 -n 3 >nul

rem Data e hora desta compilacao (aparece em "Novidades" dentro do programa)
for /f "usebackq delims=" %%T in (`powershell -NoProfile -Command "Get-Date -Format 'dd/MM/yyyy HH:mm:ss'"`) do set "BUILDTIME=%%T"
> "build-info.json" echo {"builtAt": "%BUILDTIME%"}

rem Prepara a estrutura temporaria de staging
if exist "build" rmdir /s /q "build"
if not exist "%STAGE%\system" mkdir "%STAGE%\system"
if not exist "%STAGE%\projects" mkdir "%STAGE%\projects"
if not exist "%STAGE%\exported" mkdir "%STAGE%\exported"
if not exist "%STAGE%\data\cache" mkdir "%STAGE%\data\cache"
if not exist "%STAGE%\test-server" mkdir "%STAGE%\test-server"

set "ICONFILE=%SRC%icon.ico"
set "VERFILE=%SRC%compile-sources\version_info.txt"

rem ---------------- 1. Compila o Motor do Sistema (sa-map-studio.exe)
echo Compilando o motor do sistema...
set "ARGS=--noconfirm --clean --onedir --windowed --noupx"
set "ARGS=%ARGS% --name "sa-map-studio" --icon "%ICONFILE%""
set "ARGS=%ARGS% --uac-admin"
if exist "%VERFILE%" set "ARGS=%ARGS% --version-file "%VERFILE%""
set "ARGS=%ARGS% --distpath "%SRC%build\engine" --workpath "%SRC%build\tmp_engine" --specpath "%SRC%build""
set "ARGS=%ARGS% --add-data "%SRC%index.html;." --add-data "%SRC%favicon.svg;.""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\css;css""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\js;js""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\fonts;fonts""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\anim-list.json;.""
set "ARGS=%ARGS% --add-data "%SRC%compile-sources\models;models""
set "ARGS=%ARGS% --add-data "%SRC%build-info.json;.""

"%VPY%" -m PyInstaller %ARGS% "%SRC%serve.py"
if errorlevel 1 goto erro

echo Copiando motor para o staging...
robocopy "%SRC%build\engine\sa-map-studio" "%STAGE%\system" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto erro
if exist "%STAGE%\system\webview\lib\pywebview-android.jar" del /q "%STAGE%\system\webview\lib\pywebview-android.jar" 2>nul
if exist "%STAGE%\system\pythonnet\runtime\Python.Runtime.xml" del /q "%STAGE%\system\pythonnet\runtime\Python.Runtime.xml" 2>nul

rem ---------------- 2. test-server
set "ST=%STAGE%\test-server"
if not exist "%ST%\gamemodes" mkdir "%ST%\gamemodes"
if not exist "%ST%\scriptfiles\samapstudio" mkdir "%ST%\scriptfiles\samapstudio"

if exist "omp-server-source\pawno\pawncc.exe" (
    echo Compilando gamemode samapstudio.pwn...
    "omp-server-source\pawno\pawncc.exe" "%SRC%compile-sources\samapstudio.pwn" -o"%SRC%compile-sources\samapstudio.amx" -i"omp-server-source\pawno\include" -d3 -Z+ >nul
    if exist "%SRC%compile-sources\samapstudio.amx" copy /y "%SRC%compile-sources\samapstudio.amx" "omp-server-source\gamemodes\samapstudio.amx" >nul
)

if exist "%SRC%compile-sources\samapstudio.amx" copy /y "%SRC%compile-sources\samapstudio.amx" "%ST%\gamemodes\samapstudio.amx" >nul
if exist "%SRC%compile-sources\samapstudio.pwn" copy /y "%SRC%compile-sources\samapstudio.pwn" "%ST%\gamemodes\samapstudio.pwn" >nul
del /q "%ST%\LEIA-ME.txt" 2>nul

set "SRVSRC="
if exist "omp-server-source\omp-server.exe" set "SRVSRC=omp-server-source"
if not defined SRVSRC if exist "%BASE%\test-server\omp-server.exe" set "SRVSRC=%BASE%\test-server"
if not defined SRVSRC if exist "%BASE%\test-server\samp-server.exe" set "SRVSRC=%BASE%\test-server"
if defined SRVSRC (
    echo Copiando o servidor de teste de: "%SRVSRC%"
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
        echo maxplayers 8
        echo port 7777
        echo hostname SA Map Studio - teste
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

rem ---------------- 3. Miniaturas e Dados do Catalogo
set "THUMBSRC="
if exist "%SRC%compile-sources\cache\thumbnails\objects" set "THUMBSRC=%SRC%compile-sources\cache\thumbnails"
if not defined THUMBSRC if exist "%SRC%compile-sources\cache\miniaturas\objetos" set "THUMBSRC=%SRC%compile-sources\cache\miniaturas"
if not defined THUMBSRC if exist "%BASE%\data\cache\thumbnails\objects" set "THUMBSRC=%BASE%\data\cache\thumbnails"
if defined THUMBSRC (
    echo Copiando miniaturas do catalogo de: "%THUMBSRC%"...
    if not exist "%STAGE%\data\cache\thumbnails" mkdir "%STAGE%\data\cache\thumbnails"
    robocopy "%THUMBSRC%" "%STAGE%\data\cache\thumbnails" /E /NFL /NDL /NJH /NJS /NP /R:1 /W:1 >nul
)

set "TEXSRC="
if exist "%SRC%compile-sources\cache\textures.json" set "TEXSRC=%SRC%compile-sources\cache\textures.json"
if not defined TEXSRC if exist "%SRC%compile-sources\cache\texturas.json" set "TEXSRC=%SRC%compile-sources\cache\texturas.json"
if not defined TEXSRC if exist "%BASE%\data\cache\textures.json" set "TEXSRC=%BASE%\data\cache\textures.json"
if defined TEXSRC (
    copy /y "%TEXSRC%" "%STAGE%\data\cache\textures.json" >nul
)

set "SPRITESRC="
if exist "%SRC%compile-sources\cache\sprites" set "SPRITESRC=%SRC%compile-sources\cache\sprites"
if not defined SPRITESRC if exist "%BASE%\data\cache\sprites" set "SPRITESRC=%BASE%\data\cache\sprites"
if defined SPRITESRC (
    echo Copiando sprites de: "%SPRITESRC%"...
    if not exist "%STAGE%\data\cache\sprites" mkdir "%STAGE%\data\cache\sprites"
    robocopy "%SPRITESRC%" "%STAGE%\data\cache\sprites" /E /NFL /NDL /NJH /NJS /NP /R:1 /W:1 >nul
)

set "SKINSRC="
if exist "%SRC%compile-sources\cache\skins" set "SKINSRC=%SRC%compile-sources\cache\skins"
if not defined SKINSRC if exist "%BASE%\data\cache\skins" set "SKINSRC=%BASE%\data\cache\skins"
if defined SKINSRC (
    echo Copiando skins de: "%SKINSRC%"...
    if not exist "%STAGE%\data\cache\skins" mkdir "%STAGE%\data\cache\skins"
    robocopy "%SKINSRC%" "%STAGE%\data\cache\skins" /E /NFL /NDL /NJH /NJS /NP /R:1 /W:1 >nul
)

set "ANIMSRC="
if exist "%SRC%compile-sources\cache\animations" set "ANIMSRC=%SRC%compile-sources\cache\animations"
if not defined ANIMSRC if exist "%BASE%\data\cache\animations" set "ANIMSRC=%BASE%\data\cache\animations"
if defined ANIMSRC (
    echo Copiando animacoes do catalogo de: "%ANIMSRC%"...
    if not exist "%STAGE%\data\cache\animations" mkdir "%STAGE%\data\cache\animations"
    robocopy "%ANIMSRC%" "%STAGE%\data\cache\animations" /E /NFL /NDL /NJH /NJS /NP /R:1 /W:1 >nul
)

set "MAPICONSRC="
if exist "%SRC%compile-sources\cache\mapicons" set "MAPICONSRC=%SRC%compile-sources\cache\mapicons"
if not defined MAPICONSRC if exist "%BASE%\data\cache\mapicons" set "MAPICONSRC=%BASE%\data\cache\mapicons"
if defined MAPICONSRC (
    echo Copiando mapicons de: "%MAPICONSRC%"...
    if not exist "%STAGE%\data\cache\mapicons" mkdir "%STAGE%\data\cache\mapicons"
    robocopy "%MAPICONSRC%" "%STAGE%\data\cache\mapicons" /E /NFL /NDL /NJH /NJS /NP /R:1 /W:1 >nul
)

set "RADARSRC="
if exist "%SRC%compile-sources\cache\radarmap.png" set "RADARSRC=%SRC%compile-sources\cache\radarmap.png"
if not defined RADARSRC if exist "%BASE%\data\cache\radarmap.png" set "RADARSRC=%BASE%\data\cache\radarmap.png"
if defined RADARSRC (
    copy /y "%RADARSRC%" "%STAGE%\data\cache\radarmap.png" >nul
)

set "SOUNDSRC="
if exist "%SRC%compile-sources\cache\sounds" set "SOUNDSRC=%SRC%compile-sources\cache\sounds"
if not defined SOUNDSRC if exist "%BASE%\data\cache\sounds" set "SOUNDSRC=%BASE%\data\cache\sounds"
if defined SOUNDSRC (
    if not exist "%STAGE%\data\cache\sounds" mkdir "%STAGE%\data\cache\sounds"
    robocopy "%SOUNDSRC%" "%STAGE%\data\cache\sounds" /E /NFL /NDL /NJH /NJS /NP /R:1 /W:1 >nul
)

rem Remove qualquer arquivo solto indesejado no staging
del /q /s "%STAGE%\*.pdb" 2>nul
del /q /s "%STAGE%\*.dmp" 2>nul
del /q /s "%STAGE%\*LEIA-ME*" 2>nul

rem ---------------- 4. Compacta o Pacote sa-map-studio.zip
echo Compactando pacote sa-map-studio.zip...
"%VPY%" "%SRC%compile-sources\package_bundle.py" "%STAGE%" "%SRC%build\sa-map-studio.zip"
if errorlevel 1 goto erro

rem ---------------- 5. Compila o Launcher Auto-Extrator (SA Map Studio.exe)
echo Gerando o executavel unico SA Map Studio.exe...
set "LAUNCHER_ARGS=--noconfirm --clean --onefile --windowed --noupx --uac-admin"
set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --name "SA Map Studio" --icon "%ICONFILE%""
if exist "%VERFILE%" set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --version-file "%VERFILE%""
set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --distpath "%OUT%" --workpath "%SRC%build\tmp_launcher" --specpath "%SRC%build""
set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --add-data "%SRC%build\sa-map-studio.zip;.""
set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --add-data "%ICONFILE%;.""
if exist "%SRC%compile-sources\launcher_frames" set "LAUNCHER_ARGS=%LAUNCHER_ARGS% --add-data "%SRC%compile-sources\launcher_frames;launcher_frames""
"%VPY%" -m PyInstaller %LAUNCHER_ARGS% "%SRC%compile-sources\launcher.py"
if errorlevel 1 goto erro

rem ---------------- 6. Tratamento do Modo Limpo vs Normal
if /i "%MODO%"=="clean" (
    rem Na versao limpa, mantem rigorosamente SOMENTE o executavel unico
    if exist "%BASE%" rmdir /s /q "%BASE%" 2>nul
    echo Versao limpa configurada: a pasta sa-map-studio sera criada na primeira execucao.
) else (
    rem No modo normal, se a pasta de desenvolvimento ja existir, atualiza o motor
    if exist "%BASE%\system" robocopy "%STAGE%\system" "%BASE%\system" /MIR /NFL /NDL /NJH /NJS /NP >nul
    if exist "%BASE%\test-server\gamemodes" copy /y "%STAGE%\test-server\gamemodes\*.*" "%BASE%\test-server\gamemodes\" >nul
)

del /q "%OUT%\LEIA-ME.txt" 2>nul
del /q "%OUT%\*.txt" 2>nul
if exist "%BASE%\LEIA-ME.txt" del /q "%BASE%\LEIA-ME.txt" 2>nul

rem Limpa pastas temporarias de build
rmdir /s /q "%SRC%build" 2>nul
del /q "%SRC%build-info.json" 2>nul
del /q "%SRC%sa-map-studio.spec" 2>nul
del /q "%SRC%SA Map Studio.spec" 2>nul
del /q "%SRC%mini_launcher.spec" 2>nul 2>nul
if exist "%SRC%__pycache__" rmdir /s /q "%SRC%__pycache__" 2>nul

echo.
echo ============================================================
echo  Pronto! Executavel unico gerado com sucesso:
echo    %OUT%\SA Map Studio.exe
echo.
if /i "%MODO%"=="clean" (
echo  Versao limpa de arquivo unico: para compartilhar ou mover o programa,
echo  basta copiar somente o 'SA Map Studio.exe'.
echo  Ao abrir pela primeira vez, ele criara a pasta sa-map-studio com tudo dentro.
) else (
echo    projects\, exported\, data\ - seus mapas e configuracoes locais ^(mantidos^)
)
if not defined NO_PAUSE pause
exit /b 0

:erro
echo.
echo A compilacao falhou. Veja a mensagem acima.
rmdir /s /q "%SRC%build" 2>nul
del /q "%SRC%build-info.json" 2>nul
if not defined NO_PAUSE pause
exit /b 1

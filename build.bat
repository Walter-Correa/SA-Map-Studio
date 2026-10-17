@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "SRC=%~dp0"

rem Modo: sem parametro = mantem os dados | "limpo" = remove dados de usuario antigos
set "MODO=%~1"
title Compilando o SA Map Studio
set "OUT=%~dp0compiled\SA Map Studio"
set "BASE=%OUT%\sa-map-studio"
set "DADOS=%BASE%"

if /i "%MODO%"=="clean" set "MODO=clean"
if /i "%MODO%"=="limpo" set "MODO=clean"

echo ============================================================
if /i "%MODO%"=="clean" (
echo  Compilando o SA Map Studio - VERSAO LIMPA
echo  Resultado: compiled\SA Map Studio\  ^(sem projetos ou dados antigos^)
) else (
echo  Compilando o SA Map Studio - VERSAO NORMAL
echo  Resultado: compiled\SA Map Studio\  ^(seus projetos e dados sao mantidos^)
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
    if not defined PY if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" (
        "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -c "import sys" >nul 2>nul && set "PY="%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe""
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
taskkill /im "SA Map Studio.exe" /f >nul 2>nul
taskkill /im "sa-map-studio.exe" /f >nul 2>nul
powershell -NoProfile -Command "Stop-Process -Name 'SA Map Studio' -Force -ErrorAction SilentlyContinue" >nul 2>nul
powershell -NoProfile -Command "Stop-Process -Name 'SA Map Studio' -Force -ErrorAction SilentlyContinue" >nul 2>nul
powershell -NoProfile -Command "Stop-Process -Name 'sa-map-studio' -Force -ErrorAction SilentlyContinue" >nul 2>nul
taskkill /im "omp-server.exe" /f >nul 2>nul
taskkill /im "samp-server.exe" /f >nul 2>nul
ping 127.0.0.1 -n 3 >nul

rem Data e hora desta compilacao (aparece em "Novidades" dentro do programa)
for /f "usebackq delims=" %%T in (`powershell -NoProfile -Command "Get-Date -Format 'dd/MM/yyyy HH:mm:ss'"`) do set "BUILDTIME=%%T"
> "build-info.json" echo {"builtAt": "%BUILDTIME%"}

rem Compila numa pasta temporaria (assim projects, exported e data nunca sao apagados)
if exist "build" rmdir /s /q "build"
set "ARGS=--noconfirm --clean --onedir --windowed --contents-directory sa-map-studio\system"
set "ICONFILE=%SRC%compile-sources\icon.ico"
if not exist "%ICONFILE%" set "ICONFILE=%SRC%icon.ico"
set "ARGS=%ARGS% --name "SA Map Studio" --icon "%ICONFILE%""
rem Solicita privilegios de administrador ao abrir o executavel (UAC manifest)
set "ARGS=%ARGS% --uac-admin"
set "ARGS=%ARGS% --distpath "%SRC%build\saida" --workpath "%SRC%build\tmp" --specpath "%SRC%build""
set "ARGS=%ARGS% --add-data "%SRC%index.html;." --add-data "%SRC%favicon.svg;.""
if exist "%SRC%compile-sources\css" (
    set "ARGS=%ARGS% --add-data "%SRC%compile-sources\css;css""
) else if exist "%SRC%css" (
    set "ARGS=%ARGS% --add-data "%SRC%css;css""
)
if exist "%SRC%compile-sources\js" (
    set "ARGS=%ARGS% --add-data "%SRC%compile-sources\js;js""
) else if exist "%SRC%js" (
    set "ARGS=%ARGS% --add-data "%SRC%js;js""
)
if exist "%SRC%compile-sources\fonts" (
    set "ARGS=%ARGS% --add-data "%SRC%compile-sources\fonts;fonts""
) else if exist "%SRC%fonts" (
    set "ARGS=%ARGS% --add-data "%SRC%fonts;fonts""
)
if exist "%SRC%compile-sources\anim-list.json" (
    set "ARGS=%ARGS% --add-data "%SRC%compile-sources\anim-list.json;.""
) else if exist "%SRC%anim-list.json" (
    set "ARGS=%ARGS% --add-data "%SRC%anim-list.json;.""
) else if exist "%SRC%anim_list.json" (
    set "ARGS=%ARGS% --add-data "%SRC%anim_list.json;.""
)
if exist "%SRC%compile-sources\models" (
    set "ARGS=%ARGS% --add-data "%SRC%compile-sources\models;models""
) else if exist "%SRC%models" (
    set "ARGS=%ARGS% --add-data "%SRC%models;models""
)
set "ARGS=%ARGS% --add-data "%SRC%build-info.json;.""

rem Garante suporte a pasta de conteudo aninhada sa-map-studio\system no PyInstaller
"%VPY%" -c "import PyInstaller.building.api as a, inspect; p = inspect.getfile(a); s = open(p, 'r', encoding='utf-8').read(); s = s.replace('elif self.contents_directory == \"..\" or \"/\" in self.contents_directory or \"\\\\\" in self.contents_directory:', 'elif self.contents_directory == \"..\" or \"..\" in self.contents_directory:'); open(p, 'w', encoding='utf-8').write(s)"

echo Gerando o programa...
"%VPY%" -m PyInstaller %ARGS% "%SRC%serve.py"
if errorlevel 1 goto erro

rem A versao limpa limpa os dados de usuario antigos da pasta compilada
if /i "%MODO%"=="clean" if exist "%OUT%" (
    if exist "%BASE%\projects" rmdir /s /q "%BASE%\projects" 2>nul
    if exist "%BASE%\exported" rmdir /s /q "%BASE%\exported" 2>nul
    if exist "%BASE%\data\config.json" del /q "%BASE%\data\config.json" 2>nul
    if exist "%BASE%\data\browser" rmdir /s /q "%BASE%\data\browser" 2>nul
    if exist "%BASE%\data\logs" rmdir /s /q "%BASE%\data\logs" 2>nul
    if exist "%BASE%\data\cache\miniaturas" rmdir /s /q "%BASE%\data\cache\miniaturas" 2>nul
    if exist "%BASE%\data\cache\texturas.json" del /q "%BASE%\data\cache\texturas.json" 2>nul
    if exist "%BASE%\Projetos" rmdir /s /q "%BASE%\Projetos" 2>nul
    if exist "%BASE%\Exportados" rmdir /s /q "%BASE%\Exportados" 2>nul
    if exist "%BASE%\Dados" rmdir /s /q "%BASE%\Dados" 2>nul
    if exist "%BASE%\Servidor de Teste" rmdir /s /q "%BASE%\Servidor de Teste" 2>nul
    if exist "%BASE%\Sistema" rmdir /s /q "%BASE%\Sistema" 2>nul
)

rem Limpa qualquer arquivo solto em sa-map-studio (todos os arquivos internos pertencem a system)
for %%F in ("%BASE%\*.*") do del /q "%%F" 2>nul
if exist "%BASE%\_tcl_data" rmdir /s /q "%BASE%\_tcl_data" 2>nul
if exist "%BASE%\_tk_data" rmdir /s /q "%BASE%\_tk_data" 2>nul
if exist "%BASE%\clr_loader" rmdir /s /q "%BASE%\clr_loader" 2>nul
if exist "%BASE%\compile-sources" rmdir /s /q "%BASE%\compile-sources" 2>nul
if exist "%BASE%\system\compile-sources" rmdir /s /q "%BASE%\system\compile-sources" 2>nul
if exist "%BASE%\models" rmdir /s /q "%BASE%\models" 2>nul
if exist "%BASE%\css" rmdir /s /q "%BASE%\css" 2>nul
if exist "%BASE%\fonts" rmdir /s /q "%BASE%\fonts" 2>nul
if exist "%BASE%\js" rmdir /s /q "%BASE%\js" 2>nul
if exist "%BASE%\pythonnet" rmdir /s /q "%BASE%\pythonnet" 2>nul
if exist "%BASE%\setuptools" rmdir /s /q "%BASE%\setuptools" 2>nul
if exist "%BASE%\tcl8" rmdir /s /q "%BASE%\tcl8" 2>nul
if exist "%BASE%\webview" rmdir /s /q "%BASE%\webview" 2>nul

echo Copiando o programa...
if not exist "%OUT%" mkdir "%OUT%"
if not exist "%BASE%" mkdir "%BASE%"
if not exist "%BASE%\system" mkdir "%BASE%\system"
robocopy "build\saida\SA Map Studio\sa-map-studio\system" "%BASE%\system" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto erro
if exist "%BASE%\system\webview\lib\pywebview-android.jar" del /q "%BASE%\system\webview\lib\pywebview-android.jar" 2>nul
if exist "%BASE%\system\pythonnet\runtime\Python.Runtime.xml" del /q "%BASE%\system\pythonnet\runtime\Python.Runtime.xml" 2>nul
copy /y "build\saida\SA Map Studio\SA Map Studio.exe" "%OUT%\SA Map Studio.exe" >nul
if errorlevel 1 goto erro
del /q "%OUT%\LEIA-ME.txt" 2>nul
del /q "%BASE%\LEIA-ME.txt" 2>nul

rem ---------------- test-server (dentro da pasta sa-map-studio)
set "ST=%BASE%\test-server"
if not exist "%ST%\gamemodes" mkdir "%ST%\gamemodes"
if not exist "%ST%\scriptfiles\samapstudio" mkdir "%ST%\scriptfiles\samapstudio"

rem Compila o gamemode samapstudio.pwn se o compilador pawno existir
if exist "omp-server-source\pawno\pawncc.exe" (
    echo Compilando gamemode samapstudio.pwn...
    "omp-server-source\pawno\pawncc.exe" "%SRC%compile-sources\samapstudio.pwn" -o"%SRC%compile-sources\samapstudio.amx" -i"omp-server-source\pawno\include" -d3 -Z+ >nul
    if exist "%SRC%compile-sources\samapstudio.amx" copy /y "%SRC%compile-sources\samapstudio.amx" "omp-server-source\gamemodes\samapstudio.amx" >nul
)

if exist "%SRC%compile-sources\samapstudio.amx" copy /y "%SRC%compile-sources\samapstudio.amx" "%ST%\gamemodes\samapstudio.amx" >nul
if exist "%SRC%compile-sources\samapstudio.pwn" copy /y "%SRC%compile-sources\samapstudio.pwn" "%ST%\gamemodes\samapstudio.pwn" >nul
del /q "%ST%\LEIA-ME.txt" 2>nul

rem Arquivos do servidor: carregados da base omp-server-source
set "SRVSRC="
if exist "omp-server-source\omp-server.exe" set "SRVSRC=omp-server-source"
if not defined SRVSRC if exist "%BASE%\test-server\omp-server.exe" set "SRVSRC=%BASE%\test-server"
if not defined SRVSRC if exist "%BASE%\test-server\samp-server.exe" set "SRVSRC=%BASE%\test-server"
if not defined SRVSRC if exist "%OUT%\test-server\omp-server.exe" set "SRVSRC=%OUT%\test-server"
if not defined SRVSRC if exist "%OUT%\test-server\samp-server.exe" set "SRVSRC=%OUT%\test-server"
if not defined SRVSRC if exist "%BASE%\data\config.json" (
    for /f "usebackq delims=" %%S in (`powershell -NoProfile -Command "try { (Get-Content -Raw -LiteralPath '%BASE%\data\config.json' | ConvertFrom-Json).server_path } catch { }"`) do set "SRVSRC=%%S"
)
if not defined SRVSRC if exist "%OUT%\data\config.json" (
    for /f "usebackq delims=" %%S in (`powershell -NoProfile -Command "try { (Get-Content -Raw -LiteralPath '%OUT%\data\config.json' | ConvertFrom-Json).server_path } catch { }"`) do set "SRVSRC=%%S"
)
if defined SRVSRC if /i not "%SRVSRC%"=="%ST%" (
    echo Copiando o servidor de teste de: "%SRVSRC%"
    robocopy "%SRVSRC%" "%ST%" omp-server.exe samp-server.exe *.dll /NFL /NDL /NJH /NJS /NP >nul
    if exist "%SRVSRC%\components" robocopy "%SRVSRC%\components" "%ST%\components" /E /NFL /NDL /NJH /NJS /NP >nul
    if exist "%SRVSRC%\plugins" robocopy "%SRVSRC%\plugins" "%ST%\plugins" /E /NFL /NDL /NJH /NJS /NP >nul
)
if exist "omp-server-source\plugins" robocopy "omp-server-source\plugins" "%ST%\plugins" /E /NFL /NDL /NJH /NJS /NP >nul
rem Remove simbolos de depuracao (.pdb) e dumps desnecessarios para o servidor de teste
del /q /s "%ST%\components\*.pdb" 2>nul
del /q /s "%ST%\components\*.dmp" 2>nul
del /q /s "%ST%\plugins\*.pdb" 2>nul
del /q /s "%ST%\plugins\*.dmp" 2>nul
del /q /s "%ST%\*.pdb" 2>nul
del /q /s "%ST%\*.dmp" 2>nul
if not defined SRVSRC echo Aviso: nenhum servidor open.mp/SA-MP encontrado. Coloque os arquivos em "test-server".

rem Garante config.json, server.cfg e mapa.txt padrao no test-server
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

rem ---------------- Miniaturas do Catalogo
set "THUMBSRC="
if exist "%SRC%compile-sources\cache\thumbnails\objects" set "THUMBSRC=%SRC%compile-sources\cache\thumbnails"
if not defined THUMBSRC if exist "%SRC%compile-sources\cache\miniaturas\objetos" set "THUMBSRC=%SRC%compile-sources\cache\miniaturas"
if not defined THUMBSRC if exist "%BASE%\data\cache\thumbnails\objects" set "THUMBSRC=%BASE%\data\cache\thumbnails"
if not defined THUMBSRC if exist "%OUT%\data\cache\thumbnails\objects" set "THUMBSRC=%OUT%\data\cache\thumbnails"
if defined THUMBSRC (
    echo Copiando miniaturas do catalogo de: "%THUMBSRC%"...
    if not exist "%BASE%\data\cache\thumbnails" mkdir "%BASE%\data\cache\thumbnails"
    robocopy "%THUMBSRC%" "%BASE%\data\cache\thumbnails" /E /NFL /NDL /NJH /NJS /NP >nul
)

rem ---------------- Texturas do Catalogo
set "TEXSRC="
if exist "%SRC%compile-sources\cache\textures.json" set "TEXSRC=%SRC%compile-sources\cache\textures.json"
if not defined TEXSRC if exist "%SRC%compile-sources\cache\texturas.json" set "TEXSRC=%SRC%compile-sources\cache\texturas.json"
if not defined TEXSRC if exist "%BASE%\data\cache\textures.json" set "TEXSRC=%BASE%\data\cache\textures.json"
if not defined TEXSRC if exist "%OUT%\data\cache\textures.json" set "TEXSRC=%OUT%\data\cache\textures.json"
if defined TEXSRC (
    if not exist "%BASE%\data\cache" mkdir "%BASE%\data\cache"
    copy /y "%TEXSRC%" "%BASE%\data\cache\textures.json" >nul
)

rem ---------------- Sprites
set "SPRITESRC="
if exist "%SRC%compile-sources\cache\sprites" set "SPRITESRC=%SRC%compile-sources\cache\sprites"
if not defined SPRITESRC if exist "%BASE%\data\cache\sprites" set "SPRITESRC=%BASE%\data\cache\sprites"
if not defined SPRITESRC if exist "%OUT%\data\cache\sprites" set "SPRITESRC=%OUT%\data\cache\sprites"
if defined SPRITESRC (
    echo Copiando sprites de: "%SPRITESRC%"...
    if not exist "%BASE%\data\cache\sprites" mkdir "%BASE%\data\cache\sprites"
    robocopy "%SPRITESRC%" "%BASE%\data\cache\sprites" /E /NFL /NDL /NJH /NJS /NP >nul
)

rem ---------------- Skins
set "SKINSRC="
if exist "%SRC%compile-sources\cache\skins" set "SKINSRC=%SRC%compile-sources\cache\skins"
if not defined SKINSRC if exist "%BASE%\data\cache\skins" set "SKINSRC=%BASE%\data\cache\skins"
if not defined SKINSRC if exist "%OUT%\data\cache\skins" set "SKINSRC=%OUT%\data\cache\skins"
if defined SKINSRC (
    echo Copiando skins de: "%SKINSRC%"...
    if not exist "%BASE%\data\cache\skins" mkdir "%BASE%\data\cache\skins"
    robocopy "%SKINSRC%" "%BASE%\data\cache\skins" /E /NFL /NDL /NJH /NJS /NP >nul
)

rem ---------------- Radarmap
set "RADARSRC="
if exist "%SRC%compile-sources\cache\radarmap.png" set "RADARSRC=%SRC%compile-sources\cache\radarmap.png"
if not defined RADARSRC if exist "%BASE%\data\cache\radarmap.png" set "RADARSRC=%BASE%\data\cache\radarmap.png"
if not defined RADARSRC if exist "%OUT%\data\cache\radarmap.png" set "RADARSRC=%OUT%\data\cache\radarmap.png"
if defined RADARSRC (
    if not exist "%BASE%\data\cache" mkdir "%BASE%\data\cache"
    copy /y "%RADARSRC%" "%BASE%\data\cache\radarmap.png" >nul
)

rem ---------------- Modelos 3D
rem Modelos 3D (cj.dff, cj.txd) sao empacotados internamente dentro de system\models
if exist "%BASE%\models" rmdir /s /q "%BASE%\models" 2>nul
if exist "%BASE%\system\compile-sources" rmdir /s /q "%BASE%\system\compile-sources" 2>nul

rem Garante que na raiz de %OUT% existam SOMENTE o executavel e a pasta sa-map-studio
if exist "%OUT%\system" rmdir /s /q "%OUT%\system" 2>nul
if exist "%OUT%\test-server" rmdir /s /q "%OUT%\test-server" 2>nul
if exist "%OUT%\data" rmdir /s /q "%OUT%\data" 2>nul
if exist "%OUT%\models" rmdir /s /q "%OUT%\models" 2>nul
if exist "%OUT%\projects" rmdir /s /q "%OUT%\projects" 2>nul
if exist "%OUT%\exported" rmdir /s /q "%OUT%\exported" 2>nul
if exist "%OUT%\Projetos" rmdir /s /q "%OUT%\Projetos" 2>nul
if exist "%OUT%\Exportados" rmdir /s /q "%OUT%\Exportados" 2>nul
if exist "%OUT%\Dados" rmdir /s /q "%OUT%\Dados" 2>nul
if exist "%OUT%\Servidor de Teste" rmdir /s /q "%OUT%\Servidor de Teste" 2>nul
if exist "%OUT%\Sistema" rmdir /s /q "%OUT%\Sistema" 2>nul
for %%F in ("%BASE%\*.*") do del /q "%%F" 2>nul
del /q "%OUT%\LEIA-ME.txt" 2>nul
del /q "%OUT%\*.txt" 2>nul
del /q "%BASE%\LEIA-ME.txt" 2>nul
del /q "%BASE%\*.txt" 2>nul

rem Limpa pastas e logs da raiz do projeto para manter o repositorio perfeitamente limpo
if exist "%SRC%__pycache__" rmdir /s /q "%SRC%__pycache__" 2>nul
if exist "%SRC%projects" rmdir /s /q "%SRC%projects" 2>nul
if exist "%SRC%data" rmdir /s /q "%SRC%data" 2>nul
if exist "%SRC%sa-map-studio" rmdir /s /q "%SRC%sa-map-studio" 2>nul
if exist "%SRC%sa-map-studio.log" del /q "%SRC%sa-map-studio.log" 2>nul
if exist "%SRC%sa-map-studio.log" del /q "%SRC%sa-map-studio.log" 2>nul
if exist "%BASE%\data\logs\sa-map-studio.log" del /q "%BASE%\data\logs\sa-map-studio.log" 2>nul

rem Limpa pastas legadas se existirem
if exist "%~dp0compiled\sa-map-studio\" rmdir /s /q "%~dp0compiled\sa-map-studio" 2>nul
if exist "%~dp0compiled\SA Map Studio\" rmdir /s /q "%~dp0compiled\SA Map Studio" 2>nul
if exist "dist\" rmdir /s /q "dist" 2>nul
if exist "dist-limpo\" rmdir /s /q "dist-limpo" 2>nul
rmdir /s /q "build" 2>nul
del /q "build-info.json" 2>nul

echo.
echo ============================================================
echo  Pronto! Pasta do programa: %OUT%
echo    SA Map Studio.exe   - abra este
echo    sa-map-studio\      - pasta contendo data, exported, projects, test-server, system
if /i "%MODO%"=="clean" (
echo  Versao limpa: projects, exported e data sao criados vazios na
echo  primeira vez que o programa abrir. Pronta para enviar a outra pessoa.
) else (
echo    projects\, exported\, data\ - seus mapas e configuracoes ^(mantidos^)
)
explorer "%OUT%"
if not defined NO_PAUSE pause
exit /b 0

:erro
echo.
echo A compilacao falhou. Veja a mensagem acima.
del /q "build-info.json" 2>nul
if not defined NO_PAUSE pause
exit /b 1

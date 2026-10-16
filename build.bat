@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "SRC=%~dp0"

rem Modo: sem parametro = mantem os dados | "limpo" = remove dados de usuario antigos
set "MODO=%~1"
title Compilando o SA Map Studio
set "OUT=%~dp0compiled\SA Map Studio"
set "DADOS=%~dp0compiled\SA Map Studio"

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
set "ARGS=--noconfirm --clean --onedir --windowed --contents-directory system"
set "ICONFILE=%SRC%compile-sources\icon.ico"
if not exist "%ICONFILE%" set "ICONFILE=%SRC%icon.ico"
set "ARGS=%ARGS% --name "SA Map Studio" --icon "%ICONFILE%""
rem Solicita privilegios de administrador ao abrir o executavel (UAC manifest)
set "ARGS=%ARGS% --uac-admin"
set "ARGS=%ARGS% --distpath "%SRC%build\saida" --workpath "%SRC%build\tmp" --specpath "%SRC%build""
set "ARGS=%ARGS% --add-data "%SRC%index.html;." --add-data "%SRC%favicon.svg;.""
set "ARGS=%ARGS% --add-data "%SRC%css;css" --add-data "%SRC%js;js" --add-data "%SRC%fonts;fonts""
if exist "%SRC%compile-sources\anim-list.json" (
    set "ARGS=%ARGS% --add-data "%SRC%compile-sources\anim-list.json;.""
    set "ARGS=%ARGS% --add-data "%SRC%compile-sources\anim-list.json;compile-sources""
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
if exist "%SRC%compile-sources\samapstudio.amx" (
    set "ARGS=%ARGS% --add-data "%SRC%compile-sources\samapstudio.amx;compile-sources""
)
if exist "%SRC%compile-sources\samapstudio.pwn" (
    set "ARGS=%ARGS% --add-data "%SRC%compile-sources\samapstudio.pwn;compile-sources""
)
set "ARGS=%ARGS% --add-data "%SRC%build-info.json;.""

echo Gerando o programa...
"%VPY%" -m PyInstaller %ARGS% "%SRC%serve.py"
if errorlevel 1 goto erro

rem A versao limpa limpa os dados de usuario antigos da pasta compilada
if /i "%MODO%"=="clean" if exist "%OUT%" (
    if exist "%OUT%\projects" rmdir /s /q "%OUT%\projects" 2>nul
    if exist "%OUT%\exported" rmdir /s /q "%OUT%\exported" 2>nul
    if exist "%OUT%\data\config.json" del /q "%OUT%\data\config.json" 2>nul
    if exist "%OUT%\data\browser" rmdir /s /q "%OUT%\data\browser" 2>nul
    if exist "%OUT%\data\logs" rmdir /s /q "%OUT%\data\logs" 2>nul
    if exist "%OUT%\data\cache\miniaturas" rmdir /s /q "%OUT%\data\cache\miniaturas" 2>nul
    if exist "%OUT%\data\cache\texturas.json" del /q "%OUT%\data\cache\texturas.json" 2>nul
    if exist "%OUT%\Projetos" rmdir /s /q "%OUT%\Projetos" 2>nul
    if exist "%OUT%\Exportados" rmdir /s /q "%OUT%\Exportados" 2>nul
    if exist "%OUT%\Dados" rmdir /s /q "%OUT%\Dados" 2>nul
    if exist "%OUT%\Servidor de Teste" rmdir /s /q "%OUT%\Servidor de Teste" 2>nul
    if exist "%OUT%\Sistema" rmdir /s /q "%OUT%\Sistema" 2>nul
)

echo Copiando o programa...
if not exist "%OUT%" mkdir "%OUT%"
robocopy "build\saida\SA Map Studio\system" "%OUT%\system" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto erro
copy /y "build\saida\SA Map Studio\SA Map Studio.exe" "%OUT%\SA Map Studio.exe" >nul
if errorlevel 1 goto erro
del /q "%OUT%\LEIA-ME.txt" 2>nul

rem ---------------- test-server (dentro da pasta do programa)
set "ST=%OUT%\test-server"
if not exist "%ST%\gamemodes" mkdir "%ST%\gamemodes"
if not exist "%ST%\scriptfiles\samapstudio" mkdir "%ST%\scriptfiles\samapstudio"
if exist "%SRC%compile-sources\samapstudio.amx" copy /y "%SRC%compile-sources\samapstudio.amx" "%ST%\gamemodes\samapstudio.amx" >nul
if exist "%SRC%compile-sources\samapstudio.pwn" copy /y "%SRC%compile-sources\samapstudio.pwn" "%ST%\gamemodes\samapstudio.pwn" >nul
del /q "%ST%\LEIA-ME.txt" 2>nul

rem Arquivos do servidor: carregados da base omp-server-source
set "SRVSRC="
if exist "omp-server-source\omp-server.exe" set "SRVSRC=omp-server-source"
if not defined SRVSRC if exist "%DADOS%\test-server\omp-server.exe" set "SRVSRC=%DADOS%\test-server"
if not defined SRVSRC if exist "%DADOS%\test-server\samp-server.exe" set "SRVSRC=%DADOS%\test-server"
if not defined SRVSRC if exist "%DADOS%\Servidor de Teste\omp-server.exe" set "SRVSRC=%DADOS%\Servidor de Teste"
if not defined SRVSRC if exist "%DADOS%\data\config.json" (
    for /f "usebackq delims=" %%S in (`powershell -NoProfile -Command "try { (Get-Content -Raw -LiteralPath '%DADOS%\data\config.json' | ConvertFrom-Json).server_path } catch { }"`) do set "SRVSRC=%%S"
)
if not defined SRVSRC if exist "%DADOS%\Dados\config.json" (
    for /f "usebackq delims=" %%S in (`powershell -NoProfile -Command "try { (Get-Content -Raw -LiteralPath '%DADOS%\Dados\config.json' | ConvertFrom-Json).server_path } catch { }"`) do set "SRVSRC=%%S"
)
if defined SRVSRC if /i not "%SRVSRC%"=="%ST%" (
    echo Copiando o servidor de teste de: "%SRVSRC%"
    robocopy "%SRVSRC%" "%ST%" omp-server.exe samp-server.exe *.dll /NFL /NDL /NJH /NJS /NP >nul
    if exist "%SRVSRC%\components" robocopy "%SRVSRC%\components" "%ST%\components" /E /NFL /NDL /NJH /NJS /NP >nul
    if exist "%SRVSRC%\plugins" robocopy "%SRVSRC%\plugins" "%ST%\plugins" /E /NFL /NDL /NJH /NJS /NP >nul
)
if exist "omp-server-source\plugins" robocopy "omp-server-source\plugins" "%ST%\plugins" /E /NFL /NDL /NJH /NJS /NP >nul
if not defined SRVSRC echo Aviso: nenhum servidor open.mp/SA-MP encontrado. Coloque os arquivos em "test-server".

rem ---------------- Miniaturas do Catalogo (leitura de compile-sources\cache\thumbnails ou data\cache\thumbnails)
set "THUMBSRC="
if exist "%SRC%compile-sources\cache\thumbnails\objects" set "THUMBSRC=%SRC%compile-sources\cache\thumbnails"
if not defined THUMBSRC if exist "%SRC%compile-sources\cache\miniaturas\objetos" set "THUMBSRC=%SRC%compile-sources\cache\miniaturas"
if not defined THUMBSRC if exist "%OUT%\data\cache\thumbnails\objects" set "THUMBSRC=%OUT%\data\cache\thumbnails"
if not defined THUMBSRC if exist "%OUT%\data\cache\miniaturas\objetos" set "THUMBSRC=%OUT%\data\cache\miniaturas"
if not defined THUMBSRC if exist "%OUT%\Dados\cache\miniaturas\objetos" set "THUMBSRC=%OUT%\Dados\cache\miniaturas"
if defined THUMBSRC (
    echo Copiando miniaturas do catalogo de: "%THUMBSRC%"...
    if not exist "%OUT%\data\cache\thumbnails" mkdir "%OUT%\data\cache\thumbnails"
    robocopy "%THUMBSRC%" "%OUT%\data\cache\thumbnails" /E /NFL /NDL /NJH /NJS /NP >nul
)

rem ---------------- Texturas do Catalogo
set "TEXSRC="
if exist "%SRC%compile-sources\cache\textures.json" set "TEXSRC=%SRC%compile-sources\cache\textures.json"
if not defined TEXSRC if exist "%SRC%compile-sources\cache\texturas.json" set "TEXSRC=%SRC%compile-sources\cache\texturas.json"
if defined TEXSRC (
    if not exist "%OUT%\data\cache" mkdir "%OUT%\data\cache"
    copy /y "%TEXSRC%" "%OUT%\data\cache\textures.json" >nul
)

rem ---------------- Sprites
set "SPRITESRC="
if exist "%SRC%compile-sources\cache\sprites" set "SPRITESRC=%SRC%compile-sources\cache\sprites"
if not defined SPRITESRC if exist "%OUT%\data\cache\sprites" set "SPRITESRC=%OUT%\data\cache\sprites"
if not defined SPRITESRC if exist "%OUT%\Dados\cache\sprites" set "SPRITESRC=%OUT%\Dados\cache\sprites"
if defined SPRITESRC (
    echo Copiando sprites de: "%SPRITESRC%"...
    if not exist "%OUT%\data\cache\sprites" mkdir "%OUT%\data\cache\sprites"
    robocopy "%SPRITESRC%" "%OUT%\data\cache\sprites" /E /NFL /NDL /NJH /NJS /NP >nul
)

rem ---------------- Skins
set "SKINSRC="
if exist "%SRC%compile-sources\cache\skins" set "SKINSRC=%SRC%compile-sources\cache\skins"
if not defined SKINSRC if exist "%OUT%\data\cache\skins" set "SKINSRC=%OUT%\data\cache\skins"
if not defined SKINSRC if exist "%OUT%\Dados\cache\skins" set "SKINSRC=%OUT%\Dados\cache\skins"
if defined SKINSRC (
    echo Copiando skins de: "%SKINSRC%"...
    if not exist "%OUT%\data\cache\skins" mkdir "%OUT%\data\cache\skins"
    robocopy "%SKINSRC%" "%OUT%\data\cache\skins" /E /NFL /NDL /NJH /NJS /NP >nul
)

rem ---------------- Radarmap
set "RADARSRC="
if exist "%SRC%compile-sources\cache\radarmap.png" set "RADARSRC=%SRC%compile-sources\cache\radarmap.png"
if not defined RADARSRC if exist "%OUT%\data\cache\radarmap.png" set "RADARSRC=%OUT%\data\cache\radarmap.png"
if not defined RADARSRC if exist "%OUT%\Dados\cache\radarmap.png" set "RADARSRC=%OUT%\Dados\cache\radarmap.png"
if defined RADARSRC (
    if not exist "%OUT%\data\cache" mkdir "%OUT%\data\cache"
    copy /y "%RADARSRC%" "%OUT%\data\cache\radarmap.png" >nul
)

rem ---------------- Modelos 3D
set "MODELSRC="
if exist "%SRC%compile-sources\models" set "MODELSRC=%SRC%compile-sources\models"
if not defined MODELSRC if exist "%SRC%models" set "MODELSRC=%SRC%models"
if not defined MODELSRC if exist "%OUT%\models" set "MODELSRC=%OUT%\models"
if defined MODELSRC (
    echo Copiando modelos de: "%MODELSRC%"...
    if not exist "%OUT%\models" mkdir "%OUT%\models"
    robocopy "%MODELSRC%" "%OUT%\models" /E /NFL /NDL /NJH /NJS /NP >nul
)

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
echo    test-server\        - servidor do "Testar no jogo"
echo    system\             - arquivos do programa (nao mexa)
if /i "%MODO%"=="clean" (
echo  Versao limpa: projects, exported e data sao criados vazios na
echo  primeira vez que o programa abrir. Pronta para enviar a outra pessoa.
) else (
echo    projects\, exported\, data\ - seus mapas e configuracoes ^(mantidos^)
)
echo ============================================================
explorer "%OUT%"
pause
exit /b 0

:erro
echo.
echo A compilacao falhou. Veja a mensagem acima.
del /q "build-info.json" 2>nul
pause
exit /b 1

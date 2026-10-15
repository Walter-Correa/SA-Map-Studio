@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "SRC=%~dp0"

rem Modo: sem parametro = mantem os dados | "limpo" = pasta nova, sem nenhum dado
set "MODO=%~1"
if /i "%MODO%"=="limpo" (
    title Compilando o SA Map Studio - versao limpa
    set "OUT=%~dp0dist-limpo\SA Map Studio"
) else (
    title Compilando o SA Map Studio
    set "OUT=%~dp0dist\SA Map Studio"
)
set "DADOS=%~dp0dist\SA Map Studio"

echo ============================================================
if /i "%MODO%"=="limpo" (
echo  Compilando o SA Map Studio - VERSAO LIMPA
echo  Resultado: dist-limpo\SA Map Studio\  ^(sem projetos, cache ou configuracao^)
) else (
echo  Compilando o SA Map Studio
echo  Resultado: dist\SA Map Studio\  ^(seus projetos e dados sao mantidos^)
)
echo ============================================================

rem Usa o lancador "py" se existir; senao, o "python" do PATH
set "PY=python"
where py >nul 2>nul && set "PY=py -3"

rem Ambiente separado so para a compilacao (nao mexe no seu Python)
if not exist ".venv-build\Scripts\python.exe" (
    echo Criando ambiente de compilacao...
    %PY% -m venv .venv-build
    if errorlevel 1 goto erro
)
set "VPY=.venv-build\Scripts\python.exe"

echo Atualizando pip, PyInstaller e pywebview para as versoes mais recentes...
"%VPY%" -m pip install --upgrade --quiet pip
if errorlevel 1 goto erro
"%VPY%" -m pip install --upgrade --quiet pyinstaller
if errorlevel 1 goto erro
"%VPY%" -m pip install --upgrade --quiet pywebview
if errorlevel 1 echo Aviso: o pywebview nao instalou. O programa vai abrir no navegador.

echo Fechando o SA Map Studio, se estiver aberto...
taskkill /im "SA Map Studio.exe" /f >nul 2>nul
taskkill /im "omp-server.exe" /f >nul 2>nul
taskkill /im "samp-server.exe" /f >nul 2>nul
timeout /t 2 /nobreak >nul

rem Data e hora desta compilacao (aparece em "Novidades" dentro do programa)
for /f "usebackq delims=" %%T in (`powershell -NoProfile -Command "Get-Date -Format 'dd/MM/yyyy HH:mm:ss'"`) do set "BUILDTIME=%%T"
> "build-info.json" echo {"builtAt": "%BUILDTIME%"}

rem Compila numa pasta temporaria (assim Projetos, Exportados e Dados nunca sao apagados)
if exist "build" rmdir /s /q "build"
set "ARGS=--noconfirm --clean --onedir --windowed --contents-directory Sistema"
set "ARGS=%ARGS% --name "SA Map Studio" --icon "%SRC%icon.ico""
set "ARGS=%ARGS% --distpath "%SRC%build\saida" --workpath "%SRC%build\tmp" --specpath "%SRC%build""
set "ARGS=%ARGS% --add-data "%SRC%index.html;." --add-data "%SRC%favicon.svg;." --add-data "%SRC%anim_list.json;.""
set "ARGS=%ARGS% --add-data "%SRC%css;css" --add-data "%SRC%js;js" --add-data "%SRC%fonts;fonts""
set "ARGS=%ARGS% --add-data "%SRC%servidor-teste;servidor-teste""
set "ARGS=%ARGS% --add-data "%SRC%build-info.json;.""

echo Gerando o programa...
"%VPY%" -m PyInstaller %ARGS% "%SRC%serve.py"
if errorlevel 1 goto erro

rem A versao limpa sempre comeca do zero
if /i "%MODO%"=="limpo" if exist "%OUT%" rmdir /s /q "%OUT%"

echo Copiando o programa...
if not exist "%OUT%" mkdir "%OUT%"
robocopy "build\saida\SA Map Studio\Sistema" "%OUT%\Sistema" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto erro
copy /y "build\saida\SA Map Studio\SA Map Studio.exe" "%OUT%\SA Map Studio.exe" >nul
if errorlevel 1 goto erro
copy /y "LEIA-ME.md" "%OUT%\LEIA-ME.txt" >nul

rem ---------------- Servidor de Teste (dentro da pasta do programa)
set "ST=%OUT%\Servidor de Teste"
if not exist "%ST%\gamemodes" mkdir "%ST%\gamemodes"
if not exist "%ST%\scriptfiles\samapstudio" mkdir "%ST%\scriptfiles\samapstudio"
copy /y "servidor-teste\samapstudio.amx" "%ST%\gamemodes\samapstudio.amx" >nul
copy /y "servidor-teste\samapstudio.pwn" "%ST%\gamemodes\samapstudio.pwn" >nul
> "%ST%\LEIA-ME.txt" echo Servidor usado pelo botao "Testar no jogo" do SA Map Studio.
>> "%ST%\LEIA-ME.txt" echo Coloque aqui os arquivos do open.mp server (omp-server.exe, as .dll e a pasta components)
>> "%ST%\LEIA-ME.txt" echo ou do SA-MP server (samp-server.exe). O editor cria o server.cfg e o mapa sozinho.

rem Arquivos do servidor: primeiro da pasta servidor-teste, senao os que ja estao na pasta do programa
set "SRVSRC="
if exist "servidor-teste\omp-server.exe" set "SRVSRC=servidor-teste"
if not defined SRVSRC if exist "%DADOS%\Servidor de Teste\omp-server.exe" set "SRVSRC=%DADOS%\Servidor de Teste"
if not defined SRVSRC if exist "%DADOS%\Servidor de Teste\samp-server.exe" set "SRVSRC=%DADOS%\Servidor de Teste"
if not defined SRVSRC if exist "%DADOS%\Dados\config.json" (
    for /f "usebackq delims=" %%S in (`powershell -NoProfile -Command "try { (Get-Content -Raw -LiteralPath '%DADOS%\Dados\config.json' | ConvertFrom-Json).server_path } catch { }"`) do set "SRVSRC=%%S"
)
if defined SRVSRC if /i not "%SRVSRC%"=="%ST%" (
    echo Copiando o servidor de teste de: "%SRVSRC%"
    robocopy "%SRVSRC%" "%ST%" omp-server.exe samp-server.exe *.dll /NFL /NDL /NJH /NJS /NP >nul
    if exist "%SRVSRC%\components" robocopy "%SRVSRC%\components" "%ST%\components" /E /NFL /NDL /NJH /NJS /NP >nul
)
rem Copia tambem para a raiz da dist (dist\Servidor de Teste) para garantir acesso em ambos os caminhos
if /i not "%MODO%"=="limpo" (
    set "STRoot=%~dp0dist\Servidor de Teste"
    robocopy "%ST%" "%STRoot%" /MIR /NFL /NDL /NJH /NJS /NP >nul
)
if not defined SRVSRC echo Aviso: nenhum servidor open.mp/SA-MP encontrado. Coloque os arquivos em "Servidor de Teste".

rem ---------------- So na versao normal: traz os dados da versao antiga (um .exe solto em dist)
if /i not "%MODO%"=="limpo" (
    for %%D in (projetos exportados cache dados-da-janela) do (
        if exist "dist\%%D\" (
            echo Movendo dist\%%D para a pasta do programa...
            robocopy "dist\%%D" "%OUT%\%%D" /E /MOVE /XO /NFL /NDL /NJH /NJS /NP >nul
            if exist "dist\%%D\" rmdir /s /q "dist\%%D" 2>nul
        )
    )
    for %%F in (config.json sa-map-studio.log) do (
        if exist "dist\%%F" if not exist "%OUT%\%%F" if not exist "%OUT%\Dados\%%F" move /y "dist\%%F" "%OUT%\%%F" >nul
    )
    if exist "dist\SA Map Studio.exe" del /q "dist\SA Map Studio.exe"
)
rmdir /s /q "build" 2>nul
del /q "build-info.json" 2>nul

echo.
echo ============================================================
echo  Pronto! Pasta do programa: %OUT%
echo    SA Map Studio.exe   - abra este
echo    Servidor de Teste\  - servidor do "Testar no jogo"
echo    Sistema\            - arquivos do programa (nao mexa)
if /i "%MODO%"=="limpo" (
echo  Versao limpa: Projetos, Exportados e Dados sao criados vazios na
echo  primeira vez que o programa abrir. Pronta para enviar a outra pessoa.
) else (
echo    Projetos\, Exportados\, Dados\ - seus mapas e configuracoes ^(mantidos^)
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

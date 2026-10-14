@echo off
rem Gera uma copia LIMPA do SA Map Studio (sem projetos, cache, miniaturas nem configuracao),
rem pronta para enviar a outra pessoa. Resultado: dist-limpo\SA Map Studio\
rem Os seus dados em dist\SA Map Studio\ nao sao tocados.
call "%~dp0Compilar EXE.bat" limpo

@echo off
rem Gera uma versao limpa do sa-map-studio (sem projetos ou dados antigos)
rem Resultado: compiled\sa-map-studio\
call "%~dp0build.bat" clean


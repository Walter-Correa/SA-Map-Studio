# Diretrizes do Projeto SA Map Studio

Este arquivo define diretrizes e regras contínuas que devem ser rigorosamente seguidas em todas as sessões e tarefas:

## 1. Compilação da Versão Final (Obrigatório)
- **Sempre compile a versão final** executando `build-clean.bat` ao final de cada tarefa/ciclo de alterações.
- A distribuição limpa gerada em `compiled\SA Map Studio\` deve sempre refletir com exatidão todos os arquivos atualizados (código-fonte, assets, modelos e scripts).

## 2. Controle de Versão (Git)
- **Sempre realizar commit e push ao final de cada tarefa**.
- Mensagens de commit devem ser claras, objetivas e em português.

## 3. Padrões de Nomenclatura, Interface e Conteúdo
- **Nome do Projeto e Nomenclatura**: O nome oficial do projeto é `SA Map Studio`, gerando o executável `SA Map Studio.exe` e a pasta de distribuição `compiled\SA Map Studio\`. Todas as pastas e arquivos internos de dados e sistema do projeto devem ser nomeados estritamente em inglês e letras minúsculas (sem português e sem letras maiúsculas), como `data`, `test-server`, `system`, `projects`, `exported`, `compile-sources`, `models`, `build.bat`, `build-clean.bat`, `start.bat`, `readme.md`, `gemini.md`.
- **Nomes curtos e objetivos**: Títulos, botões e labels da interface não devem estourar o espaço visual nem exibir reticências ("...").
- **Fontes e citações**: Nunca citar fontes externas em lugar nenhum da interface ou do projeto.
- **Janela inicial**: O editor deve abrir por padrão maximizado.
- **Formatação de Cores**: Cores de Textos 3D (Create3DTextLabel) devem usar alpha total (`0x...FF`, não `0x...AA`).
- **Codificação**: Os scripts pawn e arquivos de mapa do servidor de teste (como `samapstudio.pwn` e `mapa.txt`) devem ser escritos e salvos estritamente em ANSI (Windows-1252), padrão nativo do SA-MP/GTA SA para acentuação e caracteres sem corrupção. Os demais arquivos de código-fonte web/sistema (HTML, JS, CSS, Python) permanecem em UTF-8.

## 4. Arquivos e Compilação
- **Sem LEIA-ME.txt**: Nunca incluir o arquivo `LEIA-ME.txt` em lugar algum ao compilar o projeto (`build.bat` / `build-clean.bat`).
- **Organização e Pasta testing**: A pasta raiz do projeto deve permanecer sempre limpa e organizada, contendo apenas os arquivos e pastas estruturais do projeto. Todos os testes, scripts temporários e arquivos de verificação devem ser criados e executados exclusivamente dentro da pasta `testing/`.

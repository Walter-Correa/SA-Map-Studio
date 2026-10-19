# Diretrizes do Projeto SA Map Studio

Este arquivo define diretrizes e regras contínuas que devem ser rigorosamente seguidas em todas as sessões e tarefas:

## 1. Compilação da Versão Final (Obrigatório)
- **Sempre compile a versão final** executando `build-clean.bat` ao final de cada tarefa/ciclo de alterações.
- **Versão do executável**: a versão gravada no `.exe` vem sempre da `VERSION` do `serve.py` (o `build.bat` roda `compile-sources/sync_version.py` antes do PyInstaller). Ao mudar a versão, altere só o `serve.py`, o `about.js` e o `readme.md`; nunca edite o `version_info.txt` à mão.
- A distribuição limpa gerada em `compiled\SA Map Studio\` deve sempre refletir com exatidão todos os arquivos atualizados (código-fonte, assets, modelos e scripts).

## 2. Controle de Versão (Git)
- **Sempre realizar commit e push ao final de cada tarefa**.
- Mensagens de commit devem ser claras, objetivas e em português, seguindo um padrão único:
  - Título começando com verbo no presente, 3ª pessoa do singular (`Adiciona`, `Corrige`, `Remove`, `Atualiza`, `Ajusta`), com acentuação correta.
  - Sem prefixos em inglês (`feat:`, `fix:`, `docs:`) e sem ponto final no título.
  - Várias mudanças no mesmo commit: listar no título separadas por vírgula ou detalhar no corpo da mensagem.

## 3. Padrões de Nomenclatura, Interface e Conteúdo
- **Nome do Projeto e Nomenclatura**: O nome oficial do projeto é `SA Map Studio`, gerando o executável `SA Map Studio.exe` e a pasta de distribuição `compiled\SA Map Studio\`. Todas as pastas e arquivos internos de dados e sistema do projeto devem ser nomeados estritamente em inglês e letras minúsculas (sem português e sem letras maiúsculas), como `data`, `test-server`, `system`, `projects`, `exported`, `compile-sources`, `models`, `build.bat`, `build-clean.bat`, `start.bat`, `readme.md`, `ia-rules.md`. Exceções: módulos JavaScript (`.js`) podem usar letras maiúsculas em camelCase (ex.: `animPicker.js`, `textdrawEditor.js`), e arquivos de terceiros ou com nomes oficiais do jogo (fontes, bibliotecas em `vendor/`, bibliotecas de animação do GTA) mantêm o nome original.
- **Nomes curtos e objetivos**: Títulos, botões, labels, placeholders, mensagens de status e avisos que aparecem dentro do editor compilado não devem estourar o espaço visual nem exibir reticências ("..."). A regra vale apenas para textos exibidos no programa compilado; documentação (`readme.md`, `ia-rules.md`), comentários de código e mensagens de console/log podem usar reticências.
- **Fontes e citações**: Nunca citar fontes externas dentro do editor compilado (interface, textos de ajuda, novidades). A regra não se aplica à documentação do repositório (`readme.md`), onde créditos e licenças podem ser citados.
- **Janela inicial**: O editor deve abrir por padrão maximizado.
- **Formatação de Cores**: Cores de Textos 3D (Create3DTextLabel) devem usar alpha total (`0x...FF`, não `0x...AA`).
- **Codificação**: Os scripts pawn e arquivos de mapa do servidor de teste (como `samapstudio.pwn` e `mapa.txt`) devem ser escritos e salvos estritamente em ANSI (Windows-1252), padrão nativo do SA-MP/GTA SA para acentuação e caracteres sem corrupção. Os demais arquivos de código-fonte web/sistema (HTML, JS, CSS, Python) permanecem em UTF-8.

## 4. Arquivos e Compilação
- **Sem LEIA-ME.txt**: Nunca incluir o arquivo `LEIA-ME.txt` em lugar algum ao compilar o projeto (`build.bat` / `build-clean.bat`).
- **Organização e Pasta testing**: A pasta raiz do projeto deve permanecer sempre limpa e organizada, contendo apenas os arquivos e pastas estruturais do projeto. Todos os testes, scripts temporários e arquivos de verificação devem ser criados e executados exclusivamente dentro da pasta `testing/`.
- **Limpeza de Testes**: Ao finalizar cada tarefa, todos os arquivos e pastas criados para testes dentro de `testing/` devem ser rigorosamente apagados, mantendo apenas arquivos essenciais que serão utilizados em testes futuros (e o `.gitkeep`).

## 5. Demonstração Visual (Prints de Novas Funcionalidades)
- **Sempre exibir prints ao final da tarefa**: Sempre que uma nova funcionalidade ou melhoria visual for adicionada ao editor, é obrigatório capturar e mostrar na resposta final uma ou mais prints demonstrando a funcionalidade em ação.


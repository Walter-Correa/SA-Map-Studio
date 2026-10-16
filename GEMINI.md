# Diretrizes do Projeto SA Map Studio

Este arquivo define diretrizes e regras contínuas que devem ser rigorosamente seguidas em todas as sessões e tarefas:

## 1. Compilação da Versão Final (Obrigatório)
- **Sempre compile a versão final** executando `Compilar EXE limpo.bat` ao final de cada tarefa/ciclo de alterações.
- A distribuição limpa gerada em `dist-limpo\SA Map Studio\` deve sempre refletir com exatidão todos os arquivos atualizados (código-fonte, assets, modelos e scripts).

## 2. Controle de Versão (Git)
- **Sempre realizar commit e push ao final de cada tarefa**.
- Mensagens de commit devem ser claras, objetivas e em português.

## 3. Padrões de Interface e Conteúdo
- **Nomes curtos e objetivos**: Títulos, botões e labels da interface não devem estourar o espaço visual nem exibir reticências ("...").
- **Fontes e citações**: Nunca citar fontes externas (ex: "open.mp", URLs de documentação oficial, etc.) em lugar nenhum da interface ou do projeto.
- **Janela inicial**: O editor deve abrir por padrão maximizado.
- **Formatação de Cores**: Cores de Textos 3D (Create3DTextLabel) devem usar alpha total (`0x...FF`, não `0x...AA`).
- **Codificação**: Todos os arquivos de texto, scripts pawn e gamemodes do servidor de teste devem permanecer estritamente em UTF-8.

## 4. Arquivos e Compilação
- **Sem LEIA-ME.txt**: Nunca incluir o arquivo `LEIA-ME.txt` em lugar algum ao compilar o projeto (`Compilar EXE.bat` / `Compilar EXE limpo.bat`).
- **Organização e Pasta testing**: A pasta raiz do projeto deve permanecer sempre limpa e organizada, contendo apenas os arquivos e pastas estruturais do projeto. Todos os testes, scripts temporários e arquivos de verificação devem ser criados e executados exclusivamente dentro da pasta `testing/`.

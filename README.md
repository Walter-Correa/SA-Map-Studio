# SA Map Studio

**Editor de mapas para GTA San Andreas, SA-MP e open.mp**: substituto renovado do antigo
*SA-MP Map Construction*, com interface nova e o mapa inteiro de San Andreas em 3D.

![Versão](https://img.shields.io/badge/versão-3.9.1-f0a630)
![Plataforma](https://img.shields.io/badge/plataforma-Windows-12603a)
![Python](https://img.shields.io/badge/Python-3.8%2B-36414b)
![Three.js](https://img.shields.io/badge/Three.js-r186-36414b)
![Licença](https://img.shields.io/badge/licença-todos%20os%20direitos%20reservados-e0645c)

O editor lê os arquivos direto da pasta do seu GTA San Andreas, sem alterar nada no jogo, e gera
o código Pawn pronto para colar no seu gamemode ou filterscript.

---

## Sumário

- [Recursos](#recursos)
- [Como usar](#como-usar)
- [Compilar o programa](#compilar-o-programa)
- [A pasta do programa](#a-pasta-do-programa)
- [Atalhos](#atalhos)
- [Estrutura do código](#estrutura-do-código)
- [Histórico de versões](#histórico-de-versões)
- [Créditos e licenças](#créditos-e-licenças)

---

## Recursos

### Mapa
- San Andreas completo com streaming e LOD, água, interiores e os objetos do SA-MP (`SAMP.img`).
- Carregamento em segundo plano (Web Workers), priorizando o que está na frente da câmera.
- Câmera livre estilo editor, placa com a região e as coordenadas, e **teleporte** (`Ctrl+G`) aceitando
  `x, y, z` ou uma linha `SetPlayerPos(...)`.

### Objetos
- Catálogo com **categorias** (Móveis, Prédios e casas, Ruas e estradas, Praia, Vegetação, Iluminação,
  Portas e janelas, Placas, Kit de construção, Veículos...), **origem** (SA-MP, Los Santos, San Fierro,
  Las Venturas...), busca por nome ou ID, favoritos, recentes e miniaturas guardadas no disco.
- Posicionar clicando no mapa, gizmo para mover e girar (eixos do mundo ou do objeto), encaixe em grade.
- **Duplicar** e **Posicionar outro igual** criam a cópia no mesmo lugar, já com o gizmo de mover.
- Remover prédios do mapa original (`RemoveBuildingForPlayer`, com o LOD junto) ou torná-los editáveis.
- Veículos (`CreateVehicle` / `AddStaticVehicleEx`), desfazer e refazer, seleção múltipla.
- **Tuning e Paintjobs Compatíveis**: filtragem rigorosa de componentes de tuning, paintjobs (0 a 2) e cores conforme regras oficiais do SA-MP/open.mp (`IsModValidForVehicle`, `IsPaintjobValidForVehicle`, `IsVehicleValidForModding`, `IsVehicleValidForColor`), exibindo apenas peças compatíveis no inspetor.

### Textos 3D (3D Text Labels)
- Criação e visualização direta no 3D com efeito billboard voltado para a câmera (`Create3DTextLabel` / `CreateDynamic3DTextLabel`).
- Suporte a múltiplas linhas (`\n`), códigos de cores embutidos no formato `{RRGGBB}`, paleta rápida SA-MP e seletor hexadecimal.
- Ajuste de distância de visão (`drawDistance`), teste de linha de visão (`testLOS`), interior e mundo virtual.

### Pickups
- Criação e visualização no 3D com malha rotativa animada (`CreatePickup` / `CreateDynamicPickup`).
- Catálogo categorizado com presets oficiais do open.mp: Vida (1240), Colete (1242), Dinheiro (1274), Casas e Informações (1272, 1273, 1239), Armas (IDs 321 a 372) e Equipamentos.
- Configuração de tipo de pickup, tempo de respawn, interior e mundo virtual.

### GangZones (Radar Map Interativo)
- Diálogo modal com o mapa de radar oficial de San Andreas (-3000 a +3000) em alta resolução, com navegação por pan e zoom.
- Criação de zonas retangulares por arrasto do mouse (`GangZoneCreate` e `GangZoneShowForAll`).
- **Encaixe magnético de bordas (Snap)**: alinhamento automático entre zonas adjacentes com guias ciano na tela.
- Seletor de cores RGBA com opacidade/transparência e projeção plana 3D no chão do mapa.

### TextDraws (Editor Visual)
- Editor visual na tela nativa do SA-MP (640x448, mostrada em 16:9) com margem segura e grade; os textos usam as
  fontes do próprio GTA SA (`fonts.txd` e `fonts.dat`), então o que aparece no editor é o que aparece no jogo.
- Criação e edição de textos e caixas (`TextDrawCreate` / `CreatePlayerTextDraw`).
- Fontes 0 a 5, cores de texto e caixa com transparência, alinhamento (esquerda, centro, direita), tamanho de letras e caixas, contorno (`outline`) e sombra (`shadow`).
- **Pré-visualização 3D de modelos (Font 5)**: exibe veículos, skins e objetos 3D no TextDraw com ajuste de rotação (RX, RY, RZ) e zoom.
- Exportação limpa de script Pawn pronto para compilação.
- **Barras de progresso** (`progress2.inc`) nas quatro direções, com o mesmo desenho do jogo.

### Materiais do SA-MP
- O inspetor lista **todos os índices de material** do objeto (0 a 15) com a textura original de cada um.
- Marque um ou vários índices (ou clique na parte do objeto com a ferramenta Textura) e:
  - troque a textura: **`SetObjectMaterial`** (modelid, txdname, texturename);
  - escolha a cor (`materialcolor`) num **painel de cores** com transparência, `0xAARRGGBB` e cores recentes;
  - escreva texto: **`SetObjectMaterialText`** com tamanho do material, fonte, tamanho, negrito,
    alinhamento, cor da letra e do fundo, códigos `{RRGGBB}` e prévia ao vivo.
- Biblioteca com **todas as texturas do jogo por categoria** (Tijolos e paredes, Pisos, Madeira, Metal...).

### Câmeras
- Câmeras fixas: `SetPlayerCameraPos` + `SetPlayerCameraLookAt` a partir da vista atual.
- Movimentos completos com `InterpolateCameraPos` + `InterpolateCameraLookAt`: vários pontos, tempo,
  espera e tipo de cada passo (`CAMERA_MOVE` / `CAMERA_CUT`), caminho desenhado no mapa e prévia no editor.

### Testar no jogo
- Sobe um **servidor de teste local** (open.mp ou SA-MP) com o gamemode do editor, carrega o mapa com
  texturas, textos, veículos com seus tuning/paintjobs reais (`AddVehicleComponent`, `ChangeVehiclePaintjob`), Textos 3D (`Create3DTextLabel`), Pickups (`CreatePickup`) e GangZones (`GangZoneCreate`), abrindo o SA-MP já conectado e nascendo onde a câmera está olhando.
- No jogo: `/fly`, `/map`, `/w`, `/t`, `/v [modelo]`, `/anim`, `/jetpack`, `/spawn`, `/pos` e `/ajuda`.

### Importar e exportar
- **Importa qualquer arquivo**, descobrindo o formato sozinho: código Pawn (Map Construction,
  Texture Studio e outros, com texturas, textos e câmeras), bancos SQLite, projetos `.json`,
  mapas do MTA (`.map`) e IPL (texto e binário) do jogo. Também dá para arrastar o arquivo para a janela.
- **Exporta** para Pawn (`CreateDynamicObject` ou `CreateObject`, funções prontas ou só as linhas,
  com as câmeras) e IPL. O `.pwn` sai em ANSI para os acentos aparecerem certos no pawno.
  O código gerado compila **sem warnings**.

### Projetos
- Salvos sozinhos na pasta `projects`, inclusive ao fechar as janelas de edição e ao fechar o programa; abrir
  outro projeto salva e fecha o que estava aberto.

---

## Como usar

### Requisitos para usar o programa compilado

| Item | Detalhe |
|---|---|
| Sistema | Windows 10 ou 11 de 64 bits. |
| Permissão | Conta com acesso de administrador: o programa pede elevação (UAC) ao abrir. |
| Navegador interno | Microsoft Edge WebView2 Runtime (já vem no Windows 11 e no Windows 10 atualizado). Sem ele, o editor abre no navegador padrão. |
| Placa de vídeo | Compatível com WebGL 2 e com driver atualizado. |
| Memória | 4 GB de RAM ou mais (8 GB recomendados para mapas grandes). |
| Disco | Cerca de 200 MB livres: 86 MB do `SA Map Studio.exe` + 115 MB da pasta `sa-map-studio` criada na primeira execução. |
| Tela | Pelo menos 1050 x 650. |
| Jogo | GTA San Andreas original para PC (a mesma versão do SA-MP), com `gta_sa.exe`, `data\gta.dat` e `models\gta3.img`. A Definitive Edition não é compatível. O editor só lê os arquivos do jogo. |
| Testar no jogo | Cliente SA-MP 0.3.7 (ou open.mp) instalado na pasta do GTA. O servidor open.mp de teste já vem junto e usa a porta UDP 7777 (o Firewall do Windows pode pedir permissão). |
| Internet | Não é necessária. Só é usada para baixar prévias extras de animações. |

O programa não precisa de Python, Visual C++ ou outra instalação: tudo vai dentro do `.exe`.

### Requisitos para continuar o desenvolvimento em outro PC

- Git e **Python 3.10 ou mais novo** do site oficial (https://www.python.org/downloads/), com o launcher `py`.
  O atalho "python" da Microsoft Store não serve.
- Conexão com a internet na primeira compilação (o `build.bat` instala PyInstaller e pywebview num ambiente
  separado em `compile-sources\.venv-build`).
- Para rodar pelo código, só a biblioteca padrão do Python; o pywebview é opcional (sem ele, abre no navegador).
- Tudo o mais (gamemode, compilador Pawn, servidor open.mp, miniaturas, sprites, skins e sons) já está no repositório.
- Clone numa pasta de caminho curto (por exemplo `C:\Projetos\SA-Map-Studio`): o Windows limita caminhos a 260
  caracteres e o ambiente de compilação não é criado em pastas muito profundas.

### Rodar pelo código-fonte

```powershell
git clone https://github.com/Walter-Correa/SA-Map-Studio.git
cd SA-Map-Studio
.\start.bat
```

Ou `py -3 serve.py`. O editor procura o GTA sozinho (pasta padrão de instalação, registro do Windows, Steam e
pastas comuns). Para indicar a pasta:

```powershell
py -3 serve.py --gta "D:\Jogos\GTA San Andreas"
```

Outras opções: `--port 8777`, `--no-browser` e `--navegador` (abre no navegador mesmo com o pywebview instalado).

---

## Compilar o programa

| Arquivo | Resultado | Para quê |
|---|---|---|
| `build.bat` | `compiled\SA Map Studio\` | Uso no dia a dia: atualiza o programa **mantendo** projetos, exportações, configuração, cache e miniaturas. |
| `build-clean.bat` | `compiled\SA Map Studio\` | Cópia **limpa**, sem nenhum dado carregado, pronta para enviar a outra pessoa. |

Os dois criam um ambiente Python separado (`compile-sources\.venv-build`), instalam as versões mais recentes do
PyInstaller e do pywebview, gravam a data e a hora da compilação (aparecem em *Novidades* dentro do
programa) e montam a pasta `test-server` com o gamemode e o seu servidor open.mp / SA-MP.

```powershell
Stop-Process -Name "SA Map Studio" -Force -ErrorAction SilentlyContinue
& ".\build.bat"          # mantém seus dados
& ".\build-clean.bat"    # cópia limpa
```

> Na primeira vez, o Windows pode mostrar "O Windows protegeu o computador", porque o programa não tem
> assinatura digital. Clique em **Mais informações** e em **Executar assim mesmo**.

---

## A pasta do programa

A compilação gera um executável único. Na primeira vez que é aberto, ele cria ao lado a pasta
`sa-map-studio` com tudo dentro:

```
SA Map Studio\
├── SA Map Studio.exe      o programa (launcher com o pacote embutido)
└── sa-map-studio\
    ├── projects\              seus mapas (salvos sozinhos)
    ├── exported\              .pwn / .ipl exportados
    ├── data\                  configuração, cache de texturas, miniaturas e registros
    ├── test-server\           servidor usado pelo "Testar no jogo"
    └── system\                arquivos internos do programa
```

Para levar o programa para outro computador, basta copiar o `SA Map Studio.exe` (ou a pasta inteira,
para manter projetos e configurações).

---

## Atalhos

| Tecla | Ação |
|---|---|
| Botão direito + arrastar | Olhar em volta |
| `W` `A` `S` `D` / `E` `Q` | Andar / subir e descer |
| `Shift` / `Alt` | Mais rápido / mais devagar |
| `G` / `R` / `T` | Mover / girar / ferramenta Textura |
| `L` | Eixos do mundo ou do objeto |
| `X` | Girar 90° |
| `Page Up` / `Page Down` | Subir / descer a seleção |
| `End` | Colocar no chão |
| `F` ou duplo clique | Focar na seleção |
| `Ctrl+D` | Duplicar no mesmo lugar |
| Setas (`Shift` = 0,1) | Mover MapIcon, TextDraw ou GangZone nas janelas de edição |
| `Ctrl+G` | Teleportar para uma coordenada |
| `Ctrl+Z` / `Ctrl+Y` | Desfazer / refazer |
| `Ctrl+S` | Salvar agora |
| `Delete` | Apagar |
| `?` | Todos os atalhos |

---

## Estrutura do código

```
serve.py                       servidor local (Python, só biblioteca padrão) + janela própria (pywebview)
index.html, favicon.svg        página principal da interface
icon.ico                       ícone do executável
compile-sources/
├── css/                       estilos da interface
├── js/app.js                  inicialização
├── js/ui/                     abas, inspetor, paleta de cores, câmeras, diálogos, projetos, editores
├── js/editor/                 núcleo: editor, projeto, materiais, importação, exportação Pawn/IPL
├── js/world/                  dados do jogo, streaming do mapa, modelos, categorias, workers
├── js/formats/                leitores dos formatos do GTA (IMG, IDE, IPL, DFF, TXD)
├── js/data/                   catálogos estáticos (sprites)
├── js/vendor/                 Three.js r186
├── fonts/                     fonte Barlow (SIL Open Font License)
├── models/                    modelos usados pelo editor
├── cache/                     miniaturas, skins, sprites, mapicons, sons, animações e radar
├── launcher.py                executável único: extrai o programa na primeira execução
├── launcher_frames/           quadros do ícone animado do launcher
├── package_bundle.py          empacota o programa no zip do launcher
├── samapstudio.pwn / .amx     gamemode do servidor de teste
├── anim-list.json             lista de animações
└── version_info.txt           metadados de versão do .exe
omp-server-source/             servidor open.mp base usado no "Testar no jogo"
testing/                       scripts de teste temporários
build.bat                      compila mantendo os dados
build-clean.bat                compila uma versão limpa
start.bat                      inicia o servidor e o editor via Python
```

A rotação segue a convenção do SA-MP (ordem Z, X, Y), então o que aparece no editor é o que aparece no servidor.

---

## Histórico de versões

### 3.9.1 — 19/10/2026
- TextDraws exportadas como `textdraw_0`, `textdraw_1`... e barras de progresso como `progress_0`, `progress_1`... com o nome dado no editor em `// comentário`
  no fim da linha de criação (lido de volta na importação).

### 3.9.0 — 19/10/2026
- Barras de progresso com nome (vira o nome da variável no código exportado).
- Importação de barras reconhece argumentos nomeados, cores decimais negativas, expressões e variáveis em arrays/enums.
- Botões de tipos de TextDraw em grade e botão Concluir das janelas de edição afastado da borda.
- Mapa de exemplo com uma barra de progresso.

### 3.8.0 — 19/10/2026
- Novo tipo **Barra de progresso** no editor de TextDraws (`progress2.inc`): largura, altura, cor, máximo, valor e
  direção, desenhada como a include monta no jogo; exporta e importa `CreatePlayerProgressBar`,
  `SetPlayerProgressBarValue` e `ShowPlayerProgressBar`.
- Gamemode de teste compilado com a `progress2.inc`.

### 3.7.0 — 19/10/2026
- Retomar de onde parou: o projeto guarda a seleção do último salvamento e, ao abrir, seleciona os itens,
  ativa o gizmo e foca nele. Sem seleção de itens do projeto, abre focando no item mais próximo do centro.

### 3.6.2 — 19/10/2026
- Botão "3DTexts" na barra superior.

### 3.6.1 — 19/10/2026
- Nova vista de câmera do mapa de exemplo (Example Map) na primeira abertura.

### 3.6.0 — 19/10/2026
- Na primeira abertura, o editor carrega o projeto **Example Map** na câmera salva nele.
- Setas movem o item selecionado nas janelas de MapIcons, TextDraws e GangZones (1 unidade, 0,1 com Shift),
  sem afetar o editor principal enquanto a janela está aberta.
- Contorno e sombra das TextDraws são caixas de ligar/desligar (desligadas por padrão).
- O nome da GangZone atualiza na hora, enquanto é digitado.

### 3.5.5 — 19/10/2026
- Nova vista inicial da câmera ao abrir um projeto vazio pela primeira vez.

### 3.5.4 — 19/10/2026
- Retirado o registro temporário de desempenho usado para investigar o travamento ao redimensionar
  (a causa estava no Windows do PC, não no editor).

### 3.5.3 — 19/10/2026
- O mapa 3D volta a acompanhar a janela durante o redimensionamento (a pausa da 3.5.2 foi desfeita).
- Registro de desempenho nos Registros: duração, quadros e maior pausa de cada redimensionamento e paradas da página.

### 3.5.2 — 19/10/2026
- O botão "Projeto" do inspetor também leva a câmera até as setas de edição.
- Rodando pelo código-fonte, o cache gerado em execução vai para a pasta de dados, não para `compile-sources\cache`.

### 3.5.1 — 19/10/2026
- Barra superior mostra todos os rótulos que cabem e esconde um a um só quando falta espaço.
- Redimensionar a janela não trava mais: as listas de objetos e texturas só são redesenhadas quando necessário.
- Ao abrir ou importar, a câmera foca no item mais próximo do centro do projeto.
- "Mover todo o projeto" leva a câmera até as setas de edição.

### 3.5.0 — 19/10/2026
- Ao fechar o programa, todos os projetos abertos são salvos antes de encerrar.
- Alterações nas janelas de TextDraws, MapIcons e GangZones são salvas ao fechar pelo X, Concluir ou Esc.
- Depois de importar, nenhum item fica selecionado automaticamente.
- Ícone do programa nas caixas de confirmação e maior na barra superior.

### 3.4.1 — 19/10/2026
- TextDraws iguais ao jogo: o editor desenha com as fontes do GTA SA e reproduz as contas do jogo para tamanho das
  letras, quebra de linha, alinhamento e caixa, na tela 640x448 do SA-MP em 16:9.
- Editor, código Pawn exportado e servidor de teste usam os mesmos parâmetros de `TextDrawLetterSize` e
  `TextDrawTextSize`; TextDraws de projetos antigos são convertidas ao abrir.
- Caixa alinhada à direita igual ao cliente SA-MP 0.3.7: vai da borda esquerda da tela até o texto.
- Clicar em qualquer ponto de uma TextDraw seleciona e permite arrastar, inclusive no alto da tela.
- A compilação não abre mais a pasta do programa ao terminar.

### 3.4.0 — 18/10/2026
- **Executável único**: o programa inteiro vem compactado em `SA Map Studio.exe`, que na primeira execução
  cria a pasta `sa-map-studio` (com barra de progresso e ícone animado) e nas seguintes abre o editor direto.
- **Configuração automática do GTA**: com o executável dentro da pasta de instalação do jogo, a pasta é reconhecida
  e configurada sozinha, sem pedir a instalação ao abrir.
- Detecção do GTA mais confiável e em qualquer máquina: pasta padrão
  (`C:\Program Files (x86)\Rockstar Games\GTA San Andreas`) em primeiro lugar, depois registro do Windows e outros
  discos; sem instalação válida, a pasta padrão fica sugerida e o aviso aparece só ao avançar. A detecção apenas lê
  as pastas do jogo.
- Falha ao ler os arquivos do jogo volta para a escolha da pasta em vez de travar a abertura.
- Funcionamento em `Program Files`: dados do WebView2 vão para a pasta do usuário quando o programa está numa pasta protegida.
- Ícones oficiais com animação sincronizada ao carregamento e metadados de versão no `.exe`.
- TextDraws com alinhamento e caixas iguais ao editor no servidor open.mp; duplicação sequencial e encaixe de
  GangZones e MapIcons; nomes de câmeras preservados; desfazer corrigido ao arrastar.

### 3.3.0 — 18/10/2026
- Caixas de TextDraw proporcionais ao texto e `TextDrawTextSize` exato para cada alinhamento no servidor de teste.
- Desfazer/refazer isolado nas janelas de MapIcons, GangZones e TextDraws.
- Importação de câmeras Pawn (`SetPlayerCameraPos`, `SetPlayerCameraLookAt`, `InterpolateCameraPos`, `InterpolateCameraLookAt`).
- Sons ficam só como ferramenta de prévia e teste, fora do código Pawn exportado.
- Nomes de GangZones salvos e exportados; exportação Pawn sem seções duplicadas.

### 3.2.0 — 18/10/2026
- Editor de TextDraws com cores do GTA SA (`~r~`, `~g~`, `~b~`...) e símbolos direcionais, alinhamentos fiéis e caixa sem texto.
- Duplicar GangZones e MapIcons (`Ctrl+C` / `Ctrl+D`).
- Arrastar o objeto direto pelo terreno, mantendo a altura.
- Bloqueio de acoplamento em objetos que já são pais; eixo padrão "Objeto".
- Texto em objetos atualizado em tempo real e totais de cada categoria na lista de projetos.

### 3.1.0 — 17/10/2026
- Catálogo de sons (`PlayerPlaySound`) com 2.620 áudios, prévia e categorias.
- Checkpoints e Race Checkpoints (tipos 0 a 4) com setas encadeadas e modelos fiéis.
- Editor de MapIcons (`SetPlayerMapIcon`) com mapa de radar, 64 ícones e estilos.
- Tuning com saias laterais e aerofólios corretos, também no servidor de teste.
- Botão flutuante para alternar mover/girar e barra superior responsiva.

### 3.0.0 — 15/10/2026
- Filtragem inteligente de tuning, paintjobs e cores de veículos: compatibilidade rigorosa com o modelo do veículo baseada nas regras oficiais do SA-MP/open.mp (`IsVehicleValidForColor`, `IsVehicleValidForModding`, `IsPaintjobValidForVehicle` e `IsModValidForVehicle`). O inspetor de veículos agora exibe exclusivamente os componentes de modding (spoilers, capôs, tetos, saias, escapamentos, nitro, rodas, som estéreo, hidráulica), paintjobs (0 a 2) e seletores de cor compatíveis com o modelo selecionado.
- Aplicação real de tuning e paintjobs no servidor de teste: integração completa de `AddVehicleComponent` e `ChangeVehiclePaintjob` no gamemode de teste (`samapstudio.pwn` e `samapstudio.amx`), exibindo veículos com suas peças e pinturas aplicadas diretamente dentro do jogo.
- Suporte completo a Textos 3D (3D Text Labels): criação visual na viewport 3D com efeito billboard voltado para a câmera (`Create3DTextLabel` / `CreateDynamic3DTextLabel`), suporte a múltiplas linhas (`\n`), tags de cores embutidas (`{RRGGBB}`), paleta rápida SA-MP e seletor hexadecimal, ajuste de distância de visão (`drawDistance`), teste de linha de visão (`testLOS`), interior e mundo virtual, importação/exportação Pawn e sincronização automática no servidor de teste.
- Suporte completo a Pickups (`CreatePickup` / `CreateDynamicPickup`): catálogo categorizado de pickups pré-definidos do open.mp e SA-MP (vida, colete, dinheiro, propriedades, armas IDs 321 a 372 e itens), malha 3D animada com rotação contínua na viewport, inspetor com seleção de tipo de pickup, tempo de respawn, mundo e interior, salvamento/carregamento no projeto, importação/exportação Pawn e sincronização no servidor de teste.
- Novo editor interativo de GangZones com Radar Map: diálogo modal exibindo o mapa de radar oficial do GTA San Andreas (-3000 a +3000), navegação por pan/zoom, desenho de zonas arrastando o mouse, sistema magnético inteligente de encaixe/alinhamento de bordas (snap) entre zonas adjacentes com guias visuais ciano, seletor de cores RGBA com opacidade/transparência, projeção plana 3D da zona no chão do mundo, salvamento/carregamento no projeto, exportação Pawn (`GangZoneCreate` / `GangZoneShowForAll`) e renderização no servidor de teste.
- Novo editor visual de TextDraws (TextDraw Editor): ambiente de edição na resolução nativa 640x480 do SA-MP com guias de margem segura, suporte a textos e caixas com cores e opacidade personalizadas, seleção de fontes (0 a 5), sombra (`shadow`), contorno (`outline`), alinhamento (left, center, right), espaçamento de letras (`letter size`), tamanho de texto/caixa (`text size`), pré-visualização de modelos 3D para Font 5 (veículos, skins e objetos com rotação e zoom configuráveis), arrastar e redimensionar interativo e exportação limpa de scripts Pawn prontos para uso (`TextDrawCreate` ou `CreatePlayerTextDraw`).

### 2.9.1 — 15/10/2026
- Correção crítica de renderização de texturas (Three.js WebGL): eliminação do erro `TypeError: Cannot read properties of undefined (reading 'width')` em `uploadTexture`, preservando a integridade das estruturas de mipmaps das texturas DXT/RGBA em memória e evitando travamentos e falhas visuais na renderização dos modelos do mapa.
- Correção dos submenus da barra superior e do menu "Ir para": remoção de restrições de overflow na topbar e prevenção de rolagem acidental no foco do campo de coordenadas (Ctrl+G), garantindo que todos os menus suspensos ("Encaixe", "Ir para", "Visão") abram e flutuem perfeitamente sobre a viewport 3D sem deslocar botões.
- Ocultação automática do cursor do mouse durante movimentação da câmera: o cursor agora é completamente ocultado ao rotacionar a visão (botão direito), arrastar a tela (botão do meio) ou movimentar-se pelo mapa, reaparecendo instantaneamente ao cessar o movimento.
- Remoção da função e botão redundantes "Preparar miniaturas" no catálogo de objetos, uma vez que 100% das 15.956 miniaturas já se encontram pré-geradas e armazenadas localmente no disco (`data/cache/thumbnails/objects`).

### 2.9.0 — 15/10/2026
- Catálogo completo de armas do open.mp e GTA SA: 46 armas e itens especiais (IDs 321 a 372) com categoria dedicada "Armas" e ordenação alfabética de categorias em português.
- Ajuste fino com setas direcionais nos eixos (▲ / ▼): botões de passo interativos em Posição (X, Y, Z) e Rotação (RX, RY, RZ) com auto-repeat contínuo, Shift (0.1x), Ctrl (5.0x) e histórico Undo/Redo.
- Recurso "Tornar invisível" em materiais: remoção de textura de índices de objetos com ocultação da malha no 3D e exportação canônica `SetObjectMaterial(..., 0, "none", "none", 0)`.
- Formatação rigorosa de coordenadas Pawn: valores float com valor zero depois do ponto formatados de forma limpa (ex: `180.0`, `0.0`), preservando representação exata do arquivo importado.
- Recolhimento independente das barras laterais esquerda e direita com botões de borda e restauração inteligente no modo auto-collapse da câmera.
- Teleporte rápido para coordenadas de clique do mouse através de botão dedicado no inspetor.
- Arquitetura de miniaturas em disco local e otimização total de VRAM: pré-empacotamento de 15.956 miniaturas WebP (~15 MB) na pasta local `data/cache/thumbnails`, leitura 100% direta do disco sem carregar malhas 3D no boot, preservação de texturas compartilhadas do mundo (evitando asfalto/terreno pretos), pixel ratio 1.0 e descarte estrito de geometrias, reduzindo o consumo de memória de >3,1 GB para níveis mínimos e estáveis.
- Compilação limpa e autônoma do executável (.exe): script de compilação aprimorado com auto-recuperação do ambiente virtual (`compile-sources\.venv-build`), detecção inteligente de executáveis Python no sistema (evitando stubs inválidos da Microsoft Store) e empacotamento limpo verificado em `compiled\SA Map Studio`.
- Elevação automática de privilégios (Admin / UAC): compilação com `--uac-admin`, gravando a diretiva `requireAdministrator` no manifesto PE do `.exe` para garantir permissões de acesso ao GTA San Andreas, controle de processos e portas de rede automaticamente.

### 2.8.0 — 14/10/2026
- Novo seletor de animações com painel dividido (Split View) e player de vídeo dinâmico integrado para demonstração ao vivo da animação.
- Sistema de cache local e streaming WebM de alto desempenho em `data/cache/animations/`.
- Download do pacote offline completo (~320 MB) em segundo plano com acompanhamento de progresso e opção de pausa.
- Seleção estável e fixada exclusivamente no clique do mouse sem alteração indesejada por movimento do cursor.
- Novos comandos `/w [clima]` (0-45) e `/t [horário]` (0-23 horas e minutos) no servidor de teste com sincronização global entre todos os jogadores.
- Novo comando `/ajuda` no servidor de teste listando todos os atalhos e comandos disponíveis.

### 2.7.0 — 14/10/2026
- Catálogo completo de animações do open.mp: 1.872 presets organizados por biblioteca com campo de busca em tempo real.
- Posicionamento e centralização inteligente da janela na tela, adaptando-se à área útil do monitor.
- Esclarecimento da orientação dos eixos do manipulador ("Eixos: Mundo" vs "Eixos: Objeto").
- Opção "Trocar pasta do GTA" integrada ao diálogo "Testar no jogo".
- Novo Sistema de Logs e Diagnóstico: captura automática de erros JS/console e diálogo com botão de cópia rápida.

### 2.6.0 — 14/10/2026
- Menu "Ir para" reestruturado em abas: "Locais no mundo" e "Interiores", com lista de mais de 140 interiores do GTA SA e SA-MP/open.mp.
- Configuração de clima (0 a 45) e horário com minutos no "Testar no jogo" e no menu Visão, sincronizados em tempo real no 3D do editor (céu dinâmico, ciclo dia/noite e iluminação).
- Comandos `/fly` e `/voar` no servidor de teste para alternar o voo livre da câmera com retorno suave ao ponto de origem.
- Comandos `/map` e `/mapa` para teleporte imediato ao centro do mapa em teste.
- Catálogo unificado de Actors: troca e pré-visualização de skins em tempo real no menu direito, com apoio sobre superfícies e correção de orientação.

### 2.5.0 — 14/10/2026
- Limite de distância de visão expandido até 2500 metros no menu Visão.
- Atalho F10 e botão na barra superior para recolher e restaurar menus laterais em tela cheia.
- Modo opcional de recolhimento automático dos menus durante movimentação da câmera.
- Campo de coordenadas do clique do mouse no topo do menu lateral com cópia em um clique.
- Desfazer e Refazer (Undo/Redo) com suporte global inteligente.
- Novo ícone oficial estilizado com o forno clássico `mkwalloven1` (ID 19933).

### 2.4.1 — 14/10/2026
- Coexistência de múltiplos projetos com modo Editável ou Não editável.
- Importação fiel de mapas Pawn (`.pwn`) preservando 100% de comentários, anotações, includes e cores hexadecimais.
- Servidor de teste open.mp com omp-server.exe, DLLs e componentes empacotados na raiz da distribuição.

### 2.4.0 — 14/10/2026
- Redução e otimização profunda do consumo de memória RAM do WebView2.
- Paleta completa de cores de veículos do SA-MP (0 a 255) e visualização de tuning/paintjobs em tempo real no 3D.
- Categorias de texturizações e textos separadas no painel Projeto.
- Inversão da ordem de objetos e botão de segurança "Apagar tudo".
- Suporte a MoveObject com teste de movimentação no mundo e AttachObjectToObject com edição visual.
- Exportação de coordenadas em formato de Array e edição manual do script Pawn.

### 2.3.0 — 13/10/2026
- Velocidades de movimento e rotação configuráveis no menu lateral (0.001x a 10.0x).
- Rotação em grupo com múltiplos objetos selecionados.

### 2.2.0 — 13/10/2026
- Destaque visual em tons de vermelho nos objetos do mundo selecionados para remoção.
- Remoção simultânea com RemoveBuildingForPlayer e miniaturas ampliadas no catálogo.
- Apelidos personalizados para favoritos e renomeação padronizada de propriedades de stream.

### 2.1.0 — 13/10/2026
- Textura trocada cobre a parte do objeto por igual no editor, sem as sombras pintadas no modelo original (igual ao jogo).
- Servidor interno mais resistente: não fecha por falta de memória num pedido e se recupera sozinho de erros.
- Menos memória ao navegar pelo mapa e ao preparar miniaturas.
- Botão *Novidades e documentação*, com a data e a hora da compilação.
- Pasta `Servidor de Teste` dentro do programa e novo `Compilar EXE limpo.bat`.

### 2.0.0 — 13/10/2026
- Pasta única do programa com subpastas organizadas.
- Categorias de objetos e texturas; miniaturas guardadas no disco.
- Editor de materiais do SA-MP com todos os índices, painel de cores e texto.
- Duplicar no mesmo lugar, teleporte, câmeras, "Testar no jogo" e importação de qualquer arquivo.
- Mapa completo (objetos e LODs que faltavam) e carregamento mais suave.

### 1.0.0 — 12/10/2026
- Primeira versão: mapa com streaming e LOD, catálogo, gizmo, remoção de prédios, veículos,
  exportação Pawn/IPL, importação de `.pwn` e compilação em `.exe`.

---

## Créditos e licenças

- [Three.js](https://threejs.org/) (MIT) para a renderização 3D.
- Fonte [Barlow](https://github.com/jpt/barlow) (SIL Open Font License, ver `compile-sources/fonts/OFL.txt`).
- GTA San Andreas é marca da Rockstar Games. Os arquivos do jogo não fazem parte deste repositório:
  o editor usa a cópia instalada no computador de quem o abre.

---

**© 2026 Rafael_Hurley e Walter_Correa. Todos os direitos reservados.**

Este é um repositório privado. Não é permitido copiar, distribuir ou modificar este código sem autorização dos autores.

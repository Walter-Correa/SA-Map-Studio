# SA Map Studio

**Editor de mapas para GTA San Andreas, SA-MP e open.mp**: substituto renovado do antigo
*SA-MP Map Construction*, com interface nova e o mapa inteiro de San Andreas em 3D.

![Versão](https://img.shields.io/badge/versão-2.1.0-f0a630)
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
  texturas e textos e abre o SA-MP já conectado, nascendo onde a câmera está olhando.
- No jogo: `/jetpack`, `/v [modelo]`, `/spawn` e `/pos`.

### Importar e exportar
- **Importa qualquer arquivo**, descobrindo o formato sozinho: código Pawn (Map Construction,
  Texture Studio e outros, com texturas, textos e câmeras), bancos SQLite, projetos `.json`,
  mapas do MTA (`.map`) e IPL (texto e binário) do jogo. Também dá para arrastar o arquivo para a janela.
- **Exporta** para Pawn (`CreateDynamicObject` ou `CreateObject`, funções prontas ou só as linhas,
  com as câmeras) e IPL. O `.pwn` sai em ANSI para os acentos aparecerem certos no pawno.
  O código gerado compila **sem warnings**.

### Projetos
- Salvos sozinhos na pasta `Projetos`; abrir outro projeto salva e fecha o que estava aberto.

---

## Como usar

### Requisitos
- Windows 10 ou 11.
- GTA San Andreas original (a mesma versão que roda o SA-MP). A Definitive Edition não é compatível.
- Para rodar pelo código: **Python 3.8 ou mais novo** (só a biblioteca padrão).
- Para o "Testar no jogo": cliente SA-MP ou open.mp instalado no GTA e um servidor open.mp / SA-MP.

### Rodar pelo código-fonte

```powershell
git clone https://github.com/rafaelnepomucenno-lgtm/SA-MAP-STUDIO.git
cd SA-MAP-STUDIO
python serve.py
```

Ou dê dois cliques em **`Iniciar SA Map Studio.bat`**.

O editor procura o GTA sozinho (registro do Windows, Steam e pastas comuns). Para indicar a pasta:

```powershell
python serve.py --gta "D:\Jogos\GTA San Andreas"
```

Outras opções: `--port 8777`, `--no-browser` e `--navegador` (abre no navegador mesmo com o pywebview instalado).

---

## Compilar o programa

| Arquivo | Resultado | Para quê |
|---|---|---|
| `Compilar EXE.bat` | `dist\SA Map Studio\` | Uso no dia a dia: atualiza o programa **mantendo** projetos, exportações, configuração, cache e miniaturas. |
| `Compilar EXE limpo.bat` | `dist-limpo\SA Map Studio\` | Cópia **limpa**, sem nenhum dado carregado, pronta para enviar a outra pessoa. |

Os dois criam um ambiente Python separado (`.venv-build`), instalam as versões mais recentes do
PyInstaller e do pywebview, gravam a data e a hora da compilação (aparecem em *Novidades* dentro do
programa) e montam a pasta `Servidor de Teste` com o gamemode e o seu servidor open.mp / SA-MP.

```powershell
Stop-Process -Name "SA Map Studio" -Force -ErrorAction SilentlyContinue
& ".\Compilar EXE.bat"          # mantém seus dados
& ".\Compilar EXE limpo.bat"    # cópia limpa
```

> Na primeira vez, o Windows pode mostrar "O Windows protegeu o computador", porque o programa não tem
> assinatura digital. Clique em **Mais informações** e em **Executar assim mesmo**.

---

## A pasta do programa

Depois de compilado, tudo fica numa pasta só:

```
SA Map Studio\
├── SA Map Studio.exe     o programa
├── Projetos\             seus mapas (salvos sozinhos)
├── Exportados\           .pwn / .ipl exportados
├── Dados\                configuração, cache de texturas, miniaturas e registros
├── Servidor de Teste\    servidor usado pelo "Testar no jogo"
└── Sistema\              arquivos internos do programa
```

A pasta inteira pode ser movida ou copiada para outro computador.

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
| `Ctrl+G` | Teleportar para uma coordenada |
| `Ctrl+Z` / `Ctrl+Y` | Desfazer / refazer |
| `Ctrl+S` | Salvar agora |
| `Delete` | Apagar |
| `?` | Todos os atalhos |

---

## Estrutura do código

```
serve.py                 servidor local (Python, só biblioteca padrão) + janela própria (pywebview)
index.html, css/         interface
js/app.js                inicialização
js/ui/                   abas, inspetor, paleta de cores, câmeras, diálogos, projetos
js/editor/               núcleo: editor, projeto, materiais, importação, exportação Pawn/IPL
js/world/                dados do jogo, streaming do mapa, modelos, categorias, workers
js/formats/              leitores dos formatos do GTA (IMG, IDE, IPL, DFF, TXD)
js/vendor/               Three.js r186
servidor-teste/          gamemode do "Testar no jogo" (samapstudio.pwn / .amx)
fonts/                   fonte Barlow (SIL Open Font License)
Compilar EXE.bat         compila mantendo os dados
Compilar EXE limpo.bat   compila uma cópia limpa
```

A rotação segue a convenção do SA-MP (ordem Z, X, Y), então o que aparece no editor é o que aparece no servidor.

---

## Histórico de versões

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
- Fonte [Barlow](https://github.com/jpt/barlow) (SIL Open Font License, ver `fonts/OFL.txt`).
- GTA San Andreas é marca da Rockstar Games. Os arquivos do jogo não fazem parte deste repositório:
  o editor usa a cópia instalada no computador de quem o abre.

---

**© 2026 Rafael_Hurley e Walter_Correa. Todos os direitos reservados.**

Este é um repositório privado. Não é permitido copiar, distribuir ou modificar este código sem autorização dos autores.

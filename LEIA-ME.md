# SA Map Studio

Editor de mapas para GTA San Andreas / SA-MP / open.mp, feito para substituir o antigo
SA-MP Map Construction com uma interface nova. Lê os arquivos direto da pasta do seu GTA.

## A pasta do programa

Depois de compilado, tudo fica numa pasta só, **`SA Map Studio`**:

| Pasta / arquivo | O que tem |
|---|---|
| `SA Map Studio.exe` | o programa (abra este) |
| `Projetos\` | seus mapas (salvos sozinhos) |
| `Exportados\` | os `.pwn` / `.ipl` exportados |
| `Dados\` | configuração, cache das texturas, miniaturas e registros |
| `Servidor de Teste\` | servidor open.mp / SA-MP usado pelo "Testar no jogo" (com o gamemode do editor) |
| `Sistema\` | arquivos internos do programa (não mexa) |

A pasta inteira pode ir para qualquer lugar (ou para outro computador).

## Como abrir sem compilar

Precisa do **Python 3.8 ou mais novo**, sem pacotes extras. Dê dois cliques em
**`Iniciar SA Map Studio.bat`** ou, no PowerShell, dentro desta pasta:

```powershell
python serve.py
```

O servidor procura o GTA sozinho. Também dá para passar o caminho: `python serve.py --gta "D:\Jogos\GTA San Andreas"`.

## Gerar o programa

Há dois arquivos para compilar:

- **`Compilar EXE.bat`**: gera ou atualiza **`dist\SA Map Studio`**, mantendo seus projetos, exportações,
  configuração, cache e miniaturas. Use no dia a dia.
- **`Compilar EXE limpo.bat`**: gera **`dist-limpo\SA Map Studio`** do zero, sem nenhum dado carregado
  (sem projetos, cache, miniaturas nem configuração), pronta para enviar a outra pessoa. Não mexe na sua pasta `dist`.

Os dois contam com sistema inteligente de detecção de interpretadores Python no Windows (evitando stubs vazios da Microsoft Store), auto-recuperação de ambientes virtuais (`.venv-build`) corrompidos ou transferidos de outro computador, usam as versões mais recentes do PyInstaller e do pywebview e montam a pasta **`Servidor de Teste`**
dentro do programa, com o gamemode do editor e os arquivos do seu servidor open.mp / SA-MP (copiados do servidor
que você já usa no "Testar no jogo"). Se não houver servidor, coloque o `omp-server.exe`, as `.dll` e a pasta
`components` nessa pasta.

Na primeira vez, o Windows pode mostrar "O Windows protegeu o computador" (o programa não tem
assinatura digital). Clique em "Mais informações" e em "Executar assim mesmo".

## O que ele faz

- **Navegação e Câmera**:
  - Distância de visão configurável até 2500 metros no menu Visão.
  - Botões dedicados nas bordas internas de cada menu lateral para recolhimento e expansão independente, além do atalho **F10** para recolher e restaurar ambos simultaneamente.
  - Modo opcional no menu Visão para recolher automaticamente os menus laterais durante o movimento da câmera (WASD, botão direito ou pan) e restaurar inteligentemente os menus que estavam abertos.
  - Controle de mouse preciso: captura de ponteiro contínua (sem avisos do navegador), recentralização física do cursor via Win32 e suporte a DPI real no Windows.
  - Campo copiável **"Coordenadas do clique do mouse"** no topo do menu lateral direito, com cópia rápida e botão **"Ir até o local"** para teleporte imediato da câmera ao ponto clicado.
  - Câmera centralizada automaticamente olhando para baixo sobre o centro do mapa ao carregar qualquer projeto.
- **Identidade e Ícone**:
  - Novo ícone oficial do projeto estilizado com o clássico objeto ID 19933 (`mkwalloven1`), ícone sentimental dos criadores.
  - Direitos reservados e créditos exibidos na tela de carregamento (boot splash).
- **Projetos e Coexistência**:
  - Coexistência de múltiplos projetos simultâneos no mapa com escolha entre modo **Editável** ou **Não editável** (projetos protegidos têm seleção bloqueada com aviso na tela, e projetos editáveis salvam isoladamente em seus próprios arquivos).
  - Mesclagem de projetos (merge), inversão da ordem da lista de objetos e botão vermelho "Apagar tudo" com confirmação de segurança.
- **Importação e Exportação Pawn**:
  - Importação de qualquer arquivo `.pwn` com **fidelidade total**: preserva anotações (`//`), comentários em bloco (`/* */`), comentários no fim das linhas de código, linhas em branco, cabeçalhos (`#include`), cores em hexadecimal (`0xAARRGGBB`), parâmetros de materiais e textos, draw/stream distance, interior e mundo virtual.
  - Formatação rigorosa de coordenadas: valores float com valor zero depois do ponto formatados de forma limpa como `180.0` e `0.0`, preservando integralmente o formato bruto de arquivos importados.
  - Edição manual do script Pawn antes de salvar a exportação e opção de exportar coordenadas em formato de Array.
- **Armas e Equipamentos**:
  - Catálogo completo de armas do GTA San Andreas e open.mp (IDs 321 a 372) com categoria dedicada "Armas", nomes oficiais e ordenação alfabética de categorias em português.
- **Veículos, Tuning e Cores**:
  - Paleta com todas as 256 cores de veículos do SA-MP/open.mp (incluindo cores novas a partir do ID 128).
  - Tuning de componentes (`AddVehicleComponent`) e paintjobs aplicados e visualizados no 3D em tempo real.
- **Actors e Dinâmicos**:
  - Inserção de Actors diretamente no catálogo com troca de skin em tempo real no menu lateral direito.
  - Actors surgem perfeitamente eretos/em pé e apoiados com os pés na superfície.
  - **Seletor de Animações com Split View**: painel dividido com player de vídeo dinâmico transmitido do open.mp, cache local automático e botão de download do pacote offline (~320 MB).
  - Suporte a `MoveObject` com parâmetros e teste de movimentação no mundo executando 1 ciclo limpo.
  - Suporte a `AttachObjectToObject` com edição visual da posição do objeto filho no próprio mundo 3D.
- **Objetos e Transformações**:
  - **Setas interativas de ajuste fino (▲ / ▼)** nos campos de Posição (X, Y, Z) e Rotação (RX, RY, RZ) com suporte a clique contínuo (auto-repeat), Shift (passo 0.1x), Ctrl (passo 5.0x) e histórico completo de Desfazer/Refazer.
  - Velocidades de movimento e rotação configuráveis no menu lateral direito (0.001x até 10.0x da velocidade padrão).
  - Rotação em grupo: múltiplos objetos selecionados rotacionam juntos presos ao mesmo eixo geométrico comum.
  - Miniaturas ampliadas no catálogo, categorização aprimorada de objetos e apelidos personalizados em favoritos.
  - Destaque visual em tons de vermelho nos objetos do mundo original selecionados para remoção simultânea com `RemoveBuildingForPlayer`.
- **Materiais e Texturas**:
  - O inspetor lista todos os índices do objeto (0 a 15) com a textura original de cada um.
  - Recurso **"Tornar invisível"**: remove a textura tornando o índice 100% invisível no 3D e gerando `SetObjectMaterial(..., 0, "none", "none", 0)`.
  - Substituição de textura (`SetObjectMaterial`), paleta de cores (`materialcolor` com transparência) e texto (`SetObjectMaterialText` com alinhamento, fonte, tamanho e prévia).
- **Câmeras cinematográficas**:
  - Pontos fixos (`SetPlayerCameraPos` + `SetPlayerCameraLookAt`) e movimentos (`InterpolateCameraPos` + `InterpolateCameraLookAt`) com prévia e código pronto.
- **Teleporte e Interiores**:
  - Menu "Ir para" com abas "Locais no mundo" e "Interiores", com lista de mais de 140 interiores mapeados com coordenadas exatas e ativação automática do modo interior.
- **Clima, Horário e Céu Dinâmico**:
  - Controle de clima (0 a 45) e horário com minutos no menu Visão e no modo de teste, com reflexo imediato no céu, luz do sol, sombras e névoa da viewport 3D.
- **Testar no jogo**:
  - Sobe o servidor de teste local integrado (`omp-server.exe` com componentes e DLLs open.mp) e abre o SA-MP já conectado, com sincronização em tempo real das alterações do mapa.
  - Comandos no servidor: `/fly` ou `/voar` (voo livre da câmera estilo noclip), `/map` ou `/mapa` (teleporte ao centro do mapa), `/w [0-45]` (altera clima), `/t [0-23] [minutos]` (altera horário), `/anim`, `/v [modelo]`, `/jetpack`, `/spawn`, `/pos` e `/ajuda`.
- **Logs e Diagnóstico**:
  - Registro de erros em tempo real com botão dedicado na barra superior e janela para consultar e copiar os registros para suporte rápido.
- **Compilação Autônoma e Privilégios de Administrador**:
  - Scripts `Compilar EXE.bat` e `Compilar EXE limpo.bat` com auto-recuperação do ambiente virtual (`.venv-build`), auto-detecção de executáveis Python funcionais e compilação com `--uac-admin`, solicitando privilégios de administrador nativamente no Windows ao abrir o `.exe`.

Aperte `?` dentro do programa para ver todos os atalhos.

## Arquivos do código

- `serve.py`: servidor local (só biblioteca padrão do Python; usa o pywebview para a janela própria).
- `index.html`, `css/`, `js/`: o editor. `js/ui/` é a interface, `js/editor/` o núcleo, `js/world/` o mapa.
- `js/formats/`: leitores dos formatos do GTA (IMG, IDE, IPL, DFF, TXD).
- `servidor-teste/`: gamemode do "Testar no jogo" (`samapstudio.pwn`, compilado sem warnings).
- `js/vendor/`: Three.js r186. `fonts/`: fonte Barlow (licença SIL OFL).

A rotação segue a convenção do SA-MP (ordem Z, X, Y), então o que você vê no editor é o que aparece no servidor.

---

© 2026 Rafael_Hurley e Walter_Correa. Todos os direitos reservados.

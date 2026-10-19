// "Novidades e documentação": histórico de versões, todos os recursos do editor,
// data e hora da última compilação e os direitos reservados.
import { app, $, esc } from './common.js';

export const AUTHORS = 'Rafael_Hurley e Walter_Correa';

const CHANGELOG = [
  {
    version: '3.14.0', date: '19/10/2026', items: [
      'Barras circulares na SA Progress Bar Pro, escolhidas no próprio CreatePlayerProgressBar (parâmetro style): anel de segmentos que acendem do topo, em sentido horário ou anti-horário (PB_STYLE_RING, com a quantidade de segmentos), e círculo que cresce do centro (PB_STYLE_CIRCLE).',
      'Editor de TextDraws: campo Modelo (Barra, Anel de segmentos, Círculo) e Segmentos, com prévia, aviso de quantas PlayerTextDraws o anel usa, exportação, importação e servidor de teste.',
      'A include documenta o que acontece na criação das barras circulares, os recursos usados e as limitações.',
    ],
  },
  {
    version: '3.13.0', date: '19/10/2026', items: [
      'SA Progress Bar Pro toda em inglês e documentada: cada função tem a descrição dos parâmetros e o topo da include lista todas as funções e configurações.',
      'Novas funções SetPlayerProgressBarSize e GetPlayerProgressBarSize (largura e altura juntas).',
      'Parâmetros opcionais com valor padrão: a piscada, a cor, a cor da borda, a borda, o valor máximo e a direção podem ser omitidos para usar o padrão.',
      'Trocar a cor da barra ou da borda não recria mais as TextDraws (sem piscar na tela).',
    ],
  },
  {
    version: '3.12.0', date: '19/10/2026', items: [
      'Toda barra de progresso tem borda: de 0,5 a 5,0, com casas decimais, e a barra não fica menor do que a borda mínima precisa.',
      'Cor da borda das barras escolhida na criação (CreatePlayerProgressBar) ou depois (SetPlayerProgressBarBorderColour); sem cor, a borda fica preta.',
      'A piscada também pode trocar a cor da borda (último parâmetro de BlinkPlayerProgressBar); sem essa cor, a borda fica como está. A prévia do editor mostra as duas.',
      'Velocidade de movimento e rotação dos objetos com casas decimais, de 0,001 a 10,0 (padrão 1,0), no lugar da lista fixa.',
    ],
  },
  {
    version: '3.11.1', date: '19/10/2026', items: [
      'Borda das barras de progresso nunca maior do que a barra: o limite acompanha a largura e a altura e sempre sobra 1 unidade de interior. Antes, uma borda grossa numa barra baixa cobria tudo de preto, no editor e no jogo.',
      'Opção de cor da piscada reorganizada: a cor só aparece quando "Piscar na cor da barra" está desmarcado.',
    ],
  },
  {
    version: '3.11.0', date: '19/10/2026', items: [
      'A include de barras agora se chama SA Progress Bar Pro (progressbarpro.inc).',
      'Barras que piscam: BlinkPlayerProgressBar(playerid, barra, intervalo, duração, cor), com intervalo e duração em milissegundos; sem cor, a barra pisca na própria cor, apagando e acendendo. O editor de TextDraws mostra a piscada na prévia e exporta, importa e testa no servidor com ela.',
      'Borda escolhida na criação da barra (último parâmetro de CreatePlayerProgressBar, de 0 a 4). O editor não aceita valores fora dos limites e a própria include usa o limite se o código pedir mais ou menos.',
      'O ícone do editor volta a aparecer na barra de tarefas do Windows.',
    ],
  },
  {
    version: '3.10.1', date: '19/10/2026', items: [
      'Bordas das barras de progresso iguais nos quatro lados no jogo: uma unidade de TextDraw tem 3,00 px de largura e 2,41 px de altura em 1920x1080, então a progress3 usa borda vertical 1,25 vez a horizontal (3 px em todos os lados em 16:9).',
      'A prévia do editor de TextDraws pinta as barras com a mesma regra de pixel do jogo, mostrando a espessura real de cada borda.',
    ],
  },
  {
    version: '3.10.0', date: '19/10/2026', items: [
      'Nova include progress3.inc: as barras de progresso usam sprites com posição, largura e altura exatas, iguais em qualquer resolução, e borda interna da mesma espessura dos quatro lados. As funções são as mesmas da progress2, então o código antigo continua funcionando.',
      'Correções em relação à progress2: mudar o valor não mostra mais uma barra escondida, a parte cheia some quando o valor é zero e nunca passa da borda, e a falta de TextDraws livres é tratada.',
      'O editor de TextDraws desenha as barras exatamente como a progress3 monta no jogo, e o código exportado e o servidor de teste passam a usar a progress3.',
    ],
  },
  {
    version: '3.9.3', date: '19/10/2026', items: [
      'Textos em objetos iguais ao jogo: o tamanho da letra segue a regra do SA-MP (o tamanho é a altura da linha, não da letra), com as medidas de cada letra tiradas do próprio Windows, como o jogo faz; textos alinhados à esquerda ou à direita ficam no topo do material, e o texto recebe a cor e a luz do objeto (nas placas do SA-MP fica acinzentado, como no jogo).',
      'Editar o texto de um objeto não apaga mais o que já estava escrito: abrir a aba Texto ou trocar de índice só carrega o texto, e nada é escrito até você alterar algo.',
      'O código exportado avisa no cabeçalho quando o projeto tem barras de progresso e precisa da include progress2.',
    ],
  },
  {
    version: '3.9.2', date: '19/10/2026', items: [
      'Texturas dos objetos do SA-MP corrigidas: cerca de 450 modelos (portões, placas, tubos, rampas, casas e outros) apareciam com uma só textura cinza; agora cada parte usa a textura certa, e as miniaturas foram refeitas.',
      'Importar sem marcar "Substituir o projeto atual" cria um projeto novo com o nome do arquivo, em vez de misturar os itens no projeto aberto.',
      'O campo de nome das Barras de Progresso agora se chama apenas Nome.',
    ],
  },
  {
    version: '3.9.1', date: '19/10/2026', items: [
      'TextDraws exportadas com as variáveis textdraw_0, textdraw_1 e barras de progresso com progress_0, progress_1 e assim por diante, com o nome dado no editor como comentário no fim da linha (lido de volta na importação).',
      'Barras novas começam com o nome progress_N; a barra do mapa de exemplo se chama progress_0.',
    ],
  },
  {
    version: '3.9.0', date: '19/10/2026', items: [
      'Nome nas Barras de Progresso: cada barra pode ter um nome, usado como nome da variável no código exportado.',
      'Importação de Barras de Progresso Mais Completa: reconhece argumentos nomeados (.colour, .width, .height, .max, .direction), cores decimais negativas, expressões e variáveis em arrays ou enums, usando o nome da variável como nome da barra.',
      'Botões de tipos de TextDraw organizados em grade, todos visíveis dentro da janela.',
      'Botão Concluir das janelas de TextDraws, GangZones e MapIcons com espaço até a borda.',
      'Mapa de exemplo com uma barra de progresso.',
    ],
  },
  {
    version: '3.8.0', date: '19/10/2026', items: [
      'Barra de Progresso (progress2.inc): novo tipo no editor de TextDraws com largura, altura, cor, valor máximo, valor atual e direção (direita, esquerda, para cima e para baixo), desenhada exatamente como a include monta no jogo.',
      'Exportação e importação de CreatePlayerProgressBar, SetPlayerProgressBarValue e ShowPlayerProgressBar.',
      'Servidor de teste com a progress2.inc: as barras aparecem para o jogador ao nascer.',
    ],
  },
  {
    version: '3.7.0', date: '19/10/2026', items: [
      'Retomar de Onde Parou: o projeto guarda os itens que estavam selecionados no último salvamento; ao abrir de novo, o editor seleciona esses itens, ativa o gizmo e leva a câmera até ele.',
      'Sem itens do projeto selecionados (nada selecionado, objeto do mundo, item de projeto coexistente ou item apagado), o projeto abre focando no item mais próximo do centro.',
    ],
  },
  {
    version: '3.6.2', date: '19/10/2026', items: [
      'Botão 3DTexts na barra superior.',
    ],
  },
  {
    version: '3.6.1', date: '19/10/2026', items: [
      'Nova vista de câmera do mapa de exemplo (Example Map) na primeira abertura.',
    ],
  },
  {
    version: '3.6.0', date: '19/10/2026', items: [
      'Mapa de Exemplo: na primeira vez que o editor abre, ele carrega o projeto Example Map na câmera salva nele.',
      'Ajuste Fino pelas Setas: nas janelas de MapIcons, TextDraws e GangZones as setas movem o item selecionado (1 unidade, 0,1 com Shift); enquanto essas janelas estão abertas, as setas não mexem no editor principal.',
      'Contorno e Sombra das TextDraws viraram caixas de ligar e desligar (desligadas por padrão).',
      'Nome da GangZone atualiza na lista e no mapa enquanto é digitado.',
    ],
  },
  {
    version: '3.5.5', date: '19/10/2026', items: [
      'Nova vista inicial da câmera ao abrir um projeto vazio pela primeira vez.',
    ],
  },
  {
    version: '3.5.4', date: '19/10/2026', items: [
      'Registros mais limpos: o monitor temporário de desempenho do redimensionamento foi retirado.',
    ],
  },
  {
    version: '3.5.3', date: '19/10/2026', items: [
      'Mapa 3D volta a acompanhar a janela ao redimensionar, sem pausar o desenho.',
      'Registro de Desempenho: cada redimensionamento da janela e cada parada da página ficam anotados nos Registros (duração, quadros, maior pausa e tarefas longas) para diagnosticar travamentos.',
    ],
  },
  {
    version: '3.5.2', date: '19/10/2026', items: [
      'Selecionar Todo o Projeto no Inspetor: o botão Projeto também leva a câmera até as setas de edição.',
      'Cache Sempre na Pasta de Dados: miniaturas, índice de texturas, radar e animações baixadas não são mais gravados dentro da pasta do código-fonte.',
    ],
  },
  {
    version: '3.5.1', date: '19/10/2026', items: [
      'Barra Superior Adaptável: os rótulos dos botões aparecem sempre que cabem e somem um a um, só quando falta espaço, priorizando os mais usados.',
      'Redimensionamento sem Travamentos: as listas de objetos e texturas só são redesenhadas quando o trecho visível muda.',
      'Câmera ao Abrir e Importar: calcula o centro de todos os itens do projeto e foca no item mais próximo desse centro.',
      'Mover Todo o Projeto: a câmera vai direto até as setas de edição.',
      'Sprite splash1 de volta ao catálogo de TextDraws.',
    ],
  },
  {
    version: '3.5.0', date: '19/10/2026', items: [
      'Salvamento ao Fechar o Programa: ao fechar a janela do SA Map Studio, todos os projetos abertos são salvos antes de encerrar.',
      'Salvamento ao Fechar os Editores: as alterações feitas nas janelas de TextDraws, MapIcons e GangZones são salvas ao fechar pelo X, pelo botão Concluir ou pela tecla Esc.',
      'Importação sem Seleção Automática: depois de importar, nenhum item fica selecionado; a câmera apenas vai até o mapa importado.',
      'Ícone do Programa: o ícone oficial aparece nas caixas de confirmação e ficou maior na barra superior.',
    ],
  },
  {
    version: '3.4.1', date: '19/10/2026', items: [
      'TextDraws Iguais ao Jogo: o editor desenha os textos com as fontes do próprio GTA SA e calcula tamanho das letras, quebra de linha, alinhamento e caixa exatamente como o jogo, na tela 640x448 do SA-MP em 16:9.',
      'Mesmos Valores em Todo Lugar: editor, código Pawn exportado e servidor de teste usam exatamente os mesmos parâmetros de TextDrawLetterSize e TextDrawTextSize, sem ajustes escondidos.',
      'Campos de Caixa Mais Claros: os rótulos de Text Size mudam conforme o alinhamento (fim da caixa, largura ou início da caixa).',
      'Projetos Antigos Convertidos: TextDraws salvas em versões anteriores são convertidas automaticamente para os valores do SA-MP ao abrir o projeto.',
      'Caixa Alinhada à Direita como no Jogo: no cliente SA-MP 0.3.7 a caixa com alinhamento à direita vai da borda esquerda da tela até o texto; o editor agora mostra exatamente isso e avisa ao ativar.',
      'Seleção Precisa no Editor de TextDraws: clicar em qualquer ponto da TextDraw seleciona e permite arrastar, inclusive nas que ficam no alto da tela.',
      'Compilação sem abrir a pasta do programa ao terminar.',
    ],
  },
  {
    version: '3.4.0', date: '18/10/2026', items: [
      'Executável Único: o programa inteiro vem compactado em um só SA Map Studio.exe, que na primeira execução cria a pasta sa-map-studio com barra de progresso e ícone animado, e nas seguintes abre o editor direto.',
      'Configuração Automática do GTA: com o executável dentro da pasta de instalação do GTA San Andreas, a pasta do jogo é reconhecida e configurada sozinha, sem pedir a instalação ao abrir.',
      'Detecção do GTA Mais Confiável: prioridade para a pasta padrão de instalação, depois registro do Windows e outros discos; sem instalação válida, a pasta padrão fica sugerida e o aviso aparece só ao avançar. A detecção apenas lê as pastas do jogo, sem alterar nada.',
      'Abertura sem Travamentos: falha ao ler os arquivos do jogo volta para a escolha da pasta com a explicação do problema.',
      'Funcionamento em Program Files: dados do navegador interno movidos para uma pasta do usuário quando o programa está em uma pasta protegida do Windows.',
      'Ícones Oficiais Atualizados: novo ícone com animação sincronizada ao carregamento e metadados de versão no executável.',
      'TextDraws no open.mp: alinhamento e caixas ajustados para ficarem iguais ao editor dentro do servidor de teste.',
      'GangZones e MapIcons: duplicação sequencial e encaixe aprimorados.',
      'Câmeras: nomes preservados na importação e exportação e callback unificada com cases.',
      'Desfazer ao Arrastar: histórico corrigido ao mover elementos arrastando.',
      'Interface sem Reticências: textos de carregamento e campos de busca mais limpos.',
    ],
  },
  {
    version: '3.3.0', date: '18/10/2026', items: [
      'Caixas de TextDraw Proporcionais: cálculo automático e justo de TextSize em torno do texto com padding ao ativar "Ativar Caixa", eliminando caixas gigantes em tela cheia.',
      'Alinhamentos de TextDraws com Caixa no Servidor de Teste: cálculo exato de TextDrawTextSize para alinhamentos à Esquerda, Centro e Direita segundo a especificação do SA-MP/open.mp.',
      'Isolamento Completo de Desfazer/Refazer: janelas de MapIcons, GangZones e TextDraws com histórico local independente; reset automático ao abrir diálogos e ao importar projetos para proteger o mapa contra Ctrl+Z acidental.',
      'Importação de Câmeras Pawn: leitura e importação de posições estáticas e interpolações de câmera (SetPlayerCameraPos, SetPlayerCameraLookAt, InterpolateCameraPos, InterpolateCameraLookAt).',
      'Remoção de Sons na Importação e Exportação: sons mantidos como ferramenta de teste e prévia sem inclusão de linhas ou cabeçalhos no código Pawn do mapa.',
      'Persistência e Exportação de Nomes de GangZones: salvamento imediato do nome ao digitar ou pressionar Enter e exportação/importação sincronizada via comentários inline.',
      'Exportação Pawn sem Duplicação de Seções: eliminação de repetições de comentários de grupo (Textos 3D, GangZones, Pickups).',
    ],
  },
  {
    version: '3.2.0', date: '18/10/2026', items: [
      'Aperfeiçoamento do Editor de TextDraws: suporte nativo a tags de cores do GTA SA (~r~, ~g~, ~b~, ~w~, ~y~, ~p~, ~l~, ~s~, ~h~) e símbolos direcionais (~<~, ~>~, ~u~, ~d~), renderização e exportação Pawn precisa de alinhamentos (Esquerda, Centro, Direita) e modelo Caixa pura sem caracteres de texto.',
      'Duplicação de GangZones e MapIcons: novos botões "Duplicar" e suporte aos atalhos universais Ctrl+C e Ctrl+D nos editores 2D e inspetores, criando a cópia no espaço livre adjacente com seleção imediata.',
      'Movimentação Direta no Terreno: arraste direto do objeto ou elemento selecionado pelo terreno no plano horizontal (X e Y) preservando a cota Z e respeitando o alinhamento de grade.',
      'Proteção Estrutural de Acoplamento: bloqueio de acoplamento para objetos pais que já possuam outros objetos acoplados a eles, prevenindo inconsistências e ciclos de hierarquia.',
      'Eixo de Edição Padrão: manipulador do editor configurado por padrão no modo "Eixo: Objeto" (coordenadas locais).',
      'Textos em Objetos em Tempo Real: renderização e atualização dinâmica de textos aplicados sobre a superfície de objetos na viewport 3D.',
      'Lista de Projetos com Estatísticas Completas: exibição detalhada de totais de cada categoria (Objetos, Veículos, Actors, Pickups, Textos 3D, GangZones, MapIcons, Checkpoints, TextDraws e Removidos) na seleção de projetos.',
      'Exportação Pawn Otimizada: geração limpa e sem duplicação de comentários de grupos no código de carregamento do mapa.',
    ],
  },
  {
    version: '3.1.0', date: '17/10/2026', items: [
      'Catálogo de Sons Oficial (PlayerPlaySound): catálogo completo com 2.620 áudios oficiais, reprodução e prévia com extração de bancos GENRL/SA-MP, 9 categorias temáticas e cabeçalho fixo com rolagem independente.',
      'Suporte Completo a Checkpoints e Race Checkpoints: suporte a Checkpoints normais proporcionais e Race Checkpoints (tipos 0 a 4), argolas aéreas com torus, setas direcionais dinâmicas conectadas ao próximo ponto, cilindros e discos de chegada quadriculados, duplicação direcional e preservação estrita de modelo.',
      'Editor Interativo de MapIcons (SetPlayerMapIcon): janela de edição visual com mapa de radar de San Andreas, 64 ícones (IDs 0 a 63), estilos (0 a 3), posicionamento automático na superfície do terreno, atalhos de histórico (Desfazer/Refazer com Ctrl+Z/Ctrl+Y) e exclusão por Delete.',
      'Tuning de Veículos Aperfeiçoado: alinhamento geométrico e tabela oficial de pares de saias laterais do GTA San Andreas (carregando malhas nativas sem distorções), sincronização de aerofólios no servidor de teste (open.mp) e destaque visual integrado de todos os componentes com o veículo.',
      'Alternador de Modos do Gizmo (Mover / Girar): botão flutuante translúcido na cena com área de clique ativa em 100% da superfície do botão e atalhos rápidos G e R.',
      'Barra Superior Responsiva e Adaptável: exibição completa de todos os botões e rótulos em tela cheia/maximizada com ajuste progressivo e fluido conforme o tamanho da janela é reduzido.',
    ],
  },
  {
    version: '3.0.0', date: '15/10/2026', items: [
      'Filtragem Inteligente de Tuning, Paintjobs e Cores de Veículos: compatibilidade rigorosa com o modelo do veículo baseada nas regras oficiais  (IsVehicleValidForColor, IsVehicleValidForModding, IsPaintjobValidForVehicle e IsModValidForVehicle). No inspetor de veículos, agora são exibidos exclusivamente os componentes de tuning (spoilers, capôs, tetos, saias, escapamentos, nitro, rodas, som estéreo, hidráulica), paintjobs (0 a 2) e seletores de cor compatíveis com o modelo selecionado.',
      'Aplicação Real de Tuning e Paintjobs no Servidor de Teste: integração de AddVehicleComponent e ChangeVehiclePaintjob no gamemode do servidor de teste (samapstudio.pwn/amx). Ao testar o mapa no jogo, todos os veículos surgem com os componentes de modding instalados e os paintjobs perfeitamente aplicados.',
      'Suporte Completo a Textos 3D (3D Text Labels): criação visual de labels 3D (Create3DTextLabel / CreateDynamic3DTextLabel) na cena com efeito billboard voltado para a câmera, suporte a múltiplas linhas (\\n), tags de cores embutidas ({RRGGBB}), paleta oficial SA-MP e seletor hexadecimal, ajuste de distância de visão (draw distance), teste de linha de visão (testLOS), mundo virtual e interior, salvamento/carregamento no projeto, importação/exportação Pawn e sincronização automática no servidor de teste.',
      'Suporte Completo a Pickups (CreatePickup / CreateDynamicPickup): catálogo categorizado de pickups pré-definidos  (vida, colete, dinheiro, propriedades, armas IDs 321 a 372 e itens), malha 3D animada com rotação contínua na viewport, inspetor com seleção de tipo de pickup, tempo de respawn, mundo e interior, salvamento/carregamento no projeto, importação/exportação Pawn e sincronização no servidor de teste.',
      'Novo Editor Interativo de GangZones com Radar Map: diálogo modal completo exibindo o mapa de radar oficial do GTA San Andreas (-3000 a +3000), navegação por pan/zoom, desenho de zonas arrastando o mouse, sistema magnético inteligente de encaixe/alinhamento de bordas (snap) entre zonas adjacentes com guias visuais ciano, seletor de cores RGBA com controle de transparência/opacidade, projeção plana 3D da zona no chão do mundo, salvamento/carregamento no projeto, exportação Pawn (GangZoneCreate / GangZoneShowForAll) e renderização no servidor de teste.',
      'Novo Editor Visual de TextDraws (TextDraw Editor): ambiente de edição de TextDraws na resolução nativa 640x480 do SA-MP com guias de margem segura, suporte a textos e caixas com cores e opacidade personalizadas, seleção de fontes (0 a 5), sombra (shadow), contorno (outline), alinhamento (left, center, right), espaçamento de letras (letter size), tamanho de texto/caixa (text size), pré-visualização real de modelos 3D com miniaturas para Font 5 (veículos, skins e objetos com rotação e zoom configuráveis), arrastar e redimensionar interativo por alças visuais e exportação limpa de scripts Pawn prontos para uso.',
      'Otimização Inteligente de CPU e Taxa de Quadros (Dynamic FPS Throttling): eliminação do desperdício de CPU ao limitar dinamicamente os quadros da viewport (60 FPS durante movimentação suave da câmera, 30 FPS em repouso com animação fluida de pickups, 5 FPS com modais abertos e 2 FPS em segundo plano/minimizado), reduzindo o consumo de CPU de ~15% para patamares mínimos e ecológicos.',
      'Correção do Menu Superior e Responsividade Total: eliminação da sobreposição entre ferramentas e ações ("Ir para", "Desfazer/Refazer") em janelas restauradas ou não maximizadas através de restrições rígidas de flexbox e colapso responsivo progressivo de rótulos.',
      'Correção na Criação de Elementos: correção na chamada de registro de labels 3D e pickups no projeto (app.project.add), garantindo inserção instantânea na cena com histórico de desfazer/refazer.',
    ],
  },
  {
    version: '2.9.1', date: '15/10/2026', items: [
      'Correção dos Submenus da Barra Superior e do Menu "Ir para": remoção de restrições de overflow na barra superior e prevenção de auto-rolagem no campo de coordenadas do menu "Ir para" (Ctrl+G), garantindo que todos os menus suspensos ("Encaixe", "Ir para", "Visão") abram e flutuem perfeitamente sobre a viewport sem deslocar ou ocultar os botões da barra.',
      'Ocultação Automática do Cursor do Mouse durante Movimentação da Câmera: o ponteiro do mouse agora é ocultado automaticamente ao rotacionar a visão (botão direito), arrastar a tela (botão do meio) ou navegar livremente com teclado/mouse, reaparecendo instantaneamente assim que a movimentação da câmera é interrompida.',
      'Remoção da Função Obsoleta "Preparar miniaturas" no Catálogo: remoção definitiva do botão redundante e da barra de progresso no painel de objetos, uma vez que todas as 15.956 miniaturas estão 100% pré-geradas e armazenadas localmente no disco (Dados/cache/miniaturas/objetos) com carregamento instantâneo via scroll virtual.',
      'Correção Crítica de Renderização de Texturas (Three.js WebGL): eliminação do erro TypeError Cannot read properties of undefined (reading width) em uploadTexture, preservando a integridade das estruturas de mipmaps das texturas DXT e RGBA em memória, evitando travamentos e falhas visuais na renderização dos objetos do mapa.',
    ],
  },
  {
    version: '2.9.0', date: '15/10/2026', items: [
      'Catálogo Completo de Armas : inclusão de 46 armas e itens especiais (IDs 321 a 372) com miniaturas 3D e categoria dedicada "Armas", com ordenação alfabética completa das categorias.',
      'Ajuste Fino com Setas Direcionais nos Eixos (▲ / ▼): botões interativos de passo para Posição (X, Y, Z) e Rotação (RX, RY, RZ) com suporte a clique contínuo (auto-repeat), Shift (passo fino 0.1x), Ctrl (passo rápido 5.0x) e histórico completo de Desfazer/Refazer.',
      'Recurso Tornar Invisível em Materiais: botão para remover a textura de qualquer índice tornando a respectiva parte da malha 100% invisível no 3D e exportando o formato canônico SetObjectMaterial(..., 0, "none", "none", 0).',
      'Formatação Rigorosa de Coordenadas Pawn: valores float com valor zero depois do ponto agora são exportados de forma limpa como 180.0 e 0.0, preservando integralmente a representação bruta para dados importados não editados.',
      'Recolhimento Independente das Barras Laterais: novos botões nas bordas internas dos menus para recolher ou expandir a barra esquerda ou direita de forma individual, mantendo atalho F10 para alternância simultânea e memória de estado na câmera.',
      'Teleporte Rápido para Coordenadas de Clique: botão "Ir até o local" no topo do inspetor para navegar a câmera instantaneamente até o ponto do terreno clicado pelo mouse.',
      'Arquitetura de Miniaturas em Disco Local e Otimização Total de VRAM: pré-empacotamento de 15.956 miniaturas WebP (~15 MB) na pasta local Dados/cache/miniaturas para leitura 100% direta do disco sem carregar malhas 3D no boot, preservação de texturas compartilhadas do mundo (evitando asfalto/terreno pretos), pixel ratio 1.0 e descarte estrito de geometrias, reduzindo o consumo de memória de >3,1 GB para níveis mínimos e estáveis.',
      'Compilação Limpa e Autônoma do Executável (.exe): script de compilação aprimorado com auto-recuperação de ambientes virtuais (.venv-build) corrompidos ou transferidos entre computadores, detecção multi-caminho de interpretadores Python funcionais (evitando stubs inválidos da Microsoft Store) e suporte à compilação limpa 100% autônoma (dist-limpo).',
      'Elevação Automática de Privilégios (Admin / UAC): inclusão da flag --uac-admin na compilação via PyInstaller, gravando nativamente requireAdministrator no manifesto PE do executável para garantir permissões totais de leitura/escrita na pasta do jogo, controle de processos e portas sem necessidade de configuração manual do Windows.',
    ],
  },
  {
    version: '2.8.0', date: '14/10/2026', items: [
      'Novo Seletor de Animações com Split View: painel dividido interativo com player de vídeo integrado para visualização imediata da animação em execução.',
      'Transmissão e Cache Local de Vídeos: streaming dinâmico direto  em formato WebM leve com armazenamento local automático em cache para acesso offline instantâneo.',
      'Recurso Baixar Pacote Offline: download em lote em segundo plano de todas as animações (~320 MB) com progresso em tempo real, percentual e opção de pausar.',
      'Categorização Inteligente de Animações: abas por contexto ("Populares", "Conversas & Gestos", "Sentado & Deitado", "Danças", "Polícia & Segurança", "Combate & Armas", "Esportes & Academia", "Bar, Fumo & Lazer", "Todas") com busca rápida.',
      'Seleção Firme e Fixada: seleção estável ao clicar nos cards sem interferência do movimento do cursor do mouse, com aplicação direta ou por duplo clique.',
      'Novos Comandos no Servidor de Teste (/w e /t): comando /w (ou /weather, /clima) para definir o clima (0 a 45) e comando /t (ou /time, /hora) para definir horário e minutos (ex: /t 12 ou /t 22:30) com sincronização em tempo real para todos os jogadores.',
      'Comando /ajuda no Servidor de Teste: listagem completa de comandos disponíveis (/fly, /map, /w, /t, /v, /anim, /jetpack, /spawn, /pos).'
    ],
  },
  {
    version: '2.7.0', date: '14/10/2026', items: [
      'Catálogo completo de animações: 1.872 presets organizados por biblioteca com campo de busca em tempo real (nome, lib e ação) no painel de Actors.',
      'Posicionamento e centralização inteligente da janela na tela: dimensionamento dinâmico que se adapta à área útil de trabalho (work area), evitando cortes ou bordas ocultas em qualquer monitor.',
      'Orientação dos eixos do manipulador esclarecida: botão "Eixos: Mundo" vs "Eixos: Objeto" com tooltips detalhados explicando o impacto da manipulação global vs local alinhada à rotação dos objetos.',
      'Opção "Trocar pasta do GTA" relocalizada para o menu "Testar no jogo", mantendo todas as configurações de inicialização e teste integradas em um só diálogo.',
      'Novo Sistema de Logs e Diagnóstico: captura automática de erros JavaScript, promessas rejeitadas e mensagens de console, com gravação em sa-map-studio.log e botão dedicado na interface com contador visual.',
      'Diálogo de Diagnóstico com visualização em tempo real e botão de "Copiar registros" em um clique para suporte e resolução rápida de problemas.'
    ],
  },
  {
    version: '2.6.0', date: '14/10/2026', items: [
      'Menu "Ir para" totalmente reestruturado e dividido em duas abas: "Locais no mundo" e "Interiores", com busca em tempo real e filtros rápidos por categoria.',
      'Lista completa de interiores do GTA San Andreas e integrada com coordenadas precisas de teleporte, identificação do Interior ID e ativação automática do modo de interiores.',
      'Configuração de clima (0 a 45, padrão 10) e horário com minutos (padrão 10:00) diretamente no diálogo "Testar o mapa no jogo", sincronizados com o servidor de teste e o jogador.',
      'Configuração de clima e horário adicionada ao menu Visão, refletindo instantaneamente na viewport 3D do editor (céu dinâmico, ciclo dia/noite, névoa volumétrica e iluminação do sol e ambiente) em sincronia total com o modo de teste.',
      'Novos comandos /fly e /voar no servidor de teste para alternar o voo livre da câmera (noclip suave por teclado/mouse), retornando à posição e ângulo exatos onde foi ativado ao sair.',
      'Novos comandos /map e /mapa no servidor de teste para teleporte imediato do jogador ou veículo ao centro do mapa em teste.',
      'Catálogo refinado de Actors: seleção inicial padrão unificada com troca e pré-visualização de skins em tempo real no menu lateral direito, com alocação correta sobre superfícies sem enterrar pés ou deitar.',
    ],
  },
  {
    version: '2.5.0', date: '14/10/2026', items: [
      'Limite da distância de visão expandido para até 2500 metros no menu Visão, com streaming e renderização de névoa proporcionais.',
      'Botão dedicado na barra superior e atalho (F10) para recolher os menus laterais até as bordas da tela e restaurá-los, liberando toda a tela para edição.',
      'Nova opção no menu Visão para recolher automaticamente os menus laterais durante a movimentação da câmera (WASD, botão direito ou pan) e restaurá-los ao parar.',
      'Controle do mouse aprimorado: uso de Pointer Lock e recentralização automática do cursor no centro da viewport ao soltar o botão, impedindo que o ponteiro escape para os cantos da tela.',
      'Novo campo copiável "Coordenadas do clique do mouse" no topo do menu lateral direito, exibindo em tempo real as coordenadas clicadas no mapa com botão de cópia rápida.',
      'Desfazer e Refazer (Undo/Redo) com suporte global inteligente: reverte e reaplica alterações no projeto principal ou projetos coexistentes editáveis de acordo com a ordem das modificações.',
      'Posicionamento de câmera otimizado ao carregar e importar mapas: enquadramento próximo e equilibrado sobre o centro do mapa/itens.',
      'Suporte completo a Actors no servidor de teste: criação automática via CreateActor e ApplyActorAnimation.',
      'Novo ícone oficial do projeto com visão frontal perfeitamente centralizada e limpa do forno mkwalloven1, sem badges de ID.',
      'Inclusão dos direitos reservados e créditos oficiais abaixo da barra de progresso na tela de inicialização (boot splash).',
      'Sistema dinâmico de versões exibindo a data e hora exata da compilação.'],
  },
  {
    version: '2.4.1', date: '14/10/2026', items: [
      'Coexistência de múltiplos projetos com opção Editável ou Não editável (bloqueio total contra edições acidentais nos projetos não-editáveis com aviso na tela).',
      'Importação fiel de mapas Pawn (.pwn) de qualquer padrão: preserva 100% dos comentários (// e /* */), anotações no fim das linhas de código, linhas em branco, cabeçalhos (#include), cores de materiais em hexadecimal (0xAARRGGBB), parâmetros de textos, draw/stream distance, interior e mundo virtual.',
      'Câmera centralizada automaticamente olhando para baixo sobre o mapa ao carregar ou alternar projetos.',
      'Correção na orientação e spawn dos Actors: surgem perfeitamente eretos/em pé e apoiados com os pés na superfície.',
      'Servidor de teste com omp-server.exe, DLLs e componentes empacotados na raiz da distribuição e sincronização em tempo real das alterações do editor.',
    ],
  },
  {
    version: '2.4.0', date: '14/10/2026', items: [
      'Redução e otimização profunda do consumo de memória RAM do processo WebView2 / navegador durante navegação e carregamentos em segundo plano.',
      'Paleta completa de cores de veículos do SA-MP (0 a 255), incluindo suporte às novas cores a partir do ID 128.',
      'Pré-visualização em tempo real de tuning, paintjobs e cores dos veículos na viewport 3D do editor.',
      'Categorias Texturizações e Textos separadas de Objetos removidos na aba Projeto.',
      'Renomeação padronizada para "Remover objeto" e "Objetos removidos".',
      'Botão para inverter a ordem da lista de objetos (do primeiro para o último e vice-versa).',
      'Botão vermelho "Apagar tudo" com diálogo modal de confirmação de segurança.',
      'Ferramenta para mesclar projetos (merge).',
      'Suporte completo a MoveObject com parâmetros e teste de movimento executando exatamente 1 ciclo sem loop infinito.',
      'Suporte completo a AttachObjectToObject com edição visual da posição do objeto filho diretamente no mundo 3D.',
      'Inserção de Actors disponível diretamente no catálogo por ID de Skin com biblioteca de animações.',
      'Suporte a exportação de coordenadas em formato de Array e edição manual do script Pawn antes de salvar.',
    ],
  },
  {
    version: '2.3.0', date: '13/10/2026', items: [
      'Configurações de velocidade de movimento e rotação movidas para o menu lateral direito junto às coordenadas (0.001x a 10.0x da velocidade padrão).',
      'Seleção de todos os objetos do projeto ativando setas/gizmo de movimentação.',
      'Rotação em grupo: múltiplos objetos selecionados rotacionam juntos presos ao mesmo eixo geométrico comum.',
    ],
  },
  {
    version: '2.2.0', date: '13/10/2026', items: [
      'Destaque visual em tons de vermelho nos objetos do mundo original selecionados.',
      'Seleção múltipla de objetos do jogo e remoção simultânea com RemoveBuildingForPlayer.',
      'Botão de apagar/remover reposicionado no menu lateral logo abaixo da pré-visualização e dados do objeto.',
      'Miniaturas ampliadas no catálogo de objetos e veículos.',
      'Recategorização de objetos do jogo, corrigindo incongruências como paraquedas na categoria de casas/prédios.',
      'Apelidos personalizados para objetos e texturas favoritados.',
      'Propriedades renomeadas para "Stream distance" e "Draw distance".',
    ],
  },
  {
    version: '2.1.0', date: '13/10/2026', items: [
      'Textura trocada cobre a parte do objeto por igual no editor, sem as sombras pintadas no modelo original (igual ao jogo).',
      'Servidor interno mais resistente: não fecha mais por falta de memória num pedido e se recupera sozinho de erros.',
      'Proteção contra baixar um arquivo .img inteiro quando ele tem itens vazios.',
      'Editor usa menos memória ao navegar pelo mapa (texturas não ficam duplicadas e menos modelos guardados).',
      '"Preparar miniaturas" libera a memória enquanto trabalha e não trava mais a tela.',
      'Sinal de vida da página roda em segundo plano: o programa não fecha sozinho se a tela ficar ocupada.',
      'Novo botão "Novidades e documentação", com a data e a hora da compilação.',
      'Pasta "Servidor de Teste" dentro do programa, com o gamemode e o servidor usados pelo "Testar no jogo".',
      'Novo "Compilar EXE limpo.bat": gera uma cópia do programa sem nenhum dado, pronta para enviar a outra pessoa.',
      'Servidor de teste na porta 7777 (padrão do SA-MP), com aviso se a porta já estiver em uso por outro servidor.',
      'Corrigidos prédios brancos (como filler01_law e filler02_law): quando o gta_int.img tem um TXD com o mesmo nome, agora vale o do gta3.img, como no jogo.',
    ],
  },
  {
    version: '2.0.0', date: '13/10/2026', items: [
      'Pasta única "SA Map Studio" com Projetos, Exportados, Dados e Sistema organizados dentro dela.',
      'Objetos e texturas separados por categoria (Móveis, Praia, Prédios e casas, Ruas e estradas, Tijolos e paredes, Madeira...).',
      'Lista de texturas pronta em segundos e miniaturas guardadas no disco.',
      'Editor de materiais do SA-MP: todos os índices do objeto com a textura original, vários índices de uma vez, painel de cores e texto com prévia.',
      'Duplicar e "Posicionar outro igual" criam a cópia no mesmo lugar, já com o gizmo de mover.',
      'Teleporte para coordenadas (Ctrl+G), aceitando SetPlayerPos.',
      'Câmeras fixas e movimentos com InterpolateCameraPos/LookAt, prévia no editor e código Pawn.',
      '"Testar no jogo" com servidor de teste local e o SA-MP abrindo já conectado.',
      'Importação de qualquer arquivo: Pawn, SQLite, JSON, MTA (.map) e IPL, com texturas, textos e câmeras.',
      'Abrir outro projeto salva e fecha o que estava aberto.',
      'Mapa completo: objetos que faltavam (interiores marcados errado) e LODs corrigidos; carregamento priorizando o que está na frente da câmera.',
      'Corrigida a caixa vermelha que ficava no centro dos objetos.',
    ],
  },
  {
    version: '1.0.0', date: '12/10/2026', items: [
      'Primeira versão do SA Map Studio, substituindo o SA-MP Map Construction com interface nova.',
      'Mapa de San Andreas com streaming e LOD, interiores e objetos do SA-MP.',
      'Catálogo com busca, miniaturas, favoritos e recentes; gizmo para mover e girar com encaixe em grade.',
      'Remoção de prédios do mapa (RemoveBuildingForPlayer) e veículos.',
      'Exportação para Pawn e IPL; importação de .pwn; projetos salvos sozinhos; compilação em .exe.',
    ],
  },
];

const FEATURES = [
  ['Navegação e Câmera', [
    'Distância de visão ampliada para até 2500 metros (Visão → Distância de visão).',
    'Botão na barra superior e atalho (F10) para recolher os menus laterais até as bordas da tela e restaurá-los.',
    'Opção para recolher os menus laterais automaticamente durante a movimentação da câmera e restaurá-los ao parar.',
    'Controle do mouse com Pointer Lock e recentralização automática do cursor ao soltar o botão de navegação.',
    'Campo copiável "Coordenadas do clique do mouse" no topo do menu lateral direito, com cópia em 1 clique.',
    'Câmera livre: botão direito + arrastar para olhar, WASD para andar, E/Q para subir e descer, Shift para acelerar.',
    'Centralização automática da câmera olhando para baixo sobre o centro do mapa ao carregar qualquer projeto.',
    'Placa verde com região e coordenadas; clique para teleportar (Ctrl+G), botão direito copia a posição.',
  ]],
  ['Objetos e Transformações', [
    'Aba Objetos com categorias corrigidas, favoritos, apelidos personalizados e miniaturas grandes.',
    'Velocidades de movimento e rotação configuráveis no menu lateral direito (0.001x até 10.0x).',
    'Gizmo de movimentação (G) e rotação (R); eixos do mundo ou locais (L); encaixe em grade e magnético.',
    'Seleção múltipla com rotação em grupo pelo mesmo eixo geométrico comum.',
    'Duplicar (Ctrl+D), colocar no chão (End), girar 90° (X), desfazer (Ctrl+Z) e refazer (Ctrl+Y).',
  ]],
  ['Veículos, Tuning e Cores', [
    'Tuning completo de veículos em tempo real no 3D com salvamento dos componentes (AddVehicleComponent).',
    'Paleta de cores com todos os 256 IDs de cores  (incluindo as novas cores a partir do ID 128).',
    'Pré-visualização e seleção de paintjobs em tempo real diretamente no veículo.',
  ]],
  ['Actors e Dinâmicos', [
    'Inserção de Actors diretamente pelo catálogo com seleção de skins e biblioteca de animações.',
    'Actors posicionados perfeitamente eretos e apoiados com os pés na superfície.',
    'MoveObject completo: teste de movimentação no mundo executando 1 ciclo e salvamento dos parâmetros.',
    'AttachObjectToObject: acoplamento de objetos com edição direta da posição do objeto filho no mundo.',
  ]],
  ['Projetos e Coexistência', [
    'Coexistência de múltiplos projetos abertos simultaneamente com opção Editável ou Não editável.',
    'Projetos não-editáveis são protegidos contra seleção e alteração acidental; editáveis salvam isoladamente.',
    'Mesclagem de projetos (merge) e botão vermelho "Apagar tudo" com confirmação de segurança.',
    'Inversão da ordem da lista de objetos na aba Projeto.',
  ]],
  ['Importação e Exportação Pawn', [
    'Preservação 100% integral do arquivo original: anotações (//), comentários em bloco (/* */), comentários de fim de linha, linhas em branco, cabeçalhos, materiais 0xAARRGGBB e material text.',
    'Edição manual do script Pawn antes de concluir a exportação.',
    'Opção selecionável de exportação de coordenadas em formato de Array.',
  ]],
  ['Materiais (SetObjectMaterial / SetObjectMaterialText)', [
    'O inspetor lista todos os índices do objeto (0 a 15) com a textura original de cada um.',
    'Marque um ou vários índices, ou use a ferramenta Textura (T) e clique na parte do objeto (Ctrl + clique soma índices).',
    'Troque a textura clicando na aba Texturas ou digitando modelid, txdname e texturename.',
    'Painel de cores (materialcolor) com transparência, 0xAARRGGBB e cores recentes.',
    'Texto com tamanho do material, fonte, tamanho, negrito, alinhamento, cor da letra e do fundo, códigos {RRGGBB} e prévia.',
    'Copiar e colar materiais entre objetos; código Pawn de cada objeto no inspetor.',
  ]],
  ['Câmeras', [
    'Câmeras fixas: SetPlayerCameraPos + SetPlayerCameraLookAt a partir da vista atual.',
    'Movimentos: vários pontos com tempo, espera e tipo (CAMERA_MOVE ou CAMERA_CUT), caminho desenhado e prévia.',
    'O código das câmeras vai na exportação, sem warnings.',
  ]],
  ['Testar no jogo', [
    'Sobe um servidor de teste local integrado ( omp-server com DLLs e componentes) e abre o SA-MP já conectado.',
    'Sincronização em tempo real das alterações do mapa com o servidor de teste.',
    'Comandos no jogo: /jetpack, /v [modelo], /spawn e /pos.',
  ]],
];

export function setupAbout() {
  const dlg = $('#dlgAbout');
  $('#btnAbout').onclick = async () => {
    try { app.cfg = { ...app.cfg, ...(await (await fetch('/api/config')).json()) }; } catch { /* usa o que já tem */ }
    render();
    dlg.showModal();
  };
}

function render() {
  const cfg = app.cfg || {};
  const build = cfg.build || {};
  const compileTime = build.builtAt || '14/10/2026 09:30:00';
  if (CHANGELOG[0]) CHANGELOG[0].date = compileTime;
  const when = `Compilado em <b>${esc(compileTime)}</b>`;
  const year = new Date().getFullYear();
  $('#aboutBody').innerHTML = `
    <div class="about-head">
      <svg class="brand-mark big" viewBox="0 0 120 120" aria-hidden="true"><use href="#i-brand-logo"/></svg>
      <div><div class="about-title">SA Map Studio <span class="tag">versão ${esc(cfg.version || CHANGELOG[0].version)}</span></div>
        <div class="about-sub">${when}</div></div>
    </div>
    <section><h3>Novidades</h3>
      ${CHANGELOG.map(v => `<div class="cl-version"><div class="cl-head"><b>${esc(v.version)}</b><span>${esc(v.date)}</span></div>
        <ul>${v.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}
    </section>
    <section><h3>Recursos</h3>
      ${FEATURES.map(([t, list]) => `<div class="feat"><h4>${esc(t)}</h4><ul>${list.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}
    </section>`;
  $('#aboutFoot').textContent = `© ${year} ${AUTHORS}. Todos os direitos reservados.`;
}

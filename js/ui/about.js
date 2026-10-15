// "Novidades e documentação": histórico de versões, todos os recursos do editor,
// data e hora da última compilação e os direitos reservados.
import { app, $, esc } from './common.js';

export const AUTHORS = 'Rafael_Hurley e Walter_Correa';

const CHANGELOG = [
  {
    version: '2.9.0', date: '15/10/2026', items: [
      'Catálogo Completo de Armas do open.mp e GTA SA: inclusão de 46 armas e itens especiais (IDs 321 a 372) com miniaturas 3D e categoria dedicada "Armas", com ordenação alfabética completa das categorias.',
      'Ajuste Fino com Setas Direcionais nos Eixos (▲ / ▼): botões interativos de passo para Posição (X, Y, Z) e Rotação (RX, RY, RZ) com suporte a clique contínuo (auto-repeat), Shift (passo fino 0.1x), Ctrl (passo rápido 5.0x) e histórico completo de Desfazer/Refazer.',
      'Recurso Tornar Invisível em Materiais: botão para remover a textura de qualquer índice tornando a respectiva parte da malha 100% invisível no 3D e exportando o formato canônico SetObjectMaterial(..., 0, "none", "none", 0).',
      'Formatação Rigorosa de Coordenadas Pawn: valores float com valor zero depois do ponto agora são exportados de forma limpa como 180.0 e 0.0, preservando integralmente a representação bruta para dados importados não editados.',
      'Recolhimento Independente das Barras Laterais: novos botões nas bordas internas dos menus para recolher ou expandir a barra esquerda ou direita de forma individual, mantendo atalho F10 para alternância simultânea e memória de estado na câmera.',
      'Teleporte Rápido para Coordenadas de Clique: botão "Ir até o local" no topo do inspetor para navegar a câmera instantaneamente até o ponto do terreno clicado pelo mouse.',
      'Arquitetura de Miniaturas em Disco Local e Redução Drástica de Memória: pré-empacotamento de 15.956 miniaturas WebP (~15 MB) na pasta local Dados/cache/miniaturas, eliminando o carregamento pesado de 16 mil modelos 3D no boot, com leitura 100% direta do disco e descarte imediato de malhas e texturas em lotes sob demanda, reduzindo o consumo de memória de mais de 3,1 GB para ~126 MB.',
      'Compilação Limpa e Autônoma do Executável (.exe): script de compilação aprimorado com auto-recuperação de ambientes virtuais (.venv-build) corrompidos ou transferidos entre computadores, detecção multi-caminho de interpretadores Python funcionais (evitando stubs inválidos da Microsoft Store) e suporte à compilação limpa 100% autônoma (dist-limpo).',
      'Elevação Automática de Privilégios (Admin / UAC): inclusão da flag --uac-admin na compilação via PyInstaller, gravando nativamente requireAdministrator no manifesto PE do executável para garantir permissões totais de leitura/escrita na pasta do jogo, controle de processos e portas sem necessidade de configuração manual do Windows.',
    ],
  },
  {
    version: '2.8.0', date: '14/10/2026', items: [
      'Novo Seletor de Animações com Split View: painel dividido interativo com player de vídeo integrado para visualização imediata da animação em execução.',
      'Transmissão e Cache Local de Vídeos: streaming dinâmico direto do open.mp em formato WebM leve com armazenamento local automático em cache para acesso offline instantâneo.',
      'Recurso Baixar Pacote Offline: download em lote em segundo plano de todas as animações (~320 MB) com progresso em tempo real, percentual e opção de pausar.',
      'Categorização Inteligente de Animações: abas por contexto ("Populares", "Conversas & Gestos", "Sentado & Deitado", "Danças", "Polícia & Segurança", "Combate & Armas", "Esportes & Academia", "Bar, Fumo & Lazer", "Todas") com busca rápida.',
      'Seleção Firme e Fixada: seleção estável ao clicar nos cards sem interferência do movimento do cursor do mouse, com aplicação direta ou por duplo clique.',
      'Novos Comandos no Servidor de Teste (/w e /t): comando /w (ou /weather, /clima) para definir o clima (0 a 45) e comando /t (ou /time, /hora) para definir horário e minutos (ex: /t 12 ou /t 22:30) com sincronização em tempo real para todos os jogadores.',
      'Comando /ajuda no Servidor de Teste: listagem completa de comandos disponíveis (/fly, /map, /w, /t, /v, /anim, /jetpack, /spawn, /pos).'
    ],
  },
  {
    version: '2.7.0', date: '14/10/2026', items: [
      'Catálogo completo de animações do open.mp: 1.812 presets organizados por biblioteca com campo de busca em tempo real (nome, lib e ação) no painel de Actors.',
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
      'Lista completa de interiores do GTA San Andreas e SA-MP/open.mp integrada com coordenadas precisas de teleporte, identificação do Interior ID e ativação automática do modo de interiores.',
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
      'Suporte completo a Actors no servidor de teste open.mp: criação automática via CreateActor e ApplyActorAnimation.',
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
      'Servidor de teste open.mp com omp-server.exe, DLLs e componentes empacotados na raiz da distribuição e sincronização em tempo real das alterações do editor.',
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
    'Paleta de cores com todos os 256 IDs de cores do SA-MP/open.mp (incluindo as novas cores a partir do ID 128).',
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
    'Sobe um servidor de teste local integrado (open.mp omp-server com DLLs e componentes) e abre o SA-MP já conectado.',
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
      <svg class="brand-mark big" viewBox="0 0 32 32" aria-hidden="true"><use href="#i-brand-logo"/></svg>
      <div><div class="about-title">SA Map Studio <span class="tag">versão ${esc(cfg.version || '2.5.0')}</span></div>
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

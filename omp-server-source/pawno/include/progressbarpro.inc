/*
	SA Progress Bar Pro (progressbarpro.inc) - barras de progresso para jogadores (SA-MP 0.3.7 e open.mp)

	Mesmas funções da progress2.inc, mas desenhadas com sprites "LD_SPAC:white":
	- posição, largura e altura exatas em unidades de TextDraw (640x448), que escalam por igual
	  em qualquer resolução (sem a margem fixa em pixels das caixas de texto da progress2);
	- borda interna com a mesma espessura nos quatro lados, sem números mágicos: uma unidade de
	  TextDraw vale 640 partes da largura e 448 da altura da tela, então em 16:9 (1920x1080) ela
	  tem 3,00 px na horizontal e só 2,41 px na vertical. Por isso a borda de cima e de baixo usa
	  1,25 vez a dos lados (PB_BORDER_Y_RATIO), o que dá 3 px em todos os lados em 1920x1080;
	- a parte cheia nunca passa da borda, some quando o valor é zero e mudar o valor não
	  mostra uma barra que estava escondida;
	- borda escolhida na criação (de PB_BORDER_MIN a PB_BORDER_MAX; valores fora disso usam o
	  limite) e barras que piscam (BlinkPlayerProgressBar).

	Cada barra usa 3 PlayerTextDraws:
	  fundo  (x, y, largura, altura)                       preto com o alfa da cor da barra
	  trilho (x + borda, y + borda, largura e altura - 2x borda)   cor da barra mais transparente
	  cheio  (parte do trilho, conforme valor / máximo e a direção) cor da barra

	Exemplo:
	  new vida = CreatePlayerProgressBar(playerid, 500.0, 120.0, 100.0, 8.0, 0xFF1C1CFF, 100.0, BAR_DIRECTION_RIGHT, 1.0);
	  SetPlayerProgressBarValue(playerid, vida, 75.0);
	  ShowPlayerProgressBar(playerid, vida);
	  BlinkPlayerProgressBar(playerid, vida, 250, 3000);              // pisca na cor da barra por 3 s
	  BlinkPlayerProgressBar(playerid, vida, 200, 0, 0xFFFFFFFF);     // pisca em branco até parar
	  StopPlayerProgressBarBlink(playerid, vida);
*/

#if defined _progressbarpro_included
	#endinput
#endif
#define _progressbarpro_included

#if defined _progress2_included
	#error Use somente uma include de barras: progress2 ou progressbarpro.
#endif

#include <a_samp>

// Borda em unidades de TextDraw: padrão e limites (podem ser definidos antes do #include).
// A borda de cima e de baixo é PB_BORDER_Y_RATIO vezes a dos lados (1 unidade tem 3,00 x 2,41 px em 1920x1080).
#if !defined PB_BORDER_DEFAULT
	#if defined PB_BORDER
		#define PB_BORDER_DEFAULT (PB_BORDER)
	#else
		#define PB_BORDER_DEFAULT (1.0)
	#endif
#endif
#if !defined PB_BORDER_MIN
	#define PB_BORDER_MIN (0.0)
#endif
#if !defined PB_BORDER_MAX
	#define PB_BORDER_MAX (4.0)
#endif
#if !defined PB_BORDER_Y_RATIO
	#define PB_BORDER_Y_RATIO (1.25)
#endif

// Intervalo da piscada em milissegundos (cada troca entre aceso e apagado)
#if !defined PB_BLINK_MIN
	#define PB_BLINK_MIN (50)
#endif
#if !defined PB_BLINK_MAX
	#define PB_BLINK_MAX (60000)
#endif

#if !defined MAX_PLAYER_BARS
	#define MAX_PLAYER_BARS (_:MAX_PLAYER_TEXT_DRAWS / 3)
#endif

#define INVALID_PLAYER_BAR_VALUE (Float:0xFFFFFFFF)
#define INVALID_PLAYER_BAR_ID (-1)

#if defined TEXT_DRAW_FONT_SPRITE_DRAW
	#define PB_SPRITE_FONT TEXT_DRAW_FONT_SPRITE_DRAW
#else
	#define PB_SPRITE_FONT 4
#endif

// open.mp prefere PlayerTextDrawColour; o SA-MP só tem PlayerTextDrawColor
#if defined PlayerTextDrawColour
	#define PB_TextDrawColour PlayerTextDrawColour
#else
	#define PB_TextDrawColour PlayerTextDrawColor
#endif

#if defined INVALID_PLAYER_TEXT_DRAW
	#define PB_NO_TD INVALID_PLAYER_TEXT_DRAW
#else
	#define PB_NO_TD (PlayerText:INVALID_TEXT_DRAW)
#endif

enum
{
	BAR_DIRECTION_RIGHT,
	BAR_DIRECTION_LEFT,
	BAR_DIRECTION_UP,
	BAR_DIRECTION_DOWN
}

enum ProgressBar_Data
{
	bool:pb_valid,
	bool:pb_show,
	Float:pb_x,
	Float:pb_y,
	Float:pb_width,
	Float:pb_height,
	pb_colour,
	Float:pb_max,
	Float:pb_value,
	pb_direction,
	Float:pb_border,
	bool:pb_blinking,
	bool:pb_blinkPhase,
	pb_blinkTimer,
	pb_blinkColour,
	pb_blinkStart,
	pb_blinkDuration,
	PlayerText:pb_back,
	PlayerText:pb_fill,
	PlayerText:pb_main
}

static stock pb_Data[MAX_PLAYERS][MAX_PLAYER_BARS][ProgressBar_Data];

// ---------------------------------------------------------------------------- interno

static stock PlayerText:PB_Sprite(playerid, Float:x, Float:y, Float:width, Float:height, colour)
{
	new PlayerText:td = CreatePlayerTextDraw(playerid, x, y, "LD_SPAC:white");
	if (td == PB_NO_TD) return td;
	PlayerTextDrawFont(playerid, td, PB_SPRITE_FONT);
	PlayerTextDrawTextSize(playerid, td, width, height);
	PB_TextDrawColour(playerid, td, colour);
	PlayerTextDrawSetShadow(playerid, td, 0);
	return td;
}

static stock PB_Kill(playerid, &PlayerText:td)
{
	if (td != PB_NO_TD)
	{
		PlayerTextDrawDestroy(playerid, td);
		td = PB_NO_TD;
	}
}

// Área de dentro da borda
static stock PB_Inner(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	new Float:bx = pb_Data[playerid][barid][pb_border], Float:by = bx * PB_BORDER_Y_RATIO;
	x = pb_Data[playerid][barid][pb_x] + bx;
	y = pb_Data[playerid][barid][pb_y] + by;
	width = pb_Data[playerid][barid][pb_width] - bx * 2.0;
	height = pb_Data[playerid][barid][pb_height] - by * 2.0;
	if (width < 0.0) width = 0.0;
	if (height < 0.0) height = 0.0;
}

// Parte cheia: retorna false quando não há nada para desenhar
static stock bool:PB_MainRect(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	PB_Inner(playerid, barid, x, y, width, height);
	new Float:limit = pb_Data[playerid][barid][pb_max];
	new Float:part = (limit > 0.0) ? (pb_Data[playerid][barid][pb_value] / limit) : 0.0;
	if (part > 1.0) part = 1.0;
	if (part <= 0.0 || width <= 0.0 || height <= 0.0) return false;
	switch (pb_Data[playerid][barid][pb_direction])
	{
		case BAR_DIRECTION_LEFT:
		{
			x += width * (1.0 - part);
			width *= part;
		}
		case BAR_DIRECTION_UP:
		{
			y += height * (1.0 - part);
			height *= part;
		}
		case BAR_DIRECTION_DOWN: height *= part;
		default: width *= part;
	}
	return true;
}

static stock PB_FillColour(colour)
{
	return (colour & 0xFFFFFF00) | (0x66 & ((colour & 0xFF) / 2));
}

static stock Float:PB_ClampBorder(Float:border)
{
	if (border != border) return PB_BORDER_DEFAULT; // NaN
	if (border < PB_BORDER_MIN) return PB_BORDER_MIN;
	if (border > PB_BORDER_MAX) return PB_BORDER_MAX;
	return border;
}

// Piscada: na fase "acesa" usa a cor da piscada; sem cor, o interior da barra some
static stock PB_CurrentColour(playerid, barid)
{
	if (pb_Data[playerid][barid][pb_blinking] && pb_Data[playerid][barid][pb_blinkPhase] && pb_Data[playerid][barid][pb_blinkColour] != 0)
		return pb_Data[playerid][barid][pb_blinkColour];
	return pb_Data[playerid][barid][pb_colour];
}

static stock bool:PB_InnerHidden(playerid, barid)
{
	return pb_Data[playerid][barid][pb_blinking] && pb_Data[playerid][barid][pb_blinkPhase] && pb_Data[playerid][barid][pb_blinkColour] == 0;
}

static stock PB_ShowInner(playerid, barid)
{
	if (!pb_Data[playerid][barid][pb_show]) return;
	new bool:hidden = PB_InnerHidden(playerid, barid);
	if (pb_Data[playerid][barid][pb_fill] != PB_NO_TD)
	{
		if (hidden) PlayerTextDrawHide(playerid, pb_Data[playerid][barid][pb_fill]);
		else PlayerTextDrawShow(playerid, pb_Data[playerid][barid][pb_fill]);
	}
	if (pb_Data[playerid][barid][pb_main] != PB_NO_TD)
	{
		if (hidden) PlayerTextDrawHide(playerid, pb_Data[playerid][barid][pb_main]);
		else PlayerTextDrawShow(playerid, pb_Data[playerid][barid][pb_main]);
	}
}

// Aplica a fase atual da piscada (cor do trilho e da parte cheia, ou interior escondido)
static stock PB_ApplyBlink(playerid, barid)
{
	new colour = PB_CurrentColour(playerid, barid);
	if (pb_Data[playerid][barid][pb_fill] != PB_NO_TD) PB_TextDrawColour(playerid, pb_Data[playerid][barid][pb_fill], PB_FillColour(colour));
	if (pb_Data[playerid][barid][pb_main] != PB_NO_TD) PB_TextDrawColour(playerid, pb_Data[playerid][barid][pb_main], colour);
	PB_ShowInner(playerid, barid);
}

static stock PB_KillBlink(playerid, barid)
{
	if (pb_Data[playerid][barid][pb_blinkTimer] != 0)
	{
		KillTimer(pb_Data[playerid][barid][pb_blinkTimer]);
		pb_Data[playerid][barid][pb_blinkTimer] = 0;
	}
	pb_Data[playerid][barid][pb_blinking] = false;
	pb_Data[playerid][barid][pb_blinkPhase] = false;
}

// Recria só a parte cheia (a posição dela muda nas direções esquerda e para cima)
static stock PB_RenderMain(playerid, barid)
{
	PB_Kill(playerid, pb_Data[playerid][barid][pb_main]);
	new Float:x, Float:y, Float:width, Float:height;
	if (!PB_MainRect(playerid, barid, x, y, width, height)) return;
	pb_Data[playerid][barid][pb_main] = PB_Sprite(playerid, x, y, width, height, PB_CurrentColour(playerid, barid));
	if (pb_Data[playerid][barid][pb_show] && pb_Data[playerid][barid][pb_main] != PB_NO_TD && !PB_InnerHidden(playerid, barid))
		PlayerTextDrawShow(playerid, pb_Data[playerid][barid][pb_main]);
}

static stock bool:PB_Render(playerid, barid)
{
	PB_Kill(playerid, pb_Data[playerid][barid][pb_back]);
	PB_Kill(playerid, pb_Data[playerid][barid][pb_fill]);
	PB_Kill(playerid, pb_Data[playerid][barid][pb_main]);
	new colour = pb_Data[playerid][barid][pb_colour];
	new Float:x, Float:y, Float:width, Float:height;
	pb_Data[playerid][barid][pb_back] = PB_Sprite(playerid, pb_Data[playerid][barid][pb_x], pb_Data[playerid][barid][pb_y],
		pb_Data[playerid][barid][pb_width], pb_Data[playerid][barid][pb_height], colour & 0xFF);
	PB_Inner(playerid, barid, x, y, width, height);
	pb_Data[playerid][barid][pb_fill] = PB_Sprite(playerid, x, y, width, height, PB_FillColour(PB_CurrentColour(playerid, barid)));
	if (pb_Data[playerid][barid][pb_back] == PB_NO_TD || pb_Data[playerid][barid][pb_fill] == PB_NO_TD) return false;
	if (pb_Data[playerid][barid][pb_show])
	{
		PlayerTextDrawShow(playerid, pb_Data[playerid][barid][pb_back]);
		if (!PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, pb_Data[playerid][barid][pb_fill]);
	}
	PB_RenderMain(playerid, barid);
	return true;
}

// ---------------------------------------------------------------------------- funções

stock bool:IsValidPlayerProgressBar(playerid, barid)
{
	return (0 <= playerid < MAX_PLAYERS) && (0 <= barid < MAX_PLAYER_BARS) && pb_Data[playerid][barid][pb_valid];
}

// border: espessura da borda (PB_BORDER_MIN a PB_BORDER_MAX; fora disso usa o limite)
stock CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 55.5, Float:height = 6.0, colour = 0xFF1C1CFF, Float:max = 100.0, direction = BAR_DIRECTION_RIGHT, Float:border = PB_BORDER_DEFAULT)
{
	if (!IsPlayerConnected(playerid) || !(0 <= playerid < MAX_PLAYERS)) return INVALID_PLAYER_BAR_ID;
	new barid = INVALID_PLAYER_BAR_ID;
	for (new i = 0; i < MAX_PLAYER_BARS; i++)
	{
		if (!pb_Data[playerid][i][pb_valid]) { barid = i; break; }
	}
	if (barid == INVALID_PLAYER_BAR_ID)
	{
		print("[SA Progress Bar Pro] Limite de barras do jogador atingido (MAX_PLAYER_BARS).");
		return INVALID_PLAYER_BAR_ID;
	}
	pb_Data[playerid][barid][pb_valid] = true;
	pb_Data[playerid][barid][pb_show] = false;
	pb_Data[playerid][barid][pb_x] = x;
	pb_Data[playerid][barid][pb_y] = y;
	pb_Data[playerid][barid][pb_width] = width;
	pb_Data[playerid][barid][pb_height] = height;
	pb_Data[playerid][barid][pb_colour] = colour;
	pb_Data[playerid][barid][pb_max] = max;
	pb_Data[playerid][barid][pb_value] = 0.0;
	pb_Data[playerid][barid][pb_direction] = (BAR_DIRECTION_RIGHT <= direction <= BAR_DIRECTION_DOWN) ? direction : BAR_DIRECTION_RIGHT;
	pb_Data[playerid][barid][pb_border] = PB_ClampBorder(border);
	pb_Data[playerid][barid][pb_blinking] = false;
	pb_Data[playerid][barid][pb_blinkPhase] = false;
	pb_Data[playerid][barid][pb_blinkTimer] = 0;
	pb_Data[playerid][barid][pb_back] = PB_NO_TD;
	pb_Data[playerid][barid][pb_fill] = PB_NO_TD;
	pb_Data[playerid][barid][pb_main] = PB_NO_TD;
	if (!PB_Render(playerid, barid))
	{
		print("[SA Progress Bar Pro] Sem PlayerTextDraws livres para criar a barra.");
		DestroyPlayerProgressBar(playerid, barid);
		return INVALID_PLAYER_BAR_ID;
	}
	return barid;
}

stock DestroyPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PB_KillBlink(playerid, barid);
	PB_Kill(playerid, pb_Data[playerid][barid][pb_back]);
	PB_Kill(playerid, pb_Data[playerid][barid][pb_fill]);
	PB_Kill(playerid, pb_Data[playerid][barid][pb_main]);
	pb_Data[playerid][barid][pb_valid] = false;
	pb_Data[playerid][barid][pb_show] = false;
	return 1;
}

stock DestroyAllPlayerProgressBars(playerid)
{
	for (new i = 0; i < MAX_PLAYER_BARS; i++) DestroyPlayerProgressBar(playerid, i);
	return 1;
}

stock ShowPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_show] = true;
	PlayerTextDrawShow(playerid, pb_Data[playerid][barid][pb_back]);
	PB_ShowInner(playerid, barid);
	return 1;
}

stock HidePlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_show] = false;
	PlayerTextDrawHide(playerid, pb_Data[playerid][barid][pb_back]);
	PlayerTextDrawHide(playerid, pb_Data[playerid][barid][pb_fill]);
	if (pb_Data[playerid][barid][pb_main] != PB_NO_TD) PlayerTextDrawHide(playerid, pb_Data[playerid][barid][pb_main]);
	return 1;
}

stock bool:IsPlayerProgressBarVisible(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && pb_Data[playerid][barid][pb_show];
}

stock Float:GetPlayerProgressBarValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb_Data[playerid][barid][pb_value];
}

stock SetPlayerProgressBarValue(playerid, barid, Float:value)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (value < 0.0) value = 0.0;
	if (value > pb_Data[playerid][barid][pb_max]) value = pb_Data[playerid][barid][pb_max];
	pb_Data[playerid][barid][pb_value] = value;
	PB_RenderMain(playerid, barid);
	return 1;
}

stock GetPlayerProgressBarPos(playerid, barid, &Float:x, &Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	x = pb_Data[playerid][barid][pb_x];
	y = pb_Data[playerid][barid][pb_y];
	return 1;
}

stock SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_x] = x;
	pb_Data[playerid][barid][pb_y] = y;
	return _:PB_Render(playerid, barid);
}

stock Float:GetPlayerProgressBarWidth(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb_Data[playerid][barid][pb_width];
}

stock SetPlayerProgressBarWidth(playerid, barid, Float:width)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_width] = width;
	return _:PB_Render(playerid, barid);
}

stock Float:GetPlayerProgressBarHeight(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb_Data[playerid][barid][pb_height];
}

stock SetPlayerProgressBarHeight(playerid, barid, Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_height] = height;
	return _:PB_Render(playerid, barid);
}

stock GetPlayerProgressBarColour(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return pb_Data[playerid][barid][pb_colour];
}

stock SetPlayerProgressBarColour(playerid, barid, colour)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_colour] = colour;
	return _:PB_Render(playerid, barid);
}

stock Float:GetPlayerProgressBarMaxValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb_Data[playerid][barid][pb_max];
}

stock SetPlayerProgressBarMaxValue(playerid, barid, Float:max)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_max] = max;
	if (pb_Data[playerid][barid][pb_value] > max) pb_Data[playerid][barid][pb_value] = max;
	PB_RenderMain(playerid, barid);
	return 1;
}

stock GetPlayerProgressBarDirection(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return pb_Data[playerid][barid][pb_direction];
}

stock SetPlayerProgressBarDirection(playerid, barid, direction)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_direction] = (BAR_DIRECTION_RIGHT <= direction <= BAR_DIRECTION_DOWN) ? direction : BAR_DIRECTION_RIGHT;
	PB_RenderMain(playerid, barid);
	return 1;
}

stock Float:GetPlayerProgressBarBorder(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb_Data[playerid][barid][pb_border];
}

stock SetPlayerProgressBarBorder(playerid, barid, Float:border)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_border] = PB_ClampBorder(border);
	return _:PB_Render(playerid, barid);
}

// Faz o interior da barra piscar. interval: milissegundos entre cada troca (PB_BLINK_MIN a
// PB_BLINK_MAX); duration: tempo total em milissegundos (0 = até StopPlayerProgressBarBlink);
// colour: cor da piscada (0 = pisca na cor da própria barra, apagando e acendendo).
stock BlinkPlayerProgressBar(playerid, barid, interval = 250, duration = 0, colour = 0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PB_KillBlink(playerid, barid);
	if (interval < PB_BLINK_MIN) interval = PB_BLINK_MIN;
	if (interval > PB_BLINK_MAX) interval = PB_BLINK_MAX;
	if (duration < 0) duration = 0;
	pb_Data[playerid][barid][pb_blinking] = true;
	pb_Data[playerid][barid][pb_blinkPhase] = true;
	pb_Data[playerid][barid][pb_blinkColour] = colour;
	pb_Data[playerid][barid][pb_blinkStart] = GetTickCount();
	pb_Data[playerid][barid][pb_blinkDuration] = duration;
	pb_Data[playerid][barid][pb_blinkTimer] = SetTimerEx("PB_BlinkTick", interval, true, "ii", playerid, barid);
	PB_ApplyBlink(playerid, barid);
	return 1;
}

stock StopPlayerProgressBarBlink(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (!pb_Data[playerid][barid][pb_blinking]) return 1;
	PB_KillBlink(playerid, barid);
	PB_ApplyBlink(playerid, barid);
	return 1;
}

stock bool:IsPlayerProgressBarBlinking(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && pb_Data[playerid][barid][pb_blinking];
}

forward PB_BlinkTick(playerid, barid);
public PB_BlinkTick(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid) || !pb_Data[playerid][barid][pb_blinking]) return 0;
	new duration = pb_Data[playerid][barid][pb_blinkDuration];
	if (duration > 0 && GetTickCount() - pb_Data[playerid][barid][pb_blinkStart] >= duration)
	{
		StopPlayerProgressBarBlink(playerid, barid);
		return 1;
	}
	pb_Data[playerid][barid][pb_blinkPhase] = !pb_Data[playerid][barid][pb_blinkPhase];
	PB_ApplyBlink(playerid, barid);
	return 1;
}

// ---------------------------------------------------------------------------- ganchos

// Ao sair, o jogo já apaga as PlayerTextDraws do jogador: aqui só os dados são liberados
public OnPlayerDisconnect(playerid, reason)
{
	if (0 <= playerid < MAX_PLAYERS)
	{
		for (new i = 0; i < MAX_PLAYER_BARS; i++)
		{
			PB_KillBlink(playerid, i);
			pb_Data[playerid][i][pb_valid] = false;
			pb_Data[playerid][i][pb_show] = false;
		}
	}
	#if defined pb_OnPlayerDisconnect
		return pb_OnPlayerDisconnect(playerid, reason);
	#else
		return 1;
	#endif
}
#if defined _ALS_OnPlayerDisconnect
	#undef OnPlayerDisconnect
#else
	#define _ALS_OnPlayerDisconnect
#endif
#define OnPlayerDisconnect pb_OnPlayerDisconnect
#if defined pb_OnPlayerDisconnect
	forward pb_OnPlayerDisconnect(playerid, reason);
#endif

#if defined FILTERSCRIPT
public OnFilterScriptExit()
{
	for (new p = 0; p < MAX_PLAYERS; p++)
	{
		if (IsPlayerConnected(p)) DestroyAllPlayerProgressBars(p);
	}
	#if defined pb_OnFilterScriptExit
		return pb_OnFilterScriptExit();
	#else
		return 1;
	#endif
}
#if defined _ALS_OnFilterScriptExit
	#undef OnFilterScriptExit
#else
	#define _ALS_OnFilterScriptExit
#endif
#define OnFilterScriptExit pb_OnFilterScriptExit
#if defined pb_OnFilterScriptExit
	forward pb_OnFilterScriptExit();
#endif
#endif

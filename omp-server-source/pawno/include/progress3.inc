/*
	progress3.inc - barras de progresso para jogadores (SA-MP 0.3.7 e open.mp)

	Mesmas funções da progress2.inc, mas desenhadas com sprites "LD_SPAC:white":
	- posição, largura e altura exatas em unidades de TextDraw (640x448), que escalam por igual
	  em qualquer resolução (sem a margem fixa em pixels das caixas de texto da progress2);
	- borda interna com a mesma espessura nos quatro lados (PB3_BORDER), sem números mágicos;
	- a parte cheia nunca passa da borda, some quando o valor é zero e mudar o valor não
	  mostra uma barra que estava escondida.

	Cada barra usa 3 PlayerTextDraws:
	  fundo  (x, y, largura, altura)                       preto com o alfa da cor da barra
	  trilho (x + borda, y + borda, largura e altura - 2x borda)   cor da barra mais transparente
	  cheio  (parte do trilho, conforme valor / máximo e a direção) cor da barra

	Exemplo:
	  new vida = CreatePlayerProgressBar(playerid, 500.0, 120.0, 100.0, 8.0, 0xFF1C1CFF, 100.0, BAR_DIRECTION_RIGHT);
	  SetPlayerProgressBarValue(playerid, vida, 75.0);
	  ShowPlayerProgressBar(playerid, vida);
*/

#if defined _progress3_included
	#endinput
#endif
#define _progress3_included

#if defined _progress2_included
	#error Use somente uma include de barras: progress2 ou progress3.
#endif

#include <a_samp>

// Espessura da borda em unidades de TextDraw (pode ser definida antes do #include)
#if !defined PB3_BORDER
	#define PB3_BORDER (1.0)
#endif

#if !defined MAX_PLAYER_BARS
	#define MAX_PLAYER_BARS (_:MAX_PLAYER_TEXT_DRAWS / 3)
#endif

#define INVALID_PLAYER_BAR_VALUE (Float:0xFFFFFFFF)
#define INVALID_PLAYER_BAR_ID (-1)

#if defined TEXT_DRAW_FONT_SPRITE_DRAW
	#define PB3_SPRITE_FONT TEXT_DRAW_FONT_SPRITE_DRAW
#else
	#define PB3_SPRITE_FONT 4
#endif

#if defined INVALID_PLAYER_TEXT_DRAW
	#define PB3_NO_TD INVALID_PLAYER_TEXT_DRAW
#else
	#define PB3_NO_TD (PlayerText:INVALID_TEXT_DRAW)
#endif

enum
{
	BAR_DIRECTION_RIGHT,
	BAR_DIRECTION_LEFT,
	BAR_DIRECTION_UP,
	BAR_DIRECTION_DOWN
}

enum E_PB3_DATA
{
	bool:pb3_valid,
	bool:pb3_show,
	Float:pb3_x,
	Float:pb3_y,
	Float:pb3_width,
	Float:pb3_height,
	pb3_colour,
	Float:pb3_max,
	Float:pb3_value,
	pb3_direction,
	PlayerText:pb3_back,
	PlayerText:pb3_fill,
	PlayerText:pb3_main
}

static stock pb3_Data[MAX_PLAYERS][MAX_PLAYER_BARS][E_PB3_DATA];

// ---------------------------------------------------------------------------- interno

static stock PlayerText:PB3_Sprite(playerid, Float:x, Float:y, Float:width, Float:height, colour)
{
	new PlayerText:td = CreatePlayerTextDraw(playerid, x, y, "LD_SPAC:white");
	if (td == PB3_NO_TD) return td;
	PlayerTextDrawFont(playerid, td, PB3_SPRITE_FONT);
	PlayerTextDrawTextSize(playerid, td, width, height);
	PlayerTextDrawColor(playerid, td, colour);
	PlayerTextDrawSetShadow(playerid, td, 0);
	return td;
}

static stock PB3_Kill(playerid, &PlayerText:td)
{
	if (td != PB3_NO_TD)
	{
		PlayerTextDrawDestroy(playerid, td);
		td = PB3_NO_TD;
	}
}

// Área de dentro da borda
static stock PB3_Inner(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	new Float:border = PB3_BORDER;
	x = pb3_Data[playerid][barid][pb3_x] + border;
	y = pb3_Data[playerid][barid][pb3_y] + border;
	width = pb3_Data[playerid][barid][pb3_width] - border * 2.0;
	height = pb3_Data[playerid][barid][pb3_height] - border * 2.0;
	if (width < 0.0) width = 0.0;
	if (height < 0.0) height = 0.0;
}

// Parte cheia: retorna false quando não há nada para desenhar
static stock bool:PB3_MainRect(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	PB3_Inner(playerid, barid, x, y, width, height);
	new Float:limit = pb3_Data[playerid][barid][pb3_max];
	new Float:part = (limit > 0.0) ? (pb3_Data[playerid][barid][pb3_value] / limit) : 0.0;
	if (part > 1.0) part = 1.0;
	if (part <= 0.0 || width <= 0.0 || height <= 0.0) return false;
	switch (pb3_Data[playerid][barid][pb3_direction])
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

static stock PB3_FillColour(colour)
{
	return (colour & 0xFFFFFF00) | (0x66 & ((colour & 0xFF) / 2));
}

// Recria só a parte cheia (a posição dela muda nas direções esquerda e para cima)
static stock PB3_RenderMain(playerid, barid)
{
	PB3_Kill(playerid, pb3_Data[playerid][barid][pb3_main]);
	new Float:x, Float:y, Float:width, Float:height;
	if (!PB3_MainRect(playerid, barid, x, y, width, height)) return;
	pb3_Data[playerid][barid][pb3_main] = PB3_Sprite(playerid, x, y, width, height, pb3_Data[playerid][barid][pb3_colour]);
	if (pb3_Data[playerid][barid][pb3_show] && pb3_Data[playerid][barid][pb3_main] != PB3_NO_TD)
		PlayerTextDrawShow(playerid, pb3_Data[playerid][barid][pb3_main]);
}

static stock bool:PB3_Render(playerid, barid)
{
	PB3_Kill(playerid, pb3_Data[playerid][barid][pb3_back]);
	PB3_Kill(playerid, pb3_Data[playerid][barid][pb3_fill]);
	PB3_Kill(playerid, pb3_Data[playerid][barid][pb3_main]);
	new colour = pb3_Data[playerid][barid][pb3_colour];
	new Float:x, Float:y, Float:width, Float:height;
	pb3_Data[playerid][barid][pb3_back] = PB3_Sprite(playerid, pb3_Data[playerid][barid][pb3_x], pb3_Data[playerid][barid][pb3_y],
		pb3_Data[playerid][barid][pb3_width], pb3_Data[playerid][barid][pb3_height], colour & 0xFF);
	PB3_Inner(playerid, barid, x, y, width, height);
	pb3_Data[playerid][barid][pb3_fill] = PB3_Sprite(playerid, x, y, width, height, PB3_FillColour(colour));
	if (pb3_Data[playerid][barid][pb3_back] == PB3_NO_TD || pb3_Data[playerid][barid][pb3_fill] == PB3_NO_TD) return false;
	if (pb3_Data[playerid][barid][pb3_show])
	{
		PlayerTextDrawShow(playerid, pb3_Data[playerid][barid][pb3_back]);
		PlayerTextDrawShow(playerid, pb3_Data[playerid][barid][pb3_fill]);
	}
	PB3_RenderMain(playerid, barid);
	return true;
}

// ---------------------------------------------------------------------------- funções

stock bool:IsValidPlayerProgressBar(playerid, barid)
{
	return (0 <= playerid < MAX_PLAYERS) && (0 <= barid < MAX_PLAYER_BARS) && pb3_Data[playerid][barid][pb3_valid];
}

stock CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 55.5, Float:height = 6.0, colour = 0xFF1C1CFF, Float:max = 100.0, direction = BAR_DIRECTION_RIGHT)
{
	if (!IsPlayerConnected(playerid) || !(0 <= playerid < MAX_PLAYERS)) return INVALID_PLAYER_BAR_ID;
	new barid = INVALID_PLAYER_BAR_ID;
	for (new i = 0; i < MAX_PLAYER_BARS; i++)
	{
		if (!pb3_Data[playerid][i][pb3_valid]) { barid = i; break; }
	}
	if (barid == INVALID_PLAYER_BAR_ID)
	{
		print("[progress3] Limite de barras do jogador atingido (MAX_PLAYER_BARS).");
		return INVALID_PLAYER_BAR_ID;
	}
	pb3_Data[playerid][barid][pb3_valid] = true;
	pb3_Data[playerid][barid][pb3_show] = false;
	pb3_Data[playerid][barid][pb3_x] = x;
	pb3_Data[playerid][barid][pb3_y] = y;
	pb3_Data[playerid][barid][pb3_width] = width;
	pb3_Data[playerid][barid][pb3_height] = height;
	pb3_Data[playerid][barid][pb3_colour] = colour;
	pb3_Data[playerid][barid][pb3_max] = max;
	pb3_Data[playerid][barid][pb3_value] = 0.0;
	pb3_Data[playerid][barid][pb3_direction] = (BAR_DIRECTION_RIGHT <= direction <= BAR_DIRECTION_DOWN) ? direction : BAR_DIRECTION_RIGHT;
	pb3_Data[playerid][barid][pb3_back] = PB3_NO_TD;
	pb3_Data[playerid][barid][pb3_fill] = PB3_NO_TD;
	pb3_Data[playerid][barid][pb3_main] = PB3_NO_TD;
	if (!PB3_Render(playerid, barid))
	{
		print("[progress3] Sem PlayerTextDraws livres para criar a barra.");
		DestroyPlayerProgressBar(playerid, barid);
		return INVALID_PLAYER_BAR_ID;
	}
	return barid;
}

stock DestroyPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PB3_Kill(playerid, pb3_Data[playerid][barid][pb3_back]);
	PB3_Kill(playerid, pb3_Data[playerid][barid][pb3_fill]);
	PB3_Kill(playerid, pb3_Data[playerid][barid][pb3_main]);
	pb3_Data[playerid][barid][pb3_valid] = false;
	pb3_Data[playerid][barid][pb3_show] = false;
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
	pb3_Data[playerid][barid][pb3_show] = true;
	PlayerTextDrawShow(playerid, pb3_Data[playerid][barid][pb3_back]);
	PlayerTextDrawShow(playerid, pb3_Data[playerid][barid][pb3_fill]);
	if (pb3_Data[playerid][barid][pb3_main] != PB3_NO_TD) PlayerTextDrawShow(playerid, pb3_Data[playerid][barid][pb3_main]);
	return 1;
}

stock HidePlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb3_Data[playerid][barid][pb3_show] = false;
	PlayerTextDrawHide(playerid, pb3_Data[playerid][barid][pb3_back]);
	PlayerTextDrawHide(playerid, pb3_Data[playerid][barid][pb3_fill]);
	if (pb3_Data[playerid][barid][pb3_main] != PB3_NO_TD) PlayerTextDrawHide(playerid, pb3_Data[playerid][barid][pb3_main]);
	return 1;
}

stock bool:IsPlayerProgressBarVisible(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && pb3_Data[playerid][barid][pb3_show];
}

stock Float:GetPlayerProgressBarValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb3_Data[playerid][barid][pb3_value];
}

stock SetPlayerProgressBarValue(playerid, barid, Float:value)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (value < 0.0) value = 0.0;
	if (value > pb3_Data[playerid][barid][pb3_max]) value = pb3_Data[playerid][barid][pb3_max];
	pb3_Data[playerid][barid][pb3_value] = value;
	PB3_RenderMain(playerid, barid);
	return 1;
}

stock GetPlayerProgressBarPos(playerid, barid, &Float:x, &Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	x = pb3_Data[playerid][barid][pb3_x];
	y = pb3_Data[playerid][barid][pb3_y];
	return 1;
}

stock SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb3_Data[playerid][barid][pb3_x] = x;
	pb3_Data[playerid][barid][pb3_y] = y;
	return _:PB3_Render(playerid, barid);
}

stock Float:GetPlayerProgressBarWidth(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb3_Data[playerid][barid][pb3_width];
}

stock SetPlayerProgressBarWidth(playerid, barid, Float:width)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb3_Data[playerid][barid][pb3_width] = width;
	return _:PB3_Render(playerid, barid);
}

stock Float:GetPlayerProgressBarHeight(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb3_Data[playerid][barid][pb3_height];
}

stock SetPlayerProgressBarHeight(playerid, barid, Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb3_Data[playerid][barid][pb3_height] = height;
	return _:PB3_Render(playerid, barid);
}

stock GetPlayerProgressBarColour(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return pb3_Data[playerid][barid][pb3_colour];
}

stock SetPlayerProgressBarColour(playerid, barid, colour)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb3_Data[playerid][barid][pb3_colour] = colour;
	return _:PB3_Render(playerid, barid);
}

stock Float:GetPlayerProgressBarMaxValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb3_Data[playerid][barid][pb3_max];
}

stock SetPlayerProgressBarMaxValue(playerid, barid, Float:max)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb3_Data[playerid][barid][pb3_max] = max;
	if (pb3_Data[playerid][barid][pb3_value] > max) pb3_Data[playerid][barid][pb3_value] = max;
	PB3_RenderMain(playerid, barid);
	return 1;
}

stock GetPlayerProgressBarDirection(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return pb3_Data[playerid][barid][pb3_direction];
}

stock SetPlayerProgressBarDirection(playerid, barid, direction)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb3_Data[playerid][barid][pb3_direction] = (BAR_DIRECTION_RIGHT <= direction <= BAR_DIRECTION_DOWN) ? direction : BAR_DIRECTION_RIGHT;
	PB3_RenderMain(playerid, barid);
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
			pb3_Data[playerid][i][pb3_valid] = false;
			pb3_Data[playerid][i][pb3_show] = false;
		}
	}
	#if defined pb3_OnPlayerDisconnect
		return pb3_OnPlayerDisconnect(playerid, reason);
	#else
		return 1;
	#endif
}
#if defined _ALS_OnPlayerDisconnect
	#undef OnPlayerDisconnect
#else
	#define _ALS_OnPlayerDisconnect
#endif
#define OnPlayerDisconnect pb3_OnPlayerDisconnect
#if defined pb3_OnPlayerDisconnect
	forward pb3_OnPlayerDisconnect(playerid, reason);
#endif

#if defined FILTERSCRIPT
public OnFilterScriptExit()
{
	for (new p = 0; p < MAX_PLAYERS; p++)
	{
		if (IsPlayerConnected(p)) DestroyAllPlayerProgressBars(p);
	}
	#if defined pb3_OnFilterScriptExit
		return pb3_OnFilterScriptExit();
	#else
		return 1;
	#endif
}
#if defined _ALS_OnFilterScriptExit
	#undef OnFilterScriptExit
#else
	#define _ALS_OnFilterScriptExit
#endif
#define OnFilterScriptExit pb3_OnFilterScriptExit
#if defined pb3_OnFilterScriptExit
	forward pb3_OnFilterScriptExit();
#endif
#endif

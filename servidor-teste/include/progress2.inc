#if defined _inc_progress2
#undef _inc_progress2
#endif
#if defined _progress2_included
#endinput
#endif
#define _progress2_included

#include <a_samp>

#define MAX_PLAYER_BARS (_:MAX_PLAYER_TEXT_DRAWS/3)
#define INVALID_PLAYER_BAR_VALUE (Float:0xFFFFFFFF)
#define INVALID_PLAYER_BAR_ID -1
#define Loop(%0,%1,%2) for(new %0 = %2; %0 < %1; %0++)

enum {BAR_DIRECTION_RIGHT,BAR_DIRECTION_LEFT,BAR_DIRECTION_UP,BAR_DIRECTION_DOWN}
enum E_BAR_DATA {pbar_show,Float:pbar_posX,Float:pbar_posY,Float:pbar_width,Float:pbar_height,pbar_colour,Float:pbar_maxValue,Float:pbar_progressValue,pbar_direction}
enum E_BAR_TEXT_DRAW {PlayerText:pbar_back,PlayerText:pbar_fill,PlayerText:pbar_main}
new pbar_TextDraw[MAX_PLAYERS][MAX_PLAYER_BARS][E_BAR_TEXT_DRAW];
new pbar_Index[MAX_PLAYERS][MAX_PLAYER_BARS],pbar_Data[MAX_PLAYERS][MAX_PLAYER_BARS][E_BAR_DATA];

stock GetFreeBarSlot(playerid)
{
    Loop(i,MAX_PLAYER_BARS,0) {if(!pbar_Index[playerid][i]) {return i;}}
    return INVALID_PLAYER_BAR_ID;
}
stock Float:BarPercent(Float:x, Float:widthorheight, Float:max, Float:value, direction)
{
	new Float:result;
	switch(direction)
	{
		case BAR_DIRECTION_RIGHT: {result = ((x - 1.0) + (((((x - 1.5) + widthorheight) - x) / max) * value));}
		case BAR_DIRECTION_LEFT: {result = ((x - 5.0) - (((((x + 2.5) - widthorheight) - x) / max) * -value));}
		case BAR_DIRECTION_UP: {result = -((((((widthorheight / 10.0) - 0.55) * 1.02) / max) * value) + 0.55);}
		case BAR_DIRECTION_DOWN: {result = ((((((widthorheight / 10.0))) / max) * value) - 0.55);}
	}
	return result;
}
stock Float:GetPlayerProgressBarValue(playerid, barid)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pbar_Data[playerid][barid][pbar_progressValue];
}
stock CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 55.5, Float:height = 3.2,colour = 0xFF1C1CFF, Float:max = 100.0, direction = BAR_DIRECTION_RIGHT)
{
	if(!IsPlayerConnected(playerid))
	{
		printf("[ERROR] Attempt to create player progress bar for invalid player!");
		return INVALID_PLAYER_BAR_ID;
	}
	new barid = GetFreeBarSlot(playerid);
	if(barid == INVALID_PLAYER_BAR_ID)
	{
		printf("[ERROR] MAX_PLAYER_BARS limit reached!");
		return INVALID_PLAYER_BAR_ID;
	}
	pbar_TextDraw[playerid][barid][pbar_back] = PlayerText:INVALID_TEXT_DRAW;
	pbar_TextDraw[playerid][barid][pbar_fill] = PlayerText:INVALID_TEXT_DRAW;
	pbar_TextDraw[playerid][barid][pbar_main] = PlayerText:INVALID_TEXT_DRAW;
	pbar_Data[playerid][barid][pbar_show] = 0;
	pbar_Data[playerid][barid][pbar_posX] = x;
	pbar_Data[playerid][barid][pbar_posY] = y;
	pbar_Data[playerid][barid][pbar_width] = width;
	pbar_Data[playerid][barid][pbar_height] = height;
	pbar_Data[playerid][barid][pbar_colour] = colour;
	pbar_Data[playerid][barid][pbar_maxValue] = max;
	pbar_Data[playerid][barid][pbar_progressValue] = 0.0;
	pbar_Data[playerid][barid][pbar_direction] = direction;
	pbar_Index[playerid][barid] = 1;
	RenderProgressBar(playerid, barid);
	return barid;
}
stock DestroyPlayerProgressBar(playerid, barid)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PlayerTextDrawDestroy(playerid, pbar_TextDraw[playerid][barid][pbar_back]);
	PlayerTextDrawDestroy(playerid, pbar_TextDraw[playerid][barid][pbar_fill]);
	PlayerTextDrawDestroy(playerid, pbar_TextDraw[playerid][barid][pbar_main]);
	pbar_Data[playerid][barid][pbar_show] = 0;
	pbar_Index[playerid][barid] = 0;
	return 1;
}
stock IsPlayerProgressBarVisible(playerid, barid)
{
   return pbar_Data[playerid][barid][pbar_show];
}
stock ShowPlayerProgressBar(playerid, barid)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pbar_Data[playerid][barid][pbar_show] = 1;
	PlayerTextDrawShow(playerid, pbar_TextDraw[playerid][barid][pbar_back]);
	PlayerTextDrawShow(playerid, pbar_TextDraw[playerid][barid][pbar_fill]);
	PlayerTextDrawShow(playerid, pbar_TextDraw[playerid][barid][pbar_main]);
	return 1;
}
stock HidePlayerProgressBar(playerid, barid)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pbar_Data[playerid][barid][pbar_show] = 0;
	PlayerTextDrawHide(playerid, pbar_TextDraw[playerid][barid][pbar_back]);
	PlayerTextDrawHide(playerid, pbar_TextDraw[playerid][barid][pbar_fill]);
	PlayerTextDrawHide(playerid, pbar_TextDraw[playerid][barid][pbar_main]);
	return 1;
}
stock IsValidPlayerProgressBar(playerid, barid)
{
	return pbar_Index[playerid][barid];
}
stock GetPlayerProgressBarPos(playerid, barid, &Float:x, &Float:y)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	x = pbar_Data[playerid][barid][pbar_posX];
	y = pbar_Data[playerid][barid][pbar_posY];
	return 1;
}
stock SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pbar_Data[playerid][barid][pbar_posX] = x;
	pbar_Data[playerid][barid][pbar_posY] = y;
	RenderProgressBar(playerid, barid);
	return true;
}
stock Float:GetPlayerProgressBarWidth(playerid, barid)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pbar_Data[playerid][barid][pbar_width];
}
stock SetPlayerProgressBarWidth(playerid, barid, Float:width)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pbar_Data[playerid][barid][pbar_width] = width;
	RenderProgressBar(playerid, barid);
	return 1;
}
stock Float:GetPlayerProgressBarHeight(playerid, barid)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pbar_Data[playerid][barid][pbar_height];
}
stock SetPlayerProgressBarHeight(playerid, barid, Float:height)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pbar_Data[playerid][barid][pbar_height] = height;
	RenderProgressBar(playerid, barid);
	return 1;
}
stock GetPlayerProgressBarColour(playerid, barid)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return pbar_Data[playerid][barid][pbar_colour];
}
stock SetPlayerProgressBarColour(playerid, barid, colour)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pbar_Data[playerid][barid][pbar_colour] = colour;
	PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_back], 0x00000000 | (colour & 0x000000FF));
	PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_fill], (colour & 0xFFFFFF00) | (0x66 & ((colour & 0x000000FF) / 2)));
	PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_main], colour);
	return 1;
}
stock Float:GetPlayerProgressBarMaxValue(playerid, barid)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pbar_Data[playerid][barid][pbar_maxValue];
}
stock SetPlayerProgressBarMaxValue(playerid, barid, Float:max)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pbar_Data[playerid][barid][pbar_maxValue] = max;
	SetPlayerProgressBarValue(playerid, barid, pbar_Data[playerid][barid][pbar_progressValue]);
	return 1;
}
stock SetPlayerProgressBarValue(playerid, barid, Float:value)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if(value < 0.0) {value = 0.0;}
	else {if(value > pbar_Data[playerid][barid][pbar_maxValue]) {value = pbar_Data[playerid][barid][pbar_maxValue];}}
	PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_main], value > 0.0);
	pbar_Data[playerid][barid][pbar_progressValue] = value;
	
	switch(pbar_Data[playerid][barid][pbar_direction])
	{
		case BAR_DIRECTION_RIGHT, BAR_DIRECTION_LEFT:
		{
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_main],BarPercent(pbar_Data[playerid][barid][pbar_posX],
			pbar_Data[playerid][barid][pbar_width],pbar_Data[playerid][barid][pbar_maxValue],value,pbar_Data[playerid][barid][pbar_direction]), 0.0);
		}
		case BAR_DIRECTION_UP, BAR_DIRECTION_DOWN:
		{
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_main], 1.0,BarPercent(pbar_Data[playerid][barid][pbar_posX],
			pbar_Data[playerid][barid][pbar_height],pbar_Data[playerid][barid][pbar_maxValue],value,pbar_Data[playerid][barid][pbar_direction]));
		}
	}
	if(IsPlayerProgressBarVisible(playerid, barid)) ShowPlayerProgressBar(playerid, barid);
	ShowPlayerProgressBar(playerid, barid);
	return 1;
}
stock GetPlayerProgressBarDirection(playerid, barid)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return pbar_Data[playerid][barid][pbar_direction];
}
stock SetPlayerProgressBarDirection(playerid, barid, direction)
{
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pbar_Data[playerid][barid][pbar_direction] = direction;
	RenderProgressBar(playerid, barid);
	return 1;
}
stock DestroyAllPlayerProgressBars(playerid)
{
	Loop(i,MAX_PLAYER_BARS,0) DestroyPlayerProgressBar(playerid, i);
	return 1;
}
stock RenderProgressBar(playerid, barid)
{
	if(!IsPlayerConnected(playerid)) return 0;
	if(!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PlayerTextDrawDestroy(playerid, pbar_TextDraw[playerid][barid][pbar_back]);
	PlayerTextDrawDestroy(playerid, pbar_TextDraw[playerid][barid][pbar_fill]);
	PlayerTextDrawDestroy(playerid, pbar_TextDraw[playerid][barid][pbar_main]);

	switch(pbar_Data[playerid][barid][pbar_direction])
	{
		case BAR_DIRECTION_RIGHT:
		{
			pbar_TextDraw[playerid][barid][pbar_back] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX], pbar_Data[playerid][barid][pbar_posY], "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_back], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_back], pbar_Data[playerid][barid][pbar_posX] + pbar_Data[playerid][barid][pbar_width] - 1.0, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_back], 1.0, pbar_Data[playerid][barid][pbar_height] / 10);
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_back], 0x00000000 | (pbar_Data[playerid][barid][pbar_colour] & 0x000000FF));

			pbar_TextDraw[playerid][barid][pbar_fill] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX] + 1.6, pbar_Data[playerid][barid][pbar_posY] + 1.6, "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_fill], pbar_Data[playerid][barid][pbar_posX] + pbar_Data[playerid][barid][pbar_width] - 2.5, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1.0, pbar_Data[playerid][barid][pbar_height] / 10 - 0.35);
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_fill], (pbar_Data[playerid][barid][pbar_colour] & 0xFFFFFF00) | (0x66 & ((pbar_Data[playerid][barid][pbar_colour] & 0x000000FF) / 2)));

			pbar_TextDraw[playerid][barid][pbar_main] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX] + 1.6, pbar_Data[playerid][barid][pbar_posY] + 1.6, "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_main], BarPercent(pbar_Data[playerid][barid][pbar_posX], pbar_Data[playerid][barid][pbar_width], pbar_Data[playerid][barid][pbar_maxValue], pbar_Data[playerid][barid][pbar_progressValue], pbar_Data[playerid][barid][pbar_direction]), 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_main], 1.0, pbar_Data[playerid][barid][pbar_height] / 10 - 0.35);
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_main], pbar_Data[playerid][barid][pbar_colour]);
		}
		case BAR_DIRECTION_LEFT:
		{
			pbar_TextDraw[playerid][barid][pbar_back] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX], pbar_Data[playerid][barid][pbar_posY], "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_back], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_back], pbar_Data[playerid][barid][pbar_posX] - pbar_Data[playerid][barid][pbar_width] - 4.0, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_back], 1.0, pbar_Data[playerid][barid][pbar_height] / 10);
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_back], 0x00000000 | (pbar_Data[playerid][barid][pbar_colour] & 0x000000FF));

			pbar_TextDraw[playerid][barid][pbar_fill] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX] - 1.6, pbar_Data[playerid][barid][pbar_posY] + 1.6, "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_fill], pbar_Data[playerid][barid][pbar_posX] - pbar_Data[playerid][barid][pbar_width] - 2.5, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1.0, pbar_Data[playerid][barid][pbar_height] / 10 - 0.35);
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_fill], (pbar_Data[playerid][barid][pbar_colour] & 0xFFFFFF00) | (0x66 & ((pbar_Data[playerid][barid][pbar_colour] & 0x000000FF) / 2)));

			pbar_TextDraw[playerid][barid][pbar_main] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX] - 1.6, pbar_Data[playerid][barid][pbar_posY] + 1.6, "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_main], BarPercent(pbar_Data[playerid][barid][pbar_posX], pbar_Data[playerid][barid][pbar_width], pbar_Data[playerid][barid][pbar_maxValue], pbar_Data[playerid][barid][pbar_progressValue], pbar_Data[playerid][barid][pbar_direction]), 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_main], 1.0, pbar_Data[playerid][barid][pbar_height] / 10 - 0.35);
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_main], pbar_Data[playerid][barid][pbar_colour]);
		}
		case BAR_DIRECTION_UP:
		{
			pbar_TextDraw[playerid][barid][pbar_back] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX], pbar_Data[playerid][barid][pbar_posY], "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_back], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_back], pbar_Data[playerid][barid][pbar_posX] - pbar_Data[playerid][barid][pbar_width] - 4.0, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_back], 1.0, -((pbar_Data[playerid][barid][pbar_height] / 10) * 1.02) -0.55);
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_back], 0x00000000 | (pbar_Data[playerid][barid][pbar_colour] & 0x000000FF));

			pbar_TextDraw[playerid][barid][pbar_fill] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX] - 1.2, pbar_Data[playerid][barid][pbar_posY] - 2.5, "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_fill], pbar_Data[playerid][barid][pbar_posX] - pbar_Data[playerid][barid][pbar_width] - 2.8, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1.0, -(pbar_Data[playerid][barid][pbar_height] / 10.0) * 1.02);
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_fill], (pbar_Data[playerid][barid][pbar_colour] & 0xFFFFFF00) | (0x66 & ((pbar_Data[playerid][barid][pbar_colour] & 0x000000FF) / 2)));

			pbar_TextDraw[playerid][barid][pbar_main] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX] - 1.2, pbar_Data[playerid][barid][pbar_posY] - 2.5, "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_main], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_main], pbar_Data[playerid][barid][pbar_posX] - pbar_Data[playerid][barid][pbar_width] - 2.8, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_main], 1.0, BarPercent(pbar_Data[playerid][barid][pbar_posX], pbar_Data[playerid][barid][pbar_height], pbar_Data[playerid][barid][pbar_maxValue], pbar_Data[playerid][barid][pbar_progressValue], pbar_Data[playerid][barid][pbar_direction]));
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_main], pbar_Data[playerid][barid][pbar_colour]);
		}
		case BAR_DIRECTION_DOWN:
		{
			pbar_TextDraw[playerid][barid][pbar_back] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX], pbar_Data[playerid][barid][pbar_posY], "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_back], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_back], pbar_Data[playerid][barid][pbar_posX] - pbar_Data[playerid][barid][pbar_width] - 4.0, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_back], 1.0, ((pbar_Data[playerid][barid][pbar_height] / 10)));
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_back], 0x00000000 | (pbar_Data[playerid][barid][pbar_colour] & 0x000000FF));

			pbar_TextDraw[playerid][barid][pbar_fill] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX] - 1.2, pbar_Data[playerid][barid][pbar_posY] + 2.5, "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_fill], pbar_Data[playerid][barid][pbar_posX] - pbar_Data[playerid][barid][pbar_width] - 2.8, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_fill], 1.0, (pbar_Data[playerid][barid][pbar_height] / 10.0) - 0.55);
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_fill], (pbar_Data[playerid][barid][pbar_colour] & 0xFFFFFF00) | (0x66 & ((pbar_Data[playerid][barid][pbar_colour] & 0x000000FF) / 2)));

			pbar_TextDraw[playerid][barid][pbar_main] = CreatePlayerTextDraw(playerid, pbar_Data[playerid][barid][pbar_posX] - 1.2, pbar_Data[playerid][barid][pbar_posY] + 2.5, "_");
			PlayerTextDrawUseBox(playerid, pbar_TextDraw[playerid][barid][pbar_main], 1);
			PlayerTextDrawTextSize(playerid, pbar_TextDraw[playerid][barid][pbar_main], pbar_Data[playerid][barid][pbar_posX] - pbar_Data[playerid][barid][pbar_width] - 2.8, 0.0);
			PlayerTextDrawLetterSize(playerid, pbar_TextDraw[playerid][barid][pbar_main], 1.0, BarPercent(pbar_Data[playerid][barid][pbar_posX], pbar_Data[playerid][barid][pbar_height], pbar_Data[playerid][barid][pbar_maxValue], pbar_Data[playerid][barid][pbar_progressValue], pbar_Data[playerid][barid][pbar_direction]));
			PlayerTextDrawBoxColour(playerid, pbar_TextDraw[playerid][barid][pbar_main], pbar_Data[playerid][barid][pbar_colour]);
		}
	}
	if(IsPlayerProgressBarVisible(playerid, barid)) ShowPlayerProgressBar(playerid, barid);
	return true;
}

#if defined FILTERSCRIPT
public OnFilterScriptInit()
{
	Loop(i,MAX_PLAYERS,0) {if(IsPlayerConnected(i)) {Loop(b,MAX_PLAYER_BARS,0) {pbar_Index[i][b] = 0;}}}
	#if defined ppb_OnFilterScriptInit
	return ppb_OnFilterScriptInit();
	#else
	return 1;
	#endif
}
#if defined _ALS_OnFilterScriptInit
#undef OnFilterScriptInit
#else
#define _ALS_OnFilterScriptInit
#endif
#define OnFilterScriptInit ppb_OnFilterScriptInit
#if defined ppb_OnFilterScriptInit
forward ppb_OnFilterScriptInit();
#endif
public OnFilterScriptExit()
{
	Loop(i,MAX_PLAYERS,0) {if(IsPlayerConnected(i)) {DestroyAllPlayerProgressBars(i);}}
	#if defined ppb_OnFilterScriptExit
	return ppb_OnFilterScriptExit();
	#else
	return 1;
	#endif
}
#if defined _ALS_OnFilterScriptExit
#undef OnFilterScriptExit
#else
#define _ALS_OnFilterScriptExit
#endif
#define OnFilterScriptExit ppb_OnFilterScriptExit
#if defined ppb_OnFilterScriptExit
forward ppb_OnFilterScriptExit();
#endif
#else
public OnGameModeInit()
{
	//Loop(i,MAX_PLAYERS,0) {if(IsPlayerConnected(i)) {Loop(b,MAX_PLAYER_BARS,0) {pbar_Index[i][b] = 0;}}}
	#if defined ppb_OnGameModeInit
	return ppb_OnGameModeInit();
	#else
	return 1;
	#endif
}
#if defined _ALS_OnGameModeInit
#undef OnGameModeInit
#else
#define _ALS_OnGameModeInit
#endif
#define OnGameModeInit ppb_OnGameModeInit
#if defined ppb_OnGameModeInit
forward ppb_OnGameModeInit();
#endif
public OnGameModeExit()
{
	//Loop(i,MAX_PLAYERS,0) {if(IsPlayerConnected(i)) {DestroyAllPlayerProgressBars(i);}}
	#if defined ppb_OnGameModeExit
	return ppb_OnGameModeExit();
	#else
	return 1;
	#endif
}
#if defined _ALS_OnGameModeExit
#undef OnGameModeExit
#else
#define _ALS_OnGameModeExit
#endif
#define OnGameModeExit ppb_OnGameModeExit
#if defined ppb_OnGameModeExit
forward ppb_OnGameModeExit();
#endif
#endif
public OnPlayerDisconnect(playerid, reason)
{
	DestroyAllPlayerProgressBars(playerid);
	#if defined ppb_OnPlayerDisconnect
	return ppb_OnPlayerDisconnect(playerid, reason);
	#else
	return 1;
	#endif
}
#if defined _ALS_OnPlayerDisconnect
#undef OnPlayerDisconnect
#else
#define _ALS_OnPlayerDisconnect
#endif
#define OnPlayerDisconnect ppb_OnPlayerDisconnect
#if defined ppb_OnPlayerDisconnect
forward ppb_OnPlayerDisconnect(playerid, reason);
#endif
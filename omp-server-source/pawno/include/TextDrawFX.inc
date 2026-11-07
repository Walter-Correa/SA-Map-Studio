/*
================================================================================
    TextDrawFX - A high-performance textdraw visual effects, animation, and
    blinking library for SA-MP and Open.MP.

    Author:      Walter Corrêa
    Version:     2.2.0
    Repository:  https://github.com/Walter-Correa/TextDrawFX
    License:     Mozilla Public License 2.0 (MPL-2.0)
================================================================================
*/

#if defined _textdrawfx_included
	#endinput
#endif
#define _textdrawfx_included

#define TEXTDRAWFX_VERSION_MAJOR              2
#define TEXTDRAWFX_VERSION_MINOR              2
#define TEXTDRAWFX_VERSION_PATCH              0
#define TEXTDRAWFX_VERSION_STRING             "2.2.0"

#if !defined _samp_included && !defined _INC_open_mp
	#if __Pawn >= 0x030A
		#tryinclude <open.mp>
	#endif
	#if !defined _INC_open_mp
		#include <a_samp>
	#endif
#endif

// -----------------------------------------------------------------------------
// Constants & Configuration
// -----------------------------------------------------------------------------

#define TDFX_TYPE_NONE          (0)
#define TDFX_TYPE_BLINK         (1)
#define TDFX_TYPE_TYPEWRITER    (2)
#define TDFX_TYPE_FADE          (3)
#define TDFX_TYPE_SCALE         (4)
#define TDFX_TYPE_PULSE         (5)
#define TDFX_TYPE_SLIDE         (6)
#define TDFX_TYPE_COUNT         (7)
#define TDFX_TYPE_SCRAMBLE      (8)
#define TDFX_TYPE_BOUNCE        (9)
#define TDFX_TYPE_BOUNCE_CIRC   (10)
#define TDFX_TYPE_ORBIT         (11)
#define TDFX_TYPE_SHAKE         (12)
#define TDFX_TYPE_NEON          (13)
#define TDFX_TYPE_WAVE          (14)
#define TDFX_TYPE_PROGRESS      (15)
#define TDFX_TYPE_GLITCH        (16)
#define TDFX_TYPE_FIREWORK      (17)

#define TDFX_FW_BURST_SPHERE    (0)
#define TDFX_FW_BURST_FAN       (1)
#define TDFX_FW_BURST_ROCKET    (2)
#define TDFX_FW_BURST_RING      (3)
#define TDFX_FW_BURST_FOUNTAIN  (4)

#define TDFX_TYPE_SPIN3D        (18)
#define TDFX_TYPE_HOVER3D       (19)
#define TDFX_TYPE_SHIMMER       (20)
#define TDFX_TYPE_RAINBOW       (21)
#define TDFX_TYPE_SLOT          (22)
#define TDFX_TYPE_PENDULUM      (23)
#define TDFX_TYPE_SLAM          (24)
#define TDFX_TYPE_VORTEX        (25)
#define TDFX_TYPE_LETTERBOX     (26)
#define TDFX_TYPE_SONAR         (27)
#define TDFX_TYPE_WAVESWEEP     (28)
#define TDFX_TYPE_LETTERRAIN    (29)
#define TDFX_TYPE_SCANNER       (30)
#define TDFX_TYPE_ELECTRIC      (31)
#define TDFX_TYPE_SPLITFLAP     (32)
#define TDFX_TYPE_HOLOGRAM      (33)
#define TDFX_TYPE_SHOCKWAVE     (34)
#define TDFX_TYPE_WAVEMOTION    (35)
#define TDFX_TYPE_HOPLETTER     (36)

#define TDFX_DIR_LEFT_TO_RIGHT  (0)
#define TDFX_DIR_RIGHT_TO_LEFT  (1)
#define TDFX_DIR_BOUNCE         (2)

#define TDFX_EASE_LINEAR        (0)
#define TDFX_EASE_IN_QUAD       (1)
#define TDFX_EASE_OUT_QUAD      (2)

#define TDFX_GSTATE_UNTRACKED   (0)
#define TDFX_GSTATE_SHOWN_ALL   (1)
#define TDFX_GSTATE_PER_PLAYER  (2)
#define TDFX_GSTATE_HIDDEN_ALL  (3)
#define TDFX_EASE_IN_OUT_QUAD   (3)
#define TDFX_EASE_OUT_BOUNCE    (4)

#if !defined TDFX_MAX_FX
	#define TDFX_MAX_FX (128)
#endif

#if !defined TDFX_MAX_BLINKS
	#define TDFX_MAX_BLINKS TDFX_MAX_FX
#endif

#if !defined TDFX_MAX_TEXT
	#define TDFX_MAX_TEXT (256)
#endif

#if !defined TDFX_MAX_TD
	#if defined MAX_PLAYER_TEXT_DRAWS
		#define TDFX_MAX_TD (_:MAX_PLAYER_TEXT_DRAWS)
	#else
		#define TDFX_MAX_TD (256)
	#endif
#endif

#if !defined TDFX_MAX_GLOBAL_TD
	#if defined MAX_TEXT_DRAWS
		#define TDFX_MAX_GLOBAL_TD (_:MAX_TEXT_DRAWS)
	#else
		#define TDFX_MAX_GLOBAL_TD (2048)
	#endif
#endif

#if !defined MAX_PLAYERS
	#define MAX_PLAYERS (50)
#endif

#if !defined TDFX_PLAYER_BITWORDS
	#define TDFX_PLAYER_BITWORDS ((MAX_PLAYERS + 31) / 32)
#endif

#if !defined TDFX_LETTERBOX_SCREEN_BOTTOM
	#define TDFX_LETTERBOX_SCREEN_BOTTOM (480.0)
#endif

#if !defined TDFX_LETTERBOX_ASCENT_OFFSET
	#define TDFX_LETTERBOX_ASCENT_OFFSET (35.8)
#endif

#if !defined TDFX_MIN_INTERVAL
	#define TDFX_MIN_INTERVAL (30)
#endif

#if !defined TDFX_FRAME_INTERVAL
	#define TDFX_FRAME_INTERVAL (40)
#endif

// Non-deprecated canonical mappings for open.mp vs SA-MP
#if defined PlayerTextDrawColour
	#define _TDFX_PTDColour PlayerTextDrawColour
#else
	#define _TDFX_PTDColour PlayerTextDrawColor
#endif

#if defined PlayerTextDrawBoxColour
	#define _TDFX_PTDBoxColour PlayerTextDrawBoxColour
#else
	#define _TDFX_PTDBoxColour PlayerTextDrawBoxColor
#endif

#if defined PlayerTextDrawBackgroundColour
	#define _TDFX_PTDBackColour PlayerTextDrawBackgroundColour
#else
	#define _TDFX_PTDBackColour PlayerTextDrawBackgroundColor
#endif

#if defined PlayerTextDrawGetColour
	#define _TDFX_PTDGetColour PlayerTextDrawGetColour
#elseif defined PlayerTextDrawGetColor
	#define _TDFX_PTDGetColour PlayerTextDrawGetColor
#endif

#if defined PlayerTextDrawGetBoxColour
	#define _TDFX_PTDGetBoxColour PlayerTextDrawGetBoxColour
#elseif defined PlayerTextDrawGetBoxColor
	#define _TDFX_PTDGetBoxColour PlayerTextDrawGetBoxColor
#endif

#if defined PlayerTextDrawGetBackgroundColour
	#define _TDFX_PTDGetBackColour PlayerTextDrawGetBackgroundColour
#elseif defined PlayerTextDrawGetBackgroundColor
	#define _TDFX_PTDGetBackColour PlayerTextDrawGetBackgroundColor
#endif

#if defined TextDrawColour
	#define _TDFX_TDColour TextDrawColour
#else
	#define _TDFX_TDColour TextDrawColor
#endif

#if defined TextDrawBoxColour
	#define _TDFX_TDBoxColour TextDrawBoxColour
#else
	#define _TDFX_TDBoxColour TextDrawBoxColor
#endif

#if defined TextDrawBackgroundColour
	#define _TDFX_TDBackColour TextDrawBackgroundColour
#else
	#define _TDFX_TDBackColour TextDrawBackgroundColor
#endif

#if defined TextDrawGetColour
	#define _TDFX_TDGetColour TextDrawGetColour
#elseif defined TextDrawGetColor
	#define _TDFX_TDGetColour TextDrawGetColor
#endif

#if defined TextDrawGetBoxColour
	#define _TDFX_TDGetBoxColour TextDrawGetBoxColour
#elseif defined TextDrawGetBoxColor
	#define _TDFX_TDGetBoxColour TextDrawGetBoxColor
#endif

#if defined TextDrawGetBackgroundColour
	#define _TDFX_TDGetBackColour TextDrawGetBackgroundColour
#elseif defined TextDrawGetBackgroundColor
	#define _TDFX_TDGetBackColour TextDrawGetBackgroundColor
#endif

// -----------------------------------------------------------------------------
// State Storage
// -----------------------------------------------------------------------------

// PlayerTextDraw fallback caches for SA-MP 0.3.7
static stock TDFX_Info[MAX_PLAYERS][TDFX_MAX_TD];
static stock TDFX_RemText[MAX_PLAYERS][TDFX_MAX_TD];
static stock TDFX_RemBox[MAX_PLAYERS][TDFX_MAX_TD];
static stock TDFX_RemBack[MAX_PLAYERS][TDFX_MAX_TD];
static stock Float:TDFX_RemLetX[MAX_PLAYERS][TDFX_MAX_TD];
static stock Float:TDFX_RemLetY[MAX_PLAYERS][TDFX_MAX_TD];
static stock Float:TDFX_RemPosX[MAX_PLAYERS][TDFX_MAX_TD];
static stock Float:TDFX_RemPosY[MAX_PLAYERS][TDFX_MAX_TD];
static stock Float:TDFX_RemSizeX[MAX_PLAYERS][TDFX_MAX_TD];
static stock Float:TDFX_RemSizeY[MAX_PLAYERS][TDFX_MAX_TD];
static stock TDFX_RemAlign[MAX_PLAYERS][TDFX_MAX_TD];

// Global TextDraw fallback caches for SA-MP 0.3.7
#if TDFX_MAX_GLOBAL_TD > 0
static stock TDFX_GInfo[TDFX_MAX_GLOBAL_TD];
#define TDFX_GlobalInfo TDFX_GInfo
static stock TDFX_GRemText[TDFX_MAX_GLOBAL_TD];
static stock TDFX_GRemBox[TDFX_MAX_GLOBAL_TD];
static stock TDFX_GRemBack[TDFX_MAX_GLOBAL_TD];
static stock Float:TDFX_GRemLetX[TDFX_MAX_GLOBAL_TD];
static stock Float:TDFX_GRemLetY[TDFX_MAX_GLOBAL_TD];
static stock Float:TDFX_GRemPosX[TDFX_MAX_GLOBAL_TD];
static stock Float:TDFX_GRemPosY[TDFX_MAX_GLOBAL_TD];
static stock Float:TDFX_GRemSizeX[TDFX_MAX_GLOBAL_TD];
static stock Float:TDFX_GRemSizeY[TDFX_MAX_GLOBAL_TD];
static stock TDFX_GRemAlign[TDFX_MAX_GLOBAL_TD];
static stock TDFX_GShownState[TDFX_MAX_GLOBAL_TD];
static stock TDFX_GShownMask[TDFX_MAX_GLOBAL_TD][TDFX_PLAYER_BITWORDS];
#endif

// Slot pool for active animations
static stock bool:TDFX_Used[TDFX_MAX_FX];
static stock bool:TDFX_IsGlobal[TDFX_MAX_FX];
static stock TDFX_Type[TDFX_MAX_FX];
static stock TDFX_Player[TDFX_MAX_FX];
static stock TDFX_Td[TDFX_MAX_FX];
static stock TDFX_Timer[TDFX_MAX_FX];
static stock TDFX_Start[TDFX_MAX_FX];
static stock TDFX_Duration[TDFX_MAX_FX];
static stock TDFX_Step[TDFX_MAX_FX];
static stock TDFX_Count[TDFX_MAX_FX];
static stock TDFX_Easing[TDFX_MAX_FX];
static stock TDFX_ExtraId[TDFX_MAX_FX];
static stock TDFX_Callback[TDFX_MAX_FX][32];
static stock bool:TDFX_AutoHide[TDFX_MAX_FX];
static stock bool:TDFX_AutoDestroy[TDFX_MAX_FX];
static stock bool:TDFX_Loop[TDFX_MAX_FX];
static stock bool:TDFX_Preview[TDFX_MAX_FX];

// Color & Alpha parameters
static stock TDFX_Colour[TDFX_MAX_FX];
static stock TDFX_Base[TDFX_MAX_FX];
static stock TDFX_BoxBase[TDFX_MAX_FX];
static stock TDFX_ColFrom[TDFX_MAX_FX];
static stock TDFX_ColTo[TDFX_MAX_FX];
static stock TDFX_BoxColFrom[TDFX_MAX_FX];
static stock TDFX_BoxColTo[TDFX_MAX_FX];
static stock bool:TDFX_FadeBox[TDFX_MAX_FX];

// Geometry parameters (Scale, Pulse, Slide, Orbit, Bounce)
static stock Float:TDFX_FloatA[TDFX_MAX_FX];
static stock Float:TDFX_FloatB[TDFX_MAX_FX];
static stock Float:TDFX_FloatC[TDFX_MAX_FX];
static stock Float:TDFX_FloatD[TDFX_MAX_FX];

// Physical & Arena Boundary parameters (Bounce, Orbit)
static stock Float:TDFX_BoundMinX[TDFX_MAX_FX];
static stock Float:TDFX_BoundMinY[TDFX_MAX_FX];
static stock Float:TDFX_BoundMaxX[TDFX_MAX_FX];
static stock Float:TDFX_BoundMaxY[TDFX_MAX_FX];
static stock bool:TDFX_ColorShift[TDFX_MAX_FX];

// Firework / Exploding fragmentation particle system
#if !defined TDFX_MAX_FW_INSTANCES
	#define TDFX_MAX_FW_INSTANCES   (16)
#endif
#if !defined TDFX_FW_PARTICLES
	#define TDFX_FW_PARTICLES       (12)
#endif

static stock bool:TDFX_FwActive[TDFX_MAX_FW_INSTANCES];
static stock bool:TDFX_FwIsGlobal[TDFX_MAX_FW_INSTANCES];
static stock TDFX_FwPlayer[TDFX_MAX_FW_INSTANCES];
static stock TDFX_FwCount[TDFX_MAX_FW_INSTANCES];
static stock PlayerText:TDFX_FwParts[TDFX_MAX_FW_INSTANCES][TDFX_FW_PARTICLES];
#if TDFX_MAX_GLOBAL_TD > 0
static stock Text:TDFX_GFwParts[TDFX_MAX_FW_INSTANCES][TDFX_FW_PARTICLES];
#endif
static stock Float:TDFX_FwPartX[TDFX_MAX_FW_INSTANCES][TDFX_FW_PARTICLES];
static stock Float:TDFX_FwPartY[TDFX_MAX_FW_INSTANCES][TDFX_FW_PARTICLES];
static stock Float:TDFX_FwPartVx[TDFX_MAX_FW_INSTANCES][TDFX_FW_PARTICLES];
static stock Float:TDFX_FwPartVy[TDFX_MAX_FW_INSTANCES][TDFX_FW_PARTICLES];
static stock TDFX_FwPartCol[TDFX_MAX_FW_INSTANCES][TDFX_FW_PARTICLES];
static stock Float:TDFX_FwBaseX[TDFX_MAX_FW_INSTANCES];
static stock Float:TDFX_FwBaseY[TDFX_MAX_FW_INSTANCES];

static stock const TDFX_FwPalette[] = {
	0xF1C40FFF, // Gold spark
	0xE74C3CFF, // Crimson
	0xE67E22FF, // Orange flame
	0x00FFFFFF, // Electric cyan
	0x9B59B6FF, // Royal purple
	0x2ECC71FF, // Emerald green
	0xFF69B4FF, // Hot pink
	0xFFFFFFFF  // Brilliant white
};

static stock const TDFX_FwGlyphs[TDFX_FW_PARTICLES][] = {
	"*", "+", "#", "o", "x", "^", "!", "*", "+", "o", "x", "*"
};

static stock TDFX_AllocFwInstance()
{
	for (new i = 0; i < TDFX_MAX_FW_INSTANCES; i++)
	{
		if (!TDFX_FwActive[i])
		{
			TDFX_FwActive[i] = true;
			for (new p = 0; p < TDFX_FW_PARTICLES; p++)
			{
				TDFX_FwParts[i][p] = PlayerText:INVALID_TEXT_DRAW;
				#if TDFX_MAX_GLOBAL_TD > 0
				TDFX_GFwParts[i][p] = Text:INVALID_TEXT_DRAW;
				#endif
			}
			return i;
		}
	}
	return -1;
}

static stock TDFX_FreeFwInstance(fwIdx)
{
	if (fwIdx < 0 || fwIdx >= TDFX_MAX_FW_INSTANCES || !TDFX_FwActive[fwIdx]) return;
	for (new p = 0; p < TDFX_FW_PARTICLES; p++)
	{
		if (!TDFX_FwIsGlobal[fwIdx])
		{
			if (TDFX_FwParts[fwIdx][p] != PlayerText:INVALID_TEXT_DRAW)
			{
				if (IsPlayerConnected(TDFX_FwPlayer[fwIdx]))
				{
					PlayerTextDrawDestroy(TDFX_FwPlayer[fwIdx], TDFX_FwParts[fwIdx][p]);
				}
				TDFX_FwParts[fwIdx][p] = PlayerText:INVALID_TEXT_DRAW;
			}
		}
		#if TDFX_MAX_GLOBAL_TD > 0
		else
		{
			if (TDFX_GFwParts[fwIdx][p] != Text:INVALID_TEXT_DRAW)
			{
				TextDrawDestroy(TDFX_GFwParts[fwIdx][p]);
				TDFX_GFwParts[fwIdx][p] = Text:INVALID_TEXT_DRAW;
			}
		}
		#endif
	}
	TDFX_FwActive[fwIdx] = false;
}

// Classic DVD screensaver color palette
// Multi-Character Animation Pool Storage (Letter Rain, Traveling Wave Motion, Hop Letter Cascade)
#if !defined TDFX_MAX_CHAR_INSTANCES
	#define TDFX_MAX_CHAR_INSTANCES (16)
#endif
#if !defined TDFX_MAX_CHAR_PARTS
	#define TDFX_MAX_CHAR_PARTS     (32)
#endif

static stock bool:TDFX_CharActive[TDFX_MAX_CHAR_INSTANCES];
static stock bool:TDFX_CharIsGlobal[TDFX_MAX_CHAR_INSTANCES];
static stock TDFX_CharPlayer[TDFX_MAX_CHAR_INSTANCES];
static stock TDFX_CharCount[TDFX_MAX_CHAR_INSTANCES];
static stock PlayerText:TDFX_CharParts[TDFX_MAX_CHAR_INSTANCES][TDFX_MAX_CHAR_PARTS];
#if TDFX_MAX_GLOBAL_TD > 0
static stock Text:TDFX_GCharParts[TDFX_MAX_CHAR_INSTANCES][TDFX_MAX_CHAR_PARTS];
#endif
static stock Float:TDFX_CharTargetX[TDFX_MAX_CHAR_INSTANCES][TDFX_MAX_CHAR_PARTS];
static stock Float:TDFX_CharTargetY[TDFX_MAX_CHAR_INSTANCES];
static stock TDFX_CharDelay[TDFX_MAX_CHAR_INSTANCES][TDFX_MAX_CHAR_PARTS];
static stock bool:TDFX_CharState[TDFX_MAX_CHAR_INSTANCES][TDFX_MAX_CHAR_PARTS];

// Backwards compatibility mappings for Rain
#define TDFX_MAX_RAIN_INSTANCES TDFX_MAX_CHAR_INSTANCES
#define TDFX_MAX_RAIN_CHARS     TDFX_MAX_CHAR_PARTS
#define TDFX_RainActive         TDFX_CharActive
#define TDFX_RainIsGlobal       TDFX_CharIsGlobal
#define TDFX_RainPlayer         TDFX_CharPlayer
#define TDFX_RainCount          TDFX_CharCount
#define TDFX_RainParts          TDFX_CharParts
#if TDFX_MAX_GLOBAL_TD > 0
#define TDFX_GRainParts         TDFX_GCharParts
#endif
#define TDFX_RainTargetX        TDFX_CharTargetX
#define TDFX_RainTargetY        TDFX_CharTargetY
#define TDFX_RainDelay          TDFX_CharDelay
#define TDFX_RainLanded         TDFX_CharState
#define TDFX_AllocRainInstance  TDFX_AllocCharInstance
#define TDFX_FreeRainInstance   TDFX_FreeCharInstance

static stock TDFX_AllocCharInstance()
{
	for (new i = 0; i < TDFX_MAX_CHAR_INSTANCES; i++)
	{
		if (!TDFX_CharActive[i])
		{
			TDFX_CharActive[i] = true;
			for (new p = 0; p < TDFX_MAX_CHAR_PARTS; p++)
			{
				TDFX_CharParts[i][p] = PlayerText:INVALID_TEXT_DRAW;
				#if TDFX_MAX_GLOBAL_TD > 0
				TDFX_GCharParts[i][p] = Text:INVALID_TEXT_DRAW;
				#endif
				TDFX_CharState[i][p] = false;
			}
			return i;
		}
	}
	return -1;
}

static stock TDFX_FreeCharInstance(instIdx)
{
	if (instIdx < 0 || instIdx >= TDFX_MAX_CHAR_INSTANCES || !TDFX_CharActive[instIdx]) return;
	for (new p = 0; p < TDFX_MAX_CHAR_PARTS; p++)
	{
		if (!TDFX_CharIsGlobal[instIdx])
		{
			if (TDFX_CharParts[instIdx][p] != PlayerText:INVALID_TEXT_DRAW)
			{
				if (IsPlayerConnected(TDFX_CharPlayer[instIdx]))
				{
					PlayerTextDrawDestroy(TDFX_CharPlayer[instIdx], TDFX_CharParts[instIdx][p]);
				}
				TDFX_CharParts[instIdx][p] = PlayerText:INVALID_TEXT_DRAW;
			}
		}
		#if TDFX_MAX_GLOBAL_TD > 0
		else
		{
			if (TDFX_GCharParts[instIdx][p] != Text:INVALID_TEXT_DRAW)
			{
				TextDrawDestroy(TDFX_GCharParts[instIdx][p]);
				TDFX_GCharParts[instIdx][p] = Text:INVALID_TEXT_DRAW;
			}
		}
		#endif
	}
	TDFX_CharActive[instIdx] = false;
}

static stock const TDFX_FontWidths[4][95] = {
	// Font 0 (Diploma / Bank)
	{ 12, 13, 13, 28, 28, 28, 28,  8, 17, 17, 30, 28, 28, 12,  9, 21,
	  28, 14, 28, 28, 28, 28, 28, 28, 28, 28, 13, 13, 30, 30, 30, 30,
	  10, 25, 23, 21, 24, 22, 20, 24, 24, 17, 20, 22, 20, 30, 27, 27,
	  26, 26, 24, 23, 24, 31, 23, 31, 24, 23, 21, 28, 33, 33, 14, 28,
	  10, 11, 12,  9, 11, 10, 10, 12, 12,  7,  7, 13,  5, 18, 12, 10,
	  12, 11, 10, 12,  8, 13, 13, 18, 17, 13, 12, 30, 30, 37, 35 },
	// Font 1 (Bank Gothic / Standard)
	{ 15,  9, 17, 27, 20, 34, 23, 12, 12, 12, 21, 20, 12, 14, 12, 15,
	  23, 15, 21, 21, 21, 21, 21, 21, 20, 21, 12, 12, 24, 24, 24, 19,
	  10, 22, 19, 19, 22, 16, 19, 24, 22, 11, 16, 21, 15, 28, 24, 27,
	  20, 25, 19, 19, 18, 23, 23, 31, 23, 19, 21, 21, 13, 35, 11, 21,
	  10, 19, 20, 14, 20, 19, 13, 20, 19,  9,  9, 19,  9, 29, 19, 21,
	  19, 19, 15, 15, 14, 18, 19, 27, 20, 20, 17, 21, 17, 20, 15 },
	// Font 2 (Pricedown)
	{ 12, 13, 13, 28, 28, 28, 28,  8, 17, 17, 30, 28, 28, 12,  9, 21,
	  27, 16, 27, 27, 27, 27, 27, 27, 27, 27, 13, 13, 30, 30, 30, 30,
	  10, 29, 26, 25, 28, 26, 25, 27, 28, 12, 24, 25, 24, 30, 27, 29,
	  26, 26, 25, 26, 25, 26, 28, 32, 27, 26, 26, 28, 33, 33, 14, 28,
	  10, 29, 26, 25, 28, 26, 25, 27, 28, 12, 24, 25, 24, 30, 27, 29,
	  26, 26, 25, 26, 25, 26, 28, 32, 27, 26, 26, 30, 30, 37, 35 },
	// Font 3 (Condensed Becket)
	{ 15,  9, 17, 27, 20, 34, 23, 12, 12, 12, 21, 20, 12, 14, 12, 15,
	  20, 18, 19, 19, 21, 19, 19, 19, 19, 19, 12, 12, 24, 24, 24, 19,
	  10, 19, 19, 19, 20, 19, 16, 19, 19,  9, 19, 20, 14, 29, 19, 19,
	  19, 19, 19, 19, 21, 19, 20, 32, 21, 19, 19, 21, 13, 35, 11, 21,
	  10, 19, 19, 19, 20, 19, 16, 19, 19,  9, 19, 20, 14, 29, 19, 19,
	  19, 19, 19, 19, 21, 19, 20, 32, 21, 19, 19, 21, 17, 20, 15 }
};

stock Float:_TDFX_GetCharWidth(c, font, Float:letterSizeX, outline = 1)
{
	if (font < 0 || font > 3) font = 1;
	new idx = c - 32;
	if (idx < 0 || idx >= 95) return (22.0 + float(outline)) * letterSizeX;
	return (float(TDFX_FontWidths[font][idx]) + float(outline)) * letterSizeX;
}

static stock _TDFX_LayoutChars(const text[], rawLen, font, Float:lsX, Float:anchorX, Float:letterSpacing, Float:outPositions[], align = 2, outline = 1)
{
	if (letterSpacing > 0.0)
	{
		new Float:startX;
		if (align == 1) startX = anchorX;
		else if (align == 3) startX = anchorX - (float(rawLen) * letterSpacing);
		else startX = anchorX - (float(rawLen) * letterSpacing / 2.0);

		for (new p = 0; p < rawLen; p++)
		{
			outPositions[p] = startX + (float(p) * letterSpacing) + (letterSpacing / 2.0);
		}
	}
	else
	{
		new Float:totalW = 0.0;
		for (new p = 0; p < rawLen; p++)
		{
			totalW += _TDFX_GetCharWidth(text[p], font, lsX, outline);
		}
		new Float:curX;
		if (align == 1) curX = anchorX;
		else if (align == 3) curX = anchorX - totalW;
		else curX = anchorX - (totalW / 2.0);

		for (new p = 0; p < rawLen; p++)
		{
			new Float:w = _TDFX_GetCharWidth(text[p], font, lsX, outline);
			outPositions[p] = curX + (w / 2.0);
			curX += w;
		}
	}
}

static stock const TDFX_FlapChars[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?$#*";

static stock const TDFX_RainbowPalette[6][] = {
	"~r~", "~y~", "~g~", "~b~", "~p~", "~w~"
};

static stock const TDFX_SlotGlyphs[] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#*?@!";

static stock const TDFX_DvdPalette[] = {
	0xFF3333FF, // Red
	0x33FF33FF, // Green
	0x3388FFFF, // Light Blue
	0xFFFF33FF, // Yellow
	0xFF33FFFF, // Magenta
	0x33FFFFFF, // Cyan
	0xFF8833FF, // Orange
	0xAA33FFFF  // Purple
};

// Text parameters (Typewriter, Scramble, Count)
static stock bool:TDFX_PerChar[TDFX_MAX_FX];
static stock TDFX_Text[TDFX_MAX_FX][TDFX_MAX_TEXT];
static stock TDFX_Prefix[TDFX_MAX_FX][64];
static stock TDFX_Suffix[TDFX_MAX_FX][64];
static stock bool:TDFX_ThousandSep[TDFX_MAX_FX];

// -----------------------------------------------------------------------------
// Math & Helper Functions
// -----------------------------------------------------------------------------

static stock Float:TDFX_ApplyEasing(Float:t, easing)
{
	if (t <= 0.0) return 0.0;
	if (t >= 1.0) return 1.0;
	switch (easing)
	{
		case TDFX_EASE_IN_QUAD:
			return t * t;
		case TDFX_EASE_OUT_QUAD:
			return t * (2.0 - t);
		case TDFX_EASE_IN_OUT_QUAD:
			return (t < 0.5) ? (2.0 * t * t) : (-1.0 + (4.0 - 2.0 * t) * t);
		case TDFX_EASE_OUT_BOUNCE:
		{
			if (t < (1.0 / 2.75))
				return 7.5625 * t * t;
			else if (t < (2.0 / 2.75))
			{
				t -= (1.5 / 2.75);
				return 7.5625 * t * t + 0.75;
			}
			else if (t < (2.5 / 2.75))
			{
				t -= (2.25 / 2.75);
				return 7.5625 * t * t + 0.9375;
			}
			else
			{
				t -= (2.625 / 2.75);
				return 7.5625 * t * t + 0.984375;
			}
		}
	}
	return t;
}

static stock TDFX_LerpColor(c1, c2, Float:t)
{
	if (t <= 0.0) return c1;
	if (t >= 1.0) return c2;
	new r1 = (c1 >>> 24) & 0xFF, g1 = (c1 >>> 16) & 0xFF, b1 = (c1 >>> 8) & 0xFF, a1 = c1 & 0xFF;
	new r2 = (c2 >>> 24) & 0xFF, g2 = (c2 >>> 16) & 0xFF, b2 = (c2 >>> 8) & 0xFF, a2 = c2 & 0xFF;
	new r = r1 + floatround(float(r2 - r1) * t);
	new g = g1 + floatround(float(g2 - g1) * t);
	new b = b1 + floatround(float(b2 - b1) * t);
	new a = a1 + floatround(float(a2 - a1) * t);
	return (r << 24) | (g << 16) | (b << 8) | a;
}

static stock TDFX_FormatNumber(dest[], maxlen, val, const prefix[], const suffix[], bool:sep)
{
	new raw[32], numStr[48];
	valstr(raw, val < 0 ? -val : val);
	if (sep)
	{
		new len = strlen(raw), outIdx = 0;
		if (val < 0) numStr[outIdx++] = '-';
		for (new i = 0; i < len; i++)
		{
			if (i > 0 && ((len - i) % 3) == 0) numStr[outIdx++] = ',';
			numStr[outIdx++] = raw[i];
		}
		numStr[outIdx] = 0;
	}
	else
	{
		format(numStr, sizeof numStr, "%d", val);
	}
	format(dest, maxlen, "%s%s%s", prefix, numStr, suffix);
}

static stock TDFX_SkipTag(const text[], i)
{
	new j = i + 1;
	while (text[j] && text[j] != '~') j++;
	if (text[j] != '~') return j;
	new bool:key = (j == i + 2 && (text[i + 1] == 'k' || text[i + 1] == 'K'));
	j++;
	if (key && text[j] == '~')
	{
		j++;
		while (text[j] && text[j] != '~') j++;
		if (text[j] == '~') j++;
	}
	return j;
}

static stock TDFX_CountChars(const text[])
{
	new i, seen;
	while (text[i])
	{
		if (text[i] == '~')
		{
			i = TDFX_SkipTag(text, i);
			continue;
		}
		if (text[i] == ' ' || text[i] == '_')
		{
			i++;
			continue;
		}
		i++;
		seen++;
	}
	return seen;
}

static stock TDFX_Cut(const text[], chars)
{
	if (chars <= 0) return 0;
	new i, seen;
	while (text[i])
	{
		if (text[i] == '~')
		{
			i = TDFX_SkipTag(text, i);
			continue;
		}
		if (text[i] == ' ' || text[i] == '_')
		{
			i++;
			continue;
		}
		i++;
		seen++;
		if (seen == chars) return i;
	}
	return i;
}

static stock TDFX_CountVisibleGlyphs(const text[])
{
	new i, seen;
	while (text[i])
	{
		if (text[i] == '~')
		{
			i = TDFX_SkipTag(text, i);
			continue;
		}
		i++;
		seen++;
	}
	return seen;
}

static stock _TDFX_ParseGlyphs(const text[], glyphChars[], glyphTags[][16], maxParts)
{
	new i = 0, count = 0;
	new currentTag[16];
	currentTag[0] = '\0';

	while (text[i] && count < maxParts)
	{
		if (text[i] == '~')
		{
			new nextTag = TDFX_SkipTag(text, i);
			new tagLen = nextTag - i;
			if (tagLen < sizeof(currentTag))
			{
				strmid(currentTag, text, i, nextTag, sizeof(currentTag));
			}
			i = nextTag;
			continue;
		}
		glyphChars[count] = text[i];
		strmid(glyphTags[count], currentTag, 0, strlen(currentTag), 16);
		count++;
		i++;
	}
	glyphChars[count] = '\0';
	return count;
}

// -----------------------------------------------------------------------------
// Slot Management
// -----------------------------------------------------------------------------

static stock TDFX_FindPlayer(playerid, PlayerText:textid)
{
	for (new i = 0; i < TDFX_MAX_FX; i++)
	{
		if (TDFX_Used[i] && !TDFX_IsGlobal[i] && TDFX_Player[i] == playerid && TDFX_Td[i] == _:textid) return i;
	}
	return -1;
}

static stock TDFX_FindGlobal(Text:textid)
{
	for (new i = 0; i < TDFX_MAX_FX; i++)
	{
		if (TDFX_Used[i] && TDFX_IsGlobal[i] && TDFX_Td[i] == _:textid) return i;
	}
	return -1;
}

static stock TDFX_Alloc()
{
	for (new i = 0; i < TDFX_MAX_FX; i++)
	{
		if (!TDFX_Used[i]) return i;
	}
	return -1;
}

static stock bool:TDFX_ValidPlayer(playerid, PlayerText:textid)
{
	return (0 <= playerid < MAX_PLAYERS && 0 <= _:textid < TDFX_MAX_TD);
}

static stock bool:TDFX_ValidGlobal(Text:textid)
{
	return (0 <= _:textid < TDFX_MAX_GLOBAL_TD);
}

stock bool:TDFX_GetPlayerPos(playerid, PlayerText:textid, &Float:x, &Float:y)
{
	x = 0.0;
	y = 0.0;
	#if defined PlayerTextDrawGetPos
		PlayerTextDrawGetPos(playerid, textid, x, y);
		if (x != 0.0 || y != 0.0) return true;
	#endif
	if (TDFX_ValidPlayer(playerid, textid))
	{
		x = TDFX_RemPosX[playerid][_:textid];
		y = TDFX_RemPosY[playerid][_:textid];
		return true;
	}
	return false;
}

stock bool:TDFX_GetGlobalPos(Text:textid, &Float:x, &Float:y)
{
	x = 0.0;
	y = 0.0;
	#if defined TextDrawGetPos
		TextDrawGetPos(textid, x, y);
		if (x != 0.0 || y != 0.0) return true;
	#endif
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid))
		{
			x = TDFX_GRemPosX[_:textid];
			y = TDFX_GRemPosY[_:textid];
			return true;
		}
	#endif
	return false;
}

stock TDFX_GetFreePlayerTDCount(playerid)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return 0;
	#if defined _INC_open_mp
		new freeCount = 0;
		for (new i = 0; i < _:MAX_PLAYER_TEXT_DRAWS; i++)
		{
			if (!IsValidPlayerTextDraw(playerid, PlayerText:i)) freeCount++;
		}
		return freeCount;
	#elseif defined PB_GetFreePlayerTextDraws
		return PB_GetFreePlayerTextDraws(playerid);
	#else
		// SA-MP 0.3.7 dynamic safe probe:
		// In SA-MP 0.3.7, CreatePlayerTextDraw only allocates server-side structures and does
		// NOT send network RPCs to clients until PlayerTextDrawShow is called.
		// We probe how many slots SA-MP can actually allocate right now, without relying on include order.
		new PlayerText:probes[64];
		new freeCount = 0;
		while (freeCount < sizeof(probes))
		{
			probes[freeCount] = CreatePlayerTextDraw(playerid, 0.0, 0.0, " ");
			if (_:probes[freeCount] == 0xFFFF || _:probes[freeCount] < 0) break;
			freeCount++;
		}
		for (new i = 0; i < freeCount; i++)
		{
			PlayerTextDrawDestroy(playerid, probes[i]);
		}
		return freeCount;
	#endif
}

stock TDFX_GetFreeGlobalTDCount()
{
	#if defined _INC_open_mp
		new freeCount = 0;
		for (new i = 0; i < _:MAX_TEXT_DRAWS; i++)
		{
			if (!IsValidTextDraw(Text:i)) freeCount++;
		}
		return freeCount;
	#else
		#if TDFX_MAX_GLOBAL_TD > 0
		new Text:probes[64];
		new freeCount = 0;
		while (freeCount < sizeof(probes))
		{
			probes[freeCount] = TextDrawCreate(0.0, 0.0, " ");
			if (_:probes[freeCount] == 0xFFFF || _:probes[freeCount] < 0) break;
			freeCount++;
		}
		for (new i = 0; i < freeCount; i++)
		{
			TextDrawDestroy(probes[i]);
		}
		return freeCount;
		#else
		return 0;
		#endif
	#endif
}

stock _TDFX_UpdateGlobalTD(Text:textid)
{
	if (!TDFX_ValidGlobal(textid)) return;
	#if TDFX_MAX_GLOBAL_TD > 0
	new tid = _:textid;
	switch (TDFX_GShownState[tid])
	{
		case TDFX_GSTATE_UNTRACKED:
		{
			// Fallback: was never explicitly shown or hidden before the animation started.
			// Default to showing to all players to preserve standard backward compatibility.
			TDFX_GShownState[tid] = TDFX_GSTATE_SHOWN_ALL;
			for (new w = 0; w < TDFX_PLAYER_BITWORDS; w++)
			{
				TDFX_GShownMask[tid][w] = 0xFFFFFFFF;
			}
			TextDrawShowForAll(textid);
		}
		case TDFX_GSTATE_SHOWN_ALL:
		{
			TextDrawShowForAll(textid);
		}
		case TDFX_GSTATE_PER_PLAYER:
		{
			for (new p = 0; p < MAX_PLAYERS; p++)
			{
				if (IsPlayerConnected(p) && (TDFX_GShownMask[tid][p / 32] & (1 << (p % 32))))
				{
					TextDrawShowForPlayer(p, textid);
				}
			}
		}
		case TDFX_GSTATE_HIDDEN_ALL:
		{
			// Explicitly hidden from everyone (or all players were hidden).
			// Do NOT show to anyone!
			return;
		}
	}
	#else
	TextDrawShowForAll(textid);
	#endif
}

stock _TDFX_UpdateGlobalChildTD(Text:childTd, parentTdId)
{
	if (!TDFX_ValidGlobal(childTd)) return;
	#if TDFX_MAX_GLOBAL_TD > 0
	if (TDFX_ValidGlobal(Text:parentTdId))
	{
		switch (TDFX_GShownState[parentTdId])
		{
			case TDFX_GSTATE_UNTRACKED, TDFX_GSTATE_SHOWN_ALL:
			{
				TextDrawShowForAll(childTd);
				return;
		}
			case TDFX_GSTATE_PER_PLAYER:
			{
				for (new p = 0; p < MAX_PLAYERS; p++)
				{
					if (IsPlayerConnected(p) && (TDFX_GShownMask[parentTdId][p / 32] & (1 << (p % 32))))
					{
						TextDrawShowForPlayer(p, childTd);
					}
				}
				return;
			}
			case TDFX_GSTATE_HIDDEN_ALL:
			{
				return;
			}
		}
	}
	#endif
	TextDrawShowForAll(childTd);
}

stock _TDFX_HideGlobalTD(Text:textid)
{
	if (!TDFX_ValidGlobal(textid)) return;
	#if TDFX_MAX_GLOBAL_TD > 0
	new tid = _:textid;
	if (TDFX_GShownState[tid] == TDFX_GSTATE_SHOWN_ALL || TDFX_GShownState[tid] == TDFX_GSTATE_UNTRACKED)
	{
		TextDrawHideForAll(textid);
		return;
	}
	for (new p = 0; p < MAX_PLAYERS; p++)
	{
		if (IsPlayerConnected(p) && (TDFX_GShownMask[tid][p / 32] & (1 << (p % 32))))
		{
			TextDrawHideForPlayer(p, textid);
		}
	}
	#else
	TextDrawHideForAll(textid);
	#endif
}

static stock bool:TDFX_CallbacksChecked = false;
static stock bool:TDFX_HasPlayerFinishCB = false;
static stock bool:TDFX_HasGlobalFinishCB = false;

static stock TDFX_CheckCallbacks()
{
	if (!TDFX_CallbacksChecked)
	{
		TDFX_HasPlayerFinishCB = (funcidx("OnPlayerTextDrawFXFinish") != -1);
		TDFX_HasGlobalFinishCB = (funcidx("OnTextDrawFXFinish") != -1);
		TDFX_CallbacksChecked = true;
	}
}

static stock TDFX_Free(slot, bool:restore, bool:triggerFinish = false, bool:keepHidden = false)
{
	if (slot < 0 || slot >= TDFX_MAX_FX || !TDFX_Used[slot]) return;
	KillTimer(TDFX_Timer[slot]);
	TDFX_Timer[slot] = 0;
	TDFX_Used[slot] = false;

	new bool:isGlobal = TDFX_IsGlobal[slot];
	new playerid = TDFX_Player[slot];
	new tdId = TDFX_Td[slot];
	new fxType = TDFX_Type[slot];
	new extraId = TDFX_ExtraId[slot];
	new cb[32];
	strmid(cb, TDFX_Callback[slot], 0, 32, 32);

	// Unconditionally free multi-letter and particle auxiliary instances to prevent leaks
	if (fxType == TDFX_TYPE_LETTERRAIN || fxType == TDFX_TYPE_WAVEMOTION || fxType == TDFX_TYPE_HOPLETTER)
	{
		new instIdx = TDFX_Step[slot];
		TDFX_FreeCharInstance(instIdx);
	}
	else if (fxType == TDFX_TYPE_FIREWORK || fxType == TDFX_TYPE_SHOCKWAVE)
	{
		new fwIdx = TDFX_Step[slot];
		TDFX_FreeFwInstance(fwIdx);
	}

	if (restore)
	{
		new bool:shouldShow = (!keepHidden && !TDFX_AutoHide[slot]);
		if (!shouldShow && TDFX_AutoDestroy[slot])
		{
			if (isGlobal) TextDrawDestroy(Text:tdId);
			else if (IsPlayerConnected(playerid)) PlayerTextDrawDestroy(playerid, PlayerText:tdId);
			return;
		}

		if (isGlobal)
		{
			if (fxType == TDFX_TYPE_SCALE)
			{
				TextDrawLetterSize(Text:tdId, TDFX_FloatC[slot], TDFX_FloatD[slot]);
			}
			else if (fxType == TDFX_TYPE_PULSE)
			{
				TextDrawLetterSize(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
			}
			else if ((fxType == TDFX_TYPE_FADE || fxType == TDFX_TYPE_NEON) && TDFX_Base[slot])
			{
				if (TDFX_Preview[slot]) _TDFX_TDBackColour(Text:tdId, TDFX_Base[slot]);
				else
				{
					_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
					if (TDFX_BoxBase[slot]) _TDFX_TDBoxColour(Text:tdId, TDFX_BoxBase[slot]);
				}
			}
			else if (fxType == TDFX_TYPE_BLINK && TDFX_Colour[slot])
			{
				if (TDFX_Preview[slot]) _TDFX_TDBackColour(Text:tdId, TDFX_Base[slot]);
				else
				{
					_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
					if (TDFX_BoxBase[slot]) _TDFX_TDBoxColour(Text:tdId, TDFX_BoxBase[slot]);
				}
			}
			else if (fxType == TDFX_TYPE_TYPEWRITER || fxType == TDFX_TYPE_SCRAMBLE || fxType == TDFX_TYPE_GLITCH)
			{
				if (fxType == TDFX_TYPE_GLITCH && TDFX_Base[slot]) _TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
				TextDrawSetString(Text:tdId, TDFX_Text[slot]);
			}
			#if defined TextDrawSetPos
			else if (fxType == TDFX_TYPE_SHAKE || fxType == TDFX_TYPE_WAVE)
			{
				TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
			}
			#endif
			else if (fxType == TDFX_TYPE_PROGRESS)
			{
				new gAlign = 1;
				#if TDFX_MAX_GLOBAL_TD > 0
					if (TDFX_ValidGlobal(Text:tdId)) gAlign = TDFX_GRemAlign[tdId];
				#endif
				#if defined TextDrawGetAlignment
					gAlign = _:TextDrawGetAlignment(Text:tdId);
				#endif
				if (gAlign == 2) TextDrawTextSize(Text:tdId, TDFX_FloatB[slot], TDFX_FloatC[slot]);
				else TextDrawTextSize(Text:tdId, TDFX_FloatC[slot], TDFX_FloatB[slot]);
			}
			#if defined TextDrawSetPos
			else if (fxType == TDFX_TYPE_SLIDE)
			{
				TextDrawSetPos(Text:tdId, TDFX_FloatC[slot], TDFX_FloatD[slot]);
			}
			#endif
			else if (fxType == TDFX_TYPE_COUNT)
			{
				new str[TDFX_MAX_TEXT];
				TDFX_FormatNumber(str, sizeof str, TDFX_Count[slot], TDFX_Prefix[slot], TDFX_Suffix[slot], TDFX_ThousandSep[slot]);
				TextDrawSetString(Text:tdId, str);
			}
			else if ((fxType == TDFX_TYPE_BOUNCE || fxType == TDFX_TYPE_BOUNCE_CIRC) && TDFX_ColorShift[slot] && TDFX_Base[slot])
			{
				_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
			}
			else if (fxType == TDFX_TYPE_FIREWORK)
			{
				#if defined TextDrawSetPos
					TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
					_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
				#endif
			}
			else if (fxType == TDFX_TYPE_SHIMMER || fxType == TDFX_TYPE_RAINBOW || fxType == TDFX_TYPE_SLOT || fxType == TDFX_TYPE_TYPEWRITER)
			{
				TextDrawSetString(Text:tdId, TDFX_Text[slot]);
			}
			else if (fxType == TDFX_TYPE_SPIN3D || fxType == TDFX_TYPE_HOVER3D)
			{
				#if defined TextDrawSetPreviewRot
					TextDrawSetPreviewRot(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot], TDFX_FloatC[slot], TDFX_FloatD[slot]);
				#endif
			}
			#if defined TextDrawSetPos
			else if (fxType == TDFX_TYPE_PENDULUM)
			{
				TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot] + TDFX_FloatC[slot]);
			}
			else if (fxType == TDFX_TYPE_SLAM)
			{
				TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
			}
			#endif
			else if (fxType == TDFX_TYPE_VORTEX)
			{
				TextDrawLetterSize(Text:tdId, TDFX_BoundMinX[slot], TDFX_BoundMinY[slot]);
				#if defined TextDrawSetPos
					TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
				#endif
			}
			else if (fxType == TDFX_TYPE_LETTERRAIN || fxType == TDFX_TYPE_WAVEMOTION || fxType == TDFX_TYPE_HOPLETTER)
			{
				TextDrawSetString(Text:tdId, TDFX_Text[slot]);
				_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
			}
			else if (fxType == TDFX_TYPE_SHOCKWAVE)
			{
				#if defined TextDrawSetPos
					TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
				#endif
				TextDrawLetterSize(Text:tdId, TDFX_BoundMinX[slot], TDFX_BoundMinY[slot]);
				if (TDFX_FadeBox[slot]) TextDrawUseBox(Text:tdId, true);
			}
			else if (fxType == TDFX_TYPE_WAVESWEEP || fxType == TDFX_TYPE_SCANNER || fxType == TDFX_TYPE_ELECTRIC || fxType == TDFX_TYPE_SPLITFLAP || fxType == TDFX_TYPE_HOLOGRAM)
			{
				TextDrawSetString(Text:tdId, TDFX_Text[slot]);
				_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
			}

			if (fxType == TDFX_TYPE_LETTERBOX)
			{
				if (!shouldShow)
				{
					_TDFX_HideGlobalTD(Text:tdId);
					if (TDFX_Step[slot] != -1 && TDFX_Step[slot] != 0xFFFF && TDFX_Step[slot] >= 0) _TDFX_HideGlobalTD(Text:TDFX_Step[slot]);
				}
				else
				{
					_TDFX_UpdateGlobalTD(Text:tdId);
					if (TDFX_Step[slot] != -1 && TDFX_Step[slot] != 0xFFFF && TDFX_Step[slot] >= 0) _TDFX_UpdateGlobalTD(Text:TDFX_Step[slot]);
				}
			}
			else if (fxType == TDFX_TYPE_FIREWORK || fxType == TDFX_TYPE_VORTEX)
			{
				_TDFX_HideGlobalTD(Text:tdId);
			}
			else
			{
				if (shouldShow) _TDFX_UpdateGlobalTD(Text:tdId);
				else _TDFX_HideGlobalTD(Text:tdId);
			}
		}
		else if (IsPlayerConnected(playerid))
		{
			if (fxType == TDFX_TYPE_SCALE)
			{
				PlayerTextDrawLetterSize(playerid, PlayerText:tdId, TDFX_FloatC[slot], TDFX_FloatD[slot]);
			}
			else if (fxType == TDFX_TYPE_PULSE)
			{
				PlayerTextDrawLetterSize(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
			}
			else if ((fxType == TDFX_TYPE_FADE || fxType == TDFX_TYPE_NEON) && TDFX_Base[slot])
			{
				if (TDFX_Preview[slot]) _TDFX_PTDBackColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
				else
				{
					_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
					if (TDFX_BoxBase[slot]) _TDFX_PTDBoxColour(playerid, PlayerText:tdId, TDFX_BoxBase[slot]);
				}
			}
			else if (fxType == TDFX_TYPE_BLINK && TDFX_Colour[slot])
			{
				if (TDFX_Preview[slot]) _TDFX_PTDBackColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
				else
				{
					_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
					if (TDFX_BoxBase[slot]) _TDFX_PTDBoxColour(playerid, PlayerText:tdId, TDFX_BoxBase[slot]);
				}
			}
			else if (fxType == TDFX_TYPE_TYPEWRITER || fxType == TDFX_TYPE_SCRAMBLE || fxType == TDFX_TYPE_GLITCH)
			{
				if (fxType == TDFX_TYPE_GLITCH && TDFX_Base[slot]) _TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
				PlayerTextDrawSetString(playerid, PlayerText:tdId, TDFX_Text[slot]);
			}
			#if defined PlayerTextDrawSetPos
			else if (fxType == TDFX_TYPE_SHAKE || fxType == TDFX_TYPE_WAVE)
			{
				PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
			}
			#endif
			else if (fxType == TDFX_TYPE_PROGRESS)
			{
				new pAlign = 1;
				#if defined PlayerTextDrawGetAlignment
					pAlign = _:PlayerTextDrawGetAlignment(playerid, PlayerText:tdId);
				#else
					if (TDFX_ValidPlayer(playerid, PlayerText:tdId)) pAlign = TDFX_RemAlign[playerid][tdId];
				#endif
				if (pAlign == 2) PlayerTextDrawTextSize(playerid, PlayerText:tdId, TDFX_FloatB[slot], TDFX_FloatC[slot]);
				else PlayerTextDrawTextSize(playerid, PlayerText:tdId, TDFX_FloatC[slot], TDFX_FloatB[slot]);
			}
			#if defined PlayerTextDrawSetPos
			else if (fxType == TDFX_TYPE_SLIDE)
			{
				PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatC[slot], TDFX_FloatD[slot]);
			}
			#endif
			else if (fxType == TDFX_TYPE_COUNT)
			{
				new str[TDFX_MAX_TEXT];
				TDFX_FormatNumber(str, sizeof str, TDFX_Count[slot], TDFX_Prefix[slot], TDFX_Suffix[slot], TDFX_ThousandSep[slot]);
				PlayerTextDrawSetString(playerid, PlayerText:tdId, str);
			}
			else if ((fxType == TDFX_TYPE_BOUNCE || fxType == TDFX_TYPE_BOUNCE_CIRC) && TDFX_ColorShift[slot] && TDFX_Base[slot])
			{
				_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
			}
			else if (fxType == TDFX_TYPE_FIREWORK)
			{
				#if defined PlayerTextDrawSetPos
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
					_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
				#endif
			}
			else if (fxType == TDFX_TYPE_SHIMMER || fxType == TDFX_TYPE_RAINBOW || fxType == TDFX_TYPE_SLOT || fxType == TDFX_TYPE_TYPEWRITER)
			{
				PlayerTextDrawSetString(playerid, PlayerText:tdId, TDFX_Text[slot]);
			}
			else if (fxType == TDFX_TYPE_SPIN3D || fxType == TDFX_TYPE_HOVER3D)
			{
				#if defined PlayerTextDrawSetPreviewRot
					PlayerTextDrawSetPreviewRot(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot], TDFX_FloatC[slot], TDFX_FloatD[slot]);
				#endif
			}
			#if defined PlayerTextDrawSetPos
			else if (fxType == TDFX_TYPE_PENDULUM)
			{
				PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot] + TDFX_FloatC[slot]);
			}
			else if (fxType == TDFX_TYPE_SLAM)
			{
				PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
			}
			#endif
			else if (fxType == TDFX_TYPE_VORTEX)
			{
				PlayerTextDrawLetterSize(playerid, PlayerText:tdId, TDFX_BoundMinX[slot], TDFX_BoundMinY[slot]);
				#if defined PlayerTextDrawSetPos
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
				#endif
			}
			else if (fxType == TDFX_TYPE_LETTERRAIN || fxType == TDFX_TYPE_WAVEMOTION || fxType == TDFX_TYPE_HOPLETTER)
			{
				PlayerTextDrawSetString(playerid, PlayerText:tdId, TDFX_Text[slot]);
				_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
			}
			else if (fxType == TDFX_TYPE_SHOCKWAVE)
			{
				#if defined PlayerTextDrawSetPos
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
				#endif
				PlayerTextDrawLetterSize(playerid, PlayerText:tdId, TDFX_BoundMinX[slot], TDFX_BoundMinY[slot]);
				if (TDFX_FadeBox[slot]) PlayerTextDrawUseBox(playerid, PlayerText:tdId, true);
			}
			else if (fxType == TDFX_TYPE_WAVESWEEP || fxType == TDFX_TYPE_SCANNER || fxType == TDFX_TYPE_ELECTRIC || fxType == TDFX_TYPE_SPLITFLAP || fxType == TDFX_TYPE_HOLOGRAM)
			{
				PlayerTextDrawSetString(playerid, PlayerText:tdId, TDFX_Text[slot]);
				_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
			}

			if (fxType == TDFX_TYPE_LETTERBOX)
			{
				if (!shouldShow)
				{
					PlayerTextDrawHide(playerid, PlayerText:tdId);
					if (TDFX_Step[slot] != -1 && TDFX_Step[slot] != 0xFFFF && TDFX_Step[slot] >= 0) PlayerTextDrawHide(playerid, PlayerText:TDFX_Step[slot]);
				}
				else
				{
					PlayerTextDrawShow(playerid, PlayerText:tdId);
					if (TDFX_Step[slot] != -1 && TDFX_Step[slot] != 0xFFFF && TDFX_Step[slot] >= 0) PlayerTextDrawShow(playerid, PlayerText:TDFX_Step[slot]);
				}
			}
			else if (fxType == TDFX_TYPE_FIREWORK || fxType == TDFX_TYPE_VORTEX)
			{
				PlayerTextDrawHide(playerid, PlayerText:tdId);
			}
			else
			{
				if (shouldShow) PlayerTextDrawShow(playerid, PlayerText:tdId);
				else PlayerTextDrawHide(playerid, PlayerText:tdId);
			}
		}
	}

	if (triggerFinish)
	{
		if (cb[0])
		{
			if (isGlobal) CallLocalFunction(cb, "ii", tdId, extraId);
			else CallLocalFunction(cb, "iii", playerid, tdId, extraId);
		}
		TDFX_CheckCallbacks();
		if (isGlobal)
		{
			if (TDFX_HasGlobalFinishCB) CallLocalFunction("OnTextDrawFXFinish", "iii", tdId, fxType, extraId);
		}
		else if (IsPlayerConnected(playerid))
		{
			if (TDFX_HasPlayerFinishCB) CallLocalFunction("OnPlayerTextDrawFXFinish", "iiii", playerid, tdId, fxType, extraId);
		}
	}
}

// -----------------------------------------------------------------------------
// Tick Engine
// -----------------------------------------------------------------------------

forward TDFX_Tick(slot);
public TDFX_Tick(slot)
{
	if (slot < 0 || slot >= TDFX_MAX_FX || !TDFX_Used[slot]) return 0;
	new bool:isGlobal = TDFX_IsGlobal[slot];
	new playerid = TDFX_Player[slot];
	new tdId = TDFX_Td[slot];

	if (!isGlobal && !IsPlayerConnected(playerid))
	{
		TDFX_Free(slot, false, false);
		return 0;
	}

	new elapsed = GetTickCount() - TDFX_Start[slot];
	new duration = TDFX_Duration[slot];
	new fxType = TDFX_Type[slot];

	// Handle Generic Duration-based Finish for continuous/interpolation effects
	switch (fxType)
	{
		case TDFX_TYPE_SLOT, TDFX_TYPE_SLAM, TDFX_TYPE_VORTEX, TDFX_TYPE_LETTERBOX,
		     TDFX_TYPE_SONAR, TDFX_TYPE_WAVESWEEP, TDFX_TYPE_LETTERRAIN,
		     TDFX_TYPE_WAVEMOTION, TDFX_TYPE_HOPLETTER, TDFX_TYPE_SCANNER,
		     TDFX_TYPE_ELECTRIC, TDFX_TYPE_SPLITFLAP, TDFX_TYPE_HOLOGRAM,
		     TDFX_TYPE_SHOCKWAVE, TDFX_TYPE_FIREWORK:
		{
			// Custom loop/finish handled in switch cases below
		}
		default:
		{
			if (duration > 0 && elapsed >= duration)
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
					if (fxType == TDFX_TYPE_BLINK || fxType == TDFX_TYPE_TYPEWRITER)
					{
						TDFX_Step[slot] = 0;
					}
				}
				else
				{
					TDFX_Free(slot, true, true);
					return 1;
				}
			}
		}
	}

	new Float:progress = 1.0;
	if (duration > 0)
	{
		progress = float(elapsed) / float(duration);
		if (progress > 1.0) progress = 1.0;
		if (progress < 0.0) progress = 0.0;
	}

	switch (fxType)
	{
		case TDFX_TYPE_BLINK, TDFX_TYPE_TYPEWRITER:
		{
			if (TDFX_PerChar[slot])
			{
				TDFX_Step[slot]++;
				new bool:typewriterDone = false;
				if (TDFX_Step[slot] > TDFX_Count[slot])
				{
					if (fxType == TDFX_TYPE_TYPEWRITER)
					{
						if (TDFX_Loop[slot])
						{
							TDFX_Step[slot] = 0;
							TDFX_Start[slot] = GetTickCount();
						}
						else
						{
							TDFX_Step[slot] = TDFX_Count[slot];
							if (duration == 0) typewriterDone = true;
						}
					}
					else
					{
						TDFX_Step[slot] = 0;
					}
				}
				new part[TDFX_MAX_TEXT], cut = TDFX_Cut(TDFX_Text[slot], TDFX_Step[slot]);
				if (TDFX_Step[slot] >= TDFX_Count[slot]) cut = strlen(TDFX_Text[slot]);
				if (cut > 0) strmid(part, TDFX_Text[slot], 0, cut, sizeof part);
				else { part[0] = ' '; part[1] = 0; }
				if (isGlobal) { TextDrawSetString(Text:tdId, part); _TDFX_UpdateGlobalTD(Text:tdId); }
				else { PlayerTextDrawSetString(playerid, PlayerText:tdId, part); PlayerTextDrawShow(playerid, PlayerText:tdId); }
				if (typewriterDone)
				{
					TDFX_Free(slot, true, true);
					return 1;
				}
			}
			else
			{
				if (fxType == TDFX_TYPE_TYPEWRITER)
				{
					TDFX_Free(slot, true, true);
					return 1;
				}
				TDFX_Step[slot] = TDFX_Step[slot] ? 0 : 1;
				new bool:lit = (TDFX_Step[slot] != 0);
				if (TDFX_Colour[slot])
				{
					new c = lit ? TDFX_Colour[slot] : TDFX_Base[slot];
					if (isGlobal)
					{
						if (TDFX_Preview[slot])
						{
							_TDFX_TDBackColour(Text:tdId, c);
						}
						else
						{
							_TDFX_TDColour(Text:tdId, c);
							if (TDFX_BoxBase[slot]) _TDFX_TDBoxColour(Text:tdId, lit ? TDFX_Colour[slot] : TDFX_BoxBase[slot]);
						}
						_TDFX_UpdateGlobalTD(Text:tdId);
					}
					else if (TDFX_Preview[slot])
					{
						_TDFX_PTDBackColour(playerid, PlayerText:tdId, c);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
					else
					{
						_TDFX_PTDColour(playerid, PlayerText:tdId, c);
						if (TDFX_BoxBase[slot]) _TDFX_PTDBoxColour(playerid, PlayerText:tdId, lit ? TDFX_Colour[slot] : TDFX_BoxBase[slot]);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
				}
				else
				{
					if (isGlobal) { if (lit) _TDFX_UpdateGlobalTD(Text:tdId); else _TDFX_HideGlobalTD(Text:tdId); }
					else { if (lit) PlayerTextDrawShow(playerid, PlayerText:tdId); else PlayerTextDrawHide(playerid, PlayerText:tdId); }
				}
			}
		}

		case TDFX_TYPE_FADE:
		{
			new Float:factor = TDFX_ApplyEasing(progress, TDFX_Easing[slot]);
			new curCol = TDFX_LerpColor(TDFX_ColFrom[slot], TDFX_ColTo[slot], factor);
			new curBox = TDFX_LerpColor(TDFX_BoxColFrom[slot], TDFX_BoxColTo[slot], factor);

			if (isGlobal)
			{
				if (TDFX_Preview[slot])
				{
					_TDFX_TDBackColour(Text:tdId, curCol);
				}
				else
				{
					_TDFX_TDColour(Text:tdId, curCol);
					if (TDFX_FadeBox[slot]) _TDFX_TDBoxColour(Text:tdId, curBox);
				}
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			else if (TDFX_Preview[slot])
			{
				_TDFX_PTDBackColour(playerid, PlayerText:tdId, curCol);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			else
			{
				_TDFX_PTDColour(playerid, PlayerText:tdId, curCol);
				if (TDFX_FadeBox[slot]) _TDFX_PTDBoxColour(playerid, PlayerText:tdId, curBox);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
		}

		case TDFX_TYPE_SCALE:
		{
			new Float:factor = TDFX_ApplyEasing(progress, TDFX_Easing[slot]);
			new Float:curX = TDFX_FloatA[slot] + (TDFX_FloatC[slot] - TDFX_FloatA[slot]) * factor;
			new Float:curY = TDFX_FloatB[slot] + (TDFX_FloatD[slot] - TDFX_FloatB[slot]) * factor;

			if (isGlobal)
			{
				TextDrawLetterSize(Text:tdId, curX, curY);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			else
			{
				PlayerTextDrawLetterSize(playerid, PlayerText:tdId, curX, curY);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
		}

		case TDFX_TYPE_PULSE:
		{
			new Float:cycles = TDFX_FloatD[slot];
			new Float:wave;
			if (cycles > 0.0)
				wave = floatsin(progress * 360.0 * cycles, degrees);
			else
				wave = floatsin(float(elapsed % 1000) * 0.36, degrees);

			new Float:amp = TDFX_FloatC[slot];
			new Float:curX = TDFX_FloatA[slot] * (1.0 + amp * wave);
			new Float:curY = TDFX_FloatB[slot] * (1.0 + amp * wave);

			if (isGlobal)
			{
				TextDrawLetterSize(Text:tdId, curX, curY);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			else
			{
				PlayerTextDrawLetterSize(playerid, PlayerText:tdId, curX, curY);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
		}

		case TDFX_TYPE_SLIDE:
		{
			new Float:factor = TDFX_ApplyEasing(progress, TDFX_Easing[slot]);
			new Float:curX = TDFX_FloatA[slot] + (TDFX_FloatC[slot] - TDFX_FloatA[slot]) * factor;
			new Float:curY = TDFX_FloatB[slot] + (TDFX_FloatD[slot] - TDFX_FloatB[slot]) * factor;

			#if defined PlayerTextDrawSetPos
				if (!isGlobal)
				{
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, curX, curY);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
			#endif
			#if defined TextDrawSetPos
				if (isGlobal)
				{
					TextDrawSetPos(Text:tdId, curX, curY);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
			#endif
		}

		case TDFX_TYPE_COUNT:
		{
			new Float:factor = TDFX_ApplyEasing(progress, TDFX_Easing[slot]);
			new fromVal = TDFX_Step[slot], toVal = TDFX_Count[slot];
			new curVal = fromVal + floatround(float(toVal - fromVal) * factor);
			new str[TDFX_MAX_TEXT];
			TDFX_FormatNumber(str, sizeof str, curVal, TDFX_Prefix[slot], TDFX_Suffix[slot], TDFX_ThousandSep[slot]);

			if (isGlobal)
			{
				TextDrawSetString(Text:tdId, str);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			else
			{
				PlayerTextDrawSetString(playerid, PlayerText:tdId, str);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
		}

		case TDFX_TYPE_SCRAMBLE:
		{
			new totalLen = strlen(TDFX_Text[slot]);
			new solved = floatround(float(totalLen) * progress);
			new buf[TDFX_MAX_TEXT];
			new const charset[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%*&@$!";
			new csLen = sizeof(charset) - 1;

			for (new i = 0; i < totalLen && i < sizeof(buf) - 1; i++)
			{
				if (TDFX_Text[slot][i] == '~')
				{
					new nextTag = TDFX_SkipTag(TDFX_Text[slot], i);
					while (i < nextTag && i < sizeof(buf) - 1)
					{
						buf[i] = TDFX_Text[slot][i];
						i++;
					}
					i--;
					continue;
				}
				if (TDFX_Text[slot][i] == ' ' || TDFX_Text[slot][i] == '_')
				{
					buf[i] = TDFX_Text[slot][i];
					continue;
				}
				if (i < solved)
				{
					buf[i] = TDFX_Text[slot][i];
				}
				else
				{
					buf[i] = charset[random(csLen)];
				}
			}
			buf[totalLen] = 0;

			if (isGlobal)
			{
				TextDrawSetString(Text:tdId, buf);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			else
			{
				PlayerTextDrawSetString(playerid, PlayerText:tdId, buf);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
		}

		case TDFX_TYPE_BOUNCE:
		{
			new Float:curX = TDFX_FloatA[slot] + TDFX_FloatC[slot];
			new Float:curY = TDFX_FloatB[slot] + TDFX_FloatD[slot];
			new bool:bounced = false, bool:hitX = false, bool:hitY = false;

			new Float:cornerTol = (floatabs(TDFX_FloatC[slot]) + floatabs(TDFX_FloatD[slot])) * 1.5;
			new bool:nearLeft = (curX <= (TDFX_BoundMinX[slot] + cornerTol));
			new bool:nearRight = (curX >= (TDFX_BoundMaxX[slot] - cornerTol));
			new bool:nearTop = (curY <= (TDFX_BoundMinY[slot] + cornerTol));
			new bool:nearBottom = (curY >= (TDFX_BoundMaxY[slot] - cornerTol));

			if ((nearLeft || nearRight) && (nearTop || nearBottom) && (curX <= TDFX_BoundMinX[slot] || curX >= TDFX_BoundMaxX[slot] || curY <= TDFX_BoundMinY[slot] || curY >= TDFX_BoundMaxY[slot]))
			{
				if (curX <= TDFX_BoundMinX[slot]) curX = TDFX_BoundMinX[slot];
				else if (curX >= TDFX_BoundMaxX[slot]) curX = TDFX_BoundMaxX[slot];
				if (curY <= TDFX_BoundMinY[slot]) curY = TDFX_BoundMinY[slot];
				else if (curY >= TDFX_BoundMaxY[slot]) curY = TDFX_BoundMaxY[slot];

				TDFX_FloatC[slot] = -TDFX_FloatC[slot];
				TDFX_FloatD[slot] = -TDFX_FloatD[slot];
				bounced = true;
				hitX = true;
				hitY = true;
			}
			else
			{
				if (curX <= TDFX_BoundMinX[slot])
				{
					curX = TDFX_BoundMinX[slot];
					TDFX_FloatC[slot] = -TDFX_FloatC[slot];
					new Float:dyJit = 0.94 + (float(random(13)) / 100.0);
					TDFX_FloatD[slot] *= dyJit;
					if (floatabs(TDFX_FloatD[slot]) < 1.0) TDFX_FloatD[slot] = (TDFX_FloatD[slot] < 0.0) ? -1.2 : 1.2;
					else if (floatabs(TDFX_FloatD[slot]) > 4.5) TDFX_FloatD[slot] = (TDFX_FloatD[slot] < 0.0) ? -4.0 : 4.0;
					bounced = true;
					hitX = true;
				}
				else if (curX >= TDFX_BoundMaxX[slot])
				{
					curX = TDFX_BoundMaxX[slot];
					TDFX_FloatC[slot] = -TDFX_FloatC[slot];
					new Float:dyJit = 0.94 + (float(random(13)) / 100.0);
					TDFX_FloatD[slot] *= dyJit;
					if (floatabs(TDFX_FloatD[slot]) < 1.0) TDFX_FloatD[slot] = (TDFX_FloatD[slot] < 0.0) ? -1.2 : 1.2;
					else if (floatabs(TDFX_FloatD[slot]) > 4.5) TDFX_FloatD[slot] = (TDFX_FloatD[slot] < 0.0) ? -4.0 : 4.0;
					bounced = true;
					hitX = true;
				}

				if (curY <= TDFX_BoundMinY[slot])
				{
					curY = TDFX_BoundMinY[slot];
					TDFX_FloatD[slot] = -TDFX_FloatD[slot];
					new Float:dxJit = 0.94 + (float(random(13)) / 100.0);
					TDFX_FloatC[slot] *= dxJit;
					if (floatabs(TDFX_FloatC[slot]) < 1.0) TDFX_FloatC[slot] = (TDFX_FloatC[slot] < 0.0) ? -1.2 : 1.2;
					else if (floatabs(TDFX_FloatC[slot]) > 4.5) TDFX_FloatC[slot] = (TDFX_FloatC[slot] < 0.0) ? -4.0 : 4.0;
					bounced = true;
					hitY = true;
				}
				else if (curY >= TDFX_BoundMaxY[slot])
				{
					curY = TDFX_BoundMaxY[slot];
					TDFX_FloatD[slot] = -TDFX_FloatD[slot];
					new Float:dxJit = 0.94 + (float(random(13)) / 100.0);
					TDFX_FloatC[slot] *= dxJit;
					if (floatabs(TDFX_FloatC[slot]) < 1.0) TDFX_FloatC[slot] = (TDFX_FloatC[slot] < 0.0) ? -1.2 : 1.2;
					else if (floatabs(TDFX_FloatC[slot]) > 4.5) TDFX_FloatC[slot] = (TDFX_FloatC[slot] < 0.0) ? -4.0 : 4.0;
					bounced = true;
					hitY = true;
				}
			}

			TDFX_FloatA[slot] = curX;
			TDFX_FloatB[slot] = curY;

			if (bounced && TDFX_ColorShift[slot])
			{
				new nextCol = TDFX_DvdPalette[random(sizeof(TDFX_DvdPalette))];
				TDFX_Base[slot] = nextCol;
				if (isGlobal) _TDFX_TDColour(Text:tdId, nextCol);
				else _TDFX_PTDColour(playerid, PlayerText:tdId, nextCol);
			}

			if (hitX && hitY)
			{
				if (!isGlobal && IsPlayerConnected(playerid))
				{
					PlayerPlaySound(playerid, 1057, 0.0, 0.0, 0.0);
				}
			}

			#if defined PlayerTextDrawSetPos
				if (!isGlobal)
				{
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, curX, curY);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
			#endif
			#if defined TextDrawSetPos
				if (isGlobal)
				{
					TextDrawSetPos(Text:tdId, curX, curY);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
			#endif
		}

		case TDFX_TYPE_BOUNCE_CIRC:
		{
			new Float:curX = TDFX_FloatA[slot] + TDFX_FloatC[slot];
			new Float:curY = TDFX_FloatB[slot] + TDFX_FloatD[slot];
			new Float:dx = curX - TDFX_BoundMinX[slot];
			new Float:dy = curY - TDFX_BoundMinY[slot];
			new Float:dist = floatsqroot(dx * dx + dy * dy);

			if (dist >= TDFX_BoundMaxX[slot] && dist > 0.0001)
			{
				new Float:nx = dx / dist;
				new Float:ny = dy / dist;
				new Float:dot = TDFX_FloatC[slot] * nx + TDFX_FloatD[slot] * ny;
				if (dot > 0.0)
				{
					new Float:vx = TDFX_FloatC[slot] - 2.0 * dot * nx;
					new Float:vy = TDFX_FloatD[slot] - 2.0 * dot * ny;

					// Deflect if hitting near head-on to guarantee continuous 2D polygon bounce around circle
					new Float:speed = floatsqroot(vx * vx + vy * vy);
					if (dot >= speed * 0.85)
					{
						vx += -ny * (speed * 0.40);
						vy += nx * (speed * 0.40);
						new Float:ns = floatsqroot(vx * vx + vy * vy);
						if (ns > 0.001)
						{
							vx = (vx / ns) * speed;
							vy = (vy / ns) * speed;
						}
					}

					TDFX_FloatC[slot] = vx;
					TDFX_FloatD[slot] = vy;
					curX = TDFX_BoundMinX[slot] + nx * (TDFX_BoundMaxX[slot] - 0.5);
					curY = TDFX_BoundMinY[slot] + ny * (TDFX_BoundMaxX[slot] - 0.5);

					if (TDFX_ColorShift[slot])
					{
						new nextCol = TDFX_DvdPalette[random(sizeof(TDFX_DvdPalette))];
						TDFX_Base[slot] = nextCol;
						if (isGlobal) _TDFX_TDColour(Text:tdId, nextCol);
						else _TDFX_PTDColour(playerid, PlayerText:tdId, nextCol);
					}
				}
			}

			TDFX_FloatA[slot] = curX;
			TDFX_FloatB[slot] = curY;

			#if defined PlayerTextDrawSetPos
				if (!isGlobal)
				{
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, curX, curY);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
			#endif
			#if defined TextDrawSetPos
				if (isGlobal)
				{
					TextDrawSetPos(Text:tdId, curX, curY);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
			#endif
		}

		case TDFX_TYPE_ORBIT:
		{
			new Float:curAngle = TDFX_BoundMinY[slot] + (TDFX_BoundMinX[slot] * float(elapsed) / 1000.0);
			new Float:curX = TDFX_FloatA[slot] + TDFX_FloatC[slot] * floatcos(curAngle, degrees);
			new Float:curY = TDFX_FloatB[slot] + TDFX_FloatD[slot] * floatsin(curAngle, degrees);

			#if defined PlayerTextDrawSetPos
				if (!isGlobal)
				{
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, curX, curY);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
			#endif
			#if defined TextDrawSetPos
				if (isGlobal)
				{
					TextDrawSetPos(Text:tdId, curX, curY);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
			#endif
		}

		case TDFX_TYPE_SHAKE:
		{
			new Float:trauma = 1.0 - progress;
			new Float:shake = trauma * trauma * TDFX_FloatC[slot];
			new Float:rndAngle = float(random(360));
			new Float:dist = (float(random(1001)) / 1000.0) * shake;
			new Float:curX = TDFX_FloatA[slot] + dist * floatsin(rndAngle, degrees);
			new Float:curY = TDFX_FloatB[slot] + dist * floatcos(rndAngle, degrees);

			#if defined PlayerTextDrawSetPos
				if (!isGlobal)
				{
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, curX, curY);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
			#endif
			#if defined TextDrawSetPos
				if (isGlobal)
				{
					TextDrawSetPos(Text:tdId, curX, curY);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
			#endif
		}

		case TDFX_TYPE_NEON:
		{
			new alpha = 255;
			if (progress < 0.85)
			{
				new roll = random(100);
				if (roll < TDFX_Step[slot])
				{
					new sub = random(100);
					if (sub < 25) alpha = 30 + random(50);
					else if (sub < 55) alpha = 0;
					else if (sub < 80) alpha = 120 + random(60);
					else alpha = 255;
				}
			}

			new curCol = (TDFX_Base[slot] & 0xFFFFFF00) | alpha;
			new curBox = 0;
			if (TDFX_BoxBase[slot])
			{
				new origAlpha = TDFX_BoxBase[slot] & 0xFF;
				new boxAlpha = (alpha * origAlpha) / 255;
				curBox = (TDFX_BoxBase[slot] & 0xFFFFFF00) | boxAlpha;
			}

			if (isGlobal)
			{
				if (TDFX_Preview[slot])
				{
					_TDFX_TDBackColour(Text:tdId, curCol);
				}
				else
				{
					_TDFX_TDColour(Text:tdId, curCol);
					if (TDFX_BoxBase[slot]) _TDFX_TDBoxColour(Text:tdId, curBox);
				}
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			else
			{
				_TDFX_PTDColour(playerid, PlayerText:tdId, curCol);
				if (TDFX_BoxBase[slot]) _TDFX_PTDBoxColour(playerid, PlayerText:tdId, curBox);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
		}

		case TDFX_TYPE_WAVE:
		{
			new speedMs = TDFX_Step[slot];
			if (speedMs < 100) speedMs = 1500;
			new Float:phase = float(elapsed % speedMs) / float(speedMs);
			new Float:angle = phase * 360.0;
			new Float:curX = TDFX_FloatA[slot] + TDFX_FloatC[slot] * floatsin(angle, degrees);
			new Float:curY = TDFX_FloatB[slot] + TDFX_FloatD[slot] * floatcos(angle, degrees);

			#if defined PlayerTextDrawSetPos
				if (!isGlobal)
				{
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, curX, curY);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
			#endif
			#if defined TextDrawSetPos
				if (isGlobal)
				{
					TextDrawSetPos(Text:tdId, curX, curY);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
			#endif
		}

		case TDFX_TYPE_PROGRESS:
		{
			new Float:factor = TDFX_ApplyEasing(progress, TDFX_Easing[slot]);
			new Float:curWidth = TDFX_FloatA[slot] + (TDFX_FloatC[slot] - TDFX_FloatA[slot]) * factor;

			if (isGlobal)
			{
				new gAlign = 1;
				#if TDFX_MAX_GLOBAL_TD > 0
					if (TDFX_ValidGlobal(Text:tdId)) gAlign = TDFX_GRemAlign[tdId];
				#endif
				#if defined TextDrawGetAlignment
					gAlign = _:TextDrawGetAlignment(Text:tdId);
				#endif

				if (gAlign == 2) TextDrawTextSize(Text:tdId, TDFX_FloatB[slot], curWidth);
				else TextDrawTextSize(Text:tdId, curWidth, TDFX_FloatB[slot]);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			else
			{
				new align = 1;
				if (TDFX_ValidPlayer(playerid, PlayerText:tdId)) align = TDFX_RemAlign[playerid][tdId];
				#if defined PlayerTextDrawGetAlignment
					align = _:PlayerTextDrawGetAlignment(playerid, PlayerText:tdId);
				#endif

				if (align == 2) PlayerTextDrawTextSize(playerid, PlayerText:tdId, TDFX_FloatB[slot], curWidth);
				else PlayerTextDrawTextSize(playerid, PlayerText:tdId, curWidth, TDFX_FloatB[slot]);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
		}

		case TDFX_TYPE_FIREWORK:
		{
			new fwIdx = TDFX_Step[slot];
			if (fwIdx < 0 || fwIdx >= TDFX_MAX_FW_INSTANCES) return 1;

			new fuseDuration = TDFX_Count[slot];
			new totalDuration = TDFX_Duration[slot];
			new explodeDuration = totalDuration - fuseDuration;
			if (explodeDuration <= 0) explodeDuration = 1000;

			#if defined PlayerTextDrawSetPos
			if (elapsed < fuseDuration)
			{
				new Float:fuseProg = float(elapsed) / float(fuseDuration);
				new Float:intensity = TDFX_FloatC[slot] * (0.25 + 0.75 * fuseProg * fuseProg);

				new Float:rx = (float(random(200)) - 100.0) / 100.0 * intensity;
				new Float:ry = (float(random(200)) - 100.0) / 100.0 * intensity;

				new Float:origX = TDFX_FwBaseX[fwIdx];
				new Float:origY = TDFX_FwBaseY[fwIdx];

				if (!isGlobal)
				{
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, origX + rx, origY + ry);
					if ((elapsed / 60) % 2 == 0)
					{
						new flashCol = (fuseProg > 0.6) ? 0xFFFFFFFF : 0xE74C3CFF;
						_TDFX_PTDColour(playerid, PlayerText:tdId, flashCol);
					}
					else
					{
						_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
					}
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
				#if TDFX_MAX_GLOBAL_TD > 0
				else
				{
					TextDrawSetPos(Text:tdId, origX + rx, origY + ry);
					if ((elapsed / 60) % 2 == 0)
					{
						new flashCol = (fuseProg > 0.6) ? 0xFFFFFFFF : 0xE74C3CFF;
						_TDFX_TDColour(Text:tdId, flashCol);
					}
					else
					{
						_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
					}
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
				#endif
			}
			else
			{
				new expElapsed = elapsed - fuseDuration;
				new Float:expProg = float(expElapsed) / float(explodeDuration);
				if (expProg > 1.0) expProg = 1.0;

				if (!TDFX_PerChar[slot])
				{
					TDFX_PerChar[slot] = true;
					new Float:origX = TDFX_FwBaseX[fwIdx];
					new Float:origY = TDFX_FwBaseY[fwIdx];

					new pCount = TDFX_FwCount[fwIdx];
					if (pCount <= 0 || pCount > TDFX_FW_PARTICLES) pCount = 10;
					new pattern = TDFX_Easing[slot];

					if (!isGlobal)
					{
						PlayerTextDrawHide(playerid, PlayerText:tdId);
						PlayerPlaySound(playerid, 1159, 0.0, 0.0, 0.0);

						for (new p = 0; p < pCount; p++)
						{
							new Float:angle = 0.0;
							new Float:spd = TDFX_FloatD[slot] * (0.80 + float(random(40)) / 100.0);
							new Float:vx = 0.0, Float:vy = 0.0;

							switch (pattern)
							{
								case TDFX_FW_BURST_FAN:
								{
									angle = -135.0 + (90.0 / float(pCount > 1 ? (pCount - 1) : 1)) * float(p) + float(random(10)) - 5.0;
									vx = spd * floatcos(angle, degrees);
									vy = spd * floatsin(angle, degrees) - 2.0;
								}
								case TDFX_FW_BURST_ROCKET:
								{
									angle = -90.0 + (float(p) - float(pCount) / 2.0) * 8.0 + float(random(6)) - 3.0;
									new Float:boost = 1.30 + float(p % 3) * 0.20;
									vx = (spd * 0.45) * floatcos(angle, degrees);
									vy = -spd * boost;
								}
								case TDFX_FW_BURST_RING:
								{
									angle = (p % 2 == 0) ? (float(random(40)) - 20.0) : (180.0 + float(random(40)) - 20.0);
									vx = spd * 1.35 * floatcos(angle, degrees);
									vy = spd * 0.35 * floatsin(angle, degrees);
								}
								case TDFX_FW_BURST_FOUNTAIN:
								{
									angle = -110.0 + (40.0 / float(pCount > 1 ? (pCount - 1) : 1)) * float(p) + float(random(10)) - 5.0;
									vx = (spd * 0.70) * floatcos(angle, degrees);
									vy = -spd * (1.30 + float(random(40)) / 100.0);
								}
								default: // TDFX_FW_BURST_SPHERE
								{
									angle = (360.0 / float(pCount)) * float(p) + float(random(24)) - 12.0;
									vx = spd * floatcos(angle, degrees);
									vy = spd * floatsin(angle, degrees) - 2.5;
								}
							}

							TDFX_FwPartVx[fwIdx][p] = vx;
							TDFX_FwPartVy[fwIdx][p] = vy;
							TDFX_FwPartX[fwIdx][p] = origX;
							TDFX_FwPartY[fwIdx][p] = origY;
							TDFX_FwPartCol[fwIdx][p] = TDFX_FwPalette[p % sizeof(TDFX_FwPalette)];

							new PlayerText:ptd = CreatePlayerTextDraw(playerid, origX, origY, TDFX_FwGlyphs[p]);
							if (_:ptd != 0xFFFF && _:ptd >= 0)
							{
								#if defined _INC_open_mp
								PlayerTextDrawAlignment(playerid, ptd, TEXT_DRAW_ALIGN_CENTER);
								PlayerTextDrawFont(playerid, ptd, TEXT_DRAW_FONT_2);
								#else
								PlayerTextDrawAlignment(playerid, ptd, 2);
								PlayerTextDrawFont(playerid, ptd, 2);
								#endif
								PlayerTextDrawLetterSize(playerid, ptd, 0.40, 1.60);
								_TDFX_PTDColour(playerid, ptd, TDFX_FwPartCol[fwIdx][p]);
								PlayerTextDrawSetOutline(playerid, ptd, 1);
								PlayerTextDrawShow(playerid, ptd);
								TDFX_FwParts[fwIdx][p] = ptd;
							}
							else
							{
								TDFX_FwParts[fwIdx][p] = PlayerText:INVALID_TEXT_DRAW;
							}
						}
					}
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						TextDrawHideForAll(Text:tdId);

						for (new p = 0; p < pCount; p++)
						{
							new Float:angle = 0.0;
							new Float:spd = TDFX_FloatD[slot] * (0.80 + float(random(40)) / 100.0);
							new Float:vx = 0.0, Float:vy = 0.0;

							switch (pattern)
							{
								case TDFX_FW_BURST_FAN:
								{
									angle = -135.0 + (90.0 / float(pCount > 1 ? (pCount - 1) : 1)) * float(p) + float(random(10)) - 5.0;
									vx = spd * floatcos(angle, degrees);
									vy = spd * floatsin(angle, degrees) - 2.0;
								}
								case TDFX_FW_BURST_ROCKET:
								{
									angle = -90.0 + (float(p) - float(pCount) / 2.0) * 8.0 + float(random(6)) - 3.0;
									new Float:boost = 1.30 + float(p % 3) * 0.20;
									vx = (spd * 0.45) * floatcos(angle, degrees);
									vy = -spd * boost;
								}
								case TDFX_FW_BURST_RING:
								{
									angle = (p % 2 == 0) ? (float(random(40)) - 20.0) : (180.0 + float(random(40)) - 20.0);
									vx = spd * 1.35 * floatcos(angle, degrees);
									vy = spd * 0.35 * floatsin(angle, degrees);
								}
								case TDFX_FW_BURST_FOUNTAIN:
								{
									angle = -110.0 + (40.0 / float(pCount > 1 ? (pCount - 1) : 1)) * float(p) + float(random(10)) - 5.0;
									vx = (spd * 0.70) * floatcos(angle, degrees);
									vy = -spd * (1.30 + float(random(40)) / 100.0);
								}
								default: // TDFX_FW_BURST_SPHERE
								{
									angle = (360.0 / float(pCount)) * float(p) + float(random(24)) - 12.0;
									vx = spd * floatcos(angle, degrees);
									vy = spd * floatsin(angle, degrees) - 2.5;
								}
							}

							TDFX_FwPartVx[fwIdx][p] = vx;
							TDFX_FwPartVy[fwIdx][p] = vy;
							TDFX_FwPartX[fwIdx][p] = origX;
							TDFX_FwPartY[fwIdx][p] = origY;
							TDFX_FwPartCol[fwIdx][p] = TDFX_FwPalette[p % sizeof(TDFX_FwPalette)];

							new Text:gtd = TextDrawCreate(origX, origY, TDFX_FwGlyphs[p]);
							if (_:gtd != 0xFFFF && _:gtd >= 0)
							{
								#if defined _INC_open_mp
								TextDrawAlignment(gtd, TEXT_DRAW_ALIGN_CENTER);
								TextDrawFont(gtd, TEXT_DRAW_FONT_2);
								#else
								TextDrawAlignment(gtd, 2);
								TextDrawFont(gtd, 2);
								#endif
								TextDrawLetterSize(gtd, 0.40, 1.60);
								_TDFX_TDColour(gtd, TDFX_FwPartCol[fwIdx][p]);
								TextDrawSetOutline(gtd, 1);
								_TDFX_UpdateGlobalChildTD(gtd, tdId);
								TDFX_GFwParts[fwIdx][p] = gtd;
							}
							else
							{
								TDFX_GFwParts[fwIdx][p] = Text:INVALID_TEXT_DRAW;
							}
						}
					}
					#endif
				}
				else
				{
					new alpha = floatround(255.0 * (1.0 - expProg));
					new pCount = TDFX_FwCount[fwIdx];
					if (pCount <= 0 || pCount > TDFX_FW_PARTICLES) pCount = 10;
					for (new p = 0; p < pCount; p++)
					{
						TDFX_FwPartVy[fwIdx][p] += 0.22;
						TDFX_FwPartVx[fwIdx][p] *= 0.96;
						TDFX_FwPartVy[fwIdx][p] *= 0.96;
						TDFX_FwPartX[fwIdx][p] += TDFX_FwPartVx[fwIdx][p];
						TDFX_FwPartY[fwIdx][p] += TDFX_FwPartVy[fwIdx][p];

						new pCol = (TDFX_FwPartCol[fwIdx][p] & 0xFFFFFF00) | (alpha & 0xFF);
						if (!isGlobal)
						{
							if (TDFX_FwParts[fwIdx][p] != PlayerText:INVALID_TEXT_DRAW)
							{
								PlayerTextDrawSetPos(playerid, TDFX_FwParts[fwIdx][p], TDFX_FwPartX[fwIdx][p], TDFX_FwPartY[fwIdx][p]);
								_TDFX_PTDColour(playerid, TDFX_FwParts[fwIdx][p], pCol);
								PlayerTextDrawShow(playerid, TDFX_FwParts[fwIdx][p]);
							}
						}
						#if TDFX_MAX_GLOBAL_TD > 0
						else
						{
							if (TDFX_GFwParts[fwIdx][p] != Text:INVALID_TEXT_DRAW)
							{
								TextDrawSetPos(TDFX_GFwParts[fwIdx][p], TDFX_FwPartX[fwIdx][p], TDFX_FwPartY[fwIdx][p]);
								_TDFX_TDColour(TDFX_GFwParts[fwIdx][p], pCol);
								_TDFX_UpdateGlobalChildTD(TDFX_GFwParts[fwIdx][p], tdId);
							}
						}
						#endif
					}
				}
			}
			#endif

			if (elapsed >= totalDuration)
			{
				if (TDFX_Loop[slot])
				{
					if (TDFX_PerChar[slot] && fwIdx >= 0 && fwIdx < TDFX_MAX_FW_INSTANCES)
					{
						for (new p = 0; p < TDFX_FW_PARTICLES; p++)
						{
							if (!isGlobal && TDFX_FwParts[fwIdx][p] != PlayerText:INVALID_TEXT_DRAW)
							{
								PlayerTextDrawDestroy(playerid, TDFX_FwParts[fwIdx][p]);
								TDFX_FwParts[fwIdx][p] = PlayerText:INVALID_TEXT_DRAW;
							}
							#if TDFX_MAX_GLOBAL_TD > 0
							else if (isGlobal && TDFX_GFwParts[fwIdx][p] != Text:INVALID_TEXT_DRAW)
							{
								TextDrawDestroy(TDFX_GFwParts[fwIdx][p]);
								TDFX_GFwParts[fwIdx][p] = Text:INVALID_TEXT_DRAW;
							}
							#endif
						}
					}
					TDFX_PerChar[slot] = false;
					TDFX_Start[slot] = GetTickCount();
				}
				else
				{
					TDFX_Free(slot, true, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_GLITCH:
		{
			new buf[TDFX_MAX_TEXT];
			strmid(buf, TDFX_Text[slot], 0, strlen(TDFX_Text[slot]), sizeof buf);
			new totalLen = strlen(buf);
			new alpha = 255;

			if (random(100) < 35 && totalLen > 0)
			{
				alpha = 180 + random(76);
				new const glitchChars[] = "!@#$%^&*<>[]{}01/+=?";
				new gcLen = sizeof(glitchChars) - 1;
				new glitches = TDFX_Step[slot];
				if (glitches < 1) glitches = 1;
				if (glitches > 5) glitches = 5;

				for (new g = 0; g < glitches; g++)
				{
					new idx = random(totalLen);
					new bool:inTag = false, j = 0;
					while (j <= idx && buf[j])
					{
						if (buf[j] == '~')
						{
							new nextTag = TDFX_SkipTag(buf, j);
							if (idx >= j && idx < nextTag) { inTag = true; break; }
							j = nextTag;
							continue;
						}
						j++;
					}
					if (!inTag && buf[idx] != ' ' && buf[idx] != '_')
					{
						buf[idx] = glitchChars[random(gcLen)];
					}
				}
			}

			new curCol = (TDFX_Base[slot] & 0xFFFFFF00) | alpha;

			if (isGlobal)
			{
				_TDFX_TDColour(Text:tdId, curCol);
				TextDrawSetString(Text:tdId, buf);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			else
			{
				_TDFX_PTDColour(playerid, PlayerText:tdId, curCol);
				PlayerTextDrawSetString(playerid, PlayerText:tdId, buf);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
		}

		case TDFX_TYPE_SPIN3D:
		{
			new Float:dt = float(TDFX_FRAME_INTERVAL) / 1000.0;
			TDFX_FloatA[slot] += TDFX_BoundMinX[slot] * dt;
			TDFX_FloatB[slot] += TDFX_BoundMinY[slot] * dt;
			TDFX_FloatC[slot] += TDFX_BoundMaxX[slot] * dt;

			if (TDFX_FloatA[slot] >= 360.0) TDFX_FloatA[slot] -= 360.0;
			else if (TDFX_FloatA[slot] < 0.0) TDFX_FloatA[slot] += 360.0;

			if (TDFX_FloatB[slot] >= 360.0) TDFX_FloatB[slot] -= 360.0;
			else if (TDFX_FloatB[slot] < 0.0) TDFX_FloatB[slot] += 360.0;

			if (TDFX_FloatC[slot] >= 360.0) TDFX_FloatC[slot] -= 360.0;
			else if (TDFX_FloatC[slot] < 0.0) TDFX_FloatC[slot] += 360.0;

			#if defined PlayerTextDrawSetPreviewRot
			if (!isGlobal)
			{
				PlayerTextDrawSetPreviewRot(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot], TDFX_FloatC[slot], TDFX_FloatD[slot]);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			#endif
			#if defined TextDrawSetPreviewRot
			if (isGlobal)
			{
				TextDrawSetPreviewRot(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot], TDFX_FloatC[slot], TDFX_FloatD[slot]);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			#endif
		}

		case TDFX_TYPE_HOVER3D:
		{
			new speedMs = TDFX_Count[slot];
			if (speedMs <= 0) speedMs = 2000;
			new Float:theta = (float(elapsed % speedMs) / float(speedMs)) * 360.0;
			new Float:curX = TDFX_FloatA[slot] + TDFX_BoundMinX[slot] * floatsin(theta, degrees);
			new Float:curZ = TDFX_FloatC[slot] + TDFX_BoundMinY[slot] * floatcos(theta, degrees);
			new Float:curZoom = TDFX_FloatD[slot] + TDFX_BoundMaxX[slot] * floatsin(theta, degrees);

			#if defined PlayerTextDrawSetPreviewRot
			if (!isGlobal)
			{
				PlayerTextDrawSetPreviewRot(playerid, PlayerText:tdId, curX, TDFX_FloatB[slot], curZ, curZoom);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			#endif
			#if defined TextDrawSetPreviewRot
			if (isGlobal)
			{
				TextDrawSetPreviewRot(Text:tdId, curX, TDFX_FloatB[slot], curZ, curZoom);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			#endif
		}

		case TDFX_TYPE_SHIMMER:
		{
			new sweepTime = TDFX_Step[slot];
			if (sweepTime < 300) sweepTime = 300;
			new pauseTime = TDFX_Count[slot];
			if (pauseTime < 0) pauseTime = 0;
			new cycleTime = sweepTime + pauseTime;
			new cycleElapsed = elapsed % cycleTime;
			new totalVis = TDFX_CountVisibleGlyphs(TDFX_Text[slot]);
			new hIdx = -1;

			if (cycleElapsed < sweepTime && totalVis > 0)
			{
				hIdx = floatround((float(cycleElapsed) / float(sweepTime)) * float(totalVis + 2)) - 1;
			}

			if (hIdx != TDFX_Easing[slot])
			{
				TDFX_Easing[slot] = hIdx;
				new outStr[TDFX_MAX_TEXT];
				new outPos = 0;
				new curTag[16];
				strmid(curTag, TDFX_Prefix[slot], 0, strlen(TDFX_Prefix[slot]), sizeof curTag);
				new lastTag[16];
				lastTag[0] = '\0';
				new i = 0, visIdx = 0;

				while (TDFX_Text[slot][i] && outPos < (sizeof(outStr) - 20))
				{
					if (TDFX_Text[slot][i] == '~')
					{
						new nextTag = TDFX_SkipTag(TDFX_Text[slot], i);
						strmid(curTag, TDFX_Text[slot], i, nextTag, sizeof curTag);
						i = nextTag;
						continue;
					}

					new bool:shouldShim = (hIdx >= 0 && (visIdx >= (hIdx - 1) && visIdx <= (hIdx + 1)));
					new neededTag[16];
					if (shouldShim) strmid(neededTag, TDFX_Suffix[slot], 0, strlen(TDFX_Suffix[slot]), sizeof neededTag);
					else strmid(neededTag, curTag, 0, strlen(curTag), sizeof neededTag);

					if (strcmp(neededTag, lastTag) != 0)
					{
						for (new k = 0; neededTag[k] && outPos < (sizeof(outStr) - 2); k++)
							outStr[outPos++] = neededTag[k];
						strmid(lastTag, neededTag, 0, strlen(neededTag), sizeof lastTag);
					}

					outStr[outPos++] = TDFX_Text[slot][i];
					visIdx++;
					i++;
				}
				outStr[outPos] = '\0';

				if (!isGlobal)
				{
					PlayerTextDrawSetString(playerid, PlayerText:tdId, outStr);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
				else
				{
					TextDrawSetString(Text:tdId, outStr);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
			}
		}

		case TDFX_TYPE_RAINBOW:
		{
			new speedMs = TDFX_Step[slot];
			if (speedMs < 35) speedMs = 35;
			new phase = (elapsed / speedMs) % 6;

			if (phase != TDFX_Easing[slot])
			{
				TDFX_Easing[slot] = phase;
				new outStr[TDFX_MAX_TEXT];
				new outPos = 0;
				new i = 0, visIdx = 0;

				while (TDFX_Text[slot][i] && outPos < (sizeof(outStr) - 8))
				{
					if (TDFX_Text[slot][i] == '~')
					{
						i = TDFX_SkipTag(TDFX_Text[slot], i);
						continue;
					}

					if (TDFX_Text[slot][i] == ' ')
					{
						outStr[outPos++] = ' ';
						visIdx++;
						i++;
						continue;
					}

					new cIdx = (visIdx + phase) % 6;
					outStr[outPos++] = TDFX_RainbowPalette[cIdx][0];
					outStr[outPos++] = TDFX_RainbowPalette[cIdx][1];
					outStr[outPos++] = TDFX_RainbowPalette[cIdx][2];
					outStr[outPos++] = TDFX_Text[slot][i];
					visIdx++;
					i++;
				}
				outStr[outPos] = '\0';

				if (!isGlobal)
				{
					PlayerTextDrawSetString(playerid, PlayerText:tdId, outStr);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
				else
				{
					TextDrawSetString(Text:tdId, outStr);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
			}
		}

		case TDFX_TYPE_SLOT:
		{
			new totalVis = TDFX_CountVisibleGlyphs(TDFX_Text[slot]);
			if (totalVis <= 0) return 1;

			new spinDuration = TDFX_Duration[slot];
			if (spinDuration <= 0) spinDuration = 2200;
			new colTime = spinDuration / totalVis;
			if (colTime < 50) colTime = 50;

			new lockedCount = elapsed / colTime;
			if (lockedCount > totalVis) lockedCount = totalVis;

			if (lockedCount > TDFX_Step[slot])
			{
				if (!isGlobal && lockedCount < totalVis)
				{
					PlayerPlaySound(playerid, 1057, 0.0, 0.0, 0.0);
				}
				TDFX_Step[slot] = lockedCount;
			}

			new buf[TDFX_MAX_TEXT];
			new outPos = 0;
			new glyphCount = sizeof(TDFX_SlotGlyphs) - 1;
			new i = 0, visIdx = 0;

			while (TDFX_Text[slot][i] && outPos < (sizeof(buf) - 4))
			{
				if (TDFX_Text[slot][i] == '~')
				{
					new nextTag = TDFX_SkipTag(TDFX_Text[slot], i);
					for (new t = i; t < nextTag && outPos < (sizeof(buf) - 2); t++)
						buf[outPos++] = TDFX_Text[slot][t];
					i = nextTag;
					continue;
				}

				if (visIdx < lockedCount)
				{
					buf[outPos++] = TDFX_Text[slot][i];
				}
				else
				{
					buf[outPos++] = (TDFX_Text[slot][i] == ' ') ? ' ' : TDFX_SlotGlyphs[random(glyphCount)];
				}
				visIdx++;
				i++;
			}
			buf[outPos] = '\0';

			if (!isGlobal)
			{
				PlayerTextDrawSetString(playerid, PlayerText:tdId, buf);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			else
			{
				TextDrawSetString(Text:tdId, buf);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}

			if (lockedCount >= totalVis && elapsed >= spinDuration)
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
					TDFX_Step[slot] = 0;
				}
				else
				{
					if (!isGlobal)
					{
						PlayerPlaySound(playerid, 1058, 0.0, 0.0, 0.0);
					}
					TDFX_Free(slot, true, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_PENDULUM:
		{
			#if defined PlayerTextDrawSetPos
			new Float:t = float(elapsed) / 1000.0;
			new Float:decay = floatpower(2.71828, -TDFX_BoundMinX[slot] * t);
			new Float:theta = TDFX_FloatD[slot] * decay * floatcos(4.5 * t * 57.2958, degrees);
			new Float:curX = TDFX_FloatA[slot] + TDFX_FloatC[slot] * floatsin(theta, degrees);
			new Float:curY = TDFX_FloatB[slot] + TDFX_FloatC[slot] * floatcos(theta, degrees);

			if (!isGlobal)
			{
				PlayerTextDrawSetPos(playerid, PlayerText:tdId, curX, curY);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			#if TDFX_MAX_GLOBAL_TD > 0
			else
			{
				TextDrawSetPos(Text:tdId, curX, curY);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			#endif
			#endif
		}

		case TDFX_TYPE_SLAM:
		{
			#if defined PlayerTextDrawSetPos
			TDFX_FloatD[slot] += 1.15;
			TDFX_FloatB[slot] += TDFX_FloatD[slot];

			if (TDFX_FloatB[slot] >= TDFX_FloatC[slot])
			{
				TDFX_FloatB[slot] = TDFX_FloatC[slot];
				TDFX_FloatD[slot] = -TDFX_FloatD[slot] * TDFX_BoundMinX[slot];
				TDFX_Step[slot]++;

				if (TDFX_Step[slot] <= 2 && !isGlobal)
				{
					PlayerPlaySound(playerid, 1133, 0.0, 0.0, 0.0);
				}

				if (floatabs(TDFX_FloatD[slot]) < 0.60 || TDFX_Step[slot] >= 4)
				{
					if (TDFX_Loop[slot])
					{
						TDFX_Start[slot] = GetTickCount();
						TDFX_Step[slot] = 0;
						TDFX_FloatB[slot] = TDFX_BoundMinY[slot];
						TDFX_FloatD[slot] = 0.0;
					}
					else
					{
						TDFX_FloatB[slot] = TDFX_FloatC[slot];
						if (!isGlobal)
						{
							PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
							PlayerTextDrawShow(playerid, PlayerText:tdId);
						}
						#if TDFX_MAX_GLOBAL_TD > 0
						else
						{
							TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
							_TDFX_UpdateGlobalTD(Text:tdId);
						}
						#endif
						TDFX_Free(slot, true, true);
						return 1;
					}
				}
			}

			if (!isGlobal)
			{
				PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			#if TDFX_MAX_GLOBAL_TD > 0
			else
			{
				TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			#endif
			#endif
		}

		case TDFX_TYPE_VORTEX:
		{
			#if defined PlayerTextDrawSetPos
			new Float:prog = float(elapsed) / float(TDFX_Duration[slot]);
			if (prog > 1.0) prog = 1.0;

			new Float:r = TDFX_FloatC[slot] * (1.0 - prog * prog);
			new Float:theta = TDFX_FloatD[slot] * prog;
			new Float:curX = TDFX_FloatA[slot] + r * floatcos(theta, degrees);
			new Float:curY = TDFX_FloatB[slot] + r * floatsin(theta, degrees);
			new Float:scaleFactor = 1.0 - prog;

			if (!isGlobal)
			{
				PlayerTextDrawSetPos(playerid, PlayerText:tdId, curX, curY);
				PlayerTextDrawLetterSize(playerid, PlayerText:tdId, TDFX_BoundMinX[slot] * scaleFactor, TDFX_BoundMinY[slot] * scaleFactor);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			#if TDFX_MAX_GLOBAL_TD > 0
			else
			{
				TextDrawSetPos(Text:tdId, curX, curY);
				TextDrawLetterSize(Text:tdId, TDFX_BoundMinX[slot] * scaleFactor, TDFX_BoundMinY[slot] * scaleFactor);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			#endif

			if (prog >= 1.0)
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
				}
				else
				{
					if (!isGlobal)
					{
						PlayerPlaySound(playerid, 1185, 0.0, 0.0, 0.0);
						PlayerTextDrawHide(playerid, PlayerText:tdId);
					}
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						TextDrawHideForAll(Text:tdId);
					}
					#endif
					TDFX_Free(slot, false, true);
					return 1;
				}
			}
			#endif
		}

		case TDFX_TYPE_LETTERBOX:
		{
			new Float:prog = float(elapsed) / float(TDFX_Duration[slot]);
			if (prog > 1.0) prog = 1.0;
			new Float:factor = TDFX_ApplyEasing(prog, TDFX_Easing[slot]);
			if (TDFX_AutoHide[slot]) factor = 1.0 - factor;

			new Float:maxH = TDFX_FloatA[slot];
			new Float:curTopY = -(maxH + 15.0) + ((maxH + 15.0) * factor);
			new Float:curBottomY = TDFX_LETTERBOX_SCREEN_BOTTOM - ((maxH + TDFX_LETTERBOX_ASCENT_OFFSET) * factor);
			new bottomTd = TDFX_Step[slot];

			#if defined PlayerTextDrawSetPos
			if (!isGlobal)
			{
				PlayerTextDrawSetPos(playerid, PlayerText:tdId, 0.0, curTopY);
				PlayerTextDrawShow(playerid, PlayerText:tdId);

				if (bottomTd != -1 && bottomTd != 0xFFFF && bottomTd >= 0)
				{
					PlayerTextDrawSetPos(playerid, PlayerText:bottomTd, 0.0, curBottomY);
					PlayerTextDrawShow(playerid, PlayerText:bottomTd);
				}
			}
			#endif
			#if TDFX_MAX_GLOBAL_TD > 0
			else
			{
				#if defined TextDrawSetPos
				TextDrawSetPos(Text:tdId, 0.0, curTopY);
				_TDFX_UpdateGlobalTD(Text:tdId);

				if (bottomTd != -1 && bottomTd != 0xFFFF && bottomTd >= 0)
				{
					TextDrawSetPos(Text:bottomTd, 0.0, curBottomY);
					_TDFX_UpdateGlobalTD(Text:bottomTd);
				}
				#endif
			}
			#endif

			if (prog >= 1.0)
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
				}
				else
				{
					if (TDFX_AutoHide[slot])
					{
						if (!isGlobal)
						{
							PlayerTextDrawHide(playerid, PlayerText:tdId);
							if (bottomTd != -1 && bottomTd != 0xFFFF && bottomTd >= 0) PlayerTextDrawHide(playerid, PlayerText:bottomTd);
						}
						#if TDFX_MAX_GLOBAL_TD > 0
						else
						{
							TextDrawHideForAll(Text:tdId);
							if (bottomTd != -1 && bottomTd != 0xFFFF && bottomTd >= 0) TextDrawHideForAll(Text:bottomTd);
						}
						#endif
					}
					TDFX_Free(slot, false, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_SONAR:
		{
			new pDuration = TDFX_Step[slot];
			if (pDuration <= 0) pDuration = 1200;
			new pIdx = elapsed / pDuration;
			new pElapsed = elapsed % pDuration;

			if (pIdx != TDFX_Easing[slot])
			{
				TDFX_Easing[slot] = pIdx;
				if (!isGlobal)
				{
					PlayerPlaySound(playerid, 1058, 0.0, 0.0, 0.0);
				}
			}

			new Float:pProg = float(pElapsed) / float(pDuration);
			new alpha = floatround(255.0 * (1.0 - pProg * 0.85));
			new curCol = (TDFX_Base[slot] & 0xFFFFFF00) | (alpha & 0xFF);
			new Float:scaleX = TDFX_BoundMinX[slot] * (1.0 + 0.35 * pProg);
			new Float:scaleY = TDFX_BoundMinY[slot] * (1.0 + 0.35 * pProg);

			if (!isGlobal)
			{
				PlayerTextDrawLetterSize(playerid, PlayerText:tdId, scaleX, scaleY);
				_TDFX_PTDColour(playerid, PlayerText:tdId, curCol);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			#if TDFX_MAX_GLOBAL_TD > 0
			else
			{
				TextDrawLetterSize(Text:tdId, scaleX, scaleY);
				_TDFX_TDColour(Text:tdId, curCol);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			#endif

			if (elapsed >= TDFX_Duration[slot])
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
				}
				else
				{
					if (!isGlobal) PlayerTextDrawHide(playerid, PlayerText:tdId);
					#if TDFX_MAX_GLOBAL_TD > 0
					else TextDrawHideForAll(Text:tdId);
					#endif
					TDFX_Free(slot, false, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_WAVESWEEP:
		{
			new speedMs = TDFX_Step[slot];
			if (speedMs < 25) speedMs = 25;
			new totalVis = TDFX_CountVisibleGlyphs(TDFX_Text[slot]);
			if (totalVis > 0)
			{
				new crestW = floatround(TDFX_BoundMinX[slot]);
				if (crestW < 1) crestW = 1;
				new dir = floatround(TDFX_BoundMinY[slot]);
				new totalSteps = totalVis + crestW;
				new cycle = elapsed / speedMs;
				new center;

				if (dir == TDFX_DIR_LEFT_TO_RIGHT)
				{
					center = (cycle % totalSteps) - crestW/2;
				}
				else if (dir == TDFX_DIR_RIGHT_TO_LEFT)
				{
					center = totalVis - (cycle % totalSteps) + crestW/2;
				}
				else // TDFX_DIR_BOUNCE
				{
					new bounceSteps = (totalVis - 1) * 2;
					if (bounceSteps <= 0) bounceSteps = 1;
					new bPos = cycle % bounceSteps;
					if (bPos >= totalVis) center = bounceSteps - bPos;
					else center = bPos;
				}

				if (center != TDFX_Base[slot])
				{
					TDFX_Base[slot] = center;
					new outStr[TDFX_MAX_TEXT];
					new outPos = 0;
					new curTag[16];
					strmid(curTag, TDFX_Suffix[slot], 0, strlen(TDFX_Suffix[slot]), sizeof curTag);
					new lastTag[16];
					lastTag[0] = '\0';
					new i = 0, visIdx = 0;

					while (TDFX_Text[slot][i] && outPos < (sizeof(outStr) - 20))
					{
						if (TDFX_Text[slot][i] == '~')
						{
							new nextTag = TDFX_SkipTag(TDFX_Text[slot], i);
							strmid(curTag, TDFX_Text[slot], i, nextTag, sizeof curTag);
							i = nextTag;
							continue;
						}

						new dist = visIdx - center;
						if (dist < 0) dist = -dist;
						new bool:isCrest = (dist <= (crestW / 2));

						new neededTag[16];
						if (isCrest) strmid(neededTag, TDFX_Prefix[slot], 0, strlen(TDFX_Prefix[slot]), sizeof neededTag);
						else strmid(neededTag, curTag, 0, strlen(curTag), sizeof neededTag);

						if (strcmp(neededTag, lastTag) != 0)
						{
							for (new k = 0; neededTag[k] && outPos < (sizeof(outStr) - 2); k++)
								outStr[outPos++] = neededTag[k];
							strmid(lastTag, neededTag, 0, strlen(neededTag), sizeof lastTag);
						}

						outStr[outPos++] = TDFX_Text[slot][i];
						visIdx++;
						i++;
					}
					outStr[outPos] = '\0';

					if (!isGlobal)
					{
						PlayerTextDrawSetString(playerid, PlayerText:tdId, outStr);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						TextDrawSetString(Text:tdId, outStr);
						_TDFX_UpdateGlobalTD(Text:tdId);
					}
					#endif
					}
			}

			if (TDFX_Duration[slot] > 0 && elapsed >= TDFX_Duration[slot])
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
				}
				else
				{
					if (TDFX_AutoHide[slot])
					{
						if (!isGlobal) PlayerTextDrawHide(playerid, PlayerText:tdId);
						#if TDFX_MAX_GLOBAL_TD > 0
						else TextDrawHideForAll(Text:tdId);
						#endif
					}
					TDFX_Free(slot, true, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_LETTERRAIN:
		{
			new instIdx = TDFX_Step[slot];
			if (instIdx >= 0 && instIdx < TDFX_MAX_CHAR_INSTANCES && TDFX_CharActive[instIdx])
			{
				new count = TDFX_CharCount[instIdx];
				new Float:targetY = TDFX_CharTargetY[instIdx];

				for (new p = 0; p < count; p++)
				{
					if (elapsed < TDFX_CharDelay[instIdx][p]) continue;

					new pElapsed = elapsed - TDFX_CharDelay[instIdx][p];
					new Float:prog = float(pElapsed) / 750.0;
					if (prog > 1.0) prog = 1.0;

					if (prog >= 1.0 && !TDFX_CharState[instIdx][p])
					{
						TDFX_CharState[instIdx][p] = true;
						if (!isGlobal) PlayerPlaySound(playerid, 1084, 0.0, 0.0, 0.0);
					}

					new Float:curY = -25.0 + (targetY + 25.0) * TDFX_ApplyEasing(prog, TDFX_EASE_OUT_BOUNCE);
					#if defined PlayerTextDrawSetPos
					if (!isGlobal)
					{
						if (TDFX_CharParts[instIdx][p] != PlayerText:INVALID_TEXT_DRAW)
						{
							PlayerTextDrawSetPos(playerid, TDFX_CharParts[instIdx][p], TDFX_CharTargetX[instIdx][p], curY);
							PlayerTextDrawShow(playerid, TDFX_CharParts[instIdx][p]);
						}
					}
					#endif
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						#if defined TextDrawSetPos
						if (TDFX_GCharParts[instIdx][p] != Text:INVALID_TEXT_DRAW)
						{
							TextDrawSetPos(TDFX_GCharParts[instIdx][p], TDFX_CharTargetX[instIdx][p], curY);
							_TDFX_UpdateGlobalChildTD(TDFX_GCharParts[instIdx][p], tdId);
						}
						#endif
					}
					#endif
				}
			}

			if (elapsed >= TDFX_Duration[slot])
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
					if (instIdx >= 0 && instIdx < TDFX_MAX_CHAR_INSTANCES && TDFX_CharActive[instIdx])
					{
						new count = TDFX_CharCount[instIdx];
						for (new p = 0; p < count; p++)
						{
							TDFX_CharState[instIdx][p] = false;
						}
					}
				}
				else
				{
					if (instIdx >= 0 && instIdx < TDFX_MAX_CHAR_INSTANCES)
					{
						TDFX_FreeCharInstance(instIdx);
					}
					if (!isGlobal)
					{
						PlayerTextDrawSetString(playerid, PlayerText:tdId, TDFX_Text[slot]);
						_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						TextDrawSetString(Text:tdId, TDFX_Text[slot]);
						_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
						_TDFX_UpdateGlobalTD(Text:tdId);
					}
					#endif
					TDFX_Free(slot, false, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_WAVEMOTION:
		{
			new instIdx = TDFX_Step[slot];
			if (instIdx >= 0 && instIdx < TDFX_MAX_CHAR_INSTANCES && TDFX_CharActive[instIdx])
			{
				new count = TDFX_CharCount[instIdx];
				new Float:prog = float(elapsed) / float(TDFX_Duration[slot]);
				if (prog > 1.0) prog = 1.0;

				new Float:crestH = TDFX_FloatA[slot];
				new Float:crestW = TDFX_FloatB[slot];
				new direction = TDFX_Easing[slot];

				new Float:minC = -crestW;
				new Float:maxC = float(count - 1) + crestW;
				new Float:crestPos;
				if (direction == TDFX_DIR_LEFT_TO_RIGHT)
				{
					crestPos = minC + (maxC - minC) * prog;
				}
				else if (direction == TDFX_DIR_RIGHT_TO_LEFT)
				{
					crestPos = maxC - (maxC - minC) * prog;
				}
				else // TDFX_DIR_BOUNCE
				{
					new Float:bProg = (prog < 0.5) ? (prog * 2.0) : ((1.0 - prog) * 2.0);
					crestPos = minC + (maxC - minC) * bProg;
				}

				new Float:baseY = TDFX_CharTargetY[instIdx];

				for (new p = 0; p < count; p++)
				{
					new Float:dist = floatabs(float(p) - crestPos);
					new Float:offsetY = 0.0;
					if (dist < crestW)
					{
						new Float:angle = (dist / crestW) * 90.0;
						new Float:cVal = floatcos(angle, degrees);
						offsetY = -(crestH * cVal * cVal);
					}

					new Float:curY = baseY + offsetY;

					#if defined PlayerTextDrawSetPos
					if (!isGlobal)
					{
						if (TDFX_CharParts[instIdx][p] != PlayerText:INVALID_TEXT_DRAW)
						{
							PlayerTextDrawSetPos(playerid, TDFX_CharParts[instIdx][p], TDFX_CharTargetX[instIdx][p], curY);
							PlayerTextDrawShow(playerid, TDFX_CharParts[instIdx][p]);
						}
					}
					#endif
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						#if defined TextDrawSetPos
						if (TDFX_GCharParts[instIdx][p] != Text:INVALID_TEXT_DRAW)
						{
							TextDrawSetPos(TDFX_GCharParts[instIdx][p], TDFX_CharTargetX[instIdx][p], curY);
							_TDFX_UpdateGlobalChildTD(TDFX_GCharParts[instIdx][p], tdId);
						}
						#endif
					}
					#endif
				}
			}

			if (elapsed >= TDFX_Duration[slot])
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
				}
				else
				{
					if (instIdx >= 0 && instIdx < TDFX_MAX_CHAR_INSTANCES)
					{
						TDFX_FreeCharInstance(instIdx);
					}
					if (!isGlobal)
					{
						PlayerTextDrawSetString(playerid, PlayerText:tdId, TDFX_Text[slot]);
						_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						TextDrawSetString(Text:tdId, TDFX_Text[slot]);
						_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
						_TDFX_UpdateGlobalTD(Text:tdId);
					}
					#endif
					TDFX_Free(slot, false, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_HOPLETTER:
		{
			new instIdx = TDFX_Step[slot];
			if (instIdx >= 0 && instIdx < TDFX_MAX_CHAR_INSTANCES && TDFX_CharActive[instIdx])
			{
				new count = TDFX_CharCount[instIdx];
				new Float:baseY = TDFX_CharTargetY[instIdx];
				new Float:hopH = TDFX_FloatA[slot];
				new hopMs = TDFX_Count[slot];
				if (hopMs <= 0) hopMs = 350;
				new direction = TDFX_Easing[slot];
				new stag = floatround(TDFX_FloatB[slot]);
				if (stag <= 0) stag = 90;

				for (new p = 0; p < count; p++)
				{
					new Float:offsetY = 0.0;
					new hopElapsed = -1;

					if (direction == TDFX_DIR_BOUNCE)
					{
						new fwdStart = p * stag;
						new bwdStart = (count - 1) * stag + (count - 1 - p) * stag;
						if (elapsed >= fwdStart && elapsed < (fwdStart + hopMs))
						{
							hopElapsed = elapsed - fwdStart;
						}
						else if (elapsed >= bwdStart && elapsed < (bwdStart + hopMs))
						{
							hopElapsed = elapsed - bwdStart;
						}
					}
					else
					{
						new startTime = TDFX_CharDelay[instIdx][p];
						if (elapsed >= startTime && elapsed < (startTime + hopMs))
						{
							hopElapsed = elapsed - startTime;
						}
					}

					if (hopElapsed >= 0)
					{
						new Float:u = float(hopElapsed) / float(hopMs);
						if (u <= 0.80)
						{
							new Float:u1 = u / 0.80;
							offsetY = -(hopH * 4.0 * u1 * (1.0 - u1));
						}
						else
						{
							new Float:u2 = (u - 0.80) / 0.20;
							offsetY = -(hopH * 0.20 * 4.0 * u2 * (1.0 - u2));
						}
					}

					new Float:curY = baseY + offsetY;

					#if defined PlayerTextDrawSetPos
					if (!isGlobal)
					{
						if (TDFX_CharParts[instIdx][p] != PlayerText:INVALID_TEXT_DRAW)
						{
							PlayerTextDrawSetPos(playerid, TDFX_CharParts[instIdx][p], TDFX_CharTargetX[instIdx][p], curY);
							PlayerTextDrawShow(playerid, TDFX_CharParts[instIdx][p]);
						}
					}
					#endif
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						#if defined TextDrawSetPos
						if (TDFX_GCharParts[instIdx][p] != Text:INVALID_TEXT_DRAW)
						{
							TextDrawSetPos(TDFX_GCharParts[instIdx][p], TDFX_CharTargetX[instIdx][p], curY);
							_TDFX_UpdateGlobalChildTD(TDFX_GCharParts[instIdx][p], tdId);
						}
						#endif
					}
					#endif
				}
			}

			if (elapsed >= TDFX_Duration[slot])
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
				}
				else
				{
					if (instIdx >= 0 && instIdx < TDFX_MAX_CHAR_INSTANCES)
					{
						TDFX_FreeCharInstance(instIdx);
					}
					if (!isGlobal)
					{
						PlayerTextDrawSetString(playerid, PlayerText:tdId, TDFX_Text[slot]);
						_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						TextDrawSetString(Text:tdId, TDFX_Text[slot]);
						_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
						_TDFX_UpdateGlobalTD(Text:tdId);
					}
					#endif
					TDFX_Free(slot, false, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_SCANNER:
		{
			new speedMs = TDFX_Step[slot];
			if (speedMs < 25) speedMs = 25;
			new totalVis = TDFX_CountVisibleGlyphs(TDFX_Text[slot]);
			if (totalVis > 0)
			{
				new bounceSteps = (totalVis - 1) * 2;
				if (bounceSteps <= 0) bounceSteps = 1;
				new cycle = elapsed / speedMs;
				new bPos = cycle % bounceSteps;
				new laserIdx = (bPos >= totalVis) ? (bounceSteps - bPos) : bPos;

				if (laserIdx != TDFX_Easing[slot])
				{
					TDFX_Easing[slot] = laserIdx;
					new outStr[TDFX_MAX_TEXT];
					new outPos = 0;
					new curTag[16];
					curTag[0] = '~'; curTag[1] = 'w'; curTag[2] = '~'; curTag[3] = '\0';
					new lastTag[16];
					lastTag[0] = '\0';
					new i = 0, visIdx = 0;

					while (TDFX_Text[slot][i] && outPos < (sizeof(outStr) - 20))
					{
						if (TDFX_Text[slot][i] == '~')
						{
							new nextTag = TDFX_SkipTag(TDFX_Text[slot], i);
							strmid(curTag, TDFX_Text[slot], i, nextTag, sizeof curTag);
							i = nextTag;
							continue;
						}

						new dist = visIdx - laserIdx;
						if (dist < 0) dist = -dist;

						new neededTag[16];
						if (dist == 0) strmid(neededTag, TDFX_Prefix[slot], 0, strlen(TDFX_Prefix[slot]), sizeof neededTag);
						else if (dist == 1) strmid(neededTag, TDFX_Suffix[slot], 0, strlen(TDFX_Suffix[slot]), sizeof neededTag);
						else strmid(neededTag, curTag, 0, strlen(curTag), sizeof neededTag);

						if (strcmp(neededTag, lastTag) != 0)
						{
							for (new k = 0; neededTag[k] && outPos < (sizeof(outStr) - 2); k++)
								outStr[outPos++] = neededTag[k];
							strmid(lastTag, neededTag, 0, strlen(neededTag), sizeof lastTag);
						}

						outStr[outPos++] = TDFX_Text[slot][i];
						visIdx++;
						i++;
					}
					outStr[outPos] = '\0';

					if (!isGlobal)
					{
						PlayerTextDrawSetString(playerid, PlayerText:tdId, outStr);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
						if (laserIdx == 0 || laserIdx == (totalVis - 1))
						{
							PlayerPlaySound(playerid, 1058, 0.0, 0.0, 0.0);
						}
					}
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						TextDrawSetString(Text:tdId, outStr);
						_TDFX_UpdateGlobalTD(Text:tdId);
					}
					#endif
					}
				}
	
				if (TDFX_Duration[slot] > 0 && elapsed >= TDFX_Duration[slot])
				{
					if (TDFX_Loop[slot])
					{
						TDFX_Start[slot] = GetTickCount();
					}
					else
					{
						if (TDFX_AutoHide[slot])
						{
							if (!isGlobal) PlayerTextDrawHide(playerid, PlayerText:tdId);
							#if TDFX_MAX_GLOBAL_TD > 0
							else TextDrawHideForAll(Text:tdId);
							#endif
						}
						TDFX_Free(slot, true, true);
						return 1;
					}
				}
			}
	
			case TDFX_TYPE_ELECTRIC:
			{
				new Float:decay = 1.0 - (float(elapsed) / float(TDFX_Duration[slot]));
				if (decay < 0.0) decay = 0.0;
	
				new Float:jitX = TDFX_FloatA[slot] + ((float(random(21) - 10) / 10.0) * 2.2 * decay);
				new Float:jitY = TDFX_FloatB[slot] + ((float(random(17) - 8) / 10.0) * 1.6 * decay);
	
				#if defined PlayerTextDrawSetPos
				if (!isGlobal)
				{
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, jitX, jitY);
					if (random(4) == 0 && decay > 0.3)
					{
						PlayerPlaySound(playerid, 1130, 0.0, 0.0, 0.0);
					}
				}
				#endif
				#if TDFX_MAX_GLOBAL_TD > 0
				else
				{
					#if defined TextDrawSetPos
					TextDrawSetPos(Text:tdId, jitX, jitY);
					#endif
				}
				#endif
	
				new outStr[TDFX_MAX_TEXT];
				new spark = random(4);
				if (decay > 0.15 && spark == 0)
				{
					format(outStr, sizeof outStr, "~b~>> %s ~b~<<", TDFX_Text[slot]);
				}
				else if (decay > 0.15 && spark == 1)
				{
					format(outStr, sizeof outStr, "~y~** %s ~y~**", TDFX_Text[slot]);
				}
				else
				{
					format(outStr, sizeof outStr, "%s", TDFX_Text[slot]);
				}
	
				if (!isGlobal)
				{
					PlayerTextDrawSetString(playerid, PlayerText:tdId, outStr);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
				#if TDFX_MAX_GLOBAL_TD > 0
				else
				{
					TextDrawSetString(Text:tdId, outStr);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
				#endif
	
				if (elapsed >= TDFX_Duration[slot])
				{
					if (TDFX_Loop[slot])
					{
						TDFX_Start[slot] = GetTickCount();
					}
					else
					{
						#if defined PlayerTextDrawSetPos
						if (!isGlobal)
						{
							PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
							PlayerTextDrawSetString(playerid, PlayerText:tdId, TDFX_Text[slot]);
							_TDFX_PTDColour(playerid, PlayerText:tdId, TDFX_Base[slot]);
							PlayerTextDrawShow(playerid, PlayerText:tdId);
						}
						#endif
						#if TDFX_MAX_GLOBAL_TD > 0
						else
						{
						#if defined TextDrawSetPos
							TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
						#endif
							TextDrawSetString(Text:tdId, TDFX_Text[slot]);
							_TDFX_TDColour(Text:tdId, TDFX_Base[slot]);
							_TDFX_UpdateGlobalTD(Text:tdId);
						}
						#endif
						TDFX_Free(slot, false, true);
						return 1;
				}
			}
		}

		case TDFX_TYPE_SPLITFLAP:
		{
			new totalVis = TDFX_CountVisibleGlyphs(TDFX_Text[slot]);
			new lockIntervalMs = floatround(TDFX_FloatB[slot]);
			if (lockIntervalMs < 50) lockIntervalMs = 180;
			new outStr[TDFX_MAX_TEXT];
			new outPos = 0;
			new flapCount = sizeof(TDFX_FlapChars) - 1;
			new i = 0, visIdx = 0;

			while (TDFX_Text[slot][i] && outPos < (sizeof(outStr) - 4))
			{
				if (TDFX_Text[slot][i] == '~')
				{
					new nextTag = TDFX_SkipTag(TDFX_Text[slot], i);
					for (new t = i; t < nextTag && outPos < (sizeof(outStr) - 2); t++)
						outStr[outPos++] = TDFX_Text[slot][t];
					i = nextTag;
					continue;
				}

				new lockTime = (visIdx + 1) * lockIntervalMs;
				if (elapsed >= lockTime)
				{
					outStr[outPos++] = TDFX_Text[slot][i];
				}
				else
				{
					if (TDFX_Text[slot][i] == ' ')
					{
						outStr[outPos++] = ' ';
					}
					else
					{
						new r = random(flapCount);
						outStr[outPos++] = TDFX_FlapChars[r];
					}
				}
				visIdx++;
				i++;
			}
			outStr[outPos] = '\0';

			new currentLocked = elapsed / lockIntervalMs;
			if (currentLocked != TDFX_Easing[slot])
			{
				TDFX_Easing[slot] = currentLocked;
				if (!isGlobal && currentLocked <= totalVis)
				{
					PlayerPlaySound(playerid, 1083, 0.0, 0.0, 0.0);
				}
			}

			if (!isGlobal)
			{
				PlayerTextDrawSetString(playerid, PlayerText:tdId, outStr);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			#if TDFX_MAX_GLOBAL_TD > 0
			else
			{
				TextDrawSetString(Text:tdId, outStr);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			#endif

			if (elapsed >= (totalVis * lockIntervalMs + 600))
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
					TDFX_Easing[slot] = -1;
				}
				else
				{
					if (!isGlobal)
					{
						PlayerTextDrawSetString(playerid, PlayerText:tdId, TDFX_Text[slot]);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						TextDrawSetString(Text:tdId, TDFX_Text[slot]);
						_TDFX_UpdateGlobalTD(Text:tdId);
					}
					#endif
					TDFX_Free(slot, false, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_HOLOGRAM:
		{
			new alpha = floatround(175.0 + 80.0 * floatsin(float(elapsed) * 0.22, degrees));
			if (alpha < 40) alpha = 40;
			if (alpha > 255) alpha = 255;
			new curCol = (0x00FFFFFF & 0xFFFFFF00) | (alpha & 0xFF);

			new Float:jitY = TDFX_FloatB[slot];
			if (random(6) == 0) jitY += (float(random(3) - 1) * 0.7);

			#if defined PlayerTextDrawSetPos
			if (!isGlobal)
			{
				PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], jitY);
				_TDFX_PTDColour(playerid, PlayerText:tdId, curCol);
				PlayerTextDrawShow(playerid, PlayerText:tdId);
			}
			#endif
			#if TDFX_MAX_GLOBAL_TD > 0
			else
			{
				#if defined TextDrawSetPos
				TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], jitY);
				#endif
				_TDFX_TDColour(Text:tdId, curCol);
				_TDFX_UpdateGlobalTD(Text:tdId);
			}
			#endif

			if (TDFX_Duration[slot] > 0 && elapsed >= TDFX_Duration[slot])
			{
				if (TDFX_Loop[slot])
				{
					TDFX_Start[slot] = GetTickCount();
				}
				else
				{
					if (TDFX_AutoHide[slot])
					{
						if (!isGlobal) PlayerTextDrawHide(playerid, PlayerText:tdId);
						#if TDFX_MAX_GLOBAL_TD > 0
						else TextDrawHideForAll(Text:tdId);
						#endif
					}
					TDFX_Free(slot, true, true);
					return 1;
				}
			}
		}

		case TDFX_TYPE_SHOCKWAVE:
		{
			new fwIdx = TDFX_Step[slot];
			if (elapsed < 500)
			{
				// Phase 1: Plummet down with rapid acceleration
				new Float:prog = float(elapsed) / 500.0;
				new Float:ease = TDFX_ApplyEasing(prog, TDFX_EASE_IN_QUAD);
				new Float:scaleX = TDFX_BoundMinX[slot] * (2.4 - 1.4 * ease);
				new Float:scaleY = TDFX_BoundMinY[slot] * (2.4 - 1.4 * ease);
				new Float:curY = (TDFX_FloatB[slot] - 90.0) + (90.0 * ease);

				#if defined PlayerTextDrawSetPos
				if (!isGlobal)
				{
					if (TDFX_FadeBox[slot]) PlayerTextDrawUseBox(playerid, PlayerText:tdId, false);
					PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], curY);
					PlayerTextDrawLetterSize(playerid, PlayerText:tdId, scaleX, scaleY);
					PlayerTextDrawShow(playerid, PlayerText:tdId);
				}
				#endif
				#if TDFX_MAX_GLOBAL_TD > 0
				else
				{
					#if defined TextDrawSetPos
					TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], curY);
					#endif
					if (TDFX_FadeBox[slot]) TextDrawUseBox(Text:tdId, false);
					TextDrawLetterSize(Text:tdId, scaleX, scaleY);
					_TDFX_UpdateGlobalTD(Text:tdId);
				}
				#endif
			}
			else
			{
				// Phase 2: Impact moment
				if (TDFX_Easing[slot] == 0)
				{
					TDFX_Easing[slot] = 1; // Impact occurred
					if (!isGlobal)
					{
						new Float:px = 0.0, Float:py = 0.0, Float:pz = 0.0;
						GetPlayerPos(playerid, px, py, pz);
						PlayerPlaySound(playerid, 1159, px, py, pz);
						PlayerPlaySound(playerid, 1159, 0.0, 0.0, 0.0);
						if (TDFX_FadeBox[slot]) PlayerTextDrawUseBox(playerid, PlayerText:tdId, true);
						PlayerTextDrawLetterSize(playerid, PlayerText:tdId, TDFX_BoundMinX[slot], TDFX_BoundMinY[slot]);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						for (new i = 0; i < MAX_PLAYERS; i++)
						{
							if (!IsPlayerConnected(i)) continue;
							new Float:px = 0.0, Float:py = 0.0, Float:pz = 0.0;
							GetPlayerPos(i, px, py, pz);
							PlayerPlaySound(i, 1159, px, py, pz);
							PlayerPlaySound(i, 1159, 0.0, 0.0, 0.0);
						}
						if (TDFX_FadeBox[slot]) TextDrawUseBox(Text:tdId, true);
						TextDrawLetterSize(Text:tdId, TDFX_BoundMinX[slot], TDFX_BoundMinY[slot]);
						_TDFX_UpdateGlobalTD(Text:tdId);
					}
					#endif

					// Spawn circular shockwave sparks
					if (fwIdx >= 0 && fwIdx < TDFX_MAX_FW_INSTANCES)
					{
						for (new p = 0; p < TDFX_FW_PARTICLES; p++)
						{
							new Float:angle = float(p) * (360.0 / float(TDFX_FW_PARTICLES));
							new Float:spd = 2.2;
							TDFX_FwPartX[fwIdx][p] = TDFX_FloatA[slot];
							TDFX_FwPartY[fwIdx][p] = TDFX_FloatB[slot];
							TDFX_FwPartVx[fwIdx][p] = floatsin(angle, degrees) * spd;
							TDFX_FwPartVy[fwIdx][p] = -floatcos(angle, degrees) * spd;
							TDFX_FwPartCol[fwIdx][p] = 0xF1C40FFF;

							if (!isGlobal)
							{
								new PlayerText:ptd = CreatePlayerTextDraw(playerid, TDFX_FloatA[slot], TDFX_FloatB[slot], "*");
								if (_:ptd != 0xFFFF && _:ptd >= 0)
								{
									#if defined _INC_open_mp
									PlayerTextDrawAlignment(playerid, ptd, TEXT_DRAW_ALIGN_CENTER);
									PlayerTextDrawFont(playerid, ptd, TEXT_DRAW_FONT_2);
									#else
									PlayerTextDrawAlignment(playerid, ptd, 2);
									PlayerTextDrawFont(playerid, ptd, 2);
									#endif
									PlayerTextDrawLetterSize(playerid, ptd, 0.35, 1.2);
									_TDFX_PTDColour(playerid, ptd, 0xF1C40FFF);
									PlayerTextDrawShow(playerid, ptd);
									TDFX_FwParts[fwIdx][p] = ptd;
								}
								else
								{
									TDFX_FwParts[fwIdx][p] = PlayerText:INVALID_TEXT_DRAW;
								}
							}
							#if TDFX_MAX_GLOBAL_TD > 0
							else
							{
								new Text:gtd = TextDrawCreate(TDFX_FloatA[slot], TDFX_FloatB[slot], "*");
								if (_:gtd != 0xFFFF && _:gtd >= 0)
								{
									#if defined _INC_open_mp
									TextDrawAlignment(gtd, TEXT_DRAW_ALIGN_CENTER);
									TextDrawFont(gtd, TEXT_DRAW_FONT_2);
									#else
									TextDrawAlignment(gtd, 2);
									TextDrawFont(gtd, 2);
									#endif
									TextDrawLetterSize(gtd, 0.35, 1.2);
									_TDFX_TDColour(gtd, 0xF1C40FFF);
									_TDFX_UpdateGlobalChildTD(gtd, tdId);
									TDFX_GFwParts[fwIdx][p] = gtd;
								}
								else
								{
									TDFX_GFwParts[fwIdx][p] = Text:INVALID_TEXT_DRAW;
								}
							}
							#endif
						}
					}
				}

				// Trauma shake after impact for 300ms
				new impactElapsed = elapsed - 500;
				if (impactElapsed < 300)
				{
					new Float:decay = 1.0 - (float(impactElapsed) / 300.0);
					new Float:sX = TDFX_FloatA[slot] + ((float(random(15) - 7) / 7.0) * 3.5 * decay);
					new Float:sY = TDFX_FloatB[slot] + ((float(random(15) - 7) / 7.0) * 3.5 * decay);
					#if defined PlayerTextDrawSetPos
					if (!isGlobal)
					{
						PlayerTextDrawSetPos(playerid, PlayerText:tdId, sX, sY);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
					#endif
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						#if defined TextDrawSetPos
						TextDrawSetPos(Text:tdId, sX, sY);
						_TDFX_UpdateGlobalTD(Text:tdId);
						#endif
					}
					#endif
				}

				// Expanding shockwave particles
				if (fwIdx >= 0 && fwIdx < TDFX_MAX_FW_INSTANCES)
				{
					new Float:partProg = float(impactElapsed) / float(TDFX_Duration[slot] - 500);
					if (partProg > 1.0) partProg = 1.0;
					new alpha = floatround(255.0 * (1.0 - partProg));
					new pCol = (0xF1C40F00) | (alpha & 0xFF);

					for (new p = 0; p < TDFX_FW_PARTICLES; p++)
					{
						TDFX_FwPartX[fwIdx][p] += TDFX_FwPartVx[fwIdx][p];
						TDFX_FwPartY[fwIdx][p] += TDFX_FwPartVy[fwIdx][p];

						#if defined PlayerTextDrawSetPos
						if (!isGlobal)
						{
							if (TDFX_FwParts[fwIdx][p] != PlayerText:INVALID_TEXT_DRAW)
							{
								PlayerTextDrawSetPos(playerid, TDFX_FwParts[fwIdx][p], TDFX_FwPartX[fwIdx][p], TDFX_FwPartY[fwIdx][p]);
								_TDFX_PTDColour(playerid, TDFX_FwParts[fwIdx][p], pCol);
								PlayerTextDrawShow(playerid, TDFX_FwParts[fwIdx][p]);
							}
						}
						#endif
						#if TDFX_MAX_GLOBAL_TD > 0
						else
						{
							#if defined TextDrawSetPos
							if (TDFX_GFwParts[fwIdx][p] != Text:INVALID_TEXT_DRAW)
							{
								TextDrawSetPos(TDFX_GFwParts[fwIdx][p], TDFX_FwPartX[fwIdx][p], TDFX_FwPartY[fwIdx][p]);
								_TDFX_TDColour(TDFX_GFwParts[fwIdx][p], pCol);
								_TDFX_UpdateGlobalChildTD(TDFX_GFwParts[fwIdx][p], tdId);
							}
							#endif
						}
						#endif
					}
				}
			}

			if (elapsed >= TDFX_Duration[slot])
			{
				if (TDFX_Loop[slot])
				{
					if (fwIdx >= 0 && fwIdx < TDFX_MAX_FW_INSTANCES)
					{
						TDFX_FreeFwInstance(fwIdx);
					}
					TDFX_Step[slot] = TDFX_AllocFwInstance();
					TDFX_Easing[slot] = 0;
					TDFX_Start[slot] = GetTickCount();
				}
				else
				{
					if (fwIdx >= 0 && fwIdx < TDFX_MAX_FW_INSTANCES)
					{
						TDFX_FreeFwInstance(fwIdx);
					}
					#if defined PlayerTextDrawSetPos
					if (!isGlobal)
					{
						PlayerTextDrawSetPos(playerid, PlayerText:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
						PlayerTextDrawLetterSize(playerid, PlayerText:tdId, TDFX_BoundMinX[slot], TDFX_BoundMinY[slot]);
						PlayerTextDrawShow(playerid, PlayerText:tdId);
					}
					#endif
					#if TDFX_MAX_GLOBAL_TD > 0
					else
					{
						#if defined TextDrawSetPos
						TextDrawSetPos(Text:tdId, TDFX_FloatA[slot], TDFX_FloatB[slot]);
						#endif
						TextDrawLetterSize(Text:tdId, TDFX_BoundMinX[slot], TDFX_BoundMinY[slot]);
						_TDFX_UpdateGlobalTD(Text:tdId);
					}
					#endif
					TDFX_Free(slot, false, true);
					return 1;
				}
			}
		}
	}
	return 1;
}

// -----------------------------------------------------------------------------
// Public API - Player TextDraws
// -----------------------------------------------------------------------------

stock BlinkPlayerTextDraw(playerid, PlayerText:textid, interval = 500, duration = 0, bool:perChar = false, colour = 0, const text[] = "", baseColour = 0, bool:loop = false)
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (interval < TDFX_MIN_INTERVAL) interval = TDFX_MIN_INTERVAL;
	if (duration < 0) duration = 0;
	new bool:known = TDFX_ValidPlayer(playerid, textid), font = 1, bool:box = false;
	if (known)
	{
		font = TDFX_Info[playerid][_:textid] & 7;
		box = (TDFX_Info[playerid][_:textid] & 8) != 0;
	}
	#if defined PlayerTextDrawGetFont
		font = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	#if defined PlayerTextDrawIsBox
		box = PlayerTextDrawIsBox(playerid, textid);
	#endif
	new bool:preview = (font == 5);
	if (font == 4 || font == 5) perChar = false;
	new boxBase = 0;
	if (colour)
	{
		if (preview)
		{
			#if defined _TDFX_PTDGetBackColour
				if (!baseColour) baseColour = _TDFX_PTDGetBackColour(playerid, textid);
			#endif
			if (!baseColour && known) baseColour = TDFX_RemBack[playerid][_:textid];
		}
		else
		{
			#if defined _TDFX_PTDGetColour
				if (!baseColour) baseColour = _TDFX_PTDGetColour(playerid, textid);
			#endif
			if (!baseColour && known) baseColour = TDFX_RemText[playerid][_:textid];
			if (box)
			{
				#if defined _TDFX_PTDGetBoxColour
					boxBase = _TDFX_PTDGetBoxColour(playerid, textid);
				#endif
				if (!boxBase && known) boxBase = TDFX_RemBox[playerid][_:textid];
			}
		}
		if (!baseColour) return 0;
	}
	TDFX_Text[slot][0] = 0;
	if (perChar)
	{
		if (text[0]) strmid(TDFX_Text[slot], text, 0, strlen(text), TDFX_MAX_TEXT);
		#if defined PlayerTextDrawGetString
		else PlayerTextDrawGetString(playerid, textid, TDFX_Text[slot], TDFX_MAX_TEXT);
		#endif
		TDFX_Count[slot] = TDFX_CountChars(TDFX_Text[slot]);
		if (TDFX_Count[slot] == 0) perChar = false;
	}
	if (perChar && duration > 0 && TDFX_Count[slot] * interval > duration)
	{
		interval = duration / TDFX_Count[slot];
		if (interval < TDFX_MIN_INTERVAL) interval = TDFX_MIN_INTERVAL;
	}
	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_BLINK;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_PerChar[slot] = perChar;
	TDFX_Preview[slot] = preview;
	TDFX_Duration[slot] = duration;
	TDFX_Colour[slot] = colour;
	TDFX_Base[slot] = baseColour;
	TDFX_BoxBase[slot] = boxBase;
	TDFX_ExtraId[slot] = 0;
	TDFX_Callback[slot][0] = 0;
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	if (perChar)
	{
		TDFX_Step[slot] = 0;
		new part[2]; part[0] = ' '; part[1] = 0;
		PlayerTextDrawSetString(playerid, textid, part);
	}
	else TDFX_Step[slot] = 1;

	if (colour)
	{
		if (preview) _TDFX_PTDBackColour(playerid, textid, colour);
		else
		{
			_TDFX_PTDColour(playerid, textid, colour);
			if (boxBase) _TDFX_PTDBoxColour(playerid, textid, colour);
		}
	}
	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", interval, true, "i", slot);
	return 1;
}

stock TypewriterPlayerTextDraw(playerid, PlayerText:textid, const text[], interval = 50, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!text[0]) return 0;
	new ret = BlinkPlayerTextDraw(playerid, textid, interval, duration, true, 0, text);
	if (ret)
	{
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1)
		{
			if (!TDFX_PerChar[slot])
			{
				TDFX_Free(slot, false);
				return 0;
			}
			TDFX_Type[slot] = TDFX_TYPE_TYPEWRITER;
			TDFX_Loop[slot] = loop;
			TDFX_ExtraId[slot] = extra_id;
			if (callback[0]) strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		}
	}
	return ret;
}

stock FadeInPlayerTextDraw(playerid, PlayerText:textid, duration = 1000, bool:fadeBox = true, targetAlpha = 255, bool:loop = false, extra_id = 0, const callback[] = "", bool:autoHide = false)
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
	new bool:known = TDFX_ValidPlayer(playerid, textid), baseCol = 0, boxCol = 0, font = 1;
	if (known)
	{
		font = TDFX_Info[playerid][_:textid] & 7;
		baseCol = TDFX_RemText[playerid][_:textid];
		boxCol = TDFX_RemBox[playerid][_:textid];
	}
	#if defined PlayerTextDrawGetFont
		font = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	new bool:preview = (font == 5);
	if (preview)
	{
		#if defined _TDFX_PTDGetBackColour
			baseCol = _TDFX_PTDGetBackColour(playerid, textid);
		#endif
		if (!baseCol && known) baseCol = TDFX_RemBack[playerid][_:textid];
	}
	else
	{
		#if defined _TDFX_PTDGetColour
			baseCol = _TDFX_PTDGetColour(playerid, textid);
		#endif
		#if defined _TDFX_PTDGetBoxColour
			boxCol = _TDFX_PTDGetBoxColour(playerid, textid);
		#endif
	}
	if (!baseCol) baseCol = 0xFFFFFFFF;
	if (!boxCol) boxCol = 0x000000AA;

	new startCol = (baseCol & 0xFFFFFF00);
	new endCol = (baseCol & 0xFFFFFF00) | (targetAlpha & 0xFF);
	new startBox = (boxCol & 0xFFFFFF00);
	new endBox = (boxCol & 0xFFFFFF00) | (targetAlpha & 0xFF);

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_FADE;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Preview[slot] = preview;
	TDFX_Duration[slot] = duration;
	TDFX_Base[slot] = endCol;
	TDFX_BoxBase[slot] = endBox;
	TDFX_ColFrom[slot] = startCol;
	TDFX_ColTo[slot] = endCol;
	TDFX_BoxColFrom[slot] = startBox;
	TDFX_BoxColTo[slot] = endBox;
	TDFX_FadeBox[slot] = fadeBox;
	TDFX_Easing[slot] = TDFX_EASE_LINEAR;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = autoHide;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	if (preview) _TDFX_PTDBackColour(playerid, textid, startCol);
	else
	{
		_TDFX_PTDColour(playerid, textid, startCol);
		if (fadeBox) _TDFX_PTDBoxColour(playerid, textid, startBox);
	}
	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock FadeOutPlayerTextDraw(playerid, PlayerText:textid, duration = 1000, bool:fadeBox = true, bool:loop = false, extra_id = 0, const callback[] = "", bool:autoHide = true)
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
	new bool:known = TDFX_ValidPlayer(playerid, textid), baseCol = 0, boxCol = 0, font = 1;
	if (known)
	{
		font = TDFX_Info[playerid][_:textid] & 7;
		baseCol = TDFX_RemText[playerid][_:textid];
		boxCol = TDFX_RemBox[playerid][_:textid];
	}
	#if defined PlayerTextDrawGetFont
		font = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	new bool:preview = (font == 5);
	if (preview)
	{
		#if defined _TDFX_PTDGetBackColour
			baseCol = _TDFX_PTDGetBackColour(playerid, textid);
		#endif
		if (!baseCol && known) baseCol = TDFX_RemBack[playerid][_:textid];
	}
	else
	{
		#if defined _TDFX_PTDGetColour
			baseCol = _TDFX_PTDGetColour(playerid, textid);
		#endif
		#if defined _TDFX_PTDGetBoxColour
			boxCol = _TDFX_PTDGetBoxColour(playerid, textid);
		#endif
	}
	if (!baseCol) baseCol = 0xFFFFFFFF;
	if (!boxCol) boxCol = 0x000000AA;

	new startCol = baseCol;
	new endCol = (baseCol & 0xFFFFFF00);
	new startBox = boxCol;
	new endBox = (boxCol & 0xFFFFFF00);

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_FADE;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Preview[slot] = preview;
	TDFX_Duration[slot] = duration;
	TDFX_Base[slot] = baseCol;
	TDFX_BoxBase[slot] = boxCol;
	TDFX_ColFrom[slot] = startCol;
	TDFX_ColTo[slot] = endCol;
	TDFX_BoxColFrom[slot] = startBox;
	TDFX_BoxColTo[slot] = endBox;
	TDFX_FadeBox[slot] = fadeBox;
	TDFX_Easing[slot] = TDFX_EASE_LINEAR;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = autoHide;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock FadeColorPlayerTextDraw(playerid, PlayerText:textid, fromColor, toColor, duration = 1000, bool:fadeBox = false, fromBox = 0, toBox = 0, easing = TDFX_EASE_LINEAR, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
	new bool:preview = false;
	#if defined PlayerTextDrawGetFont
		preview = (_:PlayerTextDrawGetFont(playerid, textid) == 5);
	#endif

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_FADE;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Preview[slot] = preview;
	TDFX_Duration[slot] = duration;
	TDFX_Base[slot] = toColor;
	TDFX_BoxBase[slot] = toBox;
	TDFX_ColFrom[slot] = fromColor;
	TDFX_ColTo[slot] = toColor;
	TDFX_BoxColFrom[slot] = fromBox;
	TDFX_BoxColTo[slot] = toBox;
	TDFX_FadeBox[slot] = fadeBox;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock ScalePlayerTextDraw(playerid, PlayerText:textid, Float:startSizeX, Float:startSizeY, Float:targetSizeX, Float:targetSizeY, duration = 1000, easing = TDFX_EASE_LINEAR, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_SCALE;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_FloatA[slot] = startSizeX;
	TDFX_FloatB[slot] = startSizeY;
	TDFX_FloatC[slot] = targetSizeX;
	TDFX_FloatD[slot] = targetSizeY;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawLetterSize(playerid, textid, startSizeX, startSizeY);
	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock PulsePlayerTextDraw(playerid, PlayerText:textid, Float:amplitude = 0.25, interval = 300, cycles = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (interval < TDFX_MIN_INTERVAL) interval = TDFX_MIN_INTERVAL;
	new Float:baseX = 0.48, Float:baseY = 1.12;
	if (TDFX_ValidPlayer(playerid, textid))
	{
		if (TDFX_RemLetX[playerid][_:textid] > 0.0) baseX = TDFX_RemLetX[playerid][_:textid];
		if (TDFX_RemLetY[playerid][_:textid] > 0.0) baseY = TDFX_RemLetY[playerid][_:textid];
	}
	#if defined PlayerTextDrawGetLetterSize
		PlayerTextDrawGetLetterSize(playerid, textid, baseX, baseY);
	#endif

	new duration = (cycles > 0) ? (cycles * interval) : 0;

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_PULSE;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_FloatA[slot] = baseX;
	TDFX_FloatB[slot] = baseY;
	TDFX_FloatC[slot] = amplitude;
	TDFX_FloatD[slot] = float(cycles);
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (cycles == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock SlidePlayerTextDraw(playerid, PlayerText:textid, Float:targetX, Float:targetY, duration = 1000, easing = TDFX_EASE_OUT_QUAD, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, targetX, targetY, duration, easing, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
		new Float:startX = 0.0, Float:startY = 0.0;
		#if defined PlayerTextDrawGetPos
			PlayerTextDrawGetPos(playerid, textid, startX, startY);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_SLIDE;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = startX;
		TDFX_FloatB[slot] = startY;
		TDFX_FloatC[slot] = targetX;
		TDFX_FloatD[slot] = targetY;
		TDFX_Easing[slot] = easing;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock CountPlayerTextDrawNumber(playerid, PlayerText:textid, startValue, targetValue, duration = 1000, const prefix[] = "", const suffix[] = "", bool:thousandsSep = false, easing = TDFX_EASE_LINEAR, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new pFont = 0;
	if (TDFX_ValidPlayer(playerid, textid)) pFont = TDFX_Info[playerid][_:textid] & 7;
	#if defined PlayerTextDrawGetFont
		pFont = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	if (pFont == 4 || pFont == 5) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_COUNT;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_Step[slot] = startValue;
	TDFX_Count[slot] = targetValue;
	strmid(TDFX_Prefix[slot], prefix, 0, strlen(prefix), sizeof TDFX_Prefix[]);
	strmid(TDFX_Suffix[slot], suffix, 0, strlen(suffix), sizeof TDFX_Suffix[]);
	TDFX_ThousandSep[slot] = thousandsSep;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	new initial[TDFX_MAX_TEXT];
	TDFX_FormatNumber(initial, sizeof initial, startValue, prefix, suffix, thousandsSep);
	PlayerTextDrawSetString(playerid, textid, initial);
	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock ScramblePlayerTextDraw(playerid, PlayerText:textid, const finalText[], duration = 2000, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new pFont = 0;
	if (TDFX_ValidPlayer(playerid, textid)) pFont = TDFX_Info[playerid][_:textid] & 7;
	#if defined PlayerTextDrawGetFont
		pFont = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	if (pFont == 4 || pFont == 5) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_SCRAMBLE;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	strmid(TDFX_Text[slot], finalText, 0, strlen(finalText), TDFX_MAX_TEXT);
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock BouncePlayerTextDraw(playerid, PlayerText:textid, Float:speedX, Float:speedY, Float:minX, Float:minY, Float:maxX, Float:maxY, bool:colorShift = false, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, speedX, speedY, minX, minY, maxX, maxY, colorShift, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < 0) duration = 0;
		new Float:curX = 0.0, Float:curY = 0.0;
		TDFX_GetPlayerPos(playerid, textid, curX, curY);

		new baseCol = 0xFFFFFFFF;
		if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemText[playerid][_:textid])
			baseCol = TDFX_RemText[playerid][_:textid];
		#if defined _TDFX_PTDGetColour
			baseCol = _TDFX_PTDGetColour(playerid, textid);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_BOUNCE;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		if (random(2) == 0) speedX = -speedX;
		if (random(2) == 0) speedY = -speedY;
		speedX *= (0.90 + float(random(21)) / 100.0);
		speedY *= (0.90 + float(random(21)) / 100.0);
		TDFX_FloatA[slot] = curX;
		TDFX_FloatB[slot] = curY;
		TDFX_FloatC[slot] = speedX;
		TDFX_FloatD[slot] = speedY;
		TDFX_BoundMinX[slot] = minX;
		TDFX_BoundMinY[slot] = minY;
		TDFX_BoundMaxX[slot] = maxX;
		TDFX_BoundMaxY[slot] = maxY;
		TDFX_ColorShift[slot] = colorShift;
		TDFX_Base[slot] = baseCol;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock BounceCirclePlayerTextDraw(playerid, PlayerText:textid, Float:speed = 2.8, Float:angle = 45.0, Float:centerX = 320.0, Float:centerY = 240.0, Float:radius = 120.0, bool:colorShift = false, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, speed, angle, centerX, centerY, radius, colorShift, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < 0) duration = 0;
		new Float:curX = 0.0, Float:curY = 0.0;
		TDFX_GetPlayerPos(playerid, textid, curX, curY);

		if (floatabs(curX - centerX) < 0.001 && floatabs(curY - centerY) < 0.001)
		{
			curX = centerX + radius * 0.40;
			curY = centerY - radius * 0.25;
			PlayerTextDrawSetPos(playerid, textid, curX, curY);
		}

		new baseCol = 0xFFFFFFFF;
		if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemText[playerid][_:textid])
			baseCol = TDFX_RemText[playerid][_:textid];
		#if defined _TDFX_PTDGetColour
			baseCol = _TDFX_PTDGetColour(playerid, textid);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_BOUNCE_CIRC;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = curX;
		TDFX_FloatB[slot] = curY;
		TDFX_FloatC[slot] = speed * floatcos(angle, degrees);
		TDFX_FloatD[slot] = speed * floatsin(angle, degrees);
		TDFX_BoundMinX[slot] = centerX;
		TDFX_BoundMinY[slot] = centerY;
		TDFX_BoundMaxX[slot] = radius;
		TDFX_BoundMaxY[slot] = 0.0;
		TDFX_ColorShift[slot] = colorShift;
		TDFX_Base[slot] = baseCol;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock OrbitPlayerTextDraw(playerid, PlayerText:textid, Float:centerX, Float:centerY, Float:radiusX, Float:radiusY, Float:angularSpeed = 60.0, Float:startAngle = 0.0, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, centerX, centerY, radiusX, radiusY, angularSpeed, startAngle, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < 0) duration = 0;

		new Float:origX = 0.0, Float:origY = 0.0;
		TDFX_GetPlayerPos(playerid, textid, origX, origY);

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_ORBIT;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = centerX;
		TDFX_FloatB[slot] = centerY;
		TDFX_FloatC[slot] = radiusX;
		TDFX_FloatD[slot] = radiusY;
		TDFX_BoundMinX[slot] = angularSpeed;
		TDFX_BoundMinY[slot] = startAngle;
		TDFX_BoundMaxX[slot] = origX;
		TDFX_BoundMaxY[slot] = origY;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock ShakePlayerTextDraw(playerid, PlayerText:textid, Float:intensity = 6.0, duration = 800, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, intensity, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

		new Float:baseX = 0.0, Float:baseY = 0.0;
		TDFX_GetPlayerPos(playerid, textid, baseX, baseY);

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_SHAKE;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = baseX;
		TDFX_FloatB[slot] = baseY;
		TDFX_FloatC[slot] = intensity;
		TDFX_FloatD[slot] = 0.0;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock NeonFlickerPlayerTextDraw(playerid, PlayerText:textid, duration = 3000, brokenRatio = 40, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
	if (brokenRatio < 0) brokenRatio = 0;
	if (brokenRatio > 100) brokenRatio = 100;

	new baseCol = 0xFFFFFFFF, boxCol = 0;
	if (TDFX_ValidPlayer(playerid, textid))
	{
		if (TDFX_RemText[playerid][_:textid]) baseCol = TDFX_RemText[playerid][_:textid];
		boxCol = TDFX_RemBox[playerid][_:textid];
	}
	#if defined _TDFX_PTDGetColour
		baseCol = _TDFX_PTDGetColour(playerid, textid);
	#endif
	#if defined _TDFX_PTDGetBoxColour
		boxCol = _TDFX_PTDGetBoxColour(playerid, textid);
	#endif

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_NEON;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_Step[slot] = brokenRatio;
	TDFX_Base[slot] = baseCol;
	TDFX_BoxBase[slot] = boxCol;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock WaveDriftPlayerTextDraw(playerid, PlayerText:textid, Float:amplitudeX, Float:amplitudeY, speedMs = 1500, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, amplitudeX, amplitudeY, speedMs, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < 0) duration = 0;
		if (speedMs < 100) speedMs = 1500;

		new Float:baseX = 0.0, Float:baseY = 0.0;
		TDFX_GetPlayerPos(playerid, textid, baseX, baseY);

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_WAVE;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = baseX;
		TDFX_FloatB[slot] = baseY;
		TDFX_FloatC[slot] = amplitudeX;
		TDFX_FloatD[slot] = amplitudeY;
		TDFX_Step[slot] = speedMs;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock FillPlayerTextDrawProgress(playerid, PlayerText:textid, Float:startWidth, Float:targetWidth, duration = 2000, easing = TDFX_EASE_OUT_QUAD, Float:lineHeight = 0.0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

	new align = 1;
	if (TDFX_ValidPlayer(playerid, textid)) align = TDFX_RemAlign[playerid][_:textid];
	#if defined PlayerTextDrawGetAlignment
		align = _:PlayerTextDrawGetAlignment(playerid, textid);
	#endif

	if (lineHeight <= 0.0)
	{
		if (align == 2)
		{
			if (TDFX_ValidPlayer(playerid, textid)) lineHeight = TDFX_RemSizeX[playerid][_:textid];
			#if defined PlayerTextDrawGetTextSize
				new Float:dummyH = 0.0;
				PlayerTextDrawGetTextSize(playerid, textid, lineHeight, dummyH);
			#endif
			if (lineHeight <= 0.0) lineHeight = 20.0;
		}
		else
		{
			if (TDFX_ValidPlayer(playerid, textid)) lineHeight = TDFX_RemSizeY[playerid][_:textid];
			#if defined PlayerTextDrawGetTextSize
				new Float:dummyW = 0.0;
				PlayerTextDrawGetTextSize(playerid, textid, dummyW, lineHeight);
			#endif
			if (lineHeight <= 0.0) lineHeight = 12.0;
		}
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_PROGRESS;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_FloatA[slot] = startWidth;
	TDFX_FloatB[slot] = lineHeight;
	TDFX_FloatC[slot] = targetWidth;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	if (align == 2) PlayerTextDrawTextSize(playerid, textid, lineHeight, startWidth);
	else PlayerTextDrawTextSize(playerid, textid, startWidth, lineHeight);
	PlayerTextDrawUseBox(playerid, textid, true);
	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock FireworkPlayerTextDraw(playerid, PlayerText:textid, pattern = TDFX_FW_BURST_SPHERE, fuseDuration = 1500, explodeDuration = 1200, Float:shakeIntensity = 6.0, Float:burstSpeed = 6.0, particleCount = 10, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, fuseDuration, explodeDuration, shakeIntensity, burstSpeed, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new fwIdx = TDFX_AllocFwInstance();
		if (fwIdx == -1)
		{
			TDFX_Free(slot, false);
			return 0;
		}

		if (fuseDuration < 300) fuseDuration = 300;
		if (explodeDuration < 300) explodeDuration = 300;
		new totalDuration = fuseDuration + explodeDuration;

		new Float:curX = 0.0, Float:curY = 0.0;
		TDFX_GetPlayerPos(playerid, textid, curX, curY);

		new baseCol = 0xFFFFFFFF;
		if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemText[playerid][_:textid])
			baseCol = TDFX_RemText[playerid][_:textid];
		#if defined _TDFX_PTDGetColour
			baseCol = _TDFX_PTDGetColour(playerid, textid);
		#endif

		if (particleCount < 4) particleCount = 4;
		if (particleCount > TDFX_FW_PARTICLES) particleCount = TDFX_FW_PARTICLES;

		TDFX_FwIsGlobal[fwIdx] = false;
		TDFX_FwPlayer[fwIdx] = playerid;
		TDFX_FwBaseX[fwIdx] = curX;
		TDFX_FwBaseY[fwIdx] = curY;
		if (TDFX_GetFreePlayerTDCount(playerid) < particleCount)
		{
			printf("[TextDrawFX] Warning: Player %d lacks free PlayerTextDraws (%d available, %d required) for Firework.", playerid, TDFX_GetFreePlayerTDCount(playerid), particleCount);
			TDFX_FreeFwInstance(fwIdx);
			TDFX_Free(slot, false);
			return 0;
		}
		if (TDFX_GetFreeGlobalTDCount() < particleCount)
		{
			printf("[TextDrawFX] Warning: Server lacks free Global TextDraws (%d available, %d required) for Firework.", TDFX_GetFreeGlobalTDCount(), particleCount);
			TDFX_FreeFwInstance(fwIdx);
			TDFX_Free(slot, false);
			return 0;
		}
		TDFX_FwCount[fwIdx] = particleCount;

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_FIREWORK;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = totalDuration;
		TDFX_Step[slot] = fwIdx;
		TDFX_Count[slot] = fuseDuration;
		TDFX_FloatA[slot] = curX;
		TDFX_FloatB[slot] = curY;
		TDFX_FloatC[slot] = shakeIntensity;
		TDFX_FloatD[slot] = burstSpeed;
		TDFX_Base[slot] = baseCol;
		TDFX_Easing[slot] = pattern;
		TDFX_PerChar[slot] = false;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock GlitchPlayerTextDraw(playerid, PlayerText:textid, const text[] = "", intensity = 2, duration = 3000, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new pFont = 0;
	if (TDFX_ValidPlayer(playerid, textid)) pFont = TDFX_Info[playerid][_:textid] & 7;
	#if defined PlayerTextDrawGetFont
		pFont = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	if (pFont == 4 || pFont == 5) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < 0) duration = 0;
	if (intensity < 1) intensity = 1;
	if (intensity > 5) intensity = 5;

	new baseCol = 0xFFFFFFFF;
	if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemText[playerid][_:textid])
		baseCol = TDFX_RemText[playerid][_:textid];
	#if defined _TDFX_PTDGetColour
		baseCol = _TDFX_PTDGetColour(playerid, textid);
	#endif

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_GLITCH;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_Step[slot] = intensity;
	TDFX_Base[slot] = baseCol;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);

	if (text[0])
	{
		strmid(TDFX_Text[slot], text, 0, strlen(text), TDFX_MAX_TEXT);
	}
	else
	{
		#if defined PlayerTextDrawGetString
			PlayerTextDrawGetString(playerid, textid, TDFX_Text[slot], TDFX_MAX_TEXT);
		#else
			TDFX_Text[slot][0] = 0;
		#endif
	}

	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock StopPlayerTextDrawFX(playerid, PlayerText:textid)
{
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot == -1) return 0;
	TDFX_Free(slot, true);
	return 1;
}
#define StopPlayerTextDrawBlink StopPlayerTextDrawFX

stock bool:IsPlayerTextDrawFXActive(playerid, PlayerText:textid)
{
	return TDFX_FindPlayer(playerid, textid) != -1;
}
#define IsPlayerTextDrawBlinking IsPlayerTextDrawFXActive


stock Spin3DPlayerTextDraw(playerid, PlayerText:textid, Float:speedX = 0.0, Float:speedY = 0.0, Float:speedZ = 45.0, Float:zoom = 1.0, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPreviewRot
		#pragma unused playerid, textid, speedX, speedY, speedZ, zoom, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new font = 0;
		if (TDFX_ValidPlayer(playerid, textid)) font = TDFX_Info[playerid][_:textid] & 7;
		#if defined PlayerTextDrawGetFont
			font = _:PlayerTextDrawGetFont(playerid, textid);
		#endif
		if (font != 5) return 0;

		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:curRotX = 0.0, Float:curRotY = 0.0, Float:curRotZ = 0.0, Float:dummyZoom = 1.0;
		#if defined PlayerTextDrawGetPreviewRot
			PlayerTextDrawGetPreviewRot(playerid, textid, curRotX, curRotY, curRotZ, dummyZoom);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_SPIN3D;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = curRotX;
		TDFX_FloatB[slot] = curRotY;
		TDFX_FloatC[slot] = curRotZ;
		TDFX_FloatD[slot] = zoom;
		TDFX_BoundMinX[slot] = speedX;
		TDFX_BoundMinY[slot] = speedY;
		TDFX_BoundMaxX[slot] = speedZ;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock Hover3DPlayerTextDraw(playerid, PlayerText:textid, Float:tiltX = 8.0, Float:tiltZ = 12.0, Float:zoomAmp = 0.06, speedMs = 2400, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPreviewRot
		#pragma unused playerid, textid, tiltX, tiltZ, zoomAmp, speedMs, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new font = 0;
		if (TDFX_ValidPlayer(playerid, textid)) font = TDFX_Info[playerid][_:textid] & 7;
		#if defined PlayerTextDrawGetFont
			font = _:PlayerTextDrawGetFont(playerid, textid);
		#endif
		if (font != 5) return 0;

		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:curRotX = 0.0, Float:curRotY = 0.0, Float:curRotZ = 0.0, Float:baseZoom = 1.0;
		#if defined PlayerTextDrawGetPreviewRot
			PlayerTextDrawGetPreviewRot(playerid, textid, curRotX, curRotY, curRotZ, baseZoom);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_HOVER3D;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_Count[slot] = speedMs;
		TDFX_FloatA[slot] = curRotX;
		TDFX_FloatB[slot] = curRotY;
		TDFX_FloatC[slot] = curRotZ;
		TDFX_FloatD[slot] = baseZoom;
		TDFX_BoundMinX[slot] = tiltX;
		TDFX_BoundMinY[slot] = tiltZ;
		TDFX_BoundMaxX[slot] = zoomAmp;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock ShimmerPlayerTextDraw(playerid, PlayerText:textid, const text[], const baseTag[] = "~y~", const shimmerTag[] = "~w~", sweepDuration = 1000, pauseDuration = 1500, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new font = 0;
	if (TDFX_ValidPlayer(playerid, textid)) font = TDFX_Info[playerid][_:textid] & 7;
	#if defined PlayerTextDrawGetFont
		font = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	if (font == 4 || font == 5) return 0;

	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_SHIMMER;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
	strmid(TDFX_Prefix[slot], baseTag, 0, strlen(baseTag), sizeof TDFX_Prefix[]);
	strmid(TDFX_Suffix[slot], shimmerTag, 0, strlen(shimmerTag), sizeof TDFX_Suffix[]);
	TDFX_Step[slot] = sweepDuration;
	TDFX_Count[slot] = pauseDuration;
	TDFX_Easing[slot] = -999;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock RainbowPlayerTextDraw(playerid, PlayerText:textid, const text[], speedMs = 100, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new font = 0;
	if (TDFX_ValidPlayer(playerid, textid)) font = TDFX_Info[playerid][_:textid] & 7;
	#if defined PlayerTextDrawGetFont
		font = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	if (font == 4 || font == 5) return 0;

	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_RAINBOW;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
	TDFX_Step[slot] = speedMs;
	TDFX_Easing[slot] = -1;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock SlotMachinePlayerTextDraw(playerid, PlayerText:textid, const finalText[], spinDuration = 2200, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new font = 0;
	if (TDFX_ValidPlayer(playerid, textid)) font = TDFX_Info[playerid][_:textid] & 7;
	#if defined PlayerTextDrawGetFont
		font = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	if (font == 4 || font == 5) return 0;

	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_SLOT;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = spinDuration;
	strmid(TDFX_Text[slot], finalText, 0, strlen(finalText), sizeof TDFX_Text[]);
	TDFX_Step[slot] = 0;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock PendulumPlayerTextDraw(playerid, PlayerText:textid, Float:pivotX, Float:pivotY, Float:armLength = 80.0, Float:maxAngle = 40.0, Float:damping = 0.65, duration = 3500, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, pivotX, pivotY, armLength, maxAngle, damping, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_PENDULUM;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = pivotX;
		TDFX_FloatB[slot] = pivotY;
		TDFX_FloatC[slot] = armLength;
		TDFX_FloatD[slot] = maxAngle;
		TDFX_BoundMinX[slot] = damping;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock GravityDropPlayerTextDraw(playerid, PlayerText:textid, Float:startY, Float:targetY, Float:elasticity = 0.38, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, startY, targetY, elasticity, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:curX = 0.0, Float:dummyY = 0.0;
		TDFX_GetPlayerPos(playerid, textid, curX, dummyY);

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_SLAM;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = 4000;
		TDFX_FloatA[slot] = curX;
		TDFX_FloatB[slot] = startY;
		TDFX_FloatC[slot] = targetY;
		TDFX_FloatD[slot] = 0.0;
		TDFX_BoundMinX[slot] = elasticity;
		TDFX_BoundMinY[slot] = startY;
		TDFX_Step[slot] = 0;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawSetPos(playerid, textid, curX, startY);
		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock VortexPlayerTextDraw(playerid, PlayerText:textid, Float:centerX, Float:centerY, Float:startRadius = 120.0, Float:spins = 2.5, duration = 2000, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, centerX, centerY, startRadius, spins, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:baseX = 0.40, Float:baseY = 1.60;
		if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemSizeX[playerid][_:textid] > 0.0)
		{
			baseX = TDFX_RemSizeX[playerid][_:textid];
			baseY = TDFX_RemSizeY[playerid][_:textid];
		}
		#if defined PlayerTextDrawGetLetterSize
			PlayerTextDrawGetLetterSize(playerid, textid, baseX, baseY);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_VORTEX;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = centerX;
		TDFX_FloatB[slot] = centerY;
		TDFX_FloatC[slot] = startRadius;
		TDFX_FloatD[slot] = spins * 360.0;
		TDFX_BoundMinX[slot] = baseX;
		TDFX_BoundMinY[slot] = baseY;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = true;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock LetterboxPlayerTextDraw(playerid, PlayerText:topBarTD, PlayerText:bottomBarTD, Float:barHeight = 65.0, duration = 1200, bool:reverse = false, easing = TDFX_EASE_OUT_QUAD, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:topBarTD == 0xFFFF || _:topBarTD < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, topBarTD);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	PlayerTextDrawUseBox(playerid, topBarTD, true);
	new Float:topLetY = barHeight / 9.5;
	PlayerTextDrawLetterSize(playerid, topBarTD, 0.0, topLetY);

	if (_:bottomBarTD != 0xFFFF && _:bottomBarTD >= 0)
	{
		PlayerTextDrawUseBox(playerid, bottomBarTD, true);
		new Float:botLetY = (barHeight + TDFX_LETTERBOX_ASCENT_OFFSET) / 9.5;
		PlayerTextDrawLetterSize(playerid, bottomBarTD, 0.0, botLetY);
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_LETTERBOX;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:topBarTD;
	TDFX_Duration[slot] = duration;
	TDFX_FloatA[slot] = barHeight;
	TDFX_Step[slot] = _:bottomBarTD;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = reverse;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, topBarTD);
	if (_:bottomBarTD != 0xFFFF && _:bottomBarTD >= 0) PlayerTextDrawShow(playerid, bottomBarTD);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock SonarPingPlayerTextDraw(playerid, PlayerText:textid, Float:centerX, Float:centerY, Float:maxRadius = 140.0, pulseCount = 3, pulseDuration = 1200, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, centerX, centerY, maxRadius, pulseCount, pulseDuration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new baseCol = 0x2ECC71FF;
		if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemText[playerid][_:textid])
			baseCol = TDFX_RemText[playerid][_:textid];

		new Float:baseX = 0.42, Float:baseY = 1.70;
		if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemSizeX[playerid][_:textid] > 0.0)
		{
			baseX = TDFX_RemSizeX[playerid][_:textid];
			baseY = TDFX_RemSizeY[playerid][_:textid];
		}
		#if defined PlayerTextDrawGetLetterSize
			PlayerTextDrawGetLetterSize(playerid, textid, baseX, baseY);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_SONAR;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = pulseCount * pulseDuration;
		TDFX_FloatA[slot] = centerX;
		TDFX_FloatB[slot] = centerY;
		TDFX_FloatC[slot] = maxRadius;
		TDFX_BoundMinX[slot] = baseX;
		TDFX_BoundMinY[slot] = baseY;
		TDFX_Step[slot] = pulseDuration;
		TDFX_Base[slot] = baseCol;
		TDFX_Easing[slot] = -1;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = true;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

// -----------------------------------------------------------------------------
stock WaveSweepPlayerTextDraw(playerid, PlayerText:textid, const text[], const crestTag[] = "~w~", const baseTag[] = "~b~", crestWidth = 2, direction = TDFX_DIR_LEFT_TO_RIGHT, speedMs = 70, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new font = 0;
	if (TDFX_ValidPlayer(playerid, textid)) font = TDFX_Info[playerid][_:textid] & 7;
	#if defined PlayerTextDrawGetFont
		font = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	if (font == 4 || font == 5) return 0;

	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_WAVESWEEP;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
	strmid(TDFX_Prefix[slot], crestTag, 0, strlen(crestTag), sizeof TDFX_Prefix[]);
	strmid(TDFX_Suffix[slot], baseTag, 0, strlen(baseTag), sizeof TDFX_Suffix[]);
	TDFX_BoundMinX[slot] = float(crestWidth);
	TDFX_BoundMinY[slot] = float(direction);
	TDFX_Step[slot] = speedMs;
	TDFX_Base[slot] = -999;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock LetterRainPlayerTextDraw(playerid, PlayerText:textid, const text[], Float:targetX, Float:targetY, Float:letterSpacing = 0.0, duration = 3000, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, text, targetX, targetY, letterSpacing, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new instIdx = TDFX_AllocCharInstance();
		if (instIdx == -1) { TDFX_Free(slot, false); return 0; }

		TDFX_CharIsGlobal[instIdx] = false;
		TDFX_CharPlayer[instIdx] = playerid;
		TDFX_CharTargetY[instIdx] = targetY;

		new glyphChars[TDFX_MAX_CHAR_PARTS + 1];
		new glyphTags[TDFX_MAX_CHAR_PARTS][16];
		new rawLen = _TDFX_ParseGlyphs(text, glyphChars, glyphTags, TDFX_MAX_CHAR_PARTS);
		TDFX_CharCount[instIdx] = rawLen;

		if (TDFX_GetFreeGlobalTDCount() < rawLen)
		{
			printf("[TextDrawFX] Warning: Server lacks free Global TextDraws (%d available, %d required) for HopLetter.", TDFX_GetFreeGlobalTDCount(), rawLen);
			TDFX_FreeCharInstance(instIdx);
			TDFX_Free(slot, false);
			return 0;
		}

		if (TDFX_GetFreeGlobalTDCount() < rawLen)
		{
			printf("[TextDrawFX] Warning: Server lacks free Global TextDraws (%d available, %d required) for WaveMotion.", TDFX_GetFreeGlobalTDCount(), rawLen);
			TDFX_FreeCharInstance(instIdx);
			TDFX_Free(slot, false);
			return 0;
		}

		if (TDFX_GetFreeGlobalTDCount() < rawLen)
		{
			printf("[TextDrawFX] Warning: Server lacks free Global TextDraws (%d available, %d required) for LetterRain.", TDFX_GetFreeGlobalTDCount(), rawLen);
			TDFX_FreeCharInstance(instIdx);
			TDFX_Free(slot, false);
			return 0;
		}

		if (TDFX_GetFreePlayerTDCount(playerid) < rawLen)
		{
			printf("[TextDrawFX] Warning: Player %d lacks free PlayerTextDraws (%d available, %d required) for HopLetter.", playerid, TDFX_GetFreePlayerTDCount(playerid), rawLen);
			TDFX_FreeCharInstance(instIdx);
			TDFX_Free(slot, false);
			return 0;
		}

		if (TDFX_GetFreePlayerTDCount(playerid) < rawLen)
		{
			printf("[TextDrawFX] Warning: Player %d lacks free PlayerTextDraws (%d available, %d required) for WaveMotion.", playerid, TDFX_GetFreePlayerTDCount(playerid), rawLen);
			TDFX_FreeCharInstance(instIdx);
			TDFX_Free(slot, false);
			return 0;
		}

		if (TDFX_GetFreePlayerTDCount(playerid) < rawLen)
		{
			printf("[TextDrawFX] Warning: Player %d lacks free PlayerTextDraws (%d available, %d required) for LetterRain.", playerid, TDFX_GetFreePlayerTDCount(playerid), rawLen);
			TDFX_FreeCharInstance(instIdx);
			TDFX_Free(slot, false);
			return 0;
		}

		new font = 1;
		new Float:lsX = 0.45, Float:lsY = 1.80;
		new textCol = 0xFFFFFFFF;
		#if defined PlayerTextDrawGetFont
			font = _:PlayerTextDrawGetFont(playerid, textid);
		#else
			if (TDFX_ValidPlayer(playerid, textid)) font = (TDFX_Info[playerid][_:textid] & 7);
		#endif
		#if defined PlayerTextDrawGetLetterSize
			PlayerTextDrawGetLetterSize(playerid, textid, lsX, lsY);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemLetX[playerid][_:textid] > 0.0)
			{
				lsX = TDFX_RemLetX[playerid][_:textid];
				lsY = TDFX_RemLetY[playerid][_:textid];
			}
		#endif
		#if defined _TDFX_PTDGetColour
			textCol = _TDFX_PTDGetColour(playerid, textid);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemText[playerid][_:textid] != 0)
			{
				textCol = TDFX_RemText[playerid][_:textid];
			}
		#endif

		new align = 2;
		#if defined PlayerTextDrawGetAlignment
			align = _:PlayerTextDrawGetAlignment(playerid, textid);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemAlign[playerid][_:textid] != 0)
			{
				align = TDFX_RemAlign[playerid][_:textid];
			}
		#endif
		new outline = 1;
		if (TDFX_ValidPlayer(playerid, textid) && (TDFX_Info[playerid][_:textid] & (1 << 8)))
		{
			outline = (TDFX_Info[playerid][_:textid] >> 4) & 0x0F;
		}
		#if defined PlayerTextDrawGetOutline
			outline = PlayerTextDrawGetOutline(playerid, textid);
		#endif
		_TDFX_LayoutChars(glyphChars, rawLen, font, lsX, targetX, letterSpacing, TDFX_CharTargetX[instIdx], align, outline);

		for (new p = 0; p < rawLen; p++)
		{
			TDFX_CharDelay[instIdx][p] = p * 80 + random(60);
			TDFX_CharState[instIdx][p] = false;

			new charStr[24];
			format(charStr, sizeof(charStr), "%s%c", glyphTags[p], glyphChars[p]);

			new PlayerText:rptd = CreatePlayerTextDraw(playerid, TDFX_CharTargetX[instIdx][p], -25.0, charStr);
			if (_:rptd == 0xFFFF || _:rptd < 0)
			{
				for (new k = 0; k < p; k++)
				{
					if (TDFX_CharParts[instIdx][k] != PlayerText:INVALID_TEXT_DRAW)
					{
						PlayerTextDrawDestroy(playerid, TDFX_CharParts[instIdx][k]);
						TDFX_CharParts[instIdx][k] = PlayerText:INVALID_TEXT_DRAW;
					}
				}
				TDFX_FreeCharInstance(instIdx);
				TDFX_Free(slot, false);
				return 0;
			}
			#if defined _INC_open_mp
			PlayerTextDrawAlignment(playerid, rptd, TEXT_DRAW_ALIGN_CENTER);
			PlayerTextDrawFont(playerid, rptd, t_TEXT_DRAW_FONT:font);
			#else
			PlayerTextDrawAlignment(playerid, rptd, 2);
			PlayerTextDrawFont(playerid, rptd, font);
			#endif
			PlayerTextDrawLetterSize(playerid, rptd, lsX, lsY);
			_TDFX_PTDColour(playerid, rptd, textCol);
			PlayerTextDrawSetOutline(playerid, rptd, outline);
			TDFX_CharParts[instIdx][p] = rptd;
		}

		new bool:hasBox = false;
		if (TDFX_ValidPlayer(playerid, textid))
		{
			hasBox = bool:(TDFX_Info[playerid][_:textid] & (1 << 3));
		}
		if (hasBox)
		{
			_TDFX_PTDColour(playerid, textid, (textCol & 0xFFFFFF00));
			PlayerTextDrawSetString(playerid, textid, " ");
			PlayerTextDrawShow(playerid, textid);
		}
		else
		{
			PlayerTextDrawHide(playerid, textid);
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_LETTERRAIN;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Base[slot] = textCol;
		TDFX_Duration[slot] = duration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_Step[slot] = instIdx;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock ScannerSweepPlayerTextDraw(playerid, PlayerText:textid, const text[], const laserTag[] = "~r~", const trailTag[] = "~y~", speedMs = 60, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new font = 0;
	if (TDFX_ValidPlayer(playerid, textid)) font = TDFX_Info[playerid][_:textid] & 7;
	#if defined PlayerTextDrawGetFont
		font = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	if (font == 4 || font == 5) return 0;

	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_SCANNER;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
	strmid(TDFX_Prefix[slot], laserTag, 0, strlen(laserTag), sizeof TDFX_Prefix[]);
	strmid(TDFX_Suffix[slot], trailTag, 0, strlen(trailTag), sizeof TDFX_Suffix[]);
	TDFX_Step[slot] = speedMs;
	TDFX_Easing[slot] = -1;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock ElectricArcPlayerTextDraw(playerid, PlayerText:textid, const text[], surgeDuration = 2200, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, text, surgeDuration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:baseX = 320.0, Float:baseY = 365.0;
		#if defined PlayerTextDrawGetPos
			PlayerTextDrawGetPos(playerid, textid, baseX, baseY);
		#endif
		new baseCol = 0xFFFFFFFF;
		#if defined _TDFX_PTDGetColour
			baseCol = _TDFX_PTDGetColour(playerid, textid);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_ELECTRIC;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = surgeDuration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_FloatA[slot] = baseX;
		TDFX_FloatB[slot] = baseY;
		TDFX_Base[slot] = baseCol;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock SplitFlapPlayerTextDraw(playerid, PlayerText:textid, const targetText[], charRollMs = 80, lockIntervalMs = 200, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = false;
	TDFX_Type[slot] = TDFX_TYPE_SPLITFLAP;
	TDFX_Player[slot] = playerid;
	TDFX_Td[slot] = _:textid;
	strmid(TDFX_Text[slot], targetText, 0, strlen(targetText), sizeof TDFX_Text[]);
	TDFX_FloatA[slot] = float(charRollMs);
	TDFX_FloatB[slot] = float(lockIntervalMs);
	TDFX_Easing[slot] = -1;
	TDFX_Duration[slot] = (strlen(targetText) * lockIntervalMs) + 600;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	PlayerTextDrawShow(playerid, textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock HologramPlayerTextDraw(playerid, PlayerText:textid, const text[], duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, text, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:baseX = 320.0, Float:baseY = 365.0;
		#if defined PlayerTextDrawGetPos
			PlayerTextDrawGetPos(playerid, textid, baseX, baseY);
		#endif
		new baseCol = 0x00FFFFFF;

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_HOLOGRAM;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_FloatA[slot] = baseX;
		TDFX_FloatB[slot] = baseY;
		TDFX_Base[slot] = baseCol;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		PlayerTextDrawSetString(playerid, textid, text);
		PlayerTextDrawShow(playerid, textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock ShockwaveSlamPlayerTextDraw(playerid, PlayerText:textid, Float:centerX, Float:centerY, duration = 1800, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, centerX, centerY, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		if (TDFX_GetFreePlayerTDCount(playerid) < TDFX_FW_PARTICLES)
		{
			printf("[TextDrawFX] Warning: Player %d lacks free PlayerTextDraws (%d available, %d required) for ShockwaveSlam.", playerid, TDFX_GetFreePlayerTDCount(playerid), TDFX_FW_PARTICLES);
			return 0;
		}
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new fwIdx = TDFX_AllocFwInstance();
		if (fwIdx != -1)
		{
			TDFX_FwIsGlobal[fwIdx] = false;
			TDFX_FwPlayer[fwIdx] = playerid;
		}

		new Float:baseX = 0.50, Float:baseY = 2.0;
		#if defined PlayerTextDrawGetLetterSize
			PlayerTextDrawGetLetterSize(playerid, textid, baseX, baseY);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemLetX[playerid][_:textid] > 0.0)
			{
				baseX = TDFX_RemLetX[playerid][_:textid];
				baseY = TDFX_RemLetY[playerid][_:textid];
			}
		#endif

		new bool:hasBox = false;
		if (TDFX_ValidPlayer(playerid, textid))
		{
			hasBox = bool:(TDFX_Info[playerid][_:textid] & (1 << 3));
		}
		TDFX_FadeBox[slot] = hasBox;

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_SHOCKWAVE;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = centerX;
		TDFX_FloatB[slot] = centerY;
		TDFX_BoundMinX[slot] = baseX;
		TDFX_BoundMinY[slot] = baseY;
		TDFX_Step[slot] = fwIdx;
		TDFX_Easing[slot] = 0; // 0 = falling, 1 = impacted
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock WaveMotionPlayerTextDraw(playerid, PlayerText:textid, const text[], Float:centerX, Float:centerY, Float:crestHeight = 14.0, Float:crestWidth = 2.5, direction = TDFX_DIR_LEFT_TO_RIGHT, duration = 2800, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, text, centerX, centerY, crestHeight, crestWidth, direction, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new instIdx = TDFX_AllocCharInstance();
		if (instIdx == -1) { TDFX_Free(slot, false); return 0; }

		TDFX_CharIsGlobal[instIdx] = false;
		TDFX_CharPlayer[instIdx] = playerid;
		TDFX_CharTargetY[instIdx] = centerY;

		new glyphChars[TDFX_MAX_CHAR_PARTS + 1];
		new glyphTags[TDFX_MAX_CHAR_PARTS][16];
		new rawLen = _TDFX_ParseGlyphs(text, glyphChars, glyphTags, TDFX_MAX_CHAR_PARTS);
		TDFX_CharCount[instIdx] = rawLen;

		new font = 1;
		new Float:lsX = 0.45, Float:lsY = 1.80;
		new textCol = 0xFFFFFFFF;
		#if defined PlayerTextDrawGetFont
			font = _:PlayerTextDrawGetFont(playerid, textid);
		#else
			if (TDFX_ValidPlayer(playerid, textid)) font = (TDFX_Info[playerid][_:textid] & 7);
		#endif
		#if defined PlayerTextDrawGetLetterSize
			PlayerTextDrawGetLetterSize(playerid, textid, lsX, lsY);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemLetX[playerid][_:textid] > 0.0)
			{
				lsX = TDFX_RemLetX[playerid][_:textid];
				lsY = TDFX_RemLetY[playerid][_:textid];
			}
		#endif
		#if defined _TDFX_PTDGetColour
			textCol = _TDFX_PTDGetColour(playerid, textid);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemText[playerid][_:textid] != 0)
			{
				textCol = TDFX_RemText[playerid][_:textid];
			}
		#endif

		new align = 2;
		#if defined PlayerTextDrawGetAlignment
			align = _:PlayerTextDrawGetAlignment(playerid, textid);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemAlign[playerid][_:textid] != 0)
			{
				align = TDFX_RemAlign[playerid][_:textid];
			}
		#endif
		new outline = 1;
		if (TDFX_ValidPlayer(playerid, textid) && (TDFX_Info[playerid][_:textid] & (1 << 8)))
		{
			outline = (TDFX_Info[playerid][_:textid] >> 4) & 0x0F;
		}
		#if defined PlayerTextDrawGetOutline
			outline = PlayerTextDrawGetOutline(playerid, textid);
		#endif
		_TDFX_LayoutChars(glyphChars, rawLen, font, lsX, centerX, 0.0, TDFX_CharTargetX[instIdx], align, outline);

		for (new p = 0; p < rawLen; p++)
		{
			new charStr[24];
			format(charStr, sizeof(charStr), "%s%c", glyphTags[p], glyphChars[p]);

			new PlayerText:wptd = CreatePlayerTextDraw(playerid, TDFX_CharTargetX[instIdx][p], centerY, charStr);
			if (_:wptd == 0xFFFF || _:wptd < 0)
			{
				for (new k = 0; k < p; k++)
				{
					if (TDFX_CharParts[instIdx][k] != PlayerText:INVALID_TEXT_DRAW)
					{
						PlayerTextDrawDestroy(playerid, TDFX_CharParts[instIdx][k]);
						TDFX_CharParts[instIdx][k] = PlayerText:INVALID_TEXT_DRAW;
					}
				}
				TDFX_FreeCharInstance(instIdx);
				TDFX_Free(slot, false);
				return 0;
			}
			#if defined _INC_open_mp
			PlayerTextDrawAlignment(playerid, wptd, TEXT_DRAW_ALIGN_CENTER);
			PlayerTextDrawFont(playerid, wptd, t_TEXT_DRAW_FONT:font);
			#else
			PlayerTextDrawAlignment(playerid, wptd, 2);
			PlayerTextDrawFont(playerid, wptd, font);
			#endif
			PlayerTextDrawLetterSize(playerid, wptd, lsX, lsY);
			_TDFX_PTDColour(playerid, wptd, textCol);
			PlayerTextDrawSetOutline(playerid, wptd, outline);
			PlayerTextDrawShow(playerid, wptd);
			TDFX_CharParts[instIdx][p] = wptd;
		}

		new bool:hasBox = false;
		if (TDFX_ValidPlayer(playerid, textid))
		{
			hasBox = bool:(TDFX_Info[playerid][_:textid] & (1 << 3));
		}
		if (hasBox)
		{
			_TDFX_PTDColour(playerid, textid, (textCol & 0xFFFFFF00));
			PlayerTextDrawSetString(playerid, textid, " ");
			PlayerTextDrawShow(playerid, textid);
		}
		else
		{
			PlayerTextDrawHide(playerid, textid);
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_WAVEMOTION;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Base[slot] = textCol;
		TDFX_FloatA[slot] = crestHeight;
		TDFX_FloatB[slot] = crestWidth;
		TDFX_Easing[slot] = direction;
		TDFX_Duration[slot] = duration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_Step[slot] = instIdx;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock HopLetterPlayerTextDraw(playerid, PlayerText:textid, const text[], Float:centerX, Float:centerY, Float:hopHeight = 16.0, staggerMs = 90, hopDurationMs = 350, direction = TDFX_DIR_LEFT_TO_RIGHT, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined PlayerTextDrawSetPos
		#pragma unused playerid, textid, text, centerX, centerY, hopHeight, staggerMs, hopDurationMs, direction, duration, loop, extra_id, callback
		return 0;
	#else
		if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindPlayer(playerid, textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new instIdx = TDFX_AllocCharInstance();
		if (instIdx == -1) { TDFX_Free(slot, false); return 0; }

		TDFX_CharIsGlobal[instIdx] = false;
		TDFX_CharPlayer[instIdx] = playerid;
		TDFX_CharTargetY[instIdx] = centerY;

		new glyphChars[TDFX_MAX_CHAR_PARTS + 1];
		new glyphTags[TDFX_MAX_CHAR_PARTS][16];
		new rawLen = _TDFX_ParseGlyphs(text, glyphChars, glyphTags, TDFX_MAX_CHAR_PARTS);
		TDFX_CharCount[instIdx] = rawLen;

		new font = 1;
		new Float:lsX = 0.45, Float:lsY = 1.80;
		new textCol = 0xFFFFFFFF;
		#if defined PlayerTextDrawGetFont
			font = _:PlayerTextDrawGetFont(playerid, textid);
		#else
			if (TDFX_ValidPlayer(playerid, textid)) font = (TDFX_Info[playerid][_:textid] & 7);
		#endif
		#if defined PlayerTextDrawGetLetterSize
			PlayerTextDrawGetLetterSize(playerid, textid, lsX, lsY);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemLetX[playerid][_:textid] > 0.0)
			{
				lsX = TDFX_RemLetX[playerid][_:textid];
				lsY = TDFX_RemLetY[playerid][_:textid];
			}
		#endif
		#if defined _TDFX_PTDGetColour
			textCol = _TDFX_PTDGetColour(playerid, textid);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemText[playerid][_:textid] != 0)
			{
				textCol = TDFX_RemText[playerid][_:textid];
			}
		#endif

		new align = 2;
		#if defined PlayerTextDrawGetAlignment
			align = _:PlayerTextDrawGetAlignment(playerid, textid);
		#else
			if (TDFX_ValidPlayer(playerid, textid) && TDFX_RemAlign[playerid][_:textid] != 0)
			{
				align = TDFX_RemAlign[playerid][_:textid];
			}
		#endif
		new outline = 1;
		if (TDFX_ValidPlayer(playerid, textid) && (TDFX_Info[playerid][_:textid] & (1 << 8)))
		{
			outline = (TDFX_Info[playerid][_:textid] >> 4) & 0x0F;
		}
		#if defined PlayerTextDrawGetOutline
			outline = PlayerTextDrawGetOutline(playerid, textid);
		#endif
		_TDFX_LayoutChars(glyphChars, rawLen, font, lsX, centerX, 0.0, TDFX_CharTargetX[instIdx], align, outline);

		for (new p = 0; p < rawLen; p++)
		{
			new pIdx = (direction == TDFX_DIR_LEFT_TO_RIGHT) ? p : (rawLen - 1 - p);
			TDFX_CharDelay[instIdx][pIdx] = p * staggerMs;

			new charStr[24];
			format(charStr, sizeof(charStr), "%s%c", glyphTags[pIdx], glyphChars[pIdx]);

			new PlayerText:hptd = CreatePlayerTextDraw(playerid, TDFX_CharTargetX[instIdx][pIdx], centerY, charStr);
			if (_:hptd == 0xFFFF || _:hptd < 0)
			{
				for (new k = 0; k < p; k++)
				{
					new prevIdx = (direction == TDFX_DIR_RIGHT_TO_LEFT) ? (rawLen - 1 - k) : k;
					if (TDFX_CharParts[instIdx][prevIdx] != PlayerText:INVALID_TEXT_DRAW)
					{
						PlayerTextDrawDestroy(playerid, TDFX_CharParts[instIdx][prevIdx]);
						TDFX_CharParts[instIdx][prevIdx] = PlayerText:INVALID_TEXT_DRAW;
					}
				}
				TDFX_FreeCharInstance(instIdx);
				TDFX_Free(slot, false);
				return 0;
			}
			#if defined _INC_open_mp
			PlayerTextDrawAlignment(playerid, hptd, TEXT_DRAW_ALIGN_CENTER);
			PlayerTextDrawFont(playerid, hptd, t_TEXT_DRAW_FONT:font);
			#else
			PlayerTextDrawAlignment(playerid, hptd, 2);
			PlayerTextDrawFont(playerid, hptd, font);
			#endif
			PlayerTextDrawLetterSize(playerid, hptd, lsX, lsY);
			_TDFX_PTDColour(playerid, hptd, textCol);
			PlayerTextDrawSetOutline(playerid, hptd, outline);
			PlayerTextDrawShow(playerid, hptd);
			TDFX_CharParts[instIdx][pIdx] = hptd;
		}

		new bool:hasBox = false;
		if (TDFX_ValidPlayer(playerid, textid))
		{
			hasBox = bool:(TDFX_Info[playerid][_:textid] & (1 << 3));
		}
		if (hasBox)
		{
			_TDFX_PTDColour(playerid, textid, (textCol & 0xFFFFFF00));
			PlayerTextDrawSetString(playerid, textid, " ");
			PlayerTextDrawShow(playerid, textid);
		}
		else
		{
			PlayerTextDrawHide(playerid, textid);
		}

		new totalDur = duration;
		if (totalDur <= 0)
		{
			if (direction == TDFX_DIR_BOUNCE)
			{
				totalDur = ((rawLen - 1) * staggerMs * 2) + hopDurationMs + 100;
			}
			else
			{
				totalDur = (rawLen - 1) * staggerMs + hopDurationMs + 100;
			}
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = false;
		TDFX_Type[slot] = TDFX_TYPE_HOPLETTER;
		TDFX_Player[slot] = playerid;
		TDFX_Td[slot] = _:textid;
		TDFX_Base[slot] = textCol;
		TDFX_FloatA[slot] = hopHeight;
		TDFX_FloatB[slot] = float(staggerMs);
		TDFX_Easing[slot] = direction;
		TDFX_Count[slot] = hopDurationMs;
		TDFX_Duration[slot] = totalDur;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_Step[slot] = instIdx;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

// Public API - Global TextDraws
// -----------------------------------------------------------------------------

stock BlinkTextDraw(Text:textid, interval = 500, duration = 0, bool:perChar = false, colour = 0, const text[] = "", baseColour = 0, bool:loop = false)
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (interval < TDFX_MIN_INTERVAL) interval = TDFX_MIN_INTERVAL;
	if (duration < 0) duration = 0;
	new bool:known = TDFX_ValidGlobal(textid), font = 1, bool:box = false;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (known)
		{
			font = TDFX_GInfo[_:textid] & 7;
			box = (TDFX_GInfo[_:textid] & 8) != 0;
		}
	#endif
	#if defined TextDrawGetFont
		font = _:TextDrawGetFont(textid);
	#endif
	#if defined TextDrawIsBox
		box = TextDrawIsBox(textid);
	#endif
	new bool:preview = (font == 5);
	if (font == 4 || font == 5) perChar = false;
	new boxBase = 0;
	if (colour)
	{
		if (preview)
		{
			#if defined _TDFX_TDGetBackColour
				if (!baseColour) baseColour = _TDFX_TDGetBackColour(textid);
			#endif
			#if TDFX_MAX_GLOBAL_TD > 0
				if (!baseColour && known) baseColour = TDFX_GRemBack[_:textid];
			#endif
		}
		else
		{
			#if defined _TDFX_TDGetColour
				if (!baseColour) baseColour = _TDFX_TDGetColour(textid);
			#endif
			#if TDFX_MAX_GLOBAL_TD > 0
				if (!baseColour && known) baseColour = TDFX_GRemText[_:textid];
				if (box)
				{
					#if defined _TDFX_TDGetBoxColour
						boxBase = _TDFX_TDGetBoxColour(textid);
					#endif
					if (!boxBase && known) boxBase = TDFX_GRemBox[_:textid];
				}
			#endif
		}
		if (!baseColour) return 0;
	}
	TDFX_Text[slot][0] = 0;
	if (perChar)
	{
		if (text[0]) strmid(TDFX_Text[slot], text, 0, strlen(text), TDFX_MAX_TEXT);
		#if defined TextDrawGetString
		else TextDrawGetString(textid, TDFX_Text[slot], TDFX_MAX_TEXT);
		#endif
		TDFX_Count[slot] = TDFX_CountChars(TDFX_Text[slot]);
		if (TDFX_Count[slot] == 0) perChar = false;
	}
	if (perChar && duration > 0 && TDFX_Count[slot] * interval > duration)
	{
		interval = duration / TDFX_Count[slot];
		if (interval < TDFX_MIN_INTERVAL) interval = TDFX_MIN_INTERVAL;
	}
	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_BLINK;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_PerChar[slot] = perChar;
	TDFX_Preview[slot] = preview;
	TDFX_Duration[slot] = duration;
	TDFX_Colour[slot] = colour;
	TDFX_Base[slot] = baseColour;
	TDFX_BoxBase[slot] = boxBase;
	TDFX_ExtraId[slot] = 0;
	TDFX_Callback[slot][0] = 0;
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	if (perChar)
	{
		TDFX_Step[slot] = 0;
		new part[2]; part[0] = ' '; part[1] = 0;
		TextDrawSetString(textid, part);
	}
	else TDFX_Step[slot] = 1;

	if (colour)
	{
		if (preview) _TDFX_TDBackColour(textid, colour);
		else
		{
			_TDFX_TDColour(textid, colour);
			if (boxBase) _TDFX_TDBoxColour(textid, colour);
		}
	}
	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", interval, true, "i", slot);
	return 1;
}

stock TypewriterTextDraw(Text:textid, const text[], interval = 50, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (!text[0]) return 0;
	new ret = BlinkTextDraw(textid, interval, duration, true, 0, text);
	if (ret)
	{
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1)
		{
			if (!TDFX_PerChar[slot])
			{
				TDFX_Free(slot, false);
				return 0;
			}
			TDFX_Type[slot] = TDFX_TYPE_TYPEWRITER;
			TDFX_Loop[slot] = loop;
			TDFX_ExtraId[slot] = extra_id;
			if (callback[0]) strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		}
	}
	return ret;
}

stock FadeInTextDraw(Text:textid, duration = 1000, bool:fadeBox = true, targetAlpha = 255, bool:loop = false, extra_id = 0, const callback[] = "", bool:autoHide = false)
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
	new bool:known = TDFX_ValidGlobal(textid), baseCol = 0, boxCol = 0, font = 1;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (known)
		{
			font = TDFX_GInfo[_:textid] & 7;
			baseCol = TDFX_GRemText[_:textid];
			boxCol = TDFX_GRemBox[_:textid];
		}
	#endif
	#if defined TextDrawGetFont
		font = _:TextDrawGetFont(textid);
	#endif
	new bool:preview = (font == 5);
	if (preview)
	{
		#if defined _TDFX_TDGetBackColour
			baseCol = _TDFX_TDGetBackColour(textid);
		#endif
		#if TDFX_MAX_GLOBAL_TD > 0
			if (!baseCol && known) baseCol = TDFX_GRemBack[_:textid];
		#endif
		if (!baseCol) baseCol = 0xFFFFFFFF;
	}
	else
	{
		#if defined _TDFX_TDGetColour
			if (!baseCol) baseCol = _TDFX_TDGetColour(textid);
		#endif
		#if defined _TDFX_TDGetBoxColour
			if (!boxCol) boxCol = _TDFX_TDGetBoxColour(textid);
		#endif
		if (!baseCol) baseCol = 0xFFFFFFFF;
		if (!boxCol) boxCol = 0x000000AA;
	}

	new startCol = (baseCol & 0xFFFFFF00);
	new endCol = (baseCol & 0xFFFFFF00) | (targetAlpha & 0xFF);
	new startBox = (boxCol & 0xFFFFFF00);
	new endBox = (boxCol & 0xFFFFFF00) | (targetAlpha & 0xFF);

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_FADE;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Preview[slot] = preview;
	TDFX_Duration[slot] = duration;
	TDFX_Base[slot] = endCol;
	TDFX_BoxBase[slot] = endBox;
	TDFX_ColFrom[slot] = startCol;
	TDFX_ColTo[slot] = endCol;
	TDFX_BoxColFrom[slot] = startBox;
	TDFX_BoxColTo[slot] = endBox;
	TDFX_FadeBox[slot] = fadeBox;
	TDFX_Easing[slot] = TDFX_EASE_LINEAR;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = autoHide;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	if (preview) _TDFX_TDBackColour(textid, startCol);
	else
	{
		_TDFX_TDColour(textid, startCol);
		if (fadeBox) _TDFX_TDBoxColour(textid, startBox);
	}
	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock FadeOutTextDraw(Text:textid, duration = 1000, bool:fadeBox = true, bool:loop = false, extra_id = 0, const callback[] = "", bool:autoHide = true)
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
	new bool:known = TDFX_ValidGlobal(textid), baseCol = 0, boxCol = 0, font = 1;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (known)
		{
			font = TDFX_GInfo[_:textid] & 7;
			baseCol = TDFX_GRemText[_:textid];
			boxCol = TDFX_GRemBox[_:textid];
		}
	#endif
	#if defined TextDrawGetFont
		font = _:TextDrawGetFont(textid);
	#endif
	new bool:preview = (font == 5);
	if (preview)
	{
		#if defined _TDFX_TDGetBackColour
			baseCol = _TDFX_TDGetBackColour(textid);
		#endif
		#if TDFX_MAX_GLOBAL_TD > 0
			if (!baseCol && known) baseCol = TDFX_GRemBack[_:textid];
		#endif
		if (!baseCol) baseCol = 0xFFFFFFFF;
	}
	else
	{
		#if defined _TDFX_TDGetColour
			if (!baseCol) baseCol = _TDFX_TDGetColour(textid);
		#endif
		#if defined _TDFX_TDGetBoxColour
			if (!boxCol) boxCol = _TDFX_TDGetBoxColour(textid);
		#endif
		if (!baseCol) baseCol = 0xFFFFFFFF;
		if (!boxCol) boxCol = 0x000000AA;
	}

	new startCol = baseCol;
	new endCol = (baseCol & 0xFFFFFF00);
	new startBox = boxCol;
	new endBox = (boxCol & 0xFFFFFF00);

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_FADE;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Preview[slot] = preview;
	TDFX_Duration[slot] = duration;
	TDFX_Base[slot] = baseCol;
	TDFX_BoxBase[slot] = boxCol;
	TDFX_ColFrom[slot] = startCol;
	TDFX_ColTo[slot] = endCol;
	TDFX_BoxColFrom[slot] = startBox;
	TDFX_BoxColTo[slot] = endBox;
	TDFX_FadeBox[slot] = fadeBox;
	TDFX_Easing[slot] = TDFX_EASE_LINEAR;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = autoHide;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock FadeColorTextDraw(Text:textid, fromColor, toColor, duration = 1000, bool:fadeBox = false, fromBox = 0, toBox = 0, easing = TDFX_EASE_LINEAR, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
	new bool:known = TDFX_ValidGlobal(textid), font = 1;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (known) font = TDFX_GInfo[_:textid] & 7;
	#endif
	#if defined TextDrawGetFont
		font = _:TextDrawGetFont(textid);
	#endif
	new bool:preview = (font == 5);

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_FADE;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Preview[slot] = preview;
	TDFX_Duration[slot] = duration;
	TDFX_Base[slot] = toColor;
	TDFX_BoxBase[slot] = toBox;
	TDFX_ColFrom[slot] = fromColor;
	TDFX_ColTo[slot] = toColor;
	TDFX_BoxColFrom[slot] = fromBox;
	TDFX_BoxColTo[slot] = toBox;
	TDFX_FadeBox[slot] = fadeBox;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock ScaleTextDraw(Text:textid, Float:startSizeX, Float:startSizeY, Float:targetSizeX, Float:targetSizeY, duration = 1000, easing = TDFX_EASE_LINEAR, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_SCALE;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_FloatA[slot] = startSizeX;
	TDFX_FloatB[slot] = startSizeY;
	TDFX_FloatC[slot] = targetSizeX;
	TDFX_FloatD[slot] = targetSizeY;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	TextDrawLetterSize(textid, startSizeX, startSizeY);
	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock PulseTextDraw(Text:textid, Float:amplitude = 0.25, interval = 300, cycles = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (interval < TDFX_MIN_INTERVAL) interval = TDFX_MIN_INTERVAL;
	new Float:baseX = 0.48, Float:baseY = 1.12;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid))
		{
			if (TDFX_GRemLetX[_:textid] > 0.0) baseX = TDFX_GRemLetX[_:textid];
			if (TDFX_GRemLetY[_:textid] > 0.0) baseY = TDFX_GRemLetY[_:textid];
		}
	#endif
	#if defined TextDrawGetLetterSize
		TextDrawGetLetterSize(textid, baseX, baseY);
	#endif

	new duration = (cycles > 0) ? (cycles * interval) : 0;

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_PULSE;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_FloatA[slot] = baseX;
	TDFX_FloatB[slot] = baseY;
	TDFX_FloatC[slot] = amplitude;
	TDFX_FloatD[slot] = float(cycles);
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (cycles == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock SlideTextDraw(Text:textid, Float:targetX, Float:targetY, duration = 1000, easing = TDFX_EASE_OUT_QUAD, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, targetX, targetY, duration, easing, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
		new Float:startX = 0.0, Float:startY = 0.0;
		#if defined TextDrawGetPos
			TextDrawGetPos(textid, startX, startY);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_SLIDE;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = startX;
		TDFX_FloatB[slot] = startY;
		TDFX_FloatC[slot] = targetX;
		TDFX_FloatD[slot] = targetY;
		TDFX_Easing[slot] = easing;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock CountTextDrawNumber(Text:textid, startValue, targetValue, duration = 1000, const prefix[] = "", const suffix[] = "", bool:thousandsSep = false, easing = TDFX_EASE_LINEAR, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new gFont = 0;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) gFont = TDFX_GInfo[_:textid] & 7;
	#endif
	#if defined TextDrawGetFont
		gFont = _:TextDrawGetFont(textid);
	#endif
	if (gFont == 4 || gFont == 5) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_COUNT;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_Step[slot] = startValue;
	TDFX_Count[slot] = targetValue;
	strmid(TDFX_Prefix[slot], prefix, 0, strlen(prefix), sizeof TDFX_Prefix[]);
	strmid(TDFX_Suffix[slot], suffix, 0, strlen(suffix), sizeof TDFX_Suffix[]);
	TDFX_ThousandSep[slot] = thousandsSep;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	new initial[TDFX_MAX_TEXT];
	TDFX_FormatNumber(initial, sizeof initial, startValue, prefix, suffix, thousandsSep);
	TextDrawSetString(textid, initial);
	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock ScrambleTextDraw(Text:textid, const finalText[], duration = 2000, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new gFont = 0;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) gFont = TDFX_GInfo[_:textid] & 7;
	#endif
	#if defined TextDrawGetFont
		gFont = _:TextDrawGetFont(textid);
	#endif
	if (gFont == 4 || gFont == 5) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_SCRAMBLE;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	strmid(TDFX_Text[slot], finalText, 0, strlen(finalText), TDFX_MAX_TEXT);
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock BounceTextDraw(Text:textid, Float:speedX, Float:speedY, Float:minX, Float:minY, Float:maxX, Float:maxY, bool:colorShift = false, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, speedX, speedY, minX, minY, maxX, maxY, colorShift, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < 0) duration = 0;
		new Float:curX = 0.0, Float:curY = 0.0;
		TDFX_GetGlobalPos(textid, curX, curY);

		new baseCol = 0xFFFFFFFF;
		#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid) && TDFX_GRemText[_:textid])
				baseCol = TDFX_GRemText[_:textid];
		#endif
		#if defined _TDFX_TDGetColour
			baseCol = _TDFX_TDGetColour(textid);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_BOUNCE;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		if (random(2) == 0) speedX = -speedX;
		if (random(2) == 0) speedY = -speedY;
		speedX *= (0.90 + float(random(21)) / 100.0);
		speedY *= (0.90 + float(random(21)) / 100.0);
		TDFX_FloatA[slot] = curX;
		TDFX_FloatB[slot] = curY;
		TDFX_FloatC[slot] = speedX;
		TDFX_FloatD[slot] = speedY;
		TDFX_BoundMinX[slot] = minX;
		TDFX_BoundMinY[slot] = minY;
		TDFX_BoundMaxX[slot] = maxX;
		TDFX_BoundMaxY[slot] = maxY;
		TDFX_ColorShift[slot] = colorShift;
		TDFX_Base[slot] = baseCol;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock BounceCircleTextDraw(Text:textid, Float:speed = 2.8, Float:angle = 45.0, Float:centerX = 320.0, Float:centerY = 240.0, Float:radius = 120.0, bool:colorShift = false, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, speed, angle, centerX, centerY, radius, colorShift, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < 0) duration = 0;
		new Float:curX = 0.0, Float:curY = 0.0;
		TDFX_GetGlobalPos(textid, curX, curY);

		if (floatabs(curX - centerX) < 0.001 && floatabs(curY - centerY) < 0.001)
		{
			curX = centerX + radius * 0.40;
			curY = centerY - radius * 0.25;
			TextDrawSetPos(textid, curX, curY);
		}

		new baseCol = 0xFFFFFFFF;
		#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid) && TDFX_GRemText[_:textid])
				baseCol = TDFX_GRemText[_:textid];
		#endif
		#if defined _TDFX_TDGetColour
			baseCol = _TDFX_TDGetColour(textid);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_BOUNCE_CIRC;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = curX;
		TDFX_FloatB[slot] = curY;
		TDFX_FloatC[slot] = speed * floatcos(angle, degrees);
		TDFX_FloatD[slot] = speed * floatsin(angle, degrees);
		TDFX_BoundMinX[slot] = centerX;
		TDFX_BoundMinY[slot] = centerY;
		TDFX_BoundMaxX[slot] = radius;
		TDFX_BoundMaxY[slot] = 0.0;
		TDFX_ColorShift[slot] = colorShift;
		TDFX_Base[slot] = baseCol;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock OrbitTextDraw(Text:textid, Float:centerX, Float:centerY, Float:radiusX, Float:radiusY, Float:angularSpeed = 60.0, Float:startAngle = 0.0, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, centerX, centerY, radiusX, radiusY, angularSpeed, startAngle, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < 0) duration = 0;

		new Float:origX = 0.0, Float:origY = 0.0;
		TDFX_GetGlobalPos(textid, origX, origY);

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_ORBIT;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = centerX;
		TDFX_FloatB[slot] = centerY;
		TDFX_FloatC[slot] = radiusX;
		TDFX_FloatD[slot] = radiusY;
		TDFX_BoundMinX[slot] = angularSpeed;
		TDFX_BoundMinY[slot] = startAngle;
		TDFX_BoundMaxX[slot] = origX;
		TDFX_BoundMaxY[slot] = origY;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock ShakeTextDraw(Text:textid, Float:intensity = 6.0, duration = 800, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, intensity, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

		new Float:baseX = 0.0, Float:baseY = 0.0;
		TDFX_GetGlobalPos(textid, baseX, baseY);

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_SHAKE;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = baseX;
		TDFX_FloatB[slot] = baseY;
		TDFX_FloatC[slot] = intensity;
		TDFX_FloatD[slot] = 0.0;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock NeonFlickerTextDraw(Text:textid, duration = 3000, brokenRatio = 40, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;
	if (brokenRatio < 0) brokenRatio = 0;
	if (brokenRatio > 100) brokenRatio = 100;

	new bool:known = TDFX_ValidGlobal(textid), font = 1, baseCol = 0xFFFFFFFF, boxCol = 0;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (known)
		{
			font = TDFX_GInfo[_:textid] & 7;
			if (TDFX_GRemText[_:textid]) baseCol = TDFX_GRemText[_:textid];
			boxCol = TDFX_GRemBox[_:textid];
		}
	#endif
	#if defined TextDrawGetFont
		font = _:TextDrawGetFont(textid);
	#endif
	new bool:preview = (font == 5);
	if (preview)
	{
		#if defined _TDFX_TDGetBackColour
			baseCol = _TDFX_TDGetBackColour(textid);
		#endif
		#if TDFX_MAX_GLOBAL_TD > 0
			if (!baseCol && known) baseCol = TDFX_GRemBack[_:textid];
		#endif
	}
	else
	{
		#if defined _TDFX_TDGetColour
			baseCol = _TDFX_TDGetColour(textid);
		#endif
		#if defined _TDFX_TDGetBoxColour
			boxCol = _TDFX_TDGetBoxColour(textid);
		#endif
	}
	if (!baseCol) baseCol = 0xFFFFFFFF;

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_NEON;
	TDFX_Preview[slot] = preview;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_Step[slot] = brokenRatio;
	TDFX_Base[slot] = baseCol;
	TDFX_BoxBase[slot] = boxCol;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock WaveDriftTextDraw(Text:textid, Float:amplitudeX, Float:amplitudeY, speedMs = 1500, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, amplitudeX, amplitudeY, speedMs, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}
		if (duration < 0) duration = 0;
		if (speedMs < 100) speedMs = 1500;

		new Float:baseX = 0.0, Float:baseY = 0.0;
		TDFX_GetGlobalPos(textid, baseX, baseY);

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_WAVE;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = baseX;
		TDFX_FloatB[slot] = baseY;
		TDFX_FloatC[slot] = amplitudeX;
		TDFX_FloatD[slot] = amplitudeY;
		TDFX_Step[slot] = speedMs;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock FillTextDrawProgress(Text:textid, Float:startWidth, Float:targetWidth, duration = 2000, easing = TDFX_EASE_OUT_QUAD, Float:lineHeight = 0.0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < TDFX_MIN_INTERVAL) duration = TDFX_MIN_INTERVAL;

	new gAlign = 1;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) gAlign = TDFX_GRemAlign[_:textid];
	#endif
	#if defined TextDrawGetAlignment
		gAlign = _:TextDrawGetAlignment(textid);
	#endif

	if (lineHeight <= 0.0)
	{
		if (gAlign == 2)
		{
			#if TDFX_MAX_GLOBAL_TD > 0
				if (TDFX_ValidGlobal(textid)) lineHeight = TDFX_GRemSizeX[_:textid];
			#endif
			#if defined TextDrawGetTextSize
				new Float:dummyH = 0.0;
				TextDrawGetTextSize(textid, lineHeight, dummyH);
			#endif
			if (lineHeight <= 0.0) lineHeight = 20.0;
		}
		else
		{
			#if TDFX_MAX_GLOBAL_TD > 0
				if (TDFX_ValidGlobal(textid)) lineHeight = TDFX_GRemSizeY[_:textid];
			#endif
			#if defined TextDrawGetTextSize
				new Float:dummyW = 0.0;
				TextDrawGetTextSize(textid, dummyW, lineHeight);
			#endif
			if (lineHeight <= 0.0) lineHeight = 12.0;
		}
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_PROGRESS;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_FloatA[slot] = startWidth;
	TDFX_FloatB[slot] = lineHeight;
	TDFX_FloatC[slot] = targetWidth;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	if (gAlign == 2) TextDrawTextSize(textid, lineHeight, startWidth);
	else TextDrawTextSize(textid, startWidth, lineHeight);
	TextDrawUseBox(textid, true);
	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock FireworkTextDraw(Text:textid, pattern = TDFX_FW_BURST_SPHERE, fuseDuration = 1500, explodeDuration = 1200, Float:shakeIntensity = 6.0, Float:burstSpeed = 6.0, particleCount = 10, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, fuseDuration, explodeDuration, shakeIntensity, burstSpeed, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new fwIdx = TDFX_AllocFwInstance();
		if (fwIdx == -1)
		{
			TDFX_Free(slot, false);
			return 0;
		}

		if (fuseDuration < 300) fuseDuration = 300;
		if (explodeDuration < 300) explodeDuration = 300;
		new totalDuration = fuseDuration + explodeDuration;

		new Float:curX = 0.0, Float:curY = 0.0;
		TDFX_GetGlobalPos(textid, curX, curY);

		new baseCol = 0xFFFFFFFF;
		#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid) && TDFX_GRemText[_:textid])
				baseCol = TDFX_GRemText[_:textid];
		#endif
		#if defined _TDFX_TDGetColour
			baseCol = _TDFX_TDGetColour(textid);
		#endif

		if (particleCount < 4) particleCount = 4;
		if (particleCount > TDFX_FW_PARTICLES) particleCount = TDFX_FW_PARTICLES;

		TDFX_FwIsGlobal[fwIdx] = true;
		TDFX_FwPlayer[fwIdx] = INVALID_PLAYER_ID;
		TDFX_FwBaseX[fwIdx] = curX;
		TDFX_FwBaseY[fwIdx] = curY;
		TDFX_FwCount[fwIdx] = particleCount;

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_FIREWORK;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = totalDuration;
		TDFX_Step[slot] = fwIdx;
		TDFX_Count[slot] = fuseDuration;
		TDFX_FloatA[slot] = curX;
		TDFX_FloatB[slot] = curY;
		TDFX_FloatC[slot] = shakeIntensity;
		TDFX_FloatD[slot] = burstSpeed;
		TDFX_Base[slot] = baseCol;
		TDFX_Easing[slot] = pattern;
		TDFX_PerChar[slot] = false;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock GlitchTextDraw(Text:textid, const text[] = "", intensity = 2, duration = 3000, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new gFont = 0;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) gFont = TDFX_GInfo[_:textid] & 7;
	#endif
	#if defined TextDrawGetFont
		gFont = _:TextDrawGetFont(textid);
	#endif
	if (gFont == 4 || gFont == 5) return 0;
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}
	if (duration < 0) duration = 0;
	if (intensity < 1) intensity = 1;
	if (intensity > 5) intensity = 5;

	new baseCol = 0xFFFFFFFF;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid) && TDFX_GRemText[_:textid])
			baseCol = TDFX_GRemText[_:textid];
	#endif
	#if defined _TDFX_TDGetColour
		baseCol = _TDFX_TDGetColour(textid);
	#endif

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_GLITCH;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	TDFX_Step[slot] = intensity;
	TDFX_Base[slot] = baseCol;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);

	if (text[0])
	{
		strmid(TDFX_Text[slot], text, 0, strlen(text), TDFX_MAX_TEXT);
	}
	else
	{
		#if defined TextDrawGetString
			TextDrawGetString(textid, TDFX_Text[slot], TDFX_MAX_TEXT);
		#else
			TDFX_Text[slot][0] = 0;
		#endif
	}

	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}


stock Spin3DTextDraw(Text:textid, Float:speedX = 0.0, Float:speedY = 0.0, Float:speedZ = 45.0, Float:zoom = 1.0, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPreviewRot
		#pragma unused textid, speedX, speedY, speedZ, zoom, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new font = 0;
		#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid)) font = TDFX_GInfo[_:textid] & 7;
		#endif
		#if defined TextDrawGetFont
			font = _:TextDrawGetFont(textid);
		#endif
		if (font != 5) return 0;

		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:curRotX = 0.0, Float:curRotY = 0.0, Float:curRotZ = 0.0, Float:dummyZoom = 1.0;
		#if defined TextDrawGetPreviewRot
			TextDrawGetPreviewRot(textid, curRotX, curRotY, curRotZ, dummyZoom);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_SPIN3D;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = curRotX;
		TDFX_FloatB[slot] = curRotY;
		TDFX_FloatC[slot] = curRotZ;
		TDFX_FloatD[slot] = zoom;
		TDFX_BoundMinX[slot] = speedX;
		TDFX_BoundMinY[slot] = speedY;
		TDFX_BoundMaxX[slot] = speedZ;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock Hover3DTextDraw(Text:textid, Float:tiltX = 8.0, Float:tiltZ = 12.0, Float:zoomAmp = 0.06, speedMs = 2400, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPreviewRot
		#pragma unused textid, tiltX, tiltZ, zoomAmp, speedMs, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new font = 0;
		#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid)) font = TDFX_GInfo[_:textid] & 7;
		#endif
		#if defined TextDrawGetFont
			font = _:TextDrawGetFont(textid);
		#endif
		if (font != 5) return 0;

		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:curRotX = 0.0, Float:curRotY = 0.0, Float:curRotZ = 0.0, Float:baseZoom = 1.0;
		#if defined TextDrawGetPreviewRot
			TextDrawGetPreviewRot(textid, curRotX, curRotY, curRotZ, baseZoom);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_HOVER3D;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_Count[slot] = speedMs;
		TDFX_FloatA[slot] = curRotX;
		TDFX_FloatB[slot] = curRotY;
		TDFX_FloatC[slot] = curRotZ;
		TDFX_FloatD[slot] = baseZoom;
		TDFX_BoundMinX[slot] = tiltX;
		TDFX_BoundMinY[slot] = tiltZ;
		TDFX_BoundMaxX[slot] = zoomAmp;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock ShimmerTextDraw(Text:textid, const text[], const baseTag[] = "~y~", const shimmerTag[] = "~w~", sweepDuration = 1000, pauseDuration = 1500, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new font = 0;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) font = TDFX_GInfo[_:textid] & 7;
	#endif
	#if defined TextDrawGetFont
		font = _:TextDrawGetFont(textid);
	#endif
	if (font == 4 || font == 5) return 0;

	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_SHIMMER;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
	strmid(TDFX_Prefix[slot], baseTag, 0, strlen(baseTag), sizeof TDFX_Prefix[]);
	strmid(TDFX_Suffix[slot], shimmerTag, 0, strlen(shimmerTag), sizeof TDFX_Suffix[]);
	TDFX_Step[slot] = sweepDuration;
	TDFX_Count[slot] = pauseDuration;
	TDFX_Easing[slot] = -999;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock RainbowTextDraw(Text:textid, const text[], speedMs = 100, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new font = 0;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) font = TDFX_GInfo[_:textid] & 7;
	#endif
	#if defined TextDrawGetFont
		font = _:TextDrawGetFont(textid);
	#endif
	if (font == 4 || font == 5) return 0;

	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_RAINBOW;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = duration;
	strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
	TDFX_Step[slot] = speedMs;
	TDFX_Easing[slot] = -1;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = (duration == 0 || loop);
	TDFX_Start[slot] = GetTickCount();

	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock SlotMachineTextDraw(Text:textid, const finalText[], spinDuration = 2200, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:textid == 0xFFFF || _:textid < 0) return 0;
	new font = 0;
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) font = TDFX_GInfo[_:textid] & 7;
	#endif
	#if defined TextDrawGetFont
		font = _:TextDrawGetFont(textid);
	#endif
	if (font == 4 || font == 5) return 0;

	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_SLOT;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:textid;
	TDFX_Duration[slot] = spinDuration;
	strmid(TDFX_Text[slot], finalText, 0, strlen(finalText), sizeof TDFX_Text[]);
	TDFX_Step[slot] = 0;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = false;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	_TDFX_UpdateGlobalTD(textid);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock PendulumTextDraw(Text:textid, Float:pivotX, Float:pivotY, Float:armLength = 80.0, Float:maxAngle = 40.0, Float:damping = 0.65, duration = 3500, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, pivotX, pivotY, armLength, maxAngle, damping, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_PENDULUM;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = pivotX;
		TDFX_FloatB[slot] = pivotY;
		TDFX_FloatC[slot] = armLength;
		TDFX_FloatD[slot] = maxAngle;
		TDFX_BoundMinX[slot] = damping;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock GravityDropTextDraw(Text:textid, Float:startY, Float:targetY, Float:elasticity = 0.38, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, startY, targetY, elasticity, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:curX = 0.0, Float:dummyY = 0.0;
		TDFX_GetGlobalPos(textid, curX, dummyY);

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_SLAM;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = 4000;
		TDFX_FloatA[slot] = curX;
		TDFX_FloatB[slot] = startY;
		TDFX_FloatC[slot] = targetY;
		TDFX_FloatD[slot] = 0.0;
		TDFX_BoundMinX[slot] = elasticity;
		TDFX_BoundMinY[slot] = startY;
		TDFX_Step[slot] = 0;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TextDrawSetPos(textid, curX, startY);
		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock VortexTextDraw(Text:textid, Float:centerX, Float:centerY, Float:startRadius = 120.0, Float:spins = 2.5, duration = 2000, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, centerX, centerY, startRadius, spins, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:baseX = 0.40, Float:baseY = 1.60;
		#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid) && TDFX_GRemSizeX[_:textid] > 0.0)
			{
				baseX = TDFX_GRemSizeX[_:textid];
				baseY = TDFX_GRemSizeY[_:textid];
			}
		#endif
		#if defined TextDrawGetLetterSize
			TextDrawGetLetterSize(textid, baseX, baseY);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_VORTEX;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = centerX;
		TDFX_FloatB[slot] = centerY;
		TDFX_FloatC[slot] = startRadius;
		TDFX_FloatD[slot] = spins * 360.0;
		TDFX_BoundMinX[slot] = baseX;
		TDFX_BoundMinY[slot] = baseY;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = true;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock LetterboxTextDraw(Text:topBarTD, Text:bottomBarTD, Float:barHeight = 65.0, duration = 1200, bool:reverse = false, easing = TDFX_EASE_OUT_QUAD, bool:loop = false, extra_id = 0, const callback[] = "")
{
	if (_:topBarTD == 0xFFFF || _:topBarTD < 0) return 0;
	new slot = TDFX_FindGlobal(topBarTD);
	if (slot != -1) TDFX_Free(slot, false);
	else
	{
		slot = TDFX_Alloc();
		if (slot == -1) return 0;
	}

	TextDrawUseBox(topBarTD, true);
	new Float:topLetY = barHeight / 9.5;
	TextDrawLetterSize(topBarTD, 0.0, topLetY);

	if (_:bottomBarTD != 0xFFFF && _:bottomBarTD >= 0)
	{
		TextDrawUseBox(bottomBarTD, true);
		new Float:botLetY = (barHeight + TDFX_LETTERBOX_ASCENT_OFFSET) / 9.5;
		TextDrawLetterSize(bottomBarTD, 0.0, botLetY);
	}

	TDFX_Used[slot] = true;
	TDFX_IsGlobal[slot] = true;
	TDFX_Type[slot] = TDFX_TYPE_LETTERBOX;
	TDFX_Player[slot] = INVALID_PLAYER_ID;
	TDFX_Td[slot] = _:topBarTD;
	TDFX_Duration[slot] = duration;
	TDFX_FloatA[slot] = barHeight;
	TDFX_Step[slot] = _:bottomBarTD;
	TDFX_Easing[slot] = easing;
	TDFX_ExtraId[slot] = extra_id;
	strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
	TDFX_AutoHide[slot] = reverse;
	TDFX_AutoDestroy[slot] = false;
	TDFX_Loop[slot] = loop;
	TDFX_Start[slot] = GetTickCount();

	_TDFX_UpdateGlobalTD(topBarTD);
	if (_:bottomBarTD != 0xFFFF && _:bottomBarTD >= 0) _TDFX_UpdateGlobalTD(bottomBarTD);
	TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
	return 1;
}

stock SonarPingTextDraw(Text:textid, Float:centerX, Float:centerY, Float:maxRadius = 140.0, pulseCount = 3, pulseDuration = 1200, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if !defined TextDrawSetPos
		#pragma unused textid, centerX, centerY, maxRadius, pulseCount, pulseDuration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new baseCol = 0x2ECC71FF;
		#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid) && TDFX_GRemText[_:textid])
				baseCol = TDFX_GRemText[_:textid];
		#endif

		new Float:baseX = 0.42, Float:baseY = 1.70;
		#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid) && TDFX_GRemSizeX[_:textid] > 0.0)
			{
				baseX = TDFX_GRemSizeX[_:textid];
				baseY = TDFX_GRemSizeY[_:textid];
			}
		#endif
		#if defined TextDrawGetLetterSize
			TextDrawGetLetterSize(textid, baseX, baseY);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_SONAR;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = pulseCount * pulseDuration;
		TDFX_FloatA[slot] = centerX;
		TDFX_FloatB[slot] = centerY;
		TDFX_FloatC[slot] = maxRadius;
		TDFX_BoundMinX[slot] = baseX;
		TDFX_BoundMinY[slot] = baseY;
		TDFX_Step[slot] = pulseDuration;
		TDFX_Base[slot] = baseCol;
		TDFX_Easing[slot] = -1;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = true;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock WaveSweepTextDraw(Text:textid, const text[], const crestTag[] = "~w~", const baseTag[] = "~b~", crestWidth = 2, direction = TDFX_DIR_LEFT_TO_RIGHT, speedMs = 70, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if TDFX_MAX_GLOBAL_TD <= 0
		#pragma unused textid, text, crestTag, baseTag, crestWidth, direction, speedMs, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_WAVESWEEP;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		strmid(TDFX_Prefix[slot], crestTag, 0, strlen(crestTag), sizeof TDFX_Prefix[]);
		strmid(TDFX_Suffix[slot], baseTag, 0, strlen(baseTag), sizeof TDFX_Suffix[]);
		TDFX_BoundMinX[slot] = float(crestWidth);
		TDFX_BoundMinY[slot] = float(direction);
		TDFX_Step[slot] = speedMs;
		TDFX_Base[slot] = -999;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock LetterRainTextDraw(Text:textid, const text[], Float:targetX, Float:targetY, Float:letterSpacing = 0.0, duration = 3000, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if TDFX_MAX_GLOBAL_TD <= 0 || !defined TextDrawSetPos
		#pragma unused textid, text, targetX, targetY, letterSpacing, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new instIdx = TDFX_AllocCharInstance();
		if (instIdx == -1) { TDFX_Free(slot, false); return 0; }

		TDFX_CharIsGlobal[instIdx] = true;
		TDFX_CharPlayer[instIdx] = INVALID_PLAYER_ID;
		TDFX_CharTargetY[instIdx] = targetY;

		new glyphChars[TDFX_MAX_CHAR_PARTS + 1];
		new glyphTags[TDFX_MAX_CHAR_PARTS][16];
		new rawLen = _TDFX_ParseGlyphs(text, glyphChars, glyphTags, TDFX_MAX_CHAR_PARTS);
		TDFX_CharCount[instIdx] = rawLen;

		new font = 1;
		new Float:lsX = 0.45, Float:lsY = 1.80;
		new textCol = 0xFFFFFFFF;
		#if defined TextDrawGetFont
			font = _:TextDrawGetFont(textid);
		#else
			if (TDFX_ValidGlobal(textid)) font = (TDFX_GInfo[_:textid] & 7);
		#endif
		#if defined TextDrawGetLetterSize
			TextDrawGetLetterSize(textid, lsX, lsY);
		#else
			if (TDFX_ValidGlobal(textid) && TDFX_GRemLetX[_:textid] > 0.0)
			{
				lsX = TDFX_GRemLetX[_:textid];
				lsY = TDFX_GRemLetY[_:textid];
			}
		#endif
		#if defined _TDFX_TDGetColour
			textCol = _TDFX_TDGetColour(textid);
		#else
			if (TDFX_ValidGlobal(textid) && TDFX_GRemText[_:textid] != 0)
			{
				textCol = TDFX_GRemText[_:textid];
			}
		#endif

		new gAlign = 2;
		#if defined TextDrawGetAlignment
			gAlign = _:TextDrawGetAlignment(textid);
		#else
			#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid) && TDFX_GRemAlign[_:textid] != 0)
			{
				gAlign = TDFX_GRemAlign[_:textid];
			}
			#endif
		#endif
		new outline = 1;
		#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid) && (TDFX_GInfo[_:textid] & (1 << 8)))
		{
			outline = (TDFX_GInfo[_:textid] >> 4) & 0x0F;
		}
		#endif
		#if defined TextDrawGetOutline
			outline = TextDrawGetOutline(textid);
		#endif
		_TDFX_LayoutChars(glyphChars, rawLen, font, lsX, targetX, letterSpacing, TDFX_CharTargetX[instIdx], gAlign, outline);

		for (new p = 0; p < rawLen; p++)
		{
			TDFX_CharDelay[instIdx][p] = p * 80 + random(60);
			TDFX_CharState[instIdx][p] = false;

			new charStr[24];
			format(charStr, sizeof(charStr), "%s%c", glyphTags[p], glyphChars[p]);

			new Text:rgtd = TextDrawCreate(TDFX_CharTargetX[instIdx][p], -25.0, charStr);
			if (_:rgtd == 0xFFFF || _:rgtd < 0)
			{
				for (new k = 0; k < p; k++)
				{
					if (TDFX_GCharParts[instIdx][k] != Text:INVALID_TEXT_DRAW)
					{
						TextDrawDestroy(TDFX_GCharParts[instIdx][k]);
						TDFX_GCharParts[instIdx][k] = Text:INVALID_TEXT_DRAW;
					}
				}
				TDFX_FreeCharInstance(instIdx);
				TDFX_Free(slot, false);
				return 0;
			}
			#if defined _INC_open_mp
			TextDrawAlignment(rgtd, TEXT_DRAW_ALIGN_CENTER);
			TextDrawFont(rgtd, t_TEXT_DRAW_FONT:font);
			#else
			TextDrawAlignment(rgtd, 2);
			TextDrawFont(rgtd, font);
			#endif
			TextDrawLetterSize(rgtd, lsX, lsY);
			_TDFX_TDColour(rgtd, textCol);
			TextDrawSetOutline(rgtd, outline);
			TDFX_GCharParts[instIdx][p] = rgtd;
		}

		new bool:hasBox = false;
		if (TDFX_ValidGlobal(textid))
		{
			hasBox = bool:(TDFX_GInfo[_:textid] & (1 << 3));
		}
		if (hasBox)
		{
			_TDFX_TDColour(textid, (textCol & 0xFFFFFF00));
			TextDrawSetString(textid, " ");
			_TDFX_UpdateGlobalTD(textid);
		}
		else
		{
			TextDrawHideForAll(textid);
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_LETTERRAIN;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Base[slot] = textCol;
		TDFX_Duration[slot] = duration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_Step[slot] = instIdx;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock ScannerSweepTextDraw(Text:textid, const text[], const laserTag[] = "~r~", const trailTag[] = "~y~", speedMs = 60, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if TDFX_MAX_GLOBAL_TD <= 0
		#pragma unused textid, text, laserTag, trailTag, bgTag, speedMs, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_SCANNER;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		strmid(TDFX_Prefix[slot], laserTag, 0, strlen(laserTag), sizeof TDFX_Prefix[]);
		strmid(TDFX_Suffix[slot], trailTag, 0, strlen(trailTag), sizeof TDFX_Suffix[]);
		TDFX_Step[slot] = speedMs;
		TDFX_Easing[slot] = -1;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock ElectricArcTextDraw(Text:textid, const text[], surgeDuration = 2200, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if TDFX_MAX_GLOBAL_TD <= 0 || !defined TextDrawSetPos
		#pragma unused textid, text, surgeDuration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:baseX = 320.0, Float:baseY = 365.0;
		#if defined TextDrawGetPos
			TextDrawGetPos(textid, baseX, baseY);
		#endif
		new baseCol = 0xFFFFFFFF;
		#if defined _TDFX_TDGetColour
			baseCol = _TDFX_TDGetColour(textid);
		#endif

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_ELECTRIC;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = surgeDuration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_FloatA[slot] = baseX;
		TDFX_FloatB[slot] = baseY;
		TDFX_Base[slot] = baseCol;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock SplitFlapTextDraw(Text:textid, const targetText[], charRollMs = 80, lockIntervalMs = 200, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if TDFX_MAX_GLOBAL_TD <= 0
		#pragma unused textid, targetText, charRollMs, lockIntervalMs, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_SPLITFLAP;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		strmid(TDFX_Text[slot], targetText, 0, strlen(targetText), sizeof TDFX_Text[]);
		TDFX_FloatA[slot] = float(charRollMs);
		TDFX_FloatB[slot] = float(lockIntervalMs);
		TDFX_Easing[slot] = -1;
		TDFX_Duration[slot] = (strlen(targetText) * lockIntervalMs) + 600;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock HologramTextDraw(Text:textid, const text[], duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if TDFX_MAX_GLOBAL_TD <= 0 || !defined TextDrawSetPos
		#pragma unused textid, text, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new Float:baseX = 320.0, Float:baseY = 365.0;
		#if defined TextDrawGetPos
			TextDrawGetPos(textid, baseX, baseY);
		#endif
		new baseCol = 0x00FFFFFF;

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_HOLOGRAM;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_FloatA[slot] = baseX;
		TDFX_FloatB[slot] = baseY;
		TDFX_Base[slot] = baseCol;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = (duration == 0 || loop);
		TDFX_Start[slot] = GetTickCount();

		TextDrawSetString(textid, text);
		_TDFX_UpdateGlobalTD(textid);
		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock ShockwaveSlamTextDraw(Text:textid, Float:centerX, Float:centerY, duration = 1800, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if TDFX_MAX_GLOBAL_TD <= 0 || !defined TextDrawSetPos
		#pragma unused textid, centerX, centerY, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		if (TDFX_GetFreeGlobalTDCount() < TDFX_FW_PARTICLES)
		{
			printf("[TextDrawFX] Warning: Server lacks free Global TextDraws (%d available, %d required) for ShockwaveSlam.", TDFX_GetFreeGlobalTDCount(), TDFX_FW_PARTICLES);
			return 0;
		}
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new fwIdx = TDFX_AllocFwInstance();
		if (fwIdx != -1)
		{
			TDFX_FwIsGlobal[fwIdx] = true;
			TDFX_FwPlayer[fwIdx] = INVALID_PLAYER_ID;
		}

		new Float:baseX = 0.50, Float:baseY = 2.0;
		#if defined TextDrawGetLetterSize
			TextDrawGetLetterSize(textid, baseX, baseY);
		#else
			if (TDFX_ValidGlobal(textid) && TDFX_GRemLetX[_:textid] > 0.0)
			{
				baseX = TDFX_GRemLetX[_:textid];
				baseY = TDFX_GRemLetY[_:textid];
			}
		#endif

		new bool:hasBox = false;
		if (TDFX_ValidGlobal(textid))
		{
			hasBox = bool:(TDFX_GInfo[_:textid] & (1 << 3));
		}
		TDFX_FadeBox[slot] = hasBox;

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_SHOCKWAVE;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Duration[slot] = duration;
		TDFX_FloatA[slot] = centerX;
		TDFX_FloatB[slot] = centerY;
		TDFX_BoundMinX[slot] = baseX;
		TDFX_BoundMinY[slot] = baseY;
		TDFX_Step[slot] = fwIdx;
		TDFX_Easing[slot] = 0;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock WaveMotionTextDraw(Text:textid, const text[], Float:centerX, Float:centerY, Float:crestHeight = 14.0, Float:crestWidth = 2.5, direction = TDFX_DIR_LEFT_TO_RIGHT, duration = 2800, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if TDFX_MAX_GLOBAL_TD <= 0 || !defined TextDrawSetPos
		#pragma unused textid, text, centerX, centerY, crestHeight, crestWidth, direction, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new instIdx = TDFX_AllocCharInstance();
		if (instIdx == -1) { TDFX_Free(slot, false); return 0; }

		TDFX_CharIsGlobal[instIdx] = true;
		TDFX_CharPlayer[instIdx] = INVALID_PLAYER_ID;
		TDFX_CharTargetY[instIdx] = centerY;

		new glyphChars[TDFX_MAX_CHAR_PARTS + 1];
		new glyphTags[TDFX_MAX_CHAR_PARTS][16];
		new rawLen = _TDFX_ParseGlyphs(text, glyphChars, glyphTags, TDFX_MAX_CHAR_PARTS);
		TDFX_CharCount[instIdx] = rawLen;

		new font = 1;
		new Float:lsX = 0.45, Float:lsY = 1.80;
		new textCol = 0xFFFFFFFF;
		#if defined TextDrawGetFont
			font = _:TextDrawGetFont(textid);
		#else
			if (TDFX_ValidGlobal(textid)) font = (TDFX_GInfo[_:textid] & 7);
		#endif
		#if defined TextDrawGetLetterSize
			TextDrawGetLetterSize(textid, lsX, lsY);
		#else
			if (TDFX_ValidGlobal(textid) && TDFX_GRemLetX[_:textid] > 0.0)
			{
				lsX = TDFX_GRemLetX[_:textid];
				lsY = TDFX_GRemLetY[_:textid];
			}
		#endif
		#if defined _TDFX_TDGetColour
			textCol = _TDFX_TDGetColour(textid);
		#else
			if (TDFX_ValidGlobal(textid) && TDFX_GRemText[_:textid] != 0)
			{
				textCol = TDFX_GRemText[_:textid];
			}
		#endif

		new gAlign = 2;
		#if defined TextDrawGetAlignment
			gAlign = _:TextDrawGetAlignment(textid);
		#else
			#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid) && TDFX_GRemAlign[_:textid] != 0)
			{
				gAlign = TDFX_GRemAlign[_:textid];
			}
			#endif
		#endif
		new outline = 1;
		#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid) && (TDFX_GInfo[_:textid] & (1 << 8)))
		{
			outline = (TDFX_GInfo[_:textid] >> 4) & 0x0F;
		}
		#endif
		#if defined TextDrawGetOutline
			outline = TextDrawGetOutline(textid);
		#endif
		_TDFX_LayoutChars(glyphChars, rawLen, font, lsX, centerX, 0.0, TDFX_CharTargetX[instIdx], gAlign, outline);

		for (new p = 0; p < rawLen; p++)
		{
			new charStr[24];
			format(charStr, sizeof(charStr), "%s%c", glyphTags[p], glyphChars[p]);

			new Text:wgtd = TextDrawCreate(TDFX_CharTargetX[instIdx][p], centerY, charStr);
			if (_:wgtd == 0xFFFF || _:wgtd < 0)
			{
				for (new k = 0; k < p; k++)
				{
					if (TDFX_GCharParts[instIdx][k] != Text:INVALID_TEXT_DRAW)
					{
						TextDrawDestroy(TDFX_GCharParts[instIdx][k]);
						TDFX_GCharParts[instIdx][k] = Text:INVALID_TEXT_DRAW;
					}
				}
				TDFX_FreeCharInstance(instIdx);
				TDFX_Free(slot, false);
				return 0;
			}
			#if defined _INC_open_mp
			TextDrawAlignment(wgtd, TEXT_DRAW_ALIGN_CENTER);
			TextDrawFont(wgtd, t_TEXT_DRAW_FONT:font);
			#else
			TextDrawAlignment(wgtd, 2);
			TextDrawFont(wgtd, font);
			#endif
			TextDrawLetterSize(wgtd, lsX, lsY);
			_TDFX_TDColour(wgtd, textCol);
			TextDrawSetOutline(wgtd, outline);
			_TDFX_UpdateGlobalChildTD(wgtd, textid);
			TDFX_GCharParts[instIdx][p] = wgtd;
		}

		new bool:hasBox = false;
		if (TDFX_ValidGlobal(textid))
		{
			hasBox = bool:(TDFX_GInfo[_:textid] & (1 << 3));
		}
		if (hasBox)
		{
			_TDFX_TDColour(textid, (textCol & 0xFFFFFF00));
			TextDrawSetString(textid, " ");
			_TDFX_UpdateGlobalTD(textid);
		}
		else
		{
			TextDrawHideForAll(textid);
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_WAVEMOTION;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Base[slot] = textCol;
		TDFX_FloatA[slot] = crestHeight;
		TDFX_FloatB[slot] = crestWidth;
		TDFX_Easing[slot] = direction;
		TDFX_Duration[slot] = duration;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_Step[slot] = instIdx;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock HopLetterTextDraw(Text:textid, const text[], Float:centerX, Float:centerY, Float:hopHeight = 16.0, staggerMs = 90, hopDurationMs = 350, direction = TDFX_DIR_LEFT_TO_RIGHT, duration = 0, bool:loop = false, extra_id = 0, const callback[] = "")
{
	#if TDFX_MAX_GLOBAL_TD <= 0 || !defined TextDrawSetPos
		#pragma unused textid, text, centerX, centerY, hopHeight, staggerMs, hopDurationMs, direction, duration, loop, extra_id, callback
		return 0;
	#else
		if (_:textid == 0xFFFF || _:textid < 0) return 0;
		new slot = TDFX_FindGlobal(textid);
		if (slot != -1) TDFX_Free(slot, false);
		else
		{
			slot = TDFX_Alloc();
			if (slot == -1) return 0;
		}

		new instIdx = TDFX_AllocCharInstance();
		if (instIdx == -1) { TDFX_Free(slot, false); return 0; }

		TDFX_CharIsGlobal[instIdx] = true;
		TDFX_CharPlayer[instIdx] = INVALID_PLAYER_ID;
		TDFX_CharTargetY[instIdx] = centerY;

		new glyphChars[TDFX_MAX_CHAR_PARTS + 1];
		new glyphTags[TDFX_MAX_CHAR_PARTS][16];
		new rawLen = _TDFX_ParseGlyphs(text, glyphChars, glyphTags, TDFX_MAX_CHAR_PARTS);
		TDFX_CharCount[instIdx] = rawLen;

		new font = 1;
		new Float:lsX = 0.45, Float:lsY = 1.80;
		new textCol = 0xFFFFFFFF;
		#if defined TextDrawGetFont
			font = _:TextDrawGetFont(textid);
		#else
			if (TDFX_ValidGlobal(textid)) font = (TDFX_GInfo[_:textid] & 7);
		#endif
		#if defined TextDrawGetLetterSize
			TextDrawGetLetterSize(textid, lsX, lsY);
		#else
			if (TDFX_ValidGlobal(textid) && TDFX_GRemLetX[_:textid] > 0.0)
			{
				lsX = TDFX_GRemLetX[_:textid];
				lsY = TDFX_GRemLetY[_:textid];
			}
		#endif
		#if defined _TDFX_TDGetColour
			textCol = _TDFX_TDGetColour(textid);
		#else
			if (TDFX_ValidGlobal(textid) && TDFX_GRemText[_:textid] != 0)
			{
				textCol = TDFX_GRemText[_:textid];
			}
		#endif

		new gAlign = 2;
		#if defined TextDrawGetAlignment
			gAlign = _:TextDrawGetAlignment(textid);
		#else
			#if TDFX_MAX_GLOBAL_TD > 0
			if (TDFX_ValidGlobal(textid) && TDFX_GRemAlign[_:textid] != 0)
			{
				gAlign = TDFX_GRemAlign[_:textid];
			}
			#endif
		#endif
		new outline = 1;
		#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid) && (TDFX_GInfo[_:textid] & (1 << 8)))
		{
			outline = (TDFX_GInfo[_:textid] >> 4) & 0x0F;
		}
		#endif
		#if defined TextDrawGetOutline
			outline = TextDrawGetOutline(textid);
		#endif
		_TDFX_LayoutChars(glyphChars, rawLen, font, lsX, centerX, 0.0, TDFX_CharTargetX[instIdx], gAlign, outline);

		for (new p = 0; p < rawLen; p++)
		{
			new pIdx = (direction == TDFX_DIR_LEFT_TO_RIGHT) ? p : (rawLen - 1 - p);
			TDFX_CharDelay[instIdx][pIdx] = p * staggerMs;

			new charStr[24];
			format(charStr, sizeof(charStr), "%s%c", glyphTags[pIdx], glyphChars[pIdx]);

			new Text:hgtd = TextDrawCreate(TDFX_CharTargetX[instIdx][pIdx], centerY, charStr);
			if (_:hgtd == 0xFFFF || _:hgtd < 0)
			{
				for (new k = 0; k < p; k++)
				{
					new prevIdx = (direction == TDFX_DIR_RIGHT_TO_LEFT) ? (rawLen - 1 - k) : k;
					if (TDFX_GCharParts[instIdx][prevIdx] != Text:INVALID_TEXT_DRAW)
					{
						TextDrawDestroy(TDFX_GCharParts[instIdx][prevIdx]);
						TDFX_GCharParts[instIdx][prevIdx] = Text:INVALID_TEXT_DRAW;
					}
				}
				TDFX_FreeCharInstance(instIdx);
				TDFX_Free(slot, false);
				return 0;
			}
			#if defined _INC_open_mp
			TextDrawAlignment(hgtd, TEXT_DRAW_ALIGN_CENTER);
			TextDrawFont(hgtd, t_TEXT_DRAW_FONT:font);
			#else
			TextDrawAlignment(hgtd, 2);
			TextDrawFont(hgtd, font);
			#endif
			TextDrawLetterSize(hgtd, lsX, lsY);
			_TDFX_TDColour(hgtd, textCol);
			TextDrawSetOutline(hgtd, outline);
			_TDFX_UpdateGlobalChildTD(hgtd, textid);
			TDFX_GCharParts[instIdx][pIdx] = hgtd;
		}

		new bool:hasBox = false;
		if (TDFX_ValidGlobal(textid))
		{
			hasBox = bool:(TDFX_GInfo[_:textid] & (1 << 3));
		}
		if (hasBox)
		{
			_TDFX_TDColour(textid, (textCol & 0xFFFFFF00));
			TextDrawSetString(textid, " ");
			_TDFX_UpdateGlobalTD(textid);
		}
		else
		{
			TextDrawHideForAll(textid);
		}

		new totalDur = duration;
		if (totalDur <= 0)
		{
			if (direction == TDFX_DIR_BOUNCE)
			{
				totalDur = ((rawLen - 1) * staggerMs * 2) + hopDurationMs + 100;
			}
			else
			{
				totalDur = (rawLen - 1) * staggerMs + hopDurationMs + 100;
			}
		}

		TDFX_Used[slot] = true;
		TDFX_IsGlobal[slot] = true;
		TDFX_Type[slot] = TDFX_TYPE_HOPLETTER;
		TDFX_Player[slot] = INVALID_PLAYER_ID;
		TDFX_Td[slot] = _:textid;
		TDFX_Base[slot] = textCol;
		TDFX_FloatA[slot] = hopHeight;
		TDFX_FloatB[slot] = float(staggerMs);
		TDFX_Easing[slot] = direction;
		TDFX_Count[slot] = hopDurationMs;
		TDFX_Duration[slot] = totalDur;
		strmid(TDFX_Text[slot], text, 0, strlen(text), sizeof TDFX_Text[]);
		TDFX_Step[slot] = instIdx;
		TDFX_ExtraId[slot] = extra_id;
		strmid(TDFX_Callback[slot], callback, 0, strlen(callback), 32);
		TDFX_AutoHide[slot] = false;
		TDFX_AutoDestroy[slot] = false;
		TDFX_Loop[slot] = loop;
		TDFX_Start[slot] = GetTickCount();

		TDFX_Timer[slot] = SetTimerEx("TDFX_Tick", TDFX_FRAME_INTERVAL, true, "i", slot);
		return 1;
	#endif
}

stock StopTextDrawFX(Text:textid)
{
	new slot = TDFX_FindGlobal(textid);
	if (slot == -1) return 0;
	TDFX_Free(slot, true);
	return 1;
}

stock bool:IsTextDrawFXActive(Text:textid)
{
	return TDFX_FindGlobal(textid) != -1;
}

// -----------------------------------------------------------------------------
// Intercepted Lifecycle & Styling Hooks (ALS)
// -----------------------------------------------------------------------------

stock PlayerText:TDFX_CreatePlayerTextDraw(playerid, Float:x, Float:y, const text[])
{
	new PlayerText:td = CreatePlayerTextDraw(playerid, x, y, text);
	if (TDFX_ValidPlayer(playerid, td))
	{
		TDFX_RemPosX[playerid][_:td] = x;
		TDFX_RemPosY[playerid][_:td] = y;
	}
	return td;
}
#if defined _ALS_CreatePlayerTextDraw
	#undef CreatePlayerTextDraw
#else
	#define _ALS_CreatePlayerTextDraw
#endif
#define CreatePlayerTextDraw TDFX_CreatePlayerTextDraw

#if defined PlayerTextDrawSetPos
stock TDFX_PlayerTextDrawSetPos(playerid, PlayerText:textid, Float:x, Float:y)
{
	if (TDFX_ValidPlayer(playerid, textid))
	{
		TDFX_RemPosX[playerid][_:textid] = x;
		TDFX_RemPosY[playerid][_:textid] = y;
	}
	return PlayerTextDrawSetPos(playerid, textid, x, y);
}
#if defined _ALS_PlayerTextDrawSetPos
	#undef PlayerTextDrawSetPos
#else
	#define _ALS_PlayerTextDrawSetPos
#endif
#define PlayerTextDrawSetPos TDFX_PlayerTextDrawSetPos
#endif

stock TDFX_PlayerTextDrawTextSize(playerid, PlayerText:textid, Float:x, Float:y)
{
	if (TDFX_ValidPlayer(playerid, textid))
	{
		TDFX_RemSizeX[playerid][_:textid] = x;
		TDFX_RemSizeY[playerid][_:textid] = y;
	}
	return PlayerTextDrawTextSize(playerid, textid, x, y);
}
#if defined _ALS_PlayerTextDrawTextSize
	#undef PlayerTextDrawTextSize
#else
	#define _ALS_PlayerTextDrawTextSize
#endif
#define PlayerTextDrawTextSize TDFX_PlayerTextDrawTextSize

stock Text:TDFX_TextDrawCreate(Float:x, Float:y, const text[])
{
	new Text:td = TextDrawCreate(x, y, text);
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(td))
		{
			TDFX_GRemPosX[_:td] = x;
			TDFX_GRemPosY[_:td] = y;
		}
	#endif
	return td;
}
#if defined _ALS_TextDrawCreate
	#undef TextDrawCreate
#else
	#define _ALS_TextDrawCreate
#endif
#define TextDrawCreate TDFX_TextDrawCreate

#if defined TextDrawSetPos
stock TDFX_TextDrawSetPos(Text:textid, Float:x, Float:y)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid))
		{
			TDFX_GRemPosX[_:textid] = x;
			TDFX_GRemPosY[_:textid] = y;
		}
	#endif
	return TextDrawSetPos(textid, x, y);
}
#if defined _ALS_TextDrawSetPos
	#undef TextDrawSetPos
#else
	#define _ALS_TextDrawSetPos
#endif
#define TextDrawSetPos TDFX_TextDrawSetPos
#endif

stock TDFX_TextDrawTextSize(Text:textid, Float:x, Float:y)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid))
		{
			TDFX_GRemSizeX[_:textid] = x;
			TDFX_GRemSizeY[_:textid] = y;
		}
	#endif
	return TextDrawTextSize(textid, x, y);
}
#if defined _ALS_TextDrawTextSize
	#undef TextDrawTextSize
#else
	#define _ALS_TextDrawTextSize
#endif
#define TextDrawTextSize TDFX_TextDrawTextSize

#if defined TextDrawGetAlignment
stock TDFX_TextDrawAlignment(Text:textid, {TEXT_DRAW_ALIGN, _}:alignment)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) TDFX_GRemAlign[_:textid] = _:alignment;
	#endif
	return TextDrawAlignment(textid, TEXT_DRAW_ALIGN:alignment);
}
#else
stock TDFX_TextDrawAlignment(Text:textid, alignment)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) TDFX_GRemAlign[_:textid] = alignment;
	#endif
	return TextDrawAlignment(textid, alignment);
}
#endif
#if defined _ALS_TextDrawAlignment
	#undef TextDrawAlignment
#else
	#define _ALS_TextDrawAlignment
#endif
#define TextDrawAlignment TDFX_TextDrawAlignment

#if TDFX_MAX_GLOBAL_TD > 0
stock TDFX_TextDrawSetOutline(Text:textid, size)
{
	if (TDFX_ValidGlobal(textid))
	{
		new s = (size < 0) ? 0 : ((size > 15) ? 15 : size);
		TDFX_GInfo[_:textid] = (TDFX_GInfo[_:textid] & ~(0x0F << 4)) | (s << 4) | (1 << 8);
	}
	return TextDrawSetOutline(textid, size);
}
#if defined _ALS_TextDrawSetOutline
	#undef TextDrawSetOutline
#else
	#define _ALS_TextDrawSetOutline
#endif
#define TextDrawSetOutline TDFX_TextDrawSetOutline
#endif

stock TDFX_PlayerTextDrawColor(playerid, PlayerText:textid, colour)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_RemText[playerid][_:textid] = colour;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_Colour[slot])
	{
		TDFX_Base[slot] = colour;
		return 1;
	}
	#if defined PlayerTextDrawColour
		return PlayerTextDrawColour(playerid, textid, colour);
	#else
		return PlayerTextDrawColor(playerid, textid, colour);
	#endif
}
#if defined _ALS_PlayerTextDrawColor
	#undef PlayerTextDrawColor
#else
	#define _ALS_PlayerTextDrawColor
#endif
#define PlayerTextDrawColor TDFX_PlayerTextDrawColor

#if defined PlayerTextDrawColour
stock TDFX_PlayerTextDrawColour(playerid, PlayerText:textid, colour)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_RemText[playerid][_:textid] = colour;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_Colour[slot])
	{
		TDFX_Base[slot] = colour;
		return 1;
	}
	return PlayerTextDrawColour(playerid, textid, colour);
}
#if defined _ALS_PlayerTextDrawColour
	#undef PlayerTextDrawColour
#else
	#define _ALS_PlayerTextDrawColour
#endif
#define PlayerTextDrawColour TDFX_PlayerTextDrawColour
#endif

stock TDFX_PlayerTextDrawBoxColor(playerid, PlayerText:textid, colour)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_RemBox[playerid][_:textid] = colour;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_BoxBase[slot])
	{
		TDFX_BoxBase[slot] = colour;
		return 1;
	}
	#if defined PlayerTextDrawBoxColour
		return PlayerTextDrawBoxColour(playerid, textid, colour);
	#else
		return PlayerTextDrawBoxColor(playerid, textid, colour);
	#endif
}
#if defined _ALS_PlayerTextDrawBoxColor
	#undef PlayerTextDrawBoxColor
#else
	#define _ALS_PlayerTextDrawBoxColor
#endif
#define PlayerTextDrawBoxColor TDFX_PlayerTextDrawBoxColor

#if defined PlayerTextDrawBoxColour
stock TDFX_PlayerTextDrawBoxColour(playerid, PlayerText:textid, colour)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_RemBox[playerid][_:textid] = colour;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_BoxBase[slot])
	{
		TDFX_BoxBase[slot] = colour;
		return 1;
	}
	return PlayerTextDrawBoxColour(playerid, textid, colour);
}
#if defined _ALS_PlayerTextDrawBoxColour
	#undef PlayerTextDrawBoxColour
#else
	#define _ALS_PlayerTextDrawBoxColour
#endif
#define PlayerTextDrawBoxColour TDFX_PlayerTextDrawBoxColour
#endif

stock TDFX_PlayerTextDrawBackgroundColor(playerid, PlayerText:textid, colour)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_RemBack[playerid][_:textid] = colour;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_Preview[slot])
	{
		TDFX_Base[slot] = colour;
		return 1;
	}
	#if defined PlayerTextDrawBackgroundColour
		return PlayerTextDrawBackgroundColour(playerid, textid, colour);
	#else
		return PlayerTextDrawBackgroundColor(playerid, textid, colour);
	#endif
}
#if defined _ALS_PlayerTextDrawBackgroundColor
	#undef PlayerTextDrawBackgroundColor
#else
	#define _ALS_PlayerTextDrawBackgroundColor
#endif
#define PlayerTextDrawBackgroundColor TDFX_PlayerTextDrawBackgroundColor

#if defined PlayerTextDrawBackgroundColour
stock TDFX_PlayerTextDrawBackgroundColour(playerid, PlayerText:textid, colour)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_RemBack[playerid][_:textid] = colour;
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_Preview[slot])
	{
		TDFX_Base[slot] = colour;
		return 1;
	}
	return PlayerTextDrawBackgroundColour(playerid, textid, colour);
}
#if defined _ALS_PlayerTextDrawBackgroundColour
	#undef PlayerTextDrawBackgroundColour
#else
	#define _ALS_PlayerTextDrawBackgroundColour
#endif
#define PlayerTextDrawBackgroundColour TDFX_PlayerTextDrawBackgroundColour
#endif

stock TDFX_PlayerTextDrawLetterSize(playerid, PlayerText:textid, Float:x, Float:y)
{
	if (TDFX_ValidPlayer(playerid, textid))
	{
		TDFX_RemLetX[playerid][_:textid] = x;
		TDFX_RemLetY[playerid][_:textid] = y;
	}
	return PlayerTextDrawLetterSize(playerid, textid, x, y);
}
#if defined _ALS_PlayerTextDrawLetterSize
	#undef PlayerTextDrawLetterSize
#else
	#define _ALS_PlayerTextDrawLetterSize
#endif
#define PlayerTextDrawLetterSize TDFX_PlayerTextDrawLetterSize

#if defined PlayerTextDrawGetFont
stock TDFX_PlayerTextDrawFont(playerid, PlayerText:textid, {TEXT_DRAW_FONT, _}:font)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_Info[playerid][_:textid] = (TDFX_Info[playerid][_:textid] & ~7) | (_:font & 7);
	return PlayerTextDrawFont(playerid, textid, TEXT_DRAW_FONT:font);
}
#else
stock TDFX_PlayerTextDrawFont(playerid, PlayerText:textid, font)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_Info[playerid][_:textid] = (TDFX_Info[playerid][_:textid] & ~7) | (_:font & 7);
	return PlayerTextDrawFont(playerid, textid, font);
}
#endif
#if defined _ALS_PlayerTextDrawFont
	#undef PlayerTextDrawFont
#else
	#define _ALS_PlayerTextDrawFont
#endif
#define PlayerTextDrawFont TDFX_PlayerTextDrawFont

#if defined PlayerTextDrawIsBox
stock TDFX_PlayerTextDrawUseBox(playerid, PlayerText:textid, {bool, _}:use)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_Info[playerid][_:textid] = use ? (TDFX_Info[playerid][_:textid] | 8) : (TDFX_Info[playerid][_:textid] & ~8);
	return PlayerTextDrawUseBox(playerid, textid, bool:use);
}
#else
stock TDFX_PlayerTextDrawUseBox(playerid, PlayerText:textid, {bool, _}:use)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_Info[playerid][_:textid] = use ? (TDFX_Info[playerid][_:textid] | 8) : (TDFX_Info[playerid][_:textid] & ~8);
	return PlayerTextDrawUseBox(playerid, textid, use);
}
#endif
#if defined _ALS_PlayerTextDrawUseBox
	#undef PlayerTextDrawUseBox
#else
	#define _ALS_PlayerTextDrawUseBox
#endif
#define PlayerTextDrawUseBox TDFX_PlayerTextDrawUseBox

#if defined PlayerTextDrawGetAlignment
stock TDFX_PlayerTextDrawAlignment(playerid, PlayerText:textid, {TEXT_DRAW_ALIGN, _}:alignment)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_RemAlign[playerid][_:textid] = _:alignment;
	return PlayerTextDrawAlignment(playerid, textid, TEXT_DRAW_ALIGN:alignment);
}
#else
stock TDFX_PlayerTextDrawAlignment(playerid, PlayerText:textid, alignment)
{
	if (TDFX_ValidPlayer(playerid, textid)) TDFX_RemAlign[playerid][_:textid] = alignment;
	return PlayerTextDrawAlignment(playerid, textid, alignment);
}
#endif
#if defined _ALS_PlayerTextDrawAlignment
	#undef PlayerTextDrawAlignment
#else
	#define _ALS_PlayerTextDrawAlignment
#endif
#define PlayerTextDrawAlignment TDFX_PlayerTextDrawAlignment

stock TDFX_PlayerTextDrawSetOutline(playerid, PlayerText:textid, size)
{
	if (TDFX_ValidPlayer(playerid, textid))
	{
		new s = (size < 0) ? 0 : ((size > 15) ? 15 : size);
		TDFX_Info[playerid][_:textid] = (TDFX_Info[playerid][_:textid] & ~(0x0F << 4)) | (s << 4) | (1 << 8);
	}
	return PlayerTextDrawSetOutline(playerid, textid, size);
}
#if defined _ALS_PlayerTextDrawSetOutline
	#undef PlayerTextDrawSetOutline
#else
	#define _ALS_PlayerTextDrawSetOutline
#endif
#define PlayerTextDrawSetOutline TDFX_PlayerTextDrawSetOutline

stock TDFX_PlayerTextDrawSetString(playerid, PlayerText:textid, const string[])
{
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1)
	{
		strmid(TDFX_Text[slot], string, 0, strlen(string), TDFX_MAX_TEXT);
		if (TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_PerChar[slot])
		{
			TDFX_Count[slot] = TDFX_CountChars(TDFX_Text[slot]);
			if (TDFX_Step[slot] > TDFX_Count[slot]) TDFX_Step[slot] = TDFX_Count[slot];
			return 1;
		}
	}
	return PlayerTextDrawSetString(playerid, textid, string);
}

#if TDFX_MAX_GLOBAL_TD > 0
stock TDFX_TextDrawSetString(Text:textid, const string[])
{
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1)
	{
		strmid(TDFX_Text[slot], string, 0, strlen(string), TDFX_MAX_TEXT);
		if (TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_PerChar[slot])
		{
			TDFX_Count[slot] = TDFX_CountChars(TDFX_Text[slot]);
			if (TDFX_Step[slot] > TDFX_Count[slot]) TDFX_Step[slot] = TDFX_Count[slot];
			return 1;
		}
	}
	return TextDrawSetString(textid, string);
}
#if defined _ALS_TextDrawSetString
	#undef TextDrawSetString
#else
	#define _ALS_TextDrawSetString
#endif
#define TextDrawSetString TDFX_TextDrawSetString
#endif
#if defined _ALS_PlayerTextDrawSetString
	#undef PlayerTextDrawSetString
#else
	#define _ALS_PlayerTextDrawSetString
#endif
#define PlayerTextDrawSetString TDFX_PlayerTextDrawSetString

stock TDFX_PlayerTextDrawHide(playerid, PlayerText:textid)
{
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, true, false, true);
	return PlayerTextDrawHide(playerid, textid);
}
#if defined _ALS_PlayerTextDrawHide
	#undef PlayerTextDrawHide
#else
	#define _ALS_PlayerTextDrawHide
#endif
#define PlayerTextDrawHide TDFX_PlayerTextDrawHide

stock TDFX_PlayerTextDrawDestroy(playerid, PlayerText:textid)
{
	new slot = TDFX_FindPlayer(playerid, textid);
	if (slot != -1) TDFX_Free(slot, false);
	if (TDFX_ValidPlayer(playerid, textid))
	{
		TDFX_Info[playerid][_:textid] = 0;
		TDFX_RemText[playerid][_:textid] = 0;
		TDFX_RemBox[playerid][_:textid] = 0;
		TDFX_RemBack[playerid][_:textid] = 0;
		TDFX_RemLetX[playerid][_:textid] = 0.0;
		TDFX_RemLetY[playerid][_:textid] = 0.0;
		TDFX_RemPosX[playerid][_:textid] = 0.0;
		TDFX_RemPosY[playerid][_:textid] = 0.0;
		TDFX_RemSizeX[playerid][_:textid] = 0.0;
		TDFX_RemSizeY[playerid][_:textid] = 0.0;
		TDFX_RemAlign[playerid][_:textid] = 1;
	}
	return PlayerTextDrawDestroy(playerid, textid);
}
#if defined _ALS_PlayerTextDrawDestroy
	#undef PlayerTextDrawDestroy
#else
	#define _ALS_PlayerTextDrawDestroy
#endif
#define PlayerTextDrawDestroy TDFX_PlayerTextDrawDestroy

// Global TextDraw Hooks
stock TDFX_TextDrawColor(Text:textid, colour)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) TDFX_GRemText[_:textid] = colour;
	#endif
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_Colour[slot])
	{
		TDFX_Base[slot] = colour;
		return 1;
	}
	#if defined TextDrawColour
		return TextDrawColour(textid, colour);
	#else
		return TextDrawColor(textid, colour);
	#endif
}
#if defined _ALS_TextDrawColor
	#undef TextDrawColor
#else
	#define _ALS_TextDrawColor
#endif
#define TextDrawColor TDFX_TextDrawColor

#if defined TextDrawColour
stock TDFX_TextDrawColour(Text:textid, colour)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) TDFX_GRemText[_:textid] = colour;
	#endif
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_Colour[slot])
	{
		TDFX_Base[slot] = colour;
		return 1;
	}
	return TextDrawColour(textid, colour);
}
#if defined _ALS_TextDrawColour
	#undef TextDrawColour
#else
	#define _ALS_TextDrawColour
#endif
#define TextDrawColour TDFX_TextDrawColour
#endif

stock TDFX_TextDrawBoxColor(Text:textid, colour)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) TDFX_GRemBox[_:textid] = colour;
	#endif
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_BoxBase[slot])
	{
		TDFX_BoxBase[slot] = colour;
		return 1;
	}
	#if defined TextDrawBoxColour
		return TextDrawBoxColour(textid, colour);
	#else
		return TextDrawBoxColor(textid, colour);
	#endif
}
#if defined _ALS_TextDrawBoxColor
	#undef TextDrawBoxColor
#else
	#define _ALS_TextDrawBoxColor
#endif
#define TextDrawBoxColor TDFX_TextDrawBoxColor

#if defined TextDrawBoxColour
stock TDFX_TextDrawBoxColour(Text:textid, colour)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) TDFX_GRemBox[_:textid] = colour;
	#endif
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1 && TDFX_Type[slot] == TDFX_TYPE_BLINK && TDFX_BoxBase[slot])
	{
		TDFX_BoxBase[slot] = colour;
		return 1;
	}
	return TextDrawBoxColour(textid, colour);
}
#if defined _ALS_TextDrawBoxColour
	#undef TextDrawBoxColour
#else
	#define _ALS_TextDrawBoxColour
#endif
#define TextDrawBoxColour TDFX_TextDrawBoxColour
#endif

stock TDFX_TextDrawBackgroundColor(Text:textid, colour)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) TDFX_GRemBack[_:textid] = colour;
	#endif
	#if defined TextDrawBackgroundColour
		return TextDrawBackgroundColour(textid, colour);
	#else
		return TextDrawBackgroundColor(textid, colour);
	#endif
}
#if defined _ALS_TextDrawBackgroundColor
	#undef TextDrawBackgroundColor
#else
	#define _ALS_TextDrawBackgroundColor
#endif
#define TextDrawBackgroundColor TDFX_TextDrawBackgroundColor

#if defined TextDrawBackgroundColour
stock TDFX_TextDrawBackgroundColour(Text:textid, colour)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid)) TDFX_GRemBack[_:textid] = colour;
	#endif
	return TextDrawBackgroundColour(textid, colour);
}
#if defined _ALS_TextDrawBackgroundColour
	#undef TextDrawBackgroundColour
#else
	#define _ALS_TextDrawBackgroundColour
#endif
#define TextDrawBackgroundColour TDFX_TextDrawBackgroundColour
#endif

stock TDFX_TextDrawLetterSize(Text:textid, Float:x, Float:y)
{
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid))
		{
			TDFX_GRemLetX[_:textid] = x;
			TDFX_GRemLetY[_:textid] = y;
		}
	#endif
	return TextDrawLetterSize(textid, x, y);
}
#if defined _ALS_TextDrawLetterSize
	#undef TextDrawLetterSize
#else
	#define _ALS_TextDrawLetterSize
#endif
#define TextDrawLetterSize TDFX_TextDrawLetterSize

stock TDFX_TextDrawShowForAll(Text:textid)
{
	#if TDFX_MAX_GLOBAL_TD > 0
	if (TDFX_ValidGlobal(textid))
	{
		new tid = _:textid;
		TDFX_GShownState[tid] = TDFX_GSTATE_SHOWN_ALL;
		for (new w = 0; w < TDFX_PLAYER_BITWORDS; w++)
		{
			TDFX_GShownMask[tid][w] = 0xFFFFFFFF;
		}
	}
	#endif
	return TextDrawShowForAll(textid);
}
#if defined _ALS_TextDrawShowForAll
	#undef TextDrawShowForAll
#else
	#define _ALS_TextDrawShowForAll
#endif
#define TextDrawShowForAll TDFX_TextDrawShowForAll

stock TDFX_TextDrawShowForPlayer(playerid, Text:textid)
{
	#if TDFX_MAX_GLOBAL_TD > 0
	if (TDFX_ValidGlobal(textid) && 0 <= playerid < MAX_PLAYERS)
	{
		new tid = _:textid;
		TDFX_GShownState[tid] = TDFX_GSTATE_PER_PLAYER;
		new word = playerid / 32;
		new bit = playerid % 32;
		TDFX_GShownMask[tid][word] |= (1 << bit);
	}
	#endif
	return TextDrawShowForPlayer(playerid, textid);
}
#if defined _ALS_TextDrawShowForPlayer
	#undef TextDrawShowForPlayer
#else
	#define _ALS_TextDrawShowForPlayer
#endif
#define TextDrawShowForPlayer TDFX_TextDrawShowForPlayer

stock TDFX_TextDrawHideForAll(Text:textid)
{
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, true, false, true);
	#if TDFX_MAX_GLOBAL_TD > 0
	if (TDFX_ValidGlobal(textid))
	{
		new tid = _:textid;
		TDFX_GShownState[tid] = TDFX_GSTATE_HIDDEN_ALL;
		for (new w = 0; w < TDFX_PLAYER_BITWORDS; w++)
		{
			TDFX_GShownMask[tid][w] = 0;
		}
	}
	#endif
	return TextDrawHideForAll(textid);
}
#if defined _ALS_TextDrawHideForAll
	#undef TextDrawHideForAll
#else
	#define _ALS_TextDrawHideForAll
#endif
#define TextDrawHideForAll TDFX_TextDrawHideForAll

stock TDFX_TextDrawHideForPlayer(playerid, Text:textid)
{
	#if TDFX_MAX_GLOBAL_TD > 0
	if (TDFX_ValidGlobal(textid) && 0 <= playerid < MAX_PLAYERS)
	{
		new tid = _:textid;
		new word = playerid / 32;
		new bit = playerid % 32;
		if (TDFX_GShownState[tid] == TDFX_GSTATE_SHOWN_ALL)
		{
			for (new w = 0; w < TDFX_PLAYER_BITWORDS; w++)
			{
				TDFX_GShownMask[tid][w] = 0xFFFFFFFF;
			}
			TDFX_GShownState[tid] = TDFX_GSTATE_PER_PLAYER;
		}
		TDFX_GShownMask[tid][word] &= ~(1 << bit);

		new anyLeft = 0;
		for (new w = 0; w < TDFX_PLAYER_BITWORDS; w++)
		{
			if (TDFX_GShownMask[tid][w] != 0)
			{
				anyLeft = 1;
				break;
			}
		}
		if (!anyLeft)
		{
			TDFX_GShownState[tid] = TDFX_GSTATE_HIDDEN_ALL;
		}
	}
	#endif
	return TextDrawHideForPlayer(playerid, textid);
}
#if defined _ALS_TextDrawHideForPlayer
	#undef TextDrawHideForPlayer
#else
	#define _ALS_TextDrawHideForPlayer
#endif
#define TextDrawHideForPlayer TDFX_TextDrawHideForPlayer

stock TDFX_TextDrawDestroy(Text:textid)
{
	new slot = TDFX_FindGlobal(textid);
	if (slot != -1) TDFX_Free(slot, false);
	#if TDFX_MAX_GLOBAL_TD > 0
		if (TDFX_ValidGlobal(textid))
		{
			new tid = _:textid;
			TDFX_GInfo[tid] = 0;
			TDFX_GRemText[tid] = 0;
			TDFX_GRemBox[tid] = 0;
			TDFX_GRemBack[tid] = 0;
			TDFX_GRemLetX[tid] = 0.0;
			TDFX_GRemLetY[tid] = 0.0;
			TDFX_GRemPosX[tid] = 0.0;
			TDFX_GRemPosY[tid] = 0.0;
			TDFX_GRemSizeX[tid] = 0.0;
			TDFX_GRemSizeY[tid] = 0.0;
			TDFX_GRemAlign[tid] = 1;
			TDFX_GShownState[tid] = TDFX_GSTATE_UNTRACKED;
			for (new w = 0; w < TDFX_PLAYER_BITWORDS; w++)
			{
				TDFX_GShownMask[tid][w] = 0;
			}
		}
	#endif
	return TextDrawDestroy(textid);
}
#if defined _ALS_TextDrawDestroy
	#undef TextDrawDestroy
#else
	#define _ALS_TextDrawDestroy
#endif
#define TextDrawDestroy TDFX_TextDrawDestroy

// -----------------------------------------------------------------------------
// Connection & Disconnection Handling
// -----------------------------------------------------------------------------

public OnPlayerDisconnect(playerid, reason)
{
	if (0 <= playerid < MAX_PLAYERS)
	{
		for (new i = 0; i < TDFX_MAX_FX; i++)
		{
			if (TDFX_Used[i] && !TDFX_IsGlobal[i] && TDFX_Player[i] == playerid)
			{
				TDFX_Free(i, false, false);
			}
		}
		for (new t = 0; t < TDFX_MAX_TD; t++)
		{
			TDFX_Info[playerid][t] = 0;
			TDFX_RemText[playerid][t] = 0;
			TDFX_RemBox[playerid][t] = 0;
			TDFX_RemBack[playerid][t] = 0;
			TDFX_RemLetX[playerid][t] = 0.0;
			TDFX_RemLetY[playerid][t] = 0.0;
			TDFX_RemPosX[playerid][t] = 0.0;
			TDFX_RemPosY[playerid][t] = 0.0;
			TDFX_RemSizeX[playerid][t] = 0.0;
			TDFX_RemSizeY[playerid][t] = 0.0;
			TDFX_RemAlign[playerid][t] = 1;
		}
		#if TDFX_MAX_GLOBAL_TD > 0
		new word = playerid / 32;
		new mask = ~(1 << (playerid % 32));
		for (new t = 0; t < TDFX_MAX_GLOBAL_TD; t++)
		{
			TDFX_GShownMask[t][word] &= mask;
		}
		#endif
	}
	#if defined TDFX_OnPlayerDisconnect
		return TDFX_OnPlayerDisconnect(playerid, reason);
	#else
		return 1;
	#endif
}
#if defined _ALS_OnPlayerDisconnect
	#undef OnPlayerDisconnect
#else
	#define _ALS_OnPlayerDisconnect
#endif
#define OnPlayerDisconnect TDFX_OnPlayerDisconnect
#if defined TDFX_OnPlayerDisconnect
	forward TDFX_OnPlayerDisconnect(playerid, reason);
#endif

// -----------------------------------------------------------------------------
// Script Exit Handling (Filterscript & GameMode)
// -----------------------------------------------------------------------------

stock TDFX_Exit()
{
	for (new i = 0; i < TDFX_MAX_FX; i++)
	{
		if (TDFX_Used[i])
		{
			TDFX_Free(i, true, false, true);
		}
	}
	#if TDFX_MAX_GLOBAL_TD > 0
	for (new t = 0; t < TDFX_MAX_GLOBAL_TD; t++)
	{
		TDFX_GInfo[t] = 0;
		TDFX_GRemText[t] = 0;
		TDFX_GRemBox[t] = 0;
		TDFX_GRemBack[t] = 0;
		TDFX_GRemLetX[t] = 0.0;
		TDFX_GRemLetY[t] = 0.0;
		TDFX_GRemPosX[t] = 0.0;
		TDFX_GRemPosY[t] = 0.0;
		TDFX_GRemSizeX[t] = 0.0;
		TDFX_GRemSizeY[t] = 0.0;
		TDFX_GRemAlign[t] = 1;
		TDFX_GShownState[t] = TDFX_GSTATE_UNTRACKED;
		for (new w = 0; w < TDFX_PLAYER_BITWORDS; w++)
		{
			TDFX_GShownMask[t][w] = 0;
		}
	}
	#endif
}

#if defined FILTERSCRIPT
	public OnFilterScriptExit()
	{
		TDFX_Exit();
		#if defined TDFX_OnFilterScriptExit
			return TDFX_OnFilterScriptExit();
		#else
			return 1;
		#endif
	}
	#if defined _ALS_OnFilterScriptExit
		#undef OnFilterScriptExit
	#else
		#define _ALS_OnFilterScriptExit
	#endif
	#define OnFilterScriptExit TDFX_OnFilterScriptExit
	#if defined TDFX_OnFilterScriptExit
		forward TDFX_OnFilterScriptExit();
	#endif
#else
	public OnGameModeExit()
	{
		TDFX_Exit();
		#if defined TDFX_OnGameModeExit
			return TDFX_OnGameModeExit();
		#else
			return 1;
		#endif
	}
	#if defined _ALS_OnGameModeExit
		#undef OnGameModeExit
	#else
		#define _ALS_OnGameModeExit
	#endif
	#define OnGameModeExit TDFX_OnGameModeExit
	#if defined TDFX_OnGameModeExit
		forward TDFX_OnGameModeExit();
	#endif
#endif

// -----------------------------------------------------------------------------
// Forward declarations for event callbacks
// -----------------------------------------------------------------------------

forward OnPlayerTextDrawFXFinish(playerid, PlayerText:textid, fx_type, extra_id);
forward OnTextDrawFXFinish(Text:textid, fx_type, extra_id);
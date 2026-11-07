/*
================================================================================
    Progress Bar Plus - A high-performance, modern progress bar and visual
    gauge library for SA-MP and Open.MP.

    Author:      Walter Corrêa
    Version:     2.2.0
    Repository:  https://github.com/Walter-Correa/Progress-Bar-Plus
    License:     Mozilla Public License 2.0 (MPL-2.0)
================================================================================
*/

#if defined _progressbar_included || defined _progressbarplus_included
	#endinput
#endif
#define _progressbar_included
#define _progressbarplus_included

#define PROGRESSBAR_VERSION_MAJOR             2
#define PROGRESSBAR_VERSION_MINOR             2
#define PROGRESSBAR_VERSION_PATCH             0
#define PROGRESSBAR_VERSION_STRING            "2.2.0"

#if !defined _samp_included && !defined _INC_open_mp
	#if __Pawn >= 0x030A
		#tryinclude <open.mp>
	#endif
	#if !defined _INC_open_mp
		#include <a_samp>
	#endif
#endif

/*
    Performance Note: Include Ordering
    If your script uses TextDraw hooking libraries (such as TextDrawFX or ALS hooks),
    always include <ProgressBar> BEFORE them:
        #include <open.mp> // or <a_samp>
        #include <ProgressBar>
        #include <TextDrawFX>
    This guarantees high-frequency bar updates bind directly to raw natives without
    incurring hook search loop overhead.
*/

#if !defined PBP_DEFAULT_COLOUR
	#if defined PB_DEFAULT_COLOUR
		#define PBP_DEFAULT_COLOUR (PB_DEFAULT_COLOUR)
	#else
		#define PBP_DEFAULT_COLOUR (0xE74C3CFF)
	#endif
#endif
#if !defined PB_DEFAULT_COLOUR
	#define PB_DEFAULT_COLOUR PBP_DEFAULT_COLOUR
#endif

#if !defined PBP_BORDER_DEFAULT
	#if defined PBP_BORDER
		#define PBP_BORDER_DEFAULT (PBP_BORDER)
	#elseif defined PB_BORDER
		#define PBP_BORDER_DEFAULT (PB_BORDER)
	#elseif defined PB_BORDER_DEFAULT
		#define PBP_BORDER_DEFAULT (PB_BORDER_DEFAULT)
	#else
		#define PBP_BORDER_DEFAULT (1.0)
	#endif
#endif
#if !defined PB_BORDER_DEFAULT
	#define PB_BORDER_DEFAULT PBP_BORDER_DEFAULT
#endif
#if !defined PB_BORDER_NONE
	#define PB_BORDER_NONE (0.0)
#endif


#if !defined PBP_BORDER_MIN
	#if defined PB_BORDER_MIN
		#define PBP_BORDER_MIN (PB_BORDER_MIN)
	#else
		#define PBP_BORDER_MIN (0.5)
	#endif
#endif
#if !defined PB_BORDER_MIN
	#define PB_BORDER_MIN PBP_BORDER_MIN
#endif

#if !defined PBP_BORDER_MAX
	#if defined PB_BORDER_MAX
		#define PBP_BORDER_MAX (PB_BORDER_MAX)
	#else
		#define PBP_BORDER_MAX (5.0)
	#endif
#endif
#if !defined PB_BORDER_MAX
	#define PB_BORDER_MAX PBP_BORDER_MAX
#endif

#if !defined PBP_BORDER_Y_RATIO
	#if defined PB_BORDER_Y_RATIO
		#define PBP_BORDER_Y_RATIO (PB_BORDER_Y_RATIO)
	#else
		#define PBP_BORDER_Y_RATIO (1.25)
	#endif
#endif
#if !defined PB_BORDER_Y_RATIO
	#define PB_BORDER_Y_RATIO PBP_BORDER_Y_RATIO
#endif

#if !defined PBP_MIN_INNER
	#if defined PB_MIN_INNER
		#define PBP_MIN_INNER (PB_MIN_INNER)
	#else
		#define PBP_MIN_INNER (1.0)
	#endif
#endif
#if !defined PB_MIN_INNER
	#define PB_MIN_INNER PBP_MIN_INNER
#endif

#if !defined PBP_BLINK_DEFAULT
	#if defined PB_BLINK_DEFAULT
		#define PBP_BLINK_DEFAULT (PB_BLINK_DEFAULT)
	#else
		#define PBP_BLINK_DEFAULT (250)
	#endif
#endif
#if !defined PB_BLINK_DEFAULT
	#define PB_BLINK_DEFAULT PBP_BLINK_DEFAULT
#endif

#if !defined PBP_BLINK_MIN
	#if defined PB_BLINK_MIN
		#define PBP_BLINK_MIN (PB_BLINK_MIN)
	#else
		#define PBP_BLINK_MIN (50)
	#endif
#endif
#if !defined PB_BLINK_MIN
	#define PB_BLINK_MIN PBP_BLINK_MIN
#endif

#if !defined PBP_BLINK_MAX
	#if defined PB_BLINK_MAX
		#define PBP_BLINK_MAX (PB_BLINK_MAX)
	#else
		#define PBP_BLINK_MAX (60000)
	#endif
#endif
#if !defined PB_BLINK_MAX
	#define PB_BLINK_MAX PBP_BLINK_MAX
#endif

#if defined PB_MAX_BARS
	#define MAX_PLAYER_BARS (PB_MAX_BARS)
#elseif !defined MAX_PLAYER_BARS
	#define MAX_PLAYER_BARS (_:MAX_PLAYER_TEXT_DRAWS / 3)
#endif
#if !defined PB_MAX_BARS
	#define PB_MAX_BARS MAX_PLAYER_BARS
#endif

#if !defined PBP_RING_SEGMENTS
	#if defined PB_RING_SEGMENTS
		#define PBP_RING_SEGMENTS (PB_RING_SEGMENTS)
	#else
		#define PBP_RING_SEGMENTS (24)
	#endif
#endif
#if !defined PB_RING_SEGMENTS
	#define PB_RING_SEGMENTS PBP_RING_SEGMENTS
#endif

#if !defined PBP_RING_SEGMENT_SCALE
	#if defined PB_RING_SEGMENT_SCALE
		#define PBP_RING_SEGMENT_SCALE (PB_RING_SEGMENT_SCALE)
	#else
		#define PBP_RING_SEGMENT_SCALE (1.0)
	#endif
#endif
#if !defined PB_RING_SEGMENT_SCALE
	#define PB_RING_SEGMENT_SCALE PBP_RING_SEGMENT_SCALE
#endif

#if !defined PBP_RING_MIN
	#if defined PB_RING_MIN
		#define PBP_RING_MIN (PB_RING_MIN)
	#else
		#define PBP_RING_MIN (4)
	#endif
#endif
#if !defined PB_RING_MIN
	#define PB_RING_MIN PBP_RING_MIN
#endif

#if !defined PBP_RING_MAX
	#if defined PB_RING_MAX
		#define PBP_RING_MAX (PB_RING_MAX)
	#else
		#define PBP_RING_MAX (60)
	#endif
#endif
#if !defined PB_RING_MAX
	#define PB_RING_MAX PBP_RING_MAX
#endif

#if !defined PBP_RING_SCALE_MIN
	#if defined PB_RING_SCALE_MIN
		#define PBP_RING_SCALE_MIN (PB_RING_SCALE_MIN)
	#else
		#define PBP_RING_SCALE_MIN (0.10)
	#endif
#endif
#if !defined PB_RING_SCALE_MIN
	#define PB_RING_SCALE_MIN PBP_RING_SCALE_MIN
#endif

#if !defined PBP_RING_SCALE_MAX
	#if defined PB_RING_SCALE_MAX
		#define PBP_RING_SCALE_MAX (PB_RING_SCALE_MAX)
	#else
		#define PBP_RING_SCALE_MAX (3.00)
	#endif
#endif
#if !defined PB_RING_SCALE_MAX
	#define PB_RING_SCALE_MAX PBP_RING_SCALE_MAX
#endif

#if !defined PBP_TICK_RATE
	#if defined PB_TICK_RATE
		#define PBP_TICK_RATE (PB_TICK_RATE)
	#else
		#define PBP_TICK_RATE (33)
	#endif
#endif
#if !defined PB_TICK_RATE
	#define PB_TICK_RATE PBP_TICK_RATE
#endif

#if !defined PBP_AUTOFILL_TICK
	#if defined PB_AUTOFILL_TICK
		#define PBP_AUTOFILL_TICK (PB_AUTOFILL_TICK)
	#else
		#define PBP_AUTOFILL_TICK (50)
	#endif
#endif
#if !defined PB_AUTOFILL_TICK
	#define PB_AUTOFILL_TICK PBP_AUTOFILL_TICK
#endif

#if !defined PBP_AUTOFILL_RISE
	#define PBP_AUTOFILL_RISE (1000)
#endif
#if !defined PB_AUTOFILL_RISE
	#define PB_AUTOFILL_RISE PBP_AUTOFILL_RISE
#endif

#if !defined PBP_AUTOFILL_HOLD_TOP
	#define PBP_AUTOFILL_HOLD_TOP (400)
#endif
#if !defined PB_AUTOFILL_HOLD_TOP
	#define PB_AUTOFILL_HOLD_TOP PBP_AUTOFILL_HOLD_TOP
#endif

#if !defined PBP_AUTOFILL_FALL
	#define PBP_AUTOFILL_FALL (1000)
#endif
#if !defined PB_AUTOFILL_FALL
	#define PB_AUTOFILL_FALL PBP_AUTOFILL_FALL
#endif

#if !defined PBP_AUTOFILL_HOLD_BASE
	#define PBP_AUTOFILL_HOLD_BASE (300)
#endif
#if !defined PB_AUTOFILL_HOLD_BASE
	#define PB_AUTOFILL_HOLD_BASE PBP_AUTOFILL_HOLD_BASE
#endif

#define PBP_CHIT_SCALE (1.5)
#define PB_CHIT_SCALE PBP_CHIT_SCALE
#if !defined PlayerBar
	#define PlayerBar: _:
#endif
#define PB_TD_SAFETY_HEADROOM (4)

#define PBP_MAX_TDS (_:MAX_PLAYER_TEXT_DRAWS)
#define PB_MAX_TDS PBP_MAX_TDS

#define INVALID_PLAYER_BAR_VALUE (Float:0xFFFFFFFF)
#define INVALID_PLAYER_BAR_ID (-1)

#if defined TEXT_DRAW_FONT_SPRITE_DRAW
	#define PBP_SPRITE_FONT TEXT_DRAW_FONT_SPRITE_DRAW
#else
	#define PBP_SPRITE_FONT 4
#endif
#define PB_SPRITE_FONT PBP_SPRITE_FONT

#if defined PlayerTextDrawColour
	#define PBP_TextDrawColour PlayerTextDrawColour
#else
	#define PBP_TextDrawColour PlayerTextDrawColor
#endif
#define PB_TextDrawColour PBP_TextDrawColour

#if defined PlayerTextDrawBackgroundColour
	#define PBP_TextDrawBackgroundColour PlayerTextDrawBackgroundColour
#else
	#define PBP_TextDrawBackgroundColour PlayerTextDrawBackgroundColor
#endif
#define PB_TextDrawBackgroundColour PBP_TextDrawBackgroundColour

#if defined INVALID_PLAYER_TEXT_DRAW
	#define PBP_NO_TD INVALID_PLAYER_TEXT_DRAW
#else
	#define PBP_NO_TD (PlayerText:INVALID_TEXT_DRAW)
#endif
#define PB_NO_TD PBP_NO_TD

#define PBP_TD_PART (0xFFFF)
#define PB_TD_PART PBP_TD_PART

#define PBP_TD_KNOWN (0x20000000)
#define PB_TD_KNOWN PBP_TD_KNOWN

#define PBP_TD_SHOWN (0x40000000)
#define PB_TD_SHOWN PBP_TD_SHOWN

enum
{
	PBP_DIR_RIGHT,
	PBP_DIR_LEFT,
	PBP_DIR_UP,
	PBP_DIR_DOWN
};

#define PB_DIR_RIGHT PBP_DIR_RIGHT
#define PB_DIR_LEFT  PBP_DIR_LEFT
#define PB_DIR_UP    PBP_DIR_UP
#define PB_DIR_DOWN  PBP_DIR_DOWN

#define BAR_DIRECTION_RIGHT PBP_DIR_RIGHT
#define BAR_DIRECTION_LEFT  PBP_DIR_LEFT
#define BAR_DIRECTION_UP    PBP_DIR_UP
#define BAR_DIRECTION_DOWN  PBP_DIR_DOWN

enum
{
	PBP_STYLE_BAR,
	PBP_STYLE_RING,
	PBP_STYLE_CIRCLE
};

#define PB_STYLE_BAR    PBP_STYLE_BAR
#define PB_STYLE_RING   PBP_STYLE_RING
#define PB_STYLE_CIRCLE PBP_STYLE_CIRCLE

#define PB_LABEL_ORIENT_AUTO        (0)
#define PB_LABEL_ORIENT_HORIZONTAL  (1)
#define PB_LABEL_ORIENT_VERTICAL    (2)
#define PB_LABEL_ORIENT_HORIZ       PB_LABEL_ORIENT_HORIZONTAL
#define PB_LABEL_ORIENT_VERT        PB_LABEL_ORIENT_VERTICAL

enum ProgressBar_Data
{
	bool:PB_Valid,
	bool:PB_Visible,
	bool:PB_Rendered,
	Float:PB_PosX,
	Float:PB_PosY,
	Float:PB_Width,
	Float:PB_Height,
	PB_Colour,
	Float:PB_MinValue,
	Float:PB_MaxValue,
	Float:PB_Value,
	PB_Direction,
	Float:PB_BorderSize,
	PB_BorderColour,
	bool:PB_Blinking,
	bool:PB_BlinkPhase,
	PB_BlinkTimer,
	PB_BlinkColour,
	PB_BlinkBorderColour,
	PB_BlinkStart,
	PB_BlinkDuration,
	bool:PB_AutoFill,
	Float:PB_AutoFillMax,
	PB_AutoFillStart,
	PB_AutoFillTimer,
	PB_LastLit,
	PB_Style,
	PB_Segments,
	Float:PB_SegmentScale,
	bool:PB_Empty,
	bool:PB_LabelEnabled,
	bool:PB_LabelAutoScale,
	bool:PB_LabelFollowColour,
	PB_LabelOrientation,
	PB_LabelText[32],
	PB_LabelColour,
	PB_LabelCurrentColour,
	PB_LabelFont,
	PB_LabelAlignment,
	bool:PB_LabelIsVert,
	PB_LabelLines,
	Float:PB_LabelScaleX,
	Float:PB_LabelScaleY,
	Float:PB_LabelOffsetX,
	Float:PB_LabelOffsetY,
	bool:PB_LerpActive,
	Float:PB_LerpStartVal,
	Float:PB_LerpTargetVal,
	PB_LerpStartTime,
	PB_LerpDuration,
	PB_LerpTimer,
	bool:PB_Gradient,
	bool:PB_GradientInverted,
	PB_GradientEmpty,
	PB_GradientMid,
	PB_GradientFull,
	PlayerText:PB_Label,
	PlayerText:PB_Border,
	PlayerText:PB_Background,
	PlayerText:PB_Progress
};

static stock ProgressBar[MAX_PLAYERS][MAX_PLAYER_BARS][ProgressBar_Data];
static stock PB_TDOwner[MAX_PLAYERS][PB_MAX_TDS];
static stock PB_TDPart[MAX_PLAYERS][PB_MAX_TDS];
static stock PB_TDColour[MAX_PLAYERS][PB_MAX_TDS];

/*
================================================================================
    Engine Internals & Rendering Helpers
================================================================================
*/

static stock PlayerText:PB_Sprite(playerid, Float:x, Float:y, Float:width, Float:height, colour, const sprite[] = "LD_SPAC:white")
{
	new spriteBuf[32];
	strcat(spriteBuf, sprite, sizeof spriteBuf);
	new PlayerText:td = CreatePlayerTextDraw(playerid, x, y, spriteBuf);
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

static stock PB_ShapeDimensions(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_CIRCLE)
	{
		new Float:sw = width * PB_CHIT_SCALE, Float:sh = height * PB_CHIT_SCALE;
		x += (width - sw) / 2.0;
		y += (height - sh) / 2.0;
		width = sw;
		height = sh;
	}
}

static stock PlayerText:PB_ShapeSprite(playerid, barid, Float:x, Float:y, Float:width, Float:height, colour)
{
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_CIRCLE)
	{
		PB_ShapeDimensions(playerid, barid, x, y, width, height);
		return PB_Sprite(playerid, x, y, width, height, colour, "LD_BEAT:chit");
	}
	return PB_Sprite(playerid, x, y, width, height, colour);
}

static stock PB_ClampSegments(segments)
{
	if (segments < PB_RING_MIN) return PB_RING_MIN;
	if (segments > PB_RING_MAX) return PB_RING_MAX;
	return segments;
}

static stock PB_KillRing(playerid, barid)
{
	for (new t = 0; t < PB_MAX_TDS; t++)
	{
		if (PB_TDOwner[playerid][t] != barid + 1) continue;
		PlayerTextDrawDestroy(playerid, PlayerText:t);
		PB_TDOwner[playerid][t] = 0;
		PB_TDPart[playerid][t] = 0;
		PB_TDColour[playerid][t] = 0;
	}
}

static stock Float:PB_ClampBorder(Float:border)
{
	if (border != border) return PB_BORDER_DEFAULT;
	if (border <= 0.0) return 0.0;
	if (border < PB_BORDER_MIN) return PB_BORDER_MIN;
	if (border > PB_BORDER_MAX) return PB_BORDER_MAX;
	return border;
}

static stock Float:PB_CheckLegacyHeight(Float:height, style, direction)
{
#if !defined PB_NO_LEGACY_HEIGHT_CONVERT
	if (height <= 4.5 && style == PB_STYLE_BAR && (direction == PB_DIR_RIGHT || direction == PB_DIR_LEFT))
	{
		height = height * 2.5;
		if (height < 6.0) height = 6.0;
	}
#endif
	return height;
}

static stock Float:PB_FitBorder(Float:border, Float:width, Float:height)
{
	new Float:limit = (width - PB_MIN_INNER) / 2.0;
	new Float:limitY = (height - PB_MIN_INNER) / (2.0 * PB_BORDER_Y_RATIO);
	if (limitY < limit) limit = limitY;
	if (limit < PB_BORDER_MIN) limit = PB_BORDER_MIN;
	return (border > limit) ? limit : border;
}

static stock PB_Inner(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	new Float:bx = PB_FitBorder(ProgressBar[playerid][barid][PB_BorderSize], ProgressBar[playerid][barid][PB_Width], ProgressBar[playerid][barid][PB_Height]);
	new Float:by = bx * PB_BORDER_Y_RATIO;
	x = ProgressBar[playerid][barid][PB_PosX] + bx;
	y = ProgressBar[playerid][barid][PB_PosY] + by;
	width = ProgressBar[playerid][barid][PB_Width] - bx * 2.0;
	height = ProgressBar[playerid][barid][PB_Height] - by * 2.0;
	if (width < 0.0) width = 0.0;
	if (height < 0.0) height = 0.0;
}

static stock Float:PB_DisplayValue(playerid, barid)
{
	new Float:value = ProgressBar[playerid][barid][PB_Value];
	if (!ProgressBar[playerid][barid][PB_AutoFill]) return value;
	new Float:target = ProgressBar[playerid][barid][PB_AutoFillMax];
	new cycle = PB_AUTOFILL_RISE + PB_AUTOFILL_HOLD_TOP + PB_AUTOFILL_FALL + PB_AUTOFILL_HOLD_BASE;
	if (cycle <= 0) cycle = 1;
	new t = (GetTickCount() - ProgressBar[playerid][barid][PB_AutoFillStart]) % cycle;
	if (t < 0) t += cycle;
	new Float:f;
	new rise = PB_AUTOFILL_RISE;
	if (rise <= 0) rise = 1;
	new fall = PB_AUTOFILL_FALL;
	if (fall <= 0) fall = 1;
	if (t < rise) f = float(t) / float(rise);
	else if (t < rise + PB_AUTOFILL_HOLD_TOP) f = 1.0;
	else if (t < rise + PB_AUTOFILL_HOLD_TOP + fall) f = 1.0 - float(t - rise - PB_AUTOFILL_HOLD_TOP) / float(fall);
	else f = 0.0;
	return value + (target - value) * f;
}

static stock bool:PB_MainRect(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	PB_Inner(playerid, barid, x, y, width, height);
	new Float:minVal = ProgressBar[playerid][barid][PB_MinValue];
	new Float:maxVal = ProgressBar[playerid][barid][PB_MaxValue];
	new Float:range = maxVal - minVal;
	new Float:part = (range > 0.0) ? ((PB_DisplayValue(playerid, barid) - minVal) / range) : 0.0;
	if (part < 0.0) part = 0.0;
	if (part > 1.0) part = 1.0;
	if (part <= 0.0 || width <= 0.0 || height <= 0.0) return false;
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_CIRCLE)
	{
		x += width * (1.0 - part) / 2.0;
		y += height * (1.0 - part) / 2.0;
		width *= part;
		height *= part;
		return true;
	}
	switch (ProgressBar[playerid][barid][PB_Direction])
	{
		case PB_DIR_LEFT:
		{
			x += width * (1.0 - part);
			width *= part;
		}
		case PB_DIR_UP:
		{
			y += height * (1.0 - part);
			height *= part;
		}
		case PB_DIR_DOWN: height *= part;
		default: width *= part;
	}
	return true;
}

static stock PB_LerpRGBA(c1, c2, Float:f)
{
	if (f <= 0.0) return c1;
	if (f >= 1.0) return c2;
	new r1 = (c1 >>> 24) & 0xFF, g1 = (c1 >>> 16) & 0xFF, b1 = (c1 >>> 8) & 0xFF, a1 = c1 & 0xFF;
	new r2 = (c2 >>> 24) & 0xFF, g2 = (c2 >>> 16) & 0xFF, b2 = (c2 >>> 8) & 0xFF, a2 = c2 & 0xFF;
	new r = r1 + floatround(float(r2 - r1) * f);
	new g = g1 + floatround(float(g2 - g1) * f);
	new b = b1 + floatround(float(b2 - b1) * f);
	new a = a1 + floatround(float(a2 - a1) * f);
	return ((r & 0xFF) << 24) | ((g & 0xFF) << 16) | ((b & 0xFF) << 8) | (a & 0xFF);
}

static stock PB_BackgroundColour(colour)
{
	new alpha = ((colour & 0xFF) * 30) / 100;
	if (alpha < 0x20 && (colour & 0xFF) > 0) alpha = 0x20;
	return (colour & 0xFFFFFF00) | (alpha & 0xFF);
}

static stock PB_GetCurrentColour(playerid, barid)
{
	if (ProgressBar[playerid][barid][PB_Blinking] && ProgressBar[playerid][barid][PB_BlinkPhase] && ProgressBar[playerid][barid][PB_BlinkColour] != 0)
		return ProgressBar[playerid][barid][PB_BlinkColour];

	if (ProgressBar[playerid][barid][PB_Gradient])
	{
		new Float:minVal = ProgressBar[playerid][barid][PB_MinValue];
		new Float:maxVal = ProgressBar[playerid][barid][PB_MaxValue];
		new Float:range = maxVal - minVal;
		new Float:part = (range > 0.0) ? ((PB_DisplayValue(playerid, barid) - minVal) / range) : 0.0;
		if (part < 0.0) part = 0.0;
		if (part > 1.0) part = 1.0;
		if (ProgressBar[playerid][barid][PB_GradientInverted])
		{
			part = 1.0 - part;
		}

		new mid = ProgressBar[playerid][barid][PB_GradientMid];
		new empty = ProgressBar[playerid][barid][PB_GradientEmpty];
		new full = ProgressBar[playerid][barid][PB_GradientFull];

		if (mid != 0)
		{
			if (part < 0.5) return PB_LerpRGBA(empty, mid, part * 2.0);
			else return PB_LerpRGBA(mid, full, (part - 0.5) * 2.0);
		}
		return PB_LerpRGBA(empty, full, part);
	}
	return ProgressBar[playerid][barid][PB_Colour];
}

static stock PB_GetBorderColour(playerid, barid)
{
	if (ProgressBar[playerid][barid][PB_Blinking] && ProgressBar[playerid][barid][PB_BlinkPhase] && ProgressBar[playerid][barid][PB_BlinkBorderColour] != 0)
		return ProgressBar[playerid][barid][PB_BlinkBorderColour];
	if (ProgressBar[playerid][barid][PB_BorderColour] != 0) return ProgressBar[playerid][barid][PB_BorderColour];
	return (ProgressBar[playerid][barid][PB_Colour] & 0xFF);
}

static stock bool:PB_InnerHidden(playerid, barid)
{
	return ProgressBar[playerid][barid][PB_Blinking] && ProgressBar[playerid][barid][PB_BlinkPhase] && ProgressBar[playerid][barid][PB_BlinkColour] == 0;
}

static stock PB_ShowInner(playerid, barid)
{
	if (!ProgressBar[playerid][barid][PB_Visible]) return;
	new bool:hidden = PB_InnerHidden(playerid, barid);
	if (ProgressBar[playerid][barid][PB_Background] != PB_NO_TD)
	{
		if (hidden) PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][PB_Background]);
		else PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Background]);
	}
	if (ProgressBar[playerid][barid][PB_Progress] != PB_NO_TD)
	{
		if (hidden || ProgressBar[playerid][barid][PB_Empty]) PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][PB_Progress]);
		else PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Progress]);
	}
}

static stock PB_RingLit(playerid, barid)
{
	new Float:minVal = ProgressBar[playerid][barid][PB_MinValue];
	new Float:maxVal = ProgressBar[playerid][barid][PB_MaxValue];
	new Float:range = maxVal - minVal;
	new Float:part = (range > 0.0) ? ((PB_DisplayValue(playerid, barid) - minVal) / range) : 0.0;
	if (part < 0.0) part = 0.0;
	if (part > 1.0) part = 1.0;
	if (part <= 0.0) return 0;
	return floatround(part * float(ProgressBar[playerid][barid][PB_Segments]) + 0.0001, floatround_floor);
}

static stock PB_ApplyRingColours(playerid, barid)
{
	new lit = PB_RingLit(playerid, barid);
	new colour = PB_GetCurrentColour(playerid, barid), dim = PB_BackgroundColour(colour);
	new border = PB_GetBorderColour(playerid, barid);
	new bool:hidden = PB_InnerHidden(playerid, barid), bool:shown = ProgressBar[playerid][barid][PB_Visible];
	for (new t = 0; t < PB_MAX_TDS; t++)
	{
		if (PB_TDOwner[playerid][t] != barid + 1) continue;
		new PlayerText:td = PlayerText:t, flags = PB_TDPart[playerid][t], part = flags & PB_TD_PART;
		new want = (part % 2 == 0) ? border : ((part / 2 < lit) ? colour : dim);
		new bool:visible = shown && (part % 2 == 0 || !hidden);
		new bool:changed = !(flags & PB_TD_KNOWN) || PB_TDColour[playerid][t] != want;
		if (changed)
		{
			PB_TextDrawColour(playerid, td, want);
			PB_TDColour[playerid][t] = want;
		}
		if (visible && (changed || !(flags & PB_TD_SHOWN))) PlayerTextDrawShow(playerid, td);
		else if (!visible && (flags & PB_TD_SHOWN)) PlayerTextDrawHide(playerid, td);
		PB_TDPart[playerid][t] = part | PB_TD_KNOWN | (visible ? PB_TD_SHOWN : 0);
	}
}

static stock PB_ApplyColours(playerid, barid)
{
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		PB_ApplyRingColours(playerid, barid);
	}
	else
	{
		if (ProgressBar[playerid][barid][PB_Border] != PB_NO_TD)
		{
			PB_TextDrawColour(playerid, ProgressBar[playerid][barid][PB_Border], PB_GetBorderColour(playerid, barid));
			if (ProgressBar[playerid][barid][PB_Visible]) PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Border]);
		}
		new colour = PB_GetCurrentColour(playerid, barid);
		if (ProgressBar[playerid][barid][PB_Background] != PB_NO_TD) PB_TextDrawColour(playerid, ProgressBar[playerid][barid][PB_Background], PB_BackgroundColour(colour));
		if (ProgressBar[playerid][barid][PB_Progress] != PB_NO_TD) PB_TextDrawColour(playerid, ProgressBar[playerid][barid][PB_Progress], colour);
		PB_ShowInner(playerid, barid);
	}
	if (ProgressBar[playerid][barid][PB_LabelEnabled] && ProgressBar[playerid][barid][PB_Label] != PB_NO_TD)
	{
		if (ProgressBar[playerid][barid][PB_LabelFollowColour])
		{
			new col = PB_GetLabelColour(playerid, barid);
			if (col != ProgressBar[playerid][barid][PB_LabelCurrentColour])
			{
				ProgressBar[playerid][barid][PB_LabelCurrentColour] = col;
				PBP_TextDrawColour(playerid, ProgressBar[playerid][barid][PB_Label], col);
				if (ProgressBar[playerid][barid][PB_Visible])
				{
					PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Label]);
				}
			}
		}
	}
}

static stock PB_KillAutoFill(playerid, barid)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !(0 <= barid < MAX_PLAYER_BARS)) return;
	if (ProgressBar[playerid][barid][PB_AutoFillTimer] != 0)
	{
		KillTimer(ProgressBar[playerid][barid][PB_AutoFillTimer]);
		ProgressBar[playerid][barid][PB_AutoFillTimer] = 0;
	}
	ProgressBar[playerid][barid][PB_AutoFill] = false;
}

static stock PB_KillLerp(playerid, barid)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !(0 <= barid < MAX_PLAYER_BARS)) return;
	if (ProgressBar[playerid][barid][PB_LerpTimer] != 0)
	{
		KillTimer(ProgressBar[playerid][barid][PB_LerpTimer]);
		ProgressBar[playerid][barid][PB_LerpTimer] = 0;
	}
	ProgressBar[playerid][barid][PB_LerpActive] = false;
}

static stock PB_KillBlink(playerid, barid)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !(0 <= barid < MAX_PLAYER_BARS)) return;
	if (ProgressBar[playerid][barid][PB_BlinkTimer] != 0)
	{
		KillTimer(ProgressBar[playerid][barid][PB_BlinkTimer]);
		ProgressBar[playerid][barid][PB_BlinkTimer] = 0;
	}
	ProgressBar[playerid][barid][PB_Blinking] = false;
	ProgressBar[playerid][barid][PB_BlinkPhase] = false;
}

static stock s_PB_FreeTDCache[MAX_PLAYERS] = { -1, ... };
static stock s_PB_FreeTDCacheTick[MAX_PLAYERS] = { 0, ... };

stock PB_InvalidateFreeTDCache(playerid)
{
	if (0 <= playerid < MAX_PLAYERS)
	{
		s_PB_FreeTDCache[playerid] = -1;
		s_PB_FreeTDCacheTick[playerid] = 0;
	}
}

stock bool:PB_CanAllocatePlayerTextDraws(playerid, count)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return false;
	if (count <= 0) return true;
	#if defined _INC_open_mp
		new freeCount = 0;
		for (new i = 0; i < _:MAX_PLAYER_TEXT_DRAWS; i++)
		{
			if (!IsValidPlayerTextDraw(playerid, PlayerText:i))
			{
				if (++freeCount >= count) return true;
			}
		}
		return false;
	#else
		new PlayerText:probe[PB_MAX_TDS];
		new allocCount = 0;
		new bool:canAlloc = true;
		while (allocCount < count && allocCount < PB_MAX_TDS)
		{
			new PlayerText:td = CreatePlayerTextDraw(playerid, 0.0, 0.0, "_");
			if (td == PB_NO_TD || !(0 <= _:td < PB_MAX_TDS))
			{
				canAlloc = false;
				break;
			}
			probe[allocCount++] = td;
		}
		for (new i = 0; i < allocCount; i++)
		{
			PlayerTextDrawDestroy(playerid, probe[i]);
		}
		return canAlloc;
	#endif
}

stock PB_GetFreePlayerTextDraws(playerid)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return 0;
	#if defined _INC_open_mp
		new freeCount = 0;
		for (new i = 0; i < _:MAX_PLAYER_TEXT_DRAWS; i++)
		{
			if (!IsValidPlayerTextDraw(playerid, PlayerText:i)) freeCount++;
		}
		return freeCount;
	#else
		new now = GetTickCount();
		if (s_PB_FreeTDCache[playerid] != -1 && (now - s_PB_FreeTDCacheTick[playerid]) < 1000)
		{
			return s_PB_FreeTDCache[playerid];
		}
		new PlayerText:probe[PB_MAX_TDS];
		new freeCount = 0;
		while (freeCount < PB_MAX_TDS)
		{
			new PlayerText:td = CreatePlayerTextDraw(playerid, 0.0, 0.0, "_");
			if (td == PB_NO_TD || !(0 <= _:td < PB_MAX_TDS)) break;
			probe[freeCount++] = td;
		}
		for (new i = 0; i < freeCount; i++)
		{
			PlayerTextDrawDestroy(playerid, probe[i]);
		}
		s_PB_FreeTDCache[playerid] = freeCount;
		s_PB_FreeTDCacheTick[playerid] = now;
		return freeCount;
	#endif
}

stock PB_GetUsedPlayerTextDraws(playerid)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return 0;
	#if defined _INC_open_mp
		new used = 0;
		for (new i = 0; i < _:MAX_PLAYER_TEXT_DRAWS; i++)
		{
			if (IsValidPlayerTextDraw(playerid, PlayerText:i)) used++;
		}
		return used;
	#else
		return (_:MAX_PLAYER_TEXT_DRAWS - PB_GetFreePlayerTextDraws(playerid));
	#endif
}

stock PB_GetBarRequiredTextDraws(style, segments, bool:hasLabel = false)
{
	new count = 0;
	if (style == PB_STYLE_RING)
	{
		count = PB_ClampSegments(segments) * 2;
	}
	else
	{
		count = 3;
	}
	if (hasLabel) count++;
	return count;
}

static stock bool:PB_RenderMain(playerid, barid)
{
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		PB_ApplyRingColours(playerid, barid);
		return true;
	}
	new Float:x, Float:y, Float:width, Float:height;
	if (!PB_MainRect(playerid, barid, x, y, width, height))
	{
		new PlayerText:keep = ProgressBar[playerid][barid][PB_Progress];
		if (keep == PB_NO_TD && width > 0.0 && height > 0.0)
		{
			keep = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_GetCurrentColour(playerid, barid));
			ProgressBar[playerid][barid][PB_Progress] = keep;
		}
		ProgressBar[playerid][barid][PB_Empty] = true;
		if (keep != PB_NO_TD) PlayerTextDrawHide(playerid, keep);
		return true;
	}
	ProgressBar[playerid][barid][PB_Empty] = false;

	new Float:renderX = x, Float:renderY = y, Float:renderW = width, Float:renderH = height;
	PB_ShapeDimensions(playerid, barid, renderX, renderY, renderW, renderH);

	new PlayerText:current = ProgressBar[playerid][barid][PB_Progress];
	if (current != PB_NO_TD)
	{
		new bool:moves = ProgressBar[playerid][barid][PB_Style] == PB_STYLE_CIRCLE
			|| ProgressBar[playerid][barid][PB_Direction] == PB_DIR_LEFT
			|| ProgressBar[playerid][barid][PB_Direction] == PB_DIR_UP;
		if (!moves)
		{
			PlayerTextDrawTextSize(playerid, current, renderW, renderH);
			if (ProgressBar[playerid][barid][PB_Gradient])
			{
				PB_TextDrawColour(playerid, current, PB_GetCurrentColour(playerid, barid));
			}
			if (ProgressBar[playerid][barid][PB_Visible] && !PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, current);
			return true;
		}
		#if defined PlayerTextDrawSetPos
			PlayerTextDrawSetPos(playerid, current, renderX, renderY);
			PlayerTextDrawTextSize(playerid, current, renderW, renderH);
			if (ProgressBar[playerid][barid][PB_Gradient])
			{
				PB_TextDrawColour(playerid, current, PB_GetCurrentColour(playerid, barid));
			}
			if (ProgressBar[playerid][barid][PB_Visible] && !PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, current);
			return true;
		#else
			PB_Kill(playerid, current);
			new PlayerText:fresh = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_GetCurrentColour(playerid, barid));
			if (fresh == PB_NO_TD) return false;
			ProgressBar[playerid][barid][PB_Progress] = fresh;
			if (ProgressBar[playerid][barid][PB_Visible] && !PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, fresh);
			new PlayerText:lbl = ProgressBar[playerid][barid][PB_Label];
			if (lbl != PB_NO_TD && ProgressBar[playerid][barid][PB_LabelEnabled] && _:fresh >= _:lbl)
			{
				PB_RenderLabel(playerid, barid);
			}
			return true;
		#endif
	}
	new PlayerText:created = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_GetCurrentColour(playerid, barid));
	if (created == PB_NO_TD) return false;
	ProgressBar[playerid][barid][PB_Progress] = created;
	if (ProgressBar[playerid][barid][PB_Visible] && !PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, created);
	return true;
}

static stock bool:PB_RenderRing(playerid, barid)
{
	PB_KillRing(playerid, barid);
	new n = ProgressBar[playerid][barid][PB_Segments];
	new Float:rx = ProgressBar[playerid][barid][PB_Width] / 2.0, Float:ry = ProgressBar[playerid][barid][PB_Height] / 2.0;
	new Float:cx = ProgressBar[playerid][barid][PB_PosX] + rx, Float:cy = ProgressBar[playerid][barid][PB_PosY] + ry;
	new Float:scale = ProgressBar[playerid][barid][PB_SegmentScale];
	if (scale <= 0.0) scale = 1.0;
	new Float:rawBorder = ProgressBar[playerid][barid][PB_BorderSize];
	new Float:bx = rawBorder * scale, Float:by = bx * PB_BORDER_Y_RATIO;
	new Float:r = rx;
	if (ry / PB_BORDER_Y_RATIO < r) r = ry / PB_BORDER_Y_RATIO;
	new Float:dx = 1.4 * 3.14159265 * (r - rawBorder) / (float(n) + 0.7 * 3.14159265) * scale;
	if (dx < 0.5) dx = 0.5;
	new Float:dy = dx * PB_BORDER_Y_RATIO;
	new Float:px = rx - dx / 2.0 - bx, Float:py = ry - dy / 2.0 - by;
	if (px < 0.0) px = 0.0;
	if (py < 0.0) py = 0.0;
	new Float:step = 360.0 / float(n);
	new dir = ProgressBar[playerid][barid][PB_Direction];
	if (dir == PB_DIR_LEFT || dir == PB_DIR_UP) step = -step;
	for (new role = 0; role < 2; role++)
	{
		new Float:sw = (role == 0) ? (dx + bx * 2.0) : dx, Float:sh = (role == 0) ? (dy + by * 2.0) : dy;
		sw *= PB_CHIT_SCALE;
		sh *= PB_CHIT_SCALE;
		for (new i = 0; i < n; i++)
		{
			new Float:angle = -90.0 + step * float(i);
			new Float:ex = cx + px * floatcos(angle, degrees), Float:ey = cy + py * floatsin(angle, degrees);
			new PlayerText:td = PB_Sprite(playerid, ex - sw / 2.0, ey - sh / 2.0, sw, sh, 0, "LD_BEAT:chit");
			if (td == PB_NO_TD || !(0 <= _:td < PB_MAX_TDS))
			{
				if (td != PB_NO_TD) PlayerTextDrawDestroy(playerid, td);
				PB_KillRing(playerid, barid);
				return false;
			}
			PB_TDOwner[playerid][_:td] = barid + 1;
			PB_TDPart[playerid][_:td] = i * 2 + role;
		}
	}
	PB_ApplyRingColours(playerid, barid);
	return true;
}

static stock bool:PB_IsLabelVertical(playerid, barid)
{
	if (ProgressBar[playerid][barid][PB_Style] != PB_STYLE_BAR) return false;

	if (ProgressBar[playerid][barid][PB_LabelOrientation] == PB_LABEL_ORIENT_HORIZONTAL) return false;
	if (ProgressBar[playerid][barid][PB_LabelOrientation] == PB_LABEL_ORIENT_VERTICAL) return true;

	new Float:w = ProgressBar[playerid][barid][PB_Width];
	new Float:h = ProgressBar[playerid][barid][PB_Height];

	// Only vertical bars (height > width) can be candidates for vertical text stacking
	if (h <= w) return false;

	// Extract text template to measure visible character count
	new text[32];
	text[0] = '\0';
	strcat(text, ProgressBar[playerid][barid][PB_LabelText], sizeof text);
	if (text[0] == '\0') strcat(text, "{PERCENT}%", sizeof text);

	new visibleLen = 0;
	new len = strlen(text);
	for (new i = 0; i < len; )
	{
		if (text[i] == '{')
		{
			if (!strcmp(text[i], "{PERCENT}", false, 9) || !strcmp(text[i], "{PCT}", false, 5))
			{
				visibleLen += 3; // "100" or "70"
				i += (!strcmp(text[i], "{PCT}", false, 5)) ? 5 : 9;
				continue;
			}
			else if (!strcmp(text[i], "{VALUE}", false, 7) || !strcmp(text[i], "{VAL}", false, 5))
			{
				visibleLen += 3; // e.g. "100"
				i += (!strcmp(text[i], "{VAL}", false, 5)) ? 5 : 7;
				continue;
			}
			else if (!strcmp(text[i], "{MAX}", false, 5) || !strcmp(text[i], "{MIN}", false, 5))
			{
				visibleLen += 3;
				i += 5;
				continue;
			}
			new closeIdx = -1;
			for (new j = i + 1; j < len && (j - i) <= 10; j++)
			{
				if (text[j] == '}') { closeIdx = j; break; }
			}
			if (closeIdx != -1)
			{
				i = closeIdx + 1;
				continue;
			}
		}
		visibleLen++;
		i++;
	}

	if (visibleLen < 1) visibleLen = 1;

	new Float:border = ProgressBar[playerid][barid][PB_BorderSize];

	// Width required to comfortably fit visibleLen characters horizontally with legible font (scaleX >= 0.16)
	new Float:neededWidth = float(visibleLen) * 4.2 + (border * 2.0) + 4.0;
	if (neededWidth < 16.0) neededWidth = 16.0;

	// Height required to comfortably fit visibleLen characters vertically
	new Float:neededHeight = (float(visibleLen - 1) * 7.5 + 8.0) + (border * 2.0);

	// If bar width is too narrow for horizontal text, AND bar is taller than wide, AND tall enough for vertical:
	if (w < neededWidth && h >= neededHeight && h > w)
	{
		return true; // Not enough horizontal space -> stack vertically
	}
	return false; // Width is sufficient or bar is horizontal -> stay horizontal
}

static stock PB_GetLabelColour(playerid, barid)
{
	if (ProgressBar[playerid][barid][PB_LabelFollowColour])
	{
		new col = PB_GetCurrentColour(playerid, barid);
		if ((col & 0xFF) == 0) col |= 0xFF;
		return col;
	}
	return ProgressBar[playerid][barid][PB_LabelColour];
}

static stock PB_MakeVerticalText(const src[], dest[], maxsize = sizeof dest)
{
	dest[0] = '\0';
	new len = strlen(src);
	new d = 0;
	new bool:firstChar = true;

	for (new i = 0; i < len && d < maxsize - 4; )
	{
		// Preserve GTA SA color embed tags {RRGGBB} intact
		if (src[i] == '{')
		{
			new closeIdx = -1;
			for (new j = i + 1; j < len && (j - i) <= 10; j++)
			{
				if (src[j] == '}')
				{
					closeIdx = j;
					break;
				}
			}
			if (closeIdx != -1)
			{
				for (new k = i; k <= closeIdx && d < maxsize - 1; k++)
				{
				dest[d++] = src[k];
				}
				dest[d] = '\0';
				i = closeIdx + 1;
				continue;
			}
		}

		// Skip existing native newlines if already present
		if (src[i] == '~' && (i + 2 < len) && (src[i + 1] == 'n' || src[i + 1] == 'N') && src[i + 2] == '~')
		{
			if (d < maxsize - 4)
			{
				dest[d++] = '~'; dest[d++] = 'n'; dest[d++] = '~';
				dest[d] = '\0';
			}
			i += 3;
			firstChar = true;
			continue;
		}

		// Insert ~n~ before subsequent non-space characters
		if (src[i] != ' ')
		{
			if (!firstChar)
			{
				if (d < maxsize - 4)
				{
					dest[d++] = '~'; dest[d++] = 'n'; dest[d++] = '~';
				}
			}
			firstChar = false;
		}

		if (d < maxsize - 1)
		{
			dest[d++] = src[i];
			dest[d] = '\0';
		}
		i++;
	}
	dest[d] = '\0';
}

static stock PB_CountLabelLines(const text[])
{
	new lines = 1;
	new len = strlen(text);
	for (new i = 0; i < len - 2; i++)
	{
		if (text[i] == '~' && (text[i + 1] == 'n' || text[i + 1] == 'N') && text[i + 2] == '~')
		{
			lines++;
			i += 2;
		}
	}
	return lines;
}

static stock PB_FormatLabel(playerid, barid, dest[], maxsize = sizeof dest)
{
	new Float:minVal = ProgressBar[playerid][barid][PB_MinValue];
	new Float:maxVal = ProgressBar[playerid][barid][PB_MaxValue];
	new Float:range = maxVal - minVal;
	new Float:val = PB_DisplayValue(playerid, barid);
	new pct = (range > 0.0) ? floatround(((val - minVal) / range) * 100.0) : 0;
	if (pct < 0) pct = 0;
	if (pct > 100) pct = 100;

	new tmpl[32];
	tmpl[0] = '\0';
	strcat(tmpl, ProgressBar[playerid][barid][PB_LabelText], sizeof tmpl);
	if (tmpl[0] == '\0') strcat(tmpl, "{PERCENT}%", sizeof tmpl);

	new out[48];
	out[0] = '\0';
	new len = strlen(tmpl);
	new o = 0;
	for (new i = 0; i < len && o < (sizeof out - 1); )
	{
		if (tmpl[i] == '{')
		{
			if (!strcmp(tmpl[i], "{PERCENT}", false, 9) || !strcmp(tmpl[i], "{PCT}", false, 5))
			{
				new num[12];
				valstr(num, pct);
				new nlen = strlen(num);
				for (new k = 0; k < nlen && o < (sizeof out - 1); k++) out[o++] = num[k];
				i += (!strcmp(tmpl[i], "{PCT}", false, 5)) ? 5 : 9;
				continue;
			}
			else if (!strcmp(tmpl[i], "{VALUE}", false, 7) || !strcmp(tmpl[i], "{VAL}", false, 5))
			{
				new num[16];
				valstr(num, floatround(val));
				new nlen = strlen(num);
				for (new k = 0; k < nlen && o < (sizeof out - 1); k++) out[o++] = num[k];
				i += (!strcmp(tmpl[i], "{VAL}", false, 5)) ? 5 : 7;
				continue;
			}
			else if (!strcmp(tmpl[i], "{MAX}", false, 5))
			{
				new num[16];
				valstr(num, floatround(maxVal));
				new nlen = strlen(num);
				for (new k = 0; k < nlen && o < (sizeof out - 1); k++) out[o++] = num[k];
				i += 5;
				continue;
			}
			else if (!strcmp(tmpl[i], "{MIN}", false, 5))
			{
				new num[16];
				valstr(num, floatround(minVal));
				new nlen = strlen(num);
				for (new k = 0; k < nlen && o < (sizeof out - 1); k++) out[o++] = num[k];
				i += 5;
				continue;
			}
		}
		out[o++] = tmpl[i++];
	}
	out[o] = '\0';

	if (PB_IsLabelVertical(playerid, barid))
	{
		new vertBuf[96];
		PB_MakeVerticalText(out, vertBuf, sizeof vertBuf);
		dest[0] = '\0';
		strcat(dest, vertBuf, maxsize);
	}
	else
	{
		dest[0] = '\0';
		strcat(dest, out, maxsize);
	}
}

static stock PB_CalculateLabelScale(playerid, barid, const text[], &Float:scaleX, &Float:scaleY)
{
	new Float:h = ProgressBar[playerid][barid][PB_Height];
	new Float:w = ProgressBar[playerid][barid][PB_Width];
	new style = ProgressBar[playerid][barid][PB_Style];
	new Float:border = ProgressBar[playerid][barid][PB_BorderSize];
	new bool:isVert = PB_IsLabelVertical(playerid, barid);

	if (style == PB_STYLE_RING || style == PB_STYLE_CIRCLE)
	{
		scaleY = w * 0.024;
		if (scaleY < 0.20) scaleY = 0.20;
		if (scaleY > 1.20) scaleY = 1.20;
		scaleX = scaleY * 0.26;

		new len = strlen(text);
		if (len > 0 && w > 8.0)
		{
			new Float:approxW = float(len) * (scaleX * 22.0);
			new Float:maxW = w * 0.65;
			if (approxW > maxW && approxW > 0.0)
			{
				new Float:ratio = maxW / approxW;
				scaleX *= ratio;
				scaleY *= ratio;
				if (scaleX < 0.08) scaleX = 0.08;
				if (scaleY < 0.18) scaleY = 0.18;
			}
		}
		return;
	}

	// Linear Bars (PB_STYLE_BAR):
	if (isVert)
	{
		new lines = PB_CountLabelLines(text);
		if (lines < 1) lines = 1;

		new Float:innerW = w - (border * 2.0);
		if (innerW < 2.0) innerW = w * 0.75;
		new Float:availW = innerW * 0.85;

		new Float:innerH = h - (border * 2.0);
		if (innerH < 4.0) innerH = h * 0.85;
		new Float:availH = innerH * 0.90;

		// Maximum scaleX allowed by the narrow bar width:
		// In SA-MP Font 1, the widest character ('%' or wide capital with outline) has width:
		// approxCharWidth = scaleX * 26.0 + 1.8
		// For approxCharWidth <= availW:
		new Float:maxSX_W = (availW > 1.8) ? ((availW - 1.8) / 26.0) : (availW / 30.0);
		if (maxSX_W < 0.05) maxSX_W = 0.05;

		// Convert to scaleY using standard font aspect ratio (scaleX / scaleY = 0.27):
		new Float:maxSY_W = maxSX_W / 0.27;

		// Maximum scaleY allowed by total vertical stack height:
		// In GTA SA Font 1, line advance for ~n~ is ~16.0 * scaleY, plus final glyph ~8.5 * scaleY:
		new Float:lineFactor = float(lines - 1) * 16.0 + 8.5;
		if (lineFactor < 8.5) lineFactor = 8.5;
		new Float:maxSY_H = (availH > 1.5) ? ((availH - 1.5) / lineFactor) : (availH / lineFactor);

		// Take the most constraining dimension so text fits in BOTH width and height:
		scaleY = (maxSY_W < maxSY_H) ? maxSY_W : maxSY_H;
		if (scaleY < 0.18) scaleY = 0.18;
		if (scaleY > 1.10) scaleY = 1.10;

		scaleX = scaleY * 0.27;
		if (scaleX < 0.05) scaleX = 0.05;
		if (scaleX > 0.28) scaleX = 0.28;
		return;
	}

	// Horizontal text inside Linear Bar (either horizontal bar OR wide vertical bar):
	new Float:innerH = h - (border * 2.0);
	if (innerH < 2.0) innerH = h * 0.80;
	new Float:availH = innerH * 0.82;

	new Float:innerW = w - (border * 2.0);
	if (innerW < 2.0) innerW = w * 0.85;
	new Float:availW = innerW * 0.88;

	// If bar is horizontal (w >= h), base scaleY is derived from bar thickness h:
	// If bar is vertical but wide (h > w), base scaleY is derived from a balanced standard size:
	if (w >= h)
	{
		scaleY = availH * 0.10;
		if (scaleY < 0.18) scaleY = 0.18;
		if (scaleY > 1.15) scaleY = 1.15;
	}
	else
	{
		scaleY = 0.75;
		if (scaleY * 8.5 > availH) scaleY = availH / 8.5;
		if (scaleY < 0.18) scaleY = 0.18;
	}

	scaleX = scaleY * 0.27;

	// Measure total horizontal string width to ensure it fits strictly inside availW:
	new len = strlen(text);
	if (len > 0)
	{
		new Float:approxW = float(len) * (scaleX * 22.0) + (float(len) * 1.5);
		if (approxW > availW && approxW > 0.0)
		{
			new Float:ratio = availW / approxW;
			scaleX *= ratio;
			scaleY *= ratio;
			if (scaleX < 0.06) scaleX = 0.06;
			if (scaleY < 0.16) scaleY = 0.16;
		}
	}
}

static stock PB_RenderLabel(playerid, barid)
{
	if (!ProgressBar[playerid][barid][PB_LabelEnabled])
	{
		PB_Kill(playerid, ProgressBar[playerid][barid][PB_Label]);
		return;
	}

	new labelBuf[96];
	PB_FormatLabel(playerid, barid, labelBuf, sizeof labelBuf);

	new Float:scaleX, Float:scaleY;
	if (ProgressBar[playerid][barid][PB_LabelAutoScale])
	{
		PB_CalculateLabelScale(playerid, barid, labelBuf, scaleX, scaleY);
		ProgressBar[playerid][barid][PB_LabelScaleX] = scaleX;
		ProgressBar[playerid][barid][PB_LabelScaleY] = scaleY;
	}
	else
	{
		scaleX = ProgressBar[playerid][barid][PB_LabelScaleX];
		scaleY = ProgressBar[playerid][barid][PB_LabelScaleY];
		if (scaleX <= 0.0) scaleX = 0.20;
		if (scaleY <= 0.0) scaleY = 0.60;
	}

	new align = ProgressBar[playerid][barid][PB_LabelAlignment];
	if (align < 1 || align > 3) align = 2;

	new Float:barX = ProgressBar[playerid][barid][PB_PosX];
	new Float:barY = ProgressBar[playerid][barid][PB_PosY];
	new Float:barW = ProgressBar[playerid][barid][PB_Width];
	new Float:barH = ProgressBar[playerid][barid][PB_Height];

	new bool:isVert = PB_IsLabelVertical(playerid, barid);
	ProgressBar[playerid][barid][PB_LabelIsVert] = isVert;
	ProgressBar[playerid][barid][PB_LabelLines] = PB_CountLabelLines(labelBuf);
	new Float:x, Float:y;

	if (isVert)
	{
		new lines = ProgressBar[playerid][barid][PB_LabelLines];
		if (lines < 1) lines = 1;
		new Float:blockHeight = (float(lines - 1) * 16.0 + 8.5) * scaleY;
		y = barY + ((barH - blockHeight) / 2.0) + ProgressBar[playerid][barid][PB_LabelOffsetY];

		if (align == 1) // Left
		{
			x = barX + 1.5 + ProgressBar[playerid][barid][PB_LabelOffsetX];
		}
		else if (align == 3) // Right
		{
			x = barX + barW - 1.5 + ProgressBar[playerid][barid][PB_LabelOffsetX];
		}
		else // Center
		{
			x = barX + (barW / 2.0) + ProgressBar[playerid][barid][PB_LabelOffsetX];
		}
	}
	else
	{
		// Accurate vertical glyph centering:
		new Float:glyphHeight = scaleY * 8.5;
		y = barY + ((barH - glyphHeight) / 2.0) + ProgressBar[playerid][barid][PB_LabelOffsetY];

		if (align == 1) // Left
		{
			x = barX + 2.5 + ProgressBar[playerid][barid][PB_LabelOffsetX];
		}
		else if (align == 3) // Right
		{
			x = barX + barW - 2.5 + ProgressBar[playerid][barid][PB_LabelOffsetX];
		}
		else // Center
		{
			x = barX + (barW / 2.0) + ProgressBar[playerid][barid][PB_LabelOffsetX];
		}
	}

	// Always destroy and recreate PB_Label so client immediately adopts font, size & alignment
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Label]);

	new PlayerText:td = CreatePlayerTextDraw(playerid, x, y, labelBuf);
	if (td == PB_NO_TD) return;

	ProgressBar[playerid][barid][PB_Label] = td;
	#if defined _INC_open_mp
	PlayerTextDrawAlignment(playerid, td, TEXT_DRAW_ALIGN:align);
	PlayerTextDrawFont(playerid, td, TEXT_DRAW_FONT:ProgressBar[playerid][barid][PB_LabelFont]);
	#else
	PlayerTextDrawAlignment(playerid, td, align);
	PlayerTextDrawFont(playerid, td, ProgressBar[playerid][barid][PB_LabelFont]);
	#endif
	PlayerTextDrawLetterSize(playerid, td, scaleX, scaleY);
	new col = PB_GetLabelColour(playerid, barid);
	ProgressBar[playerid][barid][PB_LabelCurrentColour] = col;
	PBP_TextDrawColour(playerid, td, col);
	PlayerTextDrawSetShadow(playerid, td, 0);
	PlayerTextDrawSetOutline(playerid, td, 1);
	PBP_TextDrawBackgroundColour(playerid, td, 0x000000AA);

	if (ProgressBar[playerid][barid][PB_Visible])
	{
		PlayerTextDrawShow(playerid, td);
	}
}

static stock PB_UpdateLabelText(playerid, barid)
{
	if (!ProgressBar[playerid][barid][PB_LabelEnabled]) return;
	new PlayerText:td = ProgressBar[playerid][barid][PB_Label];
	if (td == PB_NO_TD)
	{
		PB_RenderLabel(playerid, barid);
		return;
	}
	new labelBuf[96];
	PB_FormatLabel(playerid, barid, labelBuf, sizeof labelBuf);

	new bool:isVert = PB_IsLabelVertical(playerid, barid);
	if (isVert != ProgressBar[playerid][barid][PB_LabelIsVert])
	{
		PB_RenderLabel(playerid, barid);
		return;
	}
	if (isVert)
	{
		new lines = PB_CountLabelLines(labelBuf);
		if (lines != ProgressBar[playerid][barid][PB_LabelLines])
		{
			PB_RenderLabel(playerid, barid);
			return;
		}
	}

	PlayerTextDrawSetString(playerid, td, labelBuf);
	if (ProgressBar[playerid][barid][PB_LabelFollowColour])
	{
		new col = PB_GetLabelColour(playerid, barid);
		if (col != ProgressBar[playerid][barid][PB_LabelCurrentColour])
		{
			ProgressBar[playerid][barid][PB_LabelCurrentColour] = col;
			PBP_TextDrawColour(playerid, td, col);
			if (ProgressBar[playerid][barid][PB_Visible])
			{
				PlayerTextDrawShow(playerid, td);
			}
		}
	}
}

static stock bool:PB_Render(playerid, barid)
{
	ProgressBar[playerid][barid][PB_Rendered] = false;
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Border]);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Background]);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Progress]);
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		new bool:ok = PB_RenderRing(playerid, barid);
		if (!ok) return false;
		PB_RenderLabel(playerid, barid);
		ProgressBar[playerid][barid][PB_Rendered] = true;
		return true;
	}
	PB_KillRing(playerid, barid);
	new Float:x, Float:y, Float:width, Float:height;
	ProgressBar[playerid][barid][PB_Border] = PB_ShapeSprite(playerid, barid, ProgressBar[playerid][barid][PB_PosX], ProgressBar[playerid][barid][PB_PosY],
		ProgressBar[playerid][barid][PB_Width], ProgressBar[playerid][barid][PB_Height], PB_GetBorderColour(playerid, barid));
	if (ProgressBar[playerid][barid][PB_Border] == PB_NO_TD)
	{
		return false;
	}
	PB_Inner(playerid, barid, x, y, width, height);
	ProgressBar[playerid][barid][PB_Background] = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_BackgroundColour(PB_GetCurrentColour(playerid, barid)));
	if (ProgressBar[playerid][barid][PB_Background] == PB_NO_TD)
	{
		PB_Kill(playerid, ProgressBar[playerid][barid][PB_Border]);
		return false;
	}
	if (ProgressBar[playerid][barid][PB_Visible])
	{
		PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Border]);
		if (!PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Background]);
	}
	new bool:mainOk = PB_RenderMain(playerid, barid);
	if (!mainOk)
	{
		PB_Kill(playerid, ProgressBar[playerid][barid][PB_Background]);
		PB_Kill(playerid, ProgressBar[playerid][barid][PB_Border]);
		return false;
	}
	PB_RenderLabel(playerid, barid);
	ProgressBar[playerid][barid][PB_Rendered] = true;
	return true;
}

/*
================================================================================
    1. Lifecycle & Validation
================================================================================
*/

stock bool:IsValidPlayerProgressBar(playerid, barid)
{
	return (0 <= playerid < MAX_PLAYERS) && (0 <= barid < MAX_PLAYER_BARS) && ProgressBar[playerid][barid][PB_Valid];
}

stock CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 60.0, Float:height = 8.0, colour = PB_DEFAULT_COLOUR, Float:max = 100.0, direction = PB_DIR_RIGHT, Float:border = PB_BORDER_DEFAULT, bordercolour = 0, style = PB_STYLE_BAR, segments = PB_RING_SEGMENTS, Float:segmentscale = PB_RING_SEGMENT_SCALE)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return INVALID_PLAYER_BAR_ID;

	height = PB_CheckLegacyHeight(height, style, direction);
	if (segmentscale < PB_RING_SCALE_MIN) segmentscale = PB_RING_SCALE_MIN;
	else if (segmentscale > PB_RING_SCALE_MAX) segmentscale = PB_RING_SCALE_MAX;

	new needed = PB_GetBarRequiredTextDraws(style, segments, false);
	if (!PB_CanAllocatePlayerTextDraws(playerid, needed + PB_TD_SAFETY_HEADROOM))
	{
		return INVALID_PLAYER_BAR_ID;
	}

	new barid = INVALID_PLAYER_BAR_ID;
	for (new i = 0; i < MAX_PLAYER_BARS; i++)
	{
		if (!ProgressBar[playerid][i][PB_Valid])
		{
			barid = i;
			break;
		}
	}
	if (barid == INVALID_PLAYER_BAR_ID) return INVALID_PLAYER_BAR_ID;
	ProgressBar[playerid][barid][PB_Valid] = true;
	ProgressBar[playerid][barid][PB_Visible] = false;
	ProgressBar[playerid][barid][PB_Rendered] = false;
	ProgressBar[playerid][barid][PB_PosX] = x;
	ProgressBar[playerid][barid][PB_PosY] = y;
	ProgressBar[playerid][barid][PB_Width] = width;
	ProgressBar[playerid][barid][PB_Height] = height;
	ProgressBar[playerid][barid][PB_Colour] = colour;
	ProgressBar[playerid][barid][PB_MaxValue] = max;
	ProgressBar[playerid][barid][PB_Value] = 0.0;
	ProgressBar[playerid][barid][PB_Direction] = (PB_DIR_RIGHT <= direction <= PB_DIR_DOWN) ? direction : PB_DIR_RIGHT;
	ProgressBar[playerid][barid][PB_BorderSize] = PB_ClampBorder(border);
	ProgressBar[playerid][barid][PB_BorderColour] = bordercolour;
	ProgressBar[playerid][barid][PB_BlinkBorderColour] = 0;
	ProgressBar[playerid][barid][PB_BlinkColour] = 0;
	ProgressBar[playerid][barid][PB_Blinking] = false;
	ProgressBar[playerid][barid][PB_BlinkPhase] = false;
	ProgressBar[playerid][barid][PB_BlinkTimer] = 0;
	ProgressBar[playerid][barid][PB_AutoFill] = false;
	ProgressBar[playerid][barid][PB_AutoFillTimer] = 0;
	ProgressBar[playerid][barid][PB_LastLit] = -1;
	ProgressBar[playerid][barid][PB_Style] = (PB_STYLE_BAR <= style <= PB_STYLE_CIRCLE) ? style : PB_STYLE_BAR;
	ProgressBar[playerid][barid][PB_MinValue] = 0.0;
	ProgressBar[playerid][barid][PB_Segments] = PB_ClampSegments(segments);
	ProgressBar[playerid][barid][PB_SegmentScale] = (segmentscale <= 0.0) ? 1.0 : segmentscale;
	ProgressBar[playerid][barid][PB_Border] = PB_NO_TD;
	ProgressBar[playerid][barid][PB_Background] = PB_NO_TD;
	ProgressBar[playerid][barid][PB_Progress] = PB_NO_TD;
	ProgressBar[playerid][barid][PB_Empty] = false;
	ProgressBar[playerid][barid][PB_LabelEnabled] = false;
	ProgressBar[playerid][barid][PB_LabelAutoScale] = true;
	ProgressBar[playerid][barid][PB_LabelFollowColour] = false;
	ProgressBar[playerid][barid][PB_LabelOrientation] = PB_LABEL_ORIENT_AUTO;
	ProgressBar[playerid][barid][PB_LabelText][0] = '\0';
	strcat(ProgressBar[playerid][barid][PB_LabelText], "{PERCENT}%", 32);
	ProgressBar[playerid][barid][PB_LabelColour] = 0xFFFFFFFF;
	ProgressBar[playerid][barid][PB_LabelFont] = 1;
	ProgressBar[playerid][barid][PB_LabelAlignment] = 2;
	ProgressBar[playerid][barid][PB_LabelIsVert] = false;
	ProgressBar[playerid][barid][PB_LabelLines] = 0;
	ProgressBar[playerid][barid][PB_LabelScaleX] = 0.0;
	ProgressBar[playerid][barid][PB_LabelScaleY] = 0.0;
	ProgressBar[playerid][barid][PB_LabelOffsetX] = 0.0;
	ProgressBar[playerid][barid][PB_LabelOffsetY] = 0.0;
	ProgressBar[playerid][barid][PB_LerpActive] = false;
	ProgressBar[playerid][barid][PB_LerpTimer] = 0;
	ProgressBar[playerid][barid][PB_Gradient] = false;
	ProgressBar[playerid][barid][PB_GradientInverted] = false;
	ProgressBar[playerid][barid][PB_GradientEmpty] = 0xE74C3CFF;
	ProgressBar[playerid][barid][PB_GradientMid] = 0xF1C40FFF;
	ProgressBar[playerid][barid][PB_GradientFull] = 0x2ECC71FF;
	ProgressBar[playerid][barid][PB_Label] = PB_NO_TD;
	if (!PB_Render(playerid, barid))
	{
		DestroyPlayerProgressBar(playerid, barid);
		return INVALID_PLAYER_BAR_ID;
	}
	PB_InvalidateFreeTDCache(playerid);
	return barid;
}

stock DestroyPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PB_KillBlink(playerid, barid);
	PB_KillAutoFill(playerid, barid);
	PB_KillLerp(playerid, barid);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Border]);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Background]);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Progress]);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Label]);
	PB_KillRing(playerid, barid);
	ProgressBar[playerid][barid][PB_Valid] = false;
	ProgressBar[playerid][barid][PB_Visible] = false;
	ProgressBar[playerid][barid][PB_Rendered] = false;
	ProgressBar[playerid][barid][PB_LabelEnabled] = false;
	PB_InvalidateFreeTDCache(playerid);
	return 1;
}

stock DestroyAllPlayerProgressBars(playerid)
{
	if (!(0 <= playerid < MAX_PLAYERS)) return 0;
	for (new i = 0; i < MAX_PLAYER_BARS; i++) DestroyPlayerProgressBar(playerid, i);
	return 1;
}

/*
================================================================================
    2. Visibility Management
================================================================================
*/

stock ShowPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_Visible] = true;
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		PB_ApplyRingColours(playerid, barid);
		if (ProgressBar[playerid][barid][PB_LabelEnabled] && ProgressBar[playerid][barid][PB_Label] != PB_NO_TD)
		{
			PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Label]);
		}
		return 1;
	}
	if (ProgressBar[playerid][barid][PB_Border] != PB_NO_TD) PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Border]);
	PB_ShowInner(playerid, barid);
	if (ProgressBar[playerid][barid][PB_LabelEnabled] && ProgressBar[playerid][barid][PB_Label] != PB_NO_TD)
	{
		PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Label]);
	}
	return 1;
}

stock HidePlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (!ProgressBar[playerid][barid][PB_Visible]) return 1;
	ProgressBar[playerid][barid][PB_Visible] = false;
	if (ProgressBar[playerid][barid][PB_Label] != PB_NO_TD)
	{
		PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][PB_Label]);
	}
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		for (new t = 0; t < PB_MAX_TDS; t++)
		{
			if (PB_TDOwner[playerid][t] != barid + 1) continue;
			PlayerTextDrawHide(playerid, PlayerText:t);
			PB_TDPart[playerid][t] &= ~PB_TD_SHOWN;
		}
		return 1;
	}
	if (ProgressBar[playerid][barid][PB_Border] != PB_NO_TD) PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][PB_Border]);
	if (ProgressBar[playerid][barid][PB_Background] != PB_NO_TD) PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][PB_Background]);
	if (ProgressBar[playerid][barid][PB_Progress] != PB_NO_TD) PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][PB_Progress]);
	return 1;
}

stock bool:IsPlayerProgressBarVisible(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_Visible];
}

stock bool:IsPlayerProgressBarRendered(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_Rendered];
}

stock ResetPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	StopPlayerProgressBarInterpolation(playerid, barid);
	StopAutoFillPlayerProgressBar(playerid, barid);
	StopPlayerProgressBarBlink(playerid, barid);
	return SetPlayerProgressBarValue(playerid, barid, ProgressBar[playerid][barid][PB_MinValue]);
}

/*
================================================================================
    3. Value & Range Control
================================================================================
*/

stock SetPlayerProgressBarValue(playerid, barid, Float:value, bool:bar_show = false)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (value < ProgressBar[playerid][barid][PB_MinValue]) value = ProgressBar[playerid][barid][PB_MinValue];
	if (value > ProgressBar[playerid][barid][PB_MaxValue]) value = ProgressBar[playerid][barid][PB_MaxValue];
	if (value != ProgressBar[playerid][barid][PB_Value])
	{
		ProgressBar[playerid][barid][PB_Value] = value;
		if (ProgressBar[playerid][barid][PB_Gradient]) PB_ApplyColours(playerid, barid);
		PB_RenderMain(playerid, barid);
		PB_UpdateLabelText(playerid, barid);
	}
	if (bar_show && !ProgressBar[playerid][barid][PB_Visible]) ShowPlayerProgressBar(playerid, barid);
	return 1;
}

stock Float:GetPlayerProgressBarValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][PB_Value];
}

stock SetPlayerProgressBarMaxValue(playerid, barid, Float:max = 100.0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (max == ProgressBar[playerid][barid][PB_MaxValue]) return 1;
	if (max < ProgressBar[playerid][barid][PB_MinValue]) ProgressBar[playerid][barid][PB_MinValue] = max;
	ProgressBar[playerid][barid][PB_MaxValue] = max;
	if (ProgressBar[playerid][barid][PB_Value] > max) ProgressBar[playerid][barid][PB_Value] = max;
	if (ProgressBar[playerid][barid][PB_Value] < ProgressBar[playerid][barid][PB_MinValue]) ProgressBar[playerid][barid][PB_Value] = ProgressBar[playerid][barid][PB_MinValue];
	if (ProgressBar[playerid][barid][PB_AutoFillMax] > max) ProgressBar[playerid][barid][PB_AutoFillMax] = max;
	if (ProgressBar[playerid][barid][PB_Gradient]) PB_ApplyColours(playerid, barid);
	PB_RenderMain(playerid, barid);
	PB_UpdateLabelText(playerid, barid);
	return 1;
}

stock Float:GetPlayerProgressBarMaxValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][PB_MaxValue];
}

stock SetPlayerProgressBarMinValue(playerid, barid, Float:min = 0.0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (min == ProgressBar[playerid][barid][PB_MinValue]) return 1;
	ProgressBar[playerid][barid][PB_MinValue] = min;
	if (ProgressBar[playerid][barid][PB_Value] < min) ProgressBar[playerid][barid][PB_Value] = min;
	if (ProgressBar[playerid][barid][PB_MaxValue] < min) ProgressBar[playerid][barid][PB_MaxValue] = min;
	if (ProgressBar[playerid][barid][PB_Gradient]) PB_ApplyColours(playerid, barid);
	PB_RenderMain(playerid, barid);
	PB_UpdateLabelText(playerid, barid);
	return 1;
}

stock Float:GetPlayerProgressBarMinValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][PB_MinValue];
}

stock SetPlayerProgressBarRange(playerid, barid, Float:min, Float:max)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (max < min) max = min;
	if (min == ProgressBar[playerid][barid][PB_MinValue] && max == ProgressBar[playerid][barid][PB_MaxValue]) return 1;
	ProgressBar[playerid][barid][PB_MinValue] = min;
	ProgressBar[playerid][barid][PB_MaxValue] = max;
	if (ProgressBar[playerid][barid][PB_Value] < min) ProgressBar[playerid][barid][PB_Value] = min;
	if (ProgressBar[playerid][barid][PB_Value] > max) ProgressBar[playerid][barid][PB_Value] = max;
	if (ProgressBar[playerid][barid][PB_AutoFillMax] > max) ProgressBar[playerid][barid][PB_AutoFillMax] = max;
	if (ProgressBar[playerid][barid][PB_Gradient]) PB_ApplyColours(playerid, barid);
	PB_RenderMain(playerid, barid);
	PB_UpdateLabelText(playerid, barid);
	return 1;
}

/*
================================================================================
    4. Positioning & Dimensions
================================================================================
*/

stock SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (ProgressBar[playerid][barid][PB_Rendered] && x == ProgressBar[playerid][barid][PB_PosX] && y == ProgressBar[playerid][barid][PB_PosY]) return 1;
	ProgressBar[playerid][barid][PB_PosX] = x;
	ProgressBar[playerid][barid][PB_PosY] = y;
	return _:PB_Render(playerid, barid);
}

stock GetPlayerProgressBarPos(playerid, barid, &Float:x, &Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	x = ProgressBar[playerid][barid][PB_PosX];
	y = ProgressBar[playerid][barid][PB_PosY];
	return 1;
}

stock SetPlayerProgressBarSize(playerid, barid, Float:width, Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	height = PB_CheckLegacyHeight(height, ProgressBar[playerid][barid][PB_Style], ProgressBar[playerid][barid][PB_Direction]);
	if (ProgressBar[playerid][barid][PB_Rendered] && width == ProgressBar[playerid][barid][PB_Width] && height == ProgressBar[playerid][barid][PB_Height]) return 1;
	ProgressBar[playerid][barid][PB_Width] = width;
	ProgressBar[playerid][barid][PB_Height] = height;
	return _:PB_Render(playerid, barid);
}

stock GetPlayerProgressBarSize(playerid, barid, &Float:width, &Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	width = ProgressBar[playerid][barid][PB_Width];
	height = ProgressBar[playerid][barid][PB_Height];
	return 1;
}

stock SetPlayerProgressBarWidth(playerid, barid, Float:width)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (ProgressBar[playerid][barid][PB_Rendered] && width == ProgressBar[playerid][barid][PB_Width]) return 1;
	ProgressBar[playerid][barid][PB_Width] = width;
	return _:PB_Render(playerid, barid);
}

stock Float:GetPlayerProgressBarWidth(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][PB_Width];
}

stock SetPlayerProgressBarHeight(playerid, barid, Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	height = PB_CheckLegacyHeight(height, ProgressBar[playerid][barid][PB_Style], ProgressBar[playerid][barid][PB_Direction]);
	if (ProgressBar[playerid][barid][PB_Rendered] && height == ProgressBar[playerid][barid][PB_Height]) return 1;
	ProgressBar[playerid][barid][PB_Height] = height;
	return _:PB_Render(playerid, barid);
}

stock Float:GetPlayerProgressBarHeight(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][PB_Height];
}

stock SetPlayerProgressBarDirection(playerid, barid, direction = PB_DIR_RIGHT)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (direction < PB_DIR_RIGHT || direction > PB_DIR_DOWN) direction = PB_DIR_RIGHT;
	if (ProgressBar[playerid][barid][PB_Rendered] && direction == ProgressBar[playerid][barid][PB_Direction]) return 1;
	ProgressBar[playerid][barid][PB_Direction] = direction;
	ProgressBar[playerid][barid][PB_Height] = PB_CheckLegacyHeight(ProgressBar[playerid][barid][PB_Height], ProgressBar[playerid][barid][PB_Style], direction);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Progress]);
	return _:PB_Render(playerid, barid);
}

stock GetPlayerProgressBarDirection(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][PB_Direction];
}

/*
================================================================================
    5. Styles & Geometry Configuration
================================================================================
*/

stock SetPlayerProgressBarStyle(playerid, barid, style = PB_STYLE_BAR, segments = PB_RING_SEGMENTS, Float:segmentscale = PB_RING_SEGMENT_SCALE)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	new targetStyle = (PB_STYLE_BAR <= style <= PB_STYLE_CIRCLE) ? style : PB_STYLE_BAR;
	new targetSegs = PB_ClampSegments(segments);
	if (segmentscale < PB_RING_SCALE_MIN) segmentscale = PB_RING_SCALE_MIN;
	else if (segmentscale > PB_RING_SCALE_MAX) segmentscale = PB_RING_SCALE_MAX;
	if (ProgressBar[playerid][barid][PB_Rendered] && targetStyle == ProgressBar[playerid][barid][PB_Style] && targetSegs == ProgressBar[playerid][barid][PB_Segments] && segmentscale == ProgressBar[playerid][barid][PB_SegmentScale]) return 1;
	new currentNeeded = PB_GetBarRequiredTextDraws(ProgressBar[playerid][barid][PB_Style], ProgressBar[playerid][barid][PB_Segments], false);
	new targetNeeded = PB_GetBarRequiredTextDraws(targetStyle, targetSegs, false);
	new delta = targetNeeded - currentNeeded;
	if (delta > 0 && !PB_CanAllocatePlayerTextDraws(playerid, delta + PB_TD_SAFETY_HEADROOM))
	{
		return 0;
	}
	ProgressBar[playerid][barid][PB_Style] = targetStyle;
	ProgressBar[playerid][barid][PB_Segments] = targetSegs;
	ProgressBar[playerid][barid][PB_SegmentScale] = segmentscale;
	ProgressBar[playerid][barid][PB_Height] = PB_CheckLegacyHeight(ProgressBar[playerid][barid][PB_Height], targetStyle, ProgressBar[playerid][barid][PB_Direction]);
	new ret = _:PB_Render(playerid, barid);
	PB_InvalidateFreeTDCache(playerid);
	return ret;
}

stock GetPlayerProgressBarStyle(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][PB_Style];
}

stock SetPlayerProgressBarSegments(playerid, barid, segments)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	new targetSegs = PB_ClampSegments(segments);
	if (ProgressBar[playerid][barid][PB_Rendered] && targetSegs == ProgressBar[playerid][barid][PB_Segments]) return 1;
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		new currentNeeded = ProgressBar[playerid][barid][PB_Segments] * 2;
		new targetNeeded = targetSegs * 2;
		new delta = targetNeeded - currentNeeded;
		if (delta > 0 && !PB_CanAllocatePlayerTextDraws(playerid, delta + PB_TD_SAFETY_HEADROOM))
		{
			return 0;
		}
	}
	ProgressBar[playerid][barid][PB_Segments] = targetSegs;
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		new ret = _:PB_Render(playerid, barid);
		PB_InvalidateFreeTDCache(playerid);
		return ret;
	}
	return 1;
}

stock GetPlayerProgressBarSegments(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][PB_Segments];
}

stock SetPlayerProgressBarRingScale(playerid, barid, Float:scale)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (scale < PB_RING_SCALE_MIN) scale = PB_RING_SCALE_MIN;
	else if (scale > PB_RING_SCALE_MAX) scale = PB_RING_SCALE_MAX;
	if (ProgressBar[playerid][barid][PB_Rendered] && scale == ProgressBar[playerid][barid][PB_SegmentScale]) return 1;
	ProgressBar[playerid][barid][PB_SegmentScale] = scale;
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING) return _:PB_Render(playerid, barid);
	return 1;
}

stock Float:GetPlayerProgressBarRingScale(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0.0;
	return ProgressBar[playerid][barid][PB_SegmentScale];
}

/*
================================================================================
    6. Colors & Border Styling
================================================================================
*/

stock SetPlayerProgressBarColour(playerid, barid, colour = PB_DEFAULT_COLOUR)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (ProgressBar[playerid][barid][PB_Rendered] && colour == ProgressBar[playerid][barid][PB_Colour]) return 1;
	ProgressBar[playerid][barid][PB_Colour] = colour;
	PB_ApplyColours(playerid, barid);
	return 1;
}

#define SetPlayerProgressBarSegmentScale SetPlayerProgressBarRingScale
#define GetPlayerProgressBarSegmentScale GetPlayerProgressBarRingScale
#define SetPlayerProgressBarAutoFill AutoFillPlayerProgressBar
#define SetPlayerProgressBarBlink BlinkPlayerProgressBar
#define SetPlayerProgressBarFlash BlinkPlayerProgressBar
#define StopPlayerProgressBarFlash StopPlayerProgressBarBlink
#define IsPlayerProgressBarFlashing IsPlayerProgressBarBlinking

#define SetPlayerProgressBarColor SetPlayerProgressBarColour

stock GetPlayerProgressBarColour(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][PB_Colour];
}

#define GetPlayerProgressBarColor GetPlayerProgressBarColour

stock SetPlayerProgressBarBorder(playerid, barid, Float:border = PB_BORDER_DEFAULT)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	new Float:clamped = PB_ClampBorder(border);
	if (ProgressBar[playerid][barid][PB_Rendered] && clamped == ProgressBar[playerid][barid][PB_BorderSize]) return 1;
	ProgressBar[playerid][barid][PB_BorderSize] = clamped;
	return _:PB_Render(playerid, barid);
}

stock Float:GetPlayerProgressBarBorder(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][PB_BorderSize];
}

stock SetPlayerProgressBarBorderColor(playerid, barid, bordercolor = 0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (ProgressBar[playerid][barid][PB_Rendered] && bordercolor == ProgressBar[playerid][barid][PB_BorderColour]) return 1;
	ProgressBar[playerid][barid][PB_BorderColour] = bordercolor;
	PB_ApplyColours(playerid, barid);
	return 1;
}

#define SetPlayerProgressBarBorderColour SetPlayerProgressBarBorderColor

stock GetPlayerProgressBarBorderColor(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][PB_BorderColour];
}

#define GetPlayerProgressBarBorderColour GetPlayerProgressBarBorderColor

/*
================================================================================
    7. Dynamic Auto-Fill Animations
================================================================================
*/

stock AutoFillPlayerProgressBar(playerid, barid, Float:maxvalue = -1.0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (ProgressBar[playerid][barid][PB_LerpActive])
	{
		StopPlayerProgressBarInterpolation(playerid, barid);
	}
	PB_KillAutoFill(playerid, barid);
	new Float:limit = ProgressBar[playerid][barid][PB_MaxValue];
	if (maxvalue < 0.0 || maxvalue > limit) maxvalue = limit;
	ProgressBar[playerid][barid][PB_AutoFill] = true;
	ProgressBar[playerid][barid][PB_AutoFillMax] = maxvalue;
	ProgressBar[playerid][barid][PB_AutoFillStart] = GetTickCount();
	ProgressBar[playerid][barid][PB_LastLit] = -1;
	ProgressBar[playerid][barid][PB_AutoFillTimer] = SetTimerEx("PB_AutoFillTick", PB_AUTOFILL_TICK, true, "ii", playerid, barid);
	if (ProgressBar[playerid][barid][PB_Gradient]) PB_ApplyColours(playerid, barid);
	PB_RenderMain(playerid, barid);
	if (!ProgressBar[playerid][barid][PB_Visible]) ShowPlayerProgressBar(playerid, barid);
	return 1;
}

stock StopAutoFillPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (!ProgressBar[playerid][barid][PB_AutoFill]) return 1;
	PB_KillAutoFill(playerid, barid);
	if (ProgressBar[playerid][barid][PB_Gradient]) PB_ApplyColours(playerid, barid);
	PB_RenderMain(playerid, barid);
	PB_UpdateLabelText(playerid, barid);
	return 1;
}
#define StopPlayerProgressBarAutoFill StopAutoFillPlayerProgressBar

stock bool:IsPlayerProgressBarAutoFilling(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_AutoFill];
}

forward PB_AutoFillTick(playerid, barid);
public PB_AutoFillTick(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid) || !ProgressBar[playerid][barid][PB_AutoFill])
	{
		PB_KillAutoFill(playerid, barid);
		return 0;
	}
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		new lit = PB_RingLit(playerid, barid);
		if (lit == ProgressBar[playerid][barid][PB_LastLit] && !ProgressBar[playerid][barid][PB_Gradient])
		{
			PB_UpdateLabelText(playerid, barid);
			return 1;
		}
		ProgressBar[playerid][barid][PB_LastLit] = lit;
	}
	if (ProgressBar[playerid][barid][PB_Gradient]) PB_ApplyColours(playerid, barid);
	PB_RenderMain(playerid, barid);
	PB_UpdateLabelText(playerid, barid);
	return 1;
}

/*
================================================================================
    8. Smooth Value Interpolation (Lerp) & Dynamic Color Gradients
================================================================================
*/

forward PB_LerpTick(playerid, barid);
public PB_LerpTick(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid) || !ProgressBar[playerid][barid][PB_LerpActive])
	{
		PB_KillLerp(playerid, barid);
		return 0;
	}
	new now = GetTickCount();
	new elapsed = now - ProgressBar[playerid][barid][PB_LerpStartTime];
	new duration = ProgressBar[playerid][barid][PB_LerpDuration];
	if (duration <= 0 || elapsed >= duration)
	{
		new Float:target = ProgressBar[playerid][barid][PB_LerpTargetVal];
		PB_KillLerp(playerid, barid);
		SetPlayerProgressBarValue(playerid, barid, target);
		return 1;
	}
	new Float:t = float(elapsed) / float(duration);
	t = t * (2.0 - t); // Smooth ease-out curve
	new Float:start = ProgressBar[playerid][barid][PB_LerpStartVal];
	new Float:target = ProgressBar[playerid][barid][PB_LerpTargetVal];
	new Float:val = start + (target - start) * t;
	ProgressBar[playerid][barid][PB_Value] = val;
	if (ProgressBar[playerid][barid][PB_Gradient]) PB_ApplyColours(playerid, barid);
	PB_RenderMain(playerid, barid);
	PB_UpdateLabelText(playerid, barid);
	return 1;
}

stock InterpolatePlayerProgressBarValue(playerid, barid, Float:target_value, duration_ms = 500)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (ProgressBar[playerid][barid][PB_AutoFill])
	{
		StopAutoFillPlayerProgressBar(playerid, barid);
	}
	PB_KillLerp(playerid, barid);
	if (target_value < ProgressBar[playerid][barid][PB_MinValue]) target_value = ProgressBar[playerid][barid][PB_MinValue];
	if (target_value > ProgressBar[playerid][barid][PB_MaxValue]) target_value = ProgressBar[playerid][barid][PB_MaxValue];
	if (duration_ms <= 0 || target_value == ProgressBar[playerid][barid][PB_Value])
	{
		SetPlayerProgressBarValue(playerid, barid, target_value, true);
		return 1;
	}
	ProgressBar[playerid][barid][PB_LerpActive] = true;
	ProgressBar[playerid][barid][PB_LerpStartVal] = ProgressBar[playerid][barid][PB_Value];
	ProgressBar[playerid][barid][PB_LerpTargetVal] = target_value;
	ProgressBar[playerid][barid][PB_LerpStartTime] = GetTickCount();
	ProgressBar[playerid][barid][PB_LerpDuration] = duration_ms;
	ProgressBar[playerid][barid][PB_LerpTimer] = SetTimerEx("PB_LerpTick", PB_TICK_RATE, true, "ii", playerid, barid);
	if (!ProgressBar[playerid][barid][PB_Visible]) ShowPlayerProgressBar(playerid, barid);
	return 1;
}

stock StopPlayerProgressBarInterpolation(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (!ProgressBar[playerid][barid][PB_LerpActive]) return 1;
	PB_KillLerp(playerid, barid);
	return 1;
}

stock bool:IsPlayerProgressBarInterpolating(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_LerpActive];
}

stock SetPlayerProgressBarGradient(playerid, barid, bool:enable, colour_empty = 0xE74C3CFF, colour_full = 0x2ECC71FF, colour_mid = 0xF1C40FFF, bool:inverted = false)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_Gradient] = enable;
	ProgressBar[playerid][barid][PB_GradientEmpty] = colour_empty;
	ProgressBar[playerid][barid][PB_GradientFull] = colour_full;
	ProgressBar[playerid][barid][PB_GradientMid] = colour_mid;
	ProgressBar[playerid][barid][PB_GradientInverted] = inverted;
	PB_ApplyColours(playerid, barid);
	return 1;
}

stock SetPlayerProgressBarGradientInverted(playerid, barid, bool:inverted)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_GradientInverted] = inverted;
	if (ProgressBar[playerid][barid][PB_Gradient]) PB_ApplyColours(playerid, barid);
	return 1;
}
#define SetPlayerProgressBarGradientDirection SetPlayerProgressBarGradientInverted

stock bool:IsPlayerProgressBarGradientInverted(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return false;
	return ProgressBar[playerid][barid][PB_GradientInverted];
}
#define IsPlayerProgressBarGradientDirection IsPlayerProgressBarGradientInverted

stock StopPlayerProgressBarGradient(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_Gradient] = false;
	PB_ApplyColours(playerid, barid);
	return 1;
}

stock bool:IsPlayerProgressBarGradientEnabled(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_Gradient];
}

/*
================================================================================
    8. Pulsing & Blinking Visual Alerts
================================================================================
*/

stock BlinkPlayerProgressBar(playerid, barid, interval = PB_BLINK_DEFAULT, duration = 0, colour = 0, bordercolour = 0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PB_KillBlink(playerid, barid);
	if (interval < PB_BLINK_MIN) interval = PB_BLINK_MIN;
	if (interval > PB_BLINK_MAX) interval = PB_BLINK_MAX;
	if (duration < 0) duration = 0;
	ProgressBar[playerid][barid][PB_Blinking] = true;
	ProgressBar[playerid][barid][PB_BlinkPhase] = true;
	ProgressBar[playerid][barid][PB_BlinkColour] = colour;
	ProgressBar[playerid][barid][PB_BlinkBorderColour] = bordercolour;
	ProgressBar[playerid][barid][PB_BlinkStart] = GetTickCount();
	ProgressBar[playerid][barid][PB_BlinkDuration] = duration;
	ProgressBar[playerid][barid][PB_BlinkTimer] = SetTimerEx("PB_BlinkTick", interval, true, "ii", playerid, barid);
	PB_ApplyColours(playerid, barid);
	if (!ProgressBar[playerid][barid][PB_Visible]) ShowPlayerProgressBar(playerid, barid);
	return 1;
}

stock StopPlayerProgressBarBlink(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (!ProgressBar[playerid][barid][PB_Blinking]) return 1;
	PB_KillBlink(playerid, barid);
	PB_ApplyColours(playerid, barid);
	return 1;
}

stock bool:IsPlayerProgressBarBlinking(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_Blinking];
}

forward PB_BlinkTick(playerid, barid);
public PB_BlinkTick(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid) || !ProgressBar[playerid][barid][PB_Blinking])
	{
		PB_KillBlink(playerid, barid);
		return 0;
	}
	new duration = ProgressBar[playerid][barid][PB_BlinkDuration];
	if (duration > 0 && GetTickCount() - ProgressBar[playerid][barid][PB_BlinkStart] >= duration)
	{
		StopPlayerProgressBarBlink(playerid, barid);
		return 1;
	}
	ProgressBar[playerid][barid][PB_BlinkPhase] = !ProgressBar[playerid][barid][PB_BlinkPhase];
	PB_ApplyColours(playerid, barid);
	return 1;
}

/*
================================================================================
    9. Visual Value & Text Labels
================================================================================
*/

stock SetPlayerProgressBarLabel(playerid, barid, bool:enable, const template[] = "{PERCENT}%", colour = 0xFFFFFFFF, alignment = 2, font = 1, Float:scaleX = 0.0, Float:scaleY = 0.0, Float:offsetX = 0.0, Float:offsetY = 0.0, bool:followColour = false, orientation = PB_LABEL_ORIENT_AUTO)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (enable && ProgressBar[playerid][barid][PB_Label] == PB_NO_TD)
	{
		if (!PB_CanAllocatePlayerTextDraws(playerid, 1 + PB_TD_SAFETY_HEADROOM)) return 0;
	}
	ProgressBar[playerid][barid][PB_LabelEnabled] = enable;
	ProgressBar[playerid][barid][PB_LabelAutoScale] = (scaleX <= 0.0 || scaleY <= 0.0);
	ProgressBar[playerid][barid][PB_LabelText][0] = '\0';
	strcat(ProgressBar[playerid][barid][PB_LabelText], template, 32);
	if (colour == 0)
	{
		ProgressBar[playerid][barid][PB_LabelFollowColour] = true;
		ProgressBar[playerid][barid][PB_LabelColour] = PB_GetCurrentColour(playerid, barid);
	}
	else
	{
		ProgressBar[playerid][barid][PB_LabelColour] = colour;
		ProgressBar[playerid][barid][PB_LabelFollowColour] = followColour;
	}
	ProgressBar[playerid][barid][PB_LabelOrientation] = orientation;
	ProgressBar[playerid][barid][PB_LabelAlignment] = alignment;
	ProgressBar[playerid][barid][PB_LabelFont] = font;
	ProgressBar[playerid][barid][PB_LabelScaleX] = scaleX;
	ProgressBar[playerid][barid][PB_LabelScaleY] = scaleY;
	ProgressBar[playerid][barid][PB_LabelOffsetX] = offsetX;
	ProgressBar[playerid][barid][PB_LabelOffsetY] = offsetY;
	PB_RenderLabel(playerid, barid);
	return 1;
}

stock SetPlayerProgressBarLabelAutoScale(playerid, barid, bool:autoScale)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_LabelAutoScale] = autoScale;
	PB_RenderLabel(playerid, barid);
	return 1;
}

stock bool:IsPlayerProgressBarLabelAutoScale(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_LabelAutoScale];
}

stock SetPlayerProgressBarLabelText(playerid, barid, const template[])
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_LabelText][0] = '\0';
	strcat(ProgressBar[playerid][barid][PB_LabelText], template, 32);
	PB_UpdateLabelText(playerid, barid);
	return 1;
}

stock SetPlayerProgressBarLabelColour(playerid, barid, colour)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (colour == 0)
	{
		ProgressBar[playerid][barid][PB_LabelFollowColour] = true;
		ProgressBar[playerid][barid][PB_LabelColour] = PB_GetCurrentColour(playerid, barid);
	}
	else
	{
		ProgressBar[playerid][barid][PB_LabelFollowColour] = false;
		ProgressBar[playerid][barid][PB_LabelColour] = colour;
	}
	if (ProgressBar[playerid][barid][PB_Label] != PB_NO_TD)
	{
		new col = PB_GetLabelColour(playerid, barid);
		ProgressBar[playerid][barid][PB_LabelCurrentColour] = col;
		PBP_TextDrawColour(playerid, ProgressBar[playerid][barid][PB_Label], col);
		if (ProgressBar[playerid][barid][PB_Visible])
		{
			PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Label]);
		}
	}
	return 1;
}

stock SetPlayerProgressBarLabelFollowColour(playerid, barid, bool:follow)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_LabelFollowColour] = follow;
	if (ProgressBar[playerid][barid][PB_Label] != PB_NO_TD)
	{
		new col = PB_GetLabelColour(playerid, barid);
		ProgressBar[playerid][barid][PB_LabelCurrentColour] = col;
		PBP_TextDrawColour(playerid, ProgressBar[playerid][barid][PB_Label], col);
		if (ProgressBar[playerid][barid][PB_Visible])
		{
			PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Label]);
		}
	}
	return 1;
}
#define SetPlayerProgressBarLabelFollowColor SetPlayerProgressBarLabelFollowColour

stock bool:GetPlayerProgressBarLabelFollowColour(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return false;
	return ProgressBar[playerid][barid][PB_LabelFollowColour];
}
#define GetPlayerProgressBarLabelFollowColor GetPlayerProgressBarLabelFollowColour

stock SetPlayerProgressBarLabelOrientation(playerid, barid, orientation = PB_LABEL_ORIENT_AUTO)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (orientation < PB_LABEL_ORIENT_AUTO || orientation > PB_LABEL_ORIENT_VERTICAL) orientation = PB_LABEL_ORIENT_AUTO;
	ProgressBar[playerid][barid][PB_LabelOrientation] = orientation;
	PB_RenderLabel(playerid, barid);
	return 1;
}

stock GetPlayerProgressBarLabelOrientation(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return PB_LABEL_ORIENT_AUTO;
	return ProgressBar[playerid][barid][PB_LabelOrientation];
}
#define SetPlayerProgressBarLabelColor SetPlayerProgressBarLabelColour

stock GetPlayerProgressBarLabelColour(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return PB_GetLabelColour(playerid, barid);
}
#define GetPlayerProgressBarLabelColor GetPlayerProgressBarLabelColour

stock GetPlayerProgressBarLabelScale(playerid, barid, &Float:scaleX, &Float:scaleY)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	scaleX = ProgressBar[playerid][barid][PB_LabelScaleX];
	scaleY = ProgressBar[playerid][barid][PB_LabelScaleY];
	return 1;
}

stock GetPlayerProgressBarLabelOffset(playerid, barid, &Float:offsetX, &Float:offsetY)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	offsetX = ProgressBar[playerid][barid][PB_LabelOffsetX];
	offsetY = ProgressBar[playerid][barid][PB_LabelOffsetY];
	return 1;
}

stock GetPlayerProgressBarLabelAlignment(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][PB_LabelAlignment];
}
#define GetPlayerProgressBarLabelAlign GetPlayerProgressBarLabelAlignment

stock GetPlayerProgressBarLabelFont(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][PB_LabelFont];
}

stock SetPlayerProgressBarLabelScale(playerid, barid, Float:scaleX, Float:scaleY)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_LabelAutoScale] = (scaleX <= 0.0 || scaleY <= 0.0);
	ProgressBar[playerid][barid][PB_LabelScaleX] = scaleX;
	ProgressBar[playerid][barid][PB_LabelScaleY] = scaleY;
	PB_RenderLabel(playerid, barid);
	return 1;
}

stock SetPlayerProgressBarLabelOffset(playerid, barid, Float:offsetX, Float:offsetY)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_LabelOffsetX] = offsetX;
	ProgressBar[playerid][barid][PB_LabelOffsetY] = offsetY;
	PB_RenderLabel(playerid, barid);
	return 1;
}

stock bool:IsPlayerProgressBarLabelEnabled(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_LabelEnabled];
}

stock GetPlayerProgressBarLabelText(playerid, barid, dest[], size = sizeof dest)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	dest[0] = '\0';
	strcat(dest, ProgressBar[playerid][barid][PB_LabelText], size);
	return 1;
}

/*
================================================================================
    10. Server Callbacks & ALS Lifecycle Hooks
================================================================================
*/

public OnPlayerDisconnect(playerid, reason)
{
	if (0 <= playerid < MAX_PLAYERS)
	{
		DestroyAllPlayerProgressBars(playerid);
		for (new t = 0; t < PB_MAX_TDS; t++)
		{
			PB_TDOwner[playerid][t] = 0;
			PB_TDPart[playerid][t] = 0;
			PB_TDColour[playerid][t] = 0;
		}
		PB_InvalidateFreeTDCache(playerid);
	}
	#if defined PB_OnPlayerDisconnect
		return PB_OnPlayerDisconnect(playerid, reason);
	#else
		return 1;
	#endif
}

#if defined _ALS_OnPlayerDisconnect
	#undef OnPlayerDisconnect
#else
	#define _ALS_OnPlayerDisconnect
#endif
#define OnPlayerDisconnect PB_OnPlayerDisconnect
#if defined PB_OnPlayerDisconnect
	forward PB_OnPlayerDisconnect(playerid, reason);
#endif

#if defined FILTERSCRIPT
public OnFilterScriptExit()
{
	for (new p = 0; p < MAX_PLAYERS; p++)
	{
		if (IsPlayerConnected(p)) DestroyAllPlayerProgressBars(p);
	}
	#if defined PB_OnFilterScriptExit
		return PB_OnFilterScriptExit();
	#else
		return 1;
	#endif
}

#if defined _ALS_OnFilterScriptExit
	#undef OnFilterScriptExit
#else
	#define _ALS_OnFilterScriptExit
#endif
#define OnFilterScriptExit PB_OnFilterScriptExit
#if defined PB_OnFilterScriptExit
	forward PB_OnFilterScriptExit();
#endif

#else

public OnGameModeExit()
{
	for (new p = 0; p < MAX_PLAYERS; p++)
	{
		if (IsPlayerConnected(p)) DestroyAllPlayerProgressBars(p);
	}
	#if defined PB_OnGameModeExit
		return PB_OnGameModeExit();
	#else
		return 1;
	#endif
}

#if defined _ALS_OnGameModeExit
	#undef OnGameModeExit
#else
	#define _ALS_OnGameModeExit
#endif
#define OnGameModeExit PB_OnGameModeExit
#if defined PB_OnGameModeExit
	forward PB_OnGameModeExit();
#endif

#endif

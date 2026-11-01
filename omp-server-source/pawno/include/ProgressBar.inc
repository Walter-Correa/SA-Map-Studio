/*
================================================================================
    SA Progress Bar Pro - A high-performance, modern progress bar and visual
    gauge library for SA-MP and Open.MP.

    Author:      Walter Corrêa
    Version:     2.0.0
    Repository:  https://github.com/Walter-Correa/SA-Progress-Bar-Pro
    License:     Mozilla Public License 2.0 (MPL-2.0)
================================================================================
*/

#if defined _progressbar_included
	#endinput
#endif
#define _progressbar_included

#if !defined _samp_included && !defined _INC_open_mp
	#tryinclude <open.mp>
	#if !defined _INC_open_mp
		#include <a_samp>
	#endif
#endif

#if !defined PB_DEFAULT_COLOUR
	#define PB_DEFAULT_COLOUR (0xE74C3CFF)
#endif
#if !defined PB_BORDER_DEFAULT
	#if defined PB_BORDER
		#define PB_BORDER_DEFAULT (PB_BORDER)
	#else
		#define PB_BORDER_DEFAULT (1.0)
	#endif
#endif
#if !defined PB_BORDER_MIN
	#define PB_BORDER_MIN (0.5)
#endif
#if !defined PB_BORDER_MAX
	#define PB_BORDER_MAX (5.0)
#endif
#if !defined PB_BORDER_Y_RATIO
	#define PB_BORDER_Y_RATIO (1.25)
#endif
#if !defined PB_MIN_INNER
	#define PB_MIN_INNER (1.0)
#endif
#if !defined PB_BLINK_DEFAULT
	#define PB_BLINK_DEFAULT (250)
#endif
#if !defined PB_BLINK_MIN
	#define PB_BLINK_MIN (50)
#endif
#if !defined PB_BLINK_MAX
	#define PB_BLINK_MAX (60000)
#endif
#if !defined MAX_PLAYER_BARS
	#define MAX_PLAYER_BARS (_:MAX_PLAYER_TEXT_DRAWS / 3)
#endif
#if !defined PB_RING_SEGMENTS
	#define PB_RING_SEGMENTS (24)
#endif
#if !defined PB_RING_SEGMENT_SCALE
	#define PB_RING_SEGMENT_SCALE (1.0)
#endif
#if !defined PB_RING_MIN
	#define PB_RING_MIN (4)
#endif
#if !defined PB_RING_MAX
	#define PB_RING_MAX (60)
#endif

#if !defined PB_AUTOFILL_TICK
	#define PB_AUTOFILL_TICK (50)
#endif
#if !defined PB_AUTOFILL_RISE
	#define PB_AUTOFILL_RISE (1000)
#endif
#if !defined PB_AUTOFILL_HOLD_TOP
	#define PB_AUTOFILL_HOLD_TOP (400)
#endif
#if !defined PB_AUTOFILL_FALL
	#define PB_AUTOFILL_FALL (1000)
#endif
#if !defined PB_AUTOFILL_HOLD_BASE
	#define PB_AUTOFILL_HOLD_BASE (300)
#endif

#define PB_CHIT_SCALE (1.5)
#define PB_MAX_TDS (_:MAX_PLAYER_TEXT_DRAWS)

#define INVALID_PLAYER_BAR_VALUE (Float:0xFFFFFFFF)
#define INVALID_PLAYER_BAR_ID (-1)

#if defined TEXT_DRAW_FONT_SPRITE_DRAW
	#define PB_SPRITE_FONT TEXT_DRAW_FONT_SPRITE_DRAW
#else
	#define PB_SPRITE_FONT 4
#endif

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

#define PB_TD_PART (0xFFFF)
#define PB_TD_KNOWN (0x20000000)
#define PB_TD_SHOWN (0x40000000)

enum
{
	PB_DIR_RIGHT,
	PB_DIR_LEFT,
	PB_DIR_UP,
	PB_DIR_DOWN
};

#define BAR_DIRECTION_RIGHT PB_DIR_RIGHT
#define BAR_DIRECTION_LEFT  PB_DIR_LEFT
#define BAR_DIRECTION_UP    PB_DIR_UP
#define BAR_DIRECTION_DOWN  PB_DIR_DOWN

enum
{
	PB_STYLE_BAR,
	PB_STYLE_RING,
	PB_STYLE_CIRCLE
};

enum ProgressBar_Data
{
	bool:PB_Valid,
	bool:PB_Visible,
	Float:PB_PosX,
	Float:PB_PosY,
	Float:PB_Width,
	Float:PB_Height,
	PB_Colour,
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
	new buf[32];
	strcat(buf, sprite, sizeof buf);
	new PlayerText:td = CreatePlayerTextDraw(playerid, x, y, buf);
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

static stock PlayerText:PB_ShapeSprite(playerid, barid, Float:x, Float:y, Float:width, Float:height, colour)
{
	if (ProgressBar[playerid][barid][PB_Style] != PB_STYLE_CIRCLE) return PB_Sprite(playerid, x, y, width, height, colour);
	new Float:sw = width * PB_CHIT_SCALE, Float:sh = height * PB_CHIT_SCALE;
	return PB_Sprite(playerid, x + (width - sw) / 2.0, y + (height - sh) / 2.0, sw, sh, colour, "LD_BEAT:chit");
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
	}
}

static stock Float:PB_ClampBorder(Float:border)
{
	if (border != border) return PB_BORDER_DEFAULT;
	if (border < PB_BORDER_MIN) return PB_BORDER_MIN;
	if (border > PB_BORDER_MAX) return PB_BORDER_MAX;
	return border;
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
	new t = (GetTickCount() - ProgressBar[playerid][barid][PB_AutoFillStart]) % cycle;
	if (t < 0) t += cycle;
	new Float:f;
	if (t < PB_AUTOFILL_RISE) f = float(t) / float(PB_AUTOFILL_RISE);
	else if (t < PB_AUTOFILL_RISE + PB_AUTOFILL_HOLD_TOP) f = 1.0;
	else if (t < PB_AUTOFILL_RISE + PB_AUTOFILL_HOLD_TOP + PB_AUTOFILL_FALL) f = 1.0 - float(t - PB_AUTOFILL_RISE - PB_AUTOFILL_HOLD_TOP) / float(PB_AUTOFILL_FALL);
	else f = 0.0;
	return value + (target - value) * f;
}

static stock bool:PB_MainRect(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	PB_Inner(playerid, barid, x, y, width, height);
	new Float:limit = ProgressBar[playerid][barid][PB_MaxValue];
	new Float:part = (limit > 0.0) ? (PB_DisplayValue(playerid, barid) / limit) : 0.0;
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
	new Float:limit = ProgressBar[playerid][barid][PB_MaxValue];
	new Float:part = (limit > 0.0) ? (PB_DisplayValue(playerid, barid) / limit) : 0.0;
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
		return;
	}
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

static stock PB_KillAutoFill(playerid, barid)
{
	if (ProgressBar[playerid][barid][PB_AutoFillTimer] != 0)
	{
		KillTimer(ProgressBar[playerid][barid][PB_AutoFillTimer]);
		ProgressBar[playerid][barid][PB_AutoFillTimer] = 0;
	}
	ProgressBar[playerid][barid][PB_AutoFill] = false;
}

static stock PB_KillBlink(playerid, barid)
{
	if (ProgressBar[playerid][barid][PB_BlinkTimer] != 0)
	{
		KillTimer(ProgressBar[playerid][barid][PB_BlinkTimer]);
		ProgressBar[playerid][barid][PB_BlinkTimer] = 0;
	}
	ProgressBar[playerid][barid][PB_Blinking] = false;
	ProgressBar[playerid][barid][PB_BlinkPhase] = false;
}

static stock PB_RenderMain(playerid, barid)
{
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		PB_ApplyRingColours(playerid, barid);
		return;
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
		return;
	}
	ProgressBar[playerid][barid][PB_Empty] = false;
	new PlayerText:current = ProgressBar[playerid][barid][PB_Progress];
	if (current != PB_NO_TD)
	{
		new bool:moves = ProgressBar[playerid][barid][PB_Style] == PB_STYLE_CIRCLE
			|| ProgressBar[playerid][barid][PB_Direction] == PB_DIR_LEFT
			|| ProgressBar[playerid][barid][PB_Direction] == PB_DIR_UP;
		#if defined PlayerTextDrawSetPos
			new bool:canMove = true;
		#else
			new bool:canMove = false;
		#endif
		if (!moves || canMove)
		{
			new Float:sw = width, Float:sh = height;
			if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_CIRCLE)
			{
				sw = width * PB_CHIT_SCALE;
				sh = height * PB_CHIT_SCALE;
			}
			PlayerTextDrawTextSize(playerid, current, sw, sh);
			#if defined PlayerTextDrawSetPos
				if (moves)
				{
					new Float:sx = x, Float:sy = y;
					if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_CIRCLE)
					{
						sx = x + (width - sw) / 2.0;
						sy = y + (height - sh) / 2.0;
					}
					PlayerTextDrawSetPos(playerid, current, sx, sy);
				}
			#endif
			if (ProgressBar[playerid][barid][PB_Visible] && !PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, current);
			return;
		}
		new PlayerText:fresh = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_GetCurrentColour(playerid, barid));
		if (fresh == PB_NO_TD)
		{
			PB_Kill(playerid, current);
			fresh = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_GetCurrentColour(playerid, barid));
		}
		ProgressBar[playerid][barid][PB_Progress] = fresh;
		if (ProgressBar[playerid][barid][PB_Visible] && fresh != PB_NO_TD && !PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, fresh);
		PB_Kill(playerid, current);
		return;
	}
	new PlayerText:created = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_GetCurrentColour(playerid, barid));
	ProgressBar[playerid][barid][PB_Progress] = created;
	if (ProgressBar[playerid][barid][PB_Visible] && created != PB_NO_TD && !PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, created);
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
			if (td == PB_NO_TD)
			{
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

static stock bool:PB_Render(playerid, barid)
{
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Border]);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Background]);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Progress]);
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING) return PB_RenderRing(playerid, barid);
	PB_KillRing(playerid, barid);
	new Float:x, Float:y, Float:width, Float:height;
	ProgressBar[playerid][barid][PB_Border] = PB_ShapeSprite(playerid, barid, ProgressBar[playerid][barid][PB_PosX], ProgressBar[playerid][barid][PB_PosY],
		ProgressBar[playerid][barid][PB_Width], ProgressBar[playerid][barid][PB_Height], PB_GetBorderColour(playerid, barid));
	PB_Inner(playerid, barid, x, y, width, height);
	ProgressBar[playerid][barid][PB_Background] = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_BackgroundColour(PB_GetCurrentColour(playerid, barid)));
	if (ProgressBar[playerid][barid][PB_Border] == PB_NO_TD || ProgressBar[playerid][barid][PB_Background] == PB_NO_TD) return false;
	if (ProgressBar[playerid][barid][PB_Visible])
	{
		PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Border]);
		if (!PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Background]);
	}
	PB_RenderMain(playerid, barid);
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
	ProgressBar[playerid][barid][PB_Segments] = PB_ClampSegments(segments);
	ProgressBar[playerid][barid][PB_SegmentScale] = (segmentscale <= 0.0) ? 1.0 : segmentscale;
	ProgressBar[playerid][barid][PB_Border] = PB_NO_TD;
	ProgressBar[playerid][barid][PB_Background] = PB_NO_TD;
	ProgressBar[playerid][barid][PB_Progress] = PB_NO_TD;
	ProgressBar[playerid][barid][PB_Empty] = false;
	if (!PB_Render(playerid, barid))
	{
		DestroyPlayerProgressBar(playerid, barid);
		return INVALID_PLAYER_BAR_ID;
	}
	return barid;
}

stock DestroyPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PB_KillBlink(playerid, barid);
	PB_KillAutoFill(playerid, barid);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Border]);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Background]);
	PB_Kill(playerid, ProgressBar[playerid][barid][PB_Progress]);
	PB_KillRing(playerid, barid);
	ProgressBar[playerid][barid][PB_Valid] = false;
	ProgressBar[playerid][barid][PB_Visible] = false;
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
		return 1;
	}
	PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][PB_Border]);
	PB_ShowInner(playerid, barid);
	return 1;
}

stock HidePlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][PB_Visible] = false;
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
	PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][PB_Border]);
	PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][PB_Background]);
	if (ProgressBar[playerid][barid][PB_Progress] != PB_NO_TD) PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][PB_Progress]);
	return 1;
}

stock bool:IsPlayerProgressBarVisible(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_Visible];
}

/*
================================================================================
    3. Value & Range Control
================================================================================
*/

stock SetPlayerProgressBarValue(playerid, barid, Float:value)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (value < 0.0) value = 0.0;
	if (value > ProgressBar[playerid][barid][PB_MaxValue]) value = ProgressBar[playerid][barid][PB_MaxValue];
	if (value != ProgressBar[playerid][barid][PB_Value])
	{
		ProgressBar[playerid][barid][PB_Value] = value;
		PB_RenderMain(playerid, barid);
	}
	if (!ProgressBar[playerid][barid][PB_Visible]) ShowPlayerProgressBar(playerid, barid);
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
	ProgressBar[playerid][barid][PB_MaxValue] = max;
	if (ProgressBar[playerid][barid][PB_Value] > max) ProgressBar[playerid][barid][PB_Value] = max;
	if (ProgressBar[playerid][barid][PB_AutoFillMax] > max) ProgressBar[playerid][barid][PB_AutoFillMax] = max;
	PB_RenderMain(playerid, barid);
	return 1;
}

stock Float:GetPlayerProgressBarMaxValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][PB_MaxValue];
}

/*
================================================================================
    4. Positioning & Dimensions
================================================================================
*/

stock SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
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
	ProgressBar[playerid][barid][PB_Direction] = (PB_DIR_RIGHT <= direction <= PB_DIR_DOWN) ? direction : PB_DIR_RIGHT;
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING) return _:PB_Render(playerid, barid);
	PB_RenderMain(playerid, barid);
	return 1;
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
	ProgressBar[playerid][barid][PB_Style] = (PB_STYLE_BAR <= style <= PB_STYLE_CIRCLE) ? style : PB_STYLE_BAR;
	ProgressBar[playerid][barid][PB_Segments] = PB_ClampSegments(segments);
	if (segmentscale > 0.0) ProgressBar[playerid][barid][PB_SegmentScale] = segmentscale;
	return _:PB_Render(playerid, barid);
}

stock GetPlayerProgressBarStyle(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][PB_Style];
}

stock GetPlayerProgressBarSegments(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][PB_Segments];
}

stock SetPlayerProgressBarRingScale(playerid, barid, Float:scale)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (scale <= 0.0) return 0;
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
	ProgressBar[playerid][barid][PB_Colour] = colour;
	PB_ApplyColours(playerid, barid);
	return 1;
}

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
	ProgressBar[playerid][barid][PB_BorderSize] = PB_ClampBorder(border);
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
	PB_KillAutoFill(playerid, barid);
	new Float:limit = ProgressBar[playerid][barid][PB_MaxValue];
	if (maxvalue < 0.0 || maxvalue > limit) maxvalue = limit;
	ProgressBar[playerid][barid][PB_AutoFill] = true;
	ProgressBar[playerid][barid][PB_AutoFillMax] = maxvalue;
	ProgressBar[playerid][barid][PB_AutoFillStart] = GetTickCount();
	ProgressBar[playerid][barid][PB_LastLit] = -1;
	ProgressBar[playerid][barid][PB_AutoFillTimer] = SetTimerEx("PB_AutoFillTick", PB_AUTOFILL_TICK, true, "ii", playerid, barid);
	PB_RenderMain(playerid, barid);
	return 1;
}

stock StopAutoFillPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (!ProgressBar[playerid][barid][PB_AutoFill]) return 1;
	PB_KillAutoFill(playerid, barid);
	PB_RenderMain(playerid, barid);
	return 1;
}

stock bool:IsPlayerProgressBarAutoFilling(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][PB_AutoFill];
}

forward PB_AutoFillTick(playerid, barid);
public PB_AutoFillTick(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid) || !ProgressBar[playerid][barid][PB_AutoFill]) return 0;
	if (ProgressBar[playerid][barid][PB_Style] == PB_STYLE_RING)
	{
		new lit = PB_RingLit(playerid, barid);
		if (lit == ProgressBar[playerid][barid][PB_LastLit]) return 1;
		ProgressBar[playerid][barid][PB_LastLit] = lit;
	}
	PB_RenderMain(playerid, barid);
	return 1;
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
	if (!IsValidPlayerProgressBar(playerid, barid) || !ProgressBar[playerid][barid][PB_Blinking]) return 0;
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
    9. Server Callbacks & ALS Lifecycle Hooks
================================================================================
*/

public OnPlayerDisconnect(playerid, reason)
{
	if (0 <= playerid < MAX_PLAYERS)
	{
		for (new i = 0; i < MAX_PLAYER_BARS; i++)
		{
			PB_KillBlink(playerid, i);
			PB_KillAutoFill(playerid, i);
			ProgressBar[playerid][i][PB_Valid] = false;
			ProgressBar[playerid][i][PB_Visible] = false;
		}
		for (new t = 0; t < PB_MAX_TDS; t++) PB_TDOwner[playerid][t] = 0;
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
#endif

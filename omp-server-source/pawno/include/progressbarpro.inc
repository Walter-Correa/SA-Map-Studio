/*
	SA Progress Bar Pro (progressbarpro.inc)
	Player progress bars for SA-MP 0.3.7 and open.mp.

	Bars drawn with sprites ("LD_SPAC:white" and "LD_BEAT:chit"):
	- exact position, width and height in TextDraw units (640x448), scaled evenly at any
	  resolution (no fixed pixel padding);
	- every bar has a border with the same on-screen thickness on all four sides. One TextDraw
	  unit is 640 parts of the screen width and 448 parts of its height, so at 16:9 (1920x1080)
	  it is 3.00 px wide but only 2.41 px tall. That is why the top and bottom border are
	  PB_BORDER_Y_RATIO (1.25) times the side border: 3 px on every side at 1920x1080;
	- the border goes from PB_BORDER_MIN (0.5) to PB_BORDER_MAX (5.0). Values outside that range
	  are replaced by the limit, and the border never grows past what fits in the bar (at least
	  PB_MIN_INNER of inner area is kept);
	- the filled part never goes past the border, disappears when the value is zero, and changing
	  the value never shows a hidden bar;
	- bars can blink, with their own colour for the inner area and for the border;
	- three styles, chosen when the bar is created (or later with SetPlayerProgressBarStyle):

	PB_STYLE_BAR (default) - a straight bar, 3 PlayerTextDraws ("LD_SPAC:white"), drawn in this order:
	  back   (x, y, width, height)                                  border colour (default: black with the bar alpha)
	  fill   (inside the border)                                    bar colour, more transparent
	  main   (part of the fill, from value / max and the direction) bar colour

	PB_STYLE_RING - a ring of round segments that light up one by one, starting at the top.
	  BAR_DIRECTION_RIGHT / DOWN go clockwise, BAR_DIRECTION_LEFT / UP counterclockwise.
	  "segments" sets how many (PB_RING_MIN to PB_RING_MAX). Each segment uses 2 PlayerTextDraws
	  ("LD_BEAT:chit"): a border dot and the segment itself, so a 24 segment ring uses 48.
	  The ring fills the box (x, y, width, height); the border is the outline of each segment.

	PB_STYLE_CIRCLE - a round gauge that grows from the centre, 3 PlayerTextDraws ("LD_BEAT:chit"):
	  border circle, inner circle (bar colour, more transparent) and the filled circle, whose
	  diameter follows value / max. The direction is not used.

	For round styles: one TextDraw unit is 1.25 times taller than wide on a 16:9 screen, so a
	round shape needs height = width * 1.25 (for example 40.0 x 50.0).

	-------------------------------------------------------------------------------- round styles in detail

	What happens when a PB_STYLE_RING bar is created
	  1. The ring is fitted inside the box (x, y, width, height). The segment size is worked out
	     from the ring size and the number of segments, so neighbouring segments never touch
	     (each segment takes about 70% of the space between two segment centres).
	  2. The segment centres are placed on the ellipse inside the box, starting at the top
	     (12 o'clock) and going clockwise (BAR_DIRECTION_RIGHT / DOWN) or counterclockwise
	     (BAR_DIRECTION_LEFT / UP).
	  3. One "LD_BEAT:chit" sprite is created per segment for the border (the segment enlarged by
	     the border on every side, in the border colour), then one per segment for the segment
	     itself. All border dots are created first so no border covers a neighbouring segment.
	  4. Segments up to floor(value / max * segments) use the bar colour; the others use the bar
	     colour more transparent. Changing the value, the colours or blinking only recolours the
	     existing TextDraws (PlayerTextDrawColour + PlayerTextDrawShow); changing the position,
	     size, border, direction, style or number of segments destroys and recreates them.

	What happens when a PB_STYLE_CIRCLE bar is created
	  Three "LD_BEAT:chit" sprites are created, just like the straight bar: the border circle (the
	  whole box), the inner circle (inside the border, bar colour more transparent) and the filled
	  circle, centred, with a diameter of value / max of the inner circle. Changing the value
	  recreates only the filled circle.

	Resources used
	  PlayerTextDraws per bar:
	    PB_STYLE_BAR     3
	    PB_STYLE_CIRCLE  3
	    PB_STYLE_RING    2 x segments (24 segments = 48, 60 segments = 120)
	  Every player has MAX_PLAYER_TEXT_DRAWS (256) PlayerTextDraws shared with the whole script,
	  so a player fits 5 rings of 24 segments, or 2 rings of 60 segments, and nothing else.
	  Server memory: the include keeps, per player, the data of MAX_PLAYER_BARS bars and three
	  tables of PB_MAX_TDS cells (which ring owns each PlayerTextDraw, its part and state, and its
	  current colour). With MAX_PLAYERS 1000 this is about 11 MB of the script data; lower
	  MAX_PLAYERS or MAX_PLAYER_BARS to use less.
	  Network: creating a ring sends 2 x segments TextDraws to the player. After that, only the
	  segments whose colour or visibility really changes are sent again: a value change sends the
	  segments that light up or go off, a blink sends the inner segments (and the border dots when
	  a blink border colour is used). A straight bar or circle sends one TextDraw per change.
	  Every TextDraw sent is acknowledged by the client, and open.mp warns ("ackslimit") when a
	  player goes over its limit, so avoid many bars changing many times per second.
	  Timers: a blinking bar (any style) uses one repeating timer until the blink ends.

	Limitations
	  - TextDraws cannot be rotated or clipped, so the ring is made of separate segments and the
	    circle grows from the centre: there is no smooth arc that fills around the circle.
	  - "LD_BEAT:chit" is a circle drawn in only 2/3 of its sprite (PB_CHIT_SCALE = 1.5), so the
	    sprites are larger than the shapes they show; their transparent edges overlap freely.
	  - Round shapes only look round when height = width * 1.25 on 16:9 screens; on 4:3 screens
	    the same values look slightly taller than wide. Tiny rings (few TextDraw units) turn
	    their segments into 1 or 2 pixel dots.
	  - The ring shows whole segments: with 24 segments, each segment is 1/24 of the value, and
	    a value below that lights no segment.
	  - SetPlayerProgressBarBorder on a ring changes the outline around each segment, not a line
	    around the whole ring.

	Example:
	  new health = CreatePlayerProgressBar(playerid, 500.0, 120.0, 100.0, 8.0, 0xFF1C1CFF);
	  SetPlayerProgressBarValue(playerid, health, 75.0);
	  ShowPlayerProgressBar(playerid, health);
	  BlinkPlayerProgressBar(playerid, health);                          // blinks in the bar colour until stopped
	  BlinkPlayerProgressBar(playerid, health, 200, 3000, 0xFFFFFFFF);   // blinks white for 3 seconds
	  BlinkPlayerProgressBar(playerid, health, 300, 0, 0, 0xFFFF00FF);   // bar colour, border blinks yellow
	  StopPlayerProgressBarBlink(playerid, health);

	  new ring = CreatePlayerProgressBar(playerid, 300.0, 200.0, 40.0, 50.0, 0x2E9E3AFF, 100.0,
	      BAR_DIRECTION_RIGHT, 1.0, 0, PB_STYLE_RING, 20);               // ring with 20 segments
	  new gauge = CreatePlayerProgressBar(playerid, 350.0, 200.0, 40.0, 50.0, 0x3A6EE0FF, 100.0,
	      BAR_DIRECTION_RIGHT, 1.0, 0, PB_STYLE_CIRCLE);                 // growing circle

	-------------------------------------------------------------------------------- functions

	Every function returns 0 (or INVALID_PLAYER_BAR_VALUE for Float getters) when the player or
	the bar is not valid. Parameters with a default value can be left out.

	Creation and life cycle
	  CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 55.5, Float:height = 6.0,
	      colour = 0xFF1C1CFF, Float:max = 100.0, direction = BAR_DIRECTION_RIGHT,
	      Float:border = 1.0, bordercolour = 0, style = PB_STYLE_BAR, segments = 24)
	      Creates a hidden bar and returns its id (INVALID_PLAYER_BAR_ID on failure).
	      bordercolour 0 = black with the alpha of the bar colour.
	      style: PB_STYLE_BAR, PB_STYLE_RING or PB_STYLE_CIRCLE; segments: only for PB_STYLE_RING.
	  DestroyPlayerProgressBar(playerid, barid)
	  DestroyAllPlayerProgressBars(playerid)
	  IsValidPlayerProgressBar(playerid, barid)                    -> bool

	Visibility
	  ShowPlayerProgressBar(playerid, barid)
	  HidePlayerProgressBar(playerid, barid)
	  IsPlayerProgressBarVisible(playerid, barid)                  -> bool

	Value
	  SetPlayerProgressBarValue(playerid, barid, Float:value)       (clamped to 0..max)
	  GetPlayerProgressBarValue(playerid, barid)                   -> Float
	  SetPlayerProgressBarMaxValue(playerid, barid, Float:max = 100.0)
	  GetPlayerProgressBarMaxValue(playerid, barid)                -> Float

	Position and size
	  SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
	  GetPlayerProgressBarPos(playerid, barid, &Float:x, &Float:y)
	  SetPlayerProgressBarSize(playerid, barid, Float:width, Float:height)
	  GetPlayerProgressBarSize(playerid, barid, &Float:width, &Float:height)
	  SetPlayerProgressBarWidth(playerid, barid, Float:width)
	  GetPlayerProgressBarWidth(playerid, barid)                   -> Float
	  SetPlayerProgressBarHeight(playerid, barid, Float:height)
	  GetPlayerProgressBarHeight(playerid, barid)                  -> Float
	  SetPlayerProgressBarDirection(playerid, barid, direction = BAR_DIRECTION_RIGHT)
	  GetPlayerProgressBarDirection(playerid, barid)

	Style
	  SetPlayerProgressBarStyle(playerid, barid, style = PB_STYLE_BAR, segments = 24)
	  GetPlayerProgressBarStyle(playerid, barid)
	  GetPlayerProgressBarSegments(playerid, barid)

	Colours and border
	  SetPlayerProgressBarColour(playerid, barid, colour = 0xFF1C1CFF)
	  GetPlayerProgressBarColour(playerid, barid)
	  SetPlayerProgressBarBorder(playerid, barid, Float:border = 1.0)       (0.5 to 5.0)
	  GetPlayerProgressBarBorder(playerid, barid)                  -> Float
	  SetPlayerProgressBarBorderColour(playerid, barid, bordercolour = 0)   (0 = default black)
	  GetPlayerProgressBarBorderColour(playerid, barid)

	Auto fill
	  AutoFillPlayerProgressBar(playerid, barid, Float:maxvalue = -1.0)
	      Animates the bar from its value up to maxvalue (default: the bar max), holds, goes back
	      to the value, holds, and repeats until StopAutoFillPlayerProgressBar. The real value of
	      the bar does not change. maxvalue is limited to 0..max of the bar.
	  StopAutoFillPlayerProgressBar(playerid, barid)
	  IsPlayerProgressBarAutoFilling(playerid, barid)              -> bool

	Blinking
	  BlinkPlayerProgressBar(playerid, barid, interval = 250, duration = 0, colour = 0, bordercolour = 0)
	      interval: milliseconds between each switch (PB_BLINK_MIN to PB_BLINK_MAX);
	      duration: total time in milliseconds (0 = until StopPlayerProgressBarBlink);
	      colour: inner colour while lit (0 = blink in the bar colour, switching it off and on);
	      bordercolour: border colour while lit (0 = the border does not blink).
	  StopPlayerProgressBarBlink(playerid, barid)
	  IsPlayerProgressBarBlinking(playerid, barid)                 -> bool

	Settings (define them before #include <progressbarpro>)
	  MAX_PLAYER_BARS       bars per player (default: MAX_PLAYER_TEXT_DRAWS / 3)
	  PB_DEFAULT_COLOUR     default bar colour (0xFF1C1CFF)
	  PB_BORDER_DEFAULT     default border (1.0)
	  PB_BORDER_MIN         smallest border (0.5)
	  PB_BORDER_MAX         largest border (5.0)
	  PB_BORDER_Y_RATIO     top/bottom border compared to the sides (1.25)
	  PB_MIN_INNER          inner area always kept inside the border (1.0)
	  PB_BLINK_DEFAULT      default blink interval in ms (250)
	  PB_BLINK_MIN          shortest blink interval in ms (50)
	  PB_BLINK_MAX          longest blink interval in ms (60000)
	  PB_RING_SEGMENTS      default ring segments (24)
	  PB_RING_MIN           fewest ring segments (4)
	  PB_RING_MAX           most ring segments (60)
	  PB_AUTOFILL_TICK      auto fill update interval in ms (50)
	  PB_AUTOFILL_RISE      auto fill time going up in ms (1000)
	  PB_AUTOFILL_HOLD_TOP  auto fill pause at the top in ms (400)
	  PB_AUTOFILL_FALL      auto fill time going back in ms (1000)
	  PB_AUTOFILL_HOLD_BASE auto fill pause at the value in ms (300)

	Auto fill cost: one repeating timer per bar. Every tick a straight bar or circle recreates its
	filled part (1 PlayerTextDraw); a ring only re-sends its segment colours when the number of lit
	segments changes. Prefer few bars auto filling at the same time.
*/

#if defined _progressbarpro_included
	#endinput
#endif
#define _progressbarpro_included

#include <a_samp>

// ---------------------------------------------------------------------------- settings

#if !defined PB_DEFAULT_COLOUR
	#define PB_DEFAULT_COLOUR (0xFF1C1CFF)
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

// "LD_BEAT:chit" is a white circle that fills only 2/3 of the sprite: the sprite is drawn
// 1.5 times larger than the circle it has to show
#define PB_CHIT_SCALE (1.5)
#define PB_MAX_TDS (_:MAX_PLAYER_TEXT_DRAWS)

#define INVALID_PLAYER_BAR_VALUE (Float:0xFFFFFFFF)
#define INVALID_PLAYER_BAR_ID (-1)

#if defined TEXT_DRAW_FONT_SPRITE_DRAW
	#define PB_SPRITE_FONT TEXT_DRAW_FONT_SPRITE_DRAW
#else
	#define PB_SPRITE_FONT 4
#endif

// open.mp prefers PlayerTextDrawColour; SA-MP only has PlayerTextDrawColor
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

enum
{
	PB_STYLE_BAR,
	PB_STYLE_RING,
	PB_STYLE_CIRCLE
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
	pb_borderColour,
	bool:pb_blinking,
	bool:pb_blinkPhase,
	pb_blinkTimer,
	pb_blinkColour,
	pb_blinkBorderColour,
	pb_blinkStart,
	pb_blinkDuration,
	bool:pb_autoFill,
	Float:pb_autoFillMax,
	pb_autoFillStart,
	pb_autoFillTimer,
	pb_lastLit,
	pb_style,
	pb_segments,
	PlayerText:pb_back,
	PlayerText:pb_fill,
	PlayerText:pb_main
}

static stock ProgressBar[MAX_PLAYERS][MAX_PLAYER_BARS][ProgressBar_Data];

// Ring segments: which bar owns each PlayerTextDraw id (bar id + 1, 0 = none), which part it is
// (segment * 2 + 0 for the border dot, + 1 for the segment, plus the state flags below) and the
// colour last sent, so only the segments that really change are sent to the player again
static stock pb_TdOwner[MAX_PLAYERS][PB_MAX_TDS];
static stock pb_TdPart[MAX_PLAYERS][PB_MAX_TDS];
static stock pb_TdColour[MAX_PLAYERS][PB_MAX_TDS];

#define PB_TD_PART  (0xFFFF)
#define PB_TD_KNOWN (0x20000000) // colour already sent
#define PB_TD_SHOWN (0x40000000) // shown to the player

// ---------------------------------------------------------------------------- internal

static stock PlayerText:PB_Sprite(playerid, Float:x, Float:y, Float:width, Float:height, colour, const sprite[] = "LD_SPAC:white")
{
	new PlayerText:td = CreatePlayerTextDraw(playerid, x, y, sprite);
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

// Square sprite for PB_STYLE_BAR, round sprite (scaled around the centre) for PB_STYLE_CIRCLE
static stock PlayerText:PB_ShapeSprite(playerid, barid, Float:x, Float:y, Float:width, Float:height, colour)
{
	if (ProgressBar[playerid][barid][pb_style] != PB_STYLE_CIRCLE) return PB_Sprite(playerid, x, y, width, height, colour);
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
		if (pb_TdOwner[playerid][t] != barid + 1) continue;
		PlayerTextDrawDestroy(playerid, PlayerText:t);
		pb_TdOwner[playerid][t] = 0;
	}
}

static stock Float:PB_ClampBorder(Float:border)
{
	if (border != border) return PB_BORDER_DEFAULT; // NaN
	if (border < PB_BORDER_MIN) return PB_BORDER_MIN;
	if (border > PB_BORDER_MAX) return PB_BORDER_MAX;
	return border;
}

// Border that fits in the bar: the top/bottom (PB_BORDER_Y_RATIO times thicker) and the sides keep
// at least PB_MIN_INNER of inner area; it never goes below PB_BORDER_MIN (every bar has a border)
static stock Float:PB_FitBorder(Float:border, Float:width, Float:height)
{
	new Float:limit = (width - PB_MIN_INNER) / 2.0;
	new Float:limitY = (height - PB_MIN_INNER) / (2.0 * PB_BORDER_Y_RATIO);
	if (limitY < limit) limit = limitY;
	if (limit < PB_BORDER_MIN) limit = PB_BORDER_MIN;
	return (border > limit) ? limit : border;
}

// Area inside the border
static stock PB_Inner(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	new Float:bx = PB_FitBorder(ProgressBar[playerid][barid][pb_border], ProgressBar[playerid][barid][pb_width], ProgressBar[playerid][barid][pb_height]);
	new Float:by = bx * PB_BORDER_Y_RATIO;
	x = ProgressBar[playerid][barid][pb_x] + bx;
	y = ProgressBar[playerid][barid][pb_y] + by;
	width = ProgressBar[playerid][barid][pb_width] - bx * 2.0;
	height = ProgressBar[playerid][barid][pb_height] - by * 2.0;
	if (width < 0.0) width = 0.0;
	if (height < 0.0) height = 0.0;
}

// Value shown on screen: the real value, or the auto fill animation (up, hold, back, hold)
static stock Float:PB_DisplayValue(playerid, barid)
{
	new Float:value = ProgressBar[playerid][barid][pb_value];
	if (!ProgressBar[playerid][barid][pb_autoFill]) return value;
	new Float:target = ProgressBar[playerid][barid][pb_autoFillMax];
	new cycle = PB_AUTOFILL_RISE + PB_AUTOFILL_HOLD_TOP + PB_AUTOFILL_FALL + PB_AUTOFILL_HOLD_BASE;
	new t = (GetTickCount() - ProgressBar[playerid][barid][pb_autoFillStart]) % cycle;
	if (t < 0) t += cycle;
	new Float:f;
	if (t < PB_AUTOFILL_RISE) f = float(t) / float(PB_AUTOFILL_RISE);
	else if (t < PB_AUTOFILL_RISE + PB_AUTOFILL_HOLD_TOP) f = 1.0;
	else if (t < PB_AUTOFILL_RISE + PB_AUTOFILL_HOLD_TOP + PB_AUTOFILL_FALL) f = 1.0 - float(t - PB_AUTOFILL_RISE - PB_AUTOFILL_HOLD_TOP) / float(PB_AUTOFILL_FALL);
	else f = 0.0;
	return value + (target - value) * f;
}

// Filled part: returns false when there is nothing to draw
static stock bool:PB_MainRect(playerid, barid, &Float:x, &Float:y, &Float:width, &Float:height)
{
	PB_Inner(playerid, barid, x, y, width, height);
	new Float:limit = ProgressBar[playerid][barid][pb_max];
	new Float:part = (limit > 0.0) ? (PB_DisplayValue(playerid, barid) / limit) : 0.0;
	if (part > 1.0) part = 1.0;
	if (part <= 0.0 || width <= 0.0 || height <= 0.0) return false;
	if (ProgressBar[playerid][barid][pb_style] == PB_STYLE_CIRCLE)
	{
		// Circle: grows from the centre
		x += width * (1.0 - part) / 2.0;
		y += height * (1.0 - part) / 2.0;
		width *= part;
		height *= part;
		return true;
	}
	switch (ProgressBar[playerid][barid][pb_direction])
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

// Inner colour: the blink colour while lit (if any), otherwise the bar colour
static stock PB_CurrentColour(playerid, barid)
{
	if (ProgressBar[playerid][barid][pb_blinking] && ProgressBar[playerid][barid][pb_blinkPhase] && ProgressBar[playerid][barid][pb_blinkColour] != 0)
		return ProgressBar[playerid][barid][pb_blinkColour];
	return ProgressBar[playerid][barid][pb_colour];
}

// Border colour: the blink border colour while lit (if any), the chosen one, or black with the bar alpha
static stock PB_BorderColour(playerid, barid)
{
	if (ProgressBar[playerid][barid][pb_blinking] && ProgressBar[playerid][barid][pb_blinkPhase] && ProgressBar[playerid][barid][pb_blinkBorderColour] != 0)
		return ProgressBar[playerid][barid][pb_blinkBorderColour];
	if (ProgressBar[playerid][barid][pb_borderColour] != 0) return ProgressBar[playerid][barid][pb_borderColour];
	return ProgressBar[playerid][barid][pb_colour] & 0xFF;
}

// Blinking without an inner colour switches the inner area off while lit
static stock bool:PB_InnerHidden(playerid, barid)
{
	return ProgressBar[playerid][barid][pb_blinking] && ProgressBar[playerid][barid][pb_blinkPhase] && ProgressBar[playerid][barid][pb_blinkColour] == 0;
}

static stock PB_ShowInner(playerid, barid)
{
	if (!ProgressBar[playerid][barid][pb_show]) return;
	new bool:hidden = PB_InnerHidden(playerid, barid);
	if (ProgressBar[playerid][barid][pb_fill] != PB_NO_TD)
	{
		if (hidden) PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][pb_fill]);
		else PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][pb_fill]);
	}
	if (ProgressBar[playerid][barid][pb_main] != PB_NO_TD)
	{
		if (hidden) PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][pb_main]);
		else PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][pb_main]);
	}
}

// Number of lit ring segments
static stock PB_RingLit(playerid, barid)
{
	new Float:limit = ProgressBar[playerid][barid][pb_max];
	new Float:part = (limit > 0.0) ? (PB_DisplayValue(playerid, barid) / limit) : 0.0;
	if (part > 1.0) part = 1.0;
	if (part <= 0.0) return 0;
	return floatround(part * float(ProgressBar[playerid][barid][pb_segments]) + 0.0001, floatround_floor);
}

static stock PB_ApplyRingColours(playerid, barid)
{
	new lit = PB_RingLit(playerid, barid);
	new colour = PB_CurrentColour(playerid, barid), dim = PB_FillColour(colour);
	new border = PB_BorderColour(playerid, barid);
	new bool:hidden = PB_InnerHidden(playerid, barid), bool:shown = ProgressBar[playerid][barid][pb_show];
	for (new t = 0; t < PB_MAX_TDS; t++)
	{
		if (pb_TdOwner[playerid][t] != barid + 1) continue;
		new PlayerText:td = PlayerText:t, flags = pb_TdPart[playerid][t], part = flags & PB_TD_PART;
		new want = (part % 2 == 0) ? border : ((part / 2 < lit) ? colour : dim);
		new bool:visible = shown && (part % 2 == 0 || !hidden);
		new bool:changed = !(flags & PB_TD_KNOWN) || pb_TdColour[playerid][t] != want;
		if (changed)
		{
			PB_TextDrawColour(playerid, td, want);
			pb_TdColour[playerid][t] = want;
		}
		// A shown TextDraw only takes a new colour when shown again
		if (visible && (changed || !(flags & PB_TD_SHOWN))) PlayerTextDrawShow(playerid, td);
		else if (!visible && (flags & PB_TD_SHOWN)) PlayerTextDrawHide(playerid, td);
		pb_TdPart[playerid][t] = part | PB_TD_KNOWN | (visible ? PB_TD_SHOWN : 0);
	}
}

// Applies the current colours (and the current blink phase) without recreating the TextDraws
static stock PB_ApplyColours(playerid, barid)
{
	if (ProgressBar[playerid][barid][pb_style] == PB_STYLE_RING)
	{
		PB_ApplyRingColours(playerid, barid);
		return;
	}
	if (ProgressBar[playerid][barid][pb_back] != PB_NO_TD)
	{
		PB_TextDrawColour(playerid, ProgressBar[playerid][barid][pb_back], PB_BorderColour(playerid, barid));
		if (ProgressBar[playerid][barid][pb_show]) PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][pb_back]);
	}
	new colour = PB_CurrentColour(playerid, barid);
	if (ProgressBar[playerid][barid][pb_fill] != PB_NO_TD) PB_TextDrawColour(playerid, ProgressBar[playerid][barid][pb_fill], PB_FillColour(colour));
	if (ProgressBar[playerid][barid][pb_main] != PB_NO_TD) PB_TextDrawColour(playerid, ProgressBar[playerid][barid][pb_main], colour);
	PB_ShowInner(playerid, barid);
}

static stock PB_KillAutoFill(playerid, barid)
{
	if (ProgressBar[playerid][barid][pb_autoFillTimer] != 0)
	{
		KillTimer(ProgressBar[playerid][barid][pb_autoFillTimer]);
		ProgressBar[playerid][barid][pb_autoFillTimer] = 0;
	}
	ProgressBar[playerid][barid][pb_autoFill] = false;
}

static stock PB_KillBlink(playerid, barid)
{
	if (ProgressBar[playerid][barid][pb_blinkTimer] != 0)
	{
		KillTimer(ProgressBar[playerid][barid][pb_blinkTimer]);
		ProgressBar[playerid][barid][pb_blinkTimer] = 0;
	}
	ProgressBar[playerid][barid][pb_blinking] = false;
	ProgressBar[playerid][barid][pb_blinkPhase] = false;
}

// Recreates only the filled part (its position changes for the left and up directions);
// a ring only changes the colour of its segments
static stock PB_RenderMain(playerid, barid)
{
	if (ProgressBar[playerid][barid][pb_style] == PB_STYLE_RING)
	{
		PB_ApplyRingColours(playerid, barid);
		return;
	}
	PB_Kill(playerid, ProgressBar[playerid][barid][pb_main]);
	new Float:x, Float:y, Float:width, Float:height;
	if (!PB_MainRect(playerid, barid, x, y, width, height)) return;
	ProgressBar[playerid][barid][pb_main] = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_CurrentColour(playerid, barid));
	if (ProgressBar[playerid][barid][pb_show] && ProgressBar[playerid][barid][pb_main] != PB_NO_TD && !PB_InnerHidden(playerid, barid))
		PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][pb_main]);
}

// Ring: all border dots first, then the segments (TextDraws are drawn in creation order).
// The segment size follows the ring size and the number of segments so they never touch.
static stock bool:PB_RenderRing(playerid, barid)
{
	PB_KillRing(playerid, barid);
	new n = ProgressBar[playerid][barid][pb_segments];
	new Float:rx = ProgressBar[playerid][barid][pb_width] / 2.0, Float:ry = ProgressBar[playerid][barid][pb_height] / 2.0;
	new Float:cx = ProgressBar[playerid][barid][pb_x] + rx, Float:cy = ProgressBar[playerid][barid][pb_y] + ry;
	new Float:bx = ProgressBar[playerid][barid][pb_border], Float:by = bx * PB_BORDER_Y_RATIO;
	new Float:r = rx;
	if (ry / PB_BORDER_Y_RATIO < r) r = ry / PB_BORDER_Y_RATIO;
	new Float:dx = 1.4 * 3.14159265 * (r - bx) / (float(n) + 0.7 * 3.14159265);
	if (dx < 0.5) dx = 0.5;
	new Float:dy = dx * PB_BORDER_Y_RATIO;
	new Float:px = rx - dx / 2.0 - bx, Float:py = ry - dy / 2.0 - by;
	if (px < 0.0) px = 0.0;
	if (py < 0.0) py = 0.0;
	new Float:step = 360.0 / float(n);
	new dir = ProgressBar[playerid][barid][pb_direction];
	if (dir == BAR_DIRECTION_LEFT || dir == BAR_DIRECTION_UP) step = -step;
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
			pb_TdOwner[playerid][_:td] = barid + 1;
			pb_TdPart[playerid][_:td] = i * 2 + role;
		}
	}
	PB_ApplyRingColours(playerid, barid);
	return true;
}

// Recreates the whole bar (position, size, border or style changed)
static stock bool:PB_Render(playerid, barid)
{
	PB_Kill(playerid, ProgressBar[playerid][barid][pb_back]);
	PB_Kill(playerid, ProgressBar[playerid][barid][pb_fill]);
	PB_Kill(playerid, ProgressBar[playerid][barid][pb_main]);
	if (ProgressBar[playerid][barid][pb_style] == PB_STYLE_RING) return PB_RenderRing(playerid, barid);
	PB_KillRing(playerid, barid);
	new Float:x, Float:y, Float:width, Float:height;
	ProgressBar[playerid][barid][pb_back] = PB_ShapeSprite(playerid, barid, ProgressBar[playerid][barid][pb_x], ProgressBar[playerid][barid][pb_y],
		ProgressBar[playerid][barid][pb_width], ProgressBar[playerid][barid][pb_height], PB_BorderColour(playerid, barid));
	PB_Inner(playerid, barid, x, y, width, height);
	ProgressBar[playerid][barid][pb_fill] = PB_ShapeSprite(playerid, barid, x, y, width, height, PB_FillColour(PB_CurrentColour(playerid, barid)));
	if (ProgressBar[playerid][barid][pb_back] == PB_NO_TD || ProgressBar[playerid][barid][pb_fill] == PB_NO_TD) return false;
	if (ProgressBar[playerid][barid][pb_show])
	{
		PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][pb_back]);
		if (!PB_InnerHidden(playerid, barid)) PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][pb_fill]);
	}
	PB_RenderMain(playerid, barid);
	return true;
}

// ---------------------------------------------------------------------------- creation and life cycle

/*
	IsValidPlayerProgressBar(playerid, barid)
	Returns true if the bar exists for that player.
*/
stock bool:IsValidPlayerProgressBar(playerid, barid)
{
	return (0 <= playerid < MAX_PLAYERS) && (0 <= barid < MAX_PLAYER_BARS) && ProgressBar[playerid][barid][pb_valid];
}

/*
	CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 55.5, Float:height = 6.0,
	    colour = PB_DEFAULT_COLOUR, Float:max = 100.0, direction = BAR_DIRECTION_RIGHT,
	    Float:border = PB_BORDER_DEFAULT, bordercolour = 0, style = PB_STYLE_BAR, segments = PB_RING_SEGMENTS)
	Creates a bar for the player (hidden until ShowPlayerProgressBar) with value 0.
	  x, y          top-left corner in TextDraw units (640x448)
	  width, height size of the whole bar, border included
	  colour        bar colour (RRGGBBAA)
	  max           value that fills the bar
	  direction     BAR_DIRECTION_RIGHT, BAR_DIRECTION_LEFT, BAR_DIRECTION_UP or BAR_DIRECTION_DOWN
	  border        side border (PB_BORDER_MIN to PB_BORDER_MAX; out of range uses the limit;
	                reduced to fit when the bar is too small)
	  bordercolour  border colour (0 = black with the alpha of the bar colour)
	  style         PB_STYLE_BAR, PB_STYLE_RING or PB_STYLE_CIRCLE
	  segments      ring segments (PB_RING_MIN to PB_RING_MAX), used only by PB_STYLE_RING
	Returns the bar id, or INVALID_PLAYER_BAR_ID if the player is not connected, the player
	already has MAX_PLAYER_BARS bars or there are no free PlayerTextDraws.
*/
stock CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 55.5, Float:height = 6.0, colour = PB_DEFAULT_COLOUR, Float:max = 100.0, direction = BAR_DIRECTION_RIGHT, Float:border = PB_BORDER_DEFAULT, bordercolour = 0, style = PB_STYLE_BAR, segments = PB_RING_SEGMENTS)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return INVALID_PLAYER_BAR_ID;
	new barid = INVALID_PLAYER_BAR_ID;
	for (new i = 0; i < MAX_PLAYER_BARS; i++)
	{
		if (!ProgressBar[playerid][i][pb_valid]) { barid = i; break; }
	}
	if (barid == INVALID_PLAYER_BAR_ID)
	{
		print("[SA Progress Bar Pro] Player bar limit reached (MAX_PLAYER_BARS).");
		return INVALID_PLAYER_BAR_ID;
	}
	ProgressBar[playerid][barid][pb_valid] = true;
	ProgressBar[playerid][barid][pb_show] = false;
	ProgressBar[playerid][barid][pb_x] = x;
	ProgressBar[playerid][barid][pb_y] = y;
	ProgressBar[playerid][barid][pb_width] = width;
	ProgressBar[playerid][barid][pb_height] = height;
	ProgressBar[playerid][barid][pb_colour] = colour;
	ProgressBar[playerid][barid][pb_max] = max;
	ProgressBar[playerid][barid][pb_value] = 0.0;
	ProgressBar[playerid][barid][pb_direction] = (BAR_DIRECTION_RIGHT <= direction <= BAR_DIRECTION_DOWN) ? direction : BAR_DIRECTION_RIGHT;
	ProgressBar[playerid][barid][pb_border] = PB_ClampBorder(border);
	ProgressBar[playerid][barid][pb_borderColour] = bordercolour;
	ProgressBar[playerid][barid][pb_blinkBorderColour] = 0;
	ProgressBar[playerid][barid][pb_blinkColour] = 0;
	ProgressBar[playerid][barid][pb_blinking] = false;
	ProgressBar[playerid][barid][pb_blinkPhase] = false;
	ProgressBar[playerid][barid][pb_blinkTimer] = 0;
	ProgressBar[playerid][barid][pb_autoFill] = false;
	ProgressBar[playerid][barid][pb_autoFillTimer] = 0;
	ProgressBar[playerid][barid][pb_lastLit] = -1;
	ProgressBar[playerid][barid][pb_style] = (PB_STYLE_BAR <= style <= PB_STYLE_CIRCLE) ? style : PB_STYLE_BAR;
	ProgressBar[playerid][barid][pb_segments] = PB_ClampSegments(segments);
	ProgressBar[playerid][barid][pb_back] = PB_NO_TD;
	ProgressBar[playerid][barid][pb_fill] = PB_NO_TD;
	ProgressBar[playerid][barid][pb_main] = PB_NO_TD;
	if (!PB_Render(playerid, barid))
	{
		print("[SA Progress Bar Pro] No free PlayerTextDraws to create the bar.");
		DestroyPlayerProgressBar(playerid, barid);
		return INVALID_PLAYER_BAR_ID;
	}
	return barid;
}

/*
	DestroyPlayerProgressBar(playerid, barid)
	Stops any blink and destroys the bar and its TextDraws.
*/
stock DestroyPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PB_KillBlink(playerid, barid);
	PB_KillAutoFill(playerid, barid);
	PB_Kill(playerid, ProgressBar[playerid][barid][pb_back]);
	PB_Kill(playerid, ProgressBar[playerid][barid][pb_fill]);
	PB_Kill(playerid, ProgressBar[playerid][barid][pb_main]);
	PB_KillRing(playerid, barid);
	ProgressBar[playerid][barid][pb_valid] = false;
	ProgressBar[playerid][barid][pb_show] = false;
	return 1;
}

/*
	DestroyAllPlayerProgressBars(playerid)
	Destroys every bar of the player.
*/
stock DestroyAllPlayerProgressBars(playerid)
{
	if (!(0 <= playerid < MAX_PLAYERS)) return 0;
	for (new i = 0; i < MAX_PLAYER_BARS; i++) DestroyPlayerProgressBar(playerid, i);
	return 1;
}

// ---------------------------------------------------------------------------- visibility

/*
	ShowPlayerProgressBar(playerid, barid)
	Shows the bar to the player.
*/
stock ShowPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_show] = true;
	if (ProgressBar[playerid][barid][pb_style] == PB_STYLE_RING)
	{
		PB_ApplyRingColours(playerid, barid);
		return 1;
	}
	PlayerTextDrawShow(playerid, ProgressBar[playerid][barid][pb_back]);
	PB_ShowInner(playerid, barid);
	return 1;
}

/*
	HidePlayerProgressBar(playerid, barid)
	Hides the bar (it keeps its value, colours and blinking state).
*/
stock HidePlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_show] = false;
	if (ProgressBar[playerid][barid][pb_style] == PB_STYLE_RING)
	{
		for (new t = 0; t < PB_MAX_TDS; t++)
		{
			if (pb_TdOwner[playerid][t] != barid + 1) continue;
			PlayerTextDrawHide(playerid, PlayerText:t);
			pb_TdPart[playerid][t] &= ~PB_TD_SHOWN;
		}
		return 1;
	}
	PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][pb_back]);
	PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][pb_fill]);
	if (ProgressBar[playerid][barid][pb_main] != PB_NO_TD) PlayerTextDrawHide(playerid, ProgressBar[playerid][barid][pb_main]);
	return 1;
}

/*
	IsPlayerProgressBarVisible(playerid, barid)
	Returns true if the bar is shown.
*/
stock bool:IsPlayerProgressBarVisible(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][pb_show];
}

// ---------------------------------------------------------------------------- value

/*
	SetPlayerProgressBarValue(playerid, barid, Float:value)
	Sets the current value (clamped to 0..max). It never shows a hidden bar.
*/
stock SetPlayerProgressBarValue(playerid, barid, Float:value)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (value < 0.0) value = 0.0;
	if (value > ProgressBar[playerid][barid][pb_max]) value = ProgressBar[playerid][barid][pb_max];
	ProgressBar[playerid][barid][pb_value] = value;
	PB_RenderMain(playerid, barid);
	return 1;
}

/*
	GetPlayerProgressBarValue(playerid, barid)
	Returns the current value.
*/
stock Float:GetPlayerProgressBarValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][pb_value];
}

/*
	SetPlayerProgressBarMaxValue(playerid, barid, Float:max = 100.0)
	Sets the value that fills the bar. The current value is clamped to it.
*/
stock SetPlayerProgressBarMaxValue(playerid, barid, Float:max = 100.0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_max] = max;
	if (ProgressBar[playerid][barid][pb_value] > max) ProgressBar[playerid][barid][pb_value] = max;
	if (ProgressBar[playerid][barid][pb_autoFillMax] > max) ProgressBar[playerid][barid][pb_autoFillMax] = max;
	PB_RenderMain(playerid, barid);
	return 1;
}

/*
	GetPlayerProgressBarMaxValue(playerid, barid)
	Returns the value that fills the bar.
*/
stock Float:GetPlayerProgressBarMaxValue(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][pb_max];
}

// ---------------------------------------------------------------------------- position and size

/*
	SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
	Moves the bar (top-left corner, border included).
*/
stock SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_x] = x;
	ProgressBar[playerid][barid][pb_y] = y;
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarPos(playerid, barid, &Float:x, &Float:y)
	Stores the top-left corner of the bar in x and y.
*/
stock GetPlayerProgressBarPos(playerid, barid, &Float:x, &Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	x = ProgressBar[playerid][barid][pb_x];
	y = ProgressBar[playerid][barid][pb_y];
	return 1;
}

/*
	SetPlayerProgressBarSize(playerid, barid, Float:width, Float:height)
	Changes the width and the height at once (border included).
*/
stock SetPlayerProgressBarSize(playerid, barid, Float:width, Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_width] = width;
	ProgressBar[playerid][barid][pb_height] = height;
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarSize(playerid, barid, &Float:width, &Float:height)
	Stores the width and the height of the bar.
*/
stock GetPlayerProgressBarSize(playerid, barid, &Float:width, &Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	width = ProgressBar[playerid][barid][pb_width];
	height = ProgressBar[playerid][barid][pb_height];
	return 1;
}

/*
	SetPlayerProgressBarWidth(playerid, barid, Float:width)
	Changes only the width.
*/
stock SetPlayerProgressBarWidth(playerid, barid, Float:width)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_width] = width;
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarWidth(playerid, barid)
	Returns the width.
*/
stock Float:GetPlayerProgressBarWidth(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][pb_width];
}

/*
	SetPlayerProgressBarHeight(playerid, barid, Float:height)
	Changes only the height.
*/
stock SetPlayerProgressBarHeight(playerid, barid, Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_height] = height;
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarHeight(playerid, barid)
	Returns the height.
*/
stock Float:GetPlayerProgressBarHeight(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][pb_height];
}

/*
	SetPlayerProgressBarDirection(playerid, barid, direction = BAR_DIRECTION_RIGHT)
	Changes the side the bar fills towards (BAR_DIRECTION_RIGHT, LEFT, UP or DOWN).
*/
stock SetPlayerProgressBarDirection(playerid, barid, direction = BAR_DIRECTION_RIGHT)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_direction] = (BAR_DIRECTION_RIGHT <= direction <= BAR_DIRECTION_DOWN) ? direction : BAR_DIRECTION_RIGHT;
	if (ProgressBar[playerid][barid][pb_style] == PB_STYLE_RING) return _:PB_Render(playerid, barid);
	PB_RenderMain(playerid, barid);
	return 1;
}

/*
	GetPlayerProgressBarDirection(playerid, barid)
	Returns the fill direction.
*/
stock GetPlayerProgressBarDirection(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][pb_direction];
}

// ---------------------------------------------------------------------------- style

/*
	SetPlayerProgressBarStyle(playerid, barid, style = PB_STYLE_BAR, segments = PB_RING_SEGMENTS)
	Changes the style (PB_STYLE_BAR, PB_STYLE_RING or PB_STYLE_CIRCLE) and the ring segments.
	The bar keeps its value, colours, visibility and blinking.
*/
stock SetPlayerProgressBarStyle(playerid, barid, style = PB_STYLE_BAR, segments = PB_RING_SEGMENTS)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_style] = (PB_STYLE_BAR <= style <= PB_STYLE_CIRCLE) ? style : PB_STYLE_BAR;
	ProgressBar[playerid][barid][pb_segments] = PB_ClampSegments(segments);
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarStyle(playerid, barid)
	Returns the style (PB_STYLE_BAR, PB_STYLE_RING or PB_STYLE_CIRCLE).
*/
stock GetPlayerProgressBarStyle(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][pb_style];
}

/*
	GetPlayerProgressBarSegments(playerid, barid)
	Returns the number of ring segments.
*/
stock GetPlayerProgressBarSegments(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][pb_segments];
}

// ---------------------------------------------------------------------------- colours and border

/*
	SetPlayerProgressBarColour(playerid, barid, colour = PB_DEFAULT_COLOUR)
	Changes the bar colour (RRGGBBAA). The inner background follows it, more transparent.
*/
stock SetPlayerProgressBarColour(playerid, barid, colour = PB_DEFAULT_COLOUR)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_colour] = colour;
	PB_ApplyColours(playerid, barid);
	return 1;
}

/*
	GetPlayerProgressBarColour(playerid, barid)
	Returns the bar colour.
*/
stock GetPlayerProgressBarColour(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][pb_colour];
}

/*
	SetPlayerProgressBarBorder(playerid, barid, Float:border = PB_BORDER_DEFAULT)
	Changes the side border (PB_BORDER_MIN to PB_BORDER_MAX; out of range uses the limit).
	The top and bottom border are PB_BORDER_Y_RATIO times thicker.
*/
stock SetPlayerProgressBarBorder(playerid, barid, Float:border = PB_BORDER_DEFAULT)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_border] = PB_ClampBorder(border);
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarBorder(playerid, barid)
	Returns the border chosen for the bar (before fitting it to the bar size).
*/
stock Float:GetPlayerProgressBarBorder(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return ProgressBar[playerid][barid][pb_border];
}

/*
	SetPlayerProgressBarBorderColour(playerid, barid, bordercolour = 0)
	Changes the border colour (0 = black with the alpha of the bar colour).
*/
stock SetPlayerProgressBarBorderColour(playerid, barid, bordercolour = 0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	ProgressBar[playerid][barid][pb_borderColour] = bordercolour;
	PB_ApplyColours(playerid, barid);
	return 1;
}

/*
	GetPlayerProgressBarBorderColour(playerid, barid)
	Returns the border colour (0 = default black).
*/
stock GetPlayerProgressBarBorderColour(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	return ProgressBar[playerid][barid][pb_borderColour];
}

// ---------------------------------------------------------------------------- auto fill

/*
	AutoFillPlayerProgressBar(playerid, barid, Float:maxvalue = -1.0)
	Animates the bar from its value up to maxvalue, holds, goes back to the value, holds and
	repeats until StopAutoFillPlayerProgressBar (PB_AUTOFILL_* set the timing).
	  maxvalue  where the animation goes (-1.0 = the bar max; limited to 0..max of the bar)
	The real value is not changed: SetPlayerProgressBarValue still works and becomes the new base.
	Calling it again replaces the previous auto fill.
*/
stock AutoFillPlayerProgressBar(playerid, barid, Float:maxvalue = -1.0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PB_KillAutoFill(playerid, barid);
	new Float:limit = ProgressBar[playerid][barid][pb_max];
	if (maxvalue < 0.0 || maxvalue > limit) maxvalue = limit;
	ProgressBar[playerid][barid][pb_autoFill] = true;
	ProgressBar[playerid][barid][pb_autoFillMax] = maxvalue;
	ProgressBar[playerid][barid][pb_autoFillStart] = GetTickCount();
	ProgressBar[playerid][barid][pb_lastLit] = -1;
	ProgressBar[playerid][barid][pb_autoFillTimer] = SetTimerEx("PB_AutoFillTick", PB_AUTOFILL_TICK, true, "ii", playerid, barid);
	PB_RenderMain(playerid, barid);
	return 1;
}

/*
	StopAutoFillPlayerProgressBar(playerid, barid)
	Stops the auto fill and shows the real value again.
*/
stock StopAutoFillPlayerProgressBar(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (!ProgressBar[playerid][barid][pb_autoFill]) return 1;
	PB_KillAutoFill(playerid, barid);
	PB_RenderMain(playerid, barid);
	return 1;
}

/*
	IsPlayerProgressBarAutoFilling(playerid, barid)
	Returns true while the bar is auto filling.
*/
stock bool:IsPlayerProgressBarAutoFilling(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][pb_autoFill];
}

forward PB_AutoFillTick(playerid, barid);
public PB_AutoFillTick(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid) || !ProgressBar[playerid][barid][pb_autoFill]) return 0;
	if (ProgressBar[playerid][barid][pb_style] == PB_STYLE_RING)
	{
		// A ring only changes when a segment lights up or goes off
		new lit = PB_RingLit(playerid, barid);
		if (lit == ProgressBar[playerid][barid][pb_lastLit]) return 1;
		ProgressBar[playerid][barid][pb_lastLit] = lit;
	}
	PB_RenderMain(playerid, barid);
	return 1;
}

// ---------------------------------------------------------------------------- blinking

/*
	BlinkPlayerProgressBar(playerid, barid, interval = PB_BLINK_DEFAULT, duration = 0, colour = 0, bordercolour = 0)
	Makes the bar blink. It starts lit and switches every interval.
	  interval      milliseconds between each switch (PB_BLINK_MIN to PB_BLINK_MAX)
	  duration      total time in milliseconds (0 = until StopPlayerProgressBarBlink)
	  colour        inner colour while lit (0 = blink in the bar colour, switching it off and on)
	  bordercolour  border colour while lit (0 = the border keeps its colour)
	Calling it again replaces the previous blink.
*/
stock BlinkPlayerProgressBar(playerid, barid, interval = PB_BLINK_DEFAULT, duration = 0, colour = 0, bordercolour = 0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	PB_KillBlink(playerid, barid);
	if (interval < PB_BLINK_MIN) interval = PB_BLINK_MIN;
	if (interval > PB_BLINK_MAX) interval = PB_BLINK_MAX;
	if (duration < 0) duration = 0;
	ProgressBar[playerid][barid][pb_blinking] = true;
	ProgressBar[playerid][barid][pb_blinkPhase] = true;
	ProgressBar[playerid][barid][pb_blinkColour] = colour;
	ProgressBar[playerid][barid][pb_blinkBorderColour] = bordercolour;
	ProgressBar[playerid][barid][pb_blinkStart] = GetTickCount();
	ProgressBar[playerid][barid][pb_blinkDuration] = duration;
	ProgressBar[playerid][barid][pb_blinkTimer] = SetTimerEx("PB_BlinkTick", interval, true, "ii", playerid, barid);
	PB_ApplyColours(playerid, barid);
	return 1;
}

/*
	StopPlayerProgressBarBlink(playerid, barid)
	Stops blinking and restores the normal colours.
*/
stock StopPlayerProgressBarBlink(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	if (!ProgressBar[playerid][barid][pb_blinking]) return 1;
	PB_KillBlink(playerid, barid);
	PB_ApplyColours(playerid, barid);
	return 1;
}

/*
	IsPlayerProgressBarBlinking(playerid, barid)
	Returns true while the bar is blinking.
*/
stock bool:IsPlayerProgressBarBlinking(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && ProgressBar[playerid][barid][pb_blinking];
}

forward PB_BlinkTick(playerid, barid);
public PB_BlinkTick(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid) || !ProgressBar[playerid][barid][pb_blinking]) return 0;
	new duration = ProgressBar[playerid][barid][pb_blinkDuration];
	if (duration > 0 && GetTickCount() - ProgressBar[playerid][barid][pb_blinkStart] >= duration)
	{
		StopPlayerProgressBarBlink(playerid, barid);
		return 1;
	}
	ProgressBar[playerid][barid][pb_blinkPhase] = !ProgressBar[playerid][barid][pb_blinkPhase];
	PB_ApplyColours(playerid, barid);
	return 1;
}

// ---------------------------------------------------------------------------- hooks

// The game already destroys the player's PlayerTextDraws on disconnect: only the data is freed here
public OnPlayerDisconnect(playerid, reason)
{
	if (0 <= playerid < MAX_PLAYERS)
	{
		for (new i = 0; i < MAX_PLAYER_BARS; i++)
		{
			PB_KillBlink(playerid, i);
			PB_KillAutoFill(playerid, i);
			ProgressBar[playerid][i][pb_valid] = false;
			ProgressBar[playerid][i][pb_show] = false;
		}
		for (new t = 0; t < PB_MAX_TDS; t++) pb_TdOwner[playerid][t] = 0;
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

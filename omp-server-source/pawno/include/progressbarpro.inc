/*
	SA Progress Bar Pro (progressbarpro.inc)
	Player progress bars for SA-MP 0.3.7 and open.mp.

	Same API as progress2.inc, drawn with "LD_SPAC:white" sprites instead of text boxes:
	- exact position, width and height in TextDraw units (640x448), scaled evenly at any
	  resolution (no fixed pixel padding like the text boxes used by progress2);
	- every bar has a border with the same on-screen thickness on all four sides. One TextDraw
	  unit is 640 parts of the screen width and 448 parts of its height, so at 16:9 (1920x1080)
	  it is 3.00 px wide but only 2.41 px tall. That is why the top and bottom border are
	  PB_BORDER_Y_RATIO (1.25) times the side border: 3 px on every side at 1920x1080;
	- the border goes from PB_BORDER_MIN (0.5) to PB_BORDER_MAX (5.0). Values outside that range
	  are replaced by the limit, and the border never grows past what fits in the bar (at least
	  PB_MIN_INNER of inner area is kept);
	- the filled part never goes past the border, disappears when the value is zero, and changing
	  the value never shows a hidden bar;
	- bars can blink, with their own colour for the inner area and for the border.

	Each bar uses 3 PlayerTextDraws, created in this order (so they are drawn in this order):
	  back   (x, y, width, height)                                  border colour (default: black with the bar alpha)
	  fill   (inside the border)                                    bar colour, more transparent
	  main   (part of the fill, from value / max and the direction) bar colour

	Example:
	  new health = CreatePlayerProgressBar(playerid, 500.0, 120.0, 100.0, 8.0, 0xFF1C1CFF);
	  SetPlayerProgressBarValue(playerid, health, 75.0);
	  ShowPlayerProgressBar(playerid, health);
	  BlinkPlayerProgressBar(playerid, health);                          // blinks in the bar colour until stopped
	  BlinkPlayerProgressBar(playerid, health, 200, 3000, 0xFFFFFFFF);   // blinks white for 3 seconds
	  BlinkPlayerProgressBar(playerid, health, 300, 0, 0, 0xFFFF00FF);   // bar colour, border blinks yellow
	  StopPlayerProgressBarBlink(playerid, health);

	-------------------------------------------------------------------------------- functions

	Every function returns 0 (or INVALID_PLAYER_BAR_VALUE for Float getters) when the player or
	the bar is not valid. Parameters with a default value can be left out.

	Creation and life cycle
	  CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 55.5, Float:height = 6.0,
	      colour = 0xFF1C1CFF, Float:max = 100.0, direction = BAR_DIRECTION_RIGHT,
	      Float:border = 1.0, bordercolour = 0)
	      Creates a hidden bar and returns its id (INVALID_PLAYER_BAR_ID on failure).
	      bordercolour 0 = black with the alpha of the bar colour.
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

	Colours and border
	  SetPlayerProgressBarColour(playerid, barid, colour = 0xFF1C1CFF)
	  GetPlayerProgressBarColour(playerid, barid)
	  SetPlayerProgressBarBorder(playerid, barid, Float:border = 1.0)       (0.5 to 5.0)
	  GetPlayerProgressBarBorder(playerid, barid)                  -> Float
	  SetPlayerProgressBarBorderColour(playerid, barid, bordercolour = 0)   (0 = default black)
	  GetPlayerProgressBarBorderColour(playerid, barid)

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
*/

#if defined _progressbarpro_included
	#endinput
#endif
#define _progressbarpro_included

#if defined _progress2_included
	#error Use only one progress bar include: progress2 or progressbarpro.
#endif

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
	PlayerText:pb_back,
	PlayerText:pb_fill,
	PlayerText:pb_main
}

static stock pb_Data[MAX_PLAYERS][MAX_PLAYER_BARS][ProgressBar_Data];

// ---------------------------------------------------------------------------- internal

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
	new Float:bx = PB_FitBorder(pb_Data[playerid][barid][pb_border], pb_Data[playerid][barid][pb_width], pb_Data[playerid][barid][pb_height]);
	new Float:by = bx * PB_BORDER_Y_RATIO;
	x = pb_Data[playerid][barid][pb_x] + bx;
	y = pb_Data[playerid][barid][pb_y] + by;
	width = pb_Data[playerid][barid][pb_width] - bx * 2.0;
	height = pb_Data[playerid][barid][pb_height] - by * 2.0;
	if (width < 0.0) width = 0.0;
	if (height < 0.0) height = 0.0;
}

// Filled part: returns false when there is nothing to draw
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

// Inner colour: the blink colour while lit (if any), otherwise the bar colour
static stock PB_CurrentColour(playerid, barid)
{
	if (pb_Data[playerid][barid][pb_blinking] && pb_Data[playerid][barid][pb_blinkPhase] && pb_Data[playerid][barid][pb_blinkColour] != 0)
		return pb_Data[playerid][barid][pb_blinkColour];
	return pb_Data[playerid][barid][pb_colour];
}

// Border colour: the blink border colour while lit (if any), the chosen one, or black with the bar alpha
static stock PB_BorderColour(playerid, barid)
{
	if (pb_Data[playerid][barid][pb_blinking] && pb_Data[playerid][barid][pb_blinkPhase] && pb_Data[playerid][barid][pb_blinkBorderColour] != 0)
		return pb_Data[playerid][barid][pb_blinkBorderColour];
	if (pb_Data[playerid][barid][pb_borderColour] != 0) return pb_Data[playerid][barid][pb_borderColour];
	return pb_Data[playerid][barid][pb_colour] & 0xFF;
}

// Blinking without an inner colour switches the inner area off while lit
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

// Applies the current colours (and the current blink phase) without recreating the TextDraws
static stock PB_ApplyColours(playerid, barid)
{
	if (pb_Data[playerid][barid][pb_back] != PB_NO_TD)
	{
		PB_TextDrawColour(playerid, pb_Data[playerid][barid][pb_back], PB_BorderColour(playerid, barid));
		if (pb_Data[playerid][barid][pb_show]) PlayerTextDrawShow(playerid, pb_Data[playerid][barid][pb_back]);
	}
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

// Recreates only the filled part (its position changes for the left and up directions)
static stock PB_RenderMain(playerid, barid)
{
	PB_Kill(playerid, pb_Data[playerid][barid][pb_main]);
	new Float:x, Float:y, Float:width, Float:height;
	if (!PB_MainRect(playerid, barid, x, y, width, height)) return;
	pb_Data[playerid][barid][pb_main] = PB_Sprite(playerid, x, y, width, height, PB_CurrentColour(playerid, barid));
	if (pb_Data[playerid][barid][pb_show] && pb_Data[playerid][barid][pb_main] != PB_NO_TD && !PB_InnerHidden(playerid, barid))
		PlayerTextDrawShow(playerid, pb_Data[playerid][barid][pb_main]);
}

// Recreates the whole bar (position, size or border changed)
static stock bool:PB_Render(playerid, barid)
{
	PB_Kill(playerid, pb_Data[playerid][barid][pb_back]);
	PB_Kill(playerid, pb_Data[playerid][barid][pb_fill]);
	PB_Kill(playerid, pb_Data[playerid][barid][pb_main]);
	new Float:x, Float:y, Float:width, Float:height;
	pb_Data[playerid][barid][pb_back] = PB_Sprite(playerid, pb_Data[playerid][barid][pb_x], pb_Data[playerid][barid][pb_y],
		pb_Data[playerid][barid][pb_width], pb_Data[playerid][barid][pb_height], PB_BorderColour(playerid, barid));
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

// ---------------------------------------------------------------------------- creation and life cycle

/*
	IsValidPlayerProgressBar(playerid, barid)
	Returns true if the bar exists for that player.
*/
stock bool:IsValidPlayerProgressBar(playerid, barid)
{
	return (0 <= playerid < MAX_PLAYERS) && (0 <= barid < MAX_PLAYER_BARS) && pb_Data[playerid][barid][pb_valid];
}

/*
	CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 55.5, Float:height = 6.0,
	    colour = PB_DEFAULT_COLOUR, Float:max = 100.0, direction = BAR_DIRECTION_RIGHT,
	    Float:border = PB_BORDER_DEFAULT, bordercolour = 0)
	Creates a bar for the player (hidden until ShowPlayerProgressBar) with value 0.
	  x, y          top-left corner in TextDraw units (640x448)
	  width, height size of the whole bar, border included
	  colour        bar colour (RRGGBBAA)
	  max           value that fills the bar
	  direction     BAR_DIRECTION_RIGHT, BAR_DIRECTION_LEFT, BAR_DIRECTION_UP or BAR_DIRECTION_DOWN
	  border        side border (PB_BORDER_MIN to PB_BORDER_MAX; out of range uses the limit;
	                reduced to fit when the bar is too small)
	  bordercolour  border colour (0 = black with the alpha of the bar colour)
	Returns the bar id, or INVALID_PLAYER_BAR_ID if the player is not connected, the player
	already has MAX_PLAYER_BARS bars or there are no free PlayerTextDraws.
*/
stock CreatePlayerProgressBar(playerid, Float:x, Float:y, Float:width = 55.5, Float:height = 6.0, colour = PB_DEFAULT_COLOUR, Float:max = 100.0, direction = BAR_DIRECTION_RIGHT, Float:border = PB_BORDER_DEFAULT, bordercolour = 0)
{
	if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return INVALID_PLAYER_BAR_ID;
	new barid = INVALID_PLAYER_BAR_ID;
	for (new i = 0; i < MAX_PLAYER_BARS; i++)
	{
		if (!pb_Data[playerid][i][pb_valid]) { barid = i; break; }
	}
	if (barid == INVALID_PLAYER_BAR_ID)
	{
		print("[SA Progress Bar Pro] Player bar limit reached (MAX_PLAYER_BARS).");
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
	pb_Data[playerid][barid][pb_borderColour] = bordercolour;
	pb_Data[playerid][barid][pb_blinkBorderColour] = 0;
	pb_Data[playerid][barid][pb_blinkColour] = 0;
	pb_Data[playerid][barid][pb_blinking] = false;
	pb_Data[playerid][barid][pb_blinkPhase] = false;
	pb_Data[playerid][barid][pb_blinkTimer] = 0;
	pb_Data[playerid][barid][pb_back] = PB_NO_TD;
	pb_Data[playerid][barid][pb_fill] = PB_NO_TD;
	pb_Data[playerid][barid][pb_main] = PB_NO_TD;
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
	PB_Kill(playerid, pb_Data[playerid][barid][pb_back]);
	PB_Kill(playerid, pb_Data[playerid][barid][pb_fill]);
	PB_Kill(playerid, pb_Data[playerid][barid][pb_main]);
	pb_Data[playerid][barid][pb_valid] = false;
	pb_Data[playerid][barid][pb_show] = false;
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
	pb_Data[playerid][barid][pb_show] = true;
	PlayerTextDrawShow(playerid, pb_Data[playerid][barid][pb_back]);
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
	pb_Data[playerid][barid][pb_show] = false;
	PlayerTextDrawHide(playerid, pb_Data[playerid][barid][pb_back]);
	PlayerTextDrawHide(playerid, pb_Data[playerid][barid][pb_fill]);
	if (pb_Data[playerid][barid][pb_main] != PB_NO_TD) PlayerTextDrawHide(playerid, pb_Data[playerid][barid][pb_main]);
	return 1;
}

/*
	IsPlayerProgressBarVisible(playerid, barid)
	Returns true if the bar is shown.
*/
stock bool:IsPlayerProgressBarVisible(playerid, barid)
{
	return IsValidPlayerProgressBar(playerid, barid) && pb_Data[playerid][barid][pb_show];
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
	if (value > pb_Data[playerid][barid][pb_max]) value = pb_Data[playerid][barid][pb_max];
	pb_Data[playerid][barid][pb_value] = value;
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
	return pb_Data[playerid][barid][pb_value];
}

/*
	SetPlayerProgressBarMaxValue(playerid, barid, Float:max = 100.0)
	Sets the value that fills the bar. The current value is clamped to it.
*/
stock SetPlayerProgressBarMaxValue(playerid, barid, Float:max = 100.0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_max] = max;
	if (pb_Data[playerid][barid][pb_value] > max) pb_Data[playerid][barid][pb_value] = max;
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
	return pb_Data[playerid][barid][pb_max];
}

// ---------------------------------------------------------------------------- position and size

/*
	SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
	Moves the bar (top-left corner, border included).
*/
stock SetPlayerProgressBarPos(playerid, barid, Float:x, Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_x] = x;
	pb_Data[playerid][barid][pb_y] = y;
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarPos(playerid, barid, &Float:x, &Float:y)
	Stores the top-left corner of the bar in x and y.
*/
stock GetPlayerProgressBarPos(playerid, barid, &Float:x, &Float:y)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	x = pb_Data[playerid][barid][pb_x];
	y = pb_Data[playerid][barid][pb_y];
	return 1;
}

/*
	SetPlayerProgressBarSize(playerid, barid, Float:width, Float:height)
	Changes the width and the height at once (border included).
*/
stock SetPlayerProgressBarSize(playerid, barid, Float:width, Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_width] = width;
	pb_Data[playerid][barid][pb_height] = height;
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarSize(playerid, barid, &Float:width, &Float:height)
	Stores the width and the height of the bar.
*/
stock GetPlayerProgressBarSize(playerid, barid, &Float:width, &Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	width = pb_Data[playerid][barid][pb_width];
	height = pb_Data[playerid][barid][pb_height];
	return 1;
}

/*
	SetPlayerProgressBarWidth(playerid, barid, Float:width)
	Changes only the width.
*/
stock SetPlayerProgressBarWidth(playerid, barid, Float:width)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_width] = width;
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarWidth(playerid, barid)
	Returns the width.
*/
stock Float:GetPlayerProgressBarWidth(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb_Data[playerid][barid][pb_width];
}

/*
	SetPlayerProgressBarHeight(playerid, barid, Float:height)
	Changes only the height.
*/
stock SetPlayerProgressBarHeight(playerid, barid, Float:height)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_height] = height;
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarHeight(playerid, barid)
	Returns the height.
*/
stock Float:GetPlayerProgressBarHeight(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb_Data[playerid][barid][pb_height];
}

/*
	SetPlayerProgressBarDirection(playerid, barid, direction = BAR_DIRECTION_RIGHT)
	Changes the side the bar fills towards (BAR_DIRECTION_RIGHT, LEFT, UP or DOWN).
*/
stock SetPlayerProgressBarDirection(playerid, barid, direction = BAR_DIRECTION_RIGHT)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_direction] = (BAR_DIRECTION_RIGHT <= direction <= BAR_DIRECTION_DOWN) ? direction : BAR_DIRECTION_RIGHT;
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
	return pb_Data[playerid][barid][pb_direction];
}

// ---------------------------------------------------------------------------- colours and border

/*
	SetPlayerProgressBarColour(playerid, barid, colour = PB_DEFAULT_COLOUR)
	Changes the bar colour (RRGGBBAA). The inner background follows it, more transparent.
*/
stock SetPlayerProgressBarColour(playerid, barid, colour = PB_DEFAULT_COLOUR)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_colour] = colour;
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
	return pb_Data[playerid][barid][pb_colour];
}

/*
	SetPlayerProgressBarBorder(playerid, barid, Float:border = PB_BORDER_DEFAULT)
	Changes the side border (PB_BORDER_MIN to PB_BORDER_MAX; out of range uses the limit).
	The top and bottom border are PB_BORDER_Y_RATIO times thicker.
*/
stock SetPlayerProgressBarBorder(playerid, barid, Float:border = PB_BORDER_DEFAULT)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_border] = PB_ClampBorder(border);
	return _:PB_Render(playerid, barid);
}

/*
	GetPlayerProgressBarBorder(playerid, barid)
	Returns the border chosen for the bar (before fitting it to the bar size).
*/
stock Float:GetPlayerProgressBarBorder(playerid, barid)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return INVALID_PLAYER_BAR_VALUE;
	return pb_Data[playerid][barid][pb_border];
}

/*
	SetPlayerProgressBarBorderColour(playerid, barid, bordercolour = 0)
	Changes the border colour (0 = black with the alpha of the bar colour).
*/
stock SetPlayerProgressBarBorderColour(playerid, barid, bordercolour = 0)
{
	if (!IsValidPlayerProgressBar(playerid, barid)) return 0;
	pb_Data[playerid][barid][pb_borderColour] = bordercolour;
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
	return pb_Data[playerid][barid][pb_borderColour];
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
	pb_Data[playerid][barid][pb_blinking] = true;
	pb_Data[playerid][barid][pb_blinkPhase] = true;
	pb_Data[playerid][barid][pb_blinkColour] = colour;
	pb_Data[playerid][barid][pb_blinkBorderColour] = bordercolour;
	pb_Data[playerid][barid][pb_blinkStart] = GetTickCount();
	pb_Data[playerid][barid][pb_blinkDuration] = duration;
	pb_Data[playerid][barid][pb_blinkTimer] = SetTimerEx("PB_BlinkTick", interval, true, "ii", playerid, barid);
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
	if (!pb_Data[playerid][barid][pb_blinking]) return 1;
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

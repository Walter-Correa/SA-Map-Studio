/*
	textdrawblink.inc - blinking PlayerTextDraws for SA-MP / open.mp. Needs only a_samp (or open.mp); nothing else.

	BlinkPlayerTextDraw(playerid, PlayerText:textid, interval = 500, duration = 0, bool:perChar = false, colour = 0, const text[] = "", baseColour = 0)
	Makes a PlayerTextDraw blink: text, sprite (font 4), preview model (font 5) and box.
	  interval  milliseconds between each switch (minimum 50)
	  duration  total time in milliseconds (0 = until StopPlayerTextDrawBlink)
	  colour    0: the blink is the textdraw vanishing and showing up again (any kind of textdraw).
	            other: the textdraw never vanishes; it is painted in this colour (0xRRGGBBAA) and, after the interval,
	            goes back to its original colour, and so on. What is painted depends on the textdraw:
	              text and sprite   the text colour (the tint of a sprite); the parts of a text coloured by a tag
	                                (~y~, ~r~, ~b~...) keep that colour until a ~s~ or another tag, as the game draws them
	              box               when the textdraw has a box (PlayerTextDrawUseBox), the box too
	              preview model     the background colour (the model itself cannot be painted)
	            In perChar mode the text is painted in this colour while it is being typed
	  perChar   false: the whole textdraw goes off and on every interval (it starts lit)
	            true:  only for texts: the text is hidden and its characters appear one by one, one every interval;
	                   after the last one and one more interval everything vanishes and it starts again. With a
	                   duration, when interval * characters is longer than it, the interval becomes
	                   duration / characters, so every character shows up inside the duration.
	                   A sprite or a preview model blinks as a whole
	  text      the text of the textdraw, needed for perChar (omitted: open.mp's PlayerTextDrawGetString is used)
	  baseColour the original colour that is painted back, needed with a colour. Omitted: open.mp's getters are used or,
	            if there are none, the last colour set with PlayerTextDrawColor / BoxColor / BackgroundColor (this
	            include hooks them and remembers it). Only has to be given when the colour was never set; 0 is not accepted
	Tags (~r~, ~n~, ~k~~KEY~...), spaces and underscores are never a step of their own: they go with the character that follows them
	(the game draws nothing for a text that ends in a space).
	When it ends (duration over or StopPlayerTextDrawBlink) the textdraw is left shown as it was, with its full text.
	Calling it again for the same textdraw replaces the previous blink. Returns 1 on success.

	The include hooks some functions to keep the blink consistent:
	  PlayerTextDrawHide      hiding a blinking textdraw stops the blink (the textdraw stays hidden)
	  PlayerTextDrawDestroy   destroying a blinking textdraw stops the blink first
	  PlayerTextDrawSetString on a textdraw that is typing (perChar) changes the text it types
	  PlayerTextDrawColor/Colour, BoxColor/Colour, BackgroundColor/Colour, Font, UseBox  remember what the textdraw is
	  OnPlayerDisconnect      frees everything of the player

	StopPlayerTextDrawBlink(playerid, PlayerText:textid)
	Stops the blink and shows the textdraw with its full text and original colours. Returns 0 if it was not blinking.

	IsPlayerTextDrawBlinking(playerid, PlayerText:textid)

	Memory: 4 cells for each possible textdraw of each player (MAX_PLAYERS * PTDB_MAX_TD * 4); define PTDB_MAX_TD lower
	(before the include) if the server uses fewer textdraws per player.
*/

#if !defined PTDB_MAX_BLINKS
	#define PTDB_MAX_BLINKS (32)
#endif
#if !defined PTDB_MAX_TEXT
	#define PTDB_MAX_TEXT (256)
#endif
#if !defined PTDB_MAX_TD
	#define PTDB_MAX_TD (256) // PlayerTextDraw ids that are remembered (per player)
#endif
#define PTDB_MIN_INTERVAL (50)

// What the include remembers of each textdraw (the colours and font set through the hooked functions; 0 = never set)
static PTDB_Info[MAX_PLAYERS][PTDB_MAX_TD]; // bits 0-2: font, bit 3: box on
static PTDB_RemText[MAX_PLAYERS][PTDB_MAX_TD];
static PTDB_RemBox[MAX_PLAYERS][PTDB_MAX_TD];
static PTDB_RemBack[MAX_PLAYERS][PTDB_MAX_TD];

static bool:PTDB_Used[PTDB_MAX_BLINKS];
static PTDB_Player[PTDB_MAX_BLINKS];
static PlayerText:PTDB_Td[PTDB_MAX_BLINKS];
static PTDB_Timer[PTDB_MAX_BLINKS];
static bool:PTDB_PerChar[PTDB_MAX_BLINKS];
static bool:PTDB_Preview[PTDB_MAX_BLINKS]; // font 5: the colour goes to the background
static PTDB_Step[PTDB_MAX_BLINKS]; // perChar: characters shown; whole textdraw: 1 lit, 0 off
static PTDB_Start[PTDB_MAX_BLINKS];
static PTDB_Duration[PTDB_MAX_BLINKS];
static PTDB_Count[PTDB_MAX_BLINKS]; // visible characters of the text
static PTDB_Colour[PTDB_MAX_BLINKS]; // colour of the blink (0 = the textdraw vanishes)
static PTDB_Base[PTDB_MAX_BLINKS]; // original colour (text, or background for a preview)
static PTDB_BoxBase[PTDB_MAX_BLINKS]; // original colour of the box (0 = no box to paint)
static PTDB_Text[PTDB_MAX_BLINKS][PTDB_MAX_TEXT];

static stock PTDB_Find(playerid, PlayerText:textid)
{
	for (new i = 0; i < PTDB_MAX_BLINKS; i++)
	{
		if (PTDB_Used[i] && PTDB_Player[i] == playerid && PTDB_Td[i] == textid) return i;
	}
	return -1;
}

// Index after the ~x~ tag that starts at i (~k~ takes the ~KEY_NAME~ that follows it too)
static stock PTDB_SkipTag(const text[], i)
{
	new j = i + 1;
	while (text[j] && text[j] != '~') j++;
	if (text[j] != '~') return j; // unterminated: it runs to the end
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

// Number of visible characters (the ~x~ tags, the spaces and the underscores do not count: they do not draw anything)
static stock PTDB_CountChars(const text[])
{
	new i, seen;
	while (text[i])
	{
		if (text[i] == '~')
		{
			i = PTDB_SkipTag(text, i);
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

// Length of the text up to the given visible character, with the tags and spaces that come before it. A text that ends in a space
// is not drawn at all by the game, so a space always goes together with the character that follows it
static stock PTDB_Cut(const text[], chars)
{
	if (chars <= 0) return 0;
	new i, seen;
	while (text[i])
	{
		if (text[i] == '~')
		{
			i = PTDB_SkipTag(text, i);
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

static stock PTDB_Draw(slot)
{
	new part[PTDB_MAX_TEXT], cut = PTDB_Cut(PTDB_Text[slot], PTDB_Step[slot]);
	if (PTDB_Step[slot] >= PTDB_Count[slot]) cut = strlen(PTDB_Text[slot]);
	if (cut > 0) strmid(part, PTDB_Text[slot], 0, cut, sizeof part);
	else
	{
		part[0] = ' ';
		part[1] = 0;
	}
	PlayerTextDrawSetString(PTDB_Player[slot], PTDB_Td[slot], part);
}

// Paints the textdraw with the blink colour (lit) or with its original colours, and shows it
static stock PTDB_Paint(slot, bool:lit)
{
	new playerid = PTDB_Player[slot], PlayerText:td = PTDB_Td[slot];
	new colour = lit ? PTDB_Colour[slot] : PTDB_Base[slot];
	if (PTDB_Preview[slot]) PlayerTextDrawBackgroundColor(playerid, td, colour);
	else
	{
		PlayerTextDrawColor(playerid, td, colour);
		if (PTDB_BoxBase[slot]) PlayerTextDrawBoxColor(playerid, td, lit ? PTDB_Colour[slot] : PTDB_BoxBase[slot]);
	}
	PlayerTextDrawShow(playerid, td);
}

// Ends a blink. restore: leave the textdraw shown with its full text and original colours
static stock PTDB_Free(slot, bool:restore)
{
	if (!PTDB_Used[slot]) return;
	KillTimer(PTDB_Timer[slot]);
	PTDB_Used[slot] = false;
	new playerid = PTDB_Player[slot];
	if (restore && IsPlayerConnected(playerid))
	{
		if (PTDB_PerChar[slot]) PlayerTextDrawSetString(playerid, PTDB_Td[slot], PTDB_Text[slot]);
		if (PTDB_Colour[slot]) PTDB_Paint(slot, false);
		else PlayerTextDrawShow(playerid, PTDB_Td[slot]);
	}
}

forward PTDB_Tick(slot);
public PTDB_Tick(slot)
{
	if (slot < 0 || slot >= PTDB_MAX_BLINKS || !PTDB_Used[slot]) return 0;
	new playerid = PTDB_Player[slot];
	if (!IsPlayerConnected(playerid))
	{
		PTDB_Free(slot, false);
		return 0;
	}
	if (PTDB_Duration[slot] > 0 && GetTickCount() - PTDB_Start[slot] >= PTDB_Duration[slot])
	{
		PTDB_Free(slot, true);
		return 1;
	}
	if (PTDB_PerChar[slot])
	{
		PTDB_Step[slot]++;
		if (PTDB_Step[slot] > PTDB_Count[slot]) PTDB_Step[slot] = 0; // one interval with everything shown, then it all vanishes
		PTDB_Draw(slot);
	}
	else
	{
		PTDB_Step[slot] = PTDB_Step[slot] ? 0 : 1;
		if (PTDB_Colour[slot]) PTDB_Paint(slot, PTDB_Step[slot] != 0);
		else if (PTDB_Step[slot]) PlayerTextDrawShow(playerid, PTDB_Td[slot]);
		else PlayerTextDrawHide(playerid, PTDB_Td[slot]);
	}
	return 1;
}

stock StopPlayerTextDrawBlink(playerid, PlayerText:textid)
{
	new slot = PTDB_Find(playerid, textid);
	if (slot == -1) return 0;
	PTDB_Free(slot, true);
	return 1;
}

stock bool:IsPlayerTextDrawBlinking(playerid, PlayerText:textid)
{
	return PTDB_Find(playerid, textid) != -1;
}

stock BlinkPlayerTextDraw(playerid, PlayerText:textid, interval = 500, duration = 0, bool:perChar = false, colour = 0, const text[] = "", baseColour = 0)
{
	if (!IsPlayerConnected(playerid) || _:textid == 0xFFFF) return 0;
	new slot = PTDB_Find(playerid, textid);
	if (slot != -1) PTDB_Free(slot, false);
	else
	{
		for (new i = 0; i < PTDB_MAX_BLINKS; i++)
		{
			if (!PTDB_Used[i])
			{
				slot = i;
				break;
			}
		}
		if (slot == -1) return 0;
	}
	if (interval < PTDB_MIN_INTERVAL) interval = PTDB_MIN_INTERVAL;
	if (duration < 0) duration = 0;
	// what kind of textdraw it is
	new bool:known = (0 <= _:textid < PTDB_MAX_TD), font = 1, bool:box = false;
	if (known)
	{
		font = PTDB_Info[playerid][_:textid] & 7;
		box = (PTDB_Info[playerid][_:textid] & 8) != 0;
	}
	#if defined PlayerTextDrawGetFont
		font = _:PlayerTextDrawGetFont(playerid, textid);
	#endif
	#if defined PlayerTextDrawIsBox
		box = PlayerTextDrawIsBox(playerid, textid);
	#endif
	new bool:preview = (font == 5);
	if (font == 4 || font == 5) perChar = false; // a sprite and a preview model blink as a whole
	new boxBase = 0;
	if (colour)
	{
		if (preview)
		{
			#if defined PlayerTextDrawGetBackgroundColor
				if (!baseColour) baseColour = PlayerTextDrawGetBackgroundColor(playerid, textid);
			#endif
			if (!baseColour && known) baseColour = PTDB_RemBack[playerid][_:textid];
		}
		else
		{
			#if defined PlayerTextDrawGetColor
				if (!baseColour) baseColour = PlayerTextDrawGetColor(playerid, textid);
			#endif
			if (!baseColour && known) baseColour = PTDB_RemText[playerid][_:textid];
			if (box)
			{
				#if defined PlayerTextDrawGetBoxColor
					boxBase = PlayerTextDrawGetBoxColor(playerid, textid);
				#endif
				if (!boxBase && known) boxBase = PTDB_RemBox[playerid][_:textid];
			}
		}
		if (!baseColour) return 0; // the original colour is not known
	}
	PTDB_Text[slot][0] = 0;
	if (perChar)
	{
		if (text[0]) strmid(PTDB_Text[slot], text, 0, strlen(text), PTDB_MAX_TEXT);
		#if defined PlayerTextDrawGetString
		else PlayerTextDrawGetString(playerid, textid, PTDB_Text[slot], PTDB_MAX_TEXT);
		#endif
		PTDB_Count[slot] = PTDB_CountChars(PTDB_Text[slot]);
		if (PTDB_Count[slot] == 0) perChar = false; // nothing to split: the whole textdraw blinks
	}
	if (perChar && duration > 0 && PTDB_Count[slot] * interval > duration)
	{
		interval = duration / PTDB_Count[slot];
		if (interval < PTDB_MIN_INTERVAL) interval = PTDB_MIN_INTERVAL;
	}
	PTDB_Used[slot] = true;
	PTDB_Player[slot] = playerid;
	PTDB_Td[slot] = textid;
	PTDB_PerChar[slot] = perChar;
	PTDB_Preview[slot] = preview;
	PTDB_Duration[slot] = duration;
	PTDB_Colour[slot] = colour;
	PTDB_Base[slot] = baseColour;
	PTDB_BoxBase[slot] = boxBase;
	PTDB_Start[slot] = GetTickCount();
	if (perChar)
	{
		PTDB_Step[slot] = 0;
		PTDB_Draw(slot);
	}
	else PTDB_Step[slot] = 1;
	if (colour) PTDB_Paint(slot, true);
	else PlayerTextDrawShow(playerid, textid);
	PTDB_Timer[slot] = SetTimerEx("PTDB_Tick", interval, true, "i", slot);
	return 1;
}

// ---------------------------------------------------------------------------- hooks
// They are defined after everything above, so the include itself always calls the real functions

static stock PTDB_Valid(playerid, PlayerText:textid)
{
	return 0 <= playerid < MAX_PLAYERS && 0 <= _:textid < PTDB_MAX_TD;
}

// The colour of a blinking textdraw is changed from outside: it is the new original colour (and is painted now if not lit)
// which: 0 text, 1 box, 2 background. Returns true if the call was taken
static stock bool:PTDB_Intercept(playerid, PlayerText:textid, which, colour)
{
	new slot = PTDB_Find(playerid, textid);
	if (slot == -1 || !PTDB_Colour[slot]) return false;
	new bool:lit = PTDB_PerChar[slot] || PTDB_Step[slot] != 0;
	if (which == 2)
	{
		if (!PTDB_Preview[slot]) return false;
		PTDB_Base[slot] = colour;
	}
	else if (which == 1)
	{
		if (PTDB_Preview[slot] || !PTDB_BoxBase[slot]) return false;
		PTDB_BoxBase[slot] = colour;
	}
	else
	{
		if (PTDB_Preview[slot]) return false;
		PTDB_Base[slot] = colour;
	}
	return lit; // lit: the blink colour stays until the next switch, which already uses the new original colour
}

stock PTDB_PlayerTextDrawColor(playerid, PlayerText:textid, colour)
{
	if (PTDB_Valid(playerid, textid)) PTDB_RemText[playerid][_:textid] = colour;
	if (PTDB_Intercept(playerid, textid, 0, colour)) return 1;
	return PlayerTextDrawColor(playerid, textid, colour);
}
#if defined _ALS_PlayerTextDrawColor
	#undef PlayerTextDrawColor
#else
	#define _ALS_PlayerTextDrawColor
#endif
#define PlayerTextDrawColor PTDB_PlayerTextDrawColor

stock PTDB_PlayerTextDrawBoxColor(playerid, PlayerText:textid, colour)
{
	if (PTDB_Valid(playerid, textid)) PTDB_RemBox[playerid][_:textid] = colour;
	if (PTDB_Intercept(playerid, textid, 1, colour)) return 1;
	return PlayerTextDrawBoxColor(playerid, textid, colour);
}
#if defined _ALS_PlayerTextDrawBoxColor
	#undef PlayerTextDrawBoxColor
#else
	#define _ALS_PlayerTextDrawBoxColor
#endif
#define PlayerTextDrawBoxColor PTDB_PlayerTextDrawBoxColor

stock PTDB_PlayerTextDrawBackgroundColor(playerid, PlayerText:textid, colour)
{
	if (PTDB_Valid(playerid, textid)) PTDB_RemBack[playerid][_:textid] = colour;
	if (PTDB_Intercept(playerid, textid, 2, colour)) return 1;
	return PlayerTextDrawBackgroundColor(playerid, textid, colour);
}
#if defined _ALS_PlayerTextDrawBackgroundColor
	#undef PlayerTextDrawBackgroundColor
#else
	#define _ALS_PlayerTextDrawBackgroundColor
#endif
#define PlayerTextDrawBackgroundColor PTDB_PlayerTextDrawBackgroundColor

// open.mp also has the Colour spellings
#if defined PlayerTextDrawColour
stock PTDB_PlayerTextDrawColour(playerid, PlayerText:textid, colour)
{
	if (PTDB_Valid(playerid, textid)) PTDB_RemText[playerid][_:textid] = colour;
	if (PTDB_Intercept(playerid, textid, 0, colour)) return 1;
	return PlayerTextDrawColour(playerid, textid, colour);
}
#if defined _ALS_PlayerTextDrawColour
	#undef PlayerTextDrawColour
#else
	#define _ALS_PlayerTextDrawColour
#endif
#define PlayerTextDrawColour PTDB_PlayerTextDrawColour
#endif

#if defined PlayerTextDrawBoxColour
stock PTDB_PlayerTextDrawBoxColour(playerid, PlayerText:textid, colour)
{
	if (PTDB_Valid(playerid, textid)) PTDB_RemBox[playerid][_:textid] = colour;
	if (PTDB_Intercept(playerid, textid, 1, colour)) return 1;
	return PlayerTextDrawBoxColour(playerid, textid, colour);
}
#if defined _ALS_PlayerTextDrawBoxColour
	#undef PlayerTextDrawBoxColour
#else
	#define _ALS_PlayerTextDrawBoxColour
#endif
#define PlayerTextDrawBoxColour PTDB_PlayerTextDrawBoxColour
#endif

#if defined PlayerTextDrawBackgroundColour
stock PTDB_PlayerTextDrawBackgroundColour(playerid, PlayerText:textid, colour)
{
	if (PTDB_Valid(playerid, textid)) PTDB_RemBack[playerid][_:textid] = colour;
	if (PTDB_Intercept(playerid, textid, 2, colour)) return 1;
	return PlayerTextDrawBackgroundColour(playerid, textid, colour);
}
#if defined _ALS_PlayerTextDrawBackgroundColour
	#undef PlayerTextDrawBackgroundColour
#else
	#define _ALS_PlayerTextDrawBackgroundColour
#endif
#define PlayerTextDrawBackgroundColour PTDB_PlayerTextDrawBackgroundColour
#endif

// The font and the box tell what kind of textdraw it is
#if defined PlayerTextDrawGetFont
stock PTDB_PlayerTextDrawFont(playerid, PlayerText:textid, TEXT_DRAW_FONT:font)
#else
stock PTDB_PlayerTextDrawFont(playerid, PlayerText:textid, font)
#endif
{
	if (PTDB_Valid(playerid, textid)) PTDB_Info[playerid][_:textid] = (PTDB_Info[playerid][_:textid] & ~7) | (_:font & 7);
	return PlayerTextDrawFont(playerid, textid, font);
}
#if defined _ALS_PlayerTextDrawFont
	#undef PlayerTextDrawFont
#else
	#define _ALS_PlayerTextDrawFont
#endif
#define PlayerTextDrawFont PTDB_PlayerTextDrawFont

#if defined PlayerTextDrawIsBox
stock PTDB_PlayerTextDrawUseBox(playerid, PlayerText:textid, bool:use)
#else
stock PTDB_PlayerTextDrawUseBox(playerid, PlayerText:textid, use)
#endif
{
	if (PTDB_Valid(playerid, textid)) PTDB_Info[playerid][_:textid] = use ? (PTDB_Info[playerid][_:textid] | 8) : (PTDB_Info[playerid][_:textid] & ~8);
	return PlayerTextDrawUseBox(playerid, textid, use);
}
#if defined _ALS_PlayerTextDrawUseBox
	#undef PlayerTextDrawUseBox
#else
	#define _ALS_PlayerTextDrawUseBox
#endif
#define PlayerTextDrawUseBox PTDB_PlayerTextDrawUseBox

// Hiding a blinking textdraw from outside ends the blink (it stays hidden)
stock PTDB_PlayerTextDrawHide(playerid, PlayerText:textid)
{
	new slot = PTDB_Find(playerid, textid);
	if (slot != -1) PTDB_Free(slot, false);
	return PlayerTextDrawHide(playerid, textid);
}
#if defined _ALS_PlayerTextDrawHide
	#undef PlayerTextDrawHide
#else
	#define _ALS_PlayerTextDrawHide
#endif
#define PlayerTextDrawHide PTDB_PlayerTextDrawHide

// Destroying a blinking textdraw ends the blink first, and what was remembered of it is forgotten
stock PTDB_PlayerTextDrawDestroy(playerid, PlayerText:textid)
{
	new slot = PTDB_Find(playerid, textid);
	if (slot != -1) PTDB_Free(slot, false);
	if (PTDB_Valid(playerid, textid))
	{
		PTDB_Info[playerid][_:textid] = 0;
		PTDB_RemText[playerid][_:textid] = 0;
		PTDB_RemBox[playerid][_:textid] = 0;
		PTDB_RemBack[playerid][_:textid] = 0;
	}
	return PlayerTextDrawDestroy(playerid, textid);
}
#if defined _ALS_PlayerTextDrawDestroy
	#undef PlayerTextDrawDestroy
#else
	#define _ALS_PlayerTextDrawDestroy
#endif
#define PlayerTextDrawDestroy PTDB_PlayerTextDrawDestroy

// Changing the text of a textdraw that is typing (perChar) changes the text it types
stock PTDB_PlayerTextDrawSetString(playerid, PlayerText:textid, const string[])
{
	new slot = PTDB_Find(playerid, textid);
	if (slot != -1 && PTDB_PerChar[slot])
	{
		strmid(PTDB_Text[slot], string, 0, strlen(string), PTDB_MAX_TEXT);
		PTDB_Count[slot] = PTDB_CountChars(PTDB_Text[slot]);
		if (PTDB_Step[slot] > PTDB_Count[slot]) PTDB_Step[slot] = PTDB_Count[slot];
		PTDB_Draw(slot);
		return 1;
	}
	return PlayerTextDrawSetString(playerid, textid, string);
}
#if defined _ALS_PlayerTextDrawSetString
	#undef PlayerTextDrawSetString
#else
	#define _ALS_PlayerTextDrawSetString
#endif
#define PlayerTextDrawSetString PTDB_PlayerTextDrawSetString

public OnPlayerDisconnect(playerid, reason)
{
	if (0 <= playerid < MAX_PLAYERS)
	{
		for (new i = 0; i < PTDB_MAX_BLINKS; i++)
		{
			if (PTDB_Used[i] && PTDB_Player[i] == playerid) PTDB_Free(i, false);
		}
		for (new t = 0; t < PTDB_MAX_TD; t++)
		{
			PTDB_Info[playerid][t] = 0;
			PTDB_RemText[playerid][t] = 0;
			PTDB_RemBox[playerid][t] = 0;
			PTDB_RemBack[playerid][t] = 0;
		}
	}
	#if defined PTDB_OnPlayerDisconnect
		return PTDB_OnPlayerDisconnect(playerid, reason);
	#else
		return 1;
	#endif
}
#if defined _ALS_OnPlayerDisconnect
	#undef OnPlayerDisconnect
#else
	#define _ALS_OnPlayerDisconnect
#endif
#define OnPlayerDisconnect PTDB_OnPlayerDisconnect
#if defined PTDB_OnPlayerDisconnect
	forward PTDB_OnPlayerDisconnect(playerid, reason);
#endif

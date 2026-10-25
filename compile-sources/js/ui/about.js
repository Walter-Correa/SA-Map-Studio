// "Novidades e documentação": version history, all the editor's features,
// date and time of the last build and the rights reserved.
import { app, $, esc } from './common.js';

export const AUTHORS = 'Rafael_Hurley and Walter_Correa';

// Update History: everything in this dialog is English and never translated (no keys in the language files)
const CHANGELOG = [
  {
    version: '4.1.4', date: '26/10/2026', items: [
      'NPCs with the CJ skin still came out see-through in a new game. The script that has them now waits 20 seconds after the game starts before it makes its NPCs, in case the cause is that the clothes of the player are not built yet at that moment. This is a test: it is not known whether it fixes it.',
    ],
  },
  {
    version: '4.1.3', date: '26/10/2026', items: [
      'Fixed a crash when a new game starts with a CJ NPC in the project: 4.1.2 rebuilt the clothes of the player before making that NPC, and the game cannot do that while a new game starts. The clothes are not rebuilt any more (the CJ model is still not asked for and let go).',
      'The editor now finds the CLEO+ plugin under the name CLEO+.cleo too, so it no longer warns when the plugin is installed.',
    ],
  },
  {
    version: '4.1.2', date: '26/10/2026', items: [
      'NPCs with the CJ skin could appear see-through, with only a piece of the model, in a new game. The script no longer asks for the CJ model and lets it go (it is the model of the player and is always in memory), and it rebuilds the clothes of CJ before making the NPC, so it wears what the player wears. Not tested in the game.',
      'The CLEO+ button of the missing tools warning goes to the releases page of the plugin on GitHub.',
    ],
  },
  {
    version: '4.1.1', date: '26/10/2026', items: [
      'Saved games never get anything from the mod: just before the game writes a save, the scripts take away everything they keep in the world (moving objects, pickups, radar icons and the checkpoint points), and they make it all again right after. A save made with the mod loads without it, and nothing of the mod is in the file. This uses the CLEO+ plugin, which the editor now asks for (it warns when it is missing) when the project has moving objects, pickups, checkpoints or radar icons.',
      'The Fix saves button of 4.1.0 is gone: with the saves clean from the start it is not needed.',
      'Pickups without an action kept their handle in the variable of the next item of the script; each one has its own variable now.',
      'Radar icons have their own scripts now (samsp_name_icons1.cs), so they can be taken away and made again around a save.',
    ],
  },
  {
    version: '4.1.0', date: '26/10/2026', items: [
      'Saved games: a game saved with the mod installed could not be loaded without it, because the save kept the moving objects that the mod scripts had made (with models that only exist in the mod). The moving objects are no longer objects of a mission for the game, so a save does not keep them, and the script makes them again if the game removes them.',
      'New Fix saves button in the Singleplayer window: it takes out of the saved games the objects whose model the game does not have (they come from mods that are not installed), so those saves load. It keeps a backup copy next to each save it fixes (GTASAsf1.b.samapstudio-backup).',
    ],
  },
  {
    version: '4.0.9', date: '25/10/2026', items: [
      'Drive by with every firearm that shoots bullets: pistols, shotguns, submachine guns, rifles (M4, AK-47), sniper rifles and the minigun. The thrown weapons, the rocket launchers and the flamethrower are still left out (they would hit the car itself).',
    ],
  },
  {
    version: '4.0.8', date: '25/10/2026', items: [
      'Drive by: a protector NPC sitting in a vehicle (a passenger) with a weapon that can be fired from inside one (a pistol, a micro uzi, an mp5 or a tec 9) and with ammunition now shoots at the enemies and at the police helicopter from the car. With any other weapon, or without ammunition, it stays in the car and does not get out to fight.',
    ],
  },
  {
    version: '4.0.7', date: '25/10/2026', items: [
      'Fixed protector NPCs riding in the player car throwing it into the air: the collision of a protector that is in a vehicle (or getting in or out) is no longer touched. The game manages it, and forcing it on made the passenger collide with the car.',
    ],
  },
  {
    version: '4.0.6', date: '25/10/2026', items: [
      'NPCs in the water are only asked to swim: no walking, fighting or clearing of tasks is given to them there (the game expects the swim task, and changing it is the suspected cause of the crash with the player and the NPCs in the water). They swim toward the player once a second.',
      'Protector NPCs are not brought to the player while he is in the air, on foot (jumping or falling) or in a vehicle that is in the air.',
      'Protector NPCs in a vehicle or in the water always keep their collision.',
    ],
  },
  {
    version: '4.0.5', date: '25/10/2026', items: [
      'Protector NPCs brought next to the player now appear 3 m behind him when he is on foot and 10 m behind him when he is in a vehicle, and they are not brought to him while he is in a helicopter or a plane.',
      'Protector and enemy NPCs no longer drown: they swim when they get into the water.',
    ],
  },
  {
    version: '4.0.4', date: '25/10/2026', items: [
      'Protector NPCs brought next to the player appear all together at the same point, behind him, and only afterwards go to their own places around him.',
      'Protector NPCs are never taken to the player during a cutscene or a scripted scene (when the player has no control) or while the screen fades.',
      'The car the player drives goes through the protector NPCs that are on foot: while he drives, the car moves and one of them is within 8 m, it has no collision and is held where it is; otherwise it is normal again.',
    ],
  },
  {
    version: '4.0.3', date: '25/10/2026', items: [
      'Fixed the editor not opening after version 4.0.2 (a quotation mark in the update history broke the page).',
    ],
  },
  {
    version: '4.0.2', date: '25/10/2026', items: [
      'New game: after the intro the game puts the player at its own place, so the first time the player gets control back after having it off (the end of the intro) he is now taken to the spawn point. A saved game, which starts with control on, is not affected.',
      'Protector NPCs ignore the characters of the story (the NPCs of the game\'s missions, which use the mission ped types) unless one of them has hurt the player.',
    ],
  },
  {
    version: '4.0.1', date: '25/10/2026', items: [
      'Protector NPCs never stay stuck on a target: a target that was not killed in 15 seconds is let go (and the NPC\'s tasks are cleared) so it can look for another one, or the same one again. Being brought next to the player resets the NPC: it loses its target and its mark.',
      'The police helicopter is again the first priority of the protector NPCs: when the player is wanted and a Police Maverick is within 60 m, they let go of their target and shoot at it.',
      'Protector NPCs only attack vehicles, and enemies inside vehicles, with a weapon that shoots and still has ammunition; otherwise they ignore the target and look for another one that can be reached. They never attack a tank (Rhino) unless they carry a rocket launcher.',
      'NPC ammunition: besides infinite ammunition (the default) an NPC can have a chosen amount. When it runs out the weapon is thrown away and the NPC fights with its hands.',
      'Each script of protector NPCs now holds 4 NPCs instead of 5 (every protector keeps one more variable, for the time on its target).',
    ],
  },
  {
    version: '4.0.0', date: '24/10/2026', items: [
      'Singleplayer editor: the editor is no longer only for SA-MP and open.mp. When the program opens you choose Singleplayer or Multiplayer (and can change it later). A Singleplayer project becomes a mod for the Modloader of the original GTA San Andreas: loose files in modloader\\SA Map Studio\\<project>, so the game\'s own files are never changed. Singleplayer and multiplayer projects are kept in separate folders.',
      'Singleplayer map: new objects and parked vehicles go to an IPL (the cars as car generators, in the streaming IPL of their area); original buildings are removed by burying them in a copy of the IPL that holds them (text and binary IPLs), which keeps every index and LOD link intact; game objects that were only moved or turned are changed in place.',
      'Texture swaps in Singleplayer: each distinct texturing of a model becomes a copy of it with its own id, DFF, TXD (only the swapped textures, the original TXD as its parent) and collision. The pieces are cut from the game\'s own TXD and COL files byte by byte, so the textures keep their original DXT format.',
      'Own models: import a .dff (with its .txd and .col) from files. It gets a free model id of the game, appears in the catalog under "Own models", can be placed, moved and textured like any object, and goes into the mod when an object uses it.',
      'Doors (entrances and exits): an outside marker (yellow) and an inside marker (blue) joined by the same name, with the point where the player appears after going through.',
      'World settings: the spawn point is an item like the others (select, move, turn, copy, undo, delete), the player starts there and comes back there after every death or arrest (the game\'s hospital and police restart are overridden); fixed weather and fixed time of day; radar icons.',
      'Game data of the mod: vehicle handling (merged into handling.cfg), weapons (weapon.dat) at each skill level, with "apply to every level of the weapon" and a reset to the game\'s values that also covers every level, the view distance of a single model and textures replaced in the whole map. The mod only carries what was changed.',
      'Pickups and checkpoints can do something when used: show a message (as text on the screen or in a box, with the game\'s color codes such as ~y~), heal, give armour, money, a weapon or maximum ammo, change the wanted level, teleport the player, give a vehicle, repair it, install nitro, give a jetpack, save the game, change the skin, the weather or the time, or set off an explosion (trap), optionally only once.',
      'Checkpoints are drawn as the red cylinder of the game\'s missions with a point on the radar, and each one is only created while the player is near it (the game draws a limited number of them at a time).',
      'NPCs (the actors of Singleplayer): skin, animation, invulnerability, a weapon with infinite ammunition (the magazine never runs out either), time to come back after dying, a role (neutral, protector of the player or enemy of the player) and, for protectors and enemies, whether they follow the player and how they run to him (fast or normal).',
      'Neutral NPCs never react to anything: they stay where they were put and, if anything moves them more than 0.5 m, they are put back with their angle and animation.',
      'Protector NPCs follow the player running, each one with its own place around him (never closer than 5 m and never piled up on the same point), get into his car and out of it with him, and are brought next to him after 3 seconds when they are more than 100 m away or in another interior (8 seconds when they stay more than 20 m away, stuck behind something).',
      'Protector NPCs fight with priority over everything else: the enemy NPCs of the mod, the cops while the player is wanted, the police helicopters and anyone who shoots at the player. They only go for what they can hit (clear line of sight, so they do not shoot through walls) and ignore targets inside destroyed vehicles. They spread over the enemies, preferring one that no other protector is on, and go to the next one as soon as one dies.',
      'Protector NPCs never hurt the player. What they do counts as the player\'s: every kill adds to the player\'s kills and raises the wanted level with the same thresholds the game uses for each star (150 chaos for a cop, 20 for anyone else, going down with time).',
      'Enemy NPCs attack the player when he comes within 35 m, or follow and attack him within 100 m (without entering interiors and without being teleported to him).',
      'Vehicles of the mod: tuning and paintjobs, indestructible, doors only for the player, and unique vehicles that stay where the player leaves them and come back at their place after a time when destroyed.',
      'Moving objects that go back and forth between two points at a chosen speed.',
      'Everything that needs a script is generated as CLEO scripts by a small assembler built into the editor (the instructions were checked against the Sanny Builder library); scripts are only created when something needs them.',
      'Install the mod in the game from the editor, uninstall it, export it as a ZIP and open its folder. The list of installed mods shows whether each one is up to date, out of date or has no project. The mod folder is organized by type (objects, vehicles, NPCs, checkpoints, pickups, world, weapons...) with a README, and renaming a project renames its installed mod.',
      'The editor warns when the game lacks what the mod needs (the Modloader, CLEO when a script is used, an ASI loader) and offers links to download them.',
      'Importing a map in Singleplayer brings the objects, the texture swaps and the removed buildings. In Portuguese, the Singleplayer interface calls the actors NPCs.',
      'TextDraw blink: new textdrawblink.inc include (included in the test server) with BlinkPlayerTextDraw, StopPlayerTextDrawBlink and IsPlayerTextDrawBlinking. The TextDraw can vanish and show up again, be painted in a colour and go back to the original one (parts coloured by tags such as ~y~ keep their colour), or type its text character by character (the interval adapts to a duration so every character fits; tags and spaces are never a step of their own).',
      'TextDraw blink works on texts, sprites (font 4), preview models (font 5) and boxes. The include hooks PlayerTextDrawColor/Colour, BoxColor, BackgroundColor, Font, UseBox, Hide, Destroy and SetString: hiding or destroying a blinking TextDraw ends the blink, and a new string changes the text being typed.',
      'TextDraw editor: a blink section (interval, duration, vanish, character by character or colour) with a live preview, exported as BlinkPlayerTextDraw with the note that textdrawblink.inc is required, and imported back from Pawn code. The two modes (vanish and character by character) exclude each other.',
      'New TextDraws are PlayerTextDraws by default, and the exported code of a PlayerTextDraw uses PlayerTextDraw* functions with playerid (and PlayerTextDrawShow) instead of the global ones. The import understands them.',
      'Progress bars: new segment scale for rings (7th parameter of CreatePlayerProgressBar, SetPlayerProgressBarRingScale), set in the editor, the Pawn code and the test server. The filled part is resized in place with open.mp (it is no longer recreated on every update) and is created together with the bar, so the TextDraws made after the bar stay on top of it.',
      'Test server: the map\'s TextDraws are PlayerTextDraws created for each player (so they can blink), and the map file has a new DB line for the blink of a TextDraw.',
    ],
  },
  {
    version: '3.24.0', date: '20/10/2026', items: [
      'Smoother 3D view while moving: new map objects are created a few dozen per frame instead of hundreds at once. Looking around no longer floods the app with cursor re-centering requests.',
      'The default view distance is now 500 m, and reducing it (or turning the LODs off) frees the memory of the models that are no longer needed.',
      'Progress bars (progressbarpro.inc): setting the same value again no longer redraws the bar, and the filled part is created before the old one is destroyed, so it does not blink while it fills.',
      'Map loading: the view distance now sets how far the LODs reach, so changing it has a real effect; the detailed models load the way they always did.',
      'GangZones no longer appear in the 3D map: they exist only in the GangZone editor.',
      'Opening the editor is faster: the thumbnail index no longer reads every thumbnail file on each start (it is cached), and old low resolution thumbnails are redrawn only after the editor has finished starting.',
      'Each texture in the material list of a map object has a button that copies its SetObjectMaterial line, with the model of its TXD.',
      'Light theme: blue buttons keep their color on hover (a lighter blue) and the map and TextDraw editors have a light background; the material list of a map object scrolls and shows 5 rows; the Update History text sits on a darker background.',
      'Hovering a texture in the Textures tab also opens the big preview.',
      'Object thumbnails are drawn bigger and anti-aliased (192 px instead of 96 px, sharp like the hover preview); the old low resolution ones are shown until each one is drawn again as you browse, or all at once with the button that prepares every thumbnail.',
      'Light theme reworked: its own blue highlight color instead of the dark theme orange, clearer contrast between wells, lists and buttons, and the TextDraw, MapIcon and GangZone editors, the confirmation dialog, previews and galleries (skins, sprites, map icons) now follow it.',
      'Clicking a map object lists its material indices in the right panel, each with the texture and the texture name it uses.',
      'Selecting an item of the project list that exists in the world also takes the camera to it, besides turning on the gizmo.',
      'Hovering an item of the Objects list shows a big preview of its thumbnail in the middle of the screen; it closes when the mouse leaves or on click.',
      'The dialog that listed the news and the features is now called Update History: it shows only the version history, written in English and never translated, and the feature list and its translations were removed.',
      'Thumbnails are now transparent and take the background of the theme (dark or light), so they fit both. The thumbnail background is 50% lighter in the dark theme; the skin gallery keeps its own.',
      'Theme button in the top bar: switches between the dark theme (default) and a new light theme, and remembers the choice.',
      'Colors button between Sounds and Import: a color picker and converter that shows the selected color as RGBA, ARGB, {RRGGBB}, decimal, HTML, RGB and HSL codes, ready-to-use Pawn lines and the closest text code and vehicle color ID, all to copy on the spot.',
      'Cameras tab: a Stop button next to Play, the only movement of a project opens by itself, and the open/close button of a movement is highlighted like the top bar buttons.',
      'SA Progress Bar Pro: the order of CreatePlayerProgressBar is now ..., direction, border, bordercolour, style, segments; the editor export, the import and the test server follow it, and the import still reads the previous order.',
      'Setting a bar value shows a hidden bar again, so code written for older progress bar includes keeps working.',
      '10 new languages: Deutsch, Polski, Română, Magyar, Türkçe, Bahasa Indonesia, Tiếng Việt, Русский, Українська and Български (15 in all).',
      'The Language menu lists the languages in alphabetical order and scrolls when they do not fit.',
      'The installer and the Windows language detection cover the 15 languages.',
      'Test server messages in the game: letters the SA-MP chat cannot show lose their accent, and the Cyrillic languages use English.',
      'The version history is now always in English and is no longer translated.',
    ],
  },
  {
    version: '3.23.0', date: '20/10/2026', items: [
      'Translation completed: option lists made of joined texts, sample texts of the text boxes, the diagnostic report, texts drawn in the TextDraw editor, catalog names (places, skins, animation categories and sounds) and the full changelog.',
      'Numbers and dates follow the format of the chosen language.',
      'Export: information comments come out in the editor language; functions (Map_[name]_Load, Map_[name]_Remove, CameraShot_[name]) and section separators are always in English. Code exported before is still imported.',
      'SA Progress Bar Pro: style and segments now come right after direction in CreatePlayerProgressBar; the editor, export and test server use the new order, and the import also accepts the old one.',
      'Test server: the /voar and /mapa commands were removed (/fly and /map remain).',
      'Spelling review of every language, including Portuguese.',
    ],
  },
  {
    version: '3.22.0', date: '20/10/2026', items: [
      'The editor is in English, Spanish, Portuguese, Italian and French: the Language button in the top menu switches it instantly, without restarting, and the choice is saved.',
      'On first launch the language follows Windows (Portuguese from Portugal and Brazil use the same Portuguese); text without a translation shows in English.',
      'The installer, the editor\'s warning windows and the test server\'s in-game messages follow the chosen language.',
      'Game and SA-MP names and the exported Pawn code stay the same in every language.',
    ],
  },
  {
    version: '3.21.2', date: '20/10/2026', items: [
      'The manipulator (gizmo) area has priority again: clicking the arrows uses the manipulator; direct click and drag only works when clicking the item outside it.',
      'The gizmo Move/Rotate button is not triggered while an item or the arrows are being dragged.',
    ],
  },
  {
    version: '3.21.1', date: '20/10/2026', items: [
      'Click and drag on an item has priority over the gizmo: it stops reacting to the mouse until the button is released. Over GangZones, the gizmo arrow still works.',
      'The area that grabs the gizmo arrows was cut in half.',
    ],
  },
  {
    version: '3.21.0', date: '20/10/2026', items: [
      'Click and drag on an item moves it right away, without selecting it first (Shift/Ctrl add to the selection).',
      'Import always opens with Replace and Merge unchecked.',
      'Sounds (PlayerPlaySound) are no longer part of the project: they aren\'t saved, imported, loaded or shown on the map. The sound catalog stays only to hear the preview and copy the code.',
      'An old version won\'t open in a folder used by a newer version: incompatible version warning in the executable and in the editor.',
      'Installer windows titled "Installation" and "Update".',
    ],
  },
  {
    version: '3.20.0', date: '20/10/2026', items: [
      'Update through the new .exe: the installed folder becomes exactly like the new version (new files are added, changed ones replaced and the ones that no longer exist deleted), keeping projects, exports, settings and anything else the user created.',
      'Safe update: the package is checked before the switch, and if an error or power loss happens midway the folder goes back to the previous version on the next start.',
      'Before updating, the open editor and test server must be closed (warning with Retry).',
      'Only one editor open at a time: opening it again brings the open window to the front.',
      'Test server: the player spawns only once.',
    ],
  },
  {
    version: '3.19.0', date: '20/10/2026', items: [
      'Import keeps attachments: each attached object stays attached to its parent vehicle or object when replacing, merging (even the same project) or importing as a new project.',
      'Attachments lost by old imports are recovered when opening or importing the project (the parent is found again by its position).',
      'Import, replace and merge are part of undo/redo, in a single step.',
      'Test server: TextDraws and bars appear only once on spawn, without flickering.',
      'SA Progress Bar Pro: ring bars only send the segments that change, without exceeding open.mp\'s packet limit (ackslimit).',
      'Example map with the new TextDraws and bars.',
    ],
  },
  {
    version: '3.18.2', date: '20/10/2026', items: [
      '3D model preview of skins in the game\'s idle pose (ped.ifp IDLE_stance animation applied to the model bones), with arms down, same height and the same strong lighting as the SA-MP preview.',
    ],
  },
  {
    version: '3.18.1', date: '20/10/2026', items: [
      '3D model preview of skins with the same size and position as in game: GTA pedestrian collision (radius 1.0) and the ped at the height of the game pose.',
    ],
  },
  {
    version: '3.18.0', date: '20/10/2026', items: [
      'TextDraw 3D model preview drawn with the real model and the same camera as SA-MP: 256 x 256 image stretched to the box, framing by the model collision sphere, same zoom and same rotation order. Size, zoom and rotation in the editor look like in game.',
      'Model 0 (CJ\'s skin) shows in the 3D model preview.',
      'GangZones: the copy and the new zone go to the nearest empty space, even if it is smaller, and the zone shrinks to fit.',
    ],
  },
  {
    version: '3.17.0', date: '20/10/2026', items: [
      'Auto fill on progress bars (AutoFillPlayerProgressBar and StopAutoFillPlayerProgressBar in SA Progress Bar Pro): fills from the current value up to the chosen value, holds at the top, goes back and repeats. It is saved in the project, goes into the exported code and the preview shows the same movement, all the way to the end.',
      'Import: new Merge with the current project option, which adds the items to the open project without changing its name.',
      'The importer recognizes every item the editor exports, including arrays, and now reads zip files (the maps inside), cars from text IPLs and peds, pickups, markers, blips and radar areas from MTA maps.',
      'Exporting as an array no longer creates objects with textures, movement or attachments twice.',
      'In the include, the bar array is called ProgressBar.',
    ],
  },
  {
    version: '3.16.0', date: '20/10/2026', items: [
      'Built-in color picker in every color field (the editor window didn\'t open the Windows picker): color square, hue, hex code and preset colors.',
      'Fields with a minimum and maximum accept free typing; the limit is only applied when leaving the field (blink interval, segments, border, bar width and height, movement and rotation speed).',
      'Duplicating a TextDraw or bar places the copy right below the original (or above, if it doesn\'t fit), in the same column.',
      'GangZones: the copy snaps to a free side of the original; with no free side, it goes to the nearest free space, shrunk if needed. Adding a zone follows the same rule, and a warning appears when there is no room on the map.',
      'Progress bars: Test movement option, which shows the bar filling and going back to the current value in the preview.',
      'The test server is called SA Map Studio - Testing server.',
    ],
  },
  {
    version: '3.15.1', date: '19/10/2026', items: [
      'The editor only asks for administrator (UAC) when its folder can\'t be written, like inside the GTA folder in Program Files; in other folders it opens without the prompt.',
      'In-game testing keeps working: with GTA in a protected folder, the SA-MP client is opened as administrator (with the Windows prompt) when clicking Test.',
    ],
  },
  {
    version: '3.15.0', date: '19/10/2026', items: [
      'TextDraw order in the editor: Back, Backward, Forward and Front buttons, and dragging in the list to decide which one is on top. The preview, the export and the test server follow the order.',
      'The list separates global TextDraws from player ones (and bars), which in game are always on top of the global ones, and shows each one\'s layer.',
    ],
  },
  {
    version: '3.14.0', date: '19/10/2026', items: [
      'Circular bars in SA Progress Bar Pro, chosen in CreatePlayerProgressBar itself (style parameter): a ring of segments that light up from the top, clockwise or counterclockwise (PB_STYLE_RING, with the number of segments), and a circle that grows from the center (PB_STYLE_CIRCLE).',
      'TextDraw editor: Model field (Bar, Segment ring, Circle) and Segments, with preview, a note on how many PlayerTextDraws the ring uses, export, import and test server.',
      'The include documents what happens when creating circular bars, the resources used and the limitations.',
    ],
  },
  {
    version: '3.13.0', date: '19/10/2026', items: [
      'SA Progress Bar Pro fully in English and documented: each function describes its parameters and the top of the include lists every function and setting.',
      'New SetPlayerProgressBarSize and GetPlayerProgressBarSize functions (width and height together).',
      'Optional parameters with a default value: blink, color, border color, border, maximum value and direction can be left out to use the default.',
      'Changing the bar or border color no longer recreates the TextDraws (no flicker on screen).',
    ],
  },
  {
    version: '3.12.0', date: '19/10/2026', items: [
      'Every progress bar has a border: from 0.5 to 5.0, with decimals, and the bar is never smaller than the minimum border needs.',
      'Bar border color chosen at creation (CreatePlayerProgressBar) or later (SetPlayerProgressBarBorderColour); with no color, the border is black.',
      'Blinking can also change the border color (last parameter of BlinkPlayerProgressBar); without that color, the border stays as it is. The editor preview shows both.',
      'Object movement and rotation speed with decimals, from 0.001 to 10.0 (default 1.0), instead of the fixed list.',
    ],
  },
  {
    version: '3.11.1', date: '19/10/2026', items: [
      'Progress bar border never larger than the bar: the limit follows the width and height and always leaves 1 unit inside. Before, a thick border on a short bar covered everything in black, in the editor and in game.',
      'Blink color option rearranged: the color only shows when "Blink in the bar color" is unchecked.',
    ],
  },
  {
    version: '3.11.0', date: '19/10/2026', items: [
      'Blinking bars: BlinkPlayerProgressBar(playerid, bar, interval, duration, color), with interval and duration in milliseconds; without a color, the bar blinks in its own color, turning off and on. The TextDraw editor shows the blink in the preview and exports, imports and tests it on the server.',
      'Border chosen when creating the bar (last parameter of CreatePlayerProgressBar, from 0 to 4). The editor doesn\'t accept values outside the limits and the include itself uses the limit if the code asks for more or less.',
      'The editor icon shows on the Windows taskbar again.',
    ],
  },
  {
    version: '3.10.1', date: '19/10/2026', items: [
      'Progress bar borders equal on all four sides in game: a TextDraw unit is 3.00 px wide and 2.41 px tall at 1920x1080, so progressbarpro.inc uses a vertical border 1.25 times the horizontal one (3 px on every side in 16:9).',
      'The TextDraw editor preview paints bars with the same pixel rule as the game, showing the real thickness of each border.',
    ],
  },
  {
    version: '3.10.0', date: '19/10/2026', items: [
      'New progressbarpro.inc include (SA Progress Bar Pro) for player progress bars: they use sprites with exact position, width and height, the same at any resolution, and an inner border of the same thickness on all four sides.',
      'The filled part of a bar disappears when the value is zero and never goes past the border, and running out of free TextDraws is handled.',
      'The TextDraw editor draws the bars exactly as progressbarpro.inc builds them in game, and the exported code and the test server use progressbarpro.inc.',
    ],
  },
  {
    version: '3.9.3', date: '19/10/2026', items: [
      'Object texts like in the game: the font size follows the SA-MP rule (the size is the line height, not the letter height), with each letter\'s measurements taken from Windows itself, as the game does; left- or right-aligned texts sit at the top of the material, and the text gets the object\'s color and lighting (on SA-MP signs it looks grayish, as in the game).',
      'Editing an object\'s text no longer erases what was already written: opening the Text tab or changing index only loads the text, and nothing is written until you change something.',
      'The exported code notes in its header when the project has progress bars and needs the progressbarpro include.',
    ],
  },
  {
    version: '3.9.2', date: '19/10/2026', items: [
      'SA-MP object textures fixed: about 450 models (gates, signs, pipes, ramps, houses and others) showed a single gray texture; now each part uses the right texture, and the thumbnails were redone.',
      'Importing without checking "Replace the current project" creates a new project with the file name, instead of mixing the items into the open project.',
      'The Progress Bar name field is now called just Name.',
    ],
  },
  {
    version: '3.9.1', date: '19/10/2026', items: [
      'TextDraws exported with the variables textdraw_0, textdraw_1 and progress bars with progress_0, progress_1 and so on, with the name given in the editor as a comment at the end of the line (read back on import).',
      'New bars start with the name progress_N; the bar in the example map is called progress_0.',
    ],
  },
  {
    version: '3.9.0', date: '19/10/2026', items: [
      'Name on Progress Bars: each bar can have a name, used as the variable name in the exported code.',
      'More Complete Progress Bar Import: recognizes named arguments (.colour, .width, .height, .max, .direction), negative decimal colors, expressions and variables in arrays or enums, using the variable name as the bar name.',
      'TextDraw type buttons arranged in a grid, all visible inside the window.',
      'Done button of the TextDraw, GangZone and MapIcon windows with space up to the edge.',
      'Example map with a progress bar.',
    ],
  },
  {
    version: '3.8.0', date: '19/10/2026', items: [
      'Progress Bar (progressbarpro.inc): new type in the TextDraw editor with width, height, color, maximum value, current value and direction (right, left, up and down), drawn exactly as the include builds it in game.',
      'Export and import of CreatePlayerProgressBar, SetPlayerProgressBarValue and ShowPlayerProgressBar.',
      'Test server with progressbarpro.inc: the bars appear for the player on spawn.',
    ],
  },
  {
    version: '3.7.0', date: '19/10/2026', items: [
      'Resume Where You Left Off: the project stores the items that were selected at the last save; when opened again, the editor selects those items, activates the gizmo and moves the camera to it.',
      'With no project items selected (nothing selected, world object, coexisting project item or deleted item), the project opens focusing on the item closest to the center.',
    ],
  },
  {
    version: '3.6.2', date: '19/10/2026', items: [
      '3DTexts button on the top bar.',
    ],
  },
  {
    version: '3.6.1', date: '19/10/2026', items: [
      'New camera view for the example map (Example Map) on first open.',
    ],
  },
  {
    version: '3.6.0', date: '19/10/2026', items: [
      'Example Map: the first time the editor opens, it loads the Example Map project at its saved camera.',
      'Fine Adjustment with the Arrow Keys: in the MapIcons, TextDraws and GangZones windows the arrow keys move the selected item (1 unit, 0.1 with Shift); while these windows are open, the arrow keys do not affect the main editor.',
      'TextDraw Outline and Shadow became on/off checkboxes (off by default).',
      'The GangZone name updates in the list and on the map as you type.',
    ],
  },
  {
    version: '3.5.5', date: '19/10/2026', items: [
      'New initial camera view when opening an empty project for the first time.',
    ],
  },
  {
    version: '3.5.4', date: '19/10/2026', items: [
      'Cleaner logs: the temporary resize performance monitor was removed.',
    ],
  },
  {
    version: '3.5.3', date: '19/10/2026', items: [
      'The 3D map follows the window again when resizing, without pausing the drawing.',
      'Performance Log: every window resize and every page stall is noted in the Logs (duration, frames, longest pause and long tasks) to diagnose freezes.',
    ],
  },
  {
    version: '3.5.2', date: '19/10/2026', items: [
      'Select the Whole Project in the Inspector: the Project button also takes the camera to the edit arrows.',
      'Cache Always in the Data Folder: thumbnails, texture index, radar and downloaded animations are no longer written inside the source code folder.',
    ],
  },
  {
    version: '3.5.1', date: '19/10/2026', items: [
      'Adaptive Top Bar: button labels show whenever they fit and disappear one by one, only when there\'s no room, keeping the most used ones.',
      'Freeze-free Resizing: the object and texture lists are only redrawn when the visible part changes.',
      'Camera on Open and Import: calculates the center of all project items and focuses on the item closest to that center.',
      'Move the Whole Project: the camera goes straight to the edit arrows.',
      'Sprite splash1 back in the TextDraw catalog.',
    ],
  },
  {
    version: '3.5.0', date: '19/10/2026', items: [
      'Save on Exit: when closing the SA Map Studio window, all open projects are saved before quitting.',
      'Save When Closing the Editors: changes made in the TextDraw, MapIcon and GangZone windows are saved when closing with the X, the Done button or the Esc key.',
      'Import without Automatic Selection: after importing, no item stays selected; the camera just moves to the imported map.',
      'Program Icon: the official icon shows in confirmation boxes and is bigger on the top bar.',
    ],
  },
  {
    version: '3.4.1', date: '19/10/2026', items: [
      'TextDraws Just Like the Game: the editor draws text with GTA SA\'s own fonts and calculates letter size, line breaks, alignment and box exactly like the game, on SA-MP\'s 640x448 screen in 16:9.',
      'Same Values Everywhere: the editor, exported Pawn code and test server use exactly the same TextDrawLetterSize and TextDrawTextSize parameters, with no hidden adjustments.',
      'Clearer Box Fields: the Text Size labels change with the alignment (box end, width or box start).',
      'Old Projects Converted: TextDraws saved in earlier versions are automatically converted to SA-MP values when opening the project.',
      'Right-Aligned Box as in the Game: in the SA-MP 0.3.7 client the right-aligned box goes from the left edge of the screen to the text; the editor now shows exactly that and warns when you enable it.',
      'Precise Selection in the TextDraw Editor: clicking anywhere on the TextDraw selects it and allows dragging, even those at the top of the screen.',
      'Build no longer opens the program folder when it finishes.',
    ],
  },
  {
    version: '3.4.0', date: '18/10/2026', items: [
      'Single Executable: the whole program comes packed in a single SA Map Studio.exe, which creates the sa-map-studio folder on the first run with a progress bar and animated icon, and opens the editor directly afterwards.',
      'Automatic GTA Setup: with the executable inside the GTA San Andreas installation folder, the game folder is recognized and set up on its own, without asking for the installation on start.',
      'More Reliable GTA Detection: priority to the default install folder, then the Windows registry and other drives; with no valid installation, the default folder is suggested and the warning only appears when moving on. Detection only reads the game folders, without changing anything.',
      'Freeze-free Startup: a failure reading the game files goes back to the folder choice with an explanation of the problem.',
      'Works in Program Files: the built-in browser data is moved to a user folder when the program is in a protected Windows folder.',
      'Updated Official Icons: new icon with an animation synced to loading and version metadata in the executable.',
      'TextDraws on open.mp: alignment and boxes adjusted to look the same as the editor inside the test server.',
      'GangZones and MapIcons: improved sequential duplication and snapping.',
      'Cameras: names kept on import and export and a unified callback with cases.',
      'Undo When Dragging: history fixed when moving items by dragging.',
      'Interface without ellipses: cleaner loading texts and search fields.',
    ],
  },
  {
    version: '3.3.0', date: '18/10/2026', items: [
      'Proportional TextDraw Boxes: automatic, tight TextSize calculation around the text with padding when "Enable Box" is turned on, removing giant full-screen boxes.',
      'Boxed TextDraw Alignments on the Test Server: exact TextDrawTextSize calculation for Left, Center and Right alignment according to the SA-MP/open.mp specification.',
      'Complete Undo/Redo Isolation: the MapIcons, GangZones and TextDraws windows have their own local history; automatic reset when opening dialogs and importing projects to protect the map from an accidental Ctrl+Z.',
      'Pawn Camera Import: reading and importing static positions and camera interpolations (SetPlayerCameraPos, SetPlayerCameraLookAt, InterpolateCameraPos, InterpolateCameraLookAt).',
      'Sounds Removed from Import and Export: sounds kept as a test and preview tool without adding lines or headers to the map\'s Pawn code.',
      'GangZone Name Persistence and Export: the name is saved right away when typing or pressing Enter, and export/import are synced via inline comments.',
      'Pawn Export without Duplicate Sections: group comment repetitions removed (3D Texts, GangZones, Pickups).',
    ],
  },
  {
    version: '3.2.0', date: '18/10/2026', items: [
      'TextDraw Editor Improvements: native support for GTA SA color tags (~r~, ~g~, ~b~, ~w~, ~y~, ~p~, ~l~, ~s~, ~h~) and direction symbols (~<~, ~>~, ~u~, ~d~), precise rendering and Pawn export of alignments (Left, Center, Right) and a pure Box model with no text characters.',
      'GangZone and MapIcon Duplication: new "Duplicate" buttons and support for the universal Ctrl+C and Ctrl+D shortcuts in the 2D editors and inspectors, creating the copy in the adjacent free space and selecting it right away.',
      'Direct Movement on the Ground: drag the selected object or item straight across the ground on the horizontal plane (X and Y), keeping the Z height and respecting the grid snap.',
      'Structural Attachment Protection: attachment is blocked for parent objects that already have other objects attached, preventing inconsistencies and hierarchy loops.',
      'Default Edit Axis: the editor gizmo is set to "Axis: Object" mode (local coordinates) by default.',
      'Real-time Text on Objects: dynamic rendering and updating of text applied to object surfaces in the 3D viewport.',
      'Project List with Full Statistics: detailed totals of each category (Objects, Vehicles, Actors, Pickups, 3D Texts, GangZones, MapIcons, Checkpoints, TextDraws and Removed) in the project selection.',
      'Optimized Pawn Export: clean generation without duplicated group comments in the map loading code.',
    ],
  },
  {
    version: '3.1.0', date: '17/10/2026', items: [
      'Official Sound Catalog (PlayerPlaySound): full catalog with 2,620 official sounds, playback and preview with GENRL/SA-MP bank extraction, 9 themed categories and a fixed header with independent scrolling.',
      'Full Checkpoint and Race Checkpoint Support: proportional normal Checkpoints and Race Checkpoints (types 0 to 4), air rings with a torus, dynamic direction arrows connected to the next point, checkered finish cylinders and discs, directional duplication and strict model preservation.',
      'Interactive MapIcon Editor (SetPlayerMapIcon): visual editing window with the San Andreas radar map, 64 icons (IDs 0 to 63), styles (0 to 3), automatic placement on the ground surface, history shortcuts (Undo/Redo with Ctrl+Z/Ctrl+Y) and deletion with Delete.',
      'Improved Vehicle Tuning: geometric alignment and the official GTA San Andreas side skirt pair table (loading native meshes without distortion), spoiler sync on the test server (open.mp) and integrated visual highlight of all components with the vehicle.',
      'Gizmo Mode Switch (Move / Rotate): translucent floating button in the scene with a click area covering 100% of the button and quick shortcuts G and R.',
      'Responsive and Adaptive Top Bar: all buttons and labels fully shown in full screen/maximized, with progressive and smooth adjustment as the window gets smaller.',
    ],
  },
  {
    version: '3.0.0', date: '15/10/2026', items: [
      'Smart Filtering of Tuning, Paintjobs and Vehicle Colors: strict compatibility with the vehicle model based on the official rules (IsVehicleValidForColor, IsVehicleValidForModding, IsPaintjobValidForVehicle and IsModValidForVehicle). The vehicle inspector now shows only the tuning parts (spoilers, hoods, roofs, skirts, exhausts, nitro, wheels, stereo, hydraulics), paintjobs (0 to 2) and color pickers that fit the selected model.',
      'Real Tuning and Paintjobs on the Test Server: AddVehicleComponent and ChangeVehiclePaintjob integrated into the test server gamemode (samapstudio.pwn/amx). When testing the map in game, every vehicle appears with its modding parts installed and its paintjobs applied.',
      'Full 3D Text Support (3D Text Labels): visual creation of 3D labels (Create3DTextLabel / CreateDynamic3DTextLabel) in the scene with a billboard effect facing the camera, multi-line support (\\n), embedded color tags ({RRGGBB}), the official SA-MP palette and a hex picker, view distance (draw distance), line of sight test (testLOS), virtual world and interior, save/load in the project, Pawn import/export and automatic sync with the test server.',
      'Full Pickup Support (CreatePickup / CreateDynamicPickup): categorized catalog of predefined pickups (health, armor, money, properties, weapons IDs 321 to 372 and items), animated 3D mesh with continuous rotation in the viewport, inspector with pickup type, respawn time, world and interior, save/load in the project, Pawn import/export and sync with the test server.',
      'New Interactive GangZone Editor with Radar Map: full modal dialog showing the official GTA San Andreas radar map (-3000 to +3000), pan/zoom navigation, drawing zones by dragging the mouse, smart magnetic edge snapping/alignment between adjacent zones with cyan visual guides, RGBA color picker with transparency/opacity control, flat 3D projection of the zone on the world ground, save/load in the project, Pawn export (GangZoneCreate / GangZoneShowForAll) and rendering on the test server.',
      'New Visual TextDraw Editor (TextDraw Editor): a TextDraw editing environment at SA-MP\'s native 640x480 resolution with safe-margin guides, support for texts and boxes with custom colors and opacity, font selection (0 to 5), shadow, outline, alignment (left, center, right), letter spacing (letter size), text/box size (text size), real preview of 3D models with thumbnails for Font 5 (vehicles, skins and objects with configurable rotation and zoom), interactive dragging and resizing with visual handles, and clean export of ready-to-use Pawn scripts.',
      'Smart CPU and Frame Rate Optimization (Dynamic FPS Throttling): no more wasted CPU by dynamically limiting the viewport frames (60 FPS while the camera moves smoothly, 30 FPS at rest with smooth pickup animation, 5 FPS with dialogs open and 2 FPS in the background/minimized), cutting CPU use from ~15% to minimal levels.',
      'Top Menu Fix and Full Responsiveness: removed the overlap between tools and actions ("Go to", "Undo/Redo") in restored or non-maximized windows through strict flexbox constraints and progressive responsive label collapsing.',
      'Item Creation Fix: fixed the call that registers 3D labels and pickups in the project (app.project.add), ensuring instant insertion in the scene with undo/redo history.',
    ],
  },
  {
    version: '2.9.1', date: '15/10/2026', items: [
      'Top Bar Submenu and "Go to" Menu Fix: removed overflow limits on the top bar and prevented auto-scrolling in the coordinate field of the "Go to" menu (Ctrl+G), so all dropdown menus ("Snap", "Go to", "View") open and float over the viewport without moving or hiding the bar buttons.',
      'Automatic Mouse Cursor Hiding while Moving the Camera: the mouse pointer is now hidden automatically when rotating the view (right button), dragging the screen (middle button) or flying with keyboard/mouse, reappearing as soon as the camera stops moving.',
      'Obsolete "Prepare thumbnails" Function Removed from the Catalog: the redundant button and progress bar in the object panel are gone, since all 15,956 thumbnails are 100% pre-generated and stored locally on disk (Data/cache/thumbnails/objects) with instant loading via virtual scrolling.',
      'Critical Texture Rendering Fix (Three.js WebGL): removed the TypeError Cannot read properties of undefined (reading width) error in uploadTexture, keeping the mipmap structures of DXT and RGBA textures intact in memory, avoiding freezes and visual glitches when rendering map objects.',
    ],
  },
  {
    version: '2.9.0', date: '15/10/2026', items: [
      'Full Weapon Catalog: 46 weapons and special items added (IDs 321 to 372) with 3D thumbnails and a dedicated "Weapons" category, with full alphabetical sorting of the categories.',
      'Fine Tuning with Arrow Buttons on the Axes (▲ / ▼): interactive step buttons for Position (X, Y, Z) and Rotation (RX, RY, RZ) with hold-to-repeat, Shift (fine 0.1x step), Ctrl (fast 5.0x step) and full Undo/Redo history.',
      'Make Invisible in Materials: a button to remove the texture of any index, making that part of the mesh 100% invisible in 3D and exporting the canonical SetObjectMaterial(objectid, 0, "none", "none", 0) format.',
      'Strict Pawn Coordinate Formatting: float values with zero after the point are now exported cleanly as 180.0 and 0.0, fully keeping the raw representation for imported data that wasn\'t edited.',
      'Independent Side Bar Collapsing: new buttons on the inner edges of the menus to collapse or expand the left or right bar individually, keeping the F10 shortcut to toggle both and remembering the state.',
      'Quick Teleport to Click Coordinates: a "Go to the spot" button at the top of the inspector to move the camera instantly to the ground point clicked with the mouse.',
      'Local Disk Thumbnail Architecture and Full VRAM Optimization: 15,956 WebP thumbnails (~15 MB) pre-packaged in the local Data/cache/thumbnails folder, read 100% straight from disk without loading 3D meshes at startup, shared world textures kept (avoiding black asphalt/ground), pixel ratio 1.0 and strict geometry disposal, cutting memory use from >3.1 GB to minimal, stable levels.',
      'Clean, Standalone Executable Build (.exe): improved build script with self-repair of corrupted virtual environments (.venv-build) or ones moved between computers, multi-path detection of working Python interpreters (avoiding invalid Microsoft Store stubs) and support for a 100% standalone clean build (dist-limpo).',
      'Automatic Privilege Elevation (Admin / UAC): --uac-admin flag added to the PyInstaller build, writing requireAdministrator into the executable\'s PE manifest to guarantee full read/write permissions in the game folder, process and port control, with no manual Windows setup.',
    ],
  },
  {
    version: '2.8.0', date: '14/10/2026', items: [
      'New Animation Picker with Split View: interactive split panel with a built-in video player to see the animation running right away.',
      'Video Streaming and Local Cache: dynamic streaming in lightweight WebM format with automatic local caching for instant offline access.',
      'Download Offline Package feature: background batch download of all animations (~320 MB) with real-time progress, percentage and a pause option.',
      'Smart Animation Categories: tabs by context ("Popular", "Talking & Gestures", "Sitting & Lying", "Dances", "Police & Security", "Combat & Weapons", "Sports & Gym", "Bar, Smoking & Leisure", "All") with quick search.',
      'Firm, Fixed Selection: stable selection when clicking the cards without interference from the mouse movement, applied directly or by double click.',
      'New Test Server Commands (/w and /t): /w command (or /weather, /clima) to set the weather (0 to 45) and /t command (or /time, /hora) to set the hour and minutes (e.g. /t 12 or /t 22:30) with real-time sync for all players.',
      '/ajuda Command on the Test Server: full list of available commands (/fly, /map, /w, /t, /v, /anim, /jetpack, /spawn, /pos).'
    ],
  },
  {
    version: '2.7.0', date: '14/10/2026', items: [
      'Full animation catalog: 1,872 presets organized by library with a real-time search field (name, lib and action) in the Actors panel.',
      'Smart window placement and centering on screen: dynamic sizing that adapts to the usable work area, avoiding cut-off or hidden edges on any monitor.',
      'Gizmo axis orientation clarified: "Axes: World" vs "Axes: Object" button with detailed tooltips explaining the effect of global vs local manipulation aligned to the object rotation.',
      '"Change GTA folder" option moved to the "Test in game" menu, keeping all startup and test settings together in one dialog.',
      'New Logs and Diagnostics System: automatic capture of JavaScript errors, rejected promises and console messages, written to sa-map-studio.log, with a dedicated button in the interface and a visual counter.',
      'Diagnostics dialog with real-time view and a one-click "Copy logs" button for support and quick troubleshooting.'
    ],
  },
  {
    version: '2.6.0', date: '14/10/2026', items: [
      '"Go to" menu fully restructured and split into two tabs: "World places" and "Interiors", with real-time search and quick category filters.',
      'Full list of GTA San Andreas interiors with precise teleport coordinates, Interior ID identification and automatic activation of interior mode.',
      'Weather (0 to 45, default 10) and time with minutes (default 10:00) settings directly in the "Test the map in game" dialog, synced with the test server and the player.',
      'Weather and time settings added to the View menu, reflected instantly in the editor\'s 3D viewport (dynamic sky, day/night cycle, volumetric fog and sun and ambient lighting) fully in sync with test mode.',
      'New /fly and /voar commands on the test server to toggle free camera flight (smooth noclip with keyboard/mouse), returning to the exact position and angle where it was turned on when leaving.',
      'New /map and /mapa commands on the test server to teleport the player or vehicle straight to the center of the map being tested.',
      'Refined Actors catalog: unified default selection with real-time skin switching and preview in the right side menu, placed correctly on surfaces without burying feet or lying down.',
    ],
  },
  {
    version: '2.5.0', date: '14/10/2026', items: [
      'View distance limit raised to 2500 meters in the View menu, with proportional streaming and fog rendering.',
      'Dedicated top bar button and shortcut (F10) to collapse the side menus to the screen edges and restore them, freeing the whole screen for editing.',
      'New View menu option to automatically collapse the side menus while moving the camera (WASD, right button or pan) and restore them when stopping.',
      'Improved mouse control: Pointer Lock and automatic re-centering of the cursor in the viewport when releasing the button, keeping the pointer from escaping to the screen corners.',
      'New copyable "Mouse click coordinates" field at the top of the right side menu, showing the coordinates clicked on the map in real time with a quick copy button.',
      'Undo and Redo with smart global support: reverts and reapplies changes in the main project or editable coexisting projects according to the order of the changes.',
      'Optimized camera placement when loading and importing maps: close, balanced framing over the center of the map/items.',
      'Full Actor support on the test server: automatic creation via CreateActor and ApplyActorAnimation.',
      'New official project icon with a perfectly centered, clean front view of the mkwalloven1 oven, without ID badges.',
      'Rights reserved notice and official credits added below the progress bar on the startup screen (boot splash).',
      'Dynamic version system showing the exact build date and time.'],
  },
  {
    version: '2.4.1', date: '14/10/2026', items: [
      'Multiple coexisting projects with an Editable or Not editable option (full lock against accidental edits on non-editable projects with an on-screen warning).',
      'Faithful import of Pawn maps (.pwn) of any style: keeps 100% of comments (// and /* */), notes at the end of code lines, blank lines, headers (#include), material colors in hexadecimal (0xAARRGGBB), text parameters, draw/stream distance, interior and virtual world.',
      'Camera automatically centered looking down over the map when loading or switching projects.',
      'Actor orientation and spawn fix: they appear perfectly upright, standing with their feet on the surface.',
      'Test server with omp-server.exe, DLLs and components packed in the distribution root and real-time sync of the editor changes.',
    ],
  },
  {
    version: '2.4.0', date: '14/10/2026', items: [
      'Deep reduction and optimization of the WebView2 / browser process RAM use while navigating and loading in the background.',
      'Full SA-MP vehicle color palette (0 to 255), including support for the new colors from ID 128 up.',
      'Real-time preview of vehicle tuning, paintjobs and colors in the editor\'s 3D viewport.',
      'Retextures and Texts categories separated from Removed objects in the Project tab.',
      'Standardized renaming to "Remove object" and "Removed objects".',
      'Button to reverse the object list order (first to last and vice versa).',
      'Red "Delete all" button with a safety confirmation dialog.',
      'Tool to merge projects.',
      'Full MoveObject support with parameters and a movement test running exactly 1 cycle without an infinite loop.',
      'Full AttachObjectToObject support with visual editing of the child object\'s position directly in the 3D world.',
      'Actors can be added directly from the catalog by Skin ID with an animation library.',
      'Support for exporting coordinates as an Array and manually editing the Pawn script before saving.',
    ],
  },
  {
    version: '2.3.0', date: '13/10/2026', items: [
      'Movement and rotation speed settings moved to the right side menu next to the coordinates (0.001x to 10.0x the default speed).',
      'Selecting all project objects activates the move arrows/gizmo.',
      'Group rotation: multiple selected objects rotate together around the same common geometric axis.',
    ],
  },
  {
    version: '2.2.0', date: '13/10/2026', items: [
      'Red visual highlight on selected original world objects.',
      'Multiple selection of game objects and simultaneous removal with RemoveBuildingForPlayer.',
      'Delete/remove button moved in the side menu right below the object preview and data.',
      'Larger thumbnails in the object and vehicle catalog.',
      'Game objects re-categorized, fixing mismatches like parachutes in the houses/buildings category.',
      'Custom nicknames for favorite objects and textures.',
      'Properties renamed to "Stream distance" and "Draw distance".',
    ],
  },
  {
    version: '2.1.0', date: '13/10/2026', items: [
      'A changed texture covers the object part evenly in the editor, without the shadows painted on the original model (like in game).',
      'Sturdier internal server: it no longer closes because of low memory on a request and recovers from errors on its own.',
      'Protection against downloading an entire .img file when it has empty entries.',
      'The editor uses less memory when moving around the map (textures are not duplicated and fewer models are kept).',
      '"Prepare thumbnails" frees memory while it works and no longer freezes the screen.',
      'The page heartbeat runs in the background: the program doesn\'t close by itself if the screen is busy.',
      'New "What\'s new and documentation" button, with the build date and time.',
      '"Test Server" folder inside the program, with the gamemode and server used by "Test in game".',
      'New "Compilar EXE limpo.bat": creates a copy of the program with no data, ready to send to someone else.',
      'Test server on port 7777 (SA-MP default), with a warning if the port is already used by another server.',
      'Fixed white buildings (like filler01_law and filler02_law): when gta_int.img has a TXD with the same name, the one from gta3.img now wins, like in game.',
    ],
  },
  {
    version: '2.0.0', date: '13/10/2026', items: [
      'Single "SA Map Studio" folder with Projects, Exported, Data and System organized inside it.',
      'Objects and textures sorted by category (Furniture, Beach, Buildings and houses, Streets and roads, Bricks and walls, Wood and more).',
      'Texture list ready in seconds and thumbnails saved to disk.',
      'SA-MP material editor: all object indexes with the original texture, several indexes at once, color panel and text with preview.',
      'Duplicate and "Place another identical one" create the copy in the same place, with the move gizmo ready.',
      'Teleport to coordinates (Ctrl+G), accepting SetPlayerPos.',
      'Fixed cameras and movements with InterpolateCameraPos/LookAt, editor preview and Pawn code.',
      '"Test in game" with a local test server and SA-MP opening already connected.',
      'Import from any file: Pawn, SQLite, JSON, MTA (.map) and IPL, with textures, texts and cameras.',
      'Opening another project saves and closes the one that was open.',
      'Complete map: missing objects (wrongly flagged interiors) and LODs fixed; loading prioritizes what is in front of the camera.',
      'Fixed the red box that stayed in the center of objects.',
    ],
  },
  {
    version: '1.0.0', date: '12/10/2026', items: [
      'First version of SA Map Studio, replacing SA-MP Map Construction with a new interface.',
      'San Andreas map with streaming and LOD, interiors and SA-MP objects.',
      'Catalog with search, thumbnails, favorites and recent items; gizmo to move and rotate with grid snapping.',
      'Map building removal (RemoveBuildingForPlayer) and vehicles.',
      'Export to Pawn and IPL; .pwn import; projects saved automatically; build to .exe.',
    ],
  },
];

export function setupAbout() {
  const dlg = $('#dlgAbout');
  $('#btnAbout').onclick = async () => {
    try { app.cfg = { ...app.cfg, ...(await (await fetch('/api/config')).json()) }; } catch { /* uses what it already has */ }
    render();
    dlg.showModal();
  };
}

function render() {
  const cfg = app.cfg || {};
  const build = cfg.build || {};
  const compileTime = build.builtAt || '14/10/2026 09:30:00';
  if (CHANGELOG[0]) CHANGELOG[0].date = compileTime;
  const when = `Built on <b>${esc(compileTime)}</b>`;
  const year = new Date().getFullYear();
  $('#aboutBody').innerHTML = `
    <div class="about-head">
      <svg class="brand-mark big" viewBox="0 0 120 120" aria-hidden="true"><use href="#i-brand-logo"/></svg>
      <div><div class="about-title">SA Map Studio <span class="tag">version ${esc(cfg.version || CHANGELOG[0].version)}</span></div>
        <div class="about-sub">${when}</div></div>
    </div>
    <section><h3>Version history</h3>
      ${CHANGELOG.map(v => `<div class="cl-version"><div class="cl-head"><b>${esc(v.version)}</b><span>${esc(v.date)}</span></div>
        <ul>${v.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}
    </section>`;
  $('#aboutFoot').textContent = `© ${year} ${AUTHORS}. All rights reserved.`;
}

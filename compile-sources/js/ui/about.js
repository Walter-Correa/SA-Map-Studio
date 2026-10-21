// "Novidades e documentação": version history, all the editor's features,
// date and time of the last build and the rights reserved.
import { app, $, esc } from './common.js';

export const AUTHORS = 'Rafael_Hurley e Walter_Correa';

// Version history: always written in English and never translated (no keys in the language files)
const CHANGELOG = [
  {
    version: '3.24.0', date: '20/10/2026', items: [
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
      'The test server is called SA Map Studio - Testing server. The progress2 include was removed from the test server.',
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
      'The bars include is now called SA Progress Bar Pro (progressbarpro.inc).',
      'Blinking bars: BlinkPlayerProgressBar(playerid, bar, interval, duration, color), with interval and duration in milliseconds; without a color, the bar blinks in its own color, turning off and on. The TextDraw editor shows the blink in the preview and exports, imports and tests it on the server.',
      'Border chosen when creating the bar (last parameter of CreatePlayerProgressBar, from 0 to 4). The editor doesn\'t accept values outside the limits and the include itself uses the limit if the code asks for more or less.',
      'The editor icon shows on the Windows taskbar again.',
    ],
  },
  {
    version: '3.10.1', date: '19/10/2026', items: [
      'Progress bar borders equal on all four sides in game: a TextDraw unit is 3.00 px wide and 2.41 px tall at 1920x1080, so progress3 uses a vertical border 1.25 times the horizontal one (3 px on every side in 16:9).',
      'The TextDraw editor preview paints bars with the same pixel rule as the game, showing the real thickness of each border.',
    ],
  },
  {
    version: '3.10.0', date: '19/10/2026', items: [
      'New progress3.inc include: progress bars use sprites with exact position, width and height, the same at any resolution, and an inner border of the same thickness on all four sides. The functions are the same as progress2, so old code keeps working.',
      'Fixes compared to progress2: changing the value no longer shows a hidden bar, the filled part disappears when the value is zero and never goes past the border, and running out of free TextDraws is handled.',
      'The TextDraw editor draws the bars exactly as progress3 builds them in game, and the exported code and the test server now use progress3.',
    ],
  },
  {
    version: '3.9.3', date: '19/10/2026', items: [
      'Object texts like in the game: the font size follows the SA-MP rule (the size is the line height, not the letter height), with each letter\'s measurements taken from Windows itself, as the game does; left- or right-aligned texts sit at the top of the material, and the text gets the object\'s color and lighting (on SA-MP signs it looks grayish, as in the game).',
      'Editing an object\'s text no longer erases what was already written: opening the Text tab or changing index only loads the text, and nothing is written until you change something.',
      'The exported code notes in its header when the project has progress bars and needs the progress2 include.',
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
      'Progress Bar (progress2.inc): new type in the TextDraw editor with width, height, color, maximum value, current value and direction (right, left, up and down), drawn exactly as the include builds it in game.',
      'Export and import of CreatePlayerProgressBar, SetPlayerProgressBarValue and ShowPlayerProgressBar.',
      'Test server with progress2.inc: the bars appear for the player on spawn.',
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

const FEATURES = [
  ['Navegação e Câmera', [
    'Distância de visão ampliada para até 2500 metros (Visão → Distância de visão).',
    'Botão na barra superior e atalho (F10) para recolher os menus laterais até as bordas da tela e restaurá-los.',
    'Opção para recolher os menus laterais automaticamente durante a movimentação da câmera e restaurá-los ao parar.',
    'Controle do mouse com Pointer Lock e recentralização automática do cursor ao soltar o botão de navegação.',
    'Campo copiável "Coordenadas do clique do mouse" no topo do menu lateral direito, com cópia em 1 clique.',
    'Câmera livre: botão direito + arrastar para olhar, WASD para andar, E/Q para subir e descer, Shift para acelerar.',
    'Centralização automática da câmera olhando para baixo sobre o centro do mapa ao carregar qualquer projeto.',
    'Placa verde com região e coordenadas; clique para teleportar (Ctrl+G), botão direito copia a posição.',
  ]],
  ['Objetos e Transformações', [
    'Aba Objetos com categorias corrigidas, favoritos, apelidos personalizados e miniaturas grandes.',
    'Velocidades de movimento e rotação configuráveis no menu lateral direito (0.001x até 10.0x).',
    'Gizmo de movimentação (G) e rotação (R); eixos do mundo ou locais (L); encaixe em grade e magnético.',
    'Seleção múltipla com rotação em grupo pelo mesmo eixo geométrico comum.',
    'Duplicar (Ctrl+D), colocar no chão (End), girar 90° (X), desfazer (Ctrl+Z) e refazer (Ctrl+Y).',
  ]],
  ['Veículos, Tuning e Cores', [
    'Tuning completo de veículos em tempo real no 3D com salvamento dos componentes (AddVehicleComponent).',
    'Paleta de cores com todos os 256 IDs de cores  (incluindo as novas cores a partir do ID 128).',
    'Pré-visualização e seleção de paintjobs em tempo real diretamente no veículo.',
  ]],
  ['Actors e Dinâmicos', [
    'Inserção de Actors diretamente pelo catálogo com seleção de skins e biblioteca de animações.',
    'Actors posicionados perfeitamente eretos e apoiados com os pés na superfície.',
    'MoveObject completo: teste de movimentação no mundo executando 1 ciclo e salvamento dos parâmetros.',
    'AttachObjectToObject: acoplamento de objetos com edição direta da posição do objeto filho no mundo.',
  ]],
  ['Projetos e Coexistência', [
    'Coexistência de múltiplos projetos abertos simultaneamente com opção Editável ou Não editável.',
    'Projetos não-editáveis são protegidos contra seleção e alteração acidental; editáveis salvam isoladamente.',
    'Mesclagem de projetos (merge) e botão vermelho "Apagar tudo" com confirmação de segurança.',
    'Inversão da ordem da lista de objetos na aba Projeto.',
  ]],
  ['Importação e Exportação Pawn', [
    'Preservação 100% integral do arquivo original: anotações (//), comentários em bloco (/* */), comentários de fim de linha, linhas em branco, cabeçalhos, materiais 0xAARRGGBB e material text.',
    'Edição manual do script Pawn antes de concluir a exportação.',
    'Opção selecionável de exportação de coordenadas em formato de Array.',
  ]],
  ['Materiais (SetObjectMaterial / SetObjectMaterialText)', [
    'O inspetor lista todos os índices do objeto (0 a 15) com a textura original de cada um.',
    'Marque um ou vários índices, ou use a ferramenta Textura (T) e clique na parte do objeto (Ctrl + clique soma índices).',
    'Troque a textura clicando na aba Texturas ou digitando modelid, txdname e texturename.',
    'Painel de cores (materialcolor) com transparência, 0xAARRGGBB e cores recentes.',
    'Texto com tamanho do material, fonte, tamanho, negrito, alinhamento, cor da letra e do fundo, códigos {RRGGBB} e prévia.',
    'Copiar e colar materiais entre objetos; código Pawn de cada objeto no inspetor.',
  ]],
  ['Câmeras', [
    'Câmeras fixas: SetPlayerCameraPos + SetPlayerCameraLookAt a partir da vista atual.',
    'Movimentos: vários pontos com tempo, espera e tipo (CAMERA_MOVE ou CAMERA_CUT), caminho desenhado e prévia.',
    'O código das câmeras vai na exportação, sem warnings.',
  ]],
  ['Testar no jogo', [
    'Sobe um servidor de teste local integrado ( omp-server com DLLs e componentes) e abre o SA-MP já conectado.',
    'Sincronização em tempo real das alterações do mapa com o servidor de teste.',
    'Comandos no jogo: /jetpack, /v [modelo], /spawn e /pos.',
  ]],
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
  const when = `Compilado em <b>${esc(compileTime)}</b>`;
  const year = new Date().getFullYear();
  $('#aboutBody').innerHTML = `
    <div class="about-head">
      <svg class="brand-mark big" viewBox="0 0 120 120" aria-hidden="true"><use href="#i-brand-logo"/></svg>
      <div><div class="about-title">SA Map Studio <span class="tag">versão ${esc(cfg.version || CHANGELOG[0].version)}</span></div>
        <div class="about-sub">${when}</div></div>
    </div>
    <section><h3>Novidades</h3>
      ${CHANGELOG.map(v => `<div class="cl-version" translate="no" lang="en"><div class="cl-head"><b>${esc(v.version)}</b><span>${esc(v.date)}</span></div>
        <ul>${v.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}
    </section>
    <section><h3>Recursos</h3>
      ${FEATURES.map(([t, list]) => `<div class="feat"><h4>${esc(t)}</h4><ul>${list.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}
    </section>`;
  $('#aboutFoot').textContent = `© ${year} ${AUTHORS}. Todos os direitos reservados.`;
}

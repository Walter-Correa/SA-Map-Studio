# SA Map Studio

**Map editor for GTA San Andreas, SA-MP and open.mp**: a renewed replacement for the old
*SA-MP Map Construction*, with a new interface and the whole San Andreas map in 3D.

![Version](https://img.shields.io/badge/version-3.24.0-f0a630)
![Platform](https://img.shields.io/badge/platform-Windows-12603a)
![Python](https://img.shields.io/badge/Python-3.8%2B-36414b)
![Three.js](https://img.shields.io/badge/Three.js-r186-36414b)
![License](https://img.shields.io/badge/license-all%20rights%20reserved-e0645c)

The editor reads the files straight from your GTA San Andreas folder, without changing anything in the game, and
generates Pawn code ready to paste into your gamemode or filterscript.

---

## Contents

- [Features](#features)
- [How to use](#how-to-use)
- [Building the program](#building-the-program)
- [The program folder](#the-program-folder)
- [Shortcuts](#shortcuts)
- [Code structure](#code-structure)
- [Languages](#languages)
- [Version history](#version-history)
- [Credits and licenses](#credits-and-licenses)

---

## Features

### Map
- The whole of San Andreas with streaming and LOD, water, interiors and the SA-MP objects (`SAMP.img`).
- Background loading (Web Workers), prioritizing what is in front of the camera.
- Editor-style free camera, a sign with the area and the coordinates, and **teleport** (`Ctrl+G`) accepting
  `x, y, z` or a `SetPlayerPos(...)` line.

### Objects
- Catalog with **categories** (Furniture, Buildings and houses, Streets and roads, Beach, Vegetation, Lighting,
  Doors and windows, Signs, Construction kit, Vehicles and more), **source** (SA-MP, Los Santos, San Fierro,
  Las Venturas and more), search by name or ID, favorites, recent items and thumbnails stored on disk.
- Place by clicking on the map, gizmo to move and rotate (world or object axes), grid snapping.
- **Duplicate** and **Place another one** create the copy in the same spot, already with the move gizmo.
- Remove buildings from the original map (`RemoveBuildingForPlayer`, together with the LOD) or make them editable.
- Vehicles (`CreateVehicle` / `AddStaticVehicleEx`), undo and redo, multiple selection.
- **Compatible tuning and paintjobs**: strict filtering of tuning components, paintjobs (0 to 2) and colors following the
  official SA-MP/open.mp rules (`IsModValidForVehicle`, `IsPaintjobValidForVehicle`, `IsVehicleValidForModding`,
  `IsVehicleValidForColor`), showing only compatible parts in the inspector.

### 3D Texts (3D Text Labels)
- Created and shown directly in 3D, billboarded towards the camera (`Create3DTextLabel` / `CreateDynamic3DTextLabel`).
- Multiple lines (`\n`), embedded `{RRGGBB}` color codes, quick SA-MP palette and hexadecimal picker.
- Draw distance (`drawDistance`), line-of-sight test (`testLOS`), interior and virtual world.

### Pickups
- Created and shown in 3D with an animated rotating mesh (`CreatePickup` / `CreateDynamicPickup`).
- Categorized catalog with the official open.mp presets: Health (1240), Armour (1242), Money (1274), Houses and
  Information (1272, 1273, 1239), Weapons (IDs 321 to 372) and Equipment.
- Pickup type, respawn time, interior and virtual world.

### GangZones (interactive radar map)
- Modal dialog with the official San Andreas radar map (-3000 to +3000) in high resolution, with pan and zoom.
- Rectangular zones drawn by dragging the mouse (`GangZoneCreate` and `GangZoneShowForAll`).
- **Magnetic edge snapping**: automatic alignment between neighboring zones with cyan guides on screen.
- RGBA color picker with opacity and a flat 3D projection on the map ground.

### TextDraws (visual editor)
- Visual editor on the native SA-MP screen (640x448, shown in 16:9) with safe margin and grid; texts use GTA SA's own
  fonts (`fonts.txd` and `fonts.dat`), so what you see in the editor is what you see in the game.
- Texts and boxes (`TextDrawCreate` / `CreatePlayerTextDraw`).
- Fonts 0 to 5, text and box colors with transparency, alignment (left, center, right), letter and box size, `outline`
  and `shadow`.
- **3D model preview (Font 5)**: vehicles, skins and objects in the TextDraw with rotation (RX, RY, RZ) and zoom.
- Clean export of a Pawn script ready to compile.
- **Progress bars** (SA Progress Bar Pro, `progressbarpro.inc`, included in the test server) in the four directions,
  drawn as in the game, as a bar, a ring of segments or a growing circle. Parameter order:
  `CreatePlayerProgressBar(playerid, x, y, width, height, colour, max, direction, style, segments, border, bordercolour)`.

### SA-MP materials
- The inspector lists **every material index** of the object (0 to 15) with the original texture of each one.
- Tick one or more indexes (or click the part of the object with the Texture tool) and:
  - change the texture: **`SetObjectMaterial`** (modelid, txdname, texturename);
  - pick the color (`materialcolor`) in a **color panel** with transparency, `0xAARRGGBB` and recent colors;
  - write text: **`SetObjectMaterialText`** with material size, font, size, bold, alignment, font and background
    color, `{RRGGBB}` codes and a live preview.
- Library with **every game texture by category** (Bricks and walls, Floors, Wood, Metal and more).

### Cameras
- Fixed cameras: `SetPlayerCameraPos` + `SetPlayerCameraLookAt` from the current view.
- Full movements with `InterpolateCameraPos` + `InterpolateCameraLookAt`: several points, time, hold and type of each step
  (`CAMERA_MOVE` / `CAMERA_CUT`), path drawn on the map and a preview in the editor.

### Test in game
- Starts a **local test server** (open.mp or SA-MP) with the editor's gamemode and loads the map with textures, texts,
  vehicles with their real tuning/paintjobs (`AddVehicleComponent`, `ChangeVehiclePaintjob`), 3D Texts
  (`Create3DTextLabel`), Pickups (`CreatePickup`) and GangZones (`GangZoneCreate`), opening SA-MP already connected and
  spawning where the camera is looking.
- In game: `/fly`, `/map`, `/w`, `/t`, `/v [model]`, `/anim`, `/jetpack`, `/spawn`, `/pos` and `/help`. The messages
  follow the editor language.

### Import and export
- **Imports any file**, detecting the format by itself: Pawn code (Map Construction, Texture Studio and others, with
  textures, texts and cameras), SQLite databases, `.json` projects, MTA maps (`.map`) and the game's IPL (text and
  binary). You can also drag the file onto the window.
- **Exports** to Pawn (`CreateDynamicObject` or `CreateObject`, ready-made functions or just the lines, with the
  cameras) and IPL. The `.pwn` is saved as ANSI so accents show correctly in pawno. The generated code compiles
  **without warnings**.
- In the exported code, the information comments follow the editor language, while functions and section separators
  are always in English (`stock Map_Example_Map_Load()`, `// 3D Texts:`). Code exported by older versions, with the
  Portuguese names, is still imported.

### Languages
- 15 languages: Bahasa Indonesia, Deutsch, English, Español, Français, Italiano, Magyar, Polski, Português, Română,
  Tiếng Việt, Türkçe, Български, Русский and Українська, chosen with the **Language** button in the top menu (listed in
  alphabetical order); the switch is instant, without restarting, and is saved. On first launch the editor follows the Windows language (no country:
  Portuguese from Portugal and Brazil use the same Portuguese); text without a translation shows in English.
- Numbers and dates use the format of the chosen language.
- The installer, the warning windows and the test server messages in the game follow the same language. The SA-MP chat
  only shows Windows-1252 text, so letters outside it lose their accent (ł → l) and the Cyrillic languages use English
  there.
- The version history is always in English and is not translated.

### Projects
- Saved automatically in the `projects` folder, also when closing the editing windows and the program; opening another
  project saves and closes the one that was open.

---

## How to use

### Requirements to use the compiled program

| Item | Detail |
|---|---|
| System | 64-bit Windows 10 or 11. |
| Permission | Administrator only when the editor is in a protected folder (such as the GTA folder in Program Files): then it asks for elevation (UAC) when opening. In other folders it opens without asking. |
| Built-in browser | Microsoft Edge WebView2 Runtime (already in Windows 11 and in an updated Windows 10). Without it, the editor opens in the default browser. |
| Graphics card | WebGL 2 compatible, with an updated driver. |
| Memory | 4 GB of RAM or more (8 GB recommended for large maps). |
| Disk | About 200 MB free: 86 MB for `SA Map Studio.exe` + 115 MB for the `sa-map-studio` folder created on the first run. |
| Screen | At least 1050 x 650. |
| Game | Original GTA San Andreas for PC (the same version as SA-MP), with `gta_sa.exe`, `data\gta.dat` and `models\gta3.img`. The Definitive Edition is not compatible. The editor only reads the game files. |
| Test in game | SA-MP 0.3.7 (or open.mp) client installed in the GTA folder. The open.mp test server is included and uses UDP port 7777 (Windows Firewall may ask for permission). |
| Internet | Not required. Only used to download extra animation previews. |

The program does not need Python, Visual C++ or any other installation: everything is inside the `.exe`.

### Requirements to keep developing on another PC

- Git and **Python 3.10 or newer** from the official site (https://www.python.org/downloads/), with the `py` launcher.
  The Microsoft Store "python" shortcut does not work.
- Internet connection on the first build (`build.bat` installs PyInstaller and pywebview in a separate environment in
  `compile-sources\.venv-build`).
- To run from the source code, only the Python standard library is needed; pywebview is optional (without it, the editor
  opens in the browser).
- Everything else (gamemode, Pawn compiler, open.mp server, thumbnails, sprites, skins and sounds) is already in the
  repository.
- Clone into a folder with a short path (for example `C:\Projects\SA-Map-Studio`): Windows limits paths to 260
  characters and the build environment is not created in very deep folders.

### Running from the source code

```powershell
git clone https://github.com/Walter-Correa/SA-Map-Studio.git
cd SA-Map-Studio
.\start.bat
```

Or `py -3 serve.py`. The editor finds GTA by itself (default install folder, Windows registry, Steam and common
folders). To choose the folder:

```powershell
py -3 serve.py --gta "D:\Games\GTA San Andreas"
```

Other options: `--port 8777`, `--no-browser` and `--navegador` (opens in the browser even with pywebview installed).

---

## Building the program

| File | Result | Purpose |
|---|---|---|
| `build.bat` | `compiled\SA Map Studio\` | Day-to-day use: updates the program **keeping** projects, exports, settings, cache and thumbnails. |
| `build-clean.bat` | `compiled\SA Map Studio\` | **Clean** copy, with no loaded data, ready to send to someone else. |

Both create a separate Python environment (`compile-sources\.venv-build`), install the latest PyInstaller and
pywebview, record the build date and time (shown in *What's new* inside the program), check that every interface text is
translated into every language (a missing translation stops the build) and assemble the `test-server` folder with the gamemode and your
open.mp / SA-MP server.

```powershell
Stop-Process -Name "SA Map Studio" -Force -ErrorAction SilentlyContinue
& ".\build.bat"          # keeps your data
& ".\build-clean.bat"    # clean copy
```

> The first time, Windows may show "Windows protected your PC", because the program has no digital signature.
> Click **More info** and **Run anyway**.

---

## The program folder

The build produces a single executable. The first time it is opened, it creates the `sa-map-studio` folder next to
it with everything inside:

```
SA Map Studio\
├── SA Map Studio.exe      the program (launcher with the embedded package)
└── sa-map-studio\
    ├── projects\              your maps (saved automatically)
    ├── exported\              exported .pwn / .ipl
    ├── data\                  settings, texture cache, thumbnails and logs
    ├── test-server\           server used by "Test in game"
    └── system\                internal program files
```

To take the program to another computer, just copy `SA Map Studio.exe` (or the whole folder, to keep projects and
settings). A newer `.exe` updates an existing folder and keeps the user data.

---

## Shortcuts

| Key | Action |
|---|---|
| Right button + drag | Look around |
| `W` `A` `S` `D` / `E` `Q` | Move / go up and down |
| `Shift` / `Alt` | Faster / slower |
| `G` / `R` / `T` | Move / rotate / Texture tool |
| `L` | World or object axes |
| `X` | Rotate 90° |
| `Page Up` / `Page Down` | Raise / lower the selection |
| `End` | Drop to the ground |
| `F` or double click | Focus on the selection |
| `Ctrl+D` | Duplicate in the same spot |
| Arrows (`Shift` = 0.1) | Move a MapIcon, TextDraw or GangZone in the editing windows |
| `Ctrl+G` | Teleport to a coordinate |
| `Ctrl+Z` / `Ctrl+Y` | Undo / redo |
| `Ctrl+S` | Save now |
| `Delete` | Delete |
| `?` | All shortcuts |

---

## Code structure

```
serve.py                       local server (Python, standard library only) + own window (pywebview)
index.html, favicon.svg        main interface page
icon.ico                       executable icon
compile-sources/
├── css/                       interface styles
├── js/app.js                  startup
├── js/ui/                     tabs, inspector, color palette, cameras, dialogs, projects, editors, translation (i18n.js)
├── js/lang/                   interface translations (one file per language)
├── js/editor/                 core: editor, project, materials, import, Pawn/IPL export
├── js/world/                  game data, map streaming, models, categories, workers
├── js/formats/                readers for the GTA formats (IMG, IDE, IPL, DFF, TXD)
├── js/data/                   static catalogs (sprites)
├── js/vendor/                 Three.js r186
├── fonts/                     Barlow font (SIL Open Font License)
├── models/                    models used by the editor
├── cache/                     thumbnails, skins, sprites, map icons, sounds, animations and radar
├── launcher.py                single executable: extracts or updates the program
├── launcher_frames/           frames of the launcher's animated icon
├── package_bundle.py          packs the program into the launcher zip
├── i18n_check.py, i18n_same.txt, i18n_extra.txt  translation check used by the build
├── i18n_tool.py               batch translation, plural forms and key rename for the language files
├── samapstudio.pwn / .amx     test server gamemode
├── anim-list.json             animation list
└── version_info.txt           .exe version metadata
omp-server-source/             base open.mp server used by "Test in game"
testing/                       temporary test scripts
build.bat                      builds keeping the data
build-clean.bat                builds a clean version
start.bat                      starts the server and the editor with Python
```

Rotation follows the SA-MP convention (Z, X, Y order), so what you see in the editor is what you see on the server.

---

## Languages

The code and the interface are written in Brazilian Portuguese, and the Portuguese text itself is the translation key.
The files are in `compile-sources/js/lang/` and are always included in the build:

- `languages.json`: the menu list, one entry per language: `code` (file name and `<html lang>`), `name` (written in
  that language, without a country; the menu sorts by it), `windows` (Windows primary language id, e.g. `"0x19"`, used
  by `serve.py` to pick the language on first launch) and optional `script` (`"cyrillic"` sets
  `<html data-script="cyrillic">`, and `css/app.css` swaps the Barlow font, which has no Cyrillic letters, for Segoe UI).
- `<code>.json` (e.g. `en.json`): `"Portuguese text": "translation"`. Variable parts use `{0}`, `{1}`
  (e.g. `"{0} itens selecionados": "{0} items selected"`); in the test server texts, `%d`/`%s` stay as they are.
  A missing text shows in English.
- Plural forms: a translation can be an object with the language's `Intl.PluralRules` categories instead of a text,
  e.g. in `ru.json` `"{0} objetos": {"one": "{0} объект", "few": "{0} объекта", "many": "{0} объектов", "other": "{0} объекта"}`.
  The number is `{0}`; add `"count": 1` when it is another part. `other` is required. Russian, Ukrainian, Polish and
  Romanian use them for the counts written with `plural()`; the other languages need only the plain text.
- Texts joined with ` — `, ` · `, ` | ` or ` - ` and labels with a count at the end (`Móveis (985)`) are translated piece
  by piece, so each piece needs its own key.
- Game and SA-MP names, keys and the exported Pawn code are not translated (list in `compile-sources/i18n_same.txt`). For
  a part of the interface that must not be translated, use `translate="no"` in the HTML.
- Text inside `<code>` is not translated; to translate a command argument such as `[clima]`, use `<code class="i18n-code">`.
  A lone word between tags (`e`, `(voar),`) that the check cannot detect goes in `compile-sources/i18n_extra.txt`.
- Text that does not go through the page (canvas, textarea content, code generated for the game) uses `t('text')` from
  `js/ui/i18n.js`.
- The installer (`compile-sources/launcher.py`) keeps its texts in the `TEXTS` table (one block per language), because it
  runs before the program folder exists.
- The version history (`CHANGELOG` in `about.js`) is written only in English and has no keys in the language files.

To add a language: add `{"code": "<code>", "name": "<name in its own language>", "windows": "0x.."}` to
`languages.json`, create `<code>.json` with only `"_meta"`, run `i18n_tool.py export --lang <code>`, translate the batches
and import them; then add a block for the code to `TEXTS` and to `WINDOWS_LANGS` in `launcher.py` (the installer runs
before the folder exists, so it cannot read `languages.json`).

Tools (in `compile-sources/`, run with Python 3):

- `python compile-sources/i18n_check.py` checks every language: missing texts, translations whose `{0}`/`%d` parts,
  plural forms or edge spaces differ from the key, orphan keys the code no longer uses, and `TEXTS`/`WINDOWS_LANGS` in
  `launcher.py` against `languages.json`, and the test server messages (`TEST_MESSAGES` in `dialogs.js` against `gMsg` in
  `samapstudio.pwn`). Any of these makes it exit with an error, and `build.bat` stops. It also prints quality warnings that do
  not stop the build (empty or untranslated texts, wrong script, Portuguese accents, different final punctuation) and, for an
  orphan key that looks like a changed text, the `i18n_tool.py rename` command to run. `--missing en` lists the texts missing in
  English, `--orphans` lists the orphan keys and `--prune` deletes them from every file.
- `python compile-sources/i18n_tool.py export [folder] [--lang ru uk] [--size 200]` writes what is missing (default
  folder `testing/i18n/`): `keys.json` (id → Portuguese key) and batches `<code>-01.txt` with one `id<TAB>English text`
  line per key. Replace the English text with the translation.
- `python compile-sources/i18n_tool.py import testing/i18n/ru-01.txt` merges the batch into `ru.json` (the language comes
  from the file name, or `--lang`). The id can also be the Portuguese key itself; an existing translation is replaced.
  Plural forms go on one line: `one: {0} объект | few: {0} объекта | many: {0} объектов | other: {0} объекта` (plus
  `count: N` when needed), and `\n` is a line break. Lines whose `{0}`/`%d` parts differ from the key or with spaces at
  the edges are refused and listed.
- `python compile-sources/i18n_tool.py rename "old text" "new text"` renames a key in every language file (and in
  `i18n_same.txt`) after the Portuguese text changes in the code, keeping the translations.

---

## Version history

### 3.24.0 — 20/10/2026
- 10 new languages: Deutsch, Polski, Română, Magyar, Türkçe, Bahasa Indonesia, Tiếng Việt, Русский, Українська and Български (15 in all).
- The Language menu lists the languages in alphabetical order and scrolls when they do not fit.
- The installer and the Windows language detection cover the 15 languages.
- Test server messages in the game: letters the SA-MP chat cannot show lose their accent, and the Cyrillic languages use English.
- The version history is now always in English and is no longer translated.

### 3.23.0 — 20/10/2026
- Translation completed: option lists made of joined texts, textarea placeholders, the diagnostic report, canvas texts,
  catalog names (places, skins, animation categories and sound labels) and the full changelog.
- Numbers and dates follow the chosen language.
- Export: information comments in the editor language; functions (`Map_<name>_Load`, `Map_<name>_Remove`,
  `CameraShot_<name>`) and section separators always in English. Older exports are still imported.
- SA Progress Bar Pro: `style` and `segments` now come right after `direction` in `CreatePlayerProgressBar`; editor,
  export and test server use the new order, and the import also accepts the old one.
- Test server: the `/voar` and `/mapa` aliases were removed (`/fly` and `/map` remain).
- Spelling review of every language; `readme.md` and `ia-rules.md` in English.

### 3.22.0 — 20/10/2026
- The editor is in English, Spanish, Portuguese, Italian and French, switched instantly with the Language button in the
  top menu, without restarting; the choice is saved.
- On first launch the language follows Windows; text without a translation shows in English.
- The installer, the warning windows and the test server messages in the game follow the chosen language.
- Game and SA-MP names and the exported Pawn code stay the same in every language.

### 3.21.2 — 20/10/2026
- The manipulator (gizmo) area has priority over direct click and drag, which only works when clicking the item outside it.
- The manipulator's Move/Rotate button does not react to the mouse during any drag.

### 3.21.1 — 20/10/2026
- Clicking and dragging an item has priority over the manipulator, which stays still until the button is released
  (over GangZones the manipulator arrow still works).
- Detection area of the manipulator arrows cut in half.

### 3.21.0 — 20/10/2026
- Click and drag moves the item at once, selecting it when the drag starts.
- Import always opens with Replace and Merge unticked.
- Sounds (PlayerPlaySound) removed from the project, import, saving, 3D map, inspector and test server. The sound catalog
  is only for preview and copying the code.
- An old version is blocked in a folder of a newer version (launcher by the manifest and editor by config.json).

### 3.20.0 — 20/10/2026
- The new .exe updates the installed folder: it compares the package manifest (system/bundle.json) with the installed one
  and leaves the folder exactly like the new version. system and test-server are replaced whole; in data only the files
  that came in the package are touched. Projects, exports, settings, logs and whatever the user created are kept.
- Update with a journal and a backup copy: an error or a power cut in the middle undoes the swap on the next launch.
- Warning to close the editor and the test server before updating; one editor instance at a time.
- Test server: the player spawns only once.

### 3.19.0 — 20/10/2026
- Import keeps the attachments: each item gets a new uid and the attached ones point to the copy of the parent that came
  along (replace, merge the same project or import as a new project).
- Attachments of saved projects whose parent was lost are recovered by position when opening or importing.
- Import, replace and merge go into undo/redo as a single step (items, header, code and cameras).
- Test server: TextDraws and bars shown once per connection, without blinking on spawn.
- SA Progress Bar Pro: rings only resend the segments that change color or visibility (no more ackslimit warning).
- Example map with the new TextDraws and bars.

### 3.18.2 — 20/10/2026
- 3D model preview of skins in the game's idle pose: the DFF reader now reads the bones (HAnim) and the skin, and the
  preview applies the first frame of the IDLE_stance animation from anim/ped.ifp. Lighting like the SA-MP preview.

### 3.18.1 — 20/10/2026
- 3D model preview of skins like the game: GTA pedestrian collision sphere (radius 1.0, center 0) and the pedestrian at
  the height of the game pose, with the same size and position in the box.

### 3.18.0 — 20/10/2026
- 3D model preview (font 5) rendered with the real model and the SA-MP client camera: 256 x 256 stretched to the box,
  camera at (0,0,50) looking at -Y with a 53.13° field of view, distance (-0.1 - 2.25 x collision radius) x zoom and
  Z, Y, X rotation around the model origin. The editor server reads the collision spheres (COL and vehicle DFF).
- Model 0 in the 3D model preview.
- GangZones go to the nearest empty space, shrunk to fit.

### 3.17.0 — 20/10/2026
- SA Progress Bar Pro: `AutoFillPlayerProgressBar(playerid, barid, maxvalue)`, `StopAutoFillPlayerProgressBar` and
  `IsPlayerProgressBarAutoFilling`; data array renamed to `ProgressBar`.
- Editor: Auto fill saved in the bar (with "Fill up to" limited to the bar maximum), exported and imported; preview with
  the same timing as the include.
- Import: "Merge with the current project" option.
- Importer: zip (maps inside it), cars from text IPL, MTA peds/pickups/markers/blips/radar areas and objects in arrays.
- Fixes objects with extras created twice in the array export.

### 3.16.0 — 20/10/2026
- Own color picker for every color field (WebView2 does not open the native picker).
- Fields with limits accept free typing and only apply the limit when leaving the field.
- A TextDraw/bar copy goes right below (or above) the original, in the same column.
- GangZones: the copy snaps to a free side of the original or to the nearest free space, shrunk if needed; adding follows
  the same rule; with no room on the map, a warning appears and nothing is created.
- Progress bars: Test movement in the preview.
- Test server renamed to "SA Map Studio - Testing server"; `progress2.inc` removed.

### 3.15.1 — 19/10/2026
- Administrator only when needed: the editor no longer always asks for elevation (UAC) and only asks when its own folder
  cannot be written (for example, inside the GTA folder in Program Files). With GTA in a protected folder, the test SA-MP
  client opens as administrator (with the Windows prompt) when clicking Test.

### 3.15.0 — 19/10/2026
- TextDraw editor: creation order (layers) with Back, Backward, Forward, Front and dragging in the list; preview, export
  and test server follow the order. Global and player ones (with the bars) are grouped, as SA-MP draws them.

### 3.14.0 — 19/10/2026
- SA Progress Bar Pro: `PB_STYLE_BAR`, `PB_STYLE_RING` (ring of 4 to 60 segments, 2 PlayerTextDraws per segment) and
  `PB_STYLE_CIRCLE` (circle growing from the center, 3 PlayerTextDraws), chosen with the `style` and `segments`
  parameters of `CreatePlayerProgressBar` or with `SetPlayerProgressBarStyle`. Features and limitations documented in
  the include.
- TextDraw editor: Model and Segments fields, preview of the three models, export, import and test server.

### 3.13.0 — 19/10/2026
- SA Progress Bar Pro rewritten in English, with documentation of each function and the full list at the top of the include.
- `SetPlayerProgressBarSize` / `GetPlayerProgressBarSize`; default values in `BlinkPlayerProgressBar` (interval, duration and
  colors), `SetPlayerProgressBarColour`, `SetPlayerProgressBarBorder`, `SetPlayerProgressBarBorderColour`,
  `SetPlayerProgressBarMaxValue` and `SetPlayerProgressBarDirection`.
- Bar and border color change without recreating the TextDraws.

### 3.12.0 — 19/10/2026
- SA Progress Bar Pro: border from `PB_BORDER_MIN` 0.5 to `PB_BORDER_MAX` 5.0 (every bar has a border) and border color in
  `CreatePlayerProgressBar` or with `SetPlayerProgressBarBorderColour` (0 = black with the alpha of the bar).
- `BlinkPlayerProgressBar(playerid, barid, interval, duration, colour, bordercolour)`: the border blinks in the chosen
  color; without it, the border does not change.
- Editor: border fields with decimals, border color, border in the blink and minimum bar size.
- Object movement and rotation speed in decimal fields from 0.001 to 10.0 (default 1.0).

### 3.11.1 — 19/10/2026
- Bar border limited to what fits in the bar (`PB_FitBorder` in the include and the same calculation in the editor):
  `PB_MIN_INNER` (1 unit) of inside is always left. The Border field shows the maximum for the current width and height.
- The blink color only shows when "Blink in the bar color" is unticked.

### 3.11.0 — 19/10/2026
- The bar include is now called **SA Progress Bar Pro** (`progressbarpro.inc`), with the `ProgressBar_Data` enumerator
  and the `pb_valid`, `pb_x` (and other) fields.
- `BlinkPlayerProgressBar(playerid, barid, interval = 250, duration = 0, colour = 0)`: blinks the inside of the bar;
  interval from 50 to 60000 ms, duration 0 = until `StopPlayerProgressBarBlink`, without a color it blinks in the bar's
  own color. Preview in the editor.
- Border as a parameter of `CreatePlayerProgressBar` (`PB_BORDER_MIN` 0 to `PB_BORDER_MAX` 4); the editor limits the field
  and the include uses the limit when the value goes past it. `SetPlayerProgressBarBorder` / `GetPlayerProgressBarBorder`.
- Editor icon in the taskbar: set on the window, the class and the relaunch properties.

### 3.10.1 — 19/10/2026
- `progress3.inc`: vertical border `PB3_BORDER_Y` = 1.25 x `PB3_BORDER_X`, because a TextDraw unit is 3.00 x 2.41 px at
  1920x1080; borders are 3 px on all four sides in 16:9 (before they were 3 on the sides and 2 or 3 at the top and bottom).
- Bar preview with the game's Direct3D 9 pixel rule (from `ceil(start)` to `ceil(end)`), as it shows in the game.

### 3.10.0 — 19/10/2026
- New `progress3.inc` include (in `omp-server-source/pawno/include`): bars with `LD_SPAC:white` sprites, exact position and
  size in 640x448 units (the same at any resolution) and a uniform inner border (`PB3_BORDER`, default 1.0). Same
  functions as `progress2`; fixes the hidden bar that showed up again when the value changed and handles running out of
  free TextDraws.
- TextDraw editor, export and test server now use `progress3`.

### 3.9.3 — 19/10/2026
- Texts on objects (SetObjectMaterialText) like the game: `fontsize` is the line height (as in the client's
  `D3DXCreateFont`), with the height, ascent and width of each letter measured by Windows; left and right sit at the top
  of the material, center sits in the middle; the text gets the material color and the object lighting.
- Opening the Text tab or changing the index no longer overwrites an existing text.
- The exported code header warns when the `progress2` include is needed.

### 3.9.2 — 19/10/2026
- SA-MP object textures fixed: about 450 models used only the first texture because the editor read the material of each
  triangle, which comes zeroed in those files; now the split comes from the BinMesh, as in the game. Thumbnails redone.
- Importing without "Replace the current project" creates a new project named after the file instead of merging into the
  open project.
- "Name" field of the progress bars without the "(variable in the code)" text.

### 3.9.1 — 19/10/2026
- TextDraws exported as `textdraw_0`, `textdraw_1` and so on, and progress bars as `progress_0`, `progress_1` and so on,
  with the name given in the editor as a `// comment` at the end of the creation line (read back on import).

### 3.9.0 — 19/10/2026
- Progress bars with a name (it becomes the variable name in the exported code).
- Bar import recognizes named arguments, negative decimal colors, expressions and variables in arrays/enums.
- TextDraw type buttons in a grid and the Done button of the editing windows moved away from the edge.
- Example map with a progress bar.

### 3.8.0 — 19/10/2026
- New **Progress bar** type in the TextDraw editor (`progress2.inc`): width, height, color, maximum, value and direction,
  drawn as the include builds it in the game; exports and imports `CreatePlayerProgressBar`,
  `SetPlayerProgressBarValue` and `ShowPlayerProgressBar`.
- Test gamemode compiled with `progress2.inc`.

### 3.7.0 — 19/10/2026
- Resume where you left off: the project stores the selection of the last save and, when opened, selects the items,
  activates the gizmo and focuses on it. Without a selection of project items, it opens focusing on the item closest to
  the center.

### 3.6.2 — 19/10/2026
- "3DTexts" button in the top bar.

### 3.6.1 — 19/10/2026
- New camera view of the example map (Example Map) on first launch.

### 3.6.0 — 19/10/2026
- On first launch, the editor loads the **Example Map** project at the camera saved in it.
- Arrow keys move the selected item in the MapIcons, TextDraws and GangZones windows (1 unit, 0.1 with Shift), without
  affecting the main editor while the window is open.
- TextDraw outline and shadow are on/off checkboxes (off by default).
- The GangZone name updates instantly while it is typed.

### 3.5.5 — 19/10/2026
- New initial camera view when opening an empty project for the first time.

### 3.5.4 — 19/10/2026
- Removed the temporary performance log used to investigate the freeze when resizing (the cause was in the PC's Windows,
  not in the editor).

### 3.5.3 — 19/10/2026
- The 3D map follows the window again while resizing (the 3.5.2 pause was undone).
- Performance log in the Logs: duration, frames and longest pause of each resize, and page stalls.

### 3.5.2 — 19/10/2026
- The inspector's "Project" button also takes the camera to the editing arrows.
- When running from the source code, the cache generated at runtime goes to the data folder, not to
  `compile-sources\cache`.

### 3.5.1 — 19/10/2026
- The top bar shows every label that fits and hides them one by one only when there is no room.
- Resizing the window no longer freezes: the object and texture lists are only redrawn when needed.
- When opening or importing, the camera focuses on the item closest to the project center.
- "Move the whole project" takes the camera to the editing arrows.

### 3.5.0 — 19/10/2026
- When closing the program, every open project is saved before exiting.
- Changes in the TextDraws, MapIcons and GangZones windows are saved when closing with X, Done or Esc.
- After importing, no item is selected automatically.
- Program icon in the confirmation boxes and bigger in the top bar.

### 3.4.1 — 19/10/2026
- TextDraws like the game: the editor draws with the GTA SA fonts and reproduces the game's math for letter size, line
  breaks, alignment and box, on the SA-MP 640x448 screen in 16:9.
- The editor, the exported Pawn code and the test server use the same `TextDrawLetterSize` and `TextDrawTextSize`
  parameters; TextDraws of old projects are converted when opened.
- Right-aligned box like the SA-MP 0.3.7 client: it goes from the left edge of the screen to the text.
- Clicking anywhere on a TextDraw selects it and allows dragging, including at the top of the screen.
- The build no longer opens the program folder when it finishes.

### 3.4.0 — 18/10/2026
- **Single executable**: the whole program comes compressed in `SA Map Studio.exe`, which on the first run creates the
  `sa-map-studio` folder (with a progress bar and an animated icon) and on the following ones opens the editor
  directly.
- **Automatic GTA setup**: with the executable inside the game's install folder, the folder is recognized and set up by
  itself, without asking for the installation when opening.
- More reliable GTA detection on any machine: default folder
  (`C:\Program Files (x86)\Rockstar Games\GTA San Andreas`) first, then the Windows registry and other drives; with no
  valid installation, the default folder is suggested and the warning only appears when moving on. Detection only reads
  the game folders.
- A failure reading the game files goes back to choosing the folder instead of freezing the startup.
- Works in `Program Files`: WebView2 data goes to the user folder when the program is in a protected folder.
- Official icons with animation synced to the loading and version metadata in the `.exe`.
- TextDraws with alignment and boxes like the editor on the open.mp server; sequential duplication and snapping of
  GangZones and MapIcons; camera names preserved; undo fixed when dragging.

### 3.3.0 — 18/10/2026
- TextDraw boxes proportional to the text and exact `TextDrawTextSize` for each alignment on the test server.
- Isolated undo/redo in the MapIcons, GangZones and TextDraws windows.
- Pawn camera import (`SetPlayerCameraPos`, `SetPlayerCameraLookAt`, `InterpolateCameraPos`, `InterpolateCameraLookAt`).
- Sounds are only a preview and test tool, outside the exported Pawn code.
- GangZone names saved and exported; Pawn export without duplicated sections.

### 3.2.0 — 18/10/2026
- TextDraw editor with GTA SA colors (`~r~`, `~g~`, `~b~` and others) and direction symbols, faithful alignments and a box
  without text.
- Duplicate GangZones and MapIcons (`Ctrl+C` / `Ctrl+D`).
- Drag the object straight over the terrain, keeping the height.
- Attaching blocked on objects that are already parents; "Object" as the default axis.
- Text on objects updated in real time and totals of each category in the project list.

### 3.1.0 — 17/10/2026
- Sound catalog (`PlayerPlaySound`) with 2,620 sounds, preview and categories.
- Checkpoints and Race Checkpoints (types 0 to 4) with chained arrows and faithful models.
- MapIcons editor (`SetPlayerMapIcon`) with a radar map, 64 icons and styles.
- Tuning with correct side skirts and spoilers, also on the test server.
- Floating button to switch move/rotate and a responsive top bar.

### 3.0.0 — 15/10/2026
- Smart filtering of vehicle tuning, paintjobs and colors: strict compatibility with the vehicle model based on the
  official SA-MP/open.mp rules (`IsVehicleValidForColor`, `IsVehicleValidForModding`, `IsPaintjobValidForVehicle` and
  `IsModValidForVehicle`). The vehicle inspector now shows only the modding components (spoilers, hoods, roofs, skirts,
  exhausts, nitro, wheels, stereo, hydraulics), paintjobs (0 to 2) and color pickers compatible with the selected model.
- Real tuning and paintjobs on the test server: full `AddVehicleComponent` and `ChangeVehiclePaintjob` support in the test
  gamemode (`samapstudio.pwn` and `samapstudio.amx`), showing vehicles with their parts and paint applied in the game.
- Full 3D Text (3D Text Labels) support: visual creation in the 3D viewport billboarded towards the camera
  (`Create3DTextLabel` / `CreateDynamic3DTextLabel`), multiple lines (`\n`), embedded color tags (`{RRGGBB}`), quick SA-MP
  palette and hexadecimal picker, draw distance (`drawDistance`), line-of-sight test (`testLOS`), interior and virtual
  world, Pawn import/export and automatic sync on the test server.
- Full Pickup support (`CreatePickup` / `CreateDynamicPickup`): categorized catalog of predefined open.mp and SA-MP pickups
  (health, armour, money, properties, weapons IDs 321 to 372 and items), animated 3D mesh with continuous rotation in the
  viewport, inspector with pickup type, respawn time, world and interior, saving/loading in the project, Pawn
  import/export and sync on the test server.
- New interactive GangZone editor with a radar map: modal dialog showing the official GTA San Andreas radar map (-3000 to
  +3000), pan/zoom navigation, zones drawn by dragging the mouse, smart magnetic edge snapping between neighboring zones
  with cyan visual guides, RGBA color picker with opacity, flat 3D projection of the zone on the world ground,
  saving/loading in the project, Pawn export (`GangZoneCreate` / `GangZoneShowForAll`) and rendering on the test server.
- New visual TextDraw editor (TextDraw Editor): editing at SA-MP's native 640x480 resolution with safe-margin guides,
  texts and boxes with custom colors and opacity, font selection (0 to 5), `shadow`, `outline`, alignment (left, center,
  right), `letter size`, text/box size (`text size`), 3D model preview for Font 5 (vehicles, skins and objects with
  configurable rotation and zoom), interactive dragging and resizing and clean export of ready-to-use Pawn scripts
  (`TextDrawCreate` or `CreatePlayerTextDraw`).

### 2.9.1 — 15/10/2026
- Critical texture rendering fix (Three.js WebGL): removed the `TypeError: Cannot read properties of undefined (reading
  'width')` error in `uploadTexture`, keeping the mipmap structures of DXT/RGBA textures intact in memory and avoiding
  freezes and visual glitches when rendering the map models.
- Fixed the top bar submenus and the "Go to" menu: removed overflow restrictions in the top bar and prevented accidental
  scrolling when focusing the coordinate field (Ctrl+G), so every dropdown ("Snap", "Go to", "View") opens and floats
  over the 3D viewport without moving buttons.
- The mouse cursor is hidden while moving the camera: it disappears when rotating the view (right button), panning
  (middle button) or moving around the map, and comes back as soon as the movement stops.
- Removed the redundant "Prepare thumbnails" function and button from the object catalog, since all 15,956 thumbnails
  are already pre-generated and stored locally (`data/cache/thumbnails/objects`).

### 2.9.0 — 15/10/2026
- Full open.mp and GTA SA weapon catalog: 46 weapons and special items (IDs 321 to 372) with a dedicated "Weapons"
  category and alphabetical sorting of the categories.
- Fine adjustment with arrow buttons on the axes (▲ / ▼): step buttons in Position (X, Y, Z) and Rotation (RX, RY, RZ)
  with continuous auto-repeat, Shift (0.1x), Ctrl (5.0x) and Undo/Redo history.
- "Make invisible" feature in materials: removes the texture of object indexes, hiding the mesh in 3D and exporting the
  canonical `SetObjectMaterial(objectid, 0, "none", "none", 0)`.
- Strict Pawn coordinate formatting: float values with zero after the point formatted cleanly (e.g. `180.0`, `0.0`),
  keeping the exact representation of the imported file.
- Independent collapsing of the left and right sidebars with edge buttons and smart restoring in the camera
  auto-collapse mode.
- Quick teleport to the mouse click coordinates through a dedicated button in the inspector.
- Local disk thumbnails and full VRAM optimization: 15,956 WebP thumbnails (~15 MB) pre-packed in the local
  `data/cache/thumbnails` folder, read directly from disk without loading 3D meshes at startup, shared world textures
  preserved (avoiding black asphalt/terrain), pixel ratio 1.0 and strict geometry disposal, reducing memory use from more
  than 3.1 GB to minimal, stable levels.
- Clean, self-contained build of the executable (.exe): improved build script with self-recovery of the virtual
  environment (`compile-sources\.venv-build`), smart detection of Python executables (avoiding invalid Microsoft Store
  stubs) and verified clean packaging in `compiled\SA Map Studio`.
- Automatic privilege elevation (Admin / UAC): build with `--uac-admin`, writing the `requireAdministrator` directive in
  the `.exe` PE manifest to guarantee access to GTA San Andreas, process control and network ports.

### 2.8.0 — 14/10/2026
- New animation picker with a split panel (Split View) and a built-in video player to demonstrate the animation live.
- Local cache and high-performance WebM streaming in `data/cache/animations/`.
- Background download of the full offline package (~320 MB) with progress and a pause option.
- Stable selection, fixed only by the mouse click, without unwanted changes from moving the cursor.
- New `/w [weather]` (0-45) and `/t [time]` (0-23 hours and minutes) commands on the test server, synced for every player.
- New `/help` command on the test server listing every available shortcut and command.

### 2.7.0 — 14/10/2026
- Full open.mp animation catalog: 1,872 presets organized by library with a real-time search field.
- Smart window positioning and centering on the screen, adapting to the monitor's usable area.
- Clearer manipulator axis orientation ("Axes: World" vs "Axes: Object").
- "Change GTA folder" option in the "Test in game" dialog.
- New Logs and Diagnostics system: automatic capture of JS/console errors and a dialog with a quick copy button.

### 2.6.0 — 14/10/2026
- "Go to" menu restructured in tabs: "World places" and "Interiors", with a list of more than 140 GTA SA and SA-MP/open.mp
  interiors.
- Weather (0 to 45) and time with minutes in "Test in game" and in the View menu, synced in real time in the editor's 3D
  (dynamic sky, day/night cycle and lighting).
- `/fly` and `/voar` commands on the test server to toggle the free camera flight with a smooth return to the starting
  point.
- `/map` and `/mapa` commands to teleport straight to the center of the map under test.
- Unified Actors catalog: real-time skin change and preview in the right menu, standing on surfaces and with fixed
  orientation.

### 2.5.0 — 14/10/2026
- View distance limit expanded up to 2500 meters in the View menu.
- F10 shortcut and a top bar button to collapse and restore the side menus in full screen.
- Optional automatic collapsing of the menus while moving the camera.
- Mouse click coordinate field at the top of the side menu with one-click copy.
- Undo and Redo with smart global support.
- New stylized official icon with the classic `mkwalloven1` oven (ID 19933).

### 2.4.1 — 14/10/2026
- Several projects coexisting, in Editable or Not editable mode.
- Faithful import of Pawn maps (`.pwn`) keeping 100% of comments, notes, includes and hexadecimal colors.
- open.mp test server with omp-server.exe, DLLs and components packed at the root of the distribution.

### 2.4.0 — 14/10/2026
- Deep reduction and optimization of WebView2 RAM use.
- Full SA-MP vehicle color palette (0 to 255) and real-time tuning/paintjob view in 3D.
- Separate texture and text categories in the Project panel.
- Reversed object order and an "Erase everything" safety button.
- MoveObject support with a movement test in the world and AttachObjectToObject with visual editing.
- Coordinate export as an array and manual editing of the Pawn script.

### 2.3.0 — 13/10/2026
- Configurable movement and rotation speeds in the side menu (0.001x to 10.0x).
- Group rotation with several selected objects.

### 2.2.0 — 13/10/2026
- Red highlight on the world objects selected for removal.
- Simultaneous removal with RemoveBuildingForPlayer and bigger thumbnails in the catalog.
- Custom aliases for favorites and standardized renaming of stream properties.

### 2.1.0 — 13/10/2026
- A changed texture covers the object part evenly in the editor, without the shadows painted on the original model
  (like the game).
- More resilient internal server: it does not close for lack of memory on a request and recovers from errors by itself.
- Less memory when browsing the map and preparing thumbnails.
- *What's new and documentation* button, with the build date and time.
- `Servidor de Teste` folder inside the program and a new `Compilar EXE limpo.bat`.

### 2.0.0 — 13/10/2026
- A single program folder with organized subfolders.
- Object and texture categories; thumbnails stored on disk.
- SA-MP material editor with every index, color panel and text.
- Duplicate in the same spot, teleport, cameras, "Test in game" and import of any file.
- Complete map (missing objects and LODs) and smoother loading.

### 1.0.0 — 12/10/2026
- First version: map with streaming and LOD, catalog, gizmo, building removal, vehicles, Pawn/IPL export, `.pwn` import
  and build into an `.exe`.

---

## Credits and licenses

- [Three.js](https://threejs.org/) (MIT) for 3D rendering.
- [Barlow](https://github.com/jpt/barlow) font (SIL Open Font License, see `compile-sources/fonts/OFL.txt`).
- GTA San Andreas is a trademark of Rockstar Games. The game files are not part of this repository: the editor uses the
  copy installed on the computer of whoever opens it.

---

**© 2026 Rafael_Hurley and Walter_Correa. All rights reserved.**

This is a private repository. Copying, distributing or modifying this code without the authors' permission is not allowed.

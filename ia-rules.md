# SA Map Studio Project Guidelines

This file defines ongoing guidelines and rules that must be strictly followed in every session and task:

## 1. Building the Final Version (Mandatory)
- **Always build the final version** by running `build-clean.bat` at the end of each task or round of changes.
- **Executable version**: the version written into the `.exe` always comes from `VERSION` in `serve.py` (`build.bat` runs `compile-sources/sync_version.py` before PyInstaller). When changing the version, only change `serve.py`, `about.js` and `readme.md` (badge and "Version history"); never edit `version_info.txt` by hand.
- The clean distribution generated in `compiled\SA Map Studio\` must always reflect exactly every updated file (source code, assets, models and scripts).

## 2. Version Control (Git)
- **Always commit and push at the end of each task**.
- Commit messages must be clear, objective and always in English, following a single pattern:
  - Title starting with a present-tense verb in the 3rd person singular (`Adds`, `Fixes`, `Removes`, `Updates`, `Adjusts`).
  - No prefixes (`feat:`, `fix:`, `docs:`) and no period at the end of the title.
  - No AI identification lines (such as `Co-Authored-By`) in the message.
  - Several changes in the same commit: list them in the title separated by commas or detail them in the message body.
- **Releases are manual, preparing them is automatic**: whenever a task changes `VERSION` in `serve.py`, the commit also carries the matching section of the "Version history" in `readme.md` (the GitHub release text is taken from it), and it is pushed. Never create or push a version tag and never start the workflow: the user publishes each release by hand in Actions > Release > Run workflow (`.github/workflows/release.yml`, which builds with `build-clean.bat` and creates the tag `v<VERSION>` itself). The workflow fails without the matching "Version history" section.
- **Build check on every push**: `.github/workflows/build.yml` runs `i18n_check.py` and `build-clean.bat` on every push to `main` (pushes that only change the documentation are skipped) and keeps the `.exe` as a download of the run for 7 days. It never creates a tag or a release; a red Build means the push broke the translations or the build and must be fixed.

## 3. Naming, Interface and Content Standards
- **Project name and naming**: The official project name is `SA Map Studio`, producing the executable `SA Map Studio.exe` and the distribution folder `compiled\SA Map Studio\`. Every internal data and system folder and file of the project must be named strictly in English and in lowercase (no Portuguese and no uppercase letters), such as `data`, `test-server`, `system`, `projects`, `exported`, `compile-sources`, `models`, `build.bat`, `build-clean.bat`, `start.bat`, `readme.md`, `ia-rules.md`. Exceptions: JavaScript modules (`.js`) may use camelCase uppercase letters (e.g. `animPicker.js`, `textdrawEditor.js`), and third-party files or files with official game names (fonts, libraries in `vendor/`, GTA animation libraries) keep their original names.
- **Documentation in English**: `readme.md` and `ia-rules.md` are always written in English, and so are commit messages (section 2).
- **Short, objective names**: Titles, buttons, labels, placeholders, status messages and warnings shown inside the compiled editor must not overflow their space or show an ellipsis ("..."). The rule only applies to texts shown in the compiled program; documentation (`readme.md`, `ia-rules.md`), code comments and console/log messages may use an ellipsis.
- **Sources and citations**: Never cite external sources inside the compiled editor (interface, help texts, what's new). The rule does not apply to the repository documentation (`readme.md`), where credits and licenses may be cited.
- **Initial window**: The editor must open maximized by default.
- **Color formatting**: 3D Text colors (Create3DTextLabel) must use full alpha (`0x...FF`, not `0x...AA`).
- **Encoding**: The Pawn scripts and the test server map files (such as `samapstudio.pwn` and `mapa.txt`) must be written and saved strictly in ANSI (Windows-1252), the native SA-MP/GTA SA standard for accents and characters without corruption. The other web/system source files (HTML, JS, CSS, Python) stay in UTF-8.
- **Exported code**: In the exported Pawn code, functions, callbacks and section separators are always in English (`stock Map_<name>_Load()`, `// 3D Texts:`); only the information comments follow the editor language.

## 4. Files and Build
- **No LEIA-ME.txt**: Never include a `LEIA-ME.txt` file anywhere when building the project (`build.bat` / `build-clean.bat`).
- **Organization and the testing folder**: The project root must always stay clean and organized, holding only the structural files and folders of the project. Every test, temporary script and verification file must be created and run only inside the `testing/` folder.
- **Test cleanup**: When finishing each task, every file and folder created for tests inside `testing/` must be deleted, keeping only essential files that will be used in future tests (and `.gitkeep`).
- **Comments always in English**: every code comment (`//`, `/* */`, `#`, `<!-- -->`, `REM`/`::`) in every project file is written in English, including new and edited ones. Only the interface texts stay in Brazilian Portuguese (they are the translation keys).

## 5. Languages
- **Every new text in every language**: the editor always ships in every language of `compile-sources/js/lang/languages.json`. Every new or changed text of the interface, of the `serve.py` windows and of the test server messages needs a translation in every `js/lang/<code>.json` file; the installer texts live in the `TEXTS` table of `launcher.py`. Run `python compile-sources/i18n_check.py` before building: it must show 0 missing, 0 with different variable parts and 0 orphans in every language, and no `launcher.py` warning. When a Portuguese text changes in the code, move its key with `python compile-sources/i18n_tool.py rename "old" "new"`; translate missing texts in batches with `i18n_tool.py export` / `import` (work folder `testing/i18n/`); delete keys the code no longer uses with `i18n_check.py --prune`.
- **Correct spelling**: every language, including the Brazilian Portuguese base, must have correct spelling, accents and punctuation (for example `¿`/`¡` in Spanish and the space before `: ; ! ?` in French).
- **Whole sentences**: do not build sentences from pieces (`"Aplicar no" + "s índices"`, `` `Selecione um ${tipo}` ``); use templates with the whole sentence or `plural(n, 'item', 'itens')`. Text drawn on a canvas, placed in a textarea value or generated for the game goes through `t()`.
- **Not translated**: game and SA-MP names, keys and the exported Pawn code stay the same (`compile-sources/i18n_same.txt`, `translate="no"` in the HTML).
- **Changelog only in English**: the version history (`CHANGELOG` in `about.js` and "Version history" in `readme.md`) is always written in English and never translated into any other language, not even Portuguese. It has no keys in the `js/lang/<code>.json` files, the editor shows it with `translate="no"` and `i18n_check.py` ignores it.
- **New languages** are added to `languages.json` with the name written in the language itself and without a country; the Language menu sorts them alphabetically by name on its own. Each entry also has `windows` (Windows primary language id) and, for Cyrillic, `"script": "cyrillic"` (Segoe UI font in `css/app.css`); the installer's `TEXTS` and `WINDOWS_LANGS` in `launcher.py` must match `languages.json`.
- **Plural forms**: counts written with `plural(n, 'objeto', 'objetos')` produce keys such as `"{0} objetos"`. In languages with more than two forms (Russian, Ukrainian, Polish, Romanian) the translation is an object of `Intl.PluralRules` categories, `{"one": …, "few": …, "many": …, "other": …}` (`"count": N` when the number is not `{0}`); every form keeps the key's variable parts.

## 6. License and material of the game
- The code of the editor is licensed under the **Mozilla Public License 2.0** (`LICENSE`). Third-party code and material keep their own licenses and are listed in the "License" section of `readme.md`; a new third-party item goes there too.
- **Never add files of the game to the repository or to the package.** The only exceptions are `compile-sources/cache/sounds` (short sounds for the sound preview) and `compile-sources/css/game_bg.png`. Thumbnails, skins, sprites, map icons, the radar and CJ are made from the GTA folder of the user the first time the editor opens (`compile-sources/js/editor/gameAssets.js` and the worker `world/textures.worker.js`); `build.bat` packs only `compile-sources/cache/sounds`, never what an earlier build left in the data folder.
- When the way those pictures are drawn changes, raise `ASSET_REV` in `serve.py`: on the next start the old ones are thrown away and drawn again.
- A temporary copy of the project made for tests (for example in the root of a drive) is removed when the test is over.

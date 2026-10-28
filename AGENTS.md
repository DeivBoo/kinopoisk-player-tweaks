# Project Context: Kinopoisk Player Tweaks

## 🎯 About the Project
Development of a Tampermonkey userscript to modify the player on the Kinopoisk website (hd.kinopoisk.ru).
Goal: Improve UX by persisting user settings (per-content) and modifying interface behavior.

## 🚨 CURRENT FOCUS (Активная задача)
**Project is STABLE at v1.0.2**
All core features implemented. Bug fixes for fullscreen, episode switching, ad skipping, and "next episode" logic are merged.
- Volume (global)
- Audio/Subtitle (per-content, using `rt` param or `pathname`)
- Skip Buttons Control (separate actions for Intro, Credits, and Ads)
- Smart Overlays for Hover-to-Click

## 🛠 Tech Stack
*   **Environment:** WSL 2 (Ubuntu 26.04), Bionic (LM Studio), Playwright MCP.
*   **Language:** JavaScript (ES6+).
*   **Script Manager:** Tampermonkey (`GM_setValue`, `GM_getValue`).
*   **Testing:** Manual DOM inspection via Chrome DevTools.

## 📂 Project Structure
*   `kinopoisk-tweaks.user.js` - main userscript (v1.0.2).
*   `README.md` - project info.
*   `AGENTS.md` - this file.

## 🎯 Core Tasks (Feature Roadmap)
1.  [x] **Volume Persistence:** Global volume memory.
2.  [x] **Per-Content Settings:** Audio/Subtitle settings saved under `audioTrackLabel_<contentId>`.
3.  [x] **Subtitle Persistence:** Forced click after audio change.
4.  [x] **Skip Buttons Control:** Separate `skipIntroAction`, `skipCreditsAction` (1: Auto, 2: View, 3: None) and `skipAdAction` (1: Auto, 2: None).
5.  [x] **Menu Behavior Change (Hover-to-Click):** "Smart Overlay" for 4 UI panels.
6.  [x] **Fix Content ID Parsing:** `getContentId()` prioritizes `rt` URL parameter.
7.  [x] **Fullscreen Bug Fix:** Skip logic works correctly in fullscreen mode.
8.  [x] **Episode Switch Bug Fix:** `src` change detection triggers track restoration.
9.  [x] **Independent Feature Toggles:** `enableVolumePersistence`, `enableTrackPersistence`, `enableHoverToClick`.
10. [x] **Ad-Skip & Next Episode Fix:** Accurate Ad detection via `[data-tid="MoviePrerollView"]` and handling "Следующая серия" when "Пропустить" is absent in credits.

## ⚙️ Technical Implementation Details
*   **USER_CONFIG Block:** Settings at the top (`defaultVolume`, `skipIntroAction`, `skipCreditsAction`, `skipAdAction`).
*   **Per-Content Storage:** `getContentId()` checks `rt` param first, then pathname. Keys in storage are suffixed.
*   **The "Smart Overlay" Trick:** Transparent `div` blocks `mouseover` to prevent menus opening on hover. If `aria-expanded="true"`, `pointer-events: none` allows the second click to close the menu natively.
*   **Restore Order:** Audio -> 500ms -> Subtitles -> 300ms -> Close menu.
*   **Skip Button Detection:** 
    *   Ads: Detected via `[data-tid="MoviePrerollView"]`.
    *   Intro: Button text `Смотреть заставку`.
    *   Credits: Button text `Смотреть титры`. If `Следующая серия` exists instead of `Пропустить`, it acts as the skip button.

## ⚠️ Technical Constraints and Rules (CRITICAL)
1.  **NO GLOBAL MUTATION OBSERVERS:** Use `setInterval` for polling.
2.  **NO RECURSIVE DOM SEARCH:** Use known stable selectors.
3.  **DO NOT BLOCK VOLUME HOVER:** Leave the volume button native.
4.  **NO BLIND EVENT OVERRIDES:** Use the Overlay trick.

## 🐞 Known Issues
*   None. Ad HTML has been captured and implemented.

## 🛑 Git Workflow Rules
*   Do NOT run `git push`. Only `git add` and `git commit`.

## 📝 Current Status
*   [x] Stable v1.0.2 committed.
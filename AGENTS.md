# Project Context: Kinopoisk Player Tweaks

## 🎯 About the Project
Development of a Tampermonkey userscript to modify the player on the Kinopoisk HD website (hd.kinopoisk.ru). 
Goal: Improve UX by persisting user settings (per-content) and modifying interface behavior.

## 🚨 CURRENT FOCUS (Активная задача)
**Project is STABLE at v2.2.8.**
All core features implemented and the URL parsing bug is fixed.
- Volume (global)
- Audio/Subtitle (per-content, using `rt` param or `pathname`)
- Skip Buttons Control (`USER_CONFIG.autoSkip`)
- Smart Overlays for Hover-to-Click

## 🛠 Tech Stack
*   **Environment:** WSL 2 (Ubuntu 26.04), Bionic (LM Studio), Playwright MCP.
*   **Language:** JavaScript (ES6+).
*   **Script Manager:** Tampermonkey (`GM_setValue`, `GM_getValue`).
*   **Testing:** Manual DOM inspection via Chrome DevTools.

## 📂 Project Structure
*   `kinopoisk-tweaks.user.js` - main userscript (v2.2.8).
*   `AGENTS.md` - this file.

## 🎯 Core Tasks (Feature Roadmap)
1.  [x] **Volume Persistence:** Global volume memory.
2.  [x] **Per-Content Settings:** Audio/Subtitle settings saved under `audioTrackLabel_<contentId>`.
3.  [x] **Subtitle Persistence:** Forced click after audio change.
4.  [x] **Skip Buttons Control:** `USER_CONFIG.autoSkip` (1: Auto, 2: View, 3: None).
5.  [x] **Menu Behavior Change (Hover-to-Click):** "Smart Overlay" for 4 UI panels.
6.  [x] **Fix Content ID Parsing (Bug Fixed):** `getContentId()` now prioritizes `rt` URL parameter to correctly identify the playing series, avoiding settings bleed from promo pages.

## ⚙️ Technical Implementation Details
*   **USER_CONFIG Block:** Settings at the top (`defaultVolume`, `autoSkip`).
*   **Per-Content Storage:** `getContentId()` checks `rt` param first, then pathname. Keys in storage are suffixed.
*   **The "Smart Overlay" Trick:** Transparent `div` blocks `mouseover` to prevent menus opening on hover. If `aria-expanded="true"`, `pointer-events: none` allows the second click to close the menu natively.
*   **Restore Order:** Audio -> 500ms -> Subtitles -> 300ms -> Close menu.

## ⚠️ Technical Constraints and Rules (CRITICAL)
1.  **NO GLOBAL MUTATION OBSERVERS:** Use `setInterval` for polling.
2.  **NO RECURSIVE DOM SEARCH:** Use known stable selectors.
3.  **DO NOT BLOCK VOLUME HOVER:** Leave the volume button native.
4.  **NO BLIND EVENT OVERRIDES:** Use the Overlay trick.

## 🐞 Known Issues
*   None. (The URL parsing bug is fixed).

## 🛑 Git Workflow Rules
*   Do NOT run `git push`. Only `git add` and `git commit`.

## 📝 Current Status
*   [x] Stable v2.2.8 committed.
*   [!] Known Issue: None.
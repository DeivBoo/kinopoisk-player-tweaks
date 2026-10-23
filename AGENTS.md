# Project Context: Kinopoisk Player Tweaks

## 🎯 About the Project
Development of a Tampermonkey userscript to modify the player on the Kinopoisk HD website (hd.kinopoisk.ru). 

## 🚨 CURRENT FOCUS (Активная задача)
**Project is COMPLETE and STABLE at v2.2.6.**
All requested features are fully implemented:
- Volume Persistence (default 100%)
- Audio Track Persistence
- Subtitle Persistence (with forced click after audio change)
- Skip Buttons Control (3 modes: Auto-skip, View mode, None)
- Hover-to-Click for 4 UI panels via "Smart Overlay"

No active tasks. Future ideas: Settings UI via Tampermonkey menu, trailer support.

## 🛠 Tech Stack
*   **Environment:** WSL 2 (Ubuntu 26.04), Bionic (LM Studio), Playwright MCP.
*   **Language:** JavaScript (ES6+).
*   **Script Manager:** Tampermonkey (`GM_setValue`, `GM_getValue`).
*   **Testing:** Manual DOM inspection via Chrome DevTools + Playwright.

## 📂 Project Structure
*   `kinopoisk-tweaks.user.js` - main userscript (v2.2.6).
*   `AGENTS.md` - this file.

## 🎯 Core Tasks (Feature Roadmap)
1.  [x] **Volume Persistence:** Remember volume (default from `USER_CONFIG.defaultVolume`).
2.  [x] **Audio Track Persistence:** Remember and restore audio track.
3.  [x] **Subtitle Persistence:** Remember and restore subtitles (forced click after audio to override Kinopoisk auto-reset).
4.  [x] **Skip Buttons Control:** Implemented 3 modes via `USER_CONFIG.autoSkip`:
    *   `1` - Auto-skip (clicks "Пропустить", hides "Смотреть заставку/титры").
    *   `2` - View mode (clicks "Смотреть заставку/титры" to stop timer, hides "Пропустить").
    *   `3` - None (no interference).
5.  [x] **Menu Behavior Change (Hover-to-Click):** "Smart Overlay" trick for Settings, Audio, Seasons, Send-to-device.

## ⚙️ Technical Implementation Details
*   **USER_CONFIG Block:** All user settings are at the top of the file (`defaultVolume`, `autoSkip`).
*   **The "Smart Overlay" Trick:** 
    *   A transparent `div` intercepts `mouseover`/`mouseenter` to prevent menus from opening on hover.
    *   If `aria-expanded="true"` (menu is open), the overlay gets `pointer-events: none`, allowing the second click to pass through and close the menu natively.
    *   The Volume button is **intentionally excluded** from overlays because it's a complex container.
*   **Restore Order:** Audio is set first, then a pause (500ms), then subtitles are forcibly clicked.
*   **Timings:** 
    *   Start restore: 700ms after video detection.
    *   Menu open -> Audio click: 400ms.
    *   Audio -> Subtitle: 500ms.
    *   Subtitle -> Menu close: 300ms.
*   **Selectors:** Only stable attributes (`data-test-id`, `data-tid`, `aria-label`, stable class prefixes).
*   **State Protection:** `isRestoring` flag prevents double restores. Overlay checks `getElementById` to prevent duplicates.

## ⚠️ Technical Constraints and Rules (CRITICAL)
1.  **NO GLOBAL MUTATION OBSERVERS:** Use `setInterval` for polling.
2.  **NO RECURSIVE DOM SEARCH:** Use known stable selectors.
3.  **DO NOT BLOCK VOLUME HOVER:** Leave the volume button native.
4.  **NO BLIND EVENT OVERRIDES:** Do not try to `stopPropagation()` on `mouseenter` globally or manually dispatch sequences of `mousedown`/`mouseup`. Use the Overlay trick.

## 🛑 Git Workflow Rules
*   Do NOT run `git push`. Only `git add` and `git commit`.

## 📝 Current Status
*   [x] Stable v2.2.6 committed.
*   [x] `@match` restricted to `hd.kinopoisk.ru`.
*   [!] Known Issue: Timings (400ms, 500ms) are tuned for a fast local machine.
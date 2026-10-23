# Project Context: Kinopoisk Player Tweaks

## 🎯 About the Project
Development of a Tampermonkey userscript to modify the player on the Kinopoisk website (kinopoisk.ru). 
Goal: Improve UX by persisting user settings and modifying interface behavior without breaking the React-based player.

## 🚨 CURRENT FOCUS (Активная задача)
**Project is COMPLETE and STABLE at v2.2.0.**
All requested features are fully implemented:
- Volume Persistence
- Audio Track Persistence
- Subtitle Persistence (with forced click after audio change to override Kinopoisk's auto-reset)
- Hide Skip Buttons (Intro/Credits/Next)
- Hover-to-Click for 4 UI panels (Settings, Audio, Seasons, Send-to-device) via "Smart Overlay"

Next steps (optional): 
- Implement a native Tampermonkey settings menu (via `GM_registerMenuCommand`) to toggle `hideIntro`/`hideCredits` without editing code.
- Investigate supporting multiple video players / trailers.

## 🛠 Tech Stack
*   **Environment:** WSL 2 (Ubuntu 26.04), Bionic (LM Studio), Playwright MCP.
*   **Language:** JavaScript (ES6+).
*   **Script Manager:** Tampermonkey (`GM_setValue`, `GM_getValue`).
*   **Testing:** Manual DOM inspection via Chrome DevTools + Playwright.

## 📂 Project Structure
*   `kinopoisk-tweaks.user.js` - main userscript (v2.2.0).
*   `AGENTS.md` - this file.

## 🎯 Core Tasks (Feature Roadmap)
1.  [x] **Volume Persistence:** Remember volume.
2.  [x] **Audio Track Persistence:** Remember and restore audio track.
3.  [x] **Subtitle Persistence:** Remember and restore subtitles.
4.  [x] **Skip Buttons:** Hide "Skip Intro/Credits/Next" buttons.
5.  [x] **Menu Behavior Change (Hover-to-Click):** Implemented via the "Smart Overlay" trick for 4 main buttons.
6.  [ ] **Settings UI:** Add a native Tampermonkey menu to toggle feature flags.

## ⚙️ Technical Implementation Details
*   **The "Smart Overlay" Trick:** 
    *   A transparent `div` intercepts `mouseover`/`mouseenter` to prevent menus from opening on hover.
    *   If `aria-expanded="true"` (menu is open), the overlay gets `pointer-events: none`, allowing the second click to pass through and close the menu natively.
    *   The Volume button is **intentionally excluded** from overlays because it's a complex container (hovering expands it to a slider); blocking it breaks UI behavior.
*   **Restore Order:** Audio is set first, then a pause (500ms), then subtitles are forcibly clicked. This is required because Kinopoisk auto-resets subtitles to default (Russian) when the audio track changes.
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
*   [x] Stable v2.2.0 committed.
*   [!] Known Issue: Timings (400ms, 500ms) are tuned for a fast local machine. If the user reports flaky behavior on slow connections, consider increasing them.
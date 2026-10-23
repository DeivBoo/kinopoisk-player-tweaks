# Project Context: Kinopoisk Player Tweaks

## 🎯 About the Project
Development of a Tampermonkey userscript to modify the player on the Kinopoisk website (kinopoisk.ru). 
Goal: Improve UX by persisting user settings and modifying interface behavior without breaking the React-based player.

## 🚨 CURRENT FOCUS (Активная задача)
**Project is stable at v2.1.4.** 
All core features are fully implemented and working! The "Smart Overlay" successfully handles Hover-to-Click and Toggle (open/close) behavior for Settings, Audio, Seasons, and Send-to-device buttons. The Volume button is intentionally left untouched (native behavior) to prevent UI breaking.

Next steps: Address remaining UX nuances requested by the user (to be defined) or implement Subtitle persistence.

## 🛠 Tech Stack
*   **Environment:** WSL 2 (Ubuntu 26.04), Bionic (LM Studio), Playwright MCP.
*   **Language:** JavaScript (ES6+).
*   **Script Manager:** Tampermonkey (`GM_setValue`, `GM_getValue`).
*   **Testing:** Manual DOM inspection via Chrome DevTools + Playwright.

## 📂 Project Structure
*   `kinopoisk-tweaks.user.js` - main userscript (v2.1.4).
*   `AGENTS.md` - this file.

## 🎯 Core Tasks (Feature Roadmap)
1.  [x] **Volume Persistence:** Remember volume.
2.  [x] **Audio Track Persistence:** Remember and restore audio track.
3.  [x] **Skip Buttons:** Hide "Skip Intro/Credits" buttons.
4.  [x] **Menu Behavior Change (Hover-to-Click):** Implemented via the "Smart Overlay" trick for 4 main buttons.
5.  [ ] **Subtitle Persistence:** Remember and restore subtitles.
6.  [ ] **Settings UI:** Add a native Tampermonkey menu to toggle `hideIntro` and `hideCredits` flags.

## ⚙️ Technical Implementation Details
*   **The "Smart Overlay" Trick:** 
    *   We inject a transparent `div` over the target button to intercept and block `mouseover`/`mouseenter` events (preventing the menu from opening on hover).
    *   **Crucial detail for Toggle behavior:** We check the `aria-expanded` attribute of the underlying button every 100ms. 
    *   If `aria-expanded="true"` (menu is open), we set `overlay.style.pointerEvents = 'none'`. This allows the *second* click to pass through the overlay directly to the button, allowing React to close the menu naturally.
    *   If `aria-expanded="false"` (menu is closed), we set `pointerEvents = 'auto'` to block hover again.
*   **Selectors:** Only use stable attributes (`data-test-id`, `data-tid`, `aria-label`, or stable class prefixes).
*   **Timing:** React menus take time to render. Use `setTimeout` with retries for DOM interactions.

## ⚠️ Technical Constraints and Rules (CRITICAL)
1.  **NO GLOBAL MUTATION OBSERVERS:** Use `setInterval` for polling.
2.  **NO RECURSIVE DOM SEARCH:** Use known stable selectors.
3.  **DO NOT BLOCK VOLUME HOVER:** The volume button is a complex container. Blocking hover on it breaks the UI (it just mutes/unmutes instead of showing the slider). Leave it native.
4.  **NO BLIND EVENT OVERRIDES:** Do not try to `stopPropagation()` on `mouseenter/mouseover` globally or manually dispatch sequences of `mousedown`/`mouseup` in a way that breaks React's state. Use the Overlay trick.

## 🛑 Git Workflow Rules
*   Do NOT run `git push`. Only `git add` and `git commit`.

## 📝 Current Status
*   [x] Stable v2.1.4 committed.
*   [!] Known Issue: Toggle behavior requires a 100ms tick to update `pointer-events`, which is imperceptible to the user but technically asynchronous.
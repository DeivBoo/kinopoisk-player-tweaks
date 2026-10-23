# Project Context: Kinopoisk Player Tweaks

## 🎯 About the Project
Development of a Tampermonkey userscript to modify the player on the Kinopoisk website (kinopoisk.ru). 
Goal: Improve UX by persisting user settings and modifying interface behavior without breaking the React-based player.

## 🚨 CURRENT FOCUS (Активная задача)
**Project is stable at v1.9.**
All core features are working: Volume, Audio/Subtitle persistence, and Hiding Skip Buttons. 
The **ONLY** remaining task is implementing the "Hover-to-Click" behavior for the settings and audio menus. Previous attempts using `stopPropagation` on `mouseenter` failed due to React's event delegation. We need a new strategy.

## 🛠 Tech Stack
*   **Environment:** WSL 2 (Ubuntu 26.04), Bionic (LM Studio), Playwright MCP.
*   **Language:** JavaScript (ES6+).
*   **Script Manager:** Tampermonkey (`GM_setValue`, `GM_getValue`).
*   **Testing:** Manual DOM inspection via Chrome DevTools + Playwright.

## 📂 Project Structure
*   `kinopoisk-tweaks.user.js` - main userscript (v1.9).
*   `AGENTS.md` - this file.

## 🎯 Core Tasks (Feature Roadmap)
1.  [x] **Volume Persistence:** Remember volume (implemented via `volumechange` listener).
2.  [x] **Audio/Subtitle Persistence:** Remember selected audio via `aria-label` and restore it using a retry mechanism (up to 5 attempts).
3.  [x] **Skip Buttons:** Hide all buttons with text "Пропустить", "Смотреть заставку", "Смотреть титры".
4.  [ ] **Menu Behavior Change (HOVER TO CLICK):** Replace hover with click on the settings and audio buttons. **CURRENT BLOCKER.**

## ⚙️ Technical Implementation Details
*   **Selectors:** Only use stable attributes (`data-test-id`, `data-tid`, `aria-label`). Do NOT use hashed React classes (e.g., `styles_button__2DDkK`).
*   **Timing:** React menus take time to render. Use `setTimeout` with retries for DOM interactions.
*   **State:** Config object is saved in `GM_setValue`.

## ⚠️ Technical Constraints and Rules (CRITICAL)
1.  **NO GLOBAL MUTATION OBSERVERS:** Do not observe `document.body`. Use `setInterval` for polling (every 1s) to find elements.
2.  **NO RECURSIVE DOM SEARCH:** Do not write deep Shadow DOM traversal functions. Use known stable selectors.
3.  **DO NOT BREAK REACT:** Avoid injecting scripts into React's internal state. Use standard DOM events (click).
4.  **NO BLIND EVENT OVERRIDES:** Do not use `e.stopImmediatePropagation()` on global `mouseover` without understanding React's synthetic event system.
5. **Screenshots:** If you need to take a screenshot via Playwright, ALWAYS save it to the `Screenshots/` directory (e.g., `Screenshots/debug.png`). NEVER save images directly to the project root.

## 🛑 Git Workflow Rules
*   Do NOT run `git push`. Only `git add` and `git commit`.

## 📝 Current Status
*   [x] Stable v1.9 committed.
*   [!] Known Issue: Hover-to-click on menu buttons is not implemented. React event delegation ignores standard `mouseenter` blocking.
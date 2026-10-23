# Project Context: Kinopoisk Player Tweaks

## 🎯 About the Project
Development of a Tampermonkey userscript to modify the player on the Kinopoisk website (kinopoisk.ru). 
Goal: Improve UX by persisting user settings and modifying interface behavior safely without breaking the React-based player.

## 🚨 CURRENT FOCUS (Активная задача)
**Research Phase: Finding exact selectors for player controls.**
We recently rolled back to a stable version (v1.6) that ONLY handles volume persistence. The previous attempts to blindly implement recursive shadow DOM traversal and aggressive event interception broke the player. 
Your immediate goal is to use Playwright MCP to **inspect the live page, find the exact paths to the audio track menu and skip buttons**, and provide a list of reliable selectors before writing any injection code.

## 🛠 Tech Stack
*   **Environment:** WSL 2 (Ubuntu 26.04), Bionic (LM Studio), Playwright MCP.
*   **Language:** JavaScript (ES6+).
*   **Script Manager:** Tampermonkey (using `GM_setValue`, `GM_getValue` APIs).
*   **Testing:** Playwright (available via MCP). Runs in `--headed` mode for visual monitoring.

## 📂 Project Structure
*   `kinopoisk-tweaks.user.js` - main userscript file.
*   `AGENTS.md` - this file (context for AI).
*   `.gitignore` - Git exclusions.
*   `Screenshots` - folder for saving screenshots.

## 🎯 Core Tasks (Feature Roadmap)
1.  [x] **Volume Persistence (STABLE):** Remember the volume level when closing the page and restore it upon reopening. (Implemented in v1.6 via simple `setInterval`).
2.  [ ] **Audio Track Persistence (PAUSED):** Remember the selected voiceover. *Requires exact selectors from Playwright.*
3.  [ ] **Skip Buttons (PAUSED):** Toggle "Skip Intro" and "Skip Credits" buttons. *Requires exact selectors from Playwright.*
4.  [ ] **Menu Behavior Change (PAUSED):** Replace hover with click. *Highly risky. Do not attempt until we understand the React event flow.*
5.  [ ] **Shadow DOM Traversal (RESEARCH):** Implement a targeted search, NOT a global recursive search over all nodes.

## ⚙️ Technical Implementation Details
*   **Persistence Mechanism:** Simple `GM_getValue`/`GM_setValue` for volume. 
*   **Player Detection:** We use a simple `setInterval` (every 1s) to find the `<video>` tag. We explicitly **DO NOT** use a heavy `MutationObserver` on `document.body` as it causes infinite loops and freezes the player.

## ⚠️ Technical Constraints and Rules (CRITICAL - READ BEFORE CODING)
1.  **NO GLOBAL RECURSIVE SEARCH:** Do not write a function that loops through every element and every `shadowRoot` on the page. It will crash the browser. If you need to traverse Shadow DOM, you must find the *specific container* first and only search within its shadow root.
2.  **NO AGGRESSIVE EVENT OVERRIDES:** Do not use `e.stopPropagation()` on `mouseover` or `click` events globally. This breaks the site's internal state.
3.  **SPA Nature:** The player loads asynchronously. Wait for elements to appear gracefully without freezing the main thread.
4.  **Security:** Do not use `innerHTML` for inserting user-provided data.
5.  **Testing/Research:** Use `browser_evaluate` primarily to **extract information** (e.g., "find the audio menu and return its outerHTML"), not to inject logic yet.

## 🛑 Git Workflow Rules
*   **DO NOT** run `git commit`, `git push`, or `git reset` automatically. 
*   You may suggest a commit message, but the user must execute the final git commands manually.

## 🔄 Agent Communication & Handoff
When reaching context limits or completing a significant milestone, provide a structured handoff summary.

## 📝 Current Status
*   [x] Git and SSH configured.
*   [x] Playwright MCP configured.
*   [x] Rollback to stable v1.6 (Volume only).
*   [ ] Research audio track and skip button selectors (IN PROGRESS).
*   [!] **WARNING:** Previous complex scripts broke the player. Do not over-engineer. Keep it simple. Test one selector at a time.
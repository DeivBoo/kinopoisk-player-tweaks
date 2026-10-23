# Project Context: Kinopoisk Player Tweaks

## 🎯 About the Project
Development of a Tampermonkey userscript to modify the player on the Kinopoisk website (kinopoisk.ru). 
Goal: Improve UX by persisting user settings and modifying interface behavior.

## 🚨 CURRENT FOCUS (Активная задача)
**We are currently working on implementing a recursive shadow DOM traversal function.**
The basic features work, but selectors fail on pages with deep shadow nesting. Your main goal right now is to create a robust utility that can traverse multiple `shadowRoot` levels to find elements like the volume slider and skip buttons without breaking existing functionality.

## 🛠 Tech Stack
*   **Environment:** WSL 2 (Ubuntu 26.04), Bionic (LM Studio), Playwright MCP.
*   **Language:** JavaScript (ES6+).
*   **Script Manager:** Tampermonkey (using `GM_setValue`, `GM_getValue`, `GM_addStyle` APIs).
*   **Testing:** Playwright (available via MCP). Runs in `--headed` mode for visual monitoring.

## 📂 Project Structure
*   `kinopoisk-tweaks.user.js` - main userscript file.
*   `AGENTS.md` - this file (context for AI).
*   `.gitignore` - Git exclusions.
*   `Screenshots` - folder for saving screenshots.

## 🎯 Core Tasks (Feature Roadmap)
1.  [x] **Volume Persistence:** Remember the volume level when closing the page and restore it upon reopening.
2.  [x] **Audio Track Persistence:** Remember the selected voiceover/language and apply it.
3.  [x] **Skip Buttons:** Toggle "Skip Intro" and "Skip Credits" buttons (automatic skip or hiding).
4.  [x] **Menu Behavior Change:** Replace the menu appearance on hover (`mouseover`) with a click interaction (`click`).
5.  [ ] **Shadow DOM Traversal (IN PROGRESS):** Implement a recursive search function for elements inside shadow roots to fix selectors on deeply nested pages.

## ⚙️ Technical Implementation Details
*   **Persistence Mechanism:** Uses a hybrid approach: `GM_setValue`/`getValue` for Tampermonkey and `localStorage` as a fallback for the Playwright testing environment. Data is stored under the key `kp_tweaks_config`.
*   **Contextual Logic:** The script analyzes the URL to determine current content (movie or series). Settings are saved and applied only if the user is watching the same movie or the same series. When switching to a completely new movie, sound and skip button settings reset to defaults in memory but do not overwrite previous data in `localStorage`.
*   **Testing Protocol:** When testing via Playwright, do not just check if the page loads. Verify that the recursive search function correctly identifies the `<video>` tag and control buttons across different movie/series pages. Use `browser_evaluate` to run the traversal function and return the found elements.

## ⚠️ Technical Constraints and Rules (CRITICAL)
1.  **Shadow DOM:** Standard `document.querySelector` methods may return null for elements inside a Shadow Root. If standard selectors fail, a shadow tree traversal function must be used. Do not break existing working selectors.
2.  **Dynamic Loading (SPA):** The player loads asynchronously. Do not attempt to find elements immediately on `DOMContentLoaded`. Always use `MutationObserver` to track the appearance of the `<video>` tag and control elements.
3.  **Security:** 
    *   Do not use `innerHTML` for inserting user-provided data (use `textContent` only).
    *   Do not request unnecessary permissions in `@grant`.
4.  **Testing:** Do not attempt to use `browser_run_code_unsafe` unless absolutely necessary. Use standard MCP tools (`browser_evaluate`, `browser_click`).

## 🛑 Git Workflow Rules
*   **DO NOT** run `git commit`, `git push`, or `git reset` automatically. 
*   You may suggest a commit message, but the user must execute the final git commands manually.

## 🔄 Agent Communication & Handoff
When reaching context limits or completing a significant milestone, provide a structured handoff summary including:
*   **Current Task**: What is being worked on right now.
*   **User Preferences & Constraints**: Key requirements from the user (e.g., specific UI choices).
*   **Important Decisions**: Distinguish between agent-led decisions and user-approved ones.
*   **Next Steps**: Immediate actions to be taken by the next agent.
*   **Observations**: Any technical hurdles, bugs found, or interesting behaviors of the site/player.
*   **Relevant Files**: List paths and significance of files used for reference.
*   **Proposed Plans**: Include any approved but not yet fully implemented plans.

## 📝 Current Status
*   [x] Git and SSH configured.
*   [x] Playwright MCP configured.
*   [x] Basic script skeleton created.
*   [x] Volume, audio track, and subtitle persistence implemented.
*   [x] Settings menu with skip button visibility toggles implemented.
*   [ ] Research and implementation of full Shadow DOM Traversal.
*   [!] Known Issue: Standard `document.querySelector` fails on many player controls because they are encapsulated in multiple nested shadow roots. Work on a recursive traversal utility is the current priority.

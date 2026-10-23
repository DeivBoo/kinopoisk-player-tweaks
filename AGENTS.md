# Project Context: Kinopoisk Player Tweaks

## 🎯 About the Project
Development of a Tampermonkey userscript to modify the player on the Kinopoisk HD website (hd.kinopoisk.ru). 
Goal: Improve UX by persisting user settings (per-content) and modifying interface behavior.

## 🚨 CURRENT FOCUS (Активная задача)
**Project is STABLE at v2.2.7 (with a known URL parsing bug).**
Core features implemented: Volume (global), Audio/Subtitle (per-content), Skip Buttons Control, Smart Overlays for Hover-to-Click.
Next step: Fix the `playingContentId` URL parsing bug so per-content settings don't bleed between different series.

## 🛠 Tech Stack
*   **Environment:** WSL 2 (Ubuntu 26.04), Bionic (LM Studio), Playwright MCP.
*   **Language:** JavaScript (ES6+).
*   **Script Manager:** Tampermonkey (`GM_setValue`, `GM_getValue`).
*   **Testing:** Manual DOM inspection via Chrome DevTools.

## 📂 Project Structure
*   `kinopoisk-tweaks.user.js` - main userscript (v2.2.7).
*   `AGENTS.md` - this file.

## 🎯 Core Tasks (Feature Roadmap)
1.  [x] **Volume Persistence:** Global volume memory.
2.  [x] **Per-Content Settings:** Audio/Subtitle settings saved under `audioTrackLabel_<contentId>`.
3.  [x] **Subtitle Persistence:** Forced click after audio change to override Kinopoisk auto-reset.
4.  [x] **Skip Buttons Control:** `USER_CONFIG.autoSkip` (1: Auto, 2: View, 3: None).
5.  [x] **Menu Behavior Change (Hover-to-Click):** "Smart Overlay" for 4 UI panels.
6.  [ ] **Fix Content ID Parsing (Bug):** See "Known Issues" below.

## ⚙️ Technical Implementation Details
*   **USER_CONFIG Block:** Settings at the top (`defaultVolume`, `autoSkip`).
*   **Per-Content Storage:** `getContentId()` extracts ID from URL. Keys in storage are suffixed (e.g., `audioTrackLabel_6dd1c438...`).
*   **The "Smart Overlay" Trick:** Transparent `div` blocks `mouseover` to prevent menus opening on hover. If `aria-expanded="true"`, `pointer-events: none` allows the second click to close the menu natively.
*   **Restore Order:** Audio -> 500ms -> Subtitles -> 300ms -> Close menu.

## ⚠️ Technical Constraints and Rules (CRITICAL)
1.  **NO GLOBAL MUTATION OBSERVERS:** Use `setInterval` for polling.
2.  **NO RECURSIVE DOM SEARCH:** Use known stable selectors.
3.  **DO NOT BLOCK VOLUME HOVER:** Leave the volume button native.
4.  **NO BLIND EVENT OVERRIDES:** Use the Overlay trick.

## 🐞 Known Issues (Bugs)
*   **URL Mismatch on Promo Pages:** 
    *   The base URL path (`/film/<id>`) represents the **promo page** you are on, NOT necessarily the content being played. 
    *   If you start watching Series B from the promo page of Series A, the URL path remains Series A, but `playingContentId` changes to Series B.
    *   **Example:**
        *   Promo page A: `/film/eae0ebba...` (Series A)
        *   Playing Series B from Promo A: `/film/eae0ebba...?playingContentId=231ca...&rt=...`
    *   **Current Behavior:** `getContentId()` uses `window.location.pathname`, so it extracts the Promo Page ID (A), causing setting bleed between Series B and A.
    *   **Proposed Fix:** Update `getContentId()` to prioritize `URLSearchParams(window.location.search).get('playingContentId')` or `rt`. If neither exists, fall back to the pathname match.

## 🛑 Git Workflow Rules
*   Do NOT run `git push`. Only `git add` and `git commit`.

## 📝 Current Status
*   [x] Stable v2.2.7 committed.
*   [!] Known Issue: URL parsing mismatch on promo pages (see above).
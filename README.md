# 🎬 Kinopoisk Player Tweaks

A Tampermonkey userscript designed to enhance the viewing experience on Kinopoisk (`hd.kinopoisk.ru`) by remembering user preferences and modifying the player's UI behavior.

## ✨ Features

*   🔊 **Volume Persistence:** Remembers your volume level across sessions and restores it when you return.
*   🗣️ **Audio Track Persistence:** Saves your selected voiceover/language and applies it automatically.
*   ⏭️ **Skip Buttons Control:** Toggle the visibility of "Skip Intro" and "Skip Credits" buttons.
*   🖱️ **Menu Behavior Change:** Replaces the annoying hover-based settings menu with a standard click interaction.
*   🛠️ **Custom Settings Menu:** Provides a sleek, built-in UI to manage your preferences manually.

## 🚀 Installation

1.  Install the **Tampermonkey** extension for your browser ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), etc.).
2.  Click on the link below to install the script:
    *   **[Install Kinopoisk Player Tweaks](https://raw.githubusercontent.com/DeivBoo/kinopoisk-player-tweaks/main/kinopoisk-tweaks.user.js)**
3.  Tampermonkey will prompt you to install. Click "Install".
4.  Open any movie or series on Kinopoisk and enjoy!

## 🛠️ Tech Stack & Development

This project was developed using a modern, AI-assisted workflow:
*   **Environment:** WSL 2 (Ubuntu), LM Studio (Bionic AI Agent).
*   **Testing:** Playwright (via MCP) for automated UI testing.
*   **Core:** Vanilla JavaScript (ES6+), Tampermonkey API (`GM_setValue`, `GM_getValue`).

## 🗺️ Roadmap / Known Issues

*   [x] Volume persistence.
*   [x] Basic skip buttons toggle.
*   [ ] **In Progress:** Robust Shadow DOM traversal (current selectors may fail on deeply nested player elements).
*   [ ] Full audio track persistence (requires adaptation to dynamic React rendering).

## 🇷🇺 Описание на русском

Пользовательский скрипт для Tampermonkey, улучшающий работу плеера на Кинопоиске.
Основные функции:
*   Сохранение уровня громкости и выбранной аудиодорожки.
*   Управление видимостью кнопок «Пропустить заставку/титры».
*   Изменение поведения меню настроек (открытие по клику вместо наведения).

**Установка:** Установите Tampermonkey, нажмите на ссылку для установки скрипта (см. выше) и подтвердите установку.

## 📄 License

This project is licensed under the MIT License.
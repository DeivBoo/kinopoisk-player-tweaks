# 🎬 Kinopoisk Player Tweaks

A Tampermonkey userscript designed to enhance the viewing experience on Kinopoisk (`hd.kinopoisk.ru`) by remembering user preferences and modifying the player's UI behavior.

## ✨ Features

*   🔊 **Volume Persistence:** Remembers your volume level across sessions and restores it when you return.
*   🗣️ **Audio Track & Subtitle Persistence:** Saves your selected voiceover/language and subtitles per movie/series and applies them automatically.
*   ⏭️ **Independent Skip Controls:** Separate settings for Intros, Credits, and Ads (Auto-skip, View, or Do nothing).
*   📺 **Smart "Next Episode" Handling:** Automatically clicks "Next Episode" if credits auto-skip is enabled and the "Skip" button is absent.
*   🖱️ **Menu Behavior Change:** Replaces the hover-based settings menu with a standard click interaction.
*   🛠️ **Feature Toggles:** Enable or disable volume persistence, track persistence, and menu behavior independently.
*   🖥️ **Fullscreen Support:** All features, including skip controls, work correctly in fullscreen mode.
*   🔄 **SPA-Aware:** Settings are re-applied automatically when switching episodes without page reload.

## 🚀 Installation

1.  Install the **Tampermonkey** extension for your browser ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), etc.).
2.  Click the link below to install the script:
    *   **[Install Kinopoisk Player Tweaks](https://raw.githubusercontent.com/DeivBoo/kinopoisk-player-tweaks/main/kinopoisk-tweaks.user.js)**
3.  Tampermonkey will prompt you to install. Click "Install".
4.  Open any movie or series on Kinopoisk and enjoy!

## 🛠️ Tech Stack & Development

This project was developed using a modern, AI-assisted workflow:
*   **Environment:** WSL 2 (Ubuntu), LM Studio (Bionic AI Agent) + Deepseek.
*   **Testing:** Manual DOM inspection via Chrome DevTools.
*   **Core:** Vanilla JavaScript (ES6+), Tampermonkey API (`GM_setValue`, `GM_getValue`).

## 🗺️ Roadmap / Known Issues

*   [x] Volume persistence.
*   [x] Per-content audio/subtitle persistence.
*   [x] Independent skip controls for Intro/Credits/Ads.
*   [x] Fullscreen mode support.
*   [x] SPA episode switching support.
*   [x] Feature toggles.
*   [x] Accurate ad-skip and "Next Episode" handling.

## 🇷🇺 Описание на русском

Пользовательский скрипт для Tampermonkey, улучшающий работу плеера на Кинопоиске.

Основные функции:
*   Сохранение уровня громкости, выбранной аудиодорожки и субтитров (для каждого фильма/сериала отдельно).
*   Независимое управление кнопками пропуска для заставки, титров и рекламы (авто-пропуск, режим просмотра или ничего не делать).
*   **Умная обработка перехода:** Если в титрах нет кнопки «Пропустить», но есть «Следующая серия», скрипт нажмет её при включенном авто-пропуске.
*   Изменение поведения меню настроек (открытие по клику вместо наведения).
*   Переключатели для каждой функции (можно отключить ненужное).
*   Корректная работа в полноэкранном режиме и при переключении серий без перезагрузки страницы.

**Установка:** Установите Tampermonkey, нажмите на ссылку для установки скрипта (см. выше) и подтвердите установку.

## 📄 License

This project is licensed under the MIT License.
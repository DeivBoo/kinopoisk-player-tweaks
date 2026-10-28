# 🎬 Kinopoisk Player Tweaks

A Tampermonkey userscript designed to enhance the viewing experience on Kinopoisk (`hd.kinopoisk.ru`) by remembering user preferences and modifying the player's UI behavior.

## ✨ Features

*   🔊 **Volume Persistence:** Remembers your volume level across sessions and restores it when you return.
*   🗣️ **Audio Track & Subtitle Persistence:** Saves your selected voiceover/language and subtitles per movie/series and applies them automatically.
*   ⏭️ **Independent Skip Controls:** Separate settings for Intros, Credits, and Ads (Auto-skip, View, or Do nothing).
*   🖱️ **Menu Behavior Change:** Replaces the hover-based settings menu with a standard click interaction.
*   🛠️ **Feature Toggles:** Enable or disable volume persistence, track persistence, and menu behavior independently.

## 🚀 Installation

1.  Install the **Tampermonkey** extension for your browser ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), etc.).
2.  **Method A (Automatic):** Click the link below. If Tampermonkey intercepts it, an installation window will appear automatically.
    *   **[Install Kinopoisk Player Tweaks](https://raw.githubusercontent.com/DeivBoo/kinopoisk-player-tweaks/main/kinopoisk-tweaks.user.js)**
3.  **Method B (Manual - Recommended if Method A fails):**
    *   Click the link above, but if it opens as plain text in your browser, **Right-click** anywhere on the page and select **"Save Page As..."**. Save the file as `kinopoisk-tweaks.user.js`.
    *   Open the **Tampermonkey Dashboard** (click the extension icon -> Dashboard).
    *   Go to the **Utilities** tab.
    *   Under "Import from file", click **"Select file"** and choose the `.user.js` file you just downloaded. *(Alternatively, simply drag and drop the downloaded file directly into the Tampermonkey Dashboard window).*
    *   Click **"Install"** in the window that appears.

## 🛠️ Tech Stack & Development

This project was developed using a modern, AI-assisted workflow:
*   **Environment:** WSL 2 (Ubuntu), LM Studio (Bionic AI Agent) + Deepseek.
*   **Testing:** Manual DOM inspection via Chrome DevTools.
*   **Core:** Vanilla JavaScript (ES6+), Tampermonkey API (`GM_setValue`, `GM_getValue`).

## 🗺️ Roadmap / Known Issues

Nothing for now. You can add your issue or enhancement [here](https://github.com/DeivBoo/kinopoisk-player-tweaks/issues).

## 🇷🇺 Описание на русском

Пользовательский скрипт для Tampermonkey, улучшающий работу плеера на Кинопоиске.

**Основные функции:**
*   Сохранение уровня громкости плеера.
*   Сохранение выбранной аудиодорожки и субтитров (для каждого фильма/сериала отдельно).
*   Независимое управление кнопками пропуска для заставки, титров и рекламы (авто-пропуск, режим просмотра или ничего не делать).
*   Изменение поведения меню настроек (открытие по клику вместо наведения).
*   Переключатели для каждой функции (можно отключить ненужное).

**Установка:** 
1.  Установите расширение **Tampermonkey** для вашего браузера ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) и т.д.).
2.  **Способ А (Автоматический):** Нажмите на ссылку ниже. Если Tampermonkey перехватит её, окно установки появится автоматически.
    *   **[Установить Kinopoisk Player Tweaks](https://raw.githubusercontent.com/DeivBoo/kinopoisk-player-tweaks/main/kinopoisk-tweaks.user.js)**
3.  **Способ Б (Ручной — используйте, если Способ А не сработал):**
    *   Нажмите на ссылку выше. Если браузер открыл код как обычный текст, нажмите **правой кнопкой мыши** в любом месте страницы и выберите **«Сохранить как...»**. Сохраните файл под именем `kinopoisk-tweaks.user.js`.
    *   Откройте **Панель управления Tampermonkey** (нажмите на иконку расширения -> «Панель управления»).
    *   Перейдите на вкладку **«Утилиты»** (Utilities).
    *   В разделе «Импорт из файла» нажмите **«Выбрать файл»** и укажите скачанный файл `.user.js`. *(Альтернативный вариант: просто перетащите скачанный файл мышкой прямо в открытое окно панели Tampermonkey).*
    *   Нажмите **«Установить»** в появившемся окне.

## 📄 License

This project is licensed under the MIT License.

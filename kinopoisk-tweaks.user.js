// ==UserScript==
// @name         Kinopoisk Player Tweaks (v1.9)
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Сохранение громкости и аудиодорожек, скрытие кнопок пропуска, перехват меню.
// @author       DeivBoo
// @match        https://www.kinopoisk.ru/*
// @match        https://hd.kinopoisk.ru/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    console.log('[KP Tweaks] Скрипт v1.9 запущен.');

    const getVal = (key, defaultVal) => {
        try { return typeof GM_getValue === 'function' ? GM_getValue(key, defaultVal) : defaultVal; }
        catch { return defaultVal; }
    };
    const setVal = (key, val) => {
        try { if (typeof GM_setValue === 'function') GM_setValue(key, val); } catch {}
    };

    let config = {
        volume: getVal('volume', 0.5),
        audioTrackLabel: getVal('audioTrackLabel', null), // Храним aria-label (например, "Аудио Японский")
        hideIntro: getVal('hideIntro', true),
        hideCredits: getVal('hideCredits', true)
    };

    const SELECTORS = {
        video: 'video',
        settingsBtn: '[data-test-id="setting-popup-button"]',
        audioBtn: '[aria-label="Аудио и субтитры"]',
        skipBtn: 'button[data-tid="BaseButton"]',
        audioInputs: 'input[type="radio"]' // Наши радиокнопки
    };

    let videoElement = null;
    let restoreAttempts = 0;

    // 3.1 Громкость
    function initVolume(video) {
        if (video.volume !== config.volume) {
            video.volume = config.volume;
        }
        video.addEventListener('volumechange', () => {
            if (video.volume !== config.volume) {
                config.volume = video.volume;
                setVal('volume', config.volume);
            }
        });
    }

    // 3.2 Сохранение аудиодорожки
    function saveAudioTrack(e) {
        // Ищем input, который только что выбрали
        const input = e.target.closest('div[data-test-id="settings-item"]')?.querySelector('input[type="radio"]');

        if (input && input.checked) {
            const label = input.getAttribute('aria-label');
            if (label && config.audioTrackLabel !== label) {
                config.audioTrackLabel = label;
                setVal('audioTrackLabel', label);
                console.log(`[KP Tweaks] Сохранена дорожка: ${label}`);
            }
        }
    }

    // 3.3 Восстановление аудиодорожки (с повторными попытками)
    function restoreAudioTrack() {
        if (!config.audioTrackLabel) return;
        if (restoreAttempts >= 5) {
            console.log('[KP Tweaks] Не удалось восстановить дорожку после 5 попыток.');
            return;
        }

        restoreAttempts++;
        console.log(`[KP Tweaks] Попытка восстановить дорожку (${restoreAttempts}/5): ${config.audioTrackLabel}`);

        const audioBtn = document.querySelector(SELECTORS.audioBtn);
        if (!audioBtn) {
            setTimeout(restoreAudioTrack, 1000); // Кнопки еще нет, ждем
            return;
        }

        audioBtn.click();

        setTimeout(() => {
            const inputs = Array.from(document.querySelectorAll(SELECTORS.audioInputs));
            const targetInput = inputs.find(i => i.getAttribute('aria-label') === config.audioTrackLabel);

            if (targetInput) {
                console.log(`[KP Tweaks] Найдена дорожка, кликаем по input...`);
                targetInput.click();
                // Закрываем меню
                setTimeout(() => audioBtn.click(), 150);
            } else {
                // Если не нашли, возможно меню еще не отрисовалось. Пробуем еще раз.
                setTimeout(restoreAudioTrack, 1000);
            }
        }, 400); // Ждем появления элементов меню
    }

    // 3.4 Перехват меню
    function overrideMenuBehavior() {
        const btn = document.querySelector(SELECTORS.settingsBtn);
        if (btn && !btn.dataset.kpTweaksBound) {
            btn.dataset.kpTweaksBound = 'true';
            btn.addEventListener('mouseenter', (e) => e.stopImmediatePropagation(), true);
            btn.addEventListener('click', () => console.log('[KP Tweaks] Меню открыто кликом.'), true);
        }
    }

    // 3.5 Кнопки пропуска
    function handleSkipButtons() {
        const buttons = document.querySelectorAll(SELECTORS.skipBtn);
        buttons.forEach(btn => {
            const text = btn.innerText.trim();

            // Скрываем все кнопки пропуска (заставка, титры, просто "Пропустить")
            if (text.includes('Пропустить') || text.includes('Смотреть заставку') || text.includes('Смотреть титры')) {
                if (config.hideIntro) { // Используем одну настройку для всех
                    btn.style.display = 'none';
                }
            }
        });
    }

    // ==========================================
    // 4. ИНИЦИАЛИЗАЦИЯ
    // ==========================================

    document.addEventListener('click', saveAudioTrack, true);

    const monitor = setInterval(() => {
        if (!videoElement) {
            videoElement = document.querySelector(SELECTORS.video);
            if (videoElement) {
                console.log('[KP Tweaks] Видео найдено.');
                initVolume(videoElement);
                // Начинаем восстановление через 2 секунды после старта видео
                setTimeout(restoreAudioTrack, 2000);
            }
        }

        overrideMenuBehavior();
        handleSkipButtons();
    }, 1000);

})();
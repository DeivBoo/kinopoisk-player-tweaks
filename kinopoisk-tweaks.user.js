// ==UserScript==
// @name         Kinopoisk Player Tweaks
// @namespace    http://tampermonkey.net/
// @version      2.1.4
// @description  Сохранение настроек и управление меню (Smart Overlay)
// @author       DeivBoo
// @match        https://www.kinopoisk.ru/*
// @match        https://hd.kinopoisk.ru/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    console.log('[KP Tweaks] Скрипт v2.1.4 запущен.');

    const getVal = (key, defaultVal) => {
        try { return typeof GM_getValue === 'function' ? GM_getValue(key, defaultVal) : defaultVal; }
        catch { return defaultVal; }
    };
    const setVal = (key, val) => {
        try { if (typeof GM_setValue === 'function') GM_setValue(key, val); } catch {}
    };

    let config = {
        volume: getVal('volume', 0.5),
        audioTrackLabel: getVal('audioTrackLabel', null),
        hideIntro: getVal('hideIntro', true),
        hideCredits: getVal('hideCredits', true)
    };

    const SELECTORS = {
        video: 'video',
        settingsBtn: '[data-test-id="setting-popup-button"]',
        audioBtn: '[aria-label="Аудио и субтитры"]',
        sendBtn: '[aria-label="Отправить на устройство"], [aria-label="На устройство"]',
        seasonsBtn: '[class*="episodeNavigatorButton"]',
        skipBtn: 'button[data-tid="BaseButton"]',
        audioInputs: 'input[type="radio"]'
    };

    let videoElement = null;
    let restoreAttempts = 0;

    // 1. Громкость
    function initVolume(video) {
        if (video.volume !== config.volume) video.volume = config.volume;
        video.addEventListener('volumechange', () => {
            if (video.volume !== config.volume) {
                config.volume = video.volume;
                setVal('volume', config.volume);
            }
        });
    }

    // 2. Аудио
    function saveAudioTrack(e) {
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

    function restoreAudioTrack() {
        if (!config.audioTrackLabel || restoreAttempts >= 5) return;
        restoreAttempts++;

        const audioBtn = document.querySelector(SELECTORS.audioBtn);
        if (!audioBtn) { setTimeout(restoreAudioTrack, 1000); return; }

        audioBtn.click();
        setTimeout(() => {
            const inputs = Array.from(document.querySelectorAll(SELECTORS.audioInputs));
            const targetInput = inputs.find(i => i.getAttribute('aria-label') === config.audioTrackLabel);
            if (targetInput) {
                targetInput.click();
                setTimeout(() => audioBtn.click(), 150);
            } else {
                setTimeout(restoreAudioTrack, 1000);
            }
        }, 400);
    }

    // 3. Кнопки пропуска
    function handleSkipButtons() {
        const buttons = document.querySelectorAll(SELECTORS.skipBtn);
        buttons.forEach(btn => {
            const text = btn.innerText.trim();
            if (text.includes('Пропустить') || text.includes('Смотреть заставку') || text.includes('Смотреть титры')) {
                if (config.hideIntro) btn.style.display = 'none';
            }
        });
    }

    // ==========================================
    // 4. "УМНЫЙ" ОВЕРЛЕЙ
    // ==========================================
    function createOverlay(btn, id) {
        if (btn.dataset.kpOverlayId) return;
        btn.dataset.kpOverlayId = id;

        const overlay = document.createElement('div');
        overlay.id = `kp-overlay-${id}`;
        overlay.style.position = 'fixed';
        overlay.style.zIndex = '999999';
        overlay.style.cursor = 'pointer';
        overlay.style.background = 'transparent';

        // Блокируем события наведения
        const blockEvent = (e) => {
            e.stopPropagation();
            e.preventDefault();
        };
        overlay.addEventListener('mouseover', blockEvent, true);
        overlay.addEventListener('mouseenter', blockEvent, true);
        overlay.addEventListener('pointerdown', blockEvent, true);
        overlay.addEventListener('mousedown', blockEvent, true);

        // Обработка клика
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`[KP Tweaks] Клик по оверлею ${id}. Вызываем btn.click().`);
            btn.click();
        });

        document.body.appendChild(overlay);

        // Синхронизация позиции и состояния
        setInterval(() => {
            if (!document.body.contains(btn)) {
                overlay.remove();
                return;
            }
            const rect = btn.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.bottom > window.innerHeight) {
                overlay.style.display = 'none';
            } else {
                overlay.style.display = 'block';
                overlay.style.top = rect.top + 'px';
                overlay.style.left = rect.left + 'px';
                overlay.style.width = rect.width + 'px';
                overlay.style.height = rect.height + 'px';

                // ГЛАВНАЯ ФИШКА:
                // Если меню открыто (aria-expanded="true"), мы "пропускаем" клики сквозь оверлей.
                // Тогда второй клик попадает прямо в кнопку, и она нормально закрывает меню.
                if (btn.getAttribute('aria-expanded') === 'true') {
                    overlay.style.pointerEvents = 'none';
                } else {
                    overlay.style.pointerEvents = 'auto';
                }
            }
        }, 100);
    }

    // ==========================================
    // 5. ИНИЦИАЛИЗАЦИЯ
    // ==========================================

    document.addEventListener('click', saveAudioTrack, true);

    const monitor = setInterval(() => {
        if (!videoElement) {
            videoElement = document.querySelector(SELECTORS.video);
            if (videoElement) {
                console.log('[KP Tweaks] Видео найдено.');
                initVolume(videoElement);
                setTimeout(restoreAudioTrack, 2000);
            }
        }
        handleSkipButtons();

        const settingsBtn = document.querySelector(SELECTORS.settingsBtn);
        if (settingsBtn) createOverlay(settingsBtn, 'settings');

        const audioBtn = document.querySelector(SELECTORS.audioBtn);
        if (audioBtn) createOverlay(audioBtn, 'audio');

        const seasonsBtn = document.querySelector(SELECTORS.seasonsBtn);
        if (seasonsBtn) createOverlay(seasonsBtn, 'seasons');

        const sendBtn = document.querySelector(SELECTORS.sendBtn);
        if (sendBtn) createOverlay(sendBtn, 'send');

    }, 1000);

})();
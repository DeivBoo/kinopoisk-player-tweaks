// ==UserScript==
// @name         Kinopoisk Player Tweaks
// @namespace    http://tampermonkey.net/
// @version      2.2.0
// @description  Сохранение настроек и управление меню (Stable Restore)
// @author       DeivBoo
// @match        https://www.kinopoisk.ru/*
// @match        https://hd.kinopoisk.ru/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    console.log('[KP Tweaks] Скрипт v2.2.0 запущен.');

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
        subtitleLabel: getVal('subtitleLabel', null),
        hideIntro: getVal('hideIntro', true),
        hideCredits: getVal('hideCredits', true)
    };

    // Миграция данных
    if (config.audioTrackLabel && !config.audioTrackLabel.startsWith('Аудио')) {
        if (config.audioTrackLabel.startsWith('Субтитры')) {
            config.subtitleLabel = config.audioTrackLabel;
            setVal('subtitleLabel', config.audioTrackLabel);
        }
        config.audioTrackLabel = null;
        setVal('audioTrackLabel', null);
    }

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
    let isRestoring = false; // Защита от двойного запуска

    function initVolume(video) {
        if (video.volume !== config.volume) video.volume = config.volume;
        video.addEventListener('volumechange', () => {
            if (video.volume !== config.volume) {
                config.volume = video.volume;
                setVal('volume', config.volume);
            }
        });
    }

    function saveTracks(e) {
        const input = e.target.closest('div[data-test-id="settings-item"]')?.querySelector('input[type="radio"]');
        if (input && input.checked) {
            const label = input.getAttribute('aria-label');
            if (!label) return;

            if (label.startsWith('Аудио')) {
                if (config.audioTrackLabel !== label) {
                    config.audioTrackLabel = label;
                    setVal('audioTrackLabel', label);
                    console.log(`[KP Tweaks] Сохранено аудио: ${label}`);
                }
            } else if (label.startsWith('Субтитры')) {
                if (config.subtitleLabel !== label) {
                    config.subtitleLabel = label;
                    setVal('subtitleLabel', label);
                    console.log(`[KP Tweaks] Сохранены субтитры: ${label}`);
                }
            }
        }
    }

    function restoreTracks() {
        if (isRestoring || restoreAttempts >= 5) return;
        if (!config.audioTrackLabel && !config.subtitleLabel) return;

        isRestoring = true;
        restoreAttempts++;

        const audioBtn = document.querySelector(SELECTORS.audioBtn);
        if (!audioBtn) {
            isRestoring = false;
            setTimeout(restoreTracks, 1000);
            return;
        }

        console.log('[KP Tweaks] Начинаем восстановление. Меню закрыто?', audioBtn.getAttribute('aria-expanded') === 'false');

        // Ждем немного, чтобы интерфейс точно прогрузился
        setTimeout(() => {
            const btn = document.querySelector(SELECTORS.audioBtn);
            // Открываем меню только если оно закрыто
            if (btn && btn.getAttribute('aria-expanded') !== 'true') {
                btn.click();
            }

            // Ждем открытия меню
            setTimeout(() => {
                // 1. ВЫСТАВЛЯЕМ АУДИО
                if (config.audioTrackLabel) {
                    const inputs = Array.from(document.querySelectorAll(SELECTORS.audioInputs));
                    const target = inputs.find(i => i.getAttribute('aria-label') === config.audioTrackLabel);
                    if (target && !target.checked) {
                        console.log(`[KP Tweaks] Устанавливаем аудио: ${config.audioTrackLabel}`);
                        target.click();
                    }
                }

                // Пауза, чтобы плеер переварил аудио
                setTimeout(() => {
                    // 2. ВЫСТАВЛЯЕМ СУБТИТРЫ
                    if (config.subtitleLabel) {
                        const inputs = Array.from(document.querySelectorAll(SELECTORS.audioInputs));
                        const target = inputs.find(i => i.getAttribute('aria-label') === config.subtitleLabel);
                        if (target) {
                            console.log(`[KP Tweaks] Принудительно устанавливаем субтитры: ${config.subtitleLabel}`);
                            target.click();
                        }
                    }

                    // 3. ЗАКРЫВАЕМ МЕНЮ
                    setTimeout(() => {
                        const btn = document.querySelector(SELECTORS.audioBtn);
                        if (btn && btn.getAttribute('aria-expanded') === 'true') {
                            btn.click();
                        }
                        isRestoring = false; // Разрешаем будущие запуски, если нужно
                        console.log('[KP Tweaks] Восстановление завершено.');
                    }, 300);

                }, 500);
            }, 400);
        }, 500); // Задержка перед стартом, чтобы React успокоился
    }

    function handleSkipButtons() {
        const buttons = document.querySelectorAll(SELECTORS.skipBtn);
        buttons.forEach(btn => {
            const text = btn.innerText.trim();
            if (text.includes('Пропустить') || text.includes('Смотреть заставку') || text.includes('Смотреть титры')) {
                if (config.hideIntro) btn.style.display = 'none';
            }
        });
    }

    function createOverlay(btn, id) {
        if (document.getElementById(`kp-overlay-${id}`)) return;

        const overlay = document.createElement('div');
        overlay.id = `kp-overlay-${id}`;
        overlay.style.position = 'fixed';
        overlay.style.zIndex = '999999';
        overlay.style.cursor = 'pointer';
        overlay.style.background = 'transparent';

        const blockEvent = (e) => { e.stopPropagation(); e.preventDefault(); };
        overlay.addEventListener('mouseover', blockEvent, true);
        overlay.addEventListener('mouseenter', blockEvent, true);
        overlay.addEventListener('pointerdown', blockEvent, true);
        overlay.addEventListener('mousedown', blockEvent, true);

        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.click();
        });

        document.body.appendChild(overlay);

        setInterval(() => {
            if (!document.body.contains(btn)) { overlay.remove(); return; }
            const rect = btn.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.bottom > window.innerHeight) {
                overlay.style.display = 'none';
            } else {
                overlay.style.display = 'block';
                overlay.style.top = rect.top + 'px';
                overlay.style.left = rect.left + 'px';
                overlay.style.width = rect.width + 'px';
                overlay.style.height = rect.height + 'px';

                // Умное поведение (не пропускает клики)
                if (btn.getAttribute('aria-expanded') === 'true') {
                    overlay.style.pointerEvents = 'none';
                } else {
                    overlay.style.pointerEvents = 'auto';
                }
            }
        }, 100);
    }

    document.addEventListener('click', saveTracks, true);

    const monitor = setInterval(() => {
        if (!videoElement) {
            videoElement = document.querySelector(SELECTORS.video);
            if (videoElement) {
                console.log('[KP Tweaks] Видео найдено.');
                initVolume(videoElement);
                setTimeout(restoreTracks, 700); // Даем плееру время на полную инициализацию
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
// ==UserScript==
// @name         Kinopoisk Player Tweaks
// @namespace    http://tampermonkey.net/
// @version      2.2.8
// @description  Сохранение настроек и управление меню (Fixed URL parsing)
// @author       DeivBoo
// @match        https://hd.kinopoisk.ru/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // ⚙️ НАСТРОЙКИ (Редактируйте под себя)
    // ==========================================
    const USER_CONFIG = {
        // Стандартная громкость (от 0 до 100).
        defaultVolume: 100,

        // Управление кнопками пропуска:
        // 1 - Авто-пропуск (клик по "Пропустить", скрытие "Смотреть заставку/титры")
        // 2 - Режим просмотра (клик по "Смотреть заставку/титры" для остановки таймера, скрытие "Пропустить")
        // 3 - Ничего не скрывать и не нажимать
        autoSkip: 2,
    };
    // ==========================================

    console.log('[KP Tweaks] Скрипт v2.2.8 запущен.');

    const getVal = (key, defaultVal) => {
        try { return typeof GM_getValue === 'function' ? GM_getValue(key, defaultVal) : defaultVal; }
        catch { return defaultVal; }
    };
    const setVal = (key, val) => {
        try { if (typeof GM_setValue === 'function') GM_setValue(key, val); } catch {}
    };

    // ==========================================
    // КОНТЕНТ-СПЕЦИФИЧНЫЕ НАСТРОЙКИ
    // ==========================================
    function getContentId() {
        // 1. Проверяем наличие параметра 'rt' (он появляется при переходе с чужой промо-страницы)
        const params = new URLSearchParams(window.location.search);
        const rt = params.get('rt');
        if (rt) return rt;

        // 2. Если 'rt' нет, берем ID из пути (для своей промо-страницы)
        const match = window.location.pathname.match(/\/(?:film|series)\/([a-f0-9]+)/i);
        return match ? match[1] : 'default';
    }

    const defaultVolumeNormalized = USER_CONFIG.defaultVolume / 100;

    // Одноразовая миграция старых глобальных ключей в per-content формат
    (function migrateLegacy() {
        const contentId = getContentId();
        if (contentId === 'default') return;

        const legacyAudio = getVal('audioTrackLabel', null);
        const legacySub = getVal('subtitleLabel', null);

        if (legacyAudio && legacyAudio.startsWith('Аудио')) {
            setVal(`audioTrackLabel_${contentId}`, legacyAudio);
            setVal('audioTrackLabel', null);
            console.log(`[KP Tweaks] Миграция аудио -> ${contentId}`);
        }
        if (legacySub && legacySub.startsWith('Субтитры')) {
            setVal(`subtitleLabel_${contentId}`, legacySub);
            setVal('subtitleLabel', null);
            console.log(`[KP Tweaks] Миграция субтитров -> ${contentId}`);
        }
    })();

    let config = {
        volume: getVal('volume', defaultVolumeNormalized), // Громкость — глобальная
        audioTrackLabel: getVal(`audioTrackLabel_${getContentId()}`, null), // Аудио — per-content
        subtitleLabel: getVal(`subtitleLabel_${getContentId()}`, null)      // Субтитры — per-content
    };

    if (config.volume > 1) config.volume = config.volume / 100;

    function loadContentConfig() {
        const contentId = getContentId();
        config.audioTrackLabel = getVal(`audioTrackLabel_${contentId}`, null);
        config.subtitleLabel = getVal(`subtitleLabel_${contentId}`, null);
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
    let isRestoring = false;
    let lastContentId = getContentId();

    function initVolume(video) {
        if (video.dataset.kpTweaksVolumeInit) return;
        video.dataset.kpTweaksVolumeInit = 'true';

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
            const contentId = getContentId();

            if (label.startsWith('Аудио')) {
                if (config.audioTrackLabel !== label) {
                    config.audioTrackLabel = label;
                    setVal(`audioTrackLabel_${contentId}`, label);
                    console.log(`[KP Tweaks] Сохранено аудио [${contentId}]: ${label}`);
                }
            } else if (label.startsWith('Субтитры')) {
                if (config.subtitleLabel !== label) {
                    config.subtitleLabel = label;
                    setVal(`subtitleLabel_${contentId}`, label);
                    console.log(`[KP Tweaks] Сохранены субтитры [${contentId}]: ${label}`);
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

        console.log('[KP Tweaks] Начинаем восстановление.');

        setTimeout(() => {
            const btn = document.querySelector(SELECTORS.audioBtn);
            if (btn && btn.getAttribute('aria-expanded') !== 'true') {
                btn.click();
            }

            setTimeout(() => {
                if (config.audioTrackLabel) {
                    const inputs = Array.from(document.querySelectorAll(SELECTORS.audioInputs));
                    const target = inputs.find(i => i.getAttribute('aria-label') === config.audioTrackLabel);
                    if (target && !target.checked) {
                        console.log(`[KP Tweaks] Устанавливаем аудио: ${config.audioTrackLabel}`);
                        target.click();
                    }
                }

                setTimeout(() => {
                    if (config.subtitleLabel) {
                        const inputs = Array.from(document.querySelectorAll(SELECTORS.audioInputs));
                        const target = inputs.find(i => i.getAttribute('aria-label') === config.subtitleLabel);
                        if (target) {
                            console.log(`[KP Tweaks] Принудительно устанавливаем субтитры: ${config.subtitleLabel}`);
                            target.click();
                        }
                    }

                    setTimeout(() => {
                        const btn = document.querySelector(SELECTORS.audioBtn);
                        if (btn && btn.getAttribute('aria-expanded') === 'true') {
                            btn.click();
                        }
                        isRestoring = false;
                        console.log('[KP Tweaks] Восстановление завершено.');
                    }, 300);

                }, 500);
            }, 400);
        }, 500);
    }

    // ==========================================
    // ЛОГИКА КНОПОК ПРОПУСКА
    // ==========================================
    function handleSkipButtons() {
        const buttons = document.querySelectorAll(SELECTORS.skipBtn);
        buttons.forEach(btn => {
            const text = btn.innerText.trim();

            const isWatch = text.includes('Смотреть заставку') || text.includes('Смотреть титры');
            const isSkip = text.includes('Пропустить');

            if (USER_CONFIG.autoSkip === 3) {
                btn.style.display = '';
                return;
            }

            if (USER_CONFIG.autoSkip === 1) {
                if (isSkip) {
                    if (!btn.dataset.kpTweaksClicked) {
                        btn.dataset.kpTweaksClicked = 'true';
                        console.log(`[KP Tweaks] Авто-пропуск: ${text}`);
                        btn.click();
                    }
                } else if (isWatch) {
                    btn.style.display = 'none';
                }
            } else if (USER_CONFIG.autoSkip === 2) {
                if (isWatch) {
                    if (!btn.dataset.kpTweaksClicked) {
                        btn.dataset.kpTweaksClicked = 'true';
                        console.log(`[KP Tweaks] Режим просмотра: нажимаем "${text}" для остановки таймера`);
                        btn.click();
                    }
                    btn.style.display = 'none';
                } else if (isSkip) {
                    btn.style.display = 'none';
                }
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
        // ДЕТЕКТОР SPA-НАВИГАЦИИ
        const nowContentId = getContentId();
        if (nowContentId !== lastContentId) {
            console.log(`[KP Tweaks] Смена контента: ${lastContentId} -> ${nowContentId}`);
            lastContentId = nowContentId;

            // Загружаем настройки для нового контента
            loadContentConfig();

            // Сбрасываем состояние восстановления
            videoElement = null;
            restoreAttempts = 0;
            isRestoring = false;

            // Удаляем старые оверлеи (они привязаны к устаревшим кнопкам)
            document.querySelectorAll('[id^="kp-overlay-"]').forEach(el => el.remove());
        }

        if (!videoElement) {
            videoElement = document.querySelector(SELECTORS.video);
            if (videoElement) {
                console.log('[KP Tweaks] Видео найдено.');
                initVolume(videoElement);
                setTimeout(restoreTracks, 700);
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
    }, 500);

})();
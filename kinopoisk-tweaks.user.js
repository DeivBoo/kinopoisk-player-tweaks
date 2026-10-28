// ==UserScript==
// @name         Kinopoisk Player Tweaks
// @namespace    https://github.com/DeivBoo/kinopoisk-player-tweaks
// @version      1.0.2
// @description  Улучшение плеера Кинопоиска: сохранение состояния громкости, субтитров и аудиодорожек, управление кнопками пропуска и меню настроек.
// @author       DeivBoo
// @match        https://hd.kinopoisk.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kinopoisk.ru
// @grant        GM_setValue
// @grant        GM_getValue
// @downloadURL  https://raw.githubusercontent.com/DeivBoo/kinopoisk-player-tweaks/main/kinopoisk-tweaks.user.js
// @updateURL    https://raw.githubusercontent.com/DeivBoo/kinopoisk-player-tweaks/main/kinopoisk-tweaks.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // ⚙️ НАСТРОЙКИ (Редактируйте под себя)
    // ==========================================
    const USER_CONFIG = {
        // --- Переключатели функций (true - вкл, false - выкл) ---
        enableVolumePersistence: true,
        enableTrackPersistence: true,
        enableHoverToClick: true,

        // --- Дополнительные настройки ---

        // Стандартная громкость (от 0 до 100).
        defaultVolume: 100,

        // Управление заставкой (вступлением):
        // 1 - Авто-пропуск (клик "Пропустить", скрытие "Смотреть заставку")
        // 2 - Режим просмотра (клик "Смотреть заставку", скрытие "Пропустить")
        // 3 - Ничего не скрывать и не нажимать
        skipIntroAction: 2,

        // Управление титрами:
        // 1 - Авто-пропуск (клик "Пропустить" или "Следующая серия", скрытие "Смотреть титры")
        // 2 - Режим просмотра (клик "Смотреть титры", скрытие "Пропустить")
        // 3 - Ничего не скрывать и не нажимать
        skipCreditsAction: 2,

        // Управление рекламой (перед видео):
        // 1 - Авто-пропуск (клик "Пропустить", скрытие "Буду смотреть")
        // 2 - Ничего не делать (кнопки остаются как есть)
        skipAdAction: 1,
    };
    // ==========================================

    console.log('[KP Tweaks] Скрипт v1.0.2 запущен.');

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
        const params = new URLSearchParams(window.location.search);
        const rt = params.get('rt');
        if (rt) return rt;

        const match = window.location.pathname.match(/\/(?:film|series)\/([a-f0-9]+)/i);
        return match ? match[1] : 'default';
    }

    const defaultVolumeNormalized = USER_CONFIG.defaultVolume / 100;

    (function migrateLegacy() {
        const contentId = getContentId();
        if (contentId === 'default') return;

        const legacyAudio = getVal('audioTrackLabel', null);
        const legacySub = getVal('subtitleLabel', null);

        if (legacyAudio && legacyAudio.startsWith('Аудио')) {
            setVal(`audioTrackLabel_${contentId}`, legacyAudio);
            setVal('audioTrackLabel', null);
        }
        if (legacySub && legacySub.startsWith('Субтитры')) {
            setVal(`subtitleLabel_${contentId}`, legacySub);
            setVal('subtitleLabel', null);
        }
    })();

    let config = {
        volume: getVal('volume', defaultVolumeNormalized),
        audioTrackLabel: getVal(`audioTrackLabel_${getContentId()}`, null),
        subtitleLabel: getVal(`subtitleLabel_${getContentId()}`, null)
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
        audioInputs: 'input[type="radio"]',
        adContainer: '[data-tid="MoviePrerollView"]' // Новый селектор для рекламы
    };

    let videoElement = null;
    let restoreAttempts = 0;
    let isRestoring = false;
    let lastContentId = getContentId();

    function initVolume(video) {
        if (!USER_CONFIG.enableVolumePersistence) return;
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
        if (!USER_CONFIG.enableTrackPersistence) return;

        const input = e.target.closest('div[data-test-id="settings-item"]')?.querySelector('input[type="radio"]');
        if (input && input.checked) {
            const label = input.getAttribute('aria-label');
            if (!label) return;
            const contentId = getContentId();

            if (label.startsWith('Аудио')) {
                if (config.audioTrackLabel !== label) {
                    config.audioTrackLabel = label;
                    setVal(`audioTrackLabel_${contentId}`, label);
                }
            } else if (label.startsWith('Субтитры')) {
                if (config.subtitleLabel !== label) {
                    config.subtitleLabel = label;
                    setVal(`subtitleLabel_${contentId}`, label);
                }
            }
        }
    }

    function restoreTracks() {
        if (!USER_CONFIG.enableTrackPersistence) return;
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

        setTimeout(() => {
            const btn = document.querySelector(SELECTORS.audioBtn);
            if (btn && btn.getAttribute('aria-expanded') !== 'true') {
                btn.click();
            }

            setTimeout(() => {
                if (config.audioTrackLabel) {
                    const inputs = Array.from(document.querySelectorAll(SELECTORS.audioInputs));
                    const target = inputs.find(i => i.getAttribute('aria-label') === config.audioTrackLabel);
                    if (target && !target.checked) target.click();
                }

                setTimeout(() => {
                    if (config.subtitleLabel) {
                        const inputs = Array.from(document.querySelectorAll(SELECTORS.audioInputs));
                        const target = inputs.find(i => i.getAttribute('aria-label') === config.subtitleLabel);
                        if (target) target.click();
                    }

                    setTimeout(() => {
                        const btn = document.querySelector(SELECTORS.audioBtn);
                        if (btn && btn.getAttribute('aria-expanded') === 'true') {
                            btn.click();
                        }
                        isRestoring = false;
                    }, 300);
                }, 500);
            }, 400);
        }, 500);
    }

    // ==========================================
    // ЛОГИКА КНОПОК ПРОПУСКА
    // ==========================================

    function applySkipLogic(action, mainSkipBtn, watchBtn, alternativeSkipBtn = null) {
        if (action === 3) { // Ничего не делать
            if (mainSkipBtn) mainSkipBtn.style.removeProperty('display');
            if (watchBtn) watchBtn.style.removeProperty('display');
            if (alternativeSkipBtn) alternativeSkipBtn.style.removeProperty('display');
            return;
        }

        if (action === 1) { // Авто-пропуск
            if (watchBtn) watchBtn.style.setProperty('display', 'none', 'important');
            
            if (mainSkipBtn) {
                mainSkipBtn.style.setProperty('display', 'none', 'important');
                if (!mainSkipBtn.dataset.kpTweaksClicked) {
                    mainSkipBtn.dataset.kpTweaksClicked = 'true';
                    console.log(`[KP Tweaks] Авто-пропуск: ${mainSkipBtn.innerText}`);
                    mainSkipBtn.click();
                }
            } else if (alternativeSkipBtn) {
                // Если кнопки "Пропустить" нет, но есть "Следующая серия"
                if (!alternativeSkipBtn.dataset.kpTweaksClicked) {
                    alternativeSkipBtn.dataset.kpTweaksClicked = 'true';
                    console.log(`[KP Tweaks] Авто-переход: ${alternativeSkipBtn.innerText}`);
                    alternativeSkipBtn.click();
                }
            }
        } else if (action === 2) { // Режим просмотра
            if (mainSkipBtn) mainSkipBtn.style.setProperty('display', 'none', 'important');
            if (watchBtn) {
                watchBtn.style.setProperty('display', 'none', 'important');
                if (!watchBtn.dataset.kpTweaksClicked) {
                    watchBtn.dataset.kpTweaksClicked = 'true';
                    console.log(`[KP Tweaks] Режим просмотра: ${watchBtn.innerText}`);
                    watchBtn.click();
                }
            }
        }
    }

    function handleSkipButtons() {
        const allButtons = Array.from(document.querySelectorAll(SELECTORS.skipBtn));

        // Находим все возможные кнопки
        const skipBtn = allButtons.find(b => b.innerText.trim() === 'Пропустить');
        const introWatchBtn = allButtons.find(b => b.innerText.includes('Смотреть заставку'));
        const creditsWatchBtn = allButtons.find(b => b.innerText.includes('Смотреть титры'));
        const adWatchBtn = allButtons.find(b => b.innerText.includes('Буду смотреть'));
        const nextEpisodeBtn = allButtons.find(b => b.innerText.includes('Следующая серия'));

        // 1. Логика для РЕКЛАМЫ (Приоритет №1, если найден контейнер рекламы)
        const adContainer = document.querySelector(SELECTORS.adContainer);
        if (adContainer) {
            if (USER_CONFIG.skipAdAction === 1) {
                if (skipBtn) {
                    skipBtn.style.setProperty('display', 'none', 'important');
                    if (!skipBtn.dataset.kpTweaksClicked) {
                        skipBtn.dataset.kpTweaksClicked = 'true';
                        console.log(`[KP Tweaks] Авто-пропуск рекламы`);
                        skipBtn.click();
                    }
                }
                if (adWatchBtn) {
                    adWatchBtn.style.setProperty('display', 'none', 'important');
                }
            }
            return; // Выходим, так как это реклама. Остальные проверки не нужны.
        }

        // 2. Логика для ЗАСТАВКИ
        if (introWatchBtn || (skipBtn && skipBtn.parentElement.innerText.includes('заставку'))) {
            applySkipLogic(USER_CONFIG.skipIntroAction, skipBtn, introWatchBtn);
        }
        // 3. Логика для ТИТРОВ (с проверкой на "Следующая серия")
        else if (creditsWatchBtn || (skipBtn && skipBtn.parentElement.innerText.includes('титры'))) {
            applySkipLogic(USER_CONFIG.skipCreditsAction, skipBtn, creditsWatchBtn, nextEpisodeBtn);
        }
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

        const parent = document.fullscreenElement || document.body;
        parent.appendChild(overlay);

        setInterval(() => {
            if (!document.body.contains(btn) && !(document.fullscreenElement && document.fullscreenElement.contains(btn))) {
                overlay.remove();
                return;
            }

            const currentParent = document.fullscreenElement || document.body;
            if (overlay.parentNode !== currentParent) {
                currentParent.appendChild(overlay);
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

                if (btn.getAttribute('aria-expanded') === 'true') {
                    overlay.style.pointerEvents = 'none';
                } else {
                    overlay.style.pointerEvents = 'auto';
                }
            }
        }, 100);
    }

    document.addEventListener('click', saveTracks, true);

    document.addEventListener('fullscreenchange', () => {
        console.log(`[KP Tweaks] Fullscreen mode: ${!!document.fullscreenElement ? 'ON' : 'OFF'}`);
        document.querySelectorAll('[id^="kp-overlay-"]').forEach(el => el.remove());
        setTimeout(handleSkipButtons, 100);
    });

    const monitor = setInterval(() => {
        const nowContentId = getContentId();
        if (nowContentId !== lastContentId) {
            lastContentId = nowContentId;
            loadContentConfig();
            videoElement = null;
            restoreAttempts = 0;
            isRestoring = false;
            document.querySelectorAll('[id^="kp-overlay-"]').forEach(el => el.remove());
        }

        if (!videoElement) {
            videoElement = document.querySelector(SELECTORS.video);
            if (videoElement) {
                initVolume(videoElement);
                videoElement.dataset.kpTweaksCurrentSrc = videoElement.src || videoElement.currentSrc || '';
                setTimeout(restoreTracks, 700);
            }
        } else {
            const currentSrc = videoElement.src || videoElement.currentSrc || '';
            if (currentSrc && videoElement.dataset.kpTweaksCurrentSrc !== currentSrc) {
                videoElement.dataset.kpTweaksCurrentSrc = currentSrc;
                restoreAttempts = 0;
                isRestoring = false;
                setTimeout(restoreTracks, 1000);
            }
        }

        handleSkipButtons();

        if (USER_CONFIG.enableHoverToClick) {
            const settingsBtn = document.querySelector(SELECTORS.settingsBtn);
            if (settingsBtn) createOverlay(settingsBtn, 'settings');

            const audioBtn = document.querySelector(SELECTORS.audioBtn);
            if (audioBtn) createOverlay(audioBtn, 'audio');

            const seasonsBtn = document.querySelector(SELECTORS.seasonsBtn);
            if (seasonsBtn) createOverlay(seasonsBtn, 'seasons');

            const sendBtn = document.querySelector(SELECTORS.sendBtn);
            if (sendBtn) createOverlay(sendBtn, 'send');
        }
    }, 500);

})();
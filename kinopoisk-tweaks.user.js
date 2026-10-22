// ==UserScript==
// @name         Kinopoisk Player Tweaks (HD)
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Улучшение плеера Кинопоиска (HD): сохранение громкости, дорожек, управление меню.
// @author       DeivBoo
// @match        https://www.kinopoisk.ru/*
// @match        https://hd.kinopoisk.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kinopoisk.ru
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    /**
     * Конфигурация селекторов (адаптировано под HD плеер)
     */
    const SELECTORS = {
        player: 'video',
        volumeSlider: '.player_volume_slider, [role="slider"], input[type="range"]', 
        audioTracks: '[data-track-id], .track_item, .audio_track_selector, .track-button',           // Селекторы для дорожек
        subtitles: '[data-subtitle-id], .subtitle_item, .subtitle_selector, .subtitle-button',       // Селекторы для субтитров
        skipIntroBtn: '.btn_skip_intro, [data-action="skip-intro"], .skip-intro, .skip_intro_button', 
        skipCreditsBtn: '.btn_skip_credits, [data-action="skip-credits"], .skip-credits, .skip_credits_button',
        settingsIcon: '.player_settings_icon, .player_settings_btn, .settings_button, .player_settings' // Иконка настроек
    };

    /**
     * Конфигурация по умолчанию
     */
    const DEFAULT_CONFIG = {
        volume: 0.5,
        audioTrackId: null,
        subtitlesEnabled: false,
        soundEffectsEnabled: true,
        skipIntroBtnVisible: true,
        skipCreditsBtnVisible: true,
        lastContentId: null,
        lastContentType: null // 'movie', 'series_episode'
    };

    let config = {};

    /**
     * Загрузка настроек из хранилища GM
     */
    function loadConfig() {
        const saved = GM_getValue('kp_tweaks_config', {});
        config = { ...DEFAULT_CONFIG, ...saved };
        console.log('[KP Tweaks] Конфигурация загружена:', config);
    }

    /**
     * Сохранение настроек в хранилище GM
     */
    function saveConfig() {
        GM_setValue('kp_tweaks_config', config);
        console.log('[KP Tweaks] Конфигурация сохранена.');
    }

    /**
     * Получение информации о текущем контенте из URL (поддерживает hd.kinopoisk.ru)
     */
    function getCurrentContentInfo() {
        const url = window.location.href;
        let contentId = null;
        let contentType = null;

        if (url.includes('/movie/')) {
            contentType = 'movie';
            const match = url.match(/\/movie\/(\d+)/);
            contentId = match ? match[1] : null;
        } else if (url.includes('/series/') && url.includes('/episodes/')) {
            contentType = 'series_episode';
            const match = url.match(/\/episodes\/(\d+)/);
            contentId = match ? match[1] : null;
        }

        return { contentId, contentType };
    }

    /**
     * Проверка контекста: применяем ли мы сохраненные настройки?
     */
    function shouldApplySavedSettings() {
        const current = getCurrentContentInfo();
        if (!current.contentId) return false;

        const isSameMovie = current.contentType === 'movie' && config.lastContentType === 'movie' && current.contentId === config.lastContentId;
        const isSameSeries = current.contentType === 'series_episode' && config.lastContentType === 'series_episode'; 

        if (isSameMovie || isSameSeries) {
            config.lastContentId = current.contentId;
            config.lastContentType = current.contentType;
            return true;
        } else {
            // Новый контент - сброс к дефолтам для звука и кнопок пропуска
            config.volume = DEFAULT_CONFIG.volume;
            config.skipIntroBtnVisible = DEFAULT_CONFIG.skipIntroBtnVisible;
            config.skipCreditsBtnVisible = DEFAULT_CONFIG.skipCreditsBtnVisible;
            saveConfig();
            return false;
        }
    }

    /**
     * Применение настроек к плееру
     */
    function applyPlayerSettings(player) {
        if (!shouldApplySavedSettings()) return;

        // 1. Громкость
        const volumeSlider = document.querySelector(SELECTORS.volumeSlider);
        if (volumeSlider && config.volume !== undefined && player.volume !== config.volume) {
            player.volume = config.volume;
            if (volumeSlider.type === 'range') {
                volumeSlider.value = config.volume;
            }
        }

        // 2. Кнопки пропуска
        const skipIntroBtn = document.querySelector(SELECTORS.skipIntroBtn);
        if (skipIntroBtn) {
            skipIntroBtn.style.display = config.skipIntroBtnVisible ? 'block' : 'none';
        }

        const skipCreditsBtn = document.querySelector(SELECTORS.skipCreditsBtn);
        if (skipCreditsBtn) {
            skipCreditsBtn.style.display = config.skipCreditsBtnVisible ? 'block' : 'none';
        }

        console.log('[KP Tweaks] Настройки применены к плееру.');
    }

    /**
     * Инициализация скрипта
     */
    function init() {
        loadConfig();
        setupObservers();
        createSettingsMenu();
        handleSettingsIconClick();
        console.log('[KP Tweaks] Скрипт инициализирован.');
    }

    /**
     * Обработка клика по иконке настроек вместо наведения
     */
    function handleSettingsIconClick() {
        const icon = document.querySelector(SELECTORS.settingsIcon);
        if (icon) {
            icon.style.cursor = 'pointer';
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[KP Tweaks] Настройки открыты по клику');
                // Здесь можно добавить логику открытия нашего меню или специфических действий
            });
        }
    }

    /**
     * Настройка MutationObserver для отслеживания появления плеера и элементов управления
     */
    function setupObservers() {
        const observer = new MutationObserver((mutations) => {
            const player = document.querySelector(SELECTORS.player);
            if (player && !player.dataset.kpTweaksApplied) {
                applyPlayerSettings(player);
                player.dataset.kpTweaksApplied = 'true';
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const videoElement = document.querySelector(SELECTORS.player);
        if (videoElement) {
            videoElement.addEventListener('volumechange', () => {
                config.volume = videoElement.volume;
                saveConfig();
            });
        }

        // Слушаем клики по потенциальным селекторам аудиодорожек и субтитров для сохранения выбора
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Проверка на аудиодорожки
            if (target.closest(SELECTORS.audioTracks)) {
                const trackId = target.getAttribute('data-track-id') || target.innerText.trim();
                if (trackId) {
                    config.audioTrackId = trackId;
                    saveConfig();
                    console.log('[KP Tweaks] Сохранена аудиодорожка:', config.audioTrackId);
                }
            }

            // Проверка на субтитры
            if (target.closest(SELECTORS.subtitles)) {
                const subId = target.getAttribute('data-subtitle-id') || target.innerText.trim();
                if (subId) {
                    config.subtitlesEnabled = !!subId; 
                    saveConfig();
                    console.log('[KP Tweaks] Сохраны настройки субтитров');
                }
            }
        });
    }

    /**
     * Создание меню настроек расширения
     */
    function createSettingsMenu() {
        const menu = document.createElement('div');
        menu.id = 'kp-tweaks-menu';
        menu.innerHTML = `
            <style>
                #kp-tweaks-menu {
                    position: fixed;
                    top: 50px;
                    right: 20px;
                    z-index: 9999;
                    background: #1a1a1a;
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #333;
                    font-family: sans-serif;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                }
                #kp-tweaks-menu h3 { margin: 0 0 10px 0; font-size: 16px; }
                .kp-setting-item { margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
                .kp-setting-item label { cursor: pointer; }
            </style>
            <h3 style="margin-bottom:10px;">Настройки KP Tweaks</h3>
            <div class="kp-setting-item">
                <label>Громкость</label>
                <input type="range" id="kp-volume" min="0" max="1" step="0.05" value="${config.volume}">
            </div>
            <div class="kp-setting-item">
                <label>Показывать кнопки пропуска</label>
                <input type="checkbox" id="kp-skip-visible" ${config.skipIntroBtnVisible ? 'checked' : ''}>
            </div>
            <div class="kp-setting-item">
                <label>Субтитры включены</label>
                <input type="checkbox" id="kp-subtitles" ${config.subtitlesEnabled ? 'checked' : ''}>
            </div>
            <div class="kp-setting-item">
                <label>Последняя дорожка ID</label>
                <span id="kp-audio-id">${config.audioTrackId || 'Не выбрана'}</span>
            </div>
            <button id="kp-save-btn" style="margin-top: 10px; width: 100%; cursor: pointer;">Сохранить</button>
        `;

        document.body.appendChild(menu);

        const volumeSlider = menu.querySelector('#kp-volume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                config.volume = parseFloat(e.target.value);
            });
        }

        const skipCheckbox = menu.querySelector('#kp-skip-visible');
        if (skipCheckbox) {
            skipCheckbox.addEventListener('change', (e) => {
                config.skipIntroBtnVisible = e.target.checked;
            });
        }

        const subtitlesCheckbox = menu.querySelector('#kp-subtitles');
        if (subtitlesCheckbox) {
            subtitlesCheckbox.addEventListener('change', (e) => {
                config.subtitlesEnabled = e.target.checked;
            });
        }

        menu.querySelector('#kp-save-btn').addEventListener('click', () => {
            saveConfig();
            alert('Настройки сохранены!');
        });
    }

    // Запуск
    init();

})();

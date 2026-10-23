// ==UserScript==
// @name         Kinopoisk Player Tweaks (HD)
// @namespace    http://tampermonkey.net/
// @version      0.9
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
        volumeSlider: '.styles_slider__WEhCa, .player_volume_slider, [role="slider"], input[type="range"]', 
        audioTracks: '.styles_audio___FLvj [data-test-id="settings-item"], .track_item, .audio_track_selector',           // Селекторы для дорожек (HD)
        subtitles: '.styles_subtitles__q8VTO [data-test-id="settings-item"], .subtitle_item, .subtitle_selector',                                                   // Селекторы для субтитров (HD)
        skipIntroBtn: '.btn_skip_intro, .skip-intro, [data-action="skip-intro"]', 
        skipCreditsBtn: '.btn_skip_credits, .skip-credits, [data-action="skip-credits"]',
        settingsIcon: '.styles_audioSettingsButton__5hcYx, .styles_subtitleSizeSettingsButton__2akVU, .styles_settingsIcon__ULbja, .styles_settingsIcon__HYrcP' // Иконки настроек (HD)
    };

    /**
     * Хранилище данных (адаптировано для работы в Tampermonkey и Playwright)
     */
    const storage = {
        get: (key) => {
            if (typeof GM !== 'undefined' && typeof GM.getValue === 'function') {
                return GM.getValue(key, null);
            }
            const saved = localStorage.getItem('kp_tweaks_config');
            const config = saved ? JSON.parse(saved) : {};
            return config[key];
        },
        set: (key, value) => {
            if (typeof GM !== 'undefined' && typeof GM.setValue === 'function') {
                GM.setValue(key, value);
            } else {
                const current = localStorage.getItem('kp_tweaks_config');
                const config = current ? JSON.parse(current) : {};
                config[key] = value;
                localStorage.setItem('kp_tweaks_config', JSON.stringify(config));
            }
        },
        getAll: () => {
            if (typeof GM !== 'undefined' && typeof GM.getValue === 'function') {
                return GM.getValue('kp_tweaks_config', {});
            }
            const saved = localStorage.getItem('kp_tweaks_config');
            return saved ? JSON.parse(saved) : {};
        }
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
     * Загрузка настроек
     */
    function loadConfig() {
        const saved = storage.getAll();
        config = { ...DEFAULT_CONFIG, ...saved };
        console.log('[KP Tweaks] Конфигурация загружена:', config);
    }

    /**
     * Сохранение настроек
     */
    function saveConfig() {
        storage.set('kp_tweaks_config', config);
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
            // Новый контент - сброс к дефолтам в памяти без перезаписи localStorage
            config.volume = DEFAULT_CONFIG.volume;
            config.skipIntroBtnVisible = DEFAULT_CONFIG.skipIntroBtnVisible;
            config.skipCreditsBtnVisible = DEFAULT_CONFIG.skipCreditsBtnVisible;
            return false;
        }
    }

    /**
     * Применение настроек к плееру
     */
    function applyPlayerSettings(player) {
        if (!shouldApplySavedSettings()) return;

        // 1. Громкость (HD плеер может использовать кастомные слайдеры)
        const volumeSlider = document.querySelector(SELECTORS.volumeSlider);
        if (volumeSlider && config.volume !== undefined && player.volume !== config.volume) {
            player.volume = config.volume;
            // Если это стандартный input, обновляем его значение
            if (volumeSlider.tagName === 'INPUT' && volumeSlider.type === 'range') {
                volumeSlider.value = config.volume;
            } else {
                // Для кастомных слайдеров мы полагаемся на событие volumechange видеоплеера, 
                // которое уже обрабатывается в setupObservers.
            }
        }

        // 2. Кнопки пропуска (скрываем/показываем)
        const skipIntroBtn = document.querySelector(SELECTORS.skipIntroBtn);
        if (skipIntroBtn) {
            skipIntroBtn.style.setProperty('display', config.skipIntroBtnVisible ? 'block' : 'none', 'important');
        }

        const skipCreditsBtn = document.querySelector(SELECTORS.skipCreditsBtn);
        if (skipCreditsBtn) {
            skipCreditsBtn.style.setProperty('display', config.skipCreditsBtnVisible ? 'block' : 'none', 'important');
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
                // Включаем/выключаем видимость меню настроек или выполняем другие действия
                const menu = document.getElementById('kp-tweaks-menu');
                if (menu) {
                    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                } else {
                    // Если меню еще не создано, можно вызвать создание или просто логировать
                    console.log('[KP Tweaks] Меню настроек не найдено');
                }
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
            
            // Проверка на аудиодорожки (ищем radio input внутри контейнера или сам input)
            const audioContainer = target.closest(SELECTORS.audioTracks);
            if (audioContainer) {
                const input = audioContainer.querySelector('input[type="radio"]');
                if (input && input.checked) {
                    config.audioTrackId = input.value || input.getAttribute('aria-label') || 'Не выбрано';
                    saveConfig();
                    console.log('[KP Tweaks] Сохранена аудиодорожка:', config.audioTrackId);
                }
            }

            // Проверка на субтитры (ищем radio input внутри контейнера или сам input)
            const subtitleContainer = target.closest(SELECTORS.subtitles);
            if (subtitleContainer) {
                const input = subtitleContainer.querySelector('input[type="radio"]');
                if (input && input.checked) {
                    config.subtitlesEnabled = !!input.checked; 
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
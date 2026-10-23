// ==UserScript==
// @name         Kinopoisk Player Tweaks (Safe Volume)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Безопасное сохранение громкости
// @author       DeivBoo
// @match        https://www.kinopoisk.ru/*
// @match        https://hd.kinopoisk.ru/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    console.log('[KP Tweaks] Скрипт 3.0 (Safe Volume) запущен.');

    const getVolume = () => {
        try {
            if (typeof GM_getValue === 'function') return GM_getValue('volume', 0.5);
            return 0.5; // Дефолт
        } catch { return 0.5; }
    };

    const saveVolume = (vol) => {
        try {
            if (typeof GM_setValue === 'function') GM_setValue('volume', vol);
        } catch (e) {}
    };

    let videoElement = null;

    // Легкий интервал, который просто ждет появления плеера
    const checkVideo = setInterval(() => {
        if (!videoElement) {
            videoElement = document.querySelector('video');
            if (videoElement) {
                console.log('[KP Tweaks] Видео найдено! Восстанавливаем громкость...');
                clearInterval(checkVideo);

                // Применяем громкость
                const savedVol = getVolume();
                videoElement.volume = savedVol;

                // Слушаем изменения
                videoElement.addEventListener('volumechange', () => {
                    saveVolume(videoElement.volume);
                    console.log(`[KP Tweaks] Громкость сохранена: ${videoElement.volume}`);
                });
            }
        }
    }, 1000);

})();
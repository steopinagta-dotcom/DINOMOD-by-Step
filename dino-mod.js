(function () {
    'use strict';

    if (window.__DINO_FULL_MOD_LOADED__) return;
    window.__DINO_FULL_MOD_LOADED__ = true;

    const SAVE_KEY = 'dino_mod_settings_v1';

    const state = {
        speed: null,
        maxSpeed: null,
        acceleration: null,
        gravity: null,
        gapCoefficient: null,
        initialJumpVelocity: null,
        minJumpHeight: null,
        nightMode: false,

        invert: 0,
        hue: 0,
        grayscale: 0,
        sepia: 0,
        saturate: 100,
        contrast: 100,
        brightness: 100,
        blur: 0,

        canvasScale: 1,
        rotateDeg: 0,
        borderRadius: 0,
        glow: 0,
        opacity: 100,

        pageZoom: 100,
        menuOpacity: 95,

        rainbowMode: false,
        pulseMode: false,
        shakeCanvas: false,

        hideFooter: false,
        hidePopups: false,
        darkPage: false
    };

    let defaults = null;
    let panel = null;
    let body = null;
    let header = null;
    let animationTimer = null;

    function log(...args) {
        console.log('[Dino Mod]', ...args);
    }

    function $(sel) {
        return document.querySelector(sel);
    }

    function getCanvas() {
        return document.querySelector('.runner-canvas') || document.querySelector('canvas');
    }

    function getConfig() {
        return window.DINO_CONFIG || null;
    }

    function loadSaved() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw);
            Object.assign(state, saved);
        } catch (e) {
            log('Failed to load saved settings', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
            log('Failed to save settings', e);
        }
    }

    function waitForReady(cb) {
        const t = setInterval(() => {
            const cfg = getConfig();
            const canvas = getCanvas();
            if (cfg && canvas) {
                clearInterval(t);
                cb(cfg, canvas);
            }
        }, 300);
    }

    function captureDefaults(cfg) {
        defaults = {
            speed: cfg.speed,
            maxSpeed: cfg.maxSpeed,
            acceleration: cfg.acceleration,
            gravity: cfg.gravity,
            gapCoefficient: cfg.gapCoefficient,
            initialJumpVelocity: cfg.initialJumpVelocity,
            minJumpHeight: cfg.minJumpHeight,
            nightMode: cfg.nightMode,

            invert: 0,
            hue: 0,
            grayscale: 0,
            sepia: 0,
            saturate: 100,
            contrast: 100,
            brightness: 100,
            blur: 0,

            canvasScale: 1,
            rotateDeg: 0,
            borderRadius: 0,
            glow: 0,
            opacity: 100,

            pageZoom: 100,
            menuOpacity: 95,

            rainbowMode: false,
            pulseMode: false,
            shakeCanvas: false,

            hideFooter: false,
            hidePopups: false,
            darkPage: false
        };
    }

    function applyConfig(cfg) {
        if (state.speed != null) cfg.speed = Number(state.speed);
        if (state.maxSpeed != null) cfg.maxSpeed = Number(state.maxSpeed);
        if (state.acceleration != null) cfg.acceleration = Number(state.acceleration);
        if (state.gravity != null) cfg.gravity = Number(state.gravity);
        if (state.gapCoefficient != null) cfg.gapCoefficient = Number(state.gapCoefficient);
        if (state.initialJumpVelocity != null) cfg.initialJumpVelocity = Number(state.initialJumpVelocity);
        if (state.minJumpHeight != null) cfg.minJumpHeight = Number(state.minJumpHeight);
        cfg.nightMode = !!state.nightMode;
    }

    function applyVisuals() {
        const canvas = getCanvas();
        if (!canvas) return;

        const filter = [
            `invert(${state.invert}%)`,
            `hue-rotate(${state.hue}deg)`,
            `grayscale(${state.grayscale}%)`,
            `sepia(${state.sepia}%)`,
            `saturate(${state.saturate}%)`,
            `contrast(${state.contrast}%)`,
            `brightness(${state.brightness}%)`,
            `blur(${state.blur}px)`
        ].join(' ');

        let transform = `scale(${state.canvasScale}) rotate(${state.rotateDeg}deg)`;

        if (state.shakeCanvas) {
            const dx = (Math.random() * 6 - 3).toFixed(1);
            const dy = (Math.random() * 6 - 3).toFixed(1);
            transform += ` translate(${dx}px, ${dy}px)`;
        }

        if (state.pulseMode) {
            const s = 1 + Math.sin(Date.now() / 180) * 0.03;
            transform += ` scale(${s})`;
        }

        canvas.style.transition = 'filter 0.08s linear, transform 0.08s linear, box-shadow 0.08s linear, opacity 0.08s linear';
        canvas.style.filter = filter;
        canvas.style.transform = transform;
        canvas.style.transformOrigin = 'center center';
        canvas.style.borderRadius = state.borderRadius + 'px';
        canvas.style.opacity = String(state.opacity / 100);
        canvas.style.boxShadow = `0 0 ${state.glow}px rgba(0,255,255,0.9)`;

        document.documentElement.style.zoom = String(state.pageZoom / 100);

        const footer = document.querySelector('.footer');
        if (footer) footer.style.display = state.hideFooter ? 'none' : '';

        document.querySelectorAll('.blur_dialog, .contact-popup, #modalControl, #modalShare, #contact-popup').forEach(el => {
            el.style.display = state.hidePopups ? 'none' : '';
        });

        if (state.darkPage) {
            document.body.style.background = '#0a0a0a';
            document.body.style.color = '#fff';
        } else {
            document.body.style.background = '';
            document.body.style.color = '';
        }

        if (panel) {
            panel.style.opacity = String(state.menuOpacity / 100);
        }
    }

    function startAnimationLoop(cfg) {
        if (animationTimer) clearInterval(animationTimer);
        animationTimer = setInterval(() => {
            if (state.rainbowMode) {
                state.hue = (state.hue + 2) % 360;
                const hueSlider = document.querySelector('[data-setting="hue"]');
                const hueValue = document.querySelector('[data-value="hue"]');
                if (hueSlider) hueSlider.value = state.hue;
                if (hueValue) hueValue.textContent = state.hue;
            }
            applyConfig(cfg);
            applyVisuals();
        }, 60);
    }

    function makeSlider(label, key, min, max, step, value) {
        const wrap = document.createElement('div');
        wrap.style.marginBottom = '10px';

        const top = document.createElement('div');
        top.style.display = 'flex';
        top.style.justifyContent = 'space-between';
        top.style.marginBottom = '4px';

        const left = document.createElement('span');
        left.textContent = label;

        const right = document.createElement('span');
        right.textContent = value;
        right.setAttribute('data-value', key);

        const input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        input.style.width = '100%';
        input.setAttribute('data-setting', key);

        input.addEventListener('input', () => {
            state[key] = Number(input.value);
            right.textContent = input.value;
            saveState();
            const cfg = getConfig();
            if (cfg) applyConfig(cfg);
            applyVisuals();
        });

        top.appendChild(left);
        top.appendChild(right);
        wrap.appendChild(top);
        wrap.appendChild(input);
        return wrap;
    }

    function makeCheckbox(label, key, checked) {
        const wrap = document.createElement('label');
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '8px';
        wrap.style.marginBottom = '10px';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = checked;

        input.addEventListener('change', () => {
            state[key] = input.checked;
            saveState();
            const cfg = getConfig();
            if (cfg) applyConfig(cfg);
            applyVisuals();
        });

        const span = document.createElement('span');
        span.textContent = label;

        wrap.appendChild(input);
        wrap.appendChild(span);
        return wrap;
    }

    function makeButton(label, fn) {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = `
            width: 100%;
            margin-bottom: 8px;
            padding: 8px 10px;
            background: #1d1d1d;
            color: #fff;
            border: 1px solid #444;
            border-radius: 8px;
            cursor: pointer;
        `;
        btn.addEventListener('click', fn);
        return btn;
    }

    function buildUI(cfg) {
        panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            max-height: 85vh;
            overflow-y: auto;
            background: rgba(15,15,15,0.95);
            color: white;
            z-index: 999999;
            border-radius: 12px;
            border: 1px solid #333;
            box-shadow: 0 8px 24px rgba(0,0,0,0.35);
            font-family: Arial, sans-serif;
            font-size: 13px;
            user-select: none;
        `;

        header = document.createElement('div');
        header.textContent = 'Dino Full Custom Menu';
        header.style.cssText = `
            padding: 10px 12px;
            font-weight: bold;
            cursor: move;
            border-bottom: 1px solid #333;
            background: linear-gradient(180deg, #1f1f1f, #111);
            border-radius: 12px 12px 0 0;
            position: sticky;
            top: 0;
            z-index: 2;
        `;

        body = document.createElement('div');
        body.style.padding = '10px';

        body.appendChild(sectionTitle('Gameplay Config'));
        body.appendChild(makeCheckbox('Night Mode', 'nightMode', state.nightMode));
        body.appendChild(makeSlider('Speed', 'speed', 1, 30, 0.5, state.speed));
        body.appendChild(makeSlider('Max Speed', 'maxSpeed', 1, 50, 0.5, state.maxSpeed));
        body.appendChild(makeSlider('Acceleration', 'acceleration', 0, 2, 0.01, state.acceleration));
        body.appendChild(makeSlider('Gravity', 'gravity', 0.1, 3, 0.1, state.gravity));
        body.appendChild(makeSlider('Gap Coefficient', 'gapCoefficient', 0, 5, 0.1, state.gapCoefficient));
        body.appendChild(makeSlider('Jump Velocity', 'initialJumpVelocity', 1, 30, 0.5, state.initialJumpVelocity));
        body.appendChild(makeSlider('Min Jump Height', 'minJumpHeight', 0, 100, 1, state.minJumpHeight));

        body.appendChild(sectionTitle('Canvas FX'));
        body.appendChild(makeSlider('Invert', 'invert', 0, 100, 1, state.invert));
        body.appendChild(makeSlider('Hue Rotate', 'hue', 0, 360, 1, state.hue));
        body.appendChild(makeSlider('Grayscale', 'grayscale', 0, 100, 1, state.grayscale));
        body.appendChild(makeSlider('Sepia', 'sepia', 0, 100, 1, state.sepia));
        body.appendChild(makeSlider('Saturate', 'saturate', 0, 300, 1, state.saturate));
        body.appendChild(makeSlider('Contrast', 'contrast', 0, 300, 1, state.contrast));
        body.appendChild(makeSlider('Brightness', 'brightness', 0, 300, 1, state.brightness));
        body.appendChild(makeSlider('Blur', 'blur', 0, 10, 0.1, state.blur));
        body.appendChild(makeSlider('Canvas Scale', 'canvasScale', 0.5, 3, 0.01, state.canvasScale));
        body.appendChild(makeSlider('Rotate', 'rotateDeg', -180, 180, 1, state.rotateDeg));
        body.appendChild(makeSlider('Border Radius', 'borderRadius', 0, 50, 1, state.borderRadius));
        body.appendChild(makeSlider('Glow', 'glow', 0, 80, 1, state.glow));
        body.appendChild(makeSlider('Canvas Opacity', 'opacity', 10, 100, 1, state.opacity));

        body.appendChild(sectionTitle('Page / Fun'));
        body.appendChild(makeSlider('Page Zoom', 'pageZoom', 50, 200, 1, state.pageZoom));
        body.appendChild(makeSlider('Menu Opacity', 'menuOpacity', 20, 100, 1, state.menuOpacity));
        body.appendChild(makeCheckbox('Rainbow Mode', 'rainbowMode', state.rainbowMode));
        body.appendChild(makeCheckbox('Pulse Mode', 'pulseMode', state.pulseMode));
        body.appendChild(makeCheckbox('Shake Canvas', 'shakeCanvas', state.shakeCanvas));
        body.appendChild(makeCheckbox('Hide Footer', 'hideFooter', state.hideFooter));
        body.appendChild(makeCheckbox('Hide Popups', 'hidePopups', state.hidePopups));
        body.appendChild(makeCheckbox('Dark Page', 'darkPage', state.darkPage));

        body.appendChild(sectionTitle('Presets'));
        body.appendChild(makeButton('Preset: Easy', () => {
            state.speed = 4;
            state.maxSpeed = 6;
            state.acceleration = 0;
            state.gravity = 0.5;
            state.gapCoefficient = 2.5;
            state.initialJumpVelocity = 14;
            state.minJumpHeight = 20;
            rerender();
        }));

        body.appendChild(makeButton('Preset: Fast', () => {
            state.speed = 12;
            state.maxSpeed = 25;
            state.acceleration = 0.3;
            state.gravity = 0.7;
            state.gapCoefficient = 1.2;
            state.initialJumpVelocity = 13;
            state.minJumpHeight = 20;
            rerender();
        }));

        body.appendChild(makeButton('Preset: Moon', () => {
            state.gravity = 0.2;
            state.initialJumpVelocity = 18;
            state.minJumpHeight = 5;
            state.canvasScale = 1.1;
            rerender();
        }));

        body.appendChild(makeButton('Preset: Retro Weird', () => {
            state.invert = 100;
            state.hue = 180;
            state.grayscale = 20;
            state.sepia = 40;
            state.saturate = 180;
            state.contrast = 160;
            state.brightness = 110;
            state.glow = 25;
            rerender();
        }));

        body.appendChild(makeButton('Preset: Clean', () => {
            state.invert = 0;
            state.hue = 0;
            state.grayscale = 0;
            state.sepia = 0;
            state.saturate = 100;
            state.contrast = 100;
            state.brightness = 100;
            state.blur = 0;
            state.canvasScale = 1;
            state.rotateDeg = 0;
            state.borderRadius = 0;
            state.glow = 0;
            state.opacity = 100;
            state.pageZoom = 100;
            state.rainbowMode = false;
            state.pulseMode = false;
            state.shakeCanvas = false;
            state.hideFooter = false;
            state.hidePopups = false;
            state.darkPage = false;
            rerender();
        }));

        body.appendChild(makeButton('Reset Defaults', () => {
            Object.assign(state, defaults);
            rerender();
        }));

        body.appendChild(makeButton('Save Settings', () => {
            saveState();
            alert('Saved.');
        }));

        body.appendChild(makeButton('Show Canvas Outline', () => {
            const c = getCanvas();
            if (c) c.style.outline = '2px solid red';
        }));

        body.appendChild(makeButton('Remove Canvas Outline', () => {
            const c = getCanvas();
            if (c) c.style.outline = '';
        }));

        body.appendChild(makeButton('Hide Menu (F8)', () => {
            panel.style.display = 'none';
        }));

        panel.appendChild(header);
        panel.appendChild(body);
        document.body.appendChild(panel);

        makeDraggable(panel, header);
        applyVisuals();
    }

    function sectionTitle(text) {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = `
            margin: 12px 0 8px;
            padding: 6px 8px;
            background: rgba(255,255,255,0.06);
            border-radius: 8px;
            font-weight: bold;
        `;
        return el;
    }

    function rerender() {
        saveState();
        const cfg = getConfig();
        if (cfg) applyConfig(cfg);
        applyVisuals();

        if (panel) panel.remove();
        buildUI(cfg);
    }

    function makeDraggable(box, handle) {
        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        handle.addEventListener('mousedown', function (e) {
            dragging = true;
            offsetX = e.clientX - box.offsetLeft;
            offsetY = e.clientY - box.offsetTop;
        });

        document.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            box.style.left = (e.clientX - offsetX) + 'px';
            box.style.top = (e.clientY - offsetY) + 'px';
            box.style.right = 'auto';
        });

        document.addEventListener('mouseup', function () {
            dragging = false;
        });
    }

    function hotkeys() {
        document.addEventListener('keydown', function (e) {
            if (e.key === 'F8') {
                if (!panel) return;
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }

            if (e.key === 'F6') {
                state.rainbowMode = !state.rainbowMode;
                saveState();
            }

            if (e.key === 'F7') {
                state.nightMode = !state.nightMode;
                const cfg = getConfig();
                if (cfg) applyConfig(cfg);
                applyVisuals();
                saveState();
            }

            if (e.key === 'F9') {
                state.invert = state.invert ? 0 : 100;
                rerender();
            }
        });
    }

    waitForReady((cfg) => {
        loadSaved();
        captureDefaults(cfg);

        state.speed ??= cfg.speed;
        state.maxSpeed ??= cfg.maxSpeed;
        state.acceleration ??= cfg.acceleration;
        state.gravity ??= cfg.gravity;
        state.gapCoefficient ??= cfg.gapCoefficient;
        state.initialJumpVelocity ??= cfg.initialJumpVelocity;
        state.minJumpHeight ??= cfg.minJumpHeight;
        state.nightMode ??= cfg.nightMode;

        applyConfig(cfg);
        buildUI(cfg);
        applyVisuals();
        startAnimationLoop(cfg);
        hotkeys();

        log('Full customization menu loaded.');
    });
})();

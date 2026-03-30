(function () {
    'use strict';

    if (window.__DINO_UI_MOD_V3__) return;
    window.__DINO_UI_MOD_V3__ = true;

    const SAVE_KEY = 'dino_ui_mod_v3';
    const TAB_KEY = 'dino_ui_mod_v3_tab';

    const defaults = {
        gameSize: 100,
        gameRotation: 0,
        roundedCorners: 0,
        gameGlow: 0,
        gameTransparency: 100,
        showCanvasOutline: false,

        invertColors: 0,
        colorShift: 0,
        grayscale: 0,
        sepia: 0,
        saturation: 100,
        contrast: 100,
        brightness: 100,
        blurEffect: 0,

        websiteZoom: 100,
        menuOpacity: 96,
        rainbowAnimation: false,
        breathingAnimation: false,
        screenShakeEffect: false,

        hideBottomWebsiteBar: false,
        hideWebsitePopups: false,
        darkWebsiteBackground: false
    };

    const state = { ...defaults };

    let panel = null;
    let tabsRow = null;
    let contentArea = null;
    let trailCanvas = null;
    let trailCtx = null;
    let particles = [];
    let activeTab = localStorage.getItem(TAB_KEY) || 'visuals';

    const qs = (s) => document.querySelector(s);
    const qsa = (s) => Array.from(document.querySelectorAll(s));

    function getCanvas() {
        return qs('.runner-canvas') || qs('canvas');
    }

    function saveState() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('[Dino UI Mod V3] Save failed:', e);
        }
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            Object.assign(state, defaults, parsed);
        } catch (e) {
            console.warn('[Dino UI Mod V3] Load failed:', e);
        }
    }

    function saveTab() {
        try {
            localStorage.setItem(TAB_KEY, activeTab);
        } catch (e) {}
    }

    function applyVisuals() {
        const canvas = getCanvas();

        if (canvas) {
            let transform = `scale(${state.gameSize / 100}) rotate(${state.gameRotation}deg)`;

            if (state.screenShakeEffect) {
                const dx = (Math.random() * 4 - 2).toFixed(1);
                const dy = (Math.random() * 4 - 2).toFixed(1);
                transform += ` translate(${dx}px, ${dy}px)`;
            }

            if (state.breathingAnimation) {
                const pulse = 1 + Math.sin(Date.now() / 220) * 0.025;
                transform += ` scale(${pulse})`;
            }

            canvas.style.transition = 'filter .08s linear, transform .08s linear, box-shadow .08s linear, opacity .08s linear';
            canvas.style.transform = transform;
            canvas.style.transformOrigin = 'center center';
            canvas.style.filter = [
                `invert(${state.invertColors}%)`,
                `hue-rotate(${state.colorShift}deg)`,
                `grayscale(${state.grayscale}%)`,
                `sepia(${state.sepia}%)`,
                `saturate(${state.saturation}%)`,
                `contrast(${state.contrast}%)`,
                `brightness(${state.brightness}%)`,
                `blur(${state.blurEffect}px)`
            ].join(' ');
            canvas.style.borderRadius = `${state.roundedCorners}px`;
            canvas.style.opacity = String(state.gameTransparency / 100);
            canvas.style.boxShadow = `0 0 ${state.gameGlow}px rgba(83,216,255,.9)`;
            canvas.style.outline = state.showCanvasOutline ? '2px solid #ff4d4d' : '';
        }

        document.documentElement.style.zoom = String(state.websiteZoom / 100);

        const footer = qs('.footer');
        if (footer) footer.style.display = state.hideBottomWebsiteBar ? 'none' : '';

        qsa('.blur_dialog, .contact-popup, #modalControl, #modalShare, #contact-popup').forEach(el => {
            el.style.display = state.hideWebsitePopups ? 'none' : '';
        });

        if (state.darkWebsiteBackground) {
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

    function syncInputs(key, value) {
        if (!panel) return;
        const range = panel.querySelector(`[data-key="${key}"]`);
        const number = panel.querySelector(`[data-key-number="${key}"]`);
        const label = panel.querySelector(`[data-key-value="${key}"]`);
        if (range) range.value = value;
        if (number) number.value = value;
        if (label) label.textContent = value;
    }

    function animationLoop() {
        if (state.rainbowAnimation) {
            state.colorShift = (state.colorShift + 2) % 360;
            syncInputs('colorShift', state.colorShift);
        }

        applyVisuals();
        requestAnimationFrame(animationLoop);
    }

    function sectionTitle(text) {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = `
            margin: 12px 0 8px;
            padding: 8px 10px;
            border-radius: 10px;
            background: rgba(255,255,255,.06);
            font-weight: 700;
        `;
        return el;
    }

    function createNumberSlider(label, key, min, max, step) {
        const wrap = document.createElement('div');
        wrap.style.marginBottom = '12px';

        const top = document.createElement('div');
        top.style.cssText = 'display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px;';

        const left = document.createElement('div');
        left.textContent = label;
        left.style.fontWeight = '600';

        const right = document.createElement('div');
        right.style.cssText = 'display:flex;align-items:center;gap:6px;';

        const value = document.createElement('span');
        value.textContent = state[key];
        value.setAttribute('data-key-value', key);
        value.style.cssText = 'min-width:40px;text-align:right;font-size:12px;opacity:.9;';

        const number = document.createElement('input');
        number.type = 'number';
        number.min = min;
        number.max = max;
        number.step = step;
        number.value = state[key];
        number.setAttribute('data-key-number', key);
        number.style.cssText = `
            width:74px;
            padding:4px 6px;
            border-radius:8px;
            border:1px solid #444;
            background:#111;
            color:#fff;
            outline:none;
        `;

        const range = document.createElement('input');
        range.type = 'range';
        range.min = min;
        range.max = max;
        range.step = step;
        range.value = state[key];
        range.setAttribute('data-key', key);
        range.style.cssText = 'width:100%;accent-color:#53d8ff;';

        function sync(v) {
            let num = Number(v);
            if (Number.isNaN(num)) return;
            num = Math.max(Number(min), Math.min(Number(max), num));
            state[key] = num;
            value.textContent = num;
            range.value = num;
            number.value = num;
            saveState();
            applyVisuals();
        }

        range.addEventListener('input', () => sync(range.value));
        number.addEventListener('change', () => sync(number.value));
        number.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sync(number.value);
        });

        right.append(value, number);
        top.append(left, right);
        wrap.append(top, range);
        return wrap;
    }

    function createCheckbox(label, key) {
        const row = document.createElement('label');
        row.style.cssText = `
            display:flex;
            align-items:center;
            gap:10px;
            margin:10px 0;
            padding:8px 10px;
            border-radius:10px;
            background:rgba(255,255,255,.03);
            cursor:pointer;
            transition:background .2s ease, transform .2s ease, box-shadow .2s ease;
        `;

        row.addEventListener('mouseenter', () => {
            row.style.background = 'rgba(83,216,255,.08)';
            row.style.transform = 'translateX(2px)';
            row.style.boxShadow = '0 0 10px rgba(83,216,255,.08)';
        });

        row.addEventListener('mouseleave', () => {
            row.style.background = 'rgba(255,255,255,.03)';
            row.style.transform = 'translateX(0)';
            row.style.boxShadow = '';
        });

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!state[key];
        input.style.accentColor = '#53d8ff';

        const text = document.createElement('span');
        text.textContent = label;

        input.addEventListener('change', () => {
            state[key] = input.checked;
            saveState();
            applyVisuals();
        });

        row.append(input, text);
        return row;
    }

    function createButton(text, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            width:100%;
            margin:8px 0;
            padding:10px 12px;
            border-radius:10px;
            border:1px solid rgba(255,255,255,.14);
            background:linear-gradient(180deg,#1b1b1b,#101010);
            color:#fff;
            cursor:pointer;
            transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
        `;

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 0 18px rgba(83,216,255,.22)';
            btn.style.borderColor = 'rgba(83,216,255,.45)';
            btn.style.background = 'linear-gradient(180deg,#253640,#12181c)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '';
            btn.style.borderColor = 'rgba(255,255,255,.14)';
            btn.style.background = 'linear-gradient(180deg,#1b1b1b,#101010)';
        });

        btn.addEventListener('click', onClick);
        return btn;
    }

    function createTab(id, text) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            flex:0 0 auto;
            padding:8px 12px;
            border-radius:10px;
            border:1px solid rgba(255,255,255,.08);
            background:${activeTab === id ? 'rgba(83,216,255,.18)' : 'rgba(255,255,255,.04)'};
            color:#fff;
            cursor:pointer;
            transition:all .2s ease;
            white-space:nowrap;
        `;

        btn.addEventListener('mouseenter', () => {
            if (activeTab !== id) btn.style.background = 'rgba(83,216,255,.10)';
        });

        btn.addEventListener('mouseleave', () => {
            if (activeTab !== id) btn.style.background = 'rgba(255,255,255,.04)';
        });

        btn.addEventListener('click', () => {
            activeTab = id;
            saveTab();
            renderTabs();
            renderContent();
        });

        return btn;
    }

    function renderTabs() {
        tabsRow.innerHTML = '';
        tabsRow.append(
            createTab('visuals', 'Visuals'),
            createTab('effects', 'Effects'),
            createTab('website', 'Website'),
            createTab('themes', 'Themes'),
            createTab('settings', 'Settings')
        );
    }

    function setTheme(values) {
        Object.assign(state, values);
        saveState();
        rerender();
    }

    function renderContent() {
        contentArea.innerHTML = '';

        if (activeTab === 'visuals') {
            contentArea.append(
                sectionTitle('Game Appearance'),
                createNumberSlider('Game Size', 'gameSize', 50, 300, 1),
                createNumberSlider('Game Rotation', 'gameRotation', -180, 180, 1),
                createNumberSlider('Rounded Corners', 'roundedCorners', 0, 50, 1),
                createNumberSlider('Game Glow', 'gameGlow', 0, 80, 1),
                createNumberSlider('Game Transparency', 'gameTransparency', 10, 100, 1),
                createCheckbox('Show Red Outline Around Game', 'showCanvasOutline')
            );
        }

        if (activeTab === 'effects') {
            contentArea.append(
                sectionTitle('Color and Filter Effects'),
                createNumberSlider('Invert Colors', 'invertColors', 0, 100, 1),
                createNumberSlider('Color Shift', 'colorShift', 0, 360, 1),
                createNumberSlider('Grayscale', 'grayscale', 0, 100, 1),
                createNumberSlider('Sepia', 'sepia', 0, 100, 1),
                createNumberSlider('Saturation', 'saturation', 0, 300, 1),
                createNumberSlider('Contrast', 'contrast', 0, 300, 1),
                createNumberSlider('Brightness', 'brightness', 0, 300, 1),
                createNumberSlider('Blur Effect', 'blurEffect', 0, 10, 0.1),
                createCheckbox('Rainbow Color Animation', 'rainbowAnimation'),
                createCheckbox('Breathing Size Animation', 'breathingAnimation'),
                createCheckbox('Screen Shake Effect', 'screenShakeEffect')
            );
        }

        if (activeTab === 'website') {
            contentArea.append(
                sectionTitle('Website Options'),
                createNumberSlider('Website Zoom', 'websiteZoom', 50, 200, 1),
                createNumberSlider('Menu Transparency', 'menuOpacity', 20, 100, 1),
                createCheckbox('Hide Bottom Website Bar', 'hideBottomWebsiteBar'),
                createCheckbox('Hide Website Popups', 'hideWebsitePopups'),
                createCheckbox('Dark Website Background', 'darkWebsiteBackground')
            );
        }

        if (activeTab === 'themes') {
            contentArea.append(
                sectionTitle('Quick Themes'),
                createButton('Default Theme', () => setTheme({ ...defaults })),
                createButton('Neon Theme', () => setTheme({
                    gameGlow: 28,
                    saturation: 180,
                    contrast: 145,
                    brightness: 115,
                    colorShift: 160
                })),
                createButton('Retro Theme', () => setTheme({
                    grayscale: 15,
                    sepia: 35,
                    contrast: 130,
                    brightness: 95,
                    gameGlow: 8
                })),
                createButton('Inverted Theme', () => setTheme({
                    invertColors: 100,
                    colorShift: 180,
                    contrast: 120
                })),
                createButton('Soft Glow Theme', () => setTheme({
                    gameGlow: 18,
                    brightness: 108,
                    blurEffect: 0.3,
                    roundedCorners: 12
                }))
            );
        }

        if (activeTab === 'settings') {
            contentArea.append(
                sectionTitle('Menu Settings'),
                createButton('Save Settings Now', () => saveState()),
                createButton('Reset Everything', () => {
                    Object.assign(state, defaults);
                    saveState();
                    rerender();
                }),
                createButton('Hide Menu (F8)', () => {
                    panel.style.display = 'none';
                })
            );
        }
    }

    function setupGlowTrail(container) {
        trailCanvas = document.createElement('canvas');
        trailCanvas.style.cssText = `
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
            pointer-events:none;
            border-radius:14px;
            z-index:0;
        `;
        container.appendChild(trailCanvas);
        trailCtx = trailCanvas.getContext('2d');

        function resize() {
            trailCanvas.width = container.clientWidth;
            trailCanvas.height = container.clientHeight;
        }

        resize();
        new ResizeObserver(resize).observe(container);

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            particles.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                r: 18,
                a: 0.22,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2
            });
        });

        function tick() {
            if (!trailCtx) {
                requestAnimationFrame(tick);
                return;
            }

            trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.r *= 0.96;
                p.a *= 0.95;

                if (p.r < 0.8 || p.a < 0.01) {
                    particles.splice(i, 1);
                    continue;
                }

                const g = trailCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                g.addColorStop(0, `rgba(83,216,255,${p.a})`);
                g.addColorStop(0.45, `rgba(83,216,255,${p.a * 0.45})`);
                g.addColorStop(1, 'rgba(83,216,255,0)');

                trailCtx.fillStyle = g;
                trailCtx.beginPath();
                trailCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                trailCtx.fill();
            }

            requestAnimationFrame(tick);
        }

        tick();
    }

    function makeDraggable(box, handle) {
        let dragging = false;
        let ox = 0;
        let oy = 0;

        handle.addEventListener('mousedown', (e) => {
            dragging = true;
            ox = e.clientX - box.offsetLeft;
            oy = e.clientY - box.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            box.style.left = `${e.clientX - ox}px`;
            box.style.top = `${e.clientY - oy}px`;
            box.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            dragging = false;
        });
    }

    function buildUI() {
        panel = document.createElement('div');
        panel.style.cssText = `
            position:fixed;
            top:20px;
            right:20px;
            z-index:999999;
            width:360px;
            max-height:86vh;
            overflow:hidden;
            border-radius:14px;
            border:1px solid rgba(255,255,255,.1);
            background:linear-gradient(180deg,rgba(20,20,24,.92),rgba(10,10,14,.92));
            color:#fff;
            box-shadow:0 12px 35px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05);
            backdrop-filter:blur(12px);
            font:13px Arial,sans-serif;
            user-select:none;
        `;

        const inner = document.createElement('div');
        inner.style.cssText = 'position:relative;z-index:1;display:flex;flex-direction:column;height:100%;';

        const header = document.createElement('div');
        header.textContent = 'Dino Customization Menu V3';
        header.style.cssText = `
            padding:12px 14px;
            font-weight:700;
            cursor:move;
            border-bottom:1px solid rgba(255,255,255,.08);
            background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01));
            position:sticky;
            top:0;
            z-index:2;
        `;

        tabsRow = document.createElement('div');
        tabsRow.style.cssText = `
            display:flex;
            gap:8px;
            padding:10px 10px 0 10px;
            overflow-x:auto;
            overflow-y:hidden;
            scrollbar-width:thin;
            position:sticky;
            top:45px;
            z-index:2;
            background:rgba(15,15,18,.85);
        `;

        contentArea = document.createElement('div');
        contentArea.style.cssText = `
            padding:10px;
            overflow:auto;
            max-height:65vh;
        `;

        inner.append(header, tabsRow, contentArea);
        panel.append(inner);
        document.body.append(panel);

        setupGlowTrail(panel);
        makeDraggable(panel, header);
        renderTabs();
        renderContent();
    }

    function rerender() {
        if (panel) panel.remove();
        buildUI();
        applyVisuals();
    }

    function addHotkeys() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F8' && panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    function init() {
        loadState();
        buildUI();
        applyVisuals();
        addHotkeys();
        requestAnimationFrame(animationLoop);
        console.log('[Dino UI Mod V3] Loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

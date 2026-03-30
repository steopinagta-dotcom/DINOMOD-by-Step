(function () {
    'use strict';

    if (window.__DINO_UI_MOD_LOADED__) return;
    window.__DINO_UI_MOD_LOADED__ = true;

    const SAVE_KEY = 'dino_ui_mod_v2';

    const state = {
        gameSize: 100,
        gameRotation: 0,
        roundedCorners: 0,
        gameGlow: 0,
        gameTransparency: 100,

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
        hidePopups: false,
        darkWebsiteBackground: false
    };

    let panel, body, trailCanvas, trailCtx, canvasEl;
    let particles = [];
    let activeTab = 'visuals';

    function qs(s) { return document.querySelector(s); }
    function qsa(s) { return Array.from(document.querySelectorAll(s)); }
    function getGameCanvas() { return qs('.runner-canvas') || qs('canvas'); }

    function loadState() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            Object.assign(state, JSON.parse(raw));
        } catch (e) {
            console.warn('[Dino UI Mod] Load failed', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('[Dino UI Mod] Save failed', e);
        }
    }

    function applyVisuals() {
        canvasEl = getGameCanvas();
        if (canvasEl) {
            let scale = state.gameSize / 100;
            let transform = `scale(${scale}) rotate(${state.gameRotation}deg)`;

            if (state.screenShakeEffect) {
                const dx = (Math.random() * 4 - 2).toFixed(1);
                const dy = (Math.random() * 4 - 2).toFixed(1);
                transform += ` translate(${dx}px, ${dy}px)`;
            }

            if (state.breathingAnimation) {
                const pulse = 1 + Math.sin(Date.now() / 220) * 0.025;
                transform += ` scale(${pulse})`;
            }

            const filter = [
                `invert(${state.invertColors}%)`,
                `hue-rotate(${state.colorShift}deg)`,
                `grayscale(${state.grayscale}%)`,
                `sepia(${state.sepia}%)`,
                `saturate(${state.saturation}%)`,
                `contrast(${state.contrast}%)`,
                `brightness(${state.brightness}%)`,
                `blur(${state.blurEffect}px)`
            ].join(' ');

            canvasEl.style.transition = 'all .08s linear';
            canvasEl.style.transform = transform;
            canvasEl.style.transformOrigin = 'center center';
            canvasEl.style.filter = filter;
            canvasEl.style.borderRadius = state.roundedCorners + 'px';
            canvasEl.style.opacity = String(state.gameTransparency / 100);
            canvasEl.style.boxShadow = `0 0 ${state.gameGlow}px rgba(0,255,255,.85)`;
        }

        document.documentElement.style.zoom = String(state.websiteZoom / 100);

        const footer = qs('.footer');
        if (footer) footer.style.display = state.hideBottomWebsiteBar ? 'none' : '';

        qsa('.blur_dialog, .contact-popup, #modalControl, #modalShare, #contact-popup')
            .forEach(el => el.style.display = state.hidePopups ? 'none' : '');

        if (state.darkWebsiteBackground) {
            document.body.style.background = '#0a0a0a';
            document.body.style.color = '#fff';
        } else {
            document.body.style.background = '';
            document.body.style.color = '';
        }

        if (panel) panel.style.opacity = String(state.menuOpacity / 100);
    }

    function loop() {
        if (state.rainbowAnimation) {
            state.colorShift = (state.colorShift + 2) % 360;
            const input = panel?.querySelector('[data-key="colorShift"][type="range"]');
            const number = panel?.querySelector('[data-key-number="colorShift"]');
            const val = panel?.querySelector('[data-key-value="colorShift"]');
            if (input) input.value = state.colorShift;
            if (number) number.value = state.colorShift;
            if (val) val.textContent = state.colorShift;
        }
        applyVisuals();
        requestAnimationFrame(loop);
    }

    function sectionTitle(text) {
        const d = document.createElement('div');
        d.textContent = text;
        d.style.cssText = `
            margin: 12px 0 8px;
            padding: 8px 10px;
            border-radius: 10px;
            background: rgba(255,255,255,.06);
            font-weight: 700;
            letter-spacing: .2px;
        `;
        return d;
    }

    function createControlRow(label, key, min, max, step) {
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
        value.style.cssText = 'min-width:42px;text-align:right;font-size:12px;opacity:.9;';

        const number = document.createElement('input');
        number.type = 'number';
        number.min = min;
        number.max = max;
        number.step = step;
        number.value = state[key];
        number.setAttribute('data-key-number', key);
        number.style.cssText = `
            width:72px;padding:4px 6px;border-radius:8px;border:1px solid #444;
            background:#111;color:#fff;outline:none;
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
            if (min !== undefined) num = Math.max(Number(min), num);
            if (max !== undefined) num = Math.min(Number(max), num);
            state[key] = num;
            value.textContent = num;
            range.value = num;
            number.value = num;
            saveState();
            applyVisuals();
        }

        range.addEventListener('input', () => sync(range.value));
        number.addEventListener('change', () => sync(number.value));
        number.addEventListener('keydown', e => {
            if (e.key === 'Enter') sync(number.value);
        });

        right.append(value, number);
        top.append(left, right);
        wrap.append(top, range);
        return wrap;
    }

    function createCheckbox(label, key) {
        const lab = document.createElement('label');
        lab.style.cssText = `
            display:flex;align-items:center;gap:10px;margin:10px 0;
            padding:8px 10px;border-radius:10px;
            background:rgba(255,255,255,.03);
            transition:background .2s ease, transform .2s ease;
            cursor:pointer;
        `;
        lab.onmouseenter = () => {
            lab.style.background = 'rgba(83,216,255,.08)';
            lab.style.transform = 'translateX(2px)';
        };
        lab.onmouseleave = () => {
            lab.style.background = 'rgba(255,255,255,.03)';
            lab.style.transform = 'translateX(0)';
        };

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

        lab.append(input, text);
        return lab;
    }

    function createButton(text, fn) {
        const b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = `
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
        b.onmouseenter = () => {
            b.style.transform = 'translateY(-1px)';
            b.style.boxShadow = '0 0 18px rgba(83,216,255,.22)';
            b.style.borderColor = 'rgba(83,216,255,.45)';
            b.style.background = 'linear-gradient(180deg,#253640,#12181c)';
        };
        b.onmouseleave = () => {
            b.style.transform = 'translateY(0)';
            b.style.boxShadow = '';
            b.style.borderColor = 'rgba(255,255,255,.14)';
            b.style.background = 'linear-gradient(180deg,#1b1b1b,#101010)';
        };
        b.addEventListener('click', fn);
        return b;
    }

    function tabButton(id, text) {
        const b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = `
            flex:1;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.08);
            background:${activeTab === id ? 'rgba(83,216,255,.18)' : 'rgba(255,255,255,.04)'};
            color:#fff;cursor:pointer;transition:all .2s ease;
        `;
        b.onmouseenter = () => {
            if (activeTab !== id) b.style.background = 'rgba(83,216,255,.10)';
        };
        b.onmouseleave = () => {
            if (activeTab !== id) b.style.background = 'rgba(255,255,255,.04)';
        };
        b.onclick = () => {
            activeTab = id;
            renderTabContent();
            renderTabs();
        };
        b.dataset.tabId = id;
        return b;
    }

    let tabsRow, contentArea;

    function renderTabs() {
        tabsRow.innerHTML = '';
        tabsRow.append(
            tabButton('visuals', 'Visuals'),
            tabButton('effects', 'Effects'),
            tabButton('website', 'Website'),
            tabButton('themes', 'Themes'),
            tabButton('settings', 'Settings')
        );
    }

    function renderTabContent() {
        contentArea.innerHTML = '';

        if (activeTab === 'visuals') {
            contentArea.append(
                sectionTitle('Game Appearance'),
                createControlRow('Game Size', 'gameSize', 50, 300, 1),
                createControlRow('Game Rotation', 'gameRotation', -180, 180, 1),
                createControlRow('Rounded Corners', 'roundedCorners', 0, 50, 1),
                createControlRow('Game Glow', 'gameGlow', 0, 80, 1),
                createControlRow('Game Transparency', 'gameTransparency', 10, 100, 1)
            );
        }

        if (activeTab === 'effects') {
            contentArea.append(
                sectionTitle('Color & Filter Effects'),
                createControlRow('Invert Colors', 'invertColors', 0, 100, 1),
                createControlRow('Color Shift', 'colorShift', 0, 360, 1),
                createControlRow('Grayscale', 'grayscale', 0, 100, 1),
                createControlRow('Sepia', 'sepia', 0, 100, 1),
                createControlRow('Saturation', 'saturation', 0, 300, 1),
                createControlRow('Contrast', 'contrast', 0, 300, 1),
                createControlRow('Brightness', 'brightness', 0, 300, 1),
                createControlRow('Blur Effect', 'blurEffect', 0, 10, 0.1),
                createCheckbox('Rainbow Color Animation', 'rainbowAnimation'),
                createCheckbox('Breathing Size Animation', 'breathingAnimation'),
                createCheckbox('Screen Shake Effect', 'screenShakeEffect')
            );
        }

        if (activeTab === 'website') {
            contentArea.append(
                sectionTitle('Website Options'),
                createControlRow('Website Zoom', 'websiteZoom', 50, 200, 1),
                createControlRow('Menu Transparency', 'menuOpacity', 20, 100, 1),
                createCheckbox('Hide Bottom Website Bar', 'hideBottomWebsiteBar'),
                createCheckbox('Hide Website Popups', 'hidePopups'),
                createCheckbox('Dark Website Background', 'darkWebsiteBackground')
            );
        }

        if (activeTab === 'themes') {
            contentArea.append(
                sectionTitle('Quick Themes'),
                createButton('Default Theme', () => {
                    Object.assign(state, {
                        gameSize: 100, gameRotation: 0, roundedCorners: 0, gameGlow: 0, gameTransparency: 100,
                        invertColors: 0, colorShift: 0, grayscale: 0, sepia: 0, saturation: 100,
                        contrast: 100, brightness: 100, blurEffect: 0,
                        rainbowAnimation: false, breathingAnimation: false, screenShakeEffect: false
                    });
                    saveState(); rerender();
                }),
                createButton('Neon Theme', () => {
                    Object.assign(state, {
                        gameGlow: 28, saturation: 180, contrast: 145, brightness: 115, colorShift: 160
                    });
                    saveState(); rerender();
                }),
                createButton('Retro Theme', () => {
                    Object.assign(state, {
                        grayscale: 15, sepia: 35, contrast: 130, brightness: 95, gameGlow: 8
                    });
                    saveState(); rerender();
                }),
                createButton('Inverted Theme', () => {
                    Object.assign(state, {
                        invertColors: 100, colorShift: 180, contrast: 120
                    });
                    saveState(); rerender();
                }),
                createButton('Soft Glow Theme', () => {
                    Object.assign(state, {
                        gameGlow: 18, brightness: 108, blurEffect: 0.3, roundedCorners: 12
                    });
                    saveState(); rerender();
                }),
                createButton('Weird Theme', () => {
                    Object.assign(state, {
                        colorShift: 220, saturation: 220, contrast: 165, brightness: 120,
                        breathingAnimation: true, rainbowAnimation: true
                    });
                    saveState(); rerender();
                })
            );
        }

        if (activeTab === 'settings') {
            contentArea.append(
                sectionTitle('Settings'),
                createButton('Save Settings', () => saveState()),
                createButton('Reset Everything', () => {
                    localStorage.removeItem(SAVE_KEY);
                    Object.assign(state, {
                        gameSize: 100, gameRotation: 0, roundedCorners: 0, gameGlow: 0, gameTransparency: 100,
                        invertColors: 0, colorShift: 0, grayscale: 0, sepia: 0, saturation: 100,
                        contrast: 100, brightness: 100, blurEffect: 0,
                        websiteZoom: 100, menuOpacity: 96,
                        rainbowAnimation: false, breathingAnimation: false, screenShakeEffect: false,
                        hideBottomWebsiteBar: false, hidePopups: false, darkWebsiteBackground: false
                    });
                    rerender();
                }),
                createButton('Show Canvas Outline', () => {
                    const c = getGameCanvas();
                    if (c) c.style.outline = '2px solid #ff4d4d';
                }),
                createButton('Remove Canvas Outline', () => {
                    const c = getGameCanvas();
                    if (c) c.style.outline = '';
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
            position:absolute;inset:0;width:100%;height:100%;
            pointer-events:none;border-radius:14px;z-index:0;
        `;
        container.appendChild(trailCanvas);
        trailCtx = trailCanvas.getContext('2d');

        function resize() {
            trailCanvas.width = container.clientWidth;
            trailCanvas.height = container.clientHeight;
        }
        resize();
        new ResizeObserver(resize).observe(container);

        container.addEventListener('mousemove', e => {
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

        function animateTrail() {
            if (!trailCtx) return requestAnimationFrame(animateTrail);

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
                g.addColorStop(1, `rgba(83,216,255,0)`);
                trailCtx.fillStyle = g;
                trailCtx.beginPath();
                trailCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                trailCtx.fill();
            }

            requestAnimationFrame(animateTrail);
        }
        animateTrail();
    }

    function buildUI() {
        panel = document.createElement('div');
        panel.style.cssText = `
            position:fixed;top:20px;right:20px;z-index:999999;
            width:360px;max-height:86vh;overflow:hidden;
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
        inner.style.cssText = 'position:relative;z-index:1;display:flex;flex-direction:column;';

        const header = document.createElement('div');
        header.textContent = 'Dino Customization Menu';
        header.style.cssText = `
            padding:12px 14px;font-weight:700;cursor:move;
            border-bottom:1px solid rgba(255,255,255,.08);
            background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01));
            letter-spacing:.2px;
        `;

        tabsRow = document.createElement('div');
        tabsRow.style.cssText = 'display:flex;gap:8px;padding:10px 10px 0 10px;';

        contentArea = document.createElement('div');
        contentArea.style.cssText = 'padding:10px;overflow:auto;max-height:65vh;';

        inner.append(header, tabsRow, contentArea);
        panel.append(inner);
        document.body.append(panel);

        setupGlowTrail(panel);
        makeDraggable(panel, header);
        renderTabs();
        renderTabContent();
    }

    function makeDraggable(box, handle) {
        let dragging = false, ox = 0, oy = 0;

        handle.addEventListener('mousedown', e => {
            dragging = true;
            ox = e.clientX - box.offsetLeft;
            oy = e.clientY - box.offsetTop;
        });

        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            box.style.left = `${e.clientX - ox}px`;
            box.style.top = `${e.clientY - oy}px`;
            box.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => dragging = false);
    }

    function rerender() {
        if (panel) panel.remove();
        buildUI();
        applyVisuals();
    }

    function addHotkeys() {
        document.addEventListener('keydown', e => {
            if (e.key === 'F8' && panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
            if (e.key === 'F9') {
                state.invertColors = state.invertColors ? 0 : 100;
                saveState();
                rerender();
            }
        });
    }

    function init() {
        loadState();
        buildUI();
        applyVisuals();
        addHotkeys();
        requestAnimationFrame(loop);
        console.log('[Dino UI Mod] Loaded.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

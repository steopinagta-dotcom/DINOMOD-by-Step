(function () {
    'use strict';

    if (window.__DINO_CONFIG_MOD_LOADED__) return;
    window.__DINO_CONFIG_MOD_LOADED__ = true;

    function waitForConfig(cb) {
        const timer = setInterval(() => {
            if (window.DINO_CONFIG) {
                clearInterval(timer);
                cb(window.DINO_CONFIG);
            }
        }, 300);
    }

    waitForConfig(function (cfg) {
        console.log('[Dino Mod] DINO_CONFIG found:', cfg);

        const defaults = {
            speed: cfg.speed,
            maxSpeed: cfg.maxSpeed,
            acceleration: cfg.acceleration,
            gravity: cfg.gravity,
            gapCoefficient: cfg.gapCoefficient,
            initialJumpVelocity: cfg.initialJumpVelocity,
            minJumpHeight: cfg.minJumpHeight,
            nightMode: cfg.nightMode
        };

        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 280px;
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

        const header = document.createElement('div');
        header.textContent = 'Dino Mod Menu';
        header.style.cssText = `
            padding: 10px 12px;
            font-weight: bold;
            cursor: move;
            border-bottom: 1px solid #333;
            background: linear-gradient(180deg, #1f1f1f, #111);
            border-radius: 12px 12px 0 0;
        `;

        const body = document.createElement('div');
        body.style.padding = '10px';

        function addSlider(label, key, min, max, step) {
            const wrap = document.createElement('div');
            wrap.style.marginBottom = '10px';

            const top = document.createElement('div');
            top.style.display = 'flex';
            top.style.justifyContent = 'space-between';
            top.style.marginBottom = '4px';

            const name = document.createElement('span');
            name.textContent = label;

            const value = document.createElement('span');
            value.textContent = cfg[key];

            const input = document.createElement('input');
            input.type = 'range';
            input.min = min;
            input.max = max;
            input.step = step;
            input.value = cfg[key];
            input.style.width = '100%';

            input.addEventListener('input', function () {
                cfg[key] = Number(input.value);
                value.textContent = input.value;
            });

            top.appendChild(name);
            top.appendChild(value);
            wrap.appendChild(top);
            wrap.appendChild(input);
            body.appendChild(wrap);
        }

        function addCheckbox(label, key) {
            const wrap = document.createElement('label');
            wrap.style.display = 'flex';
            wrap.style.alignItems = 'center';
            wrap.style.gap = '8px';
            wrap.style.marginBottom = '10px';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = !!cfg[key];

            input.addEventListener('change', function () {
                cfg[key] = input.checked;
            });

            const text = document.createElement('span');
            text.textContent = label;

            wrap.appendChild(input);
            wrap.appendChild(text);
            body.appendChild(wrap);
        }

        function addButton(label, fn) {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.style.cssText = `
                width: 100%;
                margin-bottom: 8px;
                padding: 8px 10px;
                background: #1d1d1d;
                color: white;
                border: 1px solid #444;
                border-radius: 8px;
                cursor: pointer;
            `;
            btn.addEventListener('click', fn);
            body.appendChild(btn);
        }

        addCheckbox('Night Mode', 'nightMode');

        addSlider('Speed', 'speed', 1, 20, 0.5);
        addSlider('Max Speed', 'maxSpeed', 1, 50, 0.5);
        addSlider('Acceleration', 'acceleration', 0, 2, 0.01);
        addSlider('Gravity', 'gravity', 0.1, 3, 0.1);
        addSlider('Jump Velocity', 'initialJumpVelocity', 1, 30, 0.5);
        addSlider('Min Jump Height', 'minJumpHeight', 0, 100, 1);
        addSlider('Gap Coefficient', 'gapCoefficient', 0, 5, 0.1);

        addButton('Preset: Easy', function () {
            cfg.speed = 4;
            cfg.maxSpeed = 6;
            cfg.acceleration = 0;
            cfg.gravity = 0.5;
            cfg.initialJumpVelocity = 14;
            cfg.minJumpHeight = 20;
            cfg.gapCoefficient = 2.5;
            refreshUI();
        });

        addButton('Preset: Fast', function () {
            cfg.speed = 12;
            cfg.maxSpeed = 25;
            cfg.acceleration = 0.3;
            cfg.gravity = 0.7;
            cfg.initialJumpVelocity = 13;
            cfg.minJumpHeight = 20;
            cfg.gapCoefficient = 1.2;
            refreshUI();
        });

        addButton('Preset: Moon Jump', function () {
            cfg.gravity = 0.2;
            cfg.initialJumpVelocity = 18;
            cfg.minJumpHeight = 5;
            refreshUI();
        });

        addButton('Reset Defaults', function () {
            Object.assign(cfg, defaults);
            refreshUI();
        });

        addButton('Hide Menu (F8)', function () {
            panel.style.display = 'none';
        });

        panel.appendChild(header);
        panel.appendChild(body);
        document.body.appendChild(panel);

        function refreshUI() {
            body.innerHTML = '';

            addCheckbox('Night Mode', 'nightMode');

            addSlider('Speed', 'speed', 1, 20, 0.5);
            addSlider('Max Speed', 'maxSpeed', 1, 50, 0.5);
            addSlider('Acceleration', 'acceleration', 0, 2, 0.01);
            addSlider('Gravity', 'gravity', 0.1, 3, 0.1);
            addSlider('Jump Velocity', 'initialJumpVelocity', 1, 30, 0.5);
            addSlider('Min Jump Height', 'minJumpHeight', 0, 100, 1);
            addSlider('Gap Coefficient', 'gapCoefficient', 0, 5, 0.1);

            addButton('Preset: Easy', function () {
                cfg.speed = 4;
                cfg.maxSpeed = 6;
                cfg.acceleration = 0;
                cfg.gravity = 0.5;
                cfg.initialJumpVelocity = 14;
                cfg.minJumpHeight = 20;
                cfg.gapCoefficient = 2.5;
                refreshUI();
            });

            addButton('Preset: Fast', function () {
                cfg.speed = 12;
                cfg.maxSpeed = 25;
                cfg.acceleration = 0.3;
                cfg.gravity = 0.7;
                cfg.initialJumpVelocity = 13;
                cfg.minJumpHeight = 20;
                cfg.gapCoefficient = 1.2;
                refreshUI();
            });

            addButton('Preset: Moon Jump', function () {
                cfg.gravity = 0.2;
                cfg.initialJumpVelocity = 18;
                cfg.minJumpHeight = 5;
                refreshUI();
            });

            addButton('Reset Defaults', function () {
                Object.assign(cfg, defaults);
                refreshUI();
            });

            addButton('Hide Menu (F8)', function () {
                panel.style.display = 'none';
            });
        }

        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener('mousedown', function (e) {
            dragging = true;
            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;
        });

        document.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
            panel.style.right = 'auto';
        });

        document.addEventListener('mouseup', function () {
            dragging = false;
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'F8') {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
})();

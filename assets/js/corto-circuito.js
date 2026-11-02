/*
 * CORTO CIRCUITO — easter egg arcade del sito «education»
 * (c) prof. Pasquale Naclerio
 *
 * Snake su circuito stampato. Si attiva con il codice Konami
 * (↑ ↑ ↓ ↓ ← → ← → B A), sul telefono con gli stessi gesti
 * (swipe ↑ ↑ ↓ ↓ ← → ← → poi due tocchi) oppure con cinque tocchi
 * su «PLAYER 1» nella testata. Anche l'indirizzo con #insert-coin lo apre.
 *
 * File unico, nessuna libreria esterna. Il record e la scelta
 * dell'audio restano nel browser (localStorage).
 */
(function () {
  'use strict';
  if (window.__cortoCircuito) return;
  window.__cortoCircuito = true;

  /* ---------- costanti ---------- */
  var W = 240, H = 176, CELL = 8, COLS = 30, ROWS = 20, Y = 16;
  var KEY_HI = 'cortoCircuito.record', KEY_MUTE = 'cortoCircuito.muto';

  var P = {
    bg: '#0e4a2c', grid: '#1b6a42', trace: '#c99a2e', pad: '#d6d6d6',
    silk: '#e8efe6', head: '#fff6c2', body: '#ffb13b', edge: '#7a4f10',
    burnt: '#3a2a12', hud: '#06301c', hudt: '#e8efe6', chip: '#151515',
    res: '#e6c99a', bands: ['#7a3e12', '#7b3fbf', '#d22222', '#d4a017'],
    cap: '#2b5fd9', capS: '#cfd8ff', led: '#ff3b3b', ledH: '#ffd0d0',
    leg: '#c8c8c8', gold: '#ffd23f', smoke: '#5d6b62',
    spark: ['#fff6c2', '#ffd23f', '#ff7a1a', '#ffffff']
  };

  /* Font pixel 3×5. ^ _ < > sono le frecce. */
  var F = {
    A: '010101111101101', B: '110101110101110', C: '111100100100111', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '111100101101111', H: '101101111101101',
    I: '111010010010111', J: '001001001101111', K: '101101110101101', L: '100100100100111',
    M: '101111111101101', N: '110101101101101', O: '111101101101111', P: '111101111100100',
    Q: '111101101111001', R: '110101110101101', S: '111100111001111', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111',
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
    '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001001001001',
    '8': '111101111101111', '9': '111101111001111',
    '!': '010010010000010', '?': '111001011000010', '-': '000000111000000', '+': '000010111010000',
    '.': '000000000000010', ':': '000010000010000', '(': '010100100100010', ')': '010001001001010',
    '/': '001001010100100',
    '^': '010111010010010', '_': '010010010111010', '<': '001011111011001', '>': '100110111110100'
  };

  var TRACES = [
    [[1, 4], [5, 4], [5, 2], [10, 2]], [[28, 4], [24, 4], [24, 9], [27, 9]],
    [[2, 16], [9, 16], [9, 13], [12, 13]], [[27, 13], [21, 13], [21, 17], [17, 17]],
    [[17, 2], [17, 4], [20, 4]]
  ];
  var HOLES = [[1, 1], [28, 1], [1, 18], [28, 18]];
  /* posti degli integrati: angolo in alto a sinistra, 4×2 celle */
  var CHIP_SLOTS = [[13, 6], [13, 13], [5, 3], [22, 3], [5, 15], [22, 15]];
  var FOODS = [
    { k: 'res', pts: 10, w: 50 }, { k: 'cap', pts: 20, w: 30 }, { k: 'led', pts: 30, w: 20 }
  ];

  /* ---------- memoria locale ---------- */
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* niente */ } }

  /* ---------- stato ---------- */
  var ov = null, cv, cx, boardCv, raf = 0, last = 0, acc = 0, now = 0;
  var mode = 'title', modeT = 0;
  var snake, dir, queue, grow, food, bonus, blocked, chips;
  var score = 0, hi = parseInt(load(KEY_HI), 10) || 0, lives = 3, level = 1;
  var eatenLevel = 0, eatenTotal = 0, newHi = false;
  var parts = [], pops = [], flash = 0, shake = 0, crashAt = null;
  var muted = load(KEY_MUTE) === '1';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var prevFocus = null, prevOverflow = '';

  /* ---------- audio chiptune (Web Audio, nessun file) ---------- */
  var ac = null;
  function audio() {
    if (!ac) {
      var A = window.AudioContext || window.webkitAudioContext;
      if (A) ac = new A();
    }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f, dur, type, vol, delay, slide) {
    if (muted) return;
    var a = audio(); if (!a) return;
    var t = a.currentTime + (delay || 0);
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(vol || 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol) {
    if (muted) return;
    var a = audio(); if (!a) return;
    var n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
    s.buffer = b; f.type = 'lowpass';
    f.frequency.setValueAtTime(4000, t); f.frequency.exponentialRampToValueAtTime(150, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
  var SFX = {
    res: function () { tone(660, 0.06); tone(990, 0.08, 'square', 0.05, 0.05); },
    cap: function () { tone(523, 0.06); tone(784, 0.06, 'square', 0.05, 0.05); tone(1046, 0.08, 'square', 0.05, 0.1); },
    led: function () { tone(880, 0.25, 'triangle', 0.08, 0, 1760); },
    chip: function () { [523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, 0.07, 'square', 0.05, i * 0.05); }); },
    crash: function () { noise(0.6, 0.35); tone(220, 0.4, 'sawtooth', 0.06, 0, 40); },
    start: function () { [392, 523, 659, 784].forEach(function (f, i) { tone(f, 0.09, 'square', 0.05, i * 0.08); }); },
    level: function () { [523, 659, 784, 659, 784, 1046].forEach(function (f, i) { tone(f, 0.1, 'square', 0.05, i * 0.09); }); },
    over: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0.22, 'triangle', 0.08, i * 0.2); }); },
    blip: function () { tone(1200, 0.03, 'square', 0.03); }
  };

  /* ---------- disegno di base ---------- */
  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function textW(s, k) { return s.length * 4 * k - k; }
  function T(c, s, x, y, k, col, center, shadow) {
    if (center) x = Math.round(x - textW(s, k) / 2);
    if (shadow) T(c, s, x + k, y + k, k, shadow);
    c.fillStyle = col;
    for (var n = 0; n < s.length; n++) {
      var g = F[s[n]];
      if (g) for (var r = 0; r < 5; r++) for (var q = 0; q < 3; q++)
        if (g[r * 3 + q] === '1') c.fillRect(x + q * k, y + r * k, k, k);
      x += 4 * k;
    }
  }
  function pad5(n) { var s = String(Math.min(n, 99999)); while (s.length < 5) s = '0' + s; return s; }

  /* sprite 8×8 */
  function sRes(c, x, y) { R(c, x, y + 3, 8, 2, P.leg); R(c, x + 1, y + 2, 6, 4, P.res); [2, 3, 4, 6].forEach(function (o, i) { R(c, x + o, y + 2, 1, 4, P.bands[i]); }); }
  function sCap(c, x, y) { R(c, x + 3, y + 6, 1, 2, P.leg); R(c, x + 5, y + 6, 1, 2, P.leg); R(c, x + 2, y + 1, 5, 5, P.cap); R(c, x + 5, y + 1, 1, 5, P.capS); R(c, x + 2, y + 1, 5, 1, P.leg); }
  function sLed(c, x, y) { R(c, x + 3, y + 6, 1, 2, P.leg); R(c, x + 5, y + 6, 1, 2, P.leg); R(c, x + 3, y + 1, 3, 1, P.led); R(c, x + 2, y + 2, 5, 3, P.led); R(c, x + 1, y + 5, 7, 1, P.led); R(c, x + 3, y + 2, 1, 1, P.ledH); }
  function sChip(c, x, y, frame) {
    if (frame) R(c, x - 1, y - 1, 10, 10, P.gold);
    R(c, x, y, 8, 8, P.bg); R(c, x + 1, y + 1, 6, 6, P.chip);
    for (var i = 0; i < 3; i++) { R(c, x, y + 2 + i * 2, 1, 1, P.pad); R(c, x + 7, y + 2 + i * 2, 1, 1, P.pad); }
    R(c, x + 2, y + 2, 1, 1, P.gold);
  }
  function sFuse(c, x, y, ok) {
    R(c, x, y + 2, 2, 5, P.pad); R(c, x + 7, y + 2, 2, 5, P.pad);
    R(c, x + 2, y + 3, 5, 3, ok ? '#9fd8c0' : '#2a2a2a');
    if (ok) R(c, x + 2, y + 4, 5, 1, P.trace);
  }

  /* la scheda (statica) viene preparata una volta per livello */
  function buildBoard() {
    boardCv = document.createElement('canvas');
    boardCv.width = W; boardCv.height = H;
    var c = boardCv.getContext('2d');
    R(c, 0, 0, W, H, P.bg);
    for (var x = 0; x < COLS; x++) for (var y = 0; y < ROWS; y++) R(c, x * 8 + 4, Y + y * 8 + 4, 1, 1, P.grid);
    TRACES.forEach(function (t) {
      for (var i = 0; i < t.length - 1; i++) {
        var a = t[i], b = t[i + 1];
        R(c, Math.min(a[0], b[0]) * 8 + 3, Y + Math.min(a[1], b[1]) * 8 + 3,
          Math.abs(b[0] - a[0]) * 8 + 2, Math.abs(b[1] - a[1]) * 8 + 2, P.trace);
      }
      [t[0], t[t.length - 1]].forEach(function (p) {
        R(c, p[0] * 8 + 1, Y + p[1] * 8 + 1, 6, 6, P.pad); R(c, p[0] * 8 + 3, Y + p[1] * 8 + 3, 2, 2, P.bg);
      });
    });
    HOLES.forEach(function (h) {
      var x = h[0] * 8, y = Y + h[1] * 8;
      R(c, x - 1, y + 1, 10, 6, P.pad); R(c, x + 1, y - 1, 6, 10, P.pad); R(c, x + 1, y + 1, 6, 6, '#062014');
    });
    chips.forEach(function (s, i) {
      var x = s[0] * 8, y = Y + s[1] * 8;
      R(c, x, y, 32, 16, P.chip);
      for (var k = 0; k < 4; k++) { R(c, x + 3 + k * 8, y - 3, 3, 3, P.pad); R(c, x + 3 + k * 8, y + 16, 3, 3, P.pad); }
      R(c, x, y + 6, 2, 4, P.bg);
      T(c, 'U' + (i + 1), x + 1, y + 21, 1, P.silk);
    });
    T(c, 'R7', 50, Y + 26, 1, P.silk);
    T(c, 'C3', 150, Y + 34, 1, P.silk);
  }

  /* ---------- logica ---------- */
  function key(x, y) { return x + ',' + y; }
  function tickMs() { return Math.max(55, 135 - (level - 1) * 12); }

  function setupLevel() {
    chips = CHIP_SLOTS.slice(0, Math.min(level, CHIP_SLOTS.length));
    blocked = {};
    HOLES.forEach(function (h) { blocked[key(h[0], h[1])] = 1; });
    chips.forEach(function (s) { for (var dx = 0; dx < 4; dx++) for (var dy = 0; dy < 2; dy++) blocked[key(s[0] + dx, s[1] + dy)] = 1; });
    buildBoard();
    eatenLevel = 0;
    resetSnake();
  }
  function resetSnake() {
    snake = [[5, 10], [4, 10], [3, 10], [2, 10]];
    dir = [1, 0]; queue = []; grow = 0; bonus = null;
    food = spawn();
  }
  function free(x, y) {
    if (blocked[key(x, y)]) return false;
    for (var i = 0; i < snake.length; i++) if (snake[i][0] === x && snake[i][1] === y) return false;
    if (food && food.x === x && food.y === y) return false;
    if (bonus && bonus.x === x && bonus.y === y) return false;
    return true;
  }
  function spawn() {
    var r = Math.random() * 100, t = FOODS[0];
    for (var i = 0, s = 0; i < FOODS.length; i++) { s += FOODS[i].w; if (r < s) { t = FOODS[i]; break; } }
    for (var n = 0; n < 500; n++) {
      var x = 1 + Math.floor(Math.random() * (COLS - 2)), y = 1 + Math.floor(Math.random() * (ROWS - 2));
      if (free(x, y) && Math.abs(x - snake[0][0]) + Math.abs(y - snake[0][1]) > 3) return { x: x, y: y, t: t };
    }
    return null;
  }
  function startGame() {
    score = 0; lives = 3; level = 1; eatenTotal = 0; newHi = false; parts = []; pops = [];
    setupLevel(); setMode('ready'); SFX.start();
  }
  function setMode(m) { mode = m; modeT = 0; }

  function turn(d) {
    var lastD = queue.length ? queue[queue.length - 1] : dir;
    if (d[0] === -lastD[0] && d[1] === -lastD[1]) return;
    if (d[0] === lastD[0] && d[1] === lastD[1]) return;
    if (queue.length < 2) queue.push(d);
  }

  function step() {
    if (queue.length) dir = queue.shift();
    var h = snake[0], nx = h[0] + dir[0], ny = h[1] + dir[1];
    var out = nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS;
    var hit = out || blocked[key(nx, ny)];
    if (!hit) {
      var len = grow > 0 ? snake.length : snake.length - 1;
      for (var i = 0; i < len; i++) if (snake[i][0] === nx && snake[i][1] === ny) { hit = true; break; }
    }
    if (hit) { crash(); return; }
    snake.unshift([nx, ny]);
    if (food && nx === food.x && ny === food.y) eat(food.t.pts, food.t.k, nx, ny, 1);
    if (bonus && nx === bonus.x && ny === bonus.y) { eat(50, 'chip', nx, ny, 2); bonus = null; }
    if (grow > 0) grow--; else snake.pop();
    if (eatenLevel >= 10) { setMode('levelup'); SFX.level(); }
  }

  function eat(pts, k, x, y, g) {
    score += pts; grow += g; eatenLevel++; eatenTotal++;
    pops.push({ x: x * 8 + 4, y: Y + y * 8, s: '+' + pts, t: 0 });
    SFX[k]();
    if (k === 'led') flash = 220;
    if (k !== 'chip') {
      food = null; food = spawn();
      if (eatenTotal % 5 === 0 && !bonus) {
        var b = spawn();
        if (b) bonus = { x: b.x, y: b.y, ttl: 7000 };
      }
    }
  }

  function crash() {
    var h = snake[0];
    crashAt = [h[0] * 8 + 4 + dir[0] * 4, Y + h[1] * 8 + 4 + dir[1] * 4];
    for (var i = 0; i < 70; i++) {
      var a = Math.random() * Math.PI * 2, v = 20 + Math.random() * 90;
      parts.push({ x: crashAt[0], y: crashAt[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 0.4 + Math.random() * 0.7, t: 0, c: P.spark[i % 4], s: Math.random() < 0.3 ? 2 : 1 });
    }
    for (var j = 0; j < 14; j++)
      parts.push({ x: crashAt[0] + (Math.random() * 12 - 6), y: crashAt[1], vx: Math.random() * 10 - 5, vy: -12 - Math.random() * 18, life: 1.2 + Math.random() * 0.6, t: 0, c: P.smoke, s: 3, smoke: 1 });
    shake = reduce ? 0 : 350;
    lives--;
    SFX.crash();
    setMode('crash');
  }

  /* ---------- ciclo ---------- */
  function update(dt) {
    modeT += dt;
    if (flash > 0) flash -= dt;
    if (shake > 0) shake -= dt;
    parts = parts.filter(function (p) {
      p.t += dt / 1000; p.x += p.vx * dt / 1000; p.y += p.vy * dt / 1000;
      if (!p.smoke) p.vy += 120 * dt / 1000;
      return p.t < p.life;
    });
    pops = pops.filter(function (p) { p.t += dt; return p.t < 700; });

    if (mode === 'play') {
      if (bonus) { bonus.ttl -= dt; if (bonus.ttl <= 0) bonus = null; }
      acc += dt;
      var ms = tickMs();
      while (acc >= ms && mode === 'play') { acc -= ms; step(); }
    } else acc = 0;

    if (mode === 'ready' && modeT > 1400) setMode('play');
    if (mode === 'crash' && modeT > 1500) {
      parts = [];
      if (lives > 0) { resetSnake(); setMode('ready'); }
      else {
        if (score > hi) { hi = score; newHi = true; save(KEY_HI, String(hi)); }
        setMode('over'); SFX.over();
      }
    }
    if (mode === 'levelup' && modeT > 2000) { level++; setupLevel(); setMode('ready'); }
  }

  function drawSnake(c, burnt) {
    var C = function (p) { return [p[0] * 8 + 4, Y + p[1] * 8 + 4]; };
    [[6, burnt ? '#1c140a' : P.edge], [4, burnt ? P.burnt : P.body]].forEach(function (l) {
      var w = l[0];
      for (var i = 0; i < snake.length - 1; i++) {
        var a = C(snake[i]), b = C(snake[i + 1]);
        R(c, Math.min(a[0], b[0]) - w / 2, Math.min(a[1], b[1]) - w / 2, Math.abs(b[0] - a[0]) + w, Math.abs(b[1] - a[1]) + w, l[1]);
      }
      if (snake.length === 1) { var s = C(snake[0]); R(c, s[0] - w / 2, s[1] - w / 2, w, w, l[1]); }
    });
    var h = C(snake[0]);
    if (burnt) { R(c, h[0] - 3, h[1] - 3, 6, 6, '#111'); return; }
    var phase = Math.floor(now / 90);
    for (var i = 1; i < snake.length; i++) if ((i + phase) % 3 === 0) { var d = C(snake[i]); R(c, d[0] - 1, d[1] - 1, 2, 2, P.head); }
    c.globalAlpha = 0.25; R(c, h[0] - 8, h[1] - 8, 16, 16, P.body);
    c.globalAlpha = 0.5; R(c, h[0] - 6, h[1] - 6, 12, 12, P.body);
    c.globalAlpha = 1; R(c, h[0] - 4, h[1] - 4, 8, 8, P.head); R(c, h[0] - 2, h[1] - 2, 4, 4, P.body);
  }

  function drawHud(c) {
    R(c, 0, 0, W, 14, P.hud); R(c, 0, 14, W, 1, P.pad);
    T(c, 'SCORE ' + pad5(score), 4, 2, 2, P.hudt);
    T(c, 'HI ' + pad5(Math.max(hi, score)), 96, 2, 2, P.hudt);
    for (var i = 0; i < 3; i++) sFuse(c, 166 + i * 11, 3, i < lives);
    T(c, 'LV' + level, 204, 2, 2, P.gold);
  }

  function veil(c, a) { c.globalAlpha = a; R(c, 0, 0, W, H, P.hud); c.globalAlpha = 1; }
  function band(c, y, h) { c.globalAlpha = 0.82; R(c, 0, y, W, h, P.hud); c.globalAlpha = 1; }
  var blink = function (ms) { return Math.floor(now / (ms || 450)) % 2 === 0; };

  function drawTitle(c) {
    c.drawImage(boardCv, 0, 0); veil(c, 0.78);
    T(c, 'CORTO', W / 2, 18, 4, P.hudt, true, '#000');
    T(c, 'CIRCUITO', W / 2, 42, 4, P.body, true, '#000');
    var save_ = snake; snake = [];
    var head = 4 + Math.floor(now / 70) % 21;
    for (var x = head; x >= Math.max(4, head - 12); x--) snake.push([x, 8]);
    drawSnake(c); snake = save_;
    T(c, 'HI-SCORE ' + pad5(hi), W / 2, 96, 2, P.pad, true);
    if (blink()) T(c, 'PRESS START', W / 2, 116, 2, P.gold, true, '#000');
    T(c, coarse ? 'SWIPE PER GIRARE' : 'FRECCE  P PAUSA  M AUDIO  ESC ESCI', W / 2, 142, 1, P.silk, true);
    T(c, '(C) PROF. PN', W / 2, 160, 1, P.trace, true);
  }

  function render() {
    var c = cx;
    c.save();
    if (shake > 0) c.translate(Math.round(Math.random() * 4 - 2), Math.round(Math.random() * 4 - 2));
    if (mode === 'title') { drawTitle(c); c.restore(); return; }

    c.drawImage(boardCv, 0, 0);
    if (food) { var fx = food.x * 8, fy = Y + food.y * 8; (food.t.k === 'res' ? sRes : food.t.k === 'cap' ? sCap : sLed)(c, fx, fy); }
    if (bonus && (bonus.ttl > 2000 || blink(120))) sChip(c, bonus.x * 8, Y + bonus.y * 8, blink(250));
    drawSnake(c, mode === 'crash' || mode === 'over');
    if (flash > 0) { c.globalAlpha = 0.18 * flash / 220; R(c, 0, Y, W, H - Y, P.led); c.globalAlpha = 1; }
    parts.forEach(function (p) {
      c.globalAlpha = p.smoke ? 0.6 * (1 - p.t / p.life) : 1;
      R(c, Math.round(p.x), Math.round(p.y), p.s, p.s, p.c);
    });
    c.globalAlpha = 1;
    if (mode === 'crash' && modeT < 120) { R(c, crashAt[0] - 4, crashAt[1] - 4, 8, 8, '#fff'); }
    pops.forEach(function (p) { T(c, p.s, p.x, Math.round(p.y - p.t / 70), 1, P.gold, true, '#000'); });
    c.restore();
    drawHud(c);

    if (mode === 'ready') {
      band(c, 70, 30);
      T(c, modeT < 1000 ? 'PRONTI?' : 'VIA!', W / 2, 75, 4, P.gold, true, '#000');
    } else if (mode === 'pause') {
      veil(c, 0.6);
      T(c, 'PAUSA', W / 2, 70, 4, P.hudt, true, '#000');
      if (blink()) T(c, coarse ? 'TOCCA PER RIPRENDERE' : 'P PER RIPRENDERE', W / 2, 104, 1, P.gold, true);
    } else if (mode === 'crash' && modeT > 300) {
      band(c, 22, 30);
      T(c, 'CORTO!', W / 2, 27, 4, P.gold, true, '#000');
    } else if (mode === 'levelup') {
      band(c, 52, 64);
      T(c, 'SCHEDA', W / 2, 58, 3, P.hudt, true, '#000');
      T(c, 'COMPLETATA!', W / 2, 78, 3, P.gold, true, '#000');
      T(c, 'LIVELLO ' + (level + 1), W / 2, 102, 2, P.pad, true);
    } else if (mode === 'over') {
      veil(c, 0.45);
      band(c, 20, 46);
      T(c, 'CORTO', W / 2, 24, 3, P.gold, true, '#000');
      T(c, 'CIRCUITO!', W / 2, 44, 3, P.gold, true, '#000');
      band(c, 112, 52);
      T(c, 'SCORE ' + pad5(score), W / 2, 116, 2, P.hudt, true);
      if (newHi && blink(250)) T(c, 'NUOVO RECORD!', W / 2, 132, 2, P.body, true);
      if (!newHi) T(c, 'GAME OVER', W / 2, 132, 2, P.pad, true);
      if (modeT > 800 && blink()) T(c, 'PRESS START', W / 2, 150, 2, P.gold, true, '#000');
    }
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    var dt = last ? Math.min(t - last, 100) : 16;
    last = t; now = t;
    update(dt);
    render();
  }

  /* ---------- interfaccia ---------- */
  var CSS =
    '.cc-ov{position:fixed;inset:0;z-index:2147483000;background:#04140b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;touch-action:none;-webkit-user-select:none;user-select:none;outline:none}' +
    '.cc-scr{position:relative;border:4px solid #c99a2e;box-shadow:8px 8px 0 #000;background:#0e4a2c;line-height:0}' +
    '.cc-scr canvas{display:block;image-rendering:pixelated;image-rendering:crisp-edges}' +
    '.cc-scr:after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,rgba(0,0,0,.16) 0,rgba(0,0,0,.16) 1px,transparent 1px,transparent 3px)}' +
    '.cc-bar{position:absolute;top:12px;right:12px;display:flex;gap:8px}' +
    '.cc-btn{font:10px/1 "Press Start 2P",ui-monospace,monospace;color:#06301c;background:#ffd23f;border:3px solid #000;box-shadow:3px 3px 0 #000;padding:9px 10px;cursor:pointer}' +
    '.cc-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #000}' +
    '.cc-btn:focus-visible{outline:3px solid #fff6c2;outline-offset:2px}' +
    '.cc-pad{display:grid;grid-template-columns:repeat(3,72px);grid-template-rows:repeat(2,60px);gap:8px}' +
    '.cc-pad .cc-btn{font-size:18px;padding:0}' +
    '.cc-pad [data-d="up"]{grid-column:2;grid-row:1}.cc-pad [data-d="left"]{grid-column:1;grid-row:2}' +
    '.cc-pad [data-d="down"]{grid-column:2;grid-row:2}.cc-pad [data-d="right"]{grid-column:3;grid-row:2}';

  var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  function fit() {
    if (!ov) return;
    var aw = window.innerWidth - 24, ah = window.innerHeight - (coarse ? 190 : 90);
    var s = Math.min(aw / W, ah / H);
    if (s >= 2) s = Math.floor(s);
    s = Math.max(s, 1);
    cv.style.width = Math.round(W * s) + 'px';
    cv.style.height = Math.round(H * s) + 'px';
  }

  function muteLabel() { return muted ? '\u266A OFF' : '\u266A ON'; }
  function toggleMute() {
    muted = !muted; save(KEY_MUTE, muted ? '1' : '0');
    var b = ov && ov.querySelector('[data-a="mute"]');
    if (b) { b.textContent = muteLabel(); b.setAttribute('aria-pressed', String(!muted)); }
    if (!muted) SFX.blip();
  }

  function primary() {
    if (mode === 'title' || (mode === 'over' && modeT > 800)) startGame();
    else if (mode === 'pause') setMode('play');
  }
  function togglePause() {
    if (mode === 'play') setMode('pause');
    else if (mode === 'pause') setMode('play');
  }

  function open() {
    if (ov) return;
    if (!document.getElementById('cc-style')) {
      var st = document.createElement('style'); st.id = 'cc-style'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    prevFocus = document.activeElement;
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    ov = document.createElement('div');
    ov.className = 'cc-ov'; ov.tabIndex = -1;
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Corto Circuito, videogioco');
    ov.innerHTML =
      '<div class="cc-bar"><button class="cc-btn" data-a="mute" aria-pressed="' + (!muted) + '">' + muteLabel() + '</button>' +
      '<button class="cc-btn" data-a="close" aria-label="Chiudi il gioco">X</button></div>' +
      '<div class="cc-scr"><canvas width="' + W + '" height="' + H + '"></canvas></div>' +
      (coarse ? '<div class="cc-pad"><button class="cc-btn" data-d="up" aria-label="Su">\u25B2</button><button class="cc-btn" data-d="left" aria-label="Sinistra">\u25C0</button><button class="cc-btn" data-d="down" aria-label="Giù">\u25BC</button><button class="cc-btn" data-d="right" aria-label="Destra">\u25B6</button></div>' : '');
    document.body.appendChild(ov);
    cv = ov.querySelector('canvas'); cx = cv.getContext('2d');
    cx.imageSmoothingEnabled = false;

    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]');
      if (!b) return;
      if (b.getAttribute('data-a') === 'close') close();
      else toggleMute();
    });
    ov.addEventListener('pointerdown', function (e) {
      var b = e.target.closest('[data-d]');
      if (!b) return;
      e.preventDefault();
      if (mode === 'play') turn(DIRS[b.getAttribute('data-d')]);
      else primary();
    });
    var t0 = null;
    ov.addEventListener('touchstart', function (e) {
      if (e.target.closest('button')) return;
      var p = e.changedTouches[0]; t0 = [p.clientX, p.clientY];
    }, { passive: true });
    ov.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    ov.addEventListener('touchend', function (e) {
      if (!t0 || e.target.closest('button')) return;
      var p = e.changedTouches[0], dx = p.clientX - t0[0], dy = p.clientY - t0[1]; t0 = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) { primary(); return; }
      var d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      if (mode === 'play') turn(DIRS[d]); else primary();
    });
    cv.addEventListener('click', function () { if (!coarse) primary(); });

    window.addEventListener('resize', fit);
    fit();
    snake = [];
    setMode('title');
    chips = CHIP_SLOTS.slice(0, 1); buildBoard();
    last = 0; raf = requestAnimationFrame(loop);
    ov.focus();
    audio();
  }

  function close() {
    if (!ov) return;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', fit);
    ov.remove(); ov = null;
    document.documentElement.style.overflow = prevOverflow;
    if (prevFocus && prevFocus.focus) prevFocus.focus();
    if (location.hash === '#insert-coin') history.replaceState(null, '', location.pathname + location.search);
  }

  /* ---------- tastiera: gioco e codice Konami ---------- */
  var KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  var kPos = 0;

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if (ov) {
      var used = true;
      if (k === 'escape') close();
      else if (k === 'arrowup' || k === 'w') { if (mode === 'play') turn(DIRS.up); }
      else if (k === 'arrowdown' || k === 's') { if (mode === 'play') turn(DIRS.down); }
      else if (k === 'arrowleft' || k === 'a') { if (mode === 'play') turn(DIRS.left); }
      else if (k === 'arrowright' || k === 'd') { if (mode === 'play') turn(DIRS.right); }
      else if (k === 'p') togglePause();
      else if (k === 'm') toggleMute();
      else if (k === 'enter' || k === ' ') { if (mode === 'play') togglePause(); else primary(); }
      else if (k === 'tab') used = false;
      else used = false;
      if (used) { e.preventDefault(); e.stopPropagation(); }
      return;
    }
    var t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    if (k === KONAMI[kPos]) {
      kPos++;
      if (kPos === KONAMI.length) { kPos = 0; e.preventDefault(); open(); }
    } else kPos = (k === KONAMI[0]) ? 1 : 0;
  }, true);

  /* ---------- telefono: gesti Konami e tocchi su «PLAYER 1» ---------- */
  var GESTI = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'tap', 'tap'];
  var gPos = 0, gLast = 0, g0 = null;
  document.addEventListener('touchstart', function (e) {
    if (ov) return;
    var p = e.changedTouches[0]; g0 = [p.clientX, p.clientY];
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (ov || !g0) return;
    var p = e.changedTouches[0], dx = p.clientX - g0[0], dy = p.clientY - g0[1]; g0 = null;
    var g = Math.max(Math.abs(dx), Math.abs(dy)) < 20 ? 'tap'
      : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    var t = Date.now();
    if (t - gLast > 2500) gPos = 0;
    gLast = t;
    if (g === GESTI[gPos]) { gPos++; if (gPos === GESTI.length) { gPos = 0; open(); } }
    else gPos = (g === GESTI[0]) ? 1 : 0;
  }, { passive: true });

  var taps = 0, tapT = 0;
  document.addEventListener('click', function (e) {
    if (ov) return;
    var el = e.target.closest && e.target.closest('.giocatore, [data-arcade]');
    if (!el) return;
    var t = Date.now();
    taps = (t - tapT < 600) ? taps + 1 : 1;
    tapT = t;
    if (taps >= 5) { taps = 0; open(); }
  });

  document.addEventListener('visibilitychange', function () { if (document.hidden && mode === 'play' && ov) setMode('pause'); });
  window.addEventListener('blur', function () { if (mode === 'play' && ov) setMode('pause'); });

  function fromHash() { if (location.hash === '#insert-coin') open(); }
  window.addEventListener('hashchange', fromHash);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fromHash); else fromHash();

  window.cortoCircuito = { apri: open, chiudi: close };
})();

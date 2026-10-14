/* ==========================================================================
   PIANO COMPLESSO DELL'IMPEDENZA: triangolo R, jX, Z con l'angolo φ
   ========================================================================== */
(function (L) {
  const zc = L.$('#zplane'), zx = zc.getContext('2d');
  let ZW = 0;
  const ZH = 200;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    ZW = zc.clientWidth;
    zc.width = Math.round(ZW * dpr); zc.height = Math.round(ZH * dpr);
    zx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    const S = L.S, d = L.D, C = L.C;
    if (!d || !ZW) return;
    const text = (...a) => L.text(zx, ...a), arrow = (...a) => L.arrow(zx, ...a);
    zx.clearRect(0, 0, ZW, ZH);
    if (!isFinite(d.Zmag)) { text('Corrente nulla: impedenza infinita (circuito aperto)', ZW / 2, ZH / 2, C.muted, 12, 'center', 'middle'); return; }

    const rlc = S.useZ && S.zType === 'RLC';
    const neg = d.Zre < -1e-9;                 // parte reale negativa: bipolo attivo
    const ox = neg ? ZW / 2 : 34, oy = ZH / 2;
    const availX = neg ? ox - 40 : ZW - ox - 70, availY = oy - 22;
    const up = rlc ? d.XL : Math.max(0, d.Zim);
    const down = rlc ? Math.max(0, d.XC - d.XL) : Math.max(0, -d.Zim);
    const k = Math.min(availX / Math.max(Math.abs(d.Zre), 1e-12), availY / Math.max(up, down, 1e-12));

    // assi
    zx.strokeStyle = C.line; zx.lineWidth = 1;
    zx.beginPath(); zx.moveTo(neg ? 10 : ox - 10, oy); zx.lineTo(ZW - 10, oy); zx.moveTo(ox, 8); zx.lineTo(ox, ZH - 8); zx.stroke();
    text('Re', ZW - 12, oy - 9, C.muted, 12, 'right', 'middle');
    text('Im', ox + 6, 12, C.muted, 12, 'left', 'middle');

    // parte reale R
    const rx = ox + d.Zre * k, ex = rx, ey = oy - d.Zim * k;
    zx.setLineDash([4, 3]); zx.strokeStyle = C.muted; zx.lineWidth = 1.5;
    zx.beginPath(); zx.moveTo(ox, oy); zx.lineTo(rx, oy); zx.stroke(); zx.setLineDash([]);
    if (Math.abs(d.Zre * k) > 14) text('R', (ox + rx) / 2, oy + (d.Zim >= 0 ? 12 : -12), C.muted, 12, 'center', 'middle');

    // parte immaginaria: nel circuito RLC si vedono X_L e X_C separate
    if (rlc) {
      const yL = oy - d.XL * k;
      arrow(rx, oy, rx, yL, C.muted, 1.5);
      arrow(rx + 10, yL, rx + 10, ey, C.muted, 1.5);
      text('jX', rx - 6, (oy + yL) / 2, C.muted, 12, 'right', 'middle'); text('L', rx - 6, (oy + yL) / 2 + 5, C.muted, 9, 'left', 'top');
      text('−jX', rx + 16, (yL + ey) / 2, C.muted, 12, 'left', 'middle'); text('C', rx + 38, (yL + ey) / 2 + 5, C.muted, 9, 'left', 'top');
    } else {
      zx.setLineDash([4, 3]); zx.strokeStyle = C.muted;
      zx.beginPath(); zx.moveTo(rx, oy); zx.lineTo(ex, ey); zx.stroke(); zx.setLineDash([]);
      if (Math.abs(d.Zim * k) > 14) text(d.Zim >= 0 ? 'jX' : '−jX', ex + (neg ? -6 : 6), (oy + ey) / 2, C.muted, 12, neg ? 'right' : 'left', 'middle');
    }

    // angolo φ
    const ang = Math.atan2(d.Zim, d.Zre);
    if (Math.abs(ang) > 0.02) {
      const r = 28; zx.strokeStyle = C.phase; zx.lineWidth = 2;
      zx.beginPath(); zx.arc(ox, oy, r, 0, -ang, ang > 0); zx.stroke();
      text('φ', ox + (r + 10) * Math.cos(ang / 2), oy - (r + 10) * Math.sin(ang / 2), C.phase, 14, 'center', 'middle', true);
    }

    // vettore Z
    arrow(ox, oy, ex, ey, C.ink, 2.5);
    text('Z', ex + (neg ? -8 : (rlc ? 22 : 8)), ey + (d.Zim >= 0 ? -6 : 6), C.ink, 14, neg ? 'right' : 'left', 'middle', true);
  }

  L.zplane = { resize, draw };
})(window.LAB);

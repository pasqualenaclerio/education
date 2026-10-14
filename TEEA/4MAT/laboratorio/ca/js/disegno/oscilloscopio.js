/* ==========================================================================
   OSCILLOSCOPIO: circonferenza con i fasori (a sinistra)
   e sinusoidi generate dalla loro proiezione (a destra)
   ========================================================================== */
(function (L) {
  const { D2R, TAU } = L;
  const cv = L.$('#scope'), ctx = cv.getContext('2d');
  const liveEl = L.$('#live');
  let W = 0, H = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = cv.parentElement.clientWidth;
    H = Math.round(Math.max(250, Math.min(460, W < 600 ? W * 0.78 : W * 0.44)));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const S = L.S, d = L.D, C = L.C, fmt = L.fmt;
    if (!d || !W) return;
    const text = (...a) => L.text(ctx, ...a), arrow = (...a) => L.arrow(ctx, ...a), dot = (...a) => L.dot(ctx, ...a);
    const Wt = L.windowT();
    ctx.clearRect(0, 0, W, H);

    // Geometria: raggio della circonferenza e area delle sinusoidi
    const narrow = W < 600;
    const R = Math.max(40, Math.min(H / 2 - 30, W * (narrow ? 0.2 : 0.18)));
    const cx = 10 + R, cy = H / 2;
    const x0 = cx + R + (narrow ? 30 : 46), x1 = W - (narrow ? 26 : 40), ww = x1 - x0;
    const aW = d.w * Wt;                 // larghezza della finestra espressa come angolo ωt
    const X = a => x0 + a / aW * ww;     // angolo -> coordinata x
    const ac = d.w * S.t;                // angolo del cursore
    const tv = S.thv * D2R, ti = d.thi * D2R;
    // lunghezza dei fasori nella stessa scala dell'asse Y (con la scala bloccata non escono dal cerchio)
    const rv = Math.min(S.Vm / d.Vs, 1.05) * R, ri = Math.min(d.Im / d.Is, 1.05) * R;
    const Yv = v => cy - v / d.Vs * R, Yi = i => cy - i / d.Is * R;
    const periods = aW / TAU;
    const dense = ww / periods < 6;      // troppi periodi per essere leggibili

    /* --- griglia --- */
    ctx.lineWidth = 1; ctx.setLineDash([]); ctx.strokeStyle = C.grid;
    ctx.beginPath();
    for (const k of [-1, -0.5, 0.5, 1]) { ctx.moveTo(x0, cy - k * R); ctx.lineTo(x1, cy - k * R); }
    for (let k = 0; k <= 8; k++) { const x = x0 + k * ww / 8; ctx.moveTo(x, cy - R - 6); ctx.lineTo(x, cy + R + 6); }
    ctx.stroke();
    ctx.strokeStyle = C.line; ctx.beginPath();
    ctx.moveTo(x0, cy); ctx.lineTo(x1 + 8, cy); ctx.moveTo(x0, cy - R - 10); ctx.lineTo(x0, cy + R + 10); ctx.stroke();

    const ls = narrow ? 10 : 11;
    for (let k = 0; k <= 8; k += (narrow ? 2 : 1)) {
      const x = x0 + k * ww / 8;
      const lab = S.xaxis === 'deg' ? (k * 90) + '°' : L.fmtT(k * S.tb);
      text(lab, x, cy + R + 10, C.muted, ls, 'center', 'top');
    }
    text(S.xaxis === 'deg' ? 'ωt' : 't', x1 + 2, cy - 4, C.muted, ls, 'left', 'bottom', true);
    // etichette dell'asse Y: tensione a sinistra, corrente a destra (fondo scala e metà)
    for (const k of [1, 0.5, -0.5, -1]) {
      const y = cy - k * R, segno = k < 0 ? '−' : '';
      if (S.showV) text(segno + fmt(Math.abs(k) * d.Vs) + (k === 1 ? ' V' : ''), x0 - 4, y, C.volt, ls, 'right', 'middle');
      if (S.showI) text(segno + fmt(Math.abs(k) * d.Is) + (k === 1 ? ' A' : ''), x1 + 4, y, C.curr, ls, 'left', 'middle');
    }
    // avviso quando la scala è bloccata e un'onda esce dal grafico
    const fuori = [];
    if (S.showV && S.Vm > d.Vs * 1.0001) fuori.push('tensione');
    if (S.showI && d.Im > d.Is * 1.0001) fuori.push('corrente');
    if (fuori.length) text('Fuori scala: ' + fuori.join(' e ') + '. Riattiva la scala automatica.', x0 + 6, cy - R - 14, C.ink, ls, 'left', 'bottom', true);

    /* --- banda dello sfasamento tra due passaggi per lo zero --- */
    const phOK = S.showPh && S.showV && S.showI && d.Im > 0 && S.Vm > 0;
    if (phOK && !dense) {
      const ph = d.phi * D2R, av0 = ((-tv) % TAU + TAU) % TAU;
      let pick = null, first = null;
      for (let k = 0; k < 60; k++) {
        const av = av0 + k * TAU, ai = av + ph;
        if (Math.min(av, ai) < 0) continue;
        if (Math.max(av, ai) > aW) break;
        if (first === null) first = [av, ai];
        if (av >= Math.PI) { pick = [av, ai]; break; }
      }
      pick = pick || first;
      if (pick) {
        const xa = X(pick[0]), xb = X(pick[1]);
        ctx.globalAlpha = 0.14; ctx.fillStyle = C.phase;
        ctx.fillRect(Math.min(xa, xb), cy - R, Math.abs(xb - xa), 2 * R); ctx.globalAlpha = 1;
        ctx.setLineDash([4, 4]); ctx.strokeStyle = C.phase; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xa, cy - R); ctx.lineTo(xa, cy + R); ctx.moveTo(xb, cy - R); ctx.lineTo(xb, cy + R); ctx.stroke();
        ctx.setLineDash([]);
        if (Math.abs(xb - xa) > 6) {
          const yb = cy + R * 0.72;
          arrow((xa + xb) / 2, yb, xb, yb, C.phase, 1.5); arrow((xa + xb) / 2, yb, xa, yb, C.phase, 1.5);
          text('Δt = ' + L.fmtT(Math.abs(d.phi) / 360 * d.T), (xa + xb) / 2, yb - 5, C.phase, ls + 1, 'center', 'bottom', true);
        }
        dot(xa, cy, 3.5, C.volt); dot(xb, cy, 3.5, C.curr);
      }
    }

    /* --- valori efficaci --- */
    if (S.showRms) {
      ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
      if (S.showV) {
        ctx.strokeStyle = C.volt; ctx.beginPath();
        for (const s of [1, -1]) { ctx.moveTo(x0, Yv(s * d.Vrms)); ctx.lineTo(x1, Yv(s * d.Vrms)); }
        ctx.stroke(); text('V eff', x1 - 2, Yv(d.Vrms) - 3, C.volt, ls, 'right', 'bottom');
      }
      if (S.showI) {
        ctx.strokeStyle = C.curr; ctx.beginPath();
        for (const s of [1, -1]) { ctx.moveTo(x0, Yi(s * d.Irms)); ctx.lineTo(x1, Yi(s * d.Irms)); }
        ctx.stroke(); text('I eff', x1 - 2, Yi(-d.Irms) + 3, C.curr, ls, 'right', 'top');
      }
      ctx.setLineDash([]);
    }

    /* --- sinusoidi (ritagliate sull'area del grafico) --- */
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, cy - R - 12, ww, 2 * R + 24); ctx.clip();
    const curve = (fy, color, width, from, to, alpha = 1) => {
      if (to <= from) return;
      ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash([]);
      ctx.beginPath();
      const frac = (to - from) / aW;
      const n = Math.max(2, Math.ceil(frac * Math.min(40000, Math.max(ww * 1.5, periods * 32))));
      for (let k = 0; k <= n; k++) {
        const al = from + (to - from) * k / n, x = X(al), y = fy(al);
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    };
    const fv = al => Yv(S.Vm * Math.sin(al + tv));
    const fi = al => Yi(d.Im * Math.sin(al + ti));
    const VI = S.Vm * d.Im;
    const fp = al => cy - (S.Vm * Math.sin(al + tv)) * (d.Im * Math.sin(al + ti)) / VI * R;
    const series = [];
    if (S.showPw && VI > 0) series.push([fp, C.power, 2]);
    if (S.showI) series.push([fi, C.curr, 2.5]);
    if (S.showV) series.push([fv, C.volt, 2.5]);
    for (const [f, col, w] of series) {
      if (S.trace && !dense) { curve(f, col, w * 0.6, 0, aW, 0.22); curve(f, col, w, 0, ac); }
      else curve(f, col, dense ? 1 : w, 0, aW, dense ? 0.5 : 1);
    }
    if (S.showPw && VI > 0) {
      const yP = cy - d.P / VI * R;
      ctx.setLineDash([6, 4]); ctx.strokeStyle = C.power; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x0, yP); ctx.lineTo(x1, yP); ctx.stroke(); ctx.setLineDash([]);
      text('P', x0 + 4, yP - 3, C.power, ls, 'left', 'bottom', true);
    }
    ctx.restore();
    if (dense) {
      const msg = `${fmt(periods)} periodi nella finestra: troppo fitti. Premi «Adatta alla frequenza».`;
      ctx.font = '700 ' + (ls + 1) + L.FONT; const tw = ctx.measureText(msg).width;
      ctx.fillStyle = C.panel; ctx.globalAlpha = 0.9;
      ctx.fillRect((x0 + x1) / 2 - tw / 2 - 8, cy - R - 2, tw + 16, 22); ctx.globalAlpha = 1;
      text(msg, (x0 + x1) / 2, cy - R + 9, C.ink, ls + 1, 'center', 'middle', true);
    }

    /* --- cursore del tempo --- */
    const xc = X(ac);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xc, cy - R - 8); ctx.lineTo(xc, cy + R + 8); ctx.stroke();

    /* --- circonferenza --- */
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R / 2, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.line; ctx.beginPath();
    ctx.moveTo(cx - R - 6, cy); ctx.lineTo(cx + R + 6, cy); ctx.moveTo(cx, cy - R - 6); ctx.lineTo(cx, cy + R + 6); ctx.stroke();

    /* --- fasori --- */
    if (S.showF) {
      const av = ac + tv, ai = ac + ti;
      const pv = [cx + rv * Math.cos(av), cy - rv * Math.sin(av)];
      const pi = [cx + ri * Math.cos(ai), cy - ri * Math.sin(ai)];
      if (S.showAngle && S.showV) {
        const span = ((av % TAU) + TAU) % TAU, r0 = Math.max(14, Math.min(24, R * 0.2));
        ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, r0, 0, -span, true); ctx.stroke();
        const mid = span / 2;
        text('ωt+θv', cx + (r0 + 6) * Math.cos(mid), cy - (r0 + 6) * Math.sin(mid), C.muted, 10, Math.cos(mid) >= 0 ? 'left' : 'right', 'middle');
      }
      if (phOK) {
        const r1 = Math.max(18, Math.min(rv, ri, R) * 0.55), ph = d.phi * D2R;
        ctx.fillStyle = C.phase; ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r1, -ai, -(ai + ph), ph > 0); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = C.phase; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, r1, -ai, -(ai + ph), ph > 0); ctx.stroke();
        const m = ai + ph / 2;
        text('φ', cx + (r1 + 9) * Math.cos(m), cy - (r1 + 9) * Math.sin(m), C.phase, 14, 'center', 'middle', true);
      }
      const proj = (p, col) => {
        ctx.setLineDash([2, 3]); ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], cy); ctx.stroke();
        ctx.setLineDash([5, 4]); ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(xc, p[1]); ctx.stroke();
        ctx.globalAlpha = 1; ctx.setLineDash([]);
        dot(xc, p[1], 4.5, col);
      };
      if (S.showProj) { if (S.showI) proj(pi, C.curr); if (S.showV) proj(pv, C.volt); }
      if (S.showI) { arrow(cx, cy, pi[0], pi[1], C.curr, 2.5); text('I', pi[0] + 6 * Math.cos(ai), pi[1] - 6 * Math.sin(ai), C.curr, 14, Math.cos(ai) >= 0 ? 'left' : 'right', 'middle', true); }
      if (S.showV) { arrow(cx, cy, pv[0], pv[1], C.volt, 2.5); text('V', pv[0] + 6 * Math.cos(av), pv[1] - 6 * Math.sin(av), C.volt, 14, Math.cos(av) >= 0 ? 'left' : 'right', 'middle', true); }
      dot(cx, cy, 3, C.ink);
    } else {
      text('Fasori nascosti', cx, cy + R + 10, C.muted, 11, 'center', 'top');
    }

    /* --- valori istantanei sotto il grafico --- */
    L.$('#tslider').value = Math.round(S.t / Wt * 1000);
    L.$('#tout').textContent = S.xaxis === 'deg' ? Math.round(ac / D2R) + '°' : L.fmtT(S.t);
    const vi = S.Vm * Math.sin(ac + tv), ii = d.Im * Math.sin(ac + ti);
    let h = `<span>t = <b>${L.fmtT(S.t)}</b></span>`;
    if (S.showV) h += `<span style="color:var(--volt)">v = <b>${fmt(vi)}</b> V</span>`;
    if (S.showI) h += `<span style="color:var(--curr)">i = <b>${fmt(ii)}</b> A</span>`;
    if (S.showPw) h += `<span style="color:var(--power)">p = <b>${fmt(vi * ii)}</b> W</span>`;
    liveEl.innerHTML = h;
  }

  L.scope = { resize, draw };
})(window.LAB);

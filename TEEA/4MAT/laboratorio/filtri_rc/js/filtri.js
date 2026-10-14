/* =========================================================
   FILTRI RC — funzione di trasferimento H(f) = Vout / Vin
   p = { tipo, R1, C1, R2, C2, stadi, buffer }
   ========================================================= */
window.Filtri = (() => {
  const DUE_PI = 2 * Math.PI;

  const mul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
  const div = (a, b) => {
    const d = b.re * b.re + b.im * b.im;
    return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
  };
  const add = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });

  // Cella passa basso: R in serie, C verso massa → 1 / (1 + jωRC)
  function cellaLP(w, R, C) {
    const x = w * R * C, d = 1 + x * x;
    return { re: 1 / d, im: -x / d, fase: -Math.atan(x) };
  }

  // Cella passa alto: C in serie, R verso massa → jωRC / (1 + jωRC)
  function cellaHP(w, R, C) {
    const x = w * R * C, d = 1 + x * x;
    return { re: x * x / d, im: x / d, fase: Math.PI / 2 - Math.atan(x) };
  }

  // Restituisce { re, im, fase } con la fase in radianti (non "avvolta")
  function H(f, p) {
    const w = DUE_PI * Math.max(f, 1e-9);

    if (p.tipo === 'lp' || p.tipo === 'hp') {
      const c = (p.tipo === 'lp' ? cellaLP : cellaHP)(w, p.R1, p.C1);
      let h = { re: 1, im: 0 }, fase = 0;
      for (let i = 0; i < (p.stadi || 1); i++) { h = mul(h, c); fase += c.fase; }
      return { re: h.re, im: h.im, fase };
    }

    // Passa banda: cella passa alto (C1, R1) seguita da cella passa basso (R2, C2)
    const lp = cellaLP(w, p.R2, p.C2);
    if (p.buffer) {
      const hp = cellaHP(w, p.R1, p.C1);
      const h = mul(hp, lp);
      return { re: h.re, im: h.im, fase: hp.fase + lp.fase };
    }
    // Senza buffer: R1 è in parallelo con il ramo R2 + C2 (effetto di carico)
    const Zc1 = { re: 0, im: -1 / (w * p.C1) };
    const Zramo = { re: p.R2, im: -1 / (w * p.C2) };
    const Zpar = div({ re: p.R1 * Zramo.re, im: p.R1 * Zramo.im }, { re: p.R1 + Zramo.re, im: Zramo.im });
    const vNodo = div(Zpar, add(Zpar, Zc1));     // partitore tra C1 e il resto
    const h = mul(vNodo, lp);                      // partitore R2 / C2
    return { re: h.re, im: h.im, fase: Math.atan2(h.im, h.re) };
  }

  const modulo = h => Math.hypot(h.re, h.im);
  const dB = h => 20 * Math.log10(Math.max(modulo(h), 1e-12));
  const gradi = h => h.fase * 180 / Math.PI;
  const fc = (R, C) => 1 / (DUE_PI * R * C);

  // Frequenze di taglio delle singole celle (per le linee sui grafici)
  function tagliCelle(p) {
    return p.tipo === 'bp'
      ? [{ nome: 'fL', f: fc(p.R1, p.C1) }, { nome: 'fH', f: fc(p.R2, p.C2) }]
      : [{ nome: 'fc', f: fc(p.R1, p.C1) }];
  }

  // Analisi numerica: guadagno massimo e frequenze a −3 dB dal massimo
  function analisi(p) {
    const N = 3000, a = -1, b = 7; // da 0,1 Hz a 10 MHz
    const fs = new Float64Array(N), g = new Float64Array(N);
    let iMax = 0;
    for (let i = 0; i < N; i++) {
      fs[i] = 10 ** (a + (b - a) * i / (N - 1));
      g[i] = dB(H(fs[i], p));
      if (g[i] > g[iMax]) iMax = i;
    }
    const soglia = g[iMax] - 3;
    const interp = (i, j) => {
      const t = (soglia - g[i]) / (g[j] - g[i]);
      return 10 ** (Math.log10(fs[i]) + t * (Math.log10(fs[j]) - Math.log10(fs[i])));
    };
    let fBassa = null, fAlta = null;
    for (let i = iMax; i > 0; i--) if (g[i - 1] < soglia) { fBassa = interp(i - 1, i); break; }
    for (let i = iMax; i < N - 1; i++) if (g[i + 1] < soglia) { fAlta = interp(i, i + 1); break; }
    return { picco: g[iMax], fPicco: fs[iMax], fBassa, fAlta };
  }

  return { H, modulo, dB, gradi, fc, tagliCelle, analisi };
})();

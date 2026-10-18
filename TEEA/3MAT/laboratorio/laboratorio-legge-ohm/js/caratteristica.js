/* =========================================================
   CARATTERISTICA TENSIONE–CORRENTE (SVG)
   Una retta per ogni resistenza: I = V / R.
   Il punto mostra dove si trova il circuito adesso.
   ========================================================= */
window.Caratteristica = (() => {
  const W = 340, H = 220;
  const M = { l: 58, r: 16, t: 16, b: 36 };

  // Primo valore "tondo" (1, 2, 5 × 10^n) non minore di v
  function tondoSopra(v) {
    const p = 10 ** Math.floor(Math.log10(v));
    const f = v / p;
    return (f <= 1.0001 ? 1 : f <= 2.0001 ? 2 : f <= 5.0001 ? 5 : 10) * p;
  }

  // linee: [{ R, nome, principale }]
  function disegna(svg, { Vmax, linee, V, I }) {
    const pw = W - M.l - M.r, ph = H - M.t - M.b;
    // la scala verticale si adatta alla retta principale
    const principale = linee.find(l => l.principale) || linee[0];
    const yMax = tondoSopra(Vmax / principale.R);
    const X = v => M.l + v / Vmax * pw;
    const Y = i => M.t + ph - i / yMax * ph;
    let s = '';

    // griglia e tacche
    const px = tondoSopra(Vmax / 5);
    for (let v = 0; v <= Vmax + 1e-9; v += px) {
      s += `<line class="griglia" x1="${X(v)}" y1="${M.t}" x2="${X(v)}" y2="${M.t + ph}"/>`;
      s += `<text class="tacca" x="${X(v)}" y="${M.t + ph + 16}" text-anchor="middle">${Fmt.num(v)}</text>`;
    }
    for (let k = 0; k <= 5; k++) {
      const i = yMax * k / 5;
      s += `<line class="griglia" x1="${M.l}" y1="${Y(i)}" x2="${M.l + pw}" y2="${Y(i)}"/>`;
      s += `<text class="tacca" x="${M.l - 6}" y="${Y(i) + 4}" text-anchor="end">${k ? Fmt.si(i, 'A', 2) : '0'}</text>`;
    }
    s += `<line class="asse" x1="${M.l}" y1="${M.t + ph}" x2="${M.l + pw}" y2="${M.t + ph}"/>`;
    s += `<line class="asse" x1="${M.l}" y1="${M.t}" x2="${M.l}" y2="${M.t + ph}"/>`;
    s += `<text class="t-v forte" x="${M.l + pw}" y="${H - 4}" text-anchor="end">V</text>`;
    s += `<text class="t-i forte" x="${M.l + 6}" y="${M.t + 10}">I</text>`;

    // rette (prima le secondarie, poi la principale sopra)
    const posti = [];
    [...linee].sort((a, b) => a.principale - b.principale).forEach(l => {
      const vFine = Math.min(Vmax, yMax * l.R);
      const x2 = X(vFine), y2 = Y(vFine / l.R);
      s += `<line class="${l.principale ? 'retta' : 'retta-secondaria'}" x1="${X(0)}" y1="${Y(0)}" x2="${x2}" y2="${y2}"/>`;
      const sopra = y2 < M.t + 4;
      const bordo = sopra && x2 > W - M.r - 26;   // etichetta vicina al bordo destro: va a sinistra della retta
      let tx = sopra && !bordo ? x2 + 4 : x2 - 4, ty = sopra ? y2 + 14 : y2 - 7;
      // evita che due etichette si sovrappongano
      while (posti.some(p => Math.abs(p[0] - tx) < 28 && Math.abs(p[1] - ty) < 14)) ty += 14;
      posti.push([tx, ty]);
      s += `<text class="${l.principale ? 't-r forte' : 'tacca'}" x="${tx}" y="${ty}" text-anchor="${sopra && !bordo ? 'start' : 'end'}">${l.nome}</text>`;
    });

    // punto di lavoro
    if (V > 0) {
      const x = X(V), y = Y(Math.min(I, yMax));
      s += `<line class="guida" x1="${x}" y1="${y}" x2="${x}" y2="${M.t + ph}"/>`;
      s += `<line class="guida" x1="${x}" y1="${y}" x2="${M.l}" y2="${y}"/>`;
      s += `<circle class="punto" cx="${x}" cy="${y}" r="5.5"/>`;
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = s;
  }

  return { disegna };
})();

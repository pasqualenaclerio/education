/* =========================================================
   SCHEMA ELETTRICO (SVG) E ANIMAZIONE DELLA CORRENTE
   Coordinate nel riquadro 720 × 320.
   I pallini scorrono nel verso convenzionale (dal + al −
   attraverso il circuito); la velocità dipende dall'intensità.
   ========================================================= */
window.Schema = (() => {
  const C = window.CONFIG;
  const X0 = 90;    // filo verticale del generatore
  const YT = 60;    // filo in alto
  const YB = 270;   // filo in basso
  const XD = 570;   // filo verticale a destra
  const CY = 165;   // centro verticale
  const RG = 28;    // raggio del generatore
  const PED = ['₁', '₂', '₃'];

  // Posizioni delle resistenze in serie (sul filo in alto) e dei rami in parallelo
  const POS_SERIE = { 2: [250, 420], 3: [205, 340, 475] };
  const POS_PARALLELO = { 2: [290, 480], 3: [205, 360, 515] };

  let svg = null, gPallini = null, segmenti = [], tPrec = null;
  const offset = {};
  const fermo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- pezzi di disegno ---------- */
  const punti = pts => pts.map(p => p.join(',')).join(' ');
  const filo = pts => `<polyline class="filo" points="${punti(pts)}"/>`;
  const testo = (x, y, s, cls = '', anc = 'middle') =>
    `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anc}">${s}</text>`;
  const nodo = (x, y) => `<circle class="nodo" cx="${x}" cy="${y}" r="4.5"/>`;

  function freccia(x, y, dir) {
    const a = 7;
    const p = {
      d: [[x - a, y - a], [x + a, y - a], [x, y + a]],
      r: [[x - a, y - a], [x - a, y + a], [x + a, y]]
    }[dir];
    return `<polygon class="freccia" points="${punti(p)}"/>`;
  }

  // Generatore di tensione: cerchio attraversato dal filo, "+" all'esterno in alto a sinistra
  function generatore(V) {
    return `<circle cx="${X0}" cy="${CY}" r="${RG}" class="comp"/>` +
      `<line class="filo" x1="${X0}" y1="${CY - RG}" x2="${X0}" y2="${CY + RG}"/>` +
      testo(X0 - 20, CY - RG - 2, '+', 'segno') +
      testo(X0 - 40, CY + 4, 'V', 't-v forte', 'end') +
      testo(X0 - 40, CY + 25, Fmt.si(V, 'V'), 't-v', 'end');
  }

  // Simbolo di massa: triangolino vuoto
  function massa() {
    return filo([[X0, YB], [X0, YB + 14]]) +
      `<polygon class="massa" points="${punti([[X0 - 11, YB + 14], [X0 + 11, YB + 14], [X0, YB + 27]])}"/>`;
  }

  // Resistenza: rettangolo (CEI/IEC) o zigzag. "calore" da 0 a 1 colora il simbolo.
  function resistore(cx, cy, verticale, calore) {
    const L = 60, S = 22;
    const w = verticale ? S : L, h = verticale ? L : S;
    const x = cx - w / 2, y = cy - h / 2;
    const tinta = calore > 0 ? `<rect class="calore" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" opacity="${(0.15 + 0.75 * calore).toFixed(2)}"/>` : '';

    if (C.simboloResistenza === 'zigzag') {
      // brevi tratti dritti alle estremità, poi 3 punte da una parte e 3 dall'altra
      const a = 14, tratto = 6, Z = L - 2 * tratto, n = 6, pts = [];
      const u0 = -L / 2 + tratto;
      pts.push([-L / 2, 0], [u0, 0]);
      for (let k = 1; k <= n; k++) pts.push([u0 + (k - 0.5) * Z / n, k % 2 ? -a : a]);
      pts.push([L / 2 - tratto, 0], [L / 2, 0]);
      const xy = pts.map(([u, v]) => verticale ? [cx + v, cy + u] : [cx + u, cy + v]);
      const cancella = verticale
        ? `<line class="cancella" x1="${cx}" y1="${cy - L / 2}" x2="${cx}" y2="${cy + L / 2}"/>`
        : `<line class="cancella" x1="${cx - L / 2}" y1="${cy}" x2="${cx + L / 2}" y2="${cy}"/>`;
      const tw = verticale ? 2 * a + 6 : Z + 6, th = verticale ? Z + 6 : 2 * a + 6;
      const tintaZ = calore > 0 ? `<rect class="calore" x="${cx - tw / 2}" y="${cy - th / 2}" width="${tw}" height="${th}" rx="5" opacity="${(0.12 + 0.6 * calore).toFixed(2)}"/>` : '';
      return cancella + tintaZ + `<polyline class="filo zigzag" points="${punti(xy)}"/>`;
    }
    return `<rect class="comp-fondo" x="${x}" y="${y}" width="${w}" height="${h}"/>` + tinta +
      `<rect class="contorno" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  }

  /* ---------- disegno dello schema ---------- */
  function disegna(modo, ris, opz = {}) {
    const calore = p => opz.potenza ? Math.min(1, p.P / C.potenzaNominale) : 0;
    let fili = '', comp = generatore(ris.V), etich = '', nodi = nodo(X0, YB);
    const segs = [];
    const n = ris.parti.length;

    if (modo === 'singola' || modo === 'serie') {
      const anello = [[X0, CY - RG], [X0, YT], [XD, YT], [XD, YB], [X0, YB], [X0, CY + RG]];
      fili += filo(anello);
      segs.push({ id: 'anello', punti: anello, I: ris.I });
    }

    if (modo === 'singola') {
      const p = ris.parti[0];
      comp += resistore(XD, CY, true, calore(p));
      etich += testo(XD + 24, CY - 4, 'R', 't-r forte', 'start') +
               testo(XD + 24, CY + 17, Fmt.si(p.R, 'Ω'), 't-r', 'start');
      if (opz.potenza) etich += testo(XD + 24, CY + 40, 'P = ' + Fmt.si(p.P, 'W'), 't-p', 'start');
      const xm = (X0 + XD) / 2;
      etich += freccia(xm, YT, 'r') + testo(xm, YT - 16, 'I = ' + Fmt.si(ris.I, 'A'), 't-i forte');
    }

    if (modo === 'serie') {
      const xs = POS_SERIE[n];
      ris.parti.forEach((p, k) => {
        comp += resistore(xs[k], YT, false, calore(p));
        etich += testo(xs[k], YT - 26, `R${PED[k]} = ${Fmt.si(p.R, 'Ω')}`, 't-r') +
                 testo(xs[k], YT + 38, `V${PED[k]} = ${Fmt.si(p.V, 'V')}`, 't-v');
        if (opz.potenza) etich += testo(xs[k], YT + 59, `P${PED[k]} = ${Fmt.si(p.P, 'W')}`, 't-p');
      });
      etich += freccia(XD, CY, 'd') +
               testo(XD + 18, CY - 4, 'I', 't-i forte', 'start') +
               testo(XD + 18, CY + 17, Fmt.si(ris.I, 'A'), 't-i', 'start');
    }

    if (modo === 'parallelo') {
      const xs = POS_PARALLELO[n], ult = xs[n - 1];
      fili += filo([[X0, CY - RG], [X0, YT], [ult, YT]]) + filo([[ult, YB], [X0, YB], [X0, CY + RG]]);
      segs.push({ id: 'entra', punti: [[X0, CY - RG], [X0, YT], [xs[0], YT]], I: ris.I });
      segs.push({ id: 'esce', punti: [[xs[0], YB], [X0, YB], [X0, CY + RG]], I: ris.I });
      ris.parti.forEach((p, k) => {
        fili += filo([[xs[k], YT], [xs[k], YB]]);
        segs.push({ id: 'ramo' + k, punti: [[xs[k], YT], [xs[k], YB]], I: p.I });
        if (k < n - 1) {
          const resto = ris.parti.slice(k + 1).reduce((a, q) => a + q.I, 0);
          segs.push({ id: 'alto' + k, punti: [[xs[k], YT], [xs[k + 1], YT]], I: resto });
          segs.push({ id: 'basso' + k, punti: [[xs[k + 1], YB], [xs[k], YB]], I: resto });
          nodi += nodo(xs[k], YT) + nodo(xs[k], YB);
        }
        comp += resistore(xs[k], CY, true, calore(p));
        const xt = xs[k] + 20;
        etich += testo(xt, CY - 24, `R${PED[k]}`, 't-r forte', 'start') +
                 testo(xt, CY - 4, Fmt.si(p.R, 'Ω'), 't-r', 'start') +
                 testo(xt, CY + 19, `I${PED[k]} = ${Fmt.si(p.I, 'A')}`, 't-i', 'start');
        if (opz.potenza) etich += testo(xt, CY + 42, `P${PED[k]} = ${Fmt.si(p.P, 'W')}`, 't-p', 'start');
        etich += freccia(xs[k], YT + 38, 'd');
      });
      const xm = (X0 + xs[0]) / 2;
      etich += freccia(xm, YT, 'r') + testo(xm, YT - 16, 'I = ' + Fmt.si(ris.I, 'A'), 't-i forte');
    }

    svg.innerHTML = `<g>${fili}${massa()}</g><g class="pallini"></g><g>${comp}</g><g>${etich}${nodi}</g>`;
    gPallini = svg.querySelector('.pallini');
    segmenti = segs.map(prepara);
  }

  /* ---------- pallini della corrente ---------- */
  function velocita(I) {
    const a = C.animazione;
    if (!(I > 0)) return 0;
    const t = (Math.log10(I) - Math.log10(a.correnteMin)) / (Math.log10(a.correnteMax) - Math.log10(a.correnteMin));
    return a.velocitaMin + (a.velocitaMax - a.velocitaMin) * Math.min(1, Math.max(0, t));
  }

  function prepara(s) {
    const tratti = [];
    let lun = 0;
    for (let i = 1; i < s.punti.length; i++) {
      const [x1, y1] = s.punti[i - 1], [x2, y2] = s.punti[i];
      const l = Math.hypot(x2 - x1, y2 - y1);
      tratti.push({ x1, y1, x2, y2, l, da: lun });
      lun += l;
    }
    const quanti = Math.max(1, Math.round(lun / C.animazione.distanza));
    const cerchi = [];
    if (s.I > 0) {
      for (let k = 0; k < quanti; k++) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('r', '3.4');
        c.setAttribute('class', 'pallino');
        gPallini.appendChild(c);
        cerchi.push(c);
      }
    }
    return { ...s, tratti, lun, passo: lun / quanti, v: velocita(s.I), cerchi };
  }

  function punto(s, d) {
    for (const t of s.tratti) {
      if (d <= t.da + t.l) {
        const f = (d - t.da) / t.l;
        return [t.x1 + (t.x2 - t.x1) * f, t.y1 + (t.y2 - t.y1) * f];
      }
    }
    const u = s.tratti[s.tratti.length - 1];
    return [u.x2, u.y2];
  }

  function fotogramma(t) {
    const dt = tPrec === null ? 0 : Math.min(0.05, (t - tPrec) / 1000);
    tPrec = t;
    for (const s of segmenti) {
      if (!s.cerchi.length) continue;
      if (!fermo) offset[s.id] = ((offset[s.id] || 0) + s.v * dt) % s.passo;
      const o = offset[s.id] || 0;
      s.cerchi.forEach((c, k) => {
        const [x, y] = punto(s, k * s.passo + o);
        c.setAttribute('cx', x.toFixed(1));
        c.setAttribute('cy', y.toFixed(1));
      });
    }
    requestAnimationFrame(fotogramma);
  }

  function crea(elemento) {
    svg = elemento;
    requestAnimationFrame(fotogramma);
  }

  return { crea, disegna, velocita };
})();

/* =========================================================
   SCHEMA ELETTRICO del filtro selezionato, disegnato in SVG.
   Ogni cella è larga 150 unità: componente in serie in alto,
   componente verso massa in verticale.
   ========================================================= */
window.Schema = (() => {
  const YT = 60, YB = 170;   // filo superiore e filo di massa
  let s = '';

  const filo = (x1, y1, x2, y2) => { s += `<line class="filo" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; };
  const testo = (x, y, t, anc = 'middle', cls = '') => { s += `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anc}">${t}</text>`; };
  const linea = (pts) => { s += `<polyline class="comp" points="${pts.map(p => p.join(',')).join(' ')}"/>`; };
  const nome = (lettera, pedice, valore) =>
    pedice ? `${lettera}<tspan dy="4" font-size="11">${pedice}</tspan><tspan dy="-4"> = ${valore}</tspan>` : `${lettera} = ${valore}`;

  function resistenzaH(x, y, len, et) {
    const zz = 48, a = x + (len - zz) / 2, pts = [[a, y]];
    for (let k = 0; k < 6; k++) pts.push([a + (2 * k + 1) * zz / 12, y + (k % 2 ? 8 : -8)]);
    pts.push([a + zz, y]);
    filo(x, y, a, y); linea(pts); filo(a + zz, y, x + len, y);
    testo(x + len / 2, y - 18, et);
  }
  function resistenzaV(x, y1, y2, et) {
    const zz = 48, m = (y1 + y2) / 2, a = m - zz / 2, pts = [[x, a]];
    for (let k = 0; k < 6; k++) pts.push([x + (k % 2 ? -8 : 8), a + (2 * k + 1) * zz / 12]);
    pts.push([x, a + zz]);
    filo(x, y1, x, a); linea(pts); filo(x, a + zz, x, y2);
    testo(x + 16, m + 5, et, 'start');
  }
  function condensatoreH(x, y, len, et) {
    const m = x + len / 2, g = 5;
    filo(x, y, m - g, y); filo(m + g, y, x + len, y);
    s += `<line class="comp piastra" x1="${m - g}" y1="${y - 14}" x2="${m - g}" y2="${y + 14}"/>`;
    s += `<line class="comp piastra" x1="${m + g}" y1="${y - 14}" x2="${m + g}" y2="${y + 14}"/>`;
    testo(m, y - 22, et);
  }
  function condensatoreV(x, y1, y2, et) {
    const m = (y1 + y2) / 2, g = 5;
    filo(x, y1, x, m - g); filo(x, m + g, x, y2);
    s += `<line class="comp piastra" x1="${x - 14}" y1="${m - g}" x2="${x + 14}" y2="${m - g}"/>`;
    s += `<line class="comp piastra" x1="${x - 14}" y1="${m + g}" x2="${x + 14}" y2="${m + g}"/>`;
    testo(x + 22, m + 5, et, 'start');
  }
  function buffer(x, y, w) {
    filo(x, y, x + 14, y);
    s += `<polygon class="comp buf" points="${x + 14},${y - 20} ${x + 14},${y + 20} ${x + 52},${y}"/>`;
    testo(x + 27, y + 5, '×1', 'middle', 'buf-testo');
    filo(x + 52, y, x + w, y);
  }
  function massa(x, y) {
    filo(x, y, x, y + 12);
    filo(x - 13, y + 12, x + 13, y + 12);
    filo(x - 8, y + 17, x + 8, y + 17);
    filo(x - 3, y + 22, x + 3, y + 22);
  }
  const punto = (x, y) => { s += `<circle class="punto" cx="${x}" cy="${y}" r="3.5"/>`; };
  const morsetto = (x, y) => { s += `<circle class="morsetto" cx="${x}" cy="${y}" r="5"/>`; };

  function disegna(svg, p) {
    s = '';
    const x0 = 64;
    let x = x0 + 26;
    filo(x0, YT, x, YT);

    const bp = p.tipo === 'bp';
    const passi = [];
    if (bp) passi.push('hp', ...(p.buffer ? ['buf'] : []), 'lp');
    else for (let i = 0; i < (p.stadi || 1); i++) { if (i) passi.push('buf'); passi.push(p.tipo); }

    for (const t of passi) {
      if (t === 'buf') { buffer(x, YT, 70); x += 70; continue; }
      const indice = bp ? (t === 'hp' ? '1' : '2') : '';
      const R = bp ? (t === 'hp' ? p.R1 : p.R2) : p.R1;
      const C = bp ? (t === 'hp' ? p.C1 : p.C2) : p.C1;
      const etR = nome('R', indice, Fmt.si(R, 'Ω')), etC = nome('C', indice, Fmt.si(C, 'F'));
      if (t === 'lp') { resistenzaH(x, YT, 100, etR); condensatoreV(x + 125, YT, YB, etC); }
      else { condensatoreH(x, YT, 100, etC); resistenzaV(x + 125, YT, YB, etR); }
      filo(x + 100, YT, x + 150, YT);
      punto(x + 125, YT); punto(x + 125, YB);
      x += 150;
    }
    filo(x, YT, x + 26, YT);
    x += 26;
    filo(x0, YB, x, YB);
    massa(Math.round((x0 + x) / 2), YB);

    morsetto(x0, YT); morsetto(x0, YB); morsetto(x, YT); morsetto(x, YB);
    testo(x0 - 12, YT + 5, 'V<tspan dy="4" font-size="11">in</tspan>', 'end', 'morsetto-testo');
    testo(x + 12, YT + 5, 'V<tspan dy="4" font-size="11">out</tspan>', 'start', 'morsetto-testo');

    svg.setAttribute('viewBox', `0 0 ${x + 70} 205`);
    svg.innerHTML = s;
  }

  return { disegna };
})();

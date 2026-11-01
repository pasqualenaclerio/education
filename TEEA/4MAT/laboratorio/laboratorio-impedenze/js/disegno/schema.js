/* =====================================================================
   SCHEMA DEL CIRCUITO
   Disegna i componenti scelti, in serie o in parallelo, tra i morsetti A e B.
   Resistore con il simbolo rettangolare (norme CEI/IEC).
   ===================================================================== */
(function (L) {
  const f = n => n.toFixed(1);
  const CLASSE = { R: 's-res', L: 's-ind', C: 's-cap' };

  // componente orizzontale centrato in (cx, y), con i reofori da x1 a x2
  function simbolo(k, cx, y, x1, x2) {
    let s = `<g class="${CLASSE[k]}" fill="none" stroke="currentColor" stroke-width="2.2">`;
    if (k === 'R') {
      s += `<path d="M${f(x1)} ${y} H${f(cx - 19)} M${f(cx + 19)} ${y} H${f(x2)}"/><rect x="${f(cx - 19)}" y="${y - 7}" width="38" height="14" rx="1"/>`;
    } else if (k === 'L') {
      let d = `M${f(x1)} ${y} H${f(cx - 20)}`;
      for (let i = 0; i < 4; i++) d += ` a5 5 0 0 1 10 0`;
      d += ` H${f(x2)}`;
      s += `<path d="${d}"/>`;
    } else {
      s += `<path d="M${f(x1)} ${y} H${f(cx - 4)} M${f(cx + 4)} ${y} H${f(x2)}"/>`;
      s += `<path d="M${f(cx - 4)} ${y - 13} V${y + 13} M${f(cx + 4)} ${y - 13} V${y + 13}" stroke-width="3"/>`;
    }
    s += '</g>';
    return s;
  }
  const etichetta = (k, x, y) => `<text class="${CLASSE[k]}" x="${f(x)}" y="${f(y)}" text-anchor="middle" stroke="none">${k}</text>`;
  const morsetto = (x, y, nome) =>
    `<circle cx="${x}" cy="${y}" r="4" fill="var(--panel)" stroke="currentColor" stroke-width="2"/>` +
    `<text x="${x}" y="${y + 20}" text-anchor="middle" fill="var(--muted)" stroke="none">${nome}</text>`;

  L.schema = function (tipo, coll) {
    const comp = tipo.split('');
    const XA = 14, XB = 246;
    if (comp.length === 1 || coll === 'serie') {
      const H = 74, y = 34;
      const passo = (XB - XA) / comp.length;
      let s = '';
      comp.forEach((k, i) => {
        const x1 = XA + i * passo, x2 = x1 + passo, cx = (x1 + x2) / 2;
        s += simbolo(k, cx, y, i === 0 ? XA + 4 : x1, i === comp.length - 1 ? XB - 4 : x2);
        s += etichetta(k, cx, y - (k === 'C' ? 19 : 14));
      });
      s += morsetto(XA, y, 'A') + morsetto(XB, y, 'B');
      return { viewBox: `0 0 260 ${H}`, html: s };
    }
    // parallelo
    const n = comp.length, sp = 38, top = 24, H = top + (n - 1) * sp + 34;
    const xs = 48, xd = 212, ym = top + (n - 1) * sp / 2;
    let s = `<g fill="none" stroke="currentColor" stroke-width="2.2">` +
      `<path d="M${xs} ${top} V${top + (n - 1) * sp} M${xd} ${top} V${top + (n - 1) * sp}"/>` +
      `<path d="M${XA + 4} ${ym} H${xs} M${xd} ${ym} H${XB - 4}"/></g>`;
    comp.forEach((k, i) => {
      const y = top + i * sp;
      s += simbolo(k, 130, y, xs, xd);
      s += etichetta(k, 130 + (k === 'L' ? 34 : 32), y - 6);
      // pallini solo dove i fili si incontrano davvero (non agli angoli)
      if (i > 0 && i < n - 1) s += `<circle cx="${xs}" cy="${y}" r="3" fill="currentColor"/><circle cx="${xd}" cy="${y}" r="3" fill="currentColor"/>`;
    });
    s += `<circle cx="${xs}" cy="${ym}" r="3" fill="currentColor"/><circle cx="${xd}" cy="${ym}" r="3" fill="currentColor"/>`;
    s += morsetto(XA, ym, 'A') + morsetto(XB, ym, 'B');
    return { viewBox: `0 0 260 ${H}`, html: s };
  };
})(window.LAB);

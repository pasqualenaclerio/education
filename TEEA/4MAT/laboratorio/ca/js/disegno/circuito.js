/* ==========================================================================
   SCHEMA DEL CIRCUITO: i simboli R, L, C compaiono e scompaiono
   in base al carico scelto (con la "Z libera" sfumano uno nell'altro)
   ========================================================================== */
(function (L) {
  const { D2R } = L;
  // Scrive un pedice dentro un testo SVG, per esempio X con pedice L
  const sub = (base, s) => `${base}<tspan dy="3" font-size="9">${s}</tspan><tspan dy="-3">`;
  const fmtL = v => v < 1e-3 ? L.fmt(v * 1e6) + ' µH' : v < 1 ? L.fmt(v * 1e3) + ' mH' : L.fmt(v) + ' H';
  const fmtC = v => v < 1e-6 ? L.fmt(v * 1e9) + ' nF' : v < 1e-3 ? L.fmt(v * 1e6) + ' µF' : L.fmt(v * 1e3) + ' mF';

  L.updateCircuit = function (d) {
    const S = L.S, zt = S.zType, fmt = L.fmt;
    // peso di ciascun componente (0 = invisibile, 1 = pieno)
    let wR, wL, wC;
    if (S.useZ && zt === 'R')        { wR = 1; wL = 0; wC = 0; }
    else if (S.useZ && zt === 'L')   { wR = 0; wL = 1; wC = 0; }
    else if (S.useZ && zt === 'C')   { wR = 0; wL = 0; wC = 1; }
    else if (S.useZ && zt === 'RLC') { wR = 1; wL = 1; wC = 1; }
    else {
      const a = d.phiZ * D2R, s = Math.sin(a);
      wR = Math.min(1, Math.abs(Math.cos(a))); wL = s > 0 ? s : 0; wC = s < 0 ? -s : 0;
    }
    const op = w => w < 0.03 ? 0 : 0.25 + 0.75 * w;
    L.$('#gR').style.opacity = op(wR);
    L.$('#gL').style.opacity = op(wL);
    L.$('#gC').style.opacity = op(wC);

    // etichette sotto i simboli
    L.$('#tR').innerHTML = 'R = ' + fmt(Math.abs(d.Zre)) + ' Ω';
    L.$('#tL').innerHTML = sub('X', 'L') + ' = ' + fmt(Math.abs(d.Zim)) + ' Ω</tspan>';
    L.$('#tC').innerHTML = sub('X', 'C') + ' = ' + fmt(Math.abs(d.Zim)) + ' Ω</tspan>';
    if (S.useZ && (zt === 'L' || zt === 'RLC')) L.$('#tL').innerHTML = 'L = ' + fmtL(S.L);
    if (S.useZ && (zt === 'C' || zt === 'RLC')) L.$('#tC').innerHTML = 'C = ' + fmtC(S.C);

    L.$('#zstate').textContent = (S.useZ ? '' : 'Impedenza equivalente V/I: ') + L.loadName(d);

    // valori sotto il piano complesso
    let zv = '';
    if (isFinite(d.Zmag)) {
      zv = `Z = ${fmt(d.Zre)} ${d.Zim < 0 ? '−' : '+'} j${fmt(Math.abs(d.Zim))} Ω = ${fmt(d.Zmag)} Ω ∠ ${L.deg(d.phiZ)}`;
      if (S.useZ && (zt === 'L' || zt === 'RLC')) zv += `<br>X<sub>L</sub> = ωL = ${fmt(d.w)} · ${fmt(S.L)} = ${fmt(d.XL)} Ω`;
      if (S.useZ && (zt === 'C' || zt === 'RLC')) zv += `<br>X<sub>C</sub> = 1/(ωC) = 1/(${fmt(d.w)} · ${fmt(S.C)}) = ${fmt(d.XC)} Ω`;
      if (S.useZ && zt === 'RLC') zv += `<br>X = X<sub>L</sub> − X<sub>C</sub> = ${fmt(d.XL - d.XC)} Ω`;
    }
    L.$('#zvals').innerHTML = zv;
  };
})(window.LAB);

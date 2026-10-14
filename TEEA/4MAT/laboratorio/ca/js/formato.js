/* ==========================================================================
   FORMATTAZIONE DEI NUMERI (stile italiano: virgola decimale)
   ========================================================================== */
(function (L) {
  // Numero con 3 cifre significative
  L.fmt = (x, d = 3) => {
    if (!isFinite(x)) return '∞';
    const a = Math.abs(x);
    if (a !== 0 && (a >= 1e6 || a < 1e-3)) return x.toExponential(2).replace('.', ',').replace('-', '−');
    return x.toLocaleString('it-IT', { maximumSignificantDigits: d }).replace('-', '−');
  };

  // Angolo in gradi
  L.deg = x => x.toLocaleString('it-IT', { maximumFractionDigits: 1 }).replace('-', '−') + '°';

  // Riporta un angolo nell'intervallo [-180°, 180°)
  L.wrap180 = d => ((d + 180) % 360 + 360) % 360 - 180;

  // " + 30°" oppure " − 30°" per scrivere le equazioni
  L.sgnDeg = d => (d < 0 ? ' − ' : ' + ') + L.deg(Math.abs(d));

  // Tempo con unità adatta (µs, ms, s)
  L.fmtT = s => {
    const a = Math.abs(s);
    if (a === 0) return '0';
    if (a < 1e-3) return L.fmt(s * 1e6) + ' µs';
    if (a < 1) return L.fmt(s * 1e3) + ' ms';
    return L.fmt(s) + ' s';
  };

  // Frequenza in Hz o kHz
  L.fmtF = f => f >= 1000 ? L.fmt(f / 1000) + ' kHz' : L.fmt(f) + ' Hz';

  // Valore "tondo" (1, 2, 2,5, 5, 10 × potenza di dieci) maggiore o uguale a x
  L.niceCeil = (x, ms = [1, 2, 2.5, 5, 10]) => {
    if (!(x > 0) || !isFinite(x)) return 1;
    const e = Math.pow(10, Math.floor(Math.log10(x)));
    for (const m of ms) if (m * e >= x * 0.9999) return +(m * e).toPrecision(12);
    return 10 * e;
  };
})(window.LAB);

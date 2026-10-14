/* Formattazione dei numeri in italiano (virgola decimale, prefissi k, M, n, µ…) */
window.Fmt = (() => {
  const meno = s => s.replace(/-/g, '−');

  function num(v, cifre = 3) {
    if (!isFinite(v)) return '—';
    if (Math.abs(v) < 1e-15) return '0';
    return meno(Number(v).toLocaleString('it-IT', { maximumSignificantDigits: cifre }));
  }

  function fisso(v, dec = 1) {
    if (!isFinite(v)) return v > 0 ? '∞' : '−∞';
    if (Math.abs(v) < 0.5 * 10 ** -dec) v = 0;
    return meno(Number(v).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
  }

  const PREF = [[1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
  function si(v, unita, cifre = 3) {
    if (!isFinite(v)) return '—';
    const a = Math.abs(v);
    const [k, p] = PREF.find(([k]) => a >= k * 0.9995) || PREF[PREF.length - 1];
    return num(v / k, cifre) + ' ' + p + unita;
  }

  const hz = (f, cifre = 3) => si(f, 'Hz', cifre);
  const db = v => (v >= 0.05 ? '+' : '') + fisso(v, 1) + ' dB';
  const asse = f => (f >= 1000 ? num(f / 1000) + 'k' : num(f));

  return { num, fisso, si, hz, db, asse, meno };
})();

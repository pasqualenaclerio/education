/* =========================================================
   NUMERI ALL'ITALIANA
   Fmt.si(4700, 'Ω')  → "4,7 kΩ"
   Fmt.si(0.012, 'A') → "12 mA"
   Fmt.leggi('4k7')   → 4700
   ========================================================= */
window.Fmt = (() => {
  const PREFISSI = [
    { f: 1e9, p: 'G' }, { f: 1e6, p: 'M' }, { f: 1e3, p: 'k' }, { f: 1, p: '' },
    { f: 1e-3, p: 'm' }, { f: 1e-6, p: 'µ' }, { f: 1e-9, p: 'n' }
  ];
  const SPAZIO = '\u00A0'; // spazio che non va a capo tra numero e unità

  // Arrotonda a un certo numero di cifre significative
  function arrotonda(v, cifre = 3) {
    if (v === 0 || !isFinite(v)) return v;
    return parseFloat(v.toPrecision(cifre));
  }

  // Numero con la virgola decimale, al massimo "cifre" cifre significative
  function num(v, cifre = 3) {
    if (!isFinite(v)) return '∞';
    if (v === 0) return '0';
    return v.toLocaleString('it-IT', { maximumSignificantDigits: cifre }).replace('-', '−');
  }

  // Numero con prefisso SI e unità di misura
  function si(v, unita, cifre = 3) {
    if (!isFinite(v)) return '∞' + SPAZIO + unita;
    if (v === 0) return '0' + SPAZIO + unita;
    const a = Math.abs(v);
    let k = PREFISSI.findIndex(x => a >= x.f * 0.9995);
    if (k < 0) k = PREFISSI.length - 1;
    let val = arrotonda(v / PREFISSI[k].f, cifre);
    if (Math.abs(val) >= 1000 && k > 0) { k--; val = arrotonda(v / PREFISSI[k].f, cifre); }
    return num(val, cifre) + SPAZIO + PREFISSI[k].p + unita;
  }

  // Legge un valore scritto a mano: "4,7k", "4.7 kΩ", "4k7", "2M2", "470", "0,5"
  const MOLT = { '': 1, r: 1, R: 1, k: 1e3, K: 1e3, M: 1e6, m: 1e-3, G: 1e9, u: 1e-6, 'µ': 1e-6 };
  function leggi(testo) {
    const s = String(testo).trim()
      .replace(/[\s\u00A0]+/g, '')
      .replace(/Ω|ohm|V$|A$|W$/gi, '')
      .replace(',', '.');
    let m = s.match(/^(\d+)([rRkKMmGuµ])(\d+)$/);         // forma 4k7
    if (m) return parseFloat(m[1] + '.' + m[3]) * MOLT[m[2]];
    m = s.match(/^(\d*\.?\d+)([rRkKMmGuµ]?)$/);           // forma 4.7k
    if (m) return parseFloat(m[1]) * MOLT[m[2]];
    return NaN;
  }

  return { arrotonda, num, si, leggi };
})();

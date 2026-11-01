/* =====================================================================
   FORMATO DEI NUMERI
   Virgola decimale, segno meno tipografico, prefissi (m, µ, k, ...).
   ===================================================================== */
(function (L) {
  const F = L.F = {};
  const PREF = { '-12': 'p', '-9': 'n', '-6': 'µ', '-3': 'm', '0': '', '3': 'k', '6': 'M', '9': 'G' };

  F.sig = (x, n = L.CIFRE) => (x === 0 || !isFinite(x)) ? x : +x.toPrecision(n);

  // numero con n cifre significative, senza notazione esponenziale
  F.num = (x, n = L.CIFRE) => {
    if (!isFinite(x)) return '∞';
    let v = F.sig(x, n);
    if (Math.abs(v) < 1e-12) v = 0;
    const s = v.toLocaleString('it-IT', { maximumSignificantDigits: n, useGrouping: false });
    return s.replace('-', '−');
  };

  // numero con prefisso: 0,0012 H -> 1,2 mH
  F.eng = (x, unita, n = L.CIFRE) => {
    if (!isFinite(x)) return '∞ ' + unita;
    if (x === 0 || Math.abs(x) < 1e-15) return '0 ' + unita;
    let e = Math.floor(Math.log10(Math.abs(x)) / 3) * 3;
    e = Math.max(-12, Math.min(9, e));
    let v = F.sig(x / Math.pow(10, e), n);
    if (Math.abs(v) >= 1000 && e < 9) { e += 3; v = F.sig(x / Math.pow(10, e), n); }
    return F.num(v, n) + ' ' + PREF[e] + unita;
  };

  // angolo in gradi con al massimo un decimale
  F.deg = x => {
    let v = Math.round(x * 10) / 10;
    if (Object.is(v, -0) || Math.abs(v) < 0.05) v = 0;
    return v.toLocaleString('it-IT', { maximumFractionDigits: 1, useGrouping: false }).replace('-', '−') + '°';
  };

  // numero da scrivere dentro un campo (meno normale, più cifre)
  F.campo = (x, n = 4) => F.num(x, n).replace('−', '-');

  // legge un numero scritto dall'utente: accetta la virgola e il segno meno tipografico
  F.leggi = s => {
    const t = String(s).trim().replace(/\s+/g, '').replace(',', '.').replace('−', '-');
    if (t === '' || t === '-' || t === '.') return NaN;
    return Number(t);
  };

  // numero complesso in forma algebrica: 43,3 + j25 Ω
  F.compl = (z, unita, n = L.CIFRE) => {
    const re = Math.abs(z.re) < 1e-12 ? 0 : z.re, im = Math.abs(z.im) < 1e-12 ? 0 : z.im;
    const segno = im < 0 ? ' − ' : ' + ';
    return F.num(re, n) + segno + 'j' + F.num(Math.abs(im), n) + (unita ? ' ' + unita : '');
  };

  // fasore in notazione polare: 50 Ω ∠ 30°
  F.fasore = (mod, fase, unita) => F.num(mod) + ' ' + unita + ' ∠ ' + F.deg(fase);

  // parentesi attorno ai numeri negativi nei passaggi: 0° − (−30°)
  F.par = s => (s.startsWith('−') ? '(' + s + ')' : s);
})(window.LAB);

/* =====================================================================
   CAMPI NUMERICI
   Mentre si scrive il valore viene applicato subito; uscendo dal campo
   il numero viene riscritto in forma ordinata. Un valore non valido
   colora il bordo del campo e non viene applicato.
   ===================================================================== */
(function (L) {
  L.legaCampo = function (el, applica, valida, rinfresca) {
    const ok = v => isFinite(v) && (!valida || valida(v));
    el.addEventListener('input', () => {
      const v = L.F.leggi(el.value);
      const buono = ok(v);
      el.classList.toggle('errato', !buono && el.value.trim() !== '');
      if (buono) applica(v);
    });
    el.addEventListener('blur', () => { el.classList.remove('errato'); rinfresca(); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter') el.blur(); });
  };
  // scrive in un campo solo se l'utente non ci sta scrivendo
  L.scrivi = (el, testo) => { if (document.activeElement !== el) el.value = testo; };
  L.$ = id => document.getElementById(id);
})(window.LAB);

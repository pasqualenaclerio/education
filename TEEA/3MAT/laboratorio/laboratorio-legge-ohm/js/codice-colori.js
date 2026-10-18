/* =========================================================
   CODICE COLORI DEI RESISTORI
   - serie commerciali E12, E24 (4 bande) ed E96 (5 bande)
   - ricerca del valore commerciale più vicino
   - disegno SVG di un resistore "vero"
   ========================================================= */
window.CodiceColori = (() => {
  const C = window.CONFIG;

  const SERIE = {
    E12: [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82],
    E24: [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91],
    E96: [100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150,
          154, 158, 162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232,
          237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357,
          365, 374, 383, 392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549,
          562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845,
          866, 887, 909, 931, 953, 976]
  };

  // Colori delle cifre 0…9
  const CIFRE = [
    { nome: 'nero',    hex: '#1D1D1D' },
    { nome: 'marrone', hex: '#7B4A22' },
    { nome: 'rosso',   hex: '#D0312D' },
    { nome: 'arancio', hex: '#EE7B1B' },
    { nome: 'giallo',  hex: '#F2CF1D' },
    { nome: 'verde',   hex: '#2E9A47' },
    { nome: 'blu',     hex: '#2B5FC9' },
    { nome: 'viola',   hex: '#8A3FB8' },
    { nome: 'grigio',  hex: '#8C8C8C' },
    { nome: 'bianco',  hex: '#F6F6F6' }
  ];
  const ORO = { nome: 'oro', hex: '#C8A33E' };
  const ARGENTO = { nome: 'argento', hex: '#BFC4C8' };
  const TOLLERANZA = { 1: CIFRE[1], 2: CIFRE[2], 5: ORO, 10: ARGENTO };

  // Valore commerciale più vicino a R nella serie indicata.
  // Restituisce { valore, cifre: [..], esp } con valore = cifre × 10^esp
  function piuVicino(R, nome) {
    const base = SERIE[nome];
    const n = nome === 'E96' ? 3 : 2;
    const d0 = Math.floor(Math.log10(R));
    let migliore = null;
    for (let d = d0 - 1; d <= d0 + 1; d++) {
      const esp = d - (n - 1);
      for (const b of base) {
        const v = esp >= 0 ? b * 10 ** esp : b / 10 ** (-esp);
        const diff = Math.abs(v - R);
        if (!migliore || diff < migliore.diff) {
          migliore = { valore: v, cifre: String(b).split('').map(Number), esp, diff };
        }
      }
    }
    return migliore;
  }

  // Elenco delle bande: colore, ruolo e significato
  function bande(scelta, nome) {
    const out = scelta.cifre.map((c, i) => ({
      ...CIFRE[c], ruolo: `${i + 1}ª cifra`, significato: String(c)
    }));
    const molt = scelta.esp === -1 ? ORO : scelta.esp === -2 ? ARGENTO : CIFRE[scelta.esp];
    out.push({ ...molt, ruolo: 'moltiplicatore', significato: '× ' + (10 ** scelta.esp).toLocaleString('it-IT') });
    const t = C.codiceColori.tolleranza[nome];
    out.push({ ...TOLLERANZA[t], ruolo: 'tolleranza', significato: `± ${t} %` });
    return out;
  }

  // Disegno SVG del resistore con le sue bande
  let contatore = 0;
  const FORMA = 'M70,18 h30 q8,0 12,5 h76 q4,-5 12,-5 h30 q12,0 12,12 v20 q0,12 -12,12 ' +
                'h-30 q-8,0 -12,-5 h-76 q-4,5 -12,5 h-30 q-12,0 -12,-12 v-20 q0,-12 12,-12 z';

  function svg(elencoBande, nome) {
    const id = 'resistore' + (++contatore);
    const quattro = elencoBande.length === 4;
    const pos = quattro ? [80, 122, 144, 212] : [78, 114, 133, 152, 212];
    const larg = quattro ? 10 : 9;
    const corpo = C.codiceColori.corpo[nome];
    const descr = elencoBande.map(b => b.nome).join(', ');
    return `<svg viewBox="0 0 300 80" role="img" aria-label="Resistore con bande ${descr}">
  <defs>
    <clipPath id="${id}c"><path d="${FORMA}"/></clipPath>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".55"/>
      <stop offset=".35" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".7" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".32"/>
    </linearGradient>
  </defs>
  <line x1="4" y1="40" x2="296" y2="40" stroke="#9AA3A8" stroke-width="4" stroke-linecap="round"/>
  <path d="${FORMA}" fill="${corpo}"/>
  <g clip-path="url(#${id}c)">
    ${elencoBande.map((b, i) => `<rect x="${pos[i]}" y="10" width="${larg}" height="60" fill="${b.hex}"/>`).join('')}
    <rect x="50" y="10" width="200" height="60" fill="url(#${id}g)"/>
  </g>
  <path d="${FORMA}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
</svg>`;
  }

  return { SERIE, piuVicino, bande, svg };
})();

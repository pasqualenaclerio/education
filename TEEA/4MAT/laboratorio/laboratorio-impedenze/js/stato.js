/* =====================================================================
   STATO E IMPOSTAZIONI
   Qui ci sono i valori di partenza e le regole generali del laboratorio.
   Tutti i file condividono l'oggetto globale LAB.
   ===================================================================== */
window.LAB = window.LAB || {};
(function (L) {

  // ---- valori con cui si apre la pagina ----
  L.S = {
    modo: 'vi',            // 'vi' = impedenza da V e I, 'comp' = impedenza dei componenti
    complessa: false,      // spunta "forma complessa"

    // modo 1: fasori di tensione e corrente (modulo e fase in gradi)
    V: { mod: 230, fase: 0 },
    I: { mod: 4.6, fase: -30 },
    fEq: 50,               // frequenza usata per il circuito equivalente (Hz)

    // modo 2: componenti
    tipo: 'RL',            // 'R','L','C','RL','RC','LC','RLC'
    coll: 'serie',         // 'serie' oppure 'parallelo'
    f: 50,                 // Hz
    R: 100,                // ohm
    L: 0.3183,             // henry  (100 ohm a 50 Hz)
    C: 63.66e-6            // farad  (50 ohm a 50 Hz)
  };

  // ---- regole del disegno ----
  L.MARGINE_SCALA = 1.15;            // spazio libero tra la freccia più lunga e il bordo
  L.RAPPORTO_VISIVO_CORRENTE = 0.75; // la corrente appare al massimo 3/4 della tensione
  L.AGGANCIO_ANGOLO = 2;             // trascinando, vicino a multipli di 15° l'angolo si aggancia (gradi)
  L.CIFRE = 3;                       // cifre significative mostrate

  // fondo scala "rotondi" (moltiplicati per potenze di 10)
  L.PASSI_SCALA = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10];   // divisi per 5 quadretti danno valori rotondi

  // intervalli dei cursori (scala logaritmica)
  L.CURSORI = {
    f: [1, 100000],        // Hz
    R: [0.1, 100000],      // ohm
    L: [1e-6, 10],         // henry
    C: [1e-9, 1e-2]        // farad
  };

  L.niceCeil = function (x) {
    if (!(x > 0) || !isFinite(x)) return 1;
    const e = Math.pow(10, Math.floor(Math.log10(x)));
    for (const m of L.PASSI_SCALA) if (m * e >= x * 0.9999) return +(m * e).toPrecision(12);
    return 10 * e;
  };
})(window.LAB);

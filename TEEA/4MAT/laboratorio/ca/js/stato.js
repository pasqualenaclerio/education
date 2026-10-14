/* ==========================================================================
   STATO DELL'APPLICAZIONE
   Qui ci sono tutti i valori iniziali. Cambiali per far partire la pagina
   con impostazioni diverse (per esempio un altro carico o un'altra frequenza).
   Le grandezze fisiche sono in unità SI: V, A, Hz, Ω, H, F, secondi.
   ========================================================================== */
window.LAB = window.LAB || {};

(function (L) {
  L.D2R = Math.PI / 180;          // gradi -> radianti
  L.TAU = Math.PI * 2;

  // Valori di riferimento per il volume del suono (non per il grafico,
  // che adatta la scala da solo: vedi fisica.js)
  L.FONDO_SCALA_V = 400;          // volt
  L.FONDO_SCALA_I_MANUALE = 10;   // ampere, quando la corrente si imposta a mano

  // Margine sopra il picco quando la scala verticale è automatica (1.15 = +15%)
  L.MARGINE_SCALA = 1.15;

  // Con la scala automatica la corrente viene disegnata sempre più bassa della
  // tensione: al massimo questa frazione della sua altezza (0.75 = tre quarti).
  // È solo una scelta grafica, gli assi riportano comunque i valori veri.
  L.RAPPORTO_VISIVO_CORRENTE = 0.75;

  const movimentoRidotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  L.S = {
    // Tensione
    Vm: 325, thv: 0, f: 50,
    // Corrente impostata a mano
    Im: 4, thi: -30,
    // Impedenza: zType = 'R' | 'L' | 'C' | 'RLC' | 'Z'
    useZ: false, zType: 'R', R: 50, L: 0.1, C: 100e-6, Zmod: 80, Zphi: 45,
    // Cosa mostrare
    showV: true, showI: true, showPh: true, showF: true,
    showAngle: true, showProj: true, trace: true,
    showPw: false, showRms: false,
    // Oscilloscopio: xaxis = 'time' | 'deg', tb = base dei tempi (s/div)
    xaxis: 'time', tb: 5e-3, secPerTurn: 4, playing: !movimentoRidotto, t: 0,
    // Scala verticale: automatica oppure bloccata sui valori VsFix / IsFix
    autoScale: true, VsFix: 400, IsFix: 10,
    // Suono: audioMode = 'v' | 'i' | 'st' | 'sum', audioVol in %
    audioOn: false, audioMode: 'v', audioVol: 30
  };

  L.$ = s => document.querySelector(s);
})(window.LAB);

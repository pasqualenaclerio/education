/* =========================================================
   CONFIGURAZIONE — il primo file da modificare.
   Qui si cambiano valori iniziali, limiti dei cursori,
   simbolo della resistenza e alcuni parametri didattici.
   ========================================================= */
window.CONFIG = {

  // Generatore di tensione, in volt
  tensione: { min: 0, max: 24, passo: 0.1, iniziale: 12 },

  // Resistenza nella modalità "Una resistenza", in ohm.
  // Il cursore è logaritmico: ogni decade (10, 100, 1000…) occupa lo stesso spazio.
  resistenza: { min: 1, max: 1e6, iniziale: 1000 },

  // Modalità serie e parallelo
  gruppo: {
    minimo: 2,                     // resistenze presenti all'inizio (e minimo)
    massimo: 3,                    // massimo di resistenze aggiungibili
    iniziali: [1000, 2200, 4700]   // valori proposti per R1, R2, R3
  },

  // Codice colori
  codiceColori: {
    serieIniziale: 'E12',                            // 'E12', 'E24' oppure 'E96'
    tolleranza: { E12: 10, E24: 5, E96: 1 },         // in percento
    corpo: { E12: '#D9C29A', E24: '#D9C29A', E96: '#86A9CC' }  // colore del corpo del resistore
  },

  // Simbolo della resistenza nello schema:
  // 'zigzag' (3 punte per lato) oppure 'rettangolo' (norme CEI/IEC)
  simboloResistenza: 'zigzag',

  // Potenza massima di un resistore comune, in watt (1/4 W).
  // Se una resistenza dissipa di più, la pagina lo segnala e il simbolo "si scalda".
  potenzaNominale: 0.25,

  // Valori iniziali del calcolo dell'energia
  energia: {
    tempo: 1,
    unita: 'h',          // 's', 'min', 'h' oppure 'giorni'
    prezzoKWh: 0.30      // euro per kWh
  },

  // Animazione della corrente.
  // La velocità dei pallini segue una scala logaritmica tra correnteMin e correnteMax:
  // le correnti in gioco vanno dai microampere agli ampere, una scala lineare
  // renderebbe ferme quasi tutte le correnti piccole.
  animazione: {
    correnteMin: 1e-6,   // A: sotto questo valore i pallini vanno alla velocità minima
    correnteMax: 1,      // A: sopra questo valore vanno alla velocità massima
    velocitaMin: 10,     // pixel al secondo
    velocitaMax: 200,
    distanza: 24         // distanza tra i pallini, in pixel
  }
};

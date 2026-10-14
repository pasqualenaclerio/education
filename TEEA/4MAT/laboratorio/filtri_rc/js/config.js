/* =========================================================
   CONFIGURAZIONE
   È il file più comodo da modificare: qui ci sono gli esempi
   pronti, i valori iniziali del filtro e le impostazioni dei
   grafici e dell'audio. Resistenze in ohm, capacità in farad
   (100e-9 = 100 nF, 2.2e-9 = 2,2 nF, 1e-6 = 1 µF).
   ========================================================= */
window.CONFIG = {

  // Filtro mostrato all'apertura (gli esempi possono cambiarlo)
  filtroIniziale: {
    tipo: 'lp',      // 'lp' passa basso, 'hp' passa alto, 'bp' passa banda
    R1: 4700, C1: 100e-9,   // cella 1 (per il passa banda: sezione passa alto)
    R2: 33000, C2: 2.2e-9,  // cella 2 (solo passa banda: sezione passa basso)
    stadi: 1,        // 1, 2 o 3 celle uguali in cascata (passa basso e passa alto)
    buffer: false    // passa banda: true = sezioni separate da un buffer ideale
  },

  maxDisturbi: 5,

  // Assi dei grafici
  bode:    { fMin: 10, fMax: 100000, dbMin: -80, dbMax: 5 },
  spettro: { fMin: 10, fMax: 20000,  dbMin: -80, dbMax: 10 },

  // Segnale con armoniche: si genera 1 secondo e si ripete in loop
  armoniche: { sampleRate: 44100, fMax: 20000 },

  // Brano audio con rumore bianco
  audio: {
    file: 'audio/fra-martino.wav',
    nome: 'Fra Martino, melodia tradizionale',
    sampleRate: 22050,  // ogni file viene convertito a questa frequenza di campionamento
    durataMax: 15,      // secondi caricati al massimo (i file più lunghi vengono tagliati)
    rumoreIniziale: 50  // valore efficace del rumore, in % di quello del brano
  },

  // Esempi pronti. disturbi: [frequenza in Hz, ampiezza in V], massimo 5.
  preset: [
    {
      nome: 'Nota La 220 Hz con disturbi acuti',
      descr: 'Il segnale utile è grave e i disturbi sono acuti: serve un passa basso.',
      f0: 220, a0: 1,
      disturbi: [[1760, 0.4], [2640, 0.3], [3520, 0.25], [4840, 0.2], [6600, 0.15]],
      filtro: { tipo: 'lp', R1: 4700, C1: 100e-9, stadi: 1 }
    },
    {
      nome: 'Onda quadra a 220 Hz',
      descr: 'Un\'onda quadra è la somma di armoniche dispari (3ª, 5ª, 7ª…) con ampiezza 1/n. Togliendole diventa una sinusoide.',
      f0: 220, a0: 1,
      disturbi: [[660, 1 / 3], [1100, 1 / 5], [1540, 1 / 7], [1980, 1 / 9], [2420, 1 / 11]],
      filtro: { tipo: 'lp', R1: 4700, C1: 100e-9, stadi: 2 }
    },
    {
      nome: 'Nota a 1 kHz con ronzio di rete',
      descr: 'Disturbi a 50 Hz e multipli, come il ronzio della rete elettrica: serve un passa alto. Le casse piccole riproducono poco i 50 Hz, meglio le cuffie.',
      f0: 1000, a0: 0.6,
      disturbi: [[50, 1], [100, 0.6], [150, 0.5], [200, 0.3], [250, 0.2]],
      filtro: { tipo: 'hp', R1: 10000, C1: 47e-9, stadi: 2 }
    },
    {
      nome: 'Nota a 1 kHz tra disturbi gravi e acuti',
      descr: 'Ci sono disturbi sia sotto sia sopra il segnale utile: serve un passa banda.',
      f0: 1000, a0: 0.8,
      disturbi: [[100, 0.6], [200, 0.5], [6000, 0.5], [9000, 0.4], [12000, 0.3]],
      filtro: { tipo: 'bp', R1: 3300, C1: 220e-9, R2: 33000, C2: 2.2e-9, buffer: false }
    }
  ]
};

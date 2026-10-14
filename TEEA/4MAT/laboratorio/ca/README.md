# Laboratorio di corrente alternata

Web app didattica per esplorare tensione e corrente alternata: fasori sulla
circonferenza, sinusoidi, sfasamento, impedenza (R, L, C, RLC serie, Z libera),
potenza, valori efficaci e suono delle onde.

## Come si apre

Fai doppio clic su `index.html`: si apre nel browser e funziona anche senza
internet (senza connessione cambia solo il carattere tipografico).

Per metterla online basta copiare l'intera cartella su un qualsiasi spazio web
(sito della scuola, GitHub Pages, Netlify, Altervista…). Gli studenti aprono
l'indirizzo di `index.html`.

Se ti serve **un solo file** (per Classroom, Moodle, email o chiavetta) usa
`file-unico/laboratorio-corrente-alternata.html`, che contiene già tutto.

## Struttura delle cartelle

```
laboratorio-ca/
├── index.html                  Struttura della pagina e testi fissi
├── README.md                   Questo file
├── assets/
│   └── favicon.svg             Icona della scheda del browser
├── css/
│   ├── tema.css                Colori (chiaro e scuro) e caratteri
│   ├── layout.css              Colonne, spaziature, adattamento a smartphone
│   └── componenti.css          Check list, slider, pulsanti, schede
├── js/
│   ├── stato.js                Valori iniziali di tutte le grandezze
│   ├── formato.js              Come vengono scritti numeri, angoli, tempi
│   ├── fisica.js               Calcoli: impedenza, corrente, sfasamento, potenze
│   ├── testi.js                Frasi che cambiano: spiegazioni, nome del carico, note sul suono
│   ├── disegno/
│   │   ├── strumenti.js        Funzioni di disegno comuni (frecce, testi, colori)
│   │   ├── oscilloscopio.js    Circonferenza con i fasori e sinusoidi
│   │   ├── piano-impedenza.js  Triangolo dell'impedenza nel piano complesso
│   │   └── circuito.js         Schema del circuito con R, L, C
│   ├── audio.js                Suono delle onde (Web Audio API)
│   ├── aggiorna.js             Ricalcola e aggiorna i pannelli a ogni modifica
│   ├── controlli.js            Slider, caselle, spunte e barra comandi
│   └── main.js                 Avvio e ciclo di animazione
├── strumenti/
│   └── crea-file-unico.py      Rigenera la versione a file unico
└── file-unico/
    └── laboratorio-corrente-alternata.html
```

Gli script sono normali file JavaScript (non moduli), così la pagina funziona
anche aperta con doppio clic. Condividono un unico oggetto globale `LAB` e
vanno caricati nell'ordine scritto in fondo a `index.html`.

## Modifiche frequenti

| Voglio cambiare…                                   | File da aprire                     |
|----------------------------------------------------|------------------------------------|
| Titolo, sottotitolo, nomi delle voci               | `index.html`                       |
| Spiegazioni che cambiano con i valori              | `js/testi.js`                      |
| Valori di partenza (es. 230 V, 50 Hz, carico RLC)  | `js/stato.js`                      |
| Limiti degli slider (minimo, massimo, unità)       | `js/controlli.js`, chiamate `makeRow` |
| Margine della scala verticale automatica           | `js/stato.js`, `MARGINE_SCALA`     |
| Quanto appare più piccola la corrente              | `js/stato.js`, `RAPPORTO_VISIVO_CORRENTE` |
| Colori di tensione, corrente, sfasamento           | `css/tema.css`                     |
| Volume massimo del suono                           | `js/audio.js`, `VOLUME_MAX`        |

Esempio: per partire con la tensione di rete efficace di 230 V, in
`js/stato.js` imposta `Vm: 325` (cioè 230 × √2).

Dopo aver modificato i file, se usi la versione a file unico rigenerala con:

```
python3 strumenti/crea-file-unico.py
```

## Il suono

Spunta **Suono delle onde** nella check list. Puoi ascoltare la tensione, la
corrente, entrambe in stereo (tensione a sinistra, corrente a destra) oppure la
loro somma, che fa sentire l'interferenza: in fase il suono si rinforza, a 180°
sparisce.

Attenzione alle basse frequenze: a 50 Hz gli altoparlanti di portatili e
smartphone riproducono poco o niente. Con le cuffie o casse esterne si sente
bene; in alternativa c'è il pulsante per passare a 440 Hz.

Per motivi di sicurezza i browser avviano l'audio solo dopo un clic: il suono
parte quando si spunta la voce.

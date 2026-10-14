# Laboratorio filtri RC

Web app didattica per esplorare i filtri passivi RC (passa basso, passa alto, passa banda)
applicati a segnali con armoniche indesiderate e a un brano audio con rumore bianco.
Funziona interamente nel browser: niente installazioni, niente server obbligatorio.

## Come si apre

**Sul proprio computer:** doppio clic su `index.html`. Funziona tutto; l'unica differenza è che,
aperto così, il browser non permette di leggere il file `audio/fra-martino.wav`, quindi la stessa
melodia viene generata al volo dal codice. Il caricamento di un file audio dello studente funziona comunque.

**Con un piccolo server locale** (consigliato, così si legge anche il WAV):

```
cd laboratorio-filtri-rc
python -m http.server 8000
```
poi aprire `http://localhost:8000` nel browser.

**Per gli studenti:** caricare l'intera cartella su qualsiasi spazio web statico
(sito della scuola, GitHub Pages, Netlify, Google Sites con incorporamento, Moodle come pacchetto file…)
e condividere il link a `index.html`.

## Struttura delle cartelle

```
laboratorio-filtri-rc/
├── index.html          pagina e testi (sezioni 1-2-3 e schede delle formule)
├── LEGGIMI.md          questo file
├── assets/
│   └── favicon.svg     icona della scheda del browser (curva di un passa basso + dB)
├── css/
│   └── style.css       aspetto e colori (anche i grafici usano questi colori)
├── docs/
│   ├── formulario-filtri-rc.pdf  formulario con esempi svolti (scaricabile dalla pagina)
│   └── genera_pdf.py             script che crea il PDF: modificalo per cambiare testi ed esempi
├── audio/
│   └── fra-martino.wav brano di esempio (melodia tradizionale, pubblico dominio)
└── js/
    ├── config.js       ESEMPI PRONTI e valori iniziali: il file da modificare per primo
    ├── formato.js      numeri all'italiana (4,7 kΩ; 2,2 nF; −3,0 dB)
    ├── fft.js          FFT, spettro e filtraggio del brano
    ├── filtri.js       formule dei filtri RC (funzione di trasferimento H(f))
    ├── segnali.js      somma di sinusoidi, rumore bianco, melodia sintetizzata
    ├── grafici.js      disegno dei grafici su canvas
    ├── schema.js       disegno dello schema elettrico in SVG
    ├── riproduttore.js riproduzione audio (Web Audio API)
    └── main.js         collega tutto: interfaccia, calcoli, grafici, audio
```

## Modifiche frequenti

**Aggiungere o cambiare un esempio pronto** — in `js/config.js`, nella lista `preset`:

```js
{
  nome: 'Il mio esempio',
  descr: 'Breve spiegazione mostrata sotto il menu.',
  f0: 440, a0: 1,                                   // segnale utile: frequenza (Hz) e ampiezza (V)
  disturbi: [[3000, 0.3], [5000, 0.2]],             // [frequenza Hz, ampiezza V], massimo 5
  filtro: { tipo: 'lp', R1: 1000, C1: 100e-9, stadi: 1 }
}
```
Le frequenze vanno in hertz interi; le capacità in farad (`100e-9` = 100 nF, `1e-6` = 1 µF).
Per il passa banda servono anche `R2`, `C2` e `buffer: true/false`.

**Cambiare il brano di esempio** — sostituire `audio/fra-martino.wav` con un altro file
(o cambiare `audio.file` in `config.js`). Funzionano WAV, MP3 e OGG. Il brano viene convertito
in mono a 22 050 Hz e tagliato a 15 secondi (`sampleRate` e `durataMax` in `config.js`).

**Cambiare i colori** — le variabili all'inizio di `css/style.css` (`--in` ingresso, `--out` uscita,
`--filtro`, `--disturbo`…). C'è anche una versione per il tema scuro del sistema.

**Cambiare gli assi dei grafici** — `bode` e `spettro` in `config.js` (frequenze minima e massima, decibel).

**Cambiare testi e schede delle formule** — direttamente in `index.html`, sezione «Le formule».

**Modificare il formulario PDF** — cambiare testi o esempi in `docs/genera_pdf.py` (funzione `contenuto()`)
e rigenerarlo:

```
pip install reportlab matplotlib numpy
python docs/genera_pdf.py
```
Il nuovo PDF sostituisce `docs/formulario-filtri-rc.pdf`. Se preferisci, puoi anche sostituire quel file
con un PDF fatto da te, mantenendo lo stesso nome.

## Che cosa calcola

- Passa basso: celle R in serie + C verso massa, 1–3 celle uguali separate da buffer ideali.
- Passa alto: celle C in serie + R verso massa, 1–3 celle.
- Passa banda: sezione passa alto (C1, R1) seguita da passa basso (R2, C2); senza buffer
  viene calcolato l'effetto di carico reale tra le due sezioni.
- Segnale con armoniche: l'uscita è calcolata esattamente componente per componente
  (ampiezza × |H(f)|, fase + arg H(f)), cioè a regime.
- Brano audio: il filtraggio avviene nel dominio della frequenza con la FFT, usando la stessa H(f).
  Il rapporto segnale/rumore in uscita è calcolato filtrando separatamente brano e rumore.

## Note per l'audio

- Il volume di ingresso e uscita usa lo stesso fattore di scala: l'attenuazione del filtro si sente.
- Cambiando valori durante l'ascolto il suono si aggiorna da solo.
- Il tasto Esc ferma l'audio.
- Il ronzio a 50 Hz si sente poco dalle casse dei portatili: meglio usare cuffie.

## Licenza

Codice e brano di esempio sono liberi da usare, modificare e distribuire per la didattica.
«Fra Martino» è una melodia tradizionale di pubblico dominio, sintetizzata per questo laboratorio.
Il carattere «Atkinson Hyperlegible» viene caricato da Google Fonts (licenza OFL); senza connessione
la pagina usa il carattere di sistema.

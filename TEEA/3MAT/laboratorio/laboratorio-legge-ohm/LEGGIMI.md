# Laboratorio legge di Ohm

Web app didattica per esplorare le basi dell'elettronica: un generatore di tensione,
una o più resistenze, la corrente che scorre, la legge di Ohm, il codice colori dei
resistori, le resistenze in serie e in parallelo, la potenza e l'energia.
Funziona interamente nel browser: niente installazioni, niente server obbligatorio.

## Che cosa fa

- **Una resistenza**: generatore e resistenza. Lo studente cambia V e R con i cursori
  o scrivendo il valore (si accettano forme come `4,7k`, `4k7`, `2M2`, `470`).
  I pallini nello schema mostrano la corrente: più è intensa, più vanno veloci.
- **Legge di Ohm** nelle tre forme (I = V/R, V = R·I, R = V/I), in simboli e con i numeri
  che cambiano, più il grafico della caratteristica tensione–corrente.
- **Codice colori**: il resistore commerciale più vicino al valore impostato, nelle serie
  E12 e E24 (4 bande) ed E96 (5 bande), con la lettura delle bande e l'intervallo di tolleranza.
- **Serie e parallelo**: da 2 a 3 resistenze (le stesse nelle due modalità, così si confrontano),
  resistenza equivalente, tensioni e correnti su ogni resistenza, verifica delle somme.
- **Potenza ed energia** (interruttore in alto a destra): P = V·I, R·I², V²/R, potenza di ogni
  resistenza, energia in J, Wh e kWh, costo in euro. Se una resistenza supera 1/4 W compare
  un avviso e il suo simbolo nello schema diventa arancione.

Ogni grandezza ha sempre lo stesso colore: tensione blu, corrente magenta,
resistenza verde, potenza ed energia ocra.

## Come si apre

**Sul proprio computer:** doppio clic su `index.html`. Funziona tutto.

**Per gli studenti:** caricare l'intera cartella su uno spazio web statico
(sito della scuola, GitHub Pages, Netlify, Moodle come pacchetto file…)
e condividere il link a `index.html`.

## Struttura delle cartelle

```
laboratorio-legge-ohm/
├── index.html            pagina e testi
├── LEGGIMI.md            questo file
├── assets/
│   └── favicon.svg       icona della scheda del browser (resistenza + Ω)
├── css/
│   └── style.css         aspetto e colori (anche schema e grafici usano questi colori)
└── js/
    ├── config.js         VALORI INIZIALI E LIMITI: il file da modificare per primo
    ├── formato.js        numeri all'italiana (4,7 kΩ; 12 mA) e lettura dei valori scritti
    ├── circuito.js       calcoli: legge di Ohm, serie, parallelo, potenza
    ├── codice-colori.js  serie E12/E24/E96, valore più vicino, disegno del resistore
    ├── schema.js         disegno dello schema elettrico e animazione della corrente
    ├── caratteristica.js grafico tensione–corrente
    └── main.js           collega tutto: comandi, formule, pannelli
```

## Modifiche frequenti

**Cambiare valori iniziali e limiti** — in `js/config.js`:

```js
tensione:   { min: 0, max: 24, passo: 0.1, iniziale: 12 },   // volt
resistenza: { min: 1, max: 1e6, iniziale: 1000 },            // ohm (1e6 = 1 MΩ)
gruppo:     { minimo: 2, massimo: 3, iniziali: [1000, 2200, 4700] },
```

**Cambiare il simbolo della resistenza** — in `js/config.js`:
`simboloResistenza: 'zigzag'` (predefinito, tre punte per lato) oppure `'rettangolo'` (norme CEI/IEC).
Il disegno dei simboli è nelle funzioni `generatore()` e `resistore()` di `js/schema.js`.

**Cambiare la potenza massima del resistore** — `potenzaNominale: 0.25` (in watt).
Per esempio `0.5` per resistori da 1/2 W.

**Cambiare la tolleranza delle serie o il colore del corpo del resistore** —
nella voce `codiceColori` di `js/config.js`.

**Cambiare il prezzo dell'energia proposto all'inizio** — `energia.prezzoKWh`.

**Rendere la corrente più o meno veloce** — nella voce `animazione`.
La velocità segue una scala logaritmica tra `correnteMin` e `correnteMax`, perché le correnti
vanno dai microampere agli ampere: con una scala lineare quasi tutte sembrerebbero ferme.
La stessa scala è usata dalla barra «Intensità della corrente».

**Cambiare i colori** — le variabili all'inizio di `css/style.css`
(`--tensione`, `--corrente`, `--resistenza`, `--potenza`…), con una versione per il tema scuro.

**Cambiare i testi** — titoli e spiegazioni fisse sono in `index.html`;
le frasi che accompagnano le formule sono in `js/main.js`, nelle funzioni `formule()`,
`grafico()`, `colori()` e `potenza()`.

## Note

- Se il sistema dello studente ha l'opzione «riduci movimento», i pallini restano fermi
  ma lo schema mostra comunque frecce e valori.
- Il generatore è un cerchio attraversato dal filo, con il segno + all'esterno dalla parte del polo positivo.
- Il simbolo di massa è il triangolino vuoto.

# Laboratorio delle impedenze

Web app didattica (HTML, CSS e JavaScript, senza librerie esterne) per lavorare
con le impedenze in forma vettoriale.
Si apre con un doppio clic su `index.html`, anche senza connessione a Internet
(senza rete cambiano solo i caratteri).

© 2026 prof. Pasquale Naclerio

## Che cosa fa

Il menu in alto sceglie la parte visibile.

**Impedenza da tensione e corrente.** Si impostano i fasori di tensione e corrente
(modulo e fase) scrivendo i numeri, usando i cursori o trascinando le punte delle
frecce. La pagina calcola l'impedenza `Z = V / I` in notazione fasoriale
(`|Z| ∠ φ`) e la disegna su un piano piccolo, dove si può trascinare anche la
punta di Z (cambia la corrente, la tensione resta ferma). Se lo sfasamento supera
90° compare l'avviso di resistenza negativa.

**Impedenza dei componenti.** Si sceglie R, L, C oppure RL, RC, LC, RLC, in serie
o in parallelo. Si cambiano frequenza e valori con i numeri, con i cursori
(scala logaritmica) o trascinando le punte dei fasori delle impedenze.
In serie le frecce sono messe punta-coda; in parallelo le impedenze dei singoli
componenti sono tratteggiate e Z si ottiene dalle ammettenze.
Con L e C insieme c'è il pulsante per andare alla frequenza di risonanza.

**Spunta in fondo: forma complessa.** Mostra parte reale e parte immaginaria di
V, I e Z (anche come campi da modificare), la forma esponenziale, i passaggi del
calcolo (divisione con il coniugato, somma delle impedenze o delle ammettenze),
e sui piani le proiezioni sugli assi con resistenza R e reattanza X.
Nel primo modo indica anche il circuito equivalente serie a una frequenza scelta.

## Cartelle

```
laboratorio-impedenze/
├── index.html              struttura della pagina e testi fissi
├── css/
│   ├── tema.css            colori (chiaro e scuro) e caratteri
│   ├── layout.css          disposizione delle colonne, adattamento al telefono
│   └── componenti.css      menu, campi, pulsanti, piani, risultati
├── js/
│   ├── stato.js            valori di partenza e regole generali
│   ├── complessi.js        calcoli con i numeri complessi
│   ├── formato.js          virgola decimale, prefissi (m, µ, k), campi numerici
│   ├── disegno/
│   │   ├── piano.js        griglia, frecce, archi, trascinamento
│   │   └── schema.js       schema del circuito (resistore rettangolare CEI)
│   ├── modo-vi.js          parte "Impedenza da tensione e corrente"
│   ├── modo-componenti.js  parte "Impedenza dei componenti"
│   └── main.js             menu, spunta della forma complessa, tema
├── assets/
│   ├── favicon.svg         icona della scheda del browser
│   └── logo-pn.png         (da aggiungere) logo per il copyright
├── strumenti/
│   └── crea-file-unico.py  crea la versione in un solo file HTML
└── file-unico/
    └── laboratorio-impedenze.html
```

## Cosa cambiare e dove

| Voglio cambiare...                                   | File e punto                                  |
|------------------------------------------------------|-----------------------------------------------|
| Valori con cui si apre la pagina (V, I, R, L, C, f)  | `js/stato.js`, oggetto `L.S`                   |
| Componente scelto all'apertura                       | `js/stato.js`, `tipo` e `coll`                 |
| Quanto la corrente appare più piccola della tensione | `js/stato.js`, `RAPPORTO_VISIVO_CORRENTE`      |
| Spazio tra la freccia più lunga e il bordo           | `js/stato.js`, `MARGINE_SCALA`                 |
| Aggancio dell'angolo ai multipli di 15°              | `js/stato.js`, `AGGANCIO_ANGOLO` (0 = niente)  |
| Cifre significative mostrate                         | `js/stato.js`, `CIFRE`                         |
| Valori possibili dei fondo scala                     | `js/stato.js`, `PASSI_SCALA`                   |
| Intervalli dei cursori di f, R, L, C                 | `js/stato.js`, `CURSORI`                       |
| Colori di V, I, Z, R, L, C                           | `css/tema.css` (tre blocchi: chiaro e due scuri) |
| Numero di quadretti per semiasse                     | `js/disegno/piano.js`, `DIV`                   |
| Esempi pronti del primo modo                         | `index.html`, `data-sf` dei pulsanti (gradi)   |
| Descrizioni del tipo di carico                       | `js/modo-vi.js`, funzione `L.natura`           |
| Testo del copyright                                  | `index.html`, elemento `footer`                |

## Logo

Per mostrare il logo accanto al copyright, copiare il file PNG del logo in
`assets/logo-pn.png`. Se il file manca, la pagina mostra solo la scritta.

## Versione a file unico

Dopo ogni modifica, per rigenerare il file da caricare su Classroom, Moodle o sul sito:

```
python3 strumenti/crea-file-unico.py
```

Lo script inserisce CSS, JavaScript, icona e logo dentro
`file-unico/laboratorio-impedenze.html`.

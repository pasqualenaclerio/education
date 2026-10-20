---
layout: default
title: Segnali elettrici continui e alternati — TEEA 4MAT
---

# Segnali elettrici continui e alternati

### TEEA — 4MAT · Argomento 1

<a class="btn btn-pdf" href="pdf/01-segnali-continui-alternati.pdf" download>Scarica la spiegazione in PDF</a>

---

<!-- PDF:INIZIO -->

## Il segnale elettrico

Un **segnale elettrico** è una grandezza elettrica, **tensione** o **corrente**, che porta un'informazione o un'energia e che può variare nel tempo.

Per distinguere i valori si usa una convenzione sui simboli:

- **lettera minuscola** → valore istantaneo, cioè il valore in un preciso istante: *v*(*t*), *i*(*t*);
- **lettera maiuscola** → valore costante o caratteristico: *V*, *I*, *V*<sub>M</sub>, *I*<sub>M</sub>.

## Segnale continuo e segnale alternato

![Confronto tra un segnale continuo (DC) e un segnale alternato (AC)](img/continua-alternata.svg)

### Segnale continuo (DC)

Un segnale **continuo** (*DC – Direct Current*) mantiene nel tempo **lo stesso valore e lo stesso verso**.

- Sul grafico tensione–tempo è una **retta orizzontale**.
- Si indica con *V* (tensione) e *I* (corrente).
- Esempi: pila, batteria dell'auto (12 V), alimentatore da laboratorio, porta USB (5 V).

### Segnale alternato (AC)

Un segnale **alternato** (*AC – Alternating Current*) **cambia periodicamente valore e verso**: si ripete sempre uguale nel tempo e assume valori positivi e negativi.

- In un periodo il **valore medio è zero**: l'area della semionda positiva è uguale a quella della semionda negativa.
- Esempio tipico: la **rete elettrica** domestica (230 V, 50 Hz).

## La sinusoide

La forma d'onda alternata più importante è la **sinusoide**. Il valore istantaneo della tensione e della corrente si scrive:

> **Tensione:** *v*(*t*) = *V*<sub>M</sub> · sin(*ω t* + *φ*)
>
> **Corrente:** *i*(*t*) = *I*<sub>M</sub> · sin(*ω t* + *φ*)

![Sinusoide con ampiezza, valore picco-picco e periodo](img/sinusoide.svg)

| Simbolo | Grandezza | Unità di misura | Significato |
|---|---|---|---|
| *V*<sub>M</sub>, *I*<sub>M</sub> | ampiezza (valore massimo o di picco) | V, A | il valore più alto raggiunto dalla sinusoide |
| *V*<sub>pp</sub> | valore picco-picco | V | distanza tra il massimo e il minimo: *V*<sub>pp</sub> = 2 · *V*<sub>M</sub> |
| *T* | periodo | s (secondi) | tempo impiegato per compiere un'oscillazione completa |
| *f* | frequenza | Hz (hertz) | numero di oscillazioni complete in un secondo |
| *ω* | pulsazione (omega) | rad/s | velocità angolare con cui ruota il fasore |
| *φ* | fase iniziale (fi) | rad oppure ° | posizione della sinusoide all'istante *t* = 0 |
| *ω t* + *φ* | fase (angolo istantaneo) | rad | angolo raggiunto all'istante *t* |

## Formule fondamentali

> **Frequenza e periodo:** *f* = 1 / *T*  ⟺  *T* = 1 / *f*
>
> **Pulsazione:** *ω* = 2π · *f* = 2π / *T*
>
> **Valore picco-picco:** *V*<sub>pp</sub> = 2 · *V*<sub>M</sub>

Frequenza e periodo sono **inversamente proporzionali**: se la frequenza raddoppia, il periodo si dimezza.

**Multipli e sottomultipli utili:** 1 kHz = 10<sup>3</sup> Hz · 1 MHz = 10<sup>6</sup> Hz · 1 ms = 10<sup>−3</sup> s · 1 µs = 10<sup>−6</sup> s

## Gli angoli in radianti

In elettrotecnica gli angoli si misurano di solito in **radianti** (rad). Un giro completo vale **2π rad**, cioè 360°.

> **Da gradi a radianti:** *α*<sub>rad</sub> = *α*° · π / 180
>
> **Da radianti a gradi:** *α*° = *α*<sub>rad</sub> · 180 / π

| Gradi | 0° | 30° | 45° | 60° | 90° | 180° | 270° | 360° |
|---|---|---|---|---|---|---|---|---|
| **Radianti** | 0 | π/6 | π/4 | π/3 | π/2 | π | 3π/2 | 2π |

Per questo la pulsazione si chiama anche **velocità angolare**: in un periodo *T* il fasore compie un giro, cioè percorre 2π rad, quindi *ω* = 2π / *T*.

## La rappresentazione a fasori

Disegnare e sommare sinusoidi è scomodo. Per questo ogni sinusoide si rappresenta con un **fasore**: un **vettore che ruota in senso antiorario** attorno all'origine.

![Il fasore che ruota con velocità angolare ω genera la sinusoide](img/fasore-sinusoide.svg)

- La **lunghezza** del fasore è l'**ampiezza** *V*<sub>M</sub>.
- La **velocità di rotazione** è la **pulsazione** *ω*.
- L'**angolo iniziale**, misurato dall'asse orizzontale in senso antiorario, è la **fase iniziale** *φ*.
- La **proiezione sull'asse verticale** del fasore che ruota disegna, istante per istante, la **sinusoide** *v*(*t*).

Il fasore si indica con una lettera maiuscola soprassegnata, **V̄**, e si scrive in forma polare:

> **Fasore:** V̄ = *V*<sub>M</sub> ∠ *φ*

Quando tutte le grandezze hanno la **stessa frequenza**, i fasori ruotano insieme e mantengono gli stessi angoli tra loro. Si possono quindi disegnare **fermi**, nella posizione che hanno a *t* = 0: è il **diagramma fasoriale**.

## La fase e lo sfasamento

La **fase iniziale** *φ* indica da dove parte la sinusoide all'istante *t* = 0. Confrontando due sinusoidi **con la stessa frequenza** si definisce lo **sfasamento**:

> **Sfasamento:** Δ*φ* = *φ*<sub>1</sub> − *φ*<sub>2</sub>

![Due sinusoidi sfasate e il corrispondente diagramma fasoriale](img/sfasamento.svg)

Nel diagramma fasoriale lo sfasamento è semplicemente l'**angolo tra i due fasori**.

- **in fase** (Δ*φ* = 0): raggiungono il massimo nello stesso istante;
- **in anticipo** (Δ*φ* > 0): la prima raggiunge il massimo prima della seconda (nella figura *v*<sub>1</sub> è in anticipo su *v*<sub>2</sub>);
- **in ritardo** (Δ*φ* < 0): la prima raggiunge il massimo dopo la seconda;
- **in opposizione di fase** (Δ*φ* = π rad = 180°): quando una è al massimo, l'altra è al minimo;
- **in quadratura** (Δ*φ* = π/2 rad = 90°).

Lo sfasamento si può esprimere anche come ritardo nel tempo: Δ*t* = Δ*φ* / *ω*.

## Leggere un segnale sull'oscilloscopio

L'**oscilloscopio** disegna la tensione in funzione del tempo. Lo schermo è diviso da un reticolo in **divisioni** (di solito 10 in orizzontale e 8 in verticale) e ogni divisione è a sua volta suddivisa in **5 parti**, le tacche sugli assi centrali. Una parte vale quindi **1/5 di divisione = 0,2 div**.

Per trasformare le divisioni in volt e in secondi bisogna conoscere le due impostazioni dell'oscilloscopio:

- **V/div** (volt per divisione, comando verticale): quanti volt vale **una divisione in verticale**. Ogni canale ha il suo V/div.
- **Time/div** (tempo per divisione, comando orizzontale): quanto tempo vale **una divisione in orizzontale**. È lo stesso per tutti i canali.

### Contare divisioni e parti

Si contano prima le **divisioni intere**, poi le **parti** che restano, e si sommano:

> **Divisioni lette:** *n* = divisioni intere + parti · 0,2

| Parti | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **Divisioni** | 0,2 | 0,4 | 0,6 | 0,8 | 1 |

Per esempio 2 divisioni e 3 parti valgono 2 + 3 · 0,2 = **2,6 div**.

### Tensione, periodo e frequenza

Le divisioni lette si trasformano in valori moltiplicando per l'impostazione dell'oscilloscopio:

> **Tensione:** *V* = *n*<sub>verticali</sub> · V/div
>
> **Tempo:** *t* = *n*<sub>orizzontali</sub> · Time/div
>
> **Frequenza:** *f* = 1 / *T*

- **Ampiezza *V*<sub>M</sub>:** si contano le divisioni verticali dall'asse centrale (lo zero) fino al picco. È più preciso misurare il valore picco-picco *V*<sub>pp</sub>, dal picco alla valle, e dividere per 2: *V*<sub>M</sub> = *V*<sub>pp</sub> / 2.
- **Periodo *T*:** si contano le divisioni orizzontali tra due punti uguali e consecutivi della sinusoide, per esempio due passaggi per lo zero in salita.
- **Frequenza *f*:** si ricava dal periodo, *f* = 1 / *T*.

![Lettura di ampiezza e periodo sullo schermo dell'oscilloscopio](img/oscilloscopio-lettura.svg){: width="460"}

**Esempio.** Impostazioni: **2 V/div** e **1 ms/div**.

- **ampiezza:** il picco è a 2 divisioni e 3 parti = 2,6 div → *V*<sub>M</sub> = 2,6 · 2 V = **5,2 V** (*V*<sub>pp</sub> = 10,4 V)
- **periodo:** tra due passaggi per lo zero in salita ci sono 4 div → *T* = 4 · 1 ms = **4 ms**
- **frequenza:** *f* = 1 / *T* = 1 / 0,004 s = **250 Hz**
- **pulsazione:** *ω* = 2π · *f* = 2π · 250 ≈ **1571 rad/s**
- la sinusoide passa per lo zero in salita al centro dello schermo (*t* = 0), quindi *φ* = 0 e **v(t) = 5,2 · sin(1571 t) V**

### Lo sfasamento tra due segnali

Con due segnali della **stessa frequenza** visualizzati sui due canali:

- **1.** si misura il **periodo *T***, che è lo stesso per i due segnali;
- **2.** si misura la **distanza orizzontale Δ*t*** tra due punti corrispondenti, per esempio i due passaggi per lo zero in salita;
- **3.** si divide Δ*t* per il periodo e si moltiplica per 360°.

> **Sfasamento:** Δ*φ* = (Δ*t* / *T*) · 360°
>
> **In radianti:** Δ*φ* = (Δ*t* / *T*) · 2π

Il segnale che passa per primo per lo zero in salita, cioè quello **più a sinistra**, è **in anticipo**; l'altro è **in ritardo**.

![Due segnali sfasati: periodo T e differenza temporale Δt](img/oscilloscopio-sfasamento.svg){: width="460"}

**Esempio.** Impostazioni: CH1 **2 V/div**, CH2 **1 V/div**, **1 ms/div**.

- **ampiezze:** *v*<sub>1</sub> arriva a 3 div → 3 · 2 V = **6 V**; *v*<sub>2</sub> arriva a 2 div → 2 · 1 V = **2 V** (attenzione: i due canali hanno V/div diversi)
- **periodo:** *T* = 4 div · 1 ms = **4 ms**, quindi *f* = **250 Hz**
- **differenza temporale:** Δ*t* = 3 parti = 0,6 div → 0,6 · 1 ms = **0,6 ms**
- **sfasamento:** Δ*φ* = (0,6 / 4) · 360° = **54°** (≈ 0,94 rad): *v*<sub>1</sub> è **in anticipo** di 54° su *v*<sub>2</sub>

**Consiglio:** scegli V/div e Time/div in modo che il segnale occupi buona parte dello schermo in altezza e che si vedano uno o due periodi. Così le letture sono più precise.

## Esempio: la rete elettrica

Per la rete domestica *f* = 50 Hz:

- **periodo:** *T* = 1 / *f* = 1 / 50 = 0,02 s = **20 ms**
- **pulsazione:** *ω* = 2π · *f* = 2π · 50 ≈ **314 rad/s**
- **ampiezza:** i 230 V sono il *valore efficace*; il valore massimo è *V*<sub>M</sub> = 230 · √2 ≈ **325 V**, quindi *V*<sub>pp</sub> ≈ 650 V
- **espressione:** *v*(*t*) ≈ 325 · sin(314 *t*) V

<!-- PDF:FINE -->

---

✏️ Per allenarti: [esercizi](/education/TEEA/4MAT/materiali/esercitazione-sinusoidi-4MAT.pdf) e [soluzioni](/education/TEEA/4MAT/materiali/soluzioni-esercitazione-sinusoidi-4MAT.pdf) su sinusoidi, oscilloscopio e fasori.

➡️ Per vedere sinusoidi, fasori e sfasamento in movimento usa la web app [Corrente alternata](/education/TEEA/4MAT/laboratorio/ca/).

[← Torna a TEEA — 4MAT](/education/TEEA/4MAT/)

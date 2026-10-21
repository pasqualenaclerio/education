---
layout: default
title: Partitori di tensione e di corrente, potenza ed energia — TEEA 3MAT
---

# Partitori di tensione e di corrente, potenza ed energia

### TEEA — 3MAT · Argomento 2

<a class="btn btn-pdf" href="pdf/02-partitori-potenza-energia.pdf" download>Scarica la spiegazione in PDF</a>

---

<!-- PDF:INIZIO -->

## Il partitore di tensione

Un **partitore di tensione** è formato da due resistenze *R*<sub>1</sub> e *R*<sub>2</sub> collegate **in serie** tra la tensione di alimentazione *V* e la massa. Nel punto centrale *X* si ottiene una tensione *V*<sub>X</sub> **più piccola** di *V*: la tensione di alimentazione si "divide" tra le due resistenze.

![Partitore di tensione con V = 12 V, R1 = 1,8 kΩ e R2 = 1,2 kΩ](img/partitore-tensione.svg){: width="420"}

### Come si ricava la formula

- **1.** Le due resistenze sono in **serie**: la resistenza totale è *R*<sub>1</sub> + *R*<sub>2</sub>.
- **2.** Nel circuito scorre una sola corrente, che si trova con la legge di Ohm: *I* = *V* / (*R*<sub>1</sub> + *R*<sub>2</sub>).
- **3.** La tensione nel punto *X* è la tensione ai capi di *R*<sub>2</sub>: *V*<sub>X</sub> = *R*<sub>2</sub> · *I*.
- **4.** Sostituendo la corrente si ottiene la formula del partitore.

> **Partitore di tensione:** *V*<sub>X</sub> = *V* · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Tensione su *R*<sub>1</sub>:** *V*<sub>1</sub> = *V* · *R*<sub>1</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Verifica:** *V*<sub>1</sub> + *V*<sub>X</sub> = *V*

La tensione si divide **in proporzione alle resistenze**: la resistenza più grande prende la tensione più grande. Se *R*<sub>1</sub> = *R*<sub>2</sub>, *V*<sub>X</sub> è esattamente la metà di *V*.

**Attenzione:** la formula vale **a vuoto**, cioè quando al punto *X* non è collegato niente, oppure è collegato un carico con resistenza molto più grande di *R*<sub>2</sub>. Un carico collegato in *X* si mette in parallelo a *R*<sub>2</sub> e abbassa *V*<sub>X</sub>.

### Esempio svolto

*V* = 12 V, *R*<sub>1</sub> = 1,8 kΩ, *R*<sub>2</sub> = 1,2 kΩ (lo schema qui sopra).

- **resistenza totale:** *R*<sub>1</sub> + *R*<sub>2</sub> = 1,8 + 1,2 = 3 kΩ
- **corrente:** *I* = 12 V / 3 kΩ = **4 mA**
- **tensione in *X*:** *V*<sub>X</sub> = 12 · 1,2 / 3 = **4,8 V**
- **tensione su *R*<sub>1</sub>:** *V*<sub>1</sub> = 12 · 1,8 / 3 = **7,2 V**
- **verifica:** 7,2 + 4,8 = 12 V ✓

## Il partitore di corrente

Un **partitore di corrente** è formato da due resistenze collegate **in parallelo**. La corrente totale *I* che entra nel nodo si **divide** nei due rami: *I*<sub>1</sub> passa in *R*<sub>1</sub>, *I*<sub>2</sub> passa in *R*<sub>2</sub>.

![Partitore di corrente con I = 20 mA, R1 = 1 kΩ e R2 = 1,5 kΩ](img/partitore-corrente.svg){: width="440"}

### Come si ricava la formula

- **1.** Le due resistenze sono in **parallelo**: hanno **la stessa tensione** *V* ai capi.
- **2.** La resistenza equivalente del parallelo è *R*<sub>eq</sub> = *R*<sub>1</sub> · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>), quindi *V* = *R*<sub>eq</sub> · *I*.
- **3.** La corrente in ogni ramo è *I*<sub>1</sub> = *V* / *R*<sub>1</sub> e *I*<sub>2</sub> = *V* / *R*<sub>2</sub>.
- **4.** Sostituendo *V* si ottiene la formula del partitore.

> **Corrente in *R*<sub>1</sub>:** *I*<sub>1</sub> = *I* · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Corrente in *R*<sub>2</sub>:** *I*<sub>2</sub> = *I* · *R*<sub>1</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Verifica:** *I*<sub>1</sub> + *I*<sub>2</sub> = *I*

**Attenzione alle resistenze "incrociate":** nella formula di *I*<sub>1</sub> al numeratore c'è *R*<sub>2</sub>, e viceversa. La corrente preferisce la strada più facile: **nella resistenza più piccola passa la corrente più grande**.

### Esempio svolto

*I* = 20 mA, *R*<sub>1</sub> = 1 kΩ, *R*<sub>2</sub> = 1,5 kΩ (lo schema qui sopra).

- **corrente in *R*<sub>1</sub>:** *I*<sub>1</sub> = 20 · 1,5 / (1 + 1,5) = 20 · 1,5 / 2,5 = **12 mA**
- **corrente in *R*<sub>2</sub>:** *I*<sub>2</sub> = 20 · 1 / 2,5 = **8 mA**
- **verifica:** 12 + 8 = 20 mA ✓
- **tensione ai capi del parallelo:** *V* = *R*<sub>1</sub> · *I*<sub>1</sub> = 1 kΩ · 12 mA = **12 V** (uguale a *R*<sub>2</sub> · *I*<sub>2</sub> = 1,5 kΩ · 8 mA)

## Il potenziometro

Il **potenziometro** è una resistenza con **tre terminali**: i due estremi e un **cursore** che scorre sulla pista resistiva. Il cursore divide la resistenza totale *R*<sub>P</sub> in due parti: è un **partitore di tensione regolabile**.

![Potenziometro usato come partitore di tensione regolabile](img/potenziometro.svg){: width="240"}

Collegando gli estremi tra *V* e la massa, girando il cursore la tensione *V*<sub>X</sub> varia con continuità **da 0 V a *V***. I potenziometri si usano per regolare il volume, la luminosità, la velocità di un motore, una tensione di riferimento.

### Dove conviene mettere il potenziometro: al posto di *R*<sub>1</sub> o di *R*<sub>2</sub>?

Spesso si usa una **resistenza fissa** insieme a un potenziometro (o a una resistenza variabile). La resistenza fissa **limita la corrente** quando il potenziometro è a zero e fissa uno dei due limiti della regolazione.

![Potenziometro al posto di R2 (a) e al posto di R1 (b)](img/potenziometro-posizione.svg){: width="420"}

| Posizione | *V*<sub>X</sub> minima | *V*<sub>X</sub> massima | Quando conviene |
|---|---|---|---|
| **(a)** potenziometro al posto di ***R*<sub>2</sub>** (verso massa) | 0 V | *V* · *R*<sub>2max</sub> / (*R*<sub>1</sub> + *R*<sub>2max</sub>) | per regolare **da zero** fino a un valore massimo |
| **(b)** potenziometro al posto di ***R*<sub>1</sub>** (verso *V*) | *V* · *R*<sub>2</sub> / (*R*<sub>1max</sub> + *R*<sub>2</sub>) | *V* | per regolare da un valore minimo **fino a *V*** |

**Esempio (a).** *V* = 12 V, *R*<sub>1</sub> = 1 kΩ fissa, *R*<sub>2</sub> potenziometro da 0 a 10 kΩ.

- con *R*<sub>2</sub> = 0: *V*<sub>X</sub> = **0 V**, e la corrente vale al massimo 12 V / 1 kΩ = 12 mA, perché *R*<sub>1</sub> la limita
- con *R*<sub>2</sub> = 10 kΩ: *V*<sub>X</sub> = 12 · 10 / 11 ≈ **10,9 V**
- la tensione si regola da 0 V a circa 10,9 V

**Esempio (b).** *V* = 12 V, *R*<sub>1</sub> potenziometro da 0 a 10 kΩ, *R*<sub>2</sub> = 1 kΩ fissa.

- con *R*<sub>1</sub> = 10 kΩ: *V*<sub>X</sub> = 12 · 1 / 11 ≈ **1,09 V**
- con *R*<sub>1</sub> = 0: *V*<sub>X</sub> = **12 V**, e la corrente vale al massimo 12 V / 1 kΩ = 12 mA
- la tensione si regola da circa 1,09 V a 12 V

**Regola pratica:** il potenziometro va **dalla parte del limite che vuoi raggiungere**: verso massa (al posto di *R*<sub>2</sub>) per arrivare a 0 V, verso l'alimentazione (al posto di *R*<sub>1</sub>) per arrivare a *V*. La resistenza fissa evita il **cortocircuito** quando il potenziometro è a zero.

## La potenza elettrica

La **potenza** indica quanta energia un componente assorbe (o fornisce) in un secondo. In una resistenza tutta l'energia elettrica si trasforma in **calore** (effetto Joule): per questo le resistenze si scaldano.

- Simbolo: *P* · unità di misura: **watt** (W).
- Multipli e sottomultipli: 1 kW = 1000 W · 1 mW = 0,001 W.

> **Potenza:** *P* = *V* · *I*
>
> **Con la legge di Ohm:** *P* = *R* · *I*<sup>2</sup>  ;  *P* = *V*<sup>2</sup> / *R*

Si usa la forma più comoda in base ai dati: *V* e *I* noti → *P* = *V* · *I*; *R* e *I* noti → *P* = *R* · *I*<sup>2</sup>; *V* e *R* noti → *P* = *V*<sup>2</sup> / *R*.

### La potenza nominale dei resistori

Ogni resistore può dissipare al massimo una certa potenza, la **potenza nominale**: i più comuni sono da **1/4 W** (0,25 W), 1/2 W e 1 W. Se la potenza calcolata la supera, il resistore si surriscalda e si può bruciare. Conviene scegliere un resistore con un **margine**, per esempio almeno il doppio della potenza calcolata.

### Esempi svolti

- **Resistore a 12 V.** *R* = 1 kΩ, *V* = 12 V → *I* = 12 mA; *P* = *V* · *I* = 12 · 0,012 = **0,144 W** = 144 mW. Un resistore da 1/4 W va bene.
- **Resistore al limite.** *R* = 100 Ω, *I* = 50 mA = 0,05 A → *P* = *R* · *I*<sup>2</sup> = 100 · 0,05<sup>2</sup> = **0,25 W**: è proprio al limite di un resistore da 1/4 W, meglio usarne uno da 1/2 W.
- **Stufetta.** *V* = 230 V, *R* = 26,45 Ω → *P* = *V*<sup>2</sup> / *R* = 230<sup>2</sup> / 26,45 = **2000 W** = 2 kW.
- **Potenze nel partitore di tensione** dell'esempio iniziale (*I* = 4 mA): *P*<sub>1</sub> = *V*<sub>1</sub> · *I* = 7,2 · 0,004 = 28,8 mW; *P*<sub>2</sub> = *V*<sub>X</sub> · *I* = 4,8 · 0,004 = 19,2 mW; totale *P* = *V* · *I* = 12 · 0,004 = **48 mW** = 28,8 + 19,2 ✓.

## L'energia elettrica

L'**energia** è la potenza assorbita per tutto il tempo di funzionamento: più a lungo resta acceso un apparecchio, più energia consuma.

> **Energia:** *E* = *P* · *t*

- Se la potenza è in **watt** (W) e il tempo in **ore** (h), l'energia è in **wattora** (Wh).
- Multiplo: 1 **kWh** (kilowattora) = 1000 Wh. È l'unità che si legge sulla bolletta della luce.
- Il tempo va sempre in **ore**: 30 min = 0,5 h · 15 min = 0,25 h · 10 min ≈ 0,167 h.

**Accenno al joule.** L'unità di misura dell'energia del Sistema Internazionale è il **joule** (J): 1 J = 1 W · 1 s, cioè con la potenza in watt e il tempo in secondi. Il joule è un'unità molto piccola: 1 Wh = 3600 J. Per questo con gli impianti e gli apparecchi elettrici si usano i **wattora** e i **kilowattora**.

### Esempi svolti

- **Resistore acceso a lungo.** Il resistore da 0,144 W dell'esempio precedente resta acceso 10 h: *E* = 0,144 · 10 = **1,44 Wh**.
- **Asciugacapelli.** *P* = 1200 W per 15 min = 0,25 h: *E* = 1200 · 0,25 = **300 Wh** = 0,3 kWh.
- **Lampadina LED.** *P* = 10 W, accesa 5 h al giorno per 30 giorni: *t* = 5 · 30 = 150 h; *E* = 10 · 150 = 1500 Wh = **1,5 kWh**.
- **Stufetta e costo.** *P* = 2000 W per 3 h: *E* = 2000 · 3 = 6000 Wh = **6 kWh**. Con un prezzo di 0,25 €/kWh il costo è 6 · 0,25 = **1,50 €**.

## Riepilogo delle formule

> **Partitore di tensione:** *V*<sub>X</sub> = *V* · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Partitore di corrente:** *I*<sub>1</sub> = *I* · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)  ;  *I*<sub>2</sub> = *I* · *R*<sub>1</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Potenza:** *P* = *V* · *I*  ;  *P* = *R* · *I*<sup>2</sup>  ;  *P* = *V*<sup>2</sup> / *R*
>
> **Energia:** *E* = *P* · *t*  (W · h = Wh)  ;  1 kWh = 1000 Wh  ;  1 Wh = 3600 J

<!-- PDF:FINE -->

---

✏️ Per allenarti: [esercizi](/education/TEEA/3MAT/materiali/esercitazione-partitori-potenza-energia-3MAT.pdf), [soluzioni](/education/TEEA/3MAT/materiali/soluzioni-esercitazione-partitori-potenza-energia-3MAT.pdf) e [formulario](pdf/02-formulario-partitori-potenza-energia.pdf).

➡️ Per provare serie, parallelo, potenza ed energia usa la web app [Laboratorio legge di Ohm](/education/TEEA/3MAT/laboratorio/laboratorio-legge-ohm/).

[← Torna a TEEA — 3MAT](/education/TEEA/3MAT/)

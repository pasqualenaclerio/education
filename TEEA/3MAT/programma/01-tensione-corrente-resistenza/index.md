---
layout: default
title: Tensione, corrente, resistenza e legge di Ohm — TEEA 3MAT
---

# Tensione, corrente, resistenza e legge di Ohm

### TEEA — 3MAT · Argomento 1

<a class="btn btn-pdf" href="pdf/01-tensione-corrente-resistenza.pdf" download>Scarica la spiegazione in PDF</a>

---

<!-- PDF:INIZIO -->

## Le grandezze elettriche fondamentali

In ogni circuito elettrico ci sono tre grandezze che lavorano insieme: la **tensione** spinge le cariche, la **corrente** è il loro movimento, la **resistenza** si oppone a questo movimento.

| Grandezza | Simbolo | Unità di misura | Strumento | Come si collega |
|---|---|---|---|---|
| tensione | *V* | volt (V) | voltmetro | in **parallelo** al componente |
| corrente | *I* | ampere (A) | amperometro | in **serie** al componente |
| resistenza | *R* | ohm (Ω) | ohmmetro | sul componente **scollegato** dal circuito |

## Il circuito elettrico

Un **circuito elettrico** è un percorso chiuso in cui può scorrere la corrente. È formato da:

- un **generatore**, che fornisce l'energia;
- un **utilizzatore** (o carico), che usa l'energia: qui una resistenza *R*;
- i **conduttori** (fili), che collegano gli elementi;
- spesso un **interruttore**, che apre o chiude il circuito.

![Circuito elementare: generatore di tensione V, resistenza R e corrente I](img/circuito-base.svg){: width="300"}

Se il circuito è **chiuso** la corrente scorre; se è **aperto** (interruttore aperto o filo interrotto) la corrente è zero.

## La tensione

La **tensione elettrica** (o **differenza di potenziale**, d.d.p.) è la "spinta" che mette in movimento le cariche elettriche. Si misura sempre **tra due punti** del circuito.

- Simbolo: *V* · unità di misura: **volt** (V).
- Multipli e sottomultipli: 1 kV = 1000 V · 1 mV = 0,001 V.
- Si indica con i segni **+** e **−** oppure con una freccia.

Un paragone utile è quello idraulico: la tensione è come la **differenza di altezza** tra due serbatoi; più è grande, più l'acqua scorre con forza.

**Valori tipici:** pila stilo 1,5 V · batteria 9 V · porta USB 5 V · batteria dell'auto 12 V · rete elettrica di casa 230 V (alternata).

## I generatori di tensione

Un **generatore di tensione** mantiene una tensione tra i suoi due morsetti, il **polo positivo** (+) e il **polo negativo** (−), trasformando in energia elettrica un'altra forma di energia: chimica (pila, batteria), meccanica (alternatore, dinamo), luminosa (pannello fotovoltaico).

![Generatore ideale (a sinistra) e generatore reale con resistenza interna Ri (a destra)](img/generatori.svg){: width="640"}

- **Generatore ideale:** la tensione ai morsetti è sempre uguale a *E*, qualunque sia la corrente erogata.
- **Generatore reale:** ha una **resistenza interna** *R*<sub>i</sub>. Quando eroga corrente, una parte della tensione si "perde" all'interno e ai morsetti arriva meno di *E*.

> **Generatore reale:** *V* = *E* − *R*<sub>i</sub> · *I*

*E* si chiama **forza elettromotrice** (f.e.m.): è la tensione che si misura **a vuoto**, cioè con il generatore scollegato (*I* = 0).

**Esempio.** Una batteria ha *E* = 9 V e *R*<sub>i</sub> = 1 Ω. Se eroga *I* = 0,5 A, ai morsetti si misura *V* = 9 − 1 · 0,5 = **8,5 V**.

In laboratorio si usa l'**alimentatore stabilizzato**: un generatore con tensione regolabile e limitazione della corrente, che si comporta quasi come un generatore ideale.

## La corrente elettrica

La **corrente elettrica** è il **movimento ordinato di cariche elettriche** in un conduttore. Nei metalli le cariche che si muovono sono gli **elettroni**.

L'**intensità di corrente** è la quantità di carica che attraversa una sezione del conduttore in un secondo:

> **Intensità di corrente:** *I* = *Q* / *t*

- *Q* = carica elettrica, in **coulomb** (C); *t* = tempo, in secondi (s).
- Unità di misura: **ampere** (A); 1 A = 1 C/s.
- Sottomultipli: 1 mA = 0,001 A · 1 µA = 0,000 001 A.
- **Verso convenzionale:** all'esterno del generatore la corrente va dal polo **+** al polo **−**. Gli elettroni in realtà si muovono nel verso opposto.

**Esempio.** In *t* = 3 s attraversano il filo *Q* = 6 C: *I* = 6 / 3 = **2 A**.

**Valori tipici:** LED 10–20 mA · lampadina da auto circa 2 A · motorino di avviamento dell'auto oltre 100 A.

## Misurare tensione e corrente

![Amperometro in serie e voltmetro in parallelo alla resistenza](img/misure.svg){: width="420"}

- L'**amperometro** si collega **in serie**: bisogna aprire il circuito e farci passare dentro la corrente. Ha resistenza interna quasi nulla.
- Il **voltmetro** si collega **in parallelo**, ai capi del componente. Ha resistenza interna molto alta.
- Attenzione: un amperometro collegato in parallelo crea un **cortocircuito** e può danneggiarsi.

## La resistenza

La **resistenza elettrica** è l'**opposizione** che un materiale offre al passaggio della corrente.

- Simbolo: *R* · unità di misura: **ohm** (Ω).
- Multipli: 1 kΩ = 1000 Ω · 1 MΩ = 1 000 000 Ω.
- I **conduttori** (rame, alluminio, argento) hanno resistenza bassa; gli **isolanti** (plastica, vetro, ceramica) altissima.

La resistenza di un filo dipende dal **materiale**, dalla **lunghezza** e dalla **sezione** (seconda legge di Ohm):

> **Resistenza di un filo:** *R* = *ρ* · *L* / *S*

![Filo conduttore di lunghezza L, sezione S e resistività ρ](img/filo.svg){: width="420"}

| Simbolo | Grandezza | Unità di misura |
|---|---|---|
| *ρ* (rho) | resistività del materiale | Ω · mm² / m |
| *L* | lunghezza del filo | m |
| *S* | sezione del filo | mm² |

Più il filo è **lungo**, più la resistenza **aumenta**; più è **grosso**, più la resistenza **diminuisce**. Il rame ha *ρ* ≈ 0,0175 Ω · mm²/m.

**Esempio.** Un filo di rame lungo 100 m con sezione 1,5 mm² ha *R* = 0,0175 · 100 / 1,5 ≈ **1,17 Ω**.

I **resistori** sono componenti costruiti apposta per avere un valore preciso di resistenza; il valore si legge con il **codice colori** stampato sul corpo.

## La legge di Ohm

In un resistore la **corrente** è **direttamente proporzionale alla tensione** e **inversamente proporzionale alla resistenza**: se raddoppia la tensione raddoppia la corrente, se raddoppia la resistenza la corrente si dimezza.

> **Corrente:** *I* = *V* / *R*
>
> **Tensione:** *V* = *R* · *I*
>
> **Resistenza:** *R* = *V* / *I*

![Triangolo della legge di Ohm: si copre la grandezza da trovare](img/triangolo-ohm.svg){: width="200"}

**Come si usa il triangolo:** si copre con il dito la grandezza da calcolare e si legge l'operazione che resta. Coprendo *V* resta *R* · *I*; coprendo *I* resta *V* / *R*; coprendo *R* resta *V* / *I*.

### La caratteristica tensione–corrente

Se si misura la corrente per diversi valori di tensione e si riportano i punti su un grafico, si ottiene una **retta che passa per l'origine**: il resistore è un componente **lineare**. Più la resistenza è grande, meno la retta è inclinata.

![Caratteristica tensione–corrente di tre resistenze diverse](img/caratteristica.svg){: width="560"}

### Attenzione alle unità di misura

Nelle formule si usano V, A e Ω. Con l'elettronica è comoda anche la coppia **kΩ e mA**: volt diviso kiloohm dà direttamente milliampere.

| Tensione | Resistenza | Corrente |
|---|---|---|
| V | Ω | A |
| V | kΩ | mA |

### Esempi svolti

- **Calcolo della corrente.** *V* = 12 V, *R* = 1 kΩ = 1000 Ω → *I* = 12 / 1000 = 0,012 A = **12 mA**.
- **Calcolo della tensione.** *R* = 220 Ω, *I* = 50 mA = 0,05 A → *V* = 220 · 0,05 = **11 V**.
- **Calcolo della resistenza.** *V* = 9 V, *I* = 3 mA = 0,003 A → *R* = 9 / 0,003 = 3000 Ω = **3 kΩ**.
- **Con la coppia kΩ e mA.** *V* = 5 V, *R* = 2,2 kΩ → *I* = 5 / 2,2 ≈ **2,27 mA**.

## Resistenze in serie e in parallelo

![Tre resistenze in serie (a sinistra) e tre resistenze in parallelo (a destra)](img/serie-parallelo.svg){: width="640"}

### Resistenze in serie

Più resistenze sono **in serie** quando sono collegate una dopo l'altra, **senza diramazioni**: sono attraversate dalla **stessa corrente**.

> **Resistenza equivalente in serie:** *R*<sub>eq</sub> = *R*<sub>1</sub> + *R*<sub>2</sub> + *R*<sub>3</sub> + …

- La corrente è **la stessa** in tutte le resistenze.
- La tensione totale è la **somma** delle tensioni: *V* = *V*<sub>1</sub> + *V*<sub>2</sub> + *V*<sub>3</sub>.
- *R*<sub>eq</sub> è sempre **più grande** della resistenza più grande.

### Resistenze in parallelo

Più resistenze sono **in parallelo** quando sono collegate **tra gli stessi due nodi**: hanno ai capi **la stessa tensione**.

> **Resistenza equivalente in parallelo:** 1 / *R*<sub>eq</sub> = 1 / *R*<sub>1</sub> + 1 / *R*<sub>2</sub> + 1 / *R*<sub>3</sub> + …
>
> **Due resistenze in parallelo:** *R*<sub>eq</sub> = *R*<sub>1</sub> · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> ***n* resistenze uguali in parallelo:** *R*<sub>eq</sub> = *R* / *n*

- La tensione è **la stessa** su tutte le resistenze.
- La corrente totale è la **somma** delle correnti: *I* = *I*<sub>1</sub> + *I*<sub>2</sub> + *I*<sub>3</sub>.
- *R*<sub>eq</sub> è sempre **più piccola** della resistenza più piccola.

Il simbolo ∥ si legge "in parallelo con": *R*<sub>2</sub> ∥ *R*<sub>3</sub>.

### Esempio: due resistenze in serie con il generatore

*V* = 12 V, *R*<sub>1</sub> = 2 kΩ e *R*<sub>2</sub> = 4 kΩ in serie.

![Due resistenze in serie con il generatore: la corrente è la stessa](img/serie-generatore.svg){: width="420"}

In serie c'è **un solo percorso**: la corrente che esce dal generatore attraversa prima *R*<sub>1</sub> e poi *R*<sub>2</sub>, quindi **la corrente è la stessa** in tutte e due: *I* = *I*<sub>1</sub> = *I*<sub>2</sub>. Le tensioni invece sono **diverse** e si sommano.

- **resistenza equivalente:** *R*<sub>eq</sub> = *R*<sub>1</sub> + *R*<sub>2</sub> = 2 + 4 = **6 kΩ**
- **corrente:** *I* = *V* / *R*<sub>eq</sub> = 12 V / 6 kΩ = **2 mA**
- **stessa corrente:** *I*<sub>1</sub> = *I*<sub>2</sub> = *I* = **2 mA**
- **tensione su *R*<sub>1</sub>:** *V*<sub>1</sub> = *R*<sub>1</sub> · *I* = 2 kΩ · 2 mA = **4 V**
- **tensione su *R*<sub>2</sub>:** *V*<sub>2</sub> = *R*<sub>2</sub> · *I* = 4 kΩ · 2 mA = **8 V**
- **verifica:** *V*<sub>1</sub> + *V*<sub>2</sub> = 4 + 8 = 12 V = *V* ✓ (la resistenza più grande prende la tensione più grande)

### Esempio: due resistenze in parallelo al generatore

*V* = 12 V, *R*<sub>1</sub> = 3 kΩ e *R*<sub>2</sub> = 6 kΩ in parallelo.

![Due resistenze in parallelo al generatore: la tensione è la stessa](img/parallelo-generatore.svg){: width="460"}

In parallelo le due resistenze sono collegate **agli stessi due nodi**, cioè direttamente ai morsetti del generatore: **la tensione è la stessa** su tutte e due, *V*<sub>1</sub> = *V*<sub>2</sub> = *V*. Le correnti invece sono **diverse** e si sommano.

- **stessa tensione:** *V*<sub>1</sub> = *V*<sub>2</sub> = *V* = **12 V**
- **corrente in *R*<sub>1</sub>:** *I*<sub>1</sub> = *V* / *R*<sub>1</sub> = 12 V / 3 kΩ = **4 mA**
- **corrente in *R*<sub>2</sub>:** *I*<sub>2</sub> = *V* / *R*<sub>2</sub> = 12 V / 6 kΩ = **2 mA**
- **corrente totale:** *I* = *I*<sub>1</sub> + *I*<sub>2</sub> = 4 + 2 = **6 mA** (nella resistenza più piccola passa la corrente più grande)
- **verifica con la resistenza equivalente:** *R*<sub>eq</sub> = 3 · 6 / (3 + 6) = **2 kΩ** → *I* = 12 V / 2 kΩ = 6 mA ✓

### Come si risolve un circuito con resistenze in serie e in parallelo

- **1.** **Riconosci i gruppi** di resistenze sicuramente in serie o in parallelo, partendo dalla parte del circuito **più lontana dal generatore**.
- **2.** **Sostituisci** ogni gruppo con la sua resistenza equivalente e **ridisegna** il circuito.
- **3.** **Ripeti** finché resta una sola resistenza, la *R*<sub>eq</sub> vista dal generatore.
- **4.** Calcola la **corrente totale** con la legge di Ohm: *I* = *V* / *R*<sub>eq</sub>.
- **5.** **Torna indietro** sugli schemi ridisegnati e calcola tensioni e correnti di ogni resistenza con la legge di Ohm: nella serie la corrente è la stessa, nel parallelo la tensione è la stessa.
- **6.** **Verifica** i risultati: la somma delle tensioni in serie deve dare la tensione totale, la somma delle correnti in parallelo la corrente totale.

### Esempio misto 1

*V* = 12 V, *R*<sub>1</sub> = 1 kΩ in serie al parallelo di *R*<sub>2</sub> = 3 kΩ e *R*<sub>3</sub> = 6 kΩ.

![Riduzione del circuito: R2 e R3 in parallelo, poi la serie con R1](img/riduzione-1.svg)

- **parallelo:** *R*<sub>23</sub> = *R*<sub>2</sub> ∥ *R*<sub>3</sub> = 3 · 6 / (3 + 6) = 18 / 9 = **2 kΩ**
- **serie:** *R*<sub>eq</sub> = *R*<sub>1</sub> + *R*<sub>23</sub> = 1 + 2 = **3 kΩ**
- **corrente totale:** *I* = *V* / *R*<sub>eq</sub> = 12 V / 3 kΩ = **4 mA** (è la corrente che attraversa *R*<sub>1</sub>)
- **tensione su *R*<sub>1</sub>:** *V*<sub>1</sub> = *R*<sub>1</sub> · *I* = 1 kΩ · 4 mA = **4 V**
- **tensione sul parallelo:** *V*<sub>23</sub> = *R*<sub>23</sub> · *I* = 2 kΩ · 4 mA = **8 V** (la stessa su *R*<sub>2</sub> e *R*<sub>3</sub>)
- **correnti nel parallelo:** *I*<sub>2</sub> = 8 V / 3 kΩ ≈ **2,67 mA** · *I*<sub>3</sub> = 8 V / 6 kΩ ≈ **1,33 mA**
- **verifiche:** 4 + 8 = 12 V ✓ · 2,67 + 1,33 = 4 mA ✓

### Esempio misto 2

*V* = 24 V, *R*<sub>1</sub> = 2 kΩ in serie al parallelo tra *R*<sub>2</sub> = 6 kΩ e la serie di *R*<sub>3</sub> = 1 kΩ e *R*<sub>4</sub> = 2 kΩ.

![Riduzione del circuito in quattro passi](img/riduzione-2.svg)

- **passo 2, serie:** *R*<sub>34</sub> = *R*<sub>3</sub> + *R*<sub>4</sub> = 1 + 2 = **3 kΩ**
- **passo 3, parallelo:** *R*<sub>P</sub> = *R*<sub>2</sub> ∥ *R*<sub>34</sub> = 6 · 3 / (6 + 3) = 18 / 9 = **2 kΩ**
- **passo 4, serie:** *R*<sub>eq</sub> = *R*<sub>1</sub> + *R*<sub>P</sub> = 2 + 2 = **4 kΩ**
- **corrente totale:** *I* = 24 V / 4 kΩ = **6 mA**
- **tensioni:** *V*<sub>1</sub> = 2 kΩ · 6 mA = **12 V** · *V*<sub>P</sub> = 2 kΩ · 6 mA = **12 V**
- **correnti nel parallelo:** *I*<sub>2</sub> = 12 V / 6 kΩ = **2 mA** · *I*<sub>34</sub> = 12 V / 3 kΩ = **4 mA**
- **tensioni su *R*<sub>3</sub> e *R*<sub>4</sub>:** *V*<sub>3</sub> = 1 kΩ · 4 mA = **4 V** · *V*<sub>4</sub> = 2 kΩ · 4 mA = **8 V**
- **verifiche:** 12 + 12 = 24 V ✓ · 2 + 4 = 6 mA ✓ · 4 + 8 = 12 V ✓

## Multipli e sottomultipli

| Prefisso | Simbolo | Fattore | Esempio |
|---|---|---|---|
| mega | M | 10<sup>6</sup> = 1 000 000 | 1 MΩ = 1 000 000 Ω |
| kilo | k | 10<sup>3</sup> = 1000 | 4,7 kΩ = 4700 Ω |
| milli | m | 10<sup>−3</sup> = 0,001 | 20 mA = 0,02 A |
| micro | µ | 10<sup>−6</sup> = 0,000 001 | 500 µA = 0,0005 A |

## Riepilogo delle formule

> **Legge di Ohm:** *V* = *R* · *I*  ;  *I* = *V* / *R*  ;  *R* = *V* / *I*
>
> **Intensità di corrente:** *I* = *Q* / *t*
>
> **Resistenza di un filo:** *R* = *ρ* · *L* / *S*
>
> **Generatore reale:** *V* = *E* − *R*<sub>i</sub> · *I*
>
> **Serie:** *R*<sub>eq</sub> = *R*<sub>1</sub> + *R*<sub>2</sub> + …
>
> **Parallelo:** 1 / *R*<sub>eq</sub> = 1 / *R*<sub>1</sub> + 1 / *R*<sub>2</sub> + …  ;  due resistenze: *R*<sub>eq</sub> = *R*<sub>1</sub> · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)

<!-- PDF:FINE -->

---

➡️ Per provare la legge di Ohm, il codice colori, la serie e il parallelo usa la web app [Laboratorio legge di Ohm](/education/TEEA/3MAT/laboratorio/laboratorio-legge-ohm/).

[← Torna a TEEA — 3MAT](/education/TEEA/3MAT/)

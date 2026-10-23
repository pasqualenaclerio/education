---
layout: default
title: Voltage, current, resistance and Ohm's law — TEEA 3MAT
---

# Voltage, current, resistance and Ohm's law

### TEEA — 3MAT · Topic 1

<a class="btn btn-pdf" href="pdf/01-voltage-current-resistance.pdf" download>Download the explanation as PDF</a>

---

<!-- PDF:INIZIO -->

## The fundamental electrical quantities

Every electrical circuit has three quantities working together: **voltage** pushes the charges, **current** is their movement, and **resistance** opposes that movement.

| Quantity | Symbol | Unit | Instrument | How it is connected |
|---|---|---|---|---|
| voltage | *V* | volt (V) | voltmeter | in **parallel** with the component |
| current | *I* | ampere (A) | ammeter | in **series** with the component |
| resistance | *R* | ohm (Ω) | ohmmeter | on the component **disconnected** from the circuit |

## The electrical circuit

An **electrical circuit** is a closed path in which current can flow. It is made of:

- a **source**, which supplies the energy;
- a **load**, which uses the energy: here a resistance *R*;
- **conductors** (wires), which connect the elements;
- often a **switch**, which opens or closes the circuit.

![Basic circuit: voltage source V, resistance R and current I](img/circuito-base.svg){: width="300"}

If the circuit is **closed** current flows; if it is **open** (switch open or broken wire) the current is zero.

## Voltage

**Voltage** (or **potential difference**) is the "push" that sets electric charges in motion. It is always measured **between two points** of the circuit.

- Symbol: *V* · unit: **volt** (V).
- Multiples and submultiples: 1 kV = 1000 V · 1 mV = 0.001 V.
- It is marked with the **+** and **−** signs or with an arrow.

A useful comparison is with water: voltage is like the **difference in height** between two tanks; the bigger it is, the harder the water flows.

**Typical values:** AA cell 1.5 V · 9 V battery · USB port 5 V · car battery 12 V · household mains 230 V (alternating).

## Voltage sources

A **voltage source** keeps a voltage between its two terminals, the **positive pole** (+) and the **negative pole** (−), by converting another form of energy into electrical energy: chemical (cell, battery), mechanical (alternator, dynamo), light (photovoltaic panel).

![Ideal source (left) and real source with internal resistance Ri (right)](img/generatori.svg){: width="640"}

- **Ideal source:** the terminal voltage is always equal to *E*, whatever current is delivered.
- **Real source:** it has an **internal resistance** *R*<sub>i</sub>. When it delivers current, part of the voltage is "lost" inside and less than *E* reaches the terminals.

> **Real source:** *V* = *E* − *R*<sub>i</sub> · *I*

*E* is called the **electromotive force** (e.m.f.): it is the voltage measured **with no load**, i.e. with the source disconnected (*I* = 0).

**Example.** A battery has *E* = 9 V and *R*<sub>i</sub> = 1 Ω. If it delivers *I* = 0.5 A, the terminal voltage is *V* = 9 − 1 · 0.5 = **8.5 V**.

In the laboratory we use a **regulated power supply**: a source with adjustable voltage and current limiting, which behaves almost like an ideal source.

## Electric current

**Electric current** is the **ordered movement of electric charges** in a conductor. In metals the moving charges are **electrons**.

**Current intensity** is the amount of charge flowing through a cross-section of the conductor in one second:

> **Current:** *I* = *Q* / *t*

- *Q* = electric charge, in **coulombs** (C); *t* = time, in seconds (s).
- Unit: **ampere** (A); 1 A = 1 C/s.
- Submultiples: 1 mA = 0.001 A · 1 µA = 0.000 001 A.
- **Conventional direction:** outside the source, current flows from the **+** pole to the **−** pole. Electrons actually move the opposite way.

**Example.** *Q* = 6 C flow through the wire in *t* = 3 s: *I* = 6 / 3 = **2 A**.

**Typical values:** LED 10–20 mA · car bulb about 2 A · car starter motor over 100 A.

## Measuring voltage and current

![Ammeter in series and voltmeter in parallel with the resistance](img/misure.svg){: width="420"}

- The **ammeter** is connected **in series**: the circuit must be opened so that the current flows through it. Its internal resistance is almost zero.
- The **voltmeter** is connected **in parallel**, across the component. Its internal resistance is very high.
- Careful: an ammeter connected in parallel creates a **short circuit** and may be damaged.

## Resistance

**Electrical resistance** is the **opposition** a material offers to the flow of current.

- Symbol: *R* · unit: **ohm** (Ω).
- Multiples: 1 kΩ = 1000 Ω · 1 MΩ = 1 000 000 Ω.
- **Conductors** (copper, aluminium, silver) have low resistance; **insulators** (plastic, glass, ceramics) very high.

The resistance of a wire depends on its **material**, **length** and **cross-section** (Ohm's second law):

> **Resistance of a wire:** *R* = *ρ* · *L* / *S*

![Conductor of length L, cross-section S and resistivity ρ](img/filo.svg){: width="420"}

| Symbol | Quantity | Unit |
|---|---|---|
| *ρ* (rho) | resistivity of the material | Ω · mm² / m |
| *L* | length of the wire | m |
| *S* | cross-section of the wire | mm² |

The **longer** the wire, the **higher** the resistance; the **thicker** it is, the **lower** the resistance. Copper has *ρ* ≈ 0.0175 Ω · mm²/m.

**Example.** A copper wire 100 m long with a 1.5 mm² cross-section has *R* = 0.0175 · 100 / 1.5 ≈ **1.17 Ω**.

**Resistors** are components built to have a precise resistance value; the value is read from the **colour code** printed on the body.

## Ohm's law

In a resistor the **current** is **directly proportional to the voltage** and **inversely proportional to the resistance**: if the voltage doubles the current doubles, if the resistance doubles the current halves.

> **Current:** *I* = *V* / *R*
>
> **Voltage:** *V* = *R* · *I*
>
> **Resistance:** *R* = *V* / *I*

![Ohm's law triangle: cover the quantity you want to find](img/triangolo-ohm.svg){: width="200"}

**How to use the triangle:** cover the quantity to calculate with your finger and read the operation that remains. Covering *V* leaves *R* · *I*; covering *I* leaves *V* / *R*; covering *R* leaves *V* / *I*.

### The voltage–current characteristic

If you measure the current for several voltage values and plot the points, you get a **straight line through the origin**: the resistor is a **linear** component. The higher the resistance, the less steep the line.

![Voltage–current characteristic of three different resistances](img/caratteristica.svg){: width="560"}

### Watch the units

Formulas use V, A and Ω. In electronics the pair **kΩ and mA** is also handy: volts divided by kilohms gives milliamperes directly.

| Voltage | Resistance | Current |
|---|---|---|
| V | Ω | A |
| V | kΩ | mA |

### Worked examples

- **Finding the current.** *V* = 12 V, *R* = 1 kΩ = 1000 Ω → *I* = 12 / 1000 = 0.012 A = **12 mA**.
- **Finding the voltage.** *R* = 220 Ω, *I* = 50 mA = 0.05 A → *V* = 220 · 0.05 = **11 V**.
- **Finding the resistance.** *V* = 9 V, *I* = 3 mA = 0.003 A → *R* = 9 / 0.003 = 3000 Ω = **3 kΩ**.
- **Using kΩ and mA.** *V* = 5 V, *R* = 2.2 kΩ → *I* = 5 / 2.2 ≈ **2.27 mA**.

## Resistances in series and in parallel

![Three resistances in series (left) and three resistances in parallel (right)](img/serie-parallelo.svg){: width="640"}

### Resistances in series

Resistances are **in series** when they are connected one after another, **with no branches**: the **same current** flows through all of them.

> **Equivalent resistance in series:** *R*<sub>eq</sub> = *R*<sub>1</sub> + *R*<sub>2</sub> + *R*<sub>3</sub> + …

- The current is **the same** in all the resistances.
- The total voltage is the **sum** of the voltages: *V* = *V*<sub>1</sub> + *V*<sub>2</sub> + *V*<sub>3</sub>.
- *R*<sub>eq</sub> is always **larger** than the largest resistance.

### Resistances in parallel

Resistances are **in parallel** when they are connected **between the same two nodes**: they have **the same voltage** across them.

> **Equivalent resistance in parallel:** 1 / *R*<sub>eq</sub> = 1 / *R*<sub>1</sub> + 1 / *R*<sub>2</sub> + 1 / *R*<sub>3</sub> + …
>
> **Two resistances in parallel:** *R*<sub>eq</sub> = *R*<sub>1</sub> · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> ***n* equal resistances in parallel:** *R*<sub>eq</sub> = *R* / *n*

- The voltage is **the same** across all the resistances.
- The total current is the **sum** of the currents: *I* = *I*<sub>1</sub> + *I*<sub>2</sub> + *I*<sub>3</sub>.
- *R*<sub>eq</sub> is always **smaller** than the smallest resistance.

The symbol ∥ reads "in parallel with": *R*<sub>2</sub> ∥ *R*<sub>3</sub>.

### How to solve a circuit with series and parallel resistances

- **1.** **Find the groups** of resistances that are clearly in series or in parallel, starting from the part of the circuit **furthest from the source**.
- **2.** **Replace** each group with its equivalent resistance and **redraw** the circuit.
- **3.** **Repeat** until a single resistance is left: the *R*<sub>eq</sub> seen by the source.
- **4.** Calculate the **total current** with Ohm's law: *I* = *V* / *R*<sub>eq</sub>.
- **5.** **Go back** through the redrawn circuits and calculate the voltage and current of each resistance with Ohm's law: in series the current is the same, in parallel the voltage is the same.
- **6.** **Check** the results: the voltages in series must add up to the total voltage, the currents in parallel to the total current.

### Worked example 1

*V* = 12 V, *R*<sub>1</sub> = 1 kΩ in series with the parallel of *R*<sub>2</sub> = 3 kΩ and *R*<sub>3</sub> = 6 kΩ.

![Reducing the circuit: R2 and R3 in parallel, then in series with R1](img/riduzione-1.svg)

- **parallel:** *R*<sub>23</sub> = *R*<sub>2</sub> ∥ *R*<sub>3</sub> = 3 · 6 / (3 + 6) = 18 / 9 = **2 kΩ**
- **series:** *R*<sub>eq</sub> = *R*<sub>1</sub> + *R*<sub>23</sub> = 1 + 2 = **3 kΩ**
- **total current:** *I* = *V* / *R*<sub>eq</sub> = 12 V / 3 kΩ = **4 mA** (the current through *R*<sub>1</sub>)
- **voltage across *R*<sub>1</sub>:** *V*<sub>1</sub> = *R*<sub>1</sub> · *I* = 1 kΩ · 4 mA = **4 V**
- **voltage across the parallel:** *V*<sub>23</sub> = *R*<sub>23</sub> · *I* = 2 kΩ · 4 mA = **8 V** (the same across *R*<sub>2</sub> and *R*<sub>3</sub>)
- **currents in the parallel:** *I*<sub>2</sub> = 8 V / 3 kΩ ≈ **2.67 mA** · *I*<sub>3</sub> = 8 V / 6 kΩ ≈ **1.33 mA**
- **checks:** 4 + 8 = 12 V ✓ · 2.67 + 1.33 = 4 mA ✓

### Worked example 2

*V* = 24 V, *R*<sub>1</sub> = 2 kΩ in series with the parallel of *R*<sub>2</sub> = 6 kΩ and the series of *R*<sub>3</sub> = 1 kΩ and *R*<sub>4</sub> = 2 kΩ.

![Reducing the circuit in four steps](img/riduzione-2.svg)

- **step 2, series:** *R*<sub>34</sub> = *R*<sub>3</sub> + *R*<sub>4</sub> = 1 + 2 = **3 kΩ**
- **step 3, parallel:** *R*<sub>P</sub> = *R*<sub>2</sub> ∥ *R*<sub>34</sub> = 6 · 3 / (6 + 3) = 18 / 9 = **2 kΩ**
- **step 4, series:** *R*<sub>eq</sub> = *R*<sub>1</sub> + *R*<sub>P</sub> = 2 + 2 = **4 kΩ**
- **total current:** *I* = 24 V / 4 kΩ = **6 mA**
- **voltages:** *V*<sub>1</sub> = 2 kΩ · 6 mA = **12 V** · *V*<sub>P</sub> = 2 kΩ · 6 mA = **12 V**
- **currents in the parallel:** *I*<sub>2</sub> = 12 V / 6 kΩ = **2 mA** · *I*<sub>34</sub> = 12 V / 3 kΩ = **4 mA**
- **voltages across *R*<sub>3</sub> and *R*<sub>4</sub>:** *V*<sub>3</sub> = 1 kΩ · 4 mA = **4 V** · *V*<sub>4</sub> = 2 kΩ · 4 mA = **8 V**
- **checks:** 12 + 12 = 24 V ✓ · 2 + 4 = 6 mA ✓ · 4 + 8 = 12 V ✓

## Multiples and submultiples

| Prefix | Symbol | Factor | Example |
|---|---|---|---|
| mega | M | 10<sup>6</sup> = 1 000 000 | 1 MΩ = 1 000 000 Ω |
| kilo | k | 10<sup>3</sup> = 1000 | 4.7 kΩ = 4700 Ω |
| milli | m | 10<sup>−3</sup> = 0.001 | 20 mA = 0.02 A |
| micro | µ | 10<sup>−6</sup> = 0.000 001 | 500 µA = 0.0005 A |

## Formula summary

> **Ohm's law:** *V* = *R* · *I*  ;  *I* = *V* / *R*  ;  *R* = *V* / *I*
>
> **Current:** *I* = *Q* / *t*
>
> **Resistance of a wire:** *R* = *ρ* · *L* / *S*
>
> **Real source:** *V* = *E* − *R*<sub>i</sub> · *I*
>
> **Series:** *R*<sub>eq</sub> = *R*<sub>1</sub> + *R*<sub>2</sub> + …
>
> **Parallel:** 1 / *R*<sub>eq</sub> = 1 / *R*<sub>1</sub> + 1 / *R*<sub>2</sub> + …  ;  two resistances: *R*<sub>eq</sub> = *R*<sub>1</sub> · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)

<!-- PDF:FINE -->

---

➡️ To try Ohm's law, the colour code, series and parallel circuits, use the [Ohm's law laboratory](/education/TEEA/3MAT/laboratorio/laboratorio-legge-ohm/) web app *(in Italian)*.

[← Back to TEEA — 3MAT](/education/TEEA/3MAT/index.en.html)

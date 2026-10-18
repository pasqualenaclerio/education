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

<!-- PDF:FINE -->

---

➡️ To try Ohm's law, the colour code, series and parallel circuits, use the [Ohm's law laboratory](/education/TEEA/3MAT/laboratorio/laboratorio-legge-ohm/) web app *(in Italian)*.

[← Back to TEEA — 3MAT](/education/TEEA/3MAT/index.en.html)

---
layout: default
title: Voltage and current dividers, power and energy — TEEA 3MAT
---

# Voltage and current dividers, power and energy

### TEEA — 3MAT · Topic 2

<a class="btn btn-pdf" href="pdf/02-dividers-power-energy.pdf" download>Download the explanation as PDF</a>

---

<!-- PDF:INIZIO -->

## The voltage divider

A **voltage divider** is made of two resistances *R*<sub>1</sub> and *R*<sub>2</sub> connected **in series** between the supply voltage *V* and ground. At the middle point *X* we get a voltage *V*<sub>X</sub> **smaller** than *V*: the supply voltage is "divided" between the two resistances.

![Voltage divider with V = 12 V, R1 = 1.8 kΩ and R2 = 1.2 kΩ](img/partitore-tensione.svg){: width="420"}

### Deriving the formula

- **1.** The two resistances are in **series**: the total resistance is *R*<sub>1</sub> + *R*<sub>2</sub>.
- **2.** A single current flows in the circuit, found with Ohm's law: *I* = *V* / (*R*<sub>1</sub> + *R*<sub>2</sub>).
- **3.** The voltage at point *X* is the voltage across *R*<sub>2</sub>: *V*<sub>X</sub> = *R*<sub>2</sub> · *I*.
- **4.** Substituting the current gives the divider formula.

> **Voltage divider:** *V*<sub>X</sub> = *V* · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Voltage across *R*<sub>1</sub>:** *V*<sub>1</sub> = *V* · *R*<sub>1</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Check:** *V*<sub>1</sub> + *V*<sub>X</sub> = *V*

The voltage is shared **in proportion to the resistances**: the larger resistance takes the larger voltage. If *R*<sub>1</sub> = *R*<sub>2</sub>, *V*<sub>X</sub> is exactly half of *V*.

**Careful:** the formula holds **with no load**, i.e. when nothing is connected to point *X*, or the connected load has a resistance much larger than *R*<sub>2</sub>. A load connected at *X* is in parallel with *R*<sub>2</sub> and lowers *V*<sub>X</sub>.

### Worked example

*V* = 12 V, *R*<sub>1</sub> = 1.8 kΩ, *R*<sub>2</sub> = 1.2 kΩ (the circuit above).

- **total resistance:** *R*<sub>1</sub> + *R*<sub>2</sub> = 1.8 + 1.2 = 3 kΩ
- **current:** *I* = 12 V / 3 kΩ = **4 mA**
- **voltage at *X*:** *V*<sub>X</sub> = 12 · 1.2 / 3 = **4.8 V**
- **voltage across *R*<sub>1</sub>:** *V*<sub>1</sub> = 12 · 1.8 / 3 = **7.2 V**
- **check:** 7.2 + 4.8 = 12 V ✓

## The current divider

A **current divider** is made of two resistances connected **in parallel**. The total current *I* entering the node **splits** into the two branches: *I*<sub>1</sub> flows in *R*<sub>1</sub>, *I*<sub>2</sub> flows in *R*<sub>2</sub>.

![Current divider with I = 20 mA, R1 = 1 kΩ and R2 = 1.5 kΩ](img/partitore-corrente.svg){: width="440"}

### Deriving the formula

- **1.** The two resistances are in **parallel**: they have **the same voltage** *V* across them.
- **2.** The equivalent resistance of the parallel is *R*<sub>eq</sub> = *R*<sub>1</sub> · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>), so *V* = *R*<sub>eq</sub> · *I*.
- **3.** The current in each branch is *I*<sub>1</sub> = *V* / *R*<sub>1</sub> and *I*<sub>2</sub> = *V* / *R*<sub>2</sub>.
- **4.** Substituting *V* gives the divider formula.

> **Current in *R*<sub>1</sub>:** *I*<sub>1</sub> = *I* · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Current in *R*<sub>2</sub>:** *I*<sub>2</sub> = *I* · *R*<sub>1</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Check:** *I*<sub>1</sub> + *I*<sub>2</sub> = *I*

**Watch the "crossed" resistances:** in the formula for *I*<sub>1</sub> the numerator contains *R*<sub>2</sub>, and vice versa. Current takes the easier path: **the smaller resistance carries the larger current**.

### Worked example

*I* = 20 mA, *R*<sub>1</sub> = 1 kΩ, *R*<sub>2</sub> = 1.5 kΩ (the circuit above).

- **current in *R*<sub>1</sub>:** *I*<sub>1</sub> = 20 · 1.5 / (1 + 1.5) = 20 · 1.5 / 2.5 = **12 mA**
- **current in *R*<sub>2</sub>:** *I*<sub>2</sub> = 20 · 1 / 2.5 = **8 mA**
- **check:** 12 + 8 = 20 mA ✓
- **voltage across the parallel:** *V* = *R*<sub>1</sub> · *I*<sub>1</sub> = 1 kΩ · 12 mA = **12 V** (equal to *R*<sub>2</sub> · *I*<sub>2</sub> = 1.5 kΩ · 8 mA)

## The potentiometer

A **potentiometer** is a resistance with **three terminals**: the two ends and a **wiper** that slides along the resistive track. The wiper splits the total resistance *R*<sub>P</sub> into two parts: it is an **adjustable voltage divider**.

![Potentiometer used as an adjustable voltage divider](img/potenziometro.svg){: width="240"}

With the ends connected between *V* and ground, turning the wiper changes *V*<sub>X</sub> smoothly **from 0 V to *V***. Potentiometers are used to adjust volume, brightness, motor speed, a reference voltage.

### Where to put the potentiometer: instead of *R*<sub>1</sub> or *R*<sub>2</sub>?

A **fixed resistance** is often used together with a potentiometer (or a variable resistance). The fixed resistance **limits the current** when the potentiometer is at zero and sets one of the two limits of the adjustment.

![Potentiometer instead of R2 (a) and instead of R1 (b)](img/potenziometro-posizione.svg){: width="420"}

| Position | Minimum *V*<sub>X</sub> | Maximum *V*<sub>X</sub> | When to use it |
|---|---|---|---|
| **(a)** potentiometer instead of ***R*<sub>2</sub>** (towards ground) | 0 V | *V* · *R*<sub>2max</sub> / (*R*<sub>1</sub> + *R*<sub>2max</sub>) | to adjust **from zero** up to a maximum value |
| **(b)** potentiometer instead of ***R*<sub>1</sub>** (towards *V*) | *V* · *R*<sub>2</sub> / (*R*<sub>1max</sub> + *R*<sub>2</sub>) | *V* | to adjust from a minimum value **up to *V*** |

**Example (a).** *V* = 12 V, fixed *R*<sub>1</sub> = 1 kΩ, *R*<sub>2</sub> potentiometer from 0 to 10 kΩ.

- with *R*<sub>2</sub> = 0: *V*<sub>X</sub> = **0 V**, and the current is at most 12 V / 1 kΩ = 12 mA, because *R*<sub>1</sub> limits it
- with *R*<sub>2</sub> = 10 kΩ: *V*<sub>X</sub> = 12 · 10 / 11 ≈ **10.9 V**
- the voltage is adjusted from 0 V to about 10.9 V

**Example (b).** *V* = 12 V, *R*<sub>1</sub> potentiometer from 0 to 10 kΩ, fixed *R*<sub>2</sub> = 1 kΩ.

- with *R*<sub>1</sub> = 10 kΩ: *V*<sub>X</sub> = 12 · 1 / 11 ≈ **1.09 V**
- with *R*<sub>1</sub> = 0: *V*<sub>X</sub> = **12 V**, and the current is at most 12 V / 1 kΩ = 12 mA
- the voltage is adjusted from about 1.09 V to 12 V

**Rule of thumb:** put the potentiometer **on the side of the limit you want to reach**: towards ground (instead of *R*<sub>2</sub>) to reach 0 V, towards the supply (instead of *R*<sub>1</sub>) to reach *V*. The fixed resistance prevents a **short circuit** when the potentiometer is at zero.

## Electrical power

**Power** tells how much energy a component absorbs (or delivers) every second. In a resistance all the electrical energy turns into **heat** (Joule effect): that is why resistors get warm.

- Symbol: *P* · unit: **watt** (W).
- Multiples and submultiples: 1 kW = 1000 W · 1 mW = 0.001 W.

> **Power:** *P* = *V* · *I*
>
> **With Ohm's law:** *P* = *R* · *I*<sup>2</sup>  ;  *P* = *V*<sup>2</sup> / *R*

Use the handiest form for the data: *V* and *I* known → *P* = *V* · *I*; *R* and *I* known → *P* = *R* · *I*<sup>2</sup>; *V* and *R* known → *P* = *V*<sup>2</sup> / *R*.

### Rated power of resistors

Every resistor can dissipate at most a certain power, its **rated power**: the most common are **1/4 W** (0.25 W), 1/2 W and 1 W. If the calculated power exceeds it, the resistor overheats and may burn. It is wise to choose a resistor with a **margin**, for example at least twice the calculated power.

### Worked examples

- **Resistor at 12 V.** *R* = 1 kΩ, *V* = 12 V → *I* = 12 mA; *P* = *V* · *I* = 12 · 0.012 = **0.144 W** = 144 mW. A 1/4 W resistor is fine.
- **Resistor at the limit.** *R* = 100 Ω, *I* = 50 mA = 0.05 A → *P* = *R* · *I*<sup>2</sup> = 100 · 0.05<sup>2</sup> = **0.25 W**: exactly the limit of a 1/4 W resistor, better use a 1/2 W one.
- **Electric heater.** *V* = 230 V, *R* = 26.45 Ω → *P* = *V*<sup>2</sup> / *R* = 230<sup>2</sup> / 26.45 = **2000 W** = 2 kW.
- **Powers in the voltage divider** of the first example (*I* = 4 mA): *P*<sub>1</sub> = *V*<sub>1</sub> · *I* = 7.2 · 0.004 = 28.8 mW; *P*<sub>2</sub> = *V*<sub>X</sub> · *I* = 4.8 · 0.004 = 19.2 mW; total *P* = *V* · *I* = 12 · 0.004 = **48 mW** = 28.8 + 19.2 ✓.

## Electrical energy

**Energy** is the power absorbed over the whole operating time: the longer an appliance stays on, the more energy it uses.

> **Energy:** *E* = *P* · *t*

- With power in **watts** (W) and time in **hours** (h), energy is in **watt-hours** (Wh).
- Multiple: 1 **kWh** (kilowatt-hour) = 1000 Wh. It is the unit shown on the electricity bill.
- Time always goes in **hours**: 30 min = 0.5 h · 15 min = 0.25 h · 10 min ≈ 0.167 h.

**A note on the joule.** The SI unit of energy is the **joule** (J): 1 J = 1 W · 1 s, i.e. with power in watts and time in seconds. The joule is a very small unit: 1 Wh = 3600 J. That is why **watt-hours** and **kilowatt-hours** are used for electrical systems and appliances.

### Worked examples

- **Resistor left on.** The 0.144 W resistor of the previous example stays on for 10 h: *E* = 0.144 · 10 = **1.44 Wh**.
- **Hair dryer.** *P* = 1200 W for 15 min = 0.25 h: *E* = 1200 · 0.25 = **300 Wh** = 0.3 kWh.
- **LED bulb.** *P* = 10 W, on 5 h a day for 30 days: *t* = 5 · 30 = 150 h; *E* = 10 · 150 = 1500 Wh = **1.5 kWh**.
- **Heater and cost.** *P* = 2000 W for 3 h: *E* = 2000 · 3 = 6000 Wh = **6 kWh**. At a price of €0.25/kWh the cost is 6 · 0.25 = **€1.50**.

## Formula summary

> **Voltage divider:** *V*<sub>X</sub> = *V* · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Current divider:** *I*<sub>1</sub> = *I* · *R*<sub>2</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)  ;  *I*<sub>2</sub> = *I* · *R*<sub>1</sub> / (*R*<sub>1</sub> + *R*<sub>2</sub>)
>
> **Power:** *P* = *V* · *I*  ;  *P* = *R* · *I*<sup>2</sup>  ;  *P* = *V*<sup>2</sup> / *R*
>
> **Energy:** *E* = *P* · *t*  (W · h = Wh)  ;  1 kWh = 1000 Wh  ;  1 Wh = 3600 J

<!-- PDF:FINE -->

---

✏️ Practice: [exercises](/education/TEEA/3MAT/materiali/esercitazione-partitori-potenza-energia-3MAT.pdf), [solutions](/education/TEEA/3MAT/materiali/soluzioni-esercitazione-partitori-potenza-energia-3MAT.pdf) and [formula sheet](pdf/02-formulario-partitori-potenza-energia.pdf) *(in Italian)*.

➡️ To try series, parallel, power and energy, use the [Ohm's law laboratory](/education/TEEA/3MAT/laboratorio/laboratorio-legge-ohm/) web app *(in Italian)*.

[← Back to TEEA — 3MAT](/education/TEEA/3MAT/index.en.html)

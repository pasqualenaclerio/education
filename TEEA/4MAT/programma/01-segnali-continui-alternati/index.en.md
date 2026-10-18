---
layout: default
title: Direct and alternating electrical signals — TEEA 4MAT
---

# Direct and alternating electrical signals

### TEEA — 4MAT · Topic 1

<a class="btn btn-pdf" href="pdf/01-dc-ac-signals.pdf" download>Download the explanation as PDF</a>

---

<!-- PDF:INIZIO -->

## The electrical signal

An **electrical signal** is an electrical quantity, **voltage** or **current**, that carries information or energy and may vary over time.

A naming convention is used to tell values apart:

- **lowercase letter** → instantaneous value, i.e. the value at a given instant: *v*(*t*), *i*(*t*);
- **uppercase letter** → constant or characteristic value: *V*, *I*, *V*<sub>M</sub>, *I*<sub>M</sub>.

## Direct and alternating signals

![Comparison between a direct (DC) and an alternating (AC) signal](img/continua-alternata.svg)

### Direct signal (DC)

A **direct** signal (*DC – Direct Current*) keeps **the same value and the same direction** over time.

- On the voltage–time graph it is a **horizontal line**.
- It is written as *V* (voltage) and *I* (current).
- Examples: a cell, a car battery (12 V), a bench power supply, a USB port (5 V).

### Alternating signal (AC)

An **alternating** signal (*AC – Alternating Current*) **periodically changes value and direction**: it repeats itself identically over time and takes both positive and negative values.

- Over one period its **average value is zero**: the area of the positive half-wave equals that of the negative half-wave.
- Typical example: the domestic **mains supply** (230 V, 50 Hz in Italy and Europe).

## The sine wave

The most important alternating waveform is the **sine wave**. The instantaneous voltage and current are written as:

> **Voltage:** *v*(*t*) = *V*<sub>M</sub> · sin(*ω t* + *φ*)
>
> **Current:** *i*(*t*) = *I*<sub>M</sub> · sin(*ω t* + *φ*)

![Sine wave with amplitude, peak-to-peak value and period](img/sinusoide.svg)

| Symbol | Quantity | Unit | Meaning |
|---|---|---|---|
| *V*<sub>M</sub>, *I*<sub>M</sub> | amplitude (maximum or peak value) | V, A | the highest value reached by the sine wave |
| *V*<sub>pp</sub> | peak-to-peak value | V | distance between maximum and minimum: *V*<sub>pp</sub> = 2 · *V*<sub>M</sub> |
| *T* | period | s (seconds) | time taken to complete one full oscillation |
| *f* | frequency | Hz (hertz) | number of complete oscillations per second |
| *ω* | angular frequency (omega) | rad/s | angular speed at which the phasor rotates |
| *φ* | initial phase (phi) | rad or ° | position of the sine wave at *t* = 0 |
| *ω t* + *φ* | phase (instantaneous angle) | rad | angle reached at instant *t* |

## Key formulas

> **Frequency and period:** *f* = 1 / *T*  ⟺  *T* = 1 / *f*
>
> **Angular frequency:** *ω* = 2π · *f* = 2π / *T*
>
> **Peak-to-peak value:** *V*<sub>pp</sub> = 2 · *V*<sub>M</sub>

Frequency and period are **inversely proportional**: if the frequency doubles, the period halves.

**Useful multiples and submultiples:** 1 kHz = 10<sup>3</sup> Hz · 1 MHz = 10<sup>6</sup> Hz · 1 ms = 10<sup>−3</sup> s · 1 µs = 10<sup>−6</sup> s

## Angles in radians

In electrical engineering angles are usually measured in **radians** (rad). A full turn is **2π rad**, i.e. 360°.

> **Degrees to radians:** *α*<sub>rad</sub> = *α*° · π / 180
>
> **Radians to degrees:** *α*° = *α*<sub>rad</sub> · 180 / π

| Degrees | 0° | 30° | 45° | 60° | 90° | 180° | 270° | 360° |
|---|---|---|---|---|---|---|---|---|
| **Radians** | 0 | π/6 | π/4 | π/3 | π/2 | π | 3π/2 | 2π |

This is why angular frequency is also called **angular speed**: in one period *T* the phasor makes one full turn, i.e. it sweeps 2π rad, so *ω* = 2π / *T*.

## Phasor representation

Drawing and adding sine waves is awkward. For this reason each sine wave is represented by a **phasor**: a **vector rotating anticlockwise** around the origin.

![The phasor rotating at angular speed ω generates the sine wave](img/fasore-sinusoide.svg)

- The **length** of the phasor is the **amplitude** *V*<sub>M</sub>.
- The **rotation speed** is the **angular frequency** *ω*.
- The **initial angle**, measured anticlockwise from the horizontal axis, is the **initial phase** *φ*.
- The **projection onto the vertical axis** of the rotating phasor traces, instant by instant, the **sine wave** *v*(*t*).

A phasor is written as an uppercase letter with a bar, **V̄**, in polar form:

> **Phasor:** V̄ = *V*<sub>M</sub> ∠ *φ*

When all quantities have the **same frequency**, the phasors rotate together and keep the same angles between them. They can therefore be drawn **stationary**, in their position at *t* = 0: this is the **phasor diagram**.

## Phase and phase shift

The **initial phase** *φ* tells where the sine wave starts at *t* = 0. Comparing two sine waves **with the same frequency** gives the **phase shift**:

> **Phase shift:** Δ*φ* = *φ*<sub>1</sub> − *φ*<sub>2</sub>

![Two phase-shifted sine waves and the corresponding phasor diagram](img/sfasamento.svg)

In the phasor diagram the phase shift is simply the **angle between the two phasors**.

- **in phase** (Δ*φ* = 0): they reach their maximum at the same instant;
- **leading** (Δ*φ* > 0): the first reaches its maximum before the second (in the figure *v*<sub>1</sub> leads *v*<sub>2</sub>);
- **lagging** (Δ*φ* < 0): the first reaches its maximum after the second;
- **in phase opposition** (Δ*φ* = π rad = 180°): when one is at its maximum, the other is at its minimum;
- **in quadrature** (Δ*φ* = π/2 rad = 90°).

The phase shift can also be expressed as a time delay: Δ*t* = Δ*φ* / *ω*.

## Example: the mains supply

For the domestic mains *f* = 50 Hz:

- **period:** *T* = 1 / *f* = 1 / 50 = 0.02 s = **20 ms**
- **angular frequency:** *ω* = 2π · *f* = 2π · 50 ≈ **314 rad/s**
- **amplitude:** 230 V is the *RMS value*; the maximum value is *V*<sub>M</sub> = 230 · √2 ≈ **325 V**, so *V*<sub>pp</sub> ≈ 650 V
- **expression:** *v*(*t*) ≈ 325 · sin(314 *t*) V

<!-- PDF:FINE -->

---

✏️ Practice: [exercises](/education/TEEA/4MAT/materiali/esercitazione-sinusoidi-4MAT.pdf) and [solutions](/education/TEEA/4MAT/materiali/soluzioni-esercitazione-sinusoidi-4MAT.pdf) on sine waves, oscilloscope and phasors *(in Italian)*.

➡️ To see sine waves, phasors and phase shift in motion, use the [Alternating current](/education/TEEA/4MAT/laboratorio/ca/) web app *(in Italian)*.

[← Back to TEEA — 4MAT](/education/TEEA/4MAT/index.en.html)

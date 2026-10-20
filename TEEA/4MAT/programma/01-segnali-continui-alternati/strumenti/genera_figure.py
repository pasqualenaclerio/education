#!/usr/bin/env python3
"""
Genera le figure SVG della dispensa (cartella ../img).

Le etichette usano solo simboli (V_M, T, φ, ω…), quindi valgono sia per la
pagina italiana sia per quella inglese.

Per rigenerarle:
    pip install matplotlib numpy
    python strumenti/genera_figure.py
"""
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Arc, FancyArrowPatch, Circle

QUI = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(QUI, '..', 'img')
os.makedirs(IMG, exist_ok=True)

# Colori del tema del sito (Cayman)
VERDE = '#159957'
BLU = '#155799'
ROSSO = '#B3205F'
GRIGIO = '#606c71'
INCHIOSTRO = '#1b2936'

plt.rcParams.update({
    'mathtext.fontset': 'stix', 'font.family': 'DejaVu Sans', 'font.size': 12,
    'svg.fonttype': 'path', 'axes.edgecolor': INCHIOSTRO,
})


def assi(ax, xmax, ymin, ymax, etx=r'$t$', ety=r'$v(t)$'):
    """Assi cartesiani con le frecce, senza riquadro."""
    ax.set_xlim(-0.05 * xmax, xmax * 1.08)
    ax.set_ylim(ymin, ymax)
    ax.axis('off')
    ax.annotate('', xy=(xmax * 1.06, 0), xytext=(-0.03 * xmax, 0),
                arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1.2))
    ax.annotate('', xy=(0, ymax * 0.97), xytext=(0, ymin * 0.97),
                arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1.2))
    ax.text(xmax * 1.06, -0.12 * ymax, etx, ha='right', va='top')
    ax.text(0.02 * xmax, ymax * 0.97, ety, ha='left', va='top')


def freccia_doppia(ax, p1, p2, colore, testo, dx=0, dy=0, **kw):
    ax.annotate('', xy=p2, xytext=p1,
                arrowprops=dict(arrowstyle='<|-|>', color=colore, lw=1.1, shrinkA=0, shrinkB=0))
    xm, ym = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
    ax.text(xm + dx, ym + dy, testo, color=colore, **kw)


def salva(fig, nome):
    fig.savefig(os.path.join(IMG, nome), format='svg', bbox_inches='tight', pad_inches=0.05,
                transparent=True)
    plt.close(fig)
    print('creato', nome)


# ---------- 1) Continua e alternata ----------
fig, (a1, a2) = plt.subplots(1, 2, figsize=(9, 2.6))
t = np.linspace(0, 2, 400)
assi(a1, 2, -1.4, 1.4)
a1.plot(t, np.full_like(t, 0.8), color=BLU, lw=2.2)
a1.text(1.0, 0.95, r'$V$', color=BLU, ha='center', va='bottom', fontsize=14)
a1.set_title('DC', color=INCHIOSTRO, fontweight='bold', fontsize=13)
assi(a2, 2, -1.4, 1.4)
a2.plot(t, np.sin(2 * np.pi * t), color=VERDE, lw=2.2)
a2.fill_between(t, np.sin(2 * np.pi * t), 0, where=np.sin(2 * np.pi * t) >= 0, color=VERDE, alpha=0.12)
a2.fill_between(t, np.sin(2 * np.pi * t), 0, where=np.sin(2 * np.pi * t) < 0, color=ROSSO, alpha=0.12)
a2.text(0.25, 0.4, '+', color=VERDE, ha='center', fontsize=16, fontweight='bold')
a2.text(0.75, -0.55, '−', color=ROSSO, ha='center', fontsize=16, fontweight='bold')
a2.set_title('AC', color=INCHIOSTRO, fontweight='bold', fontsize=13)
salva(fig, 'continua-alternata.svg')

# ---------- 2) La sinusoide e le sue grandezze ----------
fig, ax = plt.subplots(figsize=(9, 3.8))
T = 1.0
t = np.linspace(0, 1.5 * T, 600)
assi(ax, 1.75 * T, -1.45, 1.45)
ax.plot(t, np.sin(2 * np.pi * t / T), color=VERDE, lw=2.4)
ax.plot([0, 1.72], [1, 1], ls=':', color=GRIGIO, lw=0.9)
ax.plot([0, 1.72], [-1, -1], ls=':', color=GRIGIO, lw=0.9)
ax.text(-0.02, 1, r'$V_M$', ha='right', va='center', color=BLU, fontsize=14)
ax.text(-0.02, -1, r'$-V_M$', ha='right', va='center', color=BLU, fontsize=14)
freccia_doppia(ax, (0.25, 0), (0.25, 1), BLU, r'$V_M$', dx=0.025, ha='left', va='center', fontsize=14)
freccia_doppia(ax, (1.64, -1), (1.64, 1), ROSSO, r'$V_{pp}$', dx=0.025, dy=0.3, ha='left', va='center', fontsize=14)
ax.plot([0.25, 0.25], [1, 1.25], ls=':', color=GRIGIO, lw=0.9)
ax.plot([1.25, 1.25], [1, 1.25], ls=':', color=GRIGIO, lw=0.9)
freccia_doppia(ax, (0.25, 1.22), (1.25, 1.22), INCHIOSTRO, r'$T$', dy=0.04, ha='center', va='bottom', fontsize=14)
salva(fig, 'sinusoide.svg')

# ---------- 3) Il fasore che ruota genera la sinusoide ----------
fig, ax = plt.subplots(figsize=(10, 3.6))
ax.set_aspect('equal'); ax.axis('off')
CX = -2.0                      # centro della circonferenza
K = 0.85                       # cm di asse orizzontale per radiante
ax.set_xlim(CX - 1.5, 2 * np.pi * K + 0.6); ax.set_ylim(-1.5, 1.6)
ax.add_patch(Circle((CX, 0), 1, fill=False, ls='--', color=GRIGIO, lw=0.9))
ax.annotate('', xy=(CX + 1.35, 0), xytext=(CX - 1.35, 0), arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1))
ax.annotate('', xy=(CX, 1.4), xytext=(CX, -1.4), arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1))
ang = np.deg2rad(50)
px, py = CX + np.cos(ang), np.sin(ang)
ax.annotate('', xy=(px, py), xytext=(CX, 0),
            arrowprops=dict(arrowstyle='-|>', color=BLU, lw=2.4, shrinkA=0, shrinkB=0))
ax.text(CX + 0.25, 0.62, r'$V_M$', color=BLU, fontsize=15, ha='right')
ax.add_patch(Arc((CX, 0), 0.7, 0.7, theta1=0, theta2=50, color=ROSSO, lw=1.3))
ax.text(CX + 0.42, 0.1, r'$\omega t$', color=ROSSO, fontsize=14)
ax.add_patch(FancyArrowPatch((CX + 1.2 * np.cos(np.deg2rad(20)), 1.2 * np.sin(np.deg2rad(20))),
                             (CX + 1.2 * np.cos(np.deg2rad(70)), 1.2 * np.sin(np.deg2rad(70))),
                             connectionstyle='arc3,rad=0.3', arrowstyle='-|>', mutation_scale=14, color=VERDE, lw=1.5))
ax.text(CX + 1.2, 0.95, r'$\omega$', color=VERDE, fontsize=16)
# sinusoide con la stessa ampiezza della circonferenza
xmax = 2 * np.pi * K
ax.annotate('', xy=(xmax + 0.45, 0), xytext=(-0.1, 0), arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1))
ax.annotate('', xy=(0, 1.45), xytext=(0, -1.4), arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1))
th = np.linspace(0, 2 * np.pi, 400)
ax.plot(th * K, np.sin(th), color=VERDE, lw=2.4)
ax.text(xmax + 0.45, -0.1, r'$\omega t$', ha='right', va='top', fontsize=14)
ax.text(0.08, 1.45, r'$v(t)$', ha='left', va='top', fontsize=14)
ax.plot([ang * K], [py], 'o', color=BLU, ms=7)
ax.plot([px, ang * K], [py, py], ls=':', color=BLU, lw=1.2)
for k, lab in [(np.pi / 2, r'$\pi/2$'), (np.pi, r'$\pi$'), (3 * np.pi / 2, r'$3\pi/2$'), (2 * np.pi, r'$2\pi$')]:
    ax.plot([k * K, k * K], [-0.05, 0.05], color=INCHIOSTRO, lw=1)
    sopra = k > np.pi * 0.9 and k < np.pi * 1.9
    ax.text(k * K, 0.1 if sopra else -0.1, lab, ha='center', va='bottom' if sopra else 'top', color=GRIGIO, fontsize=12)
salva(fig, 'fasore-sinusoide.svg')

# ---------- 4) Sfasamento: sinusoidi e diagramma fasoriale ----------
fig = plt.figure(figsize=(8.5, 3.2))
asn = fig.add_axes([0.0, 0.0, 0.64, 1.0])
ad = fig.add_axes([0.68, 0.0, 0.32, 1.0])
dphi = np.deg2rad(60)
xmax = 2 * np.pi
asn.set_xlim(-0.2, xmax * 1.1); asn.set_ylim(-1.45, 1.45); asn.axis('off')
asn.annotate('', xy=(xmax * 1.08, 0), xytext=(-0.1, 0), arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1))
asn.annotate('', xy=(0, 1.4), xytext=(0, -1.4), arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1))
th = np.linspace(0, xmax, 400)
asn.plot(th, np.sin(th + dphi), color=BLU, lw=2.3)
asn.plot(th, 0.75 * np.sin(th), color=VERDE, lw=2.3)
asn.text(xmax * 1.08, -0.12, r'$\omega t$', ha='right', va='top', fontsize=15)
asn.text(0.25, 1.32, r'$v_1$', color=BLU, fontsize=17)
asn.text(np.pi / 2 + 0.1, 0.82, r'$v_2$', color=VERDE, fontsize=17)
m1, m2 = np.pi / 2 - dphi, np.pi / 2
asn.plot([m1, m1], [0, 1], ls=':', color=BLU, lw=0.9)
asn.plot([m2, m2], [0, 0.75], ls=':', color=VERDE, lw=0.9)
freccia_doppia(asn, (m1, -0.25), (m2, -0.25), ROSSO, r'$\Delta\varphi$', dy=-0.08, ha='center', va='top', fontsize=16)
ad.set_xlim(-0.4, 1.4); ad.set_ylim(-0.4, 1.3); ad.set_aspect('equal'); ad.axis('off')
ad.annotate('', xy=(1.35, 0), xytext=(-0.3, 0), arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1))
ad.annotate('', xy=(0, 1.25), xytext=(0, -0.3), arrowprops=dict(arrowstyle='-|>', color=INCHIOSTRO, lw=1))
ad.annotate('', xy=(np.cos(dphi), np.sin(dphi)), xytext=(0, 0),
            arrowprops=dict(arrowstyle='-|>', color=BLU, lw=2.4, shrinkA=0, shrinkB=0))
ad.annotate('', xy=(0.75, 0), xytext=(0, 0), arrowprops=dict(arrowstyle='-|>', color=VERDE, lw=2.4, shrinkA=0, shrinkB=0))
ad.text(np.cos(dphi) + 0.04, np.sin(dphi) + 0.02, r'$\bar{V}_1$', color=BLU, fontsize=17)
ad.text(0.62, -0.08, r'$\bar{V}_2$', color=VERDE, fontsize=17, va='top')
ad.add_patch(Arc((0, 0), 0.7, 0.7, theta1=0, theta2=60, color=ROSSO, lw=1.3))
ad.text(0.4, 0.25, r'$\Delta\varphi$', color=ROSSO, fontsize=16)
salva(fig, 'sfasamento.svg')


# ---------- 5) e 6) Lettura sullo schermo dell'oscilloscopio ----------
SCHERMO = '#10241b'      # fondo dello schermo
RETICOLO = '#4f7a63'     # griglia
CH1 = '#ffd23f'          # canale 1 (giallo, come sugli oscilloscopi)
CH2 = '#4fd6e8'          # canale 2 (ciano)
TESTO_S = '#e8f3ec'


def schermo(ax, vdiv, tdiv, ch2=None):
    """Schermo 10 x 8 divisioni; gli assi centrali hanno 5 parti per divisione."""
    ax.set_xlim(-5.15, 5.15); ax.set_ylim(-4.9, 4.15); ax.set_aspect('equal'); ax.axis('off')
    ax.add_patch(matplotlib.patches.FancyBboxPatch((-5, -4), 10, 8, boxstyle='round,pad=0.08,rounding_size=0.25',
                                                   facecolor=SCHERMO, edgecolor='#0b1712', lw=3))
    for x in range(-5, 6):
        ax.plot([x, x], [-4, 4], color=RETICOLO, lw=0.7, ls=(0, (1, 2)) if x not in (-5, 5) else '-')
    for y in range(-4, 5):
        ax.plot([-5, 5], [y, y], color=RETICOLO, lw=0.7, ls=(0, (1, 2)) if y not in (-4, 4) else '-')
    ax.plot([-5, 5], [0, 0], color=RETICOLO, lw=1.1)
    ax.plot([0, 0], [-4, 4], color=RETICOLO, lw=1.1)
    for k in np.arange(-5, 5.01, 0.2):           # tacche delle parti (1/5 di divisione)
        ax.plot([k, k], [-0.1, 0.1], color=RETICOLO, lw=0.9)
    for k in np.arange(-4, 4.01, 0.2):
        ax.plot([-0.1, 0.1], [k, k], color=RETICOLO, lw=0.9)
    # impostazioni sotto lo schermo
    ax.text(-5, -4.55, f'CH1  {vdiv}/div', color='#8a6d00', fontsize=12, fontweight='bold', va='center')
    if ch2:
        ax.text(-1.6, -4.55, f'CH2  {ch2}/div', color='#137a87', fontsize=12, fontweight='bold', va='center')
    ax.text(5, -4.55, f'{tdiv}/div', color=INCHIOSTRO, fontsize=12, fontweight='bold', va='center', ha='right')


def freccia_s(ax, p1, p2, colore, testo, dx=0, dy=0, **kw):
    ax.annotate('', xy=p2, xytext=p1, arrowprops=dict(arrowstyle='<|-|>', color=colore, lw=1.6, shrinkA=0, shrinkB=0,
                                                      mutation_scale=14))
    xm, ym = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
    ax.text(xm + dx, ym + dy, testo, color=colore, fontsize=15, fontweight='bold', **kw)


# 5) un segnale: VM = 2,6 div (2 div + 3 parti), T = 4 div
fig, ax = plt.subplots(figsize=(7.2, 6.4))
schermo(ax, '2 V', '1 ms')
x = np.linspace(-5, 5, 800)
VM, T = 2.6, 4.0
ax.plot(x, VM * np.sin(2 * np.pi * x / T), color=CH1, lw=2.6)
freccia_s(ax, (1, 0), (1, VM), CH1, r'$V_M$', dx=0.15, ha='left', va='center')
ax.plot([0, 4], [0, 0], 'o', color=CH1, ms=6)
ax.plot([0, 0], [0, -3.2], ls=':', color=TESTO_S, lw=1); ax.plot([4, 4], [0, -3.2], ls=':', color=TESTO_S, lw=1)
freccia_s(ax, (0, -3.1), (4, -3.1), TESTO_S, r'$T$', dy=0.12, ha='center', va='bottom')
salva(fig, 'oscilloscopio-lettura.svg')

# 6) due segnali sfasati: T = 4 div, delta t = 0,6 div (3 parti)
fig, ax = plt.subplots(figsize=(7.2, 6.4))
schermo(ax, '2 V', '1 ms', ch2='1 V')
ax.plot(x, 3 * np.sin(2 * np.pi * x / T), color=CH1, lw=2.6)
ax.plot(x, 2 * np.sin(2 * np.pi * (x - 0.6) / T), color=CH2, lw=2.6)
ax.text(-4.75, 3.45, r'$v_1$', color=CH1, fontsize=16, fontweight='bold')
ax.text(-4.75, 2.75, r'$v_2$', color=CH2, fontsize=16, fontweight='bold')
ax.plot([0], [0], 'o', color=CH1, ms=6); ax.plot([0.6], [0], 'o', color=CH2, ms=6)
ax.plot([0, 0], [0, 3.7], ls=':', color=TESTO_S, lw=1); ax.plot([0.6, 0.6], [0, 3.7], ls=':', color=TESTO_S, lw=1)
freccia_s(ax, (0, 3.6), (0.6, 3.6), TESTO_S, r'$\Delta t$', dx=0.45, ha='left', va='center')
ax.plot([4, 4], [0, -3.4], ls=':', color=TESTO_S, lw=1)
freccia_s(ax, (0, -3.3), (4, -3.3), TESTO_S, r'$T$', dy=0.12, ha='center', va='bottom')
salva(fig, 'oscilloscopio-sfasamento.svg')

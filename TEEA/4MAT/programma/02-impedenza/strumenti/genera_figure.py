#!/usr/bin/env python3
"""
Genera le figure SVG della lezione LV02 – L'impedenza (cartella ../img).

Le etichette usano solo simboli (V̄, Ī, φ, Δt…), quindi valgono sia per la
pagina italiana sia per quella inglese.

Colori: tensione blu e corrente magenta (come nel sito), resistenza verde;
impedenza viola, induttore arancio e condensatore azzurro come nel Laboratorio delle impedenze.

Per rigenerarle:
    pip install matplotlib numpy
    python strumenti/genera_figure.py
"""
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Arc

QUI = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(QUI, '..', 'img')
os.makedirs(IMG, exist_ok=True)

TENSIONE = '#2152C0'
CORRENTE = '#B3205F'
IMPEDENZA = '#7A3FA0'
RESISTENZA = '#0B7A62'
INDUTTORE = '#C2611F'
CONDENSATORE = '#0B7287'
GRIGIO = '#7a7590'
INCHIOSTRO = '#1d1b2f'

plt.rcParams.update({
    'mathtext.fontset': 'stix', 'font.family': 'DejaVu Sans', 'font.size': 12,
    'svg.fonttype': 'path',
})


def freccia(ax, p1, p2, colore, lw=1.2, stile='-|>'):
    ax.annotate('', xy=p2, xytext=p1,
                arrowprops=dict(arrowstyle=stile, color=colore, lw=lw, shrinkA=0, shrinkB=0,
                                mutation_scale=14))


def salva(fig, nome):
    fig.savefig(os.path.join(IMG, nome), format='svg', bbox_inches='tight', pad_inches=0.05,
                transparent=True)
    plt.close(fig)
    print('creato', nome)


# ---------- 1) Un carico in alternata: la corrente è più piccola e arriva dopo ----------
PHI = 30                                    # sfasamento dell'esempio (gradi)
fig = plt.figure(figsize=(9.4, 3.1))
asn = fig.add_axes([0.0, 0.0, 0.64, 1.0])
afa = fig.add_axes([0.70, 0.0, 0.30, 1.0])

# sinusoidi: asse orizzontale in angolo ωt (0 … 2π)
xmax = 2 * np.pi
asn.set_xlim(-0.25, xmax * 1.1); asn.set_ylim(-1.35, 1.45); asn.axis('off')
freccia(asn, (-0.15, 0), (xmax * 1.08, 0), INCHIOSTRO, 1.0)
freccia(asn, (0, -1.3), (0, 1.42), INCHIOSTRO, 1.0)
asn.text(xmax * 1.08, -0.1, r'$t$', ha='right', va='top', fontsize=14)
x = np.linspace(0, xmax, 500)
d = np.deg2rad(PHI)
asn.plot(x, np.sin(x), color=TENSIONE, lw=2.4)
asn.plot(x, 0.6 * np.sin(x - d), color=CORRENTE, lw=2.4)
asn.text(np.pi / 2 - 0.25, 1.06, r'$v(t)$', color=TENSIONE, ha='right', va='bottom', fontsize=14)
asn.text(np.pi / 2 + d + 0.3, 0.64, r'$i(t)$', color=CORRENTE, ha='left', va='bottom', fontsize=14)
# i due massimi e la distanza nel tempo
asn.plot([np.pi / 2] * 2, [0, 1], ls=':', color=TENSIONE, lw=1.1)
asn.plot([np.pi / 2 + d] * 2, [0, 0.6], ls=':', color=CORRENTE, lw=1.1)
freccia(asn, (np.pi / 2, -0.22), (np.pi / 2 + d, -0.22), INCHIOSTRO, 1.0, '<|-|>')
asn.text(np.pi / 2 + d / 2, -0.32, r'$\Delta t$', ha='center', va='top', fontsize=13)

# diagramma fasoriale: V̄ a 0°, Ī a −30°
afa.set_aspect('equal'); afa.axis('off')
afa.set_xlim(-0.25, 1.35); afa.set_ylim(-0.95, 0.95)
freccia(afa, (-0.15, 0), (1.3, 0), GRIGIO, 0.8)
freccia(afa, (0, -0.85), (0, 0.85), GRIGIO, 0.8)
freccia(afa, (0, 0), (1.0, 0), TENSIONE, 2.4)
afa.text(1.0, 0.07, r'$\bar V$', color=TENSIONE, ha='right', va='bottom', fontsize=16)
ci, si = 0.6 * np.cos(-d), 0.6 * np.sin(-d)
freccia(afa, (0, 0), (ci, si), CORRENTE, 2.4)
afa.text(ci + 0.04, si - 0.03, r'$\bar I$', color=CORRENTE, ha='left', va='top', fontsize=16)
afa.add_patch(Arc((0, 0), 0.62, 0.62, theta1=-PHI, theta2=0, color=IMPEDENZA, lw=1.6))
afa.text(0.36, -0.1, r'$\varphi$', color=IMPEDENZA, ha='left', va='center', fontsize=15)
salva(fig, 'carico-alternata.svg')


# ---------- 2) Esempio: dai fasori V̄ e Ī all'impedenza Z̄ (due piani, come nel laboratorio) ----------
def griglia(ax, xmin, xmax, ymin, ymax):
    for k in range(xmin, xmax + 1):
        ax.plot([k, k], [ymin, ymax], color='#e6dcc6', lw=0.7, zorder=0)
    for k in range(ymin, ymax + 1):
        ax.plot([xmin, xmax], [k, k], color='#e6dcc6', lw=0.7, zorder=0)
    freccia(ax, (xmin - 0.2, 0), (xmax + 0.5, 0), GRIGIO, 0.9)
    freccia(ax, (0, ymin - 0.2), (0, ymax + 0.5), GRIGIO, 0.9)


def fasore(ax, modulo, gradi, colore, etichetta, dx=0.0, dy=0.0, **kw):
    a = np.deg2rad(gradi)
    x, y = modulo * np.cos(a), modulo * np.sin(a)
    freccia(ax, (0, 0), (x, y), colore, 2.6)
    ax.text(x + dx, y + dy, etichetta, color=colore, fontsize=16, **kw)


def arco(ax, r, da, a, colore, testo, pos):
    ax.add_patch(Arc((0, 0), 2 * r, 2 * r, theta1=min(da, a), theta2=max(da, a), color=colore, lw=1.6))
    ax.text(*pos, testo, color=colore, fontsize=14, ha='center', va='center')


fig = plt.figure(figsize=(9.6, 3.9))
a1 = fig.add_axes([0.0, 0.08, 0.46, 0.92])
a2 = fig.add_axes([0.52, 0.08, 0.48, 0.92])

# piano di V̄ e Ī: V̄ = 100 V ∠ 10° (□ = 25 V → 4 quadretti), Ī = 2 A ∠ 55° (□ = 1 A → 2 quadretti)
for ax in (a1, a2):
    ax.set_aspect('equal'); ax.axis('off')
a1.set_xlim(-1.4, 4.8); a1.set_ylim(-1.4, 3.7)
griglia(a1, -1, 4, -1, 3)
fasore(a1, 4, 10, TENSIONE, r'$\bar V$', dx=0.1, dy=0.05, ha='left', va='bottom')
fasore(a1, 2, 55, CORRENTE, r'$\bar I$', dx=0.08, dy=0.05, ha='left', va='bottom')
arco(a1, 1.25, 10, 55, IMPEDENZA, r'$\varphi$', (1.35 * np.cos(np.deg2rad(32)) + 0.25, 1.35 * np.sin(np.deg2rad(32)) + 0.12))
a1.text(-1.3, -1.25, '□ = 25 V', color=TENSIONE, fontsize=11, ha='left', va='top')
a1.text(1.6, -1.25, '□ = 1 A', color=CORRENTE, fontsize=11, ha='left', va='top')

# piano di Z̄: Z̄ = 50 Ω ∠ −45° (□ = 10 Ω → 5 quadretti); a sinistra la zona R < 0 (vietata ai carichi passivi)
a2.set_xlim(-2.5, 5.8); a2.set_ylim(-4.7, 2.7)
a2.add_patch(plt.Rectangle((-2, -4), 2, 6, color='#d9d4e4', alpha=0.55, lw=0, zorder=0))
griglia(a2, -2, 5, -4, 2)
a2.text(-1.0, 1.25, r'$R<0$', color=GRIGIO, fontsize=12, ha='center', va='center')
fasore(a2, 5, -45, IMPEDENZA, r'$\bar Z$', dx=0.1, dy=-0.05, ha='left', va='top')
arco(a2, 1.4, -45, 0, IMPEDENZA, r'$\varphi$', (1.9, -0.55))
a2.text(-2.3, -4.4, '□ = 10 Ω', color=IMPEDENZA, fontsize=11, ha='left', va='top')
salva(fig, 'esempio-impedenza.svg')



# ---------- 3) I tre componenti ideali: fasori V̄ e Ī (sopra) e impedenza (sotto) ----------
fig, assi_ = plt.subplots(2, 3, figsize=(9.0, 5.6))
casi = [('R', 0, RESISTENZA, r'$\bar Z_R = R\,\angle\,0°$'),
        ('L', 90, INDUTTORE, r'$\bar Z_L = X_L\,\angle\,{+90°}$'),
        ('C', -90, CONDENSATORE, r'$\bar Z_C = X_C\,\angle\,{-90°}$')]
for col, (nome, phi, colore, testo) in enumerate(casi):
    for riga in range(2):
        ax = assi_[riga][col]
        ax.set_aspect('equal'); ax.axis('off')
        ax.set_xlim(-0.55, 1.45); ax.set_ylim(-1.2, 1.2)
        freccia(ax, (-0.4, 0), (1.35, 0), GRIGIO, 0.8)
        freccia(ax, (0, -1.1), (0, 1.1), GRIGIO, 0.8)
    alto, basso = assi_[0][col], assi_[1][col]
    alto.set_title(nome, color=colore, fontsize=17, fontweight='bold')
    # sopra: V̄ a 0°, Ī sfasata di −φ
    fasore(alto, 1.05, 0, TENSIONE, r'$\bar V$', dx=-0.05, dy=0.08, ha='right', va='bottom')
    if phi == 0:
        fasore(alto, 0.6, 0, CORRENTE, r'$\bar I$', dx=0.0, dy=-0.1, ha='center', va='top')
        alto.text(0.3, 0.62, r'$\varphi = 0°$', color=IMPEDENZA, fontsize=13, ha='left', va='center')
    else:
        fasore(alto, 0.75, -phi, CORRENTE, r'$\bar I$', dx=0.1, dy=0.0, ha='left', va='center')
        alto.add_patch(Arc((0, 0), 0.6, 0.6, theta1=min(0, -phi), theta2=max(0, -phi), color=IMPEDENZA, lw=1.4))
        alto.text(0.3, -0.62 * np.sign(phi), (r'$\varphi = %+d°$' % phi).replace('-', '−'), color=IMPEDENZA,
                  fontsize=13, ha='left', va='center')
    # sotto: il fasore dell'impedenza
    if phi == 0:
        fasore(basso, 1.0, 0, colore, '', 0, 0)
    else:
        fasore(basso, 0.95, phi, colore, '', 0, 0)
    basso.text(0.45, -1.15 if phi >= 0 else 1.15, testo, color=colore, fontsize=13, ha='center',
               va='bottom' if phi < 0 else 'top')
salva(fig, 'componenti-ideali.svg')


# ---------- 4) Reattanze in funzione della frequenza ----------
fig, ax = plt.subplots(figsize=(7.6, 4.0))
ax.axis('off')
fmax, xmax = 10.0, 10.0
ax.set_xlim(-0.6, fmax + 1.2); ax.set_ylim(-1.0, xmax + 0.9)
freccia(ax, (-0.2, 0), (fmax + 0.8, 0), INCHIOSTRO, 1.1)
freccia(ax, (0, -0.2), (0, xmax + 0.6), INCHIOSTRO, 1.1)
ax.text(fmax + 0.8, -0.3, r'$f$', ha='right', va='top', fontsize=15)
ax.text(0.2, xmax + 0.6, r'$X,\ R\ \ [\Omega]$', ha='left', va='top', fontsize=13)
f = np.linspace(0.0, fmax, 400)
ax.plot(f, 0.8 * f, color=INDUTTORE, lw=2.6)
fc = np.linspace(0.62, fmax, 400)
ax.plot(fc, 6.2 / fc, color=CONDENSATORE, lw=2.6)
ax.plot([0, fmax], [3.5, 3.5], color=RESISTENZA, lw=2.2, ls='--')
ax.text(6.4, 5.9, r'$X_L = 2\pi f L$', color=INDUTTORE, ha='right', va='bottom', fontsize=14)
ax.text(1.35, 7.0, r'$X_C = \dfrac{1}{2\pi f C}$', color=CONDENSATORE, ha='left', va='center', fontsize=14)
ax.text(fmax, 3.65, r'$R$', color=RESISTENZA, ha='right', va='bottom', fontsize=14)
# incrocio X_L = X_C: anticipa la risonanza
f0 = np.sqrt(6.2 / 0.8)
ax.plot([f0, f0], [0, 0.8 * f0], ls=':', color=GRIGIO, lw=1.2)
ax.plot([f0], [0.8 * f0], 'o', color=INCHIOSTRO, ms=5)
ax.text(f0, -0.3, r'$f_0$', ha='center', va='top', fontsize=14, color=INCHIOSTRO)
ax.text(-0.15, -0.3, r'$0$', ha='right', va='top', fontsize=13)
salva(fig, 'reattanza-frequenza.svg')


# ---------- 5) Il triangolo dell'impedenza nei circuiti in serie: RL, RC, RLC ----------
def seg(ax, p1, p2, colore, lw=2.6):
    freccia(ax, p1, p2, colore, lw)


fig, (b1, b2, b3) = plt.subplots(1, 3, figsize=(10.2, 4.3))
for ax, tit in ((b1, 'RL'), (b2, 'RC'), (b3, 'RLC')):
    ax.set_aspect('equal'); ax.axis('off')
    ax.set_xlim(-0.6, 4.9); ax.set_ylim(-4.6, 5.8)
    freccia(ax, (-0.4, 0), (4.6, 0), GRIGIO, 0.8)
    freccia(ax, (0, -4.3), (0, 5.6), GRIGIO, 0.8)
    ax.set_title(tit, color=INCHIOSTRO, fontsize=16, fontweight='bold')


def triangolo(ax, R, X, pezzi_x):
    """pezzi_x: lista di (y_inizio, y_fine, colore, etichetta, scostamento_x)"""
    seg(ax, (0, 0), (R, 0), RESISTENZA)
    ax.text(R / 2, -0.25 if X > 0 else 0.25, r'$R$', color=RESISTENZA, fontsize=15, ha='center',
            va='top' if X > 0 else 'bottom')
    for y0, y1, col, et, dx, *pos in pezzi_x:
        seg(ax, (R + dx, y0), (R + dx, y1), col)
        if pos:
            ax.text(*pos[0], et, color=col, fontsize=15, ha='right', va='center')
        else:
            ax.text(R + dx + 0.18, (y0 + y1) / 2, et, color=col, fontsize=15, ha='left', va='center')
    seg(ax, (0, 0), (R, X), IMPEDENZA, 3.0)
    ang = np.degrees(np.arctan2(X, R))
    ax.text(R / 2 - 0.35, X / 2 + (0.35 if X > 0 else -0.35), r'$\bar Z$', color=IMPEDENZA, fontsize=17,
            ha='right', va='bottom' if X > 0 else 'top')
    ax.add_patch(Arc((0, 0), 2.2, 2.2, theta1=min(0, ang), theta2=max(0, ang), color=IMPEDENZA, lw=1.6))
    a = np.radians(ang / 2)
    ax.text(1.45 * np.cos(a), 1.45 * np.sin(a), r'$\varphi$', color=IMPEDENZA, fontsize=15, ha='center', va='center')


triangolo(b1, 3, 4, [(0, 4, INDUTTORE, r'$X_L$', 0)])
triangolo(b2, 3, -4, [(0, -4, CONDENSATORE, r'$X_C$', 0)])
triangolo(b3, 3, 3, [(0, 5, INDUTTORE, r'$X_L$', 0, (2.85, 4.4)), (5, 3, CONDENSATORE, r'$X_C$', 0.45)])
b3.plot([3, 3.45], [3, 3], ls=':', color=GRIGIO, lw=1.2)
# reattanza totale X = X_L − X_C
freccia(b3, (4.35, 0), (4.35, 3), INCHIOSTRO, 1.0, '<|-|>')
b3.text(4.5, 1.5, r'$X$', color=INCHIOSTRO, fontsize=15, ha='left', va='center')
b3.set_xlim(-0.6, 5.2)
salva(fig, 'triangolo-impedenza.svg')


# ---------- 6) Il triangolo delle correnti nei circuiti in parallelo: RL e RC ----------
fig, (p1, p2) = plt.subplots(1, 2, figsize=(8.6, 4.4))


def correnti(ax, tit, IR, IX, colX, etX):
    ax.set_aspect('equal'); ax.axis('off')
    ax.set_xlim(-0.6, 5.6); ax.set_ylim(-3.9, 4.6)
    freccia(ax, (-0.4, 0), (5.4, 0), GRIGIO, 0.8)
    freccia(ax, (0, -3.6), (0, 4.4), GRIGIO, 0.8)
    ax.set_title(tit, color=INCHIOSTRO, fontsize=16, fontweight='bold')
    # tensione di riferimento a 0° (più lunga, tratto sottile)
    freccia(ax, (0, 0), (5.2, 0), TENSIONE, 1.6)
    ax.text(5.2, 0.15 if IX < 0 else -0.15, r'$\bar V$', color=TENSIONE, fontsize=15, ha='right',
            va='bottom' if IX < 0 else 'top')
    seg(ax, (0, 0), (IR, 0), RESISTENZA, 3.0)
    ax.text(IR / 2, 0.15 if IX < 0 else -0.2, r'$\bar I_R$', color=RESISTENZA, fontsize=15, ha='center',
            va='bottom' if IX < 0 else 'top')
    seg(ax, (IR, 0), (IR, IX), colX)
    ax.text(IR + 0.15, IX / 2, etX, color=colX, fontsize=15, ha='left', va='center')
    seg(ax, (0, 0), (IR, IX), CORRENTE, 3.0)
    ax.text(IR / 2 - 0.3, IX / 2 + (0.3 if IX > 0 else -0.3), r'$\bar I$', color=CORRENTE, fontsize=17,
            ha='right', va='bottom' if IX > 0 else 'top')
    ang = np.degrees(np.arctan2(IX, IR))
    ax.add_patch(Arc((0, 0), 2.0, 2.0, theta1=min(0, ang), theta2=max(0, ang), color=CORRENTE, lw=1.6))
    a = np.radians(ang / 2)
    ax.text(1.4 * np.cos(a), 1.4 * np.sin(a), r'$\varphi_I$', color=CORRENTE, fontsize=14, ha='center', va='center')


correnti(p1, 'RL', 4, -3, INDUTTORE, r'$\bar I_L$')
correnti(p2, 'RC', 2, 4, CONDENSATORE, r'$\bar I_C$')
salva(fig, 'triangolo-correnti.svg')

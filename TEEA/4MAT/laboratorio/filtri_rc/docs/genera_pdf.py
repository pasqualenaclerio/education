#!/usr/bin/env python3
"""
Genera docs/formulario-filtri-rc.pdf, il riassunto delle formule con esempi svolti.

Per rigenerarlo dopo una modifica:
    pip install reportlab matplotlib numpy
    python docs/genera_pdf.py

Le formule sono scritte in notazione LaTeX (tra r'...') e disegnate con matplotlib.
I testi e gli esempi sono nella funzione contenuto() in fondo al file.
"""
import io
import os

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                Image, KeepTogether)
from reportlab.graphics.shapes import Drawing, Line, PolyLine, Circle, String

QUI = os.path.dirname(os.path.abspath(__file__))
USCITA = os.path.join(QUI, 'formulario-filtri-rc.pdf')

# ---------- colori (gli stessi della web app) ----------
INCHIOSTRO = '#1B2936'
TENUE = '#586976'
CARTA = '#EEF3F0'
BORDO = '#BDCAC3'
FILTRO = '#0B7A62'
IN = '#2152C0'
OUT = '#B3205F'
DISTURBO = '#B87400'
C = colors.HexColor

# ---------- caratteri: DejaVu Sans, incluso in matplotlib ----------
CARTELLA_FONT = os.path.join(matplotlib.get_data_path(), 'fonts', 'ttf')
pdfmetrics.registerFont(TTFont('Testo', os.path.join(CARTELLA_FONT, 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('Testo-Grassetto', os.path.join(CARTELLA_FONT, 'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('Testo', normal='Testo', bold='Testo-Grassetto')

plt.rcParams['mathtext.fontset'] = 'stix'

S = {
    'titolo': ParagraphStyle('titolo', fontName='Testo-Grassetto', fontSize=22, leading=26, textColor=C(INCHIOSTRO)),
    'sotto': ParagraphStyle('sotto', fontName='Testo', fontSize=10.5, leading=15, textColor=C(TENUE)),
    'h2': ParagraphStyle('h2', fontName='Testo-Grassetto', fontSize=14, leading=18, textColor=C(FILTRO),
                         spaceBefore=12, spaceAfter=6),
    'corpo': ParagraphStyle('corpo', fontName='Testo', fontSize=9.6, leading=14, textColor=C(INCHIOSTRO)),
    'es': ParagraphStyle('es', fontName='Testo', fontSize=9.4, leading=13.5, textColor=C(INCHIOSTRO)),
    'cella': ParagraphStyle('cella', fontName='Testo', fontSize=9, leading=12, textColor=C(INCHIOSTRO)),
    'cellaG': ParagraphStyle('cellaG', fontName='Testo-Grassetto', fontSize=9, leading=12, textColor=C(INCHIOSTRO)),
}
LARGHEZZA = A4[0] - 36 * mm


# ---------- formule come immagini ----------
def formula(tex, dim=16, colore=INCHIOSTRO):
    tex = tex.replace(r'\frac', r'\dfrac')            # frazioni a grandezza piena
    tex = tex.replace(r'\approx -', r'\approx {-}')   # segno meno attaccato al numero
    fig = plt.figure(figsize=(0.01, 0.01))
    fig.text(0, 0, f'${tex}$', fontsize=dim, color=colore)
    buf = io.BytesIO()
    fig.savefig(buf, dpi=300, transparent=True, bbox_inches='tight', pad_inches=0.03)
    plt.close(fig)
    buf.seek(0)
    w, h = PILImage.open(buf).size
    buf.seek(0)
    return Image(buf, width=w / 300 * 72, height=h / 300 * 72)


def riquadro_formule(righe, schema=None):
    """righe: lista di liste di formule TeX (ogni lista interna = una riga di formule affiancate)."""
    celle = []
    for riga in righe:
        imgs = [formula(t) for t in riga]
        if len(imgs) == 1:
            celle.append([imgs[0]])
        else:
            t = Table([imgs], hAlign='LEFT')
            t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                                   ('LEFTPADDING', (0, 0), (-1, -1), 0),
                                   ('RIGHTPADDING', (0, 0), (-1, -1), 18)]))
            celle.append([t])
    interno = Table(celle, hAlign='LEFT')
    interno.setStyle(TableStyle([('LEFTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 3),
                                 ('BOTTOMPADDING', (0, 0), (-1, -1), 3), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    if schema is not None:
        larg_schema = schema.width + 10
        esterno = Table([[interno, schema]], colWidths=[LARGHEZZA - larg_schema, larg_schema])
    else:
        esterno = Table([[interno]], colWidths=[LARGHEZZA])
    esterno.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C(CARTA)),
        ('LINEBEFORE', (0, 0), (0, -1), 3, C(FILTRO)),
        ('LEFTPADDING', (0, 0), (-1, -1), 12), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return esterno


def esempio(titolo, passi):
    """passi: lista di testi (str) o formule (tuple ('tex', stringa))."""
    righe = [[Paragraph(f'<b>Esempio</b> · {titolo}', S['es'])]]
    for p in passi:
        if isinstance(p, tuple):
            righe.append([formula(p[1], dim=13.5)])
        else:
            righe.append([Paragraph(p, S['es'])])
    t = Table(righe, colWidths=[LARGHEZZA])
    t.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.8, C(BORDO)),
        ('LINEBEFORE', (0, 0), (0, -1), 3, C(IN)),
        ('LEFTPADDING', (0, 0), (-1, -1), 12), ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, 0), 8), ('BOTTOMPADDING', (0, -1), (-1, -1), 8),
    ]))
    return t


def tabella(dati, larghezze, intestazione=True):
    righe = [[Paragraph(str(x), S['cellaG'] if (intestazione and i == 0) else S['cella']) for x in r]
             for i, r in enumerate(dati)]
    t = Table(righe, colWidths=larghezze, hAlign='LEFT')
    stile = [('LINEBELOW', (0, 0), (-1, -1), 0.5, C(BORDO)),
             ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
             ('LEFTPADDING', (0, 0), (-1, -1), 6), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]
    if intestazione:
        stile.append(('BACKGROUND', (0, 0), (-1, 0), C(CARTA)))
    t.setStyle(TableStyle(stile))
    return t


# ---------- piccoli schemi elettrici ----------
def schema(tipo):
    larg = 250 if tipo == 'bp' else 175
    d = Drawing(larg, 92)
    yt, yb = 68, 14
    ink, comp = C(INCHIOSTRO), C(FILTRO)

    def filo(x1, y1, x2, y2):
        d.add(Line(x1, y1, x2, y2, strokeColor=ink, strokeWidth=1.2))

    def testo(x, y, s, anc='middle', dim=8.5):
        d.add(String(x, y, s, fontName='Testo', fontSize=dim, fillColor=ink, textAnchor=anc))

    def res_h(x, y, lun, et):
        zz, a = 30, x + (lun - 30) / 2
        pts = [a, y]
        for k in range(6):
            pts += [a + (2 * k + 1) * zz / 12, y + (5 if k % 2 == 0 else -5)]
        pts += [a + zz, y]
        filo(x, y, a, y); d.add(PolyLine(pts, strokeColor=comp, strokeWidth=1.6)); filo(a + zz, y, x + lun, y)
        testo(x + lun / 2, y + 9, et)

    def res_v(x, y1, y2, et):
        zz, m = 30, (y1 + y2) / 2
        a = m + zz / 2
        pts = [x, a]
        for k in range(6):
            pts += [x + (5 if k % 2 == 0 else -5), a - (2 * k + 1) * zz / 12]
        pts += [x, a - zz]
        filo(x, y1, x, a); d.add(PolyLine(pts, strokeColor=comp, strokeWidth=1.6)); filo(x, a - zz, x, y2)
        testo(x + 10, m - 3, et, 'start')

    def cap_h(x, y, lun, et):
        m, g = x + lun / 2, 3
        filo(x, y, m - g, y); filo(m + g, y, x + lun, y)
        for xx in (m - g, m + g):
            d.add(Line(xx, y - 9, xx, y + 9, strokeColor=comp, strokeWidth=2.2))
        testo(m, y + 12, et)

    def cap_v(x, y1, y2, et):
        m, g = (y1 + y2) / 2, 3
        filo(x, y1, x, m + g); filo(x, m - g, x, y2)
        for yy in (m - g, m + g):
            d.add(Line(x - 9, yy, x + 9, yy, strokeColor=comp, strokeWidth=2.2))
        testo(x + 13, m - 3, et, 'start')

    x0 = 26
    x = x0 + 12
    filo(x0, yt, x, yt)
    celle = ['hp', 'lp'] if tipo == 'bp' else [tipo]
    for i, t in enumerate(celle):
        pedice = str(i + 1) if tipo == 'bp' else ''
        if t == 'lp':
            res_h(x, yt, 62, 'R' + pedice); cap_v(x + 78, yt, yb, 'C' + pedice)
        else:
            cap_h(x, yt, 62, 'C' + pedice); res_v(x + 78, yt, yb, 'R' + pedice)
        filo(x + 62, yt, x + 95, yt)
        for yy in (yt, yb):
            d.add(Circle(x + 78, yy, 2, fillColor=ink, strokeColor=ink))
        x += 95
    filo(x, yt, x + 12, yt)
    x += 12
    filo(x0, yb, x, yb)
    for xx in (x0, x):
        for yy in (yt, yb):
            d.add(Circle(xx, yy, 3, fillColor=colors.white, strokeColor=ink, strokeWidth=1.2))
    testo(x0 - 6, yt - 3, 'Vin', 'end', 9)
    testo(x + 6, yt - 3, 'Vout', 'start', 9)
    return d


# ---------- diagramma di Bode degli esempi ----------
def bode():
    f = np.logspace(1, 5, 800)
    s = 2j * np.pi * f
    lp = 1 / (1 + s * 4700 * 100e-9)
    hp = (s * 10000 * 47e-9) / (1 + s * 10000 * 47e-9)
    R1, C1, R2, C2 = 3300, 220e-9, 33000, 2.2e-9
    zb = R2 + 1 / (s * C2)
    zp = R1 * zb / (R1 + zb)
    bp = zp / (zp + 1 / (s * C1)) / (1 + s * R2 * C2)

    fig, (a1, a2) = plt.subplots(2, 1, figsize=(7.2, 4.6), sharex=True, gridspec_kw={'height_ratios': [3, 2]})
    for h, col, nome in [(lp, IN, 'Passa basso  (4,7 kΩ; 100 nF)'),
                         (hp, OUT, 'Passa alto  (10 kΩ; 47 nF)'),
                         (bp, FILTRO, 'Passa banda  (3,3 kΩ; 220 nF; 33 kΩ; 2,2 nF)')]:
        a1.semilogx(f, 20 * np.log10(np.abs(h)), color=col, lw=2, label=nome)
        a2.semilogx(f, np.degrees(np.unwrap(np.angle(h))), color=col, lw=2)
    a1.axhline(-3, color=TENUE, ls='--', lw=0.9)
    a1.text(11, -2.2, '−3 dB', color=TENUE, fontsize=8)
    a1.set_ylim(-50, 5); a1.set_ylabel('modulo (dB)')
    a2.set_ylim(-100, 100); a2.set_yticks([-90, -45, 0, 45, 90]); a2.set_ylabel('fase (°)')
    a2.set_xlabel('frequenza (Hz)')
    a2.set_xticks([10, 100, 1000, 10000, 100000]); a2.set_xticklabels(['10', '100', '1k', '10k', '100k'])
    for a in (a1, a2):
        a.grid(True, which='both', color='#DDE5E1', lw=0.6)
        a.tick_params(labelsize=8, colors=TENUE)
        for sp in a.spines.values():
            sp.set_color(BORDO)
        a.yaxis.label.set_color(INCHIOSTRO); a.xaxis.label.set_color(INCHIOSTRO)
    a1.legend(fontsize=7.5, frameon=False, loc='lower center')
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, dpi=220)
    plt.close(fig)
    buf.seek(0)
    larg = LARGHEZZA
    return Image(buf, width=larg, height=larg * 4.6 / 7.2)


# ---------- contenuto ----------
def contenuto():
    st = []
    P = lambda t, s='corpo': Paragraph(t, S[s])
    sp = lambda h=6: Spacer(1, h)

    st += [P('Filtri RC: formulario con esempi', 'titolo'), sp(4),
           P('Riassunto delle formule usate nel Laboratorio filtri RC. Ogni sezione ha un esempio svolto '
             'con gli stessi valori degli esempi pronti della web app, così puoi controllare i risultati sullo schermo.',
             'sotto'), sp(8)]

    # Grandezze
    st.append(KeepTogether([
        P('Grandezze e unità di misura', 'h2'),
        tabella([['Grandezza', 'Simbolo', 'Unità', 'Valori tipici nei filtri'],
                 ['Resistenza', 'R', 'ohm (Ω)', '1 kΩ = 10<super>3</super> Ω, 1 MΩ = 10<super>6</super> Ω'],
                 ['Capacità', 'C', 'farad (F)', '1 µF = 10<super>−6</super> F, 1 nF = 10<super>−9</super> F, 1 pF = 10<super>−12</super> F'],
                 ['Frequenza', 'f', 'hertz (Hz)', '1 kHz = 1000 Hz'],
                 ['Pulsazione', 'ω = 2πf', 'rad/s', '1 kHz corrisponde a ω ≈ 6283 rad/s'],
                 ['Guadagno', 'H, G', 'numero puro, dB', 'H = V<sub>out</sub>/V<sub>in</sub>, G in decibel']],
                [30 * mm, 24 * mm, 36 * mm, LARGHEZZA - 90 * mm])]))

    # Frequenza di taglio
    st.extend(sezione([
        P('1. Frequenza di taglio', 'h2'),
        riquadro_formule([[r'f_c = \frac{1}{2\pi\, R\, C}', r'R = \frac{1}{2\pi\, f_c\, C}', r'C = \frac{1}{2\pi\, f_c\, R}']]),
        sp(),
        P('È la frequenza che separa ciò che passa da ciò che viene attenuato. Alla frequenza di taglio '
          'l\'uscita vale 1/√2 ≈ 0,707 volte l\'ingresso, cioè −3 dB, ed è sfasata di 45°. '
          'Il prodotto RC si chiama costante di tempo τ e si misura in secondi.'),
        sp(),
        esempio('calcolare f<sub>c</sub> (R = 4,7 kΩ, C = 100 nF)',
                [('tex', r'f_c = \frac{1}{2\pi \cdot 4700 \cdot 100\cdot 10^{-9}} = \frac{1}{0{,}002953} \approx 339\ \mathrm{Hz}')]),
        sp(),
        esempio('progettare: voglio f<sub>c</sub> = 1 kHz con C = 100 nF',
                [('tex', r'R = \frac{1}{2\pi \cdot 1000 \cdot 100\cdot 10^{-9}} \approx 1592\ \Omega'),
                 'Il valore commerciale più vicino (serie E12) è 1,5 kΩ, che dà f<sub>c</sub> ≈ 1061 Hz.'])]))

    # Decibel
    st.extend(sezione([
        P('2. Guadagno in decibel', 'h2'),
        riquadro_formule([[r'G_{\mathrm{dB}} = 20\,\log_{10}\frac{V_{\mathrm{out}}}{V_{\mathrm{in}}}',
                           r'\frac{V_{\mathrm{out}}}{V_{\mathrm{in}}} = 10^{\,G_{\mathrm{dB}}/20}']]),
        sp(),
        P('I decibel trasformano le moltiplicazioni in somme: attraversare due blocchi in fila significa sommare i loro guadagni in dB. '
          'Un valore negativo indica un\'attenuazione.'),
        sp(),
        tabella([['G (dB)', '0', '−3', '−6', '−10', '−20', '−40', '−60'],
                 ['V<sub>out</sub>/V<sub>in</sub>', '1', '0,707', '0,5', '0,316', '0,1', '0,01', '0,001']],
                [30 * mm] + [17 * mm] * 7),
        sp(),
        esempio('V<sub>in</sub> = 2 V, V<sub>out</sub> = 0,5 V',
                [('tex', r'G = 20\,\log_{10}\frac{0{,}5}{2} = 20\,\log_{10} 0{,}25 \approx -12\ \mathrm{dB}')])]))

    # Passa basso
    st.extend(sezione([
        P('3. Filtro passa basso (R in serie, C verso massa)', 'h2'),
        riquadro_formule([[r'H(f) = \frac{1}{1 + j\,f/f_c}'],
                          [r'|H| = \frac{1}{\sqrt{1 + (f/f_c)^2}}', r'\varphi = -\arctan\frac{f}{f_c}']],
                         schema('lp')),
        sp(),
        P('Sotto f<sub>c</sub> il condensatore si comporta quasi come un circuito aperto e il segnale passa. '
          'Sopra f<sub>c</sub> il condensatore "cortocircuita" verso massa le frequenze alte: '
          'per f ≫ f<sub>c</sub> vale |H| ≈ f<sub>c</sub>/f, cioè −20 dB ogni volta che la frequenza si moltiplica per 10 '
          '(−20 dB/decade, circa −6 dB/ottava). Lo sfasamento va da 0° a −90°.'),
        sp(),
        esempio('f<sub>c</sub> = 339 Hz, disturbo a f = 1760 Hz',
                [('tex', r'\frac{f}{f_c} = \frac{1760}{339} \approx 5{,}20 \qquad |H| = \frac{1}{\sqrt{1 + 5{,}20^2}} \approx 0{,}189'),
                 ('tex', r'G = 20\,\log_{10} 0{,}189 \approx -14{,}5\ \mathrm{dB} \qquad \varphi = -\arctan 5{,}20 \approx -79^\circ'),
                 'Un disturbo di 0,4 V esce con un\'ampiezza di circa 0,4 · 0,189 ≈ 0,076 V.'])]))

    # Passa alto
    st.extend(sezione([
        P('4. Filtro passa alto (C in serie, R verso massa)', 'h2'),
        riquadro_formule([[r'H(f) = \frac{j\,f/f_c}{1 + j\,f/f_c}'],
                          [r'|H| = \frac{f/f_c}{\sqrt{1 + (f/f_c)^2}}', r'\varphi = 90^\circ - \arctan\frac{f}{f_c}']],
                         schema('hp')),
        sp(),
        P('È il comportamento opposto: il condensatore in serie blocca le frequenze basse (e la tensione continua) '
          'e lascia passare quelle alte. Per f ≪ f<sub>c</sub> vale |H| ≈ f/f<sub>c</sub>: +20 dB/decade salendo verso il taglio. '
          'Lo sfasamento va da +90° a 0°.'),
        sp(),
        esempio('R = 10 kΩ, C = 47 nF (f<sub>c</sub> ≈ 339 Hz), ronzio a f = 50 Hz',
                [('tex', r'\frac{f}{f_c} = \frac{50}{339} \approx 0{,}148 \qquad |H| = \frac{0{,}148}{\sqrt{1 + 0{,}148^2}} \approx 0{,}146'),
                 ('tex', r'G \approx -16{,}7\ \mathrm{dB} \qquad \varphi = 90^\circ - \arctan 0{,}148 \approx +82^\circ')])]))

    # Cascata
    st.extend(sezione([
        P('5. Celle uguali in cascata (separate da buffer)', 'h2'),
        riquadro_formule([[r'|H_{\mathrm{tot}}| = |H|^{\,n}', r'G_{\mathrm{tot}} = n \cdot G',
                           r'\mathrm{pendenza} = -20\,n\ \mathrm{dB/decade}'],
                          [r'f_{-3\,\mathrm{dB}} = f_c\,\sqrt{2^{1/n} - 1}\quad \mathrm{(passa\ basso)}',
                           r'f_{-3\,\mathrm{dB}} = \frac{f_c}{\sqrt{2^{1/n} - 1}}\quad \mathrm{(passa\ alto)}']]),
        sp(),
        P('Il buffer (inseguitore di tensione, guadagno ×1) copia la tensione senza assorbire corrente, '
          'così ogni cella lavora come se fosse da sola e i guadagni si moltiplicano. '
          'Più celle tagliano i disturbi in modo più netto, ma il taglio a −3 dB si sposta e anche il segnale utile perde un po\' di più.'),
        sp(),
        esempio('3 celle passa basso con f<sub>c</sub> = 339 Hz, disturbo a 1760 Hz',
                [('tex', r'|H_{\mathrm{tot}}| = 0{,}189^3 \approx 0{,}0067 \qquad G_{\mathrm{tot}} = 3 \cdot (-14{,}5) \approx -43{,}4\ \mathrm{dB}'),
                 ('tex', r'f_{-3\,\mathrm{dB}} = 339 \cdot \sqrt{2^{1/3} - 1} \approx 339 \cdot 0{,}510 \approx 173\ \mathrm{Hz}')])]))

    # Passa banda
    st.extend(sezione([
        P('6. Filtro passa banda (passa alto seguito da passa basso)', 'h2'),
        riquadro_formule([[r'f_L = \frac{1}{2\pi R_1 C_1}', r'f_H = \frac{1}{2\pi R_2 C_2}'],
                          [r'f_0 = \sqrt{f_L\, f_H}', r'B = f_H - f_L'],
                          [r'|H| = |H_{\mathrm{HP}}| \cdot |H_{\mathrm{LP}}|\quad \mathrm{(con\ buffer)}']],
                         schema('bp')),
        sp(),
        P('Passano le frequenze comprese tra f<sub>L</sub> (taglio inferiore) e f<sub>H</sub> (taglio superiore); '
          'serve f<sub>L</sub> &lt; f<sub>H</sub>. f<sub>0</sub> è la frequenza centrale, dove il guadagno è massimo, '
          'e B è la larghezza di banda. Senza buffer la seconda cella "carica" la prima: il guadagno massimo '
          'scende un po\' sotto 0 dB e i tagli si spostano. L\'effetto diventa trascurabile se R<sub>2</sub> ≥ 10 · R<sub>1</sub>.'),
        sp(),
        esempio('R<sub>1</sub> = 3,3 kΩ, C<sub>1</sub> = 220 nF, R<sub>2</sub> = 33 kΩ, C<sub>2</sub> = 2,2 nF',
                [('tex', r'f_L = \frac{1}{2\pi \cdot 3300 \cdot 220\cdot 10^{-9}} \approx 219\ \mathrm{Hz} \qquad f_H = \frac{1}{2\pi \cdot 33000 \cdot 2{,}2\cdot 10^{-9}} \approx 2192\ \mathrm{Hz}'),
                 ('tex', r'f_0 = \sqrt{219 \cdot 2192} \approx 693\ \mathrm{Hz} \qquad B = 2192 - 219 \approx 1973\ \mathrm{Hz}'),
                 ('tex', r'\mathrm{a}\ 1\ \mathrm{kHz}:\ |H| \approx 0{,}977 \cdot 0{,}910 \approx 0{,}889 \quad \Rightarrow \quad G \approx -1{,}0\ \mathrm{dB}')])]))

    # Bode
    st.append(KeepTogether([
        P('7. Diagrammi di Bode degli esempi', 'h2'),
        P('Asse delle frequenze logaritmico: ogni tacca principale è dieci volte la precedente. '
          'Le rette oblique lontano dal taglio hanno pendenza 20 dB/decade per ogni cella.'),
        sp(4), bode()]))

    # Scelta
    st.append(KeepTogether([
        P('8. Quale filtro scegliere', 'h2'),
        tabella([['Dove sono i disturbi', 'Filtro', 'Come scegliere la frequenza di taglio'],
                 ['Sopra il segnale utile (fruscio, armoniche acute)', 'Passa basso',
                  'f<sub>c</sub> sopra il segnale utile e sotto il primo disturbo'],
                 ['Sotto il segnale utile (ronzio di rete a 50 Hz)', 'Passa alto',
                  'f<sub>c</sub> sopra il disturbo e sotto il segnale utile'],
                 ['Sia sotto sia sopra', 'Passa banda',
                  'f<sub>L</sub> e f<sub>H</sub> ai lati del segnale utile, con f<sub>0</sub> vicino a esso'],
                 ['Molto vicini al segnale utile', 'Più celle in cascata',
                  'Con n celle la pendenza diventa 20·n dB/decade']],
                [62 * mm, 32 * mm, LARGHEZZA - 94 * mm])]))
    return st


def sezione(blocchi):
    """Tiene insieme titolo e riquadro delle formule; il resto può andare a capo pagina."""
    return [KeepTogether(blocchi[:2])] + [KeepTogether([b]) for b in blocchi[2:]]


def piede(canvas, doc):
    canvas.saveState()
    canvas.setFont('Testo', 8)
    canvas.setFillColor(C(TENUE))
    canvas.drawString(18 * mm, 10 * mm, 'Laboratorio filtri RC · formulario')
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f'pagina {doc.page}')
    canvas.restoreState()


def main():
    doc = SimpleDocTemplate(USCITA, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=16 * mm, bottomMargin=18 * mm,
                            title='Filtri RC: formulario con esempi', author='Laboratorio filtri RC')
    doc.build(contenuto(), onFirstPage=piede, onLaterPages=piede)
    print('Creato', USCITA)


if __name__ == '__main__':
    main()

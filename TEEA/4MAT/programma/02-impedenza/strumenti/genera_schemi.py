#!/usr/bin/env python3
"""
Genera gli schemi elettrici SVG della lezione LV02 (cartella ../img) con LaTeX + circuitikz,
nello stesso stile delle altre lezioni: resistori a zig-zag, morsetti A e B a pallino vuoto.

Serve una distribuzione LaTeX (TeX Live o MiKTeX) con circuitikz e il programma
pdftocairo (poppler-utils):
    python strumenti/genera_schemi.py

Le etichette sono solo simboli (R, L, C, A, B, I), quindi valgono per entrambe le lingue.
"""
import pathlib, subprocess, tempfile

QUI = pathlib.Path(__file__).resolve().parent
IMG = QUI.parent / 'img'
IMG.mkdir(exist_ok=True)

# Niente \usepackage[T1]{fontenc}: con i caratteri Computer Modern di tipo 1 le
# lettere finiscono nell'SVG come tracciati e si vedono in tutti i browser.
PREAMBOLO = r"""
\documentclass[border=6pt]{standalone}
\usepackage[siunitx, american resistors, american currents, cute inductors]{circuitikz}
\usepackage{xcolor}
\definecolor{corrente}{HTML}{B3205F}
\ctikzset{bipoles/thickness=1, current/distance=0.35}
\tikzset{every picture/.style={line width=1.3pt}}
% gli schemi orizzontali sono ingranditi (scale=2.2): sul sito si vedono alla loro misura naturale
\begin{document}
"""

# un circuito in serie tra i morsetti A e B; 'pezzi' = elenco di (bipolo, etichetta)
def serie(pezzi, x0=0.0, titolo=''):
    passo = 2.0
    x = x0
    s = rf"  \draw ({x:.2f},0) node[ocirc]{{}} node[left]{{$A$}} to[short, i>^={{\color{{corrente}}$\bar I$}}] ({x + 0.8:.2f},0)"
    x += 0.8
    for bip, et in pezzi:
        s += rf" to[{bip}, l={{${et}$}}] ({x + passo:.2f},0)"
        x += passo
    s += rf" to[short, -o] ({x + 0.6:.2f},0) node[right]{{$B$}};" + '\n'
    return s


FIGURE = {
    'serie-RL': r"\begin{circuitikz}[scale=2.2, transform shape]" + '\n' + serie([('R', 'R'), ('L', 'L')]) + r"\end{circuitikz}",
    'serie-RC': r"\begin{circuitikz}[scale=2.2, transform shape]" + '\n' + serie([('R', 'R'), ('C', 'C')]) + r"\end{circuitikz}",
    'serie-RLC': r"\begin{circuitikz}[scale=2.2, transform shape]" + '\n' + serie([('R', 'R'), ('L', 'L'), ('C', 'C')]) + r"\end{circuitikz}",
}


# due rami in parallelo tra i morsetti A (sopra) e B (sotto); 'rami' = [(bipolo, etichetta, corrente)]
def parallelo(rami):
    s = r"  \draw (0,3) node[ocirc]{} node[left]{$A$} to[short, i>^={\color{corrente}$\bar I$}] (1.6,3);" + '\n'
    s += r"  \draw (0,0) node[ocirc]{} node[left]{$B$} -- (1.6,0);" + '\n'
    x = 1.6
    for k, (bip, et, cor) in enumerate(rami):
        nodo_su = 'circ' if k < len(rami) - 1 else 'short'
        s += (rf"  \draw ({x:.2f},3) to[short, i>_={{\color{{corrente}}${cor}$}}] ({x:.2f},2.3) "
              rf"to[{bip}, l={{${et}$}}] ({x:.2f},0.3) -- ({x:.2f},0);" + '\n')
        if k < len(rami) - 1:
            s += rf"  \draw ({x:.2f},3) node[circ]{{}} -- ({x + 2.2:.2f},3); \draw ({x:.2f},0) node[circ]{{}} -- ({x + 2.2:.2f},0);" + '\n'
        x += 2.2
    return s


FIGURE['parallelo-RL'] = r"\begin{circuitikz}[scale=2.2, transform shape]" + '\n' + parallelo([('R', 'R', r'\bar I_R'), ('L', 'L', r'\bar I_L')]) + r"\end{circuitikz}"
FIGURE['parallelo-RC'] = r"\begin{circuitikz}[scale=2.2, transform shape]" + '\n' + parallelo([('R', 'R', r'\bar I_R'), ('C', 'C', r'\bar I_C')]) + r"\end{circuitikz}"


def main():
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        for nome, corpo in FIGURE.items():
            tex = tmp / f'{nome}.tex'
            tex.write_text(PREAMBOLO + corpo + '\n\\end{document}\n', encoding='utf-8')
            r = subprocess.run(['pdflatex', '-interaction=nonstopmode', '-halt-on-error', tex.name],
                               cwd=tmp, capture_output=True, text=True)
            if r.returncode:
                print(r.stdout[-2500:]); raise SystemExit(f'errore LaTeX in {nome}')
            subprocess.run(['pdftocairo', '-svg', f'{nome}.pdf', str(IMG / f'{nome}.svg')], cwd=tmp, check=True)
            print('creato', f'{nome}.svg')


if __name__ == '__main__':
    main()

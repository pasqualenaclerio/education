#!/usr/bin/env python3
"""
Genera le figure SVG della spiegazione (cartella ../img) con LaTeX + circuitikz,
nello stesso stile degli schemi delle verifiche: alimentazione come barra in alto,
resistenze a zig-zag, massa a triangolino vuoto.

Serve una distribuzione LaTeX (TeX Live o MiKTeX) con circuitikz e il programma
pdftocairo (poppler-utils):
    python strumenti/genera_figure.py
"""
import pathlib, subprocess, tempfile

QUI = pathlib.Path(__file__).resolve().parent
IMG = QUI.parent / 'img'
IMG.mkdir(exist_ok=True)

# Niente \usepackage[T1]{fontenc}: con i caratteri Computer Modern di tipo 1 le
# lettere finiscono nell'SVG come tracciati e si vedono in tutti i browser.
PREAMBOLO = r"""
\documentclass[border=6pt]{standalone}
\usepackage[siunitx, american resistors, american currents]{circuitikz}
\usetikzlibrary{arrows.meta}
\ctikzset{bipoles/thickness=1, current/distance=0.35}
\tikzset{every picture/.style={line width=0.7pt}}
% alimentazione: barra orizzontale con l'etichetta sopra
\newcommand{\rail}[2]{\draw[line width=1.2pt] ($#1+(-0.6,0)$) -- ($#1+(0.6,0)$); \node[above] at #1 {#2};}
\usetikzlibrary{calc}
\begin{document}
"""

FIGURE = {

# 1) partitore di tensione (valori dell'esempio)
'partitore-tensione': r"""
\begin{circuitikz}
  \rail{(0,4.5)}{$V = +12\,\mathrm{V}$}
  \draw (0,4.5) -- (0,4.2) to[R, l_={$R_1 = 1{,}8\,\mathrm{k\Omega}$}, i>^={$I$}] (0,2.2)
        to[short, *-] (0,2.2) to[R, l_={$R_2 = 1{,}2\,\mathrm{k\Omega}$}] (0,0.2) -- (0,0) node[sground]{};
  \draw (0,2.2) to[short, -o] (1.6,2.2) node[right]{$X$};
  \draw[-{Latex[length=2mm]}] (2.6,0.1) -- node[right]{$V_X = V_2$} (2.6,2.1);
  \draw[-{Latex[length=2mm]}] (2.6,2.3) -- node[right]{$V_1$} (2.6,4.2);
\end{circuitikz}
""",

# 2) partitore di corrente (valori dell'esempio)
'partitore-corrente': r"""
\begin{circuitikz}
  \draw (0,4.4) node[ocirc]{} to[short, i>^={$I = 20\,\mathrm{mA}$}] (0,3.2);
  \draw (-1.6,3.2) -- (1.6,3.2);
  \draw (0,3.2) node[circ]{};
  \draw (-1.6,3.2) to[short, i>^={$I_1$}] (-1.6,2.6) to[R, l_={$R_1 = 1\,\mathrm{k\Omega}$}] (-1.6,0.6) -- (-1.6,0.3) -- (1.6,0.3);
  \draw (1.6,3.2) to[short, i>_={$I_2$}] (1.6,2.6) to[R, l^={$R_2 = 1{,}5\,\mathrm{k\Omega}$}] (1.6,0.6) -- (1.6,0.3);
  \draw (0,0.3) node[circ]{} -- (0,0.1) node[sground]{};
\end{circuitikz}
""",

# 3) potenziometro come partitore regolabile
'potenziometro': r"""
\begin{circuitikz}
  \rail{(0,4.5)}{$V$}
  \draw (0,4.5) -- (0,4.0) to[pR, n=pot, l_={$R_P$}] (0,1.0) -- (0,0.6) node[sground]{};
  \draw (pot.wiper) to[short, -o] (1.8,2.5) node[right]{$X$};
  \draw[-{Latex[length=2mm]}] (2.8,0.7) -- node[right]{$V_X$} (2.8,2.4);
\end{circuitikz}
""",

# 4) dove mettere il potenziometro: (a) al posto di R2, (b) al posto di R1
'potenziometro-posizione': r"""
\begin{circuitikz}
  % (a) potenziometro in basso
  \node[font=\bfseries] at (0,5.4) {(a)};
  \rail{(0,4.5)}{$V$}
  \draw (0,4.5) -- (0,4.2) to[R, l_={$R_1$}] (0,2.2) to[short, *-] (0,2.2)
        to[vR, l_={$R_2$}] (0,0.2) -- (0,0) node[sground]{};
  \draw (0,2.2) to[short, -o] (1.4,2.2) node[right]{$X$};
  % (b) potenziometro in alto
  \begin{scope}[xshift=5.2cm]
  \node[font=\bfseries] at (0,5.4) {(b)};
  \rail{(0,4.5)}{$V$}
  \draw (0,4.5) -- (0,4.2) to[vR, l_={$R_1$}] (0,2.2) to[short, *-] (0,2.2)
        to[R, l_={$R_2$}] (0,0.2) -- (0,0) node[sground]{};
  \draw (0,2.2) to[short, -o] (1.4,2.2) node[right]{$X$};
  \end{scope}
\end{circuitikz}
""",
}


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

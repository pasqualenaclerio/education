#!/usr/bin/env python3
"""
Genera le figure SVG della spiegazione (cartella ../img) con LaTeX + circuitikz,
nello stesso stile delle lezioni precedenti: alimentazione come barra in alto,
resistenze a zig-zag, massa a triangolino vuoto.

Le etichette usano solo simboli e numeri, quindi valgono per la pagina italiana e
per quella inglese. Colori: tensione blu, corrente magenta, resistenza verde.

Serve una distribuzione LaTeX (TeX Live o MiKTeX) con circuitikz e pgfplots e il
programma pdftocairo (poppler-utils):
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
\usepackage{pgfplots}
\pgfplotsset{compat=1.17}
\usetikzlibrary{arrows.meta, calc}
\definecolor{tensione}{HTML}{2152C0}
\definecolor{corrente}{HTML}{B3205F}
\definecolor{resistenza}{HTML}{0B7A62}
\definecolor{inchiostro}{HTML}{1B2936}
\definecolor{tenue}{HTML}{586976}
\definecolor{rame}{HTML}{C46A2B}
\definecolor{alluminio}{HTML}{9AA5AE}
\ctikzset{bipoles/thickness=1, current/distance=0.35}
\tikzset{every picture/.style={line width=0.7pt, color=inchiostro}}
% alimentazione: barra orizzontale con l'etichetta sopra
\newcommand{\rail}[2]{\draw[line width=1.2pt] ($#1+(-0.6,0)$) -- ($#1+(0.6,0)$); \node[above] at #1 {#2};}
\begin{document}
"""

FIGURE = {

# 1) sezioni in scala: rame 2,5 mm^2 e alluminio 4 mm^2 (stessa R)
'sezioni-rame-alluminio': r"""
\begin{tikzpicture}[scale=1.6]
  % rame: d = 1,78 mm  -> raggio 0,89
  \fill[rame!35] (0,0) circle (0.892);
  \draw[rame, line width=1.3pt] (0,0) circle (0.892);
  \node[rame!70!black, font=\bfseries\Large] at (0,0) {Cu};
  \draw[{Latex[length=2mm]}-{Latex[length=2mm]}] (-0.892,-1.15) -- node[below]{$d \approx 1{,}78\,\mathrm{mm}$} (0.892,-1.15);
  \node at (0,1.25) {$S = 2{,}5\,\mathrm{mm^2}$};
  % alluminio: d = 2,26 mm -> raggio 1,128
  \begin{scope}[xshift=3.3cm]
  \fill[alluminio!40] (0,0) circle (1.128);
  \draw[alluminio!80!black, line width=1.3pt] (0,0) circle (1.128);
  \node[alluminio!50!black, font=\bfseries\Large] at (0,0) {Al};
  \draw[{Latex[length=2mm]}-{Latex[length=2mm]}] (-1.128,-1.38) -- node[below]{$d \approx 2{,}26\,\mathrm{mm}$} (1.128,-1.38);
  \node at (0,1.48) {$S = 4\,\mathrm{mm^2}$};
  \end{scope}
  \node[resistenza, font=\large] at (1.65,-2.25) {$L = 100\,\mathrm{m} \qquad R = 0{,}7\,\Omega$};
\end{tikzpicture}
""",

# 2) pista di un circuito stampato: vista della pista e sezione rettangolare w x t
'pista-pcb': r"""
\begin{tikzpicture}[scale=1.1]
  % basetta
  \fill[green!25!gray!35] (-0.4,-0.3) -- (5.6,-0.3) -- (6.6,0.9) -- (0.6,0.9) -- cycle;
  % pista (parallelepipedo)
  \coordinate (A) at (0,0); \coordinate (B) at (5,0);
  \coordinate (C) at (5,0.18); \coordinate (D) at (0,0.18);
  \coordinate (o) at (0.6,0.6);
  \fill[rame!45] (D) -- (C) -- ($(C)+(o)$) -- ($(D)+(o)$) -- cycle;
  \fill[rame!75] (A) -- (B) -- (C) -- (D) -- cycle;
  \fill[rame!90] (B) -- (C) -- ($(C)+(o)$) -- ($(B)+(o)$) -- cycle;
  \draw[rame!60!black, line width=0.8pt] (A) -- (B) -- (C) -- (D) -- cycle
        (D) -- ($(D)+(o)$) -- ($(C)+(o)$) -- (C) (B) -- ($(B)+(o)$) -- ($(C)+(o)$);
  \draw[{Latex[length=2mm]}-{Latex[length=2mm]}] (0,-0.6) -- node[below]{$L$} (5,-0.6);
  % sezione ingrandita
  \begin{scope}[xshift=8.2cm, yshift=0.1cm]
    \fill[rame!75] (0,0) rectangle (2.6,0.7);
    \draw[rame!60!black, line width=1pt] (0,0) rectangle (2.6,0.7);
    \draw[{Latex[length=2mm]}-{Latex[length=2mm]}] (0,-0.35) -- node[below]{$w$} (2.6,-0.35);
    \draw[{Latex[length=2mm]}-{Latex[length=2mm]}] (2.95,0) -- node[right]{$t$} (2.95,0.7);
    \node[resistenza, font=\large] at (1.3,1.25) {$S = w \cdot t$};
  \end{scope}
  \draw[tenue, dashed, -{Latex[length=2mm]}] (5.9,0.45) -- (7.9,0.45);
\end{tikzpicture}
""",

# 3) resistenza in funzione della temperatura (bobina in rame, R0 = 10 ohm a 20 gradi)
'resistenza-temperatura': r"""
\begin{tikzpicture}
\begin{axis}[width=8.5cm, height=6cm, xmin=0, xmax=100, ymin=8, ymax=14,
  xlabel={$T\ [^\circ\mathrm{C}]$}, ylabel={$R\ [\Omega]$},
  axis lines=left, xtick={0,20,40,60,80,100}, ytick={8,9,...,14},
  grid=major, grid style={tenue!25}, tick label style={font=\small}]
  \addplot[resistenza, line width=1.6pt, domain=0:100] {10*(1+0.0039*(x-20))};
  \addplot[only marks, mark=*, mark size=2.6pt, resistenza] coordinates {(20,10) (80,12.34)};
  \draw[tenue, dashed] (axis cs:20,8) -- (axis cs:20,10) -- (axis cs:0,10);
  \draw[tenue, dashed] (axis cs:80,8) -- (axis cs:80,12.34) -- (axis cs:0,12.34);
  \node[anchor=north west, font=\small] at (axis cs:22,9.95) {$R_0 = 10\,\Omega$};
  \node[anchor=south east, font=\small] at (axis cs:80,12.4) {$R = 12{,}34\,\Omega$};
\end{axis}
\end{tikzpicture}
""",

# 4) il ciclo effetto Joule -> temperatura -> resistenza -> potenza
'ciclo-joule': r"""
\begin{tikzpicture}[font=\large,
  box/.style={draw=inchiostro, line width=1pt, rounded corners=3pt, fill=white,
              minimum width=2.6cm, minimum height=1.05cm, align=center},
  frec/.style={-{Latex[length=3mm]}, line width=1.4pt}]
  \node[box, draw=corrente]   (I) at (0,2.2)   {\color{corrente}$I$};
  \node[box, fill=rame!15]    (P) at (4.4,2.2) {$P = R \cdot I^2$};
  \node[box, fill=red!12]     (T) at (4.4,0)   {$T\ \uparrow$};
  \node[box, draw=resistenza] (R) at (0,0)     {\color{resistenza}$R(T)\ \uparrow$};
  \draw[frec] (I) -- (P);
  \draw[frec] (P) -- node[right]{$Q = P \cdot \Delta t$} (T);
  \draw[frec] (T) -- (R);
  \draw[frec, dashed] (R) -- (P);
\end{tikzpicture}
""",

# 5) linea + carico come partitore di tensione
'linea-carico': r"""
\begin{circuitikz}
  \rail{(0,4.6)}{$V = +12\,\mathrm{V}$}
  \draw (0,4.6) -- (0,4.3) to[R, l_={$R_{L} = 0{,}1\,\Omega$}, i>^={$I$}] (0,2.3)
        to[short, *-] (0,2.3) to[R, l_={$R_{C} = 2{,}3\,\Omega$}] (0,0.3) -- (0,0) node[sground]{};
  \draw (0,2.3) to[short, -o] (1.6,2.3) node[right]{$X$};
  \draw[tensione, -{Latex[length=2mm]}] (2.7,0.2) -- node[right]{$V_C$} (2.7,2.2);
  \draw[tensione, -{Latex[length=2mm]}] (2.7,2.4) -- node[right]{$V_L$} (2.7,4.3);
\end{circuitikz}
""",

# 6) due carichi in parallelo: partitore di corrente
'carichi-parallelo': r"""
\begin{circuitikz}
  \draw (0,4.4) node[ocirc]{} to[short, i>^={$I = 3\,\mathrm{A}$}] (0,3.2);
  \draw (-1.6,3.2) -- (1.6,3.2);
  \draw (0,3.2) node[circ]{};
  \draw (-1.6,3.2) to[short, i>^={$I_1$}] (-1.6,2.6) to[R, l_={$R_1 = 6\,\Omega$}] (-1.6,0.6) -- (-1.6,0.3) -- (1.6,0.3);
  \draw (1.6,3.2) to[short, i>_={$I_2$}] (1.6,2.6) to[R, l^={$R_2 = 12\,\Omega$}] (1.6,0.6) -- (1.6,0.3);
  \draw (0,0.3) node[circ]{} -- (0,0.1) node[sground]{};
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

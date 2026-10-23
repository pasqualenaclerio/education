#!/usr/bin/env python3
"""
Genera le figure SVG della spiegazione (cartella ../img) con LaTeX + circuitikz.

Le etichette usano solo simboli (V, I, R, E…), quindi valgono per la pagina
italiana e per quella inglese. Colori come nella web app «Laboratorio legge di Ohm»:
tensione blu, corrente magenta, resistenza verde.

Per rigenerarle serve una distribuzione LaTeX (TeX Live o MiKTeX) con i pacchetti
circuitikz e pgfplots, più il programma pdftocairo (pacchetto poppler-utils):
    python strumenti/genera_figure.py
"""
import pathlib, subprocess, tempfile, shutil

QUI = pathlib.Path(__file__).resolve().parent
IMG = QUI.parent / 'img'
IMG.mkdir(exist_ok=True)

PREAMBOLO = r"""
\documentclass[border=4pt]{standalone}
\usepackage[siunitx, american voltages, american currents, american resistors]{circuitikz}
\usepackage{pgfplots}
\pgfplotsset{compat=1.17}
\usetikzlibrary{arrows.meta, calc, shapes.geometric}
\definecolor{tensione}{HTML}{2152C0}
\definecolor{corrente}{HTML}{B3205F}
\definecolor{resistenza}{HTML}{0B7A62}
\definecolor{inchiostro}{HTML}{1B2936}
\definecolor{tenue}{HTML}{586976}
\ctikzset{bipoles/thickness=1.2, current/distance=0.5}
% strumento di misura: cerchio con la lettera (A = amperometro, V = voltmetro)
\tikzset{metro/.style={circle, draw=inchiostro, fill=white, line width=1.1pt, minimum size=0.95cm, inner sep=0pt,
                       font=\sffamily\bfseries\Large}}
% generatore come nella web app: cerchio attraversato dal filo, segno + in alto a sinistra
\newcommand{\piu}[1]{\node[tensione, font=\small\bfseries] at #1 {$+$};}
\tikzset{every picture/.style={line width=0.9pt, color=inchiostro}}
\begin{document}
"""

FIGURE = {

# 1) circuito elementare: generatore + resistenza
'circuito-base': r"""
\begin{circuitikz}[scale=1.1]
  \draw (0,0) to[european voltage source, l_={\color{tensione}$V$}, color=tensione] (0,3)
        to[short, i>^={\color{corrente}$I$}, color=inchiostro] (3.5,3)
        to[R, l_={\color{resistenza}$R$}, color=resistenza] (3.5,0)
        -- (0,0);
  \piu{(-0.36,2.02)}
  \draw (0,0) node[sground]{};
  \draw[corrente, -{Latex[length=2.5mm]}, line width=1pt] (1.25,1.9) arc[start angle=150, end angle=-150, radius=0.6];
\end{circuitikz}
""",

# 2) misure: amperometro in serie, voltmetro in parallelo
'misure': r"""
\begin{circuitikz}[scale=1.1]
  \draw (0,0) to[european voltage source, l_={\color{tensione}$V$}, color=tensione] (0,3)
        -- (1.75,3) node[metro, text=corrente]{A} -- (3.5,3)
        to[R, l_={\color{resistenza}$R$}, color=resistenza, *-*] (3.5,0)
        -- (0,0);
  \draw (3.5,3) -- (5.5,3) -- (5.5,1.5) node[metro, text=tensione]{V} -- (5.5,0) -- (3.5,0);
  \piu{(-0.36,2.02)}
  \draw (0,0) node[sground]{};
\end{circuitikz}
""",

# 3) generatore ideale e reale
'generatori': r"""
\begin{circuitikz}[scale=1.05]
  % ideale
  \draw (0,0) to[european voltage source, l_={\color{tensione}$E$}, color=tensione] (0,3) -- (2,3) to[short, -o] (2.4,3);
  \draw (0,0) -- (2,0) to[short, -o] (2.4,0);
  \draw[tensione, -{Latex[length=2.5mm]}] (2.9,0.2) -- node[right]{$V = E$} (2.9,2.8);
  \piu{(-0.36,2.02)}
  \node[tensione, font=\scriptsize] at (2.4,3.35) {$+$};
  \node[tensione, font=\scriptsize] at (2.4,-0.35) {$-$};
  % reale
  \begin{scope}[xshift=6cm]
  \draw[dashed, tenue, line width=0.6pt] (-0.9,-0.5) rectangle (2.4,3.6);
  \draw (0,0) to[european voltage source, l_={\color{tensione}$E$}, color=tensione] (0,3)
        to[R, l^={\color{resistenza}$R_i$}, color=resistenza] (2.4,3) to[short, -o, i>^={\color{corrente}$I$}] (3.4,3);
  \draw (0,0) -- (2.4,0) to[short, -o] (3.4,0);
  \draw[tensione, -{Latex[length=2.5mm]}] (3.9,0.2) -- node[right]{$V = E - R_i\, I$} (3.9,2.8);
  \piu{(-0.36,2.02)}
  \end{scope}
\end{circuitikz}
""",

# 4) resistenza di un filo: R = rho L / S
'filo': r"""
\begin{tikzpicture}[scale=1.2]
  \fill[resistenza!12] (0,-0.6) -- (5,-0.6) arc[start angle=-90, end angle=90, x radius=0.25, y radius=0.6] -- (0,0.6);
  \draw[resistenza, line width=1.1pt] (0,0.6) -- (5,0.6) (0,-0.6) -- (5,-0.6);
  \draw[resistenza, line width=1.1pt] (5,-0.6) arc[start angle=-90, end angle=90, x radius=0.25, y radius=0.6];
  \fill[resistenza!35] (0,0) ellipse[x radius=0.25, y radius=0.6];
  \draw[resistenza, line width=1.1pt] (0,0) ellipse[x radius=0.25, y radius=0.6];
  \node[resistenza] at (-0.75,0) {$S$};
  \draw[{Latex[length=2.5mm]}-{Latex[length=2.5mm]}] (0,-1.05) -- node[below]{$L$} (5,-1.05);
  \node at (2.5,0) {$\rho$};
\end{tikzpicture}
""",

# 5) triangolo della legge di Ohm
'triangolo-ohm': r"""
\begin{tikzpicture}[scale=1.1]
  \draw[line width=1.4pt, line join=round] (0,0) -- (4,0) -- (2,3.2) -- cycle;
  \draw[line width=1pt] (0.9,1.45) -- (3.1,1.45);
  \draw[line width=1pt] (2,0) -- (2,1.45);
  \node[tensione, font=\Huge\bfseries] at (2,2.15) {$V$};
  \node[resistenza, font=\Huge\bfseries] at (1.3,0.65) {$R$};
  \node[corrente, font=\Huge\bfseries] at (2.7,0.65) {$I$};
\end{tikzpicture}
""",

# 6) caratteristica tensione-corrente per tre resistenze
'caratteristica': r"""
\begin{tikzpicture}
\begin{axis}[width=10cm, height=6.5cm, axis lines=left, xmin=0, xmax=16.5, ymin=0, ymax=13.5, clip=false,
             xlabel={\color{tensione}$V$ [V]}, ylabel={\color{corrente}$I$ [mA]},
             xtick={0,2,...,12}, ytick={0,2,...,12}, grid=major, grid style={tenue!25},
             every axis plot/.append style={line width=1.6pt, domain=0:12, samples=2},
             x label style={at={(axis description cs:1,0)}, anchor=north east},
             y label style={at={(axis description cs:0,1)}, anchor=south west, rotate=-90}]
  \addplot[resistenza] {x/1};      \node[resistenza, anchor=west] at (axis cs:12.3,12) {$R = 1\,\mathrm{k\Omega}$};
  \addplot[resistenza!70!black, dashed] {x/2};  \node[resistenza!70!black, anchor=west] at (axis cs:12.3,6) {$R = 2\,\mathrm{k\Omega}$};
  \addplot[resistenza!55, densely dotted] {x/4.7}; \node[resistenza!55, anchor=west] at (axis cs:12.3,2.55) {$R = 4{,}7\,\mathrm{k\Omega}$};
\end{axis}
\end{tikzpicture}
""",
# 7) resistenze in serie e in parallelo
'serie-parallelo': r"""
\begin{circuitikz}[scale=1]
  \draw (0,0) node[ocirc]{} node[left]{A} -- (0.3,0)
        to[R, l=\color{resistenza}$R_1$, color=resistenza] (2.3,0)
        to[R, l=\color{resistenza}$R_2$, color=resistenza] (4.3,0)
        to[R, l=\color{resistenza}$R_3$, color=resistenza] (6.3,0) -- (6.6,0) node[ocirc]{} node[right]{B};
  \draw[corrente, -{Latex[length=2.5mm]}, line width=1pt] (0.35,0.55) -- node[above]{$I$} (1.0,0.55);
  \begin{scope}[xshift=8.6cm]
  \draw (0,0) node[ocirc]{} node[left]{A} -- (0.6,0);
  \draw (0.6,1.6) -- (0.6,-1.6) (3.0,1.6) -- (3.0,-1.6);
  \draw (0.6,1.6) to[R, l=\color{resistenza}$R_1$, color=resistenza] (3.0,1.6);
  \draw (0.6,0) to[R, l=\color{resistenza}$R_2$, color=resistenza] (3.0,0);
  \draw (0.6,-1.6) to[R, l=\color{resistenza}$R_3$, color=resistenza] (3.0,-1.6);
  \draw (3.0,0) -- (3.6,0) node[ocirc]{} node[right]{B};
  \fill (0.6,0) circle (2pt) (3.0,0) circle (2pt);
  \end{scope}
\end{circuitikz}
""",

# 8) esempio 1: R1 in serie al parallelo R2 // R3 e riduzione passo passo
'riduzione-1': r"""
\begin{circuitikz}[scale=0.9, transform shape]
  \newcommand{\gen}[1]{\draw (#1,0) to[european voltage source, l_={\color{tensione}$12\,\mathrm{V}$}, color=tensione] (#1,3); \piu{(#1-0.36,2.02)} \draw (#1,0) node[sground]{};}
  \newcommand{\passo}[2]{\node[draw, circle, inner sep=1.5pt, font=\small\bfseries] at #1 {#2};}
  % (1) circuito di partenza
  \passo{(-0.9,3.6)}{1}
  \gen{0}
  \draw (0,3) to[short, i>^={\color{corrente}$I$}] (0.6,3) to[R, l={\color{resistenza}$R_1 = 1\,\mathrm{k\Omega}$}, color=resistenza] (2.9,3) -- (5.0,3);
  \draw (3.4,3) to[R, l_={\color{resistenza}$R_2 = 3\,\mathrm{k\Omega}$}, color=resistenza, *-*] (3.4,0);
  \draw (5.0,3) to[R, l^={\color{resistenza}$R_3 = 6\,\mathrm{k\Omega}$}, color=resistenza] (5.0,0) -- (0,0);
  % (2) parallelo sostituito
  \begin{scope}[xshift=9.6cm]
  \passo{(-0.9,3.6)}{2}
  \gen{0}
  \draw (0,3) -- (0.6,3) to[R, l={\color{resistenza}$R_1 = 1\,\mathrm{k\Omega}$}, color=resistenza] (2.9,3) -- (3.4,3)
        to[R, l^={\color{resistenza}$R_{23} = 2\,\mathrm{k\Omega}$}, color=resistenza] (3.4,0) -- (0,0);
  \end{scope}
  % (3) resistenza equivalente
  \begin{scope}[xshift=17.2cm]
  \passo{(-0.9,3.6)}{3}
  \gen{0}
  \draw (0,3) -- (2.2,3) to[R, l^={\color{resistenza}$R_{eq} = 3\,\mathrm{k\Omega}$}, color=resistenza] (2.2,0) -- (0,0);
  \end{scope}
\end{circuitikz}
""",

# 9) esempio 2: R1 in serie a [R2 // (R3 + R4)], riduzione in quattro passi (2 righe)
'riduzione-2': r"""
\begin{circuitikz}[scale=0.9, transform shape]
  \newcommand{\gen}[1]{\draw (#1,0) to[european voltage source, l_={\color{tensione}$24\,\mathrm{V}$}, color=tensione] (#1,4); \piu{(#1-0.36,2.52)} \draw (#1,0) node[sground]{};}
  \newcommand{\passo}[2]{\node[draw, circle, inner sep=1.5pt, font=\small\bfseries] at #1 {#2};}
  % (1) di partenza
  \passo{(-0.9,4.6)}{1}
  \gen{0}
  \draw (0,4) to[short, i>^={\color{corrente}$I$}] (0.6,4) to[R, l={\color{resistenza}$R_1 = 2\,\mathrm{k\Omega}$}, color=resistenza] (2.9,4) -- (5.0,4);
  \draw (3.4,4) to[R, l_={\color{resistenza}$R_2 = 6\,\mathrm{k\Omega}$}, color=resistenza, *-*] (3.4,0);
  \draw (5.0,4) to[R, l^={\color{resistenza}$R_3 = 1\,\mathrm{k\Omega}$}, color=resistenza] (5.0,2)
        to[R, l^={\color{resistenza}$R_4 = 2\,\mathrm{k\Omega}$}, color=resistenza] (5.0,0) -- (0,0);
  % (2) serie R3 + R4
  \begin{scope}[xshift=9.6cm]
  \passo{(-0.9,4.6)}{2}
  \gen{0}
  \draw (0,4) -- (0.6,4) to[R, l={\color{resistenza}$R_1 = 2\,\mathrm{k\Omega}$}, color=resistenza] (2.9,4) -- (5.0,4);
  \draw (3.4,4) to[R, l_={\color{resistenza}$R_2 = 6\,\mathrm{k\Omega}$}, color=resistenza, *-*] (3.4,0);
  \draw (5.0,4) to[R, l^={\color{resistenza}$R_{34} = 3\,\mathrm{k\Omega}$}, color=resistenza] (5.0,0) -- (0,0);
  \end{scope}
  % (3) parallelo R2 // R34
  \begin{scope}[yshift=-6.4cm]
  \passo{(-0.9,4.6)}{3}
  \gen{0}
  \draw (0,4) -- (0.6,4) to[R, l={\color{resistenza}$R_1 = 2\,\mathrm{k\Omega}$}, color=resistenza] (2.9,4) -- (3.4,4)
        to[R, l^={\color{resistenza}$R_{P} = 2\,\mathrm{k\Omega}$}, color=resistenza] (3.4,0) -- (0,0);
  \end{scope}
  % (4) equivalente
  \begin{scope}[xshift=9.6cm, yshift=-6.4cm]
  \passo{(-0.9,4.6)}{4}
  \gen{0}
  \draw (0,4) -- (2.2,4) to[R, l^={\color{resistenza}$R_{eq} = 4\,\mathrm{k\Omega}$}, color=resistenza] (2.2,0) -- (0,0);
  \end{scope}
\end{circuitikz}
""",

# 10) solo due resistenze in serie con il generatore
'serie-generatore': r"""
\begin{circuitikz}[scale=1]
  \draw (0,0) to[european voltage source, l^={\color{tensione}$V = 12\,\mathrm{V}$}, color=tensione] (0,3.6);
  \piu{(0.36,2.32)} \draw (0,0) node[sground]{};
  \draw (0,3.6) to[short, i>^={\color{corrente}$I = I_1 = I_2$}] (1.0,3.6)
        to[R, l_={\color{resistenza}$R_1 = 2\,\mathrm{k\Omega}$}, color=resistenza] (3.6,3.6) -- (4.4,3.6)
        to[R, l_={\color{resistenza}$R_2 = 4\,\mathrm{k\Omega}$}, color=resistenza] (4.4,0) -- (0,0);
  \draw[tensione, -{Latex[length=2.5mm]}] (3.5,4.4) -- node[above]{$V_1$} (1.1,4.4);
  \draw[tensione, -{Latex[length=2.5mm]}] (5.2,0.6) -- node[right]{$V_2$} (5.2,3.0);
\end{circuitikz}
""",

'parallelo-generatore': r"""
\begin{circuitikz}[scale=1]
  \draw (0,0) to[european voltage source, l^={\color{tensione}$V = 12\,\mathrm{V}$}, color=tensione] (0,3.6);
  \piu{(0.36,2.32)} \draw (0,0) node[sground]{};
  \draw (0,3.6) to[short, i>^={\color{corrente}$I$}] (2.6,3.6) -- (5.0,3.6);
  \draw (2.6,3.6) to[short, *-, i>_={\color{corrente}$I_1$}] (2.6,3.0)
        to[R, l_={\color{resistenza}$R_1 = 3\,\mathrm{k\Omega}$}, color=resistenza] (2.6,0.6) to[short, -*] (2.6,0);
  \draw (5.0,3.6) to[short, i>^={\color{corrente}$I_2$}] (5.0,3.0)
        to[R, l^={\color{resistenza}$R_2 = 6\,\mathrm{k\Omega}$}, color=resistenza] (5.0,0.6) -- (5.0,0) -- (0,0);
  \draw[tensione, -{Latex[length=2.5mm]}] (7.4,0.4) -- node[right]{$V_1 = V_2 = V$} (7.4,3.2);
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

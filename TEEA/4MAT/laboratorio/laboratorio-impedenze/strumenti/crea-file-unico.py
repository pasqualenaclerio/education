#!/usr/bin/env python3
"""
Crea una versione "a file unico" del laboratorio.

Unisce index.html, tutti i file CSS e JavaScript, l'icona e (se c'è) il logo
in un solo file HTML, comodo da caricare su Classroom, Moodle, una chiavetta
o da pubblicare come pagina web.

Uso, dalla cartella del progetto:
    python3 strumenti/crea-file-unico.py
Il risultato va in file-unico/laboratorio-impedenze.html
"""
import base64, re, pathlib

BASE = pathlib.Path(__file__).resolve().parent.parent
html = (BASE / 'index.html').read_text(encoding='utf-8')

def css(m):
    return '<style>\n' + (BASE / m.group(1)).read_text(encoding='utf-8') + '\n</style>'

def js(m):
    codice = (BASE / m.group(1)).read_text(encoding='utf-8').replace('</script', '<\\/script')
    return '<script>\n' + codice + '\n</script>'

def data_uri(percorso, tipo):
    return f'data:{tipo};base64,' + base64.b64encode((BASE / percorso).read_bytes()).decode()

html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', css, html)
html = re.sub(r'<script src="(js/[^"]+)"></script>', js, html)
html = html.replace('href="assets/favicon.svg"', 'href="' + data_uri('assets/favicon.svg', 'image/svg+xml') + '"')

logo = BASE / 'assets' / 'logo-pn.png'
if logo.exists():
    html = html.replace('src="assets/logo-pn.png"', 'src="' + data_uri('assets/logo-pn.png', 'image/png') + '"')
else:
    html = re.sub(r'\s*<img src="assets/logo-pn.png"[^>]*>', '', html)

uscita = BASE / 'file-unico' / 'laboratorio-impedenze.html'
uscita.parent.mkdir(exist_ok=True)
uscita.write_text(html, encoding='utf-8')
print('Creato', uscita, f'({len(html) // 1024} kB)')

#!/usr/bin/env python3
"""
Crea una versione "a file unico" del laboratorio.

Unisce index.html, tutti i file CSS e JavaScript e l'icona in un solo file HTML,
comodo da caricare su Google Classroom, Moodle, una chiavetta o da inviare per email.

Uso (dalla cartella principale del progetto):
    python3 strumenti/crea-file-unico.py

Il risultato viene salvato in: file-unico/laboratorio-corrente-alternata.html
"""
import base64
import re
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
USCITA = RADICE / "file-unico" / "laboratorio-corrente-alternata.html"


def leggi(percorso):
    return (RADICE / percorso).read_text(encoding="utf-8")


def main():
    html = leggi("index.html")

    # Fogli di stile locali -> <style>
    def css(m):
        return "<style>\n/* " + m.group(1) + " */\n" + leggi(m.group(1)) + "\n</style>"
    html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', css, html)

    # Script locali -> <script> in linea
    def js(m):
        return "<script>\n/* " + m.group(1) + " */\n" + leggi(m.group(1)) + "\n</script>"
    html = re.sub(r'<script src="(js/[^"]+)"></script>', js, html)

    # Icona -> data URI
    def icona(m):
        dati = base64.b64encode((RADICE / m.group(1)).read_bytes()).decode("ascii")
        return f'<link rel="icon" href="data:image/svg+xml;base64,{dati}" type="image/svg+xml">'
    html = re.sub(r'<link rel="icon" href="(assets/[^"]+)" type="image/svg\+xml">', icona, html)

    USCITA.parent.mkdir(exist_ok=True)
    USCITA.write_text(html, encoding="utf-8")
    print(f"Creato: {USCITA.relative_to(RADICE)} ({USCITA.stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()

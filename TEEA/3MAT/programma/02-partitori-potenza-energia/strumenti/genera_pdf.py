#!/usr/bin/env python3
"""
Genera i PDF della spiegazione partendo dalle pagine del sito:

    index.md     ->  pdf/02-partitori-potenza-energia.pdf
    index.en.md  ->  pdf/02-dividers-power-energy.pdf

Nel PDF finisce solo il testo compreso tra <!-- PDF:INIZIO --> e <!-- PDF:FINE -->,
quindi basta modificare la pagina .md e rilanciare lo script: PDF e sito restano uguali.

Per rigenerarli dopo una modifica (una sola volta l'installazione):
    pip install markdown playwright
    playwright install chromium
    python strumenti/genera_pdf.py

Le figure si rigenerano a parte con strumenti/genera_figure.py.
"""
import os
import re
import pathlib

import markdown
from playwright.sync_api import sync_playwright

QUI = pathlib.Path(__file__).resolve().parent
CARTELLA = QUI.parent
(CARTELLA / 'pdf').mkdir(exist_ok=True)

DOCUMENTI = [
    {
        'sorgente': 'index.md',
        'uscita': 'pdf/02-partitori-potenza-energia.pdf',
        'lingua': 'it',
        'occhiello': 'TEEA — 3MAT · Argomento 2',
        'autore': 'Prof. Pasquale Naclerio · Manutenzione e Assistenza Tecnica',
        'pagina': 'Pagina',
        'di': 'di',
    },
    {
        'sorgente': 'index.en.md',
        'uscita': 'pdf/02-dividers-power-energy.pdf',
        'lingua': 'en',
        'occhiello': 'TEEA — 3MAT · Topic 2',
        'autore': 'Professor Pasquale Naclerio · Maintenance and Technical Assistance',
        'pagina': 'Page',
        'di': 'of',
    },
]

STILE = """
@page { size: A4; margin: 18mm 18mm 20mm 18mm; }
* { box-sizing: border-box; }
body { font-family: 'DejaVu Sans', 'Open Sans', Arial, sans-serif; font-size: 10.5pt;
       line-height: 1.5; color: #1b2936; margin: 0; }
header { border-bottom: 3px solid #159957; padding-bottom: 8px; margin-bottom: 14px; }
header .occhiello { color: #159957; font-weight: bold; font-size: 10pt; letter-spacing: .03em; }
header h1 { font-size: 21pt; margin: 4px 0 2px; color: #1b2936; }
header .autore { color: #606c71; font-size: 9.5pt; }
h2 { color: #159957; font-size: 14pt; margin: 18px 0 6px; break-after: avoid; }
h3 { color: #155799; font-size: 11.5pt; margin: 12px 0 4px; break-after: avoid; }
p, li { margin: 4px 0; }
ul { padding-left: 20px; }
blockquote { margin: 8px 0; padding: 6px 12px; background: #eef3f0; border-left: 4px solid #159957;
             break-inside: avoid; }
blockquote p { margin: 3px 0; }
table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 9.5pt; break-inside: avoid; }
th, td { border-bottom: 1px solid #c9d4ce; padding: 4px 6px; text-align: left; vertical-align: top; }
th { background: #eef3f0; }
img { display: block; max-width: 100%; max-height: 85mm; margin: 8px auto; break-inside: avoid; }
p:has(> img) { break-inside: avoid; }
/* il testo che introduce una formula, una figura o una tabella resta sulla stessa pagina */
p:has(+ blockquote), p:has(+ p > img), p:has(+ table), p:has(+ ul) { break-after: avoid; }
"""


def estrai(md):
    """Titolo (front matter) e parte compresa tra i segnaposto PDF."""
    titolo = re.search(r'^#\s+(.+)$', md, re.M).group(1).strip()
    corpo = md.split('<!-- PDF:INIZIO -->', 1)[1].split('<!-- PDF:FINE -->', 1)[0]
    return titolo, corpo


def html_documento(doc):
    md = (CARTELLA / doc['sorgente']).read_text(encoding='utf-8')
    titolo, corpo = estrai(md)
    contenuto = markdown.markdown(corpo, extensions=['tables', 'attr_list', 'sane_lists'])
    return f"""<!DOCTYPE html>
<html lang="{doc['lingua']}"><head><meta charset="utf-8"><title>{titolo}</title>
<style>{STILE}</style></head><body>
<header>
  <div class="occhiello">{doc['occhiello']}</div>
  <h1>{titolo}</h1>
  <div class="autore">{doc['autore']}</div>
</header>
{contenuto}
</body></html>"""


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for doc in DOCUMENTI:
            # il file HTML temporaneo sta nella cartella, così i percorsi img/... funzionano
            tmp = CARTELLA / f"_tmp_{doc['lingua']}.html"
            tmp.write_text(html_documento(doc), encoding='utf-8')
            pagina = browser.new_page()
            pagina.goto(tmp.as_uri())
            pagina.wait_for_load_state('networkidle')
            piede = (f"<div style='font-size:8px;color:#606c71;width:100%;padding:0 18mm;"
                     f"display:flex;justify-content:space-between;font-family:DejaVu Sans,Arial'>"
                     f"<span>{doc['autore']}</span>"
                     f"<span>{doc['pagina']} <span class='pageNumber'></span> {doc['di']} "
                     f"<span class='totalPages'></span></span></div>")
            pagina.pdf(path=str(CARTELLA / doc['uscita']), format='A4', print_background=True,
                       prefer_css_page_size=True, display_header_footer=True,
                       header_template='<div></div>', footer_template=piede)
            pagina.close()
            tmp.unlink()
            print('creato', doc['uscita'])
        browser.close()


if __name__ == '__main__':
    main()

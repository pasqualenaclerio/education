/* =====================================================================
   PIANO DEI FASORI
   Strumenti per disegnare griglia, assi, frecce, archi e maniglie
   trascinabili. Le coordinate "normalizzate" valgono 1 al fondo scala.
   La "vista" dice quale parte del piano si vede: il piano di tensione e
   corrente è centrato, quello dei componenti mostra quasi solo la metà
   destra (la resistenza non è mai negativa) e così le frecce sono più lunghe.
   ===================================================================== */
(function (L) {
  const W = 520, O = 260, RAD = 226, DIV = 5;
  const P = L.P = { W, O, RAD, DIV };
  const f = n => n.toFixed(1);
  const LIM = 0.06;
  // sui telefoni il piano è piccolo e le scritte vengono ingrandite (vedi componenti.css)
  P.TELEFONO = '(max-width: 600px)';
  P.scalaTesto = 1;

  // vista centrata (da -1 a 1 in tutte e due le direzioni)
  P.VISTA_CENTRATA = { xMin: -1, xMax: 1, yMin: -1, yMax: 1 };
  // vista a destra: poco spazio per R < 0, molto per R > 0
  P.VISTA_DESTRA = { xMin: -0.2, xMax: (W - 20 - (20 + 0.2 * RAD)) / RAD, yMin: -1, yMax: 1 };
  let V = null;
  P.usa = vista => {
    V = Object.assign({}, vista);
    V.ox = O + (-(V.xMin + V.xMax) / 2) * RAD;   // centro dell'origine in coordinate SVG
    V.oy = O;
    return V;
  };
  P.usa(P.VISTA_CENTRATA);

  // da coordinate normalizzate a coordinate SVG (y verso l'alto)
  P.px = (x, y) => {
    x = Math.max(V.xMin - LIM, Math.min(V.xMax + LIM, x));
    y = Math.max(V.yMin - LIM, Math.min(V.yMax + LIM, y));
    return [V.ox + x * RAD, V.oy - y * RAD];
  };
  P.polN = (r, gradi) => [r * Math.cos(gradi * L.C.GR), r * Math.sin(gradi * L.C.GR)];

  // griglia a quadretti, assi con le frecce, semipiano R<0 facoltativo
  P.griglia = (opz = {}) => {
    const passo = RAD / DIV, ox = V.ox, oy = V.oy;
    const xa = ox + V.xMin * RAD, xb = ox + V.xMax * RAD, ya = oy - V.yMax * RAD, yb = oy - V.yMin * RAD;
    let s = '<g class="griglia">';
    for (let k = Math.ceil(V.xMin * DIV - 1e-9); k <= Math.floor(V.xMax * DIV + 1e-9); k++) {
      const p = f(ox + k * passo);
      s += `<line x1="${p}" y1="${ya}" x2="${p}" y2="${yb}"/>`;
    }
    for (let k = -DIV; k <= DIV; k++) {
      const p = f(oy + k * passo);
      s += `<line x1="${f(xa)}" y1="${p}" x2="${f(xb)}" y2="${p}"/>`;
    }
    s += '</g>';
    if (opz.semipiano && V.xMin < 0) {   // a sinistra: resistenza negativa
      const larg = -V.xMin * RAD;
      s += `<rect class="vietato" x="${f(xa)}" y="${ya}" width="${f(larg)}" height="${yb - ya}"/>`;
      if (larg > 150) s += `<text class="nota-vietato" x="${f(xa + larg / 2)}" y="${yb - 12}" text-anchor="middle">${opz.semipiano}</text>`;
    }
    s += `<g class="assi"><line x1="${f(xa - 4)}" y1="${oy}" x2="${f(xb + 8)}" y2="${oy}"/><line x1="${f(ox)}" y1="${yb + 4}" x2="${f(ox)}" y2="${ya - 8}"/>`;
    s += `<path d="M${f(xb + 16)} ${oy} l-11 -5.5 v11z"/><path d="M${f(ox)} ${ya - 16} l-5.5 11 h11z"/></g>`;
    const [ex, ey] = opz.assi || ['', ''];
    if (ex) s += `<text class="etichetta-asse" x="${f(xb + 14)}" y="${oy + 22}" text-anchor="end">${ex}</text>`;
    if (ey) s += `<text class="etichetta-asse" x="${f(ox + 10)}" y="${ya - 2}">${ey}</text>`;
    return s;
  };

  // freccia da a a b (coordinate normalizzate)
  P.freccia = (a, b, colore, opz = {}) => {
    const [x1, y1] = P.px(a[0], a[1]), [x2, y2] = P.px(b[0], b[1]);
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 1.5) return '';
    const k = opz.k || 1, w = (opz.w || 3) * k, ux = dx / len, uy = dy / len;
    const h = Math.min(15 * k, len * 0.55), hw = h * 0.42;
    const bx = x2 - ux * h * 0.8, by = y2 - uy * h * 0.8;
    const hx = x2 - ux * h, hy = y2 - uy * h;
    const tratto = opz.tratto ? ' stroke-dasharray="7 6"' : '';
    return `<g class="fr${opz.cava ? ' cava' : ''}" style="--c:${colore}">` +
      `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(bx)}" y2="${f(by)}" stroke-width="${w}"${tratto}/>` +
      `<path d="M${f(x2)} ${f(y2)} L${f(hx - uy * hw)} ${f(hy + ux * hw)} L${f(hx + uy * hw)} ${f(hy - ux * hw)}Z"/></g>`;
  };

  // linea tratteggiata sottile (proiezioni sugli assi)
  P.linea = (a, b, colore) => {
    const [x1, y1] = P.px(a[0], a[1]), [x2, y2] = P.px(b[0], b[1]);
    return `<line class="proiez" style="--c:${colore}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  };

  // testo in un punto; dir = direzione verso cui spostarlo (vettore normalizzato)
  P.testo = (p, testo, colore, opz = {}) => {
    let [x, y] = P.px(p[0], p[1]);
    const d = opz.dir || [0, 0], dist = opz.dist ?? 16;
    const n = Math.hypot(d[0], d[1]) || 1, ux = d[0] / n, uy = -d[1] / n;
    x += ux * dist; y += uy * dist;
    let anc = opz.anc || (ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle');
    if (uy > 0.35) y += 10; else if (Math.abs(uy) <= 0.35) y += 5;
    // larghezza stimata del testo: lo si tiene dentro il riquadro
    const car = testo.replace(/<tspan[^>]*font-size[^>]*>[^<]*<\/tspan>/g, 'x').replace(/<[^>]+>/g, '').length;
    const largo = car * (opz.piccola ? 7.6 : 9) * (opz.scala || P.scalaTesto), m = 4;
    if (anc === 'start') x = Math.min(x, W - m - largo);
    else if (anc === 'end') x = Math.max(x, m + largo);
    else x = Math.max(m + largo / 2, Math.min(W - m - largo / 2, x));
    y = Math.max(18, Math.min(W - 6, y));
    return `<text class="et${opz.piccola ? ' piccola' : ''}" style="--c:${colore}" x="${f(x)}" y="${f(y)}" text-anchor="${anc}">${testo}</text>`;
  };

  // etichetta posta oltre la punta della freccia
  P.etichettaPunta = (a, b, testo, colore, opz = {}) => {
    const d = [b[0] - a[0], b[1] - a[1]];
    return P.testo(b, testo, colore, Object.assign({ dir: d, dist: 18 }, opz));
  };

  // lettera con la barretta sopra (fasore)
  P.vec = (lettera, pedice) => `<tspan class="sop">${lettera}</tspan>` + (pedice ? `<tspan font-size="11" dy="4">${pedice}</tspan><tspan dy="-4"></tspan>` : '');

  // arco dell'angolo da a1 a a2 (gradi), raggio r normalizzato
  P.arco = (a1, a2, r, testo) => {
    if (Math.abs(a2 - a1) < 0.5) return '';
    const p1 = P.px(...P.polN(r, a1)), p2 = P.px(...P.polN(r, a2));
    const grande = Math.abs(a2 - a1) > 180 ? 1 : 0, verso = a2 > a1 ? 0 : 1;
    let s = `<path class="arco" d="M${f(p1[0])} ${f(p1[1])} A${f(r * RAD)} ${f(r * RAD)} 0 ${grande} ${verso} ${f(p2[0])} ${f(p2[1])}"/>`;
    if (testo) {
      const m = (a1 + a2) / 2;
      s += P.testo(P.polN(r, m), testo, 'var(--phase)', { dir: P.polN(1, m), dist: 14, piccola: true });
    }
    return s;
  };

  // maniglia trascinabile
  P.maniglia = (id, p, colore, descr, k = 1) => {
    const [x, y] = P.px(p[0], p[1]);
    return `<g class="maniglia" data-h="${id}" tabindex="0" role="button" aria-label="${descr}" style="--c:${colore}">` +
      `<circle class="presa" cx="${f(x)}" cy="${f(y)}" r="${22 * k}"/><circle class="punto" cx="${f(x)}" cy="${f(y)}" r="${7 * k}"/></g>`;
  };

  /* -------------------------------------------------------------------
     Piano interattivo: gestisce trascinamento con mouse, dita e tastiera.
     cb.inizio(id)   all'inizio del trascinamento
     cb.sposta(id, x, y)   durante il trascinamento (coordinate normalizzate)
     cb.fine(id)     al rilascio
     ------------------------------------------------------------------- */
  P.Piano = class {
    constructor(svg, cb, vista = P.VISTA_CENTRATA) {
      this.svg = svg; this.cb = cb; this.drag = null; this.fuoco = null; this.pos = {};
      this.vista = P.usa(vista);
      svg.setAttribute('viewBox', `0 0 ${W} ${W}`);

      svg.addEventListener('pointerdown', e => {
        const h = e.target.closest('[data-h]');
        if (!h) return;
        e.preventDefault();
        this.drag = h.dataset.h;
        try { svg.setPointerCapture(e.pointerId); } catch (_) {}
        svg.classList.add('trascina');
        cb.inizio && cb.inizio(this.drag);
        this.muovi(e);
      });
      svg.addEventListener('pointermove', e => { if (this.drag) { e.preventDefault(); this.muovi(e); } });
      const fine = () => {
        if (!this.drag) return;
        const id = this.drag; this.drag = null;
        svg.classList.remove('trascina');
        cb.fine && cb.fine(id);
      };
      svg.addEventListener('pointerup', fine);
      svg.addEventListener('pointercancel', fine);
      svg.addEventListener('lostpointercapture', fine);

      svg.addEventListener('focusin', e => { const h = e.target.closest('[data-h]'); this.fuoco = h ? h.dataset.h : null; });
      svg.addEventListener('keydown', e => {
        const h = e.target.closest('[data-h]');
        if (!h) return;
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        if (!d) return;
        e.preventDefault();
        const id = h.dataset.h, p = this.pos[id] || [0, 0], passo = e.shiftKey ? 0.05 : 0.01;
        cb.inizio && cb.inizio(id);
        P.usa(this.vista);
        cb.sposta(id, p[0] + d[0] * passo, p[1] + d[1] * passo, true);
        cb.fine && cb.fine(id);
      });
    }
    muovi(e) {
      const pt = this.svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const q = pt.matrixTransform(this.svg.getScreenCTM().inverse());
      const v = this.vista;
      let x = (q.x - v.ox) / RAD, y = (v.oy - q.y) / RAD;
      x = Math.max(v.xMin - 0.03, Math.min(v.xMax + 0.03, x));
      y = Math.max(v.yMin - 0.03, Math.min(v.yMax + 0.03, y));
      P.usa(this.vista);
      this.cb.sposta(this.drag, x, y, false);
    }
    // ridisegna il contenuto e rimette il fuoco sulla maniglia che lo aveva
    // da chiamare prima di disegnare con questo piano
    prepara() { P.usa(this.vista); }
    disegna(html, pos) {
      const aveva = this.fuoco && this.svg.contains(document.activeElement);
      this.svg.innerHTML = html;
      this.pos = pos || {};
      if (aveva) {
        const el = this.svg.querySelector(`[data-h="${this.fuoco}"]`);
        if (el) el.focus({ preventScroll: true });
      }
    }
  };

  // angolo con aggancio ai multipli di 15°
  P.aggancia = gradi => {
    let g = Math.round(gradi);
    const m = Math.round(gradi / 15) * 15;
    if (Math.abs(gradi - m) <= L.AGGANCIO_ANGOLO) g = m;
    return L.C.wrap(g);
  };
})(window.LAB);

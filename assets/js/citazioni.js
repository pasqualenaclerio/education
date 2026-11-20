/*
 * CITAZIONI — riquadro della home del sito «education»
 * (c) prof. Pasquale Naclerio
 *
 * Legge le citazioni da _data/citazioni.yml (che Jekyll inserisce nella
 * pagina come JSON), ne sceglie una a caso e la disegna a pixel neri.
 * Ogni 8 secondi i pixel si sparpagliano e si ricompongono nella
 * citazione successiva. Si ferma con il mouse sopra; un clic passa alla
 * successiva. Con «riduci animazioni» attivo la citazione cambia senza effetto.
 * Il testo vero resta nella pagina per gli screen reader.
 * File unico, nessuna libreria esterna.
 */
(function () {
  'use strict';
  var box = document.querySelector('.citazioni');
  var dati = document.getElementById('citazioni-dati');
  if (!box || !dati) return;

  var Q;
  try { Q = JSON.parse(dati.textContent) || []; } catch (e) { return; }
  Q = Q.filter(function (q) { return q && q.testo && q.autore; });
  if (!Q.length) return;

  var EN = document.documentElement.lang === 'en';
  var FONT = "8px 'Press Start 2P', monospace";
  var CELL = 2;            /* lato di un pixel della scritta, in px dello schermo */
  var RIGA = 11;           /* altezza di una riga, in pixel della scritta */
  var DURATA = 1700;       /* ricomposizione, ms */
  var PAUSA = 8000;        /* tempo di lettura, ms */
  var INK = '#1d1b2f', TENUE = '#5d5873';

  var cv = box.querySelector('.citazioni-pixel');
  var txt = box.querySelector('.citazioni-testo');
  var ctx = cv.getContext('2d');
  var off = document.createElement('canvas');
  var oc = off.getContext('2d', { willReadFrequently: true });
  var ridotto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, P = [], cur = -1, timer = 0, fermo = false, anim = 0;

  /* larghezza utile del riquadro (senza il padding), in pixel della scritta */
  function colonne() {
    var cs = getComputedStyle(box);
    var w = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return Math.max(60, Math.floor(w / CELL));
  }

  function testo(q) { return EN && q.en ? q.en : q.testo; }

  function aCapo(s, max) {
    oc.font = FONT;
    var parole = String(s).split(/\s+/), righe = [], r = '';
    for (var i = 0; i < parole.length; i++) {
      var prova = r ? r + ' ' + parole[i] : parole[i];
      if (oc.measureText(prova).width > max && r) { righe.push(r); r = parole[i]; } else r = prova;
    }
    righe.push(r);
    return righe;
  }

  function impagina(q) {
    return { t: aCapo('«' + testo(q) + '»', W - 4).slice(0, 12), a: aCapo('— ' + q.autore, W - 4).slice(0, 2) };
  }

  /* larghezza dal riquadro, altezza fissa = citazione più lunga (niente salti della pagina) */
  function misura() {
    W = colonne();
    var max = 0;
    Q.forEach(function (q) { var l = impagina(q); max = Math.max(max, l.t.length + l.a.length); });
    H = max * RIGA + 7;
    var dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(W * CELL * dpr); cv.height = Math.round(H * CELL * dpr);
    cv.style.width = W * CELL + 'px'; cv.style.height = H * CELL + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* disegna la citazione fuori schermo e restituisce i pixel accesi */
  function pixel(q) {
    var l = impagina(q);
    off.width = W; off.height = H;
    oc.font = FONT; oc.textBaseline = 'top';
    var y = Math.floor((H - (l.t.length + l.a.length) * RIGA - 4) / 2) + 2;
    oc.fillStyle = '#000'; oc.textAlign = 'left';
    l.t.forEach(function (r) { oc.fillText(r, 2, y); y += RIGA; });
    y += 3;
    oc.fillStyle = '#f00'; oc.textAlign = 'right';
    l.a.forEach(function (r) { oc.fillText(r, W - 2, y); y += RIGA; });
    var d = oc.getImageData(0, 0, W, H).data, T = [];
    for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) {
      var k = (j * W + i) * 4;
      if (d[k + 3] > 128) T.push({ x: i, y: j, c: d[k] > 128 ? TENUE : INK });
    }
    return T;
  }

  function mescola(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }

  function mostra(q) {
    txt.innerHTML = '';
    var p1 = document.createElement('p'); p1.textContent = '«' + testo(q) + '»';
    var p2 = document.createElement('p'); p2.className = 'citazioni-autore'; p2.textContent = '— ' + q.autore;
    txt.appendChild(p1); txt.appendChild(p2);
    if (soloTesto) { programma(); return; }
    if (colonne() !== W) { misura(); P = []; }

    var T = mescola(pixel(q)), n = P.length, m = T.length, N = Math.max(n, m), A = [];
    for (var i = 0; i < N; i++) {
      var f = i < n ? P[i] : (n ? P[Math.random() * n | 0] : { x: Math.random() * W, y: Math.random() * H });
      var t = i < m ? T[i] : T[Math.random() * m | 0];
      A.push({ fx: f.x, fy: f.y, tx: t.x, ty: t.y,
               mx: (f.x + t.x) / 2 + (Math.random() - .5) * W * .6, my: Math.random() * H,
               d: Math.random() * .35, c: t.c, via: i >= m });
    }
    cancelAnimationFrame(anim);
    var t0 = performance.now();
    function quadro(ora) {
      var p = ridotto ? 1 : (ora - t0) / DURATA;
      ctx.clearRect(0, 0, W * CELL, H * CELL);
      for (var i = 0; i < A.length; i++) {
        var a = A[i], k = Math.min(1, Math.max(0, (p - a.d) / .65));
        if (a.via && k >= 1) continue;
        var e = ease(k), u = 1 - e;
        var x = u * u * a.fx + 2 * u * e * a.mx + e * e * a.tx;
        var y = u * u * a.fy + 2 * u * e * a.my + e * e * a.ty;
        ctx.fillStyle = a.c;
        ctx.fillRect(Math.round(x) * CELL, Math.round(y) * CELL, CELL, CELL);
      }
      if (p < 1) anim = requestAnimationFrame(quadro);
      else { P = A.filter(function (a) { return !a.via; }).map(function (a) { return { x: a.tx, y: a.ty }; }); programma(); }
    }
    anim = requestAnimationFrame(quadro);
  }

  function prossima() {
    var i;
    do { i = Math.random() * Q.length | 0; } while (Q.length > 1 && i === cur);
    cur = i; mostra(Q[i]);
  }
  function programma() {
    clearTimeout(timer);
    timer = setTimeout(function () { if (fermo || document.hidden) programma(); else prossima(); }, PAUSA);
  }

  /* Il carattere pixel è davvero caricato? In Press Start 2P ogni lettera
     è larga 8 px, anche la «i»; nel carattere di riserva è molto più stretta. */
  function fontPronto() {
    oc.font = FONT;
    return Math.abs(oc.measureText('iiiiiiii').width - 64) < 2;
  }

  var avviato = false, soloTesto = false;

  function ascolta() {
    box.addEventListener('mouseenter', function () { fermo = true; });
    box.addEventListener('mouseleave', function () { fermo = false; });
    box.addEventListener('click', function () { clearTimeout(timer); prossima(); });
    function adatta() {
      if (soloTesto || colonne() === W) return;
      misura(); P = []; mostra(Q[cur]);
    }
    if (window.ResizeObserver) new ResizeObserver(adatta).observe(box);
    else window.addEventListener('resize', adatta);
  }

  /* modo pixel: si nasconde il testo (resta per gli screen reader) e si disegna */
  function pixelOn() {
    soloTesto = false;
    misura();
    box.classList.add('attivo');
    P = [];
    if (cur < 0) prossima(); else mostra(Q[cur]);
  }

  function avvia(fontOk) {
    if (avviato) return;
    avviato = true;
    ascolta();
    if (fontOk) { pixelOn(); return; }
    /* carattere pixel non disponibile: le citazioni girano come testo normale;
       se il carattere arriva più tardi si passa ai pixel */
    soloTesto = true;
    prossima();
    if (document.fonts && document.fonts.addEventListener)
      document.fonts.addEventListener('loadingdone', function () { if (soloTesto && fontPronto()) pixelOn(); });
  }

  var prove = 0;
  function aspettaFont() {
    if (fontPronto()) avvia(true);
    else if (++prove > 40) avvia(false);      /* dopo 10 secondi si rinuncia */
    else setTimeout(aspettaFont, 250);
  }

  /* si parte a pagina caricata del tutto (stile e caratteri), così le misure sono giuste */
  function parti() {
    if (document.fonts && document.fonts.load) document.fonts.load(FONT, '«Aa»').then(aspettaFont, aspettaFont);
    else aspettaFont();
  }
  if (window.__citazioni) return;
  window.__citazioni = true;
  if (document.readyState === 'complete') parti();
  else window.addEventListener('load', parti);
})();

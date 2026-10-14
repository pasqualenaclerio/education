/* ==========================================================================
   STRUMENTI DI DISEGNO comuni ai due canvas
   ========================================================================== */
(function (L) {
  L.FONT = 'px "Atkinson Hyperlegible", system-ui, sans-serif';

  // Colori letti dalle variabili CSS (css/tema.css)
  L.C = {};
  L.readColors = function () {
    const cs = getComputedStyle(document.documentElement);
    ['paper', 'panel', 'ink', 'muted', 'grid', 'line', 'volt', 'curr', 'phase', 'power']
      .forEach(k => L.C[k] = cs.getPropertyValue('--' + k).trim());
  };

  // Freccia da (x0,y0) a (x1,y1)
  L.arrow = function (c, x0, y0, x1, y1, color, w) {
    const len = Math.hypot(x1 - x0, y1 - y0); if (len < 2) return;
    const ux = (x1 - x0) / len, uy = (y1 - y0) / len, h = Math.min(12, len * 0.4);
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = w; c.setLineDash([]);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - ux * h * 0.8, y1 - uy * h * 0.8); c.stroke();
    c.beginPath(); c.moveTo(x1, y1);
    c.lineTo(x1 - ux * h - uy * h * 0.45, y1 - uy * h + ux * h * 0.45);
    c.lineTo(x1 - ux * h + uy * h * 0.45, y1 - uy * h - ux * h * 0.45);
    c.closePath(); c.fill();
  };

  L.dot = function (c, x, y, r, color) {
    c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, L.TAU); c.fill();
  };

  L.text = function (c, t, x, y, color, size = 12, align = 'left', base = 'alphabetic', bold = false) {
    c.fillStyle = color; c.font = (bold ? '700 ' : '') + size + L.FONT;
    c.textAlign = align; c.textBaseline = base; c.fillText(t, x, y);
  };
})(window.LAB);

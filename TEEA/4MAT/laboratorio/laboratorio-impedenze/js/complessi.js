/* =====================================================================
   NUMERI COMPLESSI
   Un numero complesso è un oggetto { re, im }. Gli angoli sono in gradi.
   ===================================================================== */
(function (L) {
  const GR = Math.PI / 180;
  const C = L.C = {};

  C.cart = (re, im) => ({ re, im });
  C.pol = (mod, gradi) => ({ re: mod * Math.cos(gradi * GR), im: mod * Math.sin(gradi * GR) });
  C.add = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
  C.mul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
  C.div = (a, b) => {
    const d = b.re * b.re + b.im * b.im;
    return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
  };
  C.inv = a => C.div({ re: 1, im: 0 }, a);
  C.mod = a => Math.hypot(a.re, a.im);
  C.arg = a => Math.atan2(a.im, a.re) / GR;

  // riporta un angolo nell'intervallo (-180°, 180°]
  C.wrap = g => {
    let x = ((g + 180) % 360 + 360) % 360 - 180;
    if (x === -180) x = 180;
    return x;
  };
  C.GR = GR;
})(window.LAB);

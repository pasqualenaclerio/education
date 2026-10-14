/* ==========================================================================
   AVVIO: colori, dimensioni dei grafici e ciclo di animazione
   ========================================================================== */
(function (L) {
  L.readColors();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    L.readColors(); L.zplane.draw();
  });

  function resizeAll() { L.scope.resize(); L.zplane.resize(); }
  new ResizeObserver(resizeAll).observe(L.$('.canvas-box'));

  L.update();
  resizeAll();

  // A ogni fotogramma il tempo avanza: un giro del fasore dura "secPerTurn" secondi
  let last = null;
  function frame(ts) {
    if (last === null) last = ts;
    const dt = Math.min(0.1, (ts - last) / 1000); last = ts;
    if (L.S.playing) L.S.t = (L.S.t + dt / L.S.secPerTurn / L.S.f) % L.windowT();
    L.scope.draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})(window.LAB);

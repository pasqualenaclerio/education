/* ==========================================================================
   TEMA (bianco, grigio chiaro, scuro o automatico)
   Questo file è caricato nell'<head>, prima del resto, così la pagina
   compare subito con il tema giusto. La scelta viene ricordata dal browser.
   ========================================================================== */
window.LAB = window.LAB || {};

(function (L) {
  const CHIAVE = 'lab-ca-tema';
  const TEMI = ['auto', 'white', 'paper', 'dark'];

  L.applyTheme = function (tema) {
    if (tema === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', tema);
  };

  let salvato = 'auto';
  try { salvato = localStorage.getItem(CHIAVE) || 'auto'; } catch (e) { /* memoria non disponibile */ }
  if (!TEMI.includes(salvato)) salvato = 'auto';
  L.applyTheme(salvato);

  document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('theme');
    if (!sel) return;
    sel.value = salvato;
    sel.addEventListener('change', () => {
      L.applyTheme(sel.value);
      try { localStorage.setItem(CHIAVE, sel.value); } catch (e) { /* ignora */ }
      // i grafici leggono i colori dal CSS: vanno riletti e ridisegnati
      if (L.readColors) { L.readColors(); if (L.zplane) L.zplane.draw(); }
    });
  });
})(window.LAB);

/* =====================================================================
   AVVIO: menu dei modi, spunta della forma complessa, tema chiaro/scuro.
   ===================================================================== */
(function (L) {
  const S = L.S, $ = L.$;
  const CHIAVE_TEMA = 'laboratorio-impedenze-tema';

  function mostraModo() {
    const vi = S.modo === 'vi';
    $('modoVI').hidden = !vi;
    $('modoComp').hidden = vi;
    $('complessaVI').hidden = !(vi && S.complessa);
    $('complessaComp').hidden = !(!vi && S.complessa);
    for (const b of document.querySelectorAll('.menu [data-modo]')) b.setAttribute('aria-checked', b.dataset.modo === S.modo);
    (vi ? L.VI : L.CO).aggiorna(true);
  }

  function applicaTema(v) {
    if (v === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', v);
  }

  document.addEventListener('DOMContentLoaded', () => {
    L.VI.avvia();
    L.CO.avvia();

    // menu: scelta del modo (anche con le frecce della tastiera)
    const menu = document.querySelector('.menu');
    menu.addEventListener('click', e => {
      const b = e.target.closest('[data-modo]');
      if (b) { S.modo = b.dataset.modo; mostraModo(); }
    });
    menu.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      S.modo = S.modo === 'vi' ? 'comp' : 'vi';
      mostraModo();
      menu.querySelector(`[data-modo="${S.modo}"]`).focus();
    });

    // spunta in fondo: forma complessa
    $('chkComplessa').addEventListener('change', e => { S.complessa = e.target.checked; mostraModo(); });
    $('chkComplessa').checked = S.complessa;

    // tema: automatico, chiaro o scuro (la scelta resta memorizzata su questo browser)
    let tema = 'auto';
    try { tema = localStorage.getItem(CHIAVE_TEMA) || 'auto'; } catch (_) {}
    $('selTema').value = tema;
    applicaTema(tema);
    $('selTema').addEventListener('change', e => {
      applicaTema(e.target.value);
      try { localStorage.setItem(CHIAVE_TEMA, e.target.value); } catch (_) {}
    });

    // sui telefoni scritte più grandi nei piani
    const mq = window.matchMedia(L.P.TELEFONO);
    const telefono = () => { L.P.scalaTesto = mq.matches ? 1.45 : 1; };
    telefono();
    mq.addEventListener('change', () => { telefono(); L.VI.aggiorna(true); L.CO.aggiorna(true); });

    // il modo nascosto si prepara comunque, così è pronto al primo clic
    L.CO.aggiorna(true);
    mostraModo();
  });
})(window.LAB);

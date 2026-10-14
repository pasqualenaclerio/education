/* ==========================================================================
   CONTROLLI: slider, caselle numeriche, spunte della check list e barra comandi
   ========================================================================== */
(function (L) {
  const S = L.S, $ = L.$;
  L.rows = {};

  /* ---------------------------------------------------------------------
     makeRow crea una riga "etichetta + casella numerica + slider".
     Opzioni:
       min, max   limiti dello slider
       step       passo (slider lineare)
       log: true  slider logaritmico (utile per frequenza, L, C)
       nmin, nmax limiti accettati scrivendo nella casella (se diversi)
       unit       unità singola, oppure
       units      elenco [nome, fattore] in ordine crescente, es. [['Hz',1],['kHz',1e3]]
     --------------------------------------------------------------------- */
  function makeRow(parent, key, label, o) {
    const units = o.units || [[o.unit || '', 1]];
    let ui = 0;
    const row = document.createElement('div'); row.className = 'row';
    const id = 'in_' + key;
    const unitHtml = units.length > 1
      ? `<select aria-label="Unità">${units.map(u => `<option>${u[0]}</option>`).join('')}</select>`
      : units[0][0];
    const rMin = o.log ? 0 : o.min, rMax = o.log ? 1000 : o.max, rStep = o.log ? 1 : o.step;
    row.innerHTML = `<label for="${id}">${label}</label>
      <span class="num"><input type="number" id="${id}" step="any"> ${unitHtml}</span>
      <input type="range" min="${rMin}" max="${rMax}" step="${rStep}" aria-label="${label.replace(/<[^>]+>/g, '')}">`;
    parent.appendChild(row);

    const num = row.querySelector('input[type=number]');
    const rng = row.querySelector('input[type=range]');
    const sel = row.querySelector('select');
    const nmin = o.nmin ?? o.min, nmax = o.nmax ?? o.max;
    const toR = v => o.log ? 1000 * Math.log(v / o.min) / Math.log(o.max / o.min) : v;
    const fromR = r => o.log ? o.min * Math.pow(o.max / o.min, r / 1000) : r;
    const autoUnit = v => {
      if (units.length < 2) return;
      ui = 0; units.forEach((u, i) => { if (Math.abs(v) / u[1] >= 1) ui = i; });
      sel.selectedIndex = ui;
    };
    const show = v => { num.value = +(v / units[ui][1]).toPrecision(4); };
    const set = v => { autoUnit(v); show(v); rng.value = Math.min(rMax, Math.max(rMin, toR(v))); };
    set(S[key]);

    rng.addEventListener('input', () => {
      let v = fromR(+rng.value); if (o.log) v = +v.toPrecision(3);
      S[key] = v; autoUnit(v); show(v); L.update();
    });
    num.addEventListener('change', () => {
      let v = parseFloat(String(num.value).replace(',', '.')) * units[ui][1];
      if (!isFinite(v)) v = S[key];
      v = Math.min(nmax, Math.max(nmin, v)); S[key] = v; set(v); L.update();
    });
    if (sel) sel.addEventListener('change', () => { ui = sel.selectedIndex; show(S[key]); });
    L.rows[key] = { row, num, rng, set };
  }

  /* --- valori impostabili nella check list --- */
  makeRow($('#bodyV'), 'Vm', 'Ampiezza V<sub>max</sub>', { min: 0, max: 400, nmax: 1e6, step: 1, unit: 'V' });
  makeRow($('#bodyV'), 'thv', 'Fase iniziale θ<sub>v</sub>', { min: -180, max: 180, step: 1, unit: '°' });
  makeRow($('#bodyV'), 'f', 'Frequenza f', { min: 1, max: 1e5, nmin: 0.1, nmax: 1e6, log: true, units: [['Hz', 1], ['kHz', 1e3]] });
  makeRow($('#bodyI'), 'Im', 'Ampiezza I<sub>max</sub>', { min: 0, max: 10, nmax: 1e5, step: 0.1, unit: 'A' });
  makeRow($('#bodyI'), 'thi', 'Fase iniziale θ<sub>i</sub>', { min: -180, max: 180, step: 1, unit: '°' });
  makeRow($('#bodyZ'), 'R', 'Resistenza R', { min: 0.1, max: 1e4, nmin: 0.01, nmax: 1e7, log: true, units: [['Ω', 1], ['kΩ', 1e3]] });
  makeRow($('#bodyZ'), 'L', 'Induttanza L', { min: 1e-6, max: 10, nmin: 1e-9, nmax: 100, log: true, units: [['µH', 1e-6], ['mH', 1e-3], ['H', 1]] });
  makeRow($('#bodyZ'), 'C', 'Capacità C', { min: 1e-9, max: 1e-2, nmin: 1e-12, nmax: 1, log: true, units: [['nF', 1e-9], ['µF', 1e-6], ['mF', 1e-3]] });
  makeRow($('#bodyZ'), 'Zmod', 'Modulo |Z|', { min: 1, max: 500, step: 1, unit: 'Ω' });
  makeRow($('#bodyZ'), 'Zphi', 'Argomento φ<sub>Z</sub>', { min: -90, max: 90, step: 1, unit: '°' });
  makeRow($('#bodyAudio'), 'audioVol', 'Volume', { min: 0, max: 100, step: 1, unit: '%' });

  /* --- spunte --- */
  function bindChk(id, key) {
    const el = $(id);
    el.checked = S[key];
    el.addEventListener('change', () => {
      S[key] = el.checked;
      if (el.closest('.item-head')) el.closest('.item').classList.toggle('on', el.checked);
      L.update();
    });
  }
  bindChk('#chkV', 'showV'); bindChk('#chkI', 'showI'); bindChk('#chkZ', 'useZ'); bindChk('#chkF', 'showF');
  bindChk('#chkPh', 'showPh'); bindChk('#chkPw', 'showPw'); bindChk('#chkRms', 'showRms');
  bindChk('#chkAngle', 'showAngle'); bindChk('#chkProj', 'showProj'); bindChk('#chkTrace', 'trace');
  bindChk('#chkAudio', 'audioOn');

  document.querySelectorAll('input[name=zt]').forEach(r =>
    r.addEventListener('change', () => { S.zType = r.value; L.update(); }));
  document.querySelectorAll('input[name=au]').forEach(r =>
    r.addEventListener('change', () => { S.audioMode = r.value; L.update(); }));

  /* --- base dei tempi: valori 1-2-5 da 1 µs/div a 0,5 s/div --- */
  const TBS = [];
  for (let e = -6; e <= -1; e++) for (const m of [1, 2, 5]) TBS.push(m * Math.pow(10, e));
  const tbSel = $('#tbase');
  tbSel.innerHTML = TBS.map((v, i) => `<option value="${i}">${L.fmtT(v)}/div</option>`).join('');
  const setTbSel = () => {
    let best = 0;
    TBS.forEach((v, i) => { if (Math.abs(Math.log(v / S.tb)) < Math.abs(Math.log(TBS[best] / S.tb))) best = i; });
    tbSel.value = best;
  };
  setTbSel();
  tbSel.addEventListener('change', () => { S.tb = TBS[+tbSel.value]; S.t = 0; L.update(); });

  // Sceglie la base dei tempi che mostra circa 2 periodi
  L.fitTimebase = function () {
    const target = 2 / S.f / 8;
    S.tb = TBS.find(v => v >= target * 0.9999) ?? TBS[TBS.length - 1];
    setTbSel(); S.t = 0;
  };
  $('#fit').addEventListener('click', () => { L.fitTimebase(); L.update(); });

  // Cambia la frequenza da codice (pulsanti "risonanza" e "440 Hz")
  L.setFrequency = function (f) {
    S.f = f; L.rows.f.set(f);
    if (S.xaxis === 'time') L.fitTimebase();
    L.update();
  };
  $('#la440').addEventListener('click', () => L.setFrequency(440));

  /* --- animazione --- */
  const playBtn = $('#play');
  L.setPlaying = function (p) { S.playing = p; playBtn.textContent = p ? 'Pausa' : 'Avvia'; };
  L.setPlaying(S.playing);
  playBtn.addEventListener('click', () => L.setPlaying(!S.playing));
  $('#reset').addEventListener('click', () => { S.t = 0; L.setPlaying(false); });
  $('#tslider').addEventListener('input', e => { L.setPlaying(false); S.t = +e.target.value / 1000 * L.windowT(); });
  $('#spd').addEventListener('input', e => { S.secPerTurn = +e.target.value; $('#spdout').textContent = L.fmt(S.secPerTurn) + ' s'; });
  $('#xaxis').addEventListener('change', e => { S.xaxis = e.target.value; S.t = 0; L.update(); });

  // Scala verticale: togliendo la spunta si blocca quella attuale,
  // così si può confrontare come cresce o cala un'ampiezza
  const chkAuto = $('#chkAuto');
  chkAuto.checked = S.autoScale;
  chkAuto.addEventListener('change', () => {
    if (!chkAuto.checked && L.D) { S.VsFix = L.D.Vs; S.IsFix = L.D.Is; }
    S.autoScale = chkAuto.checked; L.update();
  });

  // Barra spaziatrice = avvia / pausa
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !/INPUT|SELECT|BUTTON|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault(); L.setPlaying(!S.playing);
    }
  });
})(window.LAB);

/* ==========================================================================
   AGGIORNAMENTO: ricalcola tutto e aggiorna i pannelli.
   Viene chiamata ogni volta che si cambia un valore o una spunta.
   (Il grafico animato invece si ridisegna da solo a ogni fotogramma, vedi main.js)
   ========================================================================== */
(function (L) {
  const { D2R } = L;
  const $ = L.$;

  L.update = function () {
    const S = L.S, fmt = L.fmt, rows = L.rows;
    L.D = L.compute();
    const d = L.D, zt = S.zType;
    if (S.t > d.Wt) S.t = 0;

    /* --- corrente: bloccata quando la decide l'impedenza --- */
    const lock = S.useZ;
    ['Im', 'thi'].forEach(k => {
      rows[k].row.classList.toggle('locked', lock);
      rows[k].num.disabled = lock; rows[k].rng.disabled = lock;
    });
    if (lock) {
      rows.Im.num.value = +d.Im.toPrecision(3); rows.Im.rng.value = Math.min(10, d.Im);
      rows.thi.num.value = +d.thi.toFixed(1); rows.thi.rng.value = d.thi;
    }
    $('#iNote').textContent = lock ? 'Calcolata dall\u2019impedenza: I = V / |Z| e θi = θv − φZ.' : 'Imposta tu ampiezza e fase della corrente.';

    /* --- righe visibili in base al tipo di carico --- */
    rows.R.row.style.display = (zt === 'R' || zt === 'RLC') ? '' : 'none';
    rows.L.row.style.display = (zt === 'L' || zt === 'RLC') ? '' : 'none';
    rows.C.row.style.display = (zt === 'C' || zt === 'RLC') ? '' : 'none';
    rows.Zmod.row.style.display = rows.Zphi.row.style.display = zt === 'Z' ? '' : 'none';

    /* --- risonanza RLC --- */
    const resBox = $('#resBox');
    resBox.style.display = zt === 'RLC' ? '' : 'none';
    if (zt === 'RLC') {
      resBox.innerHTML = `Frequenza di risonanza<br>f₀ = 1 / (2π√(LC)) = <b>${L.fmtF(d.f0)}</b><br><button class="btn small" type="button" id="goRes">Porta f alla risonanza</button>`;
      $('#goRes').onclick = () => L.setFrequency(+d.f0.toPrecision(4));
    }

    /* --- nota sulla frequenza: la finestra è fissa, l'onda si stringe --- */
    const nP = d.Wt / d.T;
    $('#fNote').innerHTML = `T = 1/f = <b>${L.fmtT(d.T)}</b>. ` + (S.xaxis === 'time'
      ? `Nella finestra di ${L.fmtT(d.Wt)} entrano <b>${fmt(nP)}</b> periodi: se aumenti f l\u2019onda si stringe.`
      : `Con l\u2019asse in angoli si vedono sempre 2 periodi: scegli l\u2019asse dei tempi per vedere l\u2019onda stringersi.`);
    $('#tbWrap').style.display = $('#fit').style.display = S.xaxis === 'time' ? '' : 'none';
    $('#tlab').textContent = S.xaxis === 'time' ? 'Tempo' : 'Angolo ωt';

    /* --- sfasamento e valori efficaci nella check list --- */
    const dir = Math.abs(d.phi) < 1 ? 'in fase' : (d.phi > 0 ? 'corrente in ritardo' : 'corrente in anticipo');
    $('#phaseLive').innerHTML = `φ = θ<sub>v</sub> − θ<sub>i</sub> = <b>${L.deg(d.phi)}</b><br>${dir}, Δt = ${L.fmtT(Math.abs(d.phi) / 360 * d.T)}`;
    $('#rmsNote').innerHTML = `V<sub>eff</sub> = V<sub>max</sub>/√2 = <b>${fmt(d.Vrms)} V</b><br>I<sub>eff</sub> = I<sub>max</sub>/√2 = <b>${fmt(d.Irms)} A</b>`;
    $('#audioNote').innerHTML = L.audioNote(d);

    /* --- legenda dell'oscilloscopio --- */
    let lg = '';
    if (S.showV) lg += `<span style="--lc:var(--volt)">tensione v(t), fondo scala ${fmt(d.Vs)} V</span>`;
    if (S.showI) lg += `<span style="--lc:var(--curr)">corrente i(t), fondo scala ${fmt(d.Is)} A</span>`;
    if (S.showPw) lg += `<span style="--lc:var(--power)">potenza p(t)</span>`;
    if (S.showPh) lg += `<span style="--lc:var(--phase)">sfasamento</span>`;
    if (!S.autoScale) lg += `<span style="--lc:var(--muted)">scala bloccata</span>`;
    $('#legend').innerHTML = lg;

    /* --- circuito, piano complesso, suono --- */
    L.updateCircuit(d);
    L.zplane.draw();
    L.audio.update(d);

    /* --- formule e spiegazione --- */
    $('#eqV').innerHTML = `v(t) = ${fmt(S.Vm)} · sin(${fmt(d.w)} t${L.sgnDeg(S.thv)}) V`;
    $('#eqI').innerHTML = `i(t) = ${fmt(d.Im)} · sin(${fmt(d.w)} t${L.sgnDeg(d.thi)}) A`;
    const items = [
      ['Frequenza f', L.fmtF(S.f)], ['Periodo T = 1/f', L.fmtT(d.T)], ['Pulsazione ω = 2πf', fmt(d.w) + ' rad/s'],
      ['Sfasamento φ', L.deg(d.phi)], ['Ritardo Δt = φ/360° · T', L.fmtT(Math.abs(d.phi) / 360 * d.T)], ['Fattore di potenza cos φ', fmt(Math.cos(d.phi * D2R))],
      ['Potenza attiva P', fmt(d.P) + ' W'], ['Potenza reattiva Q', fmt(d.Q) + ' var'], ['Potenza apparente S', fmt(d.Sa) + ' VA']
    ];
    $('#vals').innerHTML = items.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
    $('#explain').innerHTML = L.explain(d);
  };
})(window.LAB);

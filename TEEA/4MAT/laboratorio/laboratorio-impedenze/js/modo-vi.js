/* =====================================================================
   MODO 1: IMPEDENZA DA TENSIONE E CORRENTE
   Si muovono i fasori V e I (con i numeri o trascinandoli) e si
   ricava Z = V / I.  Trascinando Z cambia la corrente, V resta ferma.
   ===================================================================== */
(function (L) {
  const S = L.S, C = L.C, F = L.F, P = L.P, $ = L.$;
  const VI = L.VI = {};
  let sc = null;            // fondo scala: { Vs, Is, Zs }
  let pianoVI, pianoZ;

  /* ---------- descrizione del tipo di carico (usata anche dal modo 2) ---------- */
  L.natura = (phi, zm) => {
    const a = Math.abs(phi), fa = F.deg(a);
    if (zm === 0) return { t: '<b>Impedenza nulla</b>: a questa frequenza il circuito si comporta come un cortocircuito.' };
    if (!isFinite(zm)) return { t: '<b>Impedenza infinita</b>: a questa frequenza il circuito si comporta come un circuito aperto, non passa corrente.' };
    if (a < 0.05) return { t: '<b>Puramente resistivo</b>: tensione e corrente sono in fase.' };
    if (a > 90.05) return { t: `<b>Resistenza negativa</b>: uno sfasamento di ${fa} non si ottiene con resistori, induttori e condensatori. Servirebbe un circuito che fornisce energia, non che la assorbe.`, avviso: true };
    if (Math.abs(a - 90) < 0.05) return phi > 0
      ? { t: '<b>Puramente induttivo</b>: la corrente è in ritardo di 90° sulla tensione.' }
      : { t: '<b>Puramente capacitivo</b>: la corrente è in anticipo di 90° sulla tensione.' };
    return phi > 0
      ? { t: `<b>Ohmico-induttivo</b>: la corrente è in ritardo di ${fa} sulla tensione.` }
      : { t: `<b>Ohmico-capacitivo</b>: la corrente è in anticipo di ${fa} sulla tensione.` };
  };

  // toglie i residui di arrotondamento (es. 1e-14 invece di 0)
  const pulisci = z => {
    const m = C.mod(z), e = 1e-9 * m;
    return { re: Math.abs(z.re) < e ? 0 : z.re, im: Math.abs(z.im) < e ? 0 : z.im };
  };

  function dati() {
    const zm = S.V.mod / S.I.mod;
    const diff = S.V.fase - S.I.fase, phi = C.wrap(diff);
    return {
      V: pulisci(C.pol(S.V.mod, S.V.fase)),
      I: pulisci(C.pol(S.I.mod, S.I.fase)),
      zm, phi, diff,
      Z: pulisci(C.pol(zm, phi))
    };
  }

  function riscala(d) {
    const Vs = L.niceCeil(S.V.mod * L.MARGINE_SCALA);
    const hv = S.V.mod / Vs;
    const Is = L.niceCeil(S.I.mod / (hv * L.RAPPORTO_VISIVO_CORRENTE));
    const Zs = L.niceCeil(d.zm * L.MARGINE_SCALA);
    sc = { Vs, Is, Zs };
  }

  /* ---------- disegno ---------- */
  const proiezioni = (p, col) => P.linea(p, [p[0], 0], col) + P.linea(p, [0, p[1]], col);

  function disegnaVI(d) {
    pianoVI.prepara();
    const pv = P.polN(S.V.mod / sc.Vs, S.V.fase), pi = P.polN(S.I.mod / sc.Is, S.I.fase);
    let s = P.griglia({ assi: S.complessa ? ['Re', 'Im'] : ['0°', '90°'] });
    if (S.complessa) s += proiezioni(pv, 'var(--volt)') + proiezioni(pi, 'var(--curr)');
    const rArco = Math.min(0.22, 0.8 * Math.min(Math.hypot(...pv), Math.hypot(...pi)));
    s += P.arco(S.I.fase, S.I.fase + d.phi, rArco, 'φ = ' + F.deg(d.phi));
    s += P.freccia([0, 0], pv, 'var(--volt)', { w: 3.5 });
    s += P.freccia([0, 0], pi, 'var(--curr)', { w: 3 });
    s += P.etichettaPunta([0, 0], pv, P.vec('V'), 'var(--volt)');
    s += P.etichettaPunta([0, 0], pi, P.vec('I'), 'var(--curr)');
    s += P.maniglia('V', pv, 'var(--volt)', 'Punta del fasore della tensione');
    s += P.maniglia('I', pi, 'var(--curr)', 'Punta del fasore della corrente');
    pianoVI.disegna(s, { V: pv, I: pi });
    $('scalaVI').textContent = `Un quadretto vale ${F.eng(sc.Vs / P.DIV, 'V')} per la tensione e ${F.eng(sc.Is / P.DIV, 'A')} per la corrente.`;
  }

  function disegnaZ(d) {
    pianoZ.prepara();
    const k = 1.7;   // il piano è piccolo: tratti più spessi
    const pz = P.polN(d.zm / sc.Zs, d.phi);
    let s = P.griglia({ semipiano: 'R < 0', assi: S.complessa ? ['Re', 'Im'] : ['0°', '90°'] });
    if (S.complessa) {
      const colX = d.Z.im >= 0 ? 'var(--ind)' : 'var(--cap)';
      // le parti nulle non si disegnano, altrimenti le scritte si sovrappongono
      if (d.Z.re !== 0) {
        s += P.freccia([0, 0], [pz[0], 0], 'var(--res)', { w: 2.5, k });
        s += P.testo([pz[0] / 2, 0], 'R = ' + F.eng(d.Z.re, 'Ω'), 'var(--res)', { dir: [0, d.Z.im >= 0 ? -1 : 1], dist: 26, piccola: true, scala: 1.65 });
      }
      if (d.Z.im !== 0) {
        s += P.freccia([pz[0], 0], pz, colX, { w: 2.5, k });
        s += P.testo([pz[0], pz[1] / 2], 'X = ' + F.eng(d.Z.im, 'Ω'), colX, { dir: [pz[0] >= 0 ? 1 : -1, 0], dist: 14, piccola: true, scala: 1.65 });
      }
    }
    s += P.arco(0, d.phi, Math.min(0.3, 0.7 * Math.hypot(...pz)), F.deg(d.phi));
    s += P.freccia([0, 0], pz, 'var(--imp)', { w: 3.5, k });
    s += P.etichettaPunta([0, 0], pz, P.vec('Z'), 'var(--imp)', { dist: 24, scala: 1.65 });
    s += P.maniglia('Z', pz, 'var(--imp)', 'Punta del fasore dell’impedenza', k);
    pianoZ.disegna(s, { Z: pz });
    $('scalaZ').textContent = `Un quadretto vale ${F.eng(sc.Zs / P.DIV, 'Ω')}.`;
  }

  /* ---------- testi e campi ---------- */
  function testi(d) {
    $('vNot').innerHTML = `<span class="vec">V</span> = ${F.eng(S.V.mod, 'V')} ∠ ${F.deg(S.V.fase)}`;
    $('iNot').innerHTML = `<span class="vec">I</span> = ${F.eng(S.I.mod, 'A')} ∠ ${F.deg(S.I.fase)}`;
    $('zNotVI').innerHTML = `<span class="vec">Z</span> = ${F.eng(d.zm, 'Ω')} ∠ ${F.deg(d.phi)}`;
    $('zModVI').textContent = F.eng(d.zm, 'Ω');
    $('zFaseVI').textContent = F.deg(d.phi);

    let fase = `φ = φ<sub>V</sub> − φ<sub>I</sub> = ${F.deg(S.V.fase)} − ${F.par(F.deg(S.I.fase))} = ${F.deg(d.diff)}`;
    if (Math.abs(d.diff - d.phi) > 0.01) fase += ` cioè ${F.deg(d.phi)} (si riporta l’angolo tra −180° e 180°)`;
    $('calcVI').innerHTML =
      `<p>|Z| = |V| / |I| = ${F.eng(S.V.mod, 'V')} / ${F.eng(S.I.mod, 'A')} = ${F.eng(d.zm, 'Ω')}</p><p>${fase}</p>`;

    const n = L.natura(d.phi, d.zm);
    $('natVI').innerHTML = n.t;
    $('natVI').classList.toggle('avviso', !!n.avviso);

    L.scrivi($('vMod'), F.campo(S.V.mod));
    L.scrivi($('vFase'), F.campo(S.V.fase));
    L.scrivi($('iMod'), F.campo(S.I.mod));
    L.scrivi($('iFase'), F.campo(S.I.fase));
    L.scrivi($('vFaseR'), Math.round(S.V.fase));
    L.scrivi($('iFaseR'), Math.round(S.I.fase));
  }

  function complessa(d) {
    const sp = (z, u) => F.compl(z, u);
    const esp = (m, g, u) => `${F.num(m)} · e<sup>j${F.deg(g)}</sup> ${u}`;
    const colX = d.Z.im >= 0 ? 'x' : 'x" style="color:var(--cap)';
    $('vCompl').innerHTML = `<span class="vec">V</span> = ${sp(d.V, 'V')}<br>= ${esp(S.V.mod, S.V.fase, 'V')}`;
    $('iCompl').innerHTML = `<span class="vec">I</span> = ${sp(d.I, 'A')}<br>= ${esp(S.I.mod, S.I.fase, 'A')}`;
    $('zCompl').innerHTML = `<span class="vec">Z</span> = <span class="r">${F.num(d.Z.re)}</span> ${d.Z.im < 0 ? '−' : '+'} <span class="${colX}">j${F.num(Math.abs(d.Z.im))}</span> Ω<br>= ${esp(d.zm, d.phi, 'Ω')}`;

    L.scrivi($('vRe'), F.campo(d.V.re)); L.scrivi($('vIm'), F.campo(d.V.im));
    L.scrivi($('iRe'), F.campo(d.I.re)); L.scrivi($('iIm'), F.campo(d.I.im));
    L.scrivi($('zRe'), F.campo(d.Z.re)); L.scrivi($('zIm'), F.campo(d.Z.im));

    // passaggi della divisione con il coniugato
    const a = d.I.re, b = d.I.im, coniug = { re: a, im: -b };
    const num = C.mul(d.V, coniug), den = a * a + b * b;
    const p = x => F.par(F.num(x));
    $('passVI').innerHTML =
      `<p><b>Divisione in forma complessa.</b> <span class="vec">Z</span> = <span class="vec">V</span> / <span class="vec">I</span> = (${sp(d.V)}) / (${sp(d.I)}). ` +
      `Si moltiplicano numeratore e denominatore per il coniugato della corrente, (${sp(coniug)}):</p>` +
      `<p><span class="vec">Z</span> = (${sp(d.V)}) · (${sp(coniug)}) / (${p(a)}² + ${p(b)}²) = (${sp(num)}) / ${F.num(den)} = ` +
      `<span class="r">${F.num(d.Z.re)}</span> ${d.Z.im < 0 ? '−' : '+'} j${F.num(Math.abs(d.Z.im))} Ω</p>` +
      `<p><b>Dalla forma polare alla forma complessa.</b> ` +
      `<span class="r">R</span> = |Z| · cos φ = ${F.num(d.zm)} · cos ${F.par(F.deg(d.phi))} = <span class="r">${F.eng(d.Z.re, 'Ω')}</span>, ` +
      `<span class="xl">X</span> = |Z| · sin φ = ${F.num(d.zm)} · sin ${F.par(F.deg(d.phi))} = <span class="xl">${F.eng(d.Z.im, 'Ω')}</span></p>` +
      `<p>La parte reale è la resistenza, la parte immaginaria è la reattanza: se X è positiva il carico è induttivo, se è negativa è capacitivo.</p>`;

    // circuito equivalente serie alla frequenza scelta
    L.scrivi($('fEq'), F.campo(S.fEq));
    const w = 2 * Math.PI * S.fEq, tol = 1e-6 * d.zm;
    let t;
    if (d.Z.re < -tol) t = 'Con una resistenza negativa non esiste un circuito equivalente fatto solo di R, L e C.';
    else {
      const parti = [];
      if (d.Z.re > tol) parti.push(`una resistenza <span class="r">R = ${F.eng(d.Z.re, 'Ω')}</span>`);
      if (d.Z.im > tol) parti.push(`un induttore <span class="xl">L = X / ω = ${F.eng(d.Z.im / w, 'H')}</span>`);
      if (d.Z.im < -tol) parti.push(`un condensatore <span class="xc">C = 1 / (ω · |X|) = ${F.eng(1 / (w * -d.Z.im), 'F')}</span>`);
      t = 'questa impedenza equivale a ' + parti.join(' in serie con ') + '.';
    }
    $('eqTxt').innerHTML = t;
  }

  VI.aggiorna = function (riscalare = true) {
    const d = dati();
    if (riscalare || !sc) riscala(d);
    disegnaVI(d);
    disegnaZ(d);
    testi(d);
    if (S.complessa) complessa(d);
  };

  /* ---------- avvio: collega campi, cursori e trascinamenti ---------- */
  VI.avvia = function () {
    const ag = () => VI.aggiorna(true);
    const pos = v => v > 0;
    L.legaCampo($('vMod'), v => { S.V.mod = v; ag(); }, pos, ag);
    L.legaCampo($('iMod'), v => { S.I.mod = v; ag(); }, pos, ag);
    L.legaCampo($('vFase'), v => { S.V.fase = C.wrap(v); ag(); }, null, ag);
    L.legaCampo($('iFase'), v => { S.I.fase = C.wrap(v); ag(); }, null, ag);
    $('vFaseR').addEventListener('input', e => { S.V.fase = +e.target.value; ag(); });
    $('iFaseR').addEventListener('input', e => { S.I.fase = +e.target.value; ag(); });

    $('esempiVI').addEventListener('click', e => {
      const b = e.target.closest('[data-sf]');
      if (!b) return;
      S.I.fase = C.wrap(S.V.fase + Number(b.dataset.sf));
      ag();
    });

    // forma complessa: si possono scrivere parte reale e immaginaria
    const daCart = (re, im, obj) => { const z = { re, im }; if (C.mod(z) === 0) return; obj.mod = C.mod(z); obj.fase = C.arg(z); ag(); };
    const cur = () => dati();
    L.legaCampo($('vRe'), v => daCart(v, cur().V.im, S.V), null, ag);
    L.legaCampo($('vIm'), v => daCart(cur().V.re, v, S.V), null, ag);
    L.legaCampo($('iRe'), v => daCart(v, cur().I.im, S.I), null, ag);
    L.legaCampo($('iIm'), v => daCart(cur().I.re, v, S.I), null, ag);
    const daZ = (re, im) => {
      const z = { re, im }, m = C.mod(z);
      if (m === 0) return;
      S.I.mod = S.V.mod / m; S.I.fase = C.wrap(S.V.fase - C.arg(z)); ag();
    };
    L.legaCampo($('zRe'), v => daZ(v, cur().Z.im), null, ag);
    L.legaCampo($('zIm'), v => daZ(cur().Z.re, v), null, ag);
    L.legaCampo($('fEq'), v => { S.fEq = v; ag(); }, pos, ag);

    // trascinamento
    pianoVI = new P.Piano($('svgVI'), {
      sposta(id, x, y, tastiera) {
        const r = Math.hypot(x, y), g = Math.atan2(y, x) / C.GR;
        const a = tastiera ? C.wrap(Math.round(g)) : P.aggancia(g);   // da tastiera niente aggancio
        if (id === 'V') { S.V.mod = Math.max(F.sig(r * sc.Vs), F.sig(sc.Vs * 0.02)); S.V.fase = a; }
        else { S.I.mod = Math.max(F.sig(r * sc.Is), F.sig(sc.Is * 0.02)); S.I.fase = a; }
        VI.aggiorna(false);
      },
      fine() { VI.aggiorna(true); }
    });
    pianoZ = new P.Piano($('svgZ'), {
      sposta(id, x, y, tastiera) {
        const zm = Math.max(F.sig(Math.hypot(x, y) * sc.Zs), F.sig(sc.Zs * 0.02));
        const g = Math.atan2(y, x) / C.GR, phi = tastiera ? C.wrap(Math.round(g)) : P.aggancia(g);
        S.I.mod = F.sig(S.V.mod / zm, 6);
        S.I.fase = C.wrap(S.V.fase - phi);
        VI.aggiorna(false);
      },
      fine() { VI.aggiorna(true); }
    });
  };
})(window.LAB);

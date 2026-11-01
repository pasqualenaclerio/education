/* =====================================================================
   MODO 2: IMPEDENZA DEI COMPONENTI
   R, L, C da soli o combinati, in serie o in parallelo.
   Si cambiano i valori con i numeri, con i cursori o trascinando
   le punte dei fasori delle impedenze.
   ===================================================================== */
(function (L) {
  const S = L.S, C = L.C, F = L.F, P = L.P, $ = L.$;
  const CO = L.CO = {};
  let sc = null, piano;
  const COL = { R: 'var(--res)', L: 'var(--ind)', C: 'var(--cap)' };
  const NOME = { R: 'della resistenza', L: 'dell’induttore', C: 'del condensatore' };

  const ha = k => S.tipo.includes(k);
  const singolo = () => S.tipo.length === 1;
  const inSerie = () => singolo() || S.coll === 'serie';
  const max = Math.max, min = Math.min;

  /* ---------- calcolo ---------- */
  function dati() {
    const w = 2 * Math.PI * S.f;
    const XL = ha('L') ? w * S.L : 0, XC = ha('C') ? 1 / (w * S.C) : 0, R = ha('R') ? S.R : 0;
    const d = { w, XL, XC, R, inf: false, Y: null };
    if (inSerie()) {
      let X = XL - XC;
      if (Math.abs(X) < 1e-9 * max(XL, XC)) X = 0;      // risonanza: niente residui
      d.Z = { re: R, im: X };
    } else {
      const G = ha('R') ? 1 / S.R : 0, BC = ha('C') ? w * S.C : 0, BL = ha('L') ? 1 / (w * S.L) : 0;
      let B = BC - BL;
      if (Math.abs(B) < 1e-9 * max(BC, BL)) B = 0;
      Object.assign(d, { G, BC, BL, B, Y: { re: G, im: B } });
      if (G === 0 && B === 0) { d.inf = true; d.Z = { re: Infinity, im: 0 }; }
      else {
        const Z = C.inv(d.Y), e = 1e-9 * C.mod(Z);
        d.Z = { re: Math.abs(Z.re) < e ? 0 : Z.re, im: Math.abs(Z.im) < e ? 0 : Z.im };
      }
    }
    d.zm = d.inf ? Infinity : C.mod(d.Z);
    d.phi = (d.inf || d.zm === 0) ? 0 : C.arg(d.Z);
    if (ha('L') && ha('C')) d.f0 = 1 / (2 * Math.PI * Math.sqrt(S.L * S.C));
    return d;
  }

  // il piano mostra quasi solo la metà destra: in orizzontale c'è circa
  // il doppio dello spazio che in verticale
  function riscala(d) {
    const xExt = max(d.R, d.inf ? 0 : d.Z.re);
    let yExt;
    if (inSerie()) {
      const alto = ha('L') ? d.XL : 0, basso = min(0, alto - d.XC);
      yExt = max(alto, -basso);
    } else yExt = max(d.XL, d.XC, d.inf ? 0 : Math.abs(d.Z.im));
    sc = { Zs: L.niceCeil(max(xExt / 1.7, yExt * L.MARGINE_SCALA)) };
  }

  /* ---------- modifica dei valori ---------- */
  function limita() {
    const K = L.CURSORI, cl = (v, r) => min(r[1], max(r[0], v));
    S.R = F.sig(cl(S.R, K.R)); S.L = F.sig(cl(S.L, K.L)); S.C = F.sig(cl(S.C, K.C)); S.f = cl(S.f, K.f);
  }

  // imposta l'impedenza totale (parte reale e immaginaria) cambiando i componenti adatti
  function impostaZ(re, im) {
    const d = dati(), w = d.w, t = (sc ? sc.Zs : 1) * 0.005, k = S.tipo;
    if (singolo()) {
      if (k === 'R') S.R = max(re, t);
      if (k === 'L') S.L = max(im, t) / w;
      if (k === 'C') S.C = 1 / (w * max(-im, t));
    } else if (inSerie()) {
      if (ha('R')) S.R = max(re, t);
      if (ha('C')) S.C = 1 / (w * max((ha('L') ? d.XL : 0) - im, t));   // l'ultimo della catena è C
      else S.L = max(im, t) / w;
    } else {
      re = ha('R') ? max(re, t) : 0;
      if (k === 'RL') im = max(im, t);
      if (k === 'RC') im = min(im, -t);
      if (!ha('R') && Math.abs(im) < t) im = im < 0 ? -t : t;
      const Y = C.inv({ re, im });
      if (ha('R')) S.R = 1 / Y.re;
      if (k === 'RC') S.C = Y.im / w;
      else S.L = 1 / (w * max((ha('C') ? w * S.C : 0) - Y.im, 1e-12));   // C resta fisso
    }
    limita();
  }

  function sposta(id, x, y) {
    const X = x * sc.Zs, Yv = y * sc.Zs, t = sc.Zs * 0.005, w = 2 * Math.PI * S.f;
    if (id === 'R') S.R = max(X, t);
    else if (id === 'L') S.L = max(Yv, t) / w;
    else if (id === 'C') S.C = 1 / (w * max(-Yv, t));
    else impostaZ(X, Yv);
    limita();
    CO.aggiorna(false);
  }

  /* ---------- disegno ---------- */
  const ped = (l, p) => P.vec(l, p);
  // etichetta di Z a metà freccia, dalla parte opposta ai componenti
  function etichettaZ(pz, testo, phi) {
    const g = phi * C.GR, nrm = phi >= 0 ? [-Math.sin(g), Math.cos(g)] : [Math.sin(g), -Math.cos(g)];
    const anc = Math.abs(nrm[0]) > 0.8 ? undefined : 'middle';
    return P.testo([pz[0] * 0.55, pz[1] * 0.55], testo, 'var(--imp)', { dir: nrm, dist: 16, anc });
  }

  function disegna(d) {
    piano.prepara();
    const n = v => v / sc.Zs, cx = S.complessa;
    let s = P.griglia({ semipiano: 'R negativa: non realizzabile', assi: cx ? ['Re', 'Im'] : ['0°', '90°'] });
    const pos = {}, man = [];
    const pz = d.inf ? null : [n(d.Z.re), n(d.Z.im)];
    const colX = d.Z.im >= 0 ? 'var(--ind)' : 'var(--cap)';
    const valZ = cx && !d.inf ? ' = ' + F.compl(d.Z, 'Ω') : '';
    const sopra = d.Z.im >= 0 ? -1 : 1;   // da che parte scrivere l'etichetta di R

    if (pz && Math.hypot(...pz) > 0.03)
      s += P.arco(0, d.phi, min(0.2, 0.6 * Math.hypot(...pz)), 'φ = ' + F.deg(d.phi));

    if (singolo()) {
      const k = S.tipo;
      const p = k === 'R' ? [n(d.R), 0] : k === 'L' ? [0, n(d.XL)] : [0, -n(d.XC)];
      const nomi = { R: ' = R', L: ' = jX<tspan font-size="11" dy="4">L</tspan><tspan dy="-4"></tspan>', C: ' = −jX<tspan font-size="11" dy="4">C</tspan><tspan dy="-4"></tspan>' };
      s += P.freccia([0, 0], p, COL[k], { w: 4 });
      s += P.etichettaPunta([0, 0], p, ped('Z') + (cx ? nomi[k] + valZ : ''), COL[k]);
      man.push([k, p, COL[k], 'Punta del fasore ' + NOME[k]]);
    } else if (inSerie()) {
      // catena punta-coda: R, poi L, poi C
      let cur = [0, 0];
      const due = ha('L') && ha('C'), off = due ? 0.022 : 0;
      if (ha('R')) {
        const p = [n(d.R), 0];
        s += P.freccia(cur, p, COL.R, { w: 3 });
        s += P.testo([p[0] / 2, 0], ped('Z', 'R') + (cx ? ' = ' + F.eng(d.R, 'Ω') : ''), COL.R, { dir: [0, sopra], dist: 18, piccola: cx });
        man.push(['R', p, COL.R, 'Punta del fasore della resistenza']);
        cur = p;
      }
      if (ha('L')) {
        const a = [cur[0] - off, cur[1]], p = [cur[0] - off, cur[1] + n(d.XL)];
        s += P.freccia(a, p, COL.L, { w: 3 });
        s += P.testo([p[0], a[1] + (p[1] - a[1]) * 0.72], ped('Z', 'L') + (cx ? ' = j' + F.eng(d.XL, 'Ω') : ''), COL.L, { dir: [due ? -1 : 1, 0], dist: 10, piccola: cx });
        if (ha('C')) man.push(['L', p, COL.L, 'Punta del fasore dell’induttore']);
        cur = [cur[0], p[1]];
      }
      if (ha('C')) {
        const a = [cur[0] + off, cur[1]], p = [cur[0] + off, cur[1] - n(d.XC)];
        if (due) s += P.linea([cur[0] - off, cur[1]], a, COL.C);
        s += P.freccia(a, p, COL.C, { w: 3 });
        s += P.testo([p[0], (a[1] + p[1]) / 2], ped('Z', 'C') + (cx ? ' = −j' + F.eng(d.XC, 'Ω') : ''), COL.C, { dir: [1, 0], dist: 10, piccola: cx });
      }
      s += P.freccia([0, 0], pz, 'var(--imp)', { w: 4.5 });
      s += etichettaZ(pz, ped('Z'), d.phi);   // in serie il valore si legge dalla somma delle frecce
      man.push(['Z', pz, 'var(--imp)', 'Punta del fasore dell’impedenza totale']);
    } else {
      // parallelo: impedenze dei singoli componenti tratteggiate, Z totale piena
      const comp = { R: [n(d.R), 0], L: [0, n(d.XL)], C: [0, -n(d.XC)] };
      for (const k of S.tipo) {
        const p = comp[k];
        s += P.freccia([0, 0], p, COL[k], { w: 2.5, tratto: true, cava: true });
        const v = { R: ' = ' + F.eng(d.R, 'Ω'), L: ' = j' + F.eng(d.XL, 'Ω'), C: ' = −j' + F.eng(d.XC, 'Ω') }[k];
        s += k === 'R'
          ? P.testo(p, ped('Z', k) + (cx ? v : ''), COL[k], { dir: [0, sopra], dist: 18, piccola: cx })
          : P.etichettaPunta([0, 0], p, ped('Z', k) + (cx ? v : ''), COL[k], { piccola: cx });
        man.push([k, p, COL[k], 'Punta del fasore ' + NOME[k]]);
      }
      if (pz) {
        if (cx) {   // triangolo: parte reale e parte immaginaria di Z
          if (d.Z.re !== 0 && d.Z.im !== 0) {
            s += P.freccia([0, 0], [pz[0], 0], 'var(--res)', { w: 2 });
            s += P.freccia([pz[0], 0], pz, colX, { w: 2 });
            s += P.testo([pz[0] / 2, 0], 'R = ' + F.eng(d.Z.re, 'Ω'), 'var(--res)', { dir: [0, sopra], dist: 18, piccola: true });
            s += P.testo([pz[0], pz[1] * 0.78], 'X = ' + F.eng(d.Z.im, 'Ω'), colX, { dir: [1, 0], dist: 10, piccola: true });
          }
        }
        s += P.freccia([0, 0], pz, 'var(--imp)', { w: 4.5 });
        s += P.etichettaPunta([0, 0], pz, ped('Z') + valZ, 'var(--imp)', { dist: 20 });
        man.push(['Z', pz, 'var(--imp)', 'Punta del fasore dell’impedenza totale']);
      } else {
        s += P.testo([0.9, 0.12], 'Z infinita: la sua freccia', 'var(--imp)', { anc: 'middle', dist: 0 });
        s += P.testo([0.9, 0.04], 'uscirebbe dal piano', 'var(--imp)', { anc: 'middle', dist: 0 });
      }
    }
    for (const [id, p, col, descr] of man) { s += P.maniglia(id, p, col, descr); pos[id] = p; }
    piano.disegna(s, pos);
    $('scalaComp').textContent = `Un quadretto vale ${F.eng(sc.Zs / P.DIV, 'Ω')}.`;
  }

  /* ---------- testi ---------- */
  const sub = (x, p) => `${x}<sub>${p}</sub>`;
  function testi(d) {
    const k = S.tipo;
    $('zNotC').innerHTML = `<span class="vec">Z</span> = ` + (d.inf ? '∞' : `${F.eng(d.zm, 'Ω')} ∠ ${F.deg(d.phi)}`);
    $('zModC').textContent = F.eng(d.zm, 'Ω');
    $('zFaseC').textContent = d.inf || d.zm === 0 ? '—' : F.deg(d.phi);

    const XL = sub('X', 'L'), XC = sub('X', 'C');
    const r = [];
    if (singolo()) {
      if (k === 'R') r.push(`|Z| = R = ${F.eng(d.R, 'Ω')} e φ = 0°: il resistore non sposta la corrente rispetto alla tensione.`);
      if (k === 'L') r.push(`|Z| = ${XL} = ωL = ${F.eng(d.XL, 'Ω')} e φ = +90°. La reattanza cresce con la frequenza.`);
      if (k === 'C') r.push(`|Z| = ${XC} = 1 / (ωC) = ${F.eng(d.XC, 'Ω')} e φ = −90°. La reattanza diminuisce al crescere della frequenza.`);
    } else if (inSerie()) {
      const parti = [ha('L') ? XL : '', ha('C') ? '− ' + XC : ''].filter(Boolean).join(' ').replace(/^− /, '−');
      const num = [ha('L') ? F.num(d.XL) : '', ha('C') ? '− ' + F.num(d.XC) : ''].filter(Boolean).join(' ').replace(/^− /, '−');
      r.push(ha('L') && ha('C')
        ? `Reattanza totale: X = ${parti} = ${num} = ${F.eng(d.Z.im, 'Ω')}`
        : `Reattanza: X = ${parti} = ${F.eng(d.Z.im, 'Ω')}`);
      if (ha('R')) {
        r.push(`|Z| = √(R² + X²) = √(${F.num(d.R)}² + ${F.par(F.num(d.Z.im))}²) = ${F.eng(d.zm, 'Ω')}`);
        r.push(`φ = arctan(X / R) = arctan(${F.num(d.Z.im)} / ${F.num(d.R)}) = ${F.deg(d.phi)}`);
      } else {
        r.push(`Senza resistenza |Z| = |X| = ${F.eng(d.zm, 'Ω')} e φ vale +90° o −90° secondo il segno di X.`);
      }
    } else {
      r.push('In parallelo non si sommano le impedenze: si sommano le correnti dei rami.');
      const tB = [ha('C') ? `1/${XC}` : '', ha('L') ? `− 1/${XL}` : ''].filter(Boolean).join(' ').replace(/^− /, '−');
      const nB = [ha('C') ? `1/${F.num(d.XC)}` : '', ha('L') ? `− 1/${F.num(d.XL)}` : ''].filter(Boolean).join(' ').replace(/^− /, '−');
      if (ha('R')) {
        r.push(`|Z| = 1 / √((1/R)² + (${tB})²) = 1 / √((1/${F.num(d.R)})² + (${nB})²) = ${F.eng(d.zm, 'Ω')}`);
        const tPhi = [ha('L') ? `1/${XL}` : '', ha('C') ? `− 1/${XC}` : ''].filter(Boolean).join(' ').replace(/^− /, '−');
        r.push(`φ = arctan(R · (${tPhi})) = ${F.deg(d.phi)}`);
      } else {
        r.push(`|Z| = 1 / |${tB}| = 1 / |${nB}| = ${F.eng(d.zm, 'Ω')}`);
      }
    }
    $('calcC').innerHTML = r.map(x => `<p>${x}</p>`).join('');

    const nat = L.natura(d.phi, d.zm);
    let t = nat.t;
    if (d.f0 && Math.abs(S.f - d.f0) / d.f0 < 1e-3) {
      t += inSerie()
        ? ' Siamo alla risonanza: le reattanze di L e C si annullano e l’impedenza è la più piccola possibile.'
        : ' Siamo alla risonanza: le correnti in L e C si compensano e l’impedenza è la più grande possibile.';
    }
    $('natC').innerHTML = t;
    $('natC').classList.toggle('avviso', !!nat.avviso);

    $('omega').textContent = `ω = 2πf = ${F.num(d.w)} rad/s`;
    $('xlTxt').innerHTML = `${XL} = ωL = ${F.eng(d.XL, 'Ω')}`;
    $('xcTxt').innerHTML = `${XC} = 1 / (ωC) = ${F.eng(d.XC, 'Ω')}`;
    const boxRis = $('boxRis');
    boxRis.hidden = !d.f0;
    if (d.f0) $('risTxt').innerHTML = `Frequenza di risonanza: f<sub>0</sub> = 1 / (2π√(LC)) = ${F.eng(d.f0, 'Hz')}`;

    $('notaPar').textContent = !inSerie() ? 'In parallelo la freccia di Z non è la somma delle frecce tratteggiate: si sommano le correnti dei rami e da quella totale si ricava Z.' : '';
    let aiuto;
    if (singolo()) aiuto = 'Trascina la punta della freccia lungo il suo asse.';
    else if (inSerie()) aiuto = 'In serie le impedenze si sommano mettendo le frecce una dopo l’altra. Trascina la punta di ogni freccia: quella di Z cambia ' + (ha('R') ? 'R e ' : '') + (ha('C') ? 'C' : 'L') + '.';
    else aiuto = 'Trascina le punte tratteggiate per cambiare un componente, oppure la punta di Z: cambiano ' + (ha('R') ? 'R e ' : '') + (k === 'RC' ? 'C' : 'L') + (ha('L') && ha('C') ? ', C resta fisso' : '') + '.';
    $('aiutoComp').textContent = aiuto + ' Da tastiera: Tab e tasti freccia.';
  }

  function campi(d) {
    const K = L.CURSORI, lg = (v, r) => Math.round(1000 * Math.log(v / r[0]) / Math.log(r[1] / r[0]));
    L.scrivi($('fVal'), F.campo(S.f)); L.scrivi($('fR'), lg(S.f, K.f));
    L.scrivi($('rVal'), F.campo(S.R)); L.scrivi($('rR'), lg(S.R, K.R));
    L.scrivi($('lVal'), F.campo(S.L * 1e3)); L.scrivi($('lR'), lg(S.L, K.L));
    L.scrivi($('cVal'), F.campo(S.C * 1e6)); L.scrivi($('cR'), lg(S.C, K.C));
    for (const fs of document.querySelectorAll('#modoComp [data-per]')) fs.hidden = !ha(fs.dataset.per);
    for (const b of document.querySelectorAll('#tipi [data-tipo]')) b.setAttribute('aria-checked', b.dataset.tipo === S.tipo);
    for (const b of document.querySelectorAll('#coll [data-coll]')) {
      b.disabled = singolo();
      b.setAttribute('aria-checked', !singolo() && b.dataset.coll === S.coll);
    }
    const sch = L.schema(S.tipo, S.coll);
    $('schema').setAttribute('viewBox', sch.viewBox);
    $('schema').innerHTML = sch.html;
  }

  function complessa(d) {
    const XL = sub('X', 'L'), XC = sub('X', 'C'), Zk = k => `<span class="vec">Z</span><sub>${k}</sub>`;
    const Zv = '<span class="vec">Z</span>', Yv = '<span class="vec">Y</span>';
    if (d.inf) {
      $('zcCompl').innerHTML = `${Zv} = ∞: Ȳ = 0, nessuna corrente può passare.`;
    } else {
      const colX = d.Z.im >= 0 ? 'var(--ind)' : 'var(--cap)';
      $('zcCompl').innerHTML = `${Zv} = <span class="r">${F.num(d.Z.re)}</span> ${d.Z.im < 0 ? '−' : '+'} <span style="color:${colX}">j${F.num(Math.abs(d.Z.im))}</span> Ω` +
        (d.zm > 0 ? `<br>= ${F.num(d.zm)} · e<sup>j${F.deg(d.phi)}</sup> Ω` : '');
    }
    L.scrivi($('zcRe'), d.inf ? '∞' : F.campo(d.Z.re));
    L.scrivi($('zcIm'), d.inf ? '∞' : F.campo(d.Z.im));
    $('zcRe').disabled = !ha('R');
    $('zcIm').disabled = S.tipo === 'R';
    let aiuto;
    if (singolo()) aiuto = { R: 'Per un resistore si può cambiare solo la parte reale.', L: 'Per un induttore si può cambiare solo la parte immaginaria.', C: 'Per un condensatore si può cambiare solo la parte immaginaria (negativa).' }[S.tipo];
    else if (inSerie()) aiuto = 'Scrivendo R e X cambiano ' + (ha('R') ? 'R e ' : '') + (ha('C') ? 'C' : 'L') + (ha('L') && ha('C') ? ' (L resta fisso)' : '') + '.';
    else aiuto = 'Scrivendo R e X cambiano ' + (ha('R') ? 'R e ' : '') + (S.tipo === 'RC' ? 'C' : 'L') + (ha('L') && ha('C') ? ' (C resta fisso)' : '') + '.';
    $('zcAiuto').textContent = aiuto;

    const righe = ['<p><b>Impedenza di ciascun componente</b></p>'];
    if (ha('R')) righe.push(`<p>${Zk('R')} = R = <span class="r">${F.eng(d.R, 'Ω')}</span> (solo parte reale)</p>`);
    if (ha('L')) righe.push(`<p>${Zk('L')} = j${XL} = jωL = <span class="xl">j${F.eng(d.XL, 'Ω')}</span> (solo parte immaginaria, positiva)</p>`);
    if (ha('C')) righe.push(`<p>${Zk('C')} = −j${XC} = −j / (ωC) = <span class="xc">−j${F.eng(d.XC, 'Ω')}</span> (solo parte immaginaria, negativa)</p>`);

    if (singolo()) {
      // niente da sommare
    } else if (inSerie()) {
      const simb = S.tipo.split('').map(Zk).join(' + ');
      const num = [ha('R') ? F.num(d.R) : '', ha('L') ? '+ j' + F.num(d.XL) : '', ha('C') ? '− j' + F.num(d.XC) : ''].filter(Boolean).join(' ').replace(/^\+ /, '');
      righe.push(`<p><b>In serie le impedenze si sommano</b>: ${Zv} = ${simb} = ${num} = ${F.compl(d.Z, 'Ω')}</p>`);
    } else {
      righe.push(`<p><b>In parallelo si sommano le ammettenze</b>, cioè gli inversi delle impedenze (in siemens, S):</p>`);
      if (ha('R')) righe.push(`<p>1 / ${Zk('R')} = 1 / R = ${F.eng(d.G, 'S')}</p>`);
      if (ha('L')) righe.push(`<p>1 / ${Zk('L')} = 1 / (j${XL}) = −j / ${XL} = −j${F.eng(d.BL, 'S')}</p>`);
      if (ha('C')) righe.push(`<p>1 / ${Zk('C')} = 1 / (−j${XC}) = j / ${XC} = j${F.eng(d.BC, 'S')}</p>`);
      righe.push(`<p>${Yv} = G + jB = ${F.compl(d.Y, 'S')}</p>`);
      if (d.inf) righe.push('<p>L’ammettenza è zero, quindi l’impedenza è infinita.</p>');
      else righe.push(`<p>${Zv} = 1 / ${Yv} = (G − jB) / (G² + B²) = ${F.compl({ re: d.G, im: -d.B })} / ${F.num(d.G * d.G + d.B * d.B)} = ${F.compl(d.Z, 'Ω')}</p>`);
    }
    if (!d.inf) {
      righe.push(`<p><b>Parte reale</b>: resistenza <span class="r">R = ${F.eng(d.Z.re, 'Ω')}</span>. ` +
        `<b>Parte immaginaria</b>: reattanza <span class="${d.Z.im >= 0 ? 'xl' : 'xc'}">X = ${F.eng(d.Z.im, 'Ω')}</span>` +
        (d.Z.im > 0 ? ', positiva quindi induttiva.' : d.Z.im < 0 ? ', negativa quindi capacitiva.' : ', nulla.') + '</p>');
    }
    $('passC').innerHTML = righe.join('');
  }

  CO.aggiorna = function (riscalare = true) {
    const d = dati();
    if (riscalare || !sc) riscala(d);
    disegna(d);
    testi(d);
    campi(d);
    if (S.complessa) complessa(d);
  };

  /* ---------- avvio ---------- */
  CO.avvia = function () {
    const ag = () => CO.aggiorna(true);
    const K = L.CURSORI, dalCursore = (v, r) => F.sig(r[0] * Math.pow(r[1] / r[0], v / 1000));
    const pos = v => v > 0;

    $('tipi').addEventListener('click', e => { const b = e.target.closest('[data-tipo]'); if (b) { S.tipo = b.dataset.tipo; ag(); } });
    $('coll').addEventListener('click', e => { const b = e.target.closest('[data-coll]'); if (b && !b.disabled) { S.coll = b.dataset.coll; ag(); } });

    L.legaCampo($('fVal'), v => { S.f = v; ag(); }, pos, ag);
    L.legaCampo($('rVal'), v => { S.R = v; ag(); }, pos, ag);
    L.legaCampo($('lVal'), v => { S.L = v / 1e3; ag(); }, pos, ag);
    L.legaCampo($('cVal'), v => { S.C = v / 1e6; ag(); }, pos, ag);
    $('fR').addEventListener('input', e => { S.f = dalCursore(+e.target.value, K.f); ag(); });
    $('rR').addEventListener('input', e => { S.R = dalCursore(+e.target.value, K.R); ag(); });
    $('lR').addEventListener('input', e => { S.L = dalCursore(+e.target.value, K.L); ag(); });
    $('cR').addEventListener('input', e => { S.C = dalCursore(+e.target.value, K.C); ag(); });
    $('goRis').addEventListener('click', () => { const d = dati(); if (d.f0) { S.f = d.f0; ag(); } });

    const cur = () => dati().Z;
    L.legaCampo($('zcRe'), v => { impostaZ(v, cur().im); ag(); }, null, ag);
    L.legaCampo($('zcIm'), v => { impostaZ(cur().re, v); ag(); }, null, ag);

    piano = new P.Piano($('svgComp'), { sposta, fine() { CO.aggiorna(true); } }, P.VISTA_DESTRA);
  };
})(window.LAB);

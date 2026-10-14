/* =========================================================
   MAIN — collega interfaccia, calcoli, grafici e audio
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const col = Grafico.col;
  const DUE_PI = 2 * Math.PI;
  const SRA = CONFIG.armoniche.sampleRate;

  const rimanda = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const rms = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; return Math.sqrt(s / Math.max(1, a.length)); };
  const pct = x => isFinite(x) ? Fmt.num(x * 100, 3) + ' %' : '—';

  /* ---------------- STATO ---------------- */
  const stato = {
    sorgente: 'armoniche',
    f0: 220, a0: 1,
    disturbi: Array.from({ length: CONFIG.maxDisturbi }, () => ({ on: false, f: 1000, A: 0.2 })),
    filtro: { ...CONFIG.filtroIniziale },
    vista: {
      in: 'tempo', out: 'tempo',
      periodi: 3, finestraMs: 30, posizione: 30,
      scala: 'db', mostraFiltro: true, mostraPulito: true, sovrapponi: true
    },
    cursoreF: null,
    audio: {
      brani: {}, brano: 'esempio', sr: CONFIG.audio.sampleRate,
      pulito: null, rumore: null, livello: CONFIG.audio.rumoreIniziale / 100, rmsPulito: 1,
      ingresso: null, uscita: null, uscitaPulita: null, chiaveUscitaPulita: '',
      picco: 1, spPulito: null, spIn: null, spOut: null, snrIn: Infinity, snrOut: Infinity, inCalcolo: false
    }
  };
  const A = stato.audio;

  const G = {
    in: new Grafico($('#cv-in')),
    out: new Grafico($('#cv-out')),
    modulo: new Grafico($('#cv-modulo'), { m: { l: 60, r: 16, t: 12, b: 24 } }),
    fase: new Grafico($('#cv-fase'))
  };

  /* ---------------- COMPONENTI DEL SEGNALE ---------------- */
  function compIngresso() {
    const c = [{ f: stato.f0, A: stato.a0, ph: 0, utile: true, nome: 'Segnale utile' }];
    stato.disturbi.forEach((d, i) => {
      if (d.on && d.A > 0 && d.f > 0) c.push({ f: d.f, A: d.A, ph: 0, utile: false, nome: 'Disturbo ' + (i + 1) });
    });
    return c;
  }
  function compUscita(cin) {
    return cin.map(c => {
      const h = Filtri.H(c.f, stato.filtro);
      return { ...c, A: c.A * Filtri.modulo(h), ph: c.ph + h.fase, h };
    });
  }
  const sommaMs = comp => ms => Segnali.valore(comp, ms / 1000);

  function legenda(sel, voci) {
    $(sel).innerHTML = voci.map(v => `<span><i class="${v.tipo || 'linea'}" style="--c: var(--${v.col})"></i>${v.t}</span>`).join('');
  }

  /* ---------------- GRAFICI: SEGNALE CON ARMONICHE ---------------- */
  function tempoArmoniche(g, lato, separati, legSel) {
    const cin = compIngresso(), comp = lato === 'in' ? cin : compUscita(cin);
    const colLato = lato === 'in' ? 'in' : 'out';
    const amp = cin.reduce((s, c) => s + c.A, 0) || 1;
    const yM = Grafico.tondo(amp * 1.08);
    Object.assign(g, { xLog: false, xMin: 0, xMax: stato.vista.periodi / Math.min(...cin.map(c => c.f)) * 1000, yMin: -yM, yMax: yM });
    g.prepara();
    g.assi({ xLabel: 'tempo (ms)', yLabel: 'tensione (V)' });
    const fMax = Math.max(...cin.map(c => c.f));
    const n = Math.min(24000, Math.max(g.pw * 2, fMax * g.xMax / 1000 * 24));
    const voci = [];
    g.dentro(() => {
      if (separati) {
        comp.forEach(c => g.funzione(ms => c.A * Math.sin(DUE_PI * c.f * ms / 1000 + c.ph),
          { col: col(c.utile ? colLato : 'disturbo'), w: c.utile ? 2.2 : 1.4, n, alpha: c.utile ? 1 : 0.85 }));
        g.funzione(sommaMs(comp), { col: col('inchiostro'), w: 1.4, n, alpha: 0.5, dash: [5, 4] });
        voci.push({ t: 'segnale utile', col: colLato }, { t: 'componenti indesiderate', col: 'disturbo' },
          { t: 'somma', col: 'inchiostro', tipo: 'tratteggio' });
      } else {
        if (lato === 'out' && stato.vista.sovrapponi) {
          g.funzione(sommaMs(cin), { col: col('in'), w: 1.6, n, alpha: 0.3 });
        }
        const u = cin[0];
        g.funzione(ms => u.A * Math.sin(DUE_PI * u.f * ms / 1000), { col: col('tenue'), w: 1.3, n, dash: [6, 5] });
        g.funzione(sommaMs(comp), { col: col(colLato), w: 2.4, n });
        voci.push({ t: lato === 'in' ? 'ingresso' : 'uscita', col: colLato });
        if (lato === 'out' && stato.vista.sovrapponi) voci.push({ t: 'ingresso', col: 'in', tipo: 'chiaro' });
        voci.push({ t: 'segnale utile da solo', col: 'tenue', tipo: 'tratteggio' });
      }
    });
    legenda(legSel, voci);
  }

  function spettroArmoniche(g, lato, legSel) {
    const cin = compIngresso(), comp = lato === 'in' ? cin : compUscita(cin);
    const colLato = lato === 'in' ? 'in' : 'out';
    const db = stato.vista.scala === 'db';
    const maxA = Math.max(...cin.map(c => c.A));
    Object.assign(g, {
      xLog: true, xMin: CONFIG.spettro.fMin, xMax: CONFIG.spettro.fMax,
      yMin: db ? CONFIG.spettro.dbMin : 0, yMax: db ? CONFIG.spettro.dbMax : Grafico.tondo(maxA * 1.15)
    });
    g.prepara();
    g.assi({ xLabel: 'frequenza (Hz)', yLabel: db ? 'ampiezza (dBV)' : 'ampiezza (V)', yPasso: db ? 20 : undefined });
    const val = a => db ? 20 * Math.log10(Math.max(a, 1e-9)) : a;
    const voci = [{ t: 'segnale utile', col: colLato, tipo: 'punto' }, { t: 'componenti indesiderate', col: 'disturbo', tipo: 'punto' }];
    g.dentro(() => {
      if (stato.vista.mostraFiltro) {
        g.funzione(f => {
          const h = Filtri.H(f, stato.filtro);
          return db ? Filtri.dB(h) : Filtri.modulo(h) * g.yMax * 0.95;
        }, { col: col('filtro'), w: 1.8, dash: [7, 5] });
        voci.push({ t: db ? 'risposta del filtro (dB)' : 'risposta del filtro (scala relativa)', col: 'filtro', tipo: 'tratteggio' });
      }
      if (lato === 'out' && stato.vista.sovrapponi) {
        g.steli(cin.map(c => ({ x: c.f, y: val(c.A), col: col('in') })), { alpha: 0.22, w: 8, r: 6 });
        voci.push({ t: 'ingresso', col: 'in', tipo: 'chiaro' });
      }
      g.steli(comp.map(c => ({
        x: c.f, y: val(c.A), col: col(c.utile ? colLato : 'disturbo'),
        testo: db ? Fmt.fisso(val(c.A), 1) : Fmt.num(c.A, 2)
      })));
    });
    legenda(legSel, voci);
  }

  /* ---------------- GRAFICI: BRANO AUDIO ---------------- */
  function finestraAudio() {
    const dur = A.pulito.length / A.sr;
    const fin = Math.min(stato.vista.finestraMs / 1000, dur);
    const t0 = stato.vista.posizione / 100 * (dur - fin);
    return [t0 * 1000, (t0 + fin) * 1000];
  }

  function tempoAudio(g, lato, legSel) {
    const [a, b] = finestraAudio();
    const yM = Grafico.tondo(A.picco * 1.05);
    Object.assign(g, { xLog: false, xMin: a, xMax: b, yMin: -yM, yMax: yM });
    g.prepara();
    g.assi({ xLabel: 'tempo (ms)', yLabel: 'ampiezza' });
    const voci = [];
    g.dentro(() => {
      if (lato === 'in') {
        g.forma(A.ingresso, A.sr, { col: col('in'), w: 1.4 });
        voci.push({ t: 'brano con rumore', col: 'in' });
      } else {
        if (stato.vista.sovrapponi) { g.forma(A.ingresso, A.sr, { col: col('in'), w: 1.4, alpha: 0.25 }); voci.push({ t: 'ingresso', col: 'in', tipo: 'chiaro' }); }
        g.forma(A.uscita, A.sr, { col: col('out'), w: 1.6 });
        voci.unshift({ t: 'uscita filtrata', col: 'out' });
      }
      if (stato.vista.mostraPulito) {
        g.forma(A.pulito, A.sr, { col: col('inchiostro'), w: 1.8, alpha: 0.9 });
        voci.push({ t: 'brano senza rumore', col: 'inchiostro' });
      }
    });
    legenda(legSel, voci);
  }

  function spettroAudio(g, lato, legSel) {
    const db = stato.vista.scala === 'db';
    let rif = 1e-12;
    for (const v of A.spIn.a) if (v > rif) rif = v;
    const tr = arr => Array.from(arr, v => db ? 20 * Math.log10(Math.max(v / rif, 1e-9)) : v / rif);
    Object.assign(g, {
      xLog: true, xMin: 20, xMax: A.sr / 2,
      yMin: db ? -90 : 0, yMax: db ? 5 : 1.05
    });
    g.prepara();
    g.assi({ xLabel: 'frequenza (Hz)', yLabel: db ? 'ampiezza relativa (dB)' : 'ampiezza relativa', yPasso: db ? 15 : undefined });
    const voci = [];
    g.dentro(() => {
      if (stato.vista.mostraFiltro) {
        g.funzione(f => { const h = Filtri.H(f, stato.filtro); return db ? Filtri.dB(h) : Filtri.modulo(h); },
          { col: col('filtro'), w: 1.8, dash: [7, 5] });
        voci.push({ t: 'risposta del filtro', col: 'filtro', tipo: 'tratteggio' });
      }
      if (lato === 'in') {
        g.curvaDensa(A.spIn.f, tr(A.spIn.a), { col: col('in'), w: 1.6 });
        voci.unshift({ t: 'brano con rumore', col: 'in' });
      } else {
        if (stato.vista.sovrapponi) { g.curvaDensa(A.spIn.f, tr(A.spIn.a), { col: col('in'), w: 4, alpha: 0.22 }); voci.push({ t: 'ingresso', col: 'in', tipo: 'chiaro' }); }
        g.curvaDensa(A.spOut.f, tr(A.spOut.a), { col: col('out'), w: 1.6 });
        voci.unshift({ t: 'uscita filtrata', col: 'out' });
      }
      if (stato.vista.mostraPulito) {
        g.curvaDensa(A.spPulito.f, tr(A.spPulito.a), { col: col('inchiostro'), w: 1.2, alpha: 0.7 });
        voci.push({ t: 'brano senza rumore', col: 'inchiostro' });
      }
    });
    legenda(legSel, voci);
  }

  /* ---------------- DISEGNO DELLE TRE SEZIONI ---------------- */
  function disegnaLato(lato) {
    const g = G[lato], v = stato.vista[lato], leg = '#leg-' + lato;
    if (stato.sorgente === 'armoniche') {
      if (v === 'spettro') spettroArmoniche(g, lato, leg);
      else tempoArmoniche(g, lato, v === 'componenti', leg);
      return;
    }
    const pronto = A.ingresso && (lato === 'in' || A.uscita);
    if (!pronto) { g.messaggio(A.pulito ? 'Calcolo del filtraggio…' : 'Caricamento del brano…'); $(leg).innerHTML = ''; return; }
    if (v === 'spettro') spettroAudio(g, lato, leg); else tempoAudio(g, lato, leg);
  }

  function disegnaBode() {
    const p = stato.filtro, gm = G.modulo, gf = G.fase;
    const tagli = Filtri.tagliCelle(p);
    const comp = stato.sorgente === 'armoniche' ? compUscita(compIngresso()) : [];
    const base = { xLog: true, xMin: CONFIG.bode.fMin, xMax: CONFIG.bode.fMax };

    Object.assign(gm, base, { yMin: CONFIG.bode.dbMin, yMax: CONFIG.bode.dbMax });
    gm.prepara();
    gm.assi({ yLabel: 'modulo |H| (dB)', yPasso: 20 });
    gm.dentro(() => {
      gm.linH(-3, { col: col('tenue'), dash: [4, 4], w: 1, testo: '−3 dB' });
      tagli.forEach(t => gm.linV(t.f, { col: col('filtro'), dash: [3, 4], w: 1, testo: t.nome }));
      gm.funzione(f => Filtri.dB(Filtri.H(f, p)), { col: col('filtro'), w: 2.6 });
      if (stato.cursoreF) gm.linV(stato.cursoreF, { col: col('inchiostro'), w: 1, alpha: 0.45 });
      comp.forEach(c => gm.punto(c.f, Filtri.dB(c.h), { col: col(c.utile ? 'in' : 'disturbo'), testo: c.utile ? Fmt.db(Filtri.dB(c.h)) : '' }));
    });

    const n = p.stadi || 1;
    const [yMin, yMax] = p.tipo === 'lp' ? [-90 * n - 15, 15] : p.tipo === 'hp' ? [-15, 90 * n + 15] : [-105, 105];
    Object.assign(gf, base, { yMin, yMax });
    gf.prepara();
    gf.assi({ xLabel: 'frequenza (Hz)', yLabel: 'fase (°)', yPasso: 45, yFmt: v => Fmt.num(v) + '°' });
    gf.dentro(() => {
      tagli.forEach(t => gf.linV(t.f, { col: col('filtro'), dash: [3, 4], w: 1 }));
      gf.funzione(f => Filtri.gradi(Filtri.H(f, p)), { col: col('filtro'), w: 2.4 });
      if (stato.cursoreF) gf.linV(stato.cursoreF, { col: col('inchiostro'), w: 1, alpha: 0.45 });
      comp.forEach(c => gf.punto(c.f, Filtri.gradi(c.h), { col: col(c.utile ? 'in' : 'disturbo'), r: 4 }));
    });

    const voci = [{ t: 'risposta del filtro', col: 'filtro' }, { t: 'frequenze di taglio', col: 'filtro', tipo: 'tratteggio' }];
    if (comp.length) voci.push({ t: 'segnale utile', col: 'in', tipo: 'punto' }, { t: 'componenti indesiderate', col: 'disturbo', tipo: 'punto' });
    legenda('#leg-bode', voci);
  }

  function disegnaTabella() {
    const tab = $('#tab-effetto');
    if (stato.sorgente !== 'armoniche') { tab.hidden = true; return; }
    tab.hidden = false;
    const cin = compIngresso(), cout = compUscita(cin);
    tab.innerHTML = `<caption>Che cosa fa il filtro a ogni componente</caption>
      <thead><tr><th scope="col">Componente</th><th scope="col">Frequenza</th><th scope="col">Ingresso</th>
      <th scope="col">Guadagno</th><th scope="col">Uscita</th><th scope="col">Sfasamento</th></tr></thead>
      <tbody>${cout.map((c, i) => `<tr class="${c.utile ? 'utile' : 'disturbo'}">
        <th scope="row"><i></i>${c.nome}</th><td>${Fmt.hz(c.f)}</td><td>${Fmt.num(cin[i].A, 3)} V</td>
        <td>${Fmt.db(Filtri.dB(c.h))}</td><td>${Fmt.num(c.A, 3)} V</td><td>${Fmt.num(Filtri.gradi(c.h), 3)}°</td></tr>`).join('')}
      </tbody>`;
  }

  function disegnaRisultato() {
    const el = $('#risultato');
    if (stato.sorgente === 'armoniche') {
      const cin = compIngresso(), cout = compUscita(cin);
      if (cin.length === 1) { el.textContent = 'Non ci sono componenti indesiderate attive: aggiungine qualcuna nella sezione 1.'; return; }
      const peso = cc => Math.sqrt(cc.slice(1).reduce((s, c) => s + c.A * c.A, 0)) / cc[0].A;
      el.innerHTML = `Peso dei disturbi rispetto al segnale utile: <b>${pct(peso(cin))}</b> in ingresso, <b>${pct(peso(cout))}</b> in uscita.
        Il segnale utile passa da ${Fmt.num(cin[0].A, 3)} V a ${Fmt.num(cout[0].A, 3)} V.`;
    } else {
      if (!A.uscita) { el.textContent = 'Calcolo del filtraggio in corso…'; return; }
      const snr = v => isFinite(v) ? Fmt.fisso(v, 1) + ' dB' : 'nessun rumore';
      el.innerHTML = `Rapporto segnale/rumore: <b>${snr(A.snrIn)}</b> in ingresso, <b>${snr(A.snrOut)}</b> in uscita.
        Più è alto, più il brano si sente pulito.`;
    }
  }

  function disegnaEsito() {
    const p = stato.filtro, an = Filtri.analisi(p), t = Filtri.tagliCelle(p);
    let h;
    if (p.tipo === 'lp' || p.tipo === 'hp') {
      const n = p.stadi;
      const fe = p.tipo === 'lp' ? an.fAlta : an.fBassa;
      h = `Ogni cella taglia a f<sub>c</sub> = 1/(2πRC) = <b>${Fmt.hz(t[0].f)}</b>.`;
      if (n > 1) h += ` Con ${n} celle in cascata il taglio a −3 dB ${p.tipo === 'lp' ? 'scende' : 'sale'} a <b>${Fmt.hz(fe)}</b>.`;
      h += ` Lontano dal taglio il guadagno ${p.tipo === 'lp' ? 'cala' : 'cresce'} di ${20 * n} dB per decade.`;
    } else {
      h = `f<sub>L</sub> = <b>${Fmt.hz(t[0].f)}</b> (sezione passa alto), f<sub>H</sub> = <b>${Fmt.hz(t[1].f)}</b> (sezione passa basso).`;
      if (an.fBassa && an.fAlta) h += ` Banda passante a −3 dB: da ${Fmt.hz(an.fBassa)} a ${Fmt.hz(an.fAlta)}.`;
      h += ` Guadagno massimo ${Fmt.db(an.picco)} a ${Fmt.hz(an.fPicco)}.`;
      if (t[0].f >= t[1].f) h += ' Attenzione: f<sub>L</sub> è sopra f<sub>H</sub>, quindi la banda si chiude.';
      else if (!p.buffer) h += ' Senza buffer la seconda sezione carica la prima: prova ad attivarlo e confronta.';
    }
    $('#esito-filtro').innerHTML = h;
  }

  function disegnaTutto() {
    disegnaLato('in'); disegnaLato('out'); disegnaBode(); disegnaTabella(); disegnaRisultato();
  }
  let rafDisegno = 0;
  const pianificaDisegno = () => {
    cancelAnimationFrame(rafDisegno);
    rafDisegno = requestAnimationFrame(disegnaTutto);
  };

  /* ---------------- AUDIO: BRANO + RUMORE ---------------- */
  function normalizza(d) {
    let p = 0; for (const v of d) p = Math.max(p, Math.abs(v));
    if (p > 0) for (let i = 0; i < d.length; i++) d[i] *= 0.8 / p;
    return d;
  }

  function impostaBrano(dati) {
    A.pulito = dati;
    A.rmsPulito = rms(dati) || 1;
    A.rumore = Segnali.rumoreBianco(dati.length);
    A.spPulito = Fft.spettro(dati, A.sr);
    A.chiaveUscitaPulita = '';
    A.uscita = null;
    ricalcolaIngressoAudio();
  }

  function ricalcolaIngressoAudio() {
    if (!A.pulito) return;
    const k = A.livello * A.rmsPulito, n = A.pulito.length, x = new Float32Array(n);
    let pk = 0;
    for (let i = 0; i < n; i++) { const v = A.pulito[i] + k * A.rumore[i]; x[i] = v; if (Math.abs(v) > pk) pk = Math.abs(v); }
    A.ingresso = x; A.picco = pk || 1;
    A.spIn = Fft.spettro(x, A.sr);
    A.snrIn = A.livello > 0 ? -20 * Math.log10(A.livello) : Infinity;
    if (stato.sorgente === 'audio') { disegnaLato('in'); disegnaRisultato(); }
    pianificaFiltraggio();
    riproduzioneRimandata();
  }

  function filtraAudio() {
    if (!A.ingresso) return;
    const p = { ...stato.filtro }, Hf = f => Filtri.H(f, p), chiave = JSON.stringify(p);
    if (A.chiaveUscitaPulita !== chiave) { A.uscitaPulita = Fft.filtra(A.pulito, A.sr, Hf); A.chiaveUscitaPulita = chiave; }
    A.uscita = Fft.filtra(A.ingresso, A.sr, Hf);
    let su = 0, sn = 0;
    for (let i = 0; i < A.uscita.length; i++) {
      const u = A.uscitaPulita[i], d = A.uscita[i] - u;
      su += u * u; sn += d * d;
    }
    A.snrOut = sn > 0 ? 10 * Math.log10(su / sn) : Infinity;
    A.spOut = Fft.spettro(A.uscita, A.sr);
    if (stato.sorgente === 'audio') { disegnaLato('out'); disegnaRisultato(); aggiornaRiproduzione(); }
  }
  const pianificaFiltraggio = rimanda(filtraAudio, 160);

  async function caricaEsempio() {
    const info = $('#info-audio');
    if (A.brani.esempio) { impostaBrano(A.brani.esempio.dati); info.textContent = A.brani.esempio.info; return; }
    info.textContent = 'Caricamento del brano di esempio…';
    let dati, testo;
    try {
      const r = await fetch(CONFIG.audio.file);
      if (!r.ok) throw new Error(r.status);
      dati = (await Riproduttore.decodifica(await r.arrayBuffer(), A.sr, CONFIG.audio.durataMax)).dati;
      testo = `${CONFIG.audio.nome}, letto dal file ${CONFIG.audio.file}.`;
    } catch (e) {
      dati = Segnali.melodia(A.sr);
      testo = `${CONFIG.audio.nome}, generato nel browser: il file WAV si legge solo aprendo la pagina da un server web (vedi LEGGIMI).`;
    }
    normalizza(dati);
    testo += ` Durata ${Fmt.num(dati.length / A.sr, 3)} s. La melodia sta tra 196 Hz e circa 1,8 kHz con le sue armoniche; il rumore bianco copre tutte le frequenze.`;
    A.brani.esempio = { dati, info: testo };
    if (A.brano === 'esempio') { info.textContent = testo; impostaBrano(dati); }
  }

  async function caricaFile(file) {
    const info = $('#info-audio');
    info.textContent = `Lettura di ${file.name}…`;
    try {
      const r = await Riproduttore.decodifica(await file.arrayBuffer(), A.sr, CONFIG.audio.durataMax);
      normalizza(r.dati);
      let testo = `${file.name}, ${Fmt.num(r.dati.length / A.sr, 3)} s`;
      if (r.tagliato) testo += ` (solo i primi ${CONFIG.audio.durataMax} s di ${Fmt.num(r.durataOriginale, 3)})`;
      testo += '.';
      A.brani.utente = { dati: r.dati, info: testo };
      const opt = $('#brano option[value="utente"]');
      opt.hidden = false; opt.textContent = file.name;
      $('#brano').value = 'utente'; A.brano = 'utente';
      Riproduttore.ferma();
      info.textContent = testo;
      impostaBrano(r.dati);
    } catch (e) {
      info.textContent = `Il browser non riesce a leggere ${file.name}. Prova con un file MP3, WAV oppure OGG.`;
    }
  }

  /* ---------------- RIPRODUZIONE ---------------- */
  function datiDaSuonare(k) {
    if (stato.sorgente === 'armoniche') {
      const cin = compIngresso();
      const g = 0.8 / (cin.reduce((s, c) => s + c.A, 0) || 1);
      if (k === 'ingresso') return { d: Segnali.buffer(cin, SRA, 1), sr: SRA, g };
      if (k === 'uscita') return { d: Segnali.buffer(compUscita(cin), SRA, 1), sr: SRA, g };
      return null;
    }
    const d = k === 'pulito' ? A.pulito : k === 'ingresso' ? A.ingresso : A.uscita;
    return d ? { d, sr: A.sr, g: 0.9 / A.picco } : null;
  }

  function suona(k) {
    if (Riproduttore.chiave === k) { Riproduttore.ferma(); return; }
    const x = datiDaSuonare(k);
    if (!x) return;
    Riproduttore.suona(k, x.d, x.sr, x.g, Riproduttore.chiave !== null);
  }

  function aggiornaRiproduzione() {
    const k = Riproduttore.chiave;
    if (!k) return;
    const x = datiDaSuonare(k);
    if (x) Riproduttore.suona(k, x.d, x.sr, x.g, true); else Riproduttore.ferma();
  }
  const riproduzioneRimandata = rimanda(aggiornaRiproduzione, 120);

  Riproduttore.onCambio = k => {
    $$('[data-play]').forEach(b => {
      const attivo = b.dataset.play === k;
      b.setAttribute('aria-pressed', String(attivo));
      $('.icona', b).textContent = attivo ? '■' : '▶';
      $('.testo', b).textContent = attivo ? 'Ferma' : b.dataset.etichetta;
    });
  };

  /* ---------------- CAMBIAMENTI ---------------- */
  function cambiatoIngresso() {
    aggiornaMultipli();
    disegnaTutto();
    riproduzioneRimandata();
  }

  function cambiatoFiltro() {
    aggiornaFc();
    Schema.disegna($('#schema'), stato.filtro);
    disegnaEsito();
    if (stato.sorgente === 'armoniche') {
      disegnaTutto();
      riproduzioneRimandata();
    } else {
      disegnaBode();
      disegnaLato('in');
      pianificaFiltraggio();
    }
  }

  /* ---------------- INTERFACCIA: INGRESSO ---------------- */
  const righeDisturbi = [];

  function costruisciDisturbi() {
    const tb = $('#tab-disturbi');
    stato.disturbi.forEach((d, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><input type="checkbox" aria-label="Attiva il disturbo ${i + 1}"></td>
        <td><input type="number" min="1" max="${CONFIG.armoniche.fMax}" step="1" aria-label="Frequenza del disturbo ${i + 1} in hertz"></td>
        <td><input type="number" min="0" max="5" step="0.05" aria-label="Ampiezza del disturbo ${i + 1} in volt"></td>
        <td class="multiplo"></td>`;
      const [cb, nf, na] = $$('input', tr);
      cb.addEventListener('change', () => { d.on = cb.checked; tr.classList.toggle('spento', !d.on); cambiatoIngresso(); });
      nf.addEventListener('input', () => {
        const v = Math.round(+nf.value);
        if (v >= 1 && v <= CONFIG.armoniche.fMax) { d.f = v; cambiatoIngresso(); }
      });
      na.addEventListener('input', () => { const v = +na.value; if (v >= 0 && v <= 5) { d.A = v; cambiatoIngresso(); } });
      tr.mostra = () => { cb.checked = d.on; nf.value = d.f; na.value = d.A; tr.classList.toggle('spento', !d.on); };
      tb.appendChild(tr);
      righeDisturbi.push(tr);
    });
  }

  function aggiornaMultipli() {
    righeDisturbi.forEach((tr, i) => { $('.multiplo', tr).textContent = Fmt.num(stato.disturbi[i].f / stato.f0, 3) + '×'; });
  }

  function mostraIngresso() {
    $('#f0').value = stato.f0;
    $('#a0').value = stato.a0;
    righeDisturbi.forEach(tr => tr.mostra());
  }

  function applicaPreset(i) {
    const pr = CONFIG.preset[i];
    if (!pr) return;
    stato.f0 = pr.f0; stato.a0 = pr.a0;
    stato.disturbi.forEach((d, k) => {
      const x = pr.disturbi[k];
      if (x) { d.on = true; d.f = Math.round(x[0]); d.A = +x[1].toFixed(3); } else d.on = false;
    });
    if (pr.filtro) Object.assign(stato.filtro, pr.filtro);
    $('#descr-preset').textContent = pr.descr || '';
    mostraIngresso();
    aggiornaMultipli();
    impostaTipo(stato.filtro.tipo);
  }

  /* ---------------- INTERFACCIA: FILTRO ---------------- */
  const UNITA = { R: [['Ω', 1], ['kΩ', 1e3], ['MΩ', 1e6]], C: [['pF', 1e-12], ['nF', 1e-9], ['µF', 1e-6]] };
  const SLIDER = { R: [1, 7], C: [-11, -4] };   // esponenti di 10: R da 10 Ω a 10 MΩ, C da 10 pF a 100 µF
  let campi = {}, campiFc = [];

  const scegliUnita = (tipo, v) => {
    const u = UNITA[tipo];
    for (let i = u.length - 1; i >= 0; i--) if (v >= u[i][1] * 0.9995) return u[i][1];
    return u[0][1];
  };

  function campoRC(chiave, tipo, conIndice) {
    const el = document.createElement('div');
    el.className = 'rc';
    const id = 'in-' + chiave;
    el.innerHTML = `<label for="${id}">${tipo}${conIndice ? `<sub>${chiave[1]}</sub>` : ''}</label>
      <input id="${id}" type="number" min="0" step="any">
      <select aria-label="Unità di misura di ${chiave}">${UNITA[tipo].map(([u, k]) => `<option value="${k}">${u}</option>`).join('')}</select>
      <input type="range" min="${SLIDER[tipo][0]}" max="${SLIDER[tipo][1]}" step="0.01" aria-label="Regola ${chiave}">`;
    const num = $('input[type="number"]', el), sel = $('select', el), rng = $('input[type="range"]', el);
    const mostra = v => {
      const u = scegliUnita(tipo, v);
      sel.value = String(u);
      num.value = +(v / u).toPrecision(4);
      rng.value = Math.log10(v);
    };
    const daiCampi = () => {
      const v = parseFloat(num.value) * parseFloat(sel.value);
      if (v > 0 && isFinite(v)) { stato.filtro[chiave] = v; rng.value = Math.log10(v); cambiatoFiltro(); }
    };
    num.addEventListener('input', daiCampi);
    sel.addEventListener('change', daiCampi);
    rng.addEventListener('input', () => {
      const v = +(10 ** parseFloat(rng.value)).toPrecision(3);
      stato.filtro[chiave] = v;
      const u = scegliUnita(tipo, v);
      sel.value = String(u); num.value = +(v / u).toPrecision(4);
      cambiatoFiltro();
    });
    mostra(stato.filtro[chiave]);
    el.mostra = mostra;
    return el;
  }

  function campoFc(cella, nomeHtml) {
    const el = document.createElement('div');
    el.className = 'fc';
    const id = 'fc-' + cella;
    el.innerHTML = `<label for="${id}" title="Scrivi una frequenza: R viene ricalcolata, C resta uguale">${nomeHtml} = 1/(2πRC)</label>
      <span><input id="${id}" type="number" min="0.1" step="any"> Hz</span>`;
    const inp = $('input', el);
    inp.addEventListener('change', () => {
      const fc = +inp.value, C = stato.filtro['C' + cella];
      if (fc > 0) {
        const R = +(1 / (DUE_PI * fc * C)).toPrecision(3);
        stato.filtro['R' + cella] = R;
        campi['R' + cella].mostra(R);
        cambiatoFiltro();
      }
    });
    campiFc.push({ cella, inp });
    return el;
  }

  function aggiornaFc() {
    campiFc.forEach(({ cella, inp }) => {
      if (document.activeElement !== inp) inp.value = +Filtri.fc(stato.filtro['R' + cella], stato.filtro['C' + cella]).toPrecision(4);
    });
  }

  function costruisciGruppi() {
    const cont = $('#gruppi-rc');
    cont.innerHTML = ''; campi = {}; campiFc = [];
    const t = stato.filtro.tipo, bp = t === 'bp';
    const gruppi = bp
      ? [{ titolo: 'Sezione passa alto', nota: 'C<sub>1</sub> in serie, R<sub>1</sub> verso massa', campi: [['C1', 'C'], ['R1', 'R']], cella: 1, fc: 'f<sub>L</sub>' },
         { titolo: 'Sezione passa basso', nota: 'R<sub>2</sub> in serie, C<sub>2</sub> verso massa', campi: [['R2', 'R'], ['C2', 'C']], cella: 2, fc: 'f<sub>H</sub>' }]
      : [{ titolo: t === 'lp' ? 'Cella passa basso' : 'Cella passa alto',
           nota: t === 'lp' ? 'R in serie, C verso massa' : 'C in serie, R verso massa',
           campi: t === 'lp' ? [['R1', 'R'], ['C1', 'C']] : [['C1', 'C'], ['R1', 'R']], cella: 1, fc: 'f<sub>c</sub>' }];
    for (const g of gruppi) {
      const fs = document.createElement('fieldset');
      fs.className = 'gruppo-rc';
      fs.innerHTML = `<legend>${g.titolo}</legend><p class="nota">${g.nota}</p>`;
      for (const [k, tipo] of g.campi) { const el = campoRC(k, tipo, bp); fs.appendChild(el); campi[k] = el; }
      fs.appendChild(campoFc(g.cella, g.fc));
      cont.appendChild(fs);
    }
  }

  function impostaTipo(t) {
    stato.filtro.tipo = t;
    $$('input[name="tipo"]').forEach(r => { r.checked = r.value === t; });
    costruisciGruppi();
    $('#campo-stadi').hidden = t === 'bp';
    $('#campo-buffer').hidden = t !== 'bp';
    $('#stadi').value = String(stato.filtro.stadi);
    $('#buffer').checked = !!stato.filtro.buffer;
    cambiatoFiltro();
  }

  /* ---------------- SORGENTE E VISTE ---------------- */
  function impostaSorgente(s) {
    stato.sorgente = s;
    Riproduttore.ferma();
    $('#pannello-armoniche').hidden = s !== 'armoniche';
    $('#pannello-audio').hidden = s !== 'audio';
    $$('[data-modo]').forEach(e => { e.hidden = e.dataset.modo !== s; });
    if (s === 'audio') {
      ['in', 'out'].forEach(l => { if (stato.vista[l] === 'componenti') stato.vista[l] = 'tempo'; });
      if (!A.pulito) caricaEsempio(); else pianificaFiltraggio();
    }
    aggiornaSchede();
    disegnaTutto();
  }

  function aggiornaSchede() {
    $$('.schede').forEach(sc => {
      $$('button', sc).forEach(b => b.setAttribute('aria-selected', String(b.dataset.vista === stato.vista[sc.dataset.lato])));
    });
  }

  function leggiCursore(e) {
    const g = G.modulo, x = e.offsetX;
    const lettura = $('#lettura-bode');
    if (x < g.m.l || x > g.m.l + g.pw) {
      stato.cursoreF = null;
      lettura.textContent = 'Passa il puntatore sul diagramma di Bode per leggere guadagno e fase.';
    } else {
      const f = g.Xinv(x), h = Filtri.H(f, stato.filtro);
      stato.cursoreF = f;
      lettura.innerHTML = `<b>f = ${Fmt.hz(f)}</b><span>guadagno ${Fmt.db(Filtri.dB(h))}, cioè ×${Fmt.num(Filtri.modulo(h), 3)}</span><span>fase ${Fmt.num(Filtri.gradi(h), 3)}°</span>`;
    }
    disegnaBode();
  }

  /* ---------------- AVVIO ---------------- */
  function init() {
    $('#preset').innerHTML = CONFIG.preset.map((p, i) => `<option value="${i}">${p.nome}</option>`).join('');
    costruisciDisturbi();

    // ingresso
    $('#preset').addEventListener('change', e => applicaPreset(+e.target.value));
    $$('input[name="sorgente"]').forEach(r => r.addEventListener('change', () => impostaSorgente(r.value)));
    $('#f0').addEventListener('input', e => {
      const v = Math.round(+e.target.value);
      if (v >= 1 && v <= CONFIG.armoniche.fMax) { stato.f0 = v; cambiatoIngresso(); }
    });
    $('#a0').addEventListener('input', e => { const v = +e.target.value; if (v > 0 && v <= 5) { stato.a0 = v; cambiatoIngresso(); } });

    // audio
    const rumore = $('#rumore');
    const mostraRumore = () => { $('#rumore-val').textContent = rumore.value + ' %'; };
    rumore.value = CONFIG.audio.rumoreIniziale; mostraRumore();
    rumore.addEventListener('input', () => { A.livello = rumore.value / 100; mostraRumore(); ricalcolaIngressoAudio(); });
    $('#rigenera').addEventListener('click', () => { if (A.pulito) { A.rumore = Segnali.rumoreBianco(A.pulito.length); ricalcolaIngressoAudio(); } });
    $('#brano').addEventListener('change', e => {
      A.brano = e.target.value;
      Riproduttore.ferma();
      if (A.brano === 'esempio') caricaEsempio();
      else if (A.brani.utente) { $('#info-audio').textContent = A.brani.utente.info; impostaBrano(A.brani.utente.dati); }
    });
    $('#file-audio').addEventListener('change', e => { const f = e.target.files[0]; if (f) caricaFile(f); });

    // filtro
    $$('input[name="tipo"]').forEach(r => r.addEventListener('change', () => impostaTipo(r.value)));
    $('#stadi').addEventListener('change', e => { stato.filtro.stadi = +e.target.value; cambiatoFiltro(); });
    $('#buffer').addEventListener('change', e => { stato.filtro.buffer = e.target.checked; cambiatoFiltro(); });
    ['#cv-modulo', '#cv-fase'].forEach(s => {
      $(s).addEventListener('pointermove', leggiCursore);
      $(s).addEventListener('pointerleave', () => { stato.cursoreF = null; disegnaBode(); });
    });

    // viste
    $$('.schede').forEach(sc => sc.addEventListener('click', e => {
      const b = e.target.closest('button[data-vista]');
      if (!b) return;
      stato.vista[sc.dataset.lato] = b.dataset.vista;
      aggiornaSchede();
      disegnaLato(sc.dataset.lato);
    }));
    const opzione = (sel, chiave, conv, out) => $(sel).addEventListener('input', e => {
      stato.vista[chiave] = conv(e.target);
      if (out) $(out.sel).textContent = out.fmt(stato.vista[chiave]);
      disegnaLato('in'); disegnaLato('out');
    });
    opzione('#periodi', 'periodi', t => +t.value, { sel: '#periodi-val', fmt: v => v });
    opzione('#finestra', 'finestraMs', t => +t.value, { sel: '#finestra-val', fmt: v => v + ' ms' });
    opzione('#posizione', 'posizione', t => +t.value);
    opzione('#scala', 'scala', t => t.value);
    opzione('#mostra-filtro', 'mostraFiltro', t => t.checked);
    opzione('#mostra-pulito', 'mostraPulito', t => t.checked);
    opzione('#sovrapponi', 'sovrapponi', t => t.checked);

    // ascolto
    $$('[data-play]').forEach(b => b.addEventListener('click', () => suona(b.dataset.play)));
    $('#volume').addEventListener('input', e => Riproduttore.volume(+e.target.value));
    Riproduttore.vol = +$('#volume').value;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') Riproduttore.ferma(); });

    // ridisegno quando cambiano dimensioni o tema
    const ro = new ResizeObserver(pianificaDisegno);
    Object.values(G).forEach(g => ro.observe(g.cv));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', pianificaDisegno);
    if (document.fonts) document.fonts.ready.then(pianificaDisegno);

    applicaPreset(0);
    aggiornaSchede();
  }

  init();
})();

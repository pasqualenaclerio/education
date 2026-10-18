/* =========================================================
   MAIN — collega comandi, calcoli, schema, formule e grafici
   ========================================================= */
(() => {
  const C = window.CONFIG;
  const $ = s => document.querySelector(s);

  const stato = {
    modo: 'singola',                                      // 'singola' | 'serie' | 'parallelo'
    V: C.tensione.iniziale,
    R: C.resistenza.iniziale,
    gruppo: C.gruppo.iniziali.slice(0, C.gruppo.minimo),  // stesse resistenze per serie e parallelo
    serie: C.codiceColori.serieIniziale,
    potenza: false,
    tempo: C.energia.tempo,
    unita: C.energia.unita,
    prezzo: C.energia.prezzoKWh
  };

  const UNITA_TEMPO = { s: 1, min: 60, h: 3600, giorni: 86400 };

  /* ---------- pezzi di formula in HTML ---------- */
  const q = (s, t) => `<span class="q q-${t}">${s}</span>`;
  const fr = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
  const sV = q('V', 'v'), sI = q('I', 'i'), sR = q('R', 'r'), sP = q('P', 'p'), sE = q('E', 'p'), sT = q('t', 'p');
  const sReq = q('R<sub>eq</sub>', 'r');
  const sRk = k => q(`R<sub>${k}</sub>`, 'r');
  const sVk = k => q(`V<sub>${k}</sub>`, 'v');
  const sIk = k => q(`I<sub>${k}</sub>`, 'i');
  const sPk = k => q(`P<sub>${k}</sub>`, 'p');
  const nV = v => q(Fmt.si(v, 'V'), 'v');
  const nI = v => q(Fmt.si(v, 'A'), 'i');
  const nR = v => q(Fmt.si(v, 'Ω'), 'r');
  const nP = v => q(Fmt.si(v, 'W'), 'p');
  const tonde = s => `(${s})`;

  function riga(descr, simb, val, principale = false) {
    return `<div class="riga${principale ? ' principale' : ''}">` +
      (descr ? `<p class="descr">${descr}</p>` : '') +
      `<div class="simb">${simb}</div><div class="val">${val}</div></div>`;
  }

  /* ---------- calcolo ---------- */
  function calcola() {
    if (stato.modo === 'singola') return Circuito.singola(stato.V, stato.R);
    if (stato.modo === 'serie') return Circuito.serie(stato.V, stato.gruppo);
    return Circuito.parallelo(stato.V, stato.gruppo);
  }

  /* ---------- comando della tensione ---------- */
  const cursoreV = $('#cursoreV'), testoV = $('#testoV'), messaggioV = $('#messaggioV');
  Object.assign(cursoreV, { min: C.tensione.min, max: C.tensione.max, step: C.tensione.passo });
  cursoreV.addEventListener('input', () => {
    stato.V = parseFloat(cursoreV.value);
    messaggioV.hidden = true; testoV.classList.remove('errore');
    aggiorna();
  });
  testoV.addEventListener('change', () => {
    const v = Fmt.leggi(testoV.value);
    if (!isFinite(v) || v < C.tensione.min || v > C.tensione.max) {
      testoV.classList.add('errore');
      messaggioV.hidden = false;
      messaggioV.textContent = `Scrivi una tensione tra ${Fmt.num(C.tensione.min)} e ${Fmt.num(C.tensione.max)} V, per esempio 4,5.`;
      return;
    }
    testoV.classList.remove('errore'); messaggioV.hidden = true;
    stato.V = Fmt.arrotonda(v, 4);
    aggiorna();
  });

  /* ---------- comandi delle resistenze ---------- */
  const lmin = Math.log10(C.resistenza.min), lmax = Math.log10(C.resistenza.max);
  const daCursore = t => Fmt.arrotonda(10 ** (lmin + (lmax - lmin) * t / 1000), 2);
  const aCursore = R => Math.round((Math.log10(R) - lmin) / (lmax - lmin) * 1000);
  let controlliR = [];

  function creaControlloR({ nome, leggiValore, cambia, rimuovi, mini }) {
    const el = document.createElement('div');
    el.className = 'comando';
    el.style.setProperty('--tinta', 'var(--resistenza)');
    const id = 'r' + Math.random().toString(36).slice(2, 8);
    el.innerHTML = `
      <label class="nome" for="${id}">${nome}</label>
      <input type="range" id="${id}" min="0" max="1000" step="1">
      <span class="campo"><input type="text" class="testo" inputmode="decimal" aria-label="Valore in ohm"></span>
      ${rimuovi ? '<button type="button" class="rimuovi" aria-label="Togli questa resistenza" title="Togli questa resistenza">×</button>' : ''}
      <p class="messaggio" hidden></p>
      ${mini ? '<div class="mini"><span class="mini-svg"></span><button type="button" class="bottone piccolo commerciale"></button></div>' : ''}`;
    const cursore = el.querySelector('input[type=range]');
    const testo = el.querySelector('.testo');
    const msg = el.querySelector('.messaggio');

    cursore.addEventListener('input', () => {
      testo.classList.remove('errore'); msg.hidden = true;
      cambia(daCursore(+cursore.value));
    });
    testo.addEventListener('change', () => {
      const v = Fmt.leggi(testo.value);
      if (!isFinite(v) || v < C.resistenza.min || v > C.resistenza.max) {
        testo.classList.add('errore'); msg.hidden = false;
        msg.textContent = `Scrivi un valore tra ${Fmt.si(C.resistenza.min, 'Ω')} e ${Fmt.si(C.resistenza.max, 'Ω')}, per esempio 4,7k oppure 4k7.`;
        return;
      }
      testo.classList.remove('errore'); msg.hidden = true;
      cambia(Fmt.arrotonda(v, 3));
    });
    if (rimuovi) el.querySelector('.rimuovi').addEventListener('click', rimuovi);
    if (mini) el.querySelector('.commerciale').addEventListener('click', () => {
      cambia(CodiceColori.piuVicino(leggiValore(), stato.serie).valore);
    });

    function mostra() {
      const R = leggiValore();
      cursore.value = aCursore(R);
      if (document.activeElement !== testo) testo.value = Fmt.si(R, 'Ω');
      if (mini) {
        const s = CodiceColori.piuVicino(R, stato.serie);
        el.querySelector('.mini-svg').innerHTML = CodiceColori.svg(CodiceColori.bande(s, stato.serie), stato.serie);
        const b = el.querySelector('.commerciale');
        const uguale = Math.abs(s.valore - R) / R < 1e-6;
        b.textContent = uguale ? `${Fmt.si(s.valore, 'Ω')} è un valore ${stato.serie}` : `Usa ${Fmt.si(s.valore, 'Ω')} (${stato.serie})`;
        b.disabled = uguale;
      }
    }
    return { el, mostra };
  }

  function costruisciComandi() {
    const box = $('#comandiR');
    box.innerHTML = '';
    controlliR = [];
    if (stato.modo === 'singola') {
      controlliR.push(creaControlloR({
        nome: `Resistenza ${q('R', 'r')}`,
        leggiValore: () => stato.R,
        cambia: v => { stato.R = v; aggiorna(); }
      }));
    } else {
      stato.gruppo.forEach((_, k) => {
        controlliR.push(creaControlloR({
          nome: `Resistenza ${sRk(k + 1)}`,
          leggiValore: () => stato.gruppo[k],
          cambia: v => { stato.gruppo[k] = v; aggiorna(); },
          rimuovi: stato.gruppo.length > C.gruppo.minimo
            ? () => { stato.gruppo.splice(k, 1); costruisciComandi(); aggiorna(); } : null,
          mini: true
        }));
      });
    }
    controlliR.forEach(c => box.appendChild(c.el));
    if (stato.modo !== 'singola' && stato.gruppo.length < C.gruppo.massimo) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bottone aggiungi';
      b.textContent = 'Aggiungi una resistenza';
      b.addEventListener('click', () => {
        stato.gruppo.push(C.gruppo.iniziali[stato.gruppo.length] || 1000);
        costruisciComandi(); aggiorna();
      });
      box.appendChild(b);
    }
  }

  /* ---------- formule della legge di Ohm ---------- */
  function formule(ris) {
    const { V, I, Req, parti } = ris;
    const n = parti.length;
    let html = '', nota = '';

    if (stato.modo === 'singola') {
      const R = stato.R;
      html += riga('Trovi la corrente', `${sI} = ${fr(sV, sR)}`, `= ${fr(nV(V), nR(R))} = ${nI(I)}`, true);
      html += riga('Trovi la tensione', `${sV} = ${sR} · ${sI}`, `= ${nR(R)} · ${nI(I)} = ${nV(V)}`);
      html += riga('Trovi la resistenza', `${sR} = ${fr(sV, sI)}`,
        V > 0 ? `= ${fr(nV(V), nI(I))} = ${nR(R)}`
              : `<span class="tenue">con ${sV} = 0 non passa corrente: qui ${sR} non si può ricavare</span>`);
      nota = 'Se raddoppi la tensione, raddoppia la corrente. Se raddoppi la resistenza, la corrente si dimezza.';
    }

    if (stato.modo === 'serie') {
      const ks = parti.map((_, k) => k + 1);
      html += riga('Resistenza equivalente', `${sReq} = ${ks.map(sRk).join(' + ')}`,
        `= ${parti.map(p => nR(p.R)).join(' + ')} = ${nR(Req)}`, true);
      html += riga('Corrente, uguale in tutte le resistenze', `${sI} = ${fr(sV, sReq)}`,
        `= ${fr(nV(V), nR(Req))} = ${nI(I)}`);
      parti.forEach((p, k) => {
        html += riga(k === 0 ? 'Tensione su ogni resistenza' : '', `${sVk(k + 1)} = ${sRk(k + 1)} · ${sI}`,
          `= ${nR(p.R)} · ${nI(I)} = ${nV(p.V)}`);
      });
      html += riga('Le tensioni si sommano', `${sV} = ${ks.map(sVk).join(' + ')}`,
        `= ${parti.map(p => nV(p.V)).join(' + ')} = ${nV(V)}`);
      nota = 'In serie la resistenza equivalente è sempre più grande della resistenza più grande.';
    }

    if (stato.modo === 'parallelo') {
      const ks = parti.map((_, k) => k + 1);
      html += riga('Resistenza equivalente',
        `${sReq} = ${fr('1', ks.map(k => fr('1', sRk(k))).join(' + '))}`,
        `= ${fr('1', parti.map(p => fr('1', nR(p.R))).join(' + '))} = ${nR(Req)}`, true);
      if (n === 2) {
        html += riga('Con due resistenze: prodotto diviso somma',
          `${sReq} = ${fr(sRk(1) + ' · ' + sRk(2), sRk(1) + ' + ' + sRk(2))}`,
          `= ${fr(nR(parti[0].R) + ' · ' + nR(parti[1].R), nR(parti[0].R) + ' + ' + nR(parti[1].R))} = ${nR(Req)}`);
      }
      html += riga('Corrente totale dal generatore', `${sI} = ${fr(sV, sReq)}`,
        `= ${fr(nV(V), nR(Req))} = ${nI(I)}`);
      parti.forEach((p, k) => {
        html += riga(k === 0 ? 'Corrente in ogni ramo, stessa tensione per tutti' : '',
          `${sIk(k + 1)} = ${fr(sV, sRk(k + 1))}`, `= ${fr(nV(V), nR(p.R))} = ${nI(p.I)}`);
      });
      html += riga('Le correnti si sommano', `${sI} = ${ks.map(sIk).join(' + ')}`,
        `= ${parti.map(p => nI(p.I)).join(' + ')} = ${nI(I)}`);
      nota = 'In parallelo la resistenza equivalente è sempre più piccola della resistenza più piccola.';
    }

    $('#formule').innerHTML = html;
    $('#notaFormule').textContent = nota;
    $('#titoloFormule').textContent = stato.modo === 'singola' ? 'Legge di Ohm'
      : stato.modo === 'serie' ? 'Legge di Ohm in serie' : 'Legge di Ohm in parallelo';
  }

  /* ---------- grafico V–I ---------- */
  function grafico(ris) {
    const PED = ['₁', '₂', '₃'];
    const req = 'R<tspan dy="4" font-size="0.75em">eq</tspan>';
    const linee = stato.modo === 'singola'
      ? [{ R: stato.R, nome: 'R', principale: true }]
      : [...ris.parti.map((p, k) => ({ R: p.R, nome: 'R' + PED[k], principale: false })),
         { R: ris.Req, nome: req, principale: true }];
    Caratteristica.disegna($('#caratteristica'), { Vmax: C.tensione.max, linee, V: ris.V, I: ris.I });
    $('#didascaliaGrafico').textContent = stato.modo === 'singola'
      ? 'Con la stessa resistenza, la corrente cresce in proporzione alla tensione: il grafico è una retta. Il punto è il circuito adesso.'
      : 'Una retta per ogni resistenza. Più la retta è ripida, più la resistenza è piccola. La retta colorata è la resistenza equivalente.';
  }

  /* ---------- barra dell'intensità ---------- */
  function metro(I) {
    const a = C.animazione;
    const l0 = Math.log10(a.correnteMin), l1 = Math.log10(a.correnteMax);
    const t = I > 0 ? Math.min(1, Math.max(0.02, (Math.log10(I) - l0) / (l1 - l0))) : 0;
    $('#metroBarra').style.width = (t * 100).toFixed(1) + '%';
    $('#metroValore').textContent = Fmt.si(I, 'A');
    const tacche = $('#metroTacche');
    if (!tacche.childElementCount) {
      for (let e = Math.ceil(l0); e <= Math.floor(l1); e += 3) {
        const s = document.createElement('span');
        s.style.left = ((e - l0) / (l1 - l0) * 100) + '%';
        s.textContent = Fmt.si(10 ** e, 'A');
        tacche.appendChild(s);
      }
    }
  }

  /* ---------- codice colori ---------- */
  function colori(ris) {
    const singola = stato.modo === 'singola';
    const R = singola ? stato.R : ris.Req;
    const s = CodiceColori.piuVicino(R, stato.serie);
    const bande = CodiceColori.bande(s, stato.serie);
    const t = C.codiceColori.tolleranza[stato.serie];
    const scarto = (s.valore - R) / R * 100;
    const uguale = Math.abs(scarto) < 1e-4;

    document.querySelectorAll('#selettoreSerie button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.serie === stato.serie)));

    $('#coloriIntro').innerHTML = singola
      ? (uguale
          ? `${nR(R)} è un valore della serie ${stato.serie}: il resistore qui sotto ha proprio questo valore.`
          : `Hai impostato ${nR(R)}. Nella serie ${stato.serie} il resistore che si trova in commercio più vicino è ${nR(s.valore)} (scarto ${Fmt.num(scarto, 2)} %).`)
      : `Per sostituire tutto il gruppo con una sola resistenza serve ${sReq} = ${nR(R)}. ` +
        (uguale ? `È un valore della serie ${stato.serie}.`
                : `Nella serie ${stato.serie} la più vicina è ${nR(s.valore)} (scarto ${Fmt.num(scarto, 2)} %).`);

    $('#resistoreGrande').innerHTML = CodiceColori.svg(bande, stato.serie);
    $('#tabellaBande tbody').innerHTML = bande.map(b =>
      `<tr><td>${b.ruolo}</td><td><span class="campione" style="background:${b.hex}"></span>${b.nome}</td><td>${b.significato}</td></tr>`).join('');

    const cifre = s.cifre.join('');
    $('#coloriLettura').innerHTML =
      `Si legge: ${cifre} × ${(10 ** s.esp).toLocaleString('it-IT')} = ${nR(s.valore)} ± ${t} %. ` +
      `Il valore vero di un resistore così può stare tra ${nR(s.valore * (1 - t / 100))} e ${nR(s.valore * (1 + t / 100))}.`;

    const b = $('#usaCommerciale');
    b.hidden = !singola || uguale;
    b.textContent = `Usa ${Fmt.si(s.valore, 'Ω')} nel circuito`;
    b.onclick = () => { stato.R = s.valore; aggiorna(); };
  }

  /* ---------- potenza ed energia ---------- */
  function potenza(ris) {
    $('#pannelloPotenza').hidden = !stato.potenza;
    if (!stato.potenza) return;
    const { V, I, Req, P, parti } = ris;
    const singola = stato.modo === 'singola';
    const sRx = singola ? sR : sReq;

    let html = '';
    html += riga(singola ? 'Potenza della resistenza' : 'Potenza totale fornita dal generatore',
      `${sP} = ${sV} · ${sI}`, `= ${nV(V)} · ${nI(I)} = ${nP(P)}`, true);
    html += riga('Usando la legge di Ohm, anche', `${sP} = ${sRx} · ${sI}<sup>2</sup>`,
      `= ${nR(Req)} · ${tonde(nI(I))}<sup>2</sup> = ${nP(Req * I * I)}`);
    html += riga('', `${sP} = ${fr(`${sV}<sup>2</sup>`, sRx)}`,
      `= ${fr(`${tonde(nV(V))}<sup>2</sup>`, nR(Req))} = ${nP(V * V / Req)}`);
    if (!singola) {
      html += riga('Le potenze delle resistenze si sommano', `${sP} = ${parti.map((_, k) => sPk(k + 1)).join(' + ')}`,
        `= ${parti.map(p => nP(p.P)).join(' + ')} = ${nP(P)}`);
    }
    $('#formulePotenza').innerHTML = html;

    // tabella delle singole resistenze
    if (singola) {
      $('#tabellaPotenza').innerHTML = '';
    } else {
      $('#tabellaPotenza').innerHTML = `<table class="tabella-potenza">
        <thead><tr><th>Resistenza</th><th>Tensione</th><th>Corrente</th><th>Potenza</th></tr></thead>
        <tbody>${parti.map((p, k) => `<tr class="${p.P > C.potenzaNominale ? 'troppa' : ''}">
          <td>${sRk(k + 1)} = ${nR(p.R)}</td><td>${nV(p.V)}</td><td>${nI(p.I)}</td><td>${nP(p.P)}</td></tr>`).join('')}
        </tbody></table>`;
    }

    // avviso se una resistenza dissipa troppo
    const troppe = parti.map((p, k) => ({ ...p, k })).filter(p => p.P > C.potenzaNominale);
    const avviso = $('#avvisoPotenza');
    avviso.hidden = !troppe.length;
    if (troppe.length) {
      const nomi = troppe.map(p => (singola ? sR : sRk(p.k + 1)) + ` dissipa ${nP(p.P)}`).join(', ');
      avviso.innerHTML = `${nomi}: più di ${Fmt.si(C.potenzaNominale, 'W')}, la potenza che regge un resistore comune. ` +
        `Si scalderebbe troppo: servirebbe un resistore di potenza più grande. Nello schema il simbolo diventa arancione.`;
    }

    // energia
    const ts = stato.tempo * UNITA_TEMPO[stato.unita];
    const EJ = P * ts, EWh = EJ / 3600, EkWh = EWh / 1000;
    const NOMI = { s: ['secondo', 'secondi'], min: ['minuto', 'minuti'], h: ['ora', 'ore'], giorni: ['giorno', 'giorni'] };
    const nomeUnita = NOMI[stato.unita][stato.tempo === 1 ? 0 : 1];
    let e = '';
    e += riga('Energia in joule (tempo in secondi)', `${sE} = ${sP} · ${sT}`,
      `= ${nP(P)} · ${q(Fmt.num(ts, 4) + '\u00A0s', 'p')} = ${q(Fmt.si(EJ, 'J'), 'p')}`, true);
    e += riga('Energia in wattora (tempo in ore)', `${sE} = ${sP} · ${sT}`,
      `= ${nP(P)} · ${q(Fmt.num(ts / 3600, 4) + '\u00A0h', 'p')} = ${q(Fmt.si(EWh, 'Wh'), 'p')}`);
    e += riga('In chilowattora, l\'unità della bolletta', '', `${q(Fmt.num(EkWh, 3) + '\u00A0kWh', 'p')}`);
    $('#formuleEnergia').innerHTML = e;

    const costo = EkWh * stato.prezzo;
    const euro = costo >= 0.01
      ? costo.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
      : `meno di un centesimo (${Fmt.num(costo, 2)} €)`;
    $('#costo').innerHTML = `Tenere acceso il circuito per ${Fmt.num(stato.tempo, 4)} ${nomeUnita} costa ${q(euro, 'p')}.`;
  }

  /* ---------- aggiornamento generale ---------- */
  function aggiorna() {
    const ris = calcola();
    cursoreV.value = stato.V;
    if (document.activeElement !== testoV) testoV.value = Fmt.num(stato.V, 4);
    controlliR.forEach(c => c.mostra());
    Schema.disegna(stato.modo, ris, { potenza: stato.potenza });
    metro(ris.I);
    formule(ris);
    grafico(ris);
    colori(ris);
    potenza(ris);
  }

  /* ---------- eventi della pagina ---------- */
  document.querySelectorAll('.modi button').forEach(b => b.addEventListener('click', () => {
    stato.modo = b.dataset.modo;
    document.querySelectorAll('.modi button').forEach(x =>
      x.setAttribute('aria-pressed', String(x === b)));
    costruisciComandi();
    aggiorna();
  }));

  document.querySelectorAll('#selettoreSerie button').forEach(b => b.addEventListener('click', () => {
    stato.serie = b.dataset.serie;
    aggiorna();
  }));

  $('#mostraPotenza').addEventListener('change', e => { stato.potenza = e.target.checked; aggiorna(); });

  const tempo = $('#tempo'), unitaTempo = $('#unitaTempo'), prezzo = $('#prezzo');
  tempo.value = Fmt.num(stato.tempo, 4);
  unitaTempo.value = stato.unita;
  prezzo.value = Fmt.num(stato.prezzo, 4);
  tempo.addEventListener('input', () => {
    const v = Fmt.leggi(tempo.value);
    tempo.classList.toggle('errore', !(v >= 0));
    if (v >= 0) { stato.tempo = v; aggiorna(); }
  });
  unitaTempo.addEventListener('change', () => { stato.unita = unitaTempo.value; aggiorna(); });
  prezzo.addEventListener('input', () => {
    const v = Fmt.leggi(prezzo.value);
    prezzo.classList.toggle('errore', !(v >= 0));
    if (v >= 0) { stato.prezzo = v; aggiorna(); }
  });

  // Riallinea i grafici quando cambia il tema chiaro/scuro
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', aggiorna);

  Schema.crea($('#schema'));
  costruisciComandi();
  aggiorna();
})();

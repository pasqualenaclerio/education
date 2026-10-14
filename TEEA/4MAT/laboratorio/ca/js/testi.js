/* ==========================================================================
   TESTI DINAMICI
   Tutte le frasi che cambiano in base alla situazione sono qui:
   il nome del carico, la spiegazione e le note sul suono.
   ========================================================================== */
(function (L) {
  const { D2R } = L;

  // Nome del carico mostrato sotto lo schema del circuito
  L.loadName = function (d) {
    const S = L.S, p = d.phiZ, ap = Math.abs(p);
    if (!isFinite(d.Zmag)) return 'Circuito aperto';
    if (S.useZ && S.zType === 'RLC' && ap < 1) return 'Circuito RLC in risonanza: si comporta come un resistore';
    const pre = S.useZ && S.zType === 'RLC' ? 'RLC serie, ' : '';
    if (ap > 90.5) return 'Bipolo attivo: cede potenza al generatore';
    if (ap < 1) return 'Carico resistivo puro';
    if (ap > 89) return pre + (p > 0 ? 'carico induttivo puro' : 'carico capacitivo puro');
    return pre + (p > 0 ? 'prevale l\u2019induttore (ohmico-induttivo)' : 'prevale il condensatore (ohmico-capacitivo)');
  };

  // Spiegazione nel riquadro "Le formule"
  L.explain = function (d) {
    const S = L.S, fmt = L.fmt;
    if (S.Vm === 0 || d.Im === 0) return 'Con un\u2019ampiezza nulla non c\u2019è nulla da confrontare: aumenta V<sub>max</sub> o I<sub>max</sub>.';
    const p = d.phi, ap = Math.abs(p), dt = L.fmtT(ap / 360 * d.T);
    let pre = '';
    if (S.useZ && S.zType === 'RLC') {
      if (ap < 1) return `Siamo alla <b>risonanza</b> (f₀ = ${L.fmtF(d.f0)}): X<sub>L</sub> = X<sub>C</sub>, le due reattanze si annullano, l\u2019impedenza vale solo R ed è minima, quindi la corrente è massima e in fase con la tensione.`;
      pre = d.XL > d.XC
        ? `Sopra la frequenza di risonanza (f₀ = ${L.fmtF(d.f0)}) X<sub>L</sub> supera X<sub>C</sub>: prevale l\u2019induttore. `
        : `Sotto la frequenza di risonanza (f₀ = ${L.fmtF(d.f0)}) X<sub>C</sub> supera X<sub>L</sub>: prevale il condensatore. `;
    }
    if (ap < 1) return 'Tensione e corrente sono <b>in fase</b>: passano per lo zero e raggiungono il massimo negli stessi istanti. È il comportamento di un resistore: tutta la potenza è attiva (cos φ = 1).';
    if (ap > 90.5) return `Con |φ| > 90° la potenza media diventa negativa: il bipolo restituisce energia, come farebbe un generatore. Un carico passivo fatto di R, L e C non può farlo: lo sfasamento resta sempre tra −90° e +90°.`;
    if (ap > 89 && p > 0) return pre + `La corrente è <b>in ritardo di 90°</b>, cioè di un quarto di periodo (T/4 = ${dt}). È l\u2019induttore ideale: la reattanza X<sub>L</sub> = ωL cresce con la frequenza. La potenza media è nulla: l\u2019energia entra nel campo magnetico e poi torna al generatore.`;
    if (ap > 89) return pre + `La corrente è <b>in anticipo di 90°</b>, cioè di un quarto di periodo (T/4 = ${dt}). È il condensatore ideale: la reattanza X<sub>C</sub> = 1/(ωC) diminuisce quando la frequenza aumenta. La potenza media è nulla: l\u2019energia viene accumulata nel campo elettrico e restituita.`;
    if (p > 0) return pre + `La corrente è <b>in ritardo di ${L.deg(ap)}</b> sulla tensione (Δt = ${dt}): il carico è ohmico-induttivo. Solo una parte della potenza apparente diventa potenza attiva, il fattore di potenza è cos φ = ${fmt(Math.cos(p * D2R))}.`;
    return pre + `La corrente è <b>in anticipo di ${L.deg(ap)}</b> sulla tensione (Δt = ${dt}): il carico è ohmico-capacitivo. Solo una parte della potenza apparente diventa potenza attiva, il fattore di potenza è cos φ = ${fmt(Math.cos(p * D2R))}.`;
  };

  // Nota sotto i controlli del suono
  L.audioNote = function (d) {
    const S = L.S, f = S.f;
    let t = '';
    if (f < 20) t = 'Sotto i 20 Hz l\u2019orecchio umano non percepisce il suono. ';
    else if (f < 120) t = 'A frequenze così basse gli altoparlanti di portatili e smartphone riproducono poco o niente: usa cuffie o casse, oppure prova con 440 Hz. ';
    else if (f > 15000) t = 'Sopra i 15\u201320 kHz molte persone non sentono più nulla. ';
    if (S.audioMode === 'st') t += 'Con le cuffie lo sfasamento tra tensione e corrente sposta il suono tra le due orecchie.';
    if (S.audioMode === 'sum') t += `Con la somma (le due onde portate alla stessa ampiezza) senti l\u2019interferenza: in fase le onde si rinforzano, a 180° si annullano. Ora φ = ${L.deg(d.phi)}.`;
    return t;
  };
})(window.LAB);

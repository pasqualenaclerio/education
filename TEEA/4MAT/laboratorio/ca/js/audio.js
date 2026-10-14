/* ==========================================================================
   SUONO DELLE ONDE (Web Audio API)
   Due oscillatori, uno per la tensione e uno per la corrente, alla frequenza
   impostata. Partono nello stesso istante e cambiano frequenza insieme, così
   il loro sfasamento è esattamente φ. La fase di ciascuno si imposta con una
   PeriodicWave: sin(ωt + θ) = sinθ·cos(ωt) + cosθ·sin(ωt).
   ========================================================================== */
(function (L) {
  const A = { ctx: null, waveKey: { v: null, i: null }, stopTimer: null };
  const TC = 0.03;                  // costante di tempo delle transizioni (s): evita i "clic"
  const VOLUME_MAX = 0.6;           // guadagno massimo con il volume al 100%

  // Crea il motore audio al primo uso (i browser lo permettono solo dopo un clic)
  function ensure() {
    if (A.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const ctx = new AC();
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const channel = () => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      g.gain.value = 0;
      const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      o.connect(g);
      if (p) { g.connect(p); p.connect(master); } else g.connect(master);
      return { o, g, p };
    };
    const v = channel(), i = channel();
    const t0 = ctx.currentTime + 0.05;
    v.o.start(t0); i.o.start(t0);   // stessa partenza = stessa origine dei tempi
    Object.assign(A, { ctx, master, v, i });
    return true;
  }

  function setPhase(ch, key, thetaDeg) {
    const k = Math.round(thetaDeg * 10);
    if (A.waveKey[key] === k) return;
    A.waveKey[key] = k;
    const th = thetaDeg * L.D2R;
    const real = new Float32Array([0, Math.sin(th)]);
    const imag = new Float32Array([0, Math.cos(th)]);
    ch.o.setPeriodicWave(A.ctx.createPeriodicWave(real, imag, { disableNormalization: true }));
  }

  function update(d) {
    const S = L.S;
    if (!S.audioOn) {
      if (A.ctx) {
        A.master.gain.setTargetAtTime(0, A.ctx.currentTime, TC);
        clearTimeout(A.stopTimer);
        A.stopTimer = setTimeout(() => { if (!L.S.audioOn) A.ctx.suspend(); }, 300);
      }
      return;
    }
    if (!ensure()) return;
    clearTimeout(A.stopTimer);
    if (A.ctx.state === 'suspended') A.ctx.resume();

    const now = A.ctx.currentTime;
    const f = Math.min(S.f, A.ctx.sampleRate / 2 - 1);
    A.v.o.frequency.setTargetAtTime(f, now, TC);
    A.i.o.frequency.setTargetAtTime(f, now, TC);
    setPhase(A.v, 'v', S.thv);
    setPhase(A.i, 'i', d.thi);

    // ampiezze relative ai valori di riferimento (stato.js)
    const av = Math.min(1, S.Vm / d.VsRef);
    const ai = isFinite(d.Im) ? Math.min(1, d.Im / d.IsRef) : 0;
    let gv = 0, gi = 0, pv = 0, pi = 0;
    switch (S.audioMode) {
      case 'v':  gv = av; break;
      case 'i':  gi = ai; break;
      case 'st': gv = av; gi = ai; pv = -1; pi = 1; break;
      case 'sum': gv = av > 0 ? 0.5 : 0; gi = ai > 0 ? 0.5 : 0; break; // stessa ampiezza: si sente solo l'effetto della fase
    }
    A.v.g.gain.setTargetAtTime(gv, now, TC);
    A.i.g.gain.setTargetAtTime(gi, now, TC);
    if (A.v.p) { A.v.p.pan.setTargetAtTime(pv, now, TC); A.i.p.pan.setTargetAtTime(pi, now, TC); }
    A.master.gain.setTargetAtTime(S.audioVol / 100 * VOLUME_MAX, now, TC);
  }

  L.audio = { update };
})(window.LAB);

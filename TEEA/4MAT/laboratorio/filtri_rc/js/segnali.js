/* =========================================================
   SEGNALI
   Una "componente" è { f (Hz), A (V), ph (radianti) }.
   ========================================================= */
window.Segnali = (() => {
  const DUE_PI = 2 * Math.PI;

  // Valore istantaneo della somma di componenti all'istante t (secondi)
  function valore(comp, t) {
    let s = 0;
    for (const c of comp) s += c.A * Math.sin(DUE_PI * c.f * t + c.ph);
    return s;
  }

  // Campioni della somma di componenti (con frequenze intere e 1 s il loop è perfetto)
  function buffer(comp, sr, durata = 1) {
    const n = Math.round(sr * durata), out = new Float32Array(n);
    for (const c of comp) {
      const w = DUE_PI * c.f / sr;
      for (let i = 0; i < n; i++) out[i] += c.A * Math.sin(w * i + c.ph);
    }
    return out;
  }

  // Rumore bianco gaussiano con valore efficace 1
  function rumoreBianco(n) {
    const out = new Float32Array(n);
    for (let i = 0; i < n; i += 2) {
      const u = Math.random() || 1e-12, v = Math.random();
      const r = Math.sqrt(-2 * Math.log(u));
      out[i] = r * Math.cos(DUE_PI * v);
      if (i + 1 < n) out[i + 1] = r * Math.sin(DUE_PI * v);
    }
    return out;
  }

  // "Fra Martino" sintetizzata (usata se il file WAV non si può leggere).
  // Note MIDI: 60 = Do centrale. Durate in battiti.
  const MELODIA = [
    [60, 1], [62, 1], [64, 1], [60, 1], [60, 1], [62, 1], [64, 1], [60, 1],
    [64, 1], [65, 1], [67, 2], [64, 1], [65, 1], [67, 2],
    [67, .5], [69, .5], [67, .5], [65, .5], [64, 1], [60, 1],
    [67, .5], [69, .5], [67, .5], [65, .5], [64, 1], [60, 1],
    [60, 1], [55, 1], [60, 2], [60, 1], [55, 1], [60, 2]
  ];

  function melodia(sr, bpm = 160) {
    const q = 60 / bpm, attacco = 0.01, rilascio = 0.04;
    const battiti = MELODIA.reduce((s, [, b]) => s + b, 0);
    const out = new Float32Array(Math.ceil((battiti * q + 0.6) * sr));
    const parziali = [1, 0.5, 0.25, 0.12]; // fondamentale + 3 armoniche: timbro morbido
    let t = 0.2;
    for (const [midi, b] of MELODIA) {
      const f = 440 * 2 ** ((midi - 69) / 12);
      const dur = b * q * 0.92, i0 = Math.round(t * sr), n = Math.round(dur * sr);
      for (let i = 0; i < n; i++) {
        const tt = i / sr;
        let env = Math.exp(-tt * 2.5);
        if (tt < attacco) env *= tt / attacco;
        if (tt > dur - rilascio) env *= Math.max(0, (dur - tt) / rilascio);
        let s = 0;
        parziali.forEach((a, k) => { s += a * Math.sin(DUE_PI * f * (k + 1) * tt); });
        out[i0 + i] += 0.35 * env * s;
      }
      t += b * q;
    }
    return out;
  }

  return { valore, buffer, rumoreBianco, melodia };
})();

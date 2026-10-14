/* =========================================================
   RIPRODUTTORE AUDIO (Web Audio API)
   Suona un segnale in loop. Passando da un segnale all'altro
   riprende dallo stesso punto, per confronti immediati.
   ========================================================= */
window.Riproduttore = {
  ctx: null, uscita: null, src: null, gs: null,
  chiave: null, t0: 0, dur: 0, vol: 0.6,
  onCambio: () => {},

  assicura() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.uscita = this.ctx.createGain();
      this.uscita.gain.value = this.vol;
      this.uscita.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  // dati: Float32Array; guadagno: fattore di scala comune a ingresso e uscita
  suona(chiave, dati, sr, guadagno, continua = true) {
    const ctx = this.assicura();
    let offset = 0;
    if (continua && this.src && this.dur > 0) offset = (ctx.currentTime - this.t0) % this.dur;
    this._chiudi();

    const buf = ctx.createBuffer(1, dati.length, sr);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < dati.length; i++) {
      const v = dati[i] * guadagno;
      ch[i] = v > 1 ? 1 : v < -1 ? -1 : v;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const gs = ctx.createGain();
    gs.gain.setValueAtTime(0, ctx.currentTime);
    gs.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.015);
    src.connect(gs).connect(this.uscita);
    if (offset >= buf.duration) offset = 0;
    src.start(ctx.currentTime, offset);

    Object.assign(this, { src, gs, chiave, t0: ctx.currentTime - offset, dur: buf.duration });
    this.onCambio(chiave);
  },

  _chiudi() {
    if (!this.src) return;
    const t = this.ctx.currentTime, { src, gs } = this;
    gs.gain.cancelScheduledValues(t);
    gs.gain.setValueAtTime(gs.gain.value, t);
    gs.gain.linearRampToValueAtTime(0, t + 0.015);
    try { src.stop(t + 0.03); } catch (e) { /* già fermo */ }
    setTimeout(() => { try { src.disconnect(); gs.disconnect(); } catch (e) { /* niente */ } }, 120);
    this.src = null; this.gs = null;
  },

  ferma() { this._chiudi(); this.chiave = null; this.onCambio(null); },

  volume(v) {
    this.vol = v;
    if (this.uscita) this.uscita.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
  },

  // Decodifica un file audio, lo porta in mono alla frequenza sr e lo taglia a durataMax secondi
  async decodifica(arrayBuffer, sr, durataMax) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new OAC(1, 1, sr);
    const buf = await new Promise((ok, ko) => {
      const p = ctx.decodeAudioData(arrayBuffer, ok, ko);
      if (p && p.then) p.then(ok, ko);
    });
    const n = Math.min(buf.length, Math.round(durataMax * sr));
    const mono = new Float32Array(n);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < n; i++) mono[i] += d[i] / buf.numberOfChannels;
    }
    return { dati: mono, tagliato: buf.length > n, durataOriginale: buf.duration };
  }
};

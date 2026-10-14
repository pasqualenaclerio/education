/* =========================================================
   FFT (trasformata di Fourier veloce, radice 2)
   - spettro(): spettro di ampiezza medio (metodo di Welch)
   - filtra():  applica la risposta H(f) del filtro a un segnale
   ========================================================= */
window.Fft = (() => {
  const tabelle = {};

  function tabella(n) {
    if (tabelle[n]) return tabelle[n];
    const cos = new Float64Array(n / 2), sin = new Float64Array(n / 2);
    for (let k = 0; k < n / 2; k++) {
      cos[k] = Math.cos(2 * Math.PI * k / n);
      sin[k] = Math.sin(2 * Math.PI * k / n);
    }
    return (tabelle[n] = { cos, sin });
  }

  const potenzaDi2 = n => 2 ** Math.ceil(Math.log2(Math.max(2, n)));

  // Trasformata sul posto: re e im devono avere lunghezza potenza di 2
  function trasforma(re, im, inversa = false) {
    const n = re.length;
    const { cos, sin } = tabella(n);
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        let t = re[i]; re[i] = re[j]; re[j] = t;
        t = im[i]; im[i] = im[j]; im[j] = t;
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const meta = len >> 1, passo = n / len;
      for (let i = 0; i < n; i += len) {
        for (let k = 0; k < meta; k++) {
          const wr = cos[k * passo], wi = inversa ? sin[k * passo] : -sin[k * passo];
          const a = i + k, b = a + meta;
          const xr = re[b] * wr - im[b] * wi;
          const xi = re[b] * wi + im[b] * wr;
          re[b] = re[a] - xr; im[b] = im[a] - xi;
          re[a] += xr; im[a] += xi;
        }
      }
    }
    if (inversa) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }

  // Spettro di ampiezza: una sinusoide di ampiezza A dà un picco alto A
  function spettro(x, sr, seg = 4096) {
    const n = Math.min(seg, potenzaDi2(x.length));
    const w = new Float64Array(n);
    let somma = 0;
    for (let i = 0; i < n; i++) { w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)); somma += w[i]; }
    const acc = new Float64Array(n / 2 + 1);
    const re = new Float64Array(n), im = new Float64Array(n);
    let conta = 0;
    for (let inizio = 0; inizio + n <= Math.max(n, x.length); inizio += n / 2) {
      for (let i = 0; i < n; i++) { re[i] = (x[inizio + i] || 0) * w[i]; im[i] = 0; }
      trasforma(re, im);
      for (let k = 0; k <= n / 2; k++) acc[k] += re[k] * re[k] + im[k] * im[k];
      conta++;
    }
    const f = new Float64Array(n / 2 + 1), a = new Float64Array(n / 2 + 1);
    for (let k = 0; k <= n / 2; k++) {
      f[k] = k * sr / n;
      a[k] = 2 * Math.sqrt(acc[k] / conta) / somma;
    }
    return { f, a };
  }

  // Filtraggio: moltiplica lo spettro del segnale per H(f) e torna nel tempo
  function filtra(x, sr, Hf) {
    const n = potenzaDi2(x.length + 8192);
    const re = new Float64Array(n), im = new Float64Array(n);
    re.set(x);
    trasforma(re, im);
    const molt = (k, hr, hi) => {
      const a = re[k], b = im[k];
      re[k] = a * hr - b * hi;
      im[k] = a * hi + b * hr;
    };
    for (let k = 0; k <= n / 2; k++) {
      const h = Hf(k * sr / n);
      molt(k, h.re, h.im);
      if (k > 0 && k < n / 2) molt(n - k, h.re, -h.im);
    }
    trasforma(re, im, true);
    return Float32Array.from(re.subarray(0, x.length));
  }

  return { trasforma, spettro, filtra, potenzaDi2 };
})();

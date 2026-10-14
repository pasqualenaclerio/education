/* =========================================================
   GRAFICO — piccola libreria per disegnare su <canvas>
   Asse x lineare o logaritmico, griglia, curve, righe verticali.
   I colori arrivano dalle variabili CSS (vedi css/style.css).
   ========================================================= */
window.Grafico = (() => {
  const FONT = '12px "Atkinson Hyperlegible", system-ui, sans-serif';
  const FONT_PICCOLO = '11px "Atkinson Hyperlegible", system-ui, sans-serif';

  class Grafico {
    constructor(canvas, opz = {}) {
      this.cv = canvas;
      this.c = canvas.getContext('2d');
      this.m = { l: 60, r: 16, t: 12, b: 40 };
      this.xLog = false; this.xMin = 0; this.xMax = 1; this.yMin = -1; this.yMax = 1;
      Object.assign(this, opz);
    }

    static col(nome) {
      return getComputedStyle(document.documentElement).getPropertyValue('--' + nome).trim() || '#888';
    }

    // Passo "tondo" (1, 2, 5 × 10^n) per dividere un intervallo in circa n parti
    static passo(intervallo, n) {
      const grezzo = intervallo / Math.max(1, n);
      const p = 10 ** Math.floor(Math.log10(grezzo));
      const f = grezzo / p;
      return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
    }
    static tondo(v) { const p = Grafico.passo(v, 4); return Math.ceil(v / p) * p; }

    prepara() {
      const r = this.cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      const w = Math.max(240, Math.round(r.width)), h = Math.max(120, Math.round(r.height));
      const W = Math.round(w * dpr), H = Math.round(h * dpr);
      if (this.cv.width !== W || this.cv.height !== H) { this.cv.width = W; this.cv.height = H; }
      this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.c.clearRect(0, 0, w, h);
      this.W = w; this.H = h;
      this.pw = w - this.m.l - this.m.r;
      this.ph = h - this.m.t - this.m.b;
    }

    X(v) {
      if (this.xLog) {
        const a = Math.log10(this.xMin), b = Math.log10(this.xMax);
        return this.m.l + (Math.log10(Math.max(v, 1e-12)) - a) / (b - a) * this.pw;
      }
      return this.m.l + (v - this.xMin) / (this.xMax - this.xMin) * this.pw;
    }
    Xinv(px) {
      const t = (px - this.m.l) / this.pw;
      if (this.xLog) {
        const a = Math.log10(this.xMin), b = Math.log10(this.xMax);
        return 10 ** (a + t * (b - a));
      }
      return this.xMin + t * (this.xMax - this.xMin);
    }
    Y(v) { return this.m.t + (this.yMax - v) / (this.yMax - this.yMin) * this.ph; }

    // Esegue fn disegnando solo dentro l'area del grafico
    dentro(fn) {
      const c = this.c;
      c.save(); c.beginPath(); c.rect(this.m.l, this.m.t, this.pw, this.ph); c.clip();
      fn();
      c.restore();
    }

    tacche() {
      const out = [];
      if (this.xLog) {
        for (let d = Math.floor(Math.log10(this.xMin)); d <= Math.ceil(Math.log10(this.xMax)); d++) {
          for (let k = 1; k < 10; k++) {
            const v = k * 10 ** d;
            if (v < this.xMin * 0.999 || v > this.xMax * 1.001) continue;
            const etichetta = k === 1 || (this.pw > 560 && (k === 2 || k === 5));
            out.push({ v, forte: k === 1, testo: etichetta ? Fmt.asse(v) : '' });
          }
        }
      } else {
        const p = Grafico.passo(this.xMax - this.xMin, Math.max(3, Math.floor(this.pw / 90)));
        for (let v = Math.ceil(this.xMin / p) * p; v <= this.xMax + p * 1e-6; v += p) {
          out.push({ v, forte: true, testo: Fmt.num(v, 4) });
        }
      }
      return out;
    }

    assi(o = {}) {
      const c = this.c, col = Grafico.col, { m } = this;
      c.save();
      c.font = FONT; c.lineWidth = 1;
      for (const t of this.tacche()) {
        const x = Math.round(this.X(t.v)) + 0.5;
        c.strokeStyle = col(t.forte ? 'griglia-forte' : 'griglia');
        c.beginPath(); c.moveTo(x, m.t); c.lineTo(x, m.t + this.ph); c.stroke();
        if (t.testo) { c.fillStyle = col('tenue'); c.textAlign = 'center'; c.fillText(t.testo, x, m.t + this.ph + 16); }
      }
      const ps = o.yPasso || Grafico.passo(this.yMax - this.yMin, Math.max(2, Math.floor(this.ph / 45)));
      for (let v = Math.ceil(this.yMin / ps - 1e-9) * ps; v <= this.yMax + ps * 1e-6; v += ps) {
        const y = Math.round(this.Y(v)) + 0.5;
        c.strokeStyle = col(Math.abs(v) < ps * 1e-6 ? 'griglia-forte' : 'griglia');
        c.beginPath(); c.moveTo(m.l, y); c.lineTo(m.l + this.pw, y); c.stroke();
        c.fillStyle = col('tenue'); c.textAlign = 'right';
        c.fillText(o.yFmt ? o.yFmt(v) : Fmt.num(v, 4), m.l - 7, y + 4);
      }
      c.strokeStyle = col('griglia-forte');
      c.strokeRect(m.l + 0.5, m.t + 0.5, this.pw, this.ph);
      c.fillStyle = col('tenue');
      if (o.xLabel) { c.textAlign = 'right'; c.fillText(o.xLabel, m.l + this.pw, this.H - 5); }
      if (o.yLabel) {
        c.save(); c.translate(13, m.t + this.ph / 2); c.rotate(-Math.PI / 2);
        c.textAlign = 'center'; c.fillText(o.yLabel, 0, 0); c.restore();
      }
      c.restore();
    }

    stile(o) {
      const c = this.c;
      c.strokeStyle = o.col || '#000';
      c.lineWidth = o.w || 2;
      c.setLineDash(o.dash || []);
      c.globalAlpha = o.alpha ?? 1;
      c.lineJoin = 'round'; c.lineCap = 'round';
    }

    // Disegna y = fn(x) campionando lungo l'asse x
    funzione(fn, o = {}) {
      const c = this.c;
      c.save(); this.stile(o); c.beginPath();
      const n = Math.max(2, Math.round(o.n || this.pw * 2));
      let nuovo = true;
      for (let i = 0; i <= n; i++) {
        const px = this.m.l + this.pw * i / n;
        const y = fn(this.Xinv(px));
        if (!isFinite(y)) { nuovo = true; continue; }
        const py = this.Y(Math.max(this.yMin - (this.yMax - this.yMin), Math.min(this.yMax * 2 - this.yMin, y)));
        if (nuovo) { c.moveTo(px, py); nuovo = false; } else c.lineTo(px, py);
      }
      c.stroke(); c.restore();
    }

    // Curva con molti punti (spettri): per ogni pixel tiene il valore massimo
    curvaDensa(xs, ys, o = {}) {
      const c = this.c;
      c.save(); this.stile(o); c.beginPath();
      let pxPrec = null, yMax = -Infinity, primo = true;
      const scrivi = () => {
        if (pxPrec === null || !isFinite(yMax)) return;
        const py = this.Y(Math.max(this.yMin - 10, yMax));
        if (primo) { c.moveTo(pxPrec, py); primo = false; } else c.lineTo(pxPrec, py);
      };
      for (let i = 1; i < xs.length; i++) {
        if (xs[i] < this.xMin || xs[i] > this.xMax) continue;
        const px = Math.round(this.X(xs[i]));
        if (px !== pxPrec) { scrivi(); pxPrec = px; yMax = ys[i]; }
        else if (ys[i] > yMax) yMax = ys[i];
      }
      scrivi();
      c.stroke(); c.restore();
    }

    // Forma d'onda da campioni; asse x in millisecondi
    forma(dati, sr, o = {}) {
      const c = this.c;
      c.save(); this.stile(o); c.beginPath();
      const i0 = Math.max(0, Math.floor(this.xMin / 1000 * sr));
      const i1 = Math.min(dati.length - 1, Math.ceil(this.xMax / 1000 * sr));
      if (i1 <= i0) { c.restore(); return; }
      const cpp = (i1 - i0) / this.pw; // campioni per pixel
      if (cpp > 2) {
        for (let px = 0; px < this.pw; px++) {
          const a = i0 + Math.floor(px * cpp), b = Math.min(i1, i0 + Math.floor((px + 1) * cpp));
          let mn = Infinity, mx = -Infinity;
          for (let i = a; i <= b; i++) { const v = dati[i]; if (v < mn) mn = v; if (v > mx) mx = v; }
          const x = this.m.l + px + 0.5;
          if (px === 0) c.moveTo(x, this.Y(mx)); else c.lineTo(x, this.Y(mx));
          c.lineTo(x, this.Y(mn));
        }
      } else {
        for (let i = i0; i <= i1; i++) {
          const x = this.X(i / sr * 1000), y = this.Y(dati[i]);
          if (i === i0) c.moveTo(x, y); else c.lineTo(x, y);
        }
      }
      c.stroke(); c.restore();
    }

    // Righe verticali con pallino (spettro a righe). punti: [{x, y, col, testo}]
    steli(punti, o = {}) {
      const c = this.c;
      c.save();
      c.font = FONT_PICCOLO; c.textAlign = 'center';
      for (const p of punti) {
        if (p.x < this.xMin || p.x > this.xMax) continue;
        const x = this.X(p.x);
        const y0 = this.Y(this.yMin);
        const y = this.Y(Math.max(this.yMin, Math.min(this.yMax, p.y)));
        c.globalAlpha = o.alpha ?? 1;
        c.strokeStyle = p.col; c.fillStyle = p.col; c.lineWidth = o.w || 3; c.setLineDash([]);
        c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y); c.stroke();
        c.beginPath(); c.arc(x, y, o.r || 4, 0, 2 * Math.PI); c.fill();
        if (p.testo) {
          c.fillStyle = Grafico.col('inchiostro');
          c.fillText(p.testo, x, Math.max(this.m.t + 11, y - 9));
        }
      }
      c.restore();
    }

    linV(v, o = {}) {
      if (v < this.xMin || v > this.xMax) return;
      const c = this.c, x = this.X(v);
      c.save(); this.stile({ w: 1.2, ...o });
      c.beginPath(); c.moveTo(x, this.m.t); c.lineTo(x, this.m.t + this.ph); c.stroke();
      if (o.testo) {
        c.globalAlpha = 1; c.fillStyle = o.col; c.font = FONT; c.textAlign = 'left';
        c.fillText(o.testo, x + 4, this.m.t + 13);
      }
      c.restore();
    }

    linH(v, o = {}) {
      const c = this.c, y = this.Y(v);
      c.save(); this.stile({ w: 1.2, ...o });
      c.beginPath(); c.moveTo(this.m.l, y); c.lineTo(this.m.l + this.pw, y); c.stroke();
      if (o.testo) {
        c.globalAlpha = 1; c.fillStyle = o.col; c.font = FONT; c.textAlign = 'right';
        c.fillText(o.testo, this.m.l + this.pw - 4, y - 4);
      }
      c.restore();
    }

    punto(x, y, o = {}) {
      if (x < this.xMin || x > this.xMax) return;
      const c = this.c, px = this.X(x), py = this.Y(Math.max(this.yMin, Math.min(this.yMax, y)));
      c.save();
      c.fillStyle = o.col; c.strokeStyle = Grafico.col('superficie'); c.lineWidth = 2;
      c.beginPath(); c.arc(px, py, o.r || 5, 0, 2 * Math.PI); c.fill(); c.stroke();
      if (o.testo) {
        c.fillStyle = Grafico.col('inchiostro'); c.font = FONT_PICCOLO; c.textAlign = 'left';
        c.fillText(o.testo, px + 7, Math.min(this.m.t + this.ph - 4, Math.max(this.m.t + 11, py - 7)));
      }
      c.restore();
    }

    messaggio(testo) {
      this.prepara();
      const c = this.c;
      c.fillStyle = Grafico.col('tenue'); c.font = FONT; c.textAlign = 'center';
      c.fillText(testo, this.W / 2, this.H / 2);
    }
  }

  return Grafico;
})();

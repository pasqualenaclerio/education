/* ==========================================================================
   FISICA: calcolo di impedenza, corrente, sfasamento e potenze
   ========================================================================== */
(function (L) {
  const { D2R, TAU } = L;

  // Durata della finestra visibile sull'oscilloscopio (secondi)
  L.windowT = () => L.S.xaxis === 'deg' ? 2 / L.S.f : 8 * L.S.tb;

  // Fondo scala "tondo" appena sopra il picco (1; 1,5; 2; 2,5; 3; 4; 5; 6; 8 × 10ⁿ):
  // l'onda occupa sempre tra circa il 65% e l'87% dell'altezza
  const PASSI_SCALA = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const scalaPer = x => (x > 0 && isFinite(x)) ? L.niceCeil(x * L.MARGINE_SCALA, PASSI_SCALA) : 1;

  // Restituisce tutte le grandezze derivate dallo stato attuale
  L.compute = function () {
    const S = L.S;
    const w = TAU * S.f, T = 1 / S.f;
    let Zre, Zim, Zmag, phiZ, Im, thi, XL = null, XC = null;

    if (S.useZ) {
      // La corrente nasce dall'impedenza scelta: I = V / Z
      const zt = S.zType;
      if (zt === 'R')        { Zre = S.R; Zim = 0; }
      else if (zt === 'L')   { XL = w * S.L; Zre = 0; Zim = XL; }
      else if (zt === 'C')   { XC = 1 / (w * S.C); Zre = 0; Zim = -XC; }
      else if (zt === 'RLC') { XL = w * S.L; XC = 1 / (w * S.C); Zre = S.R; Zim = XL - XC; }
      else                   { Zre = S.Zmod * Math.cos(S.Zphi * D2R); Zim = S.Zmod * Math.sin(S.Zphi * D2R); }
      Zmag = Math.hypot(Zre, Zim);
      phiZ = Math.atan2(Zim, Zre) / D2R;
      Im = S.Vm / Zmag;
      thi = L.wrap180(S.thv - phiZ);
    } else {
      // Corrente impostata a mano: si ricava l'impedenza equivalente V / I
      Im = S.Im; thi = S.thi;
      phiZ = L.wrap180(S.thv - thi);
      Zmag = Im > 0 ? S.Vm / Im : Infinity;
      Zre = isFinite(Zmag) ? Zmag * Math.cos(phiZ * D2R) : Infinity;
      Zim = isFinite(Zmag) ? Zmag * Math.sin(phiZ * D2R) : 0;
    }

    let phi = L.wrap180(S.thv - thi);             // sfasamento tensione-corrente
    if (Math.abs(phi) < 0.01) phi = 0;            // elimina i residui di arrotondamento
    const Vrms = S.Vm / Math.SQRT2, Irms = Im / Math.SQRT2;
    const f0 = 1 / (TAU * Math.sqrt(S.L * S.C));  // risonanza RLC

    // Fondo scala del grafico. Con la scala automatica la tensione si adatta al
    // suo picco; la corrente si adatta in modo da apparire sempre un po' più
    // piccola della tensione (vedi RAPPORTO_VISIVO_CORRENTE in stato.js).
    let Vs, Is;
    if (S.autoScale) {
      Vs = scalaPer(S.Vm);
      const hv = S.Vm / Vs;                       // altezza della tensione (0..1)
      Is = (hv > 0 && Im > 0 && isFinite(Im))
        ? L.niceCeil(Im / (hv * L.RAPPORTO_VISIVO_CORRENTE), PASSI_SCALA)
        : scalaPer(Im);
    } else {
      Vs = S.VsFix; Is = S.IsFix;
    }

    return {
      w, T, Zre, Zim, Zmag, phiZ, Im, thi, phi, Vrms, Irms, XL, XC, f0,
      P: Vrms * Irms * Math.cos(phi * D2R),
      Q: Vrms * Irms * Math.sin(phi * D2R),
      Sa: Vrms * Irms,
      Vs, Is,
      // riferimenti per il volume del suono
      VsRef: L.FONDO_SCALA_V,
      IsRef: S.useZ ? scalaPer(Im) : L.FONDO_SCALA_I_MANUALE,
      Wt: L.windowT()
    };
  };
})(window.LAB);

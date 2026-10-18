/* =========================================================
   CALCOLI DEL CIRCUITO
   Ogni funzione restituisce:
   { V, Req, I, P, parti: [{ R, V, I, P }, …] }
   dove "parti" contiene i valori su ciascuna resistenza.
   ========================================================= */
window.Circuito = (() => {

  // Una sola resistenza: I = V / R
  function singola(V, R) {
    const I = V / R;
    return { V, Req: R, I, P: V * I, parti: [{ R, V, I, P: V * I }] };
  }

  // Serie: Req = R1 + R2 + R3, stessa corrente, le tensioni si dividono
  function serie(V, Rs) {
    const Req = Rs.reduce((a, R) => a + R, 0);
    const I = V / Req;
    const parti = Rs.map(R => ({ R, V: R * I, I, P: R * I * I }));
    return { V, Req, I, P: V * I, parti };
  }

  // Parallelo: 1/Req = 1/R1 + 1/R2 + 1/R3, stessa tensione, le correnti si dividono
  function parallelo(V, Rs) {
    const Req = 1 / Rs.reduce((a, R) => a + 1 / R, 0);
    const I = V / Req;
    const parti = Rs.map(R => ({ R, V, I: V / R, P: V * V / R }));
    return { V, Req, I, P: V * I, parti };
  }

  return { singola, serie, parallelo };
})();

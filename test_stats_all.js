async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbyHKwlRQb5g-YjUh3pcDZoeGR1Gu_wToG0Tn4PDzP2Mb2x8EwDziJxd8Fyo3wRyN2Iu/exec';
  const names = ['alejandro', 'eric', 'terrassa', 'juan', 'maria', 'ana', 'carlos'];
  for (const n of names) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ action: 'getPromotorStats', name: n, username: n })
      });
      const data = await res.json();
      console.log(`User: ${n} -> diasTrabajados: ${data.stats ? data.stats.diasTrabajados : 'N/A'}`);
    } catch(e) {
      console.log(`User: ${n} -> error`);
    }
  }
}
test();

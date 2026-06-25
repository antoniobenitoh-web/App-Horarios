async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbyHKwlRQb5g-YjUh3pcDZoeGR1Gu_wToG0Tn4PDzP2Mb2x8EwDziJxd8Fyo3wRyN2Iu/exec';
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      action: 'getPromotorStats',
      name: 'Juan Promotor',
      username: 'juan'
    })
  });
  const text = await res.text();
  console.log("Response text:", text.substring(0, 500));
}
test();

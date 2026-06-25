async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbxvdeDLcPsNFC_z9kVLauvcpQDdV-ofuvp8jpSExp5x8AxG_n_6X3iUSy2Pd9sSLlcU/exec';
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

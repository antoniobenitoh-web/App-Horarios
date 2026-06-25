async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbzKedvPk-ROz4TyDbHOwWJzT4l-RHzgPzRcFRmtCS3v9pMbz7S2VKARPTu7ns_QYm0n/exec';
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      action: 'getPromotorStats',
      name: 'Juan Promotor',
      username: 'juan'
    })
  });
  const text = await res.text();
  console.log("Response length:", text.length);
  console.log("Response text:", text.substring(0, 100));
}
test();

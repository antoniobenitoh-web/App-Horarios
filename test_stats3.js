async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbwCjbuYU3QDjIOPTQUYW4OVayt12O8XOtjGC1XCWlF4k--B2aZq5MJiyuHoi_idHQDA/exec';
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      action: 'getPromotorStats',
      name: 'Juan Promotor',
      username: 'juan'
    })
  });
  const text = await res.text();
  console.log("Response text:", text.substring(0, 100));
}
test();

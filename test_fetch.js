fetch("https://script.google.com/macros/s/AKfycbwXd-fSUgcu95ZCY5va_1rVv4jrFXTXo1uMPbLGNOds3TWaNet0gGLBd4P0t8lwC9dd/exec", {
  method: "POST",
  body: JSON.stringify({ action: "getAvailableMonths", role: "administradora", name: "Tony" })
}).then(res => res.json()).then(console.log).catch(console.error);

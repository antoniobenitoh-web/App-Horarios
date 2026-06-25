fetch("https://script.google.com/macros/s/AKfycbwXd-fSUgcu95ZCY5va_1rVv4jrFXTXo1uMPbLGNOds3TWaNet0gGLBd4P0t8lwC9dd/exec", {
  method: "POST",
  body: JSON.stringify({ action: "getEquipoWeekly", role: "administradora", name: "Tony", week: "26" })
}).then(res => res.json()).then(d => console.log(JSON.stringify(d.centros.length > 0 ? d.centros[0].promotores[0].semana : d, null, 2))).catch(console.error);

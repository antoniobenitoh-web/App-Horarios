const today = new Date();
const currentYear = today.getFullYear();
let baseDate = new Date(currentYear, 0, 1);

const fechaIncorporacionStr = "12/04/2022";
let incDate;
if (fechaIncorporacionStr instanceof Date) {
  incDate = fechaIncorporacionStr;
} else {
  const parts = String(fechaIncorporacionStr).trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (parts) {
    incDate = new Date(parts[3], parseInt(parts[2])-1, parts[1]);
  } else {
    incDate = new Date(fechaIncorporacionStr);
  }
}
if (!isNaN(incDate) && incDate.getFullYear() === currentYear) {
  baseDate = incDate;
}

const diffTime = today.getTime() - baseDate.getTime();
let diasTrabajados = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

console.log("Current Year:", currentYear);
console.log("incDate:", incDate);
console.log("baseDate:", baseDate);
console.log("diasTrabajados:", diasTrabajados);

import os

filepath = "/Users/tony/.gemini/antigravity/brain/98abe59f-933a-438e-9ef2-58c71e22ca6d/Codigo_Servidor_Final.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add route
route_hook = "if (action === 'getSolicitudes') return handleGetSolicitudes(data);"
route_insert = "if (action === 'getPromotorStats') return handleGetPromotorStats(data);\n    if (action === 'getSolicitudes') return handleGetSolicitudes(data);"

if route_hook in content and "getPromotorStats" not in content:
    content = content.replace(route_hook, route_insert)

# Add function at the end
function_code = """
/* ======== ESTADÍSTICAS PROMOTOR (VACACIONES/SÁBADOS) ======== */

function handleGetPromotorStats(data) {
  const { name, username } = data; // name is full name
  const safeName = String(name).trim().toLowerCase();
  
  // 1. Obtener Fecha de Incorporación (Columna L/11) y Multiplicador (Columna O/14) de Usuarios
  const sheetUsers = getSheet(SHEET_USERS);
  const rowsUsers = sheetUsers.getDataRange().getValues();
  let fechaIncorporacionStr = null;
  let multiplicadorStr = "0.08"; // Por defecto
  
  for (let i = 1; i < rowsUsers.length; i++) {
    const rowUser = String(rowsUsers[i][2]).trim().toLowerCase();
    const rowName = String(rowsUsers[i][1]).trim().toLowerCase();
    
    if (rowUser === String(username).trim().toLowerCase() || rowName === safeName) {
      // Column L is index 11, Column O is index 14
      fechaIncorporacionStr = rowsUsers[i][11]; 
      if (rowsUsers[i][14] !== undefined && rowsUsers[i][14] !== "") {
        multiplicadorStr = String(rowsUsers[i][14]).trim().replace(",", ".");
      }
      break;
    }
  }

  // Parse multiplier
  let multiplicador = parseFloat(multiplicadorStr) || 0.08;

  // 2. Calcular Días Trabajados
  const today = new Date();
  const currentYear = today.getFullYear();
  let baseDate = new Date(currentYear, 0, 1); // 1 Enero del año actual por defecto
  
  if (fechaIncorporacionStr) {
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
    
    // Si la fecha de incorporación es válida y es de este año, se usa.
    // Si es anterior, usamos el 1 de Enero.
    if (!isNaN(incDate) && incDate.getFullYear() === currentYear) {
      baseDate = incDate;
    }
  }
  
  // Días transcurridos desde baseDate hasta hoy (inclusivo)
  const diffTime = today.getTime() - baseDate.getTime();
  let diasTrabajados = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (diasTrabajados < 0) diasTrabajados = 0;
  
  // 3. Cálculos de Generados
  const vacacionesGeneradasNum = diasTrabajados * multiplicador;
  const sabadosGeneradosNum = (6 / 365) * diasTrabajados;
  
  const vacacionesGeneradas = Math.round(vacacionesGeneradasNum * 10) / 10;
  const sabadosGenerados = Math.round(sabadosGeneradosNum * 10) / 10;
  
  // 4. Calcular Disfrutados / Programados
  let vacacionesDisfrutadas = 0;
  let sabadosDisfrutados = 0;
  const loadedDays = new Set(); // Para antiduplicados
  
  // A) Leer hoja de Horarios
  const sheetSchedule = getSheet(SHEET_SCHEDULE);
  const rowsSchedule = sheetSchedule.getDataRange().getValues();
  for (let i = 1; i < rowsSchedule.length; i++) {
    const rowName = String(rowsSchedule[i][0]).trim().toLowerCase();
    if (rowName === safeName) {
      const hDate = formatSheetDate(rowsSchedule[i][2]);
      if (hDate.startsWith(currentYear.toString())) {
        loadedDays.add(hDate); // Día ya cargado en horario
        const horarioText = String(rowsSchedule[i][6]).trim().toLowerCase();
        
        if (horarioText.includes("vacacion") || horarioText.includes("vacación")) {
          vacacionesDisfrutadas++;
        } else if (horarioText.includes("sabado de calidad") || horarioText.includes("sábado de calidad") || horarioText.includes("calidad")) {
          sabadosDisfrutados++;
        }
      }
    }
  }
  
  // B) Leer hoja de Solicitudes (Aprobadas que NO están en Horarios aún)
  const sheetSols = getSheet(SHEET_SOLICITUDES);
  const rowsSols = sheetSols.getDataRange().getValues();
  for (let i = 1; i < rowsSols.length; i++) {
    const sName = String(rowsSols[i][2]).trim().toLowerCase();
    const estado = String(rowsSols[i][7]).trim().toLowerCase();
    if (sName === safeName && estado === 'aprobada') {
      const sDate = formatSheetDate(rowsSols[i][3]);
      if (sDate.startsWith(currentYear.toString())) {
        // ¿Ya está en la hoja Horarios?
        if (!loadedDays.has(sDate)) {
          const motivo = String(rowsSols[i][6]).trim().toLowerCase();
          const reqHorario = String(rowsSols[i][5]).trim().toLowerCase();
          
          if (motivo.includes("vacacion") || motivo.includes("vacación") || reqHorario.includes("vacacion") || reqHorario.includes("vacación")) {
            vacacionesDisfrutadas++;
          } else if (motivo.includes("calidad") || reqHorario.includes("calidad")) {
            sabadosDisfrutados++;
          }
        }
      }
    }
  }

  // 5. Cálculos Finales
  const vacacionesPendientes = Math.round((vacacionesGeneradas - vacacionesDisfrutadas) * 10) / 10;
  const sabadosPendientes = Math.round((sabadosGenerados - sabadosDisfrutados) * 10) / 10;

  return jsonResponse({
    success: true,
    stats: {
      diasTrabajados,
      vacaciones: {
        generadas: vacacionesGeneradas,
        disfrutadas: vacacionesDisfrutadas,
        pendientes: vacacionesPendientes
      },
      sabados: {
        generadas: sabadosGenerados,
        disfrutadas: sabadosDisfrutados,
        pendientes: sabadosPendientes
      }
    }
  });
}
"""

if "handleGetPromotorStats" not in content:
    content += "\n" + function_code

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Added handleGetPromotorStats to backend")

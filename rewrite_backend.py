import re

filepath = "/Users/tony/.gemini/antigravity/brain/98abe59f-933a-438e-9ef2-58c71e22ca6d/Codigo_Servidor_Final.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# We need to replace the entire handleGetPromotorStats function.
# It starts with "function handleGetPromotorStats(data) {" and ends at the bottom of the file with "}"

start_idx = content.find("function handleGetPromotorStats(data) {")
if start_idx != -1:
    new_func = """function handleGetPromotorStats(data) {
  const { name, username } = data;
  const safeName = String(name).trim().toLowerCase();
  
  const sheetUsers = getSheet(SHEET_USERS);
  const rowsUsers = sheetUsers.getDataRange().getValues();
  let fechaIncorporacionStr = null;
  let multiplicadorStr = "0.08";
  
  for (let i = 1; i < rowsUsers.length; i++) {
    const rowUser = String(rowsUsers[i][2]).trim().toLowerCase();
    const rowName = String(rowsUsers[i][1]).trim().toLowerCase();
    if (rowUser === String(username).trim().toLowerCase() || rowName === safeName) {
      fechaIncorporacionStr = rowsUsers[i][11]; 
      if (rowsUsers[i][14] !== undefined && rowsUsers[i][14] !== "") {
        multiplicadorStr = String(rowsUsers[i][14]).trim().replace(",", ".");
      }
      break;
    }
  }

  let multiplicador = parseFloat(multiplicadorStr) || 0.08;
  if (multiplicador === 6 || multiplicador === 7) {
    multiplicador = 0.08;
  } else if (multiplicador >= 1 && multiplicador <= 5) {
    multiplicador = 0.06;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  let baseDate = new Date(currentYear, 0, 1);
  const finDeAnoDate = new Date(currentYear, 11, 31);
  
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
    if (!isNaN(incDate) && incDate.getFullYear() === currentYear) {
      baseDate = incDate;
    }
  }
  
  const diffTimeHoy = today.getTime() - baseDate.getTime();
  let diasTrabajadosHoy = Math.floor(diffTimeHoy / (1000 * 60 * 60 * 24)) + 1;
  if (diasTrabajadosHoy < 0) diasTrabajadosHoy = 0;

  const diffTimeFinDeAno = finDeAnoDate.getTime() - baseDate.getTime();
  let diasTrabajadosFin = Math.floor(diffTimeFinDeAno / (1000 * 60 * 60 * 24)) + 1;
  if (diasTrabajadosFin < 0) diasTrabajadosFin = 0;
  
  const vacGeneradasHoy = Math.round((diasTrabajadosHoy * multiplicador) * 10) / 10;
  const vacGeneradasFin = Math.round((diasTrabajadosFin * multiplicador) * 10) / 10;
  
  const sabGeneradasHoy = Math.round(((6 / 365) * diasTrabajadosHoy) * 10) / 10;
  const sabGeneradasFin = Math.round(((6 / 365) * diasTrabajadosFin) * 10) / 10;
  
  let vacacionesAprobadas = 0;
  let sabadosAprobados = 0;
  const loadedDays = new Set();
  
  const sheetSchedule = getSheet(SHEET_SCHEDULE);
  const rowsSchedule = sheetSchedule.getDataRange().getValues();
  for (let i = 1; i < rowsSchedule.length; i++) {
    const rowName = String(rowsSchedule[i][0]).trim().toLowerCase();
    if (rowName === safeName) {
      const hDate = formatSheetDate(rowsSchedule[i][2]);
      if (hDate.startsWith(currentYear.toString())) {
        loadedDays.add(hDate);
        const horarioText = String(rowsSchedule[i][6]).trim().toLowerCase();
        if (horarioText.includes("vacacion") || horarioText.includes("vacación")) {
          vacacionesAprobadas++;
        } else if (horarioText.includes("sabado de calidad") || horarioText.includes("sábado de calidad") || horarioText.includes("calidad")) {
          sabadosAprobados++;
        }
      }
    }
  }
  
  const sheetSols = getSheet(SHEET_SOLICITUDES);
  const rowsSols = sheetSols.getDataRange().getValues();
  for (let i = 1; i < rowsSols.length; i++) {
    const sName = String(rowsSols[i][2]).trim().toLowerCase();
    const estado = String(rowsSols[i][7]).trim().toLowerCase();
    if (sName === safeName && estado === 'aprobada') {
      const sDate = formatSheetDate(rowsSols[i][3]);
      if (sDate.startsWith(currentYear.toString())) {
        if (!loadedDays.has(sDate)) {
          const motivo = String(rowsSols[i][6]).trim().toLowerCase();
          const reqHorario = String(rowsSols[i][5]).trim().toLowerCase();
          if (motivo.includes("vacacion") || motivo.includes("vacación") || reqHorario.includes("vacacion") || reqHorario.includes("vacación")) {
            vacacionesAprobadas++;
          } else if (motivo.includes("calidad") || reqHorario.includes("calidad")) {
            sabadosAprobados++;
          }
        }
      }
    }
  }

  return jsonResponse({
    success: true,
    stats: {
      diasTrabajados: { hoy: diasTrabajadosHoy, finDeAno: diasTrabajadosFin },
      vacaciones: { 
        generadasHoy: vacGeneradasHoy, 
        generadasFinDeAno: vacGeneradasFin, 
        aprobadas: vacacionesAprobadas, 
        pendientesHoy: Math.round((vacGeneradasHoy - vacacionesAprobadas) * 10) / 10,
        pendientesFinDeAno: Math.round((vacGeneradasFin - vacacionesAprobadas) * 10) / 10
      },
      sabados: { 
        generadasHoy: sabGeneradasHoy, 
        generadasFinDeAno: sabGeneradasFin, 
        aprobadas: sabadosAprobados, 
        pendientesHoy: Math.round((sabGeneradasHoy - sabadosAprobados) * 10) / 10,
        pendientesFinDeAno: Math.round((sabGeneradasFin - sabadosAprobados) * 10) / 10
      }
    }
  });
}
"""
    
    content = content[:start_idx] + new_func
    
    # Update the tag at the top of the file so UI updates
    content = content.replace(" * (UPDATED_MATH)", " * (UPDATED_DASHBOARD)")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Backend updated successfully!")
else:
    print("Function start not found!")


import re

filepath = "/Users/tony/.gemini/antigravity/brain/98abe59f-933a-438e-9ef2-58c71e22ca6d/Codigo_Servidor_Final.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

new_func = """

function handleGetAllPromotorStats(data) {
  const sheetUsers = getSheet(SHEET_USERS);
  const rowsUsers = sheetUsers.getDataRange().getValues();
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const baseDateDefault = new Date(currentYear, 0, 1);
  const finDeAnoDate = new Date(currentYear, 11, 31);
  
  // 1. Parse schedules once
  const schedMap = {}; // name -> { vac: 0, sab: 0, loadedDays: new Set() }
  const sheetSchedule = getSheet(SHEET_SCHEDULE);
  const rowsSchedule = sheetSchedule.getDataRange().getValues();
  for (let i = 1; i < rowsSchedule.length; i++) {
    const rowName = String(rowsSchedule[i][0]).trim().toLowerCase();
    if (!schedMap[rowName]) {
      schedMap[rowName] = { vac: 0, sab: 0, loadedDays: new Set() };
    }
    const hDate = formatSheetDate(rowsSchedule[i][2]);
    if (hDate.startsWith(currentYear.toString())) {
      schedMap[rowName].loadedDays.add(hDate);
      const horarioText = String(rowsSchedule[i][6]).trim().toLowerCase();
      if (horarioText.includes("vacacion") || horarioText.includes("vacación")) {
        schedMap[rowName].vac++;
      } else if (horarioText.includes("sabado de calidad") || horarioText.includes("sábado de calidad") || horarioText.includes("calidad")) {
        schedMap[rowName].sab++;
      }
    }
  }
  
  // 2. Parse solicitudes once
  const sheetSols = getSheet(SHEET_SOLICITUDES);
  const rowsSols = sheetSols.getDataRange().getValues();
  for (let i = 1; i < rowsSols.length; i++) {
    const estado = String(rowsSols[i][7]).trim().toLowerCase();
    if (estado === 'aprobada') {
      const sName = String(rowsSols[i][2]).trim().toLowerCase();
      if (!schedMap[sName]) {
        schedMap[sName] = { vac: 0, sab: 0, loadedDays: new Set() };
      }
      const sDate = formatSheetDate(rowsSols[i][3]);
      if (sDate.startsWith(currentYear.toString())) {
        if (!schedMap[sName].loadedDays.has(sDate)) {
          const motivo = String(rowsSols[i][6]).trim().toLowerCase();
          const reqHorario = String(rowsSols[i][5]).trim().toLowerCase();
          if (motivo.includes("vacacion") || motivo.includes("vacación") || reqHorario.includes("vacacion") || reqHorario.includes("vacación")) {
            schedMap[sName].vac++;
          } else if (motivo.includes("calidad") || reqHorario.includes("calidad")) {
            schedMap[sName].sab++;
          }
        }
      }
    }
  }
  
  // 3. Process promoters
  const promotores = [];
  
  for (let i = 1; i < rowsUsers.length; i++) {
    const role = String(rowsUsers[i][4]).trim().toLowerCase();
    if (role === 'promotor') {
      const username = String(rowsUsers[i][2]).trim();
      const rawName = String(rowsUsers[i][1]).trim();
      const safeName = rawName.toLowerCase();
      
      let fechaIncorporacionStr = rowsUsers[i][11];
      let multiplicadorStr = "0.08";
      if (rowsUsers[i][14] !== undefined && rowsUsers[i][14] !== "") {
        multiplicadorStr = String(rowsUsers[i][14]).trim().replace(",", ".");
      }
      
      let multiplicador = parseFloat(multiplicadorStr) || 0.08;
      if (multiplicador === 6 || multiplicador === 7) {
        multiplicador = 0.08;
      } else if (multiplicador >= 1 && multiplicador <= 5) {
        multiplicador = 0.06;
      }
      
      let baseDate = baseDateDefault;
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
      
      const vacAprobadas = schedMap[safeName] ? schedMap[safeName].vac : 0;
      const sabAprobados = schedMap[safeName] ? schedMap[safeName].sab : 0;
      
      promotores.push({
        id: rowsUsers[i][0],
        name: rawName,
        username: username,
        centro: rowsUsers[i][10] || '',
        region: rowsUsers[i][13] || '',
        manager: { gpv: rowsUsers[i][5], am: rowsUsers[i][6], coordinadora: rowsUsers[i][7], trainer: rowsUsers[i][8] || '', administradora: rowsUsers[i][9] || '' },
        stats: {
          diasTrabajados: { hoy: diasTrabajadosHoy, finDeAno: diasTrabajadosFin },
          vacaciones: {
            generadasHoy: vacGeneradasHoy,
            generadasFinDeAno: vacGeneradasFin,
            aprobadas: vacAprobadas,
            pendientesHoy: Math.round((vacGeneradasHoy - vacAprobadas) * 10) / 10,
            pendientesFinDeAno: Math.round((vacGeneradasFin - vacAprobadas) * 10) / 10
          },
          sabados: {
            generadasHoy: sabGeneradasHoy,
            generadasFinDeAno: sabGeneradasFin,
            aprobadas: sabAprobados,
            pendientesHoy: Math.round((sabGeneradasHoy - sabAprobados) * 10) / 10,
            pendientesFinDeAno: Math.round((sabGeneradasFin - sabAprobados) * 10) / 10
          }
        }
      });
    }
  }

  return jsonResponse({
    success: true,
    promotores
  });
}
"""

if "function handleGetAllPromotorStats" not in content:
    # Insert it before the last closing brace or at the end
    content = content.replace(" * (UPDATED_DASHBOARD)", " * (CONTROL_EQUIPO)")
    content += new_func
    
    # We also need to add it to the doPost router
    router_idx = content.find("switch (action) {")
    if router_idx != -1:
        router_end_idx = content.find("default:", router_idx)
        if router_end_idx != -1:
            router_case = """
    case 'getAllPromotorStats':
      return handleGetAllPromotorStats(data);
"""
            content = content[:router_end_idx] + router_case + content[router_end_idx:]

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("handleGetAllPromotorStats added successfully!")
else:
    print("Function already exists.")


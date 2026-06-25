import re

with open('/Users/tony/.gemini/antigravity/brain/98abe59f-933a-438e-9ef2-58c71e22ca6d/Codigo_Servidor_Final.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "else if (tipo === 'sabado_calidad') {" in line:
        start_idx = i
        break

# Find where the block ends. We know the next lines after the block are:
# if (updates.aprobadaPor !== undefined) sheet.getRange(i + 1, 10).setValue(updates.aprobadaPor);
for i in range(start_idx, len(lines)):
    if "if (updates.aprobadaPor !== undefined) sheet.getRange" in lines[i]:
        end_idx = i
        break

# The block to replace
new_code = """          } else if (tipo === 'sabado_calidad') {
             const sabDateStr = diaAfectado || reqData.fechaInicio || reqData.horarioSolicitado;
             const targetWeek = getWeekOfDate(sabDateStr);
             
             // Encontrar Centro
             let miCentro = "";
             for (let u = 1; u < usersRows.length; u++) {
               if (String(usersRows[u][1]).trim().toLowerCase() === safeNameLower) {
                 miCentro = String(usersRows[u][10]).trim().toLowerCase();
                 break;
               }
             }
             
             if (miCentro) {
               // Encontrar dia de descanso del solicitante
               let miDescansoDate = "";
               for (let j = 1; j < horariosRows.length; j++) {
                 const hName = String(horariosRows[j][0]).trim().toLowerCase();
                 const dStr = formatSheetDate(horariosRows[j][2]);
                 if (hName === safeNameLower && getWeekOfDate(dStr) === targetWeek) {
                    const dDate = new Date(dStr);
                    const dayOfWeek = dDate.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
                    if (dayOfWeek >= 1 && dayOfWeek <= 6) { // Lunes a Sábado
                      const hHorario = String(horariosRows[j][6]).trim().toLowerCase();
                      if (hHorario.includes('day off') || hHorario.includes('descanso')) {
                         miDescansoDate = dStr;
                      }
                    }
                 }
               }
               
               if (miDescansoDate && miDescansoDate !== sabDateStr) {
                  const originalData = {}; 
                  
                  for (let j = 1; j < horariosRows.length; j++) {
                    const hUser = String(horariosRows[j][0]).trim().toLowerCase();
                    const dStr = formatSheetDate(horariosRows[j][2]);
                    
                    if (getWeekOfDate(dStr) === targetWeek) {
                       let isCentro = false;
                       for (let u = 1; u < usersRows.length; u++) {
                         if (String(usersRows[u][1]).trim().toLowerCase() === hUser && String(usersRows[u][10]).trim().toLowerCase() === miCentro) {
                           isCentro = true; break;
                         }
                       }
                       
                       if (isCentro) {
                         if (!originalData[hUser]) originalData[hUser] = {};
                         if (dStr === sabDateStr) {
                           originalData[hUser].sabRow = j;
                           originalData[hUser].sabHorario = horariosRows[j][6];
                           originalData[hUser].sabHoras = horariosRows[j][7];
                         } else if (dStr === miDescansoDate) {
                           originalData[hUser].descRow = j;
                           originalData[hUser].descHorario = horariosRows[j][6];
                           originalData[hUser].descHoras = horariosRows[j][7];
                         }
                       }
                    }
                  }
                  
                  // Hacer SWAP a todos los del centro
                  for (const hUser in originalData) {
                    const userOrig = originalData[hUser];
                    if (userOrig.sabRow && userOrig.descRow) {
                      // El horario del sábado pasa al día de descanso (ej. jueves)
                      sheetHorarios.getRange(userOrig.descRow + 1, 7).setValue(userOrig.sabHorario);
                      sheetHorarios.getRange(userOrig.descRow + 1, 8).setValue(userOrig.sabHoras);
                      
                      // El horario del día de descanso pasa al sábado
                      if (hUser === safeNameLower) {
                        sheetHorarios.getRange(userOrig.sabRow + 1, 7).setValue("Sábado calidad");
                        sheetHorarios.getRange(userOrig.sabRow + 1, 8).setValue(0);
                      } else {
                        sheetHorarios.getRange(userOrig.sabRow + 1, 7).setValue(userOrig.descHorario);
                        sheetHorarios.getRange(userOrig.sabRow + 1, 8).setValue(userOrig.descHoras);
                      }
                    }
                  }
               }
             }
          }
        }
      }
      
"""

lines = lines[:start_idx] + [new_code] + lines[end_idx:]

with open('/Users/tony/.gemini/antigravity/brain/98abe59f-933a-438e-9ef2-58c71e22ca6d/Codigo_Servidor_Final.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Successfully replaced.")

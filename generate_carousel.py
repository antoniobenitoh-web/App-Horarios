import os

files = [
    "src/components/Layout/Topbar.jsx",
    "src/pages/Dashboard/Dashboard.jsx",
    "src/pages/Equipo/Equipo.jsx",
    "src/pages/Solicitudes/Solicitudes.jsx",
    "src/pages/ControlHoras/ControlHoras.jsx",
    "src/pages/Admin/UserManagement.jsx",
    "src/context/AuthContext.jsx"
]

output = "````carousel\n"

for i, filepath in enumerate(files):
    if i > 0:
        output += "<!-- slide -->\n"
    
    output += f"### Archivo: `{filepath}`\n"
    output += "1. Ve a GitHub, abre este archivo exacto.\n"
    output += "2. Haz clic en el ✏️ (editar) y borra TODO.\n"
    output += "3. Usa el botón 'Copy code' que aparece arriba a la derecha del recuadro negro de abajo, pégalo y haz Commit.\n\n"
    
    with open(f"/Users/tony/.gemini/antigravity/scratch/App-Horarios-Real/{filepath}", "r") as f:
        content = f.read()
    
    output += "```jsx\n"
    output += content
    output += "\n```\n"

output += "````\n"

with open("/Users/tony/.gemini/antigravity/brain/98abe59f-933a-438e-9ef2-58c71e22ca6d/React_Code_Updates.md", "w") as f:
    f.write(output)


filepath = "/Users/tony/.gemini/antigravity/scratch/App-Horarios-Real/src/pages/Solicitudes/Solicitudes.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace <div className="card"> with <div className="card metric-card"> inside the Dashboard Promotor block
# I will just find all <div className="card"> and replace if it is inside the dashboard block.
# Actually I'll replace the exact ones in the dashboard block.

content = content.replace(
    '<div className="card">\n            <h3 style={{ fontSize: \'0.9rem\', color: \'var(--text-tertiary)\', textTransform: \'uppercase\', marginBottom: \'0.5rem\' }}>Días Trabajados</h3>',
    '<div className="card metric-card animate-fade-up animate-delay-1">\n            <h3 style={{ fontSize: \'0.9rem\', color: \'var(--text-tertiary)\', textTransform: \'uppercase\', marginBottom: \'0.5rem\' }}>Días Trabajados</h3>'
)

content = content.replace(
    '<div className="card">\n            <h3 style={{ fontSize: \'0.9rem\', color: \'var(--text-tertiary)\', textTransform: \'uppercase\', marginBottom: \'0.5rem\' }}>Vacaciones</h3>',
    '<div className="card metric-card animate-fade-up animate-delay-2">\n            <h3 style={{ fontSize: \'0.9rem\', color: \'var(--text-tertiary)\', textTransform: \'uppercase\', marginBottom: \'0.5rem\' }}>Vacaciones</h3>'
)

content = content.replace(
    '<div className="card">\n            <h3 style={{ fontSize: \'0.9rem\', color: \'var(--text-tertiary)\', textTransform: \'uppercase\', marginBottom: \'0.5rem\' }}>Sábados de Calidad</h3>',
    '<div className="card metric-card animate-fade-up animate-delay-3">\n            <h3 style={{ fontSize: \'0.9rem\', color: \'var(--text-tertiary)\', textTransform: \'uppercase\', marginBottom: \'0.5rem\' }}>Sábados de Calidad</h3>'
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Solicitudes.jsx metrics updated!")

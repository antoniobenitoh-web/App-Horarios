import re

filepath = "/Users/tony/.gemini/antigravity/scratch/App-Horarios-Real/src/pages/Solicitudes/Solicitudes.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# I need to replace the entire "Dashboard Promotor" JSX block.
start_str = "{/* Dashboard Promotor */}"
end_str = "{/* Contenedor Principal de Solicitudes */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_dashboard = """{/* Dashboard Promotor */}
      {isPromotor && promotorStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          {/* Días Trabajados */}
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Días Trabajados</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--salesland-primary)', lineHeight: '1.2' }}>{promotorStats.diasTrabajados.hoy}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Días hasta fecha actual</p>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Hasta fin de año (2026):</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{promotorStats.diasTrabajados.finDeAno}</span>
              </div>
            </div>
          </div>

          {/* Vacaciones */}
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Vacaciones</h3>
            
            <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Disponibles hasta fin de año (2026):</span>
                <span style={{ fontWeight: 'bold', color: 'var(--salesland-primary)' }}>{promotorStats.vacaciones.generadasFinDeAno}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>A día de hoy:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{promotorStats.vacaciones.generadasHoy}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Aprobadas:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{promotorStats.vacaciones.aprobadas}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Pendientes (Total 2026):</span>
                <span style={{ fontWeight: 'bold', color: promotorStats.vacaciones.pendientesFinDeAno < 0 ? 'var(--danger)' : 'var(--salesland-primary)' }}>
                  {promotorStats.vacaciones.pendientesFinDeAno}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pendientes (A día de hoy):</span>
                <span style={{ fontWeight: 'bold', color: promotorStats.vacaciones.pendientesHoy < 0 ? 'var(--danger)' : 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {promotorStats.vacaciones.pendientesHoy}
                </span>
              </div>
            </div>
          </div>

          {/* Sábados de Calidad */}
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Sábados de Calidad</h3>
            
            <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Disponibles hasta fin de año (2026):</span>
                <span style={{ fontWeight: 'bold', color: 'var(--salesland-primary)' }}>{promotorStats.sabados.generadasFinDeAno}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>A día de hoy:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{promotorStats.sabados.generadasHoy}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Aprobados:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{promotorStats.sabados.aprobadas}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Pendientes (Total 2026):</span>
                <span style={{ fontWeight: 'bold', color: promotorStats.sabados.pendientesFinDeAno < 0 ? 'var(--danger)' : 'var(--salesland-primary)' }}>
                  {promotorStats.sabados.pendientesFinDeAno}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pendientes (A día de hoy):</span>
                <span style={{ fontWeight: 'bold', color: promotorStats.sabados.pendientesHoy < 0 ? 'var(--danger)' : 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {promotorStats.sabados.pendientesHoy}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      """
    
    content = content[:start_idx] + new_dashboard + content[end_idx:]
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("JSX updated successfully!")
else:
    print("Dashboard block not found!")

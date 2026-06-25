filepath = "/Users/tony/.gemini/antigravity/scratch/App-Horarios-Real/src/pages/Solicitudes/Solicitudes.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Blocks
filtros_block = """      {/* Filtros */}
      <div className={styles.filtros}>
        {['todas', 'pendiente', 'aprobada', 'rechazada'].map(f => (
          <button key={f} className={`${styles.filtroBtn} ${filtro === f ? styles.filtroActivo : ''}`}
            onClick={() => setFiltro(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={styles.filtroCount}>
              {f === 'todas' ? solicitudes.length : solicitudes.filter(s => s.estado === f).length}
            </span>
          </button>
        ))}
      </div>"""

# Remove the Filtros block from its original position
if filtros_block in content:
    content = content.replace(filtros_block + "\n\n", "")
    
    # We will insert it right before `{/* Lista */}`
    lista_idx = content.find("{/* Lista */}")
    
    new_wrapper_start = """      {/* Contenedor Principal de Solicitudes */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          {/* Filtros */}
          <div className={styles.filtros} style={{ margin: 0 }}>
            {['todas', 'pendiente', 'aprobada', 'rechazada'].map(f => (
              <button key={f} className={`${styles.filtroBtn} ${filtro === f ? styles.filtroActivo : ''}`}
                onClick={() => setFiltro(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className={styles.filtroCount}>
                  {f === 'todas' ? solicitudes.length : solicitudes.filter(s => s.estado === f).length}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: 'transparent' }}>
"""
    
    content = content[:lista_idx] + new_wrapper_start + "          {/* Lista */}\n" + content[lista_idx + 13:]
    
    # Now close the two divs at the end of the file
    content = content.replace("      </div>\n    </Layout>", "        </div>\n      </div>\n      </div>\n    </Layout>")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Layout replaced successfully")
else:
    print("Filtros block not found exactly")


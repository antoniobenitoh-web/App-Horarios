import re

filepath = "/Users/tony/.gemini/antigravity/scratch/App-Horarios-Real/src/pages/Solicitudes/Solicitudes.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# The blocks
filtros_start = "{/* Filtros */}"
dashboard_start = "{/* Dashboard Promotor */}"
lista_start = "{/* Lista */}"

# Find the indices
f_idx = content.find(filtros_start)
d_idx = content.find(dashboard_start)
l_idx = content.find(lista_start)

# The dashboard block goes from dashboard_start to the end of its conditional render `)}`
# Let's extract it manually
d_block_match = re.search(r'\{\/\* Dashboard Promotor \*\/.*?\}\)', content[d_idx:], re.DOTALL)
if d_block_match:
    d_block = d_block_match.group(0)
    
    # Remove the dashboard block from its current position
    content = content[:d_idx] + content[d_idx + len(d_block):]
    
    # Insert the dashboard block BEFORE the Filtros block
    f_idx_new = content.find(filtros_start)
    content = content[:f_idx_new] + d_block + "\n\n      " + content[f_idx_new:]

    # Now wrap Filtros and Lista in a card
    # We find where Lista ends. It ends at the end of the file right before `</div>` and `</Layout>`
    # Actually, let's just wrap it like this:
    # <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
    #   <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
    #     {/* Filtros */} ...
    #   </div>
    #   <div style={{ padding: '1.5rem' }}>
    #     {/* Lista */} ...
    #   </div>
    # </div>
    
    # To do this safely, let's just replace the `{/* Filtros */}` and `{/* Lista */}` tags
    
    f_replacement = """{/* Contenedor Principal de Solicitudes */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          {/* Filtros */}"""
          
    content = content.replace("{/* Filtros */}", f_replacement)
    
    l_replacement = """</div>
        <div style={{ padding: '1.5rem', backgroundColor: 'transparent' }}>
          {/* Lista */}"""
          
    content = content.replace("{/* Lista */}", l_replacement)
    
    # We need to add an extra `</div></div>` at the very end.
    # The end looks like:
    #       </div>
    #     </Layout>
    #   );
    # }
    
    # Let's replace `    </Layout>` with `      </div>\n      </div>\n    </Layout>`
    # Wait, the `lista` div itself is closed by a `</div>`.
    # Let's just find the last `</div>\n    </Layout>`
    content = content.replace("      </div>\n    </Layout>", "      </div>\n        </div>\n      </div>\n    </Layout>")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Layout moved successfully!")
else:
    print("Could not find dashboard block")


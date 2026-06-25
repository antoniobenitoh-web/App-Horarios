filepath = "/Users/tony/.gemini/antigravity/scratch/App-Horarios-Real/src/pages/Solicitudes/Solicitudes.module.css"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# I will append new classes for the redesign and override existing ones.
# Actually it's better to just overwrite the file entirely because I want it to be clean.
# I will read the file, extract the parts I need, or just overwrite it entirely.

new_css = """
.container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeSlideUp 0.5s ease-out;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.header h1 {
  font-size: 2.2rem;
  background: var(--navy-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

/* Filtros as Header of the Main Card */
.filtros {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(0,0,0,0.04);
}

.filtroBtn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border: 1px solid rgba(10, 37, 64, 0.08);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  color: var(--text-secondary);
  border-radius: var(--border-radius-full);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all var(--transition-bounce);
}

.filtroBtn:hover {
  background: #ffffff;
  color: var(--salesland-navy);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10, 37, 64, 0.05);
}

.filtroActivo {
  background: var(--accent-gradient) !important;
  border-color: transparent !important;
  color: white !important;
  box-shadow: 0 6px 16px rgba(255, 103, 0, 0.3);
}

.filtroCount {
  background: rgba(0,0,0,0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}
.filtroActivo .filtroCount {
  background: rgba(255,255,255,0.25);
  color: white;
}

/* Lista */
.lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: transparent;
}

.solicitudCard {
  padding: 0 !important;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(10, 37, 64, 0.06);
  background: rgba(255, 255, 255, 0.8) !important;
}

.solicitudHeader {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.75rem;
  flex-wrap: wrap;
  transition: background var(--transition-fast);
}
.solicitudHeader:hover {
  background: rgba(10, 37, 64, 0.02);
}

.solicitudMeta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 0 0 auto;
}

.solicitudId {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--salesland-navy);
}

.solicitudInfo {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
}
.solicitudInfo span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.expandBtn {
  background: rgba(10, 37, 64, 0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-bounce);
}
.solicitudCard:hover .expandBtn {
  background: var(--xiaomi-orange);
  color: white;
  transform: scale(1.1);
}

.solicitudDetalle {
  padding: 1.75rem;
  background: #ffffff;
  border-top: 1px solid rgba(10, 37, 64, 0.05);
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detalleGrid {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  background: rgba(10, 37, 64, 0.02);
  padding: 1.25rem;
  border-radius: var(--border-radius-md);
}

.detalleItem {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.detalleLabel {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  font-weight: 700;
}

.detalleValor {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.detalleNuevo {
  color: var(--xiaomi-orange);
}

.detalleArrow {
  color: var(--text-tertiary);
  font-weight: bold;
}

.motivoBox {
  display: flex;
  gap: 1rem;
  background: rgba(255, 103, 0, 0.05);
  border: 1px solid rgba(255, 103, 0, 0.1);
  padding: 1.25rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1.5rem;
  color: var(--salesland-navy);
}

.detalleFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  padding-top: 1.5rem;
  border-top: 1px dashed rgba(10, 37, 64, 0.1);
}

.accionesCoord {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(10, 37, 64, 0.05);
}

.btnAprobar {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}
.btnAprobar:hover {
  background: #22c55e;
  color: white;
}
.btnRechazar {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}
.btnRechazar:hover {
  background: #ef4444;
  color: white;
}

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: var(--text-tertiary);
  text-align: center;
}

/* Modal Form */
.formCard {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 103, 0, 0.3) !important;
  box-shadow: 0 20px 50px rgba(10, 37, 64, 0.15) !important;
}

.formRow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
.textarea {
  min-height: 100px;
  resize: vertical;
}
.formActions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
"""

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_css)
print("Solicitudes CSS overwritten!")

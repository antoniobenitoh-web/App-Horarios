filepath = "/Users/tony/.gemini/antigravity/scratch/App-Horarios-Real/src/pages/ControlHoras/ControlHoras.module.css"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

new_css = """
.container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeSlideUp 0.5s ease-out;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header h1 {
  font-size: 2.2rem;
  background: var(--navy-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

/* Selector Semanas */
.semanasContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.semanaBtn {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(10, 37, 64, 0.08);
  backdrop-filter: blur(8px);
  padding: 0.6rem 1.25rem;
  border-radius: var(--border-radius-full);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-bounce);
}

.semanaBtn:hover {
  background: #ffffff;
  color: var(--salesland-navy);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10, 37, 64, 0.05);
}

.semanaActiva {
  background: var(--navy-gradient) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 6px 16px rgba(10, 37, 64, 0.2);
}

/* Summary Grid */
.summaryGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summaryCard {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
}

.summaryIcon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 37, 64, 0.05);
  color: var(--salesland-navy);
}

.summaryCard:nth-child(1) .summaryIcon {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
}
.summaryCard:nth-child(2) .summaryIcon {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
}
.summaryCard:nth-child(3) .summaryIcon {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

.summaryInfo h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 0.25rem;
  letter-spacing: 0.05em;
}

.summaryInfo p {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

/* Tabla Horarios */
.tableWrapper {
  overflow-x: auto;
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(10, 37, 64, 0.06);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  box-shadow: var(--glass-shadow);
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  font-size: 0.95rem;
}

.table th {
  background: rgba(10, 37, 64, 0.03);
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--salesland-navy);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(10, 37, 64, 0.06);
  white-space: nowrap;
}

.table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(10, 37, 64, 0.04);
  color: var(--text-secondary);
  font-weight: 500;
}

.table tr:hover td {
  background: rgba(10, 37, 64, 0.01);
  color: var(--text-primary);
}

.table tr:last-child td {
  border-bottom: none;
}

.cellPromotor {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.avatarSmall {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.statusBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-full);
  font-size: 0.8rem;
  font-weight: 700;
}

.statusOk {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
}

.statusReview {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
}

.statusMissing {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

/* Modals */
.modalOverlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10, 37, 64, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease-out;
  padding: 1rem;
}

.modalContent {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 50px rgba(10, 37, 64, 0.2);
  animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.closeBtn {
  background: rgba(10, 37, 64, 0.05);
  border: none;
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-bounce);
}
.closeBtn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  transform: rotate(90deg);
}

.detalleModalGrid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detalleModalRow {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(10, 37, 64, 0.02);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(10, 37, 64, 0.04);
}

.detalleModalRow strong {
  color: var(--salesland-navy);
}

.detalleModalRow span {
  font-weight: 600;
  color: var(--text-primary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
"""

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_css)
print("ControlHoras CSS rewritten!")

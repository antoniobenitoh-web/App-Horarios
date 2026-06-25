filepath = "/Users/tony/.gemini/antigravity/scratch/App-Horarios-Real/src/components/Layout/Layout.module.css"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

new_css = """
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-width);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-right: 1px solid rgba(10, 37, 64, 0.08);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 50;
  transition: transform var(--transition-bounce);
  box-shadow: 4px 0 24px rgba(0,0,0,0.02);
}

.brand {
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.75rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--salesland-navy);
  border-bottom: 1px solid rgba(10, 37, 64, 0.04);
  letter-spacing: -0.02em;
}

.brand span {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.25rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.navItem:hover {
  background: rgba(10, 37, 64, 0.04);
  color: var(--salesland-navy);
  transform: translateX(4px);
}

.navItem.active {
  background: var(--navy-gradient);
  color: white;
  box-shadow: 0 4px 15px rgba(10, 37, 64, 0.2);
}

.userProfile {
  padding: 1.5rem;
  border-top: 1px solid rgba(10, 37, 64, 0.04);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.5);
}

.avatar {
  width: 44px;
  height: 44px;
  background: var(--accent-gradient);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(255, 103, 0, 0.25);
}

.userInfo {
  display: flex;
  flex-direction: column;
}

.userName {
  font-weight: 700;
  color: var(--salesland-navy);
  font-size: 0.95rem;
}

.userRole {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.logoutBtn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.logoutBtn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  transform: rotate(90deg);
}

.main {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--transition-bounce);
}

.topbar {
  height: var(--topbar-height);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid rgba(10, 37, 64, 0.04);
  display: flex;
  align-items: center;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
}

.topbarTitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--salesland-navy);
}

.content {
  flex: 1;
  padding: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.menuToggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--salesland-navy);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
}
.menuToggle:hover {
  background: rgba(10, 37, 64, 0.05);
}

.overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .main {
    margin-left: 0;
  }
  .menuToggle {
    display: block;
    margin-right: 1rem;
  }
  .content {
    padding: 1.5rem;
  }
  .overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 37, 64, 0.4);
    backdrop-filter: blur(4px);
    z-index: 45;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-smooth);
  }
  .overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }
}
"""
with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_css)
print("Layout CSS rewritten!")

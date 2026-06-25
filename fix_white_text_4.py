import os

def replace_in_file(path, replacements):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {path}")

# Fix User profile modal in Topbar
replace_in_file("src/components/Layout/Layout.module.css", [
    ("color: var(--text-light-primary);", "color: var(--text-primary);"),
    ("--text-primary: var(--text-light-primary);", "")
])

# Fix Add User modal
replace_in_file("src/pages/Admin/UserManagement.module.css", [
    ("color: var(--text-light-primary);", "color: var(--text-primary);"),
    ("--text-primary: var(--text-light-primary);", "")
])

# Fix Equipo "Mi Equipo" labels that might have text-light-primary
replace_in_file("src/pages/Equipo/Equipo.module.css", [
    ("color: var(--text-light-primary);", "color: var(--text-primary);"),
    ("--text-primary: var(--text-light-primary);", "")
])

# Fix Solicitudes
replace_in_file("src/pages/Solicitudes/Solicitudes.module.css", [
    ("color: var(--text-light-primary);", "color: var(--text-primary);"),
    ("--text-primary: var(--text-light-primary);", "")
])


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

# Fix User profile in Topbar
replace_in_file("src/components/Layout/Layout.module.css", [
    ("color: var(--text-light-primary);", "color: var(--text-primary);"),
    ("--text-primary: var(--text-light-primary);", "/* --text-primary: var(--text-primary); */"),
    ("color: #ffffff;", "color: var(--text-primary);"),
    ("color: white;", "color: var(--text-primary);")
])

# Fix Añadir Usuario modal
replace_in_file("src/pages/Admin/UserManagement.module.css", [
    ("color: var(--text-light-primary);", "color: var(--text-primary);"),
    ("--text-primary: var(--text-light-primary);", "/* --text-primary: var(--text-primary); */"),
    ("color: #ffffff;", "color: var(--text-primary);"),
    ("color: white;", "color: var(--text-primary);")
])

# Be careful about buttons in UserManagement being changed from white to dark text!
# Actually, I should probably only fix the specific `color: var(--text-light-primary)` which is setting the modal card text to white.

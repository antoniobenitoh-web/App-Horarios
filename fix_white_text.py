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

# 1. Schedule.module.css overrides
replace_in_file("src/pages/Schedule/Schedule.module.css", [
    ("color: #ffffff;\n}", "color: var(--text-primary);\n}"),
    ("color: #ffffff !important;\n}", "color: var(--text-primary) !important;\n}"),
    ("color: #e5e5e5;", "color: var(--text-secondary);"),
    ("color: #4a4a4a !important;", "color: var(--text-primary) !important;")
])

# 2. ControlHoras.jsx
replace_in_file("src/pages/ControlHoras/ControlHoras.jsx", [
    ("color: isChecked ? 'var(--accent-primary)' : 'var(--text-light-primary)'",
     "color: isChecked ? 'var(--accent-primary)' : 'var(--text-primary)'")
])

# 3. index.css (fix faint login texts by updating global inputs)
replace_in_file("src/index.css", [
    ("background-color: #0b1a42;", "background-color: #ffffff;"),
    ("border: 1px solid rgba(255, 255, 255, 0.1);", "border: 1px solid rgba(0, 0, 0, 0.1);"),
    ("color: var(--text-light-primary);", "color: var(--text-primary);"),
    ("background-color: var(--bg-primary);\n  color: #000;", "background-color: #ffffff;\n  color: var(--text-primary);")
])


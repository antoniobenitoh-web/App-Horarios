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

# Fix index.css accents
replace_in_file("src/index.css", [
    ("--accent-primary: #FF6700;", "--accent-primary: #0d6386;"),
    ("--accent-hover: #e05c00;", "--accent-hover: #094359;"),
    ("--accent-light: rgba(255, 103, 0, 0.15);", "--accent-light: rgba(13, 99, 134, 0.15);"),
    ("--accent-gradient: linear-gradient(135deg, #FF6700, #ff8c00);", "--accent-gradient: linear-gradient(135deg, #0d6386, #094359);")
])

# Fix white pagination arrows in Schedule and ControlHoras
for jsx_file in ["src/pages/Schedule/Schedule.jsx", "src/pages/ControlHoras/ControlHoras.jsx"]:
    replace_in_file(jsx_file, [
        ("color: currentMonthIndex <= 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)'", 
         "color: currentMonthIndex <= 0 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)'"),
        ("color: currentMonthIndex >= horarioMes.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)'", 
         "color: currentMonthIndex >= horarioMes.length - 1 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)'"),
        ("color: selectedMonth <= 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)'",
         "color: selectedMonth <= 0 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)'"),
        ("color: selectedMonth >= 11 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)'",
         "color: selectedMonth >= 11 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)'"),
        # Nav buttons (weeks)
        ("color: currentWeekIndex <= 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)'",
         "color: currentWeekIndex <= 0 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)'"),
        ("color: currentWeekIndex >= currentMonthData.semanas.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)'",
         "color: currentWeekIndex >= currentMonthData.semanas.length - 1 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)'")
    ])


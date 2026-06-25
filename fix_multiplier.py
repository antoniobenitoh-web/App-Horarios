import os

filepath = "/Users/tony/.gemini/antigravity/brain/98abe59f-933a-438e-9ef2-58c71e22ca6d/Codigo_Servidor_Final.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target = 'let multiplicador = parseFloat(multiplicadorStr) || 0.08;'
replacement = """let multiplicador = parseFloat(multiplicadorStr) || 0.08;
  // Si el usuario puso 6 o 7 (días de trabajo), convertimos a su coeficiente
  if (multiplicador === 6 || multiplicador === 7) {
    multiplicador = 0.08;
  } else if (multiplicador >= 1 && multiplicador <= 5) {
    multiplicador = 0.06;
  }
"""

if target in content and "multiplicador === 6" not in content:
    content = content.replace(target, replacement)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed multiplier!")
else:
    print("Target not found or already fixed")

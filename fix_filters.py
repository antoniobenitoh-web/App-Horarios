import os

src_dir = "src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".css"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Revert backgrounds for filters/cards
            # In css files, #15305a was the bg for .filtroBtn
            new_content = content.replace("#15305a", "#ffffff")
            new_content = new_content.replace("#1e3a8a", "#f1f5f9")
            
            # In JSX, inline styles: style={{ background: '#15305a', color: '#ffffff' }}
            # Replace white color with dark color for these specific inline selects
            new_content = new_content.replace("color: '#ffffff'", "color: '#1e293b'")
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {path}")

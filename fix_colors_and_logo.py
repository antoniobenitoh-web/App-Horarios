import os

src_dir = "src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".css"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content.replace("#1a1a1a", "#15305a")
            new_content = new_content.replace("#252525", "#1e3a8a")
            new_content = new_content.replace("#111111", "#0b1a42")
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated colors in {path}")

# Now fix Topbar.jsx logo
topbar_path = "src/components/Layout/Topbar.jsx"
with open(topbar_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace img src and brandTitle text
content = content.replace('<img src="/icon-192.png"', '<img src={import.meta.env.BASE_URL + "icon-192.png"}')
content = content.replace('<h2 className={styles.brandTitle} style={{ color: \'white\' }}>Portal Promotores</h2>', '<h2 className={styles.brandTitle} style={{ color: \'white\', fontWeight: \'600\', letterSpacing: \'1px\' }}>salesland</h2>')

with open(topbar_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated Topbar.jsx logo and title")


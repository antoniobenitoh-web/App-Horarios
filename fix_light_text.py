import os

src_dir = "src"
count = 0

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".css"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Fix hardcoded white texts in selects
            new_content = content.replace("color: 'var(--text-light-primary)'", "color: 'var(--text-primary)'")
            # Also fix arrows that might be color="white" or #fff
            # But let's be careful not to break Topbar. We can do it manually or via replace.
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                count += 1
                print(f"Updated {path}")
print(f"Total files updated: {count}")

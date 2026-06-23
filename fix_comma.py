import re

with open('src/context/AuthContext.jsx', 'r') as f:
    content = f.read()

content = content.replace("}\n  {", "},\n  {")

with open('src/context/AuthContext.jsx', 'w') as f:
    f.write(content)


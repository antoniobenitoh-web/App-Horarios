import re

with open('src/pages/Dashboard/Dashboard.jsx', 'r') as f:
    content = f.read()

replacement = """
        if (dataUsers.success) {
          if (user.role === 'administradora') {
            tSize = dataUsers.users.filter(u => u.role === 'promotor').length;
          } else {
            tSize = dataUsers.users.filter(u => 
              u.role === 'promotor' && 
              (String(u.manager.gpv || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
               String(u.manager.am || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
               String(u.manager.coordinadora || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
               String(u.manager.trainer || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase())
            ).length;
          }
        }
"""

content = re.sub(
    r'if \(dataUsers\.success\) \{.*?\}\.length;\s*\}',
    replacement.strip(),
    content,
    flags=re.DOTALL
)

with open('src/pages/Dashboard/Dashboard.jsx', 'w') as f:
    f.write(content)


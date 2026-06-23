import re

with open('src/pages/ControlHoras/ControlHoras.jsx', 'r') as f:
    content = f.read()

replacement = """
        if (data.success) {
          let myTeam = [];
          if (user.role === 'administradora') {
            myTeam = data.users.filter(u => u.role === 'promotor');
          } else {
            myTeam = data.users.filter(u => 
              u.role === 'promotor' && 
              (String(u.manager?.gpv || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
               String(u.manager?.am || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
               String(u.manager?.administradora || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() ||
               String(u.manager?.trainer || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() ||
               String(u.manager?.coordinadora || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase())
            );
          }
          setTeam(myTeam);
"""

content = re.sub(
    r'if \(data\.success\) \{.*?setTeam\(myTeam\);',
    replacement.strip(),
    content,
    flags=re.DOTALL
)

with open('src/pages/ControlHoras/ControlHoras.jsx', 'w') as f:
    f.write(content)


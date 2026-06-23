import re

with open('src/context/AuthContext.jsx', 'r') as f:
    content = f.read()

# Add alicia to mockUsers
new_mock_users = """
  {
    id: 5,
    username: 'alicia',
    password: '123',
    name: 'Alicia Admin',
    role: 'administradora'
  }
];
"""
content = re.sub(r'\];', new_mock_users.strip(), content, count=1)

# Lowercase user role from backend
replacement_login = """
        if (data.success) {
          if (data.user && data.user.role) {
            data.user.role = String(data.user.role).toLowerCase().trim();
          }
          setUser(data.user);
"""
content = re.sub(
    r'if \(data\.success\) \{\s*setUser\(data\.user\);',
    replacement_login.strip(),
    content
)

with open('src/context/AuthContext.jsx', 'w') as f:
    f.write(content)


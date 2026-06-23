import re

with open('src/pages/Admin/UserManagement.jsx', 'r') as f:
    content = f.read()

replacement = """
                    <div className={styles.managersList}>
                      {u.manager?.gpv && <span title="GPV">GPV: {u.manager.gpv}</span>}
                      {u.manager?.am && <span title="AM">AM: {u.manager.am}</span>}
                      {u.manager?.coordinadora && <span title="Coord">CO: {u.manager.coordinadora}</span>}
                      {u.manager?.administradora && <span title="Admin">AD: {u.manager.administradora}</span>}
                    </div>
"""

content = re.sub(
    r'<div className=\{styles\.managersList\}>.*?</div>',
    replacement.strip(),
    content,
    flags=re.DOTALL
)

with open('src/pages/Admin/UserManagement.jsx', 'w') as f:
    f.write(content)


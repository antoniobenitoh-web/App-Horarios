import re

with open('src/pages/Admin/UserManagement.jsx', 'r') as f:
    content = f.read()

# Make the options dynamic
new_options = """
                  <option value="promotor">Promotor</option>
                  <option value="gpv">GPV</option>
                  {user.role !== 'am' && <option value="am">Area Manager</option>}
                  {user.role === 'administradora' && <option value="coordinadora">Coordinadora</option>}
                  {user.role === 'administradora' && <option value="trainer">Trainer</option>}
                  {user.role === 'administradora' && <option value="administradora">Administradora</option>}
"""

content = re.sub(
    r'<option value="promotor">Promotor</option>.*?</select>',
    new_options.strip() + '\n                </select>',
    content,
    flags=re.DOTALL
)

# And in handleOpenModal we should set AM automatically if the creator is an AM
#   const handleOpenModal = (u = null) => {
# ...
#       setForm({ name: '', username: '', password: '', role: 'promotor', gpv: '', am: '', coordinadora: '', trainer: '', administradora: '', centro: '', fechaIncorporacion: '', email: '', region: '' });
# We change this to:
#      setForm({ ... , am: user.role === 'am' ? user.name : '', coordinadora: user.role === 'coordinadora' ? user.name : '' ... })

handle_modal_replacement = """
    if (u) {
      setEditingUser(u);
      setForm({
        name: u.name || '',
        username: u.username || '',
        password: u.password || '',
        role: u.role || 'promotor',
        gpv: u.manager?.gpv || '',
        am: u.manager?.am || '',
        coordinadora: u.manager?.coordinadora || '',
        trainer: u.manager?.trainer || '',
        administradora: u.manager?.administradora || '',
        centro: u.centro || '',
        fechaIncorporacion: u.fechaIncorporacion || '',
        email: u.email || '',
        region: u.region || ''
      });
    } else {
      setEditingUser(null);
      setForm({ 
        name: '', username: '', password: '', role: 'promotor', 
        gpv: '', 
        am: user.role === 'am' ? user.name : '', 
        coordinadora: user.role === 'coordinadora' ? user.name : '', 
        trainer: '', 
        administradora: '', 
        centro: '', fechaIncorporacion: '', email: '', region: '' 
      });
    }
"""

content = re.sub(r'if \(u\) \{.*?setForm\(\{ name: \'\',.*?\}\);.*?\}', handle_modal_replacement.strip(), content, flags=re.DOTALL)

with open('src/pages/Admin/UserManagement.jsx', 'w') as f:
    f.write(content)


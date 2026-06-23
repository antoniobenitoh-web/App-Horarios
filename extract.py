import re

def extract(md_path, js_path):
    with open(md_path, 'r') as f:
        content = f.read()
    match = re.search(r'```jsx\n(.*?)\n```', content, re.DOTALL)
    if match:
        code = match.group(1)
        if '/* eslint-disable */' not in code:
            code = '/* eslint-disable */\n' + code
        with open(js_path, 'w') as f:
            f.write(code)

extract('/Users/tony/.gemini/antigravity/brain/98abe59f-933a-438e-9ef2-58c71e22ca6d/UserManagement_Final.md', 'src/pages/Admin/UserManagement.jsx')
extract('/Users/tony/.gemini/antigravity/brain/98abe59f-933a-438e-9ef2-58c71e22ca6d/ControlHoras_Final.md', 'src/pages/ControlHoras/ControlHoras.jsx')

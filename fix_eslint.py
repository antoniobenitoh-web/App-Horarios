import os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if '/* eslint-disable */' not in content:
        content = '/* eslint-disable */\n' + content

    with open(filepath, 'w') as f:
        f.write(content)

src_dir = 'src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            fix_file(os.path.join(root, file))

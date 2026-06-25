import os

path = "src/pages/Schedule/Schedule.module.css"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Specifically replace text colors that are forcing white
content = content.replace("color: #ffffff !important;", "color: var(--text-primary) !important;")
# Some normal color: #ffffff; might be inside .navBtn, .shiftInfo, etc. 
# We'll just replace all "color: #ffffff;" to "color: var(--text-primary);" EXCEPT if we need them white. 
# Actually let's just do it, white backgrounds are everywhere now.
content = content.replace("color: #ffffff;", "color: var(--text-primary);")
content = content.replace("color: #fff;", "color: var(--text-primary);")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated Schedule CSS")

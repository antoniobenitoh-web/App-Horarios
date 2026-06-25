from PIL import Image

try:
    img = Image.open("mi_icono2.png").convert("RGBA")
    r, g, b, a = img.getpixel((0, 0))
    hex_color = f"#{r:02x}{g:02x}{b:02x}"
    print(f"Top-left pixel color is: {hex_color} (R:{r}, G:{g}, B:{b})")
except Exception as e:
    print(e)

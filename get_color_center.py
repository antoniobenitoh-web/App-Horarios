from PIL import Image

try:
    img = Image.open("mi_icono2.png").convert("RGBA")
    width, height = img.size
    print(f"Dimensions: {width}x{height}")
    # Let's sample a few pixels to find the dominant color (excluding white/transparent)
    colors = {}
    for y in range(0, height, 10):
        for x in range(0, width, 10):
            r, g, b, a = img.getpixel((x, y))
            if a > 0 and not (r > 230 and g > 230 and b > 230):
                hex_color = f"#{r:02x}{g:02x}{b:02x}"
                colors[hex_color] = colors.get(hex_color, 0) + 1
    
    # Sort by frequency
    sorted_colors = sorted(colors.items(), key=lambda item: item[1], reverse=True)
    for color, count in sorted_colors[:5]:
        print(f"{color}: {count} pixels")
except Exception as e:
    print(e)

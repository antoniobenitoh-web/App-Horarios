from PIL import Image

def get_dominant_color(img):
    width, height = img.size
    colors = {}
    for y in range(height//4, 3*height//4, 5):
        for x in range(width//4, 3*width//4, 5):
            r, g, b, a = img.getpixel((x, y))
            if a > 0 and not (r > 200 and g > 200 and b > 200) and not (r > 200 and g < 100 and b < 100):
                hex_color = (r, g, b)
                colors[hex_color] = colors.get(hex_color, 0) + 1
    sorted_colors = sorted(colors.items(), key=lambda item: item[1], reverse=True)
    return sorted_colors[0][0]

img = Image.open("mi_icono2.png").convert("RGBA")
width, height = img.size
dom_color = get_dominant_color(img)
print(f"Dominant color: {dom_color}")

# Make background transparent
pixels = img.load()
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # Calculate distance to dominant color
        dist = ((r - dom_color[0])**2 + (g - dom_color[1])**2 + (b - dom_color[2])**2)**0.5
        
        # If it's a white corner, make it transparent too
        is_white = r > 230 and g > 230 and b > 230
        
        if dist < 20 or is_white:
            pixels[x, y] = (0, 0, 0, 0) # Transparent
        elif dist < 40:
            # Semi-transparent for anti-aliasing
            alpha = int(((dist - 20) / 20) * 255)
            pixels[x, y] = (r, g, b, alpha)

img.save("transparent_test.png")
print("Saved transparent_test.png")

# Now create the final icon
size = 192
target_inner_size = int(size * 0.8)
img_resized = img.resize((target_inner_size, target_inner_size), Image.Resampling.LANCZOS)

new_img = Image.new('RGBA', (size, size), dom_color + (255,))
offset = (size - target_inner_size) // 2
new_img.paste(img_resized, (offset, offset), img_resized)
new_img.save("public/icon-192.png", "PNG")

size = 512
target_inner_size = int(size * 0.8)
img_resized = img.resize((target_inner_size, target_inner_size), Image.Resampling.LANCZOS)

new_img = Image.new('RGBA', (size, size), dom_color + (255,))
offset = (size - target_inner_size) // 2
new_img.paste(img_resized, (offset, offset), img_resized)
new_img.save("public/icon-512.png", "PNG")
print("Saved final icons")


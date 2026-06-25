from PIL import Image
import sys

def flood_fill_corners(img, target_color):
    width, height = img.size
    pixels = img.load()
    
    def fill(x, y):
        stack = [(x, y)]
        while stack:
            cx, cy = stack.pop()
            if 0 <= cx < width and 0 <= cy < height:
                r, g, b, a = pixels[cx, cy]
                # If pixel is very close to white/gray, flood fill it
                if r > 230 and g > 230 and b > 230:
                    pixels[cx, cy] = target_color
                    stack.extend([(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)])

    fill(0, 0)
    fill(width-1, 0)
    fill(0, height-1)
    fill(width-1, height-1)
    return img

def get_dominant_color(img):
    width, height = img.size
    colors = {}
    # Sample center area to find dominant dark color
    for y in range(height//4, 3*height//4, 5):
        for x in range(width//4, 3*width//4, 5):
            r, g, b, a = img.getpixel((x, y))
            if a > 0 and not (r > 200 and g > 200 and b > 200) and not (r > 200 and g < 100 and b < 100): # ignore white and orange
                hex_color = (r, g, b, 255)
                colors[hex_color] = colors.get(hex_color, 0) + 1
                
    sorted_colors = sorted(colors.items(), key=lambda item: item[1], reverse=True)
    return sorted_colors[0][0]

def process_icon(input_path, output_path, size):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        bg_color = get_dominant_color(img)
        print(f"Dominant color found: {bg_color}")
        
        # Write the dominant color to a file so bash can read it later
        with open("dominant_color.txt", "w") as f:
            f.write(f"#{bg_color[0]:02x}{bg_color[1]:02x}{bg_color[2]:02x}")
        
        # Replace white corners with bg_color
        img = flood_fill_corners(img, bg_color)
        
        # Shrink to 80% to prevent OS cutoff
        target_inner_size = int(size * 0.8)
        img_resized = img.resize((target_inner_size, target_inner_size), Image.Resampling.LANCZOS)
        
        # Create full size canvas with corporate background color
        new_img = Image.new('RGBA', (size, size), bg_color)
        
        # Paste centered
        offset = (size - target_inner_size) // 2
        new_img.paste(img_resized, (offset, offset), img_resized)
        
        new_img.save(output_path, "PNG")
        print(f"Successfully saved {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        sys.exit(1)

input_image = "mi_icono2.png"
process_icon(input_image, "public/icon-192.png", 192)
process_icon(input_image, "public/icon-512.png", 512)

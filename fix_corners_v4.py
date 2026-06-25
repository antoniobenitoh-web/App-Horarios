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

def process_icon(input_path, output_path, size):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Exact edge color of mi_icono2.png
        bg_color = (9, 67, 89, 255)
        
        # Replace white corners with exact edge color
        img = flood_fill_corners(img, bg_color)
        
        # Shrink to 80% to prevent OS cutoff
        target_inner_size = int(size * 0.8)
        img_resized = img.resize((target_inner_size, target_inner_size), Image.Resampling.LANCZOS)
        
        # Create full size canvas with exact edge color
        new_img = Image.new('RGBA', (size, size), bg_color)
        
        # Paste centered (since the edge of the image matches bg_color, there is no seam)
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

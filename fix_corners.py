from PIL import Image, ImageDraw
import sys

def flood_fill_corners(img, target_color):
    # img is an RGBA Image
    width, height = img.size
    pixels = img.load()
    
    def fill(x, y):
        # simple iterative flood fill
        stack = [(x, y)]
        while stack:
            cx, cy = stack.pop()
            if 0 <= cx < width and 0 <= cy < height:
                r, g, b, a = pixels[cx, cy]
                if r > 230 and g > 230 and b > 230:
                    pixels[cx, cy] = target_color
                    stack.extend([(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)])

    fill(0, 0)
    fill(width-1, 0)
    fill(0, height-1)
    fill(width-1, height-1)
    return img

def shrink_and_pad_fixed(input_path, output_path, size):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Target background color (dark blue from the image edges)
        bg_color = (0, 17, 68, 255)
        
        # Replace white corners with bg_color
        img = flood_fill_corners(img, bg_color)
        
        target_inner_size = int(size * 0.8)
        img_resized = img.resize((target_inner_size, target_inner_size), Image.Resampling.LANCZOS)
        
        new_img = Image.new('RGBA', (size, size), bg_color)
        
        offset = (size - target_inner_size) // 2
        new_img.paste(img_resized, (offset, offset), img_resized)
        
        new_img.save(output_path, "PNG")
        print(f"Successfully saved {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        sys.exit(1)

input_image = "mi_icono.png"
shrink_and_pad_fixed(input_image, "public/icon-192.png", 192)
shrink_and_pad_fixed(input_image, "public/icon-512.png", 512)

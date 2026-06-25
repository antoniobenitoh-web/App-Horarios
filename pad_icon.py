from PIL import Image
import sys

def pad_and_resize_image(input_path, output_path, size):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # Get background color from top-left pixel
        bg_color = img.getpixel((0, 0))
        
        new_size = max(width, height)
        # Create a new square image with the background color
        new_img = Image.new('RGBA', (new_size, new_size), bg_color)
        
        # Paste the original image in the center
        offset_x = (new_size - width) // 2
        offset_y = (new_size - height) // 2
        new_img.paste(img, (offset_x, offset_y), img)
        
        # Resize to target size
        img_resized = new_img.resize((size, size), Image.Resampling.LANCZOS)
        
        img_resized.save(output_path, "PNG")
        print(f"Successfully saved {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        sys.exit(1)

input_image = "mi_icono.png"
pad_and_resize_image(input_image, "public/icon-192.png", 192)
pad_and_resize_image(input_image, "public/icon-512.png", 512)

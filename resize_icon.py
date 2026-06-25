from PIL import Image
import sys

def resize_image(input_path, output_path, size):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        
        # We want to crop to a square and then resize to preserve aspect ratio
        width, height = img.size
        new_size = min(width, height)
        
        left = (width - new_size) / 2
        top = (height - new_size) / 2
        right = (width + new_size) / 2
        bottom = (height + new_size) / 2

        img_cropped = img.crop((left, top, right, bottom))
        img_resized = img_cropped.resize((size, size), Image.Resampling.LANCZOS)
        
        img_resized.save(output_path, "PNG")
        print(f"Successfully saved {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        sys.exit(1)

input_image = "mi_icono.png"
resize_image(input_image, "public/icon-192.png", 192)
resize_image(input_image, "public/icon-512.png", 512)

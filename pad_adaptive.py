from PIL import Image
import sys

def shrink_and_pad(input_path, output_path, size):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Get background color from top-left pixel
        bg_color = img.getpixel((0, 0))
        
        # Shrink the original image to 80% of the target size
        target_inner_size = int(size * 0.8)
        img_resized = img.resize((target_inner_size, target_inner_size), Image.Resampling.LANCZOS)
        
        # Create a new canvas at full size
        new_img = Image.new('RGBA', (size, size), bg_color)
        
        # Paste the shrunken image in the center
        offset = (size - target_inner_size) // 2
        new_img.paste(img_resized, (offset, offset), img_resized)
        
        new_img.save(output_path, "PNG")
        print(f"Successfully saved {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        sys.exit(1)

input_image = "mi_icono.png"
shrink_and_pad(input_image, "public/icon-192.png", 192)
shrink_and_pad(input_image, "public/icon-512.png", 512)

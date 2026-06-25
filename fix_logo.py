from PIL import Image
import sys

def convert_blue_to_white(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                
                if a > 0:
                    # Detect blueish pixels
                    if b > r + 15 and b > g + 15:
                        # Make them white
                        pixels[x, y] = (255, 255, 255, a)
                        
        img.save(output_path, "PNG")
        print(f"Successfully saved {output_path}")
    except Exception as e:
        print(f"Error: {e}")

convert_blue_to_white("Logo_salesland.png", "public/Logo_salesland_white.png")

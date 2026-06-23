from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    img = Image.new('RGB', (size, size), color='#0b1a42')
    d = ImageDraw.Draw(img)
    
    # Try to load a font, fallback to default
    try:
        font = ImageFont.truetype("/Library/Fonts/Arial.ttf", int(size * 0.15))
        font_small = ImageFont.truetype("/Library/Fonts/Arial.ttf", int(size * 0.1))
    except:
        font = ImageFont.load_default()
        font_small = font
        
    text1 = "salesland"
    text2 = "XIAOMI"
    
    # Calculate text bounding boxes to center them
    # For default font we can't do this easily, but let's approximate
    
    # Just draw some rectangles and text
    d.rectangle([(size*0.1, size*0.1), (size*0.9, size*0.9)], outline='#FF6700', width=int(size*0.02))
    
    try:
        # Pillow >= 8.0.0 has textbbox
        bbox1 = d.textbbox((0, 0), text1, font=font)
        w1, h1 = bbox1[2] - bbox1[0], bbox1[3] - bbox1[1]
        
        bbox2 = d.textbbox((0, 0), text2, font=font_small)
        w2, h2 = bbox2[2] - bbox2[0], bbox2[3] - bbox2[1]
    except AttributeError:
        # Fallback for old Pillow
        w1, h1 = d.textsize(text1, font=font)
        w2, h2 = d.textsize(text2, font=font_small)
        
    d.text(((size-w1)/2, size*0.35), text1, fill="white", font=font)
    
    # Draw orange box for Xiaomi
    d.rectangle([((size-w2)/2 - size*0.05, size*0.6), ((size+w2)/2 + size*0.05, size*0.6 + h2 + size*0.05)], fill='#FF6700')
    d.text(((size-w2)/2, size*0.6 + size*0.025), text2, fill="white", font=font_small)

    img.save(f"public/{filename}")

create_icon(192, "icon-192.png")
create_icon(512, "icon-512.png")
print("Icons generated successfully")

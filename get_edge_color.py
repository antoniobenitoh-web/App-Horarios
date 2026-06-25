from PIL import Image

img = Image.open("mi_icono2.png").convert("RGBA")
width, height = img.size

# Sample a pixel from the middle of the top edge to avoid white corners
edge_color = img.getpixel((width // 2, 0))
print(f"Edge color (top-middle): {edge_color}")

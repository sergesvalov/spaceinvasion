from PIL import Image
import sys

def remove_bg_floodfill(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        pixels = img.load()

        # The color at the top-left corner is assumed to be the background color
        bg_color = pixels[0, 0]
        
        # We'll use a threshold to match near-white or near-bg colors
        def is_bg(c):
            return (abs(c[0] - bg_color[0]) < 15 and 
                    abs(c[1] - bg_color[1]) < 15 and 
                    abs(c[2] - bg_color[2]) < 15)

        # Flood fill algorithm
        visited = set()
        stack = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        
        while stack:
            x, y = stack.pop()
            if (x, y) in visited:
                continue
            if x < 0 or x >= width or y < 0 or y >= height:
                continue
                
            visited.add((x, y))
            
            if is_bg(pixels[x, y]):
                pixels[x, y] = (255, 255, 255, 0)
                stack.extend([(x+1, y), (x-1, y), (x, y+1), (x, y-1)])

        img.save(output_path, "PNG")
        print(f"Successfully processed and saved to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

input_file = r"C:\Users\t470s\.gemini\antigravity-ide\brain\2a0f85e6-90db-4d5e-a196-95c8345a7a8a\new_enemy_ship_1782277638480.png"
output_file = r"c:\wndr\repo\spaceinvasion\public\enemy.png"
remove_bg_floodfill(input_file, output_file)

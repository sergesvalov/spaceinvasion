from PIL import Image
import sys

input_path = r"C:\Users\t470s\.gemini\antigravity-ide\brain\1e8c7ca6-a760-4bb4-a23b-6b21deaf7560\aagun_sprite_1782583316614.png"
output_path = r"c:\wndr\repo\spaceinvasion\public\aagun.png"

try:
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    # Identify pixels that are close to white (corners and background)
    for item in datas:
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    
    # Auto-crop to content
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print("Successfully processed and saved to", output_path)
except Exception as e:
    print("Error:", e)
    sys.exit(1)

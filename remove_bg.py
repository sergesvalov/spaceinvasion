from PIL import Image
import sys
import os

def remove_black_background(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    try:
        img = Image.open(file_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # If the pixel is pure black or extremely dark, make it transparent
            if item[0] < 5 and item[1] < 5 and item[2] < 5:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(file_path, "PNG")
        print(f"Processed {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

files_to_process = [
    r"c:\wndr\repo\spaceinvasion\public\ship.png",
    r"c:\wndr\repo\spaceinvasion\public\ship_side.png",
    r"c:\wndr\repo\spaceinvasion\public\enemy.png",
    r"c:\wndr\repo\spaceinvasion\public\boss.png",
    r"c:\wndr\repo\spaceinvasion\public\aagun.png"
]

for f in files_to_process:
    remove_black_background(f)

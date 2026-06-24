Add-Type -AssemblyName System.Drawing

function Remove-WhiteBackgroundFloodFill ($InputPath, $OutputPath) {
    Write-Host "Processing $InputPath"
    
    $code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class ImageProcessor2 {
    public static void FloodFillWhite(string input, string output) {
        Bitmap bmp = new Bitmap(input);
        
        Color bgColor = bmp.GetPixel(0, 0);
        int bgR = bgColor.R;
        int bgG = bgColor.G;
        int bgB = bgColor.B;
        
        BitmapData bmpData = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), 
                                          ImageLockMode.ReadWrite, 
                                          PixelFormat.Format32bppArgb);
        
        int bytes = Math.Abs(bmpData.Stride) * bmp.Height;
        byte[] rgbValues = new byte[bytes];
        Marshal.Copy(bmpData.Scan0, rgbValues, 0, bytes);
        
        int width = bmp.Width;
        int height = bmp.Height;
        int stride = bmpData.Stride;

        bool[] visited = new bool[width * height];
        Queue<Point> q = new Queue<Point>();
        
        q.Enqueue(new Point(0, 0));
        q.Enqueue(new Point(width - 1, 0));
        q.Enqueue(new Point(0, height - 1));
        q.Enqueue(new Point(width - 1, height - 1));
        
        while (q.Count > 0) {
            Point p = q.Dequeue();
            int x = p.X;
            int y = p.Y;
            
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            
            int idx = y * width + x;
            if (visited[idx]) continue;
            visited[idx] = true;
            
            int byteIdx = y * stride + x * 4;
            byte b = rgbValues[byteIdx];
            byte g = rgbValues[byteIdx + 1];
            byte r = rgbValues[byteIdx + 2];
            
            bool isBg = Math.Abs(r - bgR) < 20 && Math.Abs(g - bgG) < 20 && Math.Abs(b - bgB) < 20;
            
            if (isBg) {
                rgbValues[byteIdx + 3] = 0; // Set alpha to 0
                
                q.Enqueue(new Point(x + 1, y));
                q.Enqueue(new Point(x - 1, y));
                q.Enqueue(new Point(x, y + 1));
                q.Enqueue(new Point(x, y - 1));
            }
        }
        
        Marshal.Copy(rgbValues, 0, bmpData.Scan0, bytes);
        bmp.UnlockBits(bmpData);
        bmp.Save(output, ImageFormat.Png);
        bmp.Dispose();
    }
}
"@
    
    if (-not ("ImageProcessor2" -as [type])) {
        Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
    }
    
    [ImageProcessor2]::FloodFillWhite($InputPath, $OutputPath)
    Write-Host "Saved to $OutputPath"
}

$inputImg = "C:\Users\t470s\.gemini\antigravity-ide\brain\2a0f85e6-90db-4d5e-a196-95c8345a7a8a\new_enemy_ship_1782277638480.png"
$outputImg = "c:\wndr\repo\spaceinvasion\public\enemy.png"
Remove-WhiteBackgroundFloodFill $inputImg $outputImg

Add-Type -AssemblyName System.Drawing

function Remove-BlackBackground ($InputPath) {
    Write-Host "Processing $InputPath"
    $OutputPath = $InputPath + ".tmp.png"
    
    $code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.IO;

public class ImageProcessor {
    public static void RemoveDarkBackground(string input, string output) {
        Bitmap bmp = new Bitmap(input);
        BitmapData bmpData = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), 
                                          ImageLockMode.ReadWrite, 
                                          PixelFormat.Format32bppArgb);
        
        int bytes = Math.Abs(bmpData.Stride) * bmp.Height;
        byte[] rgbValues = new byte[bytes];
        Marshal.Copy(bmpData.Scan0, rgbValues, 0, bytes);
        
        for (int counter = 0; counter < rgbValues.Length; counter += 4) {
            byte b = rgbValues[counter];
            byte g = rgbValues[counter + 1];
            byte r = rgbValues[counter + 2];
            // alpha is counter + 3
            
            if (r < 40 && g < 40 && b < 40) {
                rgbValues[counter + 3] = 0; // Set transparent
            }
        }
        
        Marshal.Copy(rgbValues, 0, bmpData.Scan0, bytes);
        bmp.UnlockBits(bmpData);
        bmp.Save(output, ImageFormat.Png);
        bmp.Dispose();
    }
}
"@
    
    if (-not ("ImageProcessor" -as [type])) {
        Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
    }
    
    [ImageProcessor]::RemoveDarkBackground($InputPath, $OutputPath)
    
    Remove-Item -Force $InputPath
    Rename-Item -Path $OutputPath -NewName (Split-Path $InputPath -Leaf)
}

Remove-BlackBackground "$pwd\public\ship.png"
Remove-BlackBackground "$pwd\public\enemy.png"
Remove-BlackBackground "$pwd\public\ship_side.png"

Write-Host "Done removing backgrounds!"

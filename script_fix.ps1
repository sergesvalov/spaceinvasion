Add-Type -AssemblyName System.Drawing
$files = @(
    @('C:\Users\t470s\.gemini\antigravity-ide\brain\9bc144c2-2539-453f-ae0e-b95288f3fcd6\new_enemy_1782542148320.png', 'c:\wndr\repo\spaceinvasion\public\enemy.png', 90),
    @('C:\Users\t470s\.gemini\antigravity-ide\brain\9bc144c2-2539-453f-ae0e-b95288f3fcd6\new_boss_1782542157093.png', 'c:\wndr\repo\spaceinvasion\public\boss.png', 180)
)

foreach ($item in $files) {
    $inFile = $item[0]
    $outFile = $item[1]
    $rot = $item[2]

    $bmpOrig = New-Object System.Drawing.Bitmap $inFile
    $bmp = New-Object System.Drawing.Bitmap $bmpOrig.Width, $bmpOrig.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($bmpOrig, 0, 0)
    $g.Dispose()
    $bmpOrig.Dispose()
    
    # Make dark AND light backgrounds transparent
    # The generated images seem to have a white background now (or the corners are white)
    # Let's just grab the color of the top-left pixel (0,0) as the background color
    $bgColor = $bmp.GetPixel(0, 0)
    
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        for ($y = 0; $y -lt $bmp.Height; $y++) {
            $color = $bmp.GetPixel($x, $y)
            
            # Simple distance from bgColor
            $dist = [Math]::Abs($color.R - $bgColor.R) + [Math]::Abs($color.G - $bgColor.G) + [Math]::Abs($color.B - $bgColor.B)
            if ($dist -lt 50) {
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            }
        }
    }

    if ($rot -eq 90) {
        $bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
    } elseif ($rot -eq 180) {
        $bmp.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone)
    }
    
    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

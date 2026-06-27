Add-Type -AssemblyName System.Drawing
$files = @("c:\wndr\repo\spaceinvasion\public\enemy.png", "c:\wndr\repo\spaceinvasion\public\boss.png")

foreach ($file in $files) {
    $bmp = New-Object System.Drawing.Bitmap $file
    
    # Make white and near-white pixels transparent
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        for ($y = 0; $y -lt $bmp.Height; $y++) {
            $color = $bmp.GetPixel($x, $y)
            if ($color.R -gt 240 -and $color.G -gt 240 -and $color.B -gt 240) {
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            }
        }
    }

    $temp = $file + ".tmp.png"
    $bmp.Save($temp, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Move-Item -Force $temp $file
}

Add-Type -AssemblyName System.Drawing
$srcPath = "c:\Users\maazm\OneDrive\Desktop\School Management System\Frontend\src\assets\aspira-logo.png"
$pub = "c:\Users\maazm\OneDrive\Desktop\School Management System\Frontend\public"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

function Save-Icon([int]$size, [string]$name) {
  # Draw logo into temp (white bg), then composite onto navy with white knock-out
  $temp = New-Object System.Drawing.Bitmap $size, $size
  $tg = [System.Drawing.Graphics]::FromImage($temp)
  $tg.Clear([System.Drawing.Color]::White)
  $tg.InterpolationMode = "HighQualityBicubic"
  $tg.SmoothingMode = "AntiAlias"
  $pad = [Math]::Max(1, [int]($size * 0.12))
  $tg.DrawImage($src, $pad, $pad, $size - 2 * $pad, $size - 2 * $pad)
  $tg.Dispose()

  $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
  $g.Dispose()

  for ($y = 0; $y -lt $size; $y++) {
    for ($x = 0; $x -lt $size; $x++) {
      $c = $temp.GetPixel($x, $y)
      if (-not ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245)) {
        $bmp.SetPixel($x, $y, $c)
      }
    }
  }
  $temp.Dispose()
  $bmp.Save((Join-Path $pub $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "saved $name"
}

Save-Icon 16 "_i16.png"
Save-Icon 32 "favicon.png"
Save-Icon 32 "_i32.png"
Save-Icon 48 "_i48.png"
Save-Icon 64 "favicon-64.png"
Save-Icon 192 "favicon-192.png"
Save-Icon 180 "apple-touch-icon.png"
$src.Dispose()
Write-Host "done"

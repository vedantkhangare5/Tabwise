Add-Type -AssemblyName System.Drawing

$dir = Join-Path $PSScriptRoot "public\icons"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$sizeList = @(16, 48, 128)

foreach ($s in $sizeList) {
    $bmp = New-Object System.Drawing.Bitmap($s, $s)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

    # Amber-orange gradient fill
    $p1 = New-Object System.Drawing.Point(0, 0)
    $p2 = New-Object System.Drawing.Point($s, $s)
    $c1 = [System.Drawing.Color]::FromArgb(245, 158, 11)
    $c2 = [System.Drawing.Color]::FromArgb(249, 115, 22)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($p1, $p2, $c1, $c2)
    $g.FillRectangle($brush, 0, 0, $s, $s)
    $brush.Dispose()

    # Draw bold 'T'
    $fontSize = [int]($s * 0.58)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $centerX = [float]($s / 2)
    $centerY = [float]($s / 2)
    $g.DrawString("T", $font, $textBrush, $centerX, $centerY, $sf)

    $font.Dispose()
    $textBrush.Dispose()
    $g.Dispose()

    $outPath = Join-Path $dir ("icon" + $s + ".png")
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated $outPath"
}

Write-Host "All icons generated successfully."

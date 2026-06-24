@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Starting Space Invasion Local Server...
echo   Please keep this window open while playing!
echo ========================================================

:: We use PowerShell to spin up a quick HttpListener
:: It serves files from the current directory on port 8080
powershell -NoProfile -ExecutionPolicy Bypass -Command "$port=8080; $listener=New-Object System.Net.HttpListener; $listener.Prefixes.Add(\"http://localhost:${port}/\"); try { $listener.Start() } catch { Write-Host 'Port 8080 is in use. Close other apps and try again.'; Start-Sleep -s 5; exit }; Write-Host \"Server running at http://localhost:${port}/\"; Start-Process \"http://localhost:${port}/\"; while ($listener.IsListening) { $context=$listener.GetContext(); $response=$context.Response; $requestUrl=$context.Request.Url.LocalPath.TrimStart('/'); if ($requestUrl -eq '') { $requestUrl='index.html' }; $filePath=Join-Path $pwd $requestUrl; if (Test-Path $filePath -PathType Leaf) { $content=[System.IO.File]::ReadAllBytes($filePath); $response.ContentLength64=$content.Length; if ($filePath -match '\.html$') { $response.ContentType='text/html' } elseif ($filePath -match '\.js$') { $response.ContentType='application/javascript' } elseif ($filePath -match '\.css$') { $response.ContentType='text/css' } elseif ($filePath -match '\.png$') { $response.ContentType='image/png' } elseif ($filePath -match '\.mp3$') { $response.ContentType='audio/mpeg' } elseif ($filePath -match '\.wav$') { $response.ContentType='audio/wav' }; try { $response.OutputStream.Write($content, 0, $content.Length) } catch {} } else { $response.StatusCode=404 }; $response.Close() }"

endlocal

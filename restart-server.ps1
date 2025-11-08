# Kill the running Node.js server process
Write-Host "Stopping server..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*server.js*"
} | Stop-Process -Force

Start-Sleep -Seconds 2

Write-Host "`nServer stopped. Please run 'npm run dev' in the server directory to restart." -ForegroundColor Green
Write-Host "cd server" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor Cyan

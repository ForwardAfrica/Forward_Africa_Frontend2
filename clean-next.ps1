# PowerShell script to clean Next.js build artifacts
# Run this script if you encounter file system errors with Next.js

Write-Host "Cleaning Next.js build artifacts..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path ".next") {
    Write-Host "Removing .next directory..." -ForegroundColor Cyan
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    if (Test-Path ".next") {
        Write-Host "Warning: Could not fully delete .next directory. Please close any running Next.js processes and try again." -ForegroundColor Red
    } else {
        Write-Host "Successfully removed .next directory" -ForegroundColor Green
    }
} else {
    Write-Host ".next directory does not exist" -ForegroundColor Gray
}

# Remove node_modules cache if it exists
if (Test-Path "node_modules\.cache") {
    Write-Host "Removing node_modules cache..." -ForegroundColor Cyan
    Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Removed node_modules cache" -ForegroundColor Green
}

Write-Host "`nCleanup complete! You can now run 'npm run dev' to start the development server." -ForegroundColor Green


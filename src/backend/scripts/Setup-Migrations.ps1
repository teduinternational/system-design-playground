# Quick Migration Scripts
# Run these from the backend root directory

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        System Design Playground - Migration Scripts           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Import helpers
. "$PSScriptRoot\MigrationHelpers.ps1"

Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  1. New-Migration -Name 'MigrationName'  - Create new migration" -ForegroundColor White
Write-Host "  2. Update-Database                      - Apply migrations" -ForegroundColor White
Write-Host "  3. Get-Migrations                       - List all migrations" -ForegroundColor White
Write-Host "  4. Show-MigrationHelp                   - Show all commands" -ForegroundColor White
Write-Host ""

# Database Migration Helper Scripts

# Tạo migration mới
function New-Migration {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    
    Write-Host "🔄 Creating migration: $Name" -ForegroundColor Cyan
    Set-Location "$PSScriptRoot\..\SystemDesign.Infrastructure"
    dotnet ef migrations add $Name --output-dir Persistence/Migrations
    Write-Host "✅ Migration created!" -ForegroundColor Green
}

# Apply migrations
function Update-Database {
    Write-Host "🔄 Applying migrations to database..." -ForegroundColor Cyan
    Set-Location "$PSScriptRoot\..\SystemDesign.Infrastructure"
    dotnet ef database update
    Write-Host "✅ Database updated!" -ForegroundColor Green
}

# Rollback migration
function Rollback-Migration {
    param(
        [Parameter(Mandatory=$true)]
        [string]$TargetMigration
    )
    
    Write-Host "⚠️  Rolling back to: $TargetMigration" -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\..\SystemDesign.Infrastructure"
    dotnet ef database update $TargetMigration
    Write-Host "✅ Rollback complete!" -ForegroundColor Green
}

# Remove last migration
function Remove-LastMigration {
    Write-Host "⚠️  Removing last migration..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot\..\SystemDesign.Infrastructure"
    dotnet ef migrations remove
    Write-Host "✅ Migration removed!" -ForegroundColor Green
}

# List all migrations
function Get-Migrations {
    Write-Host "📋 Listing all migrations..." -ForegroundColor Cyan
    Set-Location "$PSScriptRoot\..\SystemDesign.Infrastructure"
    dotnet ef migrations list
}

# Generate SQL script
function Export-MigrationScript {
    param(
        [string]$OutputFile = "migration.sql"
    )
    
    Write-Host "📝 Generating SQL script to: $OutputFile" -ForegroundColor Cyan
    Set-Location "$PSScriptRoot\..\SystemDesign.Infrastructure"
    dotnet ef migrations script --idempotent --output $OutputFile
    Write-Host "✅ Script generated!" -ForegroundColor Green
}

# Drop database (CAUTION!)
function Remove-Database {
    $confirmation = Read-Host "⚠️  WARNING: This will DROP the entire database! Type 'YES' to confirm"
    if ($confirmation -eq 'YES') {
        Write-Host "🗑️  Dropping database..." -ForegroundColor Red
        Set-Location "$PSScriptRoot\..\SystemDesign.Infrastructure"
        dotnet ef database drop --force
        Write-Host "✅ Database dropped!" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled" -ForegroundColor Yellow
    }
}

# Reset database (drop + recreate + apply all migrations)
function Reset-Database {
    $confirmation = Read-Host "⚠️  WARNING: This will DROP and RECREATE the database! Type 'YES' to confirm"
    if ($confirmation -eq 'YES') {
        Write-Host "🔄 Resetting database..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\..\SystemDesign.Infrastructure"
        dotnet ef database drop --force
        dotnet ef database update
        Write-Host "✅ Database reset complete!" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled" -ForegroundColor Yellow
    }
}

# Show help
function Show-MigrationHelp {
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║           Database Migration Helper Commands                   ║
╚════════════════════════════════════════════════════════════════╝

📝 Create new migration:
   New-Migration -Name "YourMigrationName"

🔄 Apply migrations:
   Update-Database

⏮️  Rollback to specific migration:
   Rollback-Migration -TargetMigration "PreviousMigrationName"

🗑️  Remove last migration (not applied yet):
   Remove-LastMigration

📋 List all migrations:
   Get-Migrations

📄 Generate SQL script:
   Export-MigrationScript -OutputFile "output.sql"

⚠️  Drop database (DANGER):
   Remove-Database

🔄 Reset database (Drop + Recreate):
   Reset-Database

"@ -ForegroundColor Cyan
}

# Export functions
Export-ModuleMember -Function @(
    'New-Migration',
    'Update-Database',
    'Rollback-Migration',
    'Remove-LastMigration',
    'Get-Migrations',
    'Export-MigrationScript',
    'Remove-Database',
    'Reset-Database',
    'Show-MigrationHelp'
)

# Show help on import
Write-Host "🚀 Migration helpers loaded! Type 'Show-MigrationHelp' for usage." -ForegroundColor Green

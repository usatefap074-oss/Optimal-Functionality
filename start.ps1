# Парротовый магазин - Запуск проекта
# =====================================

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Запуск проекта - Парротовый магазин  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия Node.js
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) {
    Write-Host "❌ Node.js не установлен!" -ForegroundColor Red
    Write-Host "Пожалуйста, установите Node.js с https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Host "✓ Node.js найден" -ForegroundColor Green
node --version

# Проверка наличия npm
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmCheck) {
    Write-Host "❌ npm не установлен!" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Host "✓ npm найден" -ForegroundColor Green
npm --version
Write-Host ""

# Установка зависимостей если нужно
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка при установке зависимостей" -ForegroundColor Red
        Read-Host "Нажмите Enter для выхода"
        exit 1
    }
    Write-Host "✓ Зависимости установлены" -ForegroundColor Green
    Write-Host ""
}

# Проверка .env файла
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Файл .env.local не найден" -ForegroundColor Yellow
    Write-Host "Создаю .env.local с примером конфигурации..." -ForegroundColor Yellow
    @"
DATABASE_URL=postgresql://user:password@localhost:5432/parrot_shop
PORT=5000
NODE_ENV=development
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✓ Создан .env.local - отредактируйте его с вашими данными БД" -ForegroundColor Green
    Write-Host ""
}

# Проверка подключения к БД и миграции
Write-Host "🔄 Проверка базы данных..." -ForegroundColor Yellow
npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Ошибка при миграции БД (возможно, БД недоступна)" -ForegroundColor Yellow
    Write-Host "Убедитесь, что PostgreSQL запущен и DATABASE_URL правильный" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "✓ Всё готово!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Запуск приложения..." -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Нажмите Ctrl+C для остановки" -ForegroundColor Yellow
Write-Host ""

# Запуск dev сервера
npm run dev

Read-Host "Нажмите Enter для выхода"

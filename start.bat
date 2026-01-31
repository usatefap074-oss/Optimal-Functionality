@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Zapusk proekta - Parrotovyj magazin
echo ========================================
echo.

REM Proverka nalichiya Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js ne ustanovlen!
    echo Pozhalujsta, ustanovite Node.js s https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo OK: Node.js najden
node --version

REM Proverka nalichiya npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm ne ustanovlen!
    pause
    exit /b 1
)

echo OK: npm najden
npm --version
echo.

REM Ustanovka zavisimostej esli nuzhno
if not exist "node_modules" (
    echo Ustanovka zavisimostej...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Oshibka pri ustanovke zavisimostej
        pause
        exit /b 1
    )
    echo OK: Zavisimosti ustanovleny
    echo.
)

REM Proverka .env faila
if not exist ".env.local" (
    echo Sozdayu .env.local...
    (
        echo DATABASE_PATH=./data/parrot_shop.db
        echo PORT=5000
        echo NODE_ENV=development
    ) > .env.local
    echo OK: Sozdan .env.local
    echo.
)

REM Sozdanie papki data esli ne sushchestvuet
if not exist "data" (
    mkdir data
    echo OK: Sozdana papka data
)

REM Inicializaciya bazy dannyx esli ne sushchestvuet
if not exist "data\parrot_shop.db" (
    echo Inicializaciya bazy dannyx...
    npm run db:push
    if %errorlevel% neq 0 (
        echo ERROR: Oshibka pri inicializacii bazy dannyx
        pause
        exit /b 1
    )
    echo OK: Baza dannyx gotova
    echo.
)

echo.
echo OK: Vse gotovo!
echo.
echo Zapusk prilozheniya...
echo    Frontend: http://localhost:5000
echo    Backend API: http://localhost:5000/api
echo.
echo Dlya ostanovki nazhimte Ctrl+C
echo.

REM Zapusk dev servera
npm run dev

REM Esli server ostanovilsya, pokazat' oshibku
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Server ostanovilsya s oshibkoj
    pause
)

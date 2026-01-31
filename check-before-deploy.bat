@echo off
chcp 65001 >nul
echo ========================================
echo   ПРОВЕРКА ПЕРЕД ДЕПЛОЕМ
echo ========================================
echo.

echo [1/5] Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не установлен!
    pause
    exit /b 1
)
echo ✅ Node.js установлен

echo.
echo [2/5] Установка зависимостей...
call npm install
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей!
    pause
    exit /b 1
)
echo ✅ Зависимости установлены

echo.
echo [3/5] Проверка TypeScript...
call npm run check
if errorlevel 1 (
    echo ❌ Ошибки TypeScript! Исправьте перед деплоем.
    pause
    exit /b 1
)
echo ✅ TypeScript проверка пройдена

echo.
echo [4/5] Сборка проекта...
call npm run build
if errorlevel 1 (
    echo ❌ Ошибка сборки!
    pause
    exit /b 1
)
echo ✅ Проект собран успешно

echo.
echo [5/5] Запуск локального сервера для проверки...
echo.
echo ========================================
echo   Сервер запущен на http://localhost:5000
echo   Откройте браузер и проверьте сайт
echo   Нажмите Ctrl+C для остановки
echo ========================================
echo.

call npm start

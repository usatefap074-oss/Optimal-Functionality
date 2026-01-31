@echo off
echo ========================================
echo Получение Telegram Chat ID
echo ========================================
echo.

REM Читаем токен из .env.local
for /f "tokens=2 delims==" %%a in ('findstr "TELEGRAM_BOT_TOKEN" .env.local') do set BOT_TOKEN=%%a

if "%BOT_TOKEN%"=="" (
    echo ОШИБКА: TELEGRAM_BOT_TOKEN не найден в .env.local
    pause
    exit /b 1
)

echo Токен бота найден: %BOT_TOKEN%
echo.
echo ИНСТРУКЦИЯ:
echo 1. Откройте Telegram
echo 2. Найдите вашего бота (поиск по имени)
echo 3. Нажмите START или отправьте любое сообщение боту
echo 4. Нажмите Enter здесь для получения Chat ID
echo.
pause

echo.
echo Получаю обновления от бота...
curl -s "https://api.telegram.org/bot%BOT_TOKEN%/getUpdates" > telegram_response.json

echo.
echo Ответ сохранён в telegram_response.json
echo.

REM Пытаемся извлечь chat_id из ответа
for /f "tokens=*" %%a in ('powershell -Command "Get-Content telegram_response.json | ConvertFrom-Json | Select-Object -ExpandProperty result | Select-Object -First 1 | Select-Object -ExpandProperty message | Select-Object -ExpandProperty chat | Select-Object -ExpandProperty id"') do set CHAT_ID=%%a

if "%CHAT_ID%"=="" (
    echo.
    echo ОШИБКА: Chat ID не найден!
    echo.
    echo Возможные причины:
    echo 1. Вы не отправили сообщение боту
    echo 2. Бот не получил обновления
    echo.
    echo Откройте файл telegram_response.json и найдите "chat":{"id":XXXXXXXXX
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Chat ID найден: %CHAT_ID%
echo ========================================
echo.
echo Добавляю в .env.local...

REM Проверяем есть ли уже TELEGRAM_CHAT_ID
findstr "TELEGRAM_CHAT_ID" .env.local >nul
if %errorlevel%==0 (
    echo TELEGRAM_CHAT_ID уже существует в .env.local
    echo Обновите его вручную на: %CHAT_ID%
) else (
    echo TELEGRAM_CHAT_ID=%CHAT_ID% >> .env.local
    echo Добавлено в .env.local
)

echo.
echo Готово! Перезапустите сервер (npm run dev)
echo.
pause

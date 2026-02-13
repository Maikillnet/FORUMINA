@echo off
chcp 65001 >nul
title FORUM.LIVE

cd /d "%~dp0"

echo ========================================
echo   FORUM.LIVE - Запуск
echo ========================================
echo.

if not exist "backend\node_modules\express" (
    echo Устанавливаю backend...
    cd backend
    call npm install
    cd ..
)
if not exist "frontend\node_modules\vite" (
    echo Устанавливаю frontend...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Запускаю серверы...
echo.
echo *** Открой в браузере: http://localhost:5173 ***
echo.
echo Закрой оба окна чтобы остановить.
echo ========================================
echo.

start "Forum Backend" cmd /k call "%~dp0backend\start-backend.bat"
timeout /t 2 /nobreak >nul
start "Forum Frontend" cmd /k call "%~dp0frontend\start-frontend.bat"

echo Готово! Открыты 2 окна. Открой http://localhost:5173
timeout /t 5

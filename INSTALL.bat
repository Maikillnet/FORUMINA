@echo off
chcp 65001 >nul
title FORUM.LIVE - Установка

cd /d "%~dp0"

echo ========================================
echo   FORUM.LIVE - Установка зависимостей
echo ========================================
echo.

echo [1/2] Backend...
cd backend
call npm install
if errorlevel 1 (
    echo ОШИБКА при установке backend!
    pause
    exit /b 1
)
cd ..
echo.

echo [2/2] Frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ОШИБКА при установке frontend!
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo   Установка завершена!
echo   Запустите START.bat
echo ========================================
pause

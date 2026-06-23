#!/bin/bash
# Открываем директорию, в которой находится скрипт
cd "$(dirname "$0")"

echo "========================================================"
echo "  Starting Space Invasion Local Server for macOS..."
echo "  Please keep this terminal window open while playing!"
echo "  (You can close it when you are done)"
echo "========================================================"

PORT=8080

# Функция для запуска сервера через python3
start_python_server() {
    echo "Using python3..."
    open "http://localhost:$PORT"
    python3 -m http.server $PORT
}

# Функция для запуска сервера через php
start_php_server() {
    echo "Using php..."
    open "http://localhost:$PORT"
    php -S localhost:$PORT
}

# Проверяем доступность python3 или php
if command -v python3 &> /dev/null; then
    start_python_server
elif command -v php &> /dev/null; then
    start_php_server
else
    echo "ERROR: Neither Python 3 nor PHP is installed on this Mac."
    echo "Please install Python 3 to run this local version."
    sleep 10
fi

#!/bin/bash
# 停止后端服务的脚本

PID_FILE="/opt/GnuCash-Lite/GnuCash-Lite/logs/backend.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "Stopping backend (PID: $PID)..."
        kill $PID
        sleep 2
        if ps -p $PID > /dev/null 2>&1; then
            echo "Force killing backend..."
            kill -9 $PID
        fi
        rm -f "$PID_FILE"
        echo "Backend stopped."
    else
        echo "Backend is not running."
        rm -f "$PID_FILE"
    fi
else
    echo "PID file not found. Trying to find and kill backend process..."
    pkill -f "python3.*run.py"
    echo "Backend process killed."
fi


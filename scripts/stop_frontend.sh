#!/bin/bash
# 停止前端服务的脚本

PID_FILE="/opt/GnuCash-Lite/GnuCash-Lite/logs/frontend.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "Stopping frontend (PID: $PID)..."
        kill $PID
        sleep 2
        if ps -p $PID > /dev/null 2>&1; then
            echo "Force killing frontend..."
            kill -9 $PID
        fi
        # 同时杀死相关的 node 进程
        pkill -f "vite"
        rm -f "$PID_FILE"
        echo "Frontend stopped."
    else
        echo "Frontend is not running."
        rm -f "$PID_FILE"
    fi
else
    echo "PID file not found. Trying to find and kill frontend process..."
    pkill -f "npm run dev"
    pkill -f "vite"
    echo "Frontend process killed."
fi


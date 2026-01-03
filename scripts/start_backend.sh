#!/bin/bash
# 启动后端服务的脚本

cd /opt/GnuCash-Lite/GnuCash-Lite/app

# 使用 nohup 启动，并重定向输出
nohup python3 run.py > /opt/GnuCash-Lite/GnuCash-Lite/logs/backend.log 2>&1 &

# 获取进程ID
PID=$!
echo "Backend started with PID: $PID"
echo $PID > /opt/GnuCash-Lite/GnuCash-Lite/logs/backend.pid

# 使用 disown 让进程与终端完全分离
disown

echo "Backend is running in background. PID: $PID"
echo "Log file: /opt/GnuCash-Lite/GnuCash-Lite/logs/backend.log"
echo "To stop: kill $PID or use stop_backend.sh"


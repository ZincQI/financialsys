#!/bin/bash
# 启动前端服务的脚本

cd /opt/GnuCash-Lite/GnuCash-Lite/frontend_export

# 使用 nohup 启动，并重定向输出
nohup npm run dev > /opt/GnuCash-Lite/GnuCash-Lite/logs/frontend.log 2>&1 &

# 获取进程ID
PID=$!
echo "Frontend started with PID: $PID"
echo $PID > /opt/GnuCash-Lite/GnuCash-Lite/logs/frontend.pid

# 使用 disown 让进程与终端完全分离
disown

echo "Frontend is running in background. PID: $PID"
echo "Log file: /opt/GnuCash-Lite/GnuCash-Lite/logs/frontend.log"
echo "To stop: kill $PID or use stop_frontend.sh"


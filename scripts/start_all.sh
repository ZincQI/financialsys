#!/bin/bash
# 启动所有服务的脚本

echo "Starting GnuCash-Lite services..."

# 创建日志目录
mkdir -p /opt/GnuCash-Lite/GnuCash-Lite/logs

# 启动后端
echo "Starting backend..."
bash /opt/GnuCash-Lite/GnuCash-Lite/scripts/start_backend.sh

sleep 2

# 启动前端
echo "Starting frontend..."
bash /opt/GnuCash-Lite/GnuCash-Lite/scripts/start_frontend.sh

echo ""
echo "=========================================="
echo "All services started!"
echo "Backend: http://39.97.44.219:5000"
echo "Frontend: http://39.97.44.219:5173"
echo "=========================================="
echo ""
echo "To check status: ps aux | grep -E '(python3.*run.py|npm run dev)'"
echo "To view logs: tail -f /opt/GnuCash-Lite/GnuCash-Lite/logs/*.log"
echo "To stop all: bash /opt/GnuCash-Lite/GnuCash-Lite/scripts/stop_all.sh"


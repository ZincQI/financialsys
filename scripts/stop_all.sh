#!/bin/bash
# 停止所有服务的脚本

echo "Stopping GnuCash-Lite services..."

# 停止后端
echo "Stopping backend..."
bash /opt/GnuCash-Lite/GnuCash-Lite/scripts/stop_backend.sh

sleep 1

# 停止前端
echo "Stopping frontend..."
bash /opt/GnuCash-Lite/GnuCash-Lite/scripts/stop_frontend.sh

echo ""
echo "All services stopped."


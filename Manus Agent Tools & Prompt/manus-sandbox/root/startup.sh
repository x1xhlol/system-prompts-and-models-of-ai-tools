#!/bin/bash

# Exit on error, but don't kill background processes
# set -e

# 开启调试输出
# set -x

echo "Load env file..."
source "$HOME/.env"

# Function to add env loading to rc files
add_env_to_rc() {
    local rc_file="$1"
    local env_line='[ -f "$HOME/.env" ] && source "$HOME/.env"'

    if [ -f "$rc_file" ]; then
        if ! grep -q "^\[ -f \"\$HOME/.env\" \] && source \"\$HOME/.env\"" "$rc_file"; then
            echo "Adding environment loading to $rc_file"
            echo "$env_line" >>"$rc_file"
        else
            echo "Environment loading already exists in $rc_file"
        fi
    else
        echo "Creating $rc_file with environment loading"
        echo "$env_line" >"$rc_file"
    fi
}

# Add environment loading to rc files
add_env_to_rc "$HOME/.bashrc"
add_env_to_rc "$HOME/.zshrc"

# Load environment for current session
if [ -f $HOME/.env ]; then
    echo "Found .env file in $HOME, loading..."
    set -a
    source $HOME/.env
    set +a
    echo "Environment variables loaded successfully"
else
    echo "No .env file found in $HOME, skipping..."
fi

echo "Starting dbus..."
# 清理旧的 dbus pid 文件
sudo rm -f /run/dbus/pid
sudo rm -f /var/run/dbus/pid
sudo mkdir -p /var/run/dbus
sudo service dbus start
dbus-daemon --session --fork

export DISPLAY=:0
# 需要跟 dockerfile 保持一致
export MANUS_OPT_PATH=/opt/.manus
export RUNTIME_PATH=${MANUS_OPT_PATH}/.sandbox-runtime
export PIPENV_VENV_IN_PROJECT=1

echo "Starting runtime..."
echo Opt Path: $MANUS_OPT_PATH
echo Runtime Path: $RUNTIME_PATH

echo "Starting supervisord"
sudo supervisord &
sleep 1 # 等待 supervisord 启动并创建 pid 文件
SUPERVISOR_PID=$(cat /var/run/supervisord.pid)
echo "Checking supervisord status..."
echo "Supervisor PID: $SUPERVISOR_PID"
sudo supervisorctl status || true

# 等待服务启动的函数
wait_for_services() {
    echo "Waiting for services to start..."
    MAX_RETRIES=30

    # runtime
    RETRY_COUNT=0
    while ! curl -s http://localhost:8330/healthz >/dev/null && [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        echo "Waiting for Sandbox Runtime ... ($((MAX_RETRIES - RETRY_COUNT)) attempts left)"
        sleep 1
        RETRY_COUNT=$((RETRY_COUNT + 1))
    done

    # # code server
    # RETRY_COUNT=0
    # while ! curl -s http://localhost:8329/healthz >/dev/null && [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    #     echo "Waiting for code-server... ($((MAX_RETRIES - RETRY_COUNT)) attempts left)"
    #     sleep 1
    #     RETRY_COUNT=$((RETRY_COUNT + 1))
    # done

    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "Warning: Some services failed to start in time"
    else
        echo "All services started!"
    fi
}

echo "Starting log tail..."
tail -f /var/log/supervisor/sandbox*.log /var/log/supervisor/supervisord.log &

wait_for_services

# sudo sh -c 'echo "173.234.14.135 pool.ntp.org" >> /etc/hosts'

# 守护进程监控函数
monitor_and_restart() {
    echo "Starting monitor and restart..."
    while true; do
        sudo ntpdate pool.ntp.org
        # echo "checking supervisord"
        # 检查 supervisord 并显示状态
        if ! sudo kill -0 $SUPERVISOR_PID 2>/dev/null; then
            echo "Supervisord died, restarting..."
            sudo supervisord &
            SUPERVISOR_PID=$(cat /var/run/supervisord.pid)
            sleep 1
            echo "Supervisord status after restart:"
            sudo supervisorctl status || true
        fi

        # echo "checking dbus"
        # 检查 dbus
        if ! pgrep dbus-daemon >/dev/null; then
            echo "DBus died, restarting..."
            sudo service dbus start
            dbus-daemon --session --fork
        fi

        # echo "checking runtime"
        # 检查 Sandbox Runtime 健康状态
        if ! curl -s http://localhost:8330/healthz >/dev/null; then
            echo "Sandbox Runtime is not responding, attempting to restart..."
            sudo supervisorctl restart sandbox_runtime
            sleep 1
            echo "Sandbox Runtime status after restart:"
            sudo supervisorctl status sandbox_runtime || true
        fi

        # 每10秒检查一次
        sleep 10
    done
}

monitor_and_restart

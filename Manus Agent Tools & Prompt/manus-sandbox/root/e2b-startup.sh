#!/bin/bash
if ! sudo -u ubuntu /startup.sh; then
    echo "Error: Script failed"
    exit 1
fi
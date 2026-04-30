#!/bin/bash
set -euo pipefail

if pgrep -f "backend.jar" >/dev/null 2>&1; then
  pkill -f "backend.jar"
  sleep 5
fi

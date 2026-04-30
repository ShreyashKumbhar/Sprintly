#!/bin/bash
set -euo pipefail

for i in {1..30}; do
  if curl -fsS http://localhost:8080/actuator/health >/dev/null 2>&1; then
    exit 0
  fi
  sleep 5
done

echo "Backend failed health check."
exit 1

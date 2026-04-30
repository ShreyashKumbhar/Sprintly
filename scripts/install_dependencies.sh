#!/bin/bash
set -euo pipefail

if command -v dnf >/dev/null 2>&1; then
  dnf install -y jq java-21-amazon-corretto-headless
else
  yum install -y jq java-21-amazon-corretto-headless
fi

mkdir -p /opt/sprintly

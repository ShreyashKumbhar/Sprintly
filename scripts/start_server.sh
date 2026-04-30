#!/bin/bash
set -euo pipefail

if [ ! -f /opt/sprintly/sprintly.env ]; then
  echo "Missing /opt/sprintly/sprintly.env from launch template."
  exit 1
fi

source /opt/sprintly/sprintly.env

DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id "$DB_PASSWORD_SECRET_ID" --query SecretString --output text --region "$AWS_REGION")
JWT_SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id "$JWT_SECRET_ID" --query SecretString --output text --region "$AWS_REGION")

cat > /opt/sprintly/runtime.env <<EOF
SPRING_DATASOURCE_URL=${SPRING_DATASOURCE_URL}
SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME}
SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET_VALUE}
PORT=${PORT}
EOF

chown root:root /opt/sprintly/runtime.env
chmod 600 /opt/sprintly/runtime.env
chmod +x /opt/sprintly/backend.jar

nohup env $(cat /opt/sprintly/runtime.env | xargs) java -jar /opt/sprintly/backend.jar > /var/log/sprintly.log 2>&1 &

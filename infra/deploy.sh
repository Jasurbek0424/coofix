#!/usr/bin/env bash
# Run on the server as `deploy`: /opt/coofix/app/infra/deploy.sh
set -euo pipefail
cd /opt/coofix/app
git pull --ff-only
cd infra
docker compose --env-file /opt/coofix/.env -f docker-compose.prod.yml up -d --build --remove-orphans
docker image prune -f >/dev/null
docker compose --env-file /opt/coofix/.env -f docker-compose.prod.yml ps

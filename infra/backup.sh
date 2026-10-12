#!/usr/bin/env bash
# Nightly DB dump, keeps 14 days. Installed as a cron job for `deploy`.
set -euo pipefail
dir=/opt/coofix/backups
mkdir -p "$dir"
docker compose --env-file /opt/coofix/.env -f /opt/coofix/app/infra/docker-compose.prod.yml \
  exec -T postgres pg_dump -U coofix -Fc coofix > "$dir/coofix-$(date +%F).dump"
find "$dir" -name 'coofix-*.dump' -mtime +14 -delete

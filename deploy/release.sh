#!/bin/bash
set -euo pipefail

cd /opt/santa
if [[ ! ${SSH_ORIGINAL_COMMAND:-} =~ ^release\ ([a-f0-9]{40})$ ]]; then
    echo "Commande de déploiement invalide." >&2
    exit 2
fi
export SANTA_IMAGE="santa:${BASH_REMATCH[1]}"

# Serialize deployments, including manual retries.
exec 9>deploy.lock
flock -x 9
gzip -dc | docker image load
docker image inspect "$SANTA_IMAGE" >/dev/null

previous=$(docker compose ps -a -q app)
if [[ -n $previous ]]; then
    previous=$(docker inspect --format '{{.Config.Image}}' "$previous")
fi

docker compose up -d --wait --wait-timeout 90 postgres
docker compose run --rm --no-deps -T app node scripts/migrate.mjs </dev/null
if ! docker compose up -d --no-deps --wait --wait-timeout 90 app; then
    if [[ -n $previous && $previous != "$SANTA_IMAGE" ]]; then
        SANTA_IMAGE="$previous" docker compose up -d --no-deps --wait --wait-timeout 90 app
    fi
    exit 1
fi

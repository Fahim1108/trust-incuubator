#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# No host ports, host filesystem mounts, or connection to a remote database.
# Local trust auth is confined to this disposable network-isolated container.
container_id=$(docker run --rm -d --network none -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17@sha256:b8faeff7712663c2773a190181e1246e37e364b887611c04658c28b44e2408fe)
trap 'docker rm -f "$container_id" >/dev/null' EXIT
ready=false
for attempt in {1..60}; do
  if docker exec "$container_id" sh -c 'test "$(cat /proc/1/comm)" = postgres && pg_isready -U postgres' >/dev/null 2>&1; then ready=true; break; fi
  sleep 1
done
if [ "$ready" != true ]; then docker logs "$container_id"; exit 1; fi
run_sql() { docker exec -i "$container_id" psql -X -U postgres -v ON_ERROR_STOP=1 < "$1"; }
run_sql supabase/tests/bootstrap.sql
for migration in supabase/migrations/*.sql; do run_sql "$migration"; done
{ sed '/^rollback;$/,$d' supabase/tests/foundation.sql; cat supabase/tests/auth-security.sql; printf '\nrollback;\n'; } | docker exec -i "$container_id" psql -X -U postgres -v ON_ERROR_STOP=1
python3 scripts/test-db-concurrency.py "$container_id"
printf 'Database migration and RLS tests passed. Container will be removed.\n'

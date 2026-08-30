# SmartPlanner — Backup & Recovery Procedure

Scope: database (MySQL) + the user-uploadable/generated storage + the built
frontend. Export scope is PDF + CSV only.

## What must be backed up
1. **MySQL database** `smart_planner` — all app data (users, courses, todos,
   preferences, schedules).
2. **`storage/`** — app-generated files (e.g. any files written at runtime).
3. **`public/build/`** + `resources/js/ziggy.js` — the built frontend asset
   bundle (regenerated at deploy, but keep a copy for instant rollback).

Not backed up / never commit: `.env` (secrets), `node_modules`, `vendor`.

## 1. Database backup (mysqldump)
```bash
# On the MySQL host, as the app user or root:
mysqldump -u smart_planner -p --default-character-set=utf8mb4 \
  --single-transaction --routines --triggers smart_planner \
  > smart_planner_$(date +%F_%H%M).sql

# Single-transaction avoids locking InnoDB; no `--lock-tables` needed.
```
Gzip for smaller/offsite storage:
```bash
mysqldump -u smart_planner -p smart_planner | gzip > backup_$(date +%F).sql.gz
```

Cron example (daily 02:30, keep 14 days):
```cron
30 2 * * * cd /srv/app && mysqldump -u smart_planner -pPASS smart_planner | gzip > backups/db_$(date +\%F).sql.gz && find backups -name '*.sql.gz' -mtime +14 -delete
```

## 2. Storage backup
```bash
tar -czf storage_$(date +%F).tar.gz storage
# (restore into the app root: storage/)
```

## 3. Restore procedure
```bash
# 1) Recreate the DB (destructive — run on a clean/maintenance DB):
mysql -u smart_planner -p -e "CREATE DATABASE smart_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u smart_planner -p smart_planner < smart_planner_<DATE>.sql

# 2) Restore storage files:
tar -xzf storage_<DATE>.tar.gz    # from the app root

# 3) Rebuild the frontend if needed (or redeploy public/build):
npm ci && npm run build

# 4) Re-apply production caches:
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 4. Verification (do this on a throwaway copy, NOT on live data)
```bash
# Dump to a temp file, create a throwaway DB, restore, compare row counts:
mysqldump -u root -p smart_planner > /tmp/bk.sql
mysql -u root -p -e "DROP DATABASE IF EXISTS x; CREATE DATABASE x;"
mysql -u root -p x < /tmp/bk.sql
mysql -u root -p -e "SELECT (SELECT COUNT(*) FROM smart_planner.users)=(SELECT COUNT(*) FROM x.users) AS users_parity;"
mysql -u root -p -e "DROP DATABASE x;"
# This exact round-trip was validated locally (parity OK).
```

## Rules
- Store backups **offsite** (separate server / object storage) so a host
  failure doesn't lose both.
- Test a restore at least once before going live, then on a schedule.
- Keep at least 2 recent backup generations + one weekly offsite.
- Never include `.env` in backups of the repo; back up secrets separately.

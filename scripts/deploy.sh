#!/usr/bin/env bash
# Production deploy for luckbuff.
# Wraps the standard nuxt-vps-deploy flow but also rsyncs the liu-yao SKILL
# bundle and the vedic-service microservice (with venv reconciliation).
set -euo pipefail

SERVER="${LUCKBUFF_DEPLOY_HOST:-deploy@47.254.41.78}"
SSH_KEY="${LUCKBUFF_DEPLOY_KEY:-$HOME/.ssh/id_rsa}"
REMOTE_DIR="/var/www/luckbuff"
VEDIC_REMOTE_DIR="/opt/vedic-service"
ENV_FILE_REMOTE="/home/deploy/envs/luckbuff.env"
ENV_FILE_LOCAL=".env.production"
SKILL_MD="liuyao-three-coin-physical-core-SKILL-contract-v2.md"
QIMEN_ENGINE="qimen-engine.py"
VEDIC_DIR="vedic-service"

SSH_CMD="ssh -i $SSH_KEY"
RSYNC_FLAGS=(-az --partial)

# 链路到这台服务器偶发被对端断连（Connection closed ... port 22），
# rsync 幂等且 --partial 保留半成品，失败直接整轮重试即可。
rsync_retry() {
  local attempt
  for attempt in 1 2 3 4 5; do
    if rsync "${RSYNC_FLAGS[@]}" -e "$SSH_CMD" "$@"; then
      return 0
    fi
    echo "  rsync failed (attempt $attempt/5), retrying in 3s..." >&2
    sleep 3
  done
  echo "FATAL: rsync failed after 5 attempts: $*" >&2
  return 1
}

ssh_retry() {
  local attempt
  for attempt in 1 2 3 4 5; do
    if $SSH_CMD "$@"; then
      return 0
    fi
    echo "  ssh failed (attempt $attempt/5), retrying in 3s..." >&2
    sleep 3
  done
  echo "FATAL: ssh failed after 5 attempts: $*" >&2
  return 1
}

cd "$(dirname "$0")/.."

if [[ ! -f "$SKILL_MD" ]]; then
  echo "FATAL: $SKILL_MD missing locally; liu-yao engine cannot extract on server." >&2
  exit 1
fi

if [[ ! -f "$QIMEN_ENGINE" ]]; then
  echo "FATAL: $QIMEN_ENGINE missing locally; qimen engine cannot run on server." >&2
  exit 1
fi

if [[ ! -d "$VEDIC_DIR" ]]; then
  echo "FATAL: $VEDIC_DIR/ missing locally; vedic chart microservice cannot deploy." >&2
  exit 1
fi

if [[ -f "$ENV_FILE_LOCAL" ]]; then
  echo "==> sync local $ENV_FILE_LOCAL -> $ENV_FILE_REMOTE"
  rsync_retry \
    "$ENV_FILE_LOCAL" \
    "$SERVER:$ENV_FILE_REMOTE"
else
  echo "==> no local $ENV_FILE_LOCAL — keeping existing remote env file"
fi

echo "==> build"
pnpm build

echo "==> rsync .output + ecosystem.config.cjs"
rsync_retry --delete \
  .output \
  ecosystem.config.cjs \
  "$SERVER:$REMOTE_DIR/"

echo "==> ensure remote app/ dir exists"
ssh_retry "$SERVER" "mkdir -p $REMOTE_DIR/app"

echo "==> rsync app/data/ (static data files for APIs)"
rsync_retry --delete \
  "app/data/" \
  "$SERVER:$REMOTE_DIR/app/data/"

echo "==> rsync $SKILL_MD (liu-yao engine bundle)"
rsync_retry \
  "$SKILL_MD" \
  "$SERVER:$REMOTE_DIR/"

echo "==> rsync $QIMEN_ENGINE (qimen engine script)"
rsync_retry \
  "$QIMEN_ENGINE" \
  "$SERVER:$REMOTE_DIR/"

echo "==> ensure remote content/ dir exists"
ssh_retry "$SERVER" "mkdir -p $REMOTE_DIR/content $REMOTE_DIR/public/images"

echo "==> rsync content/worldcup-predictions/ (pre-generated match predictions)"
rsync_retry --delete \
  "content/worldcup-predictions/" \
  "$SERVER:$REMOTE_DIR/content/worldcup-predictions/"

echo "==> rsync content/insights/ (editor articles — no --delete: editors publish via /admin directly on the server)"
rsync_retry \
  --exclude '.backups/' \
  --exclude '.translations/' \
  "content/insights/" \
  "$SERVER:$REMOTE_DIR/content/insights/"

echo "==> rsync public/images/ (editor uploads — no --delete, same reason)"
rsync_retry \
  "public/images/" \
  "$SERVER:$REMOTE_DIR/public/images/"

echo "==> ensure /opt/vedic-service exists with correct ownership"
ssh_retry "$SERVER" "sudo mkdir -p $VEDIC_REMOTE_DIR /opt/ephe && sudo chown -R deploy:deploy $VEDIC_REMOTE_DIR /opt/ephe"

echo "==> rsync $VEDIC_DIR/ (vedic chart microservice — code only)"
rsync_retry --delete \
  --exclude '.venv/' --exclude '.ephe/' --exclude '__pycache__/' --exclude '*.pyc' \
  "$VEDIC_DIR/" \
  "$SERVER:$VEDIC_REMOTE_DIR/"

echo "==> ensure vedic-service venv + ephemeris + deps on server"
ssh_retry "$SERVER" bash <<EOF
set -e
if [ ! -x "$VEDIC_REMOTE_DIR/.venv/bin/python" ]; then
  python3 -m venv "$VEDIC_REMOTE_DIR/.venv"
fi
"$VEDIC_REMOTE_DIR/.venv/bin/pip" install --quiet --upgrade pip
"$VEDIC_REMOTE_DIR/.venv/bin/pip" install --quiet -r "$VEDIC_REMOTE_DIR/requirements.txt"
VEDIC_EPHE_PATH=/opt/ephe "$VEDIC_REMOTE_DIR/.venv/bin/python" - <<'PY'
import swisseph as swe
swe.set_ephe_path('/opt/ephe')
swe.calc_ut(swe.julday(2000, 1, 1, 12), swe.SUN, swe.FLG_SIDEREAL)
print("ephe warmup ok")
PY
EOF

echo "==> PM2 restart with env injection"
ssh_retry "$SERVER" bash <<EOF
set -e
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
cd $REMOTE_DIR
set -a; source $ENV_FILE_REMOTE; set +a
# startOrReload does not apply new shell env vars to an already-running app;
# reload --update-env picks up keys added to the env file since last deploy.
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 reload luckbuff --update-env
pm2 save
EOF

echo "==> verify"
ssh_retry "$SERVER" "pm2 status --no-color | tail -10"
ssh_retry "$SERVER" "curl -s -m 3 http://127.0.0.1:8765/health || echo '!! vedic-service health UNREACHABLE'"
curl -s -o /dev/null -w "homepage HTTPS %{http_code} (%{time_total}s)\n" https://www.ososn.com/

echo "==> verify sitemap"
SITEMAP_OK=true
REQUIRED_ROUTES=(
  /tools/wuxing-chuanyi
  /tools/jinri-yunshi
  /tools/jishi
  /tools/jinri-yiji
  /tools/huangdao
  /tools/chong-shengxiao
  /auspicious-datetime
  /fortune-telling
  /tools
)
for locale_path in sitemap-zh-CN.xml sitemap-zh-TW.xml sitemap-en.xml; do
  case "$locale_path" in
    sitemap-zh-CN.xml) prefix="" ;;
    sitemap-zh-TW.xml) prefix="/zh-TW" ;;
    sitemap-en.xml) prefix="/en" ;;
  esac
  sm_url="https://www.ososn.com/${locale_path}"
  sm_body=""
  for attempt in 1 2 3 4 5; do
    sm_body=$(curl -s -m 10 "$sm_url")
    missing_in_attempt=false
    for route in "${REQUIRED_ROUTES[@]}"; do
      if [ "$(echo "$sm_body" | grep -c "<loc>https://www.ososn.com${prefix}${route}</loc>" || true)" -eq 0 ]; then
        missing_in_attempt=true
        break
      fi
    done
    if [ "$missing_in_attempt" = false ]; then
      break
    fi
    if [ "$attempt" -lt 5 ]; then
      echo "  sitemap ${locale_path} incomplete (${attempt}/5), retrying in 3s..."
      sleep 3
    fi
  done
  for route in "${REQUIRED_ROUTES[@]}"; do
    if [ "$(echo "$sm_body" | grep -c "<loc>https://www.ososn.com${prefix}${route}</loc>" || true)" -eq 0 ]; then
      echo "!! sitemap ${locale_path} missing ${prefix}${route}"
      SITEMAP_OK=false
    fi
  done
done
if $SITEMAP_OK; then
  echo "sitemap OK (key routes present in all locales)"
else
  echo "!! sitemap verification failed"
  exit 1
fi

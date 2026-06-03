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
SKILL_MD="liuyao-three-coin-physical-core-SKILL-contract-v2.md"
QIMEN_ENGINE="qimen-engine.py"
VEDIC_DIR="vedic-service"

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

echo "==> build"
pnpm build

echo "==> rsync .output + ecosystem.config.cjs"
rsync -az --delete -e "ssh -i $SSH_KEY" \
  .output \
  ecosystem.config.cjs \
  "$SERVER:$REMOTE_DIR/"

echo "==> ensure remote app/ dir exists"
ssh -i "$SSH_KEY" "$SERVER" "mkdir -p $REMOTE_DIR/app"

echo "==> rsync app/data/ (static data files for APIs)"
rsync -az --delete -e "ssh -i $SSH_KEY" \
  "app/data/" \
  "$SERVER:$REMOTE_DIR/app/data/"

echo "==> rsync $SKILL_MD (liu-yao engine bundle)"
rsync -az -e "ssh -i $SSH_KEY" \
  "$SKILL_MD" \
  "$SERVER:$REMOTE_DIR/"

echo "==> rsync $QIMEN_ENGINE (qimen engine script)"
rsync -az -e "ssh -i $SSH_KEY" \
  "$QIMEN_ENGINE" \
  "$SERVER:$REMOTE_DIR/"

echo "==> ensure remote content/ dir exists"
ssh -i "$SSH_KEY" "$SERVER" "mkdir -p $REMOTE_DIR/content"

echo "==> rsync content/worldcup-predictions/ (pre-generated match predictions)"
rsync -az --delete -e "ssh -i $SSH_KEY" \
  "content/worldcup-predictions/" \
  "$SERVER:$REMOTE_DIR/content/worldcup-predictions/"

echo "==> ensure /opt/vedic-service exists with correct ownership"
ssh -i "$SSH_KEY" "$SERVER" "sudo mkdir -p $VEDIC_REMOTE_DIR /opt/ephe && sudo chown -R deploy:deploy $VEDIC_REMOTE_DIR /opt/ephe"

echo "==> rsync $VEDIC_DIR/ (vedic chart microservice — code only)"
rsync -az --delete \
  --exclude '.venv/' --exclude '.ephe/' --exclude '__pycache__/' --exclude '*.pyc' \
  -e "ssh -i $SSH_KEY" \
  "$VEDIC_DIR/" \
  "$SERVER:$VEDIC_REMOTE_DIR/"

echo "==> ensure vedic-service venv + ephemeris + deps on server"
ssh -i "$SSH_KEY" "$SERVER" bash <<EOF
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
ssh -i "$SSH_KEY" "$SERVER" bash <<EOF
set -e
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
cd $REMOTE_DIR
set -a; source $ENV_FILE_REMOTE; set +a
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
EOF

echo "==> verify"
ssh -i "$SSH_KEY" "$SERVER" "pm2 status --no-color | tail -10"
ssh -i "$SSH_KEY" "$SERVER" "curl -s -m 3 http://127.0.0.1:8765/health || echo '!! vedic-service health UNREACHABLE'"
curl -s -o /dev/null -w "homepage HTTPS %{http_code} (%{time_total}s)\n" https://www.ososn.com/

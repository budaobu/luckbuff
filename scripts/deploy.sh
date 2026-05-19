#!/usr/bin/env bash
# Production deploy for luckbuff.
# Wraps the standard nuxt-vps-deploy flow but includes project-specific assets
# that live outside .output and outside git (SKILL.md).
set -euo pipefail

SERVER="${LUCKBUFF_DEPLOY_HOST:-deploy@47.254.41.78}"
SSH_KEY="${LUCKBUFF_DEPLOY_KEY:-$HOME/.ssh/id_rsa}"
REMOTE_DIR="/var/www/luckbuff"
ENV_FILE_REMOTE="/home/deploy/envs/luckbuff.env"
SKILL_MD="liuyao-three-coin-physical-core-SKILL-contract-v2.md"

cd "$(dirname "$0")/.."

if [[ ! -f "$SKILL_MD" ]]; then
  echo "FATAL: $SKILL_MD missing locally; liu-yao engine cannot extract on server." >&2
  exit 1
fi

echo "==> build"
pnpm build

echo "==> rsync .output + ecosystem.config.cjs"
rsync -az --delete -e "ssh -i $SSH_KEY" \
  .output \
  ecosystem.config.cjs \
  "$SERVER:$REMOTE_DIR/"

echo "==> rsync $SKILL_MD (liu-yao engine bundle)"
rsync -az -e "ssh -i $SSH_KEY" \
  "$SKILL_MD" \
  "$SERVER:$REMOTE_DIR/"

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
ssh -i "$SSH_KEY" "$SERVER" "pm2 status luckbuff --no-color | tail -5"
curl -s -o /dev/null -w "homepage HTTPS %{http_code} (%{time_total}s)\n" https://www.ososn.com/

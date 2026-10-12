#!/bin/bash
# Registers /api/telegram/webhook with Telegram. Run once after setting
# TELEGRAM_BOT_TOKEN / TELEGRAM_WEBHOOK_SECRET / APP_URL in the env file
# (and again if any of them change).
set -euo pipefail

ENV_FILE="${1:-/home/server_pc/docker/amd-price-tracker.env}"
get() { grep -E "^$1=" "$ENV_FILE" | cut -d= -f2-; }

TOKEN=$(get TELEGRAM_BOT_TOKEN)
SECRET=$(get TELEGRAM_WEBHOOK_SECRET)
APP_URL=$(get APP_URL)
[ -n "$TOKEN" ] && [ -n "$SECRET" ] && [ -n "$APP_URL" ] || { echo "Missing TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET or APP_URL in $ENV_FILE" >&2; exit 1; }

curl -sS "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  --data-urlencode "url=${APP_URL}/api/telegram/webhook" \
  --data-urlencode "secret_token=${SECRET}" \
  --data-urlencode 'allowed_updates=["message"]' \
  --data-urlencode "drop_pending_updates=true"
echo
curl -sS "https://api.telegram.org/bot${TOKEN}/getWebhookInfo"
echo

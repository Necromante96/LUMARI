#!/usr/bin/env bash
set -euo pipefail

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/post-commit"

if [ ! -d ".git" ]; then
  echo "Este diretório não parece ser um repositório git." >&2
  exit 1
fi

mkdir -p "$HOOK_DIR"

cat > "$HOOK_FILE" <<'HOOK'
#!/bin/sh
# post-commit hook: tenta push automático para origin/BRANCH
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
REMOTE_URL=$(git config --get remote.origin.url || true)
if [ -z "$REMOTE_URL" ]; then
  echo "[post-commit] Nenhum remote 'origin' configurado — pulando push automático."
  exit 0
fi

echo "[post-commit] Enviando branch '$BRANCH' para origin..."
# tentar push, não falhar o hook caso haja erro
git push origin "$BRANCH" || echo "[post-commit] git push falhou — verifique permissões e branch protegido."
HOOK

chmod +x "$HOOK_FILE"

echo "Hook post-commit instalado em $HOOK_FILE"

exit 0

#!/usr/bin/env bash
# Pequeno utilitário para inserir uma entrada de changelog no topo do README.md
# Uso: ./scripts/update_readme_changelog.sh vX.Y.Z-alfa "Notas de release..." [--push]

set -euo pipefail
README="$(dirname "$0")/../README.md"
PUSH=false

if [ ! -f "$README" ]; then
  echo "README.md não encontrado: $README" >&2
  exit 1
fi
if [ $# -lt 2 ]; then
  echo "Uso: $0 <versao> <mensagem> [--push]" >&2
  echo "Ex: $0 v0.1.7-alfa \"Correções de bug e melhorias PJAX\" --push" >&2
  exit 1
fi

# detectar flag --push no final (opcional)
if [ "${@: -1}" = "--push" ]; then
  PUSH=true
  # remove o último argumento
  set -- "${@:1:$(($#-1))}"
fi

VERSAO="$1"
shift
NOTES="$*"

# Gera bloco de notas com quebras para bullets
IFS=$'\n'
NOTES_BLOCK="- ${NOTES//$'\n'/$'\n'- }"

TMP="$(mktemp)"
# Encontrar o início do changelog
awk -v ver="$VERSAO" -v notes="$NOTES_BLOCK" '
BEGIN{ in_changelog=0 }
{
  if ($0 ~ /^## Histórico de versões/) { print; in_changelog=1; print ""; print ver ""; print notes; print ""; next }
  print
}
' "$README" > "$TMP"

mv "$TMP" "$README"

echo "README.md atualizado com $VERSAO"

# Fazer commit automático (por padrão)
git add "$README"
COMMIT_MSG="docs(changelog): add $VERSAO"
git commit -m "$COMMIT_MSG" || echo "Nada para commitar ou commit já criado."

if [ "$PUSH" = true ]; then
  # descobrir branch atual
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  echo "Enviando commit para origin/$BRANCH..."
  git push origin "$BRANCH"
fi

exit 0

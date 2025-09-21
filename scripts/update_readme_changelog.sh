#!/usr/bin/env bash
# Pequeno utilitário para inserir uma entrada de changelog no topo do README.md
# Uso: ./scripts/update_readme_changelog.sh vX.Y.Z-alfa "Notas de release..."

set -euo pipefail
README="$(dirname "$0")/../README.md"

if [ ! -f "$README" ]; then
  echo "README.md não encontrado: $README" >&2
  exit 1
fi
if [ $# -lt 2 ]; then
  echo "Uso: $0 <versao> <mensagem>" >&2
  echo "Ex: $0 v0.1.7-alfa \"Correções de bug e melhorias PJAX\"" >&2
  exit 1
fi

VERSAO="$1"
shift
NOTES="$*"

# Gera bloco de notas com quebras para bullets
IFS=$'\n'
NOTES_BLOCK="- ${NOTES//$'\n'/$'\n'- }"

TMP="$(mktemp)"
# Encontrar o início do changelog e inserir no topo
awk -v ver="$VERSAO" -v notes="$NOTES_BLOCK" '
BEGIN{ in_changelog=0 }
{
  if ($0 ~ /^## Histórico de versões/) { print; in_changelog=1; print ""; print ver ""; print notes; print ""; next }
  print
}
' "$README" > "$TMP"

mv "$TMP" "$README"

echo "README.md atualizado com $VERSAO (sem commit automático)."

exit 0
}

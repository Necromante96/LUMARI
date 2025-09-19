README - Deploy para GitHub Pages

Este documento descreve passos práticos para publicar o conteúdo deste diretório no GitHub Pages (branch `gh-pages`) e para instalar o workflow de Actions que faz deploy automático.

Pré-requisitos
- Ter uma conta GitHub (aqui: `Necromante96`).
- Git instalado localmente.
- Permissões para criar repositório (ou já ter criado `Necromante96/LUMARI`).

Passo 1 — Inicializar repositório local (se ainda não estiver)
No PowerShell, dentro da pasta do projeto:

```powershell
# Inicializa repo (se necessário)
git init
git add .
git commit -m "Initial commit: LUMARI site"
```

Passo 2 — Criar o repositório remoto (opcional)
Se o repositório `Necromante96/LUMARI` ainda não existir, crie pelo site do GitHub ou via gh CLI:

```powershell
# via GitHub CLI (se instalado)
gh repo create Necromante96/LUMARI --public --source=. --remote=origin --push
```

Se preferir criar via interface do GitHub, crie um repositório vazio com o nome `LUMARI` e então vincule o remoto:

```powershell
git remote add origin https://github.com/Necromante96/LUMARI.git
git branch -M main
git push -u origin main
```

Passo 3 — Adicionar workflow de deploy (se ainda não estiver no repositório remoto)
Se você já tem o arquivo `.github/workflows/deploy-gh-pages.yml` no repositório local (eu criei aqui), apenas faça commit e push:

```powershell
git add .github/workflows/deploy-gh-pages.yml
git commit -m "ci: add gh-pages deploy workflow"
git push origin main
```

Se quiser abrir um Pull Request em vez de push direto, crie uma branch e envie a branch:

```powershell
git checkout -b feature/add-gh-pages-workflow
git add .github/workflows/deploy-gh-pages.yml
git commit -m "ci: add gh-pages deploy workflow"
git push origin feature/add-gh-pages-workflow
# abra um PR pelo GitHub UI ou via gh CLI
gh pr create --title "Add deploy workflow" --body "Workflow para publicar em gh-pages"
```

Passo 4 — Configurar GitHub Pages
- Vá em Settings → Pages no repositório `Necromante96/LUMARI`.
- Em "Source" selecione a branch `gh-pages` (a opção será habilitada depois que o workflow rodar pela primeira vez e criar a branch).
- Salve.

Passo 5 — Forçar o workflow a rodar (opcional)
- Faça um pequeno commit na `main` e dê push; o workflow executará e criará a branch `gh-pages` automaticamente.

Observações de segurança
- Não é necessário criar secrets para o deploy dentro do mesmo repositório: o `GITHUB_TOKEN` fornecido por Actions é suficiente para gravação em `gh-pages` quando o workflow roda no próprio repositório.
- Se você quiser que um repositório externo faça push para `Necromante96/LUMARI`, será necessário um Personal Access Token (PAT) com permissões de `repo` configurado como Secret no repositório de origem.

Ajuda adicional
Posso gerar os comandos exatos se você me disser:
- Se o repositório já existe no GitHub (eu então apenas dou os comandos de push)
- Se prefere que eu crie o PR automaticamente (requer gh CLI autenticado no seu ambiente)

---
Gerado automaticamente pelo assistente para ajudá-lo a publicar o site LUMARI no GitHub Pages.

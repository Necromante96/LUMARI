# LUMARI

Site estático com navegação PJAX, áudio ambiente persistente e fluxo simples de autenticação via localStorage.

## Estrutura
- index.html: Landing page
- css/styles.css: Estilos globais
- js/main.js: Áudio, PJAX, acordeões e micro-interações
- pages/: Conteúdo interno (about, features, credits, login, signup, homes, admin)
- logo/: Assets de imagem (preservados)
- sound/: Áudios (preservados)

## Como usar
- Abra `index.html` em um navegador. A navegação interna troca apenas o conteúdo principal, mantendo o áudio contínuo.
- Autenticação é local (localStorage). Use Signup para criar uma conta:
  - role=public → redireciona para `home-public.html`
  - role=creator → redireciona para `home-creator.html`
- Admin: página utilitária para exportar/importar a base local de usuários.

## Dicas
- Se publicar em subdiretório (ex.: GitHub Pages), os paths são relativos e devem funcionar localmente e no deploy.

## Observações
- Removidos: página de atualizações (changelog) e menções a versão para simplificar o projeto.
- As pastas `logo/` e `sound/` foram mantidas conforme solicitado.

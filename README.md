# LUMARI

Plataforma estática (HTML/CSS/JS puro) com navegação tipo PJAX, áudio ambiente persistente e protótipo de fluxo de autenticação local, focada em neuromarketing emocional para público geral e criadores de conteúdo.

## Visão geral
- Persistência de áudio entre páginas (sem reiniciar a música).
- Navegação rápida sem recarregar o documento inteiro (PJAX leve) com preservação de scripts e estilos inline das páginas.
- Sons de clique em botões/links (inclui Login e Signup).
- Duas jornadas: Público Geral e Criador de Conteúdo.
- Página do Criador exibe tendências agregadas em tempo real com logos por rede social.

## Estrutura
- `index.html`: Landing page e seleção de jornada (público ou criador)
- `css/styles.css`: Estilos globais e responsivos (mobile-first)
- `js/main.js`: Player de áudio global, PJAX, acordeões, modal de termos e microinterações
- `pages/`: Conteúdos internos (`about`, `features`, `credits`, `login`, `signup`, `home-public`, `home-creator`)
- `logo/`: Imagens e logos de redes sociais
- `sound/`: Áudios (música de fundo e clique)

## Como executar
Abra o arquivo `index.html` diretamente no navegador (duplo clique) ou sirva a pasta via um servidor estático (opcional). A navegação interna manterá o áudio tocando contínuo.

Autenticação (mock/local):
- Clique em “Criar Conta” para cadastrar (dados ficam em `localStorage`).
- Faça login como Público ou Criador. Após autenticação, você será redirecionado para a respectiva Home.

## Acessibilidade e UX
- Botão de áudio com estado ARIA e foco visível.
- Elementos interativos com área de toque adequada em mobile.
- Detalhes/accordeons com indicadores visuais e suporte a teclado.

## Responsividade (Android/iOS/PC)
- Topbar e navegação com rolagem horizontal suave em telas estreitas.
- Espaçamentos seguros considerando safe-area (notches) para o botão de áudio.
- Inputs em 16px para evitar zoom automático no mobile.

## Recursos principais atuais
- Áudio global persistente (`sound/sound.mp3`) controlado via botão fixo.
- Som de clique (`sound/mouse-click.mp3`) em links, botões e forms (inclui Login/Signup).
- Home do Criador: métricas emocionais simuladas e “Tendências em Tempo Real” por termo com mini-logos de redes sociais relacionadas.
- Termos de Uso com variação de conteúdo por perfil (Público vs Criador) e tela de recusa.

## Notas técnicas
- O PJAX atual substitui apenas o conteúdo de `<main class="container">` e injeta scripts inline e estilos `<style>` da página alvo, evitando perda de layout.
- `window.pjaxLoad(url)` exposto globalmente para navegações programáticas (usado no Login/Signup para manter a música sem reiniciar).
- Preferência por paths relativos simples, compatíveis com deploy em subdiretórios (ex.: GitHub Pages).


## Histórico de versões (changelog)

v0.1.6-alfa (atual)
- Correções nos acordeões (detalhes/summary) para exibir corretamente o conteúdo com transições suaves.
- Reaplicação segura de enhanceAccordions() após navegações PJAX.
- Pequenas otimizações de performance no carregamento PJAX.

v0.1.5-alfa
- Tendências em Tempo Real com mini-logos das redes onde cada termo está em alta.
- Login e Signup usam `pjaxLoad` quando disponível (mantém a música sem reiniciar), com fallback para reload completo.
- Injeção de estilos `<style>` das páginas alvo durante PJAX, evitando perda de CSS específico.
- Melhorias Android/iOS: navegação rolável, safe-areas, inputs 16px, botão de áudio otimizado.

v0.1.4
- Responsividade aprimorada (mobile-first), ajustes no topbar e áreas de toque.

v0.1.3
- Ajustes de grid e métricas na Home do Criador.

v0.1.2
- Modal de Termos de Uso por perfil (Público/Criador) e tela de recusa.

v0.1.1
- Sons de clique em elementos interativos.

v0.1.0
- Navegação tipo PJAX simples para manter o áudio tocando entre páginas.

v0.0.9
- Ajustes de acessibilidade e foco.

v0.0.8
- Melhorias visuais, sombras e gradientes.

v0.0.7
- Páginas Home do Público e Criador (mock de métricas).

v0.0.6
- Protótipo de autenticação local (signup/login via localStorage).

v0.0.5
- Estrutura inicial das páginas internas (about, features, credits).

v0.0.4
- Primeira versão do áudio de fundo e botão de controle.

v0.0.3
- Landing page com cartões de acesso (público/criador).

v0.0.2
- Layout base e tipografia inicial.

v0.0.1
- Adição de assets de logo e som.

v0.0.0
- Estrutura inicial de páginas estáticas.

---

Sinta-se livre para abrir issues ou sugestões de melhoria.

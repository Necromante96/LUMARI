# LUMARI

Uma demo/protótipo estático (HTML/CSS/JS) que explora ideias de UX para plataformas com foco em conteúdo emocional e criação: reprodução de áudio persistente, navegação parcial tipo PJAX para preservar estado, microinterações sonoras e uma página de criador com tendências agregadas por rede social.

Este projeto é acadêmico e fictício, mas contém conceitos e padrões que podem ser aplicados em projetos reais no futuro (ex.: design de experiência sonora, prototipagem de dashboards de tendências, técnicas de navegação sem recarga total).

Resumo principal (para visitantes rápidos):
- Objetivo: demonstrar como manter experiência contínua (áudio e estado) enquanto navega entre páginas estáticas e como apresentar tendências simples com sinais visuais (mini-logos por rede).
- Público-alvo: estudantes, designers de produto, pesquisadores e desenvolvedores interessados em UX com áudio e prototipagem estática.
- Limitação: é um front-end estático; nenhuma autenticação segura ou backend real está implementado (auth é mock via localStorage).

## Como experimentar rapidamente
1. Abra `index.html` no navegador (duplo clique) ou sirva a pasta com um servidor estático simples.

Exemplo (diretório do projeto):
```sh
# Python 3
python3 -m http.server 8000
# então acesse http://localhost:8000
```

2. Explore as jornadas “Público” e “Criador”.
3. Teste o player de áudio (canto superior) e observe que a música permanece entre as páginas.

## Estrutura essencial do repositório
- `index.html` — landing e escolha de jornada
- `pages/` — páginas internas (about, features, credits, login, signup, home-public, home-creator)
- `css/styles.css` — estilos principais e responsividade
- `js/main.js` — player global, PJAX leve, acordeões e microinterações
- `logo/`, `sound/` — assets

## Principais recursos (resumido)
- Áudio de fundo persistente entre páginas
- Sons de clique em interações
- Navegação parcial (PJAX) para preservar estado
- Página do Criador: visualização de tendências com pequenos logos por rede

## Notas de segurança e uso
- Não use este repositório como base para autenticação real. O fluxo de login/signup é apenas um mock (localStorage).
- Há scripts utilitários no diretório `scripts/` para edição de documentação; eles não fazem push automático.

## Contribuição e uso acadêmico
- Abra issues para sugestões e experimentos. Para contribuições de código, envie um PR com descrições claras do experimento.
- Licença: este repositório não inclui uma licença explícita; adicione uma se quiser permitir uso externo.

## Histórico rápido (changelog)
v0.1.8-alfa (atual)
- Limpeza e reorganização do README; resumo principal adicionado.
- Removidos hooks de push automático e ajustado helper de changelog para não comitar automaticamente.

v0.1.7-alfa
- Reversão do comportamento de push automático (hooks locais removidos).
- Melhorias de documentação e fluxo de trabalho.

v0.1.6-alfa
- Correções nos acordeões (detalhes/summary) e maior estabilidade do carregamento PJAX.

v0.1.5-alfa
- Tendências em Tempo Real com mini-logos das redes sociais.
- Login/Signup usam `pjaxLoad` quando disponível (mantém a música sem reiniciar).

v0.1.4
- Responsividade e melhorias de touch/UX para mobile.

v0.1.3
- Ajustes de grid e métricas na Home do Criador.

v0.1.2
- Modal de Termos de Uso por perfil (Público/Criador) e tela de recusa.

v0.1.1
- Sons de clique em elementos interativos.

v0.1.0
- Implementação inicial do PJAX leve para manter áudio entre páginas.

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

v0.0.0-alfa
- Estrutura inicial de páginas estáticas; primeiros assets adicionados.

---

Se preferir que eu simplifique ainda mais este README (por exemplo, transformá-lo em um README de uma página ainda mais enxuta ou adicionar exemplos de uso mais detalhados), diga o estilo desejado e eu ajusto.

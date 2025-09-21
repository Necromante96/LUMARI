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
- Correções nos acordeões e estabilidade do PJAX.

v0.1.5-alfa
- Tendências com mini-logos por rede; login/signup usam `pjaxLoad` quando disponível.

---

Se preferir que eu simplifique ainda mais este README (por exemplo, transformá-lo em um README de uma página ainda mais enxuta ou adicionar exemplos de uso mais detalhados), diga o estilo desejado e eu ajusto.

LUMARI — Página inicial

Arquivos criados:

- `index.html` — página inicial com escolha de acesso
- `css/styles.css` — estilos principais
- `js/main.js` — scripts mínimos de acessibilidade e interação
- `pages/public.html` — placeholder para fluxo do Público Geral
- `pages/creator.html` — placeholder para fluxo do Criador

Autores:

- Júlia Silva
- Lucas Tavares
- Maluana Amaral
- Muriel Rosa
- Copilot GitHub

Como testar localmente:

1. Abra a pasta no seu navegador: clique duas vezes em `index.html` ou arraste para um navegador moderno. Para evitar limitações do protocolo `file://` (especialmente áudio/autoplay), é recomendado servir o site com um servidor local simples:

	 - Com Python 3 (na pasta do projeto):

		 ```powershell
		 python -m http.server 8000
		 ```

	 - Ou com Node.js (servir rapidamente):

		 ```powershell
		 npx http-server -p 8000
		 ```

	 Depois abra `http://localhost:8000` no navegador.

2. Verifique que a pasta `logo` (com `logo.jpg`) está no diretório do projeto (mesmo nível que `index.html`).

Próximos passos sugeridos:

- Implementar captura de áudio e vídeo para análise emocional (WebRTC, WebAudio, TensorFlow.js/MediaPipe).
- Criar painel do criador com visualização de métricas e recomendações.
- Implementar autenticação e tela de assinatura.

Versão atual
-----------

- v0.0.7-alfa (2025-09-19): melhorias de robustez — resolução de paths para deploys em subdiretórios, logs de diagnóstico, normalização de links (evita /pages/pages/...), execução de scripts via PJAX e página 404 adicionada.
# LUMARI

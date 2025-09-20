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

Testes rápidos do novo fluxo (Termos e Tema)
-----------------------------------------

- Abra o site localmente (ex.: `python -m http.server 8000`) e acesse `http://localhost:8000`.
- Clique em "Entrar" → "Criar Conta" e complete o formulário.
- Após clicar em "Criar Conta", o modal de Termos será mostrado imediatamente na página de cadastro.
- Ao clicar em "Aceitar e Continuar" você será redirecionado para a home correspondente. O aceite é persistido em `localStorage.lumari_terms_accepted = 'true'`.
- Se você clicar em "Não Aceito", aparecerá a tela de "Acesso Negado" com opções para voltar aos termos ou encerrar. Se o encerramento automático falhar, será mostrado um aviso temporário instruindo a fechar a aba manualmente.
- Use o botão de tema no topo para alternar entre claro/escuro; a preferência é salva em `localStorage.lumari_theme`.

Sistema de Backup Local
----------------------

Para criar backups locais do projeto (em `C:\Users\lukas\Downloads\LUMARI`):

**Usando o script automatizado (Windows):**
```batch
# Executar o arquivo batch
backup.bat

# Ou diretamente via linha de comando
backup.bat backup    # Criar backup
backup.bat restore   # Restaurar backup
```

**Usando Node.js diretamente:**
```bash
# Criar backup
node backup.js backup

# Restaurar backup
node backup.js restore

# Ver ajuda
node backup.js
```

O sistema de backup copia todos os arquivos essenciais do projeto e cria um arquivo de informações com timestamp para controle de versões.

Versão atual
-----------

	- v0.0.9-alfa (2025-09-20): release — melhorias de UX/UI, termos de uso obrigatórios no cadastro, temas personalizáveis, micro-interações e correções diversas.
# LUMARI

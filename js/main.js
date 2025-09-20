// main.js — LUMARI
// - Áudio persistente com autoplay (tenta desmutado; fallback mutado)
// - Toggle só mute/unmute (sem pausar) com fade-in ao habilitar
// - Persistência de posição e sync entre abas
// - Navegação PJAX com transições suaves
// - Acordeão com chevron rotativo e transição de altura

document.addEventListener('DOMContentLoaded', () => {
  const POS_KEY = 'lumari_audio_pos';
  const UNMUTED_KEY = 'lumari_unmuted';
  const SYNC_KEY = 'lumari_audio_sync';
  // Versão atual do site
  const CURRENT_VER = '0.0.9';

  const toggle = document.getElementById('audioToggle');
  const THEME_KEY = 'lumari_theme';
  const TERMS_KEY = 'lumari_terms_accepted';

  function throttle(fn, wait){ let last=0; let t; return (...args)=>{ const now = Date.now(); if(now-last>wait){ last=now; fn(...args); } else { clearTimeout(t); t=setTimeout(()=>{ last=Date.now(); fn(...args); }, wait-(now-last)); } }; }

  // Fade-in de volume do audio (0 -> 1)
  async function fadeIn(el, duration=420){
    if(!el) return;
    try{
      const startVol = 0; const endVol = 1;
      el.volume = startVol;
      const steps = 21; const step = (endVol-startVol)/steps; const interval = duration/steps;
      await new Promise(res=>{ let v = startVol; const id = setInterval(()=>{ v = Math.min(endVol, v+step); el.volume = v; if(v >= endVol){ clearInterval(id); res(); } }, interval); });
    }catch(e){}
  }

  // Detectar BASE_PATH (suporta servir site a partir de subdiretórios como GitHub Pages)
  const BASE_PATH = (function(){
    try{
      // Começa com a origem + diretório atual (sem o arquivo final)
      let base = location.origin + location.pathname.replace(/\/[^\/]*$/, '/');
      // Se estiver dentro de /pages/ no caminho, reduz para a raiz do repositório
      if(base.includes('/pages/')) base = base.split('/pages/')[0] + '/';
      return base;
    }catch(e){ return location.origin + '/'; }
  })();

  // modo debug: ativa logs detalhados quando localStorage.lumari_debug == '1'
  const LUMARI_DEBUG = (function(){ try{ return localStorage.getItem('lumari_debug') === '1'; }catch(e){ return false; } })();

  // normalizeHref disponível globalmente no arquivo para PJAX e debug
  function normalizeHref(h){
    if(!h) return h;
    if(h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) return h;
    if(h.startsWith('http')) return h;
    if(h.startsWith('/')){
      const trimmed = h.replace(/^\/+/, '');
      try{ const u = new URL(trimmed, BASE_PATH); u.pathname = u.pathname.replace(/\/pages\/+((pages\/)+)/g, '/pages/'); return u.toString(); }catch(e){ return trimmed; }
    }
    if(h.startsWith('pages/')){
      try{ const u = new URL(h, BASE_PATH); u.pathname = u.pathname.replace(/\/pages\/+((pages\/)+)/g, '/pages/'); return u.toString(); }catch(e){ return new URL(h, location.href).toString(); }
    }
    try{ const rr = new URL(h, location.href); rr.pathname = rr.pathname.replace(/\/pages\/+((pages\/)+)/g, '/pages/'); return rr.toString(); }catch(e){ return h; }
  }

  // Debug: mostrar exemplos de normalização quando ativado
  try{ if(LUMARI_DEBUG){ const examples = ['index.html','pages/about.html','/pages/credits.html','/index.html','./about.html','../pages/updates.html']; console.group('[LUMARI DEBUG] normalizeHref examples'); examples.forEach(ex=>{ try{ console.log(ex, '→', normalizeHref(ex)); }catch(e){} }); console.groupEnd(); } }catch(e){}

  // Garantir único elemento <audio> com único source robusto
  // Usar caminho absoluto relativo à raiz para evitar múltiplos 404s: '/sound/sound.mp3'
  let audioRef = document.getElementById('bgAudio');
  if(!audioRef){
    try{
      audioRef = document.createElement('audio');
      audioRef.id = 'bgAudio';
      audioRef.loop = true;
      audioRef.preload = 'auto';
      audioRef.autoplay = true;
      audioRef.setAttribute('playsinline','');
      // Caminho único: assume que a pasta `sound` está na raiz do site
      // Resolução assíncrona do melhor caminho para sound.mp3 para evitar 404s simultâneos.
      async function resolveAudioSource(){
        const candidates = [
          BASE_PATH + '/sound/sound.mp3',
          new URL('./sound/sound.mp3', location.href).toString(),
          new URL('sound/sound.mp3', location.href).toString(),
          new URL('../sound/sound.mp3', location.href).toString()
        ];
        // Testar sequencialmente com HEAD para evitar downloads/404s concorrentes
        for(const c of candidates){
          try{
            const url = new URL(c, location.href).toString();
            const res = await fetch(url, {method:'HEAD', cache:'no-store'});
            if(res && res.ok){
              const src = document.createElement('source');
              src.src = url;
              src.type = 'audio/mpeg';
              audioRef.appendChild(src);
              audioRef.load();
              if(LUMARI_DEBUG) console.info('[audio] chosen source:', url);
              return url;
            }
          }catch(e){
            // ignora e tenta próximo candidato
          }
        }
        // fallback final: tenta relativo simples (pode falhar em file://)
        const fallback = new URL('sound/sound.mp3', location.href).toString();
        const src = document.createElement('source');
        src.src = fallback;
        src.type = 'audio/mpeg';
        audioRef.appendChild(src);
        audioRef.load();
        return fallback;
      }
      // iniciar resolução (não bloqueante)
      resolveAudioSource().then((chosen)=>{ /* escolhido: */ }).catch(()=>{});
      document.body.appendChild(audioRef);
    }catch(e){ console.error('Falha ao criar bgAudio dinamicamente', e); }
  }

  // Sync entre abas
  let bc = null; try{ if('BroadcastChannel' in window) bc = new BroadcastChannel('lumari_audio'); }catch(e){}
  function broadcastMute(muted){ try{ if(bc) bc.postMessage({type:'mute',muted:!!muted}); else localStorage.setItem(SYNC_KEY, JSON.stringify({ts:Date.now(), muted:!!muted})); }catch(e){} }

  function updateToggleUI(){
    if(!toggle) return;
    if(audioRef && audioRef.muted){ toggle.classList.add('muted'); toggle.classList.remove('active'); toggle.setAttribute('aria-pressed','false'); toggle.textContent='🔈'; }
    else { toggle.classList.remove('muted'); toggle.classList.add('active'); toggle.setAttribute('aria-pressed','true'); toggle.textContent='🔊'; }
  }

  // Restaurar posição
  function restorePosition(){ try{ const p=parseFloat(localStorage.getItem(POS_KEY)); if(!isNaN(p) && audioRef.duration && p>0 && p<audioRef.duration) audioRef.currentTime=p; }catch(e){} }
  audioRef.addEventListener('loadedmetadata', restorePosition);
  restorePosition();
  const savePos = throttle(()=>{ try{ if(!isNaN(audioRef.currentTime)) localStorage.setItem(POS_KEY, String(audioRef.currentTime)); }catch(e){} }, 1000);
  audioRef.addEventListener('timeupdate', savePos);
  window.addEventListener('beforeunload', ()=>{ try{ if(!isNaN(audioRef.currentTime)) localStorage.setItem(POS_KEY, String(audioRef.currentTime)); }catch(e){} });

  // Autoplay
  async function attemptAutoplay(){
    try{
      audioRef.muted = false;
      await audioRef.play();
      await fadeIn(audioRef, 420);
      localStorage.setItem(UNMUTED_KEY,'true');
      updateToggleUI(); broadcastMute(false);
      return true;
    }catch(e){
      try{
        audioRef.muted = true;
        await audioRef.play();
        localStorage.setItem(UNMUTED_KEY,'false');
        updateToggleUI(); broadcastMute(true);
        return true;
      }catch(err){ console.log('Autoplay bloqueado', err); return false; }
    }
  }

  function initAudio(){
    const prefUnmuted = localStorage.getItem(UNMUTED_KEY) === 'true';
    attemptAutoplay().then((played)=>{
      if(prefUnmuted && audioRef.muted){
        // tentar desmutar gentilmente
        audioRef.muted = false;
        audioRef.play().then(()=>{ fadeIn(audioRef, 420); localStorage.setItem(UNMUTED_KEY,'true'); updateToggleUI(); broadcastMute(false); }).catch(()=>{ audioRef.muted = true; updateToggleUI(); });
      }
      updateToggleUI();
    });
  }

  // Tentar no primeiro gesto
  function tryPlayOnFirstGesture(){
    if(!audioRef.paused && !audioRef.muted) return;
    const handler = async ()=>{
      try{
        audioRef.muted = false;
        await audioRef.play();
        await fadeIn(audioRef, 420);
        localStorage.setItem(UNMUTED_KEY,'true'); updateToggleUI(); broadcastMute(false);
      }catch(e){
        try{ audioRef.muted = true; await audioRef.play(); localStorage.setItem(UNMUTED_KEY,'false'); updateToggleUI(); broadcastMute(true); }catch(_){}
      }finally{
        window.removeEventListener('pointerdown', handler, {capture:true});
        window.removeEventListener('keydown', handler, {capture:true});
        window.removeEventListener('touchstart', handler, {capture:true});
      }
    };
    window.addEventListener('pointerdown', handler, {capture:true, passive:true});
    window.addEventListener('keydown', handler, {capture:true});
    window.addEventListener('touchstart', handler, {capture:true, passive:true});
  }

  // Toggle mute/unmute com fade-in ao habilitar
  if(toggle){
    // Toggle: se estiver mutado -> desmutar; se estiver desmutado -> mutar
    toggle.addEventListener('click', async (e)=>{
      e.preventDefault();
      const currentlyMuted = !!audioRef.muted;
      if(currentlyMuted){
        // estava mutado -> desmutar e tentar tocar com fade
        try{ audioRef.muted = false; await audioRef.play(); await fadeIn(audioRef, 360); localStorage.setItem(UNMUTED_KEY, 'true'); broadcastMute(false); }
        catch(e){ console.warn('Falha ao desmutar/play', e); }
      } else {
        // estava tocando -> mutar
        audioRef.muted = true; localStorage.setItem(UNMUTED_KEY, 'false'); broadcastMute(true);
      }
      updateToggleUI();
    });
    toggle.setAttribute('tabindex','0');
    toggle.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle.click(); } });
  }

  // Receber sync de outras abas
  if(bc){ bc.onmessage = (ev)=>{ if(ev?.data?.type==='mute'){ audioRef.muted=!!ev.data.muted; updateToggleUI(); } }; }
  window.addEventListener('storage', (e)=>{ if(e.key===SYNC_KEY){ try{ const d=JSON.parse(e.newValue||'{}'); if('muted' in d){ audioRef.muted=!!d.muted; updateToggleUI(); } }catch(_){} } });

  // Acordeão com transição de altura
  function enhanceAccordions(root=document){
    const detailsList = Array.from(root.querySelectorAll('.intro details'));
    detailsList.forEach(d=>{
      if(d.dataset.accInited) return; d.dataset.accInited='1';
      const content = d.querySelector('.accordion-content');
      if(!content) return;

      // estado inicial
      if(d.hasAttribute('open')){
        content.classList.add('open');
        content.style.height = content.scrollHeight+'px';
        // pós tick, libera para auto
        requestAnimationFrame(()=>{ content.style.height = 'auto'; });
      }else{
        content.classList.remove('open');
        content.style.height = '0px';
      }

      d.addEventListener('toggle', ()=>{
        const isOpen = d.open;
        const currentAuto = content.style.height === 'auto';
        if(isOpen){
          // abrir
          const target = content.scrollHeight;
          content.classList.add('open');
          if(currentAuto) content.style.height = target+'px';
          // garantir início
          requestAnimationFrame(()=>{
            content.style.height = target+'px';
            const onEnd = ()=>{ content.removeEventListener('transitionend', onEnd); content.style.height='auto'; };
            content.addEventListener('transitionend', onEnd);
          });
        } else {
          // fechar
          const from = currentAuto ? content.scrollHeight : parseFloat(content.style.height||'0');
          content.style.height = from+'px';
          // próximo frame para ativar transição a 0
          requestAnimationFrame(()=>{ content.classList.remove('open'); content.style.height='0px'; });
        }
      });

      // Ripple no clique do summary
      const summary = d.querySelector('summary');
      if(summary && !summary.dataset.rippleInited){
        summary.dataset.rippleInited = '1';
        summary.addEventListener('click', (ev)=>{
          const rect = summary.getBoundingClientRect();
          const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
          const maxDim = Math.max(rect.width, rect.height);
          const r = Math.sqrt(rect.width**2 + rect.height**2) * 1.2;
          const span = document.createElement('span');
          span.className = 'ripple';
          span.style.left = x + 'px'; span.style.top = y + 'px';
          span.style.setProperty('--r', r+'px');
          summary.appendChild(span);
          setTimeout(()=>{ span.remove(); }, 650);
        });
      }
    });
  }

  // Transições de página (carga inicial e PJAX)
  function pageEnter(main){ if(!main) return; main.classList.add('page-enter'); requestAnimationFrame(()=>{ main.classList.add('page-enter-active'); main.addEventListener('transitionend', function done(ev){ if(ev.target!==main) return; main.classList.remove('page-enter','page-enter-active'); main.removeEventListener('transitionend', done); }); }); }
  function pageExit(main){ return new Promise(res=>{ if(!main) return res(); main.classList.add('page-exit'); requestAnimationFrame(()=>{ main.classList.add('page-exit-active'); const cleanup=()=>{ main.classList.remove('page-exit','page-exit-active'); main.removeEventListener('transitionend', cleanup); res(); }; main.addEventListener('transitionend', cleanup); setTimeout(cleanup, 380); }); }); }

  async function pjaxLoad(url, addToHistory=true){
  if(LUMARI_DEBUG) console.debug('[PJAX] navigating to', url);
    try{
      let timedOut = false;
      const to = setTimeout(()=>{ timedOut = true; if(LUMARI_DEBUG) console.warn('[PJAX] timeout → full nav', url); window.location.href=url; }, 2000);
      const res = await fetch(url, {cache:'no-store'});
      clearTimeout(to);
  if(!res.ok){ if(LUMARI_DEBUG) console.warn('[PJAX] fetch not OK → full nav', url); window.location.href=url; return; }
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text,'text/html');
      const newMain = doc.querySelector('main.container');
  if(!newMain){ if(LUMARI_DEBUG) console.warn('[PJAX] no <main> → full nav', url); window.location.href=url; return; }
      const curMain = document.querySelector('main.container');
      await pageExit(curMain);
      if(curMain) curMain.innerHTML = newMain.innerHTML;
      // Executar scripts encontrados no main recebido (garantir que scripts inline e src sejam executados)
      try{
        const scripts = Array.from(doc.querySelectorAll('main.container script'));
        scripts.forEach(s=>{
          const sc = document.createElement('script');
          if(s.src){
            try{ sc.src = normalizeHref(s.getAttribute('src') || s.src); }catch(e){ sc.src = new URL(s.src, url).toString(); }
            sc.async = false;
          }
          sc.text = s.textContent || '';
          document.body.appendChild(sc);
          // limpar para não acumular
          setTimeout(()=>{ try{ sc.remove(); }catch(e){} }, 0);
        });
      }catch(e){ if(LUMARI_DEBUG) console.warn('[PJAX] scripts exec failed', e); }
  if(doc.title) document.title = doc.title;
  if(addToHistory) history.pushState({url}, '', url);
  initPage();
      enhanceAccordions(document);
      addClickSounds(); // Re-adicionar sons de click após navegação PJAX
      window.scrollTo({top:0,behavior:'instant'});
      pageEnter(curMain);
  if(LUMARI_DEBUG) console.debug('[PJAX] main replaced →', url);
    }catch(e){ console.error('[PJAX] load failed → full nav', e); window.location.href=url; }
  }

  // Expor navegação global para uso em páginas (login/signup) mantendo PJAX/áudio
  try{
    window.lumariNavigate = function(url){
      try{
        const normalized = normalizeHref(url);
        pjaxLoad(normalized, true);
      }catch(e){
        // fallback para navegação completa se algo falhar
        window.location.href = url;
      }
    };
  }catch(e){}

  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a'); if(!a) return;
    const href = a.getAttribute('href'); if(!href) return;
    // Normalizar hrefs: usar BASE_PATH para construir URLs quando necessário
    function normalizeHref(h){
      if(!h) return h;
      // preservar esquemas especiais
      if(h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) return h;
      // preserva esquemas completos
      if(h.startsWith('http')) return h;
      // caminhos que começam com '/' — interpretá-los como relativos à raiz do repositório
      if(h.startsWith('/')){
        const trimmed = h.replace(/^\/+/, '');
        try{ const u = new URL(trimmed, BASE_PATH); u.pathname = u.pathname.replace(/\/pages\/+((pages\/)+)/g, '/pages/'); return u.toString(); }catch(e){ return trimmed; }
      }
      // se começa com 'pages/...' (relativo sem barra), resolver contra BASE_PATH (repo root)
      if(h.startsWith('pages/')){
        try{ const u = new URL(h, BASE_PATH); u.pathname = u.pathname.replace(/\/pages\/+((pages\/)+)/g, '/pages/'); return u.toString(); }catch(e){ return new URL(h, location.href).toString(); }
      }
      // caminhos relativos simples (relativos à página atual)
      try{ const rr = new URL(h, location.href); rr.pathname = rr.pathname.replace(/\/pages\/+(pages\/)+/g, '/pages/'); return rr.toString(); }catch(e){ return h; }
    }
    const normalized = normalizeHref(href);
  if(LUMARI_DEBUG) console.debug('[link] normalized', href, '→', normalized);
    // âncoras internas: abrir acordeão e rolar suave
    if(normalized.startsWith('#')){
      const id = href.slice(1);
      const target = document.getElementById(id);
      if(target){
        e.preventDefault();
        // se for uma seção com <details>, abre
        const det = target.querySelector('details') || target.closest('details');
        if(det && !det.open){ det.open = true; }
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
      return;
    }
    if(normalized.startsWith('mailto:') || normalized.startsWith('tel:')) return;
    if(a.target === '_blank') return;
    if(normalized.endsWith('.html') || normalized === '' || normalized === './' || normalized === '../index.html'){
      e.preventDefault(); pjaxLoad(normalized, true);
    }
  });
  
  window.addEventListener('popstate', (e)=>{ if(e.state?.url){ if(LUMARI_DEBUG) console.debug('[PJAX] popstate →', e.state.url); pjaxLoad(e.state.url, false); } });

  // Conteúdo dinâmico da página
  function initPage(){
    const el = document.getElementById('year'); if(el) el.textContent = new Date().getFullYear();
    document.querySelectorAll('.access-card').forEach(card=>{ if(card.dataset.lumariInited) return; card.dataset.lumariInited='1'; card.setAttribute('tabindex','0'); card.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); card.click(); } }); });
    const nav = document.querySelector('.nav'); if(nav){ const links = Array.from(nav.querySelectorAll('a')); links.forEach((a,i)=>{ if(a.dataset.lumariNavInited) return; a.dataset.lumariNavInited='1'; a.setAttribute('tabindex','0'); a.setAttribute('role','menuitem'); a.addEventListener('keydown',(e)=>{ if(e.key==='ArrowRight'){ e.preventDefault(); links[(i+1)%links.length].focus(); } else if(e.key==='ArrowLeft'){ e.preventDefault(); links[(i-1+links.length)%links.length].focus(); } }); }); nav.setAttribute('role','menubar'); }

    // Novidades: mostrar selo se versão atual for maior que a última vista
    try{
  const CURRENT_VER = '0.0.9';
      const seen = localStorage.getItem('lumari_last_seen_version') || '0.0.0';
      const newer = compareSemver(CURRENT_VER, seen) > 0;
      const pill = document.getElementById('newsPill');
      if(pill){
        pill.hidden = !newer;
        if(newer){
          pill.classList.add('attention');
          // remover a animação após alguns segundos
          setTimeout(()=>{ pill.classList.remove('attention'); }, 4200);
        }
      }
      // Se estamos na página de updates, considerar visto
      if(location.pathname.endsWith('/pages/updates.html') || location.pathname.endsWith('pages/updates.html')){
        localStorage.setItem('lumari_last_seen_version', CURRENT_VER);
        if(pill) pill.hidden = true;
      }
    }catch(_){}
    // aplicar micro-interactions e tema após inicialização de conteúdo
    try{ enrichMicroInteractions(document); initTheme(); }catch(e){}
  }

  /* Theme management */
  function applyTheme(theme){
    try{
      document.body.classList.remove('theme-light');
      if(theme === 'light') document.body.classList.add('theme-light');
      localStorage.setItem(THEME_KEY, theme);
    }catch(e){}
  }
  function initTheme(){
    try{
      const saved = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      applyTheme(saved);
      // add small toggle to topbar
      const tb = document.querySelector('.topbar-inner');
      if(tb && !document.getElementById('themeToggleBtn')){
        const btn = document.createElement('button');
        btn.id = 'themeToggleBtn'; btn.className='theme-toggle micro-lift';
        btn.type = 'button'; btn.title = 'Alternar tema';
        btn.textContent = saved === 'light' ? '🌞 Claro' : '🌙 Escuro';
        btn.addEventListener('click', ()=>{ const next = document.body.classList.contains('theme-light') ? 'dark' : 'light'; applyTheme(next); btn.textContent = next === 'light' ? '🌞 Claro' : '🌙 Escuro'; });
        tb.appendChild(btn);
      }
    }catch(e){}
  }

  // exportar para uso externo/páginas
  try{ window.initTheme = initTheme; window.ensureTermsAcceptedOrShow = ensureTermsAcceptedOrShow; }catch(e){}

  /* Terms modal creation and control */
  function createTermsModal(){
    if(document.getElementById('termsModal')) return;
    const modal = document.createElement('div');
    modal.id = 'termsModal'; modal.className = 'modal-backdrop';
    const card = document.createElement('div'); card.className='modal-card';
    card.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">Termo de Uso – Acesso à Plataforma LÚMARI</div>
      </div>
      <div class="modal-body">
        <p>Bem-vindo(a) à LÚMARI! Nossa plataforma foi desenvolvida com base em pesquisa acadêmica e inovação tecnológica, unindo neuromarketing, inteligência artificial e ciência do comportamento para proporcionar uma experiência digital mais humana, personalizada e consciente.</p>
        <p>Antes de acessar o conteúdo, é importante que você leia e concorde com as condições abaixo:</p>
        <h4>1. Uso da Plataforma</h4>
        <p>O acesso é destinado a fins pessoais, acadêmicos ou profissionais, respeitando sempre os princípios de ética, segurança e responsabilidade digital. É proibido utilizar os recursos da plataforma para práticas ilegais, discriminatórias ou que comprometam a integridade de outros usuários.</p>
        <h4>2. Privacidade e Dados</h4>
        <p>Coletamos apenas informações necessárias para oferecer recomendações e relatórios personalizados. Seus dados serão tratados com confidencialidade, segurança e em conformidade com legislações de proteção de dados.</p>
        <h4>3. Conteúdo e Relatórios</h4>
        <p>As análises geradas pela plataforma são baseadas em métricas digitais e emocionais, servindo como apoio estratégico. A LÚMARI não se responsabiliza por interpretações incorretas ou usos indevidos dos relatórios.</p>
        <h4>4. Captação de Emoções (Uso de Câmera e Áudio)</h4>
        <p>Ao utilizar a plataforma, você pode optar por permitir a captação da câmera do dispositivo para análise de expressões faciais e do áudio/microfone para avaliação de tom de voz. Essas funcionalidades são utilizadas exclusivamente para aprimorar a análise emocional e personalizar sua experiência dentro da plataforma. O uso desses recursos é opcional e só será ativado mediante sua autorização explícita. Nenhum dado bruto de vídeo ou áudio será armazenado; apenas indicadores emocionais processados pela inteligência artificial serão utilizados.</p>
        <h4>5. Colaboração e Transparência</h4>
        <p>Reconhecemos o apoio de ferramentas como ChatGPT e Copilot, utilizadas em algumas etapas de desenvolvimento como suporte, mas reafirmamos que todo o conteúdo aqui disponível foi criado e validado pela equipe da LÚMARI.</p>
        <h4>6. Aceite</h4>
        <p>Ao continuar, você declara que compreendeu e aceita estes termos, incluindo o uso opcional de recursos de câmera e áudio para análises emocionais, comprometendo-se a utilizar a plataforma de forma consciente, ética e colaborativa.</p>
        <p style="margin-top:8px;color:var(--muted)">🔹 Se você concorda com os termos acima, clique em “Aceitar e Continuar” para acessar a LÚMARI.</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-decline" id="termsDecline">Não Aceito</button>
        <button class="btn btn-accept" id="termsAccept">Aceitar e Continuar</button>
      </div>
    `.trim();
    modal.appendChild(card);
    document.body.appendChild(modal);
    // adicionar classe para animação após append
    requestAnimationFrame(()=>{ modal.classList.add('show'); });

    // callback support: dispatch custom events on accept/decline
    document.getElementById('termsAccept').addEventListener('click', ()=>{ try{ localStorage.setItem(TERMS_KEY, 'true'); modal.classList.remove('show'); setTimeout(()=>modal.remove(), 320); document.dispatchEvent(new CustomEvent('lumari:termsAccepted')); }catch(e){} });
    document.getElementById('termsDecline').addEventListener('click', ()=>{ modal.classList.remove('show'); setTimeout(()=>{ modal.remove(); showDenyScreen(); }, 320); document.dispatchEvent(new CustomEvent('lumari:termsDeclined')); });
  }

  function showDenyScreen(){
    if(document.getElementById('denyScreen')) return;
    const s = document.createElement('div'); s.id='denyScreen'; s.className='deny-screen';
    s.innerHTML = `<div class="deny-card"><h2>Acesso Negado</h2><p>Você optou por não aceitar os Termos de Uso da LÚMARI. Sem essa autorização, infelizmente não será possível acessar a plataforma, já que o uso dos recursos e diretrizes descritas é essencial para o funcionamento do sistema e para garantir uma experiência segura e personalizada.</p><div style="display:flex;gap:10px;justify-content:center"><button class="btn btn-accept" id="backToTerms">Voltar aos Termos</button><button class="btn btn-decline" id="closeDeny">Encerrar</button></div></div>`;
    document.body.appendChild(s);
    document.getElementById('backToTerms').addEventListener('click', ()=>{ s.remove(); createTermsModal(); });
    document.getElementById('closeDeny').addEventListener('click', ()=>{
      try{ const closed = window.close(); // many browsers block this
        // if not closed, show fallback message
        setTimeout(()=>{
          if(!document.hidden){
            // mostrar aviso temporário
            const fb = document.createElement('div'); fb.className='close-fallback'; fb.textContent = 'Não foi possível fechar automaticamente. Você pode fechar esta aba manualmente.'; document.body.appendChild(fb);
            setTimeout(()=>{ try{ fb.remove(); }catch(e){} }, 5000);
          }
        }, 200);
      }catch(e){ // fallback: informar e remover
        const fb = document.createElement('div'); fb.className='close-fallback'; fb.textContent = 'Encerramento automático bloqueado. Feche a aba manualmente.'; document.body.appendChild(fb);
        setTimeout(()=>{ try{ fb.remove(); }catch(e){} }, 5000);
        s.remove();
      }
    });
  }

  function ensureTermsAcceptedOrShow(){
    try{
      const accepted = localStorage.getItem(TERMS_KEY) === 'true';
      if(!accepted){ createTermsModal(); return false; }
      return true;
    }catch(e){ createTermsModal(); return false; }
  }

  // Apply micro-lift class to common interactive elements for richer interactions
  function enrichMicroInteractions(root=document){
    try{
      const selectors = ['.access-card', '.changelog-btn', '.btn', '.mood-option', '.metric-card', '.nav a', '.auth-card'];
      selectors.forEach(sel=>{ Array.from((root.querySelectorAll(sel) || [])).forEach(el=>{ el.classList.add('micro-lift'); }); });
    }catch(e){}
  }


  // Semver simples: retorna 1 se a>b, -1 se a<b, 0 igual
  function compareSemver(a,b){
    const pa = String(a).split('.').map(n=>parseInt(n,10)||0);
    const pb = String(b).split('.').map(n=>parseInt(n,10)||0);
    for(let i=0;i<Math.max(pa.length,pb.length);i++){
      const x=pa[i]||0, y=pb[i]||0; if(x>y) return 1; if(x<y) return -1;
    }
    return 0;
  }

  // Criar elemento de áudio para cliques com resolução de caminhos robusta
  let clickAudio = document.getElementById('clickAudio');
  if(!clickAudio){
    try{
      clickAudio = document.createElement('audio');
      clickAudio.id = 'clickAudio';
      clickAudio.preload = 'auto';
      // Tentar múltiplos candidatos para suportar deploy em subpaths (GitHub Pages)
      const candidates = [
        BASE_PATH + '/sound/mouse-click.mp3',
        new URL('./sound/mouse-click.mp3', location.href).toString(),
        new URL('sound/mouse-click.mp3', location.href).toString(),
        new URL('../sound/mouse-click.mp3', location.href).toString()
      ];
      (async function pick(){
        for(const c of candidates){
          try{
            const res = await fetch(c, {method:'HEAD', cache:'no-store'});
            if(res && res.ok){
              const source = document.createElement('source');
              source.src = c;
              source.type = 'audio/mpeg';
              clickAudio.appendChild(source);
              clickAudio.load();
              if(LUMARI_DEBUG) console.debug('[LUMARI] clickAudio chosen:', c);
              break;
            }
          }catch(e){}
        }
        // fallback: append last candidate anyway
        if(clickAudio.querySelectorAll('source').length===0){
          const src = document.createElement('source');
          src.src = new URL('sound/mouse-click.mp3', location.href).toString();
          src.type = 'audio/mpeg';
          clickAudio.appendChild(src);
          clickAudio.load();
        }
      })();
      document.body.appendChild(clickAudio);
    }catch(e){ if(LUMARI_DEBUG) console.warn('[LUMARI] Failed to create click audio:', e); }
  }

  // Função para tocar som de click
  function playClickSound(){
    try{
      if(clickAudio && clickAudio.readyState >= 2){
        clickAudio.currentTime = 0;
        clickAudio.volume = 0.3;
        clickAudio.play().catch(e => {
          if(LUMARI_DEBUG) console.debug('[LUMARI] Click sound blocked:', e);
        });
      }
    }catch(e){
      if(LUMARI_DEBUG) console.warn('[LUMARI] Click sound error:', e);
    }
  }

  // Adicionar som de click em elementos interativos
  function addClickSounds(){
    // Links e botões principais
    document.querySelectorAll('.nav a, .brand-mini, .access-card, .changelog-btn, .btn, button, .mood-option').forEach(el => {
      if(el.dataset.clickInited) return; el.dataset.clickInited = '1';
      el.addEventListener('click', playClickSound);
    });

    // Botão de áudio
    if(toggle) toggle.addEventListener('click', playClickSound);

    // Accordeões (summary)
    document.querySelectorAll('summary').forEach(el => {
      if(el.dataset.clickInited) return; el.dataset.clickInited = '1';
      el.addEventListener('click', playClickSound);
    });

    // Links internos — incluir links relativos e .html
    document.querySelectorAll('.nav a, a[href$=".html"], a:not([href^="http"]):not([href^="#"])').forEach(el => {
      if(el.dataset.clickInited) return; el.dataset.clickInited = '1';
      el.addEventListener('click', playClickSound);
    });
  }

  // Start
  initPage();
  enhanceAccordions(document);
  const main = document.querySelector('main.container'); pageEnter(main);
  initAudio();
  tryPlayOnFirstGesture();
  addClickSounds(); // Adicionar sons de click
  window.addEventListener('load', ()=>{ attemptAutoplay(); });
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') attemptAutoplay(); });
});

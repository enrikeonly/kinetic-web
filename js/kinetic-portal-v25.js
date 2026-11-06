// === docs/js/kinetic-portal-v25.js === //
// Controlador Reactivo Tri-Modo (Dark/Light + ES/EN) + Simuladores 3D + Candado Pre-Lanzamiento + Pre-Registro Waitlist + Concierge IA

(function () {
  const CFG = window.KINETIC_PORTAL_CONFIG || {};
  const I18N = window.KINETIC_I18N_V25 || {};
  const DISCIPLINES = window.KINETIC_231_DISCIPLINES || [];
  const DEMO_VENUES = window.KINETIC_DEMO_VENUES || [];
  const MEMBERSHIPS = window.KINETIC_MEMBERSHIPS_DATA || [];
  const LEGAL_DOCS = window.KINETIC_LEGAL_DOCS_V25 || {};
  const ENABLE_DIRECT_APK_DOWNLOAD = Boolean(CFG.enableDirectApkDownload);

  const STUDIO_PRESETS = {
    reformer: { code: 'RF', priceKc: 280, es: 'Cama Reformer', en: 'Reformer Bed', coachEs: 'INSTRUCTOR PILATES REFORMER', coachEn: 'REFORMER PILATES INSTRUCTOR' },
    cycling: { code: 'BK', priceKc: 240, es: 'Bici Spinning', en: 'Spin Bike', coachEs: 'PODIUM RHYTHM CYCLING', coachEn: 'RHYTHM CYCLING PODIUM' },
    barre: { code: 'BR', priceKc: 250, es: 'Estación Barre', en: 'Barre Station', coachEs: 'ESPEJO PRINCIPAL BARRE', coachEn: 'FRONT BARRE MIRROR' },
    boxing: { code: 'BX', priceKc: 220, es: 'Saco de Boxeo', en: 'Heavy Bag', coachEs: 'RING / TARIMA DE COMBATE', coachEn: 'COMBAT RING / STAGE' },
    mats: { code: 'MT', priceKc: 200, es: 'Mat / Estación', en: 'Mat / Station', coachEs: 'ZONA DEL INSTRUCTOR', coachEn: 'INSTRUCTOR STAGE' },
    courts: { code: 'CT', priceKc: 400, es: 'Cancha Oficial', en: 'Pro Court', coachEs: 'PASILLO CENTRAL PANORÁMICO', coachEn: 'CENTRAL COURT VIEWING ZONE' },
  };

  const CHEST_TIERS = [
    { key: 't1', es: 'Nivel I • Común Cian (+25 XP)', en: 'Tier I • Common Cyan (+25 XP)', color: '#00F0FF', rewardEs: '⚡ +25 XP DE RACHA DIARIA ACREDITADOS', rewardEn: '⚡ +25 DAILY STREAK XP CREDITED' },
    { key: 't2', es: 'Nivel II • Raro Verde (+5 KC + 35 XP)', en: 'Tier II • Rare Green (+5 KC + 35 XP)', color: '#00FF66', rewardEs: '💚 +5 KC ROLLOVER + 35 XP EN TU BÓVEDA', rewardEn: '💚 +5 ROLLOVER KC + 35 XP IN YOUR VAULT' },
    { key: 't3', es: 'Nivel III • Épico Púrpura (+10 KC + 50 XP)', en: 'Tier III • Epic Purple (+10 KC + 50 XP)', color: '#9D4EDD', rewardEs: '💜 +10 KC ROLLOVER + 50 XP EN TU BÓVEDA', rewardEn: '💜 +10 ROLLOVER KC + 50 XP IN YOUR VAULT' },
    { key: 't4', es: 'Nivel IV • Legendario Ámbar (+15 KC + 75 XP)', en: 'Tier IV • Legendary Amber (+15 KC + 75 XP)', color: '#FFB800', rewardEs: '👑 +15 KC ROLLOVER + 75 XP LEGENDARIOS', rewardEn: '👑 +15 ROLLOVER KC + 75 XP UNLOCKED' },
  ];

  const state = {
    lang: localStorage.getItem('kinetic_web_lang_v25') === 'en' ? 'en' : 'es',
    theme: localStorage.getItem('kinetic_web_theme_v25') === 'light' ? 'light' : 'dark',
    heroSimTab: 'explore',
    qrSeconds: 60,
    discQuery: '',
    discDiv: 'all',
    discSort: 'featured',
    showFilterDrawer: true,
    showSortDrawer: false,
    discExpandedAll: false,
    selectedDiscId: null,
    venueCat: 'all',
    studioEquip: 'reformer',
    studioCap: 32,
    selectedSpot: 7,
    chestTierIdx: 3,
    chestOpen: false,
    regMode: 'b2c',
    aiOpen: false,
    deepLinkData: null,
  };

  function t(key) {
    const dict = I18N[state.lang] || I18N.es || {};
    return dict[key] !== undefined ? dict[key] : ((I18N.es && I18N.es[key]) || key);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBoldMarkdown(str) {
    return escapeHtml(str)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function iconGlyph(icon) {
    if (icon === 'snowflake') return '❄️';
    if (icon === 'heart') return '🩺';
    if (icon === 'flame') return '🔥';
    if (icon === 'sun') return '🧘';
    if (icon === 'zap') return '⚡';
    if (icon === 'sparkles') return '✨';
    if (icon === 'waves') return '🌊';
    if (icon === 'target') return '🎾';
    return '🏋️';
  }

  function scrollToSimulator(targetTab) {
    if (targetTab && ['explore', 'studio', 'club', 'vault'].indexOf(targetTab) !== -1) {
      state.heroSimTab = targetTab;
      renderHeroSimulator();
    }
    const simCard = document.getElementById('heroSimulatorCard') || document.getElementById('inicio-hero');
    if (simCard && typeof simCard.scrollIntoView === 'function') {
      simCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function scrollToWaitlist() {
    var wl = document.getElementById('waitlist');
    if (wl && typeof wl.scrollIntoView === 'function') wl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ==========================================================================
  // 1. APLICACIÓN DE TEMA Y LENGUAJE REACTIVO SIN RECARGAR
  // ==========================================================================
  function applyTheme(nextTheme) {
    state.theme = nextTheme === 'light' ? 'light' : 'dark';
    try { localStorage.setItem('kinetic_web_theme_v25', state.theme); } catch (_) {}
    document.documentElement.setAttribute('data-theme', state.theme);

    const isLight = state.theme === 'light';
    document.querySelectorAll('[data-theme-label]').forEach(function (el) {
      el.textContent = isLight ? '☀️ ' + t('themeLightLabel') : '🌙 ' + t('themeDarkLabel');
    });
  }

  function syncRegistrationModalCopy() {
    const isB2B = state.regMode === 'b2b';
    const b2cBtn = document.getElementById('regTabBtn_b2c');
    const b2bBtn = document.getElementById('regTabBtn_b2b');
    const nameLabel = document.getElementById('regNameLabelEl');
    const nameInput = document.getElementById('regName');
    const submitBtn = document.getElementById('regSubmitBtn');

    if (b2cBtn) b2cBtn.className = !isB2B ? 'knt-chip-3d active-cyan flex-1 justify-center' : 'knt-chip-3d flex-1 justify-center';
    if (b2bBtn) b2bBtn.className = isB2B ? 'knt-chip-3d active-purple flex-1 justify-center' : 'knt-chip-3d flex-1 justify-center';
    if (nameLabel) nameLabel.textContent = isB2B ? t('regNameLabelB2B') : t('regNameLabelB2C');
    if (nameInput) nameInput.setAttribute('placeholder', isB2B ? t('regNamePlaceholderB2B') : t('regNamePlaceholderB2C'));
    if (submitBtn && !submitBtn.disabled) {
      submitBtn.textContent = isB2B ? t('regSubmitBtnB2B') : t('regSubmitBtnB2C');
    }
  }

  function applyLanguage(nextLang) {
    state.lang = nextLang === 'en' ? 'en' : 'es';
    try { localStorage.setItem('kinetic_web_lang_v25', state.lang); } catch (_) {}
    document.documentElement.setAttribute('lang', state.lang);
    document.title = t('pageTitle');

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      const code = btn.getAttribute('data-lang-btn');
      if (code === state.lang) {
        btn.classList.add('active-cyan');
      } else {
        btn.classList.remove('active-cyan');
      }
    });

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const k = el.getAttribute('data-i18n');
      el.textContent = t(k);
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const k = el.getAttribute('data-i18n-html');
      el.innerHTML = t(k);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const k = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(k));
    });

    applyTheme(state.theme);
    syncRegistrationModalCopy();
    renderHeroSimulator();
    renderDisciplinesExplorer();
    renderVenuesExplorer();
    renderStudio3DSimulator();
    renderMemberships();
    renderChestSimulator();
    renderB2BDisciplineOptions();
    renderConciergeQuickChips();
    renderDeepLinkUI();
  }

  // ==========================================================================
  // 2. SIMULADOR EN VIVO DEL HERO (4 TABS • LLAVE QR DINÁMICA)
  // ==========================================================================
  function renderHeroSimulator() {
    const body = document.getElementById('heroSimViewport');
    if (!body) return;
    const isEn = state.lang === 'en';

    ['explore', 'studio', 'club', 'vault'].forEach(function (tab) {
      const btn = document.getElementById('heroSimBtn_' + tab);
      if (!btn) return;
      if (tab === state.heroSimTab) {
        btn.className = 'knt-chip-3d active-cyan flex-1 justify-center text-[10px] py-2';
      } else {
        btn.className = 'knt-chip-3d flex-1 justify-center text-[10px] py-2';
      }
    });

    if (state.heroSimTab === 'explore') {
      body.innerHTML =
        '<div class="space-y-3">' +
        '  <div class="rounded-2xl overflow-hidden border border-cyan-400/40" style="background:var(--knt-surface)">' +
        '    <div class="relative h-36">' +
        '      <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80" alt="Sede Oficial Kinetic" class="w-full h-full object-cover" />' +
        '      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>' +
        '      <span class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 border border-[#00F0FF] text-[10px] font-black text-[#00F0FF]">● ' + (isEn ? 'STRENGTH & CONDITIONING' : 'FUERZA & RENDIMIENTO') + '</span>' +
        '      <span class="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-[#00FF66] text-[#050505] text-[10px] font-black">★ 5.0</span>' +
        '      <div class="absolute bottom-2.5 left-3 right-3 text-white">' +
        '        <div class="font-bold text-sm">' + (isEn ? 'Official Kinetic Venue • High Performance' : 'Sede Oficial Kinetic • Alto Rendimiento') + '</div>' +
        '        <div class="text-[11px] text-slate-200">06:00 – 22:00 • ' + (isEn ? '40% Hold / 60% QR Key' : '40% Apartado / 60% Llave QR') + '</div>' +
        '      </div>' +
        '    </div>' +
        '    <div class="p-3 flex items-center justify-between gap-2">' +
        '      <div class="text-[11px]">' +
        '        <span class="font-black" style="color:var(--knt-cyan-ink)">100 KC (40%)</span> · ' +
        '        <span class="font-bold" style="color:var(--knt-green-ink)">150 KC (60% QR)</span>' +
        '      </div>' +
        '      <button type="button" onclick="window.kineticPortal.setHeroTab(\'studio\')" class="knt-btn-3d knt-btn-cyan px-3 py-1.5 text-[10px]">' +
        (isEn ? 'PICK 3D SPOT ›' : 'ELEGIR LUGAR 3D ›') +
        '      </button>' +
        '    </div>' +
        '  </div>' +
        '  <div class="grid grid-cols-2 gap-2.5">' +
        '    <div class="p-3 rounded-xl border border-cyan-400/35" style="background:var(--knt-surface)">' +
        '      <div class="text-[9.5px] font-black uppercase" style="color:var(--knt-muted)">' + (isEn ? 'VIP WALLET (30D)' : 'BILLETERA VIP (30D)') + '</div>' +
        '      <div class="text-base font-black mt-0.5" style="color:var(--knt-cyan-ink)">2,500 KC</div>' +
        '      <div class="text-[10px]" style="color:var(--knt-muted)">Gold • -15% Flash</div>' +
        '    </div>' +
        '    <div class="p-3 rounded-xl border border-purple-500/40" style="background:var(--knt-surface)">' +
        '      <div class="text-[9.5px] font-black uppercase" style="color:var(--knt-muted)">TOP-UP ROLLOVER</div>' +
        '      <div class="text-base font-black mt-0.5" style="color:var(--knt-purple-ink)">+650 KC</div>' +
        '      <div class="text-[10px]" style="color:var(--knt-muted)">' + (isEn ? 'Never expires' : 'Jamás caduca') + '</div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    } else if (state.heroSimTab === 'studio') {
      body.innerHTML =
        '<div class="space-y-2.5">' +
        '  <div class="knt-stage-bar py-2 px-3 text-center text-[10px] font-black tracking-widest">' + (isEn ? 'INSTRUCTOR STAGE & MIRROR' : 'ZONA DEL INSTRUCTOR Y ESPEJO') + '</div>' +
        '  <div class="grid grid-cols-4 gap-1.5">' +
        [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) {
          const occ = n === 2 || n === 5;
          const sel = n === 3;
          const cls = sel ? 'knt-spot-btn knt-spot-selected' : occ ? 'knt-spot-btn knt-spot-occupied' : 'knt-spot-btn knt-spot-free';
          return '<div class="' + cls + '">RF-' + String(n).padStart(2, '0') + '<div class="text-[9px]">' + (sel ? (isEn ? '★ YOU' : '★ TÚ') : occ ? '🔒' : (isEn ? 'FREE' : 'LIBRE')) + '</div></div>';
        }).join('') +
        '  </div>' +
        '  <div class="p-3 rounded-xl border border-cyan-400/35 flex items-center justify-between" style="background:var(--knt-surface)">' +
        '    <div class="text-[11px] font-bold">' + (isEn ? 'Spot RF-03 • 100% Anonymous' : 'Estación RF-03 • 100% Anónima') + '</div>' +
        '    <a href="#sala-3d" class="knt-btn-3d knt-btn-cyan px-3 py-1.5 text-[10px] no-underline">' + (isEn ? '50 SPOTS ›' : '50 LUGARES ›') + '</a>' +
        '  </div>' +
        '</div>';
    } else if (state.heroSimTab === 'club') {
      body.innerHTML =
        '<div class="space-y-2.5">' +
        '  <div class="p-3 rounded-2xl border border-purple-500/45" style="background:var(--knt-surface)">' +
        '    <div class="flex items-center justify-between mb-2">' +
        '      <span class="text-[10px] font-black" style="color:var(--knt-purple-ink)">' + (isEn ? 'PRESTIGE IV • LEVEL 68/99' : 'PRESTIGIO IV • NIVEL 68/99') + '</span>' +
        '      <span class="px-2 py-0.5 rounded bg-[#FFB800] text-[#050505] text-[9.5px] font-black">250 🏆</span>' +
        '    </div>' +
        '    <div class="grid grid-cols-2 gap-2 text-[10.5px] font-bold">' +
        '      <div>🏋️ ' + (isEn ? 'Strength' : 'Fuerza') + ': <strong style="color:var(--knt-green-ink)">94/99</strong></div>' +
        '      <div>🧘 Zen: <strong style="color:var(--knt-purple-ink)">91/99</strong></div>' +
        '      <div>🏃 ' + (isEn ? 'Endurance' : 'Resistencia') + ': <strong style="color:var(--knt-cyan-ink)">89/99</strong></div>' +
        '      <div>⚡ ' + (isEn ? 'Agility' : 'Agilidad') + ': <strong style="color:var(--knt-amber-ink)">95/99</strong></div>' +
        '    </div>' +
        '  </div>' +
        '  <div class="p-3 rounded-xl border border-cyan-400/35 flex items-center justify-between" style="background:var(--knt-surface)">' +
        '    <span class="text-[11px] font-bold">🎁 ' + (isEn ? '3D Chests + 24h Stories + Squads' : 'Cofres 3D + Historias 24h + Squads') + '</span>' +
        '    <button type="button" onclick="window.kineticPortal.setHeroTab(\'vault\')" class="knt-btn-3d knt-btn-purple px-2.5 py-1.5 text-[10px]">QR 60s ›</button>' +
        '  </div>' +
        '</div>';
    } else {
      body.innerHTML =
        '<div class="p-3.5 rounded-2xl border border-cyan-400/45 text-center" style="background:var(--knt-surface)">' +
        '  <div class="text-[10px] font-black uppercase mb-1" style="color:var(--knt-green-ink)">● ' + (isEn ? 'DYNAMIC OPTICAL KEY ACTIVE' : 'LLAVE ÓPTICA DINÁMICA ACTIVA') + '</div>' +
        '  <div class="w-28 h-28 mx-auto my-2 rounded-2xl bg-[#040508] border-2 border-[#00F0FF] flex flex-col items-center justify-center relative overflow-hidden text-white">' +
        '    <div class="knt-laser-line"></div>' +
        '    <div class="text-base font-mono font-black tracking-wider text-[#00F0FF]">' + (isEn ? 'QR KEY' : 'LLAVE QR') + '</div>' +
        '    <div data-qr-timer class="text-xs font-black text-[#00FF66] mt-1">' + state.qrSeconds + 's</div>' +
        '  </div>' +
        '  <div class="text-[11px] font-bold">' + (isEn ? 'Renews every 60s • Covers 60% at Reception' : 'Se renueva cada 60s • Cubre el 60% en Recepción') + '</div>' +
        '</div>';
    }
  }

  // ==========================================================================
  // 3. CATÁLOGO DE 231 DISCIPLINAS (TARJETAS SOLO LECTURA CON FICHA INLINE)
  // ==========================================================================
  function buildDisciplineSummary(d, isEn) {
    const isWell = d.div === 'wellness';
    if (isWell) {
      return isEn
        ? 'Official Wellness & Clinical Recovery discipline in the KINETIC catalog. Sessions include appointment or cabin selection, 40% Escrow reservation protection, 60-second Dynamic Optical QR Key check-in at reception, and Zen / Prestige progress in KinetiClub.'
        : 'Disciplina oficial del universo Wellness, Recuperación y Spa dentro del catálogo KINETIC. Permite elegir horario o cabina disponible, asegurar tu cita con el 40% de apartado, validar tu llegada con Llave Óptica Dinámica QR de 60 segundos y sumar progreso Zen en KinetiClub.';
    }
    return isEn
      ? 'Official Fitness & Sports discipline in the KINETIC catalog. Includes exact 3D station or court selection (up to 50 spots), 40% Escrow reservation hold, 60-second Dynamic Optical QR Key check-in at reception, and verified athletic XP in KinetiClub.'
      : 'Disciplina oficial del universo Fitness y Deporte dentro del catálogo KINETIC. Permite elegir tu lugar, estación o cancha exacta antes de llegar, apartar con el 40%, validar tu acceso con Llave Óptica Dinámica QR de 60 segundos y ganar experiencia deportiva en KinetiClub.';
  }

  function renderDisciplineReadOnlyPanel() {
    const panel = document.getElementById('disciplineReadOnlyPanel');
    if (!panel) return;
    if (!state.selectedDiscId) {
      panel.classList.add('hidden');
      panel.innerHTML = '';
      return;
    }

    const found = DISCIPLINES.find(function (x) { return Number(x.id) === Number(state.selectedDiscId); });
    if (!found) {
      panel.classList.add('hidden');
      panel.innerHTML = '';
      return;
    }

    const isEn = state.lang === 'en';
    const isWell = found.div === 'wellness';
    const cardCls = isWell ? 'knt-card-3d-purple' : 'knt-card-3d-cyan';
    const medCls = isWell ? 'knt-medallion-26 knt-medallion-purple' : 'knt-medallion-26 knt-medallion-cyan';
    const divLabel = isWell
      ? 'WELLNESS & SPA'
      : (isEn ? 'FITNESS & SPORTS' : 'FITNESS & DEPORTE');
    const title = isEn ? found.en : found.es;
    const altTitle = isEn ? found.es : found.en;
    const summaryText = buildDisciplineSummary(found, isEn);

    panel.classList.remove('hidden');
    panel.innerHTML =
      '<div class="' + cardCls + ' p-4 sm:p-5">' +
      '  <div class="flex flex-wrap items-start justify-between gap-3">' +
      '    <div class="flex items-center gap-3">' +
      '      <span class="' + medCls + '" style="width:38px;height:38px;font-size:17px">' + iconGlyph(found.icon) + '</span>' +
      '      <div>' +
      '        <div class="text-[10px] font-black uppercase tracking-wider" style="color:var(--knt-cyan-ink)">' +
      escapeHtml(found.code) + ' • ' + escapeHtml(divLabel) + ' • ' + (isEn ? 'READ-ONLY OVERVIEW' : 'FICHA INFORMATIVA') +
      '        </div>' +
      '        <h4 class="font-display text-lg sm:text-xl font-extrabold">' + escapeHtml(title) + '</h4>' +
      '        <div class="text-[11px] font-bold" style="color:var(--knt-muted)">' + (isEn ? 'ES: ' : 'EN: ') + escapeHtml(altTitle) + '</div>' +
      '      </div>' +
      '    </div>' +
      '    <div class="flex items-center gap-2">' +
      '      <button type="button" onclick="window.kineticPortal.scrollToSimulator(\'studio\')" class="knt-btn-3d knt-btn-cyan px-3.5 py-2 text-[10.5px] uppercase">' +
      (isEn ? '🧪 VIEW IN SIMULATOR ›' : '🧪 VER EN SIMULADOR ›') +
      '      </button>' +
      '      <button type="button" onclick="window.kineticPortal.closeDisciplinePanel()" class="knt-chip-3d px-2.5 py-1.5 text-[10.5px]">✕</button>' +
      '    </div>' +
      '  </div>' +
      '  <p class="text-xs sm:text-sm leading-relaxed mt-3" style="color:var(--knt-text-sec)">' + escapeHtml(summaryText) + '</p>' +
      '</div>';
  }

  function renderDisciplinesExplorer() {
    const grid = document.getElementById('disciplinesGrid');
    const countLabel = document.getElementById('disciplinesCountBadge');
    const toggleBtn = document.getElementById('toggleAll231Btn');
    const filterDrawer = document.getElementById('discFilterDrawer');
    const sortDrawer = document.getElementById('discSortDrawer');
    if (!grid) return;

    if (filterDrawer) filterDrawer.style.display = state.showFilterDrawer ? 'flex' : 'none';
    if (sortDrawer) sortDrawer.style.display = state.showSortDrawer ? 'flex' : 'none';

    ['all', 'fitness', 'wellness'].forEach(function (d) {
      const chip = document.getElementById('discChip_' + d);
      if (!chip) return;
      chip.className = d === state.discDiv
        ? 'knt-chip-3d ' + (d === 'wellness' ? 'active-purple' : 'active-cyan')
        : 'knt-chip-3d';
    });

    ['featured', 'az', 'za'].forEach(function (srt) {
      const chip = document.getElementById('sortChip_' + srt);
      if (!chip) return;
      chip.className = srt === state.discSort ? 'knt-chip-3d active-purple' : 'knt-chip-3d';
    });

    const q = state.discQuery.trim().toLowerCase();
    const isEn = state.lang === 'en';

    const filtered = DISCIPLINES.filter(function (item) {
      if (state.discDiv !== 'all' && item.div !== state.discDiv) return false;
      if (!q) return true;
      return item.es.toLowerCase().includes(q) || item.en.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
    });

    const sorted = filtered.slice().sort(function (a, b) {
      const nameA = isEn ? a.en : a.es;
      const nameB = isEn ? b.en : b.es;
      if (state.discSort === 'az') return nameA.localeCompare(nameB, state.lang);
      if (state.discSort === 'za') return nameB.localeCompare(nameA, state.lang);
      if (b.featured !== a.featured) return b.featured - a.featured;
      return nameA.localeCompare(nameB, state.lang);
    });

    const showAllNow = state.discExpandedAll || q.length > 0;
    const visibleItems = showAllNow ? sorted : sorted.slice(0, 30);

    if (countLabel) {
      countLabel.textContent = isEn
        ? 'Showing ' + visibleItems.length + ' of ' + sorted.length + ' disciplines'
        : 'Mostrando ' + visibleItems.length + ' de ' + sorted.length + ' disciplinas';
    }

    if (toggleBtn) {
      if (q.length > 0 || sorted.length <= 30) {
        toggleBtn.style.display = 'none';
      } else {
        toggleBtn.style.display = 'inline-flex';
        toggleBtn.textContent = state.discExpandedAll ? t('showCompactBtn') : t('showAll231Btn');
      }
    }

    renderDisciplineReadOnlyPanel();

    grid.innerHTML = visibleItems.map(function (d) {
      const isWell = d.div === 'wellness';
      const medCls = isWell ? 'knt-medallion-26 knt-medallion-purple' : 'knt-medallion-26 knt-medallion-cyan';
      const label = isEn ? d.en : d.es;
      const tag = isWell
        ? 'WELLNESS & SPA'
        : (isEn ? 'FITNESS & SPORTS' : 'FITNESS & DEPORTE');
      const tagColor = isWell ? 'var(--knt-purple-ink)' : 'var(--knt-cyan-ink)';
      const activeCls = Number(state.selectedDiscId) === Number(d.id) ? ' knt-disc-card-active' : '';
      return (
        '<button type="button" onclick="window.kineticPortal.selectDisciplineCard(' + Number(d.id) + ')" class="knt-card-3d' + activeCls + ' p-2.5 flex items-center gap-2.5 hover:scale-[1.01] text-left cursor-pointer w-full">' +
        '  <span class="' + medCls + '">' + iconGlyph(d.icon) + '</span>' +
        '  <span class="min-w-0 flex-1 text-left">' +
        '    <span class="block text-xs font-extrabold truncate" style="color:var(--knt-text)">' + escapeHtml(label) + '</span>' +
        '    <span class="block text-[9px] font-black tracking-wider uppercase" style="color:' + tagColor + '">' + escapeHtml(d.code) + ' • ' + tag + '</span>' +
        '  </span>' +
        '</button>'
      );
    }).join('');
  }

  // ==========================================================================
  // 4. SEDES Y ESPECIALISTAS DESTACADOS (4 EJEMPLOS DEMO ANÓNIMOS)
  // ==========================================================================
  function renderVenuesExplorer() {
    const grid = document.getElementById('venuesGrid');
    if (!grid) return;
    const isEn = state.lang === 'en';

    ['all', 'clubes', 'boutique', 'wellness'].forEach(function (c) {
      const chip = document.getElementById('catChip_' + c);
      if (!chip) return;
      chip.className = c === state.venueCat ? 'knt-chip-3d active-cyan' : 'knt-chip-3d';
    });

    const filtered = DEMO_VENUES.filter(function (v) {
      if (state.venueCat === 'all') return true;
      return v.cat === state.venueCat;
    });

    grid.innerHTML = filtered.map(function (v) {
      const cardCls = v.esEspecialista ? 'knt-card-3d-purple' : 'knt-card-3d-cyan';
      const badgeTxt = isEn ? v.badgeEn : v.badgeEs;
      const venueName = isEn ? v.nombreEn : v.nombreEs;
      const discLabel = isEn ? v.discEn : v.discEs;
      const zoneLabel = isEn ? v.ubicacionEn : v.ubicacionEs;
      const hoursLabel = isEn ? v.horariosEn : v.horariosEs;
      const bio = isEn ? v.bioEn : v.bioEs;

      return (
        '<article class="' + cardCls + ' overflow-hidden flex flex-col justify-between">' +
        '  <div>' +
        '    <div class="relative h-44">' +
        '      <img src="' + escapeHtml(v.portada) + '" alt="' + escapeHtml(venueName) + '" loading="lazy" class="w-full h-full object-cover" />' +
        '      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>' +
        '      <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 border border-white/25 text-[9.5px] font-black text-[#00F0FF] uppercase">' + escapeHtml(badgeTxt) + '</span>' +
        '      <span class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#FFB800] text-[#050505] text-[10px] font-black">★ ' + Number(v.rating).toFixed(1) + '</span>' +
        '      <div class="absolute bottom-3 left-3 right-3 text-white">' +
        '        <h4 class="font-display text-base font-extrabold leading-tight">' + escapeHtml(venueName) + '</h4>' +
        '        <p class="text-[11px] text-cyan-200 font-bold mt-0.5">' + escapeHtml(discLabel) + ' • ' + escapeHtml(zoneLabel) + '</p>' +
        '      </div>' +
        '    </div>' +
        '    <div class="p-4 space-y-2.5">' +
        '      <p class="text-xs leading-relaxed" style="color:var(--knt-text-sec)">' + escapeHtml(bio) + '</p>' +
        '      <div class="text-[11px] font-extrabold flex items-center gap-1.5" style="color:var(--knt-cyan-ink)">🕒 ' + escapeHtml(hoursLabel) + '</div>' +
        '    </div>' +
        '  </div>' +
        '  <div class="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">' +
        '    <button type="button" onclick="window.kineticPortal.scrollToSimulator(\'explore\')" class="knt-btn-3d knt-btn-ghost-cyan py-2.5 px-3 text-[10.5px] text-center uppercase">' + t('demoExploreSimBtn') + '</button>' +
        '    <button type="button" onclick="window.kineticPortal.scrollToSimulator(\'studio\')" class="knt-btn-3d knt-btn-cyan py-2.5 px-3 text-[10.5px] text-center uppercase">' + t('demoSpotSimBtn') + '</button>' +
        '  </div>' +
        '</article>'
      );
    }).join('');
  }

  // ==========================================================================
  // 5. MAPA 3D DE SALA TIPO CINE (HASTA 50 ESTACIONES + PRIVACIDAD ANÓNIMA)
  // ==========================================================================
  function isSpotAnonymouslyOccupied(spotNum, equipKey) {
    const seed = equipKey.charCodeAt(0) + spotNum * 7;
    return seed % 3 === 0 && spotNum !== 1 && spotNum !== 7;
  }

  function renderStudio3DSimulator() {
    const grid = document.getElementById('studioSpotsGrid');
    const summary = document.getElementById('studioSelectionSummary');
    const stageSub = document.getElementById('studioStageSub');
    if (!grid || !summary) return;

    const isEn = state.lang === 'en';
    const preset = STUDIO_PRESETS[state.studioEquip] || STUDIO_PRESETS.reformer;

    Object.keys(STUDIO_PRESETS).forEach(function (k) {
      const btn = document.getElementById('equipBtn_' + k);
      if (btn) btn.className = k === state.studioEquip ? 'knt-chip-3d active-cyan' : 'knt-chip-3d';
    });

    [16, 32, 50].forEach(function (cap) {
      const btn = document.getElementById('capBtn_' + cap);
      if (btn) btn.className = cap === state.studioCap ? 'knt-chip-3d active-purple' : 'knt-chip-3d';
    });

    if (state.selectedSpot > state.studioCap || isSpotAnonymouslyOccupied(state.selectedSpot, state.studioEquip)) {
      for (let s = 1; s <= state.studioCap; s++) {
        if (!isSpotAnonymouslyOccupied(s, state.studioEquip)) {
          state.selectedSpot = s;
          break;
        }
      }
    }

    if (stageSub) {
      stageSub.textContent = (isEn ? preset.coachEn : preset.coachEs) + ' • ' + state.studioCap + (isEn ? ' STATIONS' : ' ESTACIONES');
    }

    const colsClass = state.studioCap === 50 ? 'grid-cols-5 sm:grid-cols-10' : state.studioCap === 32 ? 'grid-cols-4 sm:grid-cols-8' : 'grid-cols-4';
    grid.className = 'grid gap-2 ' + colsClass;

    let spotsHtml = '';
    for (let i = 1; i <= state.studioCap; i++) {
      const occ = isSpotAnonymouslyOccupied(i, state.studioEquip);
      const sel = i === state.selectedSpot;
      const code = preset.code + '-' + String(i).padStart(2, '0');
      const cls = sel ? 'knt-spot-btn knt-spot-selected' : occ ? 'knt-spot-btn knt-spot-occupied' : 'knt-spot-btn knt-spot-free';
      const statusTxt = sel ? (isEn ? '★ YOURS' : '★ TU LUGAR') : occ ? '🔒 ANON' : (isEn ? 'FREE' : 'LIBRE');
      const clickAttr = occ ? 'disabled' : 'onclick="window.kineticPortal.selectStudioSpot(' + i + ')"';
      spotsHtml +=
        '<button type="button" ' + clickAttr + ' class="' + cls + '">' +
        '  <div>' + code + '</div>' +
        '  <div class="text-[8.5px] opacity-90 mt-0.5">' + statusTxt + '</div>' +
        '</button>';
    }
    grid.innerHTML = spotsHtml;

    const totalKc = preset.priceKc;
    const escrow40 = Math.round(totalKc * 0.4);
    const door60 = totalKc - escrow40;
    const selectedCode = preset.code + '-' + String(state.selectedSpot).padStart(2, '0');

    summary.innerHTML =
      '<div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b" style="border-color:var(--knt-border-subtle)">' +
      '  <div>' +
      '    <span class="text-[10px] font-black uppercase" style="color:var(--knt-cyan-ink)">' + t('selectedSpotTitle') + '</span>' +
      '    <div class="font-display text-xl font-extrabold">' + escapeHtml(isEn ? preset.en : preset.es) + ' <span style="color:var(--knt-cyan-ink)">#' + selectedCode + '</span></div>' +
      '  </div>' +
      '  <div class="flex flex-col items-end gap-1"><span class="px-3 py-1 rounded-xl bg-[#00F0FF] text-[#050505] font-black text-xs" style="filter:blur(8px);-webkit-filter:blur(8px);user-select:none;pointer-events:none;opacity:0.75;">' + totalKc + ' KC</span><span class="inline-block text-[8.5px] font-black px-1.5 py-0.5 rounded bg-black/85 text-[#FFB800] border border-[#FFB800]/60">[ 🔒 VALOR CLASIFICADO // REVELACIÓN EN LANZAMIENTO OFICIAL ]</span></div>' +
      '</div>' +
      '<div class="mt-3 space-y-2 text-xs">' +
      '  <div class="flex items-center justify-between font-bold">' +
      '    <span style="color:var(--knt-text-sec)">' + t('escrowHoldLabel') + '</span>' +
      '    <span class="font-black" style="color:var(--knt-cyan-ink)">' + escrow40 + ' KC (40%)</span>' +
      '  </div>' +
      '  <div class="flex items-center justify-between font-bold">' +
      '    <span style="color:var(--knt-text-sec)">' + t('doorQrLabel') + '</span>' +
      '    <span class="font-black" style="color:var(--knt-green-ink)">' + door60 + ' KC (60%)</span>' +
      '  </div>' +
      '</div>';
  }

  // ==========================================================================
  // 6. ESCALERA VISUAL DE 5 MEMBRESÍAS VIP (FOTOS + ICONOS 3D + BARRAS)
  // ==========================================================================
  function renderMemberships() {
    const grid = document.getElementById('membershipsGrid');
    if (!grid) return;
    const isEn = state.lang === 'en';

    grid.innerHTML = MEMBERSHIPS.map(function (m) {
      const cardCls = m.tone === 'cyan' ? 'knt-card-3d-cyan' : m.tone === 'amber' ? 'knt-card-3d-amber' : 'knt-card-3d';
      const btnCls = m.id === 'platinum' ? 'knt-btn-cyan' : m.id === 'gold' ? 'knt-btn-amber' : m.id === 'silver' ? 'knt-btn-ghost-cyan' : 'knt-btn-ghost-purple';
      const ribbon = m.popular
        ? '<span class="absolute top-2.5 right-2.5 z-10 px-2.5 py-0.5 rounded-full bg-[#FFB800] text-[#050505] font-black text-[9px] uppercase">' + t('popularRibbon') + '</span>'
        : m.legend
          ? '<span class="absolute top-2.5 right-2.5 z-10 px-2.5 py-0.5 rounded-full bg-[#00F0FF] text-[#050505] font-black text-[9px] uppercase">' + t('legendRibbon') + '</span>'
          : '';
      const perks = (isEn ? m.perksEn : m.perksEs).map(function (p) {
        return '<li class="flex items-start gap-1.5"><span style="color:var(--knt-green-ink)">✓</span><span>' + escapeHtml(p) + '</span></li>';
      }).join('');
      const starsTxt = isEn ? m.starsEn : m.stars;
      const benefitLabel = isEn ? 'VIP Power' : 'Nivel Beneficios';

      return (
        '<div class="' + cardCls + ' overflow-hidden flex flex-col justify-between relative">' +
        ribbon +
        '  <div>' +
        '    <div class="relative h-28">' +
        '      <img src="' + escapeHtml(m.photo) + '" alt="' + escapeHtml(m.titleEs) + '" loading="lazy" class="w-full h-full object-cover" />' +
        '      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>' +
        '      <span class="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-black/80 border border-white/25 flex items-center justify-center text-base">' + (m.icon || '⚡') + '</span>' +
        '      <div class="absolute bottom-2 left-3 right-3 flex items-end justify-between text-white">' +
        '        <h3 class="font-display text-lg font-extrabold leading-none">' + escapeHtml(isEn ? m.titleEn : m.titleEs) + '</h3>' +
        '        <span class="text-[9px] font-black text-[#FFB800]">' + escapeHtml(starsTxt) + '</span>' +
        '      </div>' +
        '    </div>' +
        '    <div class="p-4">' +
        '      <span class="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border" style="border-color:var(--knt-border-subtle);color:var(--knt-cyan-ink)">' +
        escapeHtml(isEn ? m.badgeEn : m.badgeEs) +
        '      </span>' +
        '      <div class="mt-2 space-y-1.5"><div style="filter:blur(8px);-webkit-filter:blur(8px);user-select:none;pointer-events:none;opacity:0.75;"><div class="font-display text-2xl font-extrabold">' + m.price + ' <span class="text-[11px] font-bold">MXN/' + (isEn ? 'mo' : 'mes') + '</span></div><div class="text-xs font-black" style="color:var(--knt-cyan-ink)">' + escapeHtml(isEn ? m.kcEn : m.kcEs) + '</div></div><span class="inline-block text-[8.5px] font-black px-1.5 py-0.5 rounded bg-black/85 text-[#FFB800] border border-[#FFB800]/60">[ 🔒 VALOR CLASIFICADO // REVELACIÓN EN LANZAMIENTO OFICIAL ]</span></div>' +
        '      <div class="mt-3">' +
        '        <div class="flex items-center justify-between text-[9.5px] font-extrabold mb-1" style="color:var(--knt-muted)">' +
        '          <span>' + benefitLabel + '</span>' +
        '          <span>' + m.progressPct + '%</span>' +
        '        </div>' +
        '        <div class="knt-progress-track">' +
        '          <div class="knt-progress-fill" style="width:' + m.progressPct + '%;background:' + m.barColor + '"></div>' +
        '        </div>' +
        '      </div>' +
        '      <ul class="mt-3.5 pt-3 border-t space-y-1.5 text-[11.5px] font-semibold leading-snug" style="border-color:var(--knt-border-subtle);color:var(--knt-text-sec)">' +
        perks +
        '      </ul>' +
        '    </div>' +
        '  </div>' +
        '  <div class="px-4 pb-4">' +
        '    <button type="button" onclick="window.kineticPortal.scrollToWaitlist()" class="knt-btn-3d ' + btnCls + ' w-full py-2.5 text-[11px] uppercase">' +
        t('choosePlanBtn') +
        '    </button>' +
        '  </div>' +
        '</div>'
      );
    }).join('');
  }

  // ==========================================================================
  // 7. SIMULADOR DE COFRE VOLUMÉTRICO 3D (4 RAREZAS)
  // ==========================================================================
  function renderChestSimulator() {
    const stage = document.getElementById('chest3DStage');
    const chips = document.getElementById('chestTierChips');
    const rewardBanner = document.getElementById('chestRewardBanner');
    const actionBtn = document.getElementById('chestActionBtn');
    if (!stage || !chips) return;

    const isEn = state.lang === 'en';
    const tier = CHEST_TIERS[state.chestTierIdx] || CHEST_TIERS[3];

    chips.innerHTML = CHEST_TIERS.map(function (ct, idx) {
      const active = idx === state.chestTierIdx;
      return (
        '<button type="button" onclick="window.kineticPortal.selectChestTier(' + idx + ')" class="knt-chip-3d text-[10.5px] ' + (active ? 'active-cyan' : '') + '">' +
        escapeHtml(isEn ? ct.en : ct.es) +
        '</button>'
      );
    }).join('');

    if (state.chestOpen) {
      stage.classList.add('knt-chest-open');
    } else {
      stage.classList.remove('knt-chest-open');
    }

    const accentEl = document.getElementById('chestSvgAccent');
    if (accentEl) accentEl.setAttribute('stroke', tier.color);

    if (rewardBanner) {
      if (state.chestOpen) {
        rewardBanner.classList.remove('hidden');
        rewardBanner.textContent = isEn ? tier.rewardEn : tier.rewardEs;
      } else {
        rewardBanner.classList.add('hidden');
      }
    }

    if (actionBtn) {
      actionBtn.textContent = state.chestOpen ? t('chestBtnReset') : t('chestBtnOpen');
    }
  }

  // ==========================================================================
  // 8. SELECTOR DE LAS 231 DISCIPLINAS EN EL MODAL DE SOCIOS
  // ==========================================================================
  function renderB2BDisciplineOptions() {
    const sel = document.getElementById('b2bDiscSelect');
    if (!sel) return;
    const isEn = state.lang === 'en';
    const current = sel.value || 'Pilates Reformer';
    sel.innerHTML = DISCIPLINES.slice()
      .sort(function (a, b) {
        return (isEn ? a.en : a.es).localeCompare(isEn ? b.en : b.es, state.lang);
      })
      .map(function (d) {
        const label = (d.div === 'wellness' ? '🟣 ' : '🔵 ') + (isEn ? d.en : d.es);
        const selected = d.es === current ? ' selected' : '';
        return '<option value="' + escapeHtml(d.es) + '"' + selected + '>' + escapeHtml(label) + '</option>';
      })
      .join('');
  }

  // ==========================================================================
  // 9. SOPORTE DE DEEPLINKS (?sede= y ?event= / ?evento=) CON CANDADO 31 DIC
  // ==========================================================================
  function detectAndLoadDeepLinks() {
    const params = new URLSearchParams(window.location.search);
    const rawSede = (params.get('sede') || params.get('club') || '').trim();
    const rawEvent = (params.get('event') || params.get('evento') || '').trim();
    if (!rawSede && !rawEvent) return;

    if (rawSede) {
      state.deepLinkData = {
        type: 'sede',
        title: rawSede,
        subEs: 'Sede verificada en la red KINETIC • Acceso público el 31 de diciembre de 2026',
        subEn: 'Verified venue on the KINETIC network • Public launch December 31, 2026',
      };
    } else if (rawEvent) {
      state.deepLinkData = {
        type: 'event',
        title: rawEvent,
        subEs: 'Sesión deportiva KINETIC • Reserva 40% Escrow + 60% Llave QR (Lanzamiento 31 Dic 2026)',
        subEn: 'KINETIC session • 40% Escrow Hold + 60% QR Key (Launch Dec 31, 2026)',
      };
    }

    renderDeepLinkUI();
    openModal('deepLinkModal');
  }

  function renderDeepLinkUI() {
    const banner = document.getElementById('deepLinkTopBanner');
    const modalBody = document.getElementById('deepLinkModalContent');
    if (!state.deepLinkData) {
      if (banner) banner.classList.add('hidden');
      return;
    }
    const isEn = state.lang === 'en';
    const d = state.deepLinkData;
    const tag = d.type === 'sede' ? t('dlTagSede') : t('dlTagEvent');
    const sub = isEn ? d.subEn : d.subEs;

    if (banner) {
      banner.classList.remove('hidden');
      banner.innerHTML =
        '<div class="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">' +
        '  <div>' +
        '    <div class="text-[10px] font-black uppercase tracking-wider" style="color:var(--knt-cyan-ink)">' + escapeHtml(tag) + '</div>' +
        '    <div class="font-display text-sm sm:text-base font-extrabold">' + escapeHtml(d.title) + ' — <span class="font-semibold text-xs" style="color:var(--knt-text-sec)">' + escapeHtml(sub) + '</span></div>' +
        '  </div>' +
        '  <div class="flex flex-wrap items-center gap-2">' +
        '    <button type="button" onclick="window.kineticPortal.openPreLaunchModal()" class="knt-btn-3d knt-btn-cyan px-3.5 py-2 text-[10.5px]">' + t('dlOpenWeb') + '</button>' +
        '    <button type="button" onclick="window.kineticPortal.scrollToWaitlist()" class="knt-btn-3d knt-btn-green px-3.5 py-2 text-[10.5px]">' + '⚡ ACCESO PRIORITARIO' + '</button>' +
        '    <button type="button" onclick="window.kineticPortal.dismissDeepLink()" class="knt-chip-3d text-[10px]">' + t('dlDismiss') + '</button>' +
        '  </div>' +
        '</div>';
    }

    if (modalBody) {
      modalBody.innerHTML =
        '<div class="text-[10px] font-black uppercase tracking-widest mb-1" style="color:var(--knt-cyan-ink)">' + escapeHtml(tag) + '</div>' +
        '<h3 class="font-display text-2xl font-extrabold mb-2">' + escapeHtml(d.title) + '</h3>' +
        '<p class="text-xs sm:text-sm mb-5" style="color:var(--knt-text-sec)">' + escapeHtml(sub) + '</p>' +
        '<div class="space-y-2.5">' +
        '  <button type="button" onclick="window.kineticPortal.closeModal(\'deepLinkModal\');window.kineticPortal.openPreLaunchModal()" class="knt-btn-3d knt-btn-cyan w-full py-3.5 text-xs">' + t('dlOpenWeb') + '</button>' +
        '  <button type="button" onclick="window.kineticPortal.closeModal(\'deepLinkModal\');window.kineticPortal.scrollToWaitlist()" class="knt-btn-3d knt-btn-green w-full py-3.5 text-xs">' + '⚡ ACCESO PRIORITARIO' + '</button>' +
        '</div>';
    }
  }

  // ==========================================================================
  // 10. CONEXIÓN EN VIVO DE PRE-REGISTRO B2C / B2B CON ADMIN HUB
  // ==========================================================================
  async function insertWaitlistRecord(payload) {
    const endpoint = CFG.supabaseUrl + '/rest/v1/fundadores_waitlist';
    const headers = {
      'Content-Type': 'application/json',
      apikey: CFG.supabaseAnonKey,
      Authorization: 'Bearer ' + CFG.supabaseAnonKey,
      Prefer: 'return=minimal',
    };

    // Esquema primario activo en producción (sincronizado con Admin Hub)
    const primaryBody = {
      nombre: payload.nombre,
      email: payload.email,
      whatsapp: payload.telefono,
      perfil_interes: payload.tipo_perfil,
      zona: payload.ciudad_zona,
      disciplina_favorita: payload.disciplina_interes,
      origen: 'kineticapp.com.mx',
    };

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(primaryBody),
    });

    if (resp.ok || resp.status === 201 || resp.status === 409) {
      return true;
    }

    // Respaldo automático de compatibilidad extendida de columnas
    if (resp.status === 400) {
      const altResp = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          nombre: payload.nombre,
          email: payload.email,
          telefono: payload.telefono,
          tipo_perfil: payload.tipo_perfil,
          ciudad_zona: payload.ciudad_zona,
          disciplina_interes: payload.disciplina_interes,
          origen: 'kineticapp.com.mx',
        }),
      });
      return altResp.ok || altResp.status === 201 || altResp.status === 409;
    }

    return false;
  }

  async function submitModalRegistration(e) {
    e.preventDefault();
    const isEn = state.lang === 'en';
    const isB2B = state.regMode === 'b2b';
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const phone = document.getElementById('regPhone').value.trim();
    const zone = document.getElementById('regZone').value.trim();
    const interest = document.getElementById('regInterest').value.trim();
    const btn = document.getElementById('regSubmitBtn');
    const msg = document.getElementById('regFeedbackMsg');
    if (!name || !email || !phone || !zone) return;

    btn.disabled = true;
    btn.textContent = isEn ? 'SENDING PRE-REGISTRATION...' : 'ENVIANDO PRE-REGISTRO...';

    let ok = false;
    try {
      ok = await insertWaitlistRecord({
        nombre: name,
        email: email,
        telefono: phone,
        tipo_perfil: isB2B ? 'Socio B2B (Club / Especialista)' : 'Atleta B2C (Acceso Prioritario)',
        ciudad_zona: zone,
        disciplina_interes: interest || (isB2B ? 'Afiliación Comercial' : 'Acceso Prioritario'),
      });
    } catch (_) {}

    btn.disabled = false;
    btn.textContent = ok
      ? (isEn ? '✓ PRE-REGISTRATION CONFIRMED' : '✓ PRE-REGISTRO RECIBIDO')
      : (isB2B ? t('regSubmitBtnB2B') : t('regSubmitBtnB2C'));

    if (msg) {
      msg.classList.remove('hidden');
      msg.textContent = isEn
        ? 'Thank you, ' + name + '! Your priority access pre-registration has been received by our team.'
        : '¡Gracias, ' + name + '! Tu pre-registro quedó registrado en nuestra lista oficial de atención prioritaria.';
    }
    document.getElementById('dualRegForm').reset();
  }

  async function submitB2BSectionForm(e) {
    e.preventDefault();
    const isEn = state.lang === 'en';
    const name = document.getElementById('b2bName').value.trim();
    const type = document.getElementById('b2bType').value;
    const zone = document.getElementById('b2bZone').value.trim();
    const disc = document.getElementById('b2bDiscSelect').value;
    const phone = document.getElementById('b2bPhone').value.trim();
    const email = document.getElementById('b2bEmail').value.trim().toLowerCase();
    const btn = document.getElementById('b2bSubmitBtn');
    const feedback = document.getElementById('b2bFeedbackMsg');
    if (!name || !phone || !email || !zone) return;

    btn.disabled = true;
    btn.textContent = isEn ? 'SENDING PARTNER APPLICATION...' : 'ENVIANDO SOLICITUD DE SOCIO...';

    let ok = false;
    try {
      ok = await insertWaitlistRecord({
        nombre: name,
        email: email,
        telefono: phone,
        tipo_perfil: 'Socio B2B • ' + type,
        ciudad_zona: zone,
        disciplina_interes: disc,
      });
    } catch (_) {}

    btn.disabled = false;
    btn.textContent = ok
      ? (isEn ? '✓ PARTNER PRE-REGISTRATION SENT' : '✓ PRE-REGISTRO DE SOCIO ENVIADO')
      : t('b2bSubmitBtnLabel');

    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.textContent = isEn
        ? 'Application received! Our partnerships team will review ' + name + ' and reach out shortly.'
        : '¡Solicitud recibida! Nuestro equipo de alianzas revisará el perfil de ' + name + ' y se pondrá en contacto contigo.';
    }
    const form = document.getElementById('partnerPreRegForm');
    if (form) form.reset();
    renderB2BDisciplineOptions();
  }

  // ==========================================================================
  // 11. WIDGET FLOTANTE CONCIERGE IA 24/7
  // ==========================================================================
  function renderConciergeQuickChips() {
    const wrap = document.getElementById('aiQuickChips');
    const welcome = document.getElementById('aiWelcomeBubble');
    if (welcome) welcome.innerHTML = formatBoldMarkdown(t('aiWelcome'));
    if (!wrap) return;
    const prompts = state.lang === 'en'
      ? ['Launch Dec 31, 2026', '40/60 Hold & 60s QR Key', '50-Spot 3D Studio Map', 'VIP Tiers & Rollover', 'Partner Network & SPEI']
      : ['Lanzamiento 31 Dic 2026', 'Reserva 40/60 y Llave QR', 'Mapa 3D de 50 Estaciones', 'Membresías VIP y Rollover', 'Equipo de Socios y SPEI'];

    wrap.innerHTML = prompts.map(function (p) {
      return '<button type="button" onclick="window.kineticPortal.askAiPreset(\'' + p.replace(/'/g, "\\'") + '\')" class="knt-chip-3d text-[10.5px] py-1.5 px-2.5">' + escapeHtml(p) + '</button>';
    }).join('');
  }

  function appendAiMessage(role, text) {
    const log = document.getElementById('aiChatMessages');
    if (!log) return;
    const div = document.createElement('div');
    if (role === 'user') {
      div.className = 'ml-auto max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-bold bg-[#00F0FF] text-[#050505]';
      div.textContent = text;
    } else {
      div.className = 'mr-auto max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border';
      div.style.background = 'var(--knt-surface)';
      div.style.borderColor = 'var(--knt-border-subtle)';
      div.innerHTML = formatBoldMarkdown(text);
    }
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  // ==========================================================================
  // 12. MODALES Y CONTROLES PÚBLICOS
  // ==========================================================================
  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    el.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
    el.classList.remove('flex');
    const anyOpen = Array.from(document.querySelectorAll('.fixed.inset-0')).some(function (m) {
      return !m.classList.contains('hidden');
    });
    if (!anyOpen) {
      document.body.style.overflow = '';
    }
  }

  window.kineticPortal = {
    setLang: applyLanguage,
    toggleTheme: function () {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    },
    toggleMobileMenu: function () {
      const m = document.getElementById('mobileNavDrawer');
      if (m) m.classList.toggle('hidden');
    },
    setHeroTab: function (tab) {
      state.heroSimTab = tab;
      renderHeroSimulator();
    },
    scrollToSimulator: scrollToSimulator,
    openPreLaunchModal: function () {
      openModal('preLaunchModal');
    },
    scrollToWaitlist: scrollToWaitlist,
    openPartnerModal: function () {
      const feedback = document.getElementById('b2bFeedbackMsg');
      if (feedback) feedback.classList.add('hidden');
      renderB2BDisciplineOptions();
      openModal('partnerB2BModal');
    },
    onSearchDiscipline: function (val) {
      state.discQuery = val || '';
      renderDisciplinesExplorer();
    },
    toggleFilterBar: function () {
      state.showFilterDrawer = !state.showFilterDrawer;
      renderDisciplinesExplorer();
    },
    toggleSortBar: function () {
      state.showSortDrawer = !state.showSortDrawer;
      renderDisciplinesExplorer();
    },
    setDiscDiv: function (div) {
      state.discDiv = div;
      renderDisciplinesExplorer();
    },
    setDiscSort: function (srt) {
      state.discSort = srt;
      renderDisciplinesExplorer();
    },
    toggleAll231: function () {
      state.discExpandedAll = !state.discExpandedAll;
      renderDisciplinesExplorer();
    },
    selectDisciplineCard: function (discId) {
      state.selectedDiscId = Number(state.selectedDiscId) === Number(discId) ? null : Number(discId);
      renderDisciplinesExplorer();
      if (state.selectedDiscId) {
        const panel = document.getElementById('disciplineReadOnlyPanel');
        if (panel && typeof panel.scrollIntoView === 'function') {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    },
    closeDisciplinePanel: function () {
      state.selectedDiscId = null;
      renderDisciplinesExplorer();
    },
    setVenueCategory: function (cat) {
      state.venueCat = cat;
      renderVenuesExplorer();
    },
    setStudioEquip: function (eq) {
      state.studioEquip = eq;
      renderStudio3DSimulator();
    },
    setStudioCap: function (cap) {
      state.studioCap = cap;
      renderStudio3DSimulator();
    },
    selectStudioSpot: function (num) {
      state.selectedSpot = num;
      renderStudio3DSimulator();
    },
    selectChestTier: function (idx) {
      state.chestTierIdx = idx;
      state.chestOpen = false;
      renderChestSimulator();
    },
    toggleChestOpen: function () {
      state.chestOpen = !state.chestOpen;
      renderChestSimulator();
    },
    openRegistrationModal: function (mode) {
      state.regMode = mode === 'b2b' ? 'b2b' : 'b2c';
      const msg = document.getElementById('regFeedbackMsg');
      const btn = document.getElementById('regSubmitBtn');
      if (msg) msg.classList.add('hidden');
      if (btn) btn.disabled = false;
      syncRegistrationModalCopy();
      openModal('registrationModal');
    },
    openLegalModal: function (docKey) {
      const doc = LEGAL_DOCS[docKey] || LEGAL_DOCS.waiver;
      const isEn = state.lang === 'en';
      const titleEl = document.getElementById('legalModalTitle');
      const bodyEl = document.getElementById('legalModalBody');
      if (titleEl) titleEl.textContent = isEn ? doc.titleEn : doc.titleEs;
      if (bodyEl) bodyEl.innerHTML = isEn ? doc.bodyEn : doc.bodyEs;
      openModal('legalModal');
    },
    closeModal: closeModal,
    dismissDeepLink: function () {
      state.deepLinkData = null;
      renderDeepLinkUI();
      closeModal('deepLinkModal');
    },
    submitModalRegistration: submitModalRegistration,
    submitB2BSectionForm: submitB2BSectionForm,
    toggleAiConcierge: function () {
      state.aiOpen = !state.aiOpen;
      const panel = document.getElementById('aiConciergeDrawer');
      if (!panel) return;
      if (state.aiOpen) {
        panel.classList.remove('hidden');
        panel.classList.add('flex');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
      }
    },
    askAiPreset: function (promptText) {
      appendAiMessage('user', promptText);
      const reply = window.buildKineticPortalAiReply(promptText, state.lang);
      setTimeout(function () { appendAiMessage('ai', reply); }, 140);
    },
    submitAiChat: function (e) {
      e.preventDefault();
      const input = document.getElementById('aiChatInput');
      if (!input) return;
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      appendAiMessage('user', val);
      const reply = window.buildKineticPortalAiReply(val, state.lang);
      setTimeout(function () { appendAiMessage('ai', reply); }, 140);
    },
  };

  // Reloj dinámico de Llave Óptica QR de 60 segundos
  setInterval(function () {
    state.qrSeconds = state.qrSeconds <= 1 ? 60 : state.qrSeconds - 1;
    document.querySelectorAll('[data-qr-timer]').forEach(function (el) {
      el.textContent = state.qrSeconds + 's';
    });
  }, 1000);

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(state.theme);
    applyLanguage(state.lang);
    detectAndLoadDeepLinks();
  });
})();

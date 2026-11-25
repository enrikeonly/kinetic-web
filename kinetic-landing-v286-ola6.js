// public/kinetic-landing-v286-ola6.js — Wave 6 Invite Code Gate + Cloud Concierge IA 24/7
(function () {
  var GRANT_KEY = '@kinetic_web_invite_grant_kenc_v2';
  var SALT_KEY = '@kinetic_device_cipher_salt_v1';
  var COOKIE_SALT_NAME = 'knt_salt_v1';
  var COOKIE_GRANT_NAME = 'knt_wgrant_kenc_v2';
  var LEGACY_KEYS = [
    { k: '@kinetic_founder_web_device_v1', c: 'knt_fpass_v1' },
    { k: '@kinetic_web_invite_grant_v286', c: 'knt_wgrant_v1' }
  ];
  var COOKIE_TTL_SEC = 90 * 24 * 60 * 60;
  var EV_NAME = 'kinetic:founder-pass-changed';
  function getTopSameOriginWin() {
    try {
      if (window.top && window.top !== window && window.top.location.origin === window.location.origin) return window.top;
    } catch (_) {}
    return window;
  }
  function readCookieSafe(name) {
    try {
      var prefix = name + '=';
      var parts = String(document.cookie || '').split(';');
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i].trim();
        if (p.indexOf(prefix) === 0) return decodeURIComponent(p.slice(prefix.length));
      }
    } catch (_) {}
    return null;
  }
  function writeCookieSafe(name, val, maxAgeSec) {
    try {
      var sec = window.location && window.location.protocol === 'https:' ? '; Secure' : '';
      var cStr = name + '=' + encodeURIComponent(val) + '; Path=/; Max-Age=' + maxAgeSec + '; SameSite=Lax' + sec;
      document.cookie = cStr;
      var topW = getTopSameOriginWin();
      if (topW && topW !== window && topW.document) topW.document.cookie = cStr;
    } catch (_) {}
  }
  function mirrorRead(key, cName) {
    var topW = getTopSameOriginWin();
    var v = null;
    try { v = topW.localStorage.getItem(key); } catch (_) {}
    if (!v && topW !== window) { try { v = window.localStorage.getItem(key); } catch (_) {} }
    if (!v) { try { v = topW.sessionStorage.getItem(key) || window.sessionStorage.getItem(key); } catch (_) {} }
    if (!v && cName) v = readCookieSafe(cName);
    if (v) {
      try { topW.localStorage.setItem(key, v); } catch (_) {}
      try { if (topW !== window) window.localStorage.setItem(key, v); } catch (_) {}
    }
    return v;
  }
  function mirrorWrite(key, cName, val) {
    var topW = getTopSameOriginWin();
    try { topW.localStorage.setItem(key, val); } catch (_) {}
    try { if (topW !== window) window.localStorage.setItem(key, val); } catch (_) {}
    try { topW.sessionStorage.setItem(key, val); } catch (_) {}
    try { if (topW !== window) window.sessionStorage.setItem(key, val); } catch (_) {}
    if (cName) writeCookieSafe(cName, val, COOKIE_TTL_SEC);
  }
  function mirrorDel(key, cName) {
    var topW = getTopSameOriginWin();
    try { topW.localStorage.removeItem(key); } catch (_) {}
    try { window.localStorage.removeItem(key); } catch (_) {}
    try { topW.sessionStorage.removeItem(key); } catch (_) {}
    try { window.sessionStorage.removeItem(key); } catch (_) {}
    if (cName) writeCookieSafe(cName, '', 0);
  }
  function navigateTopSafe(path) {
    try { (window.top || window).location.assign(path); } catch (_) { window.location.assign(path); }
  }
  function fnvMix(inp, seed) {
    var h = seed >>> 0;
    for (var i = 0; i < inp.length; i++) h = Math.imul(h ^ inp.charCodeAt(i), 0x01000193) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
    return (Math.imul(h ^ (h >>> 13), 0xc2b2ae35) ^ (h >>> 16)) >>> 0;
  }
  function fnvStep(st, idx, ks) {
    var h = (st ^ ks ^ Math.imul((idx + 1) >>> 0, 0x9e3779b9)) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
  }
  function envFp() {
    var ua = (typeof navigator !== 'undefined' ? navigator.userAgent || '' : '').slice(0, 48);
    return fnvMix('knt25|web||' + ua, 0x9e3779b9).toString(16).padStart(8, '0');
  }
  function getSalt() {
    try {
      var s = mirrorRead(SALT_KEY, '');
      if (s && s.length >= 32) return s;
      var arr = new Uint8Array(32);
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(arr);
      s = Array.prototype.map.call(arr, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      mirrorWrite(SALT_KEY, '', s);
      return s;
    } catch (_) { return ''; }
  }
  function purgeLegacyGrants() {
    for (var li = 0; li < LEGACY_KEYS.length; li++) mirrorDel(LEGACY_KEYS[li].k, LEGACY_KEYS[li].c);
    var cur = mirrorRead(GRANT_KEY, COOKIE_GRANT_NAME);
    if (cur && cur.indexOf('kenc_v1:') === 0) mirrorDel(GRANT_KEY, COOKIE_GRANT_NAME);
  }
  purgeLegacyGrants();

  function readPrivateGrant() {
    try {
      purgeLegacyGrants();
      var salt = mirrorRead(SALT_KEY, '');
      var raw = mirrorRead(GRANT_KEY, COOKIE_GRANT_NAME);
      if (!salt || !raw || raw.indexOf('kenc_v2:') !== 0) return null;
      var v2Salt = salt + ':kenc_v2';
      var p = raw.slice(8).split(':');
      if (p.length !== 3 || !p[0] || !p[1] || !p[2] || (p[2].length & 1) !== 0) return null;
      var fp = envFp();
      var macIn = v2Salt + '|' + fp + '|' + p[0] + '|' + p[2];
      var exp = fnvMix(macIn, 0x811c9dc5).toString(16).padStart(8, '0') + fnvMix('m:' + macIn, 0x27d4eb2f).toString(16).padStart(8, '0');
      if (p[1] !== exp) return null;
      var bl = p[2].length >>> 1;
      var out = new Uint8Array(bl);
      var ks = fnvMix(v2Salt + '|' + fp + '|' + p[0], 0x27d4eb2f);
      var cs = fnvMix(v2Salt + '|' + fp + '|' + p[0], 0x811c9dc5);
      for (var bi = 0; bi < bl; bi++) {
        if ((bi & 3) === 0) cs = fnvStep(cs, bi >>> 2, ks);
        out[bi] = parseInt(p[2].slice(bi * 2, bi * 2 + 2), 16) ^ ((cs >>> ((bi & 3) * 8)) & 0xff);
      }
      var dec = JSON.parse(new TextDecoder().decode(out));
      var now = Date.now();
      if (!dec || dec.v !== 1 || dec.issuer !== 'kinetic_web_invite_v286' || !dec.grantToken) return null;
      if (dec.issuedAtMs > now + 60000 || dec.expiresAtMs <= now) return null;
      return dec;
    } catch (_) { return null; }
  }
  function writePrivateGrant(d) {
    try {
      purgeLegacyGrants();
      var salt = getSalt();
      if (!salt || !d || !d.grant_token) return false;
      var v2Salt = salt + ':kenc_v2';
      var now = Date.now();
      var expMs = Date.parse(d.expires_at || '') || (now + 86400000);
      var role = d.target_role === 'club' ? 'club' : d.target_role === 'especialista' ? 'especialista' : 'atleta';
      var resolvedPath = d.target_path === '/login_b2b' || role === 'club' || role === 'especialista' ? '/login_b2b' : d.target_path === '/socios' ? '/socios' : '/login';
      var arr = new Uint8Array(16);
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(arr);
      var nonce = Array.prototype.map.call(arr, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      var payloadObj = {
        v: 1, issuer: 'kinetic_web_invite_v286', grantToken: d.grant_token,
        targetPath: resolvedPath, targetRole: role, allowSandboxBeta: Boolean(d.allow_sandbox_beta),
        issuedAtMs: now, expiresAtMs: expMs
      };
      if (typeof d.pass_sha256 === 'string' && /^[0-9a-f]{64}$/i.test(d.pass_sha256)) payloadObj.passSha256 = d.pass_sha256.toLowerCase();
      if (typeof d.allowed_email === 'string' && d.allowed_email.trim()) payloadObj.allowedEmail = d.allowed_email.trim().toLowerCase();
      if (typeof d.applicant_name === 'string' && d.applicant_name.trim()) payloadObj.applicantName = d.applicant_name.trim().slice(0, 120);
      var src = new TextEncoder().encode(JSON.stringify(payloadObj));
      var fp = envFp();
      var ks = fnvMix(v2Salt + '|' + fp + '|' + nonce, 0x27d4eb2f);
      var cs = fnvMix(v2Salt + '|' + fp + '|' + nonce, 0x811c9dc5);
      var cHex = '';
      for (var i = 0; i < src.length; i++) {
        if ((i & 3) === 0) cs = fnvStep(cs, i >>> 2, ks);
        cHex += (src[i] ^ ((cs >>> ((i & 3) * 8)) & 0xff)).toString(16).padStart(2, '0');
      }
      var macIn = v2Salt + '|' + fp + '|' + nonce + '|' + cHex;
      var mac = fnvMix(macIn, 0x811c9dc5).toString(16).padStart(8, '0') + fnvMix('m:' + macIn, 0x27d4eb2f).toString(16).padStart(8, '0');
      mirrorWrite(GRANT_KEY, COOKIE_GRANT_NAME, 'kenc_v2:' + nonce + ':' + mac + ':' + cHex);
      window.dispatchEvent(new Event(EV_NAME));
      if (window.parent && window.parent !== window) window.parent.dispatchEvent(new Event(EV_NAME));
      return resolvedPath;
    } catch (_) { return false; }
  }
  function dlpMask(txt) {
    return String(txt || '').slice(0, 600)
      .replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{6,}\b/g, '[REDACTED_JWT]')
      .replace(/\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9_]{8,}\b/gi, '[REDACTED_KEY]')
      .replace(/\bAIza[0-9A-Za-z_-]{16,}\b/g, '[REDACTED_KEY]')
      .replace(/\b\d{18}\b/g, '[REDACTED_CLABE]')
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, function (m) {
        return m.toLowerCase() === 'soporte@kineticapp.com.mx' ? m : '[REDACTED_EMAIL]';
      });
  }
  window.__kineticHasPrivateWebGrant = function () { return Boolean(readPrivateGrant()); };
  window.__kineticRevokePrivateGrant = function () {
    mirrorDel(GRANT_KEY, COOKIE_GRANT_NAME);
  };
  var cfg = null;
  window.__kineticAskConciergeCloud = async function (q, lang) {
    if (!cfg || !navigator.onLine) return null;
    var clean = dlpMask(q);
    if (!clean) return null;
    var grant = readPrivateGrant();
    var ctrl = new AbortController();
    var tid = setTimeout(function () { ctrl.abort(); }, 6200);
    try {
      var res = await fetch(cfg.url + '/functions/v1/kinetic-concierge-ai', {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', apikey: cfg.key, Authorization: 'Bearer ' + cfg.key },
        body: JSON.stringify({ message: clean, lang: lang === 'en' ? 'en' : 'es', isLanding: true, webGrantToken: grant ? grant.grantToken : null })
      });
      if (!res.ok) return null;
      var data = await res.json();
      return data && data.ok === true && typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : null;
    } catch (_) { return null; } finally { clearTimeout(tid); }
  };
  window.__kineticInitOla6Landing = function (boot) {
    cfg = boot;
    var activeGrant = readPrivateGrant();
    if (activeGrant) {
      if (boot.onUnlocked) boot.onUnlocked();
      fetch(boot.url + '/rest/v1/rpc/validar_pase_web_activo_v286', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: boot.key, Authorization: 'Bearer ' + boot.key },
        body: JSON.stringify({ p_grant_token: activeGrant.grantToken })
      }).then(function (r) {
        if (r.status === 401 || r.status === 403) return { active: false };
        return r.ok ? r.json() : null;
      }).then(function (v) {
        if (v && v.active === false) {
          window.__kineticRevokePrivateGrant();
          if (boot.onUnlocked) boot.onUnlocked();
        }
      }).catch(function () {});
    }
    var btn = document.getElementById('fgInviteBtn');
    var inp = document.getElementById('fgInviteCode');
    var errEl = document.getElementById('fgInviteErr');
    if (!btn || !inp) return;
    if (boot.onUnlocked) boot.onUnlocked();
    inp.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); btn.click(); }
    });
    btn.addEventListener('click', async function () {
      var raw = String(inp.value || '').trim().toUpperCase();
      var lang = boot.getLang ? boot.getLang() : 'es';
      if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
      if (!/^KNT-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(raw)) {
        if (errEl) { errEl.textContent = lang === 'en' ? 'Format: KNT-XXXX-XXXX' : 'Formato: KNT-XXXX-XXXX'; errEl.style.display = 'block'; }
        return;
      }
      btn.disabled = true;
      try {
        var r = await fetch(boot.url + '/rest/v1/rpc/canjear_pase_web_privado_v286', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: boot.key, Authorization: 'Bearer ' + boot.key },
          body: JSON.stringify({ p_raw_code: raw, p_client_bucket: 'web_' + (getSalt() || 'anon').slice(0, 12) })
        });
        var d = await r.json();
        if (!r.ok || !d || d.ok !== true || !d.grant_token) throw new Error((d && d.reason) || 'DENIED');
        var nextPath = writePrivateGrant(d);
        if (!nextPath) throw new Error('STORAGE_BLOCKED');
        if (boot.onUnlocked) boot.onUnlocked();
        navigateTopSafe(nextPath);
      } catch (_) {
        if (errEl) { errEl.textContent = lang === 'en' ? 'Invalid, expired or revoked invite.' : 'Clave inválida, expirada o revocada.'; errEl.style.display = 'block'; }
        btn.disabled = false;
      }
    });
  };
})();

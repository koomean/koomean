(() => {
  const key = 'koomean_site_prefs_v1';
  const defaults = { motion: 'auto', dataSaver: false, showVideo: true };
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let saved = true;
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return { motion: value?.motion === 'reduce' ? 'reduce' : 'auto', dataSaver: typeof value?.dataSaver === 'boolean' ? value.dataSaver : defaults.dataSaver, showVideo: typeof value?.showVideo === 'boolean' ? value.showVideo : defaults.showVideo };
    } catch { return { ...defaults }; }
  }
  let prefs = read();
  function sync() {
    const root = document.documentElement;
    root.dataset.reduceMotion = String(prefs.motion === 'reduce' || media.matches);
    root.dataset.dataSaver = String(prefs.dataSaver);
    document.querySelectorAll('[data-site-pref]').forEach(el => {
      if (el.type === 'checkbox') el.checked = prefs[el.dataset.sitePref];
      else el.value = prefs[el.dataset.sitePref];
    });
    const status = document.getElementById('settings-save-status');
    if (status) status.textContent = saved ? 'บันทึกอัตโนมัติในเบราว์เซอร์นี้' : 'เบราว์เซอร์ไม่อนุญาตให้บันทึก ค่านี้ใช้ได้เฉพาะการเปิดหน้านี้';
    window.dispatchEvent(new CustomEvent('site-preferences-change', { detail: { ...prefs } }));
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(prefs)); saved = true; } catch { saved = false; }
    sync();
  }
  window.SitePreferences = {
    get value() { return { ...prefs }; },
    reset() { prefs = { ...defaults }; window.KooTheme.set('auto'); save(); },
  };
  document.addEventListener('change', event => {
    const el = event.target;
    if (el.matches?.('[data-site-pref]')) {
      const name = el.dataset.sitePref;
      if (!(name in defaults)) return;
      prefs[name] = el.type === 'checkbox' ? el.checked : (el.value === 'reduce' ? 'reduce' : 'auto');
      save();
    }
    if (el.matches?.('[data-koo-theme]')) {
      try { saved = localStorage.getItem('koomean_site_theme_v1') === el.value; } catch { saved = false; }
      sync();
    }
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { prefs = read(); sync(); }
  });
  media.addEventListener('change', sync);
  document.addEventListener('DOMContentLoaded', sync);
  sync();
})();

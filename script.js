/**
 * Ali Kamil Yaseen — digital CV
 * Dependency-free: theme, AR/EN toggle, mobile nav, scroll reveal,
 * live pinned projects, mailto contact form, service worker.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var EMAIL = 'alikamilyaseen@gmail.com';

  /* ---------- Theme ---------- */
  var themeBtn = $('#themeToggle');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    store.set('theme', t);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0a0a0b' : '#f5f5f6');
  }
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  themeBtn.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ---------- Language (AR / EN) ---------- */
  var UI = {
    ar: {
      title: 'علي كامل ياسين | محاسب ومراقب مخزني ومطور ويب',
      themeLabel: 'تبديل الوضع الليلي والنهاري', menuLabel: 'القائمة',
      live: 'الموقع', code: 'الكود', empty: 'لا توجد مشاريع حالياً.',
      errName: 'يرجى كتابة الاسم.', errMsg: 'يرجى كتابة الرسالة.',
      phName: '', fallbackDesc: 'مشروع ويب'
    },
    en: {
      title: 'Ali Kamil Yaseen | Inventory Accountant & Web Developer',
      themeLabel: 'Toggle dark / light mode', menuLabel: 'Menu',
      live: 'Live', code: 'Code', empty: 'No projects yet.',
      errName: 'Please enter your name.', errMsg: 'Please enter a message.',
      phName: '', fallbackDesc: 'Web project'
    }
  };
  var lang = store.get('lang') === 'en' ? 'en' : 'ar';
  var langLabel = $('#langLabel');

  function applyLang(l) {
    lang = l;
    store.set('lang', l);
    root.lang = l;
    root.dir = l === 'en' ? 'ltr' : 'rtl';
    $$('[data-en]').forEach(function (el) {
      if (el.__ar === undefined) el.__ar = el.textContent;
      el.textContent = l === 'en' ? el.getAttribute('data-en') : el.__ar;
    });
    document.title = UI[l].title;
    langLabel.textContent = l === 'en' ? 'ع' : 'EN';
    $('#langToggle').setAttribute('aria-label', l === 'en' ? 'التبديل إلى العربية' : 'Switch to English');
    themeBtn.setAttribute('aria-label', UI[l].themeLabel);
    $('#burger').setAttribute('aria-label', UI[l].menuLabel);
    renderProjects();
  }
  $('#langToggle').addEventListener('click', function () { applyLang(lang === 'en' ? 'ar' : 'en'); });

  /* ---------- Nav ---------- */
  var nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
  function closeMenu() { menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeMenu(); });
  window.addEventListener('scroll', function () { nav.classList.toggle('is-stuck', window.scrollY > 8); }, { passive: true });

  /* ---------- Reveal + active link ---------- */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    window.__observe = function (el) { io.observe(el); };
    $$('.reveal').forEach(window.__observe);

    var links = $$('a', menu);
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { so.observe(s); });
  } else {
    window.__observe = function (el) { el.classList.add('is-in'); };
    $$('.reveal').forEach(window.__observe);
  }

  /* ---------- Projects ---------- */
  var META = {
    lo_oxll: { ar: 'نظام إدارة المخازن والحسابات', en: 'Inventory & Accounting System' },
    Inventory_Control_Accountant_2: { ar: 'نظام إدارة المخازن والحسابات — نسخة 2', en: 'Inventory & Accounting System — v2' },
    police_martyrs_press: { ar: 'نظام مخازن مطبعة شهداء الشرطة', en: 'Police Martyrs Press Warehouse System' },
    QR_code: { ar: 'QR STORE — حرفية وتقنية', en: 'QR STORE — Craft meets tech' },
    'gissa-web': { ar: 'قصّة — متجر إلكتروني', en: 'Qissa — Online Store' },
    Biocontrol: { ar: 'رَصَد — رصد الأنواع الغازية', en: 'Rasad — Invasive Species Monitoring' }
  };

  var FALLBACK = [
    { name: 'lo_oxll', description: 'المستودع الرئيسي — نظام إدارة المخازن والحسابات (Supabase + JavaScript)', language: 'JavaScript', homepage: 'https://lo-oxll.github.io/lo_oxll', html_url: 'https://github.com/lo-oxll/lo_oxll' },
    { name: 'QR_code', description: 'QR STORE — علامة عراقية تدمج التقنية بالحرفية (تطريز، قص ليزر، طباعة مطاطية)', language: 'HTML', homepage: 'https://lo-oxll.github.io/QR_code/', html_url: 'https://github.com/lo-oxll/QR_code' },
    { name: 'Biocontrol', description: 'رَصَد (Rasad) — منصة مجتمعية للإبلاغ عن الأنواع الغازية في العراق', language: 'JavaScript', homepage: 'https://lo-oxll.github.io/Biocontrol/', html_url: 'https://github.com/lo-oxll/Biocontrol' }
  ];
  var projects = null, grid = $('#projectsGrid');

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function safeUrl(u) { return /^https:\/\//i.test(u || '') ? u : null; }
  function linkBtn(href, icon, label) {
    var a = el('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    var i = el('i', icon); i.setAttribute('aria-hidden', 'true');
    a.appendChild(i); a.appendChild(document.createTextNode(' ' + label));
    return a;
  }
  function renderProjects() {
    if (!projects) return;
    grid.textContent = '';
    if (!projects.length) { grid.appendChild(el('p', 'muted', UI[lang].empty)); return; }
    projects.forEach(function (p) {
      var m = META[p.name];
      var card = el('article', 'card proj reveal');
      var h = el('h3', m && lang === 'ar' ? 'is-ar' : '', m ? m[lang] : p.name);
      var desc = lang === 'ar' && p.description ? p.description : (m ? m[lang] : UI[lang].fallbackDesc);
      if (lang === 'en' && m) desc = m.en;
      card.appendChild(h);
      card.appendChild(el('p', 'muted', desc));
      var meta = el('div', 'proj__meta');
      if (p.language) meta.appendChild(el('span', 'lang', p.language));
      var links = el('div', 'proj__links');
      var live = safeUrl(p.homepage), repo = safeUrl(p.html_url);
      if (live) links.appendChild(linkBtn(live, 'fa-solid fa-arrow-up-right-from-square', UI[lang].live));
      if (repo) links.appendChild(linkBtn(repo, 'fa-brands fa-github', UI[lang].code));
      meta.appendChild(links);
      card.appendChild(meta);
      grid.appendChild(card);
      window.__observe(card);
    });
  }
  fetch('projects.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { projects = Array.isArray(d) && d.length ? d : FALLBACK; })
    .catch(function () { projects = FALLBACK; })
    .then(renderProjects);

  /* ---------- Contact form (mailto) ---------- */
  var form = $('#contactForm'), err = $('#cfErr');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#cfName').value.trim(), subj = $('#cfSubject').value.trim(), msg = $('#cfMsg').value.trim();
    var m = !name ? UI[lang].errName : !msg ? UI[lang].errMsg : '';
    err.hidden = !m; err.textContent = m;
    if (m) return;
    var body = msg + '\n\n— ' + name;
    window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subj || 'CV Website Contact') + '&body=' + encodeURIComponent(body);
  });

  /* ---------- Misc ---------- */
  $('#printBtn').addEventListener('click', function () { window.print(); });
  $('#year').textContent = new Date().getFullYear();
  if (lang === 'en') applyLang('en'); else { langLabel.textContent = 'EN'; }

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();

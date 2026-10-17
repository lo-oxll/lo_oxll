/**
 * Ali Kamil Yaseen — digital CV
 * Dependency-free: tabbed sections, theme, AR/EN toggle,
 * curated GitHub projects, mailto contact form, service worker.
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

  /* ---------- Reveal ---------- */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var observe;
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    observe = function (el) { io.observe(el); };
  } else {
    observe = function (el) { el.classList.add('is-in'); };
  }
  $$('.reveal').forEach(observe);

  /* ---------- Tabbed sections ---------- */
  var PANELS = ['about', 'education', 'experience', 'skills', 'projects', 'contact'];
  var hero = $('#hero'), menu = $('#menu'), current = null;

  function pagerLabel(id) {
    var a = $('a[href="#' + id + '"]', menu);
    return a ? a.textContent : id;
  }
  function buildPager() {
    var rtl = root.dir === 'rtl';
    PANELS.forEach(function (id, i) {
      var sec = document.getElementById(id), old = $('.pager', sec);
      if (old) old.remove();
      var bar = document.createElement('div');
      bar.className = 'pager';
      function btn(target, isNext) {
        var a = document.createElement('a');
        a.className = 'btn';
        a.href = '#' + target;
        var ic = document.createElement('i');
        ic.className = 'fa-solid ' + (isNext === rtl ? 'fa-arrow-left' : 'fa-arrow-right');
        ic.setAttribute('aria-hidden', 'true');
        var t = document.createTextNode(pagerLabel(target));
        if (isNext) { a.appendChild(t); a.appendChild(document.createTextNode(' ')); a.appendChild(ic); }
        else { a.appendChild(ic); a.appendChild(document.createTextNode(' ')); a.appendChild(t); }
        return a;
      }
      if (i > 0) bar.appendChild(btn(PANELS[i - 1], false)); else bar.appendChild(Object.assign(document.createElement('span'), { className: 'pager__spacer' }));
      if (i < PANELS.length - 1) bar.appendChild(btn(PANELS[i + 1], true));
      sec.querySelector('.wrap').appendChild(bar);
    });
  }

  function show(id, scroll) {
    if (PANELS.indexOf(id) === -1) id = 'about';
    if (id === current) return;
    current = id;
    PANELS.forEach(function (p) {
      var sec = document.getElementById(p), on = p === id;
      sec.classList.toggle('is-hidden', !on);
      sec.classList.remove('panel-in');
      if (on) { void sec.offsetWidth; sec.classList.add('panel-in'); $$('.reveal', sec).forEach(observe); }
    });
    hero.classList.toggle('is-hidden', id !== 'about');
    $$('a', menu).forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'page'); a.scrollIntoView({ inline: 'center', block: 'nearest' }); }
      else a.removeAttribute('aria-current');
    });
    if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.addEventListener('hashchange', function () { show(location.hash.slice(1), true); });

  /* ---------- Language (AR / EN) ---------- */
  var UI = {
    ar: { title: 'علي كامل ياسين | متخصص إدارة تقنيات المعلومات ومحاسب سيطرة مخزنية', theme: 'تبديل الوضع الليلي والنهاري', live: 'الموقع', code: 'الكود', errName: 'يرجى كتابة الاسم.', errMsg: 'يرجى كتابة الرسالة.' },
    en: { title: 'Ali Kamil Yaseen | IT Management Specialist & Inventory Control Accountant', theme: 'Toggle dark / light mode', live: 'Live', code: 'Code', errName: 'Please enter your name.', errMsg: 'Please enter a message.' }
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
    themeBtn.setAttribute('aria-label', UI[l].theme);
    renderProjects();
    buildPager();
  }
  $('#langToggle').addEventListener('click', function () { applyLang(lang === 'en' ? 'ar' : 'en'); });

  /* ---------- Projects (curated order — edit this list to change them) ---------- */
  var GH = 'https://github.com/lo-oxll/';
  var PAGES = 'https://lo-oxll.github.io/';
  var PROJECTS = [
    { ar: 'نظام إدارة المخازن والحسابات', en: 'Inventory & Accounting System',
      dAr: 'المستودع الرئيسي — نظام لإدارة المخازن والحسابات (Supabase + JavaScript).', dEn: 'Main repository — an inventory & accounting system (Supabase + JavaScript).',
      tech: 'JavaScript', live: PAGES + 'lo_oxll', repo: GH + 'lo_oxll' },
    { ar: 'QR STORE — حرفية وتقنية', en: 'QR STORE — Craft meets Tech',
      dAr: 'علامة عراقية تدمج التقنية بالحرفية (تطريز، قص ليزر، طباعة مطاطية).', dEn: 'An Iraqi brand blending technology with craftsmanship (embroidery, laser cutting, rubber stamping).',
      tech: 'HTML', live: PAGES + 'QR_code/', repo: GH + 'QR_code' },
    { ar: 'رمز العملة العراقية', en: 'Iraqi Currency Symbol',
      dAr: 'مشروع خاص برمز العملة العراقية.', dEn: 'A project dedicated to the Iraqi currency symbol.',
      repo: GH + 'Iraq-currency-symbol' },
    { ar: 'نظام مخازن مطبعة شهداء الشرطة', en: 'Police Martyrs Press Warehouse System',
      dAr: 'نظام إدارة المخازن لمطبعة شهداء الشرطة.', dEn: 'Warehouse management system for the Police Martyrs Press.',
      live: PAGES + 'police_martyrs_press/', repo: GH + 'police_martyrs_press' },
    { ar: 'رَصَد — رصد الأنواع الغازية', en: 'Rasad — Invasive Species Monitoring',
      dAr: 'منصة مجتمعية للإبلاغ عن الأنواع الغازية في العراق.', dEn: 'A community platform for reporting invasive species in Iraq.',
      tech: 'JavaScript', live: PAGES + 'Biocontrol/', repo: GH + 'Biocontrol' }
  ];
  var grid = $('#projectsGrid');

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function linkBtn(href, icon, label) {
    var a = el('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    var i = el('i', icon); i.setAttribute('aria-hidden', 'true');
    a.appendChild(i); a.appendChild(document.createTextNode(' ' + label));
    return a;
  }
  function renderProjects() {
    grid.textContent = '';
    PROJECTS.forEach(function (p) {
      var card = el('article', 'card proj reveal');
      card.appendChild(el('h3', '', p[lang]));
      card.appendChild(el('p', 'muted', lang === 'en' ? p.dEn : p.dAr));
      var meta = el('div', 'proj__meta');
      if (p.tech) meta.appendChild(el('span', 'lang', p.tech));
      var links = el('div', 'proj__links');
      if (p.live) links.appendChild(linkBtn(p.live, 'fa-solid fa-arrow-up-right-from-square', UI[lang].live));
      links.appendChild(linkBtn(p.repo, 'fa-brands fa-github', UI[lang].code));
      meta.appendChild(links);
      card.appendChild(meta);
      grid.appendChild(card);
      observe(card);
    });
  }

  /* ---------- Contact form (mailto) ---------- */
  var form = $('#contactForm'), err = $('#cfErr');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#cfName').value.trim(), subj = $('#cfSubject').value.trim(), msg = $('#cfMsg').value.trim();
    var m = !name ? UI[lang].errName : !msg ? UI[lang].errMsg : '';
    err.hidden = !m; err.textContent = m;
    if (m) return;
    window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subj || 'CV Website Contact') +
      '&body=' + encodeURIComponent(msg + '\n\n— ' + name);
  });

  /* ---------- Init ---------- */
  $('#printBtn').addEventListener('click', function () { window.print(); });
  $('#year').textContent = new Date().getFullYear();
  if (lang === 'en') applyLang('en'); else { renderProjects(); buildPager(); }
  show(location.hash.slice(1), false);

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();

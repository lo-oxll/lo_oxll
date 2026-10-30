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
    ar: { title: 'علي كامل ياسين | متخصص إدارة تقنيات المعلومات ومحاسب سيطرة مخزنية', theme: 'تبديل الوضع الليلي والنهاري', live: 'الموقع', code: 'الكود' },
    en: { title: 'Ali Kamil Yaseen | IT Management Specialist & Inventory Control Accountant', theme: 'Toggle dark / light mode', live: 'Live', code: 'Code' }
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

  /* ---------- Projects (curated list lives in projects.json) ---------- */
  var PROJECTS = [];
  var grid = $('#projectsGrid');

  var LANG_COLORS = { JavaScript: '#f1e05a', HTML: '#e34c26', CSS: '#563d7c', Python: '#3572A5', TypeScript: '#3178c6', Shell: '#89e051', PLpgSQL: '#336790', SCSS: '#c6538c', PHP: '#4F5D95', Java: '#b07219', 'C#': '#178600' };
  var FALLBACK_COLORS = ['#8a8c91', '#b7b9bd', '#5b5d62', '#d0d1d4'];
  var LANG_TTL = 6 * 3600 * 1000;
  var langPromises = {};

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

  // Language breakdown: languages.json (generated by the workflow) first, GitHub API as fallback, cached for 6h.
  var staticLangs = null;
  function loadStaticLangs() {
    if (!staticLangs) {
      staticLangs = fetch('languages.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .catch(function () { return {}; });
    }
    return staticLangs;
  }
  function getLangs(repo) {
    if (langPromises[repo]) return langPromises[repo];
    langPromises[repo] = loadStaticLangs().then(function (all) {
      if (all && all[repo] && Object.keys(all[repo]).length) return all[repo];
      var key = 'langs:' + repo, cached = null;
      try { cached = JSON.parse(store.get(key)); } catch (e) {}
      if (cached && Date.now() - cached.t < LANG_TTL) return cached.d;
      return fetch('https://api.github.com/repos/lo-oxll/' + repo + '/languages', { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { store.set(key, JSON.stringify({ t: Date.now(), d: d })); return d; })
        .catch(function () { return cached ? cached.d : null; });
    });
    return langPromises[repo];
  }

  function renderLangs(box, data) {
    box.textContent = '';
    var names = data ? Object.keys(data).filter(function (k) { return data[k] > 0; }) : [];
    if (!names.length) { box.classList.add('is-empty'); return; }
    names.sort(function (a, b) { return data[b] - data[a]; });
    var total = names.reduce(function (s, k) { return s + data[k]; }, 0);
    var bar = el('div', 'langbar'), list = el('ul', 'langlist'), label = [];
    bar.setAttribute('role', 'img');
    names.forEach(function (k, i) {
      var pct = data[k] / total * 100;
      var color = LANG_COLORS[k] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
      var seg = el('span'); seg.style.width = pct + '%'; seg.style.background = color; bar.appendChild(seg);
      var li = el('li'), dot = el('span', 'dot'); dot.style.background = color;
      li.appendChild(dot);
      li.appendChild(document.createTextNode(k + ' '));
      li.appendChild(el('b', '', (pct < 0.1 ? '<0.1' : pct.toFixed(1)) + '%'));
      list.appendChild(li);
      label.push(k + ' ' + pct.toFixed(1) + '%');
    });
    bar.setAttribute('aria-label', label.join(', '));
    box.classList.remove('is-empty');
    box.appendChild(bar); box.appendChild(list);
  }

  function renderProjects() {
    if (projectsFailed) return;
    grid.textContent = '';
    PROJECTS.forEach(function (p) {
      var card = el('article', 'card proj reveal');
      card.appendChild(el('h3', '', p[lang]));
      var langs = el('div', 'langs');
      card.appendChild(langs);
      card.appendChild(el('p', 'muted', lang === 'en' ? p.dEn : p.dAr));
      var actions = el('div', 'proj__actions');
      if (p.live) {
        var live = linkBtn(p.live, 'fa-solid fa-arrow-up-right-from-square', UI[lang].live);
        live.className = 'btn btn--primary btn--sm';
        actions.appendChild(live);
      }
      var code = linkBtn(p.repo, 'fa-brands fa-github', UI[lang].code);
      code.className = 'btn btn--sm';
      actions.appendChild(code);
      card.appendChild(actions);
      grid.appendChild(card);
      observe(card);
      getLangs(p.repo.split('/').pop()).then(function (d) { renderLangs(langs, d); });
    });
  }

  function loadProjects() {
    return fetch('projects.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (list) { PROJECTS = Array.isArray(list) ? list : []; })
      .catch(function () {
        PROJECTS = [];
        grid.textContent = '';
        grid.appendChild(el('p', 'muted', lang === 'en' ? 'Projects could not be loaded. Please try again later.' : 'تعذّر تحميل المشاريع. حاول مرة أخرى لاحقًا.'));
        projectsFailed = true;
      })
      .then(function () { if (!projectsFailed) renderProjects(); });
  }
  var projectsFailed = false;

  /* ---------- Init ---------- */
  $('#printBtn').addEventListener('click', function () { window.print(); });
  $('#year').textContent = new Date().getFullYear();
  if (lang === 'en') applyLang('en'); else buildPager();
  loadProjects();

  // Replaces the old inline onerror handler (blocked by CSP).
  $$('img').forEach(function (img) {
    function drop() { img.remove(); }
    if (img.complete && img.naturalWidth === 0) drop(); else img.addEventListener('error', drop, { once: true });
  });
  show(location.hash.slice(1), false);

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();

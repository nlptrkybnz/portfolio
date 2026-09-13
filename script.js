(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav');
  var navLinks = document.getElementById('navLinks');
  var navToggle = document.getElementById('navToggle');
  var portrait = document.getElementById('portrait');

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* mobile menu */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* reveal on scroll */
  var animated = document.querySelectorAll('.anim');
  animated.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d);
  });

  if (reduced || !('IntersectionObserver' in window)) {
    animated.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    animated.forEach(function (el) { revealer.observe(el); });
  }

  /* active section in nav */
  var links = document.querySelectorAll('.nav-links a[data-nav]');
  var sections = document.querySelectorAll('section[id], footer[id]');
  if ('IntersectionObserver' in window && links.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle('active', link.dataset.nav === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* nav chrome: solid past the fold, inverted over dark bands */
  var darkBands = document.querySelectorAll('.band-dark');
  function navState() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);

    var probe = nav.offsetHeight / 2;
    var onDark = false;
    darkBands.forEach(function (band) {
      var r = band.getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) onDark = true;
    });
    nav.classList.toggle('on-dark', onDark);
  }

  /* portrait grows slightly as the hero scrolls away */
  function portraitState() {
    if (!portrait || reduced) return;
    var vh = window.innerHeight || 1;
    var progress = Math.min(Math.max(window.scrollY / vh, 0), 1);
    portrait.style.transform = 'scale(' + (1 + progress * 0.12).toFixed(4) + ')';
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      navState();
      portraitState();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  navState();
})();

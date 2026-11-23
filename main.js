// Studio AXD motion. Content is fully readable without this file; it only adds movement.
(() => {
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const nav = document.querySelector('.nav');

  // Top bar: frosts after 10px; on phones it slides away while scrolling down and returns on the way up.
  const darkSecs = [...document.querySelectorAll('.agencies, .case')];
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 10);
    nav.classList.toggle('on-dark', darkSecs.some((el) => { const r = el.getBoundingClientRect(); return r.top <= 36 && r.bottom >= 36; }));
    if (!nav.classList.contains('open')) {
      if (y > 160 && y > lastY + 4) nav.classList.add('hide');
      else if (y < lastY - 4 || y <= 160) nav.classList.remove('hide');
    }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Phone menu: Menu button opens a full-screen panel; a link tap, Escape or widening the screen closes it.
  const menuBtn = document.querySelector('.menu-btn');
  const mnav = document.getElementById('mnav');
  if (menuBtn && mnav) {
    const setMenu = (open) => {
      root.classList.toggle('menu-open', open);
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menuBtn.querySelector('.menu-txt').textContent = open ? 'Close' : 'Menu';
      mnav.inert = !open;
    };
    setMenu(false);
    menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    mnav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
    matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  // Services drop-down: click or Enter toggles it; Escape, a click outside or leaving with the mouse closes it.
  const dd = document.querySelector('.dd');
  if (dd) {
    const ddBtn = dd.querySelector('.dd-btn');
    const setDd = (open) => { dd.classList.toggle('open', open); ddBtn.setAttribute('aria-expanded', String(open)); };
    ddBtn.addEventListener('click', () => {
      // with a mouse, hover already shows the panel, so a click there pins/unpins it
      const open = !dd.classList.contains('open');
      dd.classList.toggle('shut', !open);
      setDd(open);
    });
    dd.addEventListener('mouseleave', () => { dd.classList.remove('shut'); setDd(false); });
    dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget)) setDd(false); });
    document.addEventListener('click', (e) => { if (!dd.contains(e.target)) setDd(false); });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dd.contains(document.activeElement)) { dd.classList.add('shut'); setDd(false); ddBtn.focus(); }
    });
  }

  // Build request form: idea buttons fill the box; Send opens WhatsApp or email with the request written out.
  const ask = document.getElementById('askForm');
  if (ask) {
    const what = ask.elements.what;
    ask.querySelectorAll('.ask-ideas button').forEach((b) => b.addEventListener('click', () => {
      what.value = what.value.trim() ? what.value.trim() + '\n' + b.textContent : b.textContent;
      what.focus();
    }));
    ask.addEventListener('submit', (e) => {
      e.preventDefault();
      const via = (e.submitter && e.submitter.value) || 'wa';
      const name = ask.elements.name.value.trim(), biz = ask.elements.biz.value.trim();
      const msg = 'Hi Studio AXD, I would like you to build:\n' + what.value.trim()
        + (name ? '\n\nName: ' + name : '') + (biz ? '\nBusiness: ' + biz : '');
      const url = via === 'mail'
        ? 'mailto:hello@studioaxd.com?subject=' + encodeURIComponent('Build request') + '&body=' + encodeURIComponent(msg)
        : 'https://wa.me/918762553585?text=' + encodeURIComponent(msg);
      if (window.gtag) gtag('event', 'build_request', { method: via });
      // window.open with 'noopener' always returns null, so clear opener by hand; fall back if a popup blocker stops it
      const win = via === 'mail' ? null : window.open(url, '_blank');
      if (win) win.opener = null; else location.href = url;
    });
  }

  // No motion wanted, or GSAP failed to load: show the static page.
  if (!motion || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove('motion');
    document.querySelectorAll('.act').forEach((a) => a.classList.add('on'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const E = 'expo.out';

  /* ---------- 1. Hero entrance is plain CSS (styles.css, "HERO ENTRANCE") ---------- */

  /* ---------- 2. Hero word cycle: soft blur crossfade, not a slot machine ---------- */
  const langWords = gsap.utils.toArray('.lang-word');
  gsap.set(langWords, { autoAlpha: (i) => (i === 0 ? 1 : 0) });
  // one timeline (not setInterval) so swaps never pile up when the tab is in the background
  const cycle = gsap.timeline({ repeat: -1, delay: 1.2 });
  langWords.forEach((cur, i) => {
    const next = langWords[(i + 1) % langWords.length];
    cycle.to(cur, { autoAlpha: 0, yPercent: -18, filter: 'blur(6px)', duration: 0.45, ease: 'power2.in' }, '+=2.4')
      .fromTo(next, { autoAlpha: 0, yPercent: 18, filter: 'blur(6px)' },
        { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', immediateRender: false });
  });

  // homepage-only sections; inner pages skip them
  if (document.querySelector('.story')) {
  /* ---------- 3. Pinned story: message, AI reads it, reply, lead ---------- */
  const acts = gsap.utils.toArray('.act');
  const ps = document.getElementById('ps');
  const setAct = (n) => acts.forEach((a, k) => a.classList.toggle('on', k === n));
  const setTyping = (on) => { ps.textContent = on ? 'typing...' : 'online'; ps.classList.toggle('typing', on); };

  function storyTimeline() {
    gsap.set(['#sIn', '#sOut', '#sType'], { opacity: 0, y: 16 });
    gsap.set('#sType', { display: 'flex' });
    gsap.set('.chip', { opacity: 0, x: 0, y: 0, scale: 0.6 });
    gsap.set('#lead', { opacity: 0, x: 60 });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.addLabel('a0')
      .to('#sIn', { opacity: 1, y: 0, duration: 1 })
      .addLabel('a1', '+=0.4')
      .to('.chip', { opacity: 1, scale: 1, x: (i, el) => parseFloat(getComputedStyle(el).getPropertyValue('--x')), y: (i, el) => parseFloat(getComputedStyle(el).getPropertyValue('--y')), duration: 1.4, stagger: 0.15, ease: 'expo.out' }, 'a1')
      .addLabel('a2', '+=0.5')
      .to('.chip', { opacity: 0, scale: 0.8, duration: 0.6, stagger: 0.05 }, 'a2')
      .to('#sType', { opacity: 1, y: 0, duration: 0.5 }, 'a2+=0.3')
      .to('#sType', { opacity: 0, height: 0, padding: 0, margin: 0, duration: 0.3 }, 'a2+=1.3')
      .to('#sOut', { opacity: 1, y: 0, duration: 0.9 }, 'a2+=1.4')
      .addLabel('a3', '+=0.4')
      .to('#lead', { opacity: 1, x: 0, duration: 1.2, ease: 'expo.out' }, 'a3')
      .from('.lead-new', { backgroundColor: 'rgba(255,79,31,.18)', duration: 1.2 }, 'a3+=0.4')
      .to({}, { duration: 0.6 });
    return tl;
  }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px)', () => {
    const tl = storyTimeline();
    const marks = ['a0', 'a1', 'a2', 'a3'].map((l) => tl.labels[l] / tl.duration());
    const typingFrom = tl.labels.a2 / tl.duration() + 0.3 / tl.duration();
    const typingTo = (tl.labels.a2 + 1.4) / tl.duration();
    ScrollTrigger.create({
      trigger: '.story-inner', start: 'top top', end: '+=2800', pin: true, scrub: 0.8, animation: tl,
      onUpdate(self) {
        const p = self.progress;
        let n = 0; marks.forEach((m, k) => { if (p >= m - 0.02) n = k; });
        setAct(n);
        setTyping(p > typingFrom && p < typingTo);
      },
    });
    setAct(0);
  });
  mm.add('(max-width: 960px)', () => {
    acts.forEach((a) => a.classList.add('on'));
    const tl = storyTimeline();
    tl.pause();
    ScrollTrigger.create({ trigger: '.stage', start: 'top 70%', once: true, onEnter: () => tl.timeScale(1.4).play() });
  });

  /* ---------- 4. Workflow graph draws itself ---------- */
  const paths = gsap.utils.toArray('.g-path');
  paths.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
  gsap.set('.g-flow', { opacity: 0 });
  gsap.timeline({ scrollTrigger: { trigger: '#graph', start: 'top 75%', end: 'center 45%', scrub: 0.6 } })
    .from('.g-node', { opacity: 0, y: 24, scale: 0.92, transformOrigin: 'center', stagger: 0.25, duration: 1 })
    .to(paths, { strokeDashoffset: 0, stagger: 0.25, duration: 1, ease: 'none' }, 0.3)
    .set('.g-path.g-dash', { strokeDasharray: '5 6' })
    .to('.g-flow', { opacity: 1, duration: 0.3 });

  /* ---------- 5. Sample website assembles itself ---------- */
  gsap.timeline({ scrollTrigger: { trigger: '#browser', start: 'top 80%', end: 'bottom 60%', scrub: 0.7 } })
    .from('#browser', { y: 80, rotateX: 8, transformPerspective: 1200, opacity: 0.4, duration: 1 })
    .from('.bp-nav > *', { opacity: 0, y: -10, stagger: 0.1, duration: 0.5 }, 0.4)
    .from('.bp-h', { opacity: 0, y: 20, stagger: 0.15, duration: 0.6 }, 0.7)
    .from('.bp-p', { scaleX: 0, transformOrigin: 'left', stagger: 0.1, duration: 0.5 }, 1)
    .from('.bp-cta', { opacity: 0, scale: 0.8, duration: 0.4 }, 1.2)
    .from('.bp-img', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8 }, 0.9)
    .from('.bp-cards span', { opacity: 0, y: 30, stagger: 0.1, duration: 0.5 }, 1.3);

  }

  /* ---------- 6. Headings, services, process, contact ---------- */
  gsap.utils.toArray('.h-big, .sub, .ticks li:not(.case li), .ag-grid p').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 40, duration: 1.2, ease: E, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  if (document.querySelector('.build-grid')) gsap.from('.build', { opacity: 0, y: 40, duration: 1.1, ease: E, stagger: 0.1, scrollTrigger: { trigger: '.build-grid', start: 'top 82%' } });
  gsap.from('.pre-mega', { opacity: 0, y: 20, duration: 1, ease: E, scrollTrigger: { trigger: '.pre-mega', start: 'top 90%' } });
  if (document.querySelector('.svc')) gsap.from('.svc li', { opacity: 0, y: 50, duration: 1.1, ease: E, stagger: 0.12, scrollTrigger: { trigger: '.svc', start: 'top 80%' } });
  if (document.querySelector('.steps')) {
  gsap.to('#stepFill', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 60%', scrub: 0.5 } });
  gsap.from('.step', { opacity: 0, y: 30, duration: 1, ease: E, stagger: 0.15, scrollTrigger: { trigger: '.steps', start: 'top 80%' } });
  }
  gsap.from('.mega a', { yPercent: 60, opacity: 0, duration: 1.4, ease: E, scrollTrigger: { trigger: '.mega', start: 'top 85%' } });
  gsap.from('.c-grid > *', { opacity: 0, y: 24, duration: 1, ease: E, stagger: 0.1, scrollTrigger: { trigger: '.c-grid', start: 'top 90%' } });
})();

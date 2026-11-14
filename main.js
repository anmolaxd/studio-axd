// Studio AXD motion. Content is fully readable without this file; it only adds movement.
(() => {
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const nav = document.querySelector('.nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });

  // No motion wanted, or GSAP failed to load: show the static page.
  if (!motion || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove('motion');
    document.querySelectorAll('.act').forEach((a) => a.classList.add('on'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.set('.lang-word', { y: 0, yPercent: (i) => (i === 0 ? 0 : 140) });
  const E = 'expo.out';

  /* ---------- 1. Opening sequence (once per browser session) ---------- */
  const intro = document.getElementById('intro');
  let seen = false;
  try { seen = sessionStorage.getItem('axd-intro') === '1'; sessionStorage.setItem('axd-intro', '1'); } catch (e) { seen = true; }

  function heroIn() {
    gsap.from('.hero-title .w, .lang', { yPercent: 110, duration: 1.3, ease: E, stagger: 0.07 });
    gsap.from('.k-anim', { opacity: 0, y: 16, duration: 1, ease: E, delay: 0.5, stagger: 0.1 });
    gsap.from('.nav', { opacity: 0, y: -10, duration: 1, ease: E, delay: 0.3 });
    cycleLanguages();
  }

  if (!seen) {
    intro.classList.add('play');
    document.body.style.overflow = 'hidden';
    const out = document.getElementById('introOut');
    const words = 'Namaskara! Demo Dental Clinic ninda. Saturday teeth cleaning appointment bagge namma team confirm maduttaare. Nimma hesaru enu?'.split(' ');
    const tl = gsap.timeline({ onComplete: endIntro });
    tl.to('#introIn', { opacity: 1, y: 0, duration: 0.6, ease: E, delay: 0.3 })
      .to(out, { opacity: 1, duration: 0.3 }, '+=0.5');
    words.forEach((w) => tl.call(() => { out.textContent += (out.textContent ? ' ' : '') + w; }, null, '+=0.07'));
    tl.to(intro, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' }, '+=0.7');
    document.getElementById('introSkip').addEventListener('click', () => { tl.kill(); endIntro(); });
    function endIntro() {
      intro.classList.remove('play');
      document.body.style.overflow = '';
      heroIn();
    }
  } else {
    heroIn();
  }

  /* ---------- 2. Hero language cycle: English / Kannada / Hindi ---------- */
  function cycleLanguages() {
    const words = gsap.utils.toArray('.lang-word');
    let i = 0;
    setInterval(() => {
      const cur = words[i], next = words[(i + 1) % words.length];
      gsap.to(cur, { yPercent: -140, duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo(next, { yPercent: 140 }, { yPercent: 0, duration: 0.8, ease: 'expo.inOut' });
      i = (i + 1) % words.length;
    }, 2200);
  }

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

  /* ---------- 6. Headings, services, process, contact ---------- */
  gsap.utils.toArray('.h-big, .sub, .ticks li:not(.case li), .ag-grid p').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 40, duration: 1.2, ease: E, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.from('.build', { opacity: 0, y: 40, duration: 1.1, ease: E, stagger: 0.1, scrollTrigger: { trigger: '.build-grid', start: 'top 82%' } });
  gsap.from('.pre-mega', { opacity: 0, y: 20, duration: 1, ease: E, scrollTrigger: { trigger: '.pre-mega', start: 'top 90%' } });
  gsap.from('.svc li', { opacity: 0, y: 50, duration: 1.1, ease: E, stagger: 0.12, scrollTrigger: { trigger: '.svc', start: 'top 80%' } });
  gsap.to('#stepFill', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 60%', scrub: 0.5 } });
  gsap.from('.step', { opacity: 0, y: 30, duration: 1, ease: E, stagger: 0.15, scrollTrigger: { trigger: '.steps', start: 'top 80%' } });
  gsap.from('.mega a', { yPercent: 60, opacity: 0, duration: 1.4, ease: E, scrollTrigger: { trigger: '.mega', start: 'top 85%' } });
  gsap.from('.c-grid > *', { opacity: 0, y: 24, duration: 1, ease: E, stagger: 0.1, scrollTrigger: { trigger: '.c-grid', start: 'top 90%' } });
})();

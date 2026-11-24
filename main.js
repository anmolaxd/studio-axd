// Studio AXD. The page is complete without this file; it adds the menu, the live demo, the form and light motion.
(() => {
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const nav = document.querySelector('.nav');
  const WA = 'https://wa.me/918762553585';

  // WhatsApp links open with a message that fits the page (set on <body data-wa>), so we know what they came for.
  const waMsg = document.body.dataset.wa;
  if (waMsg) document.querySelectorAll('a[href="' + WA + '"]').forEach((a) => { a.href = WA + '?text=' + encodeURIComponent(waMsg); });

  // Top bar: frosts after 10px; on phones it slides away going down and comes back going up.
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 10);
    if (!nav.classList.contains('open')) {
      if (y > 200 && y > lastY + 4) nav.classList.add('hide');
      else if (y < lastY - 4 || y <= 200) nav.classList.remove('hide');
    }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Phone menu
  const menuBtn = document.querySelector('.menu-btn');
  const mnav = document.getElementById('mnav');
  if (menuBtn && mnav) {
    const setMenu = (open) => {
      root.classList.toggle('menu-open', open);
      nav.classList.toggle('open', open);
      if (open) nav.classList.remove('hide');
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

  // Services drop-down: hover shows it (CSS); click pins it; Escape, click outside or leaving closes it.
  const dd = document.querySelector('.dd');
  if (dd) {
    const btn = dd.querySelector('.dd-btn');
    const setDd = (open) => { dd.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', () => { const open = !dd.classList.contains('open'); dd.classList.toggle('shut', !open); setDd(open); });
    dd.addEventListener('mouseleave', () => { dd.classList.remove('shut'); setDd(false); });
    dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget)) setDd(false); });
    document.addEventListener('click', (e) => { if (!dd.contains(e.target)) setDd(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && dd.contains(document.activeElement)) { dd.classList.add('shut'); setDd(false); btn.focus(); } });
  }

  // Project form: sends nothing to us directly. It opens WhatsApp or email with the request written out.
  const form = document.getElementById('projectForm');
  if (form) {
    const err = form.querySelector('.form-err');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form.elements;
      const problem = f.problem.value.trim();
      if (!problem) { err.hidden = false; f.problem.focus(); return; }
      err.hidden = true;
      const need = (form.querySelector('input[name="need"]:checked') || {}).value;
      const msg = 'Hi Studio AXD,' + (need ? '\nI need: ' + need : '') + '\n\n' + problem
        + (f.name.value.trim() ? '\n\nName: ' + f.name.value.trim() : '')
        + (f.biz.value.trim() ? '\nBusiness: ' + f.biz.value.trim() : '');
      const via = (e.submitter && e.submitter.value) || 'wa';
      if (window.gtag) gtag('event', 'build_request', { method: via, need: need || 'none' });
      if (via === 'mail') { location.href = 'mailto:hello@studioaxd.com?subject=' + encodeURIComponent('Project enquiry' + (need ? ': ' + need : '')) + '&body=' + encodeURIComponent(msg); return; }
      const url = WA + '?text=' + encodeURIComponent(msg);
      const win = window.open(url, '_blank'); // 'noopener' would return null, so clear opener by hand
      if (win) win.opener = null; else location.href = url;
    });
  }

  // Phone contact bar: show after the first screen, hide while the contact section is on screen.
  const mbar = document.querySelector('.mbar');
  const contact = document.getElementById('contact');
  if (mbar && 'IntersectionObserver' in window) {
    let past = false, atContact = false;
    const upd = () => mbar.classList.toggle('show', past && !atContact);
    addEventListener('scroll', () => { past = scrollY > innerHeight * .7; upd(); }, { passive: true });
    if (contact) new IntersectionObserver(([en]) => { atContact = en.isIntersecting; upd(); }).observe(contact);
  }

  // Scroll reveal, once per element.
  if (motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv').forEach((el) => io.observe(el));
  } else document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'));

  // Workflow diagram draws itself once when it comes into view (CSS does the drawing).
  const graph = document.getElementById('graph');
  if (graph) {
    if (motion && 'IntersectionObserver' in window) {
      const gio = new IntersectionObserver(([en]) => { if (en.isIntersecting) { graph.classList.add('drawn'); gio.disconnect(); } }, { threshold: .4 });
      gio.observe(graph);
    } else graph.classList.add('drawn');
  }

  /* ---------- LIVE BOARD (homepage hero demo) ----------
     Each business type is one example enquiry: the chat, what the system logged, and the owner's list.
     The HTML already holds the clinic example, so the page reads fine without this script. */
  const board = document.getElementById('board');
  if (!board) return;
  const S = {
    clinic: {
      name: 'Demo Dental Clinic', av: 'DC',
      chat: [['in', 'Namaskara, teeth cleaning ge appointment beku. Saturday sigutha?', '10:42 pm'], ['out', 'Namaskara! Saturday 11:00 am or 4:30 pm free ide. Yavudu beku?', '10:42 pm'], ['in', '4:30 please', '10:43 pm'], ['out', 'Done. Saturday 4:30 pm booked. Friday evening reminder kalisthivi.', '10:43 pm']],
      log: [['10:42:03', 'Message received', 'WhatsApp, clinic closed'], ['10:42:04', 'Understood', '', [['Language', 'Kannada'], ['Wants', 'Teeth cleaning'], ['When', 'Saturday']], 1], ['10:42:06', 'Replied with free slots', 'From the clinic calendar'], ['10:43:12', 'Booked Saturday 4:30 pm', 'Added to the calendar'], ['10:43:13', 'Reminder scheduled', 'Friday, 6:00 pm']],
      lead: ['Teeth cleaning, Sat 4:30 pm', 'Kannada · Booked by assistant', 'Reminder set for Friday'], old: ['Root canal price question', 'English · Asked for a call back'],
    },
    coaching: {
      name: 'Demo Coaching Centre', av: 'CC',
      chat: [['in', 'Hi, is there a NEET long-term batch? What are the timings?', '9:15 pm'], ['out', 'Yes. Morning batch 7 to 10 am, evening batch 4 to 7 pm. Would you like to visit for a free counselling session?', '9:15 pm'], ['in', 'Yes, Sunday morning', '9:16 pm'], ['out', 'Booked: Sunday 11:00 am. Please bring the latest marks card.', '9:16 pm']],
      log: [['21:15:20', 'Message received', 'Parent, after office hours'], ['21:15:21', 'Understood', '', [['Course', 'NEET long-term'], ['Asks', 'Timings'], ['Who', 'Parent']], 1], ['21:15:23', 'Answered from approved facts', 'Batch timings only, no invented fees'], ['21:16:40', 'Counselling visit booked', 'Sunday 11:00 am'], ['21:16:41', 'Front office alerted', 'Call back list for Monday']],
      lead: ['NEET long-term, visit Sun 11 am', 'English · Parent · Counselling booked', 'Call before Sunday to confirm'], old: ['KCET crash course fees', 'Kannada · Wants a call back'],
    },
    gym: {
      name: 'Demo Fitness Studio', av: 'FS',
      chat: [['in', 'Do you have a trial session? I can only come after 7 pm', '11:05 pm'], ['out', 'Yes, one trial session. 7:30 pm tomorrow or Thursday?', '11:05 pm'], ['in', 'Tomorrow', '11:06 pm'], ['out', 'Booked for tomorrow 7:30 pm. Please bring shoes and a towel.', '11:06 pm']],
      log: [['23:05:10', 'Message received', 'Instagram ad, gym closed'], ['23:05:11', 'Understood', '', [['Wants', 'Trial session'], ['When', 'After 7 pm'], ['Type', 'New member']], 1], ['23:05:13', 'Offered trial slots', 'From the trainer schedule'], ['23:06:02', 'Trial booked', 'Tomorrow 7:30 pm'], ['23:06:03', 'Follow-up scheduled', 'Membership offer after the trial']],
      lead: ['Trial, tomorrow 7:30 pm', 'English · From Instagram ad', 'Send membership plans after trial'], old: ['Personal training price', 'Hindi · Asked for a call back'],
    },
    salon: {
      name: 'Demo Salon', av: 'DS',
      chat: [['in', 'Haircut and beard trim on Sunday morning?', '8:50 am'], ['out', 'Sunday 10:00 am or 11:30 am with our senior stylist. Which one?', '8:50 am'], ['in', '10 am', '8:51 am'], ['out', 'Booked: Sunday 10:00 am, haircut and beard trim. See you then.', '8:51 am']],
      log: [['08:50:31', 'Message received', 'While staff are with customers'], ['08:50:32', 'Understood', '', [['Wants', 'Haircut, beard'], ['When', 'Sunday morning'], ['Staff', 'Any']], 1], ['08:50:34', 'Offered free chairs', 'From the booking sheet'], ['08:51:20', 'Booked Sunday 10:00 am', 'Chair 2 blocked'], ['08:51:21', 'Reminder scheduled', 'Saturday evening']],
      lead: ['Haircut and beard, Sun 10 am', 'English · Booked by assistant', 'Reminder set for Saturday'], old: ['Bridal package enquiry', 'Kannada · Wants a call back'],
    },
  };
  /* ORBIT: chips ride the sphere's ring (the business with its system around it) and follow the board's selected example.
     Ring = circle of radius 0.64 x sphere width tilted 74deg, so on screen it is an ellipse with height factor cos(74deg). */
  const orbWrap = document.querySelector('.orb-wrap'), chips = orbWrap ? [...orbWrap.querySelectorAll('.orb-chip')] : [];
  const moments = {
    clinic: ['New enquiry, 10:42 pm', 'Booked: Sat 4:30 pm', 'Reminder sent', 'Review requested'],
    coaching: ['Parent asked, 9:15 pm', 'Visit booked: Sun 11 am', 'Front office alerted', 'Fee reminder sent'],
    gym: ['Instagram lead, 11:05 pm', 'Trial booked: 7:30 pm', 'Membership plans sent', 'Renewal reminder sent'],
    salon: ['Chair request, 8:50 am', 'Booked: Sun 10 am', 'Reminder sent', 'Review requested'],
  };
  let orbSet = 'clinic';
  if (motion && chips.length && getComputedStyle(orbWrap).display !== 'none') {
    const K = Math.cos(74 * Math.PI / 180), R = 64, lap = 30000, t0 = performance.now();
    const state = chips.map((c, i) => ({ c, n: i, last: -1 }));
    const tick = (now) => {
      state.forEach((s, i) => {
        const turn = (now - t0) / lap + i / chips.length + 0.08; // 0.08 starts the first chip on the front
        const a = turn * 2 * Math.PI, sin = Math.sin(a), d = (sin + 1) / 2; // d: 0 at the back, 1 at the front
        const round = Math.floor(turn + 0.25); // changes when the chip is hidden behind the sphere (sin = -1)
        if (round !== s.last) { if (s.last !== -1) s.n += chips.length; s.last = round; s.c.textContent = moments[orbSet][s.n % 4]; }
        s.c.style.setProperty('--x', (50 + R * Math.cos(a)) + '%');
        s.c.style.setProperty('--y', (50 + R * K * sin) + '%');
        s.c.style.setProperty('--s', (0.82 + 0.18 * d).toFixed(3));
        s.c.style.setProperty('--o', (0.35 + 0.65 * d).toFixed(3));
        s.c.classList.toggle('behind', sin < 0);
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const chat = board.querySelector('.chat-body'), log = board.querySelector('.log'), owner = board.querySelector('.owner-list');
  const nameEl = board.querySelector('.chat-bar b'), avEl = board.querySelector('.chat-bar .av'), stEl = board.querySelector('.chat-bar small');
  const tabs = [...board.querySelectorAll('.board-tabs button')];
  let timers = [], current = 'clinic', started = false;

  function render(key, animate) {
    timers.forEach(clearTimeout); timers = [];
    const s = S[key];
    nameEl.textContent = s.name; avEl.textContent = s.av; stEl.textContent = 'Closed · assistant on';
    chat.replaceChildren(); log.replaceChildren(); owner.replaceChildren();
    const steps = [];
    const after = [[0, 1], [2], [3], [4]]; // log lines that follow each chat message
    s.chat.forEach(([side, text, t], i) => {
      const b = el('p', 'b step b-' + side, text); b.append(el('time', null, t));
      if (side === 'out' && animate) { const ty = el('div', 'b b-typing step'); ty.innerHTML = '<i></i><i></i><i></i>'; steps.push([ty, chat, 'typing']); }
      steps.push([b, chat]);
      after[i].forEach((j) => steps.push([logItem(s.log[j]), log]));
    });
    const row = el('div', 'lead-row new step'); row.append(el('b', null, s.lead[0]), el('span', null, s.lead[1]), el('span', 'next', s.lead[2]));
    const old = el('div', 'lead-row'); old.append(el('b', null, s.old[0]), el('span', null, s.old[1]));
    owner.append(old);
    steps.push([row, owner, 'first']);
    if (!animate) { steps.forEach(([n, p, k]) => { if (k === 'typing') return; k === 'first' ? p.prepend(n) : p.append(n); }); return; }
    let t = 300;
    steps.forEach(([n, p, k]) => {
      timers.push(setTimeout(() => {
        chat.querySelectorAll('.b-typing').forEach((x) => x.remove());
        n.classList.add('pending'); k === 'first' ? p.prepend(n) : p.append(n);
        requestAnimationFrame(() => requestAnimationFrame(() => n.classList.remove('pending')));
      }, t));
      t += k === 'typing' ? 900 : (p === chat ? 700 : 450);
    });
  }
  function logItem([t, b, sub, tags, ai]) {
    const li = el('li', 'step' + (ai ? ' ai' : '')); li.append(el('time', null, t));
    const d = el('div'); d.append(el('b', null, b));
    if (sub) d.append(el('span', null, sub));
    if (tags) { const tg = el('div', 'tags'); tags.forEach(([k, v]) => { const s = el('span'); s.append(el('em', null, k), v); tg.append(s); }); d.append(tg); }
    li.append(d); return li;
  }
  const select = (key, animate) => {
    current = key; orbSet = key;
    if (!motion) chips.forEach((c, i) => { c.textContent = moments[key][i]; });
    tabs.forEach((t) => { const on = t.dataset.k === key; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    render(key, animate && motion);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t.dataset.k, true));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n.dataset.k, true);
    });
  });
  board.querySelector('.replay').addEventListener('click', () => select(current, true));
  // first play when the board scrolls into view
  if (motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting && !started) { started = true; select('clinic', true); io.disconnect(); } }, { threshold: .35 });
    io.observe(board);
  }
})();

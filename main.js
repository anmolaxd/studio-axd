// Studio AXD: small, dependency-free motion. Everything degrades to static content.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Reveal sections once as they scroll into view
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// 2. Hero phone: replays the two real demo-line conversations from 13 Nov 2026
const convos = [
  {
    customer: 'Hi, root canal cost how much? Sunday open aa?',
    reply: 'Hi! Welcome to Demo Dental Clinic. Root canal cost matte Sunday timings bagge namma team confirm madtare. Could you please tell us your name?',
    note: 'Wants root canal price, asked about Sunday timings.',
    intent: 'Price question', lang: 'Kanglish', time: '13:39',
  },
  {
    customer: 'Namaskara, teeth cleaning ge appointment beku, Saturday sigutha?',
    reply: 'Namaskara! Demo Dental Clinic ninda. Saturday teeth cleaning appointment bagge namma team confirm maduttaare. Nimma hesaru enu?',
    note: 'Wants a teeth cleaning appointment on Saturday.',
    intent: 'Appointment', lang: 'Kannada', time: '13:55',
  },
];

const chat = document.getElementById('chat');
const status = document.getElementById('chatStatus');
const noteCard = document.getElementById('noteCard');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function bubble(text, side, time) {
  const el = document.createElement('div');
  el.className = `msg ${side}`;
  el.textContent = text;
  const t = document.createElement('time');
  t.textContent = time;
  el.appendChild(t);
  chat.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  return el;
}

function showNote(c) {
  document.getElementById('noteText').textContent = c.note;
  document.getElementById('tagIntent').textContent = c.intent;
  document.getElementById('tagLang').textContent = c.lang;
  noteCard.classList.add('show');
}

async function play() {
  if (!chat) return;
  if (reduceMotion) { // static version: show the first conversation, no movement
    bubble(convos[0].customer, 'in', convos[0].time).classList.add('show');
    bubble(convos[0].reply, 'out', convos[0].time).classList.add('show');
    showNote(convos[0]);
    return;
  }
  let i = 0;
  for (;;) {
    const c = convos[i % convos.length];
    chat.innerHTML = '';
    noteCard.classList.remove('show');
    await wait(900);
    bubble(c.customer, 'in', c.time);
    await wait(1100);
    status.textContent = 'typing...';
    status.classList.add('typing');
    const typing = document.createElement('div');
    typing.className = 'typing-bubble';
    typing.innerHTML = '<i></i><i></i><i></i>';
    chat.appendChild(typing);
    requestAnimationFrame(() => typing.classList.add('show'));
    await wait(1700);
    typing.remove();
    status.textContent = 'online';
    status.classList.remove('typing');
    bubble(c.reply, 'out', c.time);
    await wait(900);
    showNote(c);
    await wait(5200);
    i++;
  }
}
play();

// 3. "How it works": light up each step in turn while the section is on screen
const flow = document.getElementById('flow');
if (flow && !reduceMotion) {
  const steps = flow.querySelectorAll('.step');
  let n = 0, timer = null;
  const tick = () => { steps.forEach((s, k) => s.classList.toggle('active', k === n)); n = (n + 1) % steps.length; };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !timer) { tick(); timer = setInterval(tick, 1200); }
    else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
  }, { threshold: 0.3 }).observe(flow);
}

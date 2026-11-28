// POST /api/enquiry: the contact form. Checks the fields and sends them to Anmol on Telegram.
// Secrets (Cloudflare Pages > Settings > Variables and secrets): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
const LIMITS = { need: 40, problem: 1500, name: 80, biz: 120, reply_to: 120 };

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const reply = (ok, status) => wantsJson
    ? Response.json({ ok }, { status })
    : Response.redirect(new URL(ok ? '/thanks' : '/#contact', request.url), 303);

  // only accept posts from our own pages
  const origin = request.headers.get('Origin');
  if (!origin || new URL(origin).host !== new URL(request.url).host) return reply(false, 403);

  let form;
  try { form = await request.formData(); } catch { return reply(false, 400); }
  if (form.get('website')) return reply(true, 200); // honeypot filled = bot; pretend it worked

  const f = {};
  for (const [k, max] of Object.entries(LIMITS)) f[k] = String(form.get(k) || '').trim().slice(0, max);
  if (!f.problem || !f.reply_to) return reply(false, 400);

  const text = [
    'New website enquiry (studioaxd.com)',
    f.need && 'Needs: ' + f.need,
    'Reply to: ' + f.reply_to,
    f.name && 'Name: ' + f.name,
    f.biz && 'Business: ' + f.biz,
  ].filter(Boolean).join('\n') + '\n\n' + f.problem;

  const tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }), // plain text, no parse_mode, so visitor text cannot inject formatting
  }).catch((e) => { console.error('telegram fetch failed', String(e)); return null; });
  if (tg && !tg.ok) console.error('telegram refused', tg.status, await tg.text()); // Telegram's reason, never the token

  return tg && tg.ok ? reply(true, 200) : reply(false, 502);
}

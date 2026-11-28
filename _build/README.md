# How the site is made

Do not edit anything in `public/` by hand: it is rebuilt from here. `public/` is the only folder that goes live.

- `pages/<page>.html`: the content of each page (everything between the top bar and the contact form).
- `heads/<page>.html`: each page's Google title, description and structured data.
- `assets/styles.css`, `assets/main.js`: the readable CSS and JavaScript. The build writes small, comment-free copies to `public/`.
- `build.py`: the shared top bar, phone menu, contact form and footer, plus the menu lists.
- `../functions/api/enquiry.js`: the contact form's server code (runs on Cloudflare, sends each enquiry to Telegram).

After any change, run this in PowerShell from the site folder (first time only: `pip install rjsmin rcssmin`):

    python _build/build.py

Then commit and push. Cloudflare Pages publishes `public/` and `functions/` automatically.

Links are clean: write `/pricing`, not `pricing.html`. New page: add `pages/x.html` and `heads/x.html`, add it to SERVICES or INDUSTRIES in build.py if it belongs in the menu, add `https://studioaxd.com/x` to `public/sitemap.xml`, then build.

Test locally with the real Cloudflare server: `npx wrangler pages dev public` (put fake TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID in `.dev.vars`).

"""Builds the site's HTML pages. Run from the site folder:  python _build/build.py

Each page = heads/<page>.html (title, meta, schema) + pages/<page>.html (the <main> content)
+ the shared parts below (top bar, phone menu, contact form, footer). Edit the parts here once
and every page gets the change. Everything is written to public/, the only folder that goes live
(Cloudflare Pages). CSS and JS sources are in _build/assets/; public/ gets minified copies.
The first line of a page file can be a settings comment, for example:
<!--{"nav": "work", "wa": "Hi, I saw your work page", "need": "Website", "contact": false}-->
Needs: pip install rjsmin rcssmin
"""
import hashlib, json, pathlib, re
import rcssmin, rjsmin

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent / "public"
# version tag on CSS/JS links = hash of their contents, so browsers refetch exactly when they change
V = hashlib.sha1(b"".join((HERE / "assets" / n).read_bytes() for n in ("styles.css", "main.js"))).hexdigest()[:8]


def url(f):
    """menu file name -> clean link: index.html -> /, pricing.html -> /pricing"""
    return "/" if f == "index.html" else "/" + f[:-5] if f.endswith(".html") else f

WA = "https://wa.me/918762553585"
LOGO = '<span class="logo">A<span class="slice" data-t="X">X</span>D<span class="logo-sub">studio</span></span>'

SERVICES = [  # (file, name, line)
    ("websites.html", "Websites", "Fast, phone-first sites that bring enquiries"),
    ("whatsapp-automation.html", "WhatsApp automation", "Instant replies in English and Kannada"),
    ("lead-automation.html", "Lead capture", "Every enquiry saved and followed up"),
    ("ai-assistants.html", "AI assistants", "Documents, data and drafts, under your rules"),
    ("custom-software.html", "Custom software", "Portals, ERPs, payments and dashboards"),
]
INDUSTRIES = [
    ("coaching-centres.html", "Coaching centres", "Admissions, ERP, AI marking, mock tests"),
    ("clinics.html", "Clinics", "Bookings, reminders and patient enquiries"),
    ("gyms.html", "Gyms", "Trials, renewals and the front desk"),
    ("agencies.html", "Agencies", "White-label builds under your brand"),
]
MAIN = [("builds.html", "Work", "work"), ("pricing.html", "Pricing", "pricing"), ("about.html", "About", "about")]

GA = """<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-WKDD9727"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href'), ev = /wa\\.me|whatsapp/.test(h) ? 'whatsapp_click' : /^mailto:/.test(h) ? 'email_click' : /^tel:/.test(h) ? 'phone_click' : '';
    if (ev) gtag('event', ev, { link_url: h, page_path: location.pathname });
  });
</script>"""


def cur(href, page):
    return ' aria-current="page"' if href == page else ""


def header(page, cfg):
    col = lambda items: "".join(f'<a href="{url(h)}"{cur(h, page)}><b>{n}</b><span>{d}</span></a>' for h, n, d in items)
    svc_current = page in [h for h, *_ in SERVICES + INDUSTRIES]
    links = "".join(f'<a href="{url(h)}"{cur(h, page)}>{n}</a>' for h, n, _ in MAIN)
    home = "#top" if page == "index.html" else "/"
    return f"""<a class="skip" href="#main">Skip to content</a>
<header class="nav" id="top">
  <div class="nav-in">
  <a href="{home}" aria-label="Studio AXD home">{LOGO}</a>
  <nav aria-label="Main">
    <div class="dd"><button class="dd-btn{' is-current' if svc_current else ''}" type="button" aria-expanded="false" aria-controls="ddp">Services<svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></button><div class="dd-panel" id="ddp"><div class="dd-in"><div class="dd-col"><p class="dd-k">What we build</p>{col(SERVICES)}</div><div class="dd-col"><p class="dd-k">Who it is for</p>{col(INDUSTRIES)}</div><a class="dd-card" href="#contact"><span class="dd-k">Not sure what you need?</span><b>Describe the problem. We reply the same day with how we would solve it.</b><span class="go">Start here <span aria-hidden="true">&rarr;</span></span></a></div></div></div>
    {links}
  </nav>
  <a class="btn btn-sm nav-cta" href="{WA}" target="_blank" rel="noopener">WhatsApp us</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Open menu"><span class="menu-txt">Menu</span><span class="menu-ico" aria-hidden="true"><i></i><i></i></span></button>
  </div>
</header>
<div class="mnav" id="mnav">
  <nav aria-label="Menu">
    <p class="mnav-k">What we build</p>
    <div class="mnav-sub">{"".join(f'<a href="{url(h)}"{cur(h, page)}>{n}</a>' for h, n, _ in SERVICES)}</div>
    <p class="mnav-k">Who it is for</p>
    <div class="mnav-sub">{"".join(f'<a href="{url(h)}"{cur(h, page)}>{n}</a>' for h, n, _ in INDUSTRIES)}</div>
    {links}
  </nav>
  <div class="mnav-foot">
    <a class="btn" href="{WA}" target="_blank" rel="noopener">Message us on WhatsApp <span class="arrow" aria-hidden="true">&rarr;</span></a>
    <p><a href="tel:+918762553585">+91 87625 53585</a> &middot; <a href="mailto:hello@studioaxd.com">hello@studioaxd.com</a></p>
  </div>
</div>"""


NEEDS = ["Website", "WhatsApp automation", "Custom software", "AI assistant", "Not sure yet"]


def contact(cfg):
    need = cfg.get("need", "")
    picks = "".join(
        f'<label><input type="radio" name="need" value="{n}"{" checked" if n == need else ""}><span>{n}</span></label>' for n in NEEDS)
    title = cfg.get("contact_title", 'Start with a 15-minute <span class="serif hl">demo.</span>')
    lede = cfg.get("contact_lede", "Tell us the problem in your own words. We reply the same day with how we would solve it, then show you a working demo on your own phone. The demo is free; every build is quoted in writing first.")
    return f"""<section class="sec deep contact" id="contact" aria-labelledby="contact-h">
  <div class="wrap contact-grid">
    <div>
      <p class="idx">Contact</p>
      <h2 class="h2" id="contact-h">{title}</h2>
      <p class="lede">{lede}</p>
      <div class="direct">
        <a href="{WA}" target="_blank" rel="noopener"><span>WhatsApp</span>+91 87625 53585</a>
        <a href="tel:+918762553585"><span>Call</span>+91 87625 53585</a>
        <a href="mailto:hello@studioaxd.com"><span>Email</span>hello@studioaxd.com</a>
        <p><span>Studio</span>Mysuru, Karnataka. Meetings across Mysuru; online across India.</p>
      </div>
    </div>
    <form class="form" id="projectForm" action="/api/enquiry" method="post">
      <fieldset><legend>What do you need?</legend><div class="picks">{picks}</div></fieldset>
      <div><label class="lbl" for="problem">What should it do for your business?</label>
      <textarea id="problem" name="problem" rows="5" maxlength="1500" required placeholder="Example: Parents message us all evening about fees and timings, and we reply the next morning."></textarea></div>
      <div class="row2">
        <label>Your name<input type="text" name="name" autocomplete="name" maxlength="80"></label>
        <label>Business and city<input type="text" name="biz" autocomplete="organization" maxlength="120" placeholder="Dental clinic, Mysuru"></label>
      </div>
      <label class="lbl">WhatsApp number or email<input type="text" name="reply_to" autocomplete="tel" maxlength="120" required placeholder="So we can reply"></label>
      <div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
      <p class="form-err" role="alert" hidden></p>
      <p class="form-ok" role="status" hidden></p>
      <div class="form-send">
        <button class="btn" type="submit" value="send">Send enquiry <span class="arrow" aria-hidden="true">&rarr;</span></button>
        <button class="alt" type="submit" value="wa" formnovalidate>or message us on WhatsApp</button>
      </div>
      <p class="note">Your message comes straight to our team and is used only to reply to you. See our <a href="/privacy">privacy policy</a>.</p>
    </form>
  </div>
</section>"""


def footer():
    col = lambda title, items: f'<div class="foot-col"><h2>{title}</h2>' + "".join(f'<a href="{url(h)}">{n}</a>' for h, n, *_ in items) + "</div>"
    studio = [("builds.html", "Work"), ("pricing.html", "Pricing"), ("process.html", "How we work"), ("about.html", "About"), ("#contact", "Contact")]
    return f"""<footer class="footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-col"><a href="/" aria-label="Studio AXD home">{LOGO}</a><p style="margin-top:16px;max-width:30ch">Websites, automation and custom software, built in Mysuru, Karnataka.</p></div>
      {col("What we build", SERVICES)}
      {col("Who it is for", INDUSTRIES)}
      {col("Studio", studio)}
    </div>
    <div class="foot-base"><p>&copy; 2026 Studio AXD &middot; Mysuru, Karnataka, India &middot; GSTIN 29IDDPP6207A1ZM</p><p><a href="/privacy">Privacy</a> &nbsp; <a href="/terms">Terms</a></p></div>
  </div>
</footer>
<div class="mbar" aria-label="Contact"><a class="btn" href="{WA}" target="_blank" rel="noopener">WhatsApp us</a><a class="btn btn-ink" href="tel:+918762553585">Call</a></div>"""


def tidy(html):
    """what visitors see in View Source: no comments, no indentation, no blank lines"""
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    return "\n".join(line.strip() for line in html.splitlines() if line.strip()) + "\n"


def build(page_file):
    name = page_file.name
    body = page_file.read_text(encoding="utf-8")
    cfg = {}
    m = re.match(r"<!--(\{.*?\})-->\n", body)
    if m:
        cfg = json.loads(m.group(1))
        body = body[m.end():]
    head = (HERE / "heads" / name).read_text(encoding="utf-8").strip()
    wa = cfg.get("wa", "Hi Studio AXD, I found you on your website.")
    out = f"""<!doctype html>
<html lang="en">
<head>
{GA}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{head}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;800&family=Geist+Mono:wght@500&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v={V}">
<script>
  document.documentElement.classList.add('js');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion');
</script>
</head>
<body data-wa="{wa}">
{header(name, cfg)}
<main id="main">
{body.strip()}
{contact(cfg) if cfg.get("contact", True) else ""}
</main>
{footer()}
<script src="/main.js?v={V}" defer></script>
</body>
</html>
"""
    (OUT / name).write_text(tidy(out), encoding="utf-8", newline="\n")
    return name


if __name__ == "__main__":
    pages = sorted((HERE / "pages").glob("*.html"))
    missing = [p.name for p in pages if not (HERE / "heads" / p.name).exists()]
    assert not missing, f"no head file for {missing}"
    assert "<pre" not in "".join(p.read_text(encoding="utf-8") for p in pages), "tidy() would break <pre> blocks"
    A = HERE / "assets"
    (OUT / "styles.css").write_text(rcssmin.cssmin((A / "styles.css").read_text(encoding="utf-8")), encoding="utf-8", newline="\n")
    (OUT / "main.js").write_text(rjsmin.jsmin((A / "main.js").read_text(encoding="utf-8")), encoding="utf-8", newline="\n")
    print("built:", ", ".join(build(p) for p in pages), "+ styles.css, main.js")

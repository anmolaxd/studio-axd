# How the site's pages are made

Do not edit the .html files in the main folder by hand: they are rebuilt from here.

- `pages/<page>.html`: the content of each page (everything between the top bar and the contact form).
- `heads/<page>.html`: each page's Google title, description and structured data.
- `build.py`: the shared top bar, phone menu, contact form and footer, plus the lists of services and industries used in the menus.

After any change, run this in PowerShell from the site folder:

    python _build/build.py

New page: add `pages/x.html` and `heads/x.html`, add it to SERVICES or INDUSTRIES in build.py if it belongs in the menu, add it to sitemap.xml, then build.
GitHub Pages does not publish folders whose names start with "_", so this folder never goes live.

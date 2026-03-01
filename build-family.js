// build-family.js
// Embeds private images as base64 into family-source.html, then staticrypt encrypts it.
// Run with: node build-family.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function toBase64(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' }[ext] || 'image/jpeg';
  return `data:${mime};base64,` + fs.readFileSync(filePath).toString('base64');
}

const p = (f) => toBase64(`Pictures/private/${f}`);
const pub = (f) => toBase64(`Pictures/${f}`);

const html = `<!DOCTYPE html>
<html lang="en" data-lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family — André Doelle</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d0d12; --surface: #16161f; --surface2: #1e1e2a;
      --gold: #c9a84c; --text: #e0dbd0; --muted: #7a7585; --radius: 12px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; font-weight: 300; line-height: 1.7; min-height: 100vh; }

    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.2rem 2.5rem;
      background: rgba(13,13,18,0.92); backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(201,168,76,0.12);
    }
    .nav-left { display: flex; align-items: center; gap: 1.5rem; }
    .nav-back { font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); text-decoration: none; transition: color 0.2s; }
    .nav-back:hover { color: var(--gold); }
    .nav-name { font-family: 'Playfair Display', serif; font-size: 1.15rem; letter-spacing: 0.06em; color: var(--gold); }
    .lang-toggle { display: flex; border: 1px solid rgba(201,168,76,0.5); border-radius: 20px; overflow: hidden; }
    .lang-btn { background: none; border: none; color: var(--muted); padding: 0.3rem 0.9rem; cursor: pointer; font-size: 0.78rem; font-family: 'Inter', sans-serif; letter-spacing: 0.1em; transition: all 0.2s; }
    .lang-btn.active { background: var(--gold); color: var(--bg); font-weight: 500; }

    .hero { padding: 8rem 2.5rem 4rem; max-width: 1100px; margin: 0 auto; }
    .section-label { font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.4rem; }
    h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.2rem,4vw,3.5rem); font-weight: 400; color: #fff; line-height: 1.15; margin-bottom: 1rem; }
    h2 { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 400; color: #fff; margin-bottom: 1.5rem; }
    .lead { color: rgba(224,219,208,0.7); font-size: 0.97rem; max-width: 520px; }

    .gallery-section { padding: 3rem 2.5rem; max-width: 1100px; margin: 0 auto; }

    .photo-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.1rem; margin-bottom: 3rem; }
    .photo-item { position: relative; border-radius: var(--radius); overflow: hidden; background: var(--surface); border: 1px solid rgba(255,255,255,0.04); cursor: zoom-in; }
    .photo-item.wide { grid-column: span 2; }
    .photo-item.full { grid-column: span 3; }
    .photo-item img { width: 100%; height: 300px; object-fit: cover; display: block; transition: transform 0.5s ease; }
    .photo-item.full img { height: 500px; object-fit: contain; background: #0d0d12; }
    .photo-item:hover img { transform: scale(1.04); }
    .photo-item::after { content: '⤢'; position: absolute; top: 0.7rem; right: 0.8rem; font-size: 1.1rem; color: rgba(255,255,255,0.7); opacity: 0; transition: opacity 0.2s; pointer-events: none; }
    .photo-item:hover::after { opacity: 1; }
    .photo-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.9rem 1rem; background: linear-gradient(transparent,rgba(0,0,0,0.78)); font-size: 0.82rem; color: rgba(255,255,255,0.9); }

    #lightbox { display: none; position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.92); cursor: zoom-out; align-items: center; justify-content: center; padding: 2rem; }
    #lightbox.open { display: flex; }
    #lightbox img { max-width: 92vw; max-height: 92vh; object-fit: contain; border-radius: 6px; box-shadow: 0 0 80px rgba(0,0,0,0.8); animation: lb-in 0.2s ease; }
    @keyframes lb-in { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
    #lightbox-close { position: fixed; top: 1.2rem; right: 1.5rem; font-size: 1.8rem; color: rgba(255,255,255,0.6); cursor: pointer; line-height: 1; transition: color 0.2s; }
    #lightbox-close:hover { color: #fff; }

    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.05); max-width: 1100px; margin: 0 auto; }
    footer { text-align: center; padding: 3rem 2.5rem 4rem; color: var(--muted); font-size: 0.83rem; }
    footer a { color: var(--gold); text-decoration: none; }

    html[data-lang="en"] [data-de] { display: none; }
    html[data-lang="de"] [data-en] { display: none; }

    @media (max-width: 800px) {
      nav { padding: 1rem 1.4rem; } .gallery-section { padding: 2rem 1.4rem; } .hero { padding: 7rem 1.4rem 3rem; }
      .photo-grid { grid-template-columns: 1fr 1fr; } .photo-item.wide,.photo-item.full { grid-column: span 2; }
    }
    @media (max-width: 500px) {
      .photo-grid { grid-template-columns: 1fr; } .photo-item.wide,.photo-item.full { grid-column: span 1; } .photo-item img { height: 250px; }
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-left">
    <a href="index.html" class="nav-back" data-en>← Back</a>
    <a href="index.html" class="nav-back" data-de>← Zurück</a>
    <span class="nav-name" data-en>Family</span>
    <span class="nav-name" data-de>Familie</span>
  </div>
  <div class="lang-toggle">
    <button class="lang-btn active" onclick="setLang('en')">EN</button>
    <button class="lang-btn" onclick="setLang('de')">DE</button>
  </div>
</nav>

<div class="hero">
  <p class="section-label" data-en>Private · Family</p>
  <p class="section-label" data-de>Privat · Familie</p>
  <h1 data-en>The ones who<br>matter most</h1>
  <h1 data-de>Die Menschen,<br>die am meisten zählen</h1>
  <p class="lead" data-en>A private corner for family and close friends.</p>
  <p class="lead" data-de>Eine private Ecke für Familie und enge Freunde.</p>
</div>

<div class="gallery-section">
  <h2 data-en>Klitschko</h2>
  <h2 data-de>Klitschko</h2>
  <div class="photo-grid">
    <div class="photo-item wide">
      <img src="${p('Klitschko-2.jpg')}" alt="Klitschko in his bed">
      <div class="photo-caption" data-en>Deeply unbothered. Deeply loved.</div>
      <div class="photo-caption" data-de>Zutiefst unbeeindruckt. Zutiefst geliebt.</div>
    </div>
    <div class="photo-item">
      <img src="${pub('Klitsschko.jpeg')}" alt="Klitschko in the garden" style="object-position: center top;">
      <div class="photo-caption" data-en>Klitschko in the garden</div>
      <div class="photo-caption" data-de>Klitschko im Garten</div>
    </div>
  </div>
</div>

<hr class="divider">

<div class="gallery-section">
  <h2 data-en>Lisa</h2>
  <h2 data-de>Lisa</h2>
  <div class="photo-grid">
    <div class="photo-item wide">
      <img src="${p('priv-lisa+me-xmas.jpg')}" alt="Lisa and André at Christmas">
      <div class="photo-caption" data-en>Christmas — the sock garland tradition</div>
      <div class="photo-caption" data-de>Weihnachten — die Sockenkranz-Tradition</div>
    </div>
    <div class="photo-item">
      <img src="${pub('Lisa+me.jpeg')}" alt="Lisa and André travelling">
      <div class="photo-caption" data-en>Lisa & me, out in the world</div>
      <div class="photo-caption" data-de>Lisa & ich, draußen in der Welt</div>
    </div>
  </div>
</div>

<hr class="divider">

<div class="gallery-section">
  <h2 data-en>Mum, Dad & Family</h2>
  <h2 data-de>Mama, Papa & Familie</h2>
  <div class="photo-grid">
    <div class="photo-item">
      <img src="${p('priv-mother+father.jpg')}" alt="Mum and Dad">
      <div class="photo-caption" data-en>Mum & Dad</div>
      <div class="photo-caption" data-de>Mama & Papa</div>
    </div>
    <div class="photo-item">
      <img src="${p('priv-me+mother.jpg')}" alt="André and Mum at festival">
      <div class="photo-caption" data-en>Mum & me at the festival</div>
      <div class="photo-caption" data-de>Mama & ich auf dem Festival</div>
    </div>
    <div class="photo-item">
      <img src="${p('priv-me+mother2.jpg')}" alt="André and Mum selfie">
      <div class="photo-caption" data-en>Festival selfie</div>
      <div class="photo-caption" data-de>Festival-Selfie</div>
    </div>
    <div class="photo-item">
      <img src="${p('priv-lisa+oma.jpg')}" alt="Lisa and Grandma">
      <div class="photo-caption" data-en>Lisa & Grandma</div>
      <div class="photo-caption" data-de>Lisa & Oma</div>
    </div>
    <div class="photo-item wide">
      <img src="${p('priv-Lisa+Oma+Friends.jpg')}" alt="Lisa, Grandma and friends">
      <div class="photo-caption" data-en>Lisa, Grandma & friends</div>
      <div class="photo-caption" data-de>Lisa, Oma & Freundinnen</div>
    </div>
    <div class="photo-item">
      <img src="${p('priv-mother+rabbit.jpg')}" alt="Grandma with rabbit">
      <div class="photo-caption" data-en>Grandma with the bunny</div>
      <div class="photo-caption" data-de>Oma mit dem Häschen</div>
    </div>
    <div class="photo-item wide">
      <img src="${p('priv-me+lisa+brother.jpg')}" alt="Family dinner">
      <div class="photo-caption" data-en>Family dinner</div>
      <div class="photo-caption" data-de>Familienessen</div>
    </div>
    <div class="photo-item">
      <img src="${p('priv-me+lisa+opa.jpg')}" alt="André, Lisa and Grandpa">
      <div class="photo-caption" data-en>With Grandpa — a moment that matters</div>
      <div class="photo-caption" data-de>Mit Opa — ein Moment, der zählt</div>
    </div>
  </div>
</div>

<hr class="divider">

<div class="gallery-section">
  <h2 data-en>The family wall</h2>
  <h2 data-de>Die Familienwand</h2>
  <div class="photo-grid">
    <div class="photo-item full">
      <img src="${p('priv-photo-gallery.jpg')}" alt="Family photo wall">
      <div class="photo-caption" data-en>Decades of family — every frame has a story</div>
      <div class="photo-caption" data-de>Jahrzehnte Familie — jeder Rahmen hat eine Geschichte</div>
    </div>
  </div>
</div>

<footer>
  <p data-en>Private · André Doelle · <a href="index.html">← Back to main page</a></p>
  <p data-de>Privat · André Doelle · <a href="index.html">← Zurück zur Hauptseite</a></p>
</footer>

<div id="lightbox" onclick="closeLightbox()">
  <span id="lightbox-close" onclick="closeLightbox()">✕</span>
  <img id="lightbox-img" src="" alt="">
</div>

<script>
  function setLang(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === lang.toUpperCase());
    });
  }

  document.querySelectorAll('.photo-item img').forEach(img => {
    img.addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById('lightbox-img').src = img.src;
      document.getElementById('lightbox').classList.add('open');
    });
  });

  function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
</script>

</body>
</html>`;

fs.writeFileSync('family-source.html', html);
console.log('✓ family-source.html written with embedded images');

// Encrypt with staticrypt (outputs to ./family-source.html in same dir)
console.log('✓ Encrypting with AES-256...');
execSync('npx staticrypt family-source.html -p "NewYork-NewYork" -d . --remember false', { stdio: 'inherit' });
fs.renameSync('family-source.html', 'family.html');

console.log('✓ family.html encrypted and ready');
console.log('✓ Password is NOT stored in the file — content is AES-256 encrypted');

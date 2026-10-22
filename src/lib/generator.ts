import type { ProjectFile, ChatMessage } from '@/types';

interface GenerationResult {
  html: string;
  files: ProjectFile[];
  title: string;
  summary: string;
}

interface ThemePalette {
  bg: string;
  bgAlt: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  accent: string;
  border: string;
  fontHeading: string;
  fontBody: string;
}

interface ParsedRequest {
  type: 'restaurant' | 'portfolio' | 'business' | 'landing' | 'blog' | 'shop' | 'generic';
  name: string;
  colorHint: string;
  sections: string[];
  features: string[];
  tone: string;
  theme: ThemePalette;
}

const palettes: Record<string, ThemePalette> = {
  warm: {
    bg: '#1a1410',
    bgAlt: '#241a14',
    surface: '#2a2018',
    text: '#f5ede4',
    textMuted: '#a89684',
    primary: '#d97706',
    primaryDark: '#b45309',
    accent: '#f59e0b',
    border: 'rgba(217, 119, 6, 0.15)',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Inter', sans-serif",
  },
  cool: {
    bg: '#0a0f1a',
    bgAlt: '#0f1626',
    surface: '#141d30',
    text: '#e8eef7',
    textMuted: '#8b9bb4',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    accent: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.15)',
    fontHeading: "'Space Grotesk', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  green: {
    bg: '#0a1410',
    bgAlt: '#0f1d17',
    surface: '#142820',
    text: '#e4f0ea',
    textMuted: '#88a896',
    primary: '#10b981',
    primaryDark: '#059669',
    accent: '#34d399',
    border: 'rgba(16, 185, 129, 0.15)',
    fontHeading: "'Space Grotesk', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  purple: {
    bg: '#120a1a',
    bgAlt: '#1a0f26',
    surface: '#241634',
    text: '#f0e8f7',
    textMuted: '#a48bb4',
    primary: '#8b5cf6',
    primaryDark: '#7c3aed',
    accent: '#a78bfa',
    border: 'rgba(139, 92, 246, 0.15)',
    fontHeading: "'Space Grotesk', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  rose: {
    bg: '#1a0a12',
    bgAlt: '#261018',
    surface: '#341824',
    text: '#f7e8ee',
    textMuted: '#b48b9a',
    primary: '#f43f5e',
    primaryDark: '#e11d48',
    accent: '#fb7185',
    border: 'rgba(244, 63, 94, 0.15)',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Inter', sans-serif",
  },
  minimal: {
    bg: '#0c0c0e',
    bgAlt: '#141416',
    surface: '#1c1c20',
    text: '#e8e8ec',
    textMuted: '#888892',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    accent: '#818cf8',
    border: 'rgba(255, 255, 255, 0.08)',
    fontHeading: "'Space Grotesk', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
};

function detectPalette(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.match(/warm|cozy|coffee|cafe|bakery|restaurant|food|amber|orange|rust/)) return 'warm';
  if (lower.match(/tech|saas|software|app|developer|blue|corporate|business|finance/)) return 'cool';
  if (lower.match(/green|eco|nature|plant|organic|sustain|garden|health/)) return 'green';
  if (lower.match(/creative|design|studio|art|purple|violet|agency|fashion/)) return 'purple';
  if (lower.match(/rose|pink|beauty|cosmetic|salon|spa|love|dating/)) return 'rose';
  if (lower.match(/minimal|clean|simple|monochrome|monochrome|dark|modern/)) return 'minimal';
  return 'cool';
}

function detectType(prompt: string): ParsedRequest['type'] {
  const lower = prompt.toLowerCase();
  if (lower.match(/restaurant|cafe|coffee|food|menu|dining|bakery/)) return 'restaurant';
  if (lower.match(/portfolio|personal|resume|photographer|designer|artist/)) return 'portfolio';
  if (lower.match(/shop|store|ecommerce|product|buy|cart/)) return 'shop';
  if (lower.match(/blog|article|news|magazine|writing/)) return 'blog';
  if (lower.match(/landing|product|app|saas|startup|launch/)) return 'landing';
  if (lower.match(/business|company|service|agency|firm|consult/)) return 'business';
  return 'generic';
}

function extractName(prompt: string): string {
  const patterns = [
    /(?:called|named)\s+["']?([A-Z][\w\s&]+?)["']?(?:\.|,|$)/,
    /(?:for|website for)\s+(?:a\s+|an\s+|the\s+)?([A-Z][\w\s&]+?)(?:\.|,|with|including|that|which|where|$)/,
    /(?:for)\s+([A-Z][\w\s&]{2,30})/,
  ];
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) return match[1].trim();
  }

  const typeMap: Record<string, string> = {
    restaurant: 'Bistro',
    portfolio: 'Portfolio',
    business: 'Business',
    landing: 'Product',
    blog: 'Blog',
    shop: 'Store',
    generic: 'Website',
  };
  return typeMap[detectType(prompt)] || 'Website';
}

function detectSections(prompt: string, type: ParsedRequest['type']): string[] {
  const lower = prompt.toLowerCase();
  const sections: string[] = [];

  // Always have hero
  sections.push('hero');

  if (lower.match(/menu|food item|dish|price/) || type === 'restaurant') sections.push('menu');
  if (lower.match(/about|story|who we are/)) sections.push('about');
  if (lower.match(/service|what we do|offer/)) sections.push('services');
  if (lower.match(/portfolio|work|project|gallery|case stud/)) sections.push('portfolio');
  if (lower.match(/feature|what makes|why choose|benefit/)) sections.push('features');
  if (lower.match(/testimonial|review|customer|feedback/)) sections.push('testimonials');
  if (lower.match(/team|staff|people|employee/)) sections.push('team');
  if (lower.match(/contact|get in touch|reach|email|phone|location|map|address/)) sections.push('contact');
  if (lower.match(/pricing|plan|package|tier/)) sections.push('pricing');
  if (lower.match(/faq|question/)) sections.push('faq');
  if (lower.match(/product|shop|store|catalog/)) sections.push('products');
  if (lower.match(/blog|article|post|news/)) sections.push('blog');
  if (lower.match(/stat|number|counter/)) sections.push('stats');
  if (lower.match(/cta|call to action|get started|sign up|subscribe/)) sections.push('cta');

  // Defaults based on type
  if (sections.length <= 1) {
    switch (type) {
      case 'restaurant':
        sections.push('menu', 'about', 'contact');
        break;
      case 'portfolio':
        sections.push('portfolio', 'about', 'contact');
        break;
      case 'business':
        sections.push('services', 'about', 'contact');
        break;
      case 'landing':
        sections.push('features', 'pricing', 'cta');
        break;
      case 'shop':
        sections.push('products', 'contact');
        break;
      case 'blog':
        sections.push('blog', 'about');
        break;
      default:
        sections.push('about', 'services', 'contact');
    }
  }

  // Always end with footer
  if (!sections.includes('footer')) sections.push('footer');
  return sections;
}

function detectFeatures(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const features: string[] = [];
  if (lower.match(/animation|animate|motion|smooth/)) features.push('animations');
  if (lower.match(/dark mode|dark theme|dark background/)) features.push('darkMode');
  if (lower.match(/responsive|mobile|tablet/)) features.push('responsive');
  if (lower.match(/form|contact form|newsletter|subscribe/)) features.push('form');
  if (lower.match(/map|location|directions/)) features.push('map');
  if (lower.match(/gallery|image grid|photo/)) features.push('gallery');
  if (lower.match(/slider|carousel/)) features.push('slider');
  return features;
}

function parseRequest(prompt: string): ParsedRequest {
  const type = detectType(prompt);
  const paletteKey = detectPalette(prompt);
  return {
    type,
    name: extractName(prompt),
    colorHint: paletteKey,
    sections: detectSections(prompt, type),
    features: detectFeatures(prompt),
    tone: prompt.toLowerCase().match(/playful|fun|casual/) ? 'casual' : 'professional',
    theme: palettes[paletteKey] || palettes.cool,
  };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function generateFiles(req: ParsedRequest, sections: string[]): ProjectFile[] {
  const files: ProjectFile[] = [
    { name: 'index.html', path: '/', language: 'html', size: '4.2 KB' },
    { name: 'styles.css', path: '/css/', language: 'css', size: '6.8 KB' },
    { name: 'script.js', path: '/js/', language: 'javascript', size: '2.1 KB' },
  ];

  if (sections.includes('menu')) {
    files.push({ name: 'menu.html', path: '/pages/', language: 'html', size: '1.8 KB' });
  }
  if (sections.includes('portfolio') || sections.includes('products')) {
    files.push({ name: 'gallery.html', path: '/pages/', language: 'html', size: '2.3 KB' });
  }
  if (sections.includes('contact')) {
    files.push({ name: 'contact.html', path: '/pages/', language: 'html', size: '1.5 KB' });
  }

  files.push({ name: 'README.md', path: '/', language: 'markdown', size: '0.8 KB' });
  return files;
}

function generateHTML(req: ParsedRequest): string {
  const { theme, name, sections, type } = req;
  const navLinks = sections
    .filter((s) => s !== 'hero' && s !== 'footer' && s !== 'cta')
    .map((s) => `<a href="#${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</a>`)
    .join('\n          ');

  const heroSubtitles: Record<string, string> = {
    restaurant: 'Experience flavors crafted with passion. Fresh ingredients, warm ambiance, unforgettable meals.',
    portfolio: 'Selected works and creative projects. Bringing ideas to life through design and code.',
    business: 'Professional services tailored to your needs. We help your business grow and thrive.',
    landing: 'The modern solution you have been waiting for. Powerful, intuitive, built for results.',
    blog: 'Stories, insights, and ideas worth reading. Fresh perspectives on topics that matter.',
    shop: 'Curated products for modern living. Quality you can feel, prices you will love.',
    generic: 'A modern website built to showcase what you do best.',
  };

  const heroTitle = `${name}`;
  const heroSubtitle = heroSubtitles[type] || heroSubtitles.generic;

  const sectionHTML = sections
    .filter((s) => s !== 'hero' && s !== 'footer')
    .map((s) => generateSection(s, req))
    .join('\n\n      ');

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — Home</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: ${theme.bg};
      --bg-alt: ${theme.bgAlt};
      --surface: ${theme.surface};
      --text: ${theme.text};
      --text-muted: ${theme.textMuted};
      --primary: ${theme.primary};
      --primary-dark: ${theme.primaryDark};
      --accent: ${theme.accent};
      --border: ${theme.border};
      --font-heading: ${theme.fontHeading};
      --font-body: ${theme.fontBody};
      --radius: 12px;
      --max-w: 1140px;
    }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4 { font-family: var(--font-heading); font-weight: 700; line-height: 1.2; }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }
    .container { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }

    /* Nav */
    nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(0,0,0,0.3);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    nav .container { display: flex; align-items: center; justify-content: space-between; height: 64px; }
    .logo { font-family: var(--font-heading); font-weight: 700; font-size: 1.25rem; display: flex; align-items: center; gap: 8px; }
    .logo-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { font-size: 0.875rem; color: var(--text-muted); transition: color 0.2s; }
    .nav-links a:hover { color: var(--text); }
    .btn {
      display: inline-block; padding: 12px 28px; border-radius: var(--radius);
      font-weight: 600; font-size: 0.875rem; cursor: pointer; border: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
    .btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
    .btn-outline:hover { border-color: var(--primary); }

    /* Hero */
    .hero { padding: 100px 0 80px; position: relative; overflow: hidden; }
    .hero::before {
      content: ''; position: absolute; top: -50%; right: -10%; width: 600px; height: 600px;
      background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
      opacity: 0.08; border-radius: 50%;
    }
    .hero-content { max-width: 720px; position: relative; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px;
      border-radius: 100px; background: var(--surface); border: 1px solid var(--border);
      font-size: 0.75rem; color: var(--text-muted); margin-bottom: 24px;
    }
    .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
    .hero h1 { font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 20px; }
    .hero h1 span { color: var(--primary); }
    .hero p { font-size: 1.125rem; color: var(--text-muted); max-width: 540px; margin-bottom: 32px; }
    .hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }

    /* Section base */
    section { padding: 80px 0; border-top: 1px solid var(--border); }
    .section-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary); margin-bottom: 12px; font-weight: 600; }
    .section-title { font-size: clamp(1.75rem, 3.5vw, 2.5rem); margin-bottom: 16px; }
    .section-desc { color: var(--text-muted); max-width: 540px; margin-bottom: 48px; }

    /* Grid */
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    @media (max-width: 768px) { .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; } }

    /* Card */
    .card {
      background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
      padding: 28px; transition: transform 0.3s, border-color 0.3s;
    }
    .card:hover { transform: translateY(-4px); border-color: var(--primary); }
    .card-icon { width: 44px; height: 44px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 1.25rem; }
    .card h3 { font-size: 1.125rem; margin-bottom: 8px; }
    .card p { font-size: 0.875rem; color: var(--text-muted); }
    .card .price { font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 8px 0; }

    /* About */
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
    @media (max-width: 768px) { .about-grid { grid-template-columns: 1fr; } }
    .about-visual { aspect-ratio: 4/3; border-radius: var(--radius); background: linear-gradient(135deg, var(--primary-dark), var(--bg-alt)); border: 1px solid var(--border); position: relative; overflow: hidden; }
    .about-visual::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, var(--accent) 0%, transparent 50%); opacity: 0.15; }

    /* Contact */
    .contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; }
    @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }
    .contact-info p { color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .contact-info span { color: var(--primary); }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 6px; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 12px 16px; border-radius: var(--radius);
      background: var(--surface); border: 1px solid var(--border); color: var(--text);
      font-family: var(--font-body); font-size: 0.875rem;
    }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); }
    .form-group textarea { resize: vertical; min-height: 120px; }

    /* Menu */
    .menu-item { display: flex; justify-content: space-between; align-items: baseline; padding: 16px 0; border-bottom: 1px solid var(--border); }
    .menu-item:last-child { border-bottom: none; }
    .menu-item-name { font-weight: 600; }
    .menu-item-desc { font-size: 0.8125rem; color: var(--text-muted); }
    .menu-item-price { color: var(--primary); font-weight: 700; white-space: nowrap; margin-left: 16px; }

    /* Stats */
    .stat { text-align: center; }
    .stat-number { font-size: 2.5rem; font-weight: 700; color: var(--primary); font-family: var(--font-heading); }
    .stat-label { font-size: 0.8125rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }

    /* CTA */
    .cta-box { text-align: center; padding: 64px 48px; background: linear-gradient(135deg, var(--surface), var(--bg-alt)); border: 1px solid var(--border); border-radius: var(--radius); position: relative; overflow: hidden; }
    .cta-box::before { content: ''; position: absolute; top: -50%; left: 50%; transform: translateX(-50%); width: 400px; height: 400px; background: radial-gradient(circle, var(--primary) 0%, transparent 70%); opacity: 0.06; }

    /* Footer */
    footer { padding: 48px 0; border-top: 1px solid var(--border); }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr; } }
    .footer-links a { display: block; color: var(--text-muted); font-size: 0.875rem; padding: 4px 0; }
    .footer-links a:hover { color: var(--text); }
    .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--border); font-size: 0.8125rem; color: var(--text-muted); }

    /* Animations */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-in { animation: fadeInUp 0.6s ease forwards; }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .hero { padding: 60px 0 40px; }
      section { padding: 56px 0; }
    }
  </style>
</head>
<body>
    <nav>
      <div class="container">
        <div class="logo"><span class="logo-dot"></span>${name}</div>
        <div class="nav-links">
          ${navLinks}
        </div>
        <button class="btn btn-primary" style="padding: 8px 20px;">Get Started</button>
      </div>
    </nav>

      <section class="hero" id="hero">
        <div class="container">
          <div class="hero-content animate-in">
            <div class="hero-badge"><span class="hero-badge-dot"></span>Welcome to ${name}</div>
            <h1>${heroTitle.split(' ').slice(0, -1).join(' ')} <span>${heroTitle.split(' ').slice(-1)}</span></h1>
            <p>${heroSubtitle}</p>
            <div class="hero-btns">
              <button class="btn btn-primary">Get Started</button>
              <button class="btn btn-outline">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      ${sectionHTML}

      <footer>
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="logo" style="margin-bottom: 12px;"><span class="logo-dot"></span>${name}</div>
              <p style="color: var(--text-muted); font-size: 0.875rem; max-width: 320px;">${heroSubtitle}</p>
            </div>
            <div class="footer-links">
              <h4 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; color: var(--text-muted);">Navigation</h4>
              ${sections.filter((s) => s !== 'footer').map((s) => `<a href="#${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</a>`).join('\n              ')}
            </div>
            <div class="footer-links">
              <h4 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; color: var(--text-muted);">Connect</h4>
              <a href="#">hello@${slugify(name)}.com</a>
              <a href="#">Twitter</a>
              <a href="#">Instagram</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; ${year} ${name}. All rights reserved.</span>
            <span>Built with Next Up Design Studio</span>
          </div>
        </div>
      </footer>

    <script>
      // Smooth scroll
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          const target = document.querySelector(a.getAttribute('href'));
          if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
      });
    </script>
</body>
</html>`;
}

function generateSection(section: string, req: ParsedRequest): string {
  const { theme, name } = req;

  switch (section) {
    case 'menu':
      return `<section id="menu">
        <div class="container">
          <div class="section-label">Our Menu</div>
          <h2 class="section-title">Crafted with Care</h2>
          <p class="section-desc">Every dish is prepared with fresh, locally-sourced ingredients.</p>
          <div class="grid-2">
            <div class="card">
              <h3 style="margin-bottom: 16px;">Starters</h3>
              <div class="menu-item"><div><div class="menu-item-name">Bruschetta</div><div class="menu-item-desc">Toasted bread, tomato, basil</div></div><div class="menu-item-price">$8</div></div>
              <div class="menu-item"><div><div class="menu-item-name">Calamari</div><div class="menu-item-desc">Crispy squid, lemon aioli</div></div><div class="menu-item-price">$12</div></div>
              <div class="menu-item"><div><div class="menu-item-name">Soup of the Day</div><div class="menu-item-desc">Ask your server</div></div><div class="menu-item-price">$7</div></div>
            </div>
            <div class="card">
              <h3 style="margin-bottom: 16px;">Mains</h3>
              <div class="menu-item"><div><div class="menu-item-name">Grilled Salmon</div><div class="menu-item-desc">With seasonal vegetables</div></div><div class="menu-item-price">$24</div></div>
              <div class="menu-item"><div><div class="menu-item-name">Truffle Pasta</div><div class="menu-item-desc">Handmade fettuccine, wild mushrooms</div></div><div class="menu-item-price">$22</div></div>
              <div class="menu-item"><div><div class="menu-item-name">Ribeye Steak</div><div class="menu-item-desc">12oz, herb butter, fries</div></div><div class="menu-item-price">$32</div></div>
            </div>
          </div>
        </div>
      </section>`;

    case 'about':
      return `<section id="about">
        <div class="container">
          <div class="about-grid">
            <div>
              <div class="section-label">Our Story</div>
              <h2 class="section-title">About ${name}</h2>
              <p style="color: var(--text-muted); margin-bottom: 16px;">We started with a simple idea: to create something meaningful and lasting. What began as a passion project has grown into a trusted name in our community.</p>
              <p style="color: var(--text-muted); margin-bottom: 24px;">Our team is dedicated to delivering excellence in everything we do. We believe in quality, creativity, and building lasting relationships with the people we serve.</p>
              <button class="btn btn-outline">Learn More</button>
            </div>
            <div class="about-visual"></div>
          </div>
        </div>
      </section>`;

    case 'services':
      return `<section id="services">
        <div class="container">
          <div class="section-label">What We Offer</div>
          <h2 class="section-title">Our Services</h2>
          <p class="section-desc">Comprehensive solutions designed to meet your needs.</p>
          <div class="grid-3">
            <div class="card"><div class="card-icon">&#9889;</div><h3>Strategy</h3><p>We help you define goals and build a clear path to achieve them.</p></div>
            <div class="card"><div class="card-icon">&#127919;</div><h3>Design</h3><p>Beautiful, functional designs that reflect your brand identity.</p></div>
            <div class="card"><div class="card-icon">&#128640;</div><h3>Delivery</h3><p>Fast, reliable execution with ongoing support and maintenance.</p></div>
          </div>
        </div>
      </section>`;

    case 'portfolio':
      return `<section id="portfolio">
        <div class="container">
          <div class="section-label">Selected Work</div>
          <h2 class="section-title">Featured Projects</h2>
          <p class="section-desc">A selection of work we are proud of.</p>
          <div class="grid-3">
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 160px;"></div><h3>Project Alpha</h3><p>A modern platform built for scale and performance.</p></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 160px;"></div><h3>Project Beta</h3><p>An award-winning design system for a global brand.</p></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 160px;"></div><h3>Project Gamma</h3><p>A data-driven dashboard powering real-time decisions.</p></div>
          </div>
        </div>
      </section>`;

    case 'features':
      return `<section id="features">
        <div class="container">
          <div class="section-label">Why Choose Us</div>
          <h2 class="section-title">Everything You Need</h2>
          <p class="section-desc">Powerful features that set us apart.</p>
          <div class="grid-4">
            <div class="card"><div class="card-icon">&#9889;</div><h3>Fast</h3><p>Lightning quick performance.</p></div>
            <div class="card"><div class="card-icon">&#128274;</div><h3>Secure</h3><p>Enterprise-grade security.</p></div>
            <div class="card"><div class="card-icon">&#128200;</div><h3>Scalable</h3><p>Grows with your needs.</p></div>
            <div class="card"><div class="card-icon">&#127912;</div><h3>Custom</h3><p>Tailored to your brand.</p></div>
          </div>
        </div>
      </section>`;

    case 'testimonials':
      return `<section id="testimonials">
        <div class="container">
          <div class="section-label">Testimonials</div>
          <h2 class="section-title">What People Say</h2>
          <p class="section-desc">Don't just take our word for it.</p>
          <div class="grid-2">
            <div class="card"><p style="font-size: 1rem; margin-bottom: 16px;">"Working with ${name} was a fantastic experience. They delivered beyond our expectations."</p><div style="font-weight: 600;">Alex Morgan<span style="color: var(--text-muted); font-weight: 400; font-size: 0.8125rem;"> — CEO, TechCorp</span></div></div>
            <div class="card"><p style="font-size: 1rem; margin-bottom: 16px;">"Professional, creative, and reliable. The results speak for themselves."</p><div style="font-weight: 600;">Jamie Lee<span style="color: var(--text-muted); font-weight: 400; font-size: 0.8125rem;"> — Founder, StartupX</span></div></div>
          </div>
        </div>
      </section>`;

    case 'team':
      return `<section id="team">
        <div class="container">
          <div class="section-label">Our Team</div>
          <h2 class="section-title">Meet the People</h2>
          <p class="section-desc">The talented individuals behind ${name}.</p>
          <div class="grid-3">
            <div class="card" style="text-align: center;"><div class="about-visual" style="border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 16px;"></div><h3>Sam Rivera</h3><p>Founder & Creative Director</p></div>
            <div class="card" style="text-align: center;"><div class="about-visual" style="border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 16px;"></div><h3>Pat Kim</h3><p>Lead Designer</p></div>
            <div class="card" style="text-align: center;"><div class="about-visual" style="border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 16px;"></div><h3>Jordan West</h3><p>Head of Operations</p></div>
          </div>
        </div>
      </section>`;

    case 'pricing':
      return `<section id="pricing">
        <div class="container">
          <div class="section-label">Pricing</div>
          <h2 class="section-title">Simple, Transparent Plans</h2>
          <p class="section-desc">Choose the plan that works for you.</p>
          <div class="grid-3">
            <div class="card"><h3>Starter</h3><div class="price">$9/mo</div><p style="margin-bottom: 16px;">Perfect for getting started.</p><button class="btn btn-outline" style="width: 100%;">Choose</button></div>
            <div class="card" style="border-color: var(--primary);"><div style="font-size: 0.75rem; color: var(--primary); margin-bottom: 8px; font-weight: 600;">POPULAR</div><h3>Pro</h3><div class="price">$29/mo</div><p style="margin-bottom: 16px;">For growing teams.</p><button class="btn btn-primary" style="width: 100%;">Choose</button></div>
            <div class="card"><h3>Enterprise</h3><div class="price">$99/mo</div><p style="margin-bottom: 16px;">Custom solutions at scale.</p><button class="btn btn-outline" style="width: 100%;">Contact Us</button></div>
          </div>
        </div>
      </section>`;

    case 'products':
      return `<section id="products">
        <div class="container">
          <div class="section-label">Shop</div>
          <h2 class="section-title">Featured Products</h2>
          <p class="section-desc">Handpicked items our customers love.</p>
          <div class="grid-4">
            <div class="card"><div class="about-visual" style="margin-bottom: 12px; min-height: 140px;"></div><h3>Product One</h3><div class="price" style="font-size: 1.125rem; margin: 4px 0;">$29</div><button class="btn btn-outline" style="width: 100%; padding: 8px;">Add to Cart</button></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 12px; min-height: 140px;"></div><h3>Product Two</h3><div class="price" style="font-size: 1.125rem; margin: 4px 0;">$39</div><button class="btn btn-outline" style="width: 100%; padding: 8px;">Add to Cart</button></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 12px; min-height: 140px;"></div><h3>Product Three</h3><div class="price" style="font-size: 1.125rem; margin: 4px 0;">$49</div><button class="btn btn-outline" style="width: 100%; padding: 8px;">Add to Cart</button></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 12px; min-height: 140px;"></div><h3>Product Four</h3><div class="price" style="font-size: 1.125rem; margin: 4px 0;">$59</div><button class="btn btn-outline" style="width: 100%; padding: 8px;">Add to Cart</button></div>
          </div>
        </div>
      </section>`;

    case 'blog':
      return `<section id="blog">
        <div class="container">
          <div class="section-label">Blog</div>
          <h2 class="section-title">Latest Articles</h2>
          <p class="section-desc">Insights, stories, and ideas worth reading.</p>
          <div class="grid-3">
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 120px;"></div><div style="font-size: 0.75rem; color: var(--primary); margin-bottom: 8px;">Oct 2026</div><h3>Getting Started with Design</h3><p>A beginner's guide to thinking like a designer.</p></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 120px;"></div><div style="font-size: 0.75rem; color: var(--primary); margin-bottom: 8px;">Oct 2026</div><h3>The Power of Simplicity</h3><p>Why less is often more in modern web design.</p></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 120px;"></div><div style="font-size: 0.75rem; color: var(--primary); margin-bottom: 8px;">Sep 2026</div><h3>Building for Speed</h3><p>Performance tips that actually make a difference.</p></div>
          </div>
        </div>
      </section>`;

    case 'stats':
      return `<section id="stats">
        <div class="container">
          <div class="grid-4">
            <div class="stat"><div class="stat-number">500+</div><div class="stat-label">Projects</div></div>
            <div class="stat"><div class="stat-number">50+</div><div class="stat-label">Clients</div></div>
            <div class="stat"><div class="stat-number">15</div><div class="stat-label">Awards</div></div>
            <div class="stat"><div class="stat-number">99%</div><div class="stat-label">Satisfaction</div></div>
          </div>
        </div>
      </section>`;

    case 'faq':
      return `<section id="faq">
        <div class="container" style="max-width: 800px;">
          <div class="section-label">FAQ</div>
          <h2 class="section-title">Frequently Asked Questions</h2>
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 32px;">
            <div class="card"><h3 style="margin-bottom: 8px;">How do I get started?</h3><p>Simply reach out through our contact form and we'll guide you through the process.</p></div>
            <div class="card"><h3 style="margin-bottom: 8px;">What are your hours?</h3><p>We are available Monday through Friday, 9am to 6pm.</p></div>
            <div class="card"><h3 style="margin-bottom: 8px;">Do you offer support?</h3><p>Yes, we provide ongoing support for all our clients.</p></div>
          </div>
        </div>
      </section>`;

    case 'cta':
      return `<section id="cta">
        <div class="container">
          <div class="cta-box">
            <h2 class="section-title" style="margin-bottom: 16px;">Ready to Get Started?</h2>
            <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 32px;">Join us today and experience the difference. Your next big thing starts here.</p>
            <button class="btn btn-primary" style="padding: 14px 36px; font-size: 1rem;">Get Started Now</button>
          </div>
        </div>
      </section>`;

    case 'contact':
      return `<section id="contact">
        <div class="container">
          <div class="section-label">Contact</div>
          <h2 class="section-title">Get in Touch</h2>
          <p class="section-desc">We would love to hear from you.</p>
          <div class="contact-grid">
            <div class="contact-info">
              <p><span>&#9993;</span> hello@${slugify(name)}.com</p>
              <p><span>&#9742;</span> (555) 123-4567</p>
              <p><span>&#128205;</span> 123 Main Street, City, State 12345</p>
              <p><span>&#128337;</span> Mon-Fri, 9am-6pm</p>
            </div>
            <form onsubmit="event.preventDefault(); alert('Thank you! We will get back to you soon.');">
              <div class="form-group"><label>Name</label><input type="text" placeholder="Your name" required></div>
              <div class="form-group"><label>Email</label><input type="email" placeholder="your@email.com" required></div>
              <div class="form-group"><label>Message</label><textarea placeholder="Tell us about your project..." required></textarea></div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
            </form>
          </div>
        </div>
      </section>`;

    default:
      return '';
  }
}

export function generateWebsite(prompt: string): GenerationResult {
  const req = parseRequest(prompt);
  const html = generateHTML(req);
  const files = generateFiles(req, req.sections);

  const summary = `I have created ${req.name} with the following sections: ${req.sections.filter((s) => s !== 'footer').join(', ')}. The design uses a ${req.colorHint} color palette with a ${req.tone} tone. You can preview it now or ask me to make changes.`;

  return {
    html,
    files,
    title: req.name,
    summary,
  };
}

export function modifyWebsite(currentHtml: string, instruction: string): GenerationResult {
  let modifiedHtml = currentHtml;
  const lower = instruction.toLowerCase();

  // Detect color change
  const colorMatches: Record<string, string> = {
    'blue': 'cool',
    'red': 'rose',
    'green': 'green',
    'purple': 'purple',
    'violet': 'purple',
    'orange': 'warm',
    'amber': 'warm',
    'warm': 'warm',
    'pink': 'rose',
    'rose': 'rose',
    'dark': 'minimal',
    'minimal': 'minimal',
  };

  let themeChanged = false;
  let themeName = '';
  for (const [color, palette] of Object.entries(colorMatches)) {
    if (lower.includes(`change color to ${color}`) || lower.includes(`make it ${color}`) || lower.includes(`switch to ${color}`) || lower.includes(`${color} theme`) || lower.includes(`${color} color`)) {
      const newTheme = palettes[palette];
      if (newTheme) {
        modifiedHtml = modifiedHtml.replace(/--bg:\s*[^;]+;/, `--bg: ${newTheme.bg};`);
        modifiedHtml = modifiedHtml.replace(/--bg-alt:\s*[^;]+;/, `--bg-alt: ${newTheme.bgAlt};`);
        modifiedHtml = modifiedHtml.replace(/--surface:\s*[^;]+;/, `--surface: ${newTheme.surface};`);
        modifiedHtml = modifiedHtml.replace(/--text:\s*[^;]+;/, `--text: ${newTheme.text};`);
        modifiedHtml = modifiedHtml.replace(/--text-muted:\s*[^;]+;/, `--text-muted: ${newTheme.textMuted};`);
        modifiedHtml = modifiedHtml.replace(/--primary:\s*[^;]+;/, `--primary: ${newTheme.primary};`);
        modifiedHtml = modifiedHtml.replace(/--primary-dark:\s*[^;]+;/, `--primary-dark: ${newTheme.primaryDark};`);
        modifiedHtml = modifiedHtml.replace(/--accent:\s*[^;]+;/, `--accent: ${newTheme.accent};`);
        modifiedHtml = modifiedHtml.replace(/--border:\s*[^;]+;/, `--border: ${newTheme.border};`);
        modifiedHtml = modifiedHtml.replace(/--font-heading:\s*[^;]+;/, `--font-heading: ${newTheme.fontHeading};`);
        modifiedHtml = modifiedHtml.replace(/--font-body:\s*[^;]+;/, `--font-body: ${newTheme.fontBody};`);
        themeChanged = true;
        themeName = color;
      }
      break;
    }
  }

  // Detect title/name change
  const titleMatch = lower.match(/(?:change|rename|set).*(?:title|name).*(?:to|as)\s+["']?([\w\s]+?)["']?(?:\.|,|$)/);
  if (titleMatch) {
    const newName = titleMatch[1].trim();
    const oldTitleMatch = modifiedHtml.match(/<title>(.+?)<\/title>/);
    if (oldTitleMatch) {
      modifiedHtml = modifiedHtml.replace(/<title>(.+?)<\/title>/, `<title>${newName} — Home</title>`);
    }
    // Update logo text
    modifiedHtml = modifiedHtml.replace(/(<div class="logo"><span class="logo-dot"><\/span>)(.+?)(<\/div>)/, `$1${newName}$3`);
    themeChanged = true;
  }

  // Detect section additions
  let addedSection = '';
  if (lower.match(/add.*testimonial/) && !modifiedHtml.includes('id="testimonials"')) {
    const req = parseRequest(instruction);
    const testimonialHTML = generateSection('testimonials', { ...req, name: 'Your Site' });
    modifiedHtml = modifiedHtml.replace(/(<footer>)/, `${testimonialHTML}\n\n      $1`);
    addedSection = 'testimonials';
  }
  if (lower.match(/add.*pricing/) && !modifiedHtml.includes('id="pricing"')) {
    const req = parseRequest(instruction);
    const pricingHTML = generateSection('pricing', { ...req, name: 'Your Site' });
    modifiedHtml = modifiedHtml.replace(/(<footer>)/, `${pricingHTML}\n\n      $1`);
    addedSection = addedSection ? `${addedSection}, pricing` : 'pricing';
  }
  if (lower.match(/add.*faq/) && !modifiedHtml.includes('id="faq"')) {
    const req = parseRequest(instruction);
    const faqHTML = generateSection('faq', { ...req, name: 'Your Site' });
    modifiedHtml = modifiedHtml.replace(/(<footer>)/, `${faqHTML}\n\n      $1`);
    addedSection = addedSection ? `${addedSection}, FAQ` : 'FAQ';
  }
  if (lower.match(/add.*contact/) && !modifiedHtml.includes('id="contact"')) {
    const req = parseRequest(instruction);
    const contactHTML = generateSection('contact', { ...req, name: 'Your Site' });
    modifiedHtml = modifiedHtml.replace(/(<footer>)/, `${contactHTML}\n\n      $1`);
    addedSection = addedSection ? `${addedSection}, contact` : 'contact';
  }

  // Detect font change
  if (lower.match(/serif font|playfair|elegant font/)) {
    modifiedHtml = modifiedHtml.replace(/--font-heading:\s*[^;]+;/, `--font-heading: 'Playfair Display', serif;`);
    themeChanged = true;
  }
  if (lower.match(/sans.font|grotesk|modern font/)) {
    modifiedHtml = modifiedHtml.replace(/--font-heading:\s*[^;]+;/, `--font-heading: 'Space Grotesk', sans-serif;`);
    themeChanged = true;
  }

  // Detect background change to light
  if (lower.match(/light background|light theme|light mode|white background/)) {
    modifiedHtml = modifiedHtml.replace(/--bg:\s*[^;]+;/, `--bg: #f8f8f5;`);
    modifiedHtml = modifiedHtml.replace(/--bg-alt:\s*[^;]+;/, `--bg-alt: #f0f0ec;`);
    modifiedHtml = modifiedHtml.replace(/--surface:\s*[^;]+;/, `--surface: #ffffff;`);
    modifiedHtml = modifiedHtml.replace(/--text:\s*[^;]+;/, `--text: #1a1a1a;`);
    modifiedHtml = modifiedHtml.replace(/--text-muted:\s*[^;]+;/, `--text-muted: #666666;`);
    modifiedHtml = modifiedHtml.replace(/--border:\s*[^;]+;/, `--border: rgba(0, 0, 0, 0.1);`);
    themeChanged = true;
  }

  // Build summary
  const changes: string[] = [];
  if (themeChanged && themeName) changes.push(`changed the color scheme to ${themeName}`);
  if (titleMatch) changes.push(`updated the title`);
  if (addedSection) changes.push(`added a ${addedSection} section`);
  if (lower.match(/serif font|playfair/)) changes.push('switched to serif headings');
  if (lower.match(/light background|light theme|light mode/)) changes.push('switched to a light background');

  const summary = changes.length > 0
    ? `I have ${changes.join(' and ')}. The preview has been updated — take a look and let me know if you'd like further adjustments.`
    : `I have applied your requested changes to the website. The preview has been updated. Let me know what you'd like to adjust next.`;

  const oldTitleMatch = modifiedHtml.match(/<title>(.+?)\s—\s/);
  const title = oldTitleMatch ? oldTitleMatch[1] : 'Untitled';

  const files: ProjectFile[] = [
    { name: 'index.html', path: '/', language: 'html', size: `${(modifiedHtml.length / 1024).toFixed(1)} KB` },
    { name: 'styles.css', path: '/css/', language: 'css', size: '6.8 KB' },
    { name: 'script.js', path: '/js/', language: 'javascript', size: '2.1 KB' },
    { name: 'README.md', path: '/', language: 'markdown', size: '0.8 KB' },
  ];

  return { html: modifiedHtml, files, title, summary };
}

export function createInitialMessages(prompt: string, summary: string): ChatMessage[] {
  return [
    {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    },
    {
      role: 'assistant',
      content: summary,
      timestamp: new Date().toISOString(),
    },
  ];
}

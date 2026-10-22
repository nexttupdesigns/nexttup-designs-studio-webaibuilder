import type { ProjectFile, ChatMessage } from '@/types';

interface GenerationResult {
  html: string;
  files: ProjectFile[];
  title: string;
  summary: string;
  changed: boolean;
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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function generateFiles(html: string): ProjectFile[] {
  const bytes = new TextEncoder().encode(html).length;
  const size = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  return [{ name: 'index.html', path: '/', language: 'html', size }];
}

function generateHTML(req: ParsedRequest): string {
  const { theme, name, sections, type } = req;
  const safeName = escapeHtml(name);
  const navLinks = sections
    .filter((s) => s !== 'hero' && s !== 'footer' && s !== 'cta')
    .map((s) => `<a href="#${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</a>`)
    .join('\n          ');
  const actionTarget = sections.includes('contact')
    ? '#contact'
    : sections.includes('cta')
      ? '#cta'
      : '#footer';
  const learnMoreTarget = sections.find((section) => !['hero', 'footer', 'cta'].includes(section)) || 'footer';

  const heroSubtitles: Record<string, string> = {
    restaurant: 'Add a short introduction to your restaurant, menu, and atmosphere.',
    portfolio: 'Introduce your work and the kind of projects you take on.',
    business: 'Add a concise description of your business and services.',
    landing: 'Describe your product, who it helps, and what visitors can do next.',
    blog: 'Add a short description of your publication and its topics.',
    shop: 'Describe your store and the products you offer.',
    generic: 'Add a short introduction to this website.',
  };

  const heroTitle = safeName;
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
  <title>${safeName} — Home</title>
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
    button:disabled { cursor: not-allowed; opacity: 0.55; }
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
        <div class="logo"><span class="logo-dot"></span>${safeName}</div>
        <div class="nav-links">
          ${navLinks}
        </div>
        <a class="btn btn-primary" style="padding: 8px 20px;" href="${actionTarget}">Get Started</a>
      </div>
    </nav>

      <section class="hero" id="hero">
        <div class="container">
          <div class="hero-content animate-in">
            <div class="hero-badge"><span class="hero-badge-dot"></span>Welcome to ${safeName}</div>
            <h1>${heroTitle.split(' ').slice(0, -1).join(' ')} <span>${heroTitle.split(' ').slice(-1)}</span></h1>
            <p>${heroSubtitle}</p>
            <div class="hero-btns">
              <a class="btn btn-primary" href="${actionTarget}">Get Started</a>
              <a class="btn btn-outline" href="#${learnMoreTarget}">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      ${sectionHTML}

      <footer id="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="logo" style="margin-bottom: 12px;"><span class="logo-dot"></span>${safeName}</div>
              <p style="color: var(--text-muted); font-size: 0.875rem; max-width: 320px;">${heroSubtitle}</p>
            </div>
            <div class="footer-links">
              <h4 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; color: var(--text-muted);">Navigation</h4>
              ${sections.filter((s) => s !== 'footer').map((s) => `<a href="#${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</a>`).join('\n              ')}
            </div>
            <div class="footer-links">
              <h4 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; color: var(--text-muted);">Connect</h4>
              <span>Set your contact email</span>
              <span>Set your social profile links</span>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; ${year} ${safeName}. All rights reserved.</span>
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
  const { name } = req;
  const safeName = escapeHtml(name);

  switch (section) {
    case 'menu':
      return `<section id="menu">
        <div class="container">
          <div class="section-label">Menu</div>
          <h2 class="section-title">Add your menu items</h2>
          <p class="section-desc">Replace these placeholders with your actual items, descriptions, and prices.</p>
          <div class="grid-2">
            <div class="card">
              <h3 style="margin-bottom: 16px;">Category</h3>
              <div class="menu-item"><div><div class="menu-item-name">Menu item</div><div class="menu-item-desc">Add a description</div></div><div class="menu-item-price">Set price</div></div>
              <div class="menu-item"><div><div class="menu-item-name">Menu item</div><div class="menu-item-desc">Add a description</div></div><div class="menu-item-price">Set price</div></div>
              <div class="menu-item"><div><div class="menu-item-name">Menu item</div><div class="menu-item-desc">Add a description</div></div><div class="menu-item-price">Set price</div></div>
            </div>
            <div class="card">
              <h3 style="margin-bottom: 16px;">Category</h3>
              <div class="menu-item"><div><div class="menu-item-name">Menu item</div><div class="menu-item-desc">Add a description</div></div><div class="menu-item-price">Set price</div></div>
              <div class="menu-item"><div><div class="menu-item-name">Menu item</div><div class="menu-item-desc">Add a description</div></div><div class="menu-item-price">Set price</div></div>
              <div class="menu-item"><div><div class="menu-item-name">Menu item</div><div class="menu-item-desc">Add a description</div></div><div class="menu-item-price">Set price</div></div>
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
              <h2 class="section-title">About ${safeName}</h2>
              <p style="color: var(--text-muted); margin-bottom: 16px;">Add your story, background, or the reason this business exists.</p>
              <p style="color: var(--text-muted); margin-bottom: 24px;">Replace this text with details that are true for your organization.</p>
              <a class="btn btn-outline" href="#footer">More information</a>
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
          <p class="section-desc">Describe the services you actually provide.</p>
          <div class="grid-3">
            <div class="card"><div class="card-icon">&#9889;</div><h3>Service name</h3><p>Add a short, accurate description.</p></div>
            <div class="card"><div class="card-icon">&#127919;</div><h3>Service name</h3><p>Add a short, accurate description.</p></div>
            <div class="card"><div class="card-icon">&#128640;</div><h3>Service name</h3><p>Add a short, accurate description.</p></div>
          </div>
        </div>
      </section>`;

    case 'portfolio':
      return `<section id="portfolio">
        <div class="container">
          <div class="section-label">Selected Work</div>
          <h2 class="section-title">Featured Projects</h2>
          <p class="section-desc">Replace the sample cards with real projects and descriptions.</p>
          <div class="grid-3">
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 160px;"></div><h3>Project title</h3><p>Add a short project description.</p></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 160px;"></div><h3>Project title</h3><p>Add a short project description.</p></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 160px;"></div><h3>Project title</h3><p>Add a short project description.</p></div>
          </div>
        </div>
      </section>`;

    case 'features':
      return `<section id="features">
        <div class="container">
          <div class="section-label">Why Choose Us</div>
          <h2 class="section-title">Everything You Need</h2>
          <p class="section-desc">Add the real capabilities of your product or service.</p>
          <div class="grid-4">
            <div class="card"><div class="card-icon">&#9889;</div><h3>Feature name</h3><p>Add a verified description.</p></div>
            <div class="card"><div class="card-icon">&#128274;</div><h3>Feature name</h3><p>Add a verified description.</p></div>
            <div class="card"><div class="card-icon">&#128200;</div><h3>Feature name</h3><p>Add a verified description.</p></div>
            <div class="card"><div class="card-icon">&#127912;</div><h3>Feature name</h3><p>Add a verified description.</p></div>
          </div>
        </div>
      </section>`;

    case 'testimonials':
      return `<section id="testimonials">
        <div class="container">
          <div class="section-label">Testimonials</div>
          <h2 class="section-title">Customer testimonials</h2>
          <p class="section-desc">Use real quotes only, with permission from the people quoted.</p>
          <div class="grid-2">
            <div class="card"><p style="font-size: 1rem; margin-bottom: 16px;">Add an approved customer quote here.</p><div style="font-weight: 600;">Customer name<span style="color: var(--text-muted); font-weight: 400; font-size: 0.8125rem;"> — Role or company</span></div></div>
            <div class="card"><p style="font-size: 1rem; margin-bottom: 16px;">Add an approved customer quote here.</p><div style="font-weight: 600;">Customer name<span style="color: var(--text-muted); font-weight: 400; font-size: 0.8125rem;"> — Role or company</span></div></div>
          </div>
        </div>
      </section>`;

    case 'team':
      return `<section id="team">
        <div class="container">
          <div class="section-label">Our Team</div>
          <h2 class="section-title">Meet the People</h2>
          <p class="section-desc">The talented individuals behind ${safeName}.</p>
          <div class="grid-3">
            <div class="card" style="text-align: center;"><div class="about-visual" style="border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 16px;"></div><h3>Team member</h3><p>Add a role</p></div>
            <div class="card" style="text-align: center;"><div class="about-visual" style="border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 16px;"></div><h3>Team member</h3><p>Add a role</p></div>
            <div class="card" style="text-align: center;"><div class="about-visual" style="border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 16px;"></div><h3>Team member</h3><p>Add a role</p></div>
          </div>
        </div>
      </section>`;

    case 'pricing':
      return `<section id="pricing">
        <div class="container">
          <div class="section-label">Pricing</div>
          <h2 class="section-title">Simple, Transparent Plans</h2>
          <p class="section-desc">Replace these placeholders with your actual plans and prices.</p>
          <div class="grid-3">
            <div class="card"><h3>Plan name</h3><div class="price">Set price</div><p style="margin-bottom: 16px;">Add a description of what is included.</p><button class="btn btn-outline" style="width: 100%;" type="button" disabled>Checkout not connected</button></div>
            <div class="card"><h3>Plan name</h3><div class="price">Set price</div><p style="margin-bottom: 16px;">Add a description of what is included.</p><button class="btn btn-outline" style="width: 100%;" type="button" disabled>Checkout not connected</button></div>
            <div class="card"><h3>Plan name</h3><div class="price">Set price</div><p style="margin-bottom: 16px;">Add a description of what is included.</p><button class="btn btn-outline" style="width: 100%;" type="button" disabled>Checkout not connected</button></div>
          </div>
        </div>
      </section>`;

    case 'products':
      return `<section id="products">
        <div class="container">
          <div class="section-label">Shop</div>
          <h2 class="section-title">Featured Products</h2>
          <p class="section-desc">Add your products, accurate prices, and a connected store to accept orders.</p>
          <div class="grid-4">
            <div class="card"><div class="about-visual" style="margin-bottom: 12px; min-height: 140px;"></div><h3>Product name</h3><div class="price" style="font-size: 1.125rem; margin: 4px 0;">Set price</div><button class="btn btn-outline" style="width: 100%; padding: 8px;" type="button" disabled>Store not connected</button></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 12px; min-height: 140px;"></div><h3>Product name</h3><div class="price" style="font-size: 1.125rem; margin: 4px 0;">Set price</div><button class="btn btn-outline" style="width: 100%; padding: 8px;" type="button" disabled>Store not connected</button></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 12px; min-height: 140px;"></div><h3>Product name</h3><div class="price" style="font-size: 1.125rem; margin: 4px 0;">Set price</div><button class="btn btn-outline" style="width: 100%; padding: 8px;" type="button" disabled>Store not connected</button></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 12px; min-height: 140px;"></div><h3>Product name</h3><div class="price" style="font-size: 1.125rem; margin: 4px 0;">Set price</div><button class="btn btn-outline" style="width: 100%; padding: 8px;" type="button" disabled>Store not connected</button></div>
          </div>
        </div>
      </section>`;

    case 'blog':
      return `<section id="blog">
        <div class="container">
          <div class="section-label">Blog</div>
          <h2 class="section-title">Latest Articles</h2>
          <p class="section-desc">Replace these examples with your real articles and publication dates.</p>
          <div class="grid-3">
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 120px;"></div><div style="font-size: 0.75rem; color: var(--primary); margin-bottom: 8px;">Publication date</div><h3>Article title</h3><p>Add a short article summary.</p></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 120px;"></div><div style="font-size: 0.75rem; color: var(--primary); margin-bottom: 8px;">Publication date</div><h3>Article title</h3><p>Add a short article summary.</p></div>
            <div class="card"><div class="about-visual" style="margin-bottom: 16px; min-height: 120px;"></div><div style="font-size: 0.75rem; color: var(--primary); margin-bottom: 8px;">Publication date</div><h3>Article title</h3><p>Add a short article summary.</p></div>
          </div>
        </div>
      </section>`;

    case 'stats':
      return `<section id="stats">
        <div class="container">
          <div class="grid-4">
            <div class="stat"><div class="stat-number">—</div><div class="stat-label">Add metric</div></div>
            <div class="stat"><div class="stat-number">—</div><div class="stat-label">Add metric</div></div>
            <div class="stat"><div class="stat-number">—</div><div class="stat-label">Add metric</div></div>
            <div class="stat"><div class="stat-number">—</div><div class="stat-label">Add metric</div></div>
          </div>
        </div>
      </section>`;

    case 'faq':
      return `<section id="faq">
        <div class="container" style="max-width: 800px;">
          <div class="section-label">FAQ</div>
          <h2 class="section-title">Frequently Asked Questions</h2>
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 32px;">
            <div class="card"><h3 style="margin-bottom: 8px;">Add a common question</h3><p>Write an accurate answer for your visitors.</p></div>
            <div class="card"><h3 style="margin-bottom: 8px;">Add a common question</h3><p>Write an accurate answer for your visitors.</p></div>
            <div class="card"><h3 style="margin-bottom: 8px;">Add a common question</h3><p>Write an accurate answer for your visitors.</p></div>
          </div>
        </div>
      </section>`;

    case 'cta':
      return `<section id="cta">
        <div class="container">
          <div class="cta-box">
            <h2 class="section-title" style="margin-bottom: 16px;">Add a call to action</h2>
            <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 32px;">Explain what visitors can do next.</p>
            <a class="btn btn-primary" href="${req.sections.includes('contact') ? '#contact' : '#footer'}" style="padding: 14px 36px; font-size: 1rem;">Add action label</a>
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
              <p><span>&#9993;</span> Add your email address</p>
              <p><span>&#9742;</span> Add your phone number</p>
              <p><span>&#128205;</span> Add your business address</p>
              <p><span>&#128337;</span> Add your hours</p>
            </div>
            <form onsubmit="event.preventDefault();">
              <div class="form-group"><label>Name</label><input type="text" placeholder="Your name" required></div>
              <div class="form-group"><label>Email</label><input type="email" placeholder="your@email.com" required></div>
              <div class="form-group"><label>Message</label><textarea placeholder="Tell us about your project..." required></textarea></div>
              <p style="color: var(--text-muted); font-size: 0.8125rem; margin-bottom: 12px;">Preview only — connect a form service before collecting messages.</p>
              <button type="button" class="btn btn-outline" style="width: 100%;" disabled>Form not connected</button>
            </form>
          </div>
        </div>
      </section>`;

    default:
      return '';
  }
}

function addNavigationLink(html: string, section: string): string {
  const label = section.charAt(0).toUpperCase() + section.slice(1);
  return html.replace(
    /(<div class="nav-links">[\s\S]*?)(\s*<\/div>)/,
    `$1\n          <a href="#${section}">${label}</a>$2`,
  );
}

export function generateWebsite(prompt: string): GenerationResult {
  const req = parseRequest(prompt);
  const html = generateHTML(req);
  const files = generateFiles(html);

  const summary = `Created from local templates (no AI provider connected): ${req.sections.filter((s) => s !== 'footer').join(', ')} sections, ${req.colorHint} palette, ${req.tone} tone.`;

  return {
    html,
    files,
    title: req.name,
    summary,
    changed: true,
  };
}

export function modifyWebsite(currentHtml: string, instruction: string): GenerationResult {
  let modifiedHtml = currentHtml;
  const lower = instruction.toLowerCase();
  let changed = false;

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
        changed = true;
        themeName = color;
      }
      break;
    }
  }

  // Detect title/name change
  const titleMatch = instruction.match(/(?:change|rename|set)\b.*?\b(?:title|name)\b.*?\b(?:to|as)\b\s+(.+?)\s*[.!?]*$/i);
  const requestedName = titleMatch?.[1].trim().replace(/^["']|["']$/g, '').trim();
  if (requestedName) {
    const newName = escapeHtml(requestedName);
    const oldTitleMatch = modifiedHtml.match(/<title>(.+?) — Home<\/title>/);
    if (oldTitleMatch?.[1]) {
      modifiedHtml = modifiedHtml.split(oldTitleMatch[1]).join(newName);
      changed = true;
    }
    themeChanged = true;
  }

  // Detect section additions
  let addedSection = '';
  if (lower.match(/add.*testimonial/) && !modifiedHtml.includes('id="testimonials"')) {
    const req = parseRequest(instruction);
    const testimonialHTML = generateSection('testimonials', { ...req, name: 'Your Site' });
    modifiedHtml = modifiedHtml.replace(/(<footer(?:\s+[^>]*)?>)/, `${testimonialHTML}\n\n      $1`);
    modifiedHtml = addNavigationLink(modifiedHtml, 'testimonials');
    addedSection = 'testimonials';
    changed = true;
  }
  if (lower.match(/add.*pricing/) && !modifiedHtml.includes('id="pricing"')) {
    const req = parseRequest(instruction);
    const pricingHTML = generateSection('pricing', { ...req, name: 'Your Site' });
    modifiedHtml = modifiedHtml.replace(/(<footer(?:\s+[^>]*)?>)/, `${pricingHTML}\n\n      $1`);
    modifiedHtml = addNavigationLink(modifiedHtml, 'pricing');
    addedSection = addedSection ? `${addedSection}, pricing` : 'pricing';
    changed = true;
  }
  if (lower.match(/add.*faq/) && !modifiedHtml.includes('id="faq"')) {
    const req = parseRequest(instruction);
    const faqHTML = generateSection('faq', { ...req, name: 'Your Site' });
    modifiedHtml = modifiedHtml.replace(/(<footer(?:\s+[^>]*)?>)/, `${faqHTML}\n\n      $1`);
    modifiedHtml = addNavigationLink(modifiedHtml, 'faq');
    addedSection = addedSection ? `${addedSection}, FAQ` : 'FAQ';
    changed = true;
  }
  if (lower.match(/add.*contact/) && !modifiedHtml.includes('id="contact"')) {
    const req = parseRequest(instruction);
    const contactHTML = generateSection('contact', { ...req, name: 'Your Site' });
    modifiedHtml = modifiedHtml.replace(/(<footer(?:\s+[^>]*)?>)/, `${contactHTML}\n\n      $1`);
    modifiedHtml = addNavigationLink(modifiedHtml, 'contact');
    addedSection = addedSection ? `${addedSection}, contact` : 'contact';
    changed = true;
  }

  // Detect font change
  if (lower.match(/serif font|playfair|elegant font/)) {
    modifiedHtml = modifiedHtml.replace(/--font-heading:\s*[^;]+;/, `--font-heading: 'Playfair Display', serif;`);
    themeChanged = true;
    changed = true;
  }
  if (lower.match(/sans.font|grotesk|modern font/)) {
    modifiedHtml = modifiedHtml.replace(/--font-heading:\s*[^;]+;/, `--font-heading: 'Space Grotesk', sans-serif;`);
    themeChanged = true;
    changed = true;
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
    changed = true;
  }

  changed = modifiedHtml !== currentHtml;

  // Build summary
  const changes: string[] = [];
  if (themeChanged && themeName) changes.push(`changed the color scheme to ${themeName}`);
  if (titleMatch) changes.push(`updated the title`);
  if (addedSection) changes.push(`added a ${addedSection} section`);
  if (lower.match(/serif font|playfair/)) changes.push('switched to serif headings');
  if (lower.match(/sans.font|grotesk|modern font/)) changes.push('switched to sans-serif headings');
  if (lower.match(/light background|light theme|light mode|white background/)) changes.push('switched to a light background');

  const summary = changed && changes.length > 0
    ? `Applied local template edits: ${changes.join(' and ')}.`
    : `No changes were made. This local template editor supports palette, title, font, background, and adding testimonials, pricing, FAQ, or contact sections. No AI provider is connected.`;

  const oldTitleMatch = modifiedHtml.match(/<title>(.+?)\s—\s/);
  const title = oldTitleMatch ? oldTitleMatch[1] : 'Untitled';

  const files = generateFiles(modifiedHtml);

  return { html: modifiedHtml, files, title, summary, changed };
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

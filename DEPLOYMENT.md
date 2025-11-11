# Finvestech Tools - Deployment Guide

## 📦 Project Overview

Finvestech Tools is a comprehensive browser-based file processing suite with Compress, Convert, and Resize tools. All processing happens locally - no uploads, complete privacy.

**Live URL:** https://compress.finvestech.in

---

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Lovable (Recommended)
1. Open [Lovable Project](https://lovable.dev/projects/9bcb58d7-ee6b-4a5f-86b1-81ebb2344174)
2. Click **Share → Publish**
3. Follow the prompts to deploy

### Option 2: Deploy from GitHub
1. Push this repository to GitHub
2. Visit [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the Vite configuration
6. Click "Deploy"

**Build Settings (Auto-detected by Vercel):**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ and npm installed ([install with nvm](https://github.com/nvm-sh/nvm))

### Setup Instructions

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd compress

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run at `http://localhost:8080`

---

## 📁 Project Structure

```
compress/
├── public/
│   ├── favicon.ico          # Compress "C" icon
│   └── robots.txt           # SEO robots configuration
├── src/
│   ├── components/
│   │   ├── Header.tsx       # Site header with navigation
│   │   ├── Footer.tsx       # Site footer
│   │   ├── FileUpload.tsx   # Drag-and-drop file upload
│   │   ├── FileItem.tsx     # Individual file compression UI
│   │   └── ui/              # Shadcn UI components
│   ├── pages/
│   │   ├── Index.tsx        # Home page with compression tool
│   │   ├── About.tsx        # About page
│   │   ├── Privacy.tsx      # Privacy policy
│   │   └── NotFound.tsx     # 404 page
│   ├── utils/
│   │   ├── imageCompression.ts  # Image compression logic
│   │   └── pdfCompression.ts    # PDF compression logic
│   ├── index.css            # Design system & Tailwind
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── index.html               # HTML template with SEO meta tags
├── tailwind.config.ts       # Tailwind configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies
```

---

## 🎨 Design System

All styles are defined in `src/index.css` using CSS variables:

- **Primary Color:** `--primary: 243 75% 59%` (#4f46e5 indigo)
- **Font:** Outfit (Google Fonts)
- **Semantic Tokens:** All components use design system tokens, not hardcoded colors

---

## 🔍 SEO Features

✅ Optimized `<title>` and `<meta>` tags  
✅ Open Graph (OG) tags for social sharing  
✅ Twitter Card meta tags  
✅ Semantic HTML structure (`<header>`, `<main>`, `<section>`, `<footer>`)  
✅ Proper heading hierarchy (H1 → H2 → H3)  
✅ Image alt attributes  
✅ Mobile-responsive design  
✅ `robots.txt` configured  

---

## 🔐 Privacy & Security

- ✅ **No file uploads** - all processing happens in-browser
- ✅ **No data storage** - files exist only in browser memory
- ✅ **No tracking** - no file data is logged or analyzed
- ✅ Uses HTML5 Canvas API for image compression
- ✅ Uses pdf-lib for PDF optimization

---

## 📦 Dependencies

### Core Dependencies
- `react` - UI library
- `react-router-dom` - Client-side routing
- `pdf-lib` - PDF compression
- `lucide-react` - Icons
- `react-helmet` - SEO meta tag management

### UI Components
- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - Utility-first CSS
- `class-variance-authority` - Component variants

---

## 🌐 Custom Domain Setup (Hostinger)

To connect `compress.finvestech.in`:

### In Vercel:
1. Go to Project Settings → Domains
2. Add `compress.finvestech.in`
3. Copy the CNAME target (e.g., `cname.vercel-dns.com`)

### In Hostinger DNS:
1. Log into Hostinger → Domain Management
2. Select `finvestech.in` → DNS / Name Servers
3. Add CNAME record:
   - **Type:** CNAME
   - **Name:** compress
   - **Points to:** cname.vercel-dns.com
   - **TTL:** 14400 (4 hours)
4. Save and wait 15-30 minutes for propagation

---

## 💰 Monetization (Ad Integration)

The site includes ad placeholders:
```html
<div class="ad-area"></div>
```

To integrate ads (e.g., Google AdSense):
1. Get your AdSense code
2. Add the script to `index.html`
3. Replace `.ad-area` divs with ad units

---

## 📊 Analytics Setup

To add Google Analytics:
1. Get your GA4 tracking ID
2. Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🐛 Troubleshooting

### Build fails with TypeScript errors
```bash
npm run build -- --mode development
```

### Fonts not loading
Ensure Google Fonts link is in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

### PDF compression not working
Ensure `pdf-lib` is installed:
```bash
npm install pdf-lib@latest
```

---

## 📝 License

© 2025 Finvestech. All rights reserved.

---

## 🔗 Links

- **Live Site:** https://compress.finvestech.in
- **Lovable Project:** https://lovable.dev/projects/9bcb58d7-ee6b-4a5f-86b1-81ebb2344174
- **Main Site:** https://finvestech.in

---

## ✨ Features

- ✅ Browser-based compression (no uploads)
- ✅ Image support (JPG, PNG, WebP)
- ✅ PDF compression
- ✅ Drag-and-drop file upload
- ✅ Before/after size comparison
- ✅ Individual file downloads
- ✅ Fully responsive design
- ✅ SEO optimized
- ✅ Privacy-focused
- ✅ Modern, professional UI

---

**Ready to deploy!** 🚀

For questions or issues, visit [finvestech.in](https://finvestech.in)

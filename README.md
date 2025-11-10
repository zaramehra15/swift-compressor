# Compress - Free Browser-Based File Compression Tool

**Live at:** [compress.finvestech.in](https://compress.finvestech.in)

A modern, privacy-focused image and PDF compression tool that works entirely in your browser. No uploads, no tracking, no data storage.

---

## ✨ Features

### Core Functionality
- **Image Compression** - JPG, PNG, WebP support with quality controls
- **PDF Compression** - Optimize PDF file sizes while preserving quality
- **Web Workers** - Non-blocking compression for smooth performance
- **Multi-file Support** - Compress multiple files simultaneously
- **Download All as ZIP** - Batch download with JSZip
- **Format Conversion** - Auto/JPEG/WebP/PNG output options

### UI/UX
- **Quality Selector** - Low/Medium/High presets with size estimates
- **File Thumbnails** - Visual preview for images
- **Progress Indicators** - Real-time compression progress
- **Remove Files** - Individual file removal with X button
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Design** - Mobile-first, works on all devices

### Privacy & Security
- **100% Local Processing** - Files never leave your device
- **No Data Collection** - Zero tracking or analytics on file content
- **Memory Efficient** - Automatic cleanup of object URLs
- **50MB File Limit** - Performance protection

### SEO & Monetization
- **Structured Data** - Schema.org SoftwareApplication markup
- **Sitemap.xml** - Search engine discovery
- **Ad Placeholders** - Ready for AdSense integration
- **Buy Me a Coffee** - Donation support option

---

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone <YOUR_GIT_URL>
cd compress

# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:8080`

### Deploy to Vercel

1. **Via Lovable (Recommended)**
   - Open [Lovable Project](https://lovable.dev/projects/9bcb58d7-ee6b-4a5f-86b1-81ebb2344174)
   - Click **Share → Publish**
   
2. **Via GitHub**
   - Push to GitHub
   - Import to [Vercel](https://vercel.com)
   - Auto-detects Vite configuration
   - Click Deploy

---

## 📁 Project Structure

```
compress/
├── src/
│   ├── components/
│   │   ├── EnhancedFileItem.tsx    # File item with thumbnails & progress
│   │   ├── QualitySelector.tsx     # Quality presets (Low/Med/High)
│   │   ├── FormatSelector.tsx      # Output format selection
│   │   ├── FAQSection.tsx          # Accordion FAQ
│   │   ├── SampleFiles.tsx         # Demo file downloader
│   │   └── ui/                     # Shadcn components
│   ├── workers/
│   │   └── imageCompression.worker.ts  # Web Worker for images
│   ├── utils/
│   │   ├── compressionWorker.ts    # Worker interface
│   │   ├── pdfCompression.ts       # PDF logic (pdf-lib)
│   │   └── zipDownload.ts          # ZIP batch download (JSZip)
│   ├── pages/
│   │   ├── Index.tsx               # Homepage
│   │   ├── About.tsx               # About page
│   │   └── Privacy.tsx             # Privacy policy
│   └── index.css                   # Design system
├── public/
│   ├── sitemap.xml                 # SEO sitemap
│   ├── robots.txt                  # Search engine rules
│   └── favicon.ico                 # Brand icon
└── DEPLOYMENT.md                   # Detailed deployment guide
```

---

## 🎨 Design System

### Colors (HSL)
- **Primary:** `243 75% 59%` (#4f46e5 indigo)
- **Background:** White with subtle gradients
- **Semantic Tokens:** All components use CSS variables from `index.css`

### Typography
- **Font:** Inter (Google Fonts)
- **Weights:** 300-800

### Animations
- Powered by **Framer Motion**
- Smooth transitions and micro-interactions

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI (Radix primitives) |
| Animations | Framer Motion |
| Compression | Canvas API + pdf-lib |
| Workers | Web Workers (OffscreenCanvas) |
| Batch Download | JSZip |
| SEO | react-helmet + structured data |

---

## 📊 Performance

- **Web Workers** prevent UI freezing during compression
- **Lazy Loading** for non-critical scripts
- **Optimized Builds** via Vite code splitting
- **Memory Management** auto-cleanup of blobs/URLs

---

## 🔍 SEO Features

✅ Semantic HTML5 structure  
✅ Structured data (schema.org)  
✅ Open Graph tags  
✅ Twitter Card meta  
✅ Sitemap.xml  
✅ robots.txt  
✅ Canonical URLs  

---

## 💰 Monetization

### Ad Integration
Ad placeholders are ready:
- Desktop sidebar: `.ad-area` in settings column
- Mobile bottom: `.ad-area` below file list

### Donation Support
"Buy Me a Coffee" button in How It Works section

---

## 🌐 Custom Domain Setup

### Vercel Configuration
1. Go to Project Settings → Domains
2. Add `compress.finvestech.in`
3. Get DNS records

### DNS Provider
Add CNAME record:
```
Type: CNAME
Name: compress
Value: cname.vercel-dns.com
TTL: 3600
```

---

## 📦 Dependencies

### Production
- `react`, `react-dom` - UI library
- `react-router-dom` - Routing
- `pdf-lib` - PDF compression
- `jszip` - ZIP archives
- `framer-motion` - Animations
- `lucide-react` - Icons
- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - Styling

### Development
- `vite` - Build tool
- `typescript` - Type safety
- `@vitejs/plugin-react-swc` - Fast refresh

---

## 🤝 Contributing

This is a Lovable-managed project. To contribute:
1. Open [Lovable Project](https://lovable.dev/projects/9bcb58d7-ee6b-4a5f-86b1-81ebb2344174)
2. Make changes via prompts or code editor
3. Changes auto-sync to GitHub

---

## 📝 License

© 2025 Finvestech. All rights reserved.

---

## 🔗 Links

- **Live Site:** https://compress.finvestech.in
- **Lovable Project:** https://lovable.dev/projects/9bcb58d7-ee6b-4a5f-86b1-81ebb2344174
- **Finvestech:** https://finvestech.in

---

**Built with ❤️ by Finvestech** | [About](https://compress.finvestech.in/about) | [Privacy](https://compress.finvestech.in/privacy)

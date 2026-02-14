import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileArchive, RefreshCw, Maximize2, Shield, Zap, Lock, ArrowRight, Crop, ImageIcon, FileCode2, Combine, Scissors, QrCode } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: "compress",
      title: "Compress Files",
      description: "Reduce file size for images and PDFs without losing quality",
      icon: FileArchive,
      path: "/compress",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "convert",
      title: "Convert Files",
      description: "Convert between image, document, audio, and video formats",
      icon: RefreshCw,
      path: "/convert",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      id: "resize",
      title: "Resize Images",
      description: "Resize images for social media, email, and web",
      icon: Maximize2,
      path: "/resize",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "crop",
      title: "Crop Image",
      description: "Crop images with preset aspect ratios for any platform",
      icon: Crop,
      path: "/crop",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      id: "heic-to-jpg",
      title: "HEIC to JPG",
      description: "Convert iPhone HEIC photos to JPG or PNG instantly",
      icon: ImageIcon,
      path: "/heic-to-jpg",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      id: "svg-to-png",
      title: "SVG to PNG",
      description: "Convert vector SVG files to high-quality raster images",
      icon: FileCode2,
      path: "/svg-to-png",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    },
    {
      id: "pdf-merge",
      title: "Merge PDF",
      description: "Combine multiple PDF files into a single document",
      icon: Combine,
      path: "/pdf-merge",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      id: "pdf-split",
      title: "Split PDF",
      description: "Extract specific pages or ranges from any PDF",
      icon: Scissors,
      path: "/pdf-split",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "qr-generator",
      title: "QR Generator",
      description: "Create custom QR codes for URLs, WiFi, contacts, and more",
      icon: QrCode,
      path: "/qr-generator",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Private",
      description: "All processing happens in your browser",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "No uploads or downloads to servers",
    },
    {
      icon: Lock,
      title: "Secure",
      description: "Your files never leave your device",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Finvestech Tools – Free Online File Compressor, Converter & Resizer</title>
        <meta
          name="description"
          content="Compress, convert, resize, crop images, convert HEIC to JPG, SVG to PNG, merge & split PDFs, and generate QR codes — all free, private, and browser-based."
        />
        <meta name="keywords" content="file compressor, image converter, photo resizer, pdf compressor, online tools, free tools, privacy tools" />
        <link rel="canonical" href="https://compress.finvestech.in/" />

        {/* Open Graph */}
        <meta property="og:title" content="Finvestech Tools – Free Online File Compressor, Converter & Resizer" />
        <meta property="og:description" content="Compress, convert, and resize images, PDFs, and videos instantly in your browser. 100% private, secure, and free." />
        <meta property="og:url" content="https://compress.finvestech.in/" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Finvestech Tools – Free Online File Compressor, Converter & Resizer" />
        <meta name="twitter:description" content="Compress, convert, and resize images, PDFs, and videos instantly in your browser." />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Finvestech Tools",
            "description": "Free online tools to compress, convert, and resize images, PDFs, and videos",
            "url": "https://compress.finvestech.in",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-24">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="gradient-subtle py-20 px-4"
          >
            <div className="container mx-auto text-center max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight"
              >
                Finvestech Tools
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl text-primary mb-8 font-semibold"
              >
                Free, Fast & Private File Utilities
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
              >
                Professional file tools that work entirely in your browser. No uploads, no tracking, complete privacy.
              </motion.p>

              {/* Tool Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card
                        className="p-6 cursor-pointer hover:shadow-elegant transition-smooth border-2 hover:border-primary h-full"
                        onClick={() => navigate(tool.path)}
                      >
                        <div className={`w-16 h-16 rounded-2xl ${tool.bgColor} flex items-center justify-center mx-auto mb-4`}>
                          <Icon className={`w-8 h-8 ${tool.color}`} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                          {tool.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                          {tool.description}
                        </p>
                        <Button
                          variant="outline"
                          className="w-full group"
                          onClick={() => navigate(tool.path)}
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Ad Gap Placeholder below tool cards */}
              <div className="h-16" />

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-4"
              >
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{feature.title}</span>
                    </div>
                  );
                })}
              </motion.div>
              {/* Ad Gap Placeholder */}
              <div className="h-16" />
            </div>
          </motion.section>

          {/* Features Section */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Why Choose Finvestech Tools?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Built for professionals and individuals who value privacy, speed, and reliability
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-elegant">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="prose prose-lg mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Professional File Tools for Everyone
              </h2>
              <p className="text-muted-foreground mb-6">
                Whether you're preparing email attachments for clients in the US, optimizing images for UK web submissions, or converting documents for Canadian business requirements, Finvestech Tools provides the professional-grade utilities you need. All tools work entirely in your browser, ensuring your sensitive files remain private and secure.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                What Makes Us Different?
              </h3>
              <ul className="text-muted-foreground space-y-2 mb-6">
                <li><strong>Complete Privacy:</strong> Zero file uploads means your data never leaves your device</li>
                <li><strong>Lightning Fast:</strong> No server round-trips, process files instantly in your browser</li>
                <li><strong>Always Free:</strong> No subscriptions, no hidden fees, no premium tiers</li>
                <li><strong>No Limits:</strong> Process as many files as you need, whenever you need</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                Perfect for Global Users
              </h3>
              <p className="text-muted-foreground">
                Our tools are trusted by users across the United States, United Kingdom, Canada, and worldwide. From content creators optimizing images for social media to business professionals preparing documents for international submissions, Finvestech Tools delivers reliable, privacy-focused file utilities that work anywhere, anytime.
              </p>
            </div>
          </section>
        </main>

        {/* Support/Donation Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 text-center border border-primary/20"
            >
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Love Finvestech Tools?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Help us keep these tools free and ad-light. Your support helps us maintain and improve Finvestech Tools for everyone.
              </p>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.open('https://buymeacoffee.com/finvestech01', '_blank', 'noopener,noreferrer')}
              >
                Buy Me a Coffee
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;

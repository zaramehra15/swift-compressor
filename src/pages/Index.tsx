import { useState } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileToolNav from "@/components/MobileToolNav";
import FileUpload from "@/components/FileUpload";
import EnhancedFileItem from "@/components/EnhancedFileItem";
import QualitySelector from "@/components/QualitySelector";
import FormatSelector from "@/components/FormatSelector";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Lock, Download, Gift } from "lucide-react";
import { downloadAsZip } from "@/utils/zipDownload";
import { useToast } from "@/hooks/use-toast";

interface CompressedFile {
  file: File;
  blob: Blob | null;
}

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<Map<string, Blob>>(new Map());
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [format, setFormat] = useState<'auto' | 'jpeg' | 'webp' | 'png'>('auto');
  const { toast } = useToast();

  const handleFilesSelected = (newFiles: File[]) => {
    // Check file size limit (50MB)
    const oversizedFiles = newFiles.filter(f => f.size > 50 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      toast({
        title: "File size limit exceeded",
        description: `${oversizedFiles.length} file(s) exceed 50MB limit and were skipped.`,
        variant: "destructive",
      });
    }

    const validFiles = newFiles.filter(f => f.size <= 50 * 1024 * 1024);
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    // Also remove from compressed map if exists
    const fileToRemove = files[index];
    setCompressedFiles((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileToRemove.name);
      return newMap;
    });
  };

  const handleFileCompressed = (fileName: string, blob: Blob) => {
    setCompressedFiles((prev) => new Map(prev).set(fileName, blob));
  };

  const handleDownloadAll = async () => {
    if (compressedFiles.size === 0) {
      toast({
        title: "No compressed files",
        description: "Please compress files before downloading.",
        variant: "destructive",
      });
      return;
    }

    const filesToZip = Array.from(compressedFiles.entries()).map(([name, blob]) => ({
      name: `compressed_${name}`,
      blob,
    }));

    try {
      await downloadAsZip(filesToZip);
      toast({
        title: "Download started!",
        description: `Downloading ${filesToZip.length} compressed file(s) as ZIP.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "An error occurred while creating the ZIP file.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setCompressedFiles(new Map());
  };

  const totalOriginalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <>
      <Helmet>
        <title>Compress Images & PDFs Instantly – Free & Private | Finvestech Tools</title>
        <meta
          name="description"
          content="Fast, private, and free file compressor. Reduce size of images and PDFs without losing quality — works fully in your browser. No uploads required."
        />
        <meta name="keywords" content="compress images, compress PDF, image compressor, PDF compressor, reduce file size, free compressor, online image compressor, compress pictures online, reduce image size, shrink PDF file, best free compressor 2025" />
        <link rel="canonical" href="https://compress.finvestech.in/compress" />

        {/* Open Graph */}
        <meta property="og:title" content="Compress Images & PDFs Instantly – Free & Private | Finvestech Tools" />
        <meta property="og:description" content="Reduce file size of images and PDFs without losing quality. 100% browser-based, no uploads." />
        <meta property="og:url" content="https://compress.finvestech.in/compress" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Finvestech Tools" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Compress Images & PDFs Instantly | Finvestech Tools" />
        <meta name="twitter:description" content="Free online image and PDF compressor. No uploads, 100% private." />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Finvestech Image & PDF Compressor",
            "description": "Free online tool to compress images and PDF files without losing quality. Works entirely in your browser.",
            "url": "https://compress.finvestech.in/compress",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "featureList": [
              "Image compression (JPG, PNG, WebP)",
              "PDF compression",
              "Batch file compression",
              "Download all as ZIP",
              "Low/Medium/High quality settings",
              "100% browser-based, no uploads"
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://compress.finvestech.in/" },
              { "@type": "ListItem", "position": 2, "name": "Compress", "item": "https://compress.finvestech.in/compress" }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Compress Images and PDFs Online for Free",
            "description": "Compress your images and PDF files in 3 simple steps using Finvestech Tools — all within your browser.",
            "step": [
              { "@type": "HowToStep", "position": 1, "name": "Upload Files", "text": "Drop your images or PDF files, or click to browse from your device" },
              { "@type": "HowToStep", "position": 2, "name": "Choose Quality", "text": "Select Low, Medium, or High quality compression settings" },
              { "@type": "HowToStep", "position": 3, "name": "Download", "text": "Download individual files or get all compressed files as a ZIP archive" }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        {/* Hero Section */}
        <main className="flex-1 pt-24">
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
                className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
              >
                Compress Images & PDFs
                <br />
                <span className="text-primary">Instantly – 100% Free & Private</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              >
                Optimize your images and PDF files directly in your browser. No uploads. No
                data tracking. Everything happens locally on your device.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant text-lg px-8 py-6 h-auto"
                  onClick={() => document.getElementById("compress-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Choose Files to Compress
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 mt-12">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">100% Private</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">No Uploads</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Compression Section */}
          <section id="compress-section" className="py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Settings Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <QualitySelector
                      quality={quality}
                      onQualityChange={setQuality}
                      totalSize={totalOriginalSize}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* <FormatSelector format={format} onFormatChange={setFormat} /> */}

                  </motion.div>

                  {/* Ad Placeholder - Desktop Sidebar */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="hidden lg:block"
                  >
                    <div className="ad-area bg-muted/30 border border-border rounded-xl p-6 text-center">
                      <p className="text-xs text-muted-foreground">
                        Advertisement
                      </p>
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Ad Space</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <FileUpload onFilesSelected={handleFilesSelected} />

                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-4 bg-card border border-border rounded-xl p-4 shadow-card">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">
                            Your Files ({files.length})
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {compressedFiles.size} of {files.length} compressed
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {compressedFiles.size > 0 && (
                            <Button
                              onClick={handleDownloadAll}
                              className="gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download All as ZIP
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={handleClearAll}
                            size="sm"
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <AnimatePresence>
                          {files.map((file, index) => (
                            <EnhancedFileItem
                              key={`${file.name}-${index}`}
                              file={file}
                              quality={quality}
                              format={format}
                              onRemove={() => handleRemoveFile(index)}
                              onCompressed={(blob) => handleFileCompressed(file.name, blob)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Ad Placeholder - Mobile */}
                      <div className="lg:hidden">
                        <div className="ad-area bg-muted/30 border border-border rounded-xl p-6 text-center">
                          <p className="text-xs text-muted-foreground mb-2">
                            Advertisement
                          </p>
                          <div className="h-32 flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Ad Space</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <FAQSection />

          {/* How It Works */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-center text-foreground mb-4">
                  How It Works
                </h2>
                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                  Compress your files in three simple steps — all within your browser
                </p>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    step: 1,
                    title: "Upload Files",
                    description: "Drop your images or PDF files, or click to browse from your device",
                  },
                  {
                    step: 2,
                    title: "Compress",
                    description: "Choose quality settings and click compress. Processing happens instantly in your browser",
                  },
                  {
                    step: 3,
                    title: "Download",
                    description: "Download individual files or get all compressed files as a ZIP archive",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-elegant">
                      <span className="text-2xl font-bold text-white">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Support/Donation Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 text-center border border-primary/20"
              >
                <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Love Compress?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Help us keep this tool free and ad-light. Your support helps us maintain and improve Compress for everyone.
                </p>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => window.open('https://buymeacoffee.com/finvestech01', '_blank')}
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Buy Me a Coffee
                </Button>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
        <MobileToolNav />
      </div>
    </>
  );
};

export default Index;

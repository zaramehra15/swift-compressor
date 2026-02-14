import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileToolNav from "@/components/MobileToolNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Lock, Unlock } from "lucide-react";
import { motion } from "framer-motion";

const Resize = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [outputFormat, setOutputFormat] = useState<string>("original");
  const [jpegQuality, setJpegQuality] = useState<number>(85);
  const [resizing, setResizing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const { toast } = useToast();
  const imgRef = useRef<HTMLImageElement>(null);

  const presetGroups = [
    {
      label: "Social Media",
      presets: [
        { name: "Instagram Post", width: 1080, height: 1080 },
        { name: "Instagram Story", width: 1080, height: 1920 },
        { name: "Instagram Reel", width: 1080, height: 1920 },
        { name: "Facebook Post", width: 1200, height: 630 },
        { name: "Facebook Cover", width: 820, height: 312 },
        { name: "Twitter/X Post", width: 1200, height: 675 },
        { name: "Twitter/X Header", width: 1500, height: 500 },
        { name: "LinkedIn Post", width: 1200, height: 627 },
        { name: "LinkedIn Banner", width: 1584, height: 396 },
        { name: "YouTube Thumbnail", width: 1280, height: 720 },
        { name: "Pinterest Pin", width: 1000, height: 1500 },
        { name: "TikTok", width: 1080, height: 1920 },
      ],
    },
    {
      label: "Messaging",
      presets: [
        { name: "WhatsApp DP", width: 640, height: 640 },
        { name: "WhatsApp Status", width: 1080, height: 1920 },
        { name: "Telegram", width: 1280, height: 1280 },
      ],
    },
    {
      label: "Standard Sizes",
      presets: [
        { name: "HD (720p)", width: 1280, height: 720 },
        { name: "Full HD (1080p)", width: 1920, height: 1080 },
        { name: "2K (1440p)", width: 2560, height: 1440 },
        { name: "4K (2160p)", width: 3840, height: 2160 },
        { name: "Email (600×400)", width: 600, height: 400 },
        { name: "Passport Photo", width: 600, height: 600 },
        { name: "Wallpaper 16:9", width: 1920, height: 1080 },
        { name: "Wallpaper 21:9", width: 2560, height: 1080 },
      ],
    },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please use an image under 50MB.", variant: "destructive" });
        return;
      }

      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
          setWidth(img.width);
          setHeight(img.height);
          setPreview(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(selectedFile);
      e.target.value = '';
    }
  };

  const handleWidthChange = (newWidth: number) => {
    const maxDim = 8000;
    const v = Number.isFinite(newWidth) ? Math.max(1, Math.min(maxDim, Math.round(newWidth))) : 1;
    setWidth(v);
    if (aspectLocked && originalDimensions.width) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(v * ratio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    const maxDim = 8000;
    const v = Number.isFinite(newHeight) ? Math.max(1, Math.min(maxDim, Math.round(newHeight))) : 1;
    setHeight(v);
    if (aspectLocked && originalDimensions.height) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(v * ratio));
    }
  };

  const applyPreset = (preset: { name: string; width: number; height: number }) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setAspectLocked(false);
    setSelectedPreset(preset.name);
  };

  const getOutputMime = (): string => {
    if (outputFormat === 'original') {
      if (file?.type === 'image/webp') return 'image/webp';
      if (file?.type === 'image/png') return 'image/png';
      return 'image/jpeg';
    }
    const map: Record<string, string> = {
      'jpg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
    };
    return map[outputFormat] || 'image/jpeg';
  };

  const getOutputExt = (): string => {
    if (outputFormat === 'original') {
      if (file?.type === 'image/webp') return 'webp';
      if (file?.type === 'image/png') return 'png';
      return 'jpg';
    }
    return outputFormat;
  };

  const handleResize = async () => {
    if (!file || !preview) return;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
      toast({ title: "Invalid dimensions", description: "Please enter valid width and height.", variant: "destructive" });
      return;
    }
    if (width > 8000 || height > 8000) {
      toast({ title: "Dimension too large", description: "Please keep dimensions under 8000px.", variant: "destructive" });
      return;
    }

    setResizing(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }

      const outputMime = getOutputMime();
      const quality = outputMime === 'image/png' ? undefined : jpegQuality / 100;

      // White background for JPEG (no transparency)
      if (outputMime === 'image/jpeg' && ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          setResizing(false);
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const baseName = file.name.replace(/\.[^.]+$/, '');
            const ext = getOutputExt();
            a.download = `resized_${baseName}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);

            toast({
              title: "Image Resized!",
              description: `Downloaded as ${width}×${height}px (${(blob.size / 1024 / 1024).toFixed(2)} MB)`,
            });
            setSelectedPreset(null);
          }
        },
        outputMime,
        quality
      );
    };

    img.onerror = () => {
      setResizing(false);
      toast({ title: "Failed to load image", description: "The image could not be processed.", variant: "destructive" });
    };

    img.src = preview;
  };

  return (
    <>
      <Helmet>
        <title>Resize Images Online — Social Media Presets & Custom Sizes | Finvestech Tools</title>
        <meta
          name="description"
          content="Free online image resizer with 23+ presets for Instagram, Facebook, Twitter, YouTube, LinkedIn, TikTok, and more. Choose custom dimensions. No uploads, 100% private."
        />
        <meta name="keywords" content="resize image online, image resizer, photo resizer, resize for instagram, resize for facebook, resize for twitter, resize for social media, free image resizer, resize pictures online, crop image online 2025" />
        <link rel="canonical" href="https://compress.finvestech.in/resize" />

        {/* Open Graph */}
        <meta property="og:title" content="Resize Images Online — Social Media Presets & Custom Sizes | Finvestech Tools" />
        <meta property="og:description" content="Free online image resizer with 23+ presets for social media. No uploads, 100% private." />
        <meta property="og:url" content="https://compress.finvestech.in/resize" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Finvestech Tools" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resize Images for Social Media — Free Online Tool | Finvestech Tools" />
        <meta name="twitter:description" content="Resize images for Instagram, Facebook, YouTube, LinkedIn and more. 23+ presets, custom sizes. 100% private." />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Finvestech Image Resizer",
            "description": "Free online image resizer with presets for Instagram, Facebook, Twitter, YouTube and more",
            "url": "https://compress.finvestech.in/resize",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "featureList": [
              "23+ social media presets",
              "Custom dimension resizing",
              "Aspect ratio locking",
              "Output format selection (JPG, PNG, WebP)",
              "Quality control slider",
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
              { "@type": "ListItem", "position": 2, "name": "Resize", "item": "https://compress.finvestech.in/resize" }
            ]
          })}
        </script>
      </Helmet>


      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-20">
          <section className="container mx-auto px-4 py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Resize Images Online
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Resize images for social media, email, and web with one click. Presets for Instagram, Facebook, Twitter/X, YouTube, LinkedIn, WhatsApp, TikTok, and more.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                🔒 100% Private & Secure
              </div>
            </motion.div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Upload Image
                </h2>

                {!file && (
                  <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-smooth cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="resize-file-input"
                    />
                    <label htmlFor="resize-file-input" className="cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Choose an image
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG, WebP, GIF, BMP — up to 50MB
                      </p>
                    </label>
                  </div>
                )}

                {preview && (
                  <div className="space-y-6">
                    <div className="border border-border rounded-xl overflow-hidden">
                      <img
                        ref={imgRef}
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>

                    <div className="text-sm text-muted-foreground text-center">
                      Original: {originalDimensions.width} × {originalDimensions.height}px
                      {file && ` • ${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    </div>
                  </div>
                )}
              </Card>

              {/* Settings Section */}
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Resize Settings
                </h2>

                {/* Presets */}
                <div className="mb-6">
                  {presetGroups.map((group) => (
                    <div key={group.label} className="mb-4">
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">
                        {group.label}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {group.presets.map((preset) => (
                          <Button
                            key={preset.name}
                            variant="outline"
                            size="sm"
                            onClick={() => applyPreset(preset)}
                            className={`text-xs transition-all ${selectedPreset === preset.name
                              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground shadow-md ring-2 ring-primary/30'
                              : ''
                              }`}
                          >
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dimensions */}
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="width" className="text-sm font-medium mb-2 block">
                      Width (px)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      min={1}
                      max={8000}
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAspectLocked(!aspectLocked)}
                      title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                    >
                      {aspectLocked ? (
                        <Lock className="w-4 h-4 text-primary" />
                      ) : (
                        <Unlock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="height" className="text-sm font-medium mb-2 block">
                      Height (px)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      min={1}
                      max={8000}
                    />
                  </div>
                </div>

                {/* Output Format */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-2 block">Output Format</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original Format</SelectItem>
                      <SelectItem value="jpg">JPEG (.jpg)</SelectItem>
                      <SelectItem value="png">PNG (.png)</SelectItem>
                      <SelectItem value="webp">WebP (.webp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Slider (for lossy formats) */}
                {(outputFormat === 'jpg' || outputFormat === 'webp' || (outputFormat === 'original' && file?.type !== 'image/png')) && (
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">
                      Quality: {jpegQuality}%
                    </Label>
                    <Slider
                      value={[jpegQuality]}
                      onValueChange={(val) => setJpegQuality(val[0])}
                      min={10}
                      max={100}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Smaller file</span>
                      <span>Higher quality</span>
                    </div>
                  </div>
                )}

                {/* Size Info */}
                {file && (
                  <div className="p-4 bg-muted/30 rounded-xl mb-6">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between mb-1">
                        <span>Original size:</span>
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Original dimensions:</span>
                        <span>{originalDimensions.width} × {originalDimensions.height}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New dimensions:</span>
                        <span className="font-medium text-foreground">{width} × {height}px</span>
                      </div>
                      {(width > 5000 || height > 5000) && (
                        <div className="mt-2 text-amber-600 text-xs">⚠️ Large dimensions may impact performance.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleResize}
                    disabled={!file || resizing}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {resizing ? 'Resizing...' : 'Resize & Download'}
                  </Button>

                  {file && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setPreview("");
                        setOutputFormat("original");
                        setJpegQuality(85);
                        setSelectedPreset(null);
                      }}
                      className="w-full"
                    >
                      Upload New Image
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </section>

          {/* SEO Content */}
          <section className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="prose prose-lg mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Perfect Image Sizes for Every Platform
              </h2>
              <p className="text-muted-foreground mb-6">
                Whether you're posting on social media, creating email campaigns, or building a website, our resizer helps you achieve the perfect dimensions with one click. All processing happens in your browser — your images are never uploaded.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                Social Media Image Sizes (2025)
              </h3>
              <ul className="text-muted-foreground space-y-2 mb-6">
                <li><strong>Instagram Post:</strong> 1080×1080px (square format for feed)</li>
                <li><strong>Instagram Story/Reels:</strong> 1080×1920px (9:16 vertical)</li>
                <li><strong>Facebook Post:</strong> 1200×630px (landscape)</li>
                <li><strong>Facebook Cover:</strong> 820×312px (desktop banner)</li>
                <li><strong>Twitter/X Post:</strong> 1200×675px (16:9 ratio)</li>
                <li><strong>LinkedIn Post:</strong> 1200×627px (landscape)</li>
                <li><strong>YouTube Thumbnail:</strong> 1280×720px (16:9 HD)</li>
                <li><strong>Pinterest Pin:</strong> 1000×1500px (2:3 vertical)</li>
                <li><strong>TikTok:</strong> 1080×1920px (9:16 vertical)</li>
                <li><strong>WhatsApp DP:</strong> 640×640px (square)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                Output Formats
              </h3>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>JPEG:</strong> Best for photos. Smallest file size with adjustable quality.</li>
                <li><strong>PNG:</strong> Best for graphics, logos, and images with transparency.</li>
                <li><strong>WebP:</strong> Modern format with excellent compression. Supported by all modern browsers.</li>
              </ul>
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
                Love Resize?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Help us keep this resizer free and ad-light. Your support helps us maintain and improve resizing for everyone.
              </p>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.open('https://buymeacoffee.com/finvestech01', '_blank')}
              >
                Buy Me a Coffee
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
        <MobileToolNav />
      </div>
    </>
  );
};

export default Resize;
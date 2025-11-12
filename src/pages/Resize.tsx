import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const { toast } = useToast();
  const imgRef = useRef<HTMLImageElement>(null);

  const presets = [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Instagram Story", width: 1080, height: 1920 },
    { name: "YouTube Thumbnail", width: 1280, height: 720 },
    { name: "WhatsApp", width: 1080, height: 1080 },
    { name: "Email", width: 600, height: 400 },
    { name: "HD (1080p)", width: 1920, height: 1080 },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
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
    }
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (aspectLocked && originalDimensions.width) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (aspectLocked && originalDimensions.height) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleResize = async () => {
    if (!file || !preview) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Determine output format and quality
      const outputMimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const quality = 0.85; // Good balance between quality and file size

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            
            // Preserve original extension or use jpg for jpeg
            const extension = file.type === "image/png" ? "png" : "jpg";
            const baseName = file.name.split(".")[0];
            a.download = `resized_${baseName}.${extension}`;
            
            a.click();
            URL.revokeObjectURL(url);

            toast({
              title: "Image Resized!",
              description: `Downloaded as ${width}x${height}px (${(blob.size / 1024 / 1024).toFixed(2)} MB)`,
            });
          }
        },
        outputMimeType,
        quality
      );
    };

    img.src = preview;
  };

  return (
    <>
      <Helmet>
        <title>Resize Images Online — Crop & Resize Free | Finvestech Tools</title>
        <meta 
          name="description" 
          content="Free online image resizer. Resize, crop, and optimize images for social media, email, and web. Perfect for WhatsApp, Instagram, and more. No uploads required." 
        />
        <meta name="keywords" content="resize image, crop image, image resizer, photo resizer, instagram resize, whatsapp image size" />
        <link rel="canonical" href="https://compress.finvestech.in/resize" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Resize Images Online — Crop & Resize Free | Finvestech Tools" />
        <meta property="og:description" content="Free online image resizer. Resize and crop images for social media, email, and web instantly." />
        <meta property="og:url" content="https://compress.finvestech.in/resize" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Finvestech Image Resizer",
            "description": "Free online tool to resize and crop images for social media and web",
            "url": "https://compress.finvestech.in/resize",
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
                Resize and crop images for social media, email, and web. Files processed in your browser — never uploaded or stored.
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
                        or drag and drop here
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
                        className="w-full h-auto"
                      />
                    </div>

                    <div className="text-sm text-muted-foreground text-center">
                      Original: {originalDimensions.width} × {originalDimensions.height}px
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
                  <Label className="text-sm font-medium mb-3 block">Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset)}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
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
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAspectLocked(!aspectLocked)}
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
                    />
                  </div>
                </div>

                {/* Estimated Size */}
                {file && (
                  <div className="p-4 bg-muted/30 rounded-xl mb-6">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between mb-1">
                        <span>Original size:</span>
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New dimensions:</span>
                        <span>{width} × {height}px</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleResize}
                    disabled={!file}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Resize & Download
                  </Button>

                  {file && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setPreview("");
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
                Whether you're sharing photos on social media in the US, UK, or Canada, or preparing images for email campaigns, our resizer helps you achieve the perfect dimensions. Optimize images for faster loading times while maintaining quality.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                Popular Image Sizes
              </h3>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Instagram Post:</strong> 1080×1080px (square format for feed posts)</li>
                <li><strong>Instagram Story:</strong> 1080×1920px (9:16 vertical format)</li>
                <li><strong>WhatsApp Profile:</strong> 640×640px (optimal for profile pictures)</li>
                <li><strong>Email Attachments:</strong> 600×400px (fast loading, good quality)</li>
                <li><strong>HD Display:</strong> 1920×1080px (Full HD for presentations)</li>
              </ul>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Resize;
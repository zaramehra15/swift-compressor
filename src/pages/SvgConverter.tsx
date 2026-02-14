import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

const SvgConverter = () => {
    const [svgFile, setSvgFile] = useState<File | null>(null);
    const [svgPreview, setSvgPreview] = useState("");
    const [outputFormat, setOutputFormat] = useState("png");
    const [outputWidth, setOutputWidth] = useState(1024);
    const [outputHeight, setOutputHeight] = useState(1024);
    const [quality, setQuality] = useState(92);
    const [bgColor, setBgColor] = useState("transparent");
    const [converting, setConverting] = useState(false);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            if (!f.name.toLowerCase().endsWith(".svg")) {
                toast({ title: "Invalid file", description: "Please select an SVG file.", variant: "destructive" });
                return;
            }
            setSvgFile(f);
            const url = URL.createObjectURL(f);
            setSvgPreview(url);

            // Try to read native dimensions
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target?.result as string;
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "image/svg+xml");
                const svg = doc.querySelector("svg");
                if (svg) {
                    const vb = svg.getAttribute("viewBox")?.split(/[\s,]+/).map(Number);
                    const w = parseFloat(svg.getAttribute("width") || "") || vb?.[2] || 1024;
                    const h = parseFloat(svg.getAttribute("height") || "") || vb?.[3] || 1024;
                    setOutputWidth(Math.round(w));
                    setOutputHeight(Math.round(h));
                }
            };
            reader.readAsText(f);
        }
        e.target.value = "";
    };

    const handleConvert = async () => {
        if (!svgFile) return;
        setConverting(true);

        try {
            const svgText = await svgFile.text();
            const img = new Image();

            // Create a blob URL from the SVG
            const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Failed to load SVG"));
                img.src = url;
            });

            const canvas = document.createElement("canvas");
            canvas.width = outputWidth;
            canvas.height = outputHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas not supported");

            // Background
            if (bgColor !== "transparent") {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, outputWidth, outputHeight);
            }

            ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
            URL.revokeObjectURL(url);

            const mimeMap: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
            const mime = mimeMap[outputFormat];

            if (mime === "image/jpeg" && bgColor === "transparent") {
                // JPEG doesn't support transparency, fill white
                const c2 = document.createElement("canvas");
                c2.width = outputWidth;
                c2.height = outputHeight;
                const x2 = c2.getContext("2d")!;
                x2.fillStyle = "#ffffff";
                x2.fillRect(0, 0, outputWidth, outputHeight);
                x2.drawImage(canvas, 0, 0);
                c2.toBlob(
                    (blob) => {
                        if (blob) downloadBlob(blob);
                        setConverting(false);
                    },
                    mime,
                    quality / 100
                );
                return;
            }

            canvas.toBlob(
                (blob) => {
                    if (blob) downloadBlob(blob);
                    setConverting(false);
                },
                mime,
                mime === "image/png" ? undefined : quality / 100
            );
        } catch {
            toast({ title: "Conversion failed", description: "Could not convert this SVG file.", variant: "destructive" });
            setConverting(false);
        }
    };

    const downloadBlob = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const baseName = svgFile?.name.replace(/\.svg$/i, "") || "converted";
        a.download = `${baseName}.${outputFormat}`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Converted!", description: `${outputWidth}×${outputHeight}px — ${(blob.size / 1024).toFixed(0)} KB` });
    };

    return (
        <>
            <Helmet>
                <title>SVG to PNG Converter — Free Online Vector to Image Tool | Finvestech Tools</title>
                <meta name="description" content="Convert SVG vector files to PNG, JPG, or WebP images online for free. Custom dimensions, background color options. 100% private." />
                <meta name="keywords" content="svg to png, svg converter, vector to image, svg to jpg, convert svg online, svg to webp" />
                <link rel="canonical" href="https://compress.finvestech.in/svg-to-png" />
                <meta property="og:title" content="SVG to PNG Converter — Free Online Vector to Image Tool" />
                <meta property="og:description" content="Convert SVG files to PNG, JPG, or WebP with custom dimensions. 100% browser-based." />
                <meta property="og:url" content="https://compress.finvestech.in/svg-to-png" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Finvestech Tools" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="SVG to PNG Converter — Free Online" />
                <meta name="twitter:description" content="Convert SVG to PNG/JPG/WebP online for free. No uploads." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "SVG to PNG Converter — Finvestech Tools",
                        "description": "Free online SVG to PNG/JPG/WebP converter tool",
                        "url": "https://compress.finvestech.in/svg-to-png",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Web",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://compress.finvestech.in/" },
                            { "@type": "ListItem", "position": 2, "name": "SVG to PNG", "item": "https://compress.finvestech.in/svg-to-png" }
                        ]
                    })}
                </script>
            </Helmet>

            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 pt-24 pb-16 px-4">
                    <div className="container mx-auto max-w-4xl">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                                <span className="text-primary">SVG</span> to PNG Converter
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Convert vector SVG files to high-quality PNG, JPG, or WebP images with custom dimensions.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="p-6">
                                {!svgPreview ? (
                                    <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary transition-all cursor-pointer">
                                        <input type="file" accept=".svg" onChange={handleFileSelect} className="hidden" id="svg-input" />
                                        <label htmlFor="svg-input" className="cursor-pointer">
                                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                                <Upload className="w-7 h-7 text-primary" />
                                            </div>
                                            <h3 className="text-base font-semibold mb-1">Select SVG File</h3>
                                            <p className="text-sm text-muted-foreground">.svg files only</p>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNkZGQiLz48L3N2Zz4=')] rounded-lg p-4 flex items-center justify-center">
                                            <img src={svgPreview} alt="SVG Preview" className="max-h-60 object-contain" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-muted-foreground">{svgFile?.name}</p>
                                            <Button variant="outline" size="sm" onClick={() => { setSvgFile(null); setSvgPreview(""); }}>Change</Button>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            <Card className="p-6 space-y-5">
                                <h2 className="text-lg font-semibold">Settings</h2>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-sm mb-1 block">Width (px)</Label>
                                        <Input type="number" value={outputWidth} onChange={(e) => setOutputWidth(Math.max(1, Number(e.target.value)))} min={1} max={8000} />
                                    </div>
                                    <div>
                                        <Label className="text-sm mb-1 block">Height (px)</Label>
                                        <Input type="number" value={outputHeight} onChange={(e) => setOutputHeight(Math.max(1, Number(e.target.value)))} min={1} max={8000} />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm mb-1 block">Output Format</Label>
                                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="png">PNG</SelectItem>
                                            <SelectItem value="jpg">JPG</SelectItem>
                                            <SelectItem value="webp">WebP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm mb-1 block">Background</Label>
                                    <Select value={bgColor} onValueChange={setBgColor}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="transparent">Transparent</SelectItem>
                                            <SelectItem value="#ffffff">White</SelectItem>
                                            <SelectItem value="#000000">Black</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {outputFormat !== "png" && (
                                    <div>
                                        <Label className="text-sm mb-1 block">Quality: {quality}%</Label>
                                        <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={10} max={100} step={5} />
                                    </div>
                                )}

                                <Button className="w-full gap-2" size="lg" onClick={handleConvert} disabled={!svgFile || converting}>
                                    <ImageIcon className="w-5 h-5" /> {converting ? "Converting..." : "Convert to " + outputFormat.toUpperCase()}
                                </Button>
                            </Card>
                        </div>

                        <div className="mt-16 max-w-3xl mx-auto prose prose-sm text-muted-foreground">
                            <h2 className="text-2xl font-bold text-foreground">SVG to PNG Conversion Made Easy</h2>
                            <p>SVG (Scalable Vector Graphics) files are great for logos, icons, and illustrations but aren't always compatible with all platforms. Convert them to PNG, JPG, or WebP with custom dimensions for use on any website, app, or social media platform.</p>
                            <h3 className="text-xl font-semibold text-foreground">Features</h3>
                            <ul>
                                <li>Custom output dimensions — any size up to 8000px</li>
                                <li>Export to PNG (with transparency), JPG, or WebP</li>
                                <li>Background color options (transparent, white, black)</li>
                                <li>Preserves SVG viewBox proportions</li>
                                <li>100% browser-based — no server uploads</li>
                            </ul>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default SvgConverter;

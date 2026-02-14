import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, ImageIcon, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface ConvertedFile {
    name: string;
    blob: Blob;
    size: number;
}

const HeicConverter = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [converted, setConverted] = useState<ConvertedFile[]>([]);
    const [converting, setConverting] = useState(false);
    const [outputFormat, setOutputFormat] = useState("jpg");
    const [quality, setQuality] = useState(92);
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files).filter((f) => {
                const ext = f.name.toLowerCase().split(".").pop();
                return ext === "heic" || ext === "heif";
            });
            if (selected.length === 0) {
                toast({ title: "No HEIC files", description: "Please select .heic or .heif files.", variant: "destructive" });
                return;
            }
            setFiles((prev) => [...prev, ...selected]);
            setConverted([]);
        }
        e.target.value = "";
    };

    const handleConvert = async () => {
        if (files.length === 0) return;
        setConverting(true);
        setConverted([]);

        try {
            const heic2any = (await import("heic2any")).default;
            const results: ConvertedFile[] = [];

            for (const file of files) {
                try {
                    const toType = outputFormat === "png" ? "image/png" : "image/jpeg";
                    const result = await heic2any({
                        blob: file,
                        toType,
                        quality: toType === "image/jpeg" ? quality / 100 : undefined,
                    });

                    const blob = Array.isArray(result) ? result[0] : result;
                    const baseName = file.name.replace(/\.(heic|heif)$/i, "");
                    results.push({
                        name: `${baseName}.${outputFormat}`,
                        blob,
                        size: blob.size,
                    });
                } catch (err) {
                    toast({
                        title: `Failed: ${file.name}`,
                        description: "Could not convert this file. It may be corrupted.",
                        variant: "destructive",
                    });
                }
            }

            setConverted(results);
            if (results.length > 0) {
                toast({ title: "Conversion Complete!", description: `${results.length} file(s) converted successfully.` });
            }
        } catch {
            toast({ title: "Error", description: "Failed to load HEIC converter.", variant: "destructive" });
        } finally {
            setConverting(false);
        }
    };

    const downloadFile = (file: ConvertedFile) => {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadAll = async () => {
        if (converted.length === 1) {
            downloadFile(converted[0]);
            return;
        }
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        converted.forEach((f) => zip.file(f.name, f.blob));
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted-images.zip";
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    };

    return (
        <>
            <Helmet>
                <title>HEIC to JPG Converter — Free Online iPhone Photo Converter | Finvestech Tools</title>
                <meta name="description" content="Convert HEIC and HEIF images from iPhone to JPG or PNG instantly. Free, private, browser-based — no uploads required." />
                <meta name="keywords" content="heic to jpg, heic converter, heif to jpg, iphone photo converter, convert heic online, heic to png" />
                <link rel="canonical" href="https://compress.finvestech.in/heic-to-jpg" />
                <meta property="og:title" content="HEIC to JPG Converter — Free Online iPhone Photo Converter" />
                <meta property="og:description" content="Convert iPhone HEIC photos to JPG or PNG instantly in your browser." />
                <meta property="og:url" content="https://compress.finvestech.in/heic-to-jpg" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Finvestech Tools" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="HEIC to JPG Converter — Free Online" />
                <meta name="twitter:description" content="Convert HEIC/HEIF to JPG/PNG instantly. No uploads." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "HEIC to JPG Converter — Finvestech Tools",
                        "description": "Convert iPhone HEIC/HEIF photos to JPG or PNG online for free",
                        "url": "https://compress.finvestech.in/heic-to-jpg",
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
                            { "@type": "ListItem", "position": 2, "name": "HEIC to JPG", "item": "https://compress.finvestech.in/heic-to-jpg" }
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
                                <span className="text-primary">HEIC</span> to JPG Converter
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Convert iPhone HEIC/HEIF photos to JPG or PNG instantly. 100% private — runs entirely in your browser.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="p-6 space-y-4">
                                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-all cursor-pointer">
                                    <input ref={inputRef} type="file" accept=".heic,.heif" multiple onChange={handleFileSelect} className="hidden" id="heic-input" />
                                    <label htmlFor="heic-input" className="cursor-pointer">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                            <Upload className="w-7 h-7 text-primary" />
                                        </div>
                                        <h3 className="text-base font-semibold mb-1">Select HEIC/HEIF Files</h3>
                                        <p className="text-sm text-muted-foreground">Supports batch conversion</p>
                                    </label>
                                </div>

                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{files.length} file(s) selected</span>
                                            <Button variant="ghost" size="sm" onClick={() => { setFiles([]); setConverted([]); }}>
                                                <Trash2 className="w-4 h-4 mr-1" /> Clear
                                            </Button>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto space-y-1">
                                            {files.map((f, i) => (
                                                <div key={i} className="text-xs text-muted-foreground flex justify-between px-2 py-1 bg-muted/50 rounded">
                                                    <span className="truncate mr-2">{f.name}</span>
                                                    <span>{formatSize(f.size)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>

                            <Card className="p-6 space-y-6">
                                <h2 className="text-lg font-semibold">Settings</h2>
                                <div>
                                    <Label className="text-sm font-medium mb-2 block">Output Format</Label>
                                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="jpg">JPG</SelectItem>
                                            <SelectItem value="png">PNG</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {outputFormat === "jpg" && (
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Quality: {quality}%</Label>
                                        <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={10} max={100} step={5} />
                                    </div>
                                )}

                                <Button className="w-full gap-2" size="lg" onClick={handleConvert} disabled={files.length === 0 || converting}>
                                    <ImageIcon className="w-5 h-5" /> {converting ? "Converting..." : "Convert Now"}
                                </Button>
                            </Card>
                        </div>

                        {converted.length > 0 && (
                            <Card className="mt-8 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Converted Files ({converted.length})</h3>
                                    {converted.length > 1 && (
                                        <Button variant="outline" size="sm" onClick={downloadAll}>
                                            <Download className="w-4 h-4 mr-1" /> Download All as ZIP
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {converted.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium">{f.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatSize(f.size)}</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => downloadFile(f)}>
                                                <Download className="w-4 h-4 mr-1" /> Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        <div className="mt-16 max-w-3xl mx-auto prose prose-sm text-muted-foreground">
                            <h2 className="text-2xl font-bold text-foreground">Why Convert HEIC to JPG?</h2>
                            <p>Apple devices save photos in HEIC (High Efficiency Image Container) format by default. While HEIC offers better compression than JPG, many platforms and devices don't support it natively. Our converter lets you instantly convert HEIC files to universally compatible JPG or PNG format.</p>
                            <h3 className="text-xl font-semibold text-foreground">Key Features</h3>
                            <ul>
                                <li>Batch convert multiple HEIC/HEIF files at once</li>
                                <li>Choose between JPG and PNG output</li>
                                <li>Adjustable quality for JPG output</li>
                                <li>Download individually or as a ZIP archive</li>
                                <li>100% browser-based — your photos stay private</li>
                            </ul>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default HeicConverter;

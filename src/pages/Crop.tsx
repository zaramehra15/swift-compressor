import { useState, useRef, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Crop as CropIcon, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface CropArea {
    x: number;
    y: number;
    w: number;
    h: number;
}

type DragMode =
    | null
    | "move"
    | "nw" | "ne" | "sw" | "se"    // corners
    | "n" | "s" | "e" | "w";       // edges

const HANDLE_SIZE = 10; // px — size of corner/edge handles

const ASPECT_RATIOS: { label: string; value: number | null }[] = [
    { label: "Free", value: null },
    { label: "1:1 (Square)", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
    { label: "16:9", value: 16 / 9 },
    { label: "9:16 (Story)", value: 9 / 16 },
    { label: "2:3 (Portrait)", value: 2 / 3 },
];

const Crop = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [imgDims, setImgDims] = useState({ w: 0, h: 0, natW: 0, natH: 0 });
    const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, w: 0, h: 0 });
    const [dragMode, setDragMode] = useState<DragMode>(null);
    const [dragOrigin, setDragOrigin] = useState({ mx: 0, my: 0, crop: { x: 0, y: 0, w: 0, h: 0 } });
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const [outputFormat, setOutputFormat] = useState("png");
    const [quality, setQuality] = useState(90);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            if (f.size > 50 * 1024 * 1024) {
                toast({ title: "File too large", description: "Please use an image under 50MB.", variant: "destructive" });
                return;
            }
            setFile(f);
            const url = URL.createObjectURL(f);
            setPreview(url);
            e.target.value = "";
        }
    };

    /** Set initial crop to 80% of displayed image, centered */
    const initCrop = useCallback((dispW: number, dispH: number, ratio: number | null) => {
        let cw: number, ch: number;
        if (ratio) {
            // Fit the aspect ratio within 80% of the image
            const maxW = dispW * 0.8;
            const maxH = dispH * 0.8;
            if (maxW / ratio <= maxH) {
                cw = maxW;
                ch = maxW / ratio;
            } else {
                ch = maxH;
                cw = maxH * ratio;
            }
        } else {
            cw = dispW * 0.8;
            ch = dispH * 0.8;
        }
        setCrop({ x: (dispW - cw) / 2, y: (dispH - ch) / 2, w: cw, h: ch });
    }, []);

    const onImgLoad = useCallback(() => {
        const img = imgRef.current;
        if (!img) return;
        const natW = img.naturalWidth;
        const natH = img.naturalHeight;
        const dispW = img.clientWidth;
        const dispH = img.clientHeight;
        setImgDims({ w: dispW, h: dispH, natW, natH });
        initCrop(dispW, dispH, aspectRatio);
    }, [aspectRatio, initCrop]);

    useEffect(() => {
        const handleResize = () => {
            if (imgRef.current && preview) onImgLoad();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [preview, onImgLoad]);

    /** When aspect ratio changes, re-fit the crop box */
    useEffect(() => {
        if (imgDims.w > 0 && imgDims.h > 0) {
            initCrop(imgDims.w, imgDims.h, aspectRatio);
        }
    }, [aspectRatio, imgDims.w, imgDims.h, initCrop]);

    /** Clamp crop to image bounds */
    const clampCrop = useCallback((c: CropArea, maxW: number, maxH: number): CropArea => {
        let { x, y, w, h } = c;
        w = Math.max(20, Math.min(w, maxW));
        h = Math.max(20, Math.min(h, maxH));
        x = Math.max(0, Math.min(x, maxW - w));
        y = Math.max(0, Math.min(y, maxH - h));
        return { x, y, w, h };
    }, []);

    /** Determine which handle (or body) is under the cursor */
    const getHandleAtPoint = useCallback((mx: number, my: number): DragMode => {
        const { x, y, w, h } = crop;
        const hs = HANDLE_SIZE;

        // Check corners first (higher priority)
        if (Math.abs(mx - x) <= hs && Math.abs(my - y) <= hs) return "nw";
        if (Math.abs(mx - (x + w)) <= hs && Math.abs(my - y) <= hs) return "ne";
        if (Math.abs(mx - x) <= hs && Math.abs(my - (y + h)) <= hs) return "sw";
        if (Math.abs(mx - (x + w)) <= hs && Math.abs(my - (y + h)) <= hs) return "se";

        // Check edges
        if (mx >= x + hs && mx <= x + w - hs && Math.abs(my - y) <= hs) return "n";
        if (mx >= x + hs && mx <= x + w - hs && Math.abs(my - (y + h)) <= hs) return "s";
        if (my >= y + hs && my <= y + h - hs && Math.abs(mx - x) <= hs) return "w";
        if (my >= y + hs && my <= y + h - hs && Math.abs(mx - (x + w)) <= hs) return "e";

        // Check inside for move
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) return "move";

        return null;
    }, [crop]);

    const getCursorStyle = useCallback((mode: DragMode): string => {
        switch (mode) {
            case "nw": case "se": return "nwse-resize";
            case "ne": case "sw": return "nesw-resize";
            case "n": case "s": return "ns-resize";
            case "e": case "w": return "ew-resize";
            case "move": return "move";
            default: return "crosshair";
        }
    }, []);

    const getMousePos = useCallback((e: React.MouseEvent | MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { mx: 0, my: 0 };
        return {
            mx: e.clientX - rect.left,
            my: e.clientY - rect.top,
        };
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const { mx, my } = getMousePos(e);
        const mode = getHandleAtPoint(mx, my);
        if (!mode) return;
        setDragMode(mode);
        setDragOrigin({ mx, my, crop: { ...crop } });
    }, [crop, getHandleAtPoint, getMousePos]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const { mx, my } = getMousePos(e);

        if (!dragMode) {
            // Just update cursor
            const mode = getHandleAtPoint(mx, my);
            containerRef.current.style.cursor = getCursorStyle(mode);
            return;
        }

        e.preventDefault();
        const dx = mx - dragOrigin.mx;
        const dy = my - dragOrigin.my;
        const orig = dragOrigin.crop;
        const maxW = imgDims.w;
        const maxH = imgDims.h;
        let newCrop: CropArea;

        if (dragMode === "move") {
            newCrop = clampCrop({ x: orig.x + dx, y: orig.y + dy, w: orig.w, h: orig.h }, maxW, maxH);
        } else {
            // Resize from edge/corner
            let { x, y, w, h } = orig;
            let newX = x, newY = y, newW = w, newH = h;

            // Calculate new bounds based on which handle is being dragged
            if (dragMode.includes("w")) {
                newX = Math.max(0, x + dx);
                newW = w - (newX - x);
            }
            if (dragMode.includes("e")) {
                newW = Math.min(maxW - x, w + dx);
            }
            if (dragMode.includes("n")) {
                newY = Math.max(0, y + dy);
                newH = h - (newY - y);
            }
            if (dragMode.includes("s")) {
                newH = Math.min(maxH - y, h + dy);
            }

            // Enforce minimum size
            if (newW < 20) { newW = 20; if (dragMode.includes("w")) newX = x + w - 20; }
            if (newH < 20) { newH = 20; if (dragMode.includes("n")) newY = y + h - 20; }

            // Enforce aspect ratio
            if (aspectRatio) {
                const isCorner = dragMode.length === 2;
                const isHoriz = dragMode === "e" || dragMode === "w";

                if (isCorner || isHoriz) {
                    // Width drives height
                    newH = newW / aspectRatio;
                    if (dragMode.includes("n")) {
                        newY = y + h - newH;
                    }
                } else {
                    // Height drives width
                    newW = newH * aspectRatio;
                    if (dragMode.includes("w")) {
                        newX = x + w - newW;
                    }
                }

                // Re-clamp after aspect ratio enforcement
                if (newX < 0) { newX = 0; newW = Math.min(maxW, newW); newH = newW / aspectRatio; }
                if (newY < 0) { newY = 0; newH = Math.min(maxH, newH); newW = newH * aspectRatio; }
                if (newX + newW > maxW) { newW = maxW - newX; newH = newW / aspectRatio; }
                if (newY + newH > maxH) { newH = maxH - newY; newW = newH * aspectRatio; }
            }

            newCrop = { x: newX, y: newY, w: Math.max(20, newW), h: Math.max(20, newH) };
        }

        setCrop(newCrop);
    }, [dragMode, dragOrigin, imgDims, aspectRatio, clampCrop, getHandleAtPoint, getCursorStyle, getMousePos]);

    const handleMouseUp = useCallback(() => {
        setDragMode(null);
    }, []);

    // Global mouse up to handle releasing outside the container
    useEffect(() => {
        const onUp = () => setDragMode(null);
        window.addEventListener("mouseup", onUp);
        return () => window.removeEventListener("mouseup", onUp);
    }, []);

    const handleCrop = () => {
        if (!file || crop.w < 2 || crop.h < 2) {
            toast({ title: "Select crop area", description: "Adjust the crop box on the image.", variant: "destructive" });
            return;
        }

        const img = imgRef.current;
        if (!img) return;

        const scaleX = imgDims.natW / imgDims.w;
        const scaleY = imgDims.natH / imgDims.h;
        const sx = Math.round(crop.x * scaleX);
        const sy = Math.round(crop.y * scaleY);
        const sw = Math.round(crop.w * scaleX);
        const sh = Math.round(crop.h * scaleY);

        const canvas = document.createElement("canvas");
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const mimeMap: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
        const mime = mimeMap[outputFormat] || "image/png";

        if (mime === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, sw, sh);
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                const baseName = file.name.replace(/\.[^.]+$/, "");
                a.download = `cropped_${baseName}.${outputFormat}`;
                a.click();
                URL.revokeObjectURL(url);
                toast({ title: "Image Cropped!", description: `${sw}×${sh}px — ${(blob.size / 1024).toFixed(0)} KB` });
            },
            mime,
            mime === "image/png" ? undefined : quality / 100
        );
    };

    const resetCrop = () => {
        if (imgDims.w > 0) {
            initCrop(imgDims.w, imgDims.h, aspectRatio);
        }
    };

    /** Render the 8 drag handles (4 corners + 4 edge midpoints) */
    const renderHandles = () => {
        if (crop.w < 2 || crop.h < 2) return null;

        const hs = HANDLE_SIZE;
        const positions = [
            // Corners
            { mode: "nw", left: crop.x - hs / 2, top: crop.y - hs / 2, cursor: "nwse-resize" },
            { mode: "ne", left: crop.x + crop.w - hs / 2, top: crop.y - hs / 2, cursor: "nesw-resize" },
            { mode: "sw", left: crop.x - hs / 2, top: crop.y + crop.h - hs / 2, cursor: "nesw-resize" },
            { mode: "se", left: crop.x + crop.w - hs / 2, top: crop.y + crop.h - hs / 2, cursor: "nwse-resize" },
            // Edge midpoints
            { mode: "n", left: crop.x + crop.w / 2 - hs / 2, top: crop.y - hs / 2, cursor: "ns-resize" },
            { mode: "s", left: crop.x + crop.w / 2 - hs / 2, top: crop.y + crop.h - hs / 2, cursor: "ns-resize" },
            { mode: "w", left: crop.x - hs / 2, top: crop.y + crop.h / 2 - hs / 2, cursor: "ew-resize" },
            { mode: "e", left: crop.x + crop.w - hs / 2, top: crop.y + crop.h / 2 - hs / 2, cursor: "ew-resize" },
        ];

        return positions.map(({ mode, left, top, cursor }) => (
            <div
                key={mode}
                className="absolute bg-white border-2 border-primary rounded-sm shadow-md z-10"
                style={{
                    left, top,
                    width: hs, height: hs,
                    cursor,
                    pointerEvents: "auto",
                }}
            />
        ));
    };

    return (
        <>
            <Helmet>
                <title>Crop Image Online Free — Easy Image Cropper Tool | Finvestech Tools</title>
                <meta name="description" content="Crop images online for free. Drag to select your crop area with preset aspect ratios for social media, print, and web. 100% private — no uploads." />
                <meta name="keywords" content="crop image online, image cropper, crop photo, free crop tool, aspect ratio crop, social media crop" />
                <link rel="canonical" href="https://compress.finvestech.in/crop" />
                <meta property="og:title" content="Crop Image Online Free — Easy Image Cropper Tool" />
                <meta property="og:description" content="Crop images online for free with preset aspect ratios. 100% private and browser-based." />
                <meta property="og:url" content="https://compress.finvestech.in/crop" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Finvestech Tools" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Crop Image Online Free — Easy Image Cropper Tool" />
                <meta name="twitter:description" content="Crop images online with preset aspect ratios. No uploads, 100% private." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Image Cropper — Finvestech Tools",
                        "description": "Free online image cropper tool with aspect ratio presets",
                        "url": "https://compress.finvestech.in/crop",
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
                            { "@type": "ListItem", "position": 2, "name": "Crop Image", "item": "https://compress.finvestech.in/crop" }
                        ]
                    })}
                </script>
            </Helmet>

            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 pt-24 pb-16 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                                <span className="text-primary">Crop</span> Images Online
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Upload an image and adjust the crop box. Drag corners or edges to resize. 100% private.
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Image Area */}
                            <div className="lg:col-span-2">
                                <Card className="p-6">
                                    {!preview ? (
                                        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-all cursor-pointer">
                                            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="crop-file" />
                                            <label htmlFor="crop-file" className="cursor-pointer">
                                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                                    <Upload className="w-8 h-8 text-primary" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground mb-2">Choose an image</h3>
                                                <p className="text-sm text-muted-foreground">JPG, PNG, WebP, GIF, BMP — up to 50MB</p>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div
                                                ref={containerRef}
                                                className="relative inline-block select-none w-full"
                                                onMouseDown={handleMouseDown}
                                                onMouseMove={handleMouseMove}
                                                onMouseUp={handleMouseUp}
                                            >
                                                <img
                                                    ref={imgRef}
                                                    src={preview}
                                                    alt="To crop"
                                                    className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                                                    onLoad={onImgLoad}
                                                    draggable={false}
                                                />
                                                {/* Overlay */}
                                                <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
                                                    {/* Dark overlay outside crop */}
                                                    <div
                                                        className="absolute inset-0 bg-black/50"
                                                        style={{
                                                            clipPath: crop.w > 0 && crop.h > 0
                                                                ? `polygon(0% 0%, 0% 100%, ${crop.x}px 100%, ${crop.x}px ${crop.y}px, ${crop.x + crop.w}px ${crop.y}px, ${crop.x + crop.w}px ${crop.y + crop.h}px, ${crop.x}px ${crop.y + crop.h}px, ${crop.x}px 100%, 100% 100%, 100% 0%)`
                                                                : undefined,
                                                        }}
                                                    />
                                                    {/* Crop border + grid */}
                                                    {crop.w > 0 && crop.h > 0 && (
                                                        <div
                                                            className="absolute border-2 border-white shadow-lg"
                                                            style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                                                        >
                                                            {/* Rule-of-thirds grid */}
                                                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                                                                {Array.from({ length: 9 }).map((_, i) => (
                                                                    <div key={i} className="border border-white/30" />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Drag handles */}
                                                    {renderHandles()}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 justify-between items-center">
                                                <p className="text-sm text-muted-foreground">
                                                    Crop: {Math.round(crop.w * (imgDims.natW / imgDims.w || 1))} × {Math.round(crop.h * (imgDims.natH / imgDims.h || 1))}px
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={resetCrop}><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
                                                    <Button variant="outline" size="sm" onClick={() => { setFile(null); setPreview(""); }}>Change Image</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>

                            {/* Settings */}
                            <div>
                                <Card className="p-6 space-y-6">
                                    <h2 className="text-lg font-semibold">Crop Settings</h2>

                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Aspect Ratio</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {ASPECT_RATIOS.map((ar) => (
                                                <Button
                                                    key={ar.label}
                                                    variant="outline"
                                                    size="sm"
                                                    className={`text-xs transition-all ${aspectRatio === ar.value
                                                            ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground shadow-md ring-2 ring-primary/30'
                                                            : ''
                                                        }`}
                                                    onClick={() => setAspectRatio(ar.value)}
                                                >
                                                    {ar.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Output Format</Label>
                                        <Select value={outputFormat} onValueChange={setOutputFormat}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="png">PNG</SelectItem>
                                                <SelectItem value="jpg">JPG</SelectItem>
                                                <SelectItem value="webp">WebP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {outputFormat !== "png" && (
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Quality: {quality}%</Label>
                                            <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={10} max={100} step={5} />
                                        </div>
                                    )}

                                    <Button className="w-full gap-2" size="lg" onClick={handleCrop} disabled={!file || crop.w < 2}>
                                        <CropIcon className="w-5 h-5" /> Crop & Download
                                    </Button>
                                </Card>
                            </div>
                        </div>

                        {/* SEO Content */}
                        <div className="mt-16 max-w-3xl mx-auto prose prose-sm text-muted-foreground">
                            <h2 className="text-2xl font-bold text-foreground">How to Crop Images Online</h2>
                            <p>Upload your image and a crop box will appear automatically. Drag the corners or edges to resize, or drag inside the box to move it. Choose an aspect ratio preset to constrain proportions. All processing happens in your browser — your images are never uploaded.</p>
                            <h3 className="text-xl font-semibold text-foreground">Features</h3>
                            <ul>
                                <li>Auto-appearing crop box — no need to draw one manually</li>
                                <li>Drag corners or edges to resize the crop area</li>
                                <li>Drag inside the box to reposition it</li>
                                <li>Free aspect ratio or preset ratios (1:1, 4:3, 16:9, 9:16, 3:2, 2:3)</li>
                                <li>Export as PNG, JPG, or WebP with adjustable quality</li>
                                <li>Rule-of-thirds grid overlay for better composition</li>
                            </ul>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default Crop;

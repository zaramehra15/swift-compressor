import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const PdfMerge = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [merging, setMerging] = useState(false);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const pdfs = Array.from(e.target.files).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
            if (pdfs.length === 0) {
                toast({ title: "No PDF files", description: "Please select PDF files.", variant: "destructive" });
                return;
            }
            setFiles((prev) => [...prev, ...pdfs]);
        }
        e.target.value = "";
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index: number, direction: -1 | 1) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= files.length) return;
        setFiles((prev) => {
            const arr = [...prev];
            [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
            return arr;
        });
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            toast({ title: "Need more files", description: "Please add at least 2 PDF files to merge.", variant: "destructive" });
            return;
        }
        setMerging(true);

        try {
            const { PDFDocument } = await import("pdf-lib");
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                try {
                    const arrayBuffer = await file.arrayBuffer();

                    // Try native pdf-lib merge first (preserves text, vectors, quality)
                    try {
                        const pdf = await PDFDocument.load(arrayBuffer);
                        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                        pages.forEach((page) => mergedPdf.addPage(page));
                    } catch {
                        // pdf-lib failed (encrypted/protected PDF) — use render fallback
                        toast({ title: `Rendering: ${file.name}`, description: "Using visual rendering for this PDF (it may be protected)." });
                        await mergeViaRender(mergedPdf, arrayBuffer);
                    }
                } catch {
                    toast({ title: `Skipped: ${file.name}`, description: "Could not read this PDF.", variant: "destructive" });
                }
            }

            if (mergedPdf.getPageCount() === 0) {
                toast({ title: "No pages", description: "No valid PDF pages were found.", variant: "destructive" });
                return;
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "merged.pdf";
            a.click();
            URL.revokeObjectURL(url);

            toast({ title: "PDF Merged!", description: `${mergedPdf.getPageCount()} pages — ${(blob.size / 1024 / 1024).toFixed(2)} MB` });
        } catch {
            toast({ title: "Merge failed", description: "Could not merge the PDF files.", variant: "destructive" });
        } finally {
            setMerging(false);
        }
    };

    /**
     * Fallback: render each page of a PDF to canvas via pdfjs-dist,
     * then embed the rasterized images into the merged PDFDocument.
     * This handles encrypted/protected PDFs that pdf-lib can't parse.
     */
    const mergeViaRender = async (
        mergedPdf: any,
        arrayBuffer: ArrayBuffer
    ) => {
        const pdfjsLib = await import("pdfjs-dist");
        const { ensurePdfWorker } = await import("@/utils/pdfWorkerInit");
        await ensurePdfWorker(pdfjsLib as any);

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer }) as any;
        const sourcePdf = await loadingTask.promise;

        for (let i = 1; i <= sourcePdf.numPages; i++) {
            const page = await sourcePdf.getPage(i);
            const scale = 2; // High quality render
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d")!;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;

            // Get JPEG data from canvas
            const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
            const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
            const jpegImage = await mergedPdf.embedJpg(jpegBytes);

            // Calculate page size in points (72 DPI)
            const pageWidthPt = (viewport.width / scale) * 0.75;
            const pageHeightPt = (viewport.height / scale) * 0.75;

            const newPage = mergedPdf.addPage([pageWidthPt, pageHeightPt]);
            newPage.drawImage(jpegImage, {
                x: 0,
                y: 0,
                width: pageWidthPt,
                height: pageHeightPt,
            });
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    };

    return (
        <>
            <Helmet>
                <title>Merge PDF Files Online Free — Combine PDFs Instantly | Finvestech Tools</title>
                <meta name="description" content="Merge multiple PDF files into one document for free. Drag to reorder, combine any number of PDFs. 100% private — runs in your browser." />
                <meta name="keywords" content="merge pdf, combine pdf, pdf merger, join pdf online, merge pdf free, pdf combiner" />
                <link rel="canonical" href="https://compress.finvestech.in/pdf-merge" />
                <meta property="og:title" content="Merge PDF Files Online Free — Combine PDFs" />
                <meta property="og:description" content="Merge multiple PDFs into one document instantly. 100% browser-based." />
                <meta property="og:url" content="https://compress.finvestech.in/pdf-merge" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Finvestech Tools" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Merge PDF Files Online Free" />
                <meta name="twitter:description" content="Combine multiple PDF files into one. No uploads required." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "PDF Merger — Finvestech Tools",
                        "description": "Free online tool to merge multiple PDF files into one document",
                        "url": "https://compress.finvestech.in/pdf-merge",
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
                            { "@type": "ListItem", "position": 2, "name": "Merge PDF", "item": "https://compress.finvestech.in/pdf-merge" }
                        ]
                    })}
                </script>
            </Helmet>

            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 pt-24 pb-16 px-4">
                    <div className="container mx-auto max-w-3xl">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                                <span className="text-primary">Merge</span> PDF Files
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Combine multiple PDF files into a single document. Reorder pages before merging. 100% private.
                            </p>
                        </motion.div>

                        <Card className="p-6 space-y-4">
                            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-all cursor-pointer">
                                <input type="file" accept=".pdf,application/pdf" multiple onChange={handleFileSelect} className="hidden" id="pdf-merge-input" />
                                <label htmlFor="pdf-merge-input" className="cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-base font-semibold mb-1">Add PDF Files</h3>
                                    <p className="text-sm text-muted-foreground">Select multiple PDFs to merge</p>
                                </label>
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">{files.length} file(s)</span>
                                        <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                                            <Trash2 className="w-4 h-4 mr-1" /> Clear All
                                        </Button>
                                    </div>
                                    {files.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                                            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{f.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatSize(f.size)}</p>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveFile(i, -1)} disabled={i === 0}>
                                                    <ArrowUp className="w-3 h-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}>
                                                    <ArrowDown className="w-3 h-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFile(i)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button className="w-full gap-2" size="lg" onClick={handleMerge} disabled={files.length < 2 || merging}>
                                <Download className="w-5 h-5" /> {merging ? "Merging..." : "Merge & Download"}
                            </Button>
                        </Card>

                        <div className="mt-16 max-w-3xl mx-auto prose prose-sm text-muted-foreground">
                            <h2 className="text-2xl font-bold text-foreground">How to Merge PDFs Online</h2>
                            <p>Upload your PDF files, reorder them using the arrow buttons, and click "Merge & Download." All processing happens in your browser — your files are never uploaded to any server.</p>
                            <h3 className="text-xl font-semibold text-foreground">Features</h3>
                            <ul>
                                <li>Merge unlimited PDF files into one document</li>
                                <li>Reorder files before merging</li>
                                <li>100% browser-based — no server uploads</li>
                                <li>Works with encrypted/protected PDFs when possible</li>
                            </ul>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default PdfMerge;

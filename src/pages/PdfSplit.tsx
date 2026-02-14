import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Scissors, FileText } from "lucide-react";
import { motion } from "framer-motion";

const PdfSplit = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [rangeInput, setRangeInput] = useState("");
    const [splitting, setSplitting] = useState(false);
    const { toast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
                toast({ title: "Invalid file", description: "Please select a PDF file.", variant: "destructive" });
                return;
            }
            setFile(f);

            try {
                const { PDFDocument } = await import("pdf-lib");
                const arrayBuffer = await f.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                setPageCount(pdf.getPageCount());
                setRangeInput(`1-${pdf.getPageCount()}`);
            } catch {
                toast({ title: "Error", description: "Could not read this PDF file.", variant: "destructive" });
                setFile(null);
            }
        }
        e.target.value = "";
    };

    const parseRanges = (input: string, max: number): number[] => {
        const pages = new Set<number>();
        const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

        for (const part of parts) {
            if (part.includes("-")) {
                const [startStr, endStr] = part.split("-").map((s) => s.trim());
                const start = Math.max(1, parseInt(startStr) || 1);
                const end = Math.min(max, parseInt(endStr) || max);
                for (let i = start; i <= end; i++) pages.add(i);
            } else {
                const num = parseInt(part);
                if (num >= 1 && num <= max) pages.add(num);
            }
        }

        return Array.from(pages).sort((a, b) => a - b);
    };

    const handleSplit = async () => {
        if (!file || !rangeInput.trim()) {
            toast({ title: "Missing input", description: "Please select a file and specify page ranges.", variant: "destructive" });
            return;
        }
        setSplitting(true);

        try {
            const { PDFDocument } = await import("pdf-lib");
            const arrayBuffer = await file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer);
            const pages = parseRanges(rangeInput, sourcePdf.getPageCount());

            if (pages.length === 0) {
                toast({ title: "No valid pages", description: "The specified range is empty.", variant: "destructive" });
                setSplitting(false);
                return;
            }

            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, pages.map((p) => p - 1));
            copiedPages.forEach((page) => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const baseName = file.name.replace(/\.pdf$/i, "");
            a.download = `${baseName}_pages_${rangeInput.replace(/\s/g, "")}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            toast({ title: "PDF Split!", description: `${pages.length} page(s) extracted — ${(blob.size / 1024 / 1024).toFixed(2)} MB` });
        } catch {
            toast({ title: "Split failed", description: "Could not split the PDF.", variant: "destructive" });
        } finally {
            setSplitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Split PDF Online Free — Extract Pages from PDF | Finvestech Tools</title>
                <meta name="description" content="Split PDF files and extract specific pages or page ranges for free. 100% private, browser-based — no uploads required." />
                <meta name="keywords" content="split pdf, extract pdf pages, pdf splitter, split pdf online, pdf page extractor, remove pdf pages" />
                <link rel="canonical" href="https://compress.finvestech.in/pdf-split" />
                <meta property="og:title" content="Split PDF Online Free — Extract Pages from PDF" />
                <meta property="og:description" content="Extract specific pages from any PDF file. 100% browser-based." />
                <meta property="og:url" content="https://compress.finvestech.in/pdf-split" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Finvestech Tools" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Split PDF Online Free — Extract Pages" />
                <meta name="twitter:description" content="Split PDFs and extract pages. No uploads needed." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "PDF Splitter — Finvestech Tools",
                        "description": "Free online tool to split PDFs and extract specific pages",
                        "url": "https://compress.finvestech.in/pdf-split",
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
                            { "@type": "ListItem", "position": 2, "name": "Split PDF", "item": "https://compress.finvestech.in/pdf-split" }
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
                                <span className="text-primary">Split</span> PDF Files
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Extract specific pages or page ranges from any PDF. 100% private — no uploads.
                            </p>
                        </motion.div>

                        <Card className="p-6 space-y-5">
                            {!file ? (
                                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary transition-all cursor-pointer">
                                    <input type="file" accept=".pdf,application/pdf" onChange={handleFileSelect} className="hidden" id="pdf-split-input" />
                                    <label htmlFor="pdf-split-input" className="cursor-pointer">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                            <Upload className="w-7 h-7 text-primary" />
                                        </div>
                                        <h3 className="text-base font-semibold mb-1">Select PDF File</h3>
                                        <p className="text-sm text-muted-foreground">Choose a PDF to split</p>
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                        <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{pageCount} page(s) — {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => { setFile(null); setPageCount(0); setRangeInput(""); }}>Change</Button>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Page Range</Label>
                                        <Input
                                            value={rangeInput}
                                            onChange={(e) => setRangeInput(e.target.value)}
                                            placeholder="e.g. 1-3, 5, 8-12"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Specify individual pages (e.g. 1, 5) or ranges (e.g. 3-7). Total: {pageCount} pages.
                                        </p>
                                    </div>

                                    <Button className="w-full gap-2" size="lg" onClick={handleSplit} disabled={splitting || !rangeInput.trim()}>
                                        <Scissors className="w-5 h-5" /> {splitting ? "Splitting..." : "Split & Download"}
                                    </Button>
                                </div>
                            )}
                        </Card>

                        <div className="mt-16 max-w-3xl mx-auto prose prose-sm text-muted-foreground">
                            <h2 className="text-2xl font-bold text-foreground">How to Split a PDF</h2>
                            <p>Upload your PDF file, specify which pages you want to extract using page numbers or ranges (e.g., "1-3, 5, 8-12"), and download the result. All processing happens locally in your browser.</p>
                            <h3 className="text-xl font-semibold text-foreground">Features</h3>
                            <ul>
                                <li>Extract specific pages or page ranges</li>
                                <li>Flexible range syntax: "1-3, 5, 8-12"</li>
                                <li>Auto-detects total page count</li>
                                <li>100% browser-based — your files stay private</li>
                            </ul>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default PdfSplit;

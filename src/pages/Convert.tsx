import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileToolNav from "@/components/MobileToolNav";
import ConversionSelector from "@/components/ConversionSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Image as ImageIcon,
  FileText,
  Music,
  Video,
  ArrowRight,
  Download,
  X,
  Loader2,
  AlertCircle,
  Archive,
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { compressPDF } from "@/utils/pdfCompression";
import {
  convertDocxToPdf,
  convertPdfToDocx,
  convertPptxToPdf,
  convertXlsxToPdf,
  convertPdfToImagesZip,
  convertCsvToXlsx,
  convertXlsxToCsv,
  convertPdfToText,
  convertTextToPdf,
  convertDocxToText,
} from "@/utils/documentConversion";
import { convertAudio } from "@/utils/audioConversion";
import { convertVideo } from "@/utils/videoConversion";
import { downloadAsZip } from "@/utils/zipDownload";

const Convert = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fromFormat, setFromFormat] = useState<string>("");
  const [toFormat, setToFormat] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<Map<string, { blob: Blob; originalName: string }>>(new Map());
  const [converting, setConverting] = useState(false);
  const { toast } = useToast();

  const categories = [
    {
      id: "images",
      name: "Images",
      icon: ImageIcon,
      formats: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF", "ICO"],
      description: "Convert between image formats",
    },
    {
      id: "documents",
      name: "Documents & PDF",
      icon: FileText,
      formats: ["PDF", "DOCX", "XLSX", "PPTX", "CSV", "TXT"],
      description: "Convert documents, spreadsheets & PDFs",
    },
    {
      id: "audio",
      name: "Audio",
      icon: Music,
      formats: ["MP3", "WAV", "M4A", "OGG", "AAC"],
      description: "Convert audio files",
    },
    {
      id: "video",
      name: "Video",
      icon: Video,
      formats: ["MP4", "MOV", "AVI", "WEBM", "MKV"],
      description: "Convert video files",
    },
  ];

  const getAcceptTypes = (): string => {
    switch (selectedCategory) {
      case "images":
        return "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/x-icon,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.ico";
      case "documents":
        return ".pdf,.docx,.xlsx,.pptx,.csv,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "audio":
        return "audio/*,.mp3,.wav,.m4a,.ogg,.aac";
      case "video":
        return "video/*,.mp4,.mov,.avi,.webm,.mkv";
      default:
        return "*";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incoming = Array.from(e.target.files);
      const MAX_SIZE = selectedCategory === 'video' ? 200 * 1024 * 1024 : 50 * 1024 * 1024;
      const oversized = incoming.filter(f => f.size > MAX_SIZE);
      const valid = incoming.filter(f => f.size <= MAX_SIZE);

      if (oversized.length > 0) {
        toast({
          title: "File size limit exceeded",
          description: `${oversized.length} file(s) exceed ${selectedCategory === 'video' ? '200MB' : '50MB'} and were skipped.`,
          variant: "destructive",
        });
      }

      setFiles(prev => [...prev, ...valid]);
      setConvertedFiles(new Map());
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Image conversion
  const convertImage = async (file: File, toFmt: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          const target = toFmt.toLowerCase();
          // White background for formats that don't support transparency
          if (target === 'jpg' || target === 'jpeg' || target === 'bmp' || target === 'ico') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);

          const mimeMap: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'ico': 'image/png', // ICO not natively supported by canvas, save as PNG
          };

          const mimeType = mimeMap[target] || 'image/jpeg';

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Conversion failed"));
              }
            },
            mimeType,
            0.92
          );
        };
        img.onerror = () => reject(new Error("Failed to load image for conversion"));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    if (!fromFormat || !toFormat) {
      toast({
        title: "Select formats",
        description: "Please select both source and target formats.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please add files to convert.",
        variant: "destructive",
      });
      return;
    }

    setConverting(true);
    const newConvertedFiles: Map<string, { blob: Blob; originalName: string }> = new Map();

    try {
      const from = fromFormat.toLowerCase();
      const to = toFormat.toLowerCase();

      if (selectedCategory === "images") {
        for (const file of files) {
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          const fromAliases: Record<string, string[]> = {
            'jpg': ['jpg', 'jpeg'],
            'jpeg': ['jpg', 'jpeg'],
            'png': ['png'],
            'webp': ['webp'],
            'gif': ['gif'],
            'bmp': ['bmp'],
            'tiff': ['tiff', 'tif'],
            'ico': ['ico'],
          };
          const validExts = fromAliases[from] || [from];
          if (!validExts.includes(ext) && !file.type.includes(from === 'jpg' ? 'jpeg' : from)) {
            toast({ title: 'Mismatched file type', description: `Expected ${fromFormat} file. Skipped: ${file.name}`, variant: 'destructive' });
            continue;
          }
          try {
            const converted = await convertImage(file, to);
            newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: converted, originalName: file.name });
          } catch (err) {
            console.error('Image conversion error:', err);
            toast({ title: 'Conversion failed', description: `Failed to convert: ${file.name}`, variant: 'destructive' });
          }
        }
      } else if (selectedCategory === "documents") {
        for (const file of files) {
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          try {
            if (from === 'docx' && to === 'pdf') {
              if (ext !== 'docx') { toast({ title: 'Wrong file type', description: `Expected .docx file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertDocxToPdf(file), originalName: file.name });
            } else if (from === 'pdf' && to === 'docx') {
              if (ext !== 'pdf') { toast({ title: 'Wrong file type', description: `Expected .pdf file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertPdfToDocx(file), originalName: file.name });
            } else if (from === 'pptx' && to === 'pdf') {
              if (ext !== 'pptx') { toast({ title: 'Wrong file type', description: `Expected .pptx file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertPptxToPdf(file), originalName: file.name });
            } else if (from === 'xlsx' && to === 'pdf') {
              if (ext !== 'xlsx') { toast({ title: 'Wrong file type', description: `Expected .xlsx file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertXlsxToPdf(file), originalName: file.name });
            } else if (from === 'pdf' && (to === 'png' || to === 'jpg')) {
              if (ext !== 'pdf') { toast({ title: 'Wrong file type', description: `Expected .pdf file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertPdfToImagesZip(file, to as 'png' | 'jpg'), originalName: file.name });
            } else if (from === 'csv' && to === 'xlsx') {
              if (ext !== 'csv') { toast({ title: 'Wrong file type', description: `Expected .csv file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertCsvToXlsx(file), originalName: file.name });
            } else if (from === 'xlsx' && to === 'csv') {
              if (ext !== 'xlsx') { toast({ title: 'Wrong file type', description: `Expected .xlsx file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertXlsxToCsv(file), originalName: file.name });
            } else if (from === 'pdf' && to === 'txt') {
              if (ext !== 'pdf') { toast({ title: 'Wrong file type', description: `Expected .pdf file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertPdfToText(file), originalName: file.name });
            } else if (from === 'txt' && to === 'pdf') {
              if (ext !== 'txt') { toast({ title: 'Wrong file type', description: `Expected .txt file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertTextToPdf(file), originalName: file.name });
            } else if (from === 'docx' && to === 'txt') {
              if (ext !== 'docx') { toast({ title: 'Wrong file type', description: `Expected .docx file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await convertDocxToText(file), originalName: file.name });
            } else if (from === 'pdf' && to === 'pdf') {
              if (ext !== 'pdf') { toast({ title: 'Wrong file type', description: `Expected .pdf file. Skipped: ${file.name}`, variant: 'destructive' }); continue; }
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: await compressPDF(file, 'medium'), originalName: file.name });
            } else {
              toast({ title: "Unsupported conversion", description: `${fromFormat} → ${toFormat} is not available yet.`, variant: "destructive" });
            }
          } catch (err) {
            console.error('Document conversion error:', err);
            toast({ title: 'Conversion failed', description: `Failed to convert: ${file.name}. ${err instanceof Error ? err.message : ''}`, variant: 'destructive' });
          }
        }
      } else if (selectedCategory === 'audio') {
        for (const file of files) {
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          const validAudio = ['mp3', 'wav', 'm4a', 'ogg', 'aac'];
          if (!validAudio.includes(ext)) {
            toast({ title: 'Wrong file type', description: `Expected audio file. Skipped: ${file.name}`, variant: 'destructive' });
            continue;
          }
          if (to === 'mp3' || to === 'wav') {
            try {
              const out = await convertAudio(file, to as 'mp3' | 'wav');
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: out, originalName: file.name });
            } catch (err) {
              console.error('Audio conversion error:', err);
              toast({ title: 'Audio conversion failed', description: `Failed: ${file.name}`, variant: 'destructive' });
            }
          } else {
            toast({ title: 'Unsupported conversion', description: `${fromFormat} → ${toFormat} is not available yet.`, variant: 'destructive' });
          }
        }
      } else if (selectedCategory === 'video') {
        for (const file of files) {
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          const validVideo = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
          if (!validVideo.includes(ext)) {
            toast({ title: 'Wrong file type', description: `Expected video file. Skipped: ${file.name}`, variant: 'destructive' });
            continue;
          }
          if (to === 'mp4' || to === 'webm') {
            try {
              const out = await convertVideo(file, to as 'mp4' | 'webm');
              newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: out, originalName: file.name });
            } catch (err) {
              // Fallback: if MP4 fails, try WebM
              if (to === 'mp4') {
                try {
                  const out = await convertVideo(file, 'webm');
                  newConvertedFiles.set(`${file.name}-${Date.now()}`, { blob: out, originalName: file.name });
                  toast({ title: 'Converted to WebM instead', description: `MP4 encoding unavailable, converted ${file.name} to WebM.` });
                } catch {
                  toast({ title: 'Video conversion failed', description: 'This conversion may not be supported in-browser.', variant: 'destructive' });
                }
              } else {
                toast({ title: 'Video conversion failed', description: 'This conversion may not be supported in-browser.', variant: 'destructive' });
              }
            }
          } else {
            toast({ title: 'Unsupported conversion', description: `${fromFormat} → ${toFormat} is not available in-browser.`, variant: 'destructive' });
          }
        }
      }

      setConvertedFiles(newConvertedFiles);

      if (newConvertedFiles.size > 0) {
        toast({
          title: "Conversion Complete!",
          description: `Successfully converted ${newConvertedFiles.size} file(s).`,
        });
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: "An error occurred during conversion.",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const getOutputExtension = (): string => {
    const tf = toFormat.toLowerCase();
    if (tf === 'jpeg') return 'jpg';
    // For PDF-to-images, output is a ZIP
    if (selectedCategory === 'documents' && (tf === 'png' || tf === 'jpg')) return 'zip';
    return tf;
  };

  const handleDownload = (fileName: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const ext = getOutputExtension();
    a.download = `converted_${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: `${fileName} has been downloaded.`,
    });
  };

  const handleDownloadAll = async () => {
    if (convertedFiles.size === 0) return;

    if (convertedFiles.size === 1) {
      // Single file — download directly
      const [, entry] = Array.from(convertedFiles.entries())[0];
      handleDownload(entry.originalName, entry.blob);
      return;
    }

    // Multiple files — create ZIP
    const ext = getOutputExtension();
    const filesToZip = Array.from(convertedFiles.entries()).map(([, entry]) => ({
      name: `converted_${entry.originalName.replace(/\.[^.]+$/, '')}.${ext}`,
      blob: entry.blob,
    }));

    try {
      await downloadAsZip(filesToZip);
      toast({
        title: "Download started!",
        description: `Downloading ${filesToZip.length} converted file(s) as ZIP.`,
      });
    } catch {
      toast({
        title: "Download failed",
        description: "An error occurred creating the ZIP.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Convert Files Online — JPG, PNG, PDF, Word, Excel, Video & More | Finvestech Tools</title>
        <meta
          name="description"
          content="Free online file converter. Convert images (JPG, PNG, WebP, GIF, BMP, TIFF), documents (PDF, Word, Excel, PowerPoint, CSV, TXT), audio (MP3, WAV, OGG), and video files instantly in your browser. No uploads, completely private."
        />
        <meta name="keywords" content="file converter, image converter, pdf converter, word to pdf, pdf to word, excel to pdf, video converter, audio converter, jpg to png, png to webp, online converter, free converter, pdf to text, pptx to pdf" />
        <link rel="canonical" href="https://compress.finvestech.in/convert" />

        <meta property="og:title" content="Convert Files Online — JPG, PNG, PDF, Word, Excel, Video & More | Finvestech Tools" />
        <meta property="og:description" content="Free online file converter. Convert images, documents, audio, and video files instantly in your browser." />
        <meta property="og:url" content="https://compress.finvestech.in/convert" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Finvestech Tools" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Convert Files Online — Images, PDF, Word, Excel, Video | Finvestech Tools" />
        <meta name="twitter:description" content="Free online file converter. Convert between 20+ formats in your browser. No uploads, 100% private." />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Finvestech File Converter",
            "description": "Free online tool to convert images, documents, audio, and video files between formats",
            "url": "https://compress.finvestech.in/convert",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Image conversion (JPG, PNG, WebP, GIF, BMP, TIFF, ICO)",
              "Document conversion (PDF, Word, Excel, PowerPoint, CSV, TXT)",
              "Audio conversion (MP3, WAV, M4A, OGG, AAC)",
              "Video conversion (MP4, WebM, MOV, AVI)",
              "Privacy-focused browser-based processing"
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://compress.finvestech.in/" },
              { "@type": "ListItem", "position": 2, "name": "Convert", "item": "https://compress.finvestech.in/convert" }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-20">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Convert Files Online
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Convert images, documents, audio, and video files instantly. All processing happens in your browser — files are never uploaded or stored.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                🔒 100% Private & Secure
              </div>
            </motion.div>

            {/* Category Selection */}
            {!selectedCategory && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="p-6 cursor-pointer hover:shadow-elegant transition-smooth border-2 hover:border-primary"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setFromFormat("");
                          setToFormat("");
                          setFiles([]);
                          setConvertedFiles(new Map());
                        }}
                      >
                        <Icon className="w-12 h-12 text-primary mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {category.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {category.formats.map((format) => (
                            <span
                              key={format}
                              className="text-xs px-2 py-1 bg-secondary rounded-md text-secondary-foreground"
                            >
                              {format}
                            </span>
                          ))}
                        </div>
                        <ArrowRight className="w-5 h-5 text-primary mt-4" />
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Conversion Interface */}
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedCategory(null);
                    setFiles([]);
                    setConvertedFiles(new Map());
                    setFromFormat("");
                    setToFormat("");
                  }}
                  className="mb-6"
                >
                  ← Back to Categories
                </Button>

                <Card className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Convert {categories.find(c => c.id === selectedCategory)?.name}
                  </h2>

                  {/* Conversion Format Selector */}
                  <div className="mb-6">
                    <ConversionSelector
                      category={selectedCategory}
                      fromFormat={fromFormat}
                      toFormat={toFormat}
                      onFromFormatChange={(f) => {
                        setFromFormat(f);
                        setToFormat("");
                        setConvertedFiles(new Map());
                      }}
                      onToFormatChange={(t) => {
                        setToFormat(t);
                        setConvertedFiles(new Map());
                      }}
                    />
                  </div>

                  {/* Size Limit Notice */}
                  {(selectedCategory === 'video' || selectedCategory === 'audio') && (
                    <Alert className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {selectedCategory === 'video'
                          ? 'Best for files under 200MB. Large video conversions may take longer or require more memory.'
                          : 'Best for files under 50MB. Large audio conversions may take longer depending on your device.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Conversion Info Boxes */}
                  {selectedCategory === 'documents' && fromFormat && toFormat && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300">
                      {fromFormat === 'PPTX' && toFormat === 'PDF' && (
                        <>💡 PowerPoint text content will be extracted and formatted as PDF. Complex layouts, images, and animations are not preserved.</>
                      )}
                      {fromFormat === 'PDF' && toFormat === 'DOCX' && (
                        <>💡 Text content from the PDF will be extracted into a Word document. Formatting may vary from the original.</>
                      )}
                      {fromFormat === 'PDF' && toFormat === 'TXT' && (
                        <>💡 All text content will be extracted from the PDF. Formatting and images will not be included.</>
                      )}
                      {fromFormat === 'PDF' && (toFormat === 'PNG' || toFormat === 'JPG') && (
                        <>💡 Each PDF page will be converted to an image and downloaded as a ZIP file.</>
                      )}
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-smooth cursor-pointer mb-6">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                      accept={getAcceptTypes()}
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <ArrowRight className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {files.length > 0 ? 'Add more files' : 'Choose files to convert'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop files here
                      </p>
                    </label>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-4">
                      {files.map((file, index) => {
                        // Find the converted entry for this file
                        const convertedEntry = Array.from(convertedFiles.values()).find(
                          (entry) => entry.originalName === file.name
                        );
                        return (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                {convertedEntry && (
                                  <span className="ml-2 text-primary font-medium">
                                    → {(convertedEntry.blob.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                )}
                              </p>
                            </div>
                            {convertedEntry && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(file.name, convertedEntry.blob)}
                                className="gap-2 flex-shrink-0"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFile(index)}
                              className="flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleConvert}
                          disabled={converting || !fromFormat || !toFormat || files.length === 0}
                          className="flex-1"
                        >
                          {converting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Converting...
                            </>
                          ) : (
                            `Convert ${files.length} File${files.length > 1 ? 's' : ''}`
                          )}
                        </Button>

                        {convertedFiles.size > 1 && (
                          <Button
                            variant="outline"
                            onClick={handleDownloadAll}
                            className="gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            Download All
                          </Button>
                        )}

                        {convertedFiles.size > 0 && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setFiles([]);
                              setConvertedFiles(new Map());
                            }}
                          >
                            Clear & Start Over
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Info Note */}
                <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground text-center">
                    💡 All conversions happen locally in your browser. No files are uploaded to any server. Your data stays private.
                  </p>
                </div>
              </motion.div>
            )}
          </section>

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
                  Love Convert?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Help us keep this converter free and ad-light. Your support helps us maintain and improve conversions for everyone.
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

          {/* SEO Content Section */}
          <section className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="prose prose-lg mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Why Use Our File Converter?
              </h2>
              <p className="text-muted-foreground mb-6">
                Whether you need to convert images for email attachments, prepare documents for submissions, or optimize media files, our browser-based converter handles it all without uploading your files to any server. Perfect for professionals who value privacy and speed.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                Supported Conversions
              </h3>
              <ul className="text-muted-foreground space-y-2 mb-6">
                <li><strong>Images:</strong> Convert between JPG, PNG, WebP, GIF, BMP, TIFF, and ICO formats</li>
                <li><strong>Documents:</strong> Word to PDF, PDF to Word, Excel to PDF, PowerPoint to PDF, Excel ↔ CSV, PDF to Text, Text to PDF</li>
                <li><strong>Audio:</strong> Convert MP3, WAV, M4A, OGG, and AAC files</li>
                <li><strong>Video:</strong> Convert MP4, MOV, AVI, WebM, and MKV files</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                Popular Conversions
              </h3>
              <ul className="text-muted-foreground space-y-2 mb-6">
                <li><strong>Word to PDF:</strong> Convert Microsoft Word documents (.docx) to PDF format</li>
                <li><strong>PDF to Word:</strong> Extract text from PDFs into editable Word documents</li>
                <li><strong>Excel to PDF:</strong> Convert spreadsheets to professional PDF documents</li>
                <li><strong>JPG to PNG:</strong> Convert JPEG images to lossless PNG format with transparency</li>
                <li><strong>PNG to JPG:</strong> Reduce image file size by converting to JPEG</li>
                <li><strong>PDF to Images:</strong> Convert each PDF page to high-quality PNG or JPG images</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                Privacy-First Conversion
              </h3>
              <p className="text-muted-foreground">
                All file conversions happen directly in your browser using advanced JavaScript and WebAssembly technology. Your files never leave your device, ensuring complete privacy and security for sensitive documents, personal photos, or confidential media files.
              </p>
            </div>
          </section>
        </main>

        <Footer />
        <MobileToolNav />
      </div>
    </>
  );
};

export default Convert;
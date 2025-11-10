import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUpload from "@/components/FileUpload";
import FileItem from "@/components/FileItem";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  return (
    <>
      <Helmet>
        <title>Compress Images & PDFs Online – Free, Secure & Fast | Finvestech</title>
        <meta
          name="description"
          content="Compress images and PDF files instantly in your browser. 100% free, secure, and private. No uploads or storage required."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        {/* Hero Section */}
        <main className="flex-1 pt-24">
          <section className="gradient-subtle py-20 px-4">
            <div className="container mx-auto text-center max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Compress Images & PDFs
                <br />
                <span className="text-primary">Instantly – 100% Free & Private</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Optimize your images and PDF files directly in your browser. No uploads. No
                data tracking. Everything happens locally on your device.
              </p>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant text-lg px-8 py-6 h-auto"
                onClick={() => document.getElementById("compress-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Choose Files to Compress
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

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
          </section>

          {/* Compression Section */}
          <section id="compress-section" className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <FileUpload onFilesSelected={handleFilesSelected} />

              {files.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      Your Files ({files.length})
                    </h2>
                    <Button
                      variant="outline"
                      onClick={handleClearAll}
                      size="sm"
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {files.map((file, index) => (
                      <FileItem key={`${file.name}-${index}`} file={file} />
                    ))}
                  </div>
                </div>
              )}

              {/* Ad Placeholder */}
              {files.length > 0 && (
                <div className="mt-12">
                  <div className="ad-area bg-muted/30 border border-border rounded-xl p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Advertisement Placeholder
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Upload Files
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Drop your images or PDF files, or click to browse from your device
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Compress
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Click compress and watch as your files are optimized in real-time
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Download
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Download your compressed files with significant size reduction
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;

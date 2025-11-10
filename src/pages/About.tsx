import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Zap, Heart, Target } from "lucide-react";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Compress – Free Browser-Based File Compression Tool | Finvestech</title>
        <meta
          name="description"
          content="Learn about Compress, the free browser-based tool for compressing images and PDFs. Discover our mission to provide secure, private, and efficient file optimization."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-foreground mb-6">
                About <span className="text-primary">Compress</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A free, privacy-focused tool for optimizing your images and PDF files
                directly in your browser
              </p>
            </div>

            <div className="prose prose-lg max-w-none mb-16">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-card mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At Compress, we believe file optimization should be accessible to everyone
                  without compromising privacy or security. That's why we built a completely
                  browser-based compression tool that processes your files locally on your
                  device – no uploads, no tracking, no data storage on our servers.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    100% Private
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    All compression happens in your browser using advanced JavaScript
                    algorithms. Your files never leave your device, ensuring complete privacy
                    and security.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Lightning Fast
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    No waiting for uploads or server processing. With local compression,
                    your files are optimized instantly, saving you valuable time.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Completely Free
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    No hidden costs, no subscriptions, no limitations. Compress as many
                    images and PDFs as you need, whenever you need.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Optimized Quality
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Our algorithms are fine-tuned to provide maximum compression while
                    maintaining excellent visual quality for your images and documents.
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Why Browser-Based Compression?
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Traditional file compression services require you to upload your files
                    to their servers, which raises privacy concerns and adds unnecessary
                    delays. With Compress, we've eliminated these issues entirely.
                  </p>
                  <p>
                    By leveraging modern web technologies like HTML5 Canvas API and
                    advanced JavaScript libraries (pdf-lib), we can perform sophisticated
                    compression algorithms directly in your browser. This means:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your sensitive files never leave your device</li>
                    <li>No internet connection required after the page loads</li>
                    <li>Instant processing with no server queues</li>
                    <li>Unlimited file compression at no cost</li>
                    <li>Works on any device with a modern browser</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 mt-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Built by Finvestech
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Compress is proudly developed and maintained by{" "}
                  <a
                    href="https://finvestech.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Finvestech
                  </a>
                  , a technology company dedicated to creating useful, privacy-respecting
                  tools for the web. We're committed to keeping Compress free, open, and
                  accessible to everyone who needs efficient file compression.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;

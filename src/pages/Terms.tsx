import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Finvestech Tools</title>
        <meta name="description" content="Terms of Service for Finvestech Tools. Read our terms and conditions for using our free online compression, conversion, and resizing tools." />
        <link rel="canonical" href="https://compress.finvestech.in/terms" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20">
          <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Terms of Service
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: January 2025
              </p>

              <div className="prose prose-lg max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Finvestech Tools (compress.finvestech.in), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    2. Service Description
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Finvestech Tools provides free, browser-based tools for:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Image and PDF compression</li>
                    <li>File format conversion (images, documents, audio, video)</li>
                    <li>Image resizing and cropping</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    All processing happens locally in your browser. We do not upload, store, or have access to your files.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    3. User Responsibilities
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You agree to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Use the service only for lawful purposes</li>
                    <li>Not attempt to interfere with or disrupt the service</li>
                    <li>Not use automated systems to access the service excessively</li>
                    <li>Ensure you have the right to process any files you use with our tools</li>
                    <li>Not upload malicious files or content</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    4. Intellectual Property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The service, including its original content, features, and functionality, is owned by Finvestech and is protected by international copyright, trademark, and other intellectual property laws. You retain all rights to files you process using our tools.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    5. Disclaimer of Warranties
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                    <li>The service will be uninterrupted or error-free</li>
                    <li>Results obtained from the service will be accurate or reliable</li>
                    <li>Quality of processed files will meet your expectations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    6. Limitation of Liability
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Finvestech and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. This includes loss of data, even if we have been advised of the possibility of such damages.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    7. Privacy and Data Processing
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All file processing happens in your browser using client-side JavaScript. We do not upload, store, or access your files. For more details, please refer to our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    8. Third-Party Links
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our service may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of third-party sites.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    9. Changes to Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date. Continued use of the service after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    10. Termination
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any reason, including breach of these terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    11. Governing Law
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    12. Contact Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about these Terms of Service, please visit our <a href="/contact" className="text-primary hover:underline">Contact page</a> or reach out through our main website at <a href="https://finvestech.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">finvestech.in</a>.
                  </p>
                </section>
              </div>
            </motion.div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Terms;
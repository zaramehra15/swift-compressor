import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy – Compress by Finvestech</title>
        <meta
          name="description"
          content="Read our privacy policy. All file compression happens locally in your browser. No files are uploaded or stored on any server."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-foreground mb-6">Privacy Policy</h1>
              <p className="text-lg text-muted-foreground">
                Last updated: January 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none space-y-8">
              <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6">
                <h2 className="text-2xl font-bold text-foreground mt-0 mb-3">
                  Your Privacy is Our Priority
                </h2>
                <p className="text-muted-foreground mb-0">
                  <strong className="text-foreground">
                    All compression happens locally in your browser using JavaScript.
                  </strong>{" "}
                  No files are uploaded or stored on any server. Your data never leaves
                  your device.
                </p>
              </div>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  1. Information We Collect
                </h2>
                <p className="text-muted-foreground">
                  We do not collect, store, or process any of your files. When you use
                  Compress to optimize images or PDF files:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Files are processed entirely within your web browser</li>
                  <li>No file data is transmitted to our servers</li>
                  <li>No file data is stored locally (except temporarily in browser memory)</li>
                  <li>All processing happens using client-side JavaScript</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  2. Technical Implementation
                </h2>
                <p className="text-muted-foreground">
                  Our tool uses the following browser-native technologies:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong className="text-foreground">HTML5 Canvas API</strong> for image
                    compression
                  </li>
                  <li>
                    <strong className="text-foreground">pdf-lib</strong> JavaScript library
                    for PDF optimization
                  </li>
                  <li>
                    <strong className="text-foreground">FileReader API</strong> for reading
                    file contents
                  </li>
                  <li>
                    <strong className="text-foreground">Blob API</strong> for creating
                    downloadable compressed files
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  These technologies operate entirely within your browser's sandbox
                  environment, ensuring your files remain on your device at all times.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  3. Website Analytics
                </h2>
                <p className="text-muted-foreground">
                  We may use standard web analytics tools (such as Google Analytics) to
                  collect anonymous usage statistics, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Page views and session duration</li>
                  <li>Browser type and operating system</li>
                  <li>Approximate geographic location (country/city level)</li>
                  <li>Referral sources</li>
                </ul>
                <p className="text-muted-foreground">
                  This data helps us improve the service but does not include any
                  information about the files you compress or their contents.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  4. Advertising
                </h2>
                <p className="text-muted-foreground">
                  To support this free service, we may display advertisements on our
                  website. Third-party advertising partners may use cookies and similar
                  technologies to serve relevant ads based on your browsing activity.
                </p>
                <p className="text-muted-foreground">
                  You can opt out of personalized advertising by adjusting your browser
                  settings or visiting industry opt-out pages such as{" "}
                  <a
                    href="https://optout.aboutads.info/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    optout.aboutads.info
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">5. Cookies</h2>
                <p className="text-muted-foreground">
                  We may use cookies for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Website functionality and preferences</li>
                  <li>Analytics tracking</li>
                  <li>Advertising purposes (via third-party partners)</li>
                </ul>
                <p className="text-muted-foreground">
                  You can disable cookies in your browser settings, though this may affect
                  some website features.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  6. Third-Party Services
                </h2>
                <p className="text-muted-foreground">
                  Our website may contain links to external sites or services. We are not
                  responsible for the privacy practices of these third parties. Please
                  review their privacy policies before interacting with them.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  7. Data Security
                </h2>
                <p className="text-muted-foreground">
                  Since all file processing occurs locally in your browser and no files are
                  transmitted to our servers, the security of your files depends on:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Your device's security measures</li>
                  <li>Your browser's security features</li>
                  <li>Your network connection (HTTPS encryption)</li>
                </ul>
                <p className="text-muted-foreground">
                  We serve our website over HTTPS to ensure secure communication between
                  your browser and our servers.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  8. Children's Privacy
                </h2>
                <p className="text-muted-foreground">
                  Our service is not directed at children under 13 years of age. We do not
                  knowingly collect personal information from children. If you believe a
                  child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  9. Changes to This Policy
                </h2>
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. Any changes will be
                  posted on this page with an updated "Last updated" date. We encourage you
                  to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  10. Contact Information
                </h2>
                <p className="text-muted-foreground">
                  If you have questions or concerns about this privacy policy or our
                  practices, please contact us through our main website at{" "}
                  <a
                    href="https://finvestech.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    finvestech.in
                  </a>
                  .
                </p>
              </section>

              <div className="bg-muted/50 border border-border rounded-xl p-6 mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">Summary</h3>
                <p className="text-muted-foreground mb-0">
                  <strong className="text-foreground">Your files are private.</strong> We
                  use browser-based processing to ensure your data never leaves your device.
                  Any analytics or advertising we use is unrelated to your file compression
                  activities and follows standard web privacy practices.
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

export default Privacy;

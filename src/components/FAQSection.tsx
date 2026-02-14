import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Is my data safe?",
      answer: "Absolutely! All compression happens locally in your browser using JavaScript. Your files never leave your device, and we don't store, track, or analyze any of your data.",
    },
    {
      question: "How much can I compress?",
      answer: "Compression results vary based on the file type and quality settings. Images typically reduce by 30-70%, while PDFs can reduce by 20-60% depending on their content. You can preview estimated sizes before compressing.",
    },
    {
      question: "What file formats are supported?",
      answer: "We support JPG, PNG, WebP images and PDF documents. You can also convert images between formats (e.g., PNG to WebP) for additional size savings.",
    },
    {
      question: "Is there a file size limit?",
      answer: "We recommend files under 50MB for best performance. Larger files may take longer to process or cause performance issues on some devices.",
    },
    {
      question: "Will compression reduce image quality?",
      answer: "Our compression algorithm is optimized to maintain excellent visual quality while reducing file size. You can choose between Low, Medium, and High quality settings based on your needs.",
    },
    {
      question: "Do I need an account to use this tool?",
      answer: "No! Compress is completely free and doesn't require any registration, login, or account creation. Just upload your files and compress instantly.",
    },
  ];

  return (
    <section className="py-16 px-4">
      {/* FAQPage structured data for Google rich snippets */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })
      }} />

      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about file compression
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 shadow-card"
            >
              <AccordionTrigger className="text-left font-semibold hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;

export function HowToSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Get Started with YourApp PDF API",
          description:
            "Design a PDF template, add dynamic variables, and generate PDFs via API in 5 minutes.",
          totalTime: "PT5M",
          step: [
            {
              "@type": "HowToStep",
              name: "Design a Template",
              text: "Use the drag-and-drop editor to set page format, add headers and footers, configure margins, add containers, and place elements like text, images, and tables.",
              url: "https://example.com/docs/get-started#design-a-template",
            },
            {
              "@type": "HowToStep",
              name: "Add Dynamic Variables",
              text: "Insert placeholders like {{customer_name}} in text, images, QR codes, barcodes, and tables. Variables are replaced with real data at generation time.",
              url: "https://example.com/docs/get-started#add-dynamic-variables",
            },
            {
              "@type": "HowToStep",
              name: "Preview Your Template",
              text: "Switch to the preview tab, add test data for your variables, and see the rendered PDF update automatically.",
              url: "https://example.com/docs/get-started#preview-your-template",
            },
            {
              "@type": "HowToStep",
              name: "Get Your API Key and Try the API",
              text: "Get your API key from the dashboard, copy the CURL example, and generate your first PDF via the REST API.",
              url: "https://example.com/docs/get-started#get-your-api-key-and-try-the-api",
            },
          ],
        }),
      }}
    />
  );
}

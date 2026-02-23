export type CategorySEOContent = {
  singularName: string;
  pluralName: string;
  whatIs: {
    heading: string;
    paragraphs: string[];
  };
  whatToInclude: {
    heading: string;
    items: { title: string; description: string }[];
  };
  whyUse: {
    heading: string;
    items: { title: string; description: string }[];
  };
  faq: { question: string; answer: string }[];
  ctaHeading: string;
};

export const categoryContent: Record<string, CategorySEOContent> = {
  invoice: {
    singularName: "Invoice",
    pluralName: "Invoices",
    whatIs: {
      heading: "What is an Invoice?",
      paragraphs: [
        "An invoice is a commercial document issued by a seller to a buyer that itemizes a transaction and indicates the products, quantities, and agreed-upon prices for goods or services provided. It serves as a formal request for payment and is a critical component of business accounting and record-keeping.",
        "Invoices play a key role in financial management, helping businesses track revenue, manage cash flow, and maintain accurate tax records. They also serve as legal documentation of a transaction between two parties, providing protection for both the seller and the buyer.",
        "Modern businesses increasingly rely on automated invoice generation to reduce manual errors, speed up billing cycles, and maintain a consistent professional appearance across all client communications.",
      ],
    },
    whatToInclude: {
      heading: "What Should an Invoice Include?",
      items: [
        {
          title: "Business information",
          description:
            "Your company name, address, phone number, email, and logo. This establishes your brand identity and gives clients the information they need to contact you.",
        },
        {
          title: "Client details",
          description:
            "The recipient's name, company, and billing address. Accurate client information ensures the invoice reaches the right person and department.",
        },
        {
          title: "Invoice number and date",
          description:
            "A unique invoice number for tracking and the date of issue. Sequential numbering helps with organization and is often required for tax compliance.",
        },
        {
          title: "Line items with descriptions",
          description:
            "A detailed breakdown of products or services provided, including quantities, unit prices, and subtotals for each line item.",
        },
        {
          title: "Payment terms and total",
          description:
            "The total amount due, applicable taxes, discounts, and payment terms such as due date, accepted payment methods, and bank details.",
        },
        {
          title: "Additional notes",
          description:
            "Any relevant notes such as late payment penalties, early payment discounts, or project-specific references.",
        },
      ],
    },
    whyUse: {
      heading: "Why Use an Invoice Template?",
      items: [
        {
          title: "Professional appearance",
          description:
            "A well-designed template ensures every invoice you send looks polished and consistent, reinforcing your brand credibility with clients.",
        },
        {
          title: "Save time on billing",
          description:
            "Templates eliminate the need to format invoices from scratch each time. Fill in the data and generate a professional PDF in seconds.",
        },
        {
          title: "Reduce errors",
          description:
            "Structured templates with predefined fields minimize the risk of missing critical information like tax calculations or payment terms.",
        },
        {
          title: "Automate with an API",
          description:
            "Integrate invoice generation into your existing systems. Automatically create and send invoices when orders are placed or projects are completed.",
        },
        {
          title: "Maintain compliance",
          description:
            "Templates can be designed to include all legally required fields for your jurisdiction, helping you stay compliant with tax and accounting regulations.",
        },
      ],
    },
    faq: [
      {
        question: "Can I customize the invoice template with my own branding?",
        answer:
          "Yes. You can fully customize the HTML and CSS of any template to match your brand, including your logo, colors, fonts, and layout. You can also start from scratch using the template editor.",
      },
      {
        question: "What formats can I generate invoices in?",
        answer:
          "All templates generate high-quality PDF documents. You can choose between A4, Letter, and other paper formats in both portrait and landscape orientations.",
      },
      {
        question: "Can I automate invoice generation with an API?",
        answer:
          "Yes. YourApp provides a REST API that lets you generate PDF invoices programmatically. Send your invoice data as JSON and receive a PDF in response. It integrates easily with any tech stack.",
      },
      {
        question: "Is it free to get started?",
        answer:
          "Yes. You can sign up for free and start generating PDFs immediately. The free plan includes enough credits to test and evaluate the service before upgrading.",
      },
      {
        question: "Can I include tax calculations and multiple currencies?",
        answer:
          "The template system supports any data you pass via the API, including tax rates, currency symbols, and multi-currency totals. You calculate the values in your application and the template renders them.",
      },
      {
        question: "How do I send the generated invoice to my clients?",
        answer:
          "The API returns a PDF file that you can attach to an email, store in your system, or serve as a download link. You control the delivery workflow in your application.",
      },
    ],
    ctaHeading: "Start generating invoices in minutes",
  },

  receipt: {
    singularName: "Receipt",
    pluralName: "Receipts",
    whatIs: {
      heading: "What is a Receipt?",
      paragraphs: [
        "A receipt is a written acknowledgment that a payment has been received for goods or services. Unlike an invoice, which is a request for payment, a receipt confirms that a transaction has been completed and serves as proof of purchase for the buyer.",
        "Receipts are essential for both businesses and customers. For businesses, they provide a record of completed sales that supports bookkeeping, tax reporting, and financial audits. For customers, receipts serve as proof of purchase for returns, warranties, expense reports, and tax deductions.",
        "Digital receipts generated via API are becoming the standard for modern businesses, offering instant delivery, consistent formatting, and seamless integration with accounting and CRM systems.",
      ],
    },
    whatToInclude: {
      heading: "What Should a Receipt Include?",
      items: [
        {
          title: "Business name and contact info",
          description:
            "Your company name, address, and contact details so the customer can identify the seller and reach out if needed.",
        },
        {
          title: "Receipt number and date",
          description:
            "A unique receipt number and the date of the transaction for record-keeping and easy reference.",
        },
        {
          title: "Items or services purchased",
          description:
            "A clear list of what was purchased, including descriptions, quantities, and individual prices.",
        },
        {
          title: "Payment method and amount",
          description:
            "The total amount paid, any taxes applied, and the payment method used (credit card, bank transfer, cash, etc.).",
        },
        {
          title: "Transaction reference",
          description:
            "An order number, transaction ID, or reference code that links the receipt to the corresponding order or invoice in your system.",
        },
      ],
    },
    whyUse: {
      heading: "Why Use a Receipt Template?",
      items: [
        {
          title: "Instant proof of payment",
          description:
            "Generate and deliver receipts immediately after a transaction, giving your customers instant confirmation of their purchase.",
        },
        {
          title: "Consistent branding",
          description:
            "Every receipt follows the same professional design, reinforcing your brand with each customer interaction.",
        },
        {
          title: "Simplified record-keeping",
          description:
            "Automated receipt generation ensures every transaction is documented, making bookkeeping and tax preparation straightforward.",
        },
        {
          title: "Reduce support requests",
          description:
            "Clear, detailed receipts answer common customer questions about what they purchased and when, reducing support ticket volume.",
        },
        {
          title: "API-driven automation",
          description:
            "Generate receipts automatically as part of your checkout or payment flow. No manual work required.",
        },
      ],
    },
    faq: [
      {
        question: "What is the difference between a receipt and an invoice?",
        answer:
          "An invoice is a request for payment sent before or at the time of a transaction. A receipt is confirmation that payment has been received. Invoices are sent to collect money; receipts are sent to acknowledge it.",
      },
      {
        question: "Can I generate receipts automatically after a payment?",
        answer:
          "Yes. You can integrate the YourApp API into your payment flow to automatically generate and send a PDF receipt whenever a payment is processed.",
      },
      {
        question: "Can I customize receipt templates?",
        answer:
          "Every template is fully customizable. Edit the HTML and CSS to match your brand, adjust the layout, and include exactly the fields your business needs.",
      },
      {
        question: "Are digital receipts legally valid?",
        answer:
          "In most jurisdictions, digital receipts are as legally valid as paper receipts, provided they contain the required transaction details. Check your local regulations for specific requirements.",
      },
      {
        question: "Can I include a QR code on my receipt?",
        answer:
          "Yes. You can include QR codes, barcodes, or any other visual element in your receipt template. Pass the QR code data or image URL through the API payload.",
      },
    ],
    ctaHeading: "Start generating receipts in minutes",
  },

  certificate: {
    singularName: "Certificate",
    pluralName: "Certificates",
    whatIs: {
      heading: "What is a Certificate?",
      paragraphs: [
        "A certificate is a formal document that certifies an achievement, completion, qualification, or recognition. Certificates are widely used in education, professional training, corporate programs, and events to acknowledge accomplishments and provide tangible proof of participation or expertise.",
        "From course completion certificates to employee recognition awards, certificates serve as motivational tools and professional credentials. A well-designed certificate adds perceived value to the achievement it represents and reflects positively on the issuing organization.",
        "Automating certificate generation is particularly valuable for organizations that issue certificates at scale — such as online learning platforms, HR departments, event organizers, and certification bodies — where manually creating individual certificates would be impractical.",
      ],
    },
    whatToInclude: {
      heading: "What Should a Certificate Include?",
      items: [
        {
          title: "Recipient name",
          description:
            "The full name of the person receiving the certificate, displayed prominently as the focal point of the document.",
        },
        {
          title: "Title of achievement",
          description:
            "A clear statement of what is being certified — such as course completion, award name, or qualification title.",
        },
        {
          title: "Issuing organization",
          description:
            "The name and logo of the organization granting the certificate, establishing authority and credibility.",
        },
        {
          title: "Date of issue",
          description:
            "The date the certificate was awarded, which is important for record-keeping and verifying the timeline of achievements.",
        },
        {
          title: "Signature or authorization",
          description:
            "A signature, digital seal, or authorized name that validates the certificate and adds an official touch.",
        },
        {
          title: "Certificate ID or verification code",
          description:
            "A unique identifier or QR code that allows the certificate to be verified as authentic, which is increasingly important for digital credentials.",
        },
      ],
    },
    whyUse: {
      heading: "Why Use a Certificate Template?",
      items: [
        {
          title: "Scale certificate issuance",
          description:
            "Generate hundreds or thousands of personalized certificates automatically, perfect for online courses, training programs, and events.",
        },
        {
          title: "Professional design",
          description:
            "Templates ensure every certificate looks polished and official, with consistent branding and layout across all recipients.",
        },
        {
          title: "Easy personalization",
          description:
            "Pass recipient-specific data through the API — name, course title, date, certificate ID — and get a unique PDF for each person.",
        },
        {
          title: "Instant delivery",
          description:
            "Generate and deliver certificates immediately upon course completion or event participation, without manual intervention.",
        },
        {
          title: "Verifiable credentials",
          description:
            "Include unique IDs or QR codes that link to verification pages, adding credibility and preventing fraud.",
        },
      ],
    },
    faq: [
      {
        question: "Can I generate certificates in bulk?",
        answer:
          "Yes. The API allows you to generate certificates one at a time in rapid succession. Loop through your recipient list, pass each person's data, and receive individual PDF certificates.",
      },
      {
        question: "What paper sizes are available for certificates?",
        answer:
          "Templates support A4 and Letter sizes in both portrait and landscape orientations. Landscape A4 is the most common format for certificates.",
      },
      {
        question: "Can I include a QR code for certificate verification?",
        answer:
          "Yes. You can include QR codes that link to a verification page on your website. Pass the QR code image or data URL through the API payload.",
      },
      {
        question: "Can I add signatures to certificates?",
        answer:
          "Yes. You can include signature images in your template. Upload a signature image and reference it in the template, or pass it as a base64-encoded image through the API.",
      },
      {
        question:
          "Is it possible to use custom fonts and colors in the certificate?",
        answer:
          "Templates are built with HTML and CSS, so you have full control over fonts, colors, borders, backgrounds, and every other visual aspect of the design.",
      },
    ],
    ctaHeading: "Start generating certificates in minutes",
  },

  letter: {
    singularName: "Letter",
    pluralName: "Letters",
    whatIs: {
      heading: "What is a Business Letter?",
      paragraphs: [
        "A business letter is a formal written document used for professional communication between organizations, or between a business and its clients, partners, or employees. Common types include cover letters, offer letters, recommendation letters, formal notices, and correspondence.",
        "Despite the prevalence of email, formal business letters remain important in many professional contexts. They carry a level of formality and authority that email often lacks, making them the preferred format for legal notices, official offers, contracts, and formal correspondence.",
        "Automating letter generation allows businesses to maintain consistency in their official communications while reducing the time spent on formatting and layout. Templates ensure every letter follows company standards and includes all necessary elements.",
      ],
    },
    whatToInclude: {
      heading: "What Should a Business Letter Include?",
      items: [
        {
          title: "Sender information and letterhead",
          description:
            "Your company name, logo, address, and contact details, typically formatted as a professional letterhead at the top of the document.",
        },
        {
          title: "Date and recipient address",
          description:
            "The date of the letter and the full name, title, and address of the recipient.",
        },
        {
          title: "Subject line",
          description:
            "A brief subject line that summarizes the purpose of the letter, helping the recipient quickly understand its content.",
        },
        {
          title: "Body content",
          description:
            "The main message of the letter, organized in clear paragraphs with a professional tone appropriate for the context.",
        },
        {
          title: "Closing and signature",
          description:
            "A professional closing (e.g., 'Sincerely', 'Best regards'), followed by the sender's name, title, and signature.",
        },
      ],
    },
    whyUse: {
      heading: "Why Use a Letter Template?",
      items: [
        {
          title: "Consistent company branding",
          description:
            "Templates ensure every letter uses the same letterhead, fonts, and formatting, maintaining a professional and unified brand image.",
        },
        {
          title: "Speed up document creation",
          description:
            "Instead of formatting each letter manually, fill in the variable content and generate a polished PDF instantly.",
        },
        {
          title: "Automate bulk communications",
          description:
            "Generate personalized letters at scale — offer letters for new hires, welcome letters for clients, or notices for stakeholders.",
        },
        {
          title: "Reduce formatting errors",
          description:
            "Predefined templates eliminate layout inconsistencies and ensure all required sections are included in every letter.",
        },
        {
          title: "Professional output every time",
          description:
            "A well-designed template guarantees that every letter your organization sends meets professional standards.",
        },
      ],
    },
    faq: [
      {
        question: "Can I use my company letterhead in the template?",
        answer:
          "Yes. You can design the template with your full letterhead, including logo, company name, address, and brand colors. The template is built with HTML and CSS, giving you complete design control.",
      },
      {
        question: "Can I generate personalized letters in bulk?",
        answer:
          "Yes. Use the API to generate individual letters by passing recipient-specific data for each one. This is ideal for offer letters, welcome letters, or any batch communication.",
      },
      {
        question: "What paper sizes are supported for letters?",
        answer:
          "Templates support A4, Letter (US), and other standard paper sizes in both portrait and landscape orientations.",
      },
      {
        question: "Can I include dynamic content like dates and names?",
        answer:
          "Every element in the template can be dynamic. Pass variables through the API payload — recipient name, date, custom paragraphs, reference numbers — and the template renders them into the final PDF.",
      },
      {
        question: "Is it possible to add a digital signature?",
        answer:
          "Yes. You can include a signature image in the template, either as a static asset or as a dynamic image URL passed through the API payload.",
      },
    ],
    ctaHeading: "Start generating letters in minutes",
  },

  packing_slip: {
    singularName: "Packing Slip",
    pluralName: "Packing Slips",
    whatIs: {
      heading: "What is a Packing Slip?",
      paragraphs: [
        "A packing slip is a shipping document included with a package that lists the contents of the shipment. It serves as a checklist for warehouse staff to verify that the correct items are packed, and for the recipient to confirm that everything ordered has been delivered.",
        "Unlike an invoice, a packing slip typically does not include pricing information. Its primary purpose is operational — helping fulfillment teams pick and pack orders accurately, and giving customers a quick way to verify their delivery without financial details visible.",
        "For e-commerce businesses and fulfillment operations, automated packing slip generation is essential. Integrating packing slip creation into your order management workflow eliminates manual document preparation and reduces shipping errors.",
      ],
    },
    whatToInclude: {
      heading: "What Should a Packing Slip Include?",
      items: [
        {
          title: "Order number and date",
          description:
            "A unique order identifier and the date the order was placed, enabling easy cross-referencing with the customer's order confirmation.",
        },
        {
          title: "Shipping and billing addresses",
          description:
            "The recipient's shipping address and, optionally, the billing address for reference.",
        },
        {
          title: "Item list with quantities",
          description:
            "A detailed list of every item in the shipment, including product names, SKUs, quantities ordered, and quantities shipped.",
        },
        {
          title: "Tracking or barcode information",
          description:
            "A barcode, QR code, or tracking number that links the packing slip to the shipment for scanning and tracking purposes.",
        },
        {
          title: "Special instructions",
          description:
            "Any relevant notes such as handling instructions, return policies, or customer-specific messages.",
        },
      ],
    },
    whyUse: {
      heading: "Why Use a Packing Slip Template?",
      items: [
        {
          title: "Reduce shipping errors",
          description:
            "A structured packing slip gives warehouse staff a clear checklist, reducing the chance of missing or incorrect items in shipments.",
        },
        {
          title: "Improve customer experience",
          description:
            "Customers can quickly verify their order contents upon delivery, building trust and reducing support inquiries.",
        },
        {
          title: "Automate fulfillment workflows",
          description:
            "Generate packing slips automatically when orders are placed or shipped, integrating seamlessly with your order management system.",
        },
        {
          title: "Include scannable codes",
          description:
            "Add barcodes or QR codes for warehouse scanning, making the pick-and-pack process faster and more accurate.",
        },
        {
          title: "Keep pricing private",
          description:
            "Packing slips without prices are ideal for gift orders or B2B shipments where the recipient should not see the cost.",
        },
      ],
    },
    faq: [
      {
        question:
          "What is the difference between a packing slip and an invoice?",
        answer:
          "A packing slip lists the contents of a shipment without pricing. An invoice includes pricing and is a request for payment. They serve different purposes: packing slips are for fulfillment verification, invoices are for billing.",
      },
      {
        question:
          "Can I include barcodes and QR codes on the packing slip?",
        answer:
          "Yes. You can include barcodes, QR codes, and any other visual elements. Pass the barcode image or data URL through the API payload and the template will render it.",
      },
      {
        question:
          "Can I generate packing slips automatically from my e-commerce platform?",
        answer:
          "Yes. Use the YourApp API to generate packing slips programmatically whenever an order is created or shipped. It integrates with any platform that can make HTTP requests.",
      },
      {
        question: "Can I exclude pricing from the packing slip?",
        answer:
          "Packing slip templates are designed without pricing by default. You control what data is included — simply don't pass price information in the API payload.",
      },
      {
        question:
          "What information should I include for international shipments?",
        answer:
          "For international shipments, consider including a customs declaration reference, HS codes, country of origin, and package weight. These can all be added as fields in your template.",
      },
    ],
    ctaHeading: "Start generating packing slips in minutes",
  },

  label: {
    singularName: "Label",
    pluralName: "Labels",
    whatIs: {
      heading: "What is a Label Sheet?",
      paragraphs: [
        "A label sheet is a printable document containing multiple labels arranged in a grid layout. Each label can include text, barcodes, QR codes, images, or any combination — making them ideal for product tags, inventory stickers, address labels, asset tags, name badges, and more.",
        "Rather than designing labels one at a time, a sheet lets you batch-produce them on a single page. This is particularly useful for warehouses managing inventory, retailers tagging products, event organizers printing badges, and businesses creating mailing labels or promotional stickers.",
        "Automating label sheet generation through an API enables organizations to produce hundreds of unique labels on demand — each with different data — without manual design work or copy-paste errors.",
      ],
    },
    whatToInclude: {
      heading: "What Should a Label Include?",
      items: [
        {
          title: "Primary content",
          description:
            "The main information for each label — a product name, address, asset ID, QR code, barcode, or any data relevant to the use case.",
        },
        {
          title: "Secondary text or captions",
          description:
            "Supporting details such as SKUs, descriptions, dates, or reference numbers that help identify each label at a glance.",
        },
        {
          title: "Scannable codes",
          description:
            "QR codes or barcodes that encode URLs, product IDs, serial numbers, or other machine-readable data for quick scanning.",
        },
        {
          title: "Consistent grid layout",
          description:
            "A uniform grid with equal spacing ensures the sheet looks professional and can be easily cut into individual labels if needed.",
        },
        {
          title: "Branding elements",
          description:
            "Optional company logo, colors, or footer to identify the source of the labels and maintain brand consistency.",
        },
      ],
    },
    whyUse: {
      heading: "Why Use a Label Template?",
      items: [
        {
          title: "Batch production",
          description:
            "Generate an entire sheet of unique labels in a single API call instead of creating them one by one. Ideal for inventory, shipping, events, and retail.",
        },
        {
          title: "Consistent layout",
          description:
            "Every sheet follows the same grid dimensions and spacing, ensuring professional, print-ready output every time.",
        },
        {
          title: "Dynamic data per label",
          description:
            "Pass an array of items through the API — each with its own text, image, or barcode — and the template generates a unique label for every entry.",
        },
        {
          title: "Print-ready PDF output",
          description:
            "Generate high-resolution PDFs optimized for printing on standard paper sizes (A4, Letter) or adhesive label sheets.",
        },
        {
          title: "Automate at scale",
          description:
            "Integrate label generation into your warehouse, retail, or logistics system to produce labels on demand without manual effort.",
        },
      ],
    },
    faq: [
      {
        question: "How many labels can I fit on a single sheet?",
        answer:
          "The number depends on your template layout and label size. A typical A4 sheet can fit 6 to 30 labels depending on the grid configuration. You control the number of columns and row height in the template.",
      },
      {
        question: "Can each label on the sheet contain different data?",
        answer:
          "Yes. You pass an array of items through the API, and each label is generated with its own unique data — different text, QR codes, barcodes, images, or any other content.",
      },
      {
        question: "Can I include QR codes or barcodes on labels?",
        answer:
          "Yes. Labels can include QR codes, barcodes, or any other visual element. Pass the encoded data or image URL through the API payload and the template renders it on each label.",
      },
      {
        question: "Can I customize the grid layout and label size?",
        answer:
          "Yes. The template is fully customizable. You can adjust the number of columns, row height, label dimensions, spacing, and add any content elements you need.",
      },
      {
        question:
          "Is the output suitable for printing on adhesive label sheets?",
        answer:
          "Yes. The PDF output uses precise dimensions, so you can design templates that align with standard label sheet formats (e.g., Avery labels). Set up your grid to match the label positions on the sheet.",
      },
      {
        question: "What types of labels can I create?",
        answer:
          "Any type — product labels, QR code sheets, barcode stickers, address labels, asset tags, name badges, shipping labels, and more. The template system is flexible enough to handle any label format.",
      },
    ],
    ctaHeading: "Start generating labels in minutes",
  },

  shipping_label: {
    singularName: "Shipping Label",
    pluralName: "Shipping Labels",
    whatIs: {
      heading: "What is a Shipping Label?",
      paragraphs: [
        "A shipping label is a document affixed to a package that contains all the information needed to deliver it to the recipient. It includes the destination address, return address, tracking number, and barcode — everything postal carriers and logistics software need to route and track the shipment.",
        "Shipping labels serve as the critical link between order fulfillment and package delivery. For e-commerce businesses, warehouses, and fulfillment centers, automated label generation is essential — manually creating labels is slow, error-prone, and doesn't scale. A single business might need thousands of labels per day.",
        "Modern shipping labels are designed to integrate with carrier systems (UPS, FedEx, USPS, DHL) through machine-readable barcodes and QR codes. They often include order details, weight, dimensions, and special handling instructions to ensure smooth processing through the supply chain.",
      ],
    },
    whatToInclude: {
      heading: "What Should a Shipping Label Include?",
      items: [
        {
          title: "Recipient address",
          description:
            "The full destination address (name, street, city, state/province, postal code, country). This is the most critical element — without it, the package won't reach its destination.",
        },
        {
          title: "Return address",
          description:
            "Your company or sender address. Essential for returns and helping carriers identify undeliverable packages.",
        },
        {
          title: "Tracking number and barcode",
          description:
            "A unique identifier and machine-readable barcode that carriers scan at each step of the journey. Enables real-time tracking for you and your customers.",
        },
        {
          title: "Order and shipment details",
          description:
            "Order number, weight, dimensions, and shipping date. Helps warehouse staff verify the correct item was packed and assists carriers with routing and handling.",
        },
        {
          title: "Special handling instructions",
          description:
            "Fragile warnings, orientation markers (THIS SIDE UP), do-not-bend notices, or temperature warnings. Ensures packages are handled appropriately.",
        },
      ],
    },
    whyUse: {
      heading: "Why Use a Shipping Label Template?",
      items: [
        {
          title: "Automate label generation",
          description:
            "Generate labels on-demand as orders are placed or shipped. Eliminate manual label creation and reduce fulfillment time.",
        },
        {
          title: "Ensure carrier compatibility",
          description:
            "Templates are designed to align with carrier specifications — barcode placement, size requirements, and format standards that UPS, FedEx, USPS, and DHL recognize.",
        },
        {
          title: "Reduce shipping errors",
          description:
            "Consistent, professionally formatted labels minimize address errors, mislabeling, and misroutes. Fewer misdirected packages = happier customers and lower support costs.",
        },
        {
          title: "Scale to any volume",
          description:
            "Whether you ship 10 orders a day or 10,000, label generation via API scales instantly. No bottlenecks, no manual work, no paper cuts.",
        },
        {
          title: "Track shipments in real-time",
          description:
            "Barcodes integrated into your label let carriers and customers track packages from fulfillment to delivery. Transparency builds trust and reduces tracking inquiries.",
        },
      ],
    },
    faq: [
      {
        question: "Can I generate shipping labels in bulk?",
        answer:
          "Yes. Pass an array of orders to the API and receive a batch of labels. Most users integrate label generation into their order management system so labels are created automatically whenever an order ships.",
      },
      {
        question: "Do your shipping labels work with major carriers?",
        answer:
          "Yes. The templates are designed to meet the requirements of UPS, FedEx, USPS, DHL, and other major carriers. Barcode placement, sizing, and formatting are carrier-compliant.",
      },
      {
        question: "Can I customize the shipping label with my branding?",
        answer:
          "Absolutely. All templates are fully customizable. Add your logo, company colors, custom fonts, and any fields your business needs. The HTML/CSS is yours to edit.",
      },
      {
        question: "What paper sizes are available?",
        answer:
          "Shipping label templates support A4 (210×297mm) and US Letter (8.5×11 inches) formats. You can also create labels scaled for thermal printer rolls or adhesive label sheets.",
      },
      {
        question: "Can I include order details on the shipping label?",
        answer:
          "Yes. Pass order data through the API — order number, weight, dimensions, special instructions, items list. The template renders it all onto the label.",
      },
      {
        question: "Do you support international shipping labels?",
        answer:
          "Yes. Include international fields like country code, customs declarations, and multi-language text. The templates are flexible enough to accommodate any shipping scenario.",
      },
    ],
    ctaHeading: "Start generating shipping labels in minutes",
  },

  purchase_order: {
    singularName: "Purchase Order",
    pluralName: "Purchase Orders",
    whatIs: {
      heading: "What is a Purchase Order?",
      paragraphs: [
        "A purchase order (PO) is a commercial document issued by a buyer to a seller, indicating the types, quantities, and agreed-upon prices for products or services. It serves as a formal, legally binding offer to purchase goods and is a critical component of procurement and supply chain management.",
        "Purchase orders establish clear expectations between buyers and vendors, documenting exactly what was ordered, when it's expected, and at what price. They protect both parties by creating an official record of the transaction before goods are shipped or services are rendered.",
        "For businesses managing multiple vendors and regular procurement cycles, automated purchase order generation streamlines operations, reduces errors, and ensures consistent documentation. Modern PO systems integrate with inventory management, accounting software, and ERP platforms to create a seamless procurement workflow.",
      ],
    },
    whatToInclude: {
      heading: "What Should a Purchase Order Include?",
      items: [
        {
          title: "Buyer and vendor information",
          description:
            "Company names, addresses, and contact details for both the purchasing organization and the supplier. This establishes the parties involved in the transaction.",
        },
        {
          title: "PO number and date",
          description:
            "A unique purchase order number for tracking and reference, along with the date of issue. Sequential numbering is essential for audit trails and reconciliation.",
        },
        {
          title: "Line items with descriptions",
          description:
            "A detailed list of products or services being ordered, including SKUs, descriptions, quantities, unit prices, and line totals.",
        },
        {
          title: "Shipping and delivery details",
          description:
            "The delivery address, requested delivery date, and any specific shipping instructions or requirements.",
        },
        {
          title: "Payment terms",
          description:
            "The agreed payment terms (Net 30, Net 60, etc.), accepted payment methods, and any early payment discounts or late payment penalties.",
        },
        {
          title: "Terms and conditions",
          description:
            "Any applicable terms such as warranty requirements, return policies, quality standards, or compliance requirements.",
        },
      ],
    },
    whyUse: {
      heading: "Why Use a Purchase Order Template?",
      items: [
        {
          title: "Streamline procurement",
          description:
            "Templates standardize your purchasing process, making it faster to create POs and easier for vendors to process them consistently.",
        },
        {
          title: "Maintain accurate records",
          description:
            "Every purchase order serves as a documented record of what was ordered, supporting inventory management, budgeting, and financial audits.",
        },
        {
          title: "Reduce ordering errors",
          description:
            "Structured templates with predefined fields minimize the risk of missing critical information like quantities, prices, or delivery instructions.",
        },
        {
          title: "Automate with an API",
          description:
            "Integrate PO generation into your procurement or inventory system. Automatically create purchase orders when stock levels drop or when approved requisitions are submitted.",
        },
        {
          title: "Professional vendor communication",
          description:
            "A well-designed purchase order reinforces your company's professionalism and makes it easier for vendors to fulfill orders correctly.",
        },
      ],
    },
    faq: [
      {
        question: "What is the difference between a purchase order and an invoice?",
        answer:
          "A purchase order is issued by the buyer before goods or services are delivered — it's a request to purchase. An invoice is issued by the seller after delivery — it's a request for payment. The PO initiates the transaction; the invoice closes it.",
      },
      {
        question: "Can I customize the purchase order template with my branding?",
        answer:
          "Yes. You can fully customize the HTML and CSS of any template to match your brand, including your logo, colors, fonts, and layout. Add custom fields specific to your procurement process.",
      },
      {
        question: "Can I automate purchase order generation with an API?",
        answer:
          "Yes. YourApp provides a REST API that lets you generate PDF purchase orders programmatically. Integrate it with your inventory or ERP system to automatically create POs when needed.",
      },
      {
        question: "What formats can I generate purchase orders in?",
        answer:
          "All templates generate high-quality PDF documents. You can choose between A4, Letter, and other paper formats in both portrait and landscape orientations.",
      },
      {
        question: "Can I include ACH or wire transfer payment details?",
        answer:
          "Yes. The template can include any payment information you need — bank name, account number, routing number, SWIFT codes for international transfers, or any other payment instructions.",
      },
      {
        question: "How do purchase orders help with inventory management?",
        answer:
          "Purchase orders create a record of what's on order before it arrives. This lets you track expected inventory, reconcile deliveries against orders, and maintain accurate stock levels in your system.",
      },
    ],
    ctaHeading: "Start generating purchase orders in minutes",
  },
};

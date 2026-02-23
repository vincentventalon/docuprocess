import Link from "next/link";
import { FileText, Award, Package, QrCode, Barcode, Receipt, Tag } from "lucide-react";

const generators = [
  {
    slug: "free-online-invoice-generator",
    title: "Invoice Generator",
    description: "Create professional invoices for clients",
    icon: FileText,
  },
  {
    slug: "free-online-receipt-maker",
    title: "Receipt Maker",
    description: "Create receipts for payments and rentals",
    icon: Receipt,
  },
  {
    slug: "free-online-certificate-maker",
    title: "Certificate Maker",
    description: "Design certificates for any occasion",
    icon: Award,
  },
  {
    slug: "free-online-packing-slip-generator",
    title: "Packing Slip Generator",
    description: "Generate packing slips for shipments",
    icon: Package,
  },
  {
    slug: "free-online-qr-code-sheet-generator",
    title: "QR Code Sheet Generator",
    description: "Create sheets of QR codes in bulk",
    icon: QrCode,
  },
  {
    slug: "free-online-barcode-sheet-generator",
    title: "Barcode Sheet Generator",
    description: "Generate barcode sheets for products",
    icon: Barcode,
  },
  {
    slug: "free-online-shipping-label-maker",
    title: "Shipping Label Maker",
    description: "Create shipping labels for packages",
    icon: Tag,
  },
];

interface RelatedGeneratorsProps {
  currentSlug: string;
}

export default function RelatedGenerators({ currentSlug }: RelatedGeneratorsProps) {
  const otherGenerators = generators.filter((g) => g.slug !== currentSlug);

  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          More Free Tools
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Explore our other free PDF generators
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherGenerators.map((generator) => {
            const Icon = generator.icon;
            return (
              <Link
                key={generator.slug}
                href={`/generators/${generator.slug}`}
                className="group flex flex-col items-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <Icon className="w-10 h-10 text-gray-400 group-hover:text-primary transition-colors mb-3" />
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-center">
                  {generator.title}
                </h3>
                <p className="text-sm text-gray-500 text-center mt-1">
                  {generator.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

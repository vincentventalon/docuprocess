"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";
import config from "@/config";

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "What is PDF Template API?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>A simple API to generate PDFs from templates. Design your template once with our visual editor, then generate thousands of PDFs by sending data via API.</p>
        <p>Perfect for invoices, certificates, reports, shipping labels, and any document you need to automate.</p>
      </div>
    ),
  },
  {
    question: "Do I need to know how to code?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>To design templates: No. Our visual drag-and-drop editor requires no coding skills.</p>
        <p>To generate PDFs: Basic API knowledge helps, but we provide copy-paste examples for cURL, Python, Node.js, and PHP.</p>
      </div>
    ),
  },
  {
    question: "How does it work?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Three simple steps:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Design your template with our visual editor</li>
          <li>Add dynamic variables (like {"{{customer_name}}"})</li>
          <li>Call our API with your data to generate PDFs</li>
        </ul>
      </div>
    ),
  },
  {
    question: "How fast is PDF generation?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Most PDFs generate in 1–3 seconds. Speed depends on template complexity and number of pages.</p>
      </div>
    ),
  },
  {
    question: "What output formats are available?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>You can get your PDF as:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>A signed URL (link expires after a set time)</li>
          <li>Binary data (direct download)</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Do you store my PDFs?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>PDFs are temporarily stored and accessible via signed URL (you choose the expiration time: 1 minute to 7 days).</p>
        <p>After expiration, they are automatically deleted.</p>
      </div>
    ),
  },
  {
    question: "Is there a free plan?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Yes! You get {config.stripe.freeTier.credits} free PDFs at signup. No credit card required to start.</p>
      </div>
    ),
  },
  {
    question: "Can I bring my own storage?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Yes! You can connect your own S3-compatible storage (AWS S3, Cloudflare R2, etc.) and we&apos;ll upload generated PDFs directly there.</p>
      </div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="flex items-center justify-between w-full px-5 py-4 text-left bg-background hover:bg-muted/50 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span className={`font-medium text-foreground ${isOpen ? "text-primary" : ""}`}>
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-45" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <div
        ref={accordion}
        className="transition-all duration-300 ease-in-out overflow-hidden bg-background"
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="px-5 pb-4 text-muted-foreground leading-relaxed">
          {item?.answer}
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <section className="bg-background" id="faq">
      <div className="py-24 px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Answers to common questions about our PDF generation API for developers and businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

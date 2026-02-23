"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "What is this starter kit?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>A production-ready SaaS starter kit for building API-first products. It includes authentication, team management, Stripe payments, and a FastAPI backend.</p>
        <p>Perfect for developers who want to ship their API product faster without rebuilding common infrastructure.</p>
      </div>
    ),
  },
  {
    question: "What tech stack is included?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>The stack includes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS</li>
          <li>Backend: FastAPI (Python 3.11)</li>
          <li>Database: PostgreSQL via Supabase</li>
          <li>Auth: Supabase Auth with JWT + API keys</li>
          <li>Payments: Stripe subscriptions</li>
        </ul>
      </div>
    ),
  },
  {
    question: "How does team management work?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>The starter kit uses a team-based multi-tenancy model:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Users can create and join multiple teams</li>
          <li>Role-based permissions (owner, admin, member)</li>
          <li>Team invitations via email</li>
          <li>All resources belong to teams, not individual users</li>
        </ul>
      </div>
    ),
  },
  {
    question: "How do API keys work?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Each team can create multiple API keys for programmatic access. Keys are scoped to the team and can be revoked at any time.</p>
        <p>The backend validates both JWT tokens (for user sessions) and API keys (for programmatic access).</p>
      </div>
    ),
  },
  {
    question: "How is hosting configured?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>The starter kit is configured for:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Frontend: Vercel (with edge functions)</li>
          <li>Backend: Google Cloud Run (serverless containers)</li>
          <li>Database: Supabase (managed PostgreSQL)</li>
        </ul>
        <p>Deploy scripts and CI/CD workflows are included.</p>
      </div>
    ),
  },
  {
    question: "What integrations are included?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>The repo includes integration templates for:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Zapier (custom integration)</li>
          <li>Make (custom app)</li>
          <li>n8n (community node)</li>
        </ul>
        <p>These let your users connect your API to automation platforms.</p>
      </div>
    ),
  },
  {
    question: "Do I get full source code access?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Yes! You get complete access to all source code. No vendor lock-in, no runtime dependencies on our platform.</p>
        <p>Fork the repo, customize everything, and deploy to your own infrastructure.</p>
      </div>
    ),
  },
  {
    question: "How do I add my own API endpoints?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Add new endpoints in the FastAPI backend under <code className="bg-muted px-1 rounded">backend/app/routers/v1/</code>.</p>
        <p>The OpenAPI schema and Postman collection are auto-generated from your endpoint definitions.</p>
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
            Answers to common questions about the API starter kit.
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

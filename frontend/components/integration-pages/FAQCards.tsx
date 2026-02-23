export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCardsProps {
  items: FAQItem[];
}

export function FAQCards({ items }: FAQCardsProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6"
        >
          <h3 className="font-semibold text-foreground mb-3">{item.question}</h3>
          <div
            className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: item.answer }}
          />
        </div>
      ))}
    </div>
  );
}

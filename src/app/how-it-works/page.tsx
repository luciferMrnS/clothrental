import type { Metadata } from "next";

const STEPS = [
  {
    title: "Browse the collection",
    text: "Every piece shows its true price, deposit, available sizes, measurements and honest photos.",
  },
  {
    title: "Book your dates",
    text: "Choose your collection or delivery date and your return date. Each garment can only be booked once at a time.",
  },
  {
    title: "Verify & pay",
    text: "Confirm your identity and contact details. Pay your rental fee and a refundable damage deposit, kept fully separate.",
  },
  {
    title: "Receive & wear",
    text: "Your piece arrives cleaned, steamed and presentation-ready. Enjoy the moment.",
  },
  {
    title: "Return & reset",
    text: "Return by your agreed deadline. The garment is inspected, cleaned and prepared for the next person to enjoy.",
  },
];

export const metadata: Metadata = {
  title: "How It Works",
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <header>
        <h1 className="font-display text-4xl text-foreground">How it works</h1>
        <p className="mt-3 text-muted">
          Look memorable. Spend intentionally. Return it — and let someone else
          enjoy it next.
        </p>
      </header>

      <ol className="mt-10 space-y-6">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-5 rounded-2xl border border-line bg-surface p-5"
          >
            <span className="font-display text-3xl text-accent-soft">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="font-medium text-foreground">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-6 text-sm leading-7 text-muted">
        <strong className="text-foreground">Good to know</strong> — late returns
        are charged a clear fee, because one late item can affect another
        customer’s booking. Ordinary wear is expected; avoidable damage or loss
        is covered by the refundable deposit and a simple, documented policy.
      </div>
    </div>
  );
}
import Image from "next/image";
import Link from "next/link";
import { getFeaturedItems } from "@/db/items";
import { OCCASIONS, SITE_NAME } from "@/lib/site-config";
import DressCard from "@/components/dress-card";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    title: "Browse",
    text: "Explore a curated collection with true sizes, measurements and photos.",
  },
  {
    n: "02",
    title: "Book & verify",
    text: "Choose your dates, confirm your details and pay your rental fee.",
  },
  {
    n: "03",
    title: "Collect or receive",
    text: "Your piece arrives presentation-ready, cleaned, steamed and pressed.",
  },
  {
    n: "04",
    title: "Wear, return, repeat",
    text: "Enjoy the moment, return by the deadline — and let someone else enjoy it next.",
  },
];

export default async function Home() {
  const featured = await getFeaturedItems(4);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
              Premium occasion-wear rental
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-foreground md:text-6xl">
              Look memorable.
              <br />
              Spend intentionally.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-muted">
              Rent beautiful occasion pieces for weddings, birthdays,
              graduations and photoshoots — without the full cost of ownership.
              Worn, loved, returned, reused.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/collection"
                className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-colors hover:bg-accent"
              >
                Browse the collection
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-full border border-line px-7 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                How it works
              </Link>
            </div>
          </div>
          <div className="relative hidden aspect-[3/4] max-h-[560px] overflow-hidden rounded-3xl md:block">
            <Image
              src="/dresses/dress-2.svg"
              alt={`${SITE_NAME} flagship piece`}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-line bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl text-foreground">
            A simple, trustworthy process
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-2xl border border-line bg-surface p-5">
                <p className="font-display text-3xl text-accent-soft">{step.n}</p>
                <h3 className="mt-3 font-medium text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="border-b border-line bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl text-foreground">
            Dressed for the occasion
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {OCCASIONS.map((o, index) => (
              <Link
                key={o.slug}
                href={`/collection?occasion=${o.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-line"
              >
                <Image
                  src={`/dresses/dress-${(index % 8) + 1}.svg`}
                  alt={o.label}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-4 left-4 font-display text-lg text-white">
                  {o.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured pieces */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-3xl text-foreground">
              Featured pieces
            </h2>
            <Link
              href="/collection"
              className="shrink-0 text-sm font-medium text-accent hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {featured.length > 0 ? (
              featured.map((item) => <DressCard key={item.id} item={item} />)
            ) : (
              <p className="text-muted">The collection is being prepared.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
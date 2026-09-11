import Image from "next/image";
import Link from "next/link";
import type { Item } from "@/db/items";
import { formatNaira } from "@/lib/format";

export default function DressCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/collection/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-background">
        {item.images[0] ? (
          <Image
            src={item.images[0]}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        {!item.isAvailable ? (
          <span className="absolute top-3 left-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-white">
            Booked
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-lg text-foreground">{item.name}</h3>
        <p className="text-xs text-muted">{item.occasions.join(" · ")}</p>
        <p className="mt-2 font-medium text-foreground">
          {formatNaira(item.pricePerRental)}
          <span className="text-xs font-normal text-muted"> / rental</span>
        </p>
      </div>
    </Link>
  );
}
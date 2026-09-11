import { count, eq, inArray, sql, sum } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { bookings, items } from "@/db/schema";
import { getAllBookings } from "@/db/bookings";
import { getItemNameMap } from "@/db/items";
import { formatNaira } from "@/lib/format";
import { formatDate } from "@/lib/format-date";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["confirmed", "collected"] as const;

export default async function AdminOverviewPage() {
  const [itemCount] = await db
    .select({ value: count() })
    .from(items);
  const [availableCount] = await db
    .select({ value: count() })
    .from(items)
    .where(eq(items.isAvailable, true));
  const [revenueRow] = await db
    .select({
      value: sum(sql`${bookings.rentalFee} + ${bookings.deliveryFee}`),
    })
    .from(bookings)
    .where(inArray(bookings.status, [...ACTIVE_STATUSES, "returned"]));
  const allBookings = await getAllBookings();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString().slice(0, 10);

  const upcoming = allBookings.filter(
    (b) => b.startDate >= todayIso && b.status === "confirmed"
  );
  const pending = allBookings.filter((b) => b.status === "pending");
  const ids = [...new Set(allBookings.map((b) => b.itemId))];
  const names = await getItemNameMap(ids);
  const dueBack = allBookings.filter(
    (b) => b.returnDate < todayIso && b.status !== "returned"
  );
  const active = allBookings.filter((b) =>
    (ACTIVE_STATUSES as readonly string[]).includes(b.status)
  );

  const stats: Array<{ label: string; value: string }> = [
    { label: "Items in catalog", value: String(itemCount?.value ?? 0) },
    { label: "Available for rent", value: String(availableCount?.value ?? 0) },
    { label: "Active rentals", value: String(active.length) },
    { label: "Pending payments", value: String(pending.length) },
    { label: "Revenue collected", value: formatNaira(Number(revenueRow?.value ?? 0)) },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-line bg-surface p-6"
          >
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 font-display text-3xl text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">
            Checked out / due back
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        {dueBack.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Nothing due back right now.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {dueBack.map((b) => (
              <li
                key={b.reference}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {names[b.itemId] ?? "Item"}
                  </p>
                  <p className="text-sm text-muted">
                    {b.reference} · {b.customerName}
                  </p>
                </div>
                <p className="text-sm text-red-600">
                  Return due {formatDate(b.returnDate)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">
            Upcoming confirmed bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nothing scheduled.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {upcoming
              .slice()
              .sort((a, b) => a.startDate.localeCompare(b.startDate))
              .slice(0, 6)
              .map((b) => (
                <li key={b.reference} className="flex items-center gap-4">
                  <span className="w-28 shrink-0 text-sm text-muted">
                    {formatDate(b.startDate)}
                  </span>
                  <span className="font-medium text-foreground">
                    {names[b.itemId] ?? "Item"}
                  </span>
                  <span className="ml-auto text-sm text-muted">
                    {b.customerName}
                  </span>
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}
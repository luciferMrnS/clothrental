import { getAllBookings } from "@/db/bookings";
import { getItemNameMap } from "@/db/items";
import { bookingStatus } from "@/db/schema";
import { formatNaira } from "@/lib/format";
import { formatDate } from "@/lib/format-date";
import { setBookingStatus } from "../actions";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  collected: "bg-blue-50 text-blue-700 border-blue-200",
  returned: "bg-stone-50 text-stone-600 border-stone-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default async function AdminBookingsPage() {
  const all = await getAllBookings();
  const ids = [...new Set(all.map((b) => b.itemId))];
  const names = await getItemNameMap(ids);

  const rows = all
    .slice()
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground">
          All bookings
        </h2>
        <p className="text-sm text-muted">{rows.length} total</p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No bookings yet. They appear here once customers book a dress.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs tracking-wide text-muted uppercase">
                <th className="pb-3 pr-4">Reference</th>
                <th className="pb-3 pr-4">Item</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Dates</th>
                <th className="pb-3 pr-4">Mode</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((b) => (
                <tr key={b.reference} className="align-top">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {b.reference}
                  </td>
                  <td className="py-3 pr-4">{names[b.itemId] ?? "Item"}</td>
                  <td className="py-3 pr-4">
                    <p className="text-foreground">{b.customerName}</p>
                    <p className="text-muted">{b.customerPhone}</p>
                  </td>
                  <td className="py-3 pr-4 text-muted">
                    <p>{formatDate(b.startDate)}</p>
                    <p>→ {formatDate(b.returnDate)}</p>
                  </td>
                  <td className="py-3 pr-4 capitalize">{b.collectionMode}</td>
                  <td className="py-3 pr-4">
                    <p className="text-foreground">
                      {formatNaira(b.rentalFee + b.deliveryFee)}
                    </p>
                    <p className="text-muted">
                      deposit {formatNaira(b.deposit)}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block rounded-full border px-3 py-1 text-xs capitalize ${statusStyles[b.status] ?? "bg-stone-50 text-stone-600 border-stone-200"}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {bookingStatus
                        .filter((s) => s !== b.status && s !== "pending")
                        .map((s) => (
                          <form key={s} action={setBookingStatus}>
                            <input
                              type="hidden"
                              name="reference"
                              value={b.reference}
                            />
                            <input type="hidden" name="status" value={s} />
                            <button
                              type="submit"
                              className="rounded-full border border-line px-3 py-1 text-xs capitalize text-muted transition-colors hover:border-foreground hover:text-foreground"
                            >
                              {s}
                            </button>
                          </form>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
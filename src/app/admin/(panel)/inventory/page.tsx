import Link from "next/link";
import { getAllItems } from "@/db/items";
import { formatNaira } from "@/lib/format";
import { addItem, toggleAvailability, toggleFeatured } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const items = await getAllItems();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-foreground">Add an item</h2>
        <form action={addItem} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-muted">Name *</span>
            <input
              name="name"
              required
              placeholder="Ivory lace gown"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Slug (optional)</span>
            <input
              name="slug"
              placeholder="ivory-lace-gown"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-muted">
              Description (short)
            </span>
            <textarea
              name="description"
              rows={2}
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Price per rental (₦) *</span>
            <input
              name="pricePerRental"
              type="number"
              min={0}
              required
              placeholder="28000"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Deposit (₦) *</span>
            <input
              name="deposit"
              type="number"
              min={0}
              required
              placeholder="22000"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Occasions (comma separated)</span>
            <input
              name="occasions"
              placeholder="Wedding, Engagement"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">
              Sizes (comma separated)
            </span>
            <input
              name="sizes"
              placeholder="S, M, L, XL"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Colors (comma separated)</span>
            <input
              name="colors"
              placeholder="Ivory, Champagne"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">
              Image URLs (comma separated)
            </span>
            <input
              name="images"
              placeholder="/dresses/dress-1.svg"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Fit</span>
            <input
              name="fit"
              placeholder="Body-hugging with flare"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Care notes (optional)</span>
            <input
              name="careNotes"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked
                className="size-4 accent-foreground"
              />
              Available to book
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name="isFeatured"
                className="size-4 accent-foreground"
              />
              Featured on homepage
            </label>
          </div>
          <button
            type="submit"
            className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-colors hover:bg-accent sm:col-span-2 sm:w-fit"
          >
            Add item
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl text-foreground">
          Catalog &nbsp;({items.length})
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs tracking-wide text-muted uppercase">
                <th className="pb-3 pr-4">Item</th>
                <th className="pb-3 pr-4">Occasions</th>
                <th className="pb-3 pr-4">Price + deposit</th>
                <th className="pb-3 pr-4">Available</th>
                <th className="pb-3">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/collection/${item.slug}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted">{item.slug}</p>
                  </td>
                  <td className="py-3 pr-4 text-muted">
                    {item.occasions.map((o) => (
                      <span
                        key={o}
                        className="mr-1.5 inline-block rounded-full border border-line px-2 py-0.5 text-xs"
                      >
                        {o}
                      </span>
                    ))}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-foreground">{formatNaira(item.pricePerRental)}</p>
                    <p className="text-muted">dep. {formatNaira(item.deposit)}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <form action={toggleAvailability}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className={`w-20 rounded-full border px-3 py-1 text-xs transition-colors ${item.isAvailable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-stone-200 bg-stone-50 text-stone-500 hover:text-foreground"}`}
                      >
                        {item.isAvailable ? "Live" : "Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <form action={toggleFeatured}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className={`w-20 rounded-full border px-3 py-1 text-xs transition-colors ${item.isFeatured ? "border-accent bg-accent/10 text-accent" : "border-stone-200 bg-stone-50 text-stone-500 hover:text-foreground"}`}
                      >
                        {item.isFeatured ? "Featured" : "Plain"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
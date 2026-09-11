"use client";

import Link from "next/link";
import { useState } from "react";
import type { Item } from "@/db/items";
import { MAX_RENTAL_DAYS } from "@/lib/site-config";
import { formatNaira } from "@/lib/format";

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISODate(d);
}

const ID_TYPES = [
  "National ID card",
  "Driver's licence",
  "Voters card",
  "International passport",
];

export default function BookingForm({ item }: { item: Item }) {
  const [startDate, setStartDate] = useState(tomorrow());
  const [returnDate, setReturnDate] = useState(addDays(tomorrow(), 3));
  const [collectionMode, setCollectionMode] = useState<"pickup" | "delivery">(
    "pickup"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [idNumber, setIdNumber] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const deliveryFee = collectionMode === "delivery" ? 3000 : 0;
  const totalPayable = item.pricePerRental + deliveryFee;
  const minReturn = addDays(startDate, 1);
  const maxReturn = addDays(startDate, MAX_RENTAL_DAYS + 1);

  function handleStartChange(value: string) {
    setStartDate(value);
    const min = addDays(value, 1);
    if (returnDate < min) setReturnDate(min);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: item.slug,
          startDate,
          returnDate,
          collectionMode,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          idType,
          idNumber,
          note: note || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (data.payment?.authorizationUrl) {
        setRedirecting(true);
        window.location.assign(data.payment.authorizationUrl);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (redirecting) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-10 text-center">
        <p className="font-display text-2xl text-foreground">
          Taking you to secure checkout…
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Your piece is held while you complete payment. If nothing happens,
          check your browser for blockers or{" "}
          <Link
            href="/collection"
            className="text-accent underline underline-offset-2"
          >
            return to the collection
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-3xl border border-line bg-surface p-6 md:p-8"
    >
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Dates */}
      <section>
        <h2 className="font-display text-xl text-foreground">Your dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-muted">Collection date</span>
            <input
              type="date"
              required
              value={startDate}
              min={tomorrow()}
              onChange={(e) => handleStartChange(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Return date</span>
            <input
              type="date"
              required
              value={returnDate}
              min={minReturn}
              max={maxReturn}
              onChange={(e) => setReturnDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">
          Rental periods run 1–{MAX_RENTAL_DAYS} days. Returned by the deadline,
          every time — a late item affects the next customer.
        </p>
      </section>

      {/* Fulfilment */}
      <section>
        <h2 className="font-display text-xl text-foreground">
          Collection or delivery
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              { value: "pickup", label: "Pick up in Lagos", note: "Free" },
              { value: "delivery", label: "Delivery", note: `${formatNaira(3000)}` },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCollectionMode(option.value)}
              className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
                collectionMode === option.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-line bg-background text-foreground hover:border-accent"
              }`}
            >
              <span className="block font-medium">{option.label}</span>
              <span
                className={`block text-sm ${
                  collectionMode === option.value ? "text-background/70" : "text-muted"
                }`}
              >
                {option.note}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Customer details */}
      <section>
        <h2 className="font-display text-xl text-foreground">
          Your details
        </h2>
        <p className="mt-1 text-sm text-muted">
          We verify identity before higher-value pieces are released. Your
          details are used only for this booking.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm text-muted">Full name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amina Adeyemi"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Phone / WhatsApp</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">ID type</span>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            >
              {ID_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-muted">ID number</span>
            <input
              type="text"
              required
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Your ID number"
              className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-muted">Notes (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Anything we should know?"
              className="mt-1.5 w-full resize-none rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
            />
          </label>
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-2xl border border-line bg-background">
        <div className="space-y-3 p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Rental fee</span>
            <span className="font-medium text-foreground">
              {formatNaira(item.pricePerRental)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Delivery</span>
            <span className="font-medium text-foreground">
              {deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Refundable deposit</span>
            <span className="font-medium text-accent">{formatNaira(item.deposit)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3">
            <span className="text-foreground">Total payable</span>
            <span className="font-display text-xl text-foreground">
              {formatNaira(totalPayable)}
            </span>
          </div>
        </div>
        <div className="p-5">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-foreground px-7 py-4 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-60"
          >
            {loading ? "Reserving…" : "Reserve this piece"}
          </button>
        </div>
      </section>
    </form>
  );
}
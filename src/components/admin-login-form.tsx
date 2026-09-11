"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("Incorrect password.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-24 w-full max-w-sm">
      <div className="rounded-3xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl text-foreground">
          Owner sign in
        </h1>
        <p className="mt-2 text-sm text-muted">
          Restricted area. Manage bookings and inventory.
        </p>
        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <label className="mt-6 block">
          <span className="text-sm text-muted">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}
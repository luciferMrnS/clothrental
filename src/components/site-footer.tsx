import { CONTACT_EMAIL, CONTACT_WHATSAPP, SITE_NAME } from "@/lib/site-config";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-foreground">{SITE_NAME}</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
            Look memorable. Spend intentionally. Return it — and let someone
            else enjoy it next.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <a href={`https://wa.me/${CONTACT_WHATSAPP.replace("+", "")}`}>
                WhatsApp: {CONTACT_WHATSAPP}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
            Service
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Rental periods of 1–4 days</li>
            <li>Cleaning &amp; care included</li>
            <li>Lagos pickup and delivery</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4">
        <p className="text-center text-xs text-muted">
          © {new Date().getFullYear()} {SITE_NAME}. Working title — final name
          to be confirmed.
        </p>
        <p className="mt-1 text-center">
          <a href="/admin" className="text-xs text-muted/60 hover:text-muted">
            Owner area
          </a>
        </p>
      </div>
    </footer>
  );
}
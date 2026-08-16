import Link from "next/link";
import { ArrowLeft, ShoppingBag, Sparkles, CheckCircle2 } from "lucide-react";
import { ShopWaitlist } from "@/components/shop/shop-waitlist";

export default async function ShopPage() {
  const res = await fetch("http://localhost:4000/api/shop", { cache: "no-store" });
  const products: Array<{ status: string }> = res.ok ? await res.json() : [];
  const hasProducts = products.length > 0;

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.5 0.11 200 / 0.08), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="border-b hairline pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Shop</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Digital goods, merch, and more — being crafted now.
          </p>
        </div>

        {hasProducts ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <div key={i} className="rounded-2xl border hairline bg-card p-5">
                <p className="font-medium text-foreground">Product {i + 1}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border hairline bg-card p-8 shadow-premium-sm sm:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-soft blur-2xl"
              />

              <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent-soft shadow-premium-sm">
                  <ShoppingBag className="h-9 w-9 text-accent" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                    <Sparkles className="h-3 w-3" />
                    In the works
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    The store is being crafted
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Digital downloads, project templates, and merch are on the
                    way. Join the waitlist to be notified the moment the shop
                    opens — no spam, just the launch announcement.
                  </p>

                  <div className="mt-5">
                    <ShopWaitlist />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Digital downloads", desc: "Templates, presets, and design assets." },
                { title: "Project templates", desc: "Starter kits for your own builds." },
                { title: "Merch", desc: "Minimal apparel and accessories." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border hairline bg-card p-5 shadow-premium-xs"
                >
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to articles
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

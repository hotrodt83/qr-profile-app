import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-neutral-800 grid place-items-center text-lg font-bold">
              S
            </div>
            <div className="leading-tight">
              <div className="font-semibold">SmartQR</div>
              <div className="text-xs text-neutral-400">Public profile + shareable contact links</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/edit"
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm hover:bg-neutral-800 transition"
            >
              Edit profile
            </Link>
            <Link
              href="/u/demo"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              View demo
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="mt-14 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              One link. One QR. <span className="text-neutral-400">Your public identity.</span>
            </h1>

            <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
              Share your SmartQR profile anywhere. Show only what you want public: phone, email,
              WhatsApp, Telegram, Instagram, Facebook, X, and your website.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/edit"
                className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 hover:opacity-90 transition text-center"
              >
                Create your SmartQR profile
              </Link>

              <Link
                href="/u/demo"
                className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-3 text-sm hover:bg-neutral-800 transition text-center"
              >
                See a public profile
              </Link>
            </div>

            <div className="mt-6 text-sm text-neutral-400">
              Tip: replace <span className="text-neutral-200">/u/demo</span> with your username once
              you create your profile.
            </div>
          </div>

          {/* Preview card */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-neutral-800 grid place-items-center text-xl font-bold">
                MJ
              </div>
              <div>
                <div className="font-semibold text-lg">Majd Ismail</div>
                <div className="text-neutral-400">@mj</div>
              </div>
            </div>

            <p className="mt-4 text-neutral-300">
              Founder mode. Clean public profile + smart contact links.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                { label: "Telegram", value: "@mj" },
                { label: "Instagram", value: "@mj" },
                { label: "X", value: "@mj" },
                { label: "Website", value: "smartqr.app" },
              ].map((it) => (
                <div
                  key={it.label}
                  className="rounded-2xl bg-neutral-800/60 px-4 py-3 flex items-center justify-between"
                >
                  <span className="font-medium">{it.label}</span>
                  <span className="text-neutral-300">{it.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm hover:bg-neutral-800 transition"
              >
                Share
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              >
                Create yours
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Public controls",
              desc: "Each contact field has a public toggle. Only show what you approve.",
            },
            {
              title: "Instant sharing",
              desc: "Share your profile link anywhere. Simple, fast, clean.",
            },
            {
              title: "Built for trust",
              desc: "Minimal public view. No admin tools. Just identity and links.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
            >
              <div className="font-semibold">{f.title}</div>
              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-neutral-900 pt-8 text-sm text-neutral-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>© {new Date().getFullYear()} SmartQR</div>
            <div className="flex gap-4">
              <Link className="hover:text-neutral-200 transition" href="/u/demo">
                Demo profile
              </Link>
              <Link className="hover:text-neutral-200 transition" href="/edit">
                Create / Edit
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
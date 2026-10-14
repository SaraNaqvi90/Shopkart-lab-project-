export default function AuthShell({ eyebrow, tagline, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="flex flex-col justify-between bg-ink px-8 py-10 text-paper sm:px-12 lg:py-16">
        <span className="font-display text-2xl tracking-tight">ShopKart</span>

        <div className="max-w-sm">
          <p className="font-body text-sm uppercase tracking-[0.08em] text-marigold">
            {eyebrow}
          </p>
          <p className="mt-3 font-display text-3xl leading-tight text-paper sm:text-4xl">
            {tagline}
          </p>
        </div>

        <p className="font-body text-xs text-paper/40">
          Frontend Engineering Lab · Client&ndash;Server Auth
        </p>
      </aside>

      <main className="flex items-center justify-center bg-paper px-8 py-14 sm:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}

// ============================================================================
// hero-visual.tsx — decorative SVG signature visual for the home hero.
// ----------------------------------------------------------------------------
// Replaces the flat gradient background with an abstract geometric pattern:
// concentric arcs + floating dots in the teal accent color. Pure SVG, no
// images, scales perfectly on any screen size.
//
// The SVG is absolutely positioned behind the hero content (z-0) and the
// hero text sits on top (z-10). It's decorative only — `aria-hidden` keeps
// it out of screen readers.
//
// Docs:
//   - SVG patterns: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Patterns
//   - SVG arcs: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path#arcs
// ==========================================================================
export function HeroVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Layer 1: soft radial gradient glow (kept from before, more prominent) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 75% 15%, oklch(0.5 0.11 200 / 0.18), transparent 60%), radial-gradient(ellipse 50% 50% at 15% 85%, oklch(0.62 0.11 230 / 0.10), transparent 60%)",
        }}
      />

      {/* Layer 2: concentric arcs — an abstract "signal" motif in the top-right.
          The arcs use the teal accent at decreasing opacities for depth. */}
      <svg
        className="absolute -right-20 -top-20 h-[500px] w-[500px] opacity-60"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Each arc is a circle stroke with a different radius + opacity.
            cx/cy=0 places the center off-screen so only the arc curves show. */}
        <circle cx="0" cy="0" r="180" stroke="oklch(0.5 0.11 200 / 0.15)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="240" stroke="oklch(0.5 0.11 200 / 0.12)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="300" stroke="oklch(0.5 0.11 200 / 0.09)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="360" stroke="oklch(0.5 0.11 200 / 0.07)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="420" stroke="oklch(0.5 0.11 200 / 0.05)" strokeWidth="1.5" />
      </svg>

      {/* Layer 3: floating dots grid — a subtle dotted pattern in the bottom-left.
          Adds texture without being busy. Uses small circles in a loose grid. */}
      <svg
        className="absolute bottom-10 left-10 h-32 w-32 opacity-30"
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 6x4 grid of small dots. Each dot is a 1.5px circle. */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 22 + 8}
              cy={row * 22 + 8}
              r="1.5"
              fill="oklch(0.5 0.11 200 / 0.5)"
            />
          )),
        )}
      </svg>

      {/* Layer 4: animated floating accent orb (kept from before, more visible). */}
      <div
        className="absolute right-[10%] top-[15%] hidden h-80 w-80 rounded-full blur-3xl animate-float md:block"
        style={{ backgroundColor: "oklch(0.5 0.11 200 / 0.15)" }}
      />
    </div>
  );
}

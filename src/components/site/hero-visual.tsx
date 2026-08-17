// aria-hidden because this is purely decorative
export function HeroVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 75% 15%, oklch(0.145 0.005 247 / 0.08), transparent 60%), radial-gradient(ellipse 50% 50% at 15% 85%, oklch(0.145 0.005 247 / 0.05), transparent 60%)",
        }}
      />
      <svg
        className="absolute -right-20 -top-20 h-[500px] w-[500px] opacity-60"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="0" cy="0" r="180" stroke="oklch(0.145 0.005 247 / 0.15)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="240" stroke="oklch(0.145 0.005 247 / 0.12)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="300" stroke="oklch(0.145 0.005 247 / 0.09)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="360" stroke="oklch(0.145 0.005 247 / 0.07)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="420" stroke="oklch(0.145 0.005 247 / 0.05)" strokeWidth="1.5" />
      </svg>
      <svg
        className="absolute bottom-10 left-10 h-32 w-32 opacity-30"
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 22 + 8}
              cy={row * 22 + 8}
              r="1.5"
              fill="oklch(0.145 0.005 247 / 0.5)"
            />
          )),
        )}
      </svg>
      <div
        className="absolute right-[10%] top-[15%] hidden h-80 w-80 rounded-full blur-3xl animate-float md:block"
        style={{ backgroundColor: "oklch(0.145 0.005 247 / 0.08)" }}
      />
    </div>
  );
}

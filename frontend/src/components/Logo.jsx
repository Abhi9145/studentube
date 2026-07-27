function Logo({ className = "", size = "normal" }) {
  const width = size === "large" ? 34 : size === "small" ? 22 : 28;
  const height = width;

  return (
    <div
      className={`studentube-brand-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Minimalist Geometric "S" Monogram (Overlapping Play Arrows forming 'S') */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: "drop-shadow(0 2px 10px rgba(255, 0, 0, 0.45))" }}
      >
        <defs>
          <linearGradient id="sGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#ff0033" />
          </linearGradient>
          <linearGradient id="sGradBot" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d90000" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>
        </defs>

        {/* Top Play Chevron forming upper S curve */}
        <path
          d="M30 6H14C9.02944 6 5 10.0294 5 15C5 19.9706 9.02944 24 14 24H28L18 16.5L28 9H30Z"
          fill="url(#sGradTop)"
        />

        {/* Bottom Play Chevron forming lower S curve */}
        <path
          d="M10 34H26C30.9706 34 35 29.9706 35 25C35 20.0294 30.9706 16 26 16H12L22 23.5L12 31H10Z"
          fill="url(#sGradBot)"
        />
      </svg>

      {/* Brand Typography */}
      <span
        className="brand-text"
        style={{
          fontSize: size === "large" ? "22px" : "19px",
          fontWeight: "800",
          letterSpacing: "-0.5px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: 1,
        }}
      >
        <span style={{ color: "var(--text-color, #ffffff)" }}>Studen</span>
        <span
          style={{
            background: "linear-gradient(135deg, #ff3333 0%, #ff0055 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginLeft: "1px",
          }}
        >
          tube
        </span>
      </span>
    </div>
  );
}

export default Logo;

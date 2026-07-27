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
      {/* Unique Emblem: Academic Mortarboard + Cyber Shield Play Fusion */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: "drop-shadow(0 2px 8px rgba(255, 0, 0, 0.4))" }}
      >
        <defs>
          <linearGradient id="stRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff3333" />
            <stop offset="100%" stopColor="#cc0000" />
          </linearGradient>
        </defs>

        {/* Academic Mortarboard Cap Top Diamond */}
        <polygon
          points="20,6 35,13.5 20,21 5,13.5"
          fill="url(#stRedGrad)"
        />

        {/* Cap Base Band */}
        <path
          d="M11 17.5V24C11 26.5 15 28.5 20 28.5C25 28.5 29 26.5 29 24V17.5"
          stroke="url(#stRedGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cap Tassel */}
        <path
          d="M32 15V22.5"
          stroke="url(#stRedGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="32" cy="23.5" r="1.5" fill="#ff3333" />
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

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
        style={{ flexShrink: 0, filter: "drop-shadow(0 2px 10px rgba(255, 0, 0, 0.45))" }}
      >
        <defs>
          <linearGradient id="stShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2a2a" />
            <stop offset="60%" stopColor="#e60000" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>
          <linearGradient id="stCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffe6e6" />
          </linearGradient>
        </defs>

        {/* Outer Shield Frame */}
        <path
          d="M20 2.5L35 10.5V28.5L20 37.5L5 28.5V10.5L20 2.5Z"
          fill="url(#stShieldGrad)"
        />

        {/* Academic Mortarboard Cap Top Diamond */}
        <polygon
          points="20,8 30,13.5 20,19 10,13.5"
          fill="url(#stCapGrad)"
        />

        {/* Cap Tassel Line */}
        <path
          d="M30 13.5V19.5"
          stroke="#ffffff"
          strokeWidth="1.75"
          strokeLinecap="round"
        />

        {/* Inner Play Triangle */}
        <polygon
          points="16.5,21 26.5,26.5 16.5,32"
          fill="#ffffff"
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

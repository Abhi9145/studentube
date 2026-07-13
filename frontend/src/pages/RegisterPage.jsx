import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import { API_URL } from "../config";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Account created! Redirecting to login…");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data.message || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-badge">🎓 Studentube</div>
        <h2>Start Your<br />Learning Journey.</h2>
        <p>Create a free account and unlock curated educational videos, AI-generated study notes, personal playlists, and watch history tracking.</p>
        <div className="auth-features">
          <div className="auth-feature">✅ 100% free to use</div>
          <div className="auth-feature">🔒 Secure & private account</div>
          <div className="auth-feature">🤖 AI study notes on any topic</div>
          <div className="auth-feature">📊 Track your learning progress</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create Account</h2>
            <p>Join thousands of students today</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div
              style={{
                background: "rgba(0, 200, 80, 0.1)",
                border: "1px solid rgba(0, 200, 80, 0.3)",
                borderRadius: "10px",
                padding: "12px 16px",
                fontSize: "0.88rem",
                color: "#4caf79",
                marginBottom: "20px",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

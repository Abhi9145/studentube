import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import "./Auth.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );
      const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    console.log(user);

    alert(`Welcome ${user.displayName}`);

    // Backend integration comes next
  } catch (error) {
    console.error(error);
    alert("Google Login Failed");
  }
};

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);

        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-left">

        <h1>🎓 Studentube</h1>

        <h2>
          Learn Smarter.
          <br />
          Watch Better.
        </h2>

        <p>
          Your study companion for coding,
          engineering, placements and college.
        </p>

      </div>

      <div className="auth-right">

        <div className="auth-card">

          <h2>Welcome Back 👋</h2>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />

            <button type="submit">
  Login
</button>


          </form>

          <div className="divider">
            OR
          </div>

          <button className="google-btn">
            🌐 Continue with Google
          </button>

          <p>
            Don't have an account?
          </p>

          <Link to="/register">
            Register Now
          </Link>

        </div>

      </div>

    </div>
  );
}

export default LoginPage;
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
const [name, setName] =
useState("");

const [email, setEmail] =
useState("");

const [password, setPassword] =
useState("");

const navigate = useNavigate();

const handleRegister = async (
e
) => {
e.preventDefault();

```
try {
  const response = await fetch(
    "http://localhost:8000/api/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  const data =
    await response.json();

  alert(data.message);

  navigate("/login");
} catch (error) {
  console.error(error);
}
```

};

return ( <div className="auth-container"> <div className="auth-card">

```
    <h1 className="auth-logo">
      🎓 Studentube
    </h1>

    <h2>Create Account</h2>

    <form
      onSubmit={handleRegister}
    >
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) =>
          setName(
            e.target.value
          )
        }
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
      />

      <button type="submit">
        Register
      </button>
    </form>

    <p>
      Already have an account?
    </p>

    <Link to="/login">
      Login Here
    </Link>
  </div>
</div>


);
}

export default RegisterPage;

import { useEffect, useState } from "react";

function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("email"),
    };

    setUser(userData);
  }, []);

  if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "600px",
        margin: "auto",
      }}
    >
      <h1>👤 My Profile</h1>

      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
        }}
      >
        <h3>Name</h3>
        <p>{user.name}</p>

        <h3>Email</h3>
        <p>{user.email}</p>
      </div>
    </div>
  );
}

export default ProfilePage;
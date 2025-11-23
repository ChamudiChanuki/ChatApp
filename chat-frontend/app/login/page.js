
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  "https://chatapp-backend-dqbjhcbdcdggf2dn.centralindia-01.azurewebsites.net";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "Login failed.");
        return;
      }

      const data = await res.json(); // { username, token }

      
      localStorage.setItem("chat_username", data.username);
      localStorage.setItem("chat_token", data.token);

      
      router.push("/chat");
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <main className="page">
      <div className="chat-container">
        <h1>Login</h1>
        <form className="join-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </label>
          {error && (
            <div style={{ color: "salmon", fontSize: 12 }}>{error}</div>
          )}
          <button type="submit">Login</button>
        </form>
        <p style={{ fontSize: 13, marginTop: 8 }}>
          No account?{" "}
          <a href="/register" style={{ textDecoration: "underline" }}>
            Register
          </a>
        </p>
      </div>
    </main>
  );
}

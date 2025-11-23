
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  "https://chatapp-backend-dqbjhcbdcdggf2dn.centralindia-01.azurewebsites.net";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "Registration failed.");
        return;
      }

      alert("Registration successful. Please login.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <main className="page">
      <div className="chat-container">
        <h1>Register</h1>
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
          <button type="submit">Sign Up</button>
        </form>
        <p style={{ fontSize: 13, marginTop: 8 }}>
          Already have an account?{" "}
          <a href="/login" style={{ textDecoration: "underline" }}>
            Login
          </a>
        </p>
      </div>
    </main>
  );
}

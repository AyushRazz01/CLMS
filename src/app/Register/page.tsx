"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/register", {  // ✅ IMPORTANT FIX
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      console.log("RAW RESPONSE:", text); // 🔥 DEBUG

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert("Server returned HTML instead of JSON ❌");
        return;
      }

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("User registered successfully ✅");
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <br />

        <input name="email" placeholder="Email" onChange={handleChange} />
        <br />

        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
"use client";

import { useState } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      form.name.length > 0 &&
      emailRegex.test(form.email) &&
      form.password.length >= 8
    );
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      setError("Invalid input. Ensure email is valid and password ≥ 8 chars.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("users")
      .insert([
        { name: form.name, email: form.email, password: form.password },
      ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 mb-4 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

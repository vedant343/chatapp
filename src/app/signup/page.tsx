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

    const { error } = await supabase
      .from("users")
      .insert([
        { name: form.name, email: form.email, password: form.password },
      ]);

    if (error) {
      setError(error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE5DD]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#075E54]">
          Create Your WhatsChat Account
        </h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full border border-gray-300 p-3 mb-4 rounded text-black"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 mb-4 rounded text-black"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-3 mb-4 rounded text-black"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleSignup}
          className="w-full bg-[#25D366] text-white py-3 rounded-full hover:bg-[#1DA851] transition duration-300"
        >
          Sign Up
        </button>
        <p className="mt-4 text-center text-black">
          Already have an account?
          <a href="/login" className="text-[#128C7E] hover:underline">
            {" "}
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}

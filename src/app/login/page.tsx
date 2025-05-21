"use client";

import { useState } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", form.email)
      .eq("password", form.password)
      .single();

    if (fetchError || !data) {
      setError("Invalid email or password.");
    } else {
      localStorage.setItem("user", JSON.stringify(data));
      router.push("/chats");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE5DD]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#075E54]">
          Log In to WhatsChat
        </h2>
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
          onClick={handleLogin}
          className="w-full bg-[#075E54] text-white py-3 rounded-full hover:bg-[#064C44] transition duration-300"
        >
          Log In
        </button>
        <p className="mt-4 text-center text-black">
          Don't have an account?
          <a href="/signup" className="text-[#25D366] hover:underline">
            {" "}
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

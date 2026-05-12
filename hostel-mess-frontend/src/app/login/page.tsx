"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState("student");

  const handleLogin = () => {
    if (role === "student") {
      router.push("/student");
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">
        <h2 className="text-3xl font-bold text-center mb-6">
          Login
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-lg"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-3 rounded-lg"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleLogin}
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { useWorldApp } from "@/contexts/WorldAppContext"; // <-- your auth context

export default function Login() {
  const { login, isLoading } = useWorldApp();

  const handleSignIn = async () => {
    try {
      await login(); // starts the World App sign-in
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        World App MarketPlace
      </h1>

      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold
                   hover:bg-purple-700 disabled:opacity-50 transition"
      >
        {isLoading ? "Signing In…" : "Sign In"}
      </button>
    </div>
  );
}

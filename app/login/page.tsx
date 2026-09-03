"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #0d2137 0%, #1a5276 60%, #1f618d 100%)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #c0392b, transparent)" }} />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #d4ac0d, transparent)" }} />

      <div className="relative w-full max-w-md fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="SVERA Logo"
            className="inline-block w-20 h-20 object-contain rounded-full bg-white p-1 shadow-xl mb-4 border border-white/20"
          />
          <h1 className="text-2xl font-extrabold text-white mb-1">Admin Portal</h1>
          <p className="text-blue-200 text-sm">Sidama Vital Events Registration Agency</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl shadow-2xl p-8" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}>
          <h2 className="text-lg font-bold mb-6" style={{ color: "#0d2137" }}>Sign In to Your Account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: "#fdf2f2", border: "1px solid #f5c6cb", color: "#c0392b" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1a1a2e" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="admin-input"
                placeholder="admin@svera.gov.et"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1a1a2e" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-input"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 mt-2 shadow-lg"
              style={{ background: "linear-gradient(135deg, #1a5276, #1f618d)" }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: "#5d6d7e" }}>
            Only authorized SVERA administrators can access this portal.
          </p>
        </div>
      </div>
    </div>
  );
}

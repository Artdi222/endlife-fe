"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/index";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_role", res.data.user.role);
      if (res.data.user.role === "admin") {
        router.push("/admin");
      } else if (res.data.user.role === "user") {
        router.push("/dashboard");
      } else {
        setError("Access Denied. Admin Only");
      }
    } catch (e: Error | unknown) {
      setError(e instanceof Error ? e.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-20 xl:px-28 bg-white">
        <div className="max-w-sm w-full mx-auto">
          {/* Brand */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl text-yellow-300">⬡</span>
              <div className="text-xl font-extrabold text-zinc-900 tracking-tight">
                EndLife
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-zinc-500 text-sm">Sign in to continue.</p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="text-red-400 text-xs">✕</span>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-yellow-300 text-zinc-900 font-bold text-sm py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2 shadow-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <p className="text-zinc-300 text-xs font-mono mt-10 text-center">
            © ENDLIFE
          </p>
        </div>
      </div>

      {/* Right — Image */}
      <div className="hidden lg:block w-1/4 relative overflow-hidden">
        <Image
          height={720}
          width={720}
          src="/Login/Login.jpg"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

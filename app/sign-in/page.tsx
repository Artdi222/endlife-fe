"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/index";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";

/* ── Floating hex particles ── */
function HexParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-yellow-300/30 select-none"
          style={{
            fontSize: `${20 + (i % 4) * 14}px`,
            left: `${8 + ((i * 9) % 80)}%`,
            top: `${10 + ((i * 11) % 75)}%`,
          }}
          animate={{
            y: [0, -16, 0],
            rotate: [0, 180, 360],
            opacity: [0.15, 0.45, 0.15],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeInOut",
          }}
        >
          ⬡
        </motion.span>
      ))}
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_role", res.data.user.role);
      if (res.data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (e: Error | unknown) {
      setError(e instanceof Error ? e.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const slideLeft: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const slideRight: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const fields = [
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
      value: email,
      onChange: setEmail,
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "••••••••",
      value: password,
      onChange: setPassword,
    },
  ];

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* ── LEFT — Yellow Image Panel ── */}
      <motion.div
        variants={slideLeft}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
      >
        {/* Background image */}
        <Image
          fill
          src="/Sign-In/Sign-in.jpg"
          alt="Endfield background"
          className="object-cover mix-blend-multiply"
        />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/65 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-l from-zinc-950/50 via-transparent to-transparent" />

        {/* Hex particles on image panel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-yellow-300/75 select-none"
              style={{
                fontSize: `${20 + (i % 4) * 14}px`,
                left: `${8 + ((i * 9) % 80)}%`,
                top: `${10 + ((i * 11) % 75)}%`,
              }}
              animate={{ rotate: 360, opacity: [0.1, 0.3, 0.1] }}
              transition={{
                duration: 20 + (i % 3),
                repeat: Infinity,
                delay: i * 0.35,
                ease: "linear",
              }}
            >
              ⬡
            </motion.span>
          ))}
        </div>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center px-12 max-w-sm"
        >
          <motion.h2
            className="text-3xl font-black text-yellow-300 tracking-tight mb-3 leading-tight"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            Welcome
            <br />
            <span className="text-white drop-shadow-sm">Back, Endmin</span>
          </motion.h2>

          <motion.p
            className="text-white text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.7 }}
          >
            Track missions, manage progress, and stay on top of every daily
            operation in Arknights: Endfield.
          </motion.p>
        </motion.div>

        {/* Bottom corner brand */}
        <motion.div
          className="absolute bottom-6 left-6 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.4 }}
        >
          <span className="text-yellow-300 text-lg">⬡</span>
          <span className="text-yellow-300 text-xs font-black tracking-widest">
            ENDLIFE
          </span>
        </motion.div>
      </motion.div>

      {/* ── DIVIDER ── */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block w-px bg-linear-to-b from-transparent via-yellow-200 to-transparent my-16 origin-center"
      />

      {/* ── RIGHT — Form Panel (white) ── */}
      <motion.div
        variants={slideRight}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col justify-center px-10 lg:px-16 xl:px-24 relative bg-white"
      >
        {/* Subtle yellow glow top-right */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Bottom-left yellow accent */}
        <motion.div
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Hex particles on form panel */}
        <HexParticles />

        <div className="max-w-md w-full mx-auto relative z-10">
          {/* Brand */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-10"
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 mb-8"
            >
              <Link href="/">
                <motion.span
                  className="text-4xl text-yellow-400 leading-none cursor-pointer"
                  whileHover={{ scale: 1.15, rotate: 15 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ⬡
                </motion.span>
              </Link>
              <div className="text-xl font-extrabold text-zinc-900 tracking-tight">
                End<span className="text-yellow-500">Life</span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-black text-zinc-900 tracking-tight mb-2 leading-tight"
            >
              Welcome
              <br />
              <span className="text-yellow-400">back</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-zinc-500 text-sm">
              Sign in to continue. No account yet?{" "}
              <Link
                href="/sign-up"
                className="text-yellow-500 hover:text-yellow-600 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </motion.p>
          </motion.div>

          {/* Fields */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4"
          >
            {fields.map(({ id, label, type, placeholder, value, onChange }) => (
              <motion.div
                key={id}
                variants={fadeUp}
                className="flex flex-col gap-1.5"
              >
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  {label}
                </label>
                <motion.div
                  animate={{
                    boxShadow:
                      focused === id
                        ? "0 0 0 3px rgba(234,179,8,0.25)"
                        : "0 0 0 0px rgba(234,179,8,0)",
                  }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl overflow-hidden"
                >
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(id)}
                    onBlur={() => setFocused(null)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-yellow-400 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-300 outline-none transition-colors"
                  />
                </motion.div>
              </motion.div>
            ))}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                >
                  <span className="text-red-400 text-xs font-bold">✕</span>
                  <p className="text-red-500 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div variants={fadeUp}>
              <motion.button
                onClick={handleLogin}
                disabled={loading}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full bg-yellow-300 hover:bg-yellow-400 text-zinc-900 font-black text-sm py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1 relative overflow-hidden shadow-sm shadow-yellow-200 cursor-pointer"
              >
                <motion.span
                  className="absolute inset-0 bg-white/30"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.45 }}
                />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="inline-block"
                    >
                      ⬡
                    </motion.span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-zinc-300 text-xs font-mono mt-10 text-center tracking-widest"
          >
            © ENDLIFE
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(true);
        setPassword("");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm px-6"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center glow-emerald-sm">
            <span className="text-3xl">♠</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Pibardos Poker</h1>
          <p className="text-muted-foreground text-sm">Enter password to continue</p>
        </div>

        {/* Password Input */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <motion.div
            animate={error ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              disabled={loading}
              autoFocus
              className={`h-12 text-center text-lg ${
                error
                  ? "border-red-500/50 bg-red-500/5"
                  : "focus:border-emerald-500/50 focus:bg-emerald-500/5"
              }`}
            />
          </motion.div>

          <Button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Enter"
            )}
          </Button>
        </form>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 text-sm"
            >
              Wrong password. Try again.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

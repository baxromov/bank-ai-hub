"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#F4F7F4" }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-[480px] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a6832 0%, #2d8b4a 50%, #52ae30 100%)",
        }}
      >
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <Image
              src="/otp_logo.png"
              alt="Ipoteka Bank"
              width={260}
              height={80}
              className="object-contain brightness-0 invert"
              style={{ height: "64px", width: "auto" }}
              priority
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            BankAI Hub
          </h2>
          <p className="text-white/75 text-base leading-relaxed">
            Внутренняя AI-платформа<br />для сотрудников Ipoteka Bank
          </p>

          {/* Feature badges */}
          <div className="mt-10 flex flex-col gap-3">
            {[
              { iconPath: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "AI Чат на основе LLM" },
              { iconPath: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", label: "Геймификация и рейтинги" },
              { iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Система IB-Coin" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.iconPath} />
                  </svg>
                </div>
                <span className="text-white/90 text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/otp_logo.png"
              alt="Ipoteka Bank"
              width={180}
              height={56}
              className="object-contain mx-auto"
              style={{ height: "48px", width: "auto" }}
              priority
            />
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 20px 60px rgba(13,43,13,0.10), 0 4px 16px rgba(13,43,13,0.06)",
            }}
          >
            <div className="mb-7">
              <h1 className="text-2xl font-bold" style={{ color: "#0D2B0D" }}>
                Добро пожаловать
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#4A6741" }}>
                Войдите в платформу BankAI Hub
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="flex items-center gap-2.5 p-3.5 rounded-xl text-sm"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#DC2626",
                  }}
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D2B0D" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    backgroundColor: "#F4F7F4",
                    border: "1.5px solid #D8E8D5",
                    color: "#0D2B0D",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#52ae30";
                    e.target.style.backgroundColor = "#F0F8EC";
                    e.target.style.boxShadow = "0 0 0 3px rgba(82,174,48,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D8E8D5";
                    e.target.style.backgroundColor = "#F4F7F4";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="user@ipotekabank.uz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D2B0D" }}>
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    backgroundColor: "#F4F7F4",
                    border: "1.5px solid #D8E8D5",
                    color: "#0D2B0D",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#52ae30";
                    e.target.style.backgroundColor = "#F0F8EC";
                    e.target.style.boxShadow = "0 0 0 3px rgba(82,174,48,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D8E8D5";
                    e.target.style.backgroundColor = "#F4F7F4";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all mt-2"
                style={{
                  background: loading
                    ? "linear-gradient(135deg, #2d8b4a 0%, #52ae30 100%)"
                    : "linear-gradient(135deg, #1a6832 0%, #52ae30 100%)",
                  color: "#FFFFFF",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(82,174,48,0.4)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.85 : 1,
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Вход...
                  </span>
                ) : (
                  "Войти"
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#8FAB8A" }}>
            © 2025 Ipoteka Bank OTP Group · BankAI Hub
          </p>
        </div>
      </div>
    </div>
  );
}

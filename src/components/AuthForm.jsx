"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import InlineError from "@/components/InlineError";
import PasswordInput from "@/components/PasswordInput";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

// Reusable Auth Form: supports login and signup modes
// Props:
// - mode: "login" | "signup"
// - onSuccess: function
export default function AuthForm({ mode = "login", onSuccess }) {
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const firstFieldRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  const errors = useMemo(() => {
    const e = {};
    if (isSignup && !name.trim()) e.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email.";
    const pass = password || "";
    const passOk = pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass);
    if (!passOk) e.password = "Min 8 chars, include a capital letter and a number.";
    return e;
  }, [email, password, name, isSignup]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true });
    setError("");
    if (!isValid) return;
    setSubmitting(true);
    try {
      let credential;
      if (isSignup) {
        credential = await createUserWithEmailAndPassword(auth, email, password);
        const trimmedName = name.trim();
        if (trimmedName) {
          await updateProfile(credential.user, { displayName: trimmedName });
        }
      } else {
        credential = await signInWithEmailAndPassword(auth, email, password);
      }

      const { user } = credential;
      const displayName = user.displayName || name.trim() || user.email?.split("@")[0] || "";
      onSuccess?.({
        uid: user.uid,
        email: user.email,
        name: displayName,
        mode,
      });
    } catch (err) {
      const code = err?.code || "";
      const message = (() => {
        switch (code) {
          case "auth/invalid-credential":
          case "auth/invalid-email":
          case "auth/user-not-found":
          case "auth/wrong-password":
            return "Incorrect email or password.";
          case "auth/too-many-requests":
            return "Too many attempts. Please wait a moment and try again.";
          case "auth/email-already-in-use":
            return "That email is already registered.";
          case "auth/weak-password":
            return "Password is too weak. Try adding more characters or symbols.";
          default:
            return err?.message || "Something went wrong.";
        }
      })();
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-6 rounded-2xl border border-[color:var(--surface-2)] bg-[color:var(--surface)] p-6 shadow-sm"
      noValidate
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[color:var(--primary)]">
          {isSignup ? "Create an Account" : "Sign in to BidAgri"}
        </h2>
        <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <span aria-hidden>🔒</span>
          <span>We protect your data — encrypted</span>
        </div>
      </div>

      {isSignup && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[color:var(--primary)]">
            Name
          </label>
          <input
            ref={firstFieldRef}
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            aria-describedby="name-error"
            className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-4 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/40"
            placeholder="Jane Doe"
          />
          {touched.name && <InlineError id="name-error" message={errors.name} />}
        </div>
      )}

      {!isSignup && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[color:var(--primary)]">
            Email
          </label>
          <input
            ref={firstFieldRef}
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-describedby="email-error"
            className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-4 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/40"
            placeholder="you@bidagri.com"
          />
          {touched.email && <InlineError id="email-error" message={errors.email} />}
        </div>
      )}

      {isSignup && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[color:var(--primary)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-describedby="email-error"
            className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-4 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/40"
            placeholder="you@company.com"
          />
          {touched.email && <InlineError id="email-error" message={errors.email} />}
        </div>
      )}

      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        describedBy="password-error"
      />
      {touched.password && <InlineError id="password-error" message={errors.password} />}

      <div className="flex items-center justify-between">
        <a
          href="/auth/forgot-password"
          className="text-sm font-medium text-primary transition-colors hover:text-secondary"
        >
          Forgot password?
        </a>
        <p className="text-xs text-[color:var(--muted)]">By continuing you agree to our terms and privacy.</p>
      </div>

      {error && (
        <div className="rounded-md bg-white border border-[color:var(--accent)]/40 p-3 text-sm text-[color:var(--foreground)]" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Please wait…" : isSignup ? "Create Account" : "Sign In"}
      </button>

      <div className="text-center text-xs text-[color:var(--muted)]">
        <span aria-hidden>🔐</span> Secure login — encrypted transport
      </div>
    </form>
  );
}

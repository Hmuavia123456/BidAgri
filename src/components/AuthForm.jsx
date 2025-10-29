"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import InlineError from "@/components/InlineError";
import PasswordInput from "@/components/PasswordInput";
import { auth } from "@/lib/firebase";
import { getAllowedAdmins } from "@/lib/adminEmails";
import { getUserProfile, upsertUserProfile } from "@/lib/userProfile";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

// Reusable Auth Form: supports login and signup modes
// Props:
// - mode: "login" | "signup"
// - onSuccess: function
// - selectedRole: preferred role (for signup or fallback)
// - onProfile: callback with Firestore profile data
export default function AuthForm({ mode = "login", onSuccess, selectedRole, onProfile }) {
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const firstFieldRef = useRef(null);
  const allowedAdmins = useMemo(() => getAllowedAdmins(["admin@bidagri.com"]), []);

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

  const handleGoogleSignIn = async () => {
    setError("");
    setTouched({});
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);
      const { user } = credential;
      const emailSource = user.email || email || "";
      const emailLower = emailSource.toLowerCase();
      const displayName =
        user.displayName || name.trim() || emailLower.split("@")[0] || "";

      const resolvedRole = allowedAdmins.includes(emailLower)
        ? "admin"
        : selectedRole || "buyer";

      const profile = await upsertUserProfile({
        uid: user.uid,
        email: emailLower,
        displayName,
        role: resolvedRole,
        photoURL: user.photoURL ?? "",
        phoneNumber: user.phoneNumber ?? "",
      });

      onProfile?.(profile);
      onSuccess?.({
        uid: user.uid,
        email: user.email,
        name: displayName,
        role: profile?.role || resolvedRole,
        mode: "google",
      });
    } catch (err) {
      const code = err?.code || "";
      const message = (() => {
        switch (code) {
          case "auth/popup-blocked":
          case "auth/cancelled-popup-request":
            return "Browser blocked the Google popup. Please allow popups and try again.";
          case "auth/popup-closed-by-user":
            return "Google sign-in popup was closed before completing.";
          case "auth/account-exists-with-different-credential":
            return "This email is already linked with a different sign-in method.";
          default:
            return err?.message || "Google sign-in failed. Please try again.";
        }
      })();
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
      const displayName =
        user.displayName || name.trim() || user.email?.split("@")[0] || "";
      const emailLower = (user.email || email).toLowerCase();

      let resolvedRole = allowedAdmins.includes(emailLower)
        ? "admin"
        : selectedRole || "buyer";

      if (!isSignup) {
        const existing = await getUserProfile(user.uid);
        resolvedRole = allowedAdmins.includes(emailLower)
          ? "admin"
          : existing?.role || selectedRole || "buyer";
      }

      const profile = await upsertUserProfile({
        uid: user.uid,
        email: emailLower,
        displayName,
        role: resolvedRole,
        photoURL: user.photoURL ?? "",
        phoneNumber: user.phoneNumber ?? "",
      });

      onProfile?.(profile);
      onSuccess?.({
        uid: user.uid,
        email: user.email,
        name: displayName,
        role: profile?.role || resolvedRole,
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

  const headerTitle = isSignup ? "Create your BidAgri account" : "Welcome back";
  const headerSubtitle = isSignup
    ? "Set a secure password to reach your tailored farmer or buyer workspace."
    : "Sign in with your BidAgri credentials to continue where you left off.";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-7 rounded-2xl border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-7 shadow-[0_18px_36px_rgba(15,23,42,0.12)] backdrop-blur"
      noValidate
    >
      <header className="space-y-2 text-center sm:text-left">
        <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)]">
          BidAgri access
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          {headerTitle}
        </h2>
        <p className="text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
          {headerSubtitle}
        </p>
      </header>

      {isSignup && (
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-[color:var(--foreground)]">
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
            className="mt-2 w-full rounded-xl border border-[rgba(var(--leaf-rgb),0.18)] bg-white px-4 py-2.5 text-sm text-[color:var(--foreground)] shadow-sm placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/35"
            placeholder="Jane Doe"
          />
          {touched.name && <InlineError id="name-error" message={errors.name} />}
        </div>
      )}

      {!isSignup && (
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[color:var(--foreground)]">
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
            className="mt-2 w-full rounded-xl border border-[rgba(var(--leaf-rgb),0.18)] bg-white px-4 py-2.5 text-sm text-[color:var(--foreground)] shadow-sm placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/35"
            placeholder="you@bidagri.com"
          />
          {touched.email && <InlineError id="email-error" message={errors.email} />}
        </div>
      )}

      {isSignup && (
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[color:var(--foreground)]">
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
            className="mt-2 w-full rounded-xl border border-[rgba(var(--leaf-rgb),0.18)] bg-white px-4 py-2.5 text-sm text-[color:var(--foreground)] shadow-sm placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/35"
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

      {isSignup ? (
        <p className="rounded-xl bg-[rgba(var(--leaf-rgb),0.08)] px-4 py-3 text-center text-sm text-[color:var(--foreground)]/85">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/auth/forgot-password"
            className="text-sm font-semibold text-[color:var(--leaf)] transition-colors hover:text-[color:var(--secondary)]"
          >
            Forgot password?
          </a>
          <p className="text-sm text-[color:var(--muted)]">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.28)] transition-colors duration-200 hover:bg-[color:var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--secondary)] focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Please wait…" : isSignup ? "Create Account" : "Sign In"}
      </button>

      <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-[color:var(--muted)]">
        <span aria-hidden className="h-px flex-1 bg-[rgba(var(--leaf-rgb),0.2)]" />
        <span>Or continue with</span>
        <span aria-hidden className="h-px flex-1 bg-[rgba(var(--leaf-rgb),0.2)]" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[rgba(var(--leaf-rgb),0.25)] bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition-colors duration-200 hover:border-[color:var(--leaf)] hover:text-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--secondary)] focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          className="h-4 w-4"
          viewBox="0 0 24 24"
        >
          <path
            fill="#EA4335"
            d="M12 10.14v3.72h5.26c-.22 1.2-.89 2.21-1.9 2.89l3.07 2.38c1.79-1.65 2.83-4.08 2.83-6.95 0-.67-.06-1.31-.18-1.94H12z"
          />
          <path
            fill="#34A853"
            d="M6.56 14.56l-.86.66-2.45 1.9C4.68 19.97 8.08 22 12 22c2.7 0 4.96-.9 6.61-2.41l-3.07-2.38c-.83.56-1.89.9-3.54.9-2.72 0-5.03-1.83-5.85-4.35z"
          />
          <path
            fill="#4A90E2"
            d="M3.25 7.56A9.95 9.95 0 0 0 2 12c0 1.62.39 3.15 1.07 4.5l3.49-2.72c-.21-.63-.33-1.31-.33-2.01s.12-1.38.33-2.01z"
          />
          <path
            fill="#FBBC05"
            d="M12 4.75c1.47 0 2.47.64 3.05 1.17l2.23-2.18C16.95 2.42 14.7 1.5 12 1.5 8.08 1.5 4.68 3.53 3.25 7.56l3.49 2.72C7.97 7.76 9.28 4.75 12 4.75z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-[color:var(--muted)]">
        <span aria-hidden>🔐</span>
        <span>Encrypted transport keeps your data safe.</span>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, FileCheck, Leaf, Loader2, MapPin, Phone, User, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import FileUploader from "./FileUploader";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const steps = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "produce", label: "Produce", icon: "🌾" },
  { key: "documents", label: "Documents", icon: "📷" },
  { key: "review", label: "Submit & Review", icon: "✅" },
];

const initialData = {
  profile: { fullName: "", phone: "", email: "", province: "", city: "" },
  produce: {
    mainCrops: "",
    estimatedVolume: "",
    unit: "kg",
    harvestSeason: "",
    note: "",
    producePhotos: [],
    listingPreference: "In Bidding",
  },
  documents: { idDoc: null, farmProof: null },
};

export default function FarmerOnboardingWizard() {
  const [active, setActive] = useState(0);
  // Initialize with static data to match SSR markup, then hydrate from localStorage after mount.
  const [data, setData] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [authStatus, setAuthStatus] = useState("loading");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthStatus(user ? "authenticated" : "unauthenticated");
    });
    return () => unsubscribe();
  }, []);

  // Hydrate client-only draft after mount to avoid hydration mismatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("farmer_onboarding_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic shape guard to avoid corrupt drafts
        if (parsed && typeof parsed === "object" && parsed.profile && parsed.produce && parsed.documents) {
          const normalized = {
            profile: { ...initialData.profile, ...parsed.profile },
            produce: { ...initialData.produce, ...parsed.produce },
            documents: { ...initialData.documents, ...parsed.documents },
          };
          if (!Array.isArray(normalized.produce.producePhotos)) {
            normalized.produce.producePhotos = [];
          }
          if (!normalized.produce.listingPreference) {
            normalized.produce.listingPreference = "In Bidding";
          }
          setData(normalized);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("farmer_onboarding_draft", JSON.stringify(data));
  }, [data]);

  const next = () => setActive((i) => Math.min(i + 1, steps.length - 1));
  const prev = () => setActive((i) => Math.max(i - 1, 0));
  const goto = (i) => setActive(i);

  const profileValid = useMemo(() => {
    const p = data.profile;
    const emailOk = /.+@.+\..+/.test(p.email.trim());
    return (
      p.fullName.trim().length >= 2 &&
      p.phone.trim().length >= 7 &&
      emailOk &&
      p.province.trim().length >= 2 &&
      p.city.trim().length >= 2
    );
  }, [data.profile]);

  const produceValid = useMemo(() => {
    const pr = data.produce;
    return (
      pr.mainCrops.trim().length >= 2 &&
      pr.estimatedVolume.trim().length > 0 &&
      pr.unit.trim().length > 0 &&
      ["Spring", "Summer", "Autumn", "Winter"].includes(pr.harvestSeason) &&
      Array.isArray(pr.producePhotos) &&
      pr.producePhotos.length > 0
    );
  }, [data.produce]);

  const documentsValid = useMemo(() => {
    const d = data.documents;
    return !!d.idDoc && !!d.farmProof;
  }, [data.documents]);

  const canNext = useMemo(() => {
    if (active === 0) return profileValid;
    if (active === 1) return produceValid;
    if (active === 2) return documentsValid;
    return true;
  }, [active, profileValid, produceValid, documentsValid]);

  const progress = Math.round((active / (steps.length - 1)) * 100);
  const unlockedIndex = useMemo(() => {
    if (!profileValid) return 0;
    if (!produceValid) return 1;
    if (!documentsValid) return 2;
    return 3;
  }, [profileValid, produceValid, documentsValid]);

  const fileMeta = (fileLike) =>
    fileLike
      ? {
          name: fileLike.name || "",
          size: Number(fileLike.size) || null,
          type: fileLike.type || "",
        }
      : null;

  const submit = async () => {
    if (!currentUser) {
      setSubmitError("Please sign in before submitting your listing.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        source: "onboarding_wizard",
        profile: data.profile,
        produce: data.produce,
        documents: {
          idDoc: fileMeta(data.documents.idDoc),
          farmProof: fileMeta(data.documents.farmProof),
        },
      };

      const token = await currentUser.getIdToken().catch(() => null);
      const emailHeader = currentUser.email?.toLowerCase() ?? "";
      const uidHeader = currentUser.uid ?? "";

      const response = await fetch("/api/farmers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(emailHeader ? { "X-User-Email": emailHeader } : {}),
          ...(uidHeader ? { "X-User-Uid": uidHeader } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        const message = detail?.message || "Unable to submit farmer onboarding. Please try again.";
        throw new Error(message);
      }

      setSubmitted(true);
      localStorage.removeItem("farmer_onboarding_draft");
      localStorage.setItem(
        "farmer_onboarding_status",
        JSON.stringify({ status: "pending_review", submittedAt: Date.now() })
      );
    } catch (error) {
      setSubmitError(error?.message || "Something went wrong. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
    <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-[color:var(--accent)]">
        <div className="mb-4 flex items-center gap-3">
          <FileCheck className="h-6 w-6 text-[color:var(--leaf)]" />
          <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Pending Review</h2>
        </div>
        <p className="text-[color:var(--foreground)]/90">
          Your registration has been submitted successfully. Our team will verify your documents and contact you within 2–3 working days.
        </p>

      <div className="mt-6">
        <ol className="relative border-l border-[color:var(--surface-2)] pl-6 space-y-4">
          <li className="group">
            <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-[color:var(--primary)] ring-2 ring-white" />
            <div className="text-sm font-medium text-[color:var(--foreground)]">Submitted</div>
            <div className="text-xs text-[color:var(--muted)]">We received your details and documents.</div>
          </li>
          <li className="group">
            <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-[color:var(--secondary)] ring-2 ring-white" />
            <div className="text-sm font-medium text-[color:var(--foreground)]">Verification in Progress</div>
            <div className="text-xs text-[color:var(--muted)]">Our team is reviewing your information.</div>
          </li>
          <li className="group">
            <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-[color:var(--secondary)]/90 ring-2 ring-white" />
            <div className="text-sm font-medium text-[color:var(--primary)]">Approval & Activation</div>
            <div className="text-xs text-[color:var(--muted)]">We’ll notify you once your account is active.</div>
          </li>
        </ol>
      </div>

        <div className="mt-6 text-xs">
          <a href="#" className="text-[color:var(--leaf)] hover:underline">Need help?</a>
        </div>
      </div>
    );
  }

  if (authStatus === "loading") {
    return (
      <div className="rounded-2xl bg-[color:var(--surface)] p-6 shadow-md ring-1 ring-[color:var(--accent)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[color:var(--leaf)]" />
        <p className="text-sm text-[color:var(--muted)]">Checking your account…</p>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="rounded-2xl bg-[color:var(--surface)] p-6 shadow-md ring-1 ring-[color:var(--accent)] text-center">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Sign in to continue</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Please sign in to your farmer account before submitting a new listing.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--leaf)] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[rgba(var(--leaf-rgb),0.25)] transition hover:-translate-y-0.5"
          >
            Go to login
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--leaf)] px-5 py-2 text-sm font-semibold text-[color:var(--leaf)] shadow-sm transition hover:bg-[color:var(--leaf)] hover:text-white"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[color:var(--surface)] p-4 sm:p-6 shadow-md ring-1 ring-[color:var(--accent)]">
      <ProgressHeader active={active} onGoto={(i) => i <= unlockedIndex && goto(i)} unlocked={unlockedIndex} />

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {active === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <ProfileStep data={data.profile} onChange={(p) => setData((d) => ({ ...d, profile: p }))} />
            </motion.div>
          )}
          {active === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <ProduceStep data={data.produce} onChange={(p) => setData((d) => ({ ...d, produce: p }))} />
            </motion.div>
          )}
          {active === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <DocumentsStep data={data.documents} onChange={(p) => setData((d) => ({ ...d, documents: p }))} />
            </motion.div>
          )}
          {active === 3 && (
            <motion.div key="step-3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <ReviewStep data={data} progress={progress} onEditStep={setActive} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {submitError && (
        <div
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={active === 0}
          className="rounded-full px-4 py-2 text-sm text-dark ring-1 ring-accent/60 transition-colors duration-200 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        {active < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-[color:var(--muted)]">Auto-saving draft… Your progress is saved in your browser.</div>
      <div className="mt-4 text-xs">
        <a href="#" className="text-[color:var(--leaf)] hover:underline">Need help?</a>
      </div>
    </div>
  );
}

function ProgressHeader({ active, onGoto, unlocked }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <ol className="flex items-center justify-between text-[color:var(--primary)]">
          {steps.map((s, i) => (
            <li key={s.key} className="relative flex-1">
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute left-1/2 top-1/2 -translate-y-1/2 h-0.5 w-full ${
                    i < active ? "bg-[color:var(--secondary)]" : "bg-[color:var(--accent)]/50"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => onGoto?.(i)}
                disabled={i > unlocked}
                aria-current={i === active ? "step" : undefined}
                className={`relative z-10 mx-auto flex items-center gap-2 rounded-full px-3 py-1 text-sm sm:text-base font-semibold transition-colors duration-[250ms] ease-in-out focus:outline-none focus:ring-2 focus:ring-[color:var(--secondary)] ${
                  i === active
                    ? "text-[color:var(--primary)]"
                    : i <= unlocked
                    ? "text-[color:var(--foreground)] hover:text-[color:var(--primary)]"
                    : "text-[color:var(--muted)]"
                }`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] ring-2 transition-colors duration-[250ms] ease-in-out ${
                    i < active
                      ? "bg-[color:var(--secondary)] text-white ring-[color:var(--secondary)]"
                      : i === active
                      ? "bg-[color:var(--primary)] text-white ring-[color:var(--primary)]"
                      : "bg-white text-[color:var(--primary)] ring-[color:var(--accent)]"
                  }`}
                >
                  {i < active ? "✔" : i + 1}
                </span>
                <span className="font-semibold">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-3 sm:mt-0 sm:ml-4 text-xs text-[color:var(--muted)]">Step {active + 1} of {steps.length}</div>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, icon: Icon, placeholder, required }) {
  const filled = String(value || "").length > 0;
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-2 text-xs sm:text-sm font-semibold text-[color:var(--secondary)]">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <div className={`flex items-center gap-2 rounded-lg ring-1 ring-[color:var(--accent)] transition-colors duration-[250ms] ease-in-out focus-within:ring-2 focus-within:ring-[color:var(--secondary)] bg-white`}>
        {Icon && <Icon className="ml-2 h-4 w-4 text-[color:var(--primary)]" />}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-[250ms] ease-in-out placeholder:text-[color:var(--muted)] bg-white text-[color:var(--primary)]`}
        />
      </div>
    </div>
  );
}

function ProfileStep({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Full Name" name="fullName" value={data.fullName} onChange={(v) => set("fullName", v)} icon={User} placeholder="e.g., Ali Raza" required />
      <Field label="Contact Number" name="phone" type="tel" value={data.phone} onChange={(v) => set("phone", v)} icon={Phone} placeholder="e.g., 0300-1234567" required />
      <Field label="Email" name="email" type="email" value={data.email} onChange={(v) => set("email", v)} icon={User} placeholder="e.g., ali@example.com" required />
      <Field label="Province" name="province" value={data.province} onChange={(v) => set("province", v)} icon={MapPin} placeholder="e.g., Punjab" required />
      <Field label="City" name="city" value={data.city} onChange={(v) => set("city", v)} icon={MapPin} placeholder="e.g., Lahore" required />
      <p className="sm:col-span-2 text-xs text-[color:var(--muted)]">We use this info to verify your profile and help buyers reach you.</p>
    </div>
  );
}

function ProduceStep({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div className="grid grid-cols-1 gap-4">
      <Field label="Main Crops" name="mainCrops" value={data.mainCrops} onChange={(v) => set("mainCrops", v)} icon={Leaf} placeholder="e.g., Wheat, Rice, Cotton" required />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Estimated Volume" name="estimatedVolume" value={data.estimatedVolume} onChange={(v) => set("estimatedVolume", v)} icon={Leaf} placeholder="e.g., 1000" required />
        <div className="flex flex-col">
          <label htmlFor="unit" className="mb-1 text-xs font-semibold text-[color:var(--secondary)]">Unit</label>
          <select
            id="unit"
            name="unit"
            value={data.unit}
            onChange={(e) => set("unit", e.target.value)}
            className={`w-full rounded-lg px-3 py-2 text-sm outline-none ring-1 ring-[color:var(--accent)] transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] bg-white text-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--secondary)]`}
          >
            <option value="kg">kg</option>
            <option value="ton">ton</option>
            <option value="crates">crates</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="harvestSeason" className="mb-1 text-xs font-semibold text-[color:var(--secondary)]">Harvest Season</label>
          <select
            id="harvestSeason"
            name="harvestSeason"
            value={data.harvestSeason}
            onChange={(e) => set("harvestSeason", e.target.value)}
            className={`w-full rounded-lg px-3 py-2 text-sm outline-none ring-1 ring-[color:var(--accent)] transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] bg-white text-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--secondary)]`}
            required
          >
            <option value="">Select season</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Autumn">Autumn</option>
            <option value="Winter">Winter</option>
          </select>
        </div>
      </div>
          <Field label="Optional Message" name="note" value={data.note} onChange={(v) => set("note", v)} icon={MessageSquare} placeholder="Anything buyers should know (optional)" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col">
          <span className="mb-1 text-xs font-semibold text-[color:var(--secondary)]">
            Listing preference
          </span>
          <div className="flex items-center gap-3 rounded-xl border border-[rgba(var(--leaf-rgb),0.25)] bg-white px-3 py-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[color:var(--primary)]">
              <input
                type="radio"
                name="listingPreference"
                value="Available"
                checked={data.listingPreference === "Available"}
                onChange={(e) => set("listingPreference", e.target.value)}
              />
              Available (fixed offer)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-[color:var(--primary)]">
              <input
                type="radio"
                name="listingPreference"
                value="In Bidding"
                checked={data.listingPreference === "In Bidding"}
                onChange={(e) => set("listingPreference", e.target.value)}
              />
              In bidding (auction)
            </label>
          </div>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Choose how buyers should engage with this lot once it goes live.
          </p>
        </div>
        <div />
      </div>
      <div className="grid gap-3">
        <FileUploader
          label="Produce photos"
          name="producePhotos"
          value={data.producePhotos}
          onChange={(files) => set("producePhotos", Array.isArray(files) ? files : files ? [files] : [])}
          multiple
          accept={["image/jpeg", "image/png", "image/webp"]}
          hint="Upload at least one clear photo (JPG/PNG/WebP, max 5MB each)"
        />
        <p className="text-xs text-[color:var(--muted)]">
          Share rough estimates and add crop photos to help buyers trust your listing.
        </p>
      </div>
    </div>
  );
}

function DocumentsStep({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div className="grid grid-cols-1 gap-4">
      <FileUploader
        label="Government ID"
        name="idDoc"
        value={data.idDoc}
        onChange={(f) => set("idDoc", f)}
        multiple={false}
        hint="Upload CNIC front/back or PDF (max 5MB)"
      />
      <FileUploader
        label="Farm Proof"
        name="farmProof"
        value={data.farmProof}
        onChange={(f) => set("farmProof", f)}
        multiple={false}
        hint="Utility bill, land record, or farm images (max 5MB)"
      />
      <p className="text-xs text-[color:var(--muted)]">We only store documents securely. For now, files stay in your browser.</p>
    </div>
  );
}

function ReviewStep({ data, progress, onEditStep }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold text-[color:var(--primary)] pb-1 border-b-2 border-[color:var(--accent)]">
        Submit & Review
      </h2>

      <div className="flex items-center gap-2">
        <div className="h-2 w-full rounded-full bg-[color:var(--surface-2)]">
          <div className="h-2 rounded-full bg-[color:var(--leaf)]" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-[color:var(--muted)]">{progress}%</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard title="Profile" items={[
          ["Full Name", data.profile.fullName],
          ["Contact", data.profile.phone],
          ["Email", data.profile.email],
          ["Province", data.profile.province],
          ["City", data.profile.city],
        ]} onEdit={() => onEditStep(0)} />
        <SummaryCard title="Produce" items={[
          ["Main Crops", data.produce.mainCrops],
          ["Estimated Volume", `${data.produce.estimatedVolume} ${data.produce.unit}`],
          ["Harvest Season", data.produce.harvestSeason],
          ["Message", data.produce.note || "—"],
        ]} onEdit={() => onEditStep(1)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DocPreview title="ID Document" file={data.documents.idDoc} onEdit={() => onEditStep(2)} />
        <DocPreview title="Farm Proof" file={data.documents.farmProof} onEdit={() => onEditStep(2)} />
      </div>
      <GalleryPreview title="Produce photos" files={data.produce.producePhotos} onEdit={() => onEditStep(1)} />
      <p className="text-xs italic bg-[color:var(--surface-2)] text-[color:var(--foreground)]/90 p-3 rounded-md">
        Please confirm details before submitting. You can edit after submission during review.
      </p>
    </div>
  );
}

function SummaryCard({ title, items, onEdit }) {
  return (
    <div className="rounded-lg ring-1 ring-[color:var(--surface-2)] bg-[color:var(--surface)] p-3">
      <h3 className="text-lg font-semibold text-[color:var(--primary)] mb-2 pb-1 border-b-2 border-[color:var(--accent)]">{title}</h3>
      <ul className="text-sm">
        {items.map(([k, v]) => (
          <li key={k} className="mb-2 last:mb-0">
            <span className="block font-semibold text-[color:var(--primary)]">{k}</span>
            <span className="block text-[color:var(--foreground)]">{v || "—"}</span>
          </li>
        ))}
      </ul>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-3 inline-flex items-center rounded-md bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--surface)] transition-colors hover:bg-[rgba(var(--secondary-rgb),0.85)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--secondary-rgb),0.35)]"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function getFileName(file) {
  if (!file) return "";
  if (typeof file.name === "string" && file.name) return file.name;
  if (typeof file.key === "string" && file.key) {
    const parts = file.key.split("/");
    return parts[parts.length - 1];
  }
  return "";
}

function getIsImage(file, fileName) {
  if (!file) return false;
  if (typeof file.type === "string" && file.type.startsWith("image/")) return true;
  const name = fileName || getFileName(file);
  return /\.(png|jpe?g|webp|gif|bmp)$/i.test(name);
}

function usePreviewUrl(file) {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (file instanceof Blob) {
      const nextUrl = URL.createObjectURL(file);
      setObjectUrl(nextUrl);
      return () => {
        URL.revokeObjectURL(nextUrl);
        setObjectUrl(null);
      };
    }
    setObjectUrl(null);
    return undefined;
  }, [file]);

  return objectUrl || file?.previewUrl || file?.url || null;
}

function DocPreview({ title, file, onEdit }) {
  const fileName = getFileName(file);
  const previewUrl = usePreviewUrl(file);
  const isImage = getIsImage(file, fileName);
  return (
    <div className="rounded-lg ring-1 ring-[color:var(--surface-2)] bg-[color:var(--surface)] p-3">
      <h3 className="text-lg font-semibold text-[color:var(--primary)] mb-2 pb-1 border-b-2 border-[color:var(--accent)]">{title}</h3>
      <div className="aspect-video rounded-md bg-[color:var(--surface-2)] flex items-center justify-center overflow-hidden">
        {file ? (
          isImage ? (
            previewUrl ? (
              <img src={previewUrl} alt={fileName || "Document preview"} className="h-full w-full object-cover" />
            ) : (
              <div className="text-xs text-[color:var(--muted)]">Preview unavailable</div>
            )
          ) : (
            <div className="text-xs text-[color:var(--foreground)]/80 break-all px-3">{fileName || "Document ready"}</div>
          )
        ) : (
          <div className="text-xs text-[color:var(--muted)]">No file</div>
        )}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-3 inline-flex items-center rounded-md bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--surface)] transition-colors hover:bg-[rgba(var(--secondary-rgb),0.85)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--secondary-rgb),0.35)]"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function GalleryPreview({ title, files, onEdit }) {
  const items = Array.isArray(files) ? files : [];
  return (
    <div className="rounded-lg ring-1 ring-[color:var(--surface-2)] bg-[color:var(--surface)] p-3">
      <h3 className="text-lg font-semibold text-[color:var(--primary)] mb-2 pb-1 border-b-2 border-[color:var(--accent)]">{title}</h3>
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((file, index) => (
            <GalleryTile key={file?.key || file?.url || index} file={file} index={index} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-[color:var(--muted)]">No photos added yet.</p>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-3 inline-flex items-center rounded-md bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--surface)] transition-colors hover:bg-[rgba(var(--secondary-rgb),0.85)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--secondary-rgb),0.35)]"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function GalleryTile({ file, index }) {
  const previewUrl = usePreviewUrl(file);
  const fileName = getFileName(file);
  if (previewUrl) {
    return <img src={previewUrl} alt={fileName || `Produce photo ${index + 1}`} className="h-32 w-full rounded-lg object-cover shadow-sm" />;
  }
  return (
    <div className="flex h-32 items-center justify-center rounded-lg bg-[color:var(--surface-2)] text-xs text-[color:var(--muted)] shadow-sm">
      {fileName || `Photo ${index + 1}`}
    </div>
  );
}

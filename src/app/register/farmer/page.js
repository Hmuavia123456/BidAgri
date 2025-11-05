"use client";

import FarmerOnboardingWizard from "@/components/FarmerOnboardingWizard";

export default function FarmerRegisterPage() {
  return (
    <main className="min-h-screen bg-[color:var(--background)]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--primary)]">Farmer Onboarding</h1>
          <p className="mt-1 text-sm sm:text-base text-[color:var(--muted)]">
            Takes only 2 minutes to complete.
          </p>
        </header>
        <FarmerOnboardingWizard />
      </div>
    </main>
  );
}

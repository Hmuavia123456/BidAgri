"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import { Wallet, Smartphone, CreditCard, Landmark } from "lucide-react";

const methods = [
  {
    id: "jazzcash",
    name: "JazzCash",
    description: "Pay via JazzCash wallet or QR.",
    Icon: Wallet,
  },
  {
    id: "easypaisa",
    name: "Easypaisa",
    description: "Easypaisa wallet & mobile account.",
    Icon: Smartphone,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, UnionPay (mock).",
    Icon: CreditCard,
  },
  {
    id: "netbanking",
    name: "NetBanking",
    description: "Pay via participating banks (mock).",
    Icon: Landmark,
  },
];

export default function PaymentMethods({ onSelect, selected, disabled = false, onValidityChange }) {
  const groupId = useId();
  const [expanded, setExpanded] = useState(selected || "jazzcash");
  // Local inputs state for basic validation
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [wallet, setWallet] = useState({ jazzcash: "", easypaisa: "" });
  const [bank, setBank] = useState("");

  // Basic, UI-only validation rules (mock)
  const isValid = useMemo(() => {
    if (selected === "card") {
      return (
        /\d{12,19}/.test(card.number.replace(/\s+/g, "")) &&
        /^(0[1-9]|1[0-2])\/(\d{2})$/.test(card.exp.trim()) &&
        /^\d{3,4}$/.test(card.cvc.trim())
      );
    }
    if (selected === "jazzcash") {
      return /^(03|3)\d{9}$/.test(wallet.jazzcash.replace(/\D/g, ""));
    }
    if (selected === "easypaisa") {
      return /^(03|3)\d{9}$/.test(wallet.easypaisa.replace(/\D/g, ""));
    }
    if (selected === "netbanking") {
      return bank.length > 0;
    }
    return false;
  }, [selected, card, wallet, bank]);

  useEffect(() => {
    onValidityChange?.(!!isValid);
  }, [isValid, onValidityChange]);

  return (
    <fieldset aria-labelledby={`${groupId}-legend`} className="space-y-4">
      <legend id={`${groupId}-legend`} className="text-base font-semibold text-[color:var(--primary)]">
        Payment Method
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {methods.map((m) => {
          const isSelected = selected === m.id;
          const Icon = m.Icon;
          return (
            <label
              key={m.id}
              className={`relative group flex cursor-pointer items-start gap-4 rounded-2xl border p-4 shadow-sm transition ${
                isSelected
                  ? "border-[color:var(--leaf)] bg-[color:var(--surface-2)] ring-2 ring-[color:var(--leaf)]/60"
                  : "border-[color:var(--surface-2)] bg-[color:var(--surface)] hover:border-[color:var(--leaf)]/50 hover:shadow-md"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name={`${groupId}-method`}
                value={m.id}
                checked={isSelected}
                onChange={() => {
                  onSelect?.(m.id);
                  setExpanded(m.id);
                }}
                disabled={disabled}
                className="sr-only"
                aria-describedby={`${m.id}-desc`}
              />
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${isSelected ? "bg-[color:var(--surface-2)] text-[color:var(--leaf)]" : "bg-[color:var(--surface-2)] text-[color:var(--foreground)]"}`} aria-hidden>
                <Icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[color:var(--foreground)]">{m.name}</p>
                  {isSelected && (
                    <span className="text-xs font-medium text-[color:var(--leaf)]">Selected</span>
                  )}
                </div>
                <p id={`${m.id}-desc`} className="text-sm text-[color:var(--muted)]">
                  {m.description}
                </p>

                <div
                  className={`mt-3 space-y-3 text-sm overflow-hidden transition-all duration-300 ${
                    expanded === m.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                  aria-live="polite"
                  aria-hidden={expanded === m.id ? "false" : "true"}
                >
                  {m.id === "card" && (
                    <MockCardForm
                      disabled={disabled}
                      value={card}
                      onChange={setCard}
                    />
                  )}
                  {m.id === "jazzcash" && (
                    <MockWalletInput
                      provider="JazzCash"
                      placeholder="03XXXXXXXXX"
                      value={wallet.jazzcash}
                      onChange={(v) => setWallet((w) => ({ ...w, jazzcash: v }))}
                      disabled={disabled}
                      hint="Enter your JazzCash mobile number or scan QR code."
                    />
                  )}
                  {m.id === "easypaisa" && (
                    <MockWalletInput
                      provider="Easypaisa"
                      placeholder="03XXXXXXXXX"
                      value={wallet.easypaisa}
                      onChange={(v) => setWallet((w) => ({ ...w, easypaisa: v }))}
                      disabled={disabled}
                      hint="Enter your Easypaisa number or open your Easypaisa app to confirm payment."
                    />
                  )}
                  {m.id === "netbanking" && (
                    <MockNetbankingSelect
                      disabled={disabled}
                      value={bank}
                      onChange={setBank}
                    />
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-[color:var(--muted)]">
        Your payment is secured with SSL. Card details are tokenized and never stored on our servers.
      </p>
    </fieldset>
  );
}

function MockCardForm({ disabled, value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Card details (mock)">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-[color:var(--primary)]">Card Number</label>
        <input
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={value.number}
          onChange={(e) => onChange?.({ ...value, number: e.target.value })}
          className="mt-1 w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-3 py-2 text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[color:var(--primary)]">Expiry</label>
        <input
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          value={value.exp}
          onChange={(e) => onChange?.({ ...value, exp: e.target.value })}
          className="mt-1 w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-3 py-2 text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[color:var(--primary)]">CVC</label>
        <input
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="CVC"
          value={value.cvc}
          onChange={(e) => onChange?.({ ...value, cvc: e.target.value })}
          className="mt-1 w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-3 py-2 text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
          disabled={disabled}
        />
      </div>
      <p className="sm:col-span-2 text-xs text-[color:var(--muted)]">
        This is a mock input. No real card data is processed.
      </p>
    </div>
  );
}

function MockWalletInput({ provider, placeholder, value, onChange, disabled, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[color:var(--primary)]">{provider} Mobile Number</label>
      <input
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-3 py-2 text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
        disabled={disabled}
      />
      <p className="mt-1 text-xs text-[color:var(--leaf)] rounded-lg bg-[color:var(--surface-2)] p-2">{hint}</p>
    </div>
  );
}

function MockNetbankingSelect({ disabled, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[color:var(--primary)]">Select Bank</label>
      <select
        className="mt-1 w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-3 py-2 text-[color:var(--foreground)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="" disabled>
          Choose your bank
        </option>
        <option value="HBL">HBL</option>
        <option value="UBL">UBL</option>
        <option value="MCB">MCB</option>
        <option value="Alfalah">Alfalah</option>
      </select>
      <p className="mt-1 text-xs text-[color:var(--muted)]">Mock netbanking selection.</p>
    </div>
  );
}

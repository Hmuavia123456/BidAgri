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
    <fieldset aria-labelledby={`${groupId}-legend`} className="space-y-5">
      <legend id={`${groupId}-legend`} className="text-xl font-semibold text-[#0f172a]">
        Payment Method
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {methods.map((m) => {
          const isSelected = selected === m.id;
          const Icon = m.Icon;
          return (
            <label
              key={m.id}
              className={`relative flex cursor-pointer items-start gap-4 rounded-3xl border bg-white/95 p-5 shadow-sm transition-all duration-300 ${
                isSelected
                  ? "border-[color:var(--leaf)]/70 shadow-[0_24px_40px_rgba(0,179,134,0.15)] ring-2 ring-[color:var(--leaf)]/40"
                  : "border-[rgba(15,23,42,0.08)] hover:border-[rgba(15,23,42,0.16)] hover:shadow-[0_18px_32px_rgba(15,23,42,0.08)]"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
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
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(241,245,249,0.8)] text-[#0f172a] transition-colors ${
                  isSelected ? "text-[color:var(--leaf)]" : ""
                }`}
                aria-hidden
              >
                <Icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-[#0f172a]">{m.name}</p>
                  {isSelected && (
                    <span className="rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--leaf)]">
                      Selected
                    </span>
                  )}
                </div>
                <p id={`${m.id}-desc`} className="text-sm text-slate-500">
                  {m.description}
                </p>

                <div
                  className={`mt-4 space-y-3 overflow-hidden rounded-2xl bg-[rgba(241,245,249,0.7)] p-4 text-sm text-[#0f172a] transition-all duration-300 ${
                    expanded === m.id ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
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
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Card Number</label>
        <input
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={value.number}
          onChange={(e) => onChange?.({ ...value, number: e.target.value })}
          className="mt-2 w-full rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0f172a] placeholder:text-slate-400 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Expiry</label>
        <input
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          value={value.exp}
          onChange={(e) => onChange?.({ ...value, exp: e.target.value })}
          className="mt-2 w-full rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0f172a] placeholder:text-slate-400 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">CVC</label>
        <input
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="CVC"
          value={value.cvc}
          onChange={(e) => onChange?.({ ...value, cvc: e.target.value })}
          className="mt-2 w-full rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0f172a] placeholder:text-slate-400 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
          disabled={disabled}
        />
      </div>
      <p className="sm:col-span-2 text-xs text-slate-500">
        This is a mock input. No real card data is processed.
      </p>
    </div>
  );
}

function MockWalletInput({ provider, placeholder, value, onChange, disabled, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {provider} Mobile Number
      </label>
      <input
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 w-full rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0f172a] placeholder:text-slate-400 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
        disabled={disabled}
      />
      <p className="mt-2 rounded-xl bg-[rgba(241,245,249,0.8)] p-3 text-xs font-medium text-slate-500">{hint}</p>
    </div>
  );
}

function MockNetbankingSelect({ disabled, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Select Bank</label>
      <select
        className="mt-2 w-full rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-3.5 py-2.5 text-sm font-medium text-[#0f172a] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
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
      <p className="mt-2 text-xs text-slate-500">Mock netbanking selection.</p>
    </div>
  );
}

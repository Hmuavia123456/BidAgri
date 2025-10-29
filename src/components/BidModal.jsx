"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import AuctionTimer from "@/components/AuctionTimer";
import PriceStepper from "@/components/PriceStepper";
import { auth } from "@/lib/firebase";

const STORAGE_KEYS = {
  bidderName: "agribids:bidderName",
  phone: "agribids:phone",
};

async function fetchBids(productId, limit = 10) {
  const params = new URLSearchParams({ productId, limit: String(limit) });
  const response = await fetch(`/api/bids?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.message || "Unable to load bids.");
  }
  const json = await response.json();
  return Array.isArray(json?.items) ? json.items : [];
}

async function submitBid(token, payload) {
  const response = await fetch("/api/bids", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.message || "Unable to place bid.");
  }
  const json = await response.json();
  return json?.bid || null;
}

export default function BidModal({ open, onClose, item }) {
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const [bidderName, setBidderName] = useState("");
  const [phone, setPhone] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("Pickup");
  const [notes, setNotes] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loadingBids, setLoadingBids] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [highestBid, setHighestBid] = useState(0);
  const bidsRef = useRef([]);
  const hydratedRef = useRef(false);
  const [closed, setClosed] = useState(false);
  const endTimeRef = useRef(null);
  const step = 10;

  const resetForm = useCallback(
    (preserveContact = true) => {
      setPricePerKg("");
      setQuantity("");
      setDeliveryOption("Pickup");
      setNotes("");
      setSubmitted(false);
      setAnnouncement("");
      if (!preserveContact) {
        setBidderName("");
        setPhone("");
      }
    },
    []
  );

  const closeAndReset = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    endTimeRef.current = Date.now() + 5 * 60 * 1000;
    setClosed(false);
  }, [open]);

  const loadExistingBids = useCallback(async () => {
    if (!item) return;
    try {
      setLoadingBids(true);
      setError("");
      const bids = await fetchBids(item.id);
      bidsRef.current = bids;
      const topBid = bids[0];
      const derivedHighest = Number(topBid?.bidPerKg || item.highestBid || item.pricePerKg || 0);
      setHighestBid(derivedHighest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load bids.");
    } finally {
      setLoadingBids(false);
    }
  }, [item]);

  useEffect(() => {
    if (!open) return;
    loadExistingBids();
  }, [open, loadExistingBids]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedName = window.localStorage.getItem(STORAGE_KEYS.bidderName);
    const storedPhone = window.localStorage.getItem(STORAGE_KEYS.phone);
    if (storedName) setBidderName(storedName);
    if (storedPhone) setPhone(storedPhone);
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    const storedName = window.localStorage.getItem(STORAGE_KEYS.bidderName);
    const storedPhone = window.localStorage.getItem(STORAGE_KEYS.phone);
    if (storedName) setBidderName(storedName);
    if (storedPhone) setPhone(storedPhone);
  }, [open]);

  useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      const timer = window.setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(timer);
    }
    document.body.style.overflow = "";
    if (lastFocusedRef.current instanceof HTMLElement) {
      lastFocusedRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndReset();
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          '[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeAndReset]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    window.localStorage.setItem(STORAGE_KEYS.bidderName, bidderName);
  }, [bidderName]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    window.localStorage.setItem(STORAGE_KEYS.phone, phone);
  }, [phone]);

  const highlightedMinBid = useMemo(() => {
    const base = Number(highestBid || item?.highestBid || item?.pricePerKg || 0);
    if (!base && !item) return step;
    return base > 0 ? base + step : (item?.pricePerKg || 0) + step;
  }, [highestBid, item, step]);

  if (!open || !item) {
    return null;
  }

  const bidPerKgNumber = Number(pricePerKg);
  const quantityNumber = Number(quantity);
  const itemTotal = bidPerKgNumber > 0 && quantityNumber > 0 ? bidPerKgNumber * quantityNumber : 0;
  const deliveryCost =
    deliveryOption === "Delivery" && quantityNumber > 0
      ? 1500 + Math.ceil(quantityNumber / 100) * 500
      : 0;
  const total = itemTotal + deliveryCost;

  const isPhoneValid = /^03\d{9}$/.test(phone);
  const isPriceValid = pricePerKg !== "" && bidPerKgNumber >= highlightedMinBid;
  const isQuantityValid = quantity !== "" && quantityNumber >= 1;
  const isNameValid = bidderName.trim().length > 0;

  const formIsValid = isNameValid && isPhoneValid && isPriceValid && isQuantityValid;

  const titleId = `bid-modal-title-${item.id}`;
  const subTitleId = `bid-modal-subtitle-${item.id}`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setAnnouncement("Please sign in to place a bid.");
      return;
    }
    if (closed) {
      setAnnouncement("Auction closed. Bidding is disabled.");
      return;
    }
    if (!formIsValid) {
      setAnnouncement("Bid not submitted. Please fix the errors.");
      return;
    }
    try {
      setAnnouncement("Submitting bid…");
      const token = await user.getIdToken();
      const payload = {
        productId: item.id,
        pricePerKg: bidPerKgNumber,
        quantity: quantityNumber,
        deliveryOption,
        notes,
        bidderName,
        phone,
      };
      const newBid = await submitBid(token, payload);
      if (newBid) {
        bidsRef.current = [newBid, ...bidsRef.current];
        setHighestBid(Number(newBid.bidPerKg || bidPerKgNumber));
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("bid:placed", {
              detail: { productId: item.id },
            })
          );
        }
      }
      setSubmitted(true);
      setAnnouncement("Bid submitted successfully. You are the provisional highest bidder.");
      setPricePerKg("");
      setQuantity("");
      setNotes("");
      await loadExistingBids();
    } catch (err) {
      setAnnouncement(err instanceof Error ? err.message : "Bid failed. Try again.");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-[rgba(var(--primary-rgb),0.5)] backdrop-blur-sm"
        onClick={closeAndReset}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[70] grid place-items-center px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subTitleId}
      >
        <div
          ref={dialogRef}
          className="w-full max-w-md bg-[color:var(--surface)] rounded-2xl shadow-2xl p-5 md:p-6"
        >
          <header className="relative pb-5 border-b border-[color:var(--supporting)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-xl font-semibold text-[color:var(--foreground)]">
                  Place your bid
                </h2>
                <p id={subTitleId} className="text-sm text-[color:var(--muted)]">
                  Highest bid so far: Rs {highestBid.toLocaleString()} / kg
                </p>
              </div>
              <button
                type="button"
                onClick={closeAndReset}
                className="rounded-full border border-[color:var(--supporting)]/50 px-2 py-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--muted)]">
              <span>Lot price: Rs {Number(item.pricePerKg || 0).toLocaleString()} / kg</span>
              <AuctionTimer endTime={endTimeRef.current} onExpire={() => setClosed(true)} />
            </div>
          </header>

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div className="sr-only" aria-live="assertive" role="alert">
              {announcement}
            </div>

            <label className="block text-xs font-medium text-[color:var(--muted)]">
              Bidder Name
              <input
                ref={firstFieldRef}
                type="text"
                value={bidderName}
                onChange={(event) => setBidderName(event.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-[color:var(--supporting)] focus:ring-2 focus:ring-[color:var(--leaf)] px-3 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
                required
              />
            </label>

            <label className="block text-xs font-medium text-[color:var(--muted)]">
              Phone
              <input
                type="tel"
                inputMode="numeric"
                placeholder="03XXXXXXXXX"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-[color:var(--supporting)] focus:ring-2 focus:ring-[color:var(--leaf)] px-3 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
                required
              />
              <span className="mt-1 block text-[11px] text-[color:var(--foreground)]/70">
                Format: 03XXXXXXXXX
              </span>
              {!isPhoneValid && phone.length > 0 && (
                <span className="mt-1 block text-[11px] text-rose-600">
                  Enter a valid Pakistani mobile number.
                </span>
              )}
            </label>

            <div className="block text-xs font-medium text-[color:var(--muted)]">
              <div className="flex items-center justify-between">
                <span>Bid Price per kg</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--muted)]">
                  Min bid Rs {highlightedMinBid.toLocaleString()}
                </span>
              </div>
              <div className="mt-1">
                <PriceStepper
                  value={pricePerKg}
                  onChange={setPricePerKg}
                  min={highlightedMinBid}
                  step={step}
                  currency="Rs"
                />
              </div>
              {!isPriceValid && pricePerKg !== "" && (
                <span className="mt-1 block text-[11px] text-rose-600">
                  Bid must be at least Rs {highlightedMinBid.toLocaleString()} per kg.
                </span>
              )}
            </div>

            <label className="block text-xs font-medium text-[color:var(--muted)]">
              Quantity (kg)
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-[color:var(--supporting)] focus:ring-2 focus:ring-[color:var(--leaf)] px-3 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
                required
              />
              {!isQuantityValid && quantity !== "" && (
                <span className="mt-1 block text-[11px] text-rose-600">
                  Quantity must be at least 1 kg.
                </span>
              )}
            </label>

            <label className="block text-xs font-medium text-[color:var(--muted)]">
              Delivery Option
              <select
                value={deliveryOption}
                onChange={(event) => setDeliveryOption(event.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-[color:var(--supporting)] focus:ring-2 focus:ring-[color:var(--leaf)] px-3 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)]"
              >
                <option value="Pickup">Pickup</option>
                <option value="Delivery">Delivery</option>
              </select>
            </label>

            <label className="block text-xs font-medium text-[color:var(--muted)]">
              Notes (optional)
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg ring-1 ring-[color:var(--supporting)] focus:ring-2 focus:ring-[color:var(--leaf)] px-3 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
              />
            </label>

            <div className="rounded-xl border border-[color:var(--supporting)]/30 bg-[color:var(--surface-2)]/60 px-3 py-2 text-xs text-[color:var(--muted)]">
              Total (est.): Rs {total.toLocaleString()}
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[color:var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.24)] transition-colors hover:bg-[color:var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--secondary)] focus:ring-offset-2 focus:ring-offset-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loadingBids}
            >
              Place bid
            </button>

            {announcement && (
              <p className="text-sm text-[color:var(--muted)]">{announcement}</p>
            )}

            {submitted && (
              <p className="text-xs text-[color:var(--leaf)]">
                We have received your bid. Our team will reach out if you are the highest bidder.
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AuctionTimer from "@/components/AuctionTimer";
import PriceStepper from "@/components/PriceStepper";

const STORAGE_KEYS = {
  bidderName: "agribids:bidderName",
  phone: "agribids:phone",
};

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
  const [submitted, setSubmitted] = useState(false);
  const hydratedRef = useRef(false);
  const [highestBid, setHighestBid] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [demoNote, setDemoNote] = useState("");
  const [closed, setClosed] = useState(false);
  const step = 10; // Rs increment step
  const endTimeRef = useRef(null);

  const resetForm = useCallback(
    (preserveContact = true) => {
      setPricePerKg("");
      setQuantity("");
      setDeliveryOption("Pickup");
      setNotes("");
      setSubmitted(false);
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

  const minRequiredBid = useMemo(() => {
    if (!item) return 1;
    return Math.max(highestBid + step, item.pricePerKg + step);
  }, [item, highestBid]);

  // Initialize auction end time: 5 minutes from open
  useEffect(() => {
    if (!open) return;
    endTimeRef.current = Date.now() + 5 * 60 * 1000;
    setClosed(false);
  }, [open]);

  // Initialize highest bid and simulate concurrent bids
  useEffect(() => {
    if (!open || !item) return;
    setHighestBid(item.pricePerKg);
    setDemoNote("Demo: bids are simulated client-side.");
    const tick = () => {
      // random chance to place a simulated bid
      const chance = Math.random();
      if (chance < 0.45) {
        setHighestBid((prev) => {
          const next = prev + step * (1 + Math.floor(Math.random() * 2));
          setAnnouncement(`Another buyer placed a bid at Rs ${next.toLocaleString()}.`);
          return next;
        });
      }
    };
    const id = window.setInterval(tick, 7000 + Math.random() * 5000);
    return () => window.clearInterval(id);
  }, [open, item]);

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
      return () => {
        window.clearTimeout(timer);
      };
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
    if (!open) return undefined;
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    window.localStorage.setItem(STORAGE_KEYS.bidderName, bidderName);
  }, [bidderName]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    window.localStorage.setItem(STORAGE_KEYS.phone, phone);
  }, [phone]);

  if (!open || !item) {
    return null;
  }

  const bidPerKgNumber = Number(pricePerKg);
  const quantityNumber = Number(quantity);
  const itemTotal = bidPerKgNumber > 0 && quantityNumber > 0 ? bidPerKgNumber * quantityNumber : 0;
  const deliveryCost = deliveryOption === "Delivery" && quantityNumber > 0 ? 1500 + Math.ceil(quantityNumber / 100) * 500 : 0;
  const total = itemTotal + deliveryCost;

  const isPhoneValid = /^03\d{9}$/.test(phone);
  const isPriceValid = pricePerKg !== "" && bidPerKgNumber >= minRequiredBid;
  const isQuantityValid = quantity !== "" && quantityNumber >= 1;
  const isNameValid = bidderName.trim().length > 0;

  const formIsValid = isNameValid && isPhoneValid && isPriceValid && isQuantityValid;

  const titleId = `bid-modal-title-${item.id}`;
  const subTitleId = `bid-modal-subtitle-${item.id}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (closed) {
      setAnnouncement("Auction closed. Bidding is disabled.");
      return;
    }
    if (!formIsValid) {
      setAnnouncement("Bid not submitted. Please fix the errors.");
      return;
    }
    setSubmitted(true);
    setAnnouncement("Bid submitted successfully (demo). You are the provisional highest bidder.");
    setHighestBid(bidPerKgNumber);
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
            <h2 id={titleId} className="text-lg font-semibold text-[color:var(--foreground)]">
              {`Place Bid — ${item.title}`}
            </h2>
            <p id={subTitleId} className="mt-1 text-sm text-[color:var(--muted)]">
              {`${item.category} - ${item.location}`}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <AuctionTimer
                endTime={endTimeRef.current}
                onExpire={() => setClosed(true)}
                className=""
              />
              <div className="text-xs text-[color:var(--muted)]" aria-live="polite">
                {demoNote}
              </div>
            </div>
            <button
              type="button"
              onClick={closeAndReset}
              className="absolute top-1 right-1 rounded-full p-2 text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
              aria-label="Close bid modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {!submitted ? (
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="sr-only" aria-live="assertive" role="alert">{announcement}</div>
              <div className="space-y-3">
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
                    pattern="03\\d{9}"
                    placeholder="03XXXXXXXXX"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-1 w-full rounded-lg ring-1 ring-[color:var(--supporting)] focus:ring-2 focus:ring-[color:var(--leaf)] px-3 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
                    required
                  />
                  <span className="mt-1 block text-[11px] text-[color:var(--muted)]">
                    Format: 03XXXXXXXXX
                  </span>
                  {!isPhoneValid && phone.length > 0 && (
                    <span className="mt-1 block text-[11px] text-[color:var(--accent)]">
                      Enter a valid Pakistani mobile number.
                    </span>
                  )}
                </label>

                <div className="block text-xs font-medium text-[color:var(--muted)]">
                  <div className="flex items-center justify-between">
                    <span>Bid Price per kg</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--muted)]" title="To outbid, offer at least the highest bid plus the minimum increment.">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.019.857l-.665 2.327a.75.75 0 001.02.858l.04-.02M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 4.5h.008v.008H12V16.5z" /></svg>
                      Guidance
                    </span>
                  </div>
                  <div className="mt-1">
                    <PriceStepper
                      value={pricePerKg}
                      onChange={setPricePerKg}
                      min={minRequiredBid}
                      step={step}
                      currency="Rs"
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-[color:var(--muted)]">
                    Current highest bid: Rs {highestBid.toLocaleString()} — Minimum increment: Rs {step}. Offer at least Rs {(minRequiredBid).toLocaleString()} to outbid.
                  </div>
                  {!isPriceValid && pricePerKg !== "" && (
                    <span className="mt-1 block text-[11px] text-[color:var(--accent)]">
                      Bid must be at least Rs {minRequiredBid}.
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
                    <span className="mt-1 block text-[11px] text-[color:var(--accent)]">
                      Quantity must be at least 1 kg.
                    </span>
                  )}
                </label>

                <label className="block text-xs font-medium text-[color:var(--muted)]">
                  Delivery Option
                  <select
                    value={deliveryOption}
                    onChange={(event) => setDeliveryOption(event.target.value)}
                    className="mt-1 w-full rounded-lg ring-1 ring-[color:var(--supporting)] focus:ring-2 focus:ring-[color:var(--leaf)] px-3 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
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
                    className="mt-1 w-full rounded-lg ring-1 ring-[color:var(--supporting)] focus:ring-2 focus:ring-[color:var(--leaf)] px-3 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  />
                </label>
              </div>

              <div className="mt-3 rounded-xl bg-white text-[color:var(--foreground)] border border-[color:var(--accent)]/40 p-3 text-sm">
                <div className="flex justify-between"><span>Items subtotal</span><span>Rs {itemTotal.toLocaleString() || "0"}</span></div>
                <div className="flex justify-between"><span>Estimated delivery</span><span>{deliveryOption === "Delivery" ? `Rs ${deliveryCost.toLocaleString()}` : "Rs 0"}</span></div>
                <div className="mt-1 border-t border-[color:var(--accent)]/40 pt-2 flex justify-between font-medium"><span>Estimated total</span><span>Rs {total.toLocaleString() || "0"}</span></div>
              </div>

              {closed && (
                <div className="rounded-xl bg-[color:var(--surface-2)] text-[color:var(--foreground)] border border-[color:var(--supporting)] p-3 text-sm">
                  Auction closed. You can no longer place bids. Next steps: contact the seller to discuss availability and future lots.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAndReset}
                  className="bg-[color:var(--surface-2)] text-[color:var(--foreground)] rounded-full px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formIsValid || closed}
                  className="bg-[color:var(--leaf)] text-[color:var(--surface)] rounded-full px-5 py-2.5 hover:bg-[color:var(--primary)] transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
                >
                  Submit Bid
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--leaf)] ring-1 ring-[color:var(--accent)]/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-8 w-8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-[color:var(--foreground)]">Bid submitted (demo)!</p>
                <p className="text-sm text-[color:var(--muted)]">We’ve noted your interest. This is a demo; in production, bids are processed securely with escrow protection and refundable pre-authorizations as needed.</p>
              </div>
              <dl className="space-y-2 text-sm text-[color:var(--foreground)] text-left mx-auto max-w-sm">
                <div className="flex justify-between"><dt className="font-medium">Item</dt><dd>{item.title}</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Bid / kg</dt><dd>Rs {bidPerKgNumber.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Quantity</dt><dd>{quantityNumber.toLocaleString()} kg</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Items subtotal</dt><dd>Rs {itemTotal.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Estimated delivery</dt><dd>Rs {deliveryCost.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Estimated total</dt><dd>Rs {total.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Phone</dt><dd>{phone}</dd></div>
              </dl>
              <div className="mx-auto max-w-sm text-xs text-[color:var(--muted)]">
                How bidding works: highest valid bid before timer expiry provisionally wins. Platform fees are transparent and delivery is coordinated with seller. Learn more in our help center (placeholder).
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="/products"
                  className="bg-[color:var(--surface-2)] text-[color:var(--foreground)] rounded-full px-4 py-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)] text-center"
                >
                  View Products
                </a>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    window.setTimeout(() => {
                      firstFieldRef.current?.focus();
                    }, 0);
                  }}
                  className="bg-[color:var(--leaf)] text-[color:var(--surface)] rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[color:var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
                >
                  Place another bid
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

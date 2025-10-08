"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

  const minPrice = useMemo(() => {
    if (!item) return 1;
    return Math.max(item.pricePerKg + 1, 1);
  }, [item]);

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
  const total = bidPerKgNumber > 0 && quantityNumber > 0 ? bidPerKgNumber * quantityNumber : 0;

  const isPhoneValid = /^03\d{9}$/.test(phone);
  const isPriceValid = pricePerKg !== "" && bidPerKgNumber >= minPrice;
  const isQuantityValid = quantity !== "" && quantityNumber >= 1;
  const isNameValid = bidderName.trim().length > 0;

  const formIsValid = isNameValid && isPhoneValid && isPriceValid && isQuantityValid;

  const titleId = `bid-modal-title-${item.id}`;
  const subTitleId = `bid-modal-subtitle-${item.id}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formIsValid) return;
    setSubmitted(true);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
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
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 md:p-6"
        >
          <header className="relative pb-5 border-b border-gray-100">
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {`Place Bid — ${item.title}`}
            </h2>
            <p id={subTitleId} className="mt-1 text-sm text-gray-500">
              {`${item.category} - ${item.location}`}
            </p>
            <button
              type="button"
              onClick={closeAndReset}
              className="absolute top-1 right-1 rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600"
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
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-500">
                  Bidder Name
                  <input
                    ref={firstFieldRef}
                    type="text"
                    value={bidderName}
                    onChange={(event) => setBidderName(event.target.value)}
                    className="mt-1 w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-600 px-3 py-2 bg-white text-gray-800"
                    required
                  />
                </label>

                <label className="block text-xs font-medium text-gray-500">
                  Phone
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="03\\d{9}"
                    placeholder="03XXXXXXXXX"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-1 w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-600 px-3 py-2 bg-white text-gray-800"
                    required
                  />
                  <span className="mt-1 block text-[11px] text-gray-400">
                    Format: 03XXXXXXXXX
                  </span>
                  {!isPhoneValid && phone.length > 0 && (
                    <span className="mt-1 block text-[11px] text-red-500">
                      Enter a valid Pakistani mobile number.
                    </span>
                  )}
                </label>

                <label className="block text-xs font-medium text-gray-500">
                  Bid Price per kg
                  <input
                    type="number"
                    min={minPrice}
                    value={pricePerKg}
                    onChange={(event) => setPricePerKg(event.target.value)}
                    className="mt-1 w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-600 px-3 py-2 bg-white text-gray-800"
                    required
                  />
                  <span className="mt-1 block text-[11px] text-gray-400">
                    Minimum bid: Rs {minPrice}
                  </span>
                  {!isPriceValid && pricePerKg !== "" && (
                    <span className="mt-1 block text-[11px] text-red-500">
                      Bid must be at least Rs {minPrice}.
                    </span>
                  )}
                </label>

                <label className="block text-xs font-medium text-gray-500">
                  Quantity (kg)
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="mt-1 w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-600 px-3 py-2 bg-white text-gray-800"
                    required
                  />
                  {!isQuantityValid && quantity !== "" && (
                    <span className="mt-1 block text-[11px] text-red-500">
                      Quantity must be at least 1 kg.
                    </span>
                  )}
                </label>

                <label className="block text-xs font-medium text-gray-500">
                  Delivery Option
                  <select
                    value={deliveryOption}
                    onChange={(event) => setDeliveryOption(event.target.value)}
                    className="mt-1 w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-600 px-3 py-2 bg-white text-gray-800"
                  >
                    <option value="Pickup">Pickup</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </label>

                <label className="block text-xs font-medium text-gray-500">
                  Notes (optional)
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-600 px-3 py-2 bg-white text-gray-800"
                  />
                </label>
              </div>

              <div className="mt-3 rounded-xl bg-green-50 text-green-800 border border-green-200 p-3 text-sm">
                Estimated total: Rs {total.toLocaleString() || "0"}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAndReset}
                  className="bg-gray-100 text-gray-800 rounded-full px-4 py-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formIsValid}
                  className="bg-green-600 text-white rounded-full px-5 py-2.5 hover:bg-green-700 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  Submit Bid
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
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
                <p className="text-lg font-semibold text-gray-900">Bid submitted (demo)!</p>
                <p className="text-sm text-gray-500">
                  We've noted your interest. A team member will reach out shortly.
                </p>
              </div>
              <dl className="space-y-2 text-sm text-gray-700 text-left mx-auto max-w-sm">
                <div className="flex justify-between"><dt className="font-medium">Item</dt><dd>{item.title}</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Bid / kg</dt><dd>Rs {bidPerKgNumber.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Quantity</dt><dd>{quantityNumber.toLocaleString()} kg</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Total</dt><dd>Rs {total.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="font-medium">Phone</dt><dd>{phone}</dd></div>
              </dl>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="/products"
                  className="bg-gray-100 text-gray-800 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-center"
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
                  className="bg-green-600 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
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

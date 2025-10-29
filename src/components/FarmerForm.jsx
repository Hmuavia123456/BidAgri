"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const steps = [
  "Profile",
  "Produce",
  "Location & Photos",
];

const initialFormState = {
  fullName: "",
  phone: "",
  cnic: "",
  email: "",
  category: "",
  productName: "",
  quantity: "",
  unit: "kg",
  basePrice: "",
  harvestDate: "",
  province: "",
  city: "",
  address: "",
  photos: [],
  terms: false,
};

const MAX_PHOTOS = 3;

export default function FarmerForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormState);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [photoError, setPhotoError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [photoPreviews]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    const { files } = event.target;
    const selectedFiles = Array.from(files || []);
    const limitedFiles = selectedFiles.slice(0, MAX_PHOTOS);

    setPhotoPreviews((prev) => {
      prev.forEach((preview) => URL.revokeObjectURL(preview.url));
      return limitedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      }));
    });

    setFormData((prev) => ({
      ...prev,
      photos: limitedFiles,
    }));
    setPhotoError(
      selectedFiles.length > MAX_PHOTOS
        ? `You can upload up to ${MAX_PHOTOS} photos. Only the first ${MAX_PHOTOS} were kept.`
        : ""
    );
  };

  const validateStep = (stepIndex) => {
    const errors = {};

    if (stepIndex === 0) {
      if (!formData.fullName.trim()) {
        errors.fullName = "Full Name is required";
      }
      if (!/^03\d{9}$/.test(formData.phone.trim())) {
        errors.phone = "Phone must match 03XXXXXXXXX";
      }
      if (!/^\d{13}$/.test(formData.cnic.trim())) {
        errors.cnic = "CNIC must be 13 digits";
      }
    } else if (stepIndex === 1) {
      if (!formData.category) {
        errors.category = "Select a category";
      }
      if (!formData.productName.trim()) {
        errors.productName = "Product Name is required";
      }
      if (!(Number(formData.quantity) > 0)) {
        errors.quantity = "Quantity must be greater than 0";
      }
      if (!formData.unit) {
        errors.unit = "Select a unit";
      }
      if (!(Number(formData.basePrice) > 0)) {
        errors.basePrice = "Base price must be greater than 0";
      }
      if (!formData.harvestDate) {
        errors.harvestDate = "Harvest date is required";
      }
    } else if (stepIndex === 2) {
      if (!formData.province) {
        errors.province = "Select a province";
      }
      if (!formData.city.trim()) {
        errors.city = "City/Town is required";
      }
      if (!formData.terms) {
        errors.terms = "You must confirm the information";
      }
    }

    return errors;
  };

  const isCurrentStepValid = useMemo(() => {
    return Object.keys(validateStep(currentStep)).length === 0;
  }, [currentStep, formData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1 && isCurrentStepValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const allValid = steps.every((_, index) => Object.keys(validateStep(index)).length === 0);
    if (!allValid) {
      const firstInvalid = steps.findIndex((_, index) => Object.keys(validateStep(index)).length > 0);
      setCurrentStep(firstInvalid === -1 ? 0 : firstInvalid);
      return;
    }
    setIsSubmitted(true);
  };

  const resetForm = () => {
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setFormData(initialFormState);
    setPhotoPreviews([]);
    setPhotoError("");
    setCurrentStep(0);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="mt-8 bg-[color:var(--surface)] rounded-2xl shadow-lg p-6 md:p-8 border border-[color:var(--accent)]/40">
        <h2 className="text-2xl font-semibold text-[color:var(--primary)]">Registration Complete</h2>
        <p className="mt-2 text-[color:var(--muted)]">
          Thanks, {formData.fullName || "Farmer"}! Your produce listing is ready to be reviewed.
        </p>
        <dl className="mt-4 space-y-2 text-[color:var(--foreground)]">
          <div>
            <dt className="font-medium">Produce</dt>
            <dd>{formData.productName}</dd>
          </div>
          <div>
            <dt className="font-medium">Quantity</dt>
            <dd>
              {formData.quantity} {formData.unit}
            </dd>
          </div>
          <div>
            <dt className="font-medium">City</dt>
            <dd>{formData.city}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="bg-[color:var(--leaf)] text-[color:var(--surface)] rounded-full px-6 py-2.5 hover:bg-[color:var(--secondary)] transition"
          >
            Go to Products
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className="bg-[color:var(--surface-2)] text-[color:var(--foreground)] rounded-full px-5 py-2 hover:bg-[color:var(--surface-2)]/80"
          >
            Register another
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[color:var(--primary)]">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                aria-label="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                required
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[color:var(--primary)]">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  aria-label="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  pattern="03\d{9}"
                  placeholder="03XXXXXXXXX"
                  className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="cnic" className="block text-sm font-medium text-[color:var(--primary)]">
                  CNIC
                </label>
                <input
                  id="cnic"
                  name="cnic"
                  type="text"
                  aria-label="CNIC"
                  value={formData.cnic}
                  onChange={handleInputChange}
                  pattern="\d{13}"
                  placeholder="13 digit CNIC"
                  className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[color:var(--primary)]">
                Email (optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                aria-label="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[color:var(--primary)]">
                Category
              </label>
              <select
                id="category"
                name="category"
                aria-label="Produce category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                required
              >
                <option value="">Select category</option>
                <option value="Grains">Grains</option>
                <option value="Nuts">Nuts</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
              </select>
            </div>
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-[color:var(--primary)]">
                Product Name
              </label>
              <input
                id="productName"
                name="productName"
                type="text"
                aria-label="Product name"
                placeholder="e.g., Wheat, Mango Sindhri"
                value={formData.productName}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 placeholder:text-[color:var(--muted)] bg-[color:var(--surface)] text-[color:var(--foreground)]"
                required
              />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="md:col-span-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-[color:var(--primary)]">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  aria-label="Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-[color:var(--primary)]">
                  Unit
                </label>
                <select
                  id="unit"
                  name="unit"
                  aria-label="Quantity unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  required
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-[color:var(--primary)]">
                  Base Price per kg
                </label>
                <input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  min="0"
                  aria-label="Base price per kilogram"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="harvestDate" className="block text-sm font-medium text-[color:var(--primary)]">
                  Harvest Date
                </label>
                <input
                  id="harvestDate"
                  name="harvestDate"
                  type="date"
                  aria-label="Harvest date"
                  value={formData.harvestDate}
                  onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 placeholder:text-[color:var(--muted)] bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-[color:var(--primary)]">
                Province
              </label>
              <select
                id="province"
                name="province"
                aria-label="Province"
                value={formData.province}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                required
              >
                <option value="">Select province</option>
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="KPK">KPK</option>
                <option value="Balochistan">Balochistan</option>
                <option value="GB">GB</option>
                <option value="AJK">AJK</option>
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-[color:var(--primary)]">
                City/Town
              </label>
              <input
                id="city"
                name="city"
                type="text"
                aria-label="City or town"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
                required
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-[color:var(--primary)]">
                Address (optional)
              </label>
              <textarea
                id="address"
                name="address"
                aria-label="Address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] px-3 py-2 text-sm transition-colors duration-200 ease-in-out placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70 bg-[color:var(--surface)] text-[color:var(--foreground)]"
              />
            </div>
            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-[color:var(--primary)]">
                Photos (up to {MAX_PHOTOS})
              </label>
              <input
                id="photos"
                name="photos"
                type="file"
                accept="image/*"
                multiple
                aria-label="Upload produce photos"
                onChange={handleFileChange}
                className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/60 focus:border-[color:var(--leaf)]/70"
              />
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                Selected {photoPreviews.length} of {MAX_PHOTOS} photos to showcase your produce.
              </p>
              {photoError && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {photoError}
                </p>
              )}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                  {photoPreviews.map((preview) => (
                    <div key={preview.url} className="h-20 w-full overflow-hidden rounded-lg ring-1 ring-[color:var(--accent)]/40">
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-start gap-3">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                aria-label="Confirm information is accurate"
                checked={formData.terms}
                onChange={handleInputChange}
            className="mt-1 h-4 w-4 rounded border-[color:var(--accent)] text-[color:var(--leaf)] focus:ring-[color:var(--leaf)]"
                required
              />
              <label htmlFor="terms" className="text-sm text-[color:var(--foreground)]">
                I confirm the information is accurate.
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 bg-[color:var(--surface)] rounded-2xl shadow-lg p-6 md:p-8"
      noValidate
    >
      <div className="flex items-center gap-3 mb-6">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div key={label} className="flex items-center gap-3 flex-1">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
                    isActive || isCompleted
                      ? "border-[color:var(--leaf)] bg-[color:var(--leaf)] text-[color:var(--surface)]"
                      : "border-[color:var(--accent)] bg-[color:var(--surface)] text-[color:var(--muted)]"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-[color:var(--primary)]" : "text-[color:var(--muted)]"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1">
                  <div className="h-1 bg-[color:var(--accent)]/40 rounded">
                    <div
                      className={`h-1 rounded transition-all duration-300 ${
                        isCompleted ? "bg-[color:var(--leaf)] w-full" : "bg-[color:var(--leaf)]"
                      }`}
                      style={{ width: isCompleted ? "100%" : 0 }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {renderStep()}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="bg-[color:var(--surface-2)] text-[color:var(--foreground)] rounded-full px-5 py-2 hover:bg-[color:var(--surface-2)]/80"
          >
            Back
          </button>
        ) : (
          <span />
        )}

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentStepValid}
            className={`bg-[color:var(--leaf)] text-[color:var(--surface)] rounded-full px-6 py-2.5 transition ${
              isCurrentStepValid ? "hover:bg-[color:var(--secondary)]" : "opacity-60 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={!isCurrentStepValid}
            className={`bg-[color:var(--leaf)] text-[color:var(--surface)] rounded-full px-6 py-2.5 transition ${
              isCurrentStepValid ? "hover:bg-[color:var(--secondary)]" : "opacity-60 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        )}
      </div>
    </form>
  );
}

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

export default function FarmerForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormState);
  const [photoPreviews, setPhotoPreviews] = useState([]);
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
    setPhotoPreviews((prev) => {
      prev.forEach((preview) => URL.revokeObjectURL(preview.url));
      return [];
    });

    const newFiles = Array.from(files || []);
    const newPreviews = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      photos: newFiles,
    }));
    setPhotoPreviews(newPreviews);
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
    setCurrentStep(0);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-green-200">
        <h2 className="text-2xl font-semibold text-green-700">Registration Complete</h2>
        <p className="mt-2 text-gray-600">
          Thanks, {formData.fullName || "Farmer"}! Your produce listing is ready to be reviewed.
        </p>
        <dl className="mt-4 space-y-2 text-gray-700">
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
            className="bg-green-600 text-white rounded-full px-6 py-2.5 hover:bg-green-700 transition"
          >
            Go to Products
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-100 text-gray-800 rounded-full px-5 py-2 hover:bg-gray-200"
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
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                aria-label="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
                required
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email (optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                aria-label="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                aria-label="Produce category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
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
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
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
                className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
                required
              />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="md:col-span-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  id="unit"
                  name="unit"
                  aria-label="Quantity unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
                  required
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700">
                  Harvest Date
                </label>
                <input
                  id="harvestDate"
                  name="harvestDate"
                  type="date"
                  aria-label="Harvest date"
                  value={formData.harvestDate}
                  onChange={handleInputChange}
                  className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
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
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                Province
              </label>
              <select
                id="province"
                name="province"
                aria-label="Province"
                value={formData.province}
                onChange={handleInputChange}
                className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
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
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City/Town
              </label>
              <input
                id="city"
                name="city"
                type="text"
                aria-label="City or town"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address (optional)
              </label>
              <textarea
                id="address"
                name="address"
                aria-label="Address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-gray-700">
                Photos
              </label>
              <input
                id="photos"
                name="photos"
                type="file"
                accept="image/*"
                multiple
                aria-label="Upload produce photos"
                onChange={handleFileChange}
                className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white text-gray-800 px-3 py-2"
              />
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                  {photoPreviews.map((preview) => (
                    <div key={preview.url} className="h-20 w-full overflow-hidden rounded-lg ring-1 ring-gray-200">
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
                className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
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
      className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8"
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
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-green-200 bg-white text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1">
                  <div className="h-1 bg-green-200 rounded">
                    <div
                      className={`h-1 rounded transition-all duration-300 ${
                        isCompleted ? "bg-green-600 w-full" : "bg-green-600"
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
            className="bg-gray-100 text-gray-800 rounded-full px-5 py-2 hover:bg-gray-200"
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
            className={`bg-green-600 text-white rounded-full px-6 py-2.5 transition ${
              isCurrentStepValid ? "hover:bg-green-700" : "opacity-60 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={!isCurrentStepValid}
            className={`bg-green-600 text-white rounded-full px-6 py-2.5 transition ${
              isCurrentStepValid ? "hover:bg-green-700" : "opacity-60 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        )}
      </div>
    </form>
  );
}

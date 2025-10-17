"use client";

import { useState, useMemo } from "react";

export default function RedesignedFarmerForm() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    city: "",
    address: "",
    cropType: "",
    quantity: "",
    unit: "kg",
    message: "",
    idDoc: null,
    farmProof: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onFile = (e) => {
    const { name, files } = e.target;
    setForm((p) => ({ ...p, [name]: files && files[0] ? files[0] : null }));
  };

  const isValid = useMemo(() => {
    const phoneOk = /^03\d{9}$/.test(form.phone.trim());
    const emailOk = form.email ? /.+@.+\..+/.test(form.email.trim()) : true;
    return (
      form.fullName.trim() &&
      phoneOk &&
      emailOk &&
      form.province.trim() &&
      form.city.trim() &&
      form.cropType.trim() &&
      Number(form.quantity) > 0 &&
      form.unit.trim()
    );
  }, [form]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
  };

  const inputBase =
    "w-full rounded-[8px] border border-[#B1AB86] bg-[#FFFFFF] text-[#0A400C] px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#FED16A] transition-colors";

  if (submitted) {
    return (
      <div className="mx-auto my-8 max-w-2xl rounded-2xl bg-white p-6 md:p-8 shadow-md ring-1 ring-[#B1AB86]/40" style={{ fontFamily: "Inter, sans-serif" }}>
        <h2 className="text-2xl font-semibold text-[#0A400C]">Registration Submitted</h2>
        <p className="mt-2 text-[#0A400C] opacity-80">
          Thanks, {form.fullName || "Farmer"}. We have received your details and will be in touch shortly.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm font-bold text-[#0A400C]">Crop</div>
            <div className="text-sm text-[#0A400C] opacity-90">{form.cropType}</div>
          </div>
          <div>
            <div className="text-sm font-bold text-[#0A400C]">Quantity</div>
            <div className="text-sm text-[#0A400C] opacity-90">{form.quantity} {form.unit}</div>
          </div>
          <div>
            <div className="text-sm font-bold text-[#0A400C]">Location</div>
            <div className="text-sm text-[#0A400C] opacity-90">{form.city}, {form.province}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto my-8 max-w-2xl rounded-2xl bg-white p-6 md:p-8 shadow-md ring-1 ring-[#B1AB86]/40"
      style={{ fontFamily: "Inter, sans-serif" }}
      noValidate
    >
      <h2 className="mb-6 text-center text-2xl md:text-3xl font-bold text-[#0A400C]">Farmer Registration</h2>

      {/* Contact Info */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-bold text-[#0A400C]">Contact Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-semibold text-[#0A400C]">Full Name</label>
            <input id="fullName" name="fullName" type="text" className={inputBase} value={form.fullName} onChange={onChange} required />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-[#0A400C]">Contact Number</label>
            <input id="phone" name="phone" type="tel" pattern="03\d{9}" placeholder="03XXXXXXXXX" className={inputBase} value={form.phone} onChange={onChange} required />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-[#0A400C]">Email (optional)</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" className={inputBase} value={form.email} onChange={onChange} />
          </div>
        </div>
      </div>

      {/* Farm Info */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-bold text-[#0A400C]">Farm Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="province" className="mb-1 block text-sm font-semibold text-[#0A400C]">Province</label>
            <input id="province" name="province" type="text" className={inputBase} value={form.province} onChange={onChange} required />
          </div>
          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-semibold text-[#0A400C]">City/Town</label>
            <input id="city" name="city" type="text" className={inputBase} value={form.city} onChange={onChange} required />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="mb-1 block text-sm font-semibold text-[#0A400C]">Address (optional)</label>
            <textarea id="address" name="address" className={inputBase} value={form.address} onChange={onChange} rows={3} />
          </div>
        </div>
      </div>

      {/* Produce Info */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-bold text-[#0A400C]">Produce Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="cropType" className="mb-1 block text-sm font-semibold text-[#0A400C]">Crop / Product Name</label>
            <input id="cropType" name="cropType" type="text" placeholder="e.g., Wheat, Mango Sindhri" className={inputBase} value={form.cropType} onChange={onChange} required />
          </div>
          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm font-semibold text-[#0A400C]">Quantity</label>
            <input id="quantity" name="quantity" type="number" min="0" className={inputBase} value={form.quantity} onChange={onChange} required />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label htmlFor="unit" className="mb-1 block text-sm font-semibold text-[#0A400C]">Unit</label>
            <select id="unit" name="unit" className={inputBase} value={form.unit} onChange={onChange}>
              <option value="kg">kg</option>
              <option value="ton">ton</option>
              <option value="crates">crates</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className="mb-1 block text-sm font-semibold text-[#0A400C]">Message</label>
            <textarea id="message" name="message" className={inputBase} value={form.message} onChange={onChange} placeholder="Share harvest details, preferred buyers, or timelines." rows={5} />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="mb-8">
        <h3 className="mb-3 text-lg font-bold text-[#0A400C]">Documents</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="idDoc" className="mb-1 block text-sm font-semibold text-[#0A400C]">ID Document</label>
            <input id="idDoc" name="idDoc" type="file" accept="image/*,.pdf" className={`${inputBase} file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#0A400C] file:px-3 file:py-2 file:text-[#FED16A] hover:file:bg-[#146B18]`}
              onChange={onFile} />
          </div>
          <div>
            <label htmlFor="farmProof" className="mb-1 block text-sm font-semibold text-[#0A400C]">Farm Proof</label>
            <input id="farmProof" name="farmProof" type="file" accept="image/*,.pdf" className={`${inputBase} file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#0A400C] file:px-3 file:py-2 file:text-[#FED16A] hover:file:bg-[#146B18]`}
              onChange={onFile} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full rounded-[8px] bg-[#0A400C] px-6 py-3 text-base font-semibold text-[#FED16A] transition-colors hover:bg-[#146B18] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Submit Registration
      </button>
    </form>
  );
}


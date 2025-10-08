"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "react-lottie-player";

const initialFormState = {
  fullName: "",
  cropType: "",
  location: "",
  phone: "",
  email: "",
  message: "",
};

const floatingIconKeyframes = { y: [0, -6, 0] };
const floatingIconTransition = {
  duration: 3,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
};

export default function EnhancedFarmerRegistrationForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let toastTimer;
    if (showToast) {
      toastTimer = setTimeout(() => setShowToast(false), 5000);
    }
    return () => {
      if (toastTimer) {
        clearTimeout(toastTimer);
      }
    };
  }, [showToast]);

  const isFormValid = useMemo(() => {
    return (
      formData.fullName.trim() &&
      formData.cropType.trim() &&
      formData.location.trim() &&
      /^03\d{9}$/.test(formData.phone.trim()) &&
      /.+@.+\..+/.test(formData.email.trim())
    );
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.cropType.trim()) newErrors.cropType = "Crop type is required";
    if (!formData.location.trim()) newErrors.location = "Province or city is required";
    if (!/^03\d{9}$/.test(formData.phone.trim())) newErrors.phone = "Phone must follow 03XXXXXXXXX";
    if (!/.+@.+\..+/.test(formData.email.trim())) newErrors.email = "Valid email is required";
    return newErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setShowToast(true);
      setIsSubmitting(false);
      setFormData(initialFormState);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute top-0 left-1/2 z-20 w-full max-w-sm -translate-x-1/2 -translate-y-[110%]"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-2xl ring-1 ring-emerald-200">
              <Lottie
                play
                loop={false}
                style={{ width: 60, height: 60 }}
                src="https://lottie.host/f0c59911-6c68-4fba-83df-8856792fb8b4/RrsLVdN6rS.json"
              />
              <p className="text-sm font-semibold text-green-700">
                🎉 Registration submitted successfully! Our team will contact you soon.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-green-800 text-center mb-8"
          >
            Farmer Registration
          </motion.h2>
          <motion.div className="flex justify-around mb-6 text-green-700 font-semibold text-base md:text-lg">
            <motion.span
              animate={floatingIconKeyframes}
              transition={floatingIconTransition}
            >
              👤 Profile
            </motion.span>
            <motion.span
              animate={floatingIconKeyframes}
              transition={{ ...floatingIconTransition, delay: 0.2 }}
            >
              🌾 Produce
            </motion.span>
            <motion.span
              animate={floatingIconKeyframes}
              transition={{ ...floatingIconTransition, delay: 0.4 }}
            >
              📍 Location &amp; Photos
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-5"
        >
          {[{
            name: "fullName",
            label: "👤 Full Name",
            type: "text",
            placeholder: "Enter your full name",
          },
          {
            name: "cropType",
            label: "🌾 Crop Type",
            type: "text",
            placeholder: "What are you growing?",
          },
          {
            name: "location",
            label: "📍 Province/City",
            type: "text",
            placeholder: "Where is your farm located?",
          },
          {
            name: "phone",
            label: "📞 Contact Number",
            type: "tel",
            placeholder: "03XXXXXXXXX",
          },
          {
            name: "email",
            label: "📧 Email",
            type: "email",
            placeholder: "Enter your email",
          }].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all duration-300 shadow-sm hover:border-green-300"
              />
              {errors[field.name] && (
                <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              📝 Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Share details about your harvest, quantity, or preferred buyers."
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all duration-300 shadow-sm hover:border-green-300"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

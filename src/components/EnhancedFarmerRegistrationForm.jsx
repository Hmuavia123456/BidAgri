"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import { FileText, Leaf, Mail, MapPin, Phone, User } from "lucide-react";

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

const fieldConfigs = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter your full name",
    icon: User,
  },
  {
    name: "cropType",
    label: "Crop Type",
    type: "text",
    placeholder: "What are you growing?",
    icon: Leaf,
  },
  {
    name: "location",
    label: "Province/City",
    type: "text",
    placeholder: "Where is your farm located?",
    icon: MapPin,
  },
  {
    name: "phone",
    label: "Contact Number",
    type: "tel",
    placeholder: "03XXXXXXXXX",
    icon: Phone,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email",
    icon: Mail,
  },
];

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
      className="relative mx-auto max-w-4xl px-4"
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
            <div className="flex items-center gap-3 rounded-2xl bg-[color:var(--surface)]/95 p-4 shadow-2xl ring-1 ring-[color:var(--accent)]/40">
              <Player
                autoplay
                loop
                src="/animations/farmer-success.json"
                style={{ height: "150px", width: "150px" }}
              />
              <p className="text-sm font-semibold text-[color:var(--primary)]">
                🎉 Registration submitted successfully! Our team will contact you soon.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-3xl bg-gradient-to-br from-[color:var(--surface)] via-[color:var(--surface-2)] to-[color:var(--surface-2)] p-6 md:p-8 shadow-[0_20px_60px_-25px_rgba(var(--leaf-rgb),0.35)] ring-1 ring-[color:var(--surface)]/40 backdrop-blur-sm transition-shadow duration-500"
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
            className="mb-8 text-center text-3xl font-bold text-[color:var(--foreground)] md:text-4xl"
          >
            Farmer Registration
          </motion.h2>
          <motion.div className="mb-8 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-[color:var(--leaf)] md:text-base">
            <motion.span
              animate={floatingIconKeyframes}
              transition={floatingIconTransition}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4 text-[color:var(--leaf)]" /> Profile
            </motion.span>
            <motion.span
              animate={floatingIconKeyframes}
              transition={{ ...floatingIconTransition, delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <Leaf className="h-4 w-4 text-[color:var(--leaf)]" /> Produce
            </motion.span>
            <motion.span
              animate={floatingIconKeyframes}
              transition={{ ...floatingIconTransition, delay: 0.4 }}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-[color:var(--leaf)]" /> Location &amp; Photos
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {fieldConfigs.map((field) => {
              const Icon = field.icon;
              const filled = Boolean((formData[field.name] || "").length);
              return (
                <motion.div
                  key={field.name}
                  className="flex flex-col"
                >
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]/80">
                    <Icon className="h-4 w-4 text-[color:var(--leaf)]" />
                    {field.label}
                  </label>
                  <motion.input
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    whileFocus={{ scale: 1.005 }}
                    className="w-full rounded-2xl px-4 py-3 shadow-sm outline-none ring-1 transition-colors duration-200 ease-in-out hover:ring-[color:var(--leaf)]/40 focus:ring-2 focus:ring-[color:var(--leaf)]/70 placeholder:text-[color:var(--muted)] bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  />
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-[color:var(--secondary)]">{errors[field.name]}</p>
                  )}
                </motion.div>
              );
            })}
            <motion.div
              className="md:col-span-2"
            >
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]/80">
                <FileText className="h-4 w-4 text-[color:var(--leaf)]" />
                Message
              </label>
              <motion.textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Share details about your harvest, quantity, or preferred buyers."
                rows={4}
                whileFocus={{ scale: 1.005 }}
                className="w-full rounded-2xl px-4 py-3 shadow-sm outline-none ring-1 transition-colors duration-200 ease-in-out hover:ring-[color:var(--leaf)]/40 focus:ring-2 focus:ring-[color:var(--leaf)]/70 placeholder:text-[color:var(--muted)] bg-[color:var(--surface)] text-[color:var(--foreground)]"
              />
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 240, damping: 14 }}
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full rounded-2xl bg-[color:var(--primary)] px-6 py-3 text-base font-semibold text-[color:var(--surface)] shadow-[0_15px_35px_-20px_rgba(var(--leaf-rgb),0.35)] transition-all duration-300 hover:bg-[color:var(--leaf)] hover:shadow-[0_25px_45px_-25px_rgba(var(--leaf-rgb),0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/80 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CreateLeadPayload } from "../types";

interface LeadFormikProps {
  onSubmitLead: (values: CreateLeadPayload) => Promise<void>;
}

const LeadValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Lead name is required"),
  email: Yup.string()
    .email("Please enter a valid work email address")
    .required("Work email is required"),
  company: Yup.string().optional(),
  phone: Yup.string().optional(),
  budget: Yup.string().required("Please select a budget range"),
  scope: Yup.string()
    .min(10, "Please describe your project scope in at least 10 characters")
    .required("Project scope description is required"),
});

export const LeadFormik: React.FC<LeadFormikProps> = ({ onSubmitLead }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formik = useFormik<CreateLeadPayload>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      budget: "",
      budgetCategory: "10k-50k",
      scope: "",
    },
    validationSchema: LeadValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      setServerError(null);
      setSuccessMessage(null);

      // Determine category
      let budgetCategory: "5k-10k" | "10k-50k" | "50k+" = "10k-50k";
      if (values.budget === "5k-10k" || values.budget === "low") budgetCategory = "5k-10k";
      if (values.budget === "50k+" || values.budget === "high") budgetCategory = "50k+";

      try {
        await onSubmitLead({
          ...values,
          budgetCategory,
        });
        setSuccessMessage("Lead initialized! Added to admin pipeline pipeline.");
        resetForm();
      } catch (err: any) {
        setServerError(err.message || "Failed to transmit lead to server.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 relative">
      <div className="mb-6">
        <span className="text-xs font-mono font-semibold tracking-wider text-emerald-700 uppercase block mb-1">
          Formik Engine Validation
        </span>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Initialize Your Pipeline
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Submit lead credentials directly to express session CRM backend.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Error:</span>
            <span>{serverError}</span>
          </div>
          <button
            onClick={() => setServerError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Lead Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Lead Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="E.g. Alexander Wright"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none ${
              formik.touched.name && formik.errors.name
                ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                : "border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            }`}
          />
          {formik.touched.name && formik.errors.name ? (
            <p className="mt-1 text-xs text-rose-600 font-medium">{formik.errors.name}</p>
          ) : null}
        </div>

        {/* Work Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Work Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="alex@company.com"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none ${
              formik.touched.email && formik.errors.email
                ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                : "border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            }`}
          />
          {formik.touched.email && formik.errors.email ? (
            <p className="mt-1 text-xs text-rose-600 font-medium">{formik.errors.email}</p>
          ) : null}
        </div>

        {/* Company & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Company Name
            </label>
            <input
              id="company"
              name="company"
              type="text"
              placeholder="Acme Corp"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.company}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="+1 (555) 000-0000"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Budget Selection */}
        <div>
          <label htmlFor="budget" className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Budget Range *
          </label>
          <select
            id="budget"
            name="budget"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.budget}
            className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none ${
              formik.touched.budget && formik.errors.budget
                ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                : "border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            }`}
          >
            <option value="" disabled>
              Select range...
            </option>
            <option value="5k-10k">$5,000 — $10,000 (Growth Tier)</option>
            <option value="10k-50k">$10,000 — $50,000 (Pro Tier)</option>
            <option value="50k+">$50,000+ (Enterprise Tier)</option>
          </select>
          {formik.touched.budget && formik.errors.budget ? (
            <p className="mt-1 text-xs text-rose-600 font-medium">{formik.errors.budget}</p>
          ) : null}
        </div>

        {/* Project Scope */}
        <div>
          <label htmlFor="scope" className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Project Scope & Goals *
          </label>
          <textarea
            id="scope"
            name="scope"
            rows={3}
            placeholder="Tell us about your lead targets, platform requirements, or integration needs..."
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.scope}
            className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none resize-none ${
              formik.touched.scope && formik.errors.scope
                ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                : "border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            }`}
          />
          {formik.touched.scope && formik.errors.scope ? (
            <p className="mt-1 text-xs text-rose-600 font-medium">{formik.errors.scope}</p>
          ) : null}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full py-4 bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          {formik.isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Ingesting Lead...</span>
            </>
          ) : (
            <>
              <span>Accelerate Pipeline</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

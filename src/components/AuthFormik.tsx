import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { User } from "../types";

interface AuthFormikProps {
  mode: "login" | "register";
  onLogin: (email: string, password: string) => Promise<User>;
  onRegister: (name: string, email: string, password: string) => Promise<User>;
  onToggleMode: () => void;
  onSuccess: () => void;
}

const LoginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid work email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const RegisterSchema = Yup.object({
  name: Yup.string().min(2, "Name is too short").required("Full name is required"),
  email: Yup.string().email("Enter a valid work email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const AuthFormik: React.FC<AuthFormikProps> = ({
  mode,
  onLogin,
  onRegister,
  onToggleMode,
  onSuccess,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginFormik = useFormik({
    initialValues: { email: "admin@leadflow.io", password: "password123" },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setErrorMessage(null);
      try {
        await onLogin(values.email, values.password);
        onSuccess();
      } catch (err: any) {
        setErrorMessage(err.message || "Express-session login failed.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const registerFormik = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setErrorMessage(null);
      try {
        await onRegister(values.name, values.email, values.password);
        onSuccess();
      } catch (err: any) {
        setErrorMessage(err.message || "Registration failed.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleDemoFill = () => {
    loginFormik.setFieldValue("email", "admin@leadflow.io");
    loginFormik.setFieldValue("password", "password123");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-700 uppercase font-semibold block">
            Express-Session Auth Engine
          </span>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {mode === "login" ? "Admin Access" : "Create Account"}
          </h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {mode === "login" ? (
        <form onSubmit={loginFormik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Work Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@company.com"
              onChange={loginFormik.handleChange}
              onBlur={loginFormik.handleBlur}
              value={loginFormik.values.email}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
            />
            {loginFormik.touched.email && loginFormik.errors.email ? (
              <p className="mt-1 text-xs text-rose-600 font-medium">{loginFormik.errors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={loginFormik.handleChange}
              onBlur={loginFormik.handleBlur}
              value={loginFormik.values.password}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
            />
            {loginFormik.touched.password && loginFormik.errors.password ? (
              <p className="mt-1 text-xs text-rose-600 font-medium">{loginFormik.errors.password}</p>
            ) : null}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loginFormik.isSubmitting}
              className="w-full py-3.5 bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:bg-emerald-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginFormik.isSubmitting ? "Authenticating..." : "Authorize Session →"}
            </button>
          </div>

          {/* Quick Demo Fill Helper */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-gray-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-emerald-800">Demo Admin:</span> admin@leadflow.io / password123
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-2 py-1 bg-white text-emerald-800 font-bold border border-emerald-300 rounded hover:bg-emerald-100 text-[10px] transition-colors"
            >
              Autofill
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={registerFormik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              onChange={registerFormik.handleChange}
              onBlur={registerFormik.handleBlur}
              value={registerFormik.values.name}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
            />
            {registerFormik.touched.name && registerFormik.errors.name ? (
              <p className="mt-1 text-xs text-rose-600 font-medium">{registerFormik.errors.name}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Work Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@company.com"
              onChange={registerFormik.handleChange}
              onBlur={registerFormik.handleBlur}
              value={registerFormik.values.email}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
            />
            {registerFormik.touched.email && registerFormik.errors.email ? (
              <p className="mt-1 text-xs text-rose-600 font-medium">{registerFormik.errors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              onChange={registerFormik.handleChange}
              onBlur={registerFormik.handleBlur}
              value={registerFormik.values.password}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
            />
            {registerFormik.touched.password && registerFormik.errors.password ? (
              <p className="mt-1 text-xs text-rose-600 font-medium">{registerFormik.errors.password}</p>
            ) : null}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={registerFormik.isSubmitting}
              className="w-full py-3.5 bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:bg-emerald-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {registerFormik.isSubmitting ? "Creating Session..." : "Create Admin Account →"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-600">
          {mode === "login" ? "New to LeadFlow platform? " : "Already registered? "}
          <button
            onClick={onToggleMode}
            className="text-emerald-700 font-bold hover:underline ml-1"
          >
            {mode === "login" ? "Create Account" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
};

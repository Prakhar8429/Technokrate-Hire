import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import logo from "../../../assets/Logos.png";
import rightImg from "../../../assets/Mobile login-amico 1.png";
import GoogleAuthButton from "../GoogleAuthButton";
import {
  loginWithPassword,
  clearLoginError,
} from "../../../redux/slice/login/loginSlice";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  * { font-family: 'DM Sans', sans-serif; }

  @keyframes slideUp    { from{opacity:0;transform:translateY(28px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown  { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideRight { from{opacity:0;transform:translateX(44px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
  @keyframes spin       { to{transform:rotate(360deg)} }
  @keyframes shimmer    { 0%{left:-100%} 100%{left:200%} }
  @keyframes orb        { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.12);opacity:.65} }

  .anim-slide-up    { animation: slideUp    .6s  cubic-bezier(.22,1,.36,1) .1s  both }
  .anim-slide-down  { animation: slideDown  .5s  cubic-bezier(.22,1,.36,1)      both }
  .anim-slide-right { animation: slideRight .7s  cubic-bezier(.22,1,.36,1) .2s  both }
  .anim-float       { animation: float 6s ease-in-out infinite }
  .anim-spin        { animation: spin .7s linear infinite }
  .anim-orb1        { animation: orb 9s  ease-in-out          infinite }
  .anim-orb2        { animation: orb 12s ease-in-out 3s        infinite }

  .shimmer-btn::after {
    content:''; position:absolute; top:0; bottom:0; width:50%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
    animation: shimmer 2.4s infinite;
  }

  .login-input::placeholder { color:#b0adb8; }
  .login-input:-webkit-autofill,
  .login-input:-webkit-autofill:hover,
  .login-input:-webkit-autofill:focus {
    -webkit-text-fill-color:#1a1a2e;
    -webkit-box-shadow:0 0 0 1000px #f5f3ff inset;
    transition:background-color 5000s ease-in-out 0s;
  }
  .login-input:focus {
    outline:none;
    border-color:#7900BA !important;
    box-shadow:0 0 0 3px rgba(121,0,186,.12) !important;
    background:#fff !important;
  }
  .login-input.err {
    border-color:rgba(239,68,68,.6) !important;
    box-shadow:0 0 0 3px rgba(239,68,68,.1) !important;
  }

  .cta-btn:not(:disabled):hover {
    transform:translateY(-2px);
    box-shadow:0 14px 36px rgba(121,0,186,.38), 0 0 0 1px rgba(121,0,186,.25) !important;
  }
  .cta-btn:not(:disabled):active { transform:translateY(0); }

  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

export default function Login() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const dispatch   = useDispatch();

  const redirectTo = location.state?.redirectTo;
  const { loading, error } = useSelector((s) => s.login);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearLoginError());
  }, [dispatch]);

  // Email + Password Formik (Direct Login)
  const formikEmail = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: location.state?.email || "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email address is required"),
      password: Yup.string()
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const result = await dispatch(
        loginWithPassword({
          email: values.email.trim(),
          password: values.password,
        })
      );
      if (loginWithPassword.fulfilled.match(result)) {
        toast.success("Login Successful 🎉");
        navigate(redirectTo || "/dashboard");
      } else {
        toast.error(result.payload || "Invalid email or password");
      }
      setSubmitting(false);
    },
  });

  return (
    <>
      <style>{STYLES}</style>

      <div className="relative h-screen w-full flex overflow-hidden bg-white">

        {/* Soft dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #d8b4fe 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.35,
          }}
        />

        {/* Ambient blobs */}
        <div
          className="anim-orb1 absolute -top-32 -left-32 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(121,0,186,.08) 0%, transparent 70%)" }}
        />
        <div
          className="anim-orb2 absolute -bottom-40 right-[40%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,.1) 0%, transparent 70%)" }}
        />
        <div
          className="anim-orb1 absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(121,0,186,.07) 0%, transparent 70%)" }}
        />

        {/* Desktop divider */}
        <div
          className="hidden lg:block absolute top-[6%] bottom-[6%] w-px z-10 pointer-events-none"
          style={{
            left: "45%",
            background: "linear-gradient(to bottom, transparent, rgba(121,0,186,.2), rgba(245,158,11,.15), transparent)",
          }}
        />

        {/* LEFT PANEL */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8 sm:px-8 w-full lg:w-[45%] lg:flex-none h-full overflow-hidden">
          
          {/* Logo */}
          <div className="anim-slide-down mt-6 mb-4 flex-shrink-0">
            <img src={logo} alt="logo" className="w-[200px] object-contain" />
          </div>

          {/* Card */}
          <div
            className="anim-slide-up w-full max-w-[420px] rounded-[24px] px-6 py-6 sm:px-8 sm:py-8 bg-white flex-shrink-0"
            style={{
              border: "1px solid rgba(121,0,186,.1)",
              boxShadow: "0 0 0 1px rgba(121,0,186,.06), 0 24px 64px rgba(121,0,186,.08), 0 4px 16px rgba(0,0,0,.06)",
            }}
          >
            {/* Card Header: Go Back & Badge */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#7900BA] bg-purple-50/80 hover:bg-purple-100 border border-purple-200 transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                <ArrowLeft size={13} className="text-[#7900BA]" />
                Go Back
              </button>

              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase text-[#7900BA]"
                style={{ background: "rgba(121,0,186,.08)", border: "1px solid rgba(121,0,186,.18)" }}
              >
                <Sparkles size={11} className="text-[#7900BA]" />
                JOB SEEKER PORTAL
              </span>
            </div>

            <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="mt-1.5 mb-5 text-sm text-gray-400 font-normal">
              Sign in to access your dashboard and opportunities
            </p>

            {/* Error Message */}
            {error && (
              <div
                className="mb-4 rounded-xl px-4 py-2.5 text-sm text-center text-red-600"
                style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)" }}
              >
                {error}
              </div>
            )}

            {/* Email with Password Form */}
            <form onSubmit={formikEmail.handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[.07em] text-gray-400">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="jobseeker@example.com"
                    className={`login-input w-full h-11 rounded-xl pl-10 pr-4 text-sm text-gray-800 bg-[#faf8ff] transition-all duration-200 ${
                      formikEmail.touched.email && formikEmail.errors.email ? "err" : ""
                    }`}
                    style={{ border: "1.5px solid #e9e4f5" }}
                    onChange={formikEmail.handleChange}
                    onBlur={formikEmail.handleBlur}
                    value={formikEmail.values.email}
                  />
                </div>
                {formikEmail.touched.email && formikEmail.errors.email && (
                  <p className="mt-1 pl-1 text-xs text-red-500">{formikEmail.errors.email}</p>
                )}
              </div>

              <div>
                <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[.07em] text-gray-400">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className={`login-input w-full h-11 rounded-xl pl-10 pr-10 text-sm text-gray-800 bg-[#faf8ff] transition-all duration-200 ${
                      formikEmail.touched.password && formikEmail.errors.password ? "err" : ""
                    }`}
                    style={{ border: "1.5px solid #e9e4f5" }}
                    onChange={formikEmail.handleChange}
                    onBlur={formikEmail.handleBlur}
                    value={formikEmail.values.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formikEmail.touched.password && formikEmail.errors.password && (
                  <p className="mt-1 pl-1 text-xs text-red-500">{formikEmail.errors.password}</p>
                )}

                {/* Forgot Password Link */}
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cta-btn shimmer-btn relative w-full h-[46px] rounded-[14px] flex items-center justify-center gap-2
                  overflow-hidden text-white text-[15px] font-bold tracking-wide transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed mt-2 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7900BA 0%, #9333EA 100%)",
                  boxShadow: "0 8px 28px rgba(121,0,186,.28), 0 0 0 1px rgba(121,0,186,.15)",
                }}
              >
                {loading ? (
                  <>
                    <span className="anim-spin w-[18px] h-[18px] rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Or Divider */}
            <div className="flex items-center gap-3 my-4 text-gray-300 text-xs select-none">
              <span className="flex-1 h-px bg-gray-100" />
              <span className="text-gray-400 font-medium text-[11px] uppercase tracking-wider">Or continue with</span>
              <span className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Google Sign In Button */}
            <GoogleAuthButton mode="login" />

            {/* Divider */}
            <div className="flex items-center gap-3 my-6 text-gray-300 text-xs select-none">
              <span className="flex-1 h-px bg-gray-100" />
              <span className="text-gray-400 font-medium">New here?</span>
              <span className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Sign-up Link */}
            <p className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signUp")}
                className="font-bold hover:opacity-85 transition-opacity duration-200 cursor-pointer"
                style={{ color: "#f59e0b" }}
              >
                Create one →
              </button>
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="anim-slide-right hidden lg:flex relative z-10 flex-col items-center justify-center flex-1 px-10 py-12 h-full text-center">

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#7900BA] mb-4 flex-shrink-0"
            style={{ background: "rgba(121,0,186,.07)", border: "1px solid rgba(121,0,186,.15)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7900BA] animate-pulse" />
            1,200+ jobs posted this week
          </div>

          <h2 className="text-[32px] font-extrabold text-gray-900 tracking-tight leading-[1.12] mb-3">
            Find your next<br />
            <span className="text-[#7900BA]">great opportunity</span>
          </h2>
          <p className="text-[14px] text-gray-400 leading-relaxed max-w-[300px] mx-auto mb-8">
            Connect with top employers and discover roles that match your skills and ambitions.
          </p>

          <img
            src={rightImg}
            alt="Login visual"
            className="anim-float w-[85%] max-w-[380px] flex-shrink-0"
            style={{ filter: "drop-shadow(0 20px 48px rgba(121,0,186,.2))" }}
          />
        </div>

      </div>
    </>
  );
}
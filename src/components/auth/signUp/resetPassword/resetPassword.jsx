import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import logo from "../../../../assets/Logos.png";
import rightImg from "../../../../assets/verfyOtpLogo/Login.png";
import Skip from "../../../../pages/modules/skip/skip";
import { resetPassword, resetState } from "../../../../redux/slice/resetpassword/resetpasswordSlice";
import AuthLayout from "../../authLayout/AuthLayout";
import { addNotification } from "../../../../redux/slice/notification/notificationSlice";

// FIXED: Component moved outside to prevent losing focus on every keystroke
const PasswordInput = ({ name, placeholder, show, onToggle, formik }) => (
  <div className="relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex">
      <Lock size={15} />
    </span>
    <input
      type={show ? "text" : "password"}
      name={name}
      placeholder={placeholder}
      className={`login-input w-full h-12 rounded-xl pl-10 pr-11 text-sm text-gray-800 bg-[#faf8ff] transition-all duration-200 ${
        formik.touched[name] && formik.errors[name] ? "err" : ""
      }`}
      style={{ border: "1.5px solid #e9e4f5" }}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      value={formik.values[name]}
    />
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-[#7900BA] transition-colors duration-200"
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  </div>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const email = location.state?.email;
  const { loading, success, error } = useSelector((s) => s.resetpassword);

  useEffect(() => {
    dispatch(resetState());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: email || "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Please enter a valid email")
        .required("Email is required"),
      newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters long")
        .matches(/[A-Z]/, "Must include at least one uppercase letter")
        .matches(/[a-z]/, "Must include at least one lowercase letter")
        .matches(/[0-9]/, "Must include at least one number")
        .matches(/[^A-Za-z0-9]/, "Must include at least one special character")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const targetEmail = values.email?.trim() || email;
      try {
        const response = await dispatch(
          resetPassword({ email: targetEmail, newPassword: values.newPassword })
        ).unwrap();

        toast.success(response?.message || "Password reset successfully!", {
          toastId: "reset-password-success-toast",
        });

        dispatch(
          addNotification({
            title: "Password Reset Successful",
            desc: "Your password has been reset successfully. You can now log in with your new password.",
            type: "success",
          })
        );

        dispatch(resetState());
        navigate("/resetSuccess-password", { state: { email: targetEmail } });
      } catch (err) {
        toast.error(err || "Password reset failed", {
          toastId: "reset-password-error-toast",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const leftContent = (
    <>
      <div className="anim-slide-down mb-8">
        <img src={logo} alt="logo" className="w-[220px] object-contain" />
      </div>

      <div
        className="anim-slide-up w-full max-w-[400px] rounded-[24px] px-8 py-10 sm:px-10 bg-white max-h-[calc(100vh-140px)] overflow-y-auto auth-no-scrollbar"
        style={{
          border: "1px solid rgba(121,0,186,.1)",
          boxShadow: "0 0 0 1px rgba(121,0,186,.06),0 24px 64px rgba(121,0,186,.08),0 4px 16px rgba(0,0,0,.06)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
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
            <span className="flex items-center gap-1">
              <Sparkles size={11} />
              New Password
            </span>
          </span>
        </div>

        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight">
          Reset password
        </h1>
        <p className="mt-1.5 mb-6 text-sm text-gray-400">
          {email ? (
            <>Resetting password for <strong className="text-[#7900BA] font-semibold">{email}</strong></>
          ) : (
            "Choose a strong new password for your account."
          )}
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Email input if not already provided via location.state */}
          {!email && (
            <div>
              <label className="block mb-2 text-[11px] font-semibold uppercase tracking-[.07em] text-gray-400">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="candidate@example.com"
                className={`login-input w-full h-12 rounded-xl px-4 text-sm text-gray-800 bg-[#faf8ff] transition-all duration-200 ${
                  formik.touched.email && formik.errors.email ? "err" : ""
                }`}
                style={{ border: "1.5px solid #e9e4f5" }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1.5 pl-1 text-xs text-red-500">{formik.errors.email}</p>
              )}
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block mb-2 text-[11px] font-semibold uppercase tracking-[.07em] text-gray-400">
              New Password
            </label>
            <PasswordInput
              name="newPassword"
              placeholder="Min. 8 chars (Aa, 1, @)"
              show={showNew}
              onToggle={() => setShowNew((p) => !p)}
              formik={formik}
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="mt-1.5 pl-1 text-xs text-red-500">{formik.errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-[11px] font-semibold uppercase tracking-[.07em] text-gray-400">
              Confirm Password
            </label>
            <PasswordInput
              name="confirmPassword"
              placeholder="Repeat your password"
              show={showConfirm}
              onToggle={() => setShowConfirm((p) => !p)}
              formik={formik}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="mt-1.5 pl-1 text-xs text-red-500">{formik.errors.confirmPassword}</p>
            )}
          </div>

          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={() => navigate("/login", { state: { loginType: "email", email } })}
              className="text-xs font-semibold text-amber-500 hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cta-btn shimmer-btn relative w-full h-[50px] rounded-[14px] flex items-center justify-center gap-2
              overflow-hidden text-white text-[15px] font-bold tracking-wide transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#7900BA 0%,#9333EA 100%)",
              boxShadow: "0 8px 28px rgba(121,0,186,.28),0 0 0 1px rgba(121,0,186,.15)",
            }}
          >
            {loading ? (
              <>
                <span className="anim-spin w-[18px] h-[18px] rounded-full border-2 border-white/30 border-t-white" />
                Resetting…
              </>
            ) : (
              <>
                Reset Password <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <AuthLayout
      leftContent={leftContent}
      rightImage={rightImg}
      rightTitle={`Create a new<br/><span style="color:#7900BA">secure password</span>`}
      rightSub="Use at least 6 characters with a mix of letters and numbers for a strong password."
      rightPill={
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#7900BA]"
          style={{ background: "rgba(121,0,186,.07)", border: "1px solid rgba(121,0,186,.15)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#7900BA] animate-pulse" />
          Almost there!
        </div>
      }
    />
  );
}
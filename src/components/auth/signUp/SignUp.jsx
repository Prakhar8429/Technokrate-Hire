import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import "react-phone-input-2/lib/style.css";

import logo from "../../../assets/Logos.png";
import rightImg from "../../../assets/Mobile login-amico 1.png";
import Skip from "../../../pages/modules/skip/skip";
import { registerUser } from "../../../redux/slice/register/registerSlice";
import AuthLayout from "../../auth/authLayout/AuthLayout";
import GoogleAuthButton from "../GoogleAuthButton";

/* Phone input override */
const PHONE_STYLES = `
  .react-tel-input .form-control {
    width: 100% !important;
    height: 40px !important;
    background: #faf8ff !important;
    border: 1.5px solid #e9e4f5 !important;
    border-radius: 12px !important;
    font-size: 14px !important;
    color: #1f2937 !important;
    padding-left: 52px !important;
  }
  .react-tel-input .form-control:focus {
    border-color: #7900BA !important;
    box-shadow: 0 0 0 3px rgba(121,0,186,.12) !important;
    background: #fff !important;
    outline: none !important;
  }
  .react-tel-input .flag-dropdown {
    background: #faf8ff !important;
    border: 1.5px solid #e9e4f5 !important;
    border-right: none !important;
    border-radius: 12px 0 0 12px !important;
  }
  .react-tel-input .flag-dropdown.open,
  .react-tel-input .flag-dropdown:hover {
    background: #f3f0ff !important;
  }
  .react-tel-input .selected-flag {
    border-radius: 12px 0 0 12px !important;
    padding-left: 10px !important;
  }
  .react-tel-input .country-list {
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,.1) !important;
    border: 1px solid #e9e4f5 !important;
  }
  .react-tel-input .country-list .country:hover,
  .react-tel-input .country-list .country.highlight {
    background: #f3f0ff !important;
  }
    
`;

const handleTermsClick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  window.open("/terms", "_blank", "noopener,noreferrer");
};

const handlePrivacy = (e) => {
  e.preventDefault();
  e.stopPropagation();
  window.open("/privacy", "_blank", "noopener,noreferrer");
};

const PasswordRule = ({ text, met }) => (
  <div className="flex items-center gap-1.5">
    <span
      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200 ${met ? "bg-emerald-500" : "bg-[#7900BA]/40"}`}
    />
    <span
      className={`text-[11px] transition-colors duration-200 ${met ? "text-emerald-600" : "text-gray-400"}`}
    >
      {text}
    </span>
  </div>
);

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error } = useSelector((s) => s.auth);

  const formik = useFormik({
    initialValues: { fullName: "", mobileNumber: "", email: "", password: "", termsAccepted: false },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .max(30, "Full name cannot exceed 30 characters")
        .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces allowed")
        .required("Full name is required"),
      mobileNumber: Yup.string()
        .required("Mobile number is required")
        .test("is-valid-phone", "Enter a valid phone number", (value) => {
          if (!value) return false;
          const phone = parsePhoneNumberFromString(value);
          return phone ? phone.isValid() : false;
        }),
      email: Yup.string()
        .max(254, "Email address is too long (max 254 characters)")
        .test(
          "local-part-length",
          "The part before @ is too long (max 64 characters)",
          (value) => {
            if (!value) return true;
            const localPart = value.split("@")[0];
            return localPart.length <= 64;
          }
        )
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|net|org|co)$/,
          "Please enter a valid email (e.g. .com, .in, .net)",
        )
        .email("Invalid email format")
        .nullable(),
      password: Yup.string()
        .test("password-rules", "Password does not meet requirements", function(value) {
          if (!value) return true; // Optional
          const hasMin = value.length >= 8;
          const hasUpper = /[A-Z]/.test(value);
          const hasLower = /[a-z]/.test(value);
          const hasNum = /[0-9]/.test(value);
          const hasSpecial = /[!@#$%^&*]/.test(value);
          return hasMin && hasUpper && hasLower && hasNum && hasSpecial;
        })
        .nullable(),
      termsAccepted: Yup.boolean()
        .oneOf([true], "You must agree to the Terms and Conditions to create an account")
        .required("You must agree to the Terms and Conditions to create an account"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          fullName: values.fullName,
          mobileNumber: values.mobileNumber,
        };
        if (values.email) payload.email = values.email;
        if (values.password) payload.password = values.password;

        const result = await dispatch(registerUser(payload));
        if (registerUser.fulfilled.match(result)) {
          const data = result.payload || {};
          toast.success("OTP sent to your mobile number");
          
          let otpVal = "";
          if (typeof data.otp === "string" || typeof data.otp === "number") {
            otpVal = String(data.otp);
          } else if (data.otp && typeof data.otp === "object") {
            otpVal = String(data.otp.code || data.otp.otp || JSON.stringify(data.otp));
          } else if (data.data && (typeof data.data.otp === "string" || typeof data.data.otp === "number")) {
            otpVal = String(data.data.otp);
          }

          navigate("/verify-email", {
            state: {
              mobileNumber: String(values.mobileNumber || ""),
              otp: otpVal,
            },
          });
        } else {
          const errMsg = typeof result.payload === "string" ? result.payload : (result.payload?.message || "Registration failed");
          toast.error(errMsg);
        }
      } catch (err) {
        const errMsg = typeof err === "string" ? err : (err?.message || "An error occurred");
        toast.error(errMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const pw = formik.values.password;
  const rules = [
    { text: "8+ characters", met: pw.length >= 8 },
    { text: "Uppercase letter", met: /[A-Z]/.test(pw) },
    { text: "Lowercase letter", met: /[a-z]/.test(pw) },
    { text: "Number", met: /[0-9]/.test(pw) },
    { text: "Special character (!@#$%^&*)", met: /[!@#$%^&*]/.test(pw) },
  ];

  const leftContent = (
    <>
      <style>{PHONE_STYLES}</style>
      {/* Card */}
      <div
        className="anim-slide-up w-full max-w-[440px] rounded-[20px] sm:rounded-[24px] px-5 py-4 sm:px-8 sm:py-5 bg-white"
        style={{
          border: "1px solid rgba(121,0,186,.1)",
          boxShadow:
            "0 0 0 1px rgba(121,0,186,.06),0 24px 64px rgba(121,0,186,.08),0 4px 16px rgba(0,0,0,.06)",
        }}
      >
        {/* Card Header: Go Back & Badge */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#7900BA] bg-purple-50/80 hover:bg-purple-100 border border-purple-200 transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={13} className="text-[#7900BA]" />
            Go Back
          </button>

          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase text-[#7900BA]"
            style={{
              background: "rgba(121,0,186,.08)",
              border: "1px solid rgba(121,0,186,.18)",
            }}
          >
            <Sparkles size={11} />
            Job Seeker
          </span>
        </div>

        <h1 className="text-[20px] font-extrabold text-center text-gray-900 tracking-tight leading-tight">
          Create account
        </h1>
        <p className="mt-1 mb-3 text-sm text-gray-400 text-center">
          Join thousands finding their next opportunity
        </p>

        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-2.5 text-sm text-center text-red-600"
            style={{
              background: "rgba(239,68,68,.07)",
              border: "1px solid rgba(239,68,68,.2)",
            }}
          >
            {typeof error === "string" ? error : error?.message}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[.07em] text-gray-400">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex">
                <User size={15} />
              </span>
              <input
                name="fullName"
                maxLength={30}
                placeholder="John Doe"
                className={`login-input w-full h-10 rounded-xl pl-10 pr-4 text-sm text-gray-800 bg-[#faf8ff] transition-all duration-200 ${
                  formik.touched.fullName && formik.errors.fullName ? "err" : ""
                }`}
                style={{ border: "1.5px solid #e9e4f5" }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.fullName}
              />
            </div>
            {formik.touched.fullName && formik.errors.fullName && (
              <p className="mt-1 pl-1 text-xs text-red-500">
                {formik.errors.fullName}
              </p>
            )}
          </div>

          {/* Phone */}
          {/* <PhoneInput
  country="in"
  value={formik.values.mobileNumber}
  onChange={(phone) => formik.setFieldValue("mobileNumber", "+" + phone)}
  onBlur={() => formik.setFieldTouched("mobileNumber", true)}
  enableSearch
  disableCountryCode={false}
  disableDropdown={false}
  countryCodeEditable={false}
  masks={{ in: ".........."}}   // 👈 this removes dash formatting
  containerClass="!w-full"
  inputClass={`!w-full ${
    formik.touched.mobileNumber && formik.errors.mobileNumber
      ? "!border-red-400"
      : ""
  }`}
/> */}

          {/* Phone */}
          <div>
            <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[.07em] text-gray-400">
              Mobile Number
            </label>
            <PhoneInput
              country="in"
              value={formik.values.mobileNumber}
              onChange={(phone) =>
                formik.setFieldValue("mobileNumber", "+" + phone)
              }
              onBlur={() => formik.setFieldTouched("mobileNumber", true)}
              enableSearch
              disableCountryCode={false}
              disableDropdown={false}
              countryCodeEditable={false}
              masks={{ in: ".........." }}
              containerClass="!w-full"
              inputClass={`!w-full !h-10 !rounded-xl !text-sm !bg-[#faf8ff] !pl-12 ${
                formik.touched.mobileNumber && formik.errors.mobileNumber
                  ? "!border-red-300 !border-1 shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
                  : "!border-[#e9e4f5]"
              }`}
              buttonClass={`${
                formik.touched.mobileNumber && formik.errors.mobileNumber
                  ? "!border-red-300 !border-1 !border-r-0 error-dropdown"
                  : "!border-[#e9e4f5] !border-r-0"
              }`}
              dropdownClass="!rounded-xl"
            />
            {formik.touched.mobileNumber && formik.errors.mobileNumber && (
              <p className="mt-1 pl-1 text-xs text-red-500">
                {formik.errors.mobileNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[.07em] text-gray-400">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex">
                <Mail size={15} />
              </span>
              <input
                name="email"
                type="email"
                maxLength={254}
                placeholder="you@example.com"
                className={`login-input w-full h-10 rounded-xl pl-10 pr-4 text-sm text-gray-800 bg-[#faf8ff] transition-all duration-200 ${
                  formik.touched.email && formik.errors.email ? "err" : ""
                }`}
                style={{ border: "1.5px solid #e9e4f5" }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 pl-1 text-xs text-red-500">
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[.07em] text-gray-400">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex">
                <Lock size={15} />
              </span>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                className={`login-input w-full h-10 rounded-xl pl-10 pr-11 text-sm text-gray-800 bg-[#faf8ff] transition-all duration-200 ${
                  formik.touched.password && formik.errors.password ? "err" : ""
                }`}
                style={{ border: "1.5px solid #e9e4f5" }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-[#7900BA] transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 pl-1 text-xs text-red-500">
                {formik.errors.password}
              </p>
            )}

            {/* Password rules — live feedback */}
            {formik.values.password && (
              <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 px-1">
                {rules.map((r) => (
                  <PasswordRule key={r.text} {...r} />
                ))}
              </div>
            )}
          </div>

          {/* Terms and Conditions with Checkbox */}
          <div>
            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formik.values.termsAccepted}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#7900BA]"
              />
              <label htmlFor="termsAccepted" className="text-[12px] text-gray-400 leading-relaxed flex-1 cursor-pointer select-none">
                By creating an account you agree to our{" "}
                <span
                  onClick={handleTermsClick}
                  className="text-[#7900BA] underline cursor-pointer hover:opacity-70"
                >
                  Terms and Conditions
                </span>{" "}
                and{" "}
                <span
                  onClick={handlePrivacy}
                  className="text-[#7900BA] underline cursor-pointer hover:opacity-70"
                >
                  Privacy Policy
                </span>
              </label>
            </div>
            {formik.touched.termsAccepted && formik.errors.termsAccepted && (
              <p className="mt-1 pl-1 text-xs text-red-500 font-medium">
                {formik.errors.termsAccepted}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="cta-btn shimmer-btn relative w-full h-[40px] rounded-[14px] flex items-center justify-center gap-2
              overflow-hidden text-white text-[15px] font-bold tracking-wide transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#7900BA 0%,#9333EA 100%)",
              boxShadow:
                "0 8px 28px rgba(121,0,186,.28),0 0 0 1px rgba(121,0,186,.15)",
            }}
          >
            {loading ? (
              <>
                <span className="anim-spin w-[18px] h-[18px] rounded-full border-2 border-white/30 border-t-white" />
                Creating…
              </>
            ) : (
              <>
                Create Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Or Divider */}
        <div className="flex items-center gap-3 my-3 text-gray-300 text-xs select-none">
          <span className="flex-1 h-px bg-gray-100" />
          <span className="text-gray-400 font-medium text-[11px] uppercase tracking-wider">Or continue with</span>
          <span className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Google Sign Up Button */}
        <GoogleAuthButton mode="signup" />

        {/* Divider */}
        <div className="flex items-center justify-between gap-3 my-4 text-gray-300 text-xs select-none">
          {/* <span className="flex-1 h-px bg-gray-100" /> */}
          Already have an account?
          <span className="flex-1 h-px bg-gray-100" />
          <p className="text-center text-sm text-gray-400">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-amber-500 font-bold hover:opacity-70 transition-opacity duration-200"
            >
              Sign In →
            </button>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout
      leftContent={leftContent}
      rightImage={rightImg}
      rightTitle={`Start your<br/><span style="color:#7900BA">career journey</span>`}
      rightSub="Join thousands of job seekers who've already found their dream roles on Technokrate Hire."
      rightPill={
        <div
          className="inline-flex items-center gap-2 mt-5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#7900BA]"
          style={{
            background: "rgba(121,0,186,.07)",
            border: "1px solid rgba(121,0,186,.15)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#7900BA] animate-pulse" />
          1,200+ jobs posted this week
        </div>
      }
    />
  );
}

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowRight, ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import OtpInput from "react-otp-input"; // 1. Import the new input component

// Asset Imports
import logo from "../../../../assets/Logos.png";
import rightImg from "../../../../assets/verfyOtpLogo/Forgot password_amico.png";
import Skip from "../../../../pages/modules/skip/skip";
import AuthLayout from "../../authLayout/AuthLayout";

// Redux Imports (Paths must be correct)
import { sendForgotPasswordOtp } from "../../../../redux/slice/forgotPassword/forgotPasswordSlice";
import { verifyForgotPasswordOtp } from "../../../../redux/slice/verifyotp/verifyotpSlice";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const email = location.state?.email;

  // Local Loading States
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Timer States
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Countdown Logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Ensure email exists, otherwise redirect to forgot password
  useEffect(() => {
    if (!email) {
      toast.warn("Please enter your email to receive an OTP");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  // Handle Resend Action
  const handleResend = async () => {
    if (!canResend || isResending || !email) return;
    setIsResending(true);
    try {
      // .unwrap() gets the API response directly
      const res = await dispatch(sendForgotPasswordOtp(email)).unwrap();
      
      toast.success(res?.message || "Verification code resent successfully!");

      setTimer(30);
      setCanResend(false);
    } catch (err) {
      toast.error(err || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  // Formik Configuration
  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .length(4, "OTP must be 4 digits")
        .required("Email and OTP are required"),
    }),
    onSubmit: async (values) => {
      if (!email) {
        toast.error("Email is missing. Please restart recovery process.");
        navigate("/forgot-password");
        return;
      }
      setIsVerifying(true);
      try {
        const result = await dispatch(verifyForgotPasswordOtp({ email, otp: values.otp.trim() })).unwrap();
        toast.success(result.message || "OTP verified successfully");
        navigate("/reset-password", { state: { email } });
      } catch (err) {
        toast.error(err || "Invalid OTP");
      } finally {
        setIsVerifying(false);
      }
    },
  });

  const leftContent = (
    <>
      {/* Brand Logo */}
      <div className="anim-slide-down mt-4 sm:mt-2 mb-4 sm:mb-6 flex justify-center">
        <img src={logo} alt="logo" className="w-[150px] sm:w-[180px] lg:w-[210px] object-contain" />
      </div>

      {/* Main Card */}
      <div
        className="anim-slide-up w-full max-w-[440px] rounded-[20px] sm:rounded-[24px] px-5 py-6 sm:px-8 sm:py-8 bg-white"
        style={{
          border: "1px solid rgba(121,0,186,.1)",
          boxShadow: "0 0 0 1px rgba(121,0,186,.06), 0 24px 64px rgba(121,0,186,.08), 0 4px 16px rgba(0,0,0,.06)",
        }}
      >
        {/* Card Header: Go Back & Badge */}
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
            <Sparkles size={11} />
            Security Check
          </span>
        </div>

        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight text-center">
          Enter OTP
        </h1>
        <p className="mt-1.5 mb-8 text-sm text-gray-400 text-center">
          Check your email <span className="text-[#7900BA] font-medium">{email || "account"}</span> for the 4-digit code.
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-3">
          
          {/* 2. THE NEW OTP INPUT LAYOUT */}
          <div>
            <label className="block mb-2 text-[15px] font-semibold uppercase tracking-[.07em] text-gray-400 text-center">
              Enter 4-Digit Code
            </label>
            
            <div className="relative">
              <OtpInput
                value={formik.values.otp}
                onChange={(otpValue) => formik.setFieldValue("otp", otpValue)} // Update formik
                numInputs={4}
                shouldAutoFocus={true}
                inputMode="numeric"
                // CUSTOM STYLING FOR INDIVIDUAL BOXES:
                containerStyle={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    width: '100%'
                }}
                inputStyle={{
                    width: '100%',
                    height: window.innerWidth < 400 ? '48px' : '60px',
                    fontSize: window.innerWidth < 400 ? '18px' : '24px',
                    fontWeight: 'bold',
                    color: '#111827',
                    background: '#FAF8FF',
                    border: '1.5px solid #E9E4F5',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 200ms ease, box-shadow 200ms ease',
                }}
                // Custom handling for error and focus
                renderInput={(props, index) => {
                    // Inject dynamic error border if needed
                    if (formik.touched.otp && formik.errors.otp) {
                        props.style = { ...props.style, borderColor: '#ef4444' }; // border-red-500
                    }
                    
                    return <input {...props} />;
                }}
              />
            </div>
            
            {/* Error Message & Resend Row */}
            <div className="flex justify-between items-start mt-2 px-1">
              <div className="flex-1">
                {formik.touched.otp && formik.errors.otp && (
                  <p className="text-xs text-red-500">{formik.errors.otp}</p>
                )}
              </div>
              
              <button
                type="button"
                disabled={!canResend || isResending}
                onClick={handleResend}
                className={`text-[11px] font-bold flex items-center gap-1.5 transition-all duration-200 ${
                  canResend && !isResending ? "text-[#7900BA] hover:opacity-70" : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <RefreshCw size={11} className={isResending ? "animate-spin" : ""} />
                {isResending ? "Sending..." : canResend ? "Resend OTP" : `Resend in ${timer}s`}
              </button>
            </div>
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

          {/* MAIN VERIFY BUTTON */}
          <button
            type="submit"
            disabled={isVerifying || isResending}
            className="cta-btn shimmer-btn relative w-full h-11 sm:h-[52px] rounded-[14px] flex items-center justify-center gap-2
              overflow-hidden text-white text-sm sm:text-[15px] font-bold tracking-wide transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#7900BA 0%,#9333EA 100%)",
              boxShadow: "0 8px 28px rgba(121,0,186,.28), 0 0 0 1px rgba(121,0,186,.15)",
            }}
          >
            {isVerifying ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                Verify OTP <ArrowRight size={16} />
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
      rightTitle={`Securely verify your<br/><span style="color:#7900BA">account access</span>`}
      rightSub="We prioritize your security. Please enter the unique 4-digit code we sent to your inbox to proceed."
      rightPill={
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#7900BA]"
          style={{ background: "rgba(121,0,186,.07)", border: "1px solid rgba(121,0,186,.15)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#7900BA] animate-pulse" />
          Step 2 of 3
        </div>
      }
    />
  );
};

export default VerifyOtp;
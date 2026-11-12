import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Phone, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import logo from "../../../assets/Logos.png";
import rightImg from "../../../assets/Mobile login-amico 1.png";
import Skip from "../../../pages/modules/skip/skip";
import { verifyAccount } from "../../../redux/slice/verifyAccountUsingOtp/verifyAccountUsingOtpSlice";
import AuthLayout from "../../auth/authLayout/AuthLayout";

export default function SignupSelection() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const rawMobile = location.state?.mobileNumber;
  const mobileNumber = typeof rawMobile === "string" ? rawMobile : (rawMobile ? String(rawMobile) : "");

  const rawOtp = location.state?.otp;
  const devOtp = typeof rawOtp === "object" && rawOtp !== null
    ? String(rawOtp.otp || rawOtp.code || JSON.stringify(rawOtp))
    : (rawOtp ? String(rawOtp) : "");

  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem("isVerified");
      if (val === "undefined" || val === "null") {
        localStorage.removeItem("isVerified");
      }
    } catch (e) {}

    if (!mobileNumber) {
      toast.error("Please complete signup first");
      navigate("/signUp");
    }
  }, [mobileNumber, navigate]);

  /* ── OTP digit input ── */
  const handleOtpChange = (val, idx) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val;
    setOtpDigits(next);
    if (val && idx < 3) document.getElementById(`eotp-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0)
      document.getElementById(`eotp-${idx - 1}`)?.focus();
  };

  /* ── Verify OTP ── */
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length < 4) return toast.error("Please enter the complete OTP");
    setVerifyingOtp(true);
    try {
      const result = await dispatch(verifyAccount({ mobileNumber, otp })).unwrap();
      toast.success("Account created successfully 🎉");
      setOtpVerified(true);
      if (result && result.token) {
        localStorage.setItem("token", result.token);
      }
    } catch (err) {
      const errMsg = typeof err === "string" ? err : (err?.message || err?.error || "OTP verification failed");
      toast.error(errMsg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const leftContent = (
    <>
      {/* Logo */}
      <div className="anim-slide-down mt-4 sm:mt-2 mb-4 sm:mb-6">
        <img src={logo} alt="logo" className="w-[150px] sm:w-[180px] lg:w-[210px] object-contain" />
      </div>

      {/* Card */}
      <div
        className="anim-slide-up w-full max-w-[440px] rounded-[20px] sm:rounded-[24px] px-5 py-6 sm:px-8 sm:py-8 bg-white"
        style={{
          border: "1px solid rgba(121,0,186,.1)",
          boxShadow: "0 0 0 1px rgba(121,0,186,.06),0 24px 64px rgba(121,0,186,.08),0 4px 16px rgba(0,0,0,.06)",
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
            Account Verification
          </span>
        </div>

        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight">
          Verify your mobile
        </h1>
        <p className="mt-1.5 mb-8 text-sm text-gray-400">
          Enter the 4-digit verification code sent to your mobile.
        </p>

        {/* ── Verification box ── */}
        {otpVerified ? (
          /* Success state */
          <div
            className="anim-pop-in flex flex-col items-center gap-3 rounded-2xl px-6 py-8 mb-6"
            style={{ background: "rgba(16,185,129,.06)", border: "1.5px solid rgba(16,185,129,.25)" }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(16,185,129,.12)" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" stroke="rgba(16,185,129,.35)" strokeWidth="1.5" />
                <polyline
                  className="anim-check"
                  points="8,14 12,18 20,10"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-emerald-700">Mobile verified!</p>
            <p className="text-xs text-emerald-600/70 text-center">{mobileNumber}</p>
          </div>
        ) : (
          /* Verification card */
          <div
            className="rounded-2xl px-6 py-6 mb-6"
            style={{ background: "rgba(121,0,186,.04)", border: "1.5px solid rgba(121,0,186,.14)" }}
          >


            {/* Mobile number display */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(121,0,186,.1)" }}>
                <Phone size={16} className="text-[#7900BA]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Mobile</p>
                <p className="text-sm text-gray-800 font-medium truncate">{mobileNumber || "Loading…"}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-3 text-center">Enter the 4-digit code</p>

            {/* OTP boxes */}
            <div className="flex justify-center gap-3 mb-4">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`eotp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-gray-900 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 focus:outline-none"
                  style={{
                    background: digit ? "rgba(121,0,186,.08)" : "#faf8ff",
                    border: digit ? "1.5px solid rgba(121,0,186,.4)" : "1.5px solid #e9e4f5",
                    boxShadow: digit ? "0 0 0 3px rgba(121,0,186,.08)" : "none",
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || otpDigits.join("").length < 4}
              className="cta-btn shimmer-btn relative w-full h-11 rounded-[12px] flex items-center justify-center gap-2
                overflow-hidden text-white text-sm font-bold transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg,#7900BA 0%,#9333EA 100%)",
                boxShadow: "0 6px 20px rgba(121,0,186,.25)",
              }}
            >
              {verifyingOtp ? (
                <>
                  <span className="anim-spin w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />
                  Verifying…
                </>
              ) : (
                <>Verify OTP <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        )}

        {/* Continue */}
        <button
          onClick={() => navigate("/complete-profile")}
          disabled={!otpVerified}
          className="cta-btn shimmer-btn relative w-full h-[50px] rounded-[14px] flex items-center justify-center gap-2
            overflow-hidden text-white text-[15px] font-bold tracking-wide transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: otpVerified
              ? "linear-gradient(135deg,#059669 0%,#10b981 100%)"
              : "linear-gradient(135deg,#7900BA 0%,#9333EA 100%)",
            boxShadow: otpVerified
              ? "0 8px 28px rgba(16,185,129,.28)"
              : "0 8px 28px rgba(121,0,186,.28)",
          }}
        >
          Continue <ArrowRight size={16} />
        </button>

        {otpVerified && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Your mobile number has been verified. Let's complete your profile.
          </p>
        )}
      </div>
    </>
  );

  return (
    <AuthLayout
      leftContent={leftContent}
      rightImage={rightImg}
      rightTitle={`One step<br/><span style="color:#7900BA">closer!</span>`}
      rightSub="Verifying your mobile number keeps your account secure and helps employers trust your profile."
      rightPill={
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#7900BA]"
          style={{ background: "rgba(121,0,186,.07)", border: "1px solid rgba(121,0,186,.15)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Quick verification
        </div>
      }
    />
  );
}
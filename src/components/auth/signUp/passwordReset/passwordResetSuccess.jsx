import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

import logo from "../../../../assets/Logos.png";
import rightImg from "../../../../assets/verfyOtpLogo/Successful.png";
import Skip from "../../../../pages/modules/skip/skip";
import AuthLayout from "../../authLayout/AuthLayout";

export default function PasswordResetSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const leftContent = (
    <>
      <div className="anim-slide-down mb-8">
        <img src={logo} alt="logo" className="w-[220px] object-contain" />
      </div>

      <div
        className="anim-slide-up w-full max-w-[400px] rounded-[24px] px-8 py-10 sm:px-10 bg-white text-center max-h-[calc(100vh-140px)] overflow-y-auto auth-no-scrollbar"
        style={{
          border: "1px solid rgba(121,0,186,.1)",
          boxShadow: "0 0 0 1px rgba(121,0,186,.06),0 24px 64px rgba(121,0,186,.08),0 4px 16px rgba(0,0,0,.06)",
        }}
      >
        <div className="flex items-center justify-start mb-4">
          <button
            type="button"
            onClick={() => navigate("/login", { state: { loginType: "email", email } })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#7900BA] bg-purple-50/80 hover:bg-purple-100 border border-purple-200 transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={13} className="text-[#7900BA]" />
            Back to Sign In
          </button>
        </div>
        {/* Animated success icon */}
        <div className="anim-pop-in flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,rgba(121,0,186,.12) 0%,rgba(147,51,234,.08) 100%)",
              border: "2px solid rgba(121,0,186,.2)",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="rgba(121,0,186,.25)" strokeWidth="2" />
              <polyline
                className="anim-check"
                points="12,20 18,27 30,13"
                fill="none"
                stroke="#7900BA"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
          Password reset!
        </h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Your password has been successfully updated. You can now sign in with your new credentials.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6 text-gray-300 text-xs select-none">
          <span className="flex-1 h-px bg-gray-100" />
          Ready to go?
          <span className="flex-1 h-px bg-gray-100" />
        </div>

        <button
          onClick={() => navigate("/login", { state: { loginType: "email", email } })}
          className="cta-btn shimmer-btn relative w-full h-[50px] rounded-[14px] flex items-center justify-center gap-2
            overflow-hidden text-white text-[15px] font-bold tracking-wide transition-all duration-200 cursor-pointer"
          style={{
            background: "linear-gradient(135deg,#7900BA 0%,#9333EA 100%)",
            boxShadow: "0 8px 28px rgba(121,0,186,.28),0 0 0 1px rgba(121,0,186,.15)",
          }}
        >
          Sign In <ArrowRight size={16} />
        </button>
      </div>
    </>
  );

  return (
    <AuthLayout
      leftContent={leftContent}
      rightImage={rightImg}
      rightTitle={`You're all<br/><span style="color:#7900BA">set!</span>`}
      rightSub="Your account is secured with a new password. Sign in and continue your job search."
      rightPill={
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#7900BA]"
          style={{ background: "rgba(121,0,186,.07)", border: "1px solid rgba(121,0,186,.15)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Account secured
        </div>
      }
    />
  );
}
// src/pages/Homepage/BecomeCandidateOrEmployer/BecomeCandidateOrEmployer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
import { FaUserTie, FaBriefcase, FaCheckCircle } from "react-icons/fa";

const CANDIDATE_PERKS = ["Browse 1.75L+ live jobs", "One-click apply", "AI job matching"];
const EMPLOYER_PERKS = ["Post jobs for free", "Access top talent", "Smart candidate filters"];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const BecomeCandidateOrEmployer = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-16"
      style={{ background: "linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 60%, #f8f4ff 100%)" }}
    >
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-1 w-10 rounded-full bg-gradient-to-r from-purple-600 to-violet-400" />
          <span className="text-purple-600 text-sm font-semibold tracking-wide uppercase">Get Started Today</span>
          <div className="h-1 w-10 rounded-full bg-gradient-to-r from-violet-400 to-purple-600" />
        </div>
        <h2 className="font-bold text-[32px] sm:text-[38px] text-gray-900">
          Join{" "}
          <span style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Technokrate Hire
          </span>
          {" "}Today
        </h2>
        <p className="text-gray-400 text-[15px] mt-3">Choose your path and start your journey</p>
      </motion.div>

      {/* Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto"
      >

        {/* ── Candidate Card ── */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6, scale: 1.02 }}
          onClick={() => navigate("/signup")}
          className="relative flex flex-col gap-6 p-8 rounded-3xl bg-white border border-purple-100 overflow-hidden cursor-pointer"
          style={{ boxShadow: "0 4px 24px rgba(124,58,237,0.1)" }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 20px 48px rgba(124,58,237,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(124,58,237,0.1)")}
        >
          {/* Decorative blob */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-[0.08] blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
            <FaUserTie size={24} className="text-purple-600" />
          </div>

          <div>
            <h3 className="font-extrabold text-gray-900 text-[26px] leading-tight">Become a Candidate</h3>
            <p className="text-gray-500 text-[14px] leading-relaxed mt-2">
              Take the first step toward your next career opportunity. Connect with top employers and
              make your profile stand out in the competitive job market.
            </p>
          </div>

          {/* Perks */}
          <div className="flex flex-col gap-2">
            {CANDIDATE_PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <FaCheckCircle size={14} className="text-purple-500 shrink-0" />
                <span className="text-gray-600 text-[13.5px] font-medium">{perk}</span>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={(e) => { e.stopPropagation(); navigate("/signup"); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm w-fit cursor-pointer"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}
          >
            Register Now <HiArrowRight size={15} />
          </motion.button>
        </motion.div>

        {/* ── Employer Card ── */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6, scale: 1.02 }}
          onClick={() => window.open("https://employeer.technokratehire.com/login", "_blank", "noopener,noreferrer")}
          className="relative flex flex-col gap-6 p-8 rounded-3xl overflow-hidden cursor-pointer"
          style={{
            background: "linear-gradient(145deg, #1e0a3c 0%, #2d1060 60%, #1a0a35 100%)",
            boxShadow: "0 4px 24px rgba(124,58,237,0.25)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 20px 48px rgba(124,58,237,0.4)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(124,58,237,0.25)")}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
          {/* Grid dots */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <FaBriefcase size={22} className="text-purple-300" />
          </div>

          <div>
            <h3 className="font-extrabold text-white text-[26px] leading-tight">Become an Employer</h3>
            <p className="text-purple-200/70 text-[14px] leading-relaxed mt-2">
              Find the talent your business needs to succeed. Connect with skilled candidates who are
              ready to make an impact from day one.
            </p>
          </div>

          {/* Perks */}
          <div className="flex flex-col gap-2">
            {EMPLOYER_PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <FaCheckCircle size={14} className="text-purple-400 shrink-0" />
                <span className="text-purple-100/80 text-[13.5px] font-medium">{perk}</span>
              </div>
            ))}
          </div>

          <a href="https://employeer.technokratehire.com/login" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm w-fit text-purple-700 cursor-pointer"
              style={{ background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
            >
              Register Now <HiArrowRight size={15} />
            </motion.button>
          </a>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default BecomeCandidateOrEmployer;
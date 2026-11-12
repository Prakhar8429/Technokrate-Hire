// src/pages/Homepage/hero/Hero.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import Illustration from "../../../../assets/Illustration.png";
import briefcase from "../../../../assets/briefcase.png";
import buildingIcon from "../../../../assets/buildingIcon.png";
import userIcon from "../../../../assets/user_icon.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchStats } from "../../../../redux/slice/LandingPageSlice/statsSlice";
import { setFilters } from "../../../../redux/slice/findJob/findJobSlice";
import { toast } from "react-toastify";
import CompanyMarquee from "../../../../components/common/CompanyMarquee";
import TopCompaniesHiringNow from "../../../../components/common/TopCompaniesHiringNow";

/* ─── Data ──────────────────────────────────────────────────────────────────── */
// const STATS = [
//   { icon: briefcase, target: 175324, label: "Live Jobs" },
//   { icon: buildingIcon, target: 97345, label: "Companies" },
//   { icon: userIcon, target: 3847154, label: "Candidates" },
//   { icon: briefcase, target: 7532, label: "New Jobs" },
// ];

const SUGGESTIONS = [
  "Designer",
  "Programming",
  "Digital Marketing",
  "Video",
  "Animation",
];

/* ─── Format number Indian style ───────────────────────────────────────────── */
const fmtIN = (n) => Math.floor(n).toLocaleString("en-IN");

/* ─── useCountUp hook ───────────────────────────────────────────────────────── */
const useCountUp = (target, duration = 1800, trigger = false) => {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
      else setValue(target);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [trigger, target, duration]);

  return fmtIN(value);
};

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
const StatCard = ({ icon, target, label, cardDelay, animate }) => {
  const displayed = useCountUp(target, 1800, animate);

  return (
    <div
      className="relative flex gap-4 justify-center items-center h-[96px] rounded-2xl bg-white border border-gray-100 overflow-hidden group cursor-default"
      style={{
        opacity: animate ? 1 : 0,
        transform: animate
          ? "translateY(0) scale(1)"
          : "translateY(28px) scale(0.95)",
        transition: `opacity 0.6s ease ${cardDelay}ms, transform 0.6s ease ${cardDelay}ms`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 8px 28px rgba(124,58,237,0.18)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)")
      }
    >
      {/* Bottom border glow on hover */}
      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-violet-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />

      {/* Icon */}
      <div className="bg-purple-50 group-hover:bg-purple-100 transition-colors duration-300 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
        <img className="w-7 h-7 object-contain" src={icon} alt="" />
      </div>

      {/* Number + label */}
      <div className="flex flex-col gap-0.5 min-w-[80px]">
        <div className="flex items-baseline gap-0.5">
          <span className="font-extrabold text-xl text-gray-900 tabular-nums leading-none">
            {displayed}
          </span>
          <span className="text-purple-600 font-bold text-base leading-none">
            +
          </span>
        </div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
      </div>
    </div>
  );
};

/* ─── Hero ──────────────────────────────────────────────────────────────────── */
const Hero = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.stats);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({ searchQuery: "", location: "" });

  const isDisabled = !searchQuery.trim() && !location.trim();

  const isValidJobTitle = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return true;
    const validPattern = /^[A-Za-z0-9\s.,'&()+\-\/]+$/;
    const containsLetter = /[A-Za-z]/.test(trimmed);
    return validPattern.test(trimmed) && containsLetter;
  };

  const isValidLocation = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return true;
    const isZipCode = /^\d{5,6}$/.test(trimmed);
    if (isZipCode) return true;
    const validPattern = /^[A-Za-z0-9\s.,'&()+\-\/]+$/;
    const containsLetter = /[A-Za-z]/.test(trimmed);
    return validPattern.test(trimmed) && containsLetter;
  };

  const handleSearch = () => {
    const searchError = !isValidJobTitle(searchQuery)
      ? "Please enter a valid job title"
      : "";
    const locationError = !isValidLocation(location)
      ? "Please enter a valid location"
      : "";

    setErrors({ searchQuery: searchError, location: locationError });

    if (searchError || locationError) {
      if (searchError) toast.error(searchError);
      if (locationError) toast.error(locationError);
      return;
    }

    if (!searchQuery.trim() && !location.trim()) return;

    dispatch(
      setFilters({
        keyword: searchQuery.trim(),
        location: location.trim(),
        category: "",
        page: 1,
      })
    );

    navigate("/find-job", { state: { fromSearch: true } });
  };

  // ✅ API call
  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  // animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);
  const STATS = stats
    ? [
        { icon: briefcase, target: stats.activeJobsCount, label: "Live Jobs" },
        {
          icon: buildingIcon,
          target: stats.totalEmployersCount,
          label: "Companies",
        },
        {
          icon: userIcon,
          target: stats.totalJobSeekersCount,
          label: "Candidates",
        },
        { icon: briefcase, target: stats.newJobsCount, label: "New Jobs" },
      ]
    : [];
  useEffect(() => {
    dispatch(fetchStats());
  }, []);
  return (
    <>
      <style>{`
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .anim-right { animation: fadeSlideRight 0.7s ease both; }
        .anim-left  { animation: fadeSlideLeft  0.7s ease both; }
        .float      { animation: floatY 4s ease-in-out infinite; }
        .search-bar:focus-within {
          box-shadow: 0 0 0 3px rgba(124,58,237,0.18);
          border-color: rgba(124,58,237,0.4);
        }
        .chip:hover { background:#7c3aed; color:#fff; border-color:#7c3aed; }
        .cta-btn .fill {
          position:absolute; inset:0; background:#7c3aed;
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.3s ease; border-radius:14px;
          pointer-events: none;
        }
        .cta-btn:hover .fill { transform:scaleX(1); }
        .cta-btn:hover { color:#fff; }
      `}</style>

      <div className="bg-[#F1F2F499] max-w-9xl w-full min-h-screen px-4 sm:px-6  pt-3 overflow-hidden">
        {/* ── Top section ── */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-5 lg:gap-12 px-4 sm:px-6 lg:px-6">
          {/* LEFT */}
          <div className="mt-12 flex flex-col gap-6 max-w-xl w-full ">
            {/* Live badge */}
            <div
              className="anim-right inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold"
              style={{ animationDelay: "0ms" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
              </span>
              🚀 India's #1 Job Portal
            </div>

            {/* Headline */}
            <h1
              className="anim-right font-bold leading-tight text-[36px] sm:text-[42px] lg:text-[52px] text-gray-900"
              style={{ animationDelay: "100ms" }}
            >
              Find a job that suits{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                your interest
              </span>{" "}
              & skills.
            </h1>

            {/* Subtitle */}
            <p
              className="anim-right text-gray-500 text-[15px] leading-relaxed"
              style={{ animationDelay: "200ms" }}
            >
              Explore exciting opportunities tailored to your expertise and
              passions. Start your journey toward a career that truly fits you!
            </p>

            {/* Search bar */}
            <div
              className="anim-right search-bar flex flex-col sm:flex-row items-stretch sm:items-center border border-gray-200 shadow-lg bg-white rounded-2xl p-2 sm:min-h-[68px] gap-2 transition-all duration-300"
              style={{ animationDelay: "300ms" }}
            >
              <div className="relative flex-1 flex flex-col justify-center">
                <div className="relative">
                  <FaSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600"
                    size={14}
                  />
                  <input
                    className={`w-full rounded-xl py-2.5 pl-9 pr-3 outline-none text-sm transition-colors ${
                      errors.searchQuery
                        ? "border border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400 focus:bg-white"
                        : "bg-gray-50 focus:bg-white"
                    }`}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (errors.searchQuery) {
                        setErrors((prev) => ({ ...prev, searchQuery: "" }));
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    type="text"
                    placeholder="Job title, keyword..."
                  />
                </div>
                {errors.searchQuery && (
                  <span className="text-red-500 text-xs mt-1 pl-1 font-medium">
                    {errors.searchQuery}
                  </span>
                )}
              </div>
              <div className="hidden sm:block w-px bg-gray-200 h-8 self-center" />
              <div className="relative flex-1 flex flex-col justify-center">
                <div className="relative">
                  <FaMapMarkerAlt
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600"
                    size={14}
                  />
                  <input
                    className={`w-full rounded-xl py-2.5 pl-9 pr-3 outline-none text-sm transition-colors ${
                      errors.location
                        ? "border border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400 focus:bg-white"
                        : "bg-gray-50 focus:bg-white"
                    }`}
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) {
                        setErrors((prev) => ({ ...prev, location: "" }));
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Your Location"
                    type="text"
                  />
                </div>
                {errors.location && (
                  <span className="text-red-500 text-xs mt-1 pl-1 font-medium">
                    {errors.location}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isDisabled}
                className={`relative overflow-hidden font-semibold rounded-xl px-6 py-2.5 text-sm transition-all duration-200 shrink-0 group
    ${
      isDisabled
        ? "bg-[#7c3aed] text-white cursor-not-allowed"
        : "bg-[#7c3aed] hover:bg-[#6d28d9] text-white active:scale-95"
    }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <FaSearch size={12} /> Find Job
                </span>
              </button>
            </div>

            {/* Suggestions */}
            <div
              className="anim-right flex flex-wrap items-center gap-2"
              style={{ animationDelay: "400ms" }}
            >
              <span className="text-gray-400 text-xs font-medium">
                Trending:
              </span>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="chip px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-600 text-xs font-medium transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* CTA buttons */}
            <div
              className="anim-right flex flex-wrap gap-4"
              style={{ animationDelay: "500ms" }}
            >
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="cta-btn relative overflow-hidden border-2 border-[#7c3aed] text-[#7c3aed] font-semibold w-[220px] h-[52px] rounded-2xl flex items-center justify-center text-sm transition-colors duration-300 shadow-md cursor-pointer"
              >
                <span className="fill pointer-events-none" />
                <span className="relative z-10 pointer-events-none">Become a Candidate</span>
              </button>
              <a
                href="https://employeer.technokratehire.com/login"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  type="button"
                  className="cta-btn relative overflow-hidden border-2 border-[#7c3aed] text-[#7c3aed] font-semibold w-[220px] h-[52px] rounded-2xl flex items-center justify-center text-sm transition-colors duration-300 shadow-md cursor-pointer"
                >
                  <span className="fill pointer-events-none" />
                  <span className="relative z-10 pointer-events-none">Become an Employer</span>
                </button>
              </a>
            </div>
          </div>

          {/* RIGHT — illustration */}
          <div
            className="anim-left float relative shrink-0"
            style={{ animationDelay: "200ms" }}
          >
            <div className="absolute inset-0 bg-purple-200 opacity-20 rounded-full blur-3xl scale-110 pointer-events-none" />
            <img
              src={Illustration}
              alt="hero illustration"
              className="relative w-full max-w-[500px] lg:max-w-[560px] drop-shadow-2xl"
            />
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 mt-10 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-6">
          {STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              target={stat.target}
              label={stat.label}
              cardDelay={600 + i * 130}
              animate={visible}
            />
          ))}
        </div>

        {/* ── Moving Companies Marquee ── */}
        <div className="mt-2 pb-2 px-2 sm:px-6">
          <CompanyMarquee />
        </div>

        {/* ── Top Companies Hiring Now Grid ── */}
        <div className="px-2 sm:px-6 pb-8">
          <TopCompaniesHiringNow />
        </div>
      </div>
    </>
  );
};

export default Hero;

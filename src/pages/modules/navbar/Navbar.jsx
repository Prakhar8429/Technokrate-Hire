// src/pages/navbar/Navbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { RiArrowRightUpLine } from "react-icons/ri";
import logoImg from "../../../assets/finallogo.png";

const NAV_LINKS = [
  { label: "Blog",            href: "/blog",    external: false, route: "/blog"   },
  { label: "Subscription Plans",         href: "/pricing", external: false, route: "/pricing"},
  { label: "Employer Login",  href: "https://employeer.technokratehire.com/login", external: true, route: null },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setScrolled(scrollY > 24);
    };
   

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setIsOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const handleClick = (e, link) => {
    if (link.route) {
      e.preventDefault();
      navigate(link.route);
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="h-[68px] w-full" />
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 w-full"
      >
        <div
          className="w-full transition-all duration-500"
          style={{
            background: scrolled ? "rgba(10,8,25,0.92)" : "rgba(255,255,255,1)",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled
              ? "1px solid rgba(139,92,246,0.2)"
              : "1px solid rgba(0,0,0,0.07)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.3)"
              : "0 1px 6px rgba(0,0,0,0.06)",
          }}
        >
          {/* Glowing bottom line when scrolled */}
          {scrolled && (
            <div
              className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent)" }}
            />
          )}

          <div className="max-w-9xl mx-auto px-5 sm:px-10 lg:px-16 h-[68px] flex items-center justify-between">

            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center"
            >
              <img
                src={logoImg}
                alt="Technokrate Hire"
                className="w-44 object-contain"
                style={{ filter: scrolled ? "brightness(0) invert(1)" : "none" }}
              />
            </motion.div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.href}
                  onClick={(e) => handleClick(e, link)}
                  target={link.external ? "_blank" : "_self"}
                  rel={link.external ? "noopener noreferrer" : ""}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="relative px-4 py-2 rounded-lg text-[13.5px] font-semibold transition-colors duration-200 group"
                  style={{ color: scrolled ? "rgba(255,255,255,0.75)" : "#374151" }}
                >
                  <span
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: scrolled ? "rgba(139,92,246,0.15)" : "rgba(124,58,237,0.07)" }}
                  />
                  <span className="relative z-10 group-hover:text-purple-500 transition-colors duration-200 flex items-center gap-1">
                    {link.label}
                    {link.external && (
                      <RiArrowRightUpLine size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </span>
                  <span
                    className="absolute bottom-1 left-4 right-4 h-[2px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                  />
                </motion.a>
              ))}

              {/* Signup */}
              <motion.button
                onClick={() => navigate("/signUp")}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="relative ml-4 px-6 py-2.5 rounded-xl text-white text-[13.5px] font-bold overflow-hidden shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                }}
              >
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Signup <RiArrowRightUpLine size={15} />
                </span>
              </motion.button>
            </div>

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                border:      scrolled ? "1px solid rgba(139,92,246,0.3)" : "1px solid #e5e7eb",
                background:  scrolled ? "rgba(139,92,246,0.12)"         : "white",
                color:       scrolled ? "#c4b5fd"                        : "#374151",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.span key="x"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <HiX size={20} />
                  </motion.span>
                ) : (
                  <motion.span key="menu"
                    initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <HiMenuAlt3 size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ════════ MOBILE MENU ════════ */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[78%] max-w-sm md:hidden flex flex-col"
              style={{
                background: "linear-gradient(160deg, #0f0a1e 0%, #1a0e35 100%)",
                borderLeft: "1px solid rgba(139,92,246,0.25)",
                boxShadow: "-12px 0 48px rgba(0,0,0,0.4)",
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)" }} />

              {/* Header */}
              <div className="flex items-center justify-between px-6 h-[68px] shrink-0"
                style={{ borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
                <img src={logoImg} alt="Technokrate Hire" className="h-10 w-auto object-contain"
                  style={{ filter: "brightness(0) invert(1)" }} />
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-purple-300"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                  <HiX size={18} />
                </motion.button>
              </div>

              {/* Links */}
              <div className="flex flex-col gap-1 px-5 pt-6 flex-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a key={i} href={link.href}
                    onClick={(e) => handleClick(e, link)}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noopener noreferrer" : ""}
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.3, ease: "easeOut" }}
                    whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200 group"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.15)"; e.currentTarget.style.color = "#c4b5fd"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                  >
                    {link.label}
                    <RiArrowRightUpLine size={15} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                ))}
              </div>

              {/* CTA */}
              <div className="px-5 pb-8 pt-4" style={{ borderTop: "1px solid rgba(139,92,246,0.15)" }}>
                <motion.button
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.35 }}
                  onClick={() => { navigate("/signUp"); setIsOpen(false); }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 overflow-hidden relative"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.45)" }}
                >
                  <motion.span className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)", backgroundSize: "200% 100%" }}
                    animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} />
                  <span className="relative z-10">Get Started Free</span>
                  <RiArrowRightUpLine size={16} className="relative z-10" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
// // src/pages/Homepage/footer/Footer.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FaArrowRight, FaYoutube, FaTwitter,
//   FaMapMarkerAlt, FaPhoneAlt, FaEnvelope,
//   FaChevronRight,
// } from "react-icons/fa";
// import { TiSocialFacebook } from "react-icons/ti";
// import { FiInstagram } from "react-icons/fi";
// import logo from "../../../../assets/logo.jpg";

// /* ─── Data with routes ──────────────────────────────────────────────────────── */
// const NAV_LINKS = {
//   "Quick Links": [
//     { label: "About Us", route: "/about" },
//     { label: "Contact", route: "/contact" },
//     { label: "Subscription Plans", route: "/pricing" },
//     { label: "Blog", route: "/blog" },
//     // { label: "Careers",   route: "/careers" },
//   ],
//   "For Candidates": [
//     { label: "Browse Jobs", route: "/find-job" },
//     { label: "Browse Employers", route: "/find-job" },
//     { label: "Candidate Dashboard", route: "/dashboard" },
//     { label: "Saved Jobs", route: "/saved-jobs" },
//     { label: "Job Alerts", route: "/job-alerts" },
//   ],
//   "For Employers": [
//     { label: "Post a Job", href: "https://employeer.technokratehire.com/", external: true },
//     { label: "Browse Candidates", href: "https://employeer.technokratehire.com/", external: true },
//     { label: "Employer Dashboard", href: "https://employeer.technokratehire.com/", external: true },
//     { label: "Applications", href: "https://employeer.technokratehire.com/", external: true },
//     { label: "Pricing Plans", route: "/pricing" },
//   ],
//   "Support": [
//     { label: "FAQs", route: "/faq" },
//     { label: "Privacy Policy", route: "/privacy-policy" },
//     { label: "Terms & Conditions", route: "/terms-and-conditions" },
//     { label: "Cookie Policy", route: "/cookie-policy" },
//   ],
// };

// const CONTACT = [
//   { icon: <FaMapMarkerAlt size={13} />, text: "4th floor, Prince Complex, Chhatrapati Nagar, Nagpur 440015" },
//   // { icon: <FaPhoneAlt size={11} />, text: "+91 89569 92803", href: "tel:+918956992803" },
//   { icon: <FaEnvelope size={11} />, text: "support@technokratehire.com", href: "mailto:support@technokratehire.com" },
// ];

// const SOCIALS = [
//   { icon: <TiSocialFacebook size={20} />, href: "#", label: "Facebook", color: "#1877f2" },
//   { icon: <FaYoutube size={16} />, href: "#", label: "YouTube", color: "#ff0000" },
//   { icon: <FiInstagram size={16} />, href: "#", label: "Instagram", color: "#e4405f" },
//   { icon: <FaTwitter size={16} />, href: "#", label: "Twitter", color: "#1da1f2" },
// ];

// /* ─── FooterColumn ──────────────────────────────────────────────────────────── */
// const FooterColumn = ({ title, links }) => {
//   const navigate = useNavigate();

//   return (
//     <div className="flex flex-col gap-3">
//       <h5 className="text-white font-bold text-[15px] pb-2 relative">
//         {title}
//         <span className="absolute bottom-0 left-0 w-16 h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-purple-300" />
//       </h5>
//       <ul className="flex flex-col gap-2.5">
//         {links.map((link, i) => (
//           <li key={i}>
//             {link.external ? (
//               /* External employer links */
//               <a
//                 href={link.href}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="group flex items-center gap-1.5 text-gray-300 hover:text-purple-400 text-[13px] transition-all duration-200"
//               >
//                 <FaChevronRight size={9} className="text-purple-500/40 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
//                 <span className="group-hover:translate-x-0.5 transition-transform duration-200 inline-block">{link.label}</span>
//               </a>
//             ) : (
//               /* Internal routes */
//               <button
//                 onClick={() => navigate(link.route)}
//                 className="group flex items-center gap-1.5 text-gray-300 hover:text-purple-400 text-[13px] transition-all duration-200 text-left w-full"
//               >
//                 <FaChevronRight size={9} className="text-purple-500/40 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
//                 <span className="group-hover:translate-x-0.5 transition-transform duration-200 inline-block">{link.label}</span>
//               </button>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// /* ─── Footer ────────────────────────────────────────────────────────────────── */
// const Footer = () => {
//   const [email, setEmail] = useState("");
//   const [subscribed, setSubscribed] = useState(false);
//   const navigate = useNavigate()
//   const handleSubscribe = () => {
//     if (email.includes("@") && email.includes(".")) {
//       setSubscribed(true);
//       setTimeout(() => setSubscribed(false), 3000);
//       setEmail("");
//     }
//   };

//   return (
//     <footer className="relative bg-gradient-to-b from-[#0a0a1a] to-[#050510] text-white overflow-hidden">

//       {/* ── Background effects ── */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.14)_0%,_transparent_60%)]" />
//         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.08)_0%,_transparent_70%)]" />
//         <div className="absolute top-16 left-8 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-16 right-8 w-96 h-96 bg-purple-700/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
//         <div
//           className="absolute inset-0 opacity-[0.025]"
//           style={{
//             backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.9) 1px, transparent 1px)",
//             backgroundSize: "28px 28px",
//           }}
//         />
//       </div>

//       {/* ── Top glow border ── */}
//       <div className="relative h-[1px] overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
//         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-sm" />
//       </div>

//       <div className="relative max-w-9xl mx-auto px-6 lg:px-10 pt-16 pb-12">

//         {/* Main 3-col grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">

//           {/* COL 1: Logo + Tagline */}
//           <div className="lg:col-span-3 flex flex-col gap-5">
//             <div className="relative inline-block w-fit">
//               <div className="absolute -inset-2 bg-purple-600/15 rounded-xl blur-lg" />
//               <img src={logo} className="relative w-36 object-contain" alt="TechnokrateHire" />
//             </div>
//             <p className="text-gray-300 text-[13.5px] leading-relaxed">
//               Technokrate Hire is a modern job portal designed to connect talented professionals with top companies across various industries. The platform enables job seekers to discover opportunities that match their skills while helping employers find the right candidates quickly and efficiently.
//             </p>
//             <p className="text-purple-400 font-semibold text-[13px]">
//               ✨ Smart Hiring. Faster Careers.
//             </p>
//           </div>

//           {/* COL 2: 4 Nav columns */}
//           <div className="lg:col-span-6">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
//               {Object.entries(NAV_LINKS).map(([title, links]) => (
//                 <FooterColumn key={title} title={title} links={links} />
//               ))}
//             </div>
//           </div>

//           {/* COL 3: Contact + Socials */}
//           <div className="lg:col-span-3 flex flex-col gap-5">
//             <h5 className="text-white font-bold text-[15px] pb-2 relative">
//               Get In Touch
//               <span className="absolute bottom-0 left-0 w-7 h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-purple-300" />
//             </h5>

//             <div className="flex flex-col gap-3">
//               {CONTACT.map((c, i) => (
//                 <div key={i} className="flex items-start gap-3 group">
//                   <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-all duration-200 mt-0.5">
//                     {c.icon}
//                   </div>
//                   {c.href ? (
//                     <a href={c.href} className="text-gray-300 text-[13px] leading-[1.6] hover:text-purple-400 transition-colors duration-200">
//                       {c.text}
//                     </a>
//                   ) : (
//                     <span className="text-gray-300 text-[13px] leading-[1.6]">{c.text}</span>
//                   )}
//                 </div>
//               ))}
//             </div>

//             <div className="h-px bg-white/[0.06]" />

//             <div>
//               <p className="text-gray-500 text-[12px] mb-3 uppercase tracking-wider font-medium">Follow Us</p>
//               <div className="flex items-center gap-3">
//                 {SOCIALS.map((s, i) => (
//                   <a
//                     key={i}
//                     href={s.href}
//                     aria-label={s.label}
//                     className="group w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-white/[0.04] text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 overflow-hidden relative"
//                   >
//                     <span
//                       className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
//                       style={{ backgroundColor: s.color }}
//                     />
//                     <span className="relative z-10">{s.icon}</span>
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom bar */}
//         <div className="relative pt-6">
//           <div className="absolute top-0 left-[20%] right-[20%] h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
//           <div className="flex items-center justify-center">
//             <p className="text-gray-100 text-[12.5px] text-center">
//               © Design and Developed by{" "}
//               <span
//                 className="font-semibold cursor-pointer"
//                 onClick={() => window.open("https://www.talentrisetechnokrate.com/", "_blank")}
//                 style={{
//                   backgroundImage: "linear-gradient(to right,#a78bfa,#818cf8)",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                 }}
//               >
//                 Talentrise Technokrate Pvt Ltd
//               </span>{" "}
//               and Copyright by{" "}
//               <span
//                 className="font-semibold cursor-pointer"
//                 onClick={() => {
//                   if (window.location.pathname === "/") {
//                     // already home → scroll to top
//                     window.scrollTo({ top: 0, behavior: "smooth" });
//                   } else {
//                     // go to home
//                     navigate("/");
//                   }
//                 }}
//                 style={{
//                   backgroundImage: "linear-gradient(to right,#a78bfa,#818cf8)",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                 }}
//               >
//                 Technokrate Hire
//               </span>
//             </p>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;










import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetFilters } from "../../../../redux/slice/findJob/findJobSlice";
import {
  FaArrowRight, FaYoutube, FaTwitter, FaLinkedin,
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope,
  FaChevronRight,
} from "react-icons/fa";
import { TiSocialFacebook } from "react-icons/ti";
import { FiInstagram } from "react-icons/fi";
import logo from "../../../../assets/finallogo.png";

/* ─── Data with routes ──────────────────────────────────────────────────────── */
const NAV_LINKS = {
  "Quick Links": [
    { label: "Home", route: "/" },
    { label: "About Us", route: "/about" },
    { label: "Contact", route: "/contact" },
    { label: "Subscription Plans", route: "/pricing" },
    { label: "Blog", route: "/blog" },
     { label: "Investor/Partners", route: "/investors" },
    // { label: "Careers",   route: "/careers" },
  ],
  "For Candidates": [
    { label: "Browse Jobs", route: "/find-job" },
    { label: "Browse Employers", route: "/find-employers" },
    { label: "Candidate Dashboard", route: "/dashboard" },
    { label: "Saved Jobs", route: "/saved-jobs" },
    { label: "Job Alerts", route: "/job-alerts" },
  ],
  "For Employers": [
    { label: "Post a Job", href: "https://employeer.technokratehire.com/login", external: true },
    { label: "Browse Candidates", href: "https://employeer.technokratehire.com/login", external: true },
    { label: "Employer Dashboard", href: "https://employeer.technokratehire.com/login", external: true },
    { label: "Applications", href: "https://employeer.technokratehire.com/login", external: true },
    { label: "Pricing Plans", route: "/pricing" },
  ],
  "Support": [
    { label: "FAQs", route: "/faq" },
    { label: "Privacy Policy", route: "/privacy-policy" },
    { label: "Terms & Conditions", route: "/terms-and-conditions" },
    { label: "Cookie Policy", route: "/cookie-policy" },
  ],
};

const CONTACT = [
  { icon: <FaMapMarkerAlt size={13} />, text: "Narendra Nagar Extension, Madhuban Layout, Nagpur, Maharashtra 440015" },
  // { icon: <FaPhoneAlt size={11} />, text: "+91 89569 92803", href: "tel:+918956992803" },
  { icon: <FaEnvelope size={11} />, text: "support@technokratehire.com", href: "mailto:support@technokratehire.com" },
];

const SOCIALS = [
  { icon: <TiSocialFacebook size={20} />, href: "https://www.facebook.com/p/Talentrise-Technokrate-Pvt-Ltd-100093741976560", label: "Facebook", color: "#1877f2" },
  { icon: <FaLinkedin size={16} />, href: "https://www.linkedin.com/company/technokrate-hire/?viewAsMember=true", label: "YouTube", color: "#ff0000" },
  { icon: <FaYoutube size={16} />, href: "https://www.youtube.com/@TalentriseTechnorkate", label: "YouTube", color: "#ff0000" },
  { icon: <FiInstagram size={16} />, href: "https://www.instagram.com/talentrise_technokrate/?hl=en", label: "Instagram", color: "#e4405f" },
  { icon: <FaTwitter size={16} />, href: "https://twitter.com/technokratehire", label: "Twitter", color: "#1da1f2" },
];

/* ─── FooterColumn ──────────────────────────────────────────────────────────── */
const FooterColumn = ({ title, links }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigation = (route) => {
    // Footer se Browse Jobs hamesha fresh, unfiltered job list kholega.
    if (route === "/find-job") dispatch(resetFilters());
    navigate(route);

      setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="flex flex-col gap-3">
      <h5 className="text-white font-bold text-[15px] pb-2 relative">
        {title}
        <span className="absolute bottom-0 left-0 w-16 h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-purple-300" />
      </h5>
      <ul className="flex flex-col gap-2.5">
        {links.map((link, i) => (
          <li key={i}>
            {link.external ? (
              /* External employer links */
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-gray-300 hover:text-purple-400 text-[13px] transition-all duration-200"
              >
                <FaChevronRight size={9} className="text-purple-500/40 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200 inline-block">{link.label}</span>
              </a>
            ) : (
              /* Internal routes */
              <button
                onClick={() => handleNavigation(link.route)}
                className="group flex items-center gap-1.5 text-gray-300 hover:text-purple-400 text-[13px] transition-all duration-200 text-left w-full"
              >
                <FaChevronRight size={9} className="text-purple-500/40 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200 inline-block">{link.label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ─── Footer ────────────────────────────────────────────────────────────────── */
const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate()
  
  const handleSubscribe = () => {
    if (email.includes("@") && email.includes(".")) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  const handleCopyrightNavigation = () => {
    if (window.location.pathname === "/") {
      // already home → scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // go to home
      navigate("/");
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0a0a1a] to-[#050510] text-white overflow-hidden">

      {/* ── Background effects ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.14)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.08)_0%,_transparent_70%)]" />
        <div className="absolute top-16 left-8 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-16 right-8 w-96 h-96 bg-purple-700/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ── Top glow border ── */}
      <div className="relative h-[1px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-sm" />
      </div>

      <div className="relative max-w-9xl mx-auto px-6 lg:px-10 pt-16 pb-12">

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">

          {/* COL 1: Logo + Tagline */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="relative inline-block w-fit">
              <div className="absolute -inset-2 bg-purple-600/15 rounded-xl blur-lg" />
              <div className="relative bg-white rounded px-1.5 h-10 overflow-hidden flex items-center shadow-lg shadow-black/10">
                <img src={logo} className="w-36 h-auto object-contain block translate-y-0.5" alt="TechnokrateHire" />
              </div>
            </div>
            <p className="text-gray-300 text-[13.5px] leading-relaxed">
              Technokrate Hire is a modern job portal designed to connect talented professionals with top companies across various industries. The platform enables job seekers to discover opportunities that match their skills while helping employers find the right candidates quickly and efficiently.
            </p>
            <p className="text-purple-400 font-semibold text-[13px]">
              ✨ Smart Hiring. Faster Careers.
            </p>
          </div>

          {/* COL 2: 4 Nav columns */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
              {Object.entries(NAV_LINKS).map(([title, links]) => (
                <FooterColumn key={title} title={title} links={links} />
              ))}
            </div>
          </div>

          {/* COL 3: Contact + Socials */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <h5 className="text-white font-bold text-[15px] pb-2 relative">
              Get In Touch
              <span className="absolute bottom-0 left-0 w-7 h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-purple-300" />
            </h5>

            <div className="flex flex-col gap-3">
              {CONTACT.map((c, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-all duration-200 mt-0.5">
                    {c.icon}
                  </div>
                  {c.href ? (
                    <a href={c.href} className="text-gray-300 text-[13px] leading-[1.6] hover:text-purple-400 transition-colors duration-200">
                      {c.text}
                    </a>
                  ) : (
                    <span className="text-gray-300 text-[13px] leading-[1.6]">{c.text}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div>
              <p className="text-white hover:text-purple-400 transition-colors duration-200 cursor-pointer text-[12px] mb-3 uppercase tracking-wider font-medium">
                Follow Us
              </p>
              <div className="flex items-center gap-3">
                {SOCIALS.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="group w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-white/[0.04] text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 overflow-hidden relative"
                  >
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="relative z-10">{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative pt-6">
          <div className="absolute top-0 left-[20%] right-[20%] h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <div className="flex items-center justify-center">
            <p className="text-gray-100 text-[12.5px] text-center">
              © Design and Developed by{" "}
              <span
                className="font-semibold cursor-pointer"
                onClick={() => window.open("https://www.talentrisetechnokrate.com/", "_blank")}
                style={{
                  backgroundImage: "linear-gradient(to right,#a78bfa,#818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Talentrise Technokrate Pvt Ltd
              </span>{" "}
              and Copyright by{" "}
              <span
                className="font-semibold cursor-pointer"
                onClick={handleCopyrightNavigation}
                style={{
                  backgroundImage: "linear-gradient(to right,#a78bfa,#818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Technokrate Hire
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

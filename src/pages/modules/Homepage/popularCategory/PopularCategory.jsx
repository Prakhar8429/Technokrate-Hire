// // src/pages/Homepage/popularCategory/PopularCategory.jsx
// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { FaArrowRight, FaPenNib, FaCode, FaMusic, FaDatabase } from "react-icons/fa";
// import { LuMonitorPlay } from "react-icons/lu";
// import { HiOutlineSpeakerphone } from "react-icons/hi";
// import { PiBuildingOffice } from "react-icons/pi";
// import { RiFirstAidKitLine } from "react-icons/ri";
// import { HiArrowRight } from "react-icons/hi";
// import { fetchPopularCategories } from "../../../../redux/slice/LandingPageSlice/popularCategoriesSlice";
// import { useDispatch, useSelector } from "react-redux";
// const CATEGORIES = [
//   { icon: <FaPenNib size={22} />, label: "Graphics & Design", count: 357, color: "#f59e0b", bg: "#fffbeb", border: "#fef3c7" },
//   { icon: <FaCode size={22} />, label: "Code & Programming", count: 312, color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" },
//   { icon: <HiOutlineSpeakerphone size={22} />, label: "Digital Marketing", count: 297, color: "#0ea5e9", bg: "#f0f9ff", border: "#e0f2fe" },
//   { icon: <LuMonitorPlay size={22} />, label: "Video & Animation", count: 247, color: "#ec4899", bg: "#fdf2f8", border: "#fce7f3" },
//   { icon: <FaMusic size={22} />, label: "Data Science & Analytics", count: 204, color: "#10b981", bg: "#f0fdf4", border: "#dcfce7" },
//   { icon: <PiBuildingOffice size={22} />, label: "UI/UX Design", count: 167, color: "#8b5cf6", bg: "#faf5ff", border: "#f3e8ff" },
//   { icon: <RiFirstAidKitLine size={22} />, label: "Blockchain Technology", count: 125, color: "#f97316", bg: "#fff7ed", border: "#ffedd5" },
//   { icon: <FaDatabase size={22} />, label: "Cybersecurity", count: 57, color: "#ef4444", bg: "#fef2f2", border: "#fee2e2" },
// ];

// const containerVariants = {
//   hidden: {},
//   visible: { transition: { staggerChildren: 0.07 } },
// };

// const cardVariants = {
//   hidden: { opacity: 0, y: 28, scale: 0.95 },
//   visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
// };

// const headingVariants = {
//   hidden: { opacity: 0, y: -20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
// };

// const PopularCategory = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { categories, loading } = useSelector(
//     (state) => state.popularCategories
//   );

//   useEffect(() => {
//     dispatch(fetchPopularCategories());
//   }, [dispatch]);

//   return (
//     <section className="bg-[#fafafa] w-full py-16 px-4 sm:px-6 lg:px-16">

//       {/* Heading */}
//       <motion.div
//         variants={headingVariants}
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.3 }}
//         className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
//       >
//         <div>
//           <div className="flex items-center gap-3 mb-3">
//             <div className="h-1 w-10 rounded-full bg-gradient-to-r from-purple-600 to-violet-400" />
//             <span className="text-purple-600 text-sm font-semibold tracking-wide uppercase">Browse by Category</span>
//           </div>
//           <h2 className="font-bold text-[32px] sm:text-[38px] text-gray-900 leading-tight">
//             Popular{" "}
//             <span style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//               Categories
//             </span>
//           </h2>
//           <p className="text-gray-400 text-[14.5px] mt-2">Find the domain that matches your passion and expertise</p>
//         </div>

//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.97 }}
//           onClick={() => navigate("/login")}
//           className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold text-sm transition-all duration-200 shrink-0"
//         >
//           View All <FaArrowRight size={12} />
//         </motion.button>
//       </motion.div>

//       {/* Cards */}
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.1 }}
//         className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
//       >
//         {CATEGORIES.map((cat, i) => (
//           <motion.div
//             key={i}
//             variants={cardVariants}
//             whileHover={{ y: -6, scale: 1.03 }}
//             whileTap={{ scale: 0.97 }}
//             className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white border cursor-pointer overflow-hidden"
//             style={{ borderColor: cat.border, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
//             onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 12px 32px ${cat.color}22`)}
//             onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)")}
//           >
//             {/* Hover bg tint */}
//             <motion.div
//               className="absolute inset-0 rounded-2xl pointer-events-none"
//               style={{ backgroundColor: cat.bg }}
//               initial={{ opacity: 0 }}
//               whileHover={{ opacity: 1 }}
//               transition={{ duration: 0.2 }}
//             />

//             {/* Glow blob */}
//             <div
//               className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-xl pointer-events-none"
//               style={{ backgroundColor: cat.color }}
//             />

//             {/* Icon */}
//             <div
//               className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
//               style={{ backgroundColor: cat.bg, color: cat.color, border: `1.5px solid ${cat.border}` }}
//             >
//               {cat.icon}
//             </div>

//             {/* Text */}
//             <div className="relative z-10 flex-1 min-w-0">
//               <h5 className="font-bold text-gray-800 text-[14px] leading-snug group-hover:text-gray-900 truncate">
//                 {cat.title}
//               </h5>
//               <p className="text-gray-400 text-[12px] mt-0.5 font-medium">{cat.count} Open positions</p>
//             </div>

//             {/* Arrow */}
//             <motion.div
//               className="relative z-10 shrink-0"
//               style={{ color: cat.color }}
//               initial={{ opacity: 0, x: -6 }}
//               whileHover={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.2 }}
//             >
//               <HiArrowRight size={16} />
//             </motion.div>
//           </motion.div>
//         ))}
//       </motion.div>
//     </section>
//   );
// };

// export default PopularCategory;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaSearch } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchPopularCategories } from "../../../../redux/slice/LandingPageSlice/popularCategoriesSlice";
import { setFilters } from "../../../../redux/slice/findJob/findJobSlice";

// const CATEGORIES = [
//   { icon: <FaPenNib size={22} />, label: "Graphics & Design", count: 357, color: "#f59e0b", bg: "#fffbeb", border: "#fef3c7" },
//   { icon: <FaCode size={22} />, label: "Code & Programming", count: 312, color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" },
//   { icon: <HiOutlineSpeakerphone size={22} />, label: "Digital Marketing", count: 297, color: "#0ea5e9", bg: "#f0f9ff", border: "#e0f2fe" },
//   { icon: <LuMonitorPlay size={22} />, label: "Video & Animation", count: 247, color: "#ec4899", bg: "#fdf2f8", border: "#fce7f3" },
//   { icon: <FaMusic size={22} />, label: "Data Science & Analytics", count: 204, color: "#10b981", bg: "#f0fdf4", border: "#dcfce7" },
//   { icon: <PiBuildingOffice size={22} />, label: "UI/UX Design", count: 167, color: "#8b5cf6", bg: "#faf5ff", border: "#f3e8ff" },
//   { icon: <RiFirstAidKitLine size={22} />, label: "Blockchain Technology", count: 125, color: "#f97316", bg: "#fff7ed", border: "#ffedd5" },
//   { icon: <FaDatabase size={22} />, label: "Cybersecurity", count: 57, color: "#ef4444", bg: "#fef2f2", border: "#fee2e2" },
// ];
/* animations */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const getOpenPositions = (category) => {
  const count =
    category?.openPositions ??
    category?.totalJobs ??
    category?.jobCount ??
    category?.count ??
    category?.jobs?.data?.length ??
    category?.jobs?.length ??
    category?.jobIds?.length;

  const numericCount = Number(count);
  return Number.isFinite(numericCount) ? numericCount : 0;
};

const getCategoryKey = (category, index) =>
  category?._id || category?.id || category?.title || category?.name || index;

const PopularCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [jobSearchCounts, setJobSearchCounts] = useState({});

  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const categoriesFromState = useSelector(
    (state) => state.popularCategories?.categories
  );
  const loading = useSelector(
    (state) => state.popularCategories?.loading ?? false
  );
  const categories = Array.isArray(categoriesFromState) ? categoriesFromState : [];
  const categoryKeys = categories.map((cat, index) => getCategoryKey(cat, index)).join(",");

  useEffect(() => {
    dispatch(fetchPopularCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!categories.length) return;

    let isMounted = true;
    const rawBase = import.meta.env.VITE_API_BASE_URL || "https://new-job-portal-be-2f6y.onrender.com";
    const cleanBase = rawBase.replace(/\/+$/, "");

    const fetchCounts = async () => {
      const countResults = await Promise.allSettled(
        categories.map((cat, index) => {
          const title = cat.title || cat.name || cat.categoryName;
          if (!title) return Promise.resolve(null);

          return axios
            .get(`${cleanBase}/api/jobseeker/search/jobsearch`, {
              params: {
                keyword: title,
                limit: 1,
                page: 1,
              },
            })
            .then((response) => ({
              key: getCategoryKey(cat, index),
              totalJobs: Number(response.data?.totalJobs),
            }));
        })
      );

      if (!isMounted) return;

      const nextCounts = {};
      countResults.forEach((result) => {
        if (
          result.status === "fulfilled" &&
          result.value?.key &&
          Number.isFinite(result.value.totalJobs)
        ) {
          nextCounts[result.value.key] = result.value.totalJobs;
        }
      });

      setJobSearchCounts(nextCounts);
    };

    fetchCounts();

    return () => {
      isMounted = false;
    };
  }, [categoryKeys]);

  const filteredCategories =
    search.trim() === ""
      ? categories
      : categories.filter((cat) => {
        const title = (
          cat.title ||
          cat.name ||
          cat.categoryName ||
          ""
        ).toLowerCase();

        return title.includes(search.trim().toLowerCase());
      });

  const getCategoryOpenings = (category, index) =>
    jobSearchCounts[getCategoryKey(category, index)] ?? getOpenPositions(category);

  const categoriesByOpenings = [...filteredCategories].sort(
    (firstCategory, secondCategory) =>
      getCategoryOpenings(secondCategory, categories.indexOf(secondCategory)) -
      getCategoryOpenings(firstCategory, categories.indexOf(firstCategory))
  );

  const visibleCategories =
    showAll || search.trim() !== ""
      ? categoriesByOpenings
      : categoriesByOpenings.slice(0, 9);

  const canViewAll =
    search.trim() === "" && !showAll && filteredCategories.length > 9;

  return (
    <section className="bg-[#fafafa] w-full py-16 px-4 sm:px-6 lg:px-16">
      {/* Heading */}
      <motion.div
        variants={headingVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-10 rounded-full bg-gradient-to-r from-purple-600 to-violet-400" />
            <span className="text-purple-600 text-sm font-semibold">
              Browser By Category
            </span>
          </div>

          <h2 className="font-bold text-[32px] sm:text-[38px] text-gray-900">
            Popular{" "}
            <span className="bg-gradient-to-r from-purple-600 to-violet-400 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            Find the domain that matches your passion and expertise
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
              className="w-64 pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-purple-600"
            />
          </div>

        </div>
      </motion.div>

      {/* Loader */}
      {loading ? (
        <p className="text-gray-500">Loading categories...</p>
      ) : (
        <motion.div
        key={`${search}-${showAll}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {visibleCategories?.length > 0 ? (
            visibleCategories.map((cat, i) => {
              const title = cat.title || cat.name || cat.categoryName || "Unknown Category";
              const originalIndex = categories.indexOf(cat);
              const count = getCategoryOpenings(cat, originalIndex);

              /* colors based on title (optional simple hash) */
              const colors = [
                "#f59e0b",
                "#7c3aed",
                "#0ea5e9",
                "#ec4899",
                "#10b981",
                "#8b5cf6",
                "#f97316",
                "#ef4444",
              ];

              const color = colors[i % colors.length];

              return (
                <motion.div
                  key={cat._id || i}
                  variants={cardVariants}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white border cursor-pointer overflow-hidden"
                  style={{
                    borderColor: `${color}30`,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                  onClick={() => {
                    dispatch(
                      setFilters({
                        keyword: title,
                        location: "",
                        companyName: "",
                        category: "",
                        experience: "",
                        salaryRanges: [],
                        jobType: [],
                        education: [],
                        jobLevel: "",
                        sort: "latest",
                        limit: 12,
                        page: 1,
                      })
                    );
                    navigate("/find-job", { state: { fromSearch: true } });
                  }}
                >
                  {/* glow */}
                  <div
                    className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-xl"
                    style={{ backgroundColor: color }}
                  />

                  {/* icon circle */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                    style={{
                      backgroundColor: `${color}15`,
                      color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {cat?.image ? (
                      <img
                        src={cat.image}
                        alt="company"
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                    ) : null}

                    {/* ✅ Fallback Icon */}
                    <span
                      style={{ display: cat?.image ? "none" : "block" }}
                      className="text-lg"
                    >
                      🔹
                    </span>
                  </div>

                  {/* text */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-800 text-[14px] truncate">
                      {title}
                    </h5>
                    <p className="text-gray-400 text-[12px] mt-1">
                      {count} Open {count === 1 ? "position" : "positions"}
                    </p>
                  </div>

                  {/* arrow */}
                  <HiArrowRight style={{ color }} />
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full flex justify-center py-10">
              <p className="text-lg font-medium text-gray-500">
                No category found
              </p>
            </div>
          )}
        </motion.div>
      )}

      {canViewAll && (
        <div className="flex justify-end mt-10">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold text-sm transition"
          >
            View All <FaArrowRight size={12} />
          </button>
        </div>
      )}
    </section>
  );
};

export default PopularCategory;

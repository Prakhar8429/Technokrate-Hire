// import React, { useEffect, useState } from "react";
// import Layout from "../../../components/Layout/Layout";
// import { CiLocationOn } from "react-icons/ci";
// import { FaBookmark } from "react-icons/fa6";
// import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
// import useTheme from "../../../hooks/theme/useTheme";
// import { themes } from "../../../components/Themes/Theme";
// import { useNavigate } from "react-router-dom";
// import { TiTick } from "react-icons/ti";
// import { RxCross2 } from "react-icons/rx";
// import { ArrowRight } from "lucide-react";

// // IMPORTANT: Double-check these paths in your file explorer!
// import apple from "../../../assets/appleLogo.png";
// import google from "../../../assets/google.png";
// import microsoft from "../../../assets/microsoft.png";
// import instagram from "../../../assets/instagram.png";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchSavedJobs } from "../../../redux/slice/GetSavedJobsSlice/GetSavedJobsSlice";
// const Savedjobs = () => {
//   const { setTheme } = useTheme();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { savedJobs, loading } = useSelector((state) => state.GetsavedJobs);
//   useEffect(() => {
//     setTheme(themes.OverviewThemes);

//     const token = localStorage.getItem("token");

//     if (token) {
//       dispatch(fetchSavedJobs(token));
//     }
//   }, [dispatch]);
//   useEffect(() => {
//     setTheme(themes.OverviewThemes);
//   }, []);

//   // const jobData = [
//   //   {
//   //     id: 1,
//   //     title: "Network Engineering",
//   //     location: "Washington, USA",
//   //     salary: "₹50k-80k/month",
//   //     status: "Pending",
//   //     jobtimes: "Job Expired",
//   //     logo: apple,
//   //     bgColor: "bg-green-100", // Lightened background so colored logos pop
//   //   },
//   //   {
//   //     id: 2,
//   //     title: "Product Designer",
//   //     location: "Dhaka, USA",
//   //     status: "Active",
//   //     salary: "₹50k-80k/month",
//   //     jobtimes: "4 Days Remaining",
//   //     logo: google,
//   //     bgColor: "bg-pink-100",
//   //   },
//   //   {
//   //     id: 3,
//   //     title: "UI/UX Designer",
//   //     location: "Minnesota, USA",
//   //     salary: "₹50k-80k/month",
//   //     status: "Active",
//   //     jobtimes: "7 Days Remaining",
//   //     logo: instagram,
//   //     bgColor: "bg-gray-100",
//   //   },
//   //   {
//   //     id: 4,
//   //     title: "Senior Developer",
//   //     location: "Minnesota, USA",
//   //     salary: "₹15k-20k/month",
//   //     status: "Pending",
//   //     jobtimes: "Job Expired",
//   //     logo: microsoft,
//   //     bgColor: "bg-green-100",
//   //   },
//   //   {
//   //     id: 5,
//   //     title: "Project Manager",
//   //     location: "Sivas, Turkey",
//   //     salary: "₹50k-80k/month",
//   //     status: "Active",
//   //     jobtimes: "5 Days Remaining",
//   //     logo: apple,
//   //     bgColor: "bg-pink-100",
//   //   },
//   // ];

//   // const itemsPerPage = 10;
//   // const [currentPage, setCurrentPage] = useState(1);
//   // const totalPages = Math.ceil(jobData.length / itemsPerPage);
//   // const startIndex = (currentPage - 1) * itemsPerPage;
//   // const currentJobs = jobData.slice(startIndex, startIndex + itemsPerPage);
//   const itemsPerPage = 10;
//   const [currentPage, setCurrentPage] = useState(1);

//   const totalPages = Math.ceil(savedJobs.length / itemsPerPage);

//   const startIndex = (currentPage - 1) * itemsPerPage;

//   // const currentJobs = savedJobs.slice(
//   //   startIndex,
//   //   startIndex + itemsPerPage
//   // );
//   return (
//     <Layout>
//       <div className="w-full mx-auto p-3 sm:p-4 md:p-6 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.25)] rounded-lg flex flex-col">
//         <div className="mb-8 flex justify-between items-center">
//           <h2 className="text-xl font-[500] font-poppins text-[#141414]">
//             Saved Jobs{" "}
//             <span className="text-gray-400 font-normal">
//               ({savedJobs.length})
//             </span>
//           </h2>
//           <div className="flex items-center justify-center gap-1 text-gray-500 cursor-pointer hover:text-[#7900BA]">
//             <button className="text-sm font-poppins font-medium">
//               View all
//             </button>
//             <ArrowRight size={18} />
//           </div>
//         </div>

//         {/* Mobile */}

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
//           {savedJobs.map((job) => (
//             <div
//               key={job._id}
//               className="bg-white border rounded-lg p-4 shadow-sm flex flex-col gap-3"
//             >
//               <div className="flex items-center gap-3">
//                 <img
//                   src={job.companyLogo[0]}
//                   alt="logo"
//                   className="w-12 h-12"
//                 />

//                 <div>
//                   <h3 className="font-semibold text-sm">{job.jobTitle}</h3>
//                   <div className="flex items-center text-xs text-gray-500 gap-1">
//                     <CiLocationOn size={14} className="text-[#7900BA]" />
//                     {job.jobLocation}
//                   </div>
//                 </div>
//               </div>

//               {/* <p className="text-sm text-gray-600">{job.salary}</p> */}
//               {/* <p className="text-sm text-gray-600">
//                 <p>
//                   ₹{job.salary?.minSalary} - ₹{job.salary?.maxSalary}
//                 </p>          
//                     </p> */}
//               <div className="flex items-center justify-between">
//                 {job.status === "Active" ? (
//                   <span className="flex items-center text-green-500 text-sm gap-1">
//                     <TiTick size={18} /> Active
//                   </span>
//                 ) : (
//                   <span className="flex items-center text-red-400 text-sm gap-1">
//                     <RxCross2 size={16} /> Expired
//                   </span>
//                 )}

//                 <FaBookmark className="cursor-pointer text-gray-600" />
//               </div>

//               {job.jobtimes === "Job Expired" ? (
//                 <button
//                   disabled
//                   className="w-full py-2 bg-gray-200 text-gray-500 rounded-md text-sm"
//                 >
//                   Expired
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => navigate("/find-job")}
//                   className="w-full py-2 bg-[#DCBDED] text-[#7900BA] rounded-md text-sm hover:bg-[#7900BA] hover:text-white transition"
//                 >
//                   Apply Now
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="hidden md:block flex-1 overflow-x-auto">
//           <table className="min-w-[700px] w-full border-collapse">
//             <thead className="bg-[#F1F2F4]">
//               <tr>
//                 <th className="px-6 py-4 font-poppins text-center font-[500] text-[#141414] w-[45%]">
//                   Jobs
//                 </th>
//                 <th className="px-6 py-4 font-poppins text-center font-[500] text-[#141414] w-[20%]">
//                   Status
//                 </th>
//                 <th className="px-6 py-4 font-poppins text-center font-[500] text-[#141414] w-[35%]">
//                   Action
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {savedJobs.map((job) => (
//                 <tr
//                   key={job._id}
//                   className="border-b border-gray-300 text-gray-500"
//                 >
//                   <td className="px-4 py-5">
//                     <div className="flex items-start sm:items-center gap-3 sm:gap-4">
//                       {/* FIXED: Removed brightness-0 and invert so your colored logos show */}
//                       <div
//                         className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden `}
//                       >
//                         {job.logo ? (
//                           <img
//                             src={job.logo}
//                             alt={job.title}
//                             className="w-12 h-12 object-contain"
//                             onError={(e) => {
//                               e.target.src = "https://via.placeholder.com/32";
//                             }} // Fallback if path is wrong
//                           />
//                         ) : (
//                           <div className="w-8 h-8 bg-gray-200 rounded-sm"></div>
//                         )}
//                       </div>
//                       <div>
//                         <p className="font-medium text-[#141414] text-sm sm:text-base">
//                           {job.title}
//                         </p>
//                         <div className="flex items-center gap-3 text-sm mt-1 text-gray-400">
//                           <span className="flex items-center gap-1">
//                             <CiLocationOn
//                               className="text-[#7900BA]"
//                               size={16}
//                             />
//                             {job.location}
//                           </span>
//                           <span className="text-gray-500">{job.salary}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </td>

//                   <td className="px-4 py-3">
//                     <div className="flex justify-center items-center gap-1.5">
//                       {job.status === "Active" ? (
//                         <>
//                           <TiTick className="text-green-500" size={20} />
//                           <span className="text-green-500 font-medium">
//                             Active
//                           </span>
//                         </>
//                       ) : (
//                         <>
//                           <RxCross2 className="text-red-400" size={16} />
//                           <span className="text-red-400 font-medium">
//                             Expire
//                           </span>
//                         </>
//                       )}
//                     </div>
//                   </td>

//                   <td className="px-4 py-3">
//                     <div className="flex justify-center items-center gap-3 sm:gap-6 flex-wrap">
//                       <FaBookmark
//                         className="text-gray-900 cursor-pointer hover:text-[#7900BA]"
//                         size={18}
//                       />

//                       {job.jobtimes === "Job Expired" ? (
//                         <button
//                           disabled
//                           className="flex w-[120px] sm:w-[145px] justify-center items-center gap-2 px-4 sm:px-6 py-2.5 bg-[#F1F2F4] text-[#9199A3] rounded-md text-sm font-[500] opacity-70"
//                         >
//                           Expired
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => navigate("/find-job")}
//                           className="flex w-[145px] items-center gap-2 px-8 py-2.5 bg-[#DCBDED] text-[#7900BA] rounded-md text-sm font-[500] hover:bg-[#7900BA] hover:text-white transition-all"
//                         >
//                           Apply Now
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="flex flex-col sm:flex-row justify-between items-center border-t mt-8 pt-4 gap-4 border-gray-100">
//           <p className="text-sm sm:text-base font-medium text-[#7900BA] text-center sm:text-left">
//             Showing {startIndex + 1} to{" "}
//             {Math.min(startIndex + itemsPerPage, savedJobs.length)} of {savedJobs.length}
//             Jobs
//           </p>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-[#7900BA]"
//             >
//               <IoIosArrowBack />
//             </button>

//             {[...Array(totalPages)].map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentPage(i + 1)}
//                 className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${currentPage === i + 1
//                   ? "bg-[#7900BA] text-white shadow-md"
//                   : "bg-transparent text-gray-600 hover:bg-gray-100"
//                   }`}
//               >
//                 {String(i + 1).padStart(1, "0")}
//               </button>
//             ))}

//             <button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               className="w-9 h-9 flex items-center justify-center rounded-full bg-[#DCBDED] text-[#7900BA] hover:bg-[#7900BA] hover:text-white transition-all shadow-sm"
//             >
//               <IoIosArrowForward />
//             </button>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default Savedjobs;



import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout/Layout";
import { CiLocationOn } from "react-icons/ci";
import { FaBookmark } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import useTheme from "../../../hooks/theme/useTheme";
import { themes } from "../../../components/Themes/Theme";
import { useNavigate } from "react-router-dom";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import { ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSavedJobs as fetchSavedJobsGet } from "../../../redux/slice/GetSavedJobsSlice/GetSavedJobsSlice";
import { fetchSavedJobs as fetchSavedJobsAlert } from "../../../redux/slice/SavedJobJobAlertSlice/SavedJobAlertSlice";
import { buildJobDetailsPath } from "../../../utils/jobDetailsPath";
import Loading from "../../../components/common/loader/Loading";

const getAvatarColor = (name = "") => {
  const colors = [
    "bg-purple-100 text-purple-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-yellow-100 text-yellow-700",
    "bg-indigo-100 text-indigo-700",
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const getCompanyLogo = (job) => {
  if (!job) return null;
  const raw = job.companyLogo || job.jobId?.companyLogo || job.employerId?.companyDetail?.companyLogo;
  if (!raw) return null;
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0];
    return typeof first === "string" ? first : first?.url || null;
  }
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") return raw.url || null;
  return null;
};

const formatLocation = (loc) => {
  if (!loc) return "Location not available";
  if (typeof loc === "string") return loc;
  if (loc.name) return loc.name;
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not available";
};

const formatSalary = (salaryObj, salaryRangeObj) => {
  const min = salaryObj?.minSalary ?? salaryRangeObj?.minSalary ?? 0;
  const max = salaryObj?.maxSalary ?? salaryRangeObj?.maxSalary ?? 0;
  if (min === 0 && max === 0) return "₹0 - ₹0";
  return `₹${min} - ₹${max}`;
};

const normalizeJob = (item) => {
  if (!item) return {};
  const inner = item.jobId && typeof item.jobId === "object" ? item.jobId : {};
  const employer = inner.employerId || item.employerId || {};
  const compDetail = employer.companyDetail || {};

  const jobTitle =
    inner.jobTitle ||
    item.jobTitle ||
    item.jobName ||
    inner.jobName ||
    "Job Title";

  const companyLogo =
    inner.companyLogo ||
    item.companyLogo ||
    compDetail.companyLogo ||
    employer.logo;

  const jobLocation =
    inner.jobLocation ||
    item.jobLocation ||
    inner.location ||
    item.location ||
    "Location not available";

  const salaryRange =
    inner.salaryRange ||
    item.salaryRange ||
    inner.salary ||
    item.salary;

  const status = inner.status || item.status || "active";
  const _id = inner._id || item._id || (typeof item.jobId === "string" ? item.jobId : null);
  const slug = inner.slug || item.slug;

  return {
    ...inner,
    ...item,
    _id,
    slug,
    jobTitle,
    companyLogo,
    jobLocation,
    salaryRange,
    status,
  };
};

const CompanyLogo = ({ name, logoUrl }) => {
  const [hasError, setHasError] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={name || "logo"}
        onError={() => setHasError(true)}
        className="w-12 h-12 rounded-xl object-contain border border-gray-100 shrink-0"
        loading="lazy"
      />
    );
  }

  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${getAvatarColor(name)}`}>
      {initial}
    </div>
  );
};

const Savedjobs = () => {
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Redux data from both possible slices
  const getSavedState = useSelector((state) => state.GetsavedJobs);
  const alertSavedState = useSelector((state) => state.savedJobs);

  const loading = getSavedState?.loading || alertSavedState?.loading || false;
  const getList = getSavedState?.savedJobs;
  const alertList = alertSavedState?.savedJobs;

  let rawList = [];
  if (Array.isArray(getList) && getList.length > 0) {
    rawList = getList;
  } else if (Array.isArray(alertList) && alertList.length > 0) {
    rawList = alertList;
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      if (Array.isArray(stored) && stored.length > 0) {
        rawList = stored;
      }
    } catch (e) {
      // ignore
    }
  }

  const safeJobs = rawList.map(normalizeJob);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTheme(themes.OverviewThemes);

    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchSavedJobsGet(token));
      dispatch(fetchSavedJobsAlert());
    }
  }, [dispatch]);

  // ✅ Pagination
  const totalPages = Math.ceil(safeJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentJobs = safeJobs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleJobNavigate = (job) => {
    if (job?._id || job?.slug) {
      navigate(buildJobDetailsPath(job));
    } else {
      navigate("/find-job");
    }
  };

  const token = localStorage.getItem("token");

  // ✅ UNAUTHENTICATED FLOW
  if (!token) {
    return (
      <Layout>
        <div className="w-full mx-auto my-12 p-8 sm:p-12 bg-white shadow-xl rounded-2xl flex flex-col items-center justify-center text-center max-w-xl border border-gray-100">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-[#7900BA] mb-6 shadow-sm">
            <FaBookmark size={32} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Saved Jobs
          </h2>

          <p className="text-gray-600 mb-8 text-base leading-relaxed max-w-md">
            If user wants to see saved jobs the user should login candidate panel.
          </p>

          <button
            onClick={() =>
              navigate("/login", {
                state: { redirectTo: "/dashboard/saved-jobs" },
              })
            }
            className="w-full sm:w-auto px-8 py-3.5 bg-[#7900BA] hover:bg-purple-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-base cursor-pointer flex items-center justify-center gap-2"
          >
            Login to Candidate Panel
          </button>
        </div>
      </Layout>
    );
  }

  // ✅ Loading state
  if (loading) {
    return (
      <Layout>
        <Loading text="Loading Saved Jobs..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full mx-auto p-3 sm:p-4 md:p-6 bg-white shadow rounded-lg flex flex-col h-[100%]">

        {/* HEADER */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-purple-50 text-gray-600 hover:text-[#7900BA] transition flex items-center justify-center border border-gray-200 cursor-pointer"
              title="Go Back"
            >
              <IoIosArrowBack size={20} />
            </button>
            <h2 className="text-xl font-medium text-[#141414]">
              Saved Jobs{" "}
              <span className="text-gray-400">({safeJobs.length})</span>
            </h2>
          </div>
        </div>

        {/* EMPTY STATE */}
        {safeJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 ">
            No saved jobs found
          </div>
        ) : (
          <>
            {/* ================= MOBILE VIEW ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
              {currentJobs.map((job, index) => {
                const logo = getCompanyLogo(job);
                return (
                  <div
                    key={index}
                    className="bg-white border rounded-lg p-4 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={job.jobTitle} logoUrl={logo} />

                      <div>
                        <h3
                          onClick={() => handleJobNavigate(job)}
                          className="font-semibold text-sm hover:text-[#7900BA] cursor-pointer"
                        >
                          {job.jobTitle}
                        </h3>

                        <div className="flex items-center text-xs text-gray-500 gap-1">
                          <CiLocationOn size={14} className="text-[#7900BA]" />
                          {formatLocation(job.jobLocation)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      {formatSalary(job.salary, job.salaryRange)}
                    </p>

                    <div className="flex items-center justify-between">
                      {job.status === "active" ? (
                        <span className="flex items-center text-green-500 text-sm gap-1">
                          <TiTick size={18} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-400 text-sm gap-1">
                          <RxCross2 size={16} /> Expired
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleJobNavigate(job)}
                      className="w-full py-2 bg-[#DCBDED] text-[#7900BA] rounded-md text-sm hover:bg-[#7900BA] hover:text-white transition cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ================= DESKTOP VIEW ================= */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-[#F1F2F4]">
                  <tr>
                    <th className="py-4 flex flex-start pl-[10px]">Jobs</th>
                    <th className="py-4 text-center">Status</th>
                    <th className="py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentJobs.map((job, index) => {
                    const logo = getCompanyLogo(job);
                    return (
                      <tr key={index} className="border-b text-gray-500">
                        <td className="py-4">
                          <div className="flex items-center gap-4">
                            <CompanyLogo name={job.jobTitle} logoUrl={logo} />

                            <div>
                              <p
                                onClick={() => handleJobNavigate(job)}
                                className="font-medium text-black hover:text-[#7900BA] cursor-pointer"
                              >
                                {job.jobTitle}
                              </p>

                              <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <CiLocationOn className="text-[#7900BA]" />
                                  {formatLocation(job.jobLocation)}
                                </span>

                                <span className="text-gray-500">
                                  {formatSalary(job.salary, job.salaryRange)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="text-center">
                          {job.status === "active" ? (
                            <span className="text-green-500 flex justify-center items-center gap-1">
                              <TiTick /> Active
                            </span>
                          ) : (
                            <span className="text-red-400 flex justify-center items-center gap-1">
                              <RxCross2 /> Expired
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="flex justify-center items-center gap-4">
                            <button
                              onClick={() => handleJobNavigate(job)}
                              className="px-6 py-2 bg-[#DCBDED] text-[#7900BA] rounded hover:bg-[#7900BA] hover:text-white cursor-pointer transition"
                            >
                              Apply Now
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ================= PAGINATION ================= */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-[#7900BA]">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, safeJobs.length)} of{" "}
                {safeJobs.length}
              </p>

              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
                  <IoIosArrowBack />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${currentPage === i + 1
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                >
                  <IoIosArrowForward />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </Layout>
  );
};

export default Savedjobs;
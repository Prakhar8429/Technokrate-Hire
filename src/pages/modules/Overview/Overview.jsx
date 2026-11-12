import React, { useEffect, useRef, useState } from "react";
import Layout from "../../../components/Layout/Layout";
import useTheme from "../../../hooks/theme/useTheme";
import { useNavigate } from "react-router-dom";
import { themes } from "../../../components/Themes/Theme";
import AplliedJob from "../../../assets/appliedjob.png";
import Queen from "../../../assets/material-symbols_chess-queen.png";
import BookmarkIcon from "../../../assets/BookmarkSimple.png";
import GroupsIcon from "../../../assets/Groups.png";
import { IoIosArrowBack, IoIosArrowForward, IoMdStar } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboard,
  fetchProfileCompleteness,
  fetchDashboardPlans,
} from "../../../redux/slice/DashboardSlice/DashboardSlice";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { fetchUserDetails,updateUserProfile } from "../../../redux/slice/user/userSlice";
import { buildJobDetailsPath } from "../../../utils/jobDetailsPath";
// ─── Skeleton Primitives ───────────────────────────────────────────────────────

const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    style={{ animationDuration: "1.4s" }}
  />
);

// ─── Skeleton Sections ─────────────────────────────────────────────────────────

const HeaderSkeleton = () => (
  <div className="mt-4 mb-6">
    <Skeleton className="h-5 w-40 mb-2" />
    <Skeleton className="h-4 w-64" />
  </div>
);

const StatCardSkeleton = () => (
  <div className="rounded-xl p-6 flex justify-between items-center bg-gray-100">
    <div className="space-y-2">
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="w-14 h-14 rounded-md" />
  </div>
);

const UpgradeCardSkeleton = () => (
  <div className="rounded-xl p-6 mb-4 bg-gray-100 space-y-3">
    <Skeleton className="h-5 w-56" />
    <Skeleton className="h-4 w-40" />
    <Skeleton className="h-9 w-48 rounded-md" />
  </div>
);

const ProfileCardSkeleton = () => (
  <div className="rounded-xl p-4 sm:p-6 mb-6 bg-gray-100">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <tr className="border-t">
    <td className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
     </td>
    <td className="p-4">
      <Skeleton className="h-4 w-24" />
     </td>
    <td className="p-4">
      <Skeleton className="h-4 w-16" />
     </td>
    <td className="p-4 flex justify-center">
      <Skeleton className="h-8 w-24 rounded-md" />
     </td>
   </tr>
);

const PaginationSkeleton = () => (
  <div className="flex justify-center items-center border-t border-gray-50 mt-10 pt-3 mb-[5px]">
    <Skeleton className="h-4 w-40" />
    <div className="flex gap-3 items-center">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="w-9 h-9 rounded-full" />
      ))}
    </div>
  </div>
);

// ─── Full Skeleton Layout ──────────────────────────────────────────────────────

const OverviewSkeleton = () => (
  <div className="pt-0.5 px-6 md:px-4 bg-white rounded-2xl shadow-lg border border-gray-100">
    <HeaderSkeleton />
    <div className="grid md:grid-cols-2 gap-5 mb-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <UpgradeCardSkeleton />
    <ProfileCardSkeleton />
    <div className="flex justify-between mb-2">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="min-w-[700px] md:min-w-full w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-center font-medium">Jobs</th>
            <th className="p-3 text-left font-medium">Date Applied</th>
            <th className="p-3 text-left font-medium">Status</th>
            <th className="p-3 text-center font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
    <PaginationSkeleton />
  </div>
);

// ─── Helper Functions ───────────────────────────────────────────────────────────

const formatLocation = (location) => {
  if (!location) return "Location not available";
  
  if (typeof location === 'object') {
    if (location.name) return location.name;
    if (location.city && location.state) return `${location.city}, ${location.state}`;
    if (location.city) return location.city;
    if (location.state) return location.state;
    return "Location not available";
  }
  
  if (typeof location === 'string') return location;
  
  return "Location not available";
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const formatSalary = (salary) => {
  if (!salary) return null;
  if (typeof salary === 'object') {
    if (salary.minSalary && salary.maxSalary) {
      return `₹${salary.minSalary} - ₹${salary.maxSalary}`;
    }
    return null;
  }
  return salary;
};

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

const getCompanyLogo = (logoData) => {
  if (!logoData) return null;
  if (Array.isArray(logoData) && logoData.length > 0) {
    const first = logoData[0];
    return typeof first === "string" ? first : first?.url || null;
  }
  if (typeof logoData === "string") return logoData;
  if (typeof logoData === "object") return logoData.url || null;
  return null;
};

// ─── Main Component ────────────────────────────────────────────────────────────

const Overview = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const {
    user,
    stats,
    recentJobs,
    appliedJobs,
    profileCompleteness,
    dashboardPlans,
    loading,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    setTheme(themes.OverviewThemes);
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    dispatch(fetchDashboard());
    if (token) {
      dispatch(fetchProfileCompleteness());
      dispatch(fetchDashboardPlans());
      dispatch(fetchUserDetails());
    }
  }, [dispatch]);

  // ── Profile completion directly from API 1 (no fallback calculation) ──
  const effectiveCompletionPct =
    typeof profileCompleteness?.percentage === "number" && !isNaN(profileCompleteness.percentage)
      ? profileCompleteness.percentage
      : 0;
  const isProfileComplete =
    typeof profileCompleteness?.isComplete === "boolean"
      ? profileCompleteness.isComplete
      : effectiveCompletionPct >= 100;
  const missingSections = Array.isArray(profileCompleteness?.missingSections)
    ? profileCompleteness.missingSections
    : [];

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // const totalPages = Math.ceil((appliedJobs?.length || 0) / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const currentAppliedJobs = appliedJobs?.slice(startIndex, startIndex + itemsPerPage);


  // const totalPages = Math.ceil((appliedJobs?.data?.length || 0) / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
// const currentAppliedJobs = appliedJobs?.data?.slice(startIndex, startIndex + itemsPerPage);

const totalApplied = appliedJobs?.total || 0;
const totalPages = Math.ceil(totalApplied / itemsPerPage);
const currentAppliedJobs = appliedJobs?.data || [];

  // Scroll function for recent jobs slider
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - 320 : scrollLeft + 320;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <OverviewSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-0.5 px-6 md:px-4 bg-white rounded-2xl shadow-lg border border-gray-200">

        {/* HEADER */}
        <p className="text-[18px] font-medium mt-4 mb-2">
          Hello, {user?.name || "User"}
        </p>
        <p className="text-gray-400 mb-6 text-[14px]">
          Here is your daily activities and job alerts
        </p>

        {/* TOP STATS */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">

          <div
            className="bg-[#E6D7F3] rounded-xl p-6 flex justify-between items-center cursor-pointer"
            onClick={() => navigate("/dashboard/applied-jobs")}
          >
            <div>
              <p className="text-2xl font-medium">{stats?.appliedJobsCount || 0}</p>
              <p className="text-gray-500 text-sm">Applied jobs</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-md flex items-center justify-center">
              <img src={AplliedJob} alt="Applied Jobs" />
            </div>
          </div>

          <div
            className="bg-[#F3E2C6] rounded-xl p-6 flex justify-between items-center cursor-pointer"
            onClick={() => navigate("/dashboard/saved-jobs")}
          >
            <div>
              <p className="text-2xl font-medium">{stats?.savedJobsCount || 0}</p>
              <p className="text-gray-500 text-sm">Saved jobs</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-md flex items-center justify-center">
              <div className="w-9 h-9 rounded-full flex items-center justify-center">
                <img src={BookmarkIcon} size={16} className="text-[#F3E2C6]" alt="Bookmark" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= RECENT JOBS (FROM API) ================= */}
        <div className="mb-8 relative group">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Jobs ({recentJobs?.total || 0})</h2>
            <button 
              onClick={() => navigate("/find-job")}
              className="text-blue-600 font-bold hover:underline"
            >
              View all
            </button>
          </div>

          {/* Slider - Showing recentJobs from API */}
          {recentJobs?.data && recentJobs.data.length > 0 ? (
            <>
              <div 
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {recentJobs?.data?.map((job) => (
                  <div 
                    key={job.jobId || job._id} 
                    className="min-w-[280px] md:min-w-[320px] bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm hover:border-purple-300 transition-all cursor-pointer"
                    onClick={() => navigate(buildJobDetailsPath(job))}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {getCompanyLogo(job.companyLogo) ? (
                          <img src={getCompanyLogo(job.companyLogo)} alt="logo" className="w-8 h-8 object-contain" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center font-bold text-lg ${getAvatarColor(job.jobTitle || job.title)}`}>
                            {(job.jobTitle || job.title || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs">
                        {job.postedDate || job.createdAt 
                          ? new Date(job.postedDate || job.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "Recent"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      {truncateText(job.jobTitle || job.title, 20)}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-gray-500 text-sm truncate max-w-[150px]">
                        {truncateText(job.companyName || job.company, 20)}
                      </p>
                      {job.rating && (
                        <div className="flex items-center text-sm font-medium">
                          <IoMdStar className="text-yellow-400" />
                          <span className="ml-0.5">{job.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <HiOutlineLocationMarker className="text-gray-400" />
                      <span className="truncate">
                        {formatLocation(job.jobLocation || job.location)}
                      </span>
                    </div>
                    {formatSalary(job.salary) && (
                      <div className="mt-2 text-xs text-gray-400">
                        {formatSalary(job.salary)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Arrow Buttons - Only show if there are more than 2 items */}
              {recentJobs?.data && recentJobs.data.length > 2 &&(
                <>
                  <button 
                    onClick={() => scroll("left")}
                    className="absolute left-[-15px] top-[60%] bg-gray-400 text-white p-2 rounded-full shadow-xl hover:bg-gray-700 z-10 hidden md:block"
                  >
                    <IoIosArrowBack size={22} />
                  </button>
                  <button 
                    onClick={() => scroll("right")}
                    className="absolute right-[-15px] top-[60%] bg-gray-400 text-white p-2 rounded-full shadow-xl hover:bg-gray-700 z-10 hidden md:block"
                  >
                    <IoIosArrowForward size={22} />
                  </button>
                </>
              )}
            </>
          ) : (
            // Empty state for recent jobs
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500">No recent jobs found</p>
              <button
                onClick={() => navigate("/find-job")}
                className="mt-4 text-purple-600 font-semibold hover:underline"
              >
                Browse Jobs →
              </button>
            </div>
          )}
        </div>

        {/* UPGRADE CARD (API 3: Dashboard Plans) */}
        {(dashboardPlans?.availablePlans?.length > 0 || dashboardPlans?.currentPlan) && (() => {
          const featuredPlan = dashboardPlans?.availablePlans?.[0];
          const currentPlan = dashboardPlans?.currentPlan;

          return (
            <div className="bg-gradient-to-b from-purple-200 to-[#8931BA] rounded-xl p-6 mb-4">
              <p className="font-medium text-[18px] text-[#2D0A4E]">
                {currentPlan?.planName
                  ? `Active Plan: ${currentPlan.planName}`
                  : featuredPlan?.planName
                  ? `Upgrade: ${featuredPlan.planName}`
                  : "Subscription Plans"}
              </p>
              {featuredPlan && (
                <p className="text-[14px] mb-4 text-[#18191C]">
                  {featuredPlan.planName}
                  {featuredPlan.planTag ? ` • ${featuredPlan.planTag}` : ""}
                </p>
              )}
              <button
                className="bg-white text-[#8931BA] px-5 py-2 rounded-md font-semibold shadow flex gap-3 items-center hover:bg-purple-50 transition"
                onClick={() => navigate("/dashboard/plans")}
              >
                <img src={Queen} alt="Queen" />{" "}
                {featuredPlan?.discount
                  ? `Get ${featuredPlan.planName} at ${featuredPlan.discount}% Off - ₹${featuredPlan.planPrice}`
                  : featuredPlan
                  ? `Get ${featuredPlan.planName} for ₹${featuredPlan.planPrice}`
                  : "View Subscription Plans"}
              </button>
            </div>
          );
        })()}

        {/* PROFILE INCOMPLETE / COMPLETE CARD (API 1: Profile Completeness) */}
        {!isProfileComplete ? (
          <div className="bg-[#EDE7F6] rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                  <img src={GroupsIcon} alt="Groups" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    Your profile editing is not completed.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {effectiveCompletionPct}% complete — finish your profile to get more job matches
                  </p>
                  {missingSections.length > 0 && (
                    <p className="text-xs text-purple-700 font-semibold mt-1">
                      Pending sections: {missingSections.join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/profile-edit")}
                className="w-full sm:w-auto bg-white px-4 sm:px-5 py-2 rounded-md text-purple-700 font-semibold text-sm sm:text-base hover:bg-purple-50 transition"
              >
                Complete Profile →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#E8F5E9] rounded-xl p-4 sm:p-6 mb-6 border border-green-200">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-green-100">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-green-800">
                  🎉 Your profile is completed!
                </p>
                <p className="text-xs sm:text-sm text-green-600">
                  Great work! Your profile is 100% complete and ready for employers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* APPLIED JOBS HEADER */}
        <div className="flex justify-between mb-2">
          <p className="font-semibold">Applied Jobs</p>
          <button 
            onClick={() => navigate("/dashboard/applied-jobs")}
            className="text-gray-500 text-sm hover:text-purple-600"
          >
            View all →
          </button>
        </div>

        {/* APPLIED JOBS TABLE */}
        <div className="bg-white justify-center rounded-xl shadow-sm">
          <div className="w-full overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              <table className="min-w-[700px] md:min-w-full w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 text-center font-medium">Jobs</th>
                    <th className="p-3 text-left font-medium">Date Applied</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppliedJobs && currentAppliedJobs.length > 0 ? (
                    currentAppliedJobs.map((e) => (
                      <tr key={e.jobId || e._id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {getCompanyLogo(e.companyLogo) ? (
                              <img src={getCompanyLogo(e.companyLogo)} className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl object-contain border border-gray-100" alt="logo" />
                            ) : (
                              <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(e.jobTitle)}`}>
                                {(e.jobTitle || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm sm:text-base font-medium">{e.jobTitle}</p>
                              <p className="text-gray-400 text-xs">
                                {formatLocation(e.jobLocation)}
                                {formatSalary(e.salary) && ` • ${formatSalary(e.salary)}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">
                          {e?.appliedDate
                            ? new Date(e.appliedDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            e.status === "Approved" || e.status === "Accepted"
                              ? "bg-green-100 text-green-700"
                              : e.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {e.status || "Pending"}
                          </span>
                        </td>
                        <td className="p-4 justify-center flex">
                          <button
                            // onClick={() => navigate(`/find-job/jobdetails/${e.jobId}`)}
                            onClick={()=>navigate("/dashboard/applied-jobs")}
                            className="bg-[#E6D7F3] px-3 sm:px-4 py-2 rounded-md text-purple-700 text-xs sm:text-sm hover:bg-purple-200 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        No applied jobs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PAGINATION - Only show if there are applied jobs */}
        {appliedJobs && appliedJobs.length > 0 && (
          <div className="flex justify-center items-center border-t border-gray-50 mt-10 pt-0 mb-[5px]">
            <div>
              <p className="text-[#7900BA] font-[500] text-[16px] font-poppins mr-5">
                Showing {Math.min(currentPage * itemsPerPage, appliedJobs?.length || 0)} of{" "}
                {appliedJobs?.length || 0} Jobs
              </p>
            </div>
            <div className="flex justify-center gap-3 items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#DCBDED] text-[#7900BA] hover:bg-purple-300"
                }`}
              >
                <IoIosArrowBack />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-full text-sm transition-all font-semibold ${
                    currentPage === i + 1
                      ? "bg-[#7900BA] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#DCBDED] text-[#7900BA] hover:bg-purple-300"
                }`}
              >
                <IoIosArrowForward />
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Overview;

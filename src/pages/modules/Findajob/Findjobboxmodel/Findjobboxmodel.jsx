// src/pages/FindJob/Findjobboxmodel/Findjobboxmodel.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TfiLocationPin } from "react-icons/tfi";
import { TbCurrencyRupee } from "react-icons/tb";
import { MdOutlineWorkOutline } from "react-icons/md";
import { PiGraduationCap } from "react-icons/pi";
import { LuClock3 } from "react-icons/lu";
import { BsBriefcase } from "react-icons/bs";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { toast } from "react-toastify";
import { buildJobDetailsPath } from "../../../../utils/jobDetailsPath";
import { toggleSavedJob, fetchSavedJobs as fetchSavedJobsAlert } from "../../../../redux/slice/SavedJobJobAlertSlice/SavedJobAlertSlice";
import { fetchSavedJobs as fetchSavedJobsGet } from "../../../../redux/slice/GetSavedJobsSlice/GetSavedJobsSlice";
// ── Helpers ──────────────────────────────────────────────────────────────────

// Map jobType to badge color
const JOB_TYPE_COLORS = {
  "Full-Time": { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  "Part-Time": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  "Internship": { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  "Remote": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "Contract": { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  "Temporary": { bg: "bg-pink-50", text: "text-pink-700", dot: "bg-pink-500" },
};

// Map expireDate string to urgency color
const getExpireColor = (expireDate) => {
  if (!expireDate) return "text-gray-400";
  if (expireDate === "Expired") return "text-red-500";
  if (expireDate.includes("1 Day")) return "text-red-500";
  if (expireDate.includes("2 Day") || expireDate.includes("3 Day")) return "text-orange-500";
  return "text-green-600";
};

// Generate a consistent soft background color from company name (for logo fallback)
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
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

// ── Component ─────────────────────────────────────────────────────────────────

const Findjobboxmodel = ({ jobs }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.findJob?.filters || {});
  const savedJobsList = useSelector(
    (state) => state.savedJobs?.savedJobs || state.GetsavedJobs?.savedJobs || []
  );

  const [localSavedMap, setLocalSavedMap] = useState({});

  if (!jobs?.length) return null;
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    if (token) {
      dispatch(fetchSavedJobsAlert());
      dispatch(fetchSavedJobsGet(token));
    }
  }, [dispatch, token]);

  const isFilterApplied = Boolean(
    filters.keyword?.trim() ||
    filters.location?.trim() ||
    filters.category ||
    filters.jobType ||
    filters.jobLevel ||
    (Array.isArray(filters.educations) && filters.educations.length > 0)
  );

  const isJobSaved = (jobItem) => {
    const jobId = jobItem._id || jobItem.id;
    if (jobId && jobId in localSavedMap) {
      return localSavedMap[jobId];
    }
    if (jobItem.isSaved) return true;

    const list1 = Array.isArray(savedJobsList) ? savedJobsList : [];
    return list1.some((s) => {
      if (!s) return false;
      if (typeof s === "string") return s === jobId;
      return (
        s?._id === jobId ||
        s?.jobId === jobId ||
        s?.jobId?._id === jobId ||
        s?.id === jobId
      );
    });
  };

  const handleSaveJob = async (e, jobItem) => {
    e.stopPropagation();
    if (!token) {
      toast.warning("Please login to save this job!");
      navigate("/login", { state: { redirectTo: window.location.pathname } });
      return;
    }

    const jobId = jobItem._id || jobItem.id;
    const resolvedJobTitle =
      jobItem.jobTitle ||
      jobItem.jobName ||
      jobItem.title ||
      "Job";
    const currentlySaved = isJobSaved(jobItem);

    // Optimistic UI update
    setLocalSavedMap((prev) => ({
      ...prev,
      [jobId]: !currentlySaved,
    }));

    try {
      await dispatch(
        toggleSavedJob({
          token,
          jobId,
          jobName: resolvedJobTitle,
        })
      ).unwrap();

      dispatch(fetchSavedJobsAlert());
      if (token) {
        dispatch(fetchSavedJobsGet(token));
      }

      if (!currentlySaved) {
        toast.success("Job saved successfully!");
      } else {
        toast.info("Job removed from saved jobs");
      }
    } catch (err) {
      // Revert optimistic update on failure
      setLocalSavedMap((prev) => ({
        ...prev,
        [jobId]: currentlySaved,
      }));
      toast.error(err?.message || "Failed to update saved job status");
    }
  };

  const handleJobClick = (jobItem) => {
    if (!isFilterApplied) {
      toast.info("Please apply a filter before viewing job details.");
    }
    navigate(buildJobDetailsPath(jobItem));
  };
  return (
    <div className="mt-4">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
        {jobs.map((item, idx) => {
          // ✅ Correct field mapping from actual API response
          const companyName =
            item.employerId?.name ||
            item.employerId?.companyDetail?.companyName ||
            item.companyName ||
            item.company ||
            "Company";
          const jobTitle = item.jobTitle || "Job Title";
          // const location = item.jobLocation || "Location";
          const location =
            typeof item.jobLocation === "object"
              ? item.jobLocation?.name
              : item.jobLocation || "Location";
          const jobType = item.jobType || "";
          const experience = item.experience || "";
          const education = item.education || "";
          const jobLevel = item.jobLevel || "";
          const expireDate = item.expireDate || "";
          const minSalary = item.salaryRange?.minSalary;
          const maxSalary = item.salaryRange?.maxSalary;

          // Resolve logo dynamically from item.companyLogo or employer's companyLogo
          const rawLogo =
            item.companyLogo ||
            item.employerId?.companyDetail?.companyLogo;
          let logo = Array.isArray(rawLogo) ? rawLogo[0] : rawLogo;
          if (logo && typeof logo === "object") logo = logo.url || null;
          if (logo && typeof logo === "string" && logo.includes(",")) {
            logo = logo.split(",")[0];
          }

          const id = item._id;
          const slugOrId = item.slug || item._id;

          const typeStyle = JOB_TYPE_COLORS[jobType] || {
            bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400",
          };

          const expireColor = getExpireColor(expireDate);
          const avatarColor = getAvatarColor(companyName);
          const isSaved = isJobSaved(item);

          return (
            <div
              onClick={() => handleJobClick(item)}
              key={idx}
              className="group relative bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg hover:border-purple-300 transition-all duration-200"
            >
              {/* ── Top-Right Absolute Save Button ── */}
              <button
                type="button"
                onClick={(e) => handleSaveJob(e, item)}
                title={isSaved ? "Remove from saved" : "Save job"}
                aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
                className={`absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-0 outline-none focus:outline-none bg-transparent ${
                  isSaved
                    ? "text-[#7900BA] hover:bg-purple-50"
                    : "text-gray-400 hover:text-[#7900BA] hover:bg-purple-50"
                }`}
                style={{ border: "none", outline: "none", boxShadow: "none" }}
              >
                {isSaved ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />}
              </button>

              {/* ── Top: Logo + Company ── */}
              <div className="flex items-center gap-3 pr-10">
                {/* Logo or Fallback Avatar */}
                {logo ? (
                  <img
                    src={logo}
                    alt={companyName}
                    className="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-white p-1 shrink-0"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${avatarColor}`}>
                    {companyName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="font-semibold text-[#18191C] text-sm leading-tight truncate max-w-[200px]">
                    {companyName}
                  </h2>
                  {jobLevel && (
                    <span className="text-xs text-gray-400 mt-0.5 block">{jobLevel}</span>
                  )}
                </div>
              </div>

              {/* ── Expire Badge & Job Title ── */}
              <div className="flex flex-col gap-1.5">
                {expireDate && (
                  <span className={`text-xs font-medium flex items-center gap-1 w-fit ${expireColor}`}>
                    <LuClock3 size={12} />
                    {expireDate}
                  </span>
                )}
                <h3 className="font-semibold text-[#191F33] text-base leading-snug group-hover:text-purple-700 transition-colors line-clamp-2">
                  {jobTitle}
                </h3>
              </div>

              {/* ── Tags: JobType + Experience ── */}
              <div className="flex flex-wrap gap-2">
                {jobType && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`} />
                    {jobType}
                  </span>
                )}
                {experience && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <BsBriefcase size={11} />
                    {experience}
                  </span>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="border-t border-gray-100" />

              {/* ── Bottom: Location + Salary + Education ── */}
              <div className="flex flex-col gap-1.5">
                {/* Location */}
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <TfiLocationPin size={13} className="shrink-0 text-purple-400" />
                  <span className="truncate">{location}</span>
                </div>

                {/* Salary */}
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <TbCurrencyRupee size={14} className="shrink-0 text-purple-400" />
                  {minSalary && maxSalary ? (
                    <span className="font-semibold text-gray-700">
                      ₹{minSalary.toLocaleString("en-IN")} – ₹{maxSalary.toLocaleString("en-IN")}
                      <span className="font-normal text-gray-400 ml-1">/ month</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Not Disclosed</span>
                  )}
                </div>

                {/* Education */}
                {education && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <PiGraduationCap size={14} className="shrink-0 text-purple-400" />
                    <span className="capitalize">{education}</span>
                  </div>
                )}
              </div>

              {/* ── Apply CTA ── */}
              {/* <div className="mt-auto pt-1">
                <span
                  onClick={(e) => {
                    e.stopPropagation(); // card click ko stop kare

                    if (token) {
                      navigate(`/job-details/${id}`);
                    } else {
                      toast.warning("⚠️ Please login or register first!");

                      setTimeout(() => {
                        navigate("/login", { state: { redirectTo: `/job-details/${id}` } });
                      }, 1200);
                    }
                  }}
                  className="block w-full text-center cursor-pointer py-2 rounded-xl text-sm font-semibold bg-[#F3E8FF] text-[#7900BA] group-hover:bg-[#7900BA] group-hover:text-white transition-all duration-200"
                >
                  {token ? "View & Apply" : "Login"}
                </span>
              </div> */}
              <div className="mt-auto pt-1">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(buildJobDetailsPath(item));
                  }}
                  className="block w-full text-center cursor-pointer py-2 rounded-xl text-sm font-semibold bg-[#F3E8FF] text-[#7900BA] group-hover:bg-[#7900BA] group-hover:text-white transition-all duration-200"
                >
                  View & Apply
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Findjobboxmodel;

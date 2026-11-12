import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Layout from "../../../../components/Layout/Layout";
import Applypopup from "../../../../components/Dialog/Applypopup";
import Spampopup from "../../../../components/Dialog/Spampopup";
import ShareJobModal from "../../../../components/Dialog/ShareJobModal";
import Findjobboxmodel from "../Findjobboxmodel/Findjobboxmodel";

import { fetchJobDetails, clearJobDetails } from "../../../../redux/slice/GetJobDetailsSlice/GetJobDetailsSlice";
import { fetchJobAlerts } from "../../../../redux/slice/jobalertSlice/GetJobAlertSlice";
import { toggleSavedJob } from "../../../../redux/slice/SavedJobJobAlertSlice/SavedJobAlertSlice";
import { applyJob } from "../../../../redux/slice/ApplyJobSlice/ApplyJobSlice";
import { fetchAppliedJobs } from "../../../../redux/slice/GetAppliedSlice/GetAppliedJobSlice";
import { fetchJobs } from "../../../../redux/slice/findJob/findJobSlice";
import {
  checkAppliedStatusApi,
  withdrawApplicationApi,
} from "../../../../services/candidateProfileService";

// Icons
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";
import { FiFlag, FiPhone } from "react-icons/fi";
import { TfiEmail, TfiBag } from "react-icons/tfi";
import { CiCalendar, CiStopwatch } from "react-icons/ci";
import { PiWallet, PiGraduationCap } from "react-icons/pi";
import { GrLocation } from "react-icons/gr";
import { BsBriefcase } from "react-icons/bs";
import {
  FaBookmark, FaArrowLeft, FaArrowRight,
  FaFacebookF, FaTwitter, FaWhatsapp, FaLinkedinIn, FaTelegramPlane,
} from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { IoLogoYoutube, IoIosLink } from "react-icons/io";
import { TbCurrencyRupee } from "react-icons/tb";
import Loading from "../../../../components/common/loader/Loading";
import { toast } from "react-toastify";
import { Country } from "country-state-city";
import { buildJobDetailsPath, getJobLocationText } from "../../../../utils/jobDetailsPath";

// ── Helper: normalize website url ───────────────────────────────────────────
const formatWebsiteUrl = (url) => {
  if (!url) return "#";
  const trimmed = String(url).trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
};

// ── Helper: auto-linkify and highlight URLs in descriptions ──────────────────
const linkifyText = (input) => {
  if (!input) return "";

  // Match existing <a> tags, other HTML tags, or standalone URLs
  const urlRegex = /((?:<a\b[^>]*>[\s\S]*?<\/a>)|(?:<[^>]+>))|((?:https?:\/\/|www\.)[^\s<>"']+)/gi;

  return String(input).replace(urlRegex, (match, tag, url) => {
    if (tag) {
      if (tag.toLowerCase().startsWith("<a")) {
        return tag.replace(
          /<a\b([^>]*)>/i,
          (aTag, attrs) => {
            const hasTarget = /target\s*=/i.test(attrs);
            const targetAttr = hasTarget ? "" : ' target="_blank" rel="noopener noreferrer"';
            if (/class\s*=\s*["']/i.test(attrs)) {
              return `<a${attrs.replace(/class\s*=\s*["']([^"']*)["']/i, 'class="$1 text-[#7900BA] bg-purple-50 hover:bg-purple-100 hover:text-purple-900 px-2.5 py-0.5 rounded-md border border-purple-200 font-semibold underline hover:no-underline transition-all break-all inline-block my-0.5"')}${targetAttr}>`;
            }
            return `<a${attrs} class="text-[#7900BA] bg-purple-50 hover:bg-purple-100 hover:text-purple-900 px-2.5 py-0.5 rounded-md border border-purple-200 font-semibold underline hover:no-underline transition-all break-all inline-block my-0.5"${targetAttr}>`;
          }
        );
      }
      return tag;
    }

    if (url) {
      let cleanUrl = url;
      let trailing = "";
      const trailingMatch = cleanUrl.match(/[.,;:!)]+$/);
      if (trailingMatch) {
        trailing = trailingMatch[0];
        cleanUrl = cleanUrl.slice(0, -trailing.length);
      }
      const href = cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-[#7900BA] bg-purple-50 hover:bg-purple-100 hover:text-purple-900 px-2.5 py-0.5 rounded-md border border-purple-200 font-semibold underline hover:no-underline transition-all break-all inline-block my-0.5 shadow-2xs">${cleanUrl}</a>${trailing}`;
    }

    return match;
  });
};

// ── Helper: format plain text with basic markdown (bold, lists) ────────────────
const formatPlainText = (text) => {
  if (!text) return "";
  let formatted = text;

  // Convert bold: **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Convert bullet points: lines starting with -, *, or •
  const lines = formatted.split("\n");
  let inList = false;
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isListItem = /^[-*•]\s+(.*)$/.test(line);
    const isNumberedItem = /^(\d+)\.\s+(.*)$/.test(line);

    if (isListItem) {
      if (!inList) {
        inList = true;
        result.push('<ul class="list-disc pl-5 my-2">');
      }
      result.push(`<li>${line.replace(/^[-*•]\s+/, "")}</li>`);
    } else if (isNumberedItem) {
      if (!inList) {
        inList = true;
        result.push('<ol class="list-decimal pl-5 my-2">');
      }
      result.push(`<li>${line.replace(/^\d+\.\s+/, "")}</li>`);
    } else {
      if (inList) {
        inList = false;
        result.push('</ul>'); // Simple close, might mismatch ul/ol but works for most plain text
      }
      if (line) {
        result.push(`${line}<br />`);
      } else {
        result.push("<br />");
      }
    }
  }

  if (inList) {
    result.push("</ul>");
  }

  // Clean up excessive trailing <br />
  return result.join("\n").replace(/(<br \/>\n?)+$/g, "");
};

// ── Helper: render HTML string safely with link highlighting ─────────────────
const HtmlContent = ({ html, className = "" }) => {
  if (!html) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  const formattedHtml = isHtml ? html : formatPlainText(html);
  const processedHtml = linkifyText(formattedHtml);

  return (
    <div
      className={`prose prose-sm max-w-none text-gray-600 leading-relaxed
        prose-h2:text-gray-800 prose-h2:font-semibold prose-h2:text-base
        prose-h3:text-gray-700 prose-h3:font-medium prose-h3:text-sm
        prose-strong:text-gray-800 prose-li:my-0.5 prose-p:my-1
        prose-a:text-[#7900BA] prose-a:bg-purple-50 prose-a:px-2.5 prose-a:py-0.5 prose-a:rounded-md prose-a:border prose-a:border-purple-200 prose-a:font-semibold hover:prose-a:bg-purple-100 hover:prose-a:text-purple-900 prose-a:underline hover:prose-a:no-underline prose-a:transition-all prose-a:break-all ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

const Findjobdetails = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);

  const [showModal, setShowModal] = useState(false);
  const [openSpam, setOpenSpam] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [applied, setApplied] = useState(false);
  const [appliedInfo, setAppliedInfo] = useState({
    hasApplied: false,
    applicationId: null,
    status: null,
    appliedDate: null,
  });
  const [checkingApplied, setCheckingApplied] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const { job, loading } = useSelector((state) => state.jobDetails);
  const allJobs = useSelector((state) => state.findJob?.jobs || []);
  // const savedJobs = useSelector((state) => state.savedJobs.savedJobs || []);
  const appliedJobs = useSelector((state) => state.appliedJobs?.appliedJobs || []);

  // ✅ API 17: Check Applied Status from backend
  useEffect(() => {
    let isMounted = true;
    const fetchAppliedStatus = async () => {
      if (!token || !job?._id) return;
      try {
        setCheckingApplied(true);
        const res = await checkAppliedStatusApi(job._id);
        if (isMounted && res?.success) {
          setAppliedInfo({
            hasApplied: !!res.hasApplied,
            applicationId: res.applicationId || null,
            status: res.status || null,
            appliedDate: res.appliedDate || null,
          });
        }
      } catch (err) {
        console.error("API 17 Check Applied Status error:", err);
      } finally {
        if (isMounted) setCheckingApplied(false);
      }
    };

    fetchAppliedStatus();
    return () => {
      isMounted = false;
    };
  }, [job?._id, token, applied]);

  const isApplied =
    appliedInfo.hasApplied ||
    (job
      ? (appliedJobs || []).some(
          (item) => item.jobId === job._id || item._id === job._id
        )
      : applied);

  // ✅ API 18: Withdraw Application
  const handleWithdraw = async () => {
    if (!appliedInfo.applicationId) return;
    if (
      !window.confirm(
        "Are you sure you want to withdraw your application for this job?"
      )
    ) {
      return;
    }

    try {
      setWithdrawing(true);
      const res = await withdrawApplicationApi(appliedInfo.applicationId);
      if (res?.success) {
        toast.success(res.message || "Application withdrawn successfully");
        setAppliedInfo({
          hasApplied: false,
          applicationId: null,
          status: null,
          appliedDate: null,
        });
        setApplied(false);
        if (token) {
          dispatch(fetchAppliedJobs(token));
        }
      } else {
        toast.error(res?.message || "Failed to withdraw application");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to withdraw application"
      );
    } finally {
      setWithdrawing(false);
    }
  };
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (job) {
      setSaved(job.isSaved || false);
    }
  }, [job]);
  const handleBookmark = async () => {
    if (!job) return;

    const token = localStorage.getItem("token");

    await dispatch(
      toggleSavedJob({
        token,
        jobId: job._id,
        jobName: job.jobTitle,
      })
    );

    // 🔥 instant UI update
    setSaved((prev) => !prev);

    // ✅ backend sync
    if (job.slug) {
      dispatch(fetchJobDetails({ token, slug: job.slug }));
    } else if (isObjectId) {
      dispatch(fetchJobDetails({ token, jobId: slug }));
    } else {
      dispatch(fetchJobDetails({ token, slug }));
    }
  };

  // 1. Fetch user-level / global data ONLY ONCE on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchAppliedJobs(token));
      dispatch(fetchJobAlerts({ token }));
    }
    dispatch(fetchJobs({ limit: 12 }));
  }, [dispatch, token]);

  // 2. Fetch specific job details when slug changes
  const lastFetchedSlug = React.useRef(null);
  
  useEffect(() => {
    if (!slug) return;
    
    // Prevent refetching if we just redirected to the exact SEO slug of the already loaded job
    // or if we already fetched this slug.
    if (lastFetchedSlug.current === slug) return;
    if (job && job.slug === slug) {
      lastFetchedSlug.current = slug;
      return;
    }

    lastFetchedSlug.current = slug;
    dispatch(clearJobDetails());
    
    if (isObjectId) {
      dispatch(fetchJobDetails({ token, jobId: slug }));
    } else {
      dispatch(fetchJobDetails({ token, slug }));
    }
  }, [dispatch, slug, isObjectId, token, job]);

  // Clear job details state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearJobDetails());
    };
  }, [dispatch]);

  // Handle Redirection for Backward Compatibility & SEO Canonical Path
  useEffect(() => {
    if (job) {
      const correctPath = buildJobDetailsPath(job);
      const currentPath = window.location.pathname;
      if (currentPath !== correctPath) {
        navigate(correctPath, { replace: true });
      }
    }
  }, [job, navigate]);

  // Handle Dynamic SEO Headers
  useEffect(() => {
    if (job) {
      // 1. Title Tag
      const companyName = job.employerId?.name || "Company";
      document.title = `${job.jobTitle} | ${companyName} | Job Portal`;

      // 2. Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
      };
      const rawText = stripHtml(job.jobDescription);
      metaDesc.setAttribute('content', rawText.substring(0, 160) + (rawText.length > 160 ? "..." : ""));

      // 3. Canonical Link
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', `https://jobportal.com/jobs/${job.slug}`);
    }
  }, [job]);



  // const getLocationInfo = (job) => {
  //   const loc = job?.jobLocation || job?.location || {};
  //   const adv = job?.advanceInformation || {};

  //   const rawWorkMode =
  //     job?.workMode ||
  //     adv?.workMode ||
  //     job?.jobMode ||
  //     job?.locationType ||
  //     adv?.jobLocationType ||
  //     "";

  //   const workMode = String(rawWorkMode).toLowerCase().replace(/[\s\-_]/g, "");

  //   const isRemote =
  //     workMode.includes("remote") ||
  //     workMode.includes("workfromhome") ||
  //     workMode.includes("wfh");

  //   const countryCode =
  //     job?.countryCode ||
  //     job?.jobCountryCode ||
  //     loc?.countryCode ||
  //     loc?.country_code ||
  //     "";

  //   const countryName =
  //     job?.countryName ||
  //     job?.country ||
  //     job?.jobCountry ||
  //     loc?.countryName ||
  //     loc?.country ||
  //     (countryCode ? Country.getCountryByCode(countryCode)?.name : "")

  //   const stateName =
  //     job?.stateName ||
  //     job?.state ||
  //     job?.jobState ||
  //     loc?.stateName ||
  //     loc?.state ||
  //     loc?.state_name ||
  //     "";

  //   const cityName =
  //     job?.cityName ||
  //     job?.city ||
  //     job?.jobCity ||
  //     job?.currentCity ||
  //     job?.currentCityArea ||
  //     loc?.cityName ||
  //     loc?.city ||
  //     loc?.city_name ||
  //     loc?.name ||
  //     "";

  //   const locationAsString = typeof loc === "string" ? loc : "";

  //   if (isRemote) {
  //     return countryName || locationAsString || "N/A";
  //   }

  //   const locationParts = [];
  //   if (cityName) locationParts.push(cityName);
  //   if (stateName) locationParts.push(stateName);

  //   return locationParts.length > 0
  //     ? locationParts.join(", ")
  //     : locationAsString || countryName || "N/A";
  // };

  const getLocationInfo = (job) => {
    return getJobLocationText(job);
  };


  const displayLocation = getLocationInfo(job);





  const relatedJobs = job
    ? allJobs.filter((item) => {
      const itemLocation = getLocationInfo(item)?.toLowerCase();
      const jobLocation = getLocationInfo(job)?.toLowerCase();

      return (
        item._id !== job._id &&
        (
          item.jobRole === job.jobRole ||
          itemLocation === jobLocation ||
          (Array.isArray(item.skillsRequired) && Array.isArray(job.skillsRequired) &&
            item.skillsRequired.some((skill) => job.skillsRequired.includes(skill)))
        )
      );
    })
    : [];

  const isJobExpired = () => {
    if (!job?.advanceInformation?.expireDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(job.advanceInformation.expireDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 0;
  };

  const handleApplyJob = async (formData) => {
    if (!job || !token || isJobExpired()) return;
    try {
      await dispatch(
        applyJob({
          token,
          payload: {
            jobId: job._id,
            experience: formData.experience,
            currentCTC: formData.currentCTC,
            expectedCTC: formData.expectedCTC,
            noticePeriod: formData.noticePeriod,
            immediateJoiner: formData.noticePeriod === "Immediate" ? "true" : "false",
          },
        })
      ).unwrap();
      setApplied(true);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Shorthand from actual API shape ──────────────────────────────────────────
  // data.advanceInformation  → education, experience, jobType, expireDate
  // data.employerId          → _id, name, email, companyDetail:{companyLogo, companyWebsite}
  // data.salaryRange         → minSalary, maxSalary
  // data.jobDescription      → HTML string
  // data.jobResponsibilities → HTML string
  // data.skillsRequired      → string[]

  const adv = job?.advanceInformation || {};
  const employer = job?.employerId || {};
  const companyWebsite =
    employer?.companyDetail?.companyWebsite ||
    employer?.companyWebsite ||
    job?.companyWebsite ||
    job?.companyDetail?.companyWebsite;

  const formatEducationText = (value) => {
    if (!value) return "N/A";
    return String(value)
      .trim()
      .replace(/post\s+graduate/gi, "Post-Graduate")
      .replace(/,\s*/g, ", ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim();
  };

  const resolveLogoSrc = (logo) => {
    if (!logo) return null;
    if (Array.isArray(logo)) return resolveLogoSrc(logo[0]);
    if (typeof logo === "object") {
      if (logo.url) return String(logo.url).trim();
      if (logo.src) return String(logo.src).trim();
      if (logo.secure_url) return String(logo.secure_url).trim();
      if (logo.path) return String(logo.path).trim();
      return null;
    }
    if (typeof logo === "string") {
      const trimmed = logo.trim();
      if (!trimmed) return null;
      if (trimmed.includes(",")) return trimmed.split(",")[0].trim();
      return trimmed;
    }
    return null;
  };

  const rawLogo =
    job?.companyLogo ||
    job?.logo ||
    job?.companyDetail?.companyLogo ||
    employer?.companyDetail?.companyLogo ||
    employer?.companyLogo ||
    employer?.logo ||
    null;

  const logoSrc = resolveLogoSrc(rawLogo);
  const minSal = job?.salaryRange?.minSalary;
  const maxSal = job?.salaryRange?.maxSalary;

  const getPostedDate = () => {
    if (job?.postedDate) return new Date(job.postedDate);
    if (job?.createdAt) return new Date(job.createdAt);
    if (job?._id && job._id.length === 24) {
      const timestampHex = job._id.substring(0, 8);
      const timestampDec = parseInt(timestampHex, 16);
      if (!isNaN(timestampDec)) {
        return new Date(timestampDec * 1000);
      }
    }
    return null;
  };

  const postedDateVal = getPostedDate();

  const overviewItems = [
    {
      icon: <CiCalendar size={24} color="#7900BA" />,
      label: "POSTED",
      value: postedDateVal
        ? postedDateVal.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "N/A",
    },
    {
      icon: <CiStopwatch size={24} color="#7900BA" />,
      label: "EXPIRES",
      value: job?.advanceInformation?.expireDate
        ? new Date(job.advanceInformation.expireDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "N/A"
    },
    {
      icon: <PiGraduationCap size={24} color="#7900BA" />,
      label: "EDUCATION",
      value: formatEducationText(adv.education) || "N/A",
    },
    {
      icon: <TbCurrencyRupee size={24} color="#7900BA" />,
      label: "SALARY",
      value: minSal && maxSal
        ? `₹${minSal.toLocaleString("en-IN")} – ₹${maxSal.toLocaleString("en-IN")}`
        : "Not Disclosed",
    },
    {
      icon: <GrLocation size={24} color="#7900BA" />,
      label: "LOCATION",
      value: displayLocation,
    },
    {
      icon: <TfiBag size={24} color="#7900BA" />,
      label: "JOB TYPE",
      value: adv.jobType || "N/A",
    },
    {
      icon: <BsBriefcase size={24} color="#7900BA" />,
      label: "EXPERIENCE",
      value: adv.experience || "N/A",
    },
  ];

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout hideHeader>
        {/* <div className="bg-white p-4 md:p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-32 h-5" />
          </div>
          <div className="flex gap-4 border-b pb-5">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-72 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-40 h-5" />
                  <Skeleton className="w-full h-20" />
                </div>
              ))}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="w-full h-56 rounded-xl" />
              <Skeleton className="w-full h-40 rounded-xl" />
            </div>
          </div>
        </div> */}
        <Loading text="Loading Job Details..." />
      </Layout>
    );
  }

  if (!job) return (
    <Layout hideHeader>
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-lg font-medium">Job not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-purple-600 underline text-sm">
          Go back
        </button>
      </div>
    </Layout>
  );

  return (
    <Layout hideHeader>
      <div className="bg-white p-4 md:p-6">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <p className="font-semibold text-lg">Job Details</p>
        </div>

        {/* ── Job Header ── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 border-b pb-6 mb-6">
          {/* Logo */}
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Company Logo"
              className="w-16 h-16 rounded-2xl border border-gray-200 object-contain p-1 bg-white shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-2xl shrink-0">
              {employer?.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-xl text-gray-900">{job.jobTitle}</h2>
              {adv.jobType && (
                <span className="text-xs font-medium text-[#7900BA] px-2.5 py-1 bg-[#DCBDED] rounded-full">
                  {adv.jobType}
                </span>
              )}
              {/* Active status */}
              {job.status === "active" && (
                <span className="text-xs font-medium text-green-700 px-2.5 py-1 bg-green-50 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Active
                </span>
              )}
            </div>

            <p className="text-gray-600 font-medium mt-1">{employer?.name || "Company"}</p>

            <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-gray-500 mt-2">
              {companyWebsite && (
                <a
                  href={formatWebsiteUrl(companyWebsite)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7900BA] font-medium text-xs sm:text-sm border border-purple-200 hover:bg-purple-100 hover:text-purple-800 transition-all shadow-xs cursor-pointer group"
                  title="Visit company website"
                >
                  <IoIosLink className="text-[#7900BA] group-hover:scale-110 transition-transform" size={15} />
                  <span className="hover:underline">{companyWebsite}</span>
                </a>
              )}
              {employer?.mobileNumber && (
                <a
                  href={`tel:${employer.mobileNumber}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7900BA] font-medium text-xs sm:text-sm border border-purple-200 hover:bg-purple-100 hover:text-purple-800 transition-all shadow-xs cursor-pointer group"
                  title="Call employer"
                >
                  <FiPhone className="text-[#7900BA] group-hover:scale-110 transition-transform" size={14} />
                  <span className="hover:underline">{employer.mobileNumber}</span>
                </a>
              )}
              {employer?.email && (
                <a
                  href={`mailto:${employer.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7900BA] font-medium text-xs sm:text-sm border border-purple-200 hover:bg-purple-100 hover:text-purple-800 transition-all shadow-xs cursor-pointer group"
                  title="Email employer"
                >
                  <TfiEmail className="text-[#7900BA] group-hover:scale-110 transition-transform" size={14} />
                  <span className="hover:underline">{employer.email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenSpam(true)}
                title="Report job"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-yellow-50 hover:bg-yellow-100 transition"
              >
                <FiFlag className="text-red-500" size={18} />
              </button>

              <button
                onClick={() => setOpenShare(true)}
                title="Share"
                className="h-10 px-3 sm:px-3.5 flex items-center gap-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7900BA] border border-purple-200 transition text-sm font-semibold shadow-xs"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>

              {/* <button
                onClick={handleBookmark}
                title={saved ? "Remove bookmark" : "Save job"}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition ${saved
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
              >
                <FaBookmark size={16} />
              </button> */}

              {isJobExpired() ? (
                <span className="px-6 py-2 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm font-semibold select-none">
                  This job is expired
                </span>
              ) : isApplied ? (
                <div className="flex items-center gap-2">
                  <button
                    disabled
                    className="px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold cursor-not-allowed shadow-xs"
                  >
                    {appliedInfo.status && appliedInfo.status !== "applied"
                      ? `✓ ${appliedInfo.status.charAt(0).toUpperCase() + appliedInfo.status.slice(1)}`
                      : "✓ Applied"}
                  </button>
                  {appliedInfo.status === "applied" && appliedInfo.applicationId && (
                    <button
                      type="button"
                      onClick={handleWithdraw}
                      disabled={withdrawing}
                      className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold transition cursor-pointer"
                      title="Withdraw application"
                    >
                      {withdrawing ? "Withdrawing..." : "Withdraw"}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (token) {
                      setShowModal(true); // ✅ open apply modal
                    } else {
                      setTimeout(() => {
                        navigate("/login", {
                          state: { redirectTo: window.location.pathname },
                          fromApply: true,
                        });
                      }, 1200);
                    }
                  }}
                  className="px-6 py-2 rounded-xl bg-[#7900BA] hover:bg-purple-700 text-white text-sm font-semibold transition shadow-md"
                >
                  {token ? "Apply Now" : "Login to Apply"}
                </button>
              )}
            </div>

            {adv.expireDate && (
              <p className="text-xs text-right">
                <span className="text-gray-400">Expires: </span>
                <span className="text-[#E05151] font-medium"> {job?.advanceInformation?.expireDate
                  ? new Date(job.advanceInformation.expireDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  : "N/A"}</span>
              </p>
            )}
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left — 3 cols */}
          <div className="lg:col-span-3 flex flex-col gap-8">

            {/* Job Description — rendered as HTML */}
            <section>
              <h3 className="font-semibold text-base text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Job Description
              </h3>
              {job.jobDescription ? (
                <HtmlContent html={job.jobDescription} />
              ) : (
                <p className="text-gray-400 text-sm">No description provided.</p>
              )}
            </section>

            {/* Responsibilities — rendered as HTML */}
            <section>
              <h3 className="font-semibold text-base text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Responsibilities
              </h3>
              {job.jobResponsibilities ? (
                <HtmlContent html={job.jobResponsibilities} />
              ) : (
                <p className="text-gray-400 text-sm">No responsibilities listed.</p>
              )}
            </section>

            {/* Skills */}
            {job.skillsRequired?.length > 0 && (
              <section>
                <h3 className="font-semibold text-base text-gray-900 mb-3 pb-2 border-b border-gray-100">
                  Skills Required
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Salary */}
            <section>
              <h3 className="font-semibold text-base text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Salary
              </h3>
              {minSal && maxSal ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-2xl font-bold text-gray-800">
                    <TbCurrencyRupee className="text-purple-600" />
                    {minSal.toLocaleString("en-IN")}
                    <span className="text-gray-400 font-normal mx-1">–</span>
                    <TbCurrencyRupee className="text-purple-600" />
                    {maxSal.toLocaleString("en-IN")}
                  </div>
                  <span className="text-sm text-gray-400">/ {job.salaryType || "Monthly"}</span>
                </div>
              ) : (
                <p className="text-gray-400">Not Disclosed</p>
              )}
            </section>


          </div>

          {/* Right — 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Job Overview grid */}
            <div className="border border-[#DCBDED] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-[#FDF5FD]">
                <p className="font-semibold text-sm text-gray-800">Job Overview</p>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4">
                {overviewItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center gap-2 p-3 border border-gray-100 rounded-xl hover:shadow-md hover:border-purple-200 transition-all"
                  >
                    {item.icon}
                    <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide leading-tight">
                      {item.label}
                    </p>
                    <p className="text-[12px] font-semibold text-gray-700 leading-tight">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <div className="border border-[#DCBDED] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="Company"
                    className="w-12 h-12 rounded-xl border border-gray-100 object-contain p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                    {employer?.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {employer?.name || "Company"}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {employer?.companyDetail?.industry || "Industry not listed"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {companyWebsite && (
                  <div className="flex items-start gap-2 pt-1">
                    <IoIosLink className="text-[#7900BA] mt-1 shrink-0" size={16} />
                    <a
                      href={formatWebsiteUrl(companyWebsite)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#7900BA] font-medium hover:underline hover:text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 transition break-all inline-block text-xs sm:text-sm"
                      title="Visit company website"
                    >
                      {companyWebsite}
                    </a>
                  </div>
                )}
                {employer?.email && (
                  <div className="flex items-start gap-2">
                    <TfiEmail className="text-[#7900BA] mt-1 shrink-0" size={15} />
                    <a
                      href={`mailto:${employer.email}`}
                      className="text-[#7900BA] font-medium hover:underline hover:text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 transition break-all inline-block text-xs sm:text-sm"
                      title="Send email"
                    >
                      {employer.email}
                    </a>
                  </div>
                )}
                {employer?.mobileNumber && (
                  <div className="flex items-start gap-2">
                    <FiPhone className="text-[#7900BA] mt-1 shrink-0" size={15} />
                    <a
                      href={`tel:${employer.mobileNumber}`}
                      className="text-[#7900BA] font-medium hover:underline hover:text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 transition break-all inline-block text-xs sm:text-sm"
                      title="Call company"
                    >
                      {employer.mobileNumber}
                    </a>
                  </div>
                )}
              </div>

              {/* Apply again button in sidebar */}
              {isJobExpired() ? (
                <div className="w-full text-center py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm font-semibold select-none mt-2">
                  This job is expired
                </div>
              ) : isApplied ? (
                <div className="w-full flex flex-col gap-2 mt-2">
                  <div className="w-full text-center py-2.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-semibold select-none">
                    {appliedInfo.status && appliedInfo.status !== "applied"
                      ? `✓ Status: ${appliedInfo.status.charAt(0).toUpperCase() + appliedInfo.status.slice(1)}`
                      : "✓ Application Submitted"}
                  </div>
                  {appliedInfo.status === "applied" && appliedInfo.applicationId && (
                    <button
                      type="button"
                      onClick={handleWithdraw}
                      disabled={withdrawing}
                      className="w-full py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
                    >
                      {withdrawing ? "Withdrawing..." : "Withdraw Application"}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (token) {
                      setShowModal(true); // ✅ open apply modal
                    } else {
                      setTimeout(() => {
                        navigate("/login", {
                          state: { redirectTo: window.location.pathname },
                          fromApply: true,
                        });
                      }, 1200);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#7900BA] hover:bg-purple-700 text-white text-sm font-semibold transition mt-2 cursor-pointer"
                >
                  {token ? "Apply Now" : "Login to Apply"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Jobs ── */}
        {relatedJobs.length > 0 && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-xl text-gray-800">Related Jobs</h2>
            </div>
            <Findjobboxmodel jobs={relatedJobs.slice(0, 4)} />
          </div>
        )}

        {/* ── Popups ── */}
        {showModal && (
          <Applypopup
            setshowmodal={setShowModal}
            handleApplyJob={handleApplyJob}
            jobId={job._id}
            setApplied={setApplied}
          />
        )}
        {openSpam && <Spampopup setopen={setOpenSpam} />}
        <ShareJobModal
          isOpen={openShare}
          onClose={() => setOpenShare(false)}
          job={job}
          locationText={displayLocation}
        />
      </div>
    </Layout>
  );
};

export default Findjobdetails;

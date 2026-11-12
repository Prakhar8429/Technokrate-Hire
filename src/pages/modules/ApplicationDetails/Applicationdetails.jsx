import React, { useState, useEffect } from "react";
import Header from "../../../components/header/Header";
import { Stepper, Step, StepLabel, StepConnector } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GiCrossedChains } from "react-icons/gi";
import { LuPhone } from "react-icons/lu";
import { TfiEmail } from "react-icons/tfi";
import { TbDeviceTabletSearch } from "react-icons/tb";
import { IoExitOutline } from "react-icons/io5";
import { RiArrowDownSLine, RiCalendarScheduleLine } from "react-icons/ri";
import { GrCompliance } from "react-icons/gr";
import { FaArrowRight } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserDetails } from "../../../redux/slice/user/userSlice";
import {
  fetchAppliedJobs,
  withdrawApplication,
} from "../../../redux/slice/GetAppliedSlice/GetAppliedJobSlice";
import { toast } from "react-toastify";

/* ---------------- CUSTOM CONNECTOR ---------------- */
const CustomConnector = styled(StepConnector)(() => ({
  "& .MuiStepConnector-line": {
    height: 3,
    border: 0,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  "&.Mui-active .MuiStepConnector-line": {
    backgroundColor: "#7900BA",
  },
  "&.Mui-completed .MuiStepConnector-line": {
    backgroundColor: "#7900BA",
  },
}));

/* ---------------- CUSTOM STEP ICON ---------------- */
const StepIconRoot = styled("div")(({ ownerState }) => ({
  backgroundColor:
    ownerState.active || ownerState.completed ? "#7900BA" : "#fff",
  color: ownerState.active || ownerState.completed ? "#fff" : "#7900BA",
  border: "2px solid #7900BA",
  width: 44,
  height: 44,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}));

const CustomStepIcon = (props) => {
  const { active, completed, icon } = props;

  const icons = {
    1: <IoExitOutline size={20} />,
    2: <TbDeviceTabletSearch size={20} />,
    3: <GrCompliance size={18} />,
    4: <RiCalendarScheduleLine size={20} />,
  };

  return (
    <StepIconRoot ownerState={{ active, completed }}>
      {icons[String(icon)]}
    </StepIconRoot>
  );
};

const getStepFromStatus = (status = "") => {
  const s = String(status).toLowerCase();
  if (s.includes("interview") || s.includes("scheduled")) return 3;
  if (s.includes("shortlist") || s.includes("reject")) return 2;
  if (s.includes("review") || s.includes("under")) return 1;
  return 0; // Application Submitted / Active / Pending
};

const ApplicationDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");
  const reduxUser = useSelector((state) => state.user?.user);
  const appliedJobs = useSelector((state) => state.appliedJobs?.appliedJobs || []);

  useEffect(() => {
    if (token && !reduxUser) {
      dispatch(fetchUserDetails());
    }
    if (token && (!appliedJobs || appliedJobs.length === 0)) {
      dispatch(fetchAppliedJobs(token));
    }
  }, [dispatch, token, reduxUser, appliedJobs]);

  const passedJob = location.state?.job;
  const fallbackRawJob = appliedJobs[0];

  const job = passedJob || (fallbackRawJob ? {
    id: fallbackRawJob._id || fallbackRawJob.id,
    title: fallbackRawJob.jobTitle || fallbackRawJob.title || "Job Position",
    location: fallbackRawJob.jobLocation?.name || fallbackRawJob.location || "N/A",
    salary: fallbackRawJob.salary
      ? (typeof fallbackRawJob.salary === "string" ? fallbackRawJob.salary : `₹${fallbackRawJob.salary.minSalary || 0}–${fallbackRawJob.salary.maxSalary || 0}`)
      : "Not Disclosed",
    dateApplied: fallbackRawJob.dateApplied
      ? new Date(fallbackRawJob.dateApplied).toISOString().split("T")[0]
      : "N/A",
    status: fallbackRawJob.status || "Pending",
    type: fallbackRawJob.advanceInformation?.jobType || fallbackRawJob.jobType || "Full-time",
    logo: fallbackRawJob.companyLogo?.[0] || fallbackRawJob.logo || null,
    companyName: fallbackRawJob.companyName || fallbackRawJob.company?.name || "Technokrate Partner",
    companyEmail: fallbackRawJob.companyEmail || fallbackRawJob.company?.email || "career@technokrate.com",
    companyPhone: fallbackRawJob.companyPhone || fallbackRawJob.company?.phone || "N/A",
    companyWebsite: fallbackRawJob.companyWebsite || fallbackRawJob.company?.website || "https://technokrate.com",
  } : null);

  const initialStep = getStepFromStatus(job?.status || "submitted");
  const [activeStep, setActiveStep] = useState(initialStep);
  const [openSection, setOpenSection] = useState("Applicant Information");

  useEffect(() => {
    if (job?.status) {
      setActiveStep(getStepFromStatus(job.status));
    }
  }, [job?.status]);

  const candidateName = reduxUser?.fullName || reduxUser?.name || "Candidate";
  const candidateEmail = reduxUser?.email || "N/A";
  const candidatePhone = reduxUser?.mobileNumber || reduxUser?.phone || "N/A";
  const candidateLocation = reduxUser?.basicDetails?.city || reduxUser?.location || reduxUser?.address || job?.location || "N/A";
  const candidateRole = reduxUser?.basicDetails?.headline || reduxUser?.currentRole || job?.title || "Job Seeker";

  const steps = [
    {
      name: "Application Submitted",
      description:
        "Your application has been successfully submitted. We appreciate your interest and will review your submission shortly.",
    },
    {
      name: "Under Review",
      description:
        "Your application is currently under review. We will notify you once a decision has been made.",
    },
    {
      name: "Shortlisted / Rejected",
      description:
        "We will notify you soon regarding the outcome of the selection process.",
    },
    {
      name: "Interview Scheduled",
      description:
        "Your application is under review. If shortlisted, we will contact you soon to schedule an interview.",
    },
  ];

  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    const applicationId = job?.id || job?._id || job?.applicationId;
    if (!applicationId) return;

    if (
      !window.confirm(
        `Are you sure you want to withdraw your application for "${job?.title || "this position"}"?`
      )
    ) {
      return;
    }

    try {
      setWithdrawing(true);
      const res = await dispatch(withdrawApplication(applicationId)).unwrap();
      toast.success(res?.data?.message || "Application withdrawn successfully");
      navigate("/dashboard/applied-jobs");
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Cannot withdraw this application"
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const sections = [
    {
      key: "Applicant Information",
      label: "Applicant Information",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Name</p>
              <p className="font-semibold text-gray-800 text-base">{candidateName}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Email</p>
              <p className="font-semibold text-gray-800 text-base">{candidateEmail}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Phone</p>
              <p className="font-semibold text-gray-800 text-base">{candidatePhone}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Location</p>
              <p className="font-semibold text-gray-800 text-base">{candidateLocation}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Current Role / Applied Position</p>
            <p className="font-semibold text-gray-800 text-base">{candidateRole}</p>
          </div>
        </div>
      ),
    },
    {
      key: "Applicant Progress",
      label: "Applicant Progress",
      content: (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
            <p className="text-sm font-semibold text-gray-800">Application Submitted</p>
            <p className="text-xs text-gray-500">Submitted on {job?.dateApplied || "N/A"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
            <p className="text-sm font-semibold text-gray-800">
              Current Status: {job?.status ? (job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase()) : "Active"}
            </p>
            <p className="text-xs text-gray-500">
              Your application for <span className="font-medium text-gray-700">{job?.title || "this position"}</span> is currently {job?.status ? job.status.toLowerCase() : "under review"}.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
            <p className="text-sm font-semibold text-gray-800">Next Steps</p>
            <p className="text-xs text-gray-500">We will notify you when the employer updates your application status.</p>
          </div>
          {(job?.status?.toLowerCase() === "applied" || !job?.status) && (
            <div className="rounded-xl border border-red-200 p-4 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-red-700">Withdraw Application</p>
                <p className="text-xs text-red-600">
                  You can withdraw your application while it is still in the applied status.
                </p>
              </div>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                {withdrawing ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Intercept browser back button so user always returns to applied jobs
  useEffect(() => {
    const handlePopState = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      navigate("/dashboard/applied-jobs", { replace: true });
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const handleBack = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    navigate("/dashboard/applied-jobs", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header onLogoClick={handleBack} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* ── Breadcrumb / Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              title="Back to Applied Jobs"
              aria-label="Back to Applied Jobs"
            >
              <ArrowLeft size={20} />
            </button>
            <p
              onClick={handleBack}
              className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-[#7900BA] transition-colors"
              title="Back to Applied Jobs"
            >
              Application Details
            </p>
          </div>

          {(job?.status?.toLowerCase() === "applied" || !job?.status) && (
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition disabled:opacity-50"
            >
              {withdrawing ? "Withdrawing..." : "Withdraw Application"}
            </button>
          )}
        </div>

        {/* ---------------- JOB INFO ---------------- */}
        <div className="rounded-2xl p-6 mb-8 bg-white border border-purple-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {job?.logo ? (
              <img src={job.logo} alt={job.title} className="w-14 h-14 rounded-xl object-contain border border-gray-100 shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-purple-100 text-[#7900BA] flex items-center justify-center font-bold text-xl shrink-0 border border-purple-200">
                {(job?.title || "J").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="text-xl font-bold text-gray-900">{job?.title || "Job Application"}</h2>
                <span className="text-[#7900BA] text-xs font-semibold py-1 px-3 rounded-full bg-[#DCBDED]">
                  {job?.type || "Full Time"}
                </span>
                {job?.salary && (
                  <span className="text-gray-600 text-xs py-1 px-3 rounded-full bg-gray-100 border">
                    Salary: {job.salary}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <a
                    href={
                      (job?.companyWebsite || "https://technokrate.com").startsWith("http")
                        ? (job?.companyWebsite || "https://technokrate.com")
                        : `https://${job?.companyWebsite || "https://technokrate.com"}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7900BA] font-medium text-xs sm:text-sm border border-purple-200 hover:bg-purple-100 hover:text-purple-800 hover:underline transition shadow-2xs group"
                    title="Visit company website"
                  >
                    <GiCrossedChains className="text-[#7900BA] group-hover:scale-110 transition-transform" size={14} />
                    <span>{job?.companyWebsite || "https://technokrate.com"}</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {(job?.companyPhone && job?.companyPhone !== "N/A") || candidatePhone ? (
                    <a
                      href={`tel:${job?.companyPhone !== "N/A" ? job?.companyPhone : candidatePhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7900BA] font-medium text-xs sm:text-sm border border-purple-200 hover:bg-purple-100 hover:text-purple-800 hover:underline transition shadow-2xs group"
                      title="Call company"
                    >
                      <LuPhone className="text-[#7900BA] group-hover:scale-110 transition-transform" size={14} />
                      <span>{job?.companyPhone !== "N/A" ? job?.companyPhone : candidatePhone}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs sm:text-sm border border-gray-200">
                      <LuPhone size={14} />
                      <span>N/A</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${job?.companyEmail !== "career@technokrate.com" ? job?.companyEmail : (candidateEmail || "career@technokrate.com")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7900BA] font-medium text-xs sm:text-sm border border-purple-200 hover:bg-purple-100 hover:text-purple-800 hover:underline transition shadow-2xs group"
                    title="Send email"
                  >
                    <TfiEmail className="text-[#7900BA] group-hover:scale-110 transition-transform" size={14} />
                    <span>{job?.companyEmail !== "career@technokrate.com" ? job?.companyEmail : (candidateEmail || "career@technokrate.com")}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- CLICKABLE STEPPER ---------------- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-10 overflow-x-auto">
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<CustomConnector />}
          >
            {steps.map((step, index) => (
              <Step
                key={index}
                completed={index <= activeStep}
                onClick={() => setActiveStep(index)}
              >
                <StepLabel StepIconComponent={CustomStepIcon}>
                  <p className="font-semibold text-sm sm:text-base text-gray-800 cursor-pointer">
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 px-2 sm:px-4 mt-1">{step.description}</p>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        {/* ---------------- ACTION BUTTONS ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            "Applicant Information",
            "Applicant Progress",
            "Submitted Documents",
          ].map((text, i) => {
            const isOpen = openSection === text;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (text === "Submitted Documents") {
                    navigate("/dashboard/applicationsubmit");
                    return;
                  }
                  setOpenSection((prev) => (prev === text ? "" : text));
                }}
                className={`bg-[#7900BA] text-white rounded-xl h-[53px] flex items-center justify-between px-6 font-medium transition-all cursor-pointer ${
                  isOpen ? "ring-2 ring-offset-2 ring-[#7900BA]" : "hover:bg-purple-800"
                }`}
              >
                <span>{text}</span>
                <RiArrowDownSLine
                  size={20}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            );
          })}
        </div>

        {openSection && (
          <div className="mb-10 rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
            {sections.find((section) => section.key === openSection)?.content}
          </div>
        )}

        {/* ---------------- FOOTER BUTTONS ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <button
            type="button"
            onClick={handleBack}
            className="bg-[#7900BA] text-white font-semibold rounded-xl h-[53px] flex items-center justify-center gap-2 hover:bg-purple-800 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft size={18} /> Back to Applied Jobs
          </button>

          <button
            type="button"
            onClick={() => navigate("/find-job")}
            className="border border-[#7900BA] text-[#7900BA] font-semibold rounded-xl h-[53px] flex items-center justify-center gap-3 hover:bg-[#7900BA] hover:text-white transition-colors cursor-pointer"
          >
            View More Jobs <FaArrowRight />
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="border border-[#7900BA] text-[#7900BA] font-semibold rounded-xl h-[53px] flex items-center justify-center gap-3 hover:bg-[#7900BA] hover:text-white transition-colors cursor-pointer"
          >
            View Dashboard <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;

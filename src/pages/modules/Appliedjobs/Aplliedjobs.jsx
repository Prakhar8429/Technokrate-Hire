import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout/Layout";
import { CiLocationOn } from "react-icons/ci";
import { TiTick } from "react-icons/ti";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import useTheme from "../../../hooks/theme/useTheme";
import { themes } from "../../../components/Themes/Theme";

import { ArrowRight } from "lucide-react";

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

import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppliedJobs,
  withdrawApplication,
} from "../../../redux/slice/GetAppliedSlice/GetAppliedJobSlice";
import { toast } from "react-toastify";
import Loading from "../../../components/common/loader/Loading";

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

const AppliedJobs = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const appliedJobs = useSelector((state) => state.appliedJobs.appliedJobs || []);
  const loading = useSelector((state) => state.appliedJobs.loading);
  const error = useSelector((state) => state.appliedJobs.error);

  const token = localStorage.getItem("token");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const handleWithdraw = async (job) => {
    const applicationId = job.id || job._id;
    if (!applicationId) return;

    if (
      !window.confirm(
        `Are you sure you want to withdraw your application for "${job.title}"?`
      )
    ) {
      return;
    }

    try {
      setWithdrawingId(applicationId);
      const res = await dispatch(withdrawApplication(applicationId)).unwrap();
      toast.success(res?.data?.message || "Application withdrawn successfully");
      if (token) {
        dispatch(fetchAppliedJobs(token));
      }
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Cannot withdraw this application"
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  useEffect(() => {
    setTheme(themes.OverviewThemes);
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(fetchAppliedJobs(token));
    }
  }, [dispatch, token]);

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

  // 🔄 Transform API data
  const jobData = appliedJobs.map((job) => ({
    id: job._id || job.id,
    title: job.jobTitle || job.title || "Job Title",
    location:
      typeof job.jobLocation === "string"
        ? job.jobLocation
        : job.jobLocation?.name ||
          [job.jobLocation?.city, job.jobLocation?.state].filter(Boolean).join(", ") ||
          job.location ||
          "N/A",
    salary: job.salary
      ? typeof job.salary === "string"
        ? job.salary
        : `₹${job.salary.minSalary || 0}–₹${job.salary.maxSalary || 0}`
      : "Not Disclosed",
    dateApplied: job.dateApplied
      ? new Date(job.dateApplied).toISOString().split("T")[0]
      : "N/A",
    status: job.status || "Pending",
    type: job.advanceInformation?.jobType || job.jobType || "Full-time",
    logo:
      getCompanyLogo(
        job.companyLogo ||
          job.employerId?.companyDetail?.companyLogo ||
          job.companyDetail?.companyLogo
      ) || job.logo || null,
    companyName: job.companyName || job.company?.name || job.employer?.companyName || "Technokrate Partner",
    companyEmail: job.companyEmail || job.company?.email || job.employer?.email || "career@technokrate.com",
    companyPhone: job.companyPhone || job.company?.phone || job.employer?.phone || "N/A",
    companyWebsite: job.companyWebsite || job.company?.website || "https://technokrate.com",
    rawJob: job,
  }));

  const totalPages = Math.ceil(jobData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = jobData.slice(startIndex, startIndex + itemsPerPage);

  // 🔄 Loading State
  if (loading) {
    return (
      <Layout>
        <Loading text="Loading Applied Jobs..." />
      </Layout>
    );
  }

  // ❌ Error State
  if (error) {
    return (
      <Layout>
        <p className="text-center mt-10 text-red-500">
          {typeof error === "string"
            ? error
            : error.message || JSON.stringify(error)}
        </p>
      </Layout>
    );
  }

  // 🚫 Empty State
  if (!loading && jobData.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4 text-3xl">
            📄
          </div>

          <h2 className="text-lg font-semibold text-purple-700">
            No Job Applications Found
          </h2>

          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            You haven’t applied to any jobs yet. Start exploring opportunities
            and apply now!
          </p>

          <button
            onClick={() => navigate("/find-job")}
            className="mt-5 px-5 py-2 bg-[#7900BA] text-white rounded-lg hover:bg-purple-700 transition"
          >
            Find Jobs
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full p-4 md:p-6 bg-white shadow-md rounded-lg mb-10">

        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <p className="text-lg md:text-xl font-medium text-[#141414]">
            Applied Jobs <span className="text-gray-400">({jobData.length})</span>
          </p>
        </div>

        {/* MOBILE VIEW */}
        <div className="space-y-4 md:hidden">
          {currentJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex gap-3">
                <CompanyLogo name={job.title} logoUrl={job.logo} />

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{job.title}</p>
                    <span className="text-xs px-2 py-1 rounded bg-[#DCBDED] text-[#7900BA]">
                      {job.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm mt-1">
                    <span className="flex items-center gap-1">
                      <CiLocationOn className="text-[#7900BA]" />
                      {job.location}
                    </span>
                    <span>{job.salary}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm flex justify-between">
                <span className="text-gray-500">Applied:</span>
                <span>{job.dateApplied}</span>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <TiTick
                    className={
                      job.status.toLowerCase() === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  />
                  <span
                    className={
                      job.status.toLowerCase() === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                  {job.status
                    ? job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase()
                    : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(job.status?.toLowerCase() === "applied" || !job.status) && (
                    <button
                      onClick={() => handleWithdraw(job)}
                      disabled={withdrawingId === job.id}
                      className="border border-red-300 text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition disabled:opacity-50"
                      title="Withdraw application"
                    >
                      {withdrawingId === job.id ? "Withdrawing..." : "Withdraw"}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigate("/dashboard/applicationdetails", { state: { job } })
                    }
                    className="bg-[#DCBDED] text-[#7900BA] hover:bg-[#7900BA] hover:text-white px-3 py-1 rounded-lg text-sm cursor-pointer transition"
                  >
                    View Status
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block w-full">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-[#F2E4FA]">
              <tr>
                <th className="px-4 py-4 text-center">Jobs</th>
                <th className="px-4 py-4 text-center">Date Applied</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentJobs.map((job) => (
                <tr key={job.id} className="border-b text-gray-600">
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={job.title} logoUrl={job.logo} />

                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-gray-500">
                          {job.location}
                          • {job.salary}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="text-center">{job.dateApplied}</td>

                  <td className="text-center">
                    <span
                      className={
                        job.status.toLowerCase() === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {job.status
                        ? job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase()
                        : ""}
                    </span>
                  </td>

                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          navigate("/dashboard/applicationdetails", { state: { job } })
                        }
                        className="bg-[#DCBDED] text-[#7900BA] hover:bg-[#7900BA] hover:text-white px-4 py-2 rounded-xl text-sm cursor-pointer transition"
                      >
                        View Status
                      </button>
                      {(job.status?.toLowerCase() === "applied" || !job.status) && (
                        <button
                          onClick={() => handleWithdraw(job)}
                          disabled={withdrawingId === job.id}
                          className="border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition disabled:opacity-50"
                          title="Withdraw application"
                        >
                          {withdrawingId === job.id ? "Withdrawing..." : "Withdraw"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t mt-8 pt-6">
          <p className="text-[#7900BA] font-medium text-sm">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, jobData.length)} of{" "}
            {jobData.length} Jobs
          </p>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                currentPage === 1
                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-[#7900BA] hover:text-white cursor-pointer"
              }`}
            >
              <IoIosArrowBack />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  currentPage === i + 1
                    ? "bg-[#7900BA] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                currentPage === totalPages
                  ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "bg-[#DCBDED] text-[#7900BA] hover:bg-[#7900BA] hover:text-white cursor-pointer"
              }`}
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AppliedJobs;
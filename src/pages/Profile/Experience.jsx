// src/pages/Profile/Experience.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GoPencil } from "react-icons/go";
import { HiOutlineEye } from "react-icons/hi2";
import { MdOutlineFileDownload } from "react-icons/md";
import { BsBriefcase, BsAward, BsFileEarmarkPdf } from "react-icons/bs";
import { fetchUserDetails } from "../../redux/slice/user/userSlice";

// ── Shared UI ─────────────────────────────────────────────────────────────────

const SectionCard = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, icon, onEdit }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2">
      {icon && <span className="text-purple-600">{icon}</span>}
      <h3 className="font-semibold text-gray-800 text-[15px]">{title}</h3>
    </div>
    {onEdit && (
      <button
        onClick={onEdit}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-purple-50 transition group"
      >
        <GoPencil
          size={15}
          className="text-gray-400 group-hover:text-purple-600 transition"
        />
      </button>
    )}
  </div>
);

const EmptyState = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm hover:border-purple-300 hover:text-purple-500 transition"
  >
    + {label}
  </button>
);

// Format date: "Jan 2023"
const fmt = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// Safe string helper — returns empty string if value is not a plain string
const safeStr = (val) => (typeof val === "string" ? val.trim() : "");

// ── Component ─────────────────────────────────────────────────────────────────
const Experience = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) dispatch(fetchUserDetails());
  }, [dispatch, user]);

  if (error) return <p className="p-6 text-red-500 text-sm">{error}</p>;

  // Filter out placeholder empty records inserted by the backend on registration
  const experiences = (user?.workExperience?.experiences || []).filter(
    (exp) => safeStr(exp?.jobTitle) || safeStr(exp?.companyName)
  );

  const isFresher = user?.workExperience?.isFresher === true && experiences.length === 0;

  const certifications = (user?.certifications || []).filter(
    (cert) =>
      safeStr(cert?.certificationName) || safeStr(cert?.issuingOrganization)
  );

  const resume = safeStr(user?.documents?.resume) || null;

  return (
    <div className="flex flex-col gap-4 p-4 h-full">

      {/* ── Work Experience ── */}
      <SectionCard>
        <SectionHeader
          title="Work Experience"
          icon={<BsBriefcase size={15} />}
          onEdit={() =>
            navigate("/dashboard/profile-edit?tab=Work Experience", {
              state: { hideHeader: true },
            })
          }
        />

        {isFresher ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-xl">
            <BsBriefcase className="text-purple-500" size={18} />
            <div>
              <p className="text-purple-700 font-semibold text-sm">Fresher</p>
              <p className="text-purple-400 text-xs">
                Looking for the first opportunity
              </p>
            </div>
          </div>
        ) : experiences.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-100" />

            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <div key={exp._id || i} className="flex gap-4 relative">
                  {/* Timeline dot + company avatar / icon */}
                  <div className="shrink-0 w-10 h-10 rounded-xl border border-purple-100 bg-purple-50 shadow-sm flex items-center justify-center z-10 text-purple-700 font-bold text-sm">
                    {safeStr(exp.companyName)?.charAt(0)?.toUpperCase() || (
                      <BsBriefcase size={16} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm leading-snug">
                          {safeStr(exp.jobTitle)}
                        </p>
                        <p className="text-purple-600 text-xs font-medium mt-0.5">
                          {safeStr(exp.companyName)}
                        </p>
                      </div>
                      {exp.currentlyWorking && (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[11px] font-medium rounded-lg shrink-0 border border-green-200">
                          Currently Working
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-[11px] mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      {fmt(exp.startDate)
                        ? `${fmt(exp.startDate)} – ${
                            exp.currentlyWorking ? "Present" : fmt(exp.endDate)
                          }`
                        : "Dates not specified"}
                    </p>

                    {safeStr(exp.responsibilities) && (
                      <p className="text-gray-500 text-xs mt-2 leading-relaxed line-clamp-2">
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            label="Add work experience"
            onClick={() =>
              navigate("/dashboard/profile-edit?tab=Work Experience", {
                state: { hideHeader: true },
              })
            }
          />
        )}
      </SectionCard>

      {/* ── Certifications ── */}
      <SectionCard>
        <SectionHeader
          title="Certifications"
          icon={<BsAward size={15} />}
          onEdit={() =>
            navigate("/dashboard/profile-edit?tab=Certifications", {
              state: { hideHeader: true },
            })
          }
        />

        {certifications.length > 0 ? (
          <div className="space-y-4">
            {certifications.map((cert, i) => (
              <div key={cert._id || i}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Icon badge */}
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <BsAward className="text-amber-500" size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm leading-snug">
                        {safeStr(cert.certificationName)}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {safeStr(cert.issuingOrganization)}
                      </p>
                      {cert.dateOfCompletion && (
                        <p className="text-gray-400 text[11px] mt-0.5">
                          Issued {fmt(cert.dateOfCompletion)}
                        </p>
                      )}
                      {safeStr(cert.certificateUrl) && (
                        <a
                          href={cert.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-500 mt-1 break-all underline block"
                        >
                          {cert.certificateUrl}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (safeStr(cert.certificateUrl)) {
                          window.open(cert.certificateUrl, "_blank");
                        }
                      }}
                      disabled={!safeStr(cert.certificateUrl)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                        safeStr(cert.certificateUrl)
                          ? "bg-gray-50 hover:bg-purple-50 hover:text-purple-600 text-gray-400"
                          : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <HiOutlineEye size={15} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-purple-600 text-gray-400 transition">
                      <MdOutlineFileDownload size={15} />
                    </button>
                  </div>
                </div>
                {i < certifications.length - 1 && (
                  <div className="mt-4 border-t border-gray-50" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            label="Add certifications"
            onClick={() =>
              navigate("/dashboard/profile-edit?tab=Certifications", {
                state: { hideHeader: true },
              })
            }
          />
        )}
      </SectionCard>

      {/* ── Resume ── */}
      <SectionCard>
        <SectionHeader
          title="Resume"
          icon={<BsFileEarmarkPdf size={15} />}
          onEdit={() =>
            navigate("/dashboard/profile-edit?tab=Documents", {
              state: { hideHeader: true },
            })
          }
        />

        {resume ? (
          <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <BsFileEarmarkPdf className="text-red-500" size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-700 text-sm truncate">
                  {resume.split("/").pop()}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">PDF Document</p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <a
                href={resume}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-purple-300 hover:text-purple-600 text-gray-400 transition shadow-sm"
              >
                <HiOutlineEye size={15} />
              </a>
              <a
                href={resume}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm"
              >
                <MdOutlineFileDownload size={15} />
              </a>
            </div>
          </div>
        ) : (
          <EmptyState
            label="Upload your resume"
            onClick={() =>
              navigate("/dashboard/profile-edit?tab=Documents", {
                state: { hideHeader: true },
              })
            }
          />
        )}
      </SectionCard>
    </div>
  );
};

export default Experience;
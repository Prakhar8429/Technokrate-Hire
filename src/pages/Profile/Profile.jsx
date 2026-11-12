// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GoPencil } from "react-icons/go";
import { PiGraduationCapBold, PiCertificateBold } from "react-icons/pi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { BsPersonCircle, BsFileEarmarkPdf } from "react-icons/bs";
import profile from "../.../../../assets/profile.jpeg";
import { fetchProfileCompleteness } from "../../redux/slice/DashboardSlice/DashboardSlice";
import Profilemodal from "../../components/Modal/Profilemodal";
import Skillmodal from "../../components/Modal/Skillmodal";
import Aboutmodal from "../../components/Modal/Aboutmodal";

// ── Helpers ──────────────────────────────────────────────────────────────────

const getValidEducations = (user) =>
  (user?.educationDetails || []).filter(
    (e) => e?.institutionName?.trim() || e?.highestDegree?.trim()
  );

const getValidExperiences = (user) =>
  (user?.workExperience?.experiences || []).filter(
    (e) => e?.jobTitle?.trim() || e?.companyName?.trim()
  );

const getValidCertifications = (user) =>
  (user?.certifications || []).filter(
    (c) => c?.certificationName?.trim() || c?.issuingOrganization?.trim()
  );

const getLocationString = (location) => {
  const city =
    typeof location?.city === "string" ? location.city.trim() : "";
  const state =
    typeof location?.state === "string" ? location.state.trim() : "";
  return [city, state].filter(Boolean).join(", ") || "Add location";
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader = ({ title, onEdit, icon }) => (
  <div className="flex items-center justify-between mb-4">
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

// ── Component ─────────────────────────────────────────────────────────────────
const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { profileCompleteness } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchProfileCompleteness());
  }, [dispatch]);

  const [profileModal, setProfileModal] = useState(false);
  const [skillModal, setSkillModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [showAllEdu, setShowAllEdu] = useState(false);

  // Directly use API 1 profileCompleteness percentage
  const pct = profileCompleteness?.percentage ?? 0;
  const photoSrc = user?.documents?.photo || null;

  const skills = (user?.skillsAndPreference?.skills || []).filter((s) =>
    s?.trim()
  );

  const educations = getValidEducations(user);
  const displayedEdu = showAllEdu ? educations : educations.slice(0, 2);

  const jobRoleName =
    typeof user?.basicDetails?.jobRole?.name === "string"
      ? user.basicDetails.jobRole.name.trim()
      : "";

  const firstCompany =
    typeof user?.workExperience?.experiences?.[0]?.companyName === "string"
      ? user.workExperience.experiences[0].companyName.trim()
      : "";

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen bg-gray-50">

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm relative overflow-visible">

        {/* Decorative */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative">

          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={photoSrc ? `${photoSrc}?t=${Date.now()}` : profile}
              alt="Profile"
              className="w-[72px] h-[72px] rounded-2xl object-cover border-2 border-purple-200 shadow-md"
            />
            <button
              onClick={() => setProfileModal(true)}
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-purple-700 hover:bg-purple-800 text-white rounded-full flex items-center justify-center shadow text-sm font-bold"
            >
              +
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 text-base sm:text-lg truncate">
              {typeof user?.fullName === "string" ? user.fullName : "Your Name"}
            </h2>
            <p className="text-purple-700 text-sm font-medium">
              {jobRoleName || "Add your role"}
            </p>
            {firstCompany ? (
              <p className="text-gray-500 text-xs">{firstCompany}</p>
            ) : null}
            <p className="text-gray-400 text-xs">
              {getLocationString(user?.basicDetails?.location)}
            </p>
          </div>

          {/* Edit */}
          <button
            onClick={() =>
              navigate("/dashboard/profile-edit", {
                state: { hideHeader: true },
              })
            }
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold"
          >
            Edit
          </button>
        </div>

        {/* ── Progress Bar ── */}
        <div className="mt-4 pt-4 border-t border-gray-100">

          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 font-medium">
              Profile Strength
            </span>
            <span className="text-xs font-semibold text-purple-700">
              {pct}%
            </span>
          </div>

          {/* Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-in-out ${
                pct < 40
                  ? "bg-red-400"
                  : pct < 70
                  ? "bg-yellow-400"
                  : "bg-gradient-to-r from-purple-500 to-purple-700"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-1.5">
            {pct < 100 ? (
              <p className="text-[11px] text-gray-400">
                Complete your profile to get more job matches
              </p>
            ) : (
              <p className="text-[11px] text-green-600 font-medium">
                Profile completed 🎉
              </p>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {pct < 40 ? "Low" : pct < 70 ? "Medium" : "Strong"}
            </span>
          </div>
        </div>
      </div>

      {/* ── About ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <BsPersonCircle size={16} /> About
          </h3>
          {user?.about?.trim() && (
            <button
              onClick={() => setAboutModal(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-purple-50 transition group"
            >
              <GoPencil
                size={15}
                className="text-gray-400 group-hover:text-purple-600 transition"
              />
            </button>
          )}
        </div>

        {user?.about?.trim() ? (
          <p className="text-gray-600 text-sm">{user.about}</p>
        ) : (
          <button
            onClick={() => setAboutModal(true)}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm hover:border-purple-300 hover:text-purple-500 transition"
          >
            + Add a summary about yourself
          </button>
        )}
      </div>

      {/* ── Skills ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <HiOutlineSparkles size={16} /> Top Skills
          </h3>
          {skills.length > 0 && (
            <button
              // onClick={() => setSkillModal(true)}
              onClick={()=>navigate("/dashboard/profile-edit?tab=Skills")}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-purple-50 transition group"
            >
              <GoPencil
                size={15}
                className="text-gray-400 group-hover:text-purple-600 transition"
              />
            </button>
          )}
        </div>

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <button
            // onClick={() => setSkillModal(true)}
            onClick={()=>
                navigate("/dashboard/profile-edit?tab=Skills", {
                state: { hideHeader: true },
              })
            }
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm hover:border-purple-300 hover:text-purple-500 transition"
          >
            + Add your top skills
          </button>
        )}
      </div>

      {/* ── Education ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <PiGraduationCapBold size={16} /> Education
          </h3>
          {educations.length > 0 && (
            <button
              onClick={() =>
                navigate("/dashboard/profile-edit?tab=Education", {
                  state: { hideHeader: true },
                })
              }
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-purple-50 transition group"
              title="Edit Education"
            >
              <GoPencil
                size={15}
                className="text-gray-400 group-hover:text-purple-600 transition"
              />
            </button>
          )}
        </div>

        {educations.length > 0 ? (
          <div className="space-y-3">
            {displayedEdu.map((edu, i) => (
              <div key={edu._id || i} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <PiGraduationCapBold className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{edu.institutionName}</p>
                  <p className="text-xs text-gray-500">{edu.highestDegree}</p>
                </div>
              </div>
            ))}

            {educations.length > 2 && (
              <button
                onClick={() => setShowAllEdu(!showAllEdu)}
                className="text-purple-600 text-xs font-semibold"
              >
                {showAllEdu ? "Show less" : "Show all"}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() =>
              navigate("/dashboard/profile-edit?tab=Education", {
                state: { hideHeader: true },
              })
            }
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm hover:border-purple-300 hover:text-purple-500 transition"
          >
            + Add your education
          </button>
        )}
      </div>

      {/* ── Certifications (API 12, 13, 14) ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <PiCertificateBold size={16} className="text-purple-600" /> Certifications
          </h3>
          {getValidCertifications(user).length > 0 && (
            <button
              onClick={() =>
                navigate("/dashboard/profile-edit?tab=Certifications", {
                  state: { hideHeader: true },
                })
              }
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-purple-50 transition group"
              title="Edit Certifications"
            >
              <GoPencil
                size={15}
                className="text-gray-400 group-hover:text-purple-600 transition"
              />
            </button>
          )}
        </div>

        {getValidCertifications(user).length > 0 ? (
          <div className="space-y-3">
            {getValidCertifications(user).map((cert, i) => (
              <div
                key={cert._id || i}
                className="flex gap-3 items-start justify-between border-b pb-2 last:border-b-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                    <PiCertificateBold className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {cert.certificationName}
                    </p>
                    <p className="text-xs text-gray-500">{cert.issuingOrganization}</p>
                    {cert.credentialId && (
                      <p className="text-[11px] text-gray-400">ID: {cert.credentialId}</p>
                    )}
                  </div>
                </div>
                {cert.certificateUrl && (
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-purple-700 hover:underline shrink-0"
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={() =>
              navigate("/dashboard/profile-edit?tab=Certifications", {
                state: { hideHeader: true },
              })
            }
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm hover:border-purple-300 hover:text-purple-500 transition"
          >
            + Add certifications
          </button>
        )}
      </div>

      {/* ── Documents & Resume (API 15, 16) ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <BsFileEarmarkPdf size={16} className="text-purple-600" /> Documents & Resume
          </h3>
          <button
            onClick={() =>
              navigate("/dashboard/profile-edit?tab=Documents", {
                state: { hideHeader: true },
              })
            }
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-purple-50 transition group"
            title="Edit Documents"
          >
            <GoPencil
              size={15}
              className="text-gray-400 group-hover:text-purple-600 transition"
            />
          </button>
        </div>

        {user?.documents?.resume ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                PDF
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Resume / CV</p>
                <p className="text-[11px] text-gray-500 truncate max-w-[200px]">
                  {user.documents.resume.split("/").pop()}
                </p>
              </div>
            </div>
            <a
              href={user.documents.resume}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-purple-700 hover:underline px-3 py-1 bg-white rounded-lg border border-purple-200 shadow-2xs"
            >
              Download
            </a>
          </div>
        ) : (
          <button
            onClick={() =>
              navigate("/dashboard/profile-edit?tab=Documents", {
                state: { hideHeader: true },
              })
            }
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm hover:border-purple-300 hover:text-purple-500 transition"
          >
            + Upload your resume
          </button>
        )}
      </div>

      {/* Modals */}
      {profileModal && <Profilemodal setProfileModal={setProfileModal} />}
      {skillModal && <Skillmodal setSkillModal={setSkillModal} />}
      {aboutModal && <Aboutmodal setAboutModal={setAboutModal} />}
    </div>
  );
};

export default Profile;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import profile from "../../assets/profile.jpeg";
import {
  updateBasicDetails,
  updateSkillsAndPreferences,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addCertification,
  updateCertification,
  deleteCertification,
  uploadDocuments,
  deleteDocument,
  updateUserProfile,
  fetchUserDetails,
} from "../../redux/slice/user/userSlice";
import { toast } from "react-toastify";
import {
  getJobCategories,
  getSubCategories,
  fetchDesignations,
} from "../../redux/slice/basicdetails/basicDetailsSlice";

import { TiDeleteOutline } from "react-icons/ti";
import { FiCheck, FiTrash2, FiPlus } from "react-icons/fi";
import Select from "react-select";
import { City, State } from "country-state-city";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";

// UI date format (YYYY-MM-DD)
const formatDateForInput = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// Backend ISO format
const formatDateForBackend = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch {
    return null;
  }
};

const tabs = [
  "Basic Details",
  "Skills",
  "Education",
  "Work Experience",
  "Certifications",
  "Documents",
];

const FormikErrorTabHandler = ({ setActiveTab }) => {
  const { errors, submitCount } = useFormikContext();

  useEffect(() => {
    if (submitCount === 0) return;

    if (errors.basicDetails) {
      setActiveTab("Basic Details");
    } else if (errors.skills) {
      setActiveTab("Skills");
    } else if (errors.educations) {
      setActiveTab("Education");
    } else if (errors.experiences) {
      setActiveTab("Work Experience");
    } else if (errors.certifications) {
      setActiveTab("Certifications");
    }
  }, [errors, submitCount, setActiveTab]);

  return null;
};

// Validation schema
const validationSchema = Yup.object({
  basicDetails: Yup.object({
    fullName: Yup.string()
      .trim()
      .min(2, "Must be at least 2 characters")
      .max(100, "Maximum 100 characters")
      .nullable(),
    about: Yup.string().max(1000, "Maximum 1000 characters").nullable(),
    jobCategory: Yup.string().nullable(),
    jobRole: Yup.string().nullable(),
    specialization: Yup.string().nullable(),
  }),

  skills: Yup.array()
    .of(Yup.string().trim().required("Skill cannot be empty"))
    .min(1, "At least one skill required"),

  educations: Yup.array().of(
    Yup.object({
      institutionName: Yup.string().nullable(),
      highestDegree: Yup.string().nullable(),
      specialization: Yup.string().nullable(),
      yearOfGraduation: Yup.number()
        .typeError("Enter valid year")
        .min(1950, "Invalid year")
        .max(new Date().getFullYear() + 10, "Invalid year")
        .nullable(),
    })
  ),

  experiences: Yup.array().of(
    Yup.object({
      jobTitle: Yup.string().nullable(),
      companyName: Yup.string().nullable(),
      startDate: Yup.date().nullable(),
      endDate: Yup.date().nullable(),
      responsibilities: Yup.string().max(1000, "Maximum 1000 characters").nullable(),
    })
  ),

  certifications: Yup.array().of(
    Yup.object({
      certificationName: Yup.string().nullable(),
      issuingOrganization: Yup.string().nullable(),
      credentialId: Yup.string().nullable(),
      dateOfCompletion: Yup.date().nullable(),
    })
  ),
});

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useSelector((state) => state.user);

  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  useEffect(() => {
    const states = State.getStatesOfCountry("IN");
    const formattedStates = states.map((s) => ({
      label: s.name,
      value: s.isoCode,
    }));
    setStateOptions(formattedStates);
  }, []);

  const { categories, subCategories, designations } = useSelector(
    (state) => state.jobCategories
  );

  const [isInitialized, setIsInitialized] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [activeTab, setActiveTab] = useState("Basic Details");
  const [isSubmittingTab, setIsSubmittingTab] = useState(false);
  const [savingItemKey, setSavingItemKey] = useState(null);

  /* ================= BASIC DETAILS ================= */
  const [basicDetails, setBasicDetails] = useState({
    fullName: "",
    about: "",
    jobCategory: "",
    jobRole: "",
    specialization: "",
    dateOfBirth: "",
    gender: "",
    location: {
      state: "",
      city: "",
    },
  });

  // Fetch user details on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserDetails());
    }
  }, [dispatch]);

  useEffect(() => {
    if (basicDetails.location?.state && stateOptions.length > 0) {
      const selectedState = stateOptions.find(
        (s) => s.value === basicDetails.location.state
      );
      if (selectedState) {
        const cities = City.getCitiesOfState("IN", selectedState.value);
        const formattedCities = cities.map((c) => ({
          label: c.name,
          value: c.name,
        }));
        setCityOptions(formattedCities);
      }
    }
  }, [basicDetails.location?.state, stateOptions]);

  useEffect(() => {
    dispatch(getJobCategories());
  }, [dispatch]);

  useEffect(() => {
    if (basicDetails.jobCategory) {
      dispatch(getSubCategories(basicDetails.jobCategory));
    }
  }, [basicDetails.jobCategory, dispatch]);

  useEffect(() => {
    if (basicDetails.jobRole) {
      dispatch(fetchDesignations(basicDetails.jobRole));
    }
  }, [basicDetails.jobRole, dispatch]);

  /* ================= SKILLS ================= */
  const [skillsAndPreference, setSkillsAndPreference] = useState({
    skills: [],
    jobTypes: {
      fullTime: false,
      partTime: false,
      freelancing: false,
      internship: false,
    },
    preferredDesignation: "",
    preferredLocation: "",
    salaryMin: "",
    salaryMax: "",
  });

  /* ================= EDUCATION ================= */
  const [educations, setEducations] = useState([]);

  /* ================= WORK EXPERIENCE ================= */
  const [workExperience, setWorkExperience] = useState({
    isFresher: true,
    experiences: [],
  });

  /* ================= CERTIFICATIONS ================= */
  const [certifications, setCertifications] = useState([]);

  /* ================= DOCUMENTS ================= */
  const [documents, setDocuments] = useState({
    photo: null,
    resume: null,
    additional: null,
  });

  /* ================= LOAD USER DATA FROM API ================= */
  useEffect(() => {
    if (!user || isInitialized) return;

    setBasicDetails({
      fullName: user.fullName || "",
      about: user.about || "",
      jobCategory:
        user.basicDetails?.jobCategory?._id ||
        user.basicDetails?.jobCategory ||
        "",
      jobRole:
        user.basicDetails?.jobRole?._id || user.basicDetails?.jobRole || "",
      specialization:
        user.basicDetails?.specialization?._id ||
        user.basicDetails?.specialization ||
        "",
      dateOfBirth: formatDateForInput(user.basicDetails?.dateOfBirth),
      gender: user.basicDetails?.gender || "",
      location: {
        state: user.basicDetails?.location?.state || "",
        city: user.basicDetails?.location?.city || "",
      },
    });

    const roles = user.skillsAndPreference?.typeRole || [];
    const jobTypes = {
      fullTime: Array.isArray(roles)
        ? roles.some((r) => /full/i.test(r))
        : Boolean(user.skillsAndPreference?.jobTypes?.fullTime),
      partTime: Array.isArray(roles)
        ? roles.some((r) => /part/i.test(r))
        : Boolean(user.skillsAndPreference?.jobTypes?.partTime),
      freelancing: Array.isArray(roles)
        ? roles.some((r) => /freelanc/i.test(r))
        : Boolean(user.skillsAndPreference?.jobTypes?.freelancing),
      internship: Array.isArray(roles)
        ? roles.some((r) => /intern/i.test(r))
        : Boolean(user.skillsAndPreference?.jobTypes?.internship),
    };

    setSkillsAndPreference({
      skills: user.skillsAndPreference?.skills || [],
      jobTypes,
      preferredDesignation:
        user.skillsAndPreference?.preferredDesignation || "",
      preferredLocation: user.skillsAndPreference?.preferredLocation || "",
      salaryMin:
        user.skillsAndPreference?.desiredSalary?.min ??
        user.skillsAndPreference?.salaryMin ??
        "",
      salaryMax:
        user.skillsAndPreference?.desiredSalary?.max ??
        user.skillsAndPreference?.salaryMax ??
        "",
    });

    setEducations(
      Array.isArray(user.educationDetails)
        ? user.educationDetails.map((e) => ({ ...e }))
        : []
    );

    const rawExperiences = user.workExperience?.experiences || [];
    const validExperiences = rawExperiences.filter(
      (e) => (typeof e?.jobTitle === "string" && e.jobTitle.trim()) || (typeof e?.companyName === "string" && e.companyName.trim())
    );
    const hasExistingExp = validExperiences.length > 0;

    setWorkExperience({
      isFresher: hasExistingExp ? false : (user.workExperience?.isFresher ?? true),
      experiences: validExperiences.map((e) => ({
        ...e,
        startDate: formatDateForInput(e.startDate),
        endDate: formatDateForInput(e.endDate),
      })),
    });

    setCertifications(
      Array.isArray(user.certifications)
        ? user.certifications.map((c) => ({
            ...c,
            credentialId: c.credentialId || "",
            certificateUrl: c.certificateUrl || "",
            dateOfCompletion: formatDateForInput(c.dateOfCompletion),
            certificateFile: null,
          }))
        : []
    );

    setIsInitialized(true);
  }, [user, isInitialized]);

  /* ================= SAVE CURRENT TAB DATA TO API ================= */
  const saveCurrentTabData = async (values, currentTab, nextTab) => {
    try {
      setIsSubmittingTab(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated");
        return false;
      }

      if (currentTab === "Basic Details") {
        // MODULE 1 API (PATCH)
        const payload = {
          fullName: values.basicDetails.fullName || user?.fullName || "",
          about: values.basicDetails.about ?? (user?.about || ""),
          gender: values.basicDetails.gender || "",
          dateOfBirth: values.basicDetails.dateOfBirth
            ? formatDateForInput(values.basicDetails.dateOfBirth)
            : null,
          location: {
            city: values.basicDetails.location?.city || "",
            state: values.basicDetails.location?.state || "",
          },
        };

        if (values.basicDetails.jobCategory) {
          payload.jobCategory = values.basicDetails.jobCategory;
        }
        if (values.basicDetails.jobRole) {
          payload.jobRole = values.basicDetails.jobRole;
        }
        if (values.basicDetails.specialization) {
          payload.specialization = values.basicDetails.specialization;
        }

        await dispatch(updateBasicDetails(payload)).unwrap();
        await dispatch(fetchUserDetails()).unwrap();
        toast.success("Basic details updated successfully");
      } else if (currentTab === "Skills") {
        // MODULE 2 API (PATCH)
        const typeRole = [];
        if (skillsAndPreference.jobTypes?.fullTime) typeRole.push("Full Time");
        if (skillsAndPreference.jobTypes?.partTime) typeRole.push("Part Time");
        if (skillsAndPreference.jobTypes?.freelancing)
          typeRole.push("Freelancing");
        if (skillsAndPreference.jobTypes?.internship)
          typeRole.push("Internship");

        const minSal = skillsAndPreference.salaryMin
          ? Number(skillsAndPreference.salaryMin)
          : null;
        const maxSal = skillsAndPreference.salaryMax
          ? Number(skillsAndPreference.salaryMax)
          : null;

        const payload = {
          skills: values.skills || [],
          typeRole,
          preferredDesignation:
            skillsAndPreference.preferredDesignation || "",
          preferredLocation: skillsAndPreference.preferredLocation || "",
          desiredSalary: {
            min: !isNaN(minSal) ? minSal : null,
            max: !isNaN(maxSal) ? maxSal : null,
          },
        };

        await dispatch(updateSkillsAndPreferences(payload)).unwrap();
        await dispatch(fetchUserDetails()).unwrap();
        toast.success("Skills and preferences updated successfully");
      } else if (currentTab === "Education") {
        // MODULE 3 API (CRUD)
        const eduList = values.educations || [];
        for (const edu of eduList) {
          if (edu.highestDegree && edu.institutionName) {
            const eduPayload = {
              highestDegree: edu.highestDegree,
              institutionName: edu.institutionName,
              yearOfGraduation:
                Number(edu.yearOfGraduation) || new Date().getFullYear(),
              specialization: edu.specialization || "",
            };

            if (edu._id) {
              await dispatch(
                updateEducation({ eduId: edu._id, payload: eduPayload })
              ).unwrap();
            } else {
              await dispatch(addEducation(eduPayload)).unwrap();
            }
          }
        }
        await dispatch(fetchUserDetails()).unwrap();
        toast.success("Education saved successfully");
      } else if (currentTab === "Work Experience") {
        // MODULE 4 API (CRUD)
        const expList = values.experiences || [];
        for (let i = 0; i < expList.length; i++) {
          const exp = expList[i];
          if (exp && exp.jobTitle && exp.companyName) {
            const expPayload = {
              jobTitle: String(exp.jobTitle).trim(),
              companyName: String(exp.companyName).trim(),
              startDate: exp.startDate
                ? formatDateForInput(exp.startDate)
                : "",
              endDate: exp.currentlyWorking
                ? null
                : exp.endDate
                ? formatDateForInput(exp.endDate)
                : null,
              currentlyWorking: Boolean(exp.currentlyWorking),
              responsibilities: exp.responsibilities || "",
            };

            const expId =
              exp._id ||
              exp.id ||
              user?.workExperience?.experiences?.[i]?._id ||
              user?.workExperience?.experiences?.[i]?.id;

            if (expId) {
              await dispatch(
                updateExperience({ expId, payload: expPayload })
              ).unwrap();
            } else {
              const res = await dispatch(addExperience(expPayload)).unwrap();
              if (res?.data?.experiences) {
                const lastAdded =
                  res.data.experiences[res.data.experiences.length - 1];
                if (lastAdded?._id) {
                  exp._id = lastAdded._id;
                  setFieldValue(`experiences.${i}._id`, lastAdded._id);
                }
              }
            }
          }
        }
        await dispatch(fetchUserDetails()).unwrap();
        toast.success("Experience saved successfully");
      } else if (currentTab === "Certifications") {
        // MODULE 5: CERTIFICATION MANAGEMENT (API 12 & API 13)
        const certList = values.certifications || [];
        let addedCount = 0;
        let updatedCount = 0;
        for (let i = 0; i < certList.length; i++) {
          const cert = certList[i];
          if (
            cert &&
            cert.certificationName?.trim() &&
            cert.issuingOrganization?.trim()
          ) {
            const payload = {
              certificationName: cert.certificationName.trim(),
              issuingOrganization: cert.issuingOrganization.trim(),
            };
            if (cert.credentialId && cert.credentialId.trim()) {
              payload.credentialId = cert.credentialId.trim();
            }
            if (cert.certificateUrl && cert.certificateUrl.trim()) {
              payload.certificateUrl = cert.certificateUrl.trim();
            }
            if (cert.dateOfCompletion) {
              const formattedDate = formatDateForInput(cert.dateOfCompletion);
              if (formattedDate) {
                payload.dateOfCompletion = formattedDate;
              }
            }

            if (!cert._id) {
              // API 12: Add Certification
              const res = await dispatch(addCertification(payload)).unwrap();
              addedCount++;
              if (Array.isArray(res?.data)) {
                const lastAdded = res.data[res.data.length - 1];
                if (lastAdded?._id) {
                  cert._id = lastAdded._id;
                  setFieldValue(`certifications.${i}._id`, lastAdded._id);
                }
              }
            } else {
              // API 13: Update Certification
              await dispatch(
                updateCertification({ certId: cert._id, payload })
              ).unwrap();
              updatedCount++;
            }
          }
        }
        await dispatch(fetchUserDetails()).unwrap();
        toast.success(
          addedCount > 0
            ? "Certifications added successfully"
            : updatedCount > 0
            ? "Certifications updated successfully"
            : "Certifications saved successfully"
        );
      } else if (currentTab === "Documents") {
        // MODULE 6: UPLOAD DOCUMENTS (API 15)
        const formData = new FormData();
        let hasFiles = false;
        if (documents.photo) {
          formData.append("photo", documents.photo);
          hasFiles = true;
        }
        if (documents.resume) {
          formData.append("resume", documents.resume);
          hasFiles = true;
        }
        if (documents.additional) {
          formData.append("additional", documents.additional);
          hasFiles = true;
        }

        if (hasFiles) {
          await dispatch(uploadDocuments(formData)).unwrap();
          await dispatch(fetchUserDetails()).unwrap();
          toast.success("Documents uploaded successfully!");
        } else {
          toast.info("No new documents selected to upload");
        }
      }

      if (nextTab) {
        setActiveTab(nextTab);
      }
      return true;
    } catch (error) {
      console.error("SAVE ERROR:", error);
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || `Failed to save ${currentTab}`
      );
      return false;
    } finally {
      setIsSubmittingTab(false);
    }
  };

  /* ================= SINGLE EDUCATION ACTIONS ================= */
  const handleSaveSingleEducation = async (
    edu,
    index,
    setFieldValue
  ) => {
    if (!edu.highestDegree || !edu.institutionName) {
      toast.error("Highest degree and institution name are required");
      return;
    }
    const itemKey = `edu-${index}`;
    try {
      setSavingItemKey(itemKey);
      const payload = {
        highestDegree: edu.highestDegree,
        institutionName: edu.institutionName,
        yearOfGraduation:
          Number(edu.yearOfGraduation) || new Date().getFullYear(),
        specialization: edu.specialization || "",
      };

      if (edu._id) {
        await dispatch(
          updateEducation({ eduId: edu._id, payload })
        ).unwrap();
        toast.success("Education updated successfully");
      } else {
        const res = await dispatch(addEducation(payload)).unwrap();
        toast.success("Education added successfully");
        if (Array.isArray(res?.data)) {
          const lastAdded = res.data[res.data.length - 1];
          if (lastAdded?._id) {
            setFieldValue(`educations.${index}._id`, lastAdded._id);
          }
        }
      }
      await dispatch(fetchUserDetails()).unwrap();
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Failed to save education"
      );
    } finally {
      setSavingItemKey(null);
    }
  };

  const handleDeleteEducation = async (
    index,
    edu,
    setFieldValue,
    values
  ) => {
    if (edu?._id) {
      if (
        !window.confirm("Are you sure you want to delete this education record?")
      ) {
        return;
      }
      try {
        await dispatch(deleteEducation(edu._id)).unwrap();
        toast.success("Education deleted successfully");
      } catch (err) {
        toast.error(
          typeof err === "string"
            ? err
            : err?.message || "Failed to delete education"
        );
        return;
      }
    }
    const newEducations = (values.educations || []).filter(
      (_, idx) => idx !== index
    );
    setFieldValue("educations", newEducations);
    setEducations(newEducations);
    dispatch(fetchUserDetails());
  };

  /* ================= SINGLE EXPERIENCE ACTIONS ================= */
  const handleSaveSingleExperience = async (
    exp,
    index,
    setFieldValue,
    values
  ) => {
    const currentExp =
      (values?.experiences && values.experiences[index]) || exp;

    if (!currentExp?.jobTitle || !currentExp?.companyName) {
      toast.error("Job title and company name are required");
      return;
    }
    const itemKey = `exp-${index}`;
    try {
      setSavingItemKey(itemKey);
      const payload = {
        jobTitle: String(currentExp.jobTitle).trim(),
        companyName: String(currentExp.companyName).trim(),
        startDate: currentExp.startDate
          ? formatDateForInput(currentExp.startDate)
          : "",
        endDate: currentExp.currentlyWorking
          ? null
          : currentExp.endDate
          ? formatDateForInput(currentExp.endDate)
          : null,
        currentlyWorking: Boolean(currentExp.currentlyWorking),
        responsibilities: currentExp.responsibilities || "",
      };

      const expId =
        currentExp._id ||
        currentExp.id ||
        values?.experiences?.[index]?._id ||
        values?.experiences?.[index]?.id ||
        user?.workExperience?.experiences?.[index]?._id ||
        user?.workExperience?.experiences?.[index]?.id;

      if (expId) {
        await dispatch(
          updateExperience({ expId, payload })
        ).unwrap();
        toast.success("Experience updated successfully");
      } else {
        const res = await dispatch(addExperience(payload)).unwrap();
        toast.success("Experience added successfully");
        if (res?.data?.experiences) {
          const lastAdded =
            res.data.experiences[res.data.experiences.length - 1];
          if (lastAdded?._id) {
            setFieldValue(`experiences.${index}._id`, lastAdded._id);
            setWorkExperience((prev) => {
              const updated = [...(prev.experiences || [])];
              if (updated[index]) {
                updated[index] = { ...updated[index], _id: lastAdded._id };
              }
              return { ...prev, isFresher: false, experiences: updated };
            });
          }
        }
      }
      await dispatch(fetchUserDetails()).unwrap();
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Failed to save experience"
      );
    } finally {
      setSavingItemKey(null);
    }
  };

  const handleDeleteExperience = async (
    index,
    exp,
    setFieldValue,
    values
  ) => {
    const currentExp =
      (values?.experiences && values.experiences[index]) || exp;

    const expId =
      currentExp?._id ||
      currentExp?.id ||
      exp?._id ||
      exp?.id ||
      values?.experiences?.[index]?._id ||
      values?.experiences?.[index]?.id ||
      user?.workExperience?.experiences?.[index]?._id ||
      user?.workExperience?.experiences?.[index]?.id;

    if (expId) {
      if (
        !window.confirm(
          "Are you sure you want to delete this experience record?"
        )
      ) {
        return;
      }
      try {
        await dispatch(deleteExperience(expId)).unwrap();
        toast.success("Experience deleted successfully");
      } catch (err) {
        toast.error(
          typeof err === "string"
            ? err
            : err?.message || "Failed to delete experience"
        );
        return;
      }
    }
    const newExperiences = (values.experiences || []).filter(
      (_, idx) => idx !== index
    );
    setFieldValue("experiences", newExperiences);
    setWorkExperience((prev) => ({
      ...prev,
      experiences: newExperiences,
    }));
    dispatch(fetchUserDetails());
  };

  /* ================= SINGLE CERTIFICATION ACTIONS (API 12 & API 13) ================= */
  const handleSaveSingleCertification = async (
    cert,
    index,
    setFieldValue,
    values
  ) => {
    const currentCert =
      (values?.certifications && values.certifications[index]) || cert;

    if (
      !currentCert?.certificationName?.trim() ||
      !currentCert?.issuingOrganization?.trim()
    ) {
      toast.error("Certification name and issuing organization are required");
      return;
    }

    const itemKey = `cert-${index}`;
    try {
      setSavingItemKey(itemKey);
      const payload = {
        certificationName: currentCert.certificationName.trim(),
        issuingOrganization: currentCert.issuingOrganization.trim(),
      };

      if (currentCert.credentialId && currentCert.credentialId.trim()) {
        payload.credentialId = currentCert.credentialId.trim();
      }

      if (currentCert.certificateUrl && currentCert.certificateUrl.trim()) {
        payload.certificateUrl = currentCert.certificateUrl.trim();
      }

      if (currentCert.dateOfCompletion) {
        const formattedDate = formatDateForInput(currentCert.dateOfCompletion);
        if (formattedDate) {
          payload.dateOfCompletion = formattedDate;
        }
      }

      if (currentCert._id) {
        // API 13: Update Certification
        await dispatch(
          updateCertification({ certId: currentCert._id, payload })
        ).unwrap();
        toast.success("Certification updated successfully");
      } else {
        // API 12: Add Certification
        const res = await dispatch(addCertification(payload)).unwrap();
        toast.success("Certification added successfully");
        if (Array.isArray(res?.data)) {
          const lastAdded = res.data[res.data.length - 1];
          if (lastAdded?._id) {
            setFieldValue(`certifications.${index}._id`, lastAdded._id);
          }
        }
      }
      await dispatch(fetchUserDetails()).unwrap();
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Failed to save certification"
      );
    } finally {
      setSavingItemKey(null);
    }
  };

  /* ================= DELETE CERTIFICATION (API 14) ================= */
  const handleDeleteCertification = async (
    index,
    cert,
    setFieldValue,
    values
  ) => {
    if (
      !window.confirm("Are you sure you want to remove this certification?")
    ) {
      return;
    }
    const currentCert =
      (values?.certifications && values.certifications[index]) || cert;

    if (currentCert?._id) {
      try {
        await dispatch(deleteCertification(currentCert._id)).unwrap();
        toast.success("Certification deleted successfully");
        await dispatch(fetchUserDetails()).unwrap();
      } catch (err) {
        toast.error(
          typeof err === "string"
            ? err
            : err?.message || "Failed to delete certification"
        );
        return;
      }
    }

    const newCertifications = (values.certifications || []).filter(
      (_, idx) => idx !== index
    );
    setFieldValue("certifications", newCertifications);
    setCertifications(newCertifications);
  };

  /* ================= DOCUMENT ACTIONS (API 15 & API 16) ================= */
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handleUploadSingleDocument = async (field) => {
    const file = documents[field];
    if (!file) {
      toast.info(`Please select a ${field} file to upload`);
      return;
    }

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append(field, file);
      await dispatch(uploadDocuments(formData)).unwrap();
      await dispatch(fetchUserDetails()).unwrap();
      toast.success(
        `${field.charAt(0).toUpperCase() + field.slice(1)} uploaded successfully!`
      );
      setDocuments((p) => ({ ...p, [field]: null }));
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || `Failed to upload ${field}`
      );
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (fieldName) => {
    if (!window.confirm(`Are you sure you want to delete your ${fieldName}?`)) {
      return;
    }
    try {
      setUploadingDoc(true);
      await dispatch(deleteDocument(fieldName)).unwrap();
      await dispatch(fetchUserDetails()).unwrap();
      if (fieldName === "photo") {
        setDocuments((p) => ({ ...p, photo: null }));
      } else if (fieldName === "resume") {
        setDocuments((p) => ({ ...p, resume: null, resumeName: "" }));
      } else {
        setDocuments((p) => ({ ...p, additional: null }));
      }
      toast.success(
        `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} deleted successfully!`
      );
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || `Failed to delete ${fieldName}`
      );
    } finally {
      setUploadingDoc(false);
    }
  };

  /* ================= NAVIGATION ================= */
  const getNextTab = (currentTab) => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      return tabs[currentIndex + 1];
    }
    return null;
  };

  const getPreviousTab = (currentTab) => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      return tabs[currentIndex - 1];
    }
    return null;
  };

  const handleNext = async (values) => {
    const nextTab = getNextTab(activeTab);
    if (nextTab) {
      await saveCurrentTabData(values, activeTab, nextTab);
    }
  };

  const handlePrevious = () => {
    const prevTab = getPreviousTab(activeTab);
    if (prevTab) {
      setActiveTab(prevTab);
    }
  };

  const handleSaveAll = async (values) => {
    try {
      const ok = await saveCurrentTabData(values, activeTab);
      if (ok) {
        toast.success("Profile updated successfully!");
        navigate("/dashboard/my-profile");
      }
    } catch (error) {
      console.error("Save all error:", error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && tabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  return (
    <Layout>
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6 py-6">
        <Formik
          enableReinitialize
          validateOnBlur
          validateOnChange
          initialValues={{
            basicDetails: basicDetails,
            skills: skillsAndPreference.skills || [],
            educations: educations || [],
            experiences: workExperience.experiences || [],
            certifications: certifications || [],
          }}
          validationSchema={validationSchema}
        >
          {({ values, errors, setFieldValue, setFieldTouched }) => (
            <Form>
              <FormikErrorTabHandler setActiveTab={setActiveTab} />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Edit Profile
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your personal details, skills, education, and
                    experience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/my-profile")}
                  className="text-sm text-purple-700 hover:text-purple-800 font-semibold"
                >
                  &larr; View Profile
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Step {tabs.indexOf(activeTab) + 1} of {tabs.length}:{" "}
                    <span className="text-purple-700">{activeTab}</span>
                  </span>
                  <span className="text-xs text-purple-700 font-bold">
                    {Math.round(
                      ((tabs.indexOf(activeTab) + 1) / tabs.length) * 100
                    )}
                    % Complete
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-700 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((tabs.indexOf(activeTab) + 1) / tabs.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex gap-2 sm:gap-4 border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-3 text-sm font-semibold transition relative ${
                      activeTab === tab
                        ? "text-purple-700 border-b-2 border-purple-700"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ========================================================================= */}
              {/* TAB 1: BASIC DETAILS (Module 1 - PATCH) */}
              {/* ========================================================================= */}
              {activeTab === "Basic Details" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                  <div className="border-b pb-3 mb-2">
                    <h2 className="text-lg font-bold text-gray-800">
                      Personal & Job Information
                    </h2>
                    <p className="text-xs text-gray-500">
                      Update your full name, bio, date of birth, location, and
                      job preferences.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Field
                        type="text"
                        name="basicDetails.fullName"
                        placeholder="e.g. Priyanka"
                        className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                      <ErrorMessage
                        name="basicDetails.fullName"
                        component="p"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Gender
                      </label>
                      <Select
                        options={[
                          { label: "Female", value: "Female" },
                          { label: "Male", value: "Male" },
                          { label: "Other", value: "Other" },
                        ]}
                        value={
                          values.basicDetails.gender
                            ? {
                                label: values.basicDetails.gender,
                                value: values.basicDetails.gender,
                              }
                            : null
                        }
                        onChange={(selected) => {
                          setFieldValue(
                            "basicDetails.gender",
                            selected ? selected.value : ""
                          );
                        }}
                        placeholder="Select Gender"
                        menuPlacement="bottom"
                        isSearchable={false}
                      />
                    </div>
                  </div>

                  {/* About / Bio */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      About / Professional Bio
                    </label>
                    <Field
                      as="textarea"
                      rows={3}
                      name="basicDetails.about"
                      placeholder="e.g. I am a Cloud & DevOps Trainer with 3+ years experience..."
                      className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none resize-none"
                    />
                    <ErrorMessage
                      name="basicDetails.about"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <Field
                        type="date"
                        name="basicDetails.dateOfBirth"
                        className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>

                    {/* Location: State */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        State
                      </label>
                      <Select
                        options={stateOptions}
                        menuPlacement="bottom"
                        isSearchable={true}
                        value={
                          values.basicDetails.location?.state
                            ? stateOptions.find(
                                (s) =>
                                  s.value === values.basicDetails.location.state
                              )
                            : null
                        }
                        onChange={(selected) => {
                          const stateVal = selected ? selected.value : "";
                          setFieldValue(
                            "basicDetails.location.state",
                            stateVal
                          );
                          setFieldValue("basicDetails.location.city", "");
                          if (stateVal) {
                            const cities = City.getCitiesOfState(
                              "IN",
                              stateVal
                            );
                            setCityOptions(
                              cities.map((c) => ({
                                label: c.name,
                                value: c.name,
                              }))
                            );
                          } else {
                            setCityOptions([]);
                          }
                        }}
                        placeholder="Select State"
                      />
                    </div>

                    {/* Location: City */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        City
                      </label>
                      <Select
                        options={cityOptions}
                        menuPlacement="bottom"
                        isSearchable={true}
                        value={
                          values.basicDetails.location?.city
                            ? {
                                label: values.basicDetails.location.city,
                                value: values.basicDetails.location.city,
                              }
                            : null
                        }
                        onChange={(selected) =>
                          setFieldValue(
                            "basicDetails.location.city",
                            selected ? selected.value : ""
                          )
                        }
                        placeholder="Select City"
                        isDisabled={!values.basicDetails.location?.state}
                      />
                    </div>

                    {/* Job Category */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Job Category
                      </label>
                      <Select
                        options={categories?.map((cat) => ({
                          label: cat.name,
                          value: cat._id,
                        }))}
                        value={
                          values.basicDetails.jobCategory
                            ? {
                                label:
                                  categories?.find(
                                    (cat) =>
                                      cat._id ===
                                      values.basicDetails.jobCategory
                                  )?.name || "",
                                value: values.basicDetails.jobCategory,
                              }
                            : null
                        }
                        onChange={(selected) => {
                          const val = selected ? selected.value : "";
                          setFieldValue("basicDetails.jobCategory", val);
                          setFieldValue("basicDetails.jobRole", "");
                          setFieldValue("basicDetails.specialization", "");
                          if (val) {
                            dispatch(getSubCategories(val));
                          }
                        }}
                        placeholder="Select Job Category"
                        menuPlacement="bottom"
                        isSearchable={true}
                      />
                    </div>

                    {/* Job Role */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Job Role
                      </label>
                      <Select
                        options={subCategories?.map((sub) => ({
                          label: sub.name,
                          value: sub._id,
                        }))}
                        value={
                          values.basicDetails.jobRole
                            ? {
                                label:
                                  subCategories?.find(
                                    (sub) =>
                                      sub._id === values.basicDetails.jobRole
                                  )?.name || "",
                                value: values.basicDetails.jobRole,
                              }
                            : null
                        }
                        onChange={(selected) => {
                          const val = selected ? selected.value : "";
                          setFieldValue("basicDetails.jobRole", val);
                          setFieldValue("basicDetails.specialization", "");
                          if (val) {
                            dispatch(fetchDesignations(val));
                          }
                        }}
                        placeholder="Select Job Role"
                        menuPlacement="bottom"
                        isDisabled={!values.basicDetails.jobCategory}
                        isSearchable={true}
                      />
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Specialization
                      </label>
                      <Select
                        options={designations?.map((des) => ({
                          label: des.name,
                          value: des._id,
                        }))}
                        value={
                          values.basicDetails.specialization
                            ? {
                                label:
                                  designations?.find(
                                    (des) =>
                                      des._id ===
                                      values.basicDetails.specialization
                                  )?.name || "",
                                value: values.basicDetails.specialization,
                              }
                            : null
                        }
                        onChange={(selected) => {
                          const val = selected ? selected.value : "";
                          setFieldValue("basicDetails.specialization", val);
                        }}
                        placeholder="Select Specialization"
                        menuPlacement="bottom"
                        isDisabled={!values.basicDetails.jobRole}
                        isSearchable={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: SKILLS & PREFERENCES (Module 2 - PATCH) */}
              {/* ========================================================================= */}
              {activeTab === "Skills" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="border-b pb-3">
                    <h2 className="text-lg font-bold text-gray-800">
                      Skills & Work Preferences
                    </h2>
                    <p className="text-xs text-gray-500">
                      Highlight your technical skills, preferred job types,
                      designation, location, and salary expectation.
                    </p>
                  </div>

                  {/* Skills Tag Input */}
                  <div className="border border-gray-200 p-4 rounded-xl bg-gray-50/50">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {values.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-purple-700 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            className="hover:text-red-300 text-purple-200 text-sm ml-1"
                            onClick={() => {
                              const newSkills = values.skills.filter(
                                (_, idx) => idx !== i
                              );
                              setFieldValue("skills", newSkills);
                              setSkillsAndPreference((prev) => ({
                                ...prev,
                                skills: newSkills,
                              }));
                            }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      {values.skills.length === 0 && (
                        <p className="text-gray-400 text-xs py-1">
                          No skills added yet. Type below and press Enter.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        placeholder="Type skill & press Enter (e.g. Node.js, MongoDB)"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && skillInput.trim()) {
                            e.preventDefault();
                            const trimmed = skillInput.trim();
                            if (
                              !values.skills.some(
                                (s) => s.toLowerCase() === trimmed.toLowerCase()
                              )
                            ) {
                              const newSkills = [...values.skills, trimmed];
                              setFieldValue("skills", newSkills);
                              setFieldTouched("skills", true);
                              setSkillsAndPreference((prev) => ({
                                ...prev,
                                skills: newSkills,
                              }));
                            }
                            setSkillInput("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = skillInput.trim();
                          if (trimmed) {
                            if (
                              !values.skills.some(
                                (s) => s.toLowerCase() === trimmed.toLowerCase()
                              )
                            ) {
                              const newSkills = [...values.skills, trimmed];
                              setFieldValue("skills", newSkills);
                              setFieldTouched("skills", true);
                              setSkillsAndPreference((prev) => ({
                                ...prev,
                                skills: newSkills,
                              }));
                            }
                            setSkillInput("");
                          }
                        }}
                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-semibold rounded-xl transition"
                      >
                        Add
                      </button>
                    </div>
                    <ErrorMessage
                      name="skills"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Preferred Job Role Types */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Preferred Job Types
                    </label>
                    <div className="flex gap-6 flex-wrap">
                      {[
                        { key: "fullTime", label: "Full Time" },
                        { key: "partTime", label: "Part Time" },
                        { key: "freelancing", label: "Freelancing" },
                        { key: "internship", label: "Internship" },
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex gap-2 items-center text-sm text-gray-700 font-medium cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(
                              skillsAndPreference.jobTypes[key]
                            )}
                            onChange={() =>
                              setSkillsAndPreference((prev) => ({
                                ...prev,
                                jobTypes: {
                                  ...prev.jobTypes,
                                  [key]: !prev.jobTypes[key],
                                },
                              }))
                            }
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Preferred Designation */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Preferred Designation
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        placeholder="e.g. Backend Developer"
                        value={skillsAndPreference.preferredDesignation}
                        onChange={(e) =>
                          setSkillsAndPreference((prev) => ({
                            ...prev,
                            preferredDesignation: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Preferred Location */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Preferred Location
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        placeholder="e.g. Mumbai, Bangalore"
                        value={skillsAndPreference.preferredLocation}
                        onChange={(e) =>
                          setSkillsAndPreference((prev) => ({
                            ...prev,
                            preferredLocation: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Desired Salary */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Desired Salary (INR / Month)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="number"
                        className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        placeholder="Min Salary (e.g. 30000)"
                        value={skillsAndPreference.salaryMin}
                        onChange={(e) =>
                          setSkillsAndPreference((prev) => ({
                            ...prev,
                            salaryMin: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="number"
                        className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        placeholder="Max Salary (e.g. 50000)"
                        value={skillsAndPreference.salaryMax}
                        onChange={(e) =>
                          setSkillsAndPreference((prev) => ({
                            ...prev,
                            salaryMax: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: EDUCATION MANAGEMENT (Module 3 - CRUD) */}
              {/* ========================================================================= */}
              {activeTab === "Education" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Education History
                      </h2>
                      <p className="text-xs text-gray-500">
                        Add, update, or remove your academic qualifications.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newEducation = {
                          highestDegree: "",
                          institutionName: "",
                          specialization: "",
                          yearOfGraduation: "",
                        };
                        const newEducations = [
                          ...(values.educations || []),
                          newEducation,
                        ];
                        setFieldValue("educations", newEducations);
                        setEducations(newEducations);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl transition"
                    >
                      <FiPlus size={15} /> Add Education
                    </button>
                  </div>

                  {(values.educations || []).length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                      <p className="text-gray-500 text-sm font-medium mb-2">
                        No education records added yet
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const newEducation = {
                            highestDegree: "",
                            institutionName: "",
                            specialization: "",
                            yearOfGraduation: "",
                          };
                          setFieldValue("educations", [newEducation]);
                          setEducations([newEducation]);
                        }}
                        className="px-4 py-2 bg-purple-700 text-white text-xs font-semibold rounded-xl hover:bg-purple-800 transition"
                      >
                        + Add First Education
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {values.educations.map((edu, i) => (
                        <div
                          key={edu._id || i}
                          className="border border-gray-200 p-4 rounded-2xl bg-gray-50/40 relative hover:border-purple-200 transition"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                              Record #{i + 1}{" "}
                              {edu._id && (
                                <span className="text-[10px] text-gray-500 font-normal ml-1">
                                  (Saved)
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Quick Save Card */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveSingleEducation(
                                    edu,
                                    i,
                                    setFieldValue
                                  )
                                }
                                disabled={savingItemKey === `edu-${i}`}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition"
                                title="Save this education record"
                              >
                                <FiCheck size={13} />
                                {savingItemKey === `edu-${i}`
                                  ? "Saving..."
                                  : edu._id
                                  ? "Update"
                                  : "Save"}
                              </button>
                              {/* Delete Card */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteEducation(
                                    i,
                                    edu,
                                    setFieldValue,
                                    values
                                  )
                                }
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Delete this education"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Highest Degree / Course *
                              </label>
                              <Field
                                type="text"
                                name={`educations.${i}.highestDegree`}
                                placeholder="e.g. B.Tech, MCA, MBA"
                                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Institution / College Name *
                              </label>
                              <Field
                                type="text"
                                name={`educations.${i}.institutionName`}
                                placeholder="e.g. XYZ College"
                                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Specialization / Field of Study
                              </label>
                              <Field
                                type="text"
                                name={`educations.${i}.specialization`}
                                placeholder="e.g. Computer Science, Information Technology"
                                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Year of Graduation
                              </label>
                              <Field
                                type="number"
                                name={`educations.${i}.yearOfGraduation`}
                                placeholder="e.g. 2022"
                                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: WORK EXPERIENCE (Module 4 - CRUD) */}
              {/* ========================================================================= */}
              {activeTab === "Work Experience" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Work Experience
                      </h2>
                      <p className="text-xs text-gray-500">
                        Manage your past and present employment details.
                      </p>
                    </div>

                    {!workExperience.isFresher && (
                      <button
                        type="button"
                        onClick={() => {
                          const newExperience = {
                            jobTitle: "",
                            companyName: "",
                            startDate: "",
                            endDate: null,
                            currentlyWorking: false,
                            responsibilities: "",
                          };
                          const newExperiences = [
                            ...(values.experiences || []),
                            newExperience,
                          ];
                          setFieldValue("experiences", newExperiences);
                          setWorkExperience((prev) => ({
                            ...prev,
                            isFresher: false,
                            experiences: newExperiences,
                          }));
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl transition"
                      >
                        <FiPlus size={15} /> Add Experience
                      </button>
                    )}
                  </div>

                  {/* Fresher toggle */}
                  <label className="inline-flex items-center gap-3 p-3 bg-purple-50/70 border border-purple-100 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workExperience.isFresher}
                      onChange={(e) =>
                        setWorkExperience((prev) => ({
                          ...prev,
                          isFresher: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-purple-900">
                        I am a Fresher (No work experience)
                      </span>
                      <p className="text-xs text-purple-600">
                        Check this if you are a recent graduate or looking for
                        your first opportunity.
                      </p>
                    </div>
                  </label>

                  {/* Experience cards */}
                  {!workExperience.isFresher && (
                    <>
                      {(values.experiences || []).length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                          <p className="text-gray-500 text-sm font-medium mb-2">
                            No work experience added yet
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              const newExperience = {
                                jobTitle: "",
                                companyName: "",
                                startDate: "",
                                endDate: null,
                                currentlyWorking: false,
                                responsibilities: "",
                              };
                              setFieldValue("experiences", [newExperience]);
                              setWorkExperience((prev) => ({
                                ...prev,
                                isFresher: false,
                                experiences: [newExperience],
                              }));
                            }}
                            className="px-4 py-2 bg-purple-700 text-white text-xs font-semibold rounded-xl hover:bg-purple-800 transition"
                          >
                            + Add First Experience
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {values.experiences.map((exp, i) => {
                            const curExp = values.experiences[i] || exp;
                            const hasId = Boolean(curExp?._id || curExp?.id);
                            return (
                            <div
                              key={curExp._id || curExp.id || i}
                              className="border border-gray-200 p-4 rounded-2xl bg-gray-50/40 relative hover:border-purple-200 transition"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                                  Position #{i + 1}{" "}
                                  {hasId && (
                                    <span className="text-[10px] text-gray-500 font-normal ml-1">
                                      (Saved)
                                    </span>
                                  )}
                                </span>
                                <div className="flex items-center gap-2">
                                  {/* Quick Save Card */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveSingleExperience(
                                        curExp,
                                        i,
                                        setFieldValue,
                                        values
                                      )
                                    }
                                    disabled={savingItemKey === `exp-${i}`}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition"
                                    title="Save this experience record"
                                  >
                                    <FiCheck size={13} />
                                    {savingItemKey === `exp-${i}`
                                      ? "Saving..."
                                      : hasId
                                      ? "Update"
                                      : "Save"}
                                  </button>
                                  {/* Delete Card */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteExperience(
                                        i,
                                        curExp,
                                        setFieldValue,
                                        values
                                      )
                                    }
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Delete this experience"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Job Title *
                                  </label>
                                  <Field
                                    type="text"
                                    name={`experiences.${i}.jobTitle`}
                                    placeholder="e.g. Trainer, Software Engineer"
                                    className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Company Name *
                                  </label>
                                  <Field
                                    type="text"
                                    name={`experiences.${i}.companyName`}
                                    placeholder="e.g. ABC Institute"
                                    className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Start Date
                                  </label>
                                  <Field
                                    type="date"
                                    name={`experiences.${i}.startDate`}
                                    className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    End Date
                                  </label>
                                  <Field
                                    type="date"
                                    name={`experiences.${i}.endDate`}
                                    disabled={exp.currentlyWorking}
                                    className={`w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none ${
                                      exp.currentlyWorking
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white"
                                    }`}
                                  />
                                </div>
                              </div>

                              <div className="mb-3">
                                <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                  <Field
                                    type="checkbox"
                                    name={`experiences.${i}.currentlyWorking`}
                                    onChange={(e) => {
                                      setFieldValue(
                                        `experiences.${i}.currentlyWorking`,
                                        e.target.checked
                                      );
                                      if (e.target.checked) {
                                        setFieldValue(
                                          `experiences.${i}.endDate`,
                                          null
                                        );
                                      }
                                    }}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                  />
                                  Currently Working Here
                                </label>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Responsibilities / Description
                                </label>
                                <Field
                                  as="textarea"
                                  rows={2}
                                  name={`experiences.${i}.responsibilities`}
                                  placeholder="e.g. Teaching Cloud & DevOps, leading client projects..."
                                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white resize-none"
                                />
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: CERTIFICATIONS */}
              {/* ========================================================================= */}
              {activeTab === "Certifications" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Certifications
                      </h2>
                      <p className="text-xs text-gray-500">
                        Showcase your licenses, badges, and professional
                        certifications.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newCertification = {
                          certificationName: "",
                          issuingOrganization: "",
                          credentialId: "",
                          certificateUrl: "",
                          dateOfCompletion: "",
                          certificateFile: null,
                        };
                        const newCertifications = [
                          ...(values.certifications || []),
                          newCertification,
                        ];
                        setFieldValue("certifications", newCertifications);
                        setCertifications(newCertifications);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl transition"
                    >
                      <FiPlus size={15} /> Add Certification
                    </button>
                  </div>

                  {(values.certifications || []).length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                      <p className="text-gray-500 text-sm font-medium mb-2">
                        No certifications added yet
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const newCertification = {
                            certificationName: "",
                            issuingOrganization: "",
                            credentialId: "",
                            certificateUrl: "",
                            dateOfCompletion: "",
                            certificateFile: null,
                          };
                          setFieldValue("certifications", [newCertification]);
                          setCertifications([newCertification]);
                        }}
                        className="px-4 py-2 bg-purple-700 text-white text-xs font-semibold rounded-xl hover:bg-purple-800 transition"
                      >
                        + Add First Certification
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {values.certifications.map((cert, i) => (
                        <div
                          key={cert._id || i}
                          className="border border-gray-200 p-4 rounded-2xl bg-gray-50/40 relative hover:border-purple-200 transition"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              Certificate #{i + 1}
                              {cert._id && (
                                <span className="text-[10px] text-gray-500 font-normal ml-1">
                                  (Saved)
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Quick Save Card */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveSingleCertification(
                                    cert,
                                    i,
                                    setFieldValue,
                                    values
                                  )
                                }
                                disabled={savingItemKey === `cert-${i}`}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                                title="Save this certification"
                              >
                                <FiCheck size={13} />
                                {savingItemKey === `cert-${i}`
                                  ? "Saving..."
                                  : cert._id
                                  ? "Saved"
                                  : "Save"}
                              </button>
                              {/* Delete Card */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteCertification(
                                    i,
                                    cert,
                                    setFieldValue,
                                    values
                                  )
                                }
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Remove certification"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Certification Name *
                              </label>
                              <Field
                                type="text"
                                name={`certifications.${i}.certificationName`}
                                placeholder="e.g. AWS Cloud Practitioner"
                                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Issuing Organization *
                              </label>
                              <Field
                                type="text"
                                name={`certifications.${i}.issuingOrganization`}
                                placeholder="e.g. Amazon, Google, Microsoft"
                                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Credential ID
                              </label>
                              <Field
                                type="text"
                                name={`certifications.${i}.credentialId`}
                                placeholder="e.g. AWS-12345"
                                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Date of Completion
                              </label>
                              <Field
                                type="date"
                                name={`certifications.${i}.dateOfCompletion`}
                                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Certificate URL
                              </label>
                              <Field
                                type="url"
                                name={`certifications.${i}.certificateUrl`}
                                placeholder="e.g. https://res.cloudinary.com/... or https://..."
                                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                              />
                              {cert.certificateUrl && (
                                <a
                                  href={cert.certificateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 text-xs hover:underline mt-1.5 inline-flex items-center gap-1"
                                >
                                  &bull; View Certificate Link
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 6: DOCUMENTS */}
              {/* ========================================================================= */}
              {activeTab === "Documents" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="border-b pb-3">
                    <h2 className="text-lg font-bold text-gray-800">
                      Profile Photo & Documents
                    </h2>
                    <p className="text-xs text-gray-500">
                      Upload and manage your profile photo, resume, and additional documents.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo */}
                    <div className="border border-gray-200 p-5 rounded-2xl bg-gray-50/50 flex flex-col items-center text-center justify-between">
                      <div className="w-full flex flex-col items-center">
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          Profile Photo
                        </label>
                        <img
                          src={
                            documents.photo
                              ? URL.createObjectURL(documents.photo)
                              : user?.documents?.photo
                              ? `${user.documents.photo}?t=${Date.now()}`
                              : profile
                          }
                          alt="profile"
                          className="w-24 h-24 rounded-full object-cover border-2 border-purple-300 shadow-md mb-4"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          className="text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                          onChange={(e) =>
                            setDocuments((p) => ({
                              ...p,
                              photo: e.target.files[0],
                            }))
                          }
                        />
                        <p className="text-[11px] text-gray-400 mt-2">
                          Supported formats: JPG, PNG, WEBP (Max 5MB)
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200 w-full flex items-center justify-center gap-2">
                        {documents.photo && (
                          <button
                            type="button"
                            onClick={() => handleUploadSingleDocument("photo")}
                            disabled={uploadingDoc}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                          >
                            {uploadingDoc ? "Uploading..." : "Upload Photo"}
                          </button>
                        )}
                        {user?.documents?.photo && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument("photo")}
                            disabled={uploadingDoc}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                          >
                            Delete Photo
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Resume */}
                    <div className="border border-gray-200 p-5 rounded-2xl bg-gray-50/50 flex flex-col justify-between">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Resume / CV
                        </label>
                        <p className="text-xs text-gray-500 mb-4">
                          Recruiters prefer up-to-date PDF documents.
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                          onChange={(e) =>
                            setDocuments((p) => ({
                              ...p,
                              resume: e.target.files[0],
                              resumeName: e.target.files[0]?.name,
                            }))
                          }
                        />
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200 text-xs flex flex-col gap-2">
                        {documents.resumeName ? (
                          <div className="flex items-center justify-between">
                            <p className="text-green-600 font-medium">
                              New: {documents.resumeName}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleUploadSingleDocument("resume")}
                              disabled={uploadingDoc}
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                            >
                              {uploadingDoc ? "Uploading..." : "Upload Resume"}
                            </button>
                          </div>
                        ) : user?.documents?.resume ? (
                          <div className="flex items-center justify-between text-gray-600">
                            <span className="truncate max-w-[150px]">
                              {user.documents.resume.split("/").pop()}
                            </span>
                            <div className="flex items-center gap-2">
                              <a
                                href={user.documents.resume}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-700 font-semibold hover:underline"
                              >
                                Download
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument("resume")}
                                disabled={uploadingDoc}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400">No resume uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Additional Documents */}
                    <div className="border border-gray-200 p-5 rounded-2xl bg-gray-50/50 flex flex-col justify-between md:col-span-2">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Additional Document (Optional)
                        </label>
                        <p className="text-xs text-gray-500 mb-4">
                          Any supplementary certificates, portfolio, or documents.
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                          onChange={(e) =>
                            setDocuments((p) => ({
                              ...p,
                              additional: e.target.files[0],
                            }))
                          }
                        />
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200 text-xs flex items-center justify-between">
                        {documents.additional ? (
                          <div className="flex items-center justify-between w-full">
                            <p className="text-green-600 font-medium">
                              Selected: {documents.additional.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleUploadSingleDocument("additional")}
                              disabled={uploadingDoc}
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                            >
                              {uploadingDoc ? "Uploading..." : "Upload Document"}
                            </button>
                          </div>
                        ) : user?.documents?.additional ? (
                          <div className="flex items-center justify-between w-full text-gray-600">
                            <span>Current Additional Document</span>
                            <div className="flex items-center gap-2">
                              <a
                                href={user.documents.additional}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-700 font-semibold hover:underline"
                              >
                                View / Download
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument("additional")}
                                disabled={uploadingDoc}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400">No additional document uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* NAVIGATION BUTTONS */}
              {/* ========================================================================= */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex gap-2 w-full sm:w-auto">
                  {tabs.indexOf(activeTab) > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={isSubmittingTab}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition w-full sm:w-auto"
                    >
                      &larr; Previous
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/my-profile")}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-medium text-sm hover:bg-gray-50 transition w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  {tabs.indexOf(activeTab) < tabs.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => handleNext(values)}
                      disabled={isSubmittingTab}
                      className={`px-6 py-2.5 bg-purple-700 text-white font-semibold text-sm rounded-xl transition shadow-sm w-full sm:w-auto ${
                        isSubmittingTab
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-purple-800"
                      }`}
                    >
                      {isSubmittingTab ? "Saving..." : "Save & Next \u2192"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveAll(values)}
                      disabled={isSubmittingTab || loading}
                      className={`px-8 py-2.5 bg-purple-700 text-white font-semibold text-sm rounded-xl transition shadow-md w-full sm:w-auto ${
                        isSubmittingTab || loading
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-purple-800"
                      }`}
                    >
                      {isSubmittingTab || loading ? "Saving..." : "Save All & Finish"}
                    </button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Layout>
  );
};

export default EditProfile;
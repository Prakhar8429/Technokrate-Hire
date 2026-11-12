import React, { useEffect } from "react";
import Layout from "../../../components/Layout/Layout";
import Percentage from "../../../assets/percentage.png"
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobSeekerPlans } from "../../../redux/slice/jobSeekerPlan/jobSeekerPlanSlice";
import { fetchUserProfile } from "../../../redux/slice/getProfile/getProfileSlice";
import Loading from "../../../components/common/loader/Loading";
import {
    FaCheckCircle, FaTimesCircle, FaShieldAlt, FaCrown, FaRocket,
    FaCalendarAlt, FaBolt, FaGift, FaFileInvoice
} from "react-icons/fa";

const Plans = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get plans from Redux
    const { plans, loading, error } = useSelector((state) => state.jobSeekerPlan);

    // Get user profile to determine current plan
    const profileState = useSelector((state) => state.profile);
    const profileUser = profileState?.user;

    // Try to extract current plan from profile or localStorage
    const localUser = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
    })();
    const rawUser = profileUser || localUser;

    // Check token to see if user is logged in
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");

    // Unified user object checking all possible nesting structures
    const u =
        rawUser?.data?.user ||
        rawUser?.data ||
        rawUser?.user ||
        rawUser;

    // Retrieve mock purchased plan that won't get wiped by backend refresh
    const mockPlan = (() => {
        try { return JSON.parse(localStorage.getItem("mockPurchasedPlan") || "null"); } catch { return null; }
    })();

    // Extract purchased plan name if any
    const purchasedPlanName =
        mockPlan?.planName ||
        u?.planName ||
        u?.plan?.planName ||
        u?.activePlan?.planName ||
        u?.subscription?.planName ||
        u?.currentPlan?.planName ||
        u?.purchasedPlan?.planName ||
        null;

    // Determine current plan: if purchased plan exists use it; if logged in, default to "Free Plan"
    const currentPlanName = purchasedPlanName || (token ? "Free Plan" : null);

    const isFreePlan = !purchasedPlanName || currentPlanName?.toLowerCase() === "free plan";
    const isPaidPlan = !isFreePlan;

    const planExpiryRaw =
        mockPlan?.planExpiry ||
        u?.planExpiry ||
        u?.plan?.expiry ||
        u?.activePlan?.expiryDate ||
        u?.subscription?.expiryDate ||
        null;

    const planValidity =
        u?.planValidity ||
        u?.plan?.validity ||
        u?.activePlan?.validity ||
        (isFreePlan ? 30 : null);

    const planAmount =
        mockPlan?.planAmount ||
        u?.planAmount ||
        u?.plan?.amount ||
        u?.activePlan?.amount ||
        u?.subscription?.amount ||
        (isFreePlan ? 0 : null);

    // Show card if user has an active plan (logged in or purchased)
    const hasPurchasedPlan = !!currentPlanName;

    const formatExpiry = (dateStr) => {
        if (!dateStr) return null;
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return null;
            return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
        } catch { return null; }
    };

    const expiryFormatted = formatExpiry(planExpiryRaw);

    const daysRemaining = (() => {
        if (!planExpiryRaw) return planValidity || null;
        try {
            const diff = new Date(planExpiryRaw) - new Date();
            return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        } catch { return null; }
    })();

    const daysWarning = daysRemaining !== null && daysRemaining <= 7;

    useEffect(() => {
        dispatch(fetchJobSeekerPlans());
        const token = localStorage.getItem("token");
        if (token) dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            console.warn("Failed to fetch plans from server, using offline fallback plans:", error);
        }
    }, [error]);

    const FALLBACK_PLANS = [
        {
            _id: "free-plan-fallback",
            planName: "Free Plan",
            planTag: "Best for New Users",
            validity: 30,
            planPrice: 0,
            discount: 0,
            canApplyJobsPerMonth: 5,
            profileBoost: false,
            jobAlert: false,
            support: false,
            status: "Active",
            isDeleted: false
        },
        {
            _id: "basic-plan-fallback",
            planName: "Basic Plan",
            planTag: "For active job seekers",
            validity: 30,
            planPrice: 199,
            discount: 35, // ₹129
            canApplyJobsPerMonth: 50,
            profileBoost: true,
            jobAlert: true,
            support: false,
            status: "Active",
            isDeleted: false
        },
        {
            _id: "premium-plan-fallback",
            planName: "Premium Plan",
            planTag: "Most Popular",
            validity: 30,
            planPrice: 599,
            discount: 16, // ₹499
            canApplyJobsPerMonth: 9999, // Unlimited
            profileBoost: true,
            jobAlert: true,
            support: true,
            status: "Active",
            isDeleted: false
        }
    ];

    const displayPlans = (plans && plans.length > 0) ? plans : FALLBACK_PLANS;

    if (loading) return (
        <Layout>
            <Loading text="Loading Plans..."/>
        </Layout>
    );
    // if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
    return (
        // <Layout>

        //     <div className="p-4 bg-white rounded-[8px] shadow-lg border border-gray-300 ">

        //         <h2 className="text-lg font-semibold mb-4 ">Top Plans</h2>

        //         <div className="grid md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-1 gap-3">

        //             {/* FREE PLAN */}
        //             <div className="bg-white w-full min-h-[520px] border border-gray-300  shadow-xl rounded-xl p-6 flex flex-col justify-between">

        //                 <div>
        //                     <div className="rounded-xl border border-gray-200 p-4 mb-2 shadow-lg ">

        //                         <p className="text-purple-600 font-semibold">Free Plan</p>
        //                         <p className="font-semibold mt-1">Best for New Users</p>
        //                         <p className="text-gray-400 text-xs mb-4">
        //                             Our best rate for long-term hiring
        //                         </p>
        //                         <div className="border-t border-gray-200 my-4"></div>

        //                     </div>
        //                     <button className="bg-green-600 text-white w-full py-2 rounded-md mb-5">
        //                         Current
        //                     </button>

        //                     <ul className="text-sm text-gray-600 space-y-2">
        //                         <li>› Apply to <b>5 jobs</b>/month</li>
        //                         <li>› Basic profile creation</li>
        //                         <li>› No job alerts</li>
        //                         <li>› No resume boost</li>
        //                         <li>› No recruiter activity</li>
        //                         <li>› No priority support</li>
        //                     </ul>
        //                 </div>

        //             </div>

        //             {/* BASIC PLAN */}
        //             <div className="bg-white w-full min-h-[520px] border border-gray-300  shadow-xl rounded-xl p-6 flex flex-col justify-between">

        //                 <div>
        //                     <div className="rounded-xl border border-gray-200 p-4 mb-2 shadow-lg ">
        //                         <p className="text-purple-600 font-semibold">Basic</p>
        //                         <p className="font-semibold">1 Month</p>
        //                         <p className="text-gray-400 text-xs mb-4">
        //                             For active job seekers
        //                         </p>
        //                         <div className="border-t border-gray-200 my-4"></div>

        //                         <div className="flex items-center gap-3 mb-4">
        //                             <span className="line-through text-gray-400">₹199</span>
        //                             <span className="font-semibold">₹129</span>
        //                             <span className="text-purple-700 text-xs px-3 py-2 rounded-full flex items-center gap-1"
        //                                 style={{
        //                                     background: "linear-gradient(135deg, #7900BA4F, #DD202533, #EB996E1A)"
        //                                 }}>
        //                                 <img src={Percentage} className="w-[8px] h-[14px]" />
        //                                 35% OFF
        //                             </span>
        //                         </div>
        //                     </div>


        //                     <button className="bg-gradient-to-r from-purple-600 to-purple-800 text-white w-full py-2 rounded-md mb-5" onClick={() => navigate("/checkout")}>
        //                         Buy Now
        //                     </button>

        //                     <ul className="text-sm text-gray-600 space-y-2">
        //                         <li>› Apply to <b>50 jobs</b>/month</li>
        //                         <li>› Basic profile creation</li>
        //                         <li>› Smart job alerts (email + SMS)</li>
        //                         <li>› Resume boost (upload & edit)</li>
        //                         <li>› Direct recruiter activity</li>
        //                         <li>› Basic support</li>
        //                     </ul>
        //                 </div>

        //             </div>

        //             {/* PREMIUM PLAN */}
        //             <div className="bg-white w-full min-h-[520px] border border-gray-300  shadow-xl rounded-xl p-6 flex flex-col justify-between">

        //                 <div>
        //                     <div className="rounded-xl border border-gray-200 p-4 mb-2 shadow-lg ">

        //                         <p className="text-purple-600 font-semibold">Premium Plan</p>
        //                         <p className="font-semibold">1 Month</p>
        //                         <p className="text-gray-400 text-xs mb-4">Most Popular</p>
        //                         <div className="border-t border-gray-200 my-4"></div>

        //                         <div className="flex items-center gap-3 mb-4">
        //                             <span className="line-through text-gray-400">₹599</span>
        //                             <span className="font-semibold">₹499</span>
        //                             <span className="text-purple-700 text-xs px-3 py-2 rounded-full flex items-center gap-1"
        //                                 style={{
        //                                     background: "linear-gradient(135deg, #7900BA4F, #DD202533, #EB996E1A)"
        //                                 }}>
        //                                 <img src={Percentage} className="w-[8px] h-[14px]" /> 35% OFF
        //                             </span>
        //                         </div>
        //                     </div>
        //                     <button className="bg-gradient-to-r from-purple-600 to-purple-800 text-white w-full py-2 rounded-md mb-5" onClick={() => navigate("/checkout")}>
        //                         Buy Now
        //                     </button>

        //                     <ul className="text-sm text-gray-600 space-y-2">
        //                         <li>› <b>Unlimited</b> job applications</li>
        //                         <li>› Advanced profile creation</li>
        //                         <li>› Smart job alerts (email + SMS)</li>
        //                         <li>› Resume boost (higher ranking)</li>
        //                         <li>› Direct chat with recruiters</li>
        //                         <li>› Priority support</li>
        //                     </ul>
        //                 </div>

        //             </div>

        //         </div>
        //     </div>
        // </Layout>
        <Layout>
            <div className="p-4 bg-white rounded-[8px] shadow-lg border border-gray-300">
                {/* ━━━━ MY ACTIVE PLAN CARD ━━━━ */}
                {hasPurchasedPlan && (() => {
                    // Match currentPlanName to a plan in displayPlans for features
                    const matchedPlan = displayPlans.find(p =>
                        p.planName?.toLowerCase() === currentPlanName?.toLowerCase()
                    ) || displayPlans[0];

                    // Progress bar: days used / total validity
                    const totalDays = matchedPlan?.validity || planValidity || 30;
                    const usedDays = daysRemaining !== null ? Math.max(0, totalDays - daysRemaining) : 0;
                    const progressPct = daysRemaining !== null
                        ? Math.min(100, Math.round((usedDays / totalDays) * 100))
                        : 0;

                    // Price to display
                    const displayAmount = isFreePlan
                        ? "0"
                        : (planAmount !== null && planAmount !== undefined
                            ? planAmount
                            : (matchedPlan ? Math.round(matchedPlan.planPrice - (matchedPlan.planPrice * matchedPlan.discount) / 100) : "0"));

                    return (
                        <div style={{
                            background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)",
                            border: "1px solid rgba(126,0,180,0.15)",
                            borderRadius: "20px",
                            marginBottom: "32px",
                            overflow: "hidden",
                            boxShadow: "0 10px 30px rgba(126,0,180,0.08), 0 1px 3px rgba(0,0,0,0.05)"
                        }}>
                            {/* Top colored strip */}
                            <div style={{
                                background: "linear-gradient(135deg, #9b2cdd 0%, #7E00B4 100%)",
                                padding: "16px 24px",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                flexWrap: "wrap", gap: "12px",
                                position: "relative",
                                overflow: "hidden"
                            }}>
                                {/* Decorative subtle glow overlay */}
                                <div style={{
                                    position: "absolute", top: "-50%", left: "-10%",
                                    width: "150px", height: "150px",
                                    background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
                                    borderRadius: "50%"
                                }}></div>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 1 }}>
                                    <div style={{
                                        background: "rgba(255,255,255,0.2)",
                                        padding: "6px", borderRadius: "8px", backdropFilter: "blur(4px)"
                                    }}>
                                        <FaCrown style={{ color: "#fbbf24", fontSize: "18px" }} />
                                    </div>
                                    <span style={{ color: "#fff", fontWeight: "800", fontSize: "18px", letterSpacing: "0.5px" }}>
                                        {currentPlanName}
                                    </span>
                                    <span style={{
                                        background: "#fff",
                                        color: "#7E00B4",
                                        fontSize: "10px", fontWeight: "800",
                                        padding: "4px 10px", borderRadius: "999px",
                                        letterSpacing: "0.08em", textTransform: "uppercase",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                                    }}>
                                        ● Active
                                    </span>
                                </div>
                                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: "600", letterSpacing: "0.5px", zIndex: 1 }}>
                                    My Subscription Details
                                </span>
                            </div>

                            {/* Body */}
                            <div style={{ padding: "24px 28px" }}>
                                <div style={{
                                    display: "flex", flexWrap: "wrap",
                                    gap: "32px", alignItems: "flex-start",
                                    justifyContent: "space-between"
                                }}>
                                    {/* Left: validity info */}
                                    <div style={{ flex: "1", minWidth: "220px" }}>

                                        {/* Amount paid */}
                                        {displayAmount && (
                                            <div style={{ marginBottom: "16px" }}>
                                                <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                                                    Amount Paid
                                                </p>
                                                <span style={{ fontSize: "28px", fontWeight: "900", color: "#7E00B4", lineHeight: "1" }}>
                                                    ₹{displayAmount}
                                                </span>
                                            </div>
                                        )}

                                        {/* Expiry date */}
                                        {expiryFormatted ? (
                                            <div style={{ marginBottom: "16px" }}>
                                                <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                                                    Valid Till
                                                </p>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f3e8ff", padding: "6px 12px", borderRadius: "8px", width: "fit-content" }}>
                                                    <FaCalendarAlt style={{ color: "#7E00B4", fontSize: "14px" }} />
                                                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#4c1d95" }}>
                                                        {expiryFormatted}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : planValidity ? (
                                            <div style={{ marginBottom: "16px" }}>
                                                <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                                                    Validity
                                                </p>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f3e8ff", padding: "6px 12px", borderRadius: "8px", width: "fit-content" }}>
                                                    <FaCalendarAlt style={{ color: "#7E00B4", fontSize: "14px" }} />
                                                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#4c1d95" }}>
                                                        {planValidity} Days
                                                    </span>
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Days remaining + progress bar */}
                                        {daysRemaining !== null && (
                                            <div style={{ marginTop: "12px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                    <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                        Days Remaining
                                                    </span>
                                                    <span style={{
                                                        fontSize: "13px", fontWeight: "800",
                                                        color: daysWarning ? "#e11d48" : "#7E00B4"
                                                    }}>
                                                        {daysRemaining} / {totalDays} days
                                                    </span>
                                                </div>
                                                {/* Progress bar */}
                                                <div style={{
                                                    width: "100%", height: "10px",
                                                    background: "#e5e7eb",
                                                    borderRadius: "999px", overflow: "hidden",
                                                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
                                                }}>
                                                    <div style={{
                                                        width: `${100 - progressPct}%`,
                                                        height: "100%",
                                                        borderRadius: "999px",
                                                        background: daysWarning
                                                            ? "linear-gradient(90deg, #f43f5e, #fb7185)"
                                                            : "linear-gradient(90deg, #9b2cdd, #7E00B4)",
                                                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                                    }} />
                                                </div>
                                                {daysWarning && (
                                                    <p style={{ fontSize: "12px", color: "#e11d48", fontWeight: "700", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <FaBolt style={{ fontSize: "12px" }} />
                                                        Expiring soon! Renew to continue access.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div style={{
                                        width: "1px", background: "linear-gradient(to bottom, transparent, #d1d5db, transparent)",
                                        alignSelf: "stretch", minHeight: "80px"
                                    }} />

                                    {/* Right: plan features */}
                                    {matchedPlan && (
                                        <div style={{ flex: "1", minWidth: "180px" }}>
                                            <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                                                Plan Includes
                                            </p>
                                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                                                <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#374151" }}>
                                                    <FaCheckCircle style={{ color: "#7E00B4", fontSize: "14px", flexShrink: 0 }} />
                                                    Apply to <strong style={{ color: "#111827", margin: "0 4px", fontWeight: "800" }}>{matchedPlan.canApplyJobsPerMonth >= 9999 ? "Unlimited" : matchedPlan.canApplyJobsPerMonth}</strong> jobs/month
                                                </li>
                                                <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#374151" }}>
                                                    {matchedPlan.profileBoost
                                                        ? <FaCheckCircle style={{ color: "#7E00B4", fontSize: "14px", flexShrink: 0 }} />
                                                        : <FaTimesCircle style={{ color: "#d1d5db", fontSize: "14px", flexShrink: 0 }} />
                                                    }
                                                    <span style={{ color: matchedPlan.profileBoost ? "#374151" : "#9ca3af" }}>Profile Boost</span>
                                                </li>
                                                <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#374151" }}>
                                                    {matchedPlan.jobAlert
                                                        ? <FaCheckCircle style={{ color: "#7E00B4", fontSize: "14px", flexShrink: 0 }} />
                                                        : <FaTimesCircle style={{ color: "#d1d5db", fontSize: "14px", flexShrink: 0 }} />
                                                    }
                                                    <span style={{ color: matchedPlan.jobAlert ? "#374151" : "#9ca3af" }}>Job Alerts</span>
                                                </li>
                                                <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#374151" }}>
                                                    {matchedPlan.support
                                                        ? <FaCheckCircle style={{ color: "#7E00B4", fontSize: "14px", flexShrink: 0 }} />
                                                        : <FaTimesCircle style={{ color: "#d1d5db", fontSize: "14px", flexShrink: 0 }} />
                                                    }
                                                    <span style={{ color: matchedPlan.support ? "#374151" : "#9ca3af" }}>Priority Support</span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
                                        <button
                                            onClick={() => navigate('/invoice')}
                                            style={{
                                                background: "rgba(126,0,180,0.06)",
                                                color: "#7E00B4",
                                                border: "1px solid rgba(126,0,180,0.2)",
                                                borderRadius: "10px",
                                                padding: "10px 20px",
                                                fontWeight: "800",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                whiteSpace: "nowrap",
                                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.background = "rgba(126,0,180,0.12)"; e.currentTarget.style.borderColor = "rgba(126,0,180,0.3)"; }}
                                            onMouseOut={e => { e.currentTarget.style.background = "rgba(126,0,180,0.06)"; e.currentTarget.style.borderColor = "rgba(126,0,180,0.2)"; }}
                                        >
                                            <FaFileInvoice style={{ fontSize: "15px" }} /> View Invoice
                                        </button>
                                        <button
                                            onClick={() => document.getElementById("available-plans-section")?.scrollIntoView({ behavior: "smooth" })}
                                            style={{
                                                background: "linear-gradient(135deg, #9b2cdd, #7E00B4)",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "10px",
                                                padding: "11px 24px",
                                                fontWeight: "800",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                whiteSpace: "nowrap",
                                                boxShadow: "0 6px 20px rgba(126,0,180,0.3)",
                                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(126,0,180,0.4)"; }}
                                            onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(126,0,180,0.3)"; }}
                                        >
                                            <FaShieldAlt style={{ fontSize: "15px" }} /> {isPaidPlan ? "Renew Plan" : "Upgrade Plan"}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* ━━━━ AVAILABLE PLANS ━━━━ */}

                <h2 id="available-plans-section" className="text-lg font-semibold mb-4">Top Plans</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-1 gap-3">

                    {displayPlans
                        .filter(plan => plan.status === "Active" || !plan.isDeleted) // show only active plans
                        .map((plan) => {
                            const isFree = plan.planPrice === 0 || plan.planName?.toLowerCase().includes("free");
                            const discountedPrice = Math.round(plan.planPrice - (plan.planPrice * plan.discount) / 100);

                            return (
                                <div
                                    key={plan._id}
                                    className="w-full min-h-[520px] shadow-xl rounded-xl p-6 flex flex-col justify-between"
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #d1d5db",
                                    }}
                                >
                                    <div>
                                        {/* Plan header card */}
                                        <div
                                            className="rounded-xl p-4 mb-2 shadow-lg"
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #e5e7eb",
                                            }}
                                        >
                                            <p
                                                className="font-semibold text-base"
                                                style={{ color: "#7E00B4" }}
                                            >
                                                {plan.planName}
                                            </p>
                                            <p className="font-semibold text-sm mt-0.5" style={{ color: "#111827" }}>
                                                {plan.validity} Day(s)
                                            </p>
                                            <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>
                                                {plan.planTag}
                                            </p>
                                            <div className="border-t my-4" style={{ borderColor: "#e5e7eb" }}></div>

                                            {/* Price section */}
                                            <div className="flex items-center gap-3 mb-1">
                                                {plan.planPrice === 0 ? (
                                                    <span
                                                        className="text-2xl font-extrabold"
                                                        style={{ color: "#15803d" }}
                                                    >
                                                        ₹0 / Free
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="line-through text-gray-400">₹{plan.planPrice}</span>
                                                        <span className="font-semibold">₹{discountedPrice}</span>
                                                        {plan.discount > 0 && (
                                                            <span
                                                                className="text-purple-700 text-xs px-3 py-2 rounded-full flex items-center gap-1"
                                                                style={{
                                                                    background: "linear-gradient(135deg, #7900BA4F, #DD202533, #EB996E1A)",
                                                                }}
                                                            >
                                                                <img src={Percentage} className="w-[8px] h-[14px]" />
                                                                {plan.discount}% OFF
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        {isFree ? (
                                            <button
                                                className="text-white w-full py-2 rounded-md mb-5 font-semibold transition-all duration-200"
                                                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
                                            >
                                                ✓ Get Started Free
                                            </button>
                                        ) : (
                                            <button
                                                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white w-full py-2 rounded-md mb-5 hover:opacity-90 transition-all duration-200"
                                                onClick={() => navigate("/checkout", {
                                                    state: {
                                                        planId: plan._id,
                                                        planName: plan.planName,
                                                        planTag: plan.planTag,
                                                        validity: plan.validity,
                                                        originalPrice: plan.planPrice,
                                                        discountedPrice: discountedPrice,
                                                        discount: plan.discount > 0 ? `${plan.discount}% OFF` : "",
                                                    }
                                                })}
                                            >
                                                Purchase Now
                                            </button>
                                        )}

                                        {/* Features list */}
                                        <ul className="text-sm space-y-2" style={{ color: isFree ? "#166534" : "#4b5563" }}>
                                            <li>› Apply to <b>{plan.canApplyJobsPerMonth}</b> jobs/month</li>
                                            <li>› Profile Boost: {plan.profileBoost ? "✓ Yes" : "✗ No"}</li>
                                            <li>› Job Alerts: {plan.jobAlert ? "✓ Yes" : "✗ No"}</li>
                                            <li>› Support: {plan.support ? "✓ Yes" : "✗ No"}</li>
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </Layout>
    );
};

export default Plans;

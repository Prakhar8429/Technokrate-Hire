import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosNotificationsOutline } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import logo from "../../assets/finallogo.png";
import { FiPhone } from "react-icons/fi";
import Englishicon from "../../assets/English.png"
import { useSelector, useDispatch } from "react-redux";
import { fetchNotifications } from "../../redux/slice/notification/notificationSlice";

const Header = ({ onLogoClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const user = useSelector((state) => state.user.user);
  const unreadCount = useSelector((state) => state.notifications?.unreadCount ?? 0);

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    if (token) {
      dispatch(fetchNotifications());
    }
  }, [dispatch]);

  const handelnotification = () => {
    navigate("/notification");
  };

  // ✅ Languages array with proper properties
  const languages = [
    { code: "en", name: "English", flag: Englishicon },
    { code: "hi", name: "Hindi", flag: "/india-flag.png" },
    { code: "de", name: "German", flag: "/germany-flag.png" },
    { code: "de", name: "German", flag: "/germany-flag.png" },

  ];


  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  return (
    <div className="w-full relative z-0">
      <div className="relative z-10 border-b border-gray-200 pt-2 pb-2 px-4 bg-gradient-to-r from-purple-200 to-purple-50 flex flex-wrap items-center justify-between">

        {/* Left Side */}
        <h4 className="lg:text-[14px] text-[10px]  text-gray-800">
          Welcome to Technokrate Hire
        </h4>

        {/* Right Side */}
        <div className="flex items-center gap-6 text-sm text-gray-600">

          {/* Phone */}
          {/* <div className="flex items-center gap-2">
            <FiPhone />
            <span>+1-202-555-0178</span>
          </div> */}

          {/* Language Selector */}
          {/* Language Selector */}
          {/* <div className="relative z-50">
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={selectedLanguage.flag}
                alt={selectedLanguage.name}
                className="w-5 h-4 object-cover"
              />
              <span className="text-xs sm:text-sm">{selectedLanguage.name}</span>
              <span className="text-sm">▾</span>
            </div>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-32 max-h-60 overflow-y-auto bg-white border rounded shadow-md z-50">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setDropdownOpen(false);
                    }}
                  >
                    <img
                      src={lang.flag}
                      alt={lang.name}
                      className="w-5 h-4 object-cover"
                    />
                    <span className="text-sm">{lang.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div> */}
        </div>
      </div>

      {/* HEADER LOGO & ACTIONS */}
      <div className="w-full bg-white px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-[64px] sm:h-[72px] pt-2">
          <div className="lg:hidden">{/* <Sidebar /> */}</div>

          {/* LOGO */}
          <div className="flex items-center w-[160px] sm:w-[220px] lg:w-[260px]">
            <img
              src={logo}
              alt="Logo"
              onClick={() => {
                if (onLogoClick) {
                  onLogoClick();
                  return;
                }
                const token =
                  localStorage.getItem("token") ||
                  localStorage.getItem("accessToken") ||
                  localStorage.getItem("authToken");

                if (
                  location.pathname.includes("applicationdetails") ||
                  location.pathname.includes("applicationsubmit")
                ) {
                  navigate("/dashboard/applied-jobs");
                } else if (token) {
                  navigate("/dashboard");
                } else {
                  navigate("/");
                }
              }}
              className="w-[500px] h-auto max-h-[260px] object-contain cursor-pointer"
            />
          </div>

          {/* USER ACTIONS */}
          <div className="flex items-center gap-2">
            {/* NOTIFICATION BELL */}
            <div className="relative cursor-pointer" onClick={handelnotification}>
              <IoIosNotificationsOutline className="w-[40px] h-[30px] text-purple-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            <div className="relative">
              {user?.documents?.photo ? (
                <img
                  src={user.documents.photo}
                  alt="profile"
                  onClick={() => navigate("/dashboard/my-profile")}
                  className="w-[40px] h-[40px] rounded-full object-cover cursor-pointer"
                />
              ) : (
                <div
                  onClick={() => navigate("/dashboard/my-profile")}
                  className="w-[40px] h-[40px] rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold cursor-pointer"
                >
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-purple-500" />
    </div>
  );
};

export default Header;

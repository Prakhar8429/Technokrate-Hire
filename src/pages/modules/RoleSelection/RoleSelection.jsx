import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/Logos.png"
import profile from "../../../assets/Image (1).png"
import Skip from "../skip/skip";

const RoleSelection = () => {
    const navigate = useNavigate();
    const [employerClicked, setEmployerClicked] = useState(false);

    const handleEmployerClick = () => {
        setEmployerClicked(true);
        window.open("https://employeer.technokratehire.com/login", "_blank", "noopener,noreferrer");
        setTimeout(() => {
            setEmployerClicked(false);
        }, 800);
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-100 to-gray-200 flex items-center justify-center px-4">

            {/* Top Bar */}
            {/* <div className="absolute left-3 top-3">
                <button onClick={() => navigate(-1)} className="text-2xl">
                    ←
                </button>
            </div>

            <div className="absolute right-3 top-3">
                <button
                    onClick={() => navigate("/")}
                    className="text-gray-700 font-medium"
                >
                    Skip
                </button>
            </div> */}
            <Skip disabled={employerClicked} ></Skip>
            <div className="w-full max-w-xl text-center relative mt-4">
                {/* Logo */}
                <div className="mb-2 mt-2">
                    <img src={logo} alt="Technokrate Hire" className="max-w-[300px] mx-auto" />
                </div>

                {/* Heading */}
                <h2 className="text-[20px] font-medium text-gray-800 mb-2">
                    Your gateway to
                </h2>

                <h3 className="text-[20px] leading-[40px] mb-6">
                    <span className="text-[#7900BA] font-medium">finding jobs</span>{" "}
                    and{" "}
                    <span className="text-[#7900BA] font-medium">hiring talent</span>{" "}
                    effortlessly.
                </h3>

                {/* Illustration */}
                <div className="flex justify-center mb-6">
                    <img
                        src={profile}
                        alt="Illustration"
                        className="w-64 h-64 object-contain"
                    />
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto mb-8">
                    Connecting talented professionals with top opportunities, our platform
                    makes <span className="text-[#7900BA]">hiring</span> and{" "}
                    <span className="text-[#7900BA]">job searching</span> seamless and efficient.
                </p>

                {/* Buttons */}
                <div className="space-y-4 mb-[35px] flex flex-col items-center">
                    <button
                        onClick={() => navigate("/login")}
                        className="w-[50%] bg-[#7900BA] text-white py-2 rounded-lg font-medium shadow"
                    >
                        I'm a Job Seeker
                    </button>

                    <button
                        onClick={handleEmployerClick}
                        className="w-[50%] bg-[#7900BA] text-white py-2 rounded-lg font-medium shadow"
                    >
                        I'm an Employer
                    </button>
                </div>


            </div>
        </div>
    );
};

export default RoleSelection;

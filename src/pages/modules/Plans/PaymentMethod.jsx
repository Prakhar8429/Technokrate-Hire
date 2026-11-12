import React, { useState } from "react";
import Layout from "../../../components/Layout/Layout";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentMethod = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upi");

  const months = [
    { value: "", label: "Month" },
    { value: "01", label: "01" },
    { value: "02", label: "02" },
    { value: "03", label: "03" },
    { value: "04", label: "04" },
    { value: "05", label: "05" },
    { value: "06", label: "06" },
    { value: "07", label: "07" },
    { value: "08", label: "08" },
    { value: "09", label: "09" },
    { value: "10", label: "10" },
    { value: "11", label: "11" },
    { value: "12", label: "12" },
  ];

  const currentYear = new Date().getFullYear();
  const years = [{ value: "", label: "Year" }];
  for (let i = 0; i < 12; i += 1) {
    years.push({ value: String(currentYear + i), label: String(currentYear + i) });
  }

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [errors, setErrors] = useState({});

  const validateCardForm = () => {
    const newErrors = {};
    const sanitizedCardNumber = cardNumber.replace(/\s/g, "");

    if (!sanitizedCardNumber) {
      newErrors.cardNumber = "Card number is required.";
    } else if (!/^\d{16}$/.test(sanitizedCardNumber)) {
      newErrors.cardNumber = "Card number must be 16 digits.";
    }

    if (!cardHolderName.trim()) {
      newErrors.cardHolderName = "Card holder name is required.";
    } else if (!/^[A-Za-z ]+$/.test(cardHolderName.trim())) {
      newErrors.cardHolderName = "Name can only contain letters and spaces.";
    }

    if (!expiryMonth) {
      newErrors.expiryMonth = "Expiry month is required.";
    }
    if (!expiryYear) {
      newErrors.expiryYear = "Expiry year is required.";
    }
    if (expiryMonth && expiryYear) {
      const expiryDate = new Date(Number(expiryYear), Number(expiryMonth) - 1, 1);
      const today = new Date();
      if (expiryDate < new Date(today.getFullYear(), today.getMonth(), 1)) {
        newErrors.expiryMonth = "Expiry date cannot be in the past.";
      }
    }

    if (!cvv) {
      newErrors.cvv = "CVV is required.";
    } else if (!/^\d{3}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3 digits.";
    }

    if (!termsChecked) {
      newErrors.termsChecked = "You must agree to terms and conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const location = useLocation();
  const paymentState = location.state || {};

  const handleProceed = () => {
    if (activeTab === "card") {
      if (!validateCardForm()) return;
    }

    // Mock backend update: save purchased plan to local storage separately so profile API doesn't wipe it
    if (paymentState.planName) {
      try {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        
        const mockPlan = {
            planName: paymentState.planName,
            planAmount: paymentState.discountedTotal,
            planExpiry: expiry.toISOString()
        };
        
        localStorage.setItem("mockPurchasedPlan", JSON.stringify(mockPlan));
      } catch (e) {
        console.error("Failed to save mock plan", e);
      }
    }

    navigate("/dashboard/payment-method/payment-suceecsfull");
  };

  const handleCardNumberChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleCardHolderNameChange = (value) => {
    setCardHolderName(value.replace(/[^A-Za-z ]/g, ""));
    if (errors.cardHolderName) {
      setErrors((prev) => ({ ...prev, cardHolderName: undefined }));
    }
  };

  const handleCvvChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 3);
    setCvv(digitsOnly);
    if (errors.cvv) {
      setErrors((prev) => ({ ...prev, cvv: undefined }));
    }
  };

  return (
    <Layout>
      {/* Main Body Container based on Figma specs: 1108px width, 24px padding */}
      <div className="flex flex-col mx-auto min-h-screen bg-[#FFFFFF] rounded-[8px] p-[24px] gap-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
        {/* Header Section */}
        <div className="flex items-center gap-2 py-2 border-b border-gray-100">
          <span className="cursor-pointer text-gray-700">←</span>
          <button
            onClick={() => navigate(-1)}
            className="text-base font-medium text-gray-800"
          >
            Select Payment Method
          </button>
        </div>

        {/* Payment Tabs */}
        <div className="flex h-[60px] gap-[44px]">
          <button
            onClick={() => setActiveTab("upi")}
            className={`text-[24px] font-bold pb-2 transition-all ${
              activeTab === "upi"
                ? "text-[#7E00B4] border-b-4 border-[#7E00B4]"
                : "text-gray-900"
            }`}
          >
            Scan & Pay via UPI
          </button>
          <button
            onClick={() => setActiveTab("card")}
            className={`text-[24px] font-bold pb-2 transition-all ${
              activeTab === "card"
                ? "text-[#7E00B4] border-b-4 border-[#7E00B4]"
                : "text-gray-900"
            }`}
          >
            Credit Card/Debit Card
          </button>
        </div>

        {/* Content Section */}
        <div className="flex h-[524px] w-[1029px] ml-[24px] mb-[92px] mr-[55px] flex-col lg:flex-row gap-[45px]">
          {/* Left Side: Dynamic Content based on activeTab */}
          <div className="flex-1 border h-[524px] w-[512px] border-gray-200 items-center justify-center rounded-lg p-[12px] gap-[24px] lg:p-10 flex flex-col">
            {activeTab === "upi" ? (
              /* UPI VIEW */
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 bg-gray-100 rounded mb-8 flex items-center justify-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Payment"
                    alt="QR Code"
                    className="opacity-30 blur-[1px]"
                  />
                </div>
                <p className="text-[#7E00B4] font-semibold text-lg mb-8 text-center">
                  A QR Code will be generated to make the payment
                </p>
                <button className="w-full max-w-sm bg-[#7E00B4] text-white py-4 rounded-md font-bold text-lg hover:opacity-90">
                  Generate QR Code
                </button>
              </div>
            ) : (
              /* CREDIT/DEBIT CARD VIEW */
              <div className="space-y-6 w-[512px] h-[512px] p-[12px] gap-[24px]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="Card Number"
                    className="w-full border border-gray-300 rounded-md p-3 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-[#7E00B4]"
                  />
                  {errors.cardNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card holder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolderName}
                    onChange={(e) => handleCardHolderNameChange(e.target.value)}
                    placeholder="Enter Your name on the card"
                    className="w-full border border-gray-300 rounded-md p-3 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-[#7E00B4]"
                  />
                  {errors.cardHolderName && (
                    <p className="text-xs text-red-500 mt-1">{errors.cardHolderName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md p-3 bg-gray-50 text-sm text-gray-500"
                      >
                        {months.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md p-3 bg-gray-50 text-sm text-gray-500"
                      >
                        {years.map((year) => (
                          <option key={year.value} value={year.value}>
                            {year.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(errors.expiryMonth || errors.expiryYear) && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.expiryMonth || errors.expiryYear}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter CVV
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        inputMode="numeric"
                        value={cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        placeholder="Enter CVV"
                        className="w-full flex-1 border border-gray-300 rounded-md p-3 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-[#7E00B4]"
                      />
                      <div className="flex-1 border border-gray-300 rounded-md p-2">
                        <span className="text-[10px] text-gray-400 leading-tight">
                          3 Digits Printed on the back of the card
                        </span>
                      </div>
                    </div>
                    {errors.cvv && (
                      <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Common Policy and Checkbox */}
            <div className="mb-[24px]">
              <p className="text-[11px] text-gray-500 text-center leading-relaxed mb-6">
                Technokrate Hire does not store any account related information or any
                credit / debit card details. You'll be redirected to a
                third-party gateway for payment. Technokrate Hire doesn't store any
                account information or credit/debit card details.
              </p>
              <div className="flex justify-center items-center gap-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[#7E00B4]"
                  id="terms"
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  I agree to the Terms & Conditions and Privacy Policy
                </label>
              </div>
            </div>
          </div>

          {/* Right Side: Price Summary Card */}
          <div className="w-[472px] h-[253px] border border-gray-100 rounded-xl p-6 shadow-sm bg-white">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-gray-900">₹199</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Discount 35% off(1 Months off)</span>
                <span>-₹50.0</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between">
                <span className="font-bold text-gray-800">
                  Total Payable Amount
                </span>
                <span className="font-bold text-[#22C55E] text-lg">₹149</span>
              </div>
            </div>
            <button
              onClick={handleProceed}
              className="w-full bg-[#7E00B4] text-white py-4 rounded-md font-bold text-lg hover:opacity-90"
            >
              {activeTab === "upi" ? "Continue" : "Proceed to pay"}
            </button>
            {errors.termsChecked && (
              <p className="text-xs text-red-500 mt-2">{errors.termsChecked}</p>
            )}
            <p className="text-[10px] text-gray-400 mt-[12px] mb-[24px] text-center">
              Renew automatically every month until cancelled the autopay.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentMethod;

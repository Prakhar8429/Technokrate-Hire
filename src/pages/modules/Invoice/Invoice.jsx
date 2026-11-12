import React, { useRef } from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Layout from "../../../components/Layout/Layout";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";

const Invoice = () => {
    const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
    const invoiceRef = useRef(null);
    const navigate = useNavigate();

    const handleDownload = async () => {
        if (!invoiceRef.current) return;

        const canvas = await html2canvas(invoiceRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

        if (imgHeight > pageHeight) {
            while (position + pageHeight < imgHeight) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            }
        }

        pdf.save(`invoice-${invoiceNumber}.pdf`);
    };

    return (
        <Layout>
            <div className="flex rounded-2xl shadow-lg border border-gray-300  overflow-y-auto scrollbar-hide">

                {/* Sidebar */}
                {/* Main Content */}
                <div className="flex-1 p-4">

                    {/* Top Bar */}

                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate('/dashboard/plans');
                                }}
                                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft size={20} className="cursor-pointer text-gray-700" />
                            </button>
                            <h2 className="text-[18px] font-medium">Invoice</h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="bg-[#7E00B4] text-white px-4 py-1 rounded-[6px] text-xs"
                        >
                            Download
                        </button>
                    </div>



                    {/* Invoice Card */}
                    <div ref={invoiceRef} className="bg-white rounded-xl shadow-lg p-4 border border-[#7E00B4]">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[14px] font-medium">Invoice {invoiceNumber}</h3>
                            <span className="bg-green-100 text-green-600 text-sm px-3 py-1 rounded-full">
                                ● Paid
                            </span>
                        </div>

                        {/* Success Box */}
                        <div className="bg-green-100 text-black p-2 rounded-md flex items-center gap-2 mb-6">
                            <CheckCircle size={18} className="text-green-500" />
                            Invoice Paid On {new Date().toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}                        </div>

                        {/* Info Section */}
                        <div className="grid grid-cols-2 gap-6 text-sm text-gray-700 mb-6">

                            <div>
                                <p className="text-gray-400">Payment Date & Time</p>
                                <p>Feb 2, 2026 19:28</p>

                                <p className="text-gray-400 mt-4">To</p>
                                <p className="font-medium">TALENTRISE TECHNOKRATE PRIVATE LIMITED</p>
                                <p>
                                    Plot no 1, Diwan Layout, Manewada, Parwati Nagar, Nagpur,
                                    Maharashtra, 440027
                                </p>

                                <p className="text-gray-400 mt-4">Plan Details</p>
                                <p>Basic Plan</p>
                            </div>

                            <div className="text-right">
                                <p className="text-gray-400">Transaction Id</p>
                                <p className="font-medium">PYM782390HJF</p>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-t border-gray-200">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="py-3 px-4">Sr.No.</th>
                                        <th className="py-3 px-4">Description</th>
                                        <th className="py-3 px-4">Payment Method</th>
                                        <th className="py-3 px-4">Quantity</th>
                                        <th className="py-3 px-4 text-right">Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr className="border-t border-gray-200">
                                        <td className="py-3 px-4">1</td>
                                        <td className="py-3 px-4">Basic Plan</td>
                                        <td className="py-3 px-4">GPay</td>
                                        <td className="py-3 px-4">1</td>
                                        <td className="py-3 px-4 text-right">₹129/-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Total Section */}
                        <div className="mt-4 border-t  pt-4 text-sm">
                            <div className="flex justify-between">
                                <span>Total Amount</span>
                                <span className="text-purple-600 font-semibold text-lg">
                                    ₹129/-
                                </span>
                            </div>

                            <div className=" text-gray-600 border-b border-t mt-2 pt-2 pb-2">
                                <p className=" font-medium">Amount in Words:</p>
                                <p className="text-[12px]">One hundred Twenty Nine Only</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Invoice;

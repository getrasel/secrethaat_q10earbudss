import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export const WhatsAppButton: React.FC = () => {
  const phoneNumber = "8801746867350";
  const displayPhone = "+8801746867350";
  const message =
    "হ্যালো, আমি Q10 HiFi Stereo Sports Earbuds সম্পর্কে বিস্তারিত জানতে ও অর্ডার করতে চাই।";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <aside
      aria-label="হোয়াটসঅ্যাপে যোগাযোগ"
      className="fixed bottom-[74px] md:bottom-6 right-3.5 sm:right-6 z-40 transition-all duration-300"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
        aria-label={`হোয়াটসঅ্যাপে যোগাযোগ করুন: ${displayPhone}`}
      >
        <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />

        {/* Live Notification Indicator Pulse */}
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full border-2 border-[#25D366] flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        </span>
      </a>
    </aside>
  );
};

export default WhatsAppButton;

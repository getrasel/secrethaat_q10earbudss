import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiShoppingBag,
  FiMapPin,
  FiPhone,
  FiUser,
  FiTruck,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {
  PRODUCT_INFO,
  COLOR_VARIANTS,
  toBanglaNumber,
} from "../data/productData";
import type { OrderState } from "../types";

export const ThankYou: React.FC = () => {
  const location = useLocation();
  const state = location.state as {
    order?: OrderState;
    orderNumber?: string;
    grandTotal?: number;
    deliveryFee?: number;
    subtotal?: number;
  } | null;

  const [fallbackOrderNumber] = useState(
    () => `Q10-${Math.floor(10000 + Math.random() * 90000)}`,
  );
  const orderNumber = state?.orderNumber || fallbackOrderNumber;

  const order = state?.order;
  const isOutside =
    order?.deliveryArea === "outside" ||
    order?.deliveryArea === "dhaka_outside" ||
    state?.deliveryFee === PRODUCT_INFO.deliveryOutside;
  const grandTotal =
    state?.grandTotal ??
    PRODUCT_INFO.basePrice +
      (isOutside ? PRODUCT_INFO.deliveryOutside : PRODUCT_INFO.deliveryDhaka);
  const deliveryFee =
    state?.deliveryFee ??
    (isOutside ? PRODUCT_INFO.deliveryOutside : PRODUCT_INFO.deliveryDhaka);
  const quantity = order?.quantity ?? 1;
  const unitPrice = PRODUCT_INFO.basePrice;
  const subtotal = state?.subtotal ?? unitPrice * quantity;

  // Track Meta Pixel Purchase event on Thank You page
  useEffect(() => {
    if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "Purchase", {
        content_name: PRODUCT_INFO.name,
        content_ids: ["q10_hifi_earbuds"],
        content_type: "product",
        value: grandTotal,
        currency: "BDT",
        num_items: quantity,
      });
      console.log("[Meta Pixel] Purchase event tracked:", {
        content_name: PRODUCT_INFO.name,
        value: grandTotal,
        currency: "BDT",
        num_items: quantity,
      });
    }
  }, [grandTotal, quantity]);

  // Find color variant details if available
  const variant =
    COLOR_VARIANTS.find(
      (v) => v.name === order?.selectedColor || v.id === order?.selectedColor,
    ) || COLOR_VARIANTS[0];

  const whatsappUrl = `https://wa.me/8801746867350?text=${encodeURIComponent(
    `হ্যালো, আমি অর্ডার #${orderNumber} সম্পর্কে জানতে চাই।`,
  )}`;

  return (
    <div className="w-full py-6 sm:py-10 md:py-16 bg-slate-50 min-h-[calc(100vh-5rem)] flex items-center justify-center px-3 sm:px-4 box-border overflow-x-hidden">
      <div className="w-full max-w-2xl mx-auto">
        {/* Success Header Card */}
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 border border-slate-200/90 shadow-xl shadow-blue-500/5 text-center relative overflow-hidden box-border">
          {/* Subtle Top Accent Gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-blue" />

          {/* Success Animated Icon */}
          <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center border-4 border-emerald-100 shadow-inner mb-4 sm:mb-6">
            <FiCheckCircle className="w-8 h-8 sm:w-11 sm:h-11" />
          </div>

          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold mb-3">
            <FiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>অর্ডার সফলভাবে গ্রহণ করা হয়েছে</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3 leading-snug">
            অভিনন্দন! আপনার অর্ডারটি নিশ্চিত হয়েছে
          </h1>

          <p className="text-xs sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed mb-5 sm:mb-6">
            আমাদের কাস্টমার সাপোর্ট প্রতিনিধি খুব শীঘ্রই আপনার নম্বরে কল করে
            অর্ডারটি ভেরিফাই করবেন এবং পার্সেলটি পাঠিয়ে দেওয়া হবে।
          </p>

          {/* Order Reference Number Banner */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-slate-100/90 border border-slate-200 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-700 font-latin max-w-full overflow-hidden">
            <span className="font-semibold text-slate-500 shrink-0">Order ID:</span>
            <span className="font-extrabold text-slate-900 tracking-wider text-sm sm:text-base truncate">
              {orderNumber}
            </span>
          </div>

          {/* Order Details & Summary Card */}
          <div className="mt-6 sm:mt-8 text-left bg-slate-50/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 border border-slate-200/80 space-y-4 sm:space-y-5 w-full box-border">
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200/80 pb-2.5 sm:pb-3">
              <FiShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0068FF] shrink-0" />
              <span>অর্ডারের সংক্ষিপ্ত বিবরণ</span>
            </h2>

            {/* Product Item Preview */}
            <div className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 overflow-hidden w-full box-border">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                <img
                  src={variant.image}
                  alt={variant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-xs sm:text-base truncate">
                  {PRODUCT_INFO.nameBangla}
                </h3>
                <p className="text-[11px] sm:text-sm text-slate-500 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <span>
                    রঙ:{" "}
                    <strong className="text-slate-800 font-semibold">
                      {order?.selectedColor || variant.name}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    পরিমাণ:{" "}
                    <strong className="text-slate-800 font-semibold font-number">
                      {toBanglaNumber(quantity)} পিস
                    </strong>
                  </span>
                </p>
                <div className="text-xs sm:text-sm font-bold text-[#0265FF] mt-1 font-number">
                  ৳{toBanglaNumber(unitPrice)} × {toBanglaNumber(quantity)} = ৳
                  {toBanglaNumber(subtotal)}
                </div>
              </div>
            </div>

            {/* Customer Details if available */}
            {order?.customerName && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm w-full box-border">
                <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 space-y-0.5 sm:space-y-1 overflow-hidden">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <FiUser className="w-3.5 h-3.5 text-[#0265FF] shrink-0" />
                    গ্রাহকের নাম:
                  </span>
                  <span className="font-bold text-slate-900 block break-words text-xs sm:text-sm">
                    {order.customerName}
                  </span>
                </div>

                <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 space-y-0.5 sm:space-y-1 overflow-hidden">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <FiPhone className="w-3.5 h-3.5 text-[#0265FF] shrink-0" />
                    মোবাইল নম্বর:
                  </span>
                  <span className="font-bold text-slate-900 block font-latin text-xs sm:text-sm break-all">
                    {order.phoneNumber}
                  </span>
                </div>

                <div className="sm:col-span-2 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 space-y-0.5 sm:space-y-1 overflow-hidden">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <FiMapPin className="w-3.5 h-3.5 text-[#0265FF] shrink-0" />
                    ডেলিভারি ঠিকানা:
                  </span>
                  <span className="font-semibold text-slate-900 block break-words text-xs sm:text-sm">
                    {order.fullAddress}
                  </span>
                </div>
              </div>
            )}

            {/* Price Calculations */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm w-full box-border">
              <div className="flex justify-between items-center gap-2 text-slate-600">
                <span>পণ্যের মূল্য:</span>
                <span className="font-semibold text-slate-900 shrink-0 font-number">
                  ৳{toBanglaNumber(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold text-emerald-600 shrink-0 font-number">
                  {deliveryFee === 0 ? "ফ্রি (৳০)" : `৳${toBanglaNumber(deliveryFee)}`}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 text-slate-600">
                <span>পেমেন্ট পদ্ধতি:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[11px] sm:text-xs shrink-0">
                  ক্যাশ অন ডেলিভারি
                </span>
              </div>
              <div className="border-t border-slate-200/80 pt-2.5 flex justify-between items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-lg sm:text-2xl font-extrabold text-[#0265FF] shrink-0 font-number">
                  ৳{toBanglaNumber(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Assurance Badge */}
          <div className="mt-5 sm:mt-6 text-left w-full">
            <div className="bg-blue-50/60 border border-blue-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 w-full box-border">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100/80 flex items-center justify-center text-[#0068FF] shrink-0">
                <FiTruck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  দ্রুত হোম ডেলিভারি
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-tight mt-0.5">
                  সারা বাংলাদেশে দ্রুত ও নির্ভরযোগ্য হোম ডেলিভারি
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-blue bg-gradient-blue-hover text-white font-bold py-3 sm:py-3.5 px-6 sm:px-7 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 text-xs sm:text-sm"
            >
              <FiArrowLeft className="w-4 h-4 shrink-0" />
              <span>মূল পাতায় ফিরে যান</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803d] text-white font-bold py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 text-xs sm:text-sm"
            >
              <FaWhatsapp className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0" />
              <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;

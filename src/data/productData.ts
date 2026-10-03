import blackEarbudsImg from '../assets/black_Earbuds.jpg';
import whiteEarbudsImg from '../assets/q10_white_earbuds.jpg';

import type { ProductColor } from '../types';

export const PRODUCT_INFO = {
  name: "Q10 HiFi Stereo Sports Earbuds",
  nameBangla: "Q10 হাই-ফাই স্টেরিও স্পোর্টস ইয়ারবাডস",
  tagline: "এক বক্সে ৪টি ইয়ারবাড! দুই স্টাইলে বদলে নিন আপনার শোনার অভিজ্ঞতা।",
  regularPrice: 1490,
  basePrice: 990,
  deliveryDhaka: 0,
  deliveryOutside: 0,
};

export const COLOR_VARIANTS: ProductColor[] = [
  {
    id: "black",
    name: "ব্ল্যাক (Black)",
    nameEn: "Black",
    hex: "#0F172A",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    image: blackEarbudsImg,
  },
  {
    id: "white",
    name: "হোয়াইট (White)",
    nameEn: "White",
    hex: "#F8FAFC",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    image: whiteEarbudsImg,
  },
];

// Helper to convert English numbers to Bangla digits
export const toBanglaNumber = (num: number | string): string => {
  const banglaDigits: { [key: string]: string } = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };
  return String(num).replace(/[0-9]/g, (match) => banglaDigits[match] || match);
};

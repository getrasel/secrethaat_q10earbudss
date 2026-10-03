import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  LogOut,
  Search,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  Trash2,
  Copy,
  Download,
  Eye,
  X,
  Phone,
  PlusCircle,
  AlertCircle,
  Database,
} from "lucide-react";
import { isSupabaseConfigured } from "../lib/superbase";
import { WhatsAppIcon } from "./icons/WhatsAppIcon";
import {
  fetchOrdersFromSupabase,
  createSupabaseOrder,
  updateSupabaseOrderStatus,
  deleteSupabaseOrder,
} from "../utils/orderStorage";
import type { Order } from "../utils/orderStorage";

interface AdminDashboardProps {
  onLogout?: () => void;
  onBackToSite?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onBackToSite,
}) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_authenticated");
    if (onLogout) {
      onLogout();
    } else {
      navigate("/login");
    }
  };

  const handleBackToSite = () => {
    if (onBackToSite) {
      onBackToSite();
    } else {
      navigate("/");
    }
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await fetchOrdersFromSupabase();

    if (error) {
      console.error("Supabase fetch error:", error);
      setErrorMessage(
        error.message ||
          "Supabase থেকে ডেটা লোড করা যায়নি। অনুগ্রহ করে .env ফাইলে Supabase URL ও Key চেক করুন।"
      );
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: number | string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await updateSupabaseOrderStatus(orderId, newStatus);

      if (error) {
        alert(`স্ট্যাটাস আপডেট ব্যর্থ হয়েছে: ${error.message || "Supabase Error"}`);
      } else {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === orderId ? { ...ord, status: newStatus } : ord
          )
        );

        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err: any) {
      alert(`এরর: ${err?.message || "স্ট্যাটাস আপডেট করা যায়নি"}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (orderId: number | string) => {
    if (!confirm("আপনি কি নিশ্চিত এই অর্ডারটি Supabase থেকে মুছে ফেলতে চান?")) return;

    setUpdatingId(orderId);
    try {
      const { error } = await deleteSupabaseOrder(orderId);

      if (error) {
        alert(`মুছে ফেলা ব্যর্থ হয়েছে: ${error.message || "Supabase Error"}`);
      } else {
        setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      }
    } catch (err: any) {
      alert(`এরর: ${err?.message || "মুছে ফেলা সম্ভব হয়নি"}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddSampleOrder = async () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrderData = {
      name: `গ্রাহক ${randomSuffix}`,
      phone: `017${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: "হাউজ ২৫, ধানমন্ডি, ঢাকা",
      product: "Q10 HiFi Stereo Sports Earbuds",
      color: randomSuffix % 2 === 0 ? "ব্ল্যাক (Black)" : "হোয়াইট (White)",
      quantity: 1,
      price: 890,
      shipping_amount: 70,
      total_amount: 960,
      status: "pending",
    };

    setLoading(true);
    const { data: created, error } = await createSupabaseOrder(newOrderData);
    setLoading(false);

    if (error) {
      alert(`টেস্ট অর্ডার তৈরি ব্যর্থ: ${error.message || "Supabase Error"}`);
    } else if (created) {
      setOrders((prev) => [created, ...prev]);
    } else {
      fetchOrders();
    }
  };

  const handleCopyOrderInfo = (ord: Order) => {
    const qty = ord.quantity || 1;
    const shipping = ord.shipping_amount ?? 0;
    const total = ord.total_amount ?? 0;
    const unitPrice =
      ord.price != null
        ? ord.price
        : qty > 0 && total >= shipping
        ? Math.round((total - shipping) / qty)
        : total;
    const itemTotal = unitPrice * qty;

    const info = `অর্ডার #${ord.id}\nনাম: ${ord.name}\nফোন: ${ord.phone}\nঠিকানা: ${ord.address}\nপণ্য: ${ord.product || "Q10 HiFi Stereo Sports Earbuds"} (${ord.color || "ব্ল্যাক (Black)"})\nপরিমাণ: ${qty} টি\nমূল্য: ৳${unitPrice} x ${qty} = ৳${itemTotal}\nডেলিভারি: ৳${shipping}\nসর্বমোট: ৳${total}`;

    navigator.clipboard.writeText(info);
    setCopiedId(ord.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("এক্সপোর্ট করার মতো কোনো অর্ডার নেই।");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Phone",
      "Address",
      "Product",
      "Color",
      "Quantity",
      "Item Price",
      "Delivery Charge",
      "Total Amount",
      "Status",
    ];

    const rows = filteredOrders.map((ord) => {
      const qty = ord.quantity || 1;
      const shipping = ord.shipping_amount ?? 0;
      const total = ord.total_amount ?? 0;
      const unitPrice =
        ord.price != null
          ? ord.price
          : qty > 0 && total >= shipping
          ? Math.round((total - shipping) / qty)
          : total;

      return [
        ord.id,
        ord.created_at ? new Date(ord.created_at).toLocaleString() : "",
        `"${(ord.name || "").replace(/"/g, '""')}"`,
        `"${ord.phone || ""}"`,
        `"${(ord.address || "").replace(/"/g, '""')}"`,
        `"${(ord.product || "").replace(/"/g, '""')}"`,
        `"${ord.color || ""}"`,
        qty,
        unitPrice,
        shipping,
        total,
        ord.status || "pending",
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `supabase_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (order.name || "").toLowerCase().includes(q) ||
      (order.phone || "").includes(q) ||
      (order.address || "").toLowerCase().includes(q) ||
      String(order.id).includes(q) ||
      (order.product || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce(
    (sum, ord) => sum + (ord.total_amount || 0),
    0
  );
  const pendingCount = orders.filter(
    (ord) => ord.status === "pending" || !ord.status
  ).length;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-bangla p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Supabase Status Banner if not fully configured */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-950/70 border border-amber-600/40 rounded-2xl p-4 flex items-start gap-3 text-amber-200 text-sm shadow-lg">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white">
                Supabase Environment Variables পাওয়া যায়নি
              </p>
              <p className="text-xs text-amber-300/90 leading-relaxed">
                Supabase ডেটাবেজ যুক্ত করতে আপনার প্রজেক্টের <code>.env</code> ফাইলে <code>VITE_SUPABASE_URL</code> এবং <code>VITE_SUPABASE_ANON_KEY</code> যোগ করুন।
              </p>
            </div>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
                <span>অর্ডার ম্যানেজমেন্ট প্যানেল</span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-semibold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> Supabase
                </span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              কাস্টমারদের সমস্ত অর্ডারের লাইভ বিবরণ ও ড্যাশবোর্ড (Supabase DB)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleAddSampleOrder}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
              title="নতুন টেস্ট অর্ডার Supabase-এ যোগ করুন"
            >
              <PlusCircle className="w-4 h-4" />
              <span>টেস্ট অর্ডার</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>CSV এক্সপোর্ট</span>
            </button>
            <button
              onClick={handleBackToSite}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ওয়েবসাইট</span>
            </button>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>রিফ্রেশ</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400">
                মোট অর্ডার
              </div>
              <div className="text-2xl font-black text-white">
                {orders.length} টি
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400">
                পেন্ডিং অর্ডার
              </div>
              <div className="text-2xl font-black text-amber-400">
                {pendingCount} টি
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400">
                মোট বিক্রয়
              </div>
              <div className="text-2xl font-black text-emerald-400">
                ৳ {totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="নাম, ফোন, ID বা ঠিকানা খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
              ফিল্টার:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">সকল স্ট্যাটাস ({orders.length})</option>
              <option value="pending">পেন্ডিং (Pending)</option>
              <option value="confirmed">কনফার্মড (Confirmed)</option>
              <option value="shipped">শিপড (Shipped)</option>
              <option value="delivered">ডেলিভারড (Delivered)</option>
              <option value="cancelled">ক্যান্সেলড (Cancelled)</option>
            </select>
          </div>
        </div>

        {/* Error Notification if any */}
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-700/60 rounded-2xl p-5 text-red-200 text-sm space-y-3 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">{errorMessage}</span>
              <button
                onClick={fetchOrders}
                className="px-3 py-1.5 bg-red-800 hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shrink-0"
              >
                আবার চেষ্টা করুন
              </button>
            </div>

            {errorMessage.toLowerCase().includes("row-level security") && (
              <div className="bg-slate-950 p-4 rounded-xl border border-red-800/60 text-xs space-y-2 text-slate-300">
                <p className="font-bold text-amber-400">
                  💡 Supabase Row-Level Security (RLS) সমাধান:
                </p>
                <p className="text-slate-400">
                  Supabase Dashboard &gt; SQL Editor-এ গিয়ে নিচের কোডটি রান করুন:
                </p>
                <div className="relative bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-emerald-400 overflow-x-auto text-[11px]">
                  <code>
                    {`alter table neworders enable row level security;

create policy "Allow all operations for anon"
on neworders for all
using (true)
with check (true);`}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `alter table neworders enable row level security;\n\ncreate policy "Allow all operations for anon"\non neworders for all\nusing (true)\nwith check (true);`
                      );
                      alert("SQL কোড কপি করা হয়েছে! Supabase SQL Editor-এ পেস্ট করে Run দিন।");
                    }}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold cursor-pointer"
                  >
                    SQL কপি করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">Supabase থেকে অর্ডারগুলো লোড হচ্ছে...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-bold">কোনো অর্ডার পাওয়া যায়নি</p>
              <p className="text-slate-500 text-xs">
                কাস্টমার অর্ডার করলে সরাসরি Supabase ডেটাবেজে যুক্ত হবে।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-xs uppercase text-slate-400 font-bold border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">#ID</th>
                    <th className="py-3.5 px-4">তারিখ ও সময়</th>
                    <th className="py-3.5 px-4">কাস্টমারের নাম ও ঠিকানা</th>
                    <th className="py-3.5 px-4">যোগাযোগ</th>
                    <th className="py-3.5 px-4">পণ্য ও ভ্যারিয়েন্ট</th>
                    <th className="py-3.5 px-4">পরিমাণ</th>
                    <th className="py-3.5 px-4">ডেলিভারি চার্জ</th>
                    <th className="py-3.5 px-4">সর্বমোট মূল্য</th>
                    <th className="py-3.5 px-4">স্ট্যাটাস</th>
                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredOrders.map((ord) => {
                    const dateFormatted = ord.created_at
                      ? new Date(ord.created_at).toLocaleString("bn-BD", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "N/A";

                    const rawPhone = (ord.phone || "").replace(/\D/g, "");
                    const waPhone = rawPhone.startsWith("88")
                      ? rawPhone
                      : rawPhone.startsWith("01")
                      ? `88${rawPhone}`
                      : rawPhone;

                    const shippingAmount = ord.shipping_amount ?? 0;
                    const isDhaka = shippingAmount === 70;
                    const isOutside = shippingAmount === 130;
                    const shippingLabel = isDhaka
                      ? "ঢাকার ভেতরে"
                      : isOutside
                      ? "ঢাকার বাইরে"
                      : shippingAmount === 0
                      ? "ফ্রি ডেলিভারি"
                      : "ডেলিভারি চার্জ";

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-mono text-indigo-400 font-bold text-xs">
                          #{ord.id}
                        </td>
                        <td className="py-4 px-4 text-slate-400 text-xs whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-white text-sm">
                            {ord.name}
                          </div>
                          <div className="text-xs text-slate-400 max-w-xs truncate" title={ord.address}>
                            {ord.address}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${ord.phone}`}
                              className="font-mono text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{ord.phone}</span>
                            </a>
                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                  `আসসালামু আলাইকুম ${ord.name}, 2-in-1 Rechargeable Double Light Torch & Reading Lamp অর্ডার করার জন্য ধন্যবাদ।`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp এ মেসেজ দিন"
                                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors flex items-center justify-center"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-200 text-xs">
                            {ord.product || "2-in-1 Torch & Lamp"}
                          </div>
                          {ord.color && (
                            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-indigo-300 font-medium">
                              {ord.color}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-200">
                          {ord.quantity || 1} টি
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-xs font-semibold text-slate-300">
                            ৳ {shippingAmount}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {shippingLabel}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-extrabold text-indigo-400 whitespace-nowrap">
                          ৳ {ord.total_amount ?? 0}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={ord.status || "pending"}
                            disabled={updatingId === ord.id}
                            onChange={(e) =>
                              updateOrderStatus(ord.id, e.target.value)
                            }
                            className={`px-2.5 py-1 rounded-lg border text-xs font-bold focus:outline-none transition-all cursor-pointer ${getStatusBadgeClass(
                              ord.status || "pending"
                            )}`}
                          >
                            <option value="pending">পেন্ডিং</option>
                            <option value="confirmed">কনফার্মড</option>
                            <option value="shipped">শিপড</option>
                            <option value="delivered">ডেলিভারড</option>
                            <option value="cancelled">ক্যান্সেলড</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              title="বিস্তারিত দেখুন"
                              className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleCopyOrderInfo(ord)}
                              title={copiedId === ord.id ? "কপি করা হয়েছে!" : "তথ্য কপি করুন"}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                copiedId === ord.id
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                              }`}
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => deleteOrder(ord.id)}
                              disabled={updatingId === ord.id}
                              title="অর্ডার মুছুন"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  অর্ডার বিবরণী #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  কাস্টমার তথ্য
                </div>
                <div><strong className="text-white">নাম:</strong> {selectedOrder.name}</div>
                <div><strong className="text-white">মোবাইল:</strong> {selectedOrder.phone}</div>
                <div><strong className="text-white">ঠিকানা:</strong> {selectedOrder.address}</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  পণ্য ও ডেলিভারি বিবরণ
                </div>
                <div><strong className="text-white">পণ্য:</strong> {selectedOrder.product}</div>
                <div><strong className="text-white">কালার:</strong> {selectedOrder.color || "কিউট ইয়েলো"}</div>
                <div><strong className="text-white">পরিমাণ:</strong> {selectedOrder.quantity || 1} টি</div>
                <div>
                  <strong className="text-white">একক মূল্য:</strong> ৳ {
                    selectedOrder.price != null
                      ? selectedOrder.price
                      : (selectedOrder.quantity || 1) > 0 && (selectedOrder.total_amount || 0) >= (selectedOrder.shipping_amount || 0)
                      ? Math.round(((selectedOrder.total_amount || 0) - (selectedOrder.shipping_amount || 0)) / (selectedOrder.quantity || 1))
                      : (selectedOrder.total_amount || 0)
                  }
                </div>
                <div>
                  <strong className="text-white">ডেলিভারি চার্জ:</strong> ৳ {selectedOrder.shipping_amount ?? 0}
                  {selectedOrder.shipping_amount === 70
                    ? " (ঢাকার ভেতরে)"
                    : selectedOrder.shipping_amount === 130
                    ? " (ঢাকার বাইরে)"
                    : selectedOrder.shipping_amount === 0
                    ? " (ফ্রি ডেলিভারি)"
                    : ""}
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-base">
                  <strong className="text-white font-extrabold">সর্বমোট প্রদেয় মূল্য:</strong>
                  <span className="text-emerald-400 font-black text-lg">৳ {selectedOrder.total_amount ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleCopyOrderInfo(selectedOrder)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>তথ্য কপি করুন</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

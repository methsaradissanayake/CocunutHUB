import React, { useEffect, useState, useMemo } from "react";
import { listings as fallbackListings, marketCategories, districts } from "@/data/mockData";
import { listingsApi } from "@/api/client";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { MARKET } from "@/constants/testIds";
import {
  MapPin,
  Package,
  Clock,
  Lock,
  Phone,
  ShieldCheck,
  Plus,
  Loader2,
  Search,
  Filter,
  CheckCircle2,
  Droplets,
  Layers,
  CircleDot,
  Flame,
  RotateCcw,
  MessageSquare,
  Sparkles,
  Building2,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case "oil":
    case "coconut_oil":
      return <Droplets size={15} className="text-amber-400" />;
    case "coir":
    case "coir_fiber":
      return <Layers size={15} className="text-amber-300" />;
    case "husk":
    case "coconut_husk":
      return <CircleDot size={15} className="text-yellow-400" />;
    case "shell":
    case "coconut_shell":
      return <Flame size={15} className="text-stone-300" />;
    default:
      return <Package size={15} className="text-emerald-400" />;
  }
};

const ListingCard = ({ l, index }) => {
  const { t } = useLanguage();
  const isBuyer = l.type === "buyer";
  const displayPhone = l.phone;
  const cleanPhone = displayPhone ? displayPhone.replace(/[^0-9+]/g, "") : "";

  return (
    <div
      className={`group relative bg-white rounded-2xl p-4 md:p-5 border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
        isBuyer
          ? "border-stone-200 hover:border-blue-500"
          : "border-stone-200 hover:border-[#004236]"
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
      data-testid={MARKET.card(l.id)}
    >
      {/* Accent left ribbon indicator */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${
          isBuyer ? "bg-blue-600" : "bg-[#004236]"
        }`}
      />

      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pl-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                isBuyer
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {isBuyer ? `🛒 ${t("buyer")}` : `🌱 ${t("supplier")}`}
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
              <MapPin size={11} className="text-emerald-700" /> {l.district}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[11px] text-stone-500 font-medium whitespace-nowrap">
            <Clock size={11} /> {l.posted}
          </span>
        </div>

        {/* Business / Trader Title */}
        <div className="pl-1.5 font-display text-base md:text-lg font-black text-[#004236] leading-snug">
          {l.name}
        </div>

        {/* Requirement / Supply Volume Badge */}
        <div className="ml-1.5 mt-2.5 flex items-center gap-2 text-xs md:text-sm bg-[#F9FAF8] p-2.5 rounded-xl border border-stone-200 shadow-2xs">
          {getCategoryIcon(l.category)}
          <span className="font-numeric font-black text-[#004236] tracking-tight">
            {l.quantity}
          </span>
          <span className="text-[11px] text-stone-500 font-bold ml-auto capitalize">
            {l.category}
          </span>
        </div>

        {/* Trade Notes */}
        {l.notes && (
          <div className="ml-1.5 mt-2.5 text-xs text-stone-600 leading-relaxed line-clamp-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
            <span className="font-bold text-[#004236] mr-1">{t("notes")}:</span>
            {l.notes}
          </div>
        )}
      </div>

      {/* Action / Direct Contact Section (Matching Mills Directory) */}
      <div className="ml-1.5 mt-4 pt-3 border-t border-dashed border-stone-200">
        <div
          className="flex items-center justify-between gap-2 bg-[#F2F7F4] border border-[#BBD4C4] rounded-xl p-2.5"
          data-testid={MARKET.revealedPhone(l.id)}
        >
          <div className="flex items-center gap-1.5 text-[#004236] font-numeric font-extrabold text-xs sm:text-sm truncate">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <span className="truncate">{cleanPhone || "Direct Contact"}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#004236] text-white hover:bg-[#002D24] shadow-xs transition-colors"
                title={t("call_now")}
              >
                <Phone size={12} className="text-[#FFCE00]" /> {t("call_now")}
              </a>
            )}
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors border border-emerald-300"
                title="WhatsApp"
              >
                <MessageSquare size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MarketPage = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [tab, setTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTab, setPreviewTab] = useState("form");
  const [toastMessage, setToastMessage] = useState(null);

  const [form, setForm] = useState({
    type: currentUser?.businessType?.toLowerCase() === "buyer" ? "buyer" : "supplier",
    category: "coconut",
    name: currentUser?.businessName || currentUser?.fullName || "",
    district: currentUser?.district || "Kurunegala",
    quantity: "",
    notes: "",
    phone: currentUser?.phoneNumber || "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setForm((f) => ({
        ...f,
        name: f.name || currentUser.businessName || currentUser.fullName || "",
        phone: f.phone || currentUser.phoneNumber || "",
        district: f.district || currentUser.district || "Kurunegala",
        type: currentUser.businessType?.toLowerCase() === "buyer" ? "buyer" : "supplier",
      }));
    }
  }, [currentUser]);

  const fetchAllListings = async () => {
    setLoading(true);
    try {
      const data = await listingsApi.getListings("all");
      if (data && data.length > 0) {
        setAllListings(data);
      } else {
        setAllListings(fallbackListings);
      }
    } catch {
      setAllListings(fallbackListings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllListings();
  }, []);

  const stats = useMemo(() => {
    const total = allListings.length;
    const suppliers = allListings.filter((l) => l.type === "supplier").length;
    const buyers = allListings.filter((l) => l.type === "buyer").length;
    const districtSet = new Set(allListings.map((l) => l.district));
    return { total, suppliers, buyers, districtsCount: districtSet.size };
  }, [allListings]);

  const categoryCounts = useMemo(() => {
    const counts = { all: allListings.length };
    marketCategories.forEach((c) => {
      counts[c.id] = allListings.filter((l) => l.category === c.id).length;
    });
    return counts;
  }, [allListings]);

  const filteredListings = useMemo(() => {
    let result = allListings.filter((l) => {
      if (tab !== "all" && l.category !== tab) return false;
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (selectedDistrict !== "all" && l.district !== selectedDistrict) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matches =
          l.name?.toLowerCase().includes(q) ||
          l.district?.toLowerCase().includes(q) ||
          l.quantity?.toLowerCase().includes(q) ||
          l.notes?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    if (sortBy === "qty") {
      result = [...result].sort((a, b) => {
        const numA = parseInt(a.quantity?.replace(/[^0-9]/g, "") || "0", 10);
        const numB = parseInt(b.quantity?.replace(/[^0-9]/g, "") || "0", 10);
        return numB - numA;
      });
    }

    return result;
  }, [allListings, tab, typeFilter, selectedDistrict, searchQuery, sortBy]);

  const resetAllFilters = () => {
    setTab("all");
    setTypeFilter("all");
    setSelectedDistrict("all");
    setSearchQuery("");
    setSortBy("newest");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.phone) return;
    try {
      setSubmitting(true);
      await listingsApi.createListing(form);
      const targetCategory = form.category;
      setShowCreateModal(false);
      setToastMessage("ඔබගේ දැන්වීම සාර්ථකව පළ කරන ලදී! / Trade ad published successfully!");
      setTimeout(() => setToastMessage(null), 4000);

      setForm({
        type: "supplier",
        category: targetCategory,
        name: "",
        district: "Kurunegala",
        quantity: "",
        notes: "",
        phone: "",
      });

      setTab(targetCategory);
      fetchAllListings();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce border border-emerald-500">
          <CheckCircle2 size={16} className="text-amber-300" />
          {toastMessage}
        </div>
      )}

      {/* Hero Banner with Integrated Metrics in CoconutHub Sage Box */}
      <div className="relative overflow-hidden rounded-2xl bg-[#E8F1EC] p-6 border border-[#D0E2D6] shadow-xs text-[#004236]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="ch-badge">
                MARKETPLACE
              </span>
              <span className="text-xs font-bold text-stone-600">
                Direct Farmer & Buyer Network
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#004236] uppercase mt-1">
              {t("market_title")}
            </h1>
            <p className="text-xs sm:text-sm text-[#1E3E34] mt-1 max-w-xl font-medium">
              {t("market_subtitle")}
            </p>
          </div>

          <Button
            onClick={() => {
              setForm((f) => ({ ...f, category: tab === "all" ? "coconut" : tab }));
              setShowCreateModal(true);
            }}
            className="rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black shadow-xs hover:shadow transition-all self-start md:self-auto bg-[#004236] hover:bg-[#002D24] text-white uppercase tracking-wider"
          >
            <Plus size={16} className="mr-1.5 text-[#FFCE00]" />
            {t("post_ad_btn")}
          </Button>
        </div>

        {/* Interactive KPI Quick-Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#D0E2D6]">
          <div
            onClick={() => {
              setTypeFilter("all");
              setTab("all");
            }}
            className="cursor-pointer p-3 rounded-xl bg-white hover:bg-stone-50 transition-colors border border-stone-200 shadow-2xs"
          >
            <div className="text-[11px] font-bold text-stone-500">{t("stat_total_ads")}</div>
            <div className="font-numeric text-xl font-black text-[#004236]">
              {stats.total}
            </div>
          </div>

          <div
            onClick={() => setTypeFilter("supplier")}
            className={`cursor-pointer p-3 rounded-xl transition-all border ${
              typeFilter === "supplier"
                ? "bg-[#004236] text-white border-[#004236] shadow-sm"
                : "bg-white hover:bg-emerald-50/50 border-stone-200 text-[#004236] shadow-2xs"
            }`}
          >
            <div className={`text-[11px] font-bold flex items-center justify-between ${typeFilter === "supplier" ? "text-emerald-200" : "text-emerald-700"}`}>
              <span>{t("stat_suppliers")}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className={`font-numeric text-xl font-black ${typeFilter === "supplier" ? "text-white" : "text-[#004236]"}`}>
              {stats.suppliers}
            </div>
          </div>

          <div
            onClick={() => setTypeFilter("buyer")}
            className={`cursor-pointer p-3 rounded-xl transition-all border ${
              typeFilter === "buyer"
                ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                : "bg-white hover:bg-blue-50/50 border-stone-200 text-blue-900 shadow-2xs"
            }`}
          >
            <div className={`text-[11px] font-bold flex items-center justify-between ${typeFilter === "buyer" ? "text-blue-200" : "text-blue-700"}`}>
              <span>{t("stat_buyers")}</span>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <div className={`font-numeric text-xl font-black ${typeFilter === "buyer" ? "text-white" : "text-blue-900"}`}>
              {stats.buyers}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
            <div className="text-[11px] font-bold text-stone-500">{t("stat_districts")}</div>
            <div className="font-numeric text-xl font-black text-[#004236]">
              {stats.districtsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Search, District, Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              t("buyer") === "Buyer"
                ? "Search by trader name, district, keyword..."
                : "වෙළෙන්දාගේ නම, දිස්ත්‍රික්කය හෝ අවශ්‍යතාව අනුව සොයන්න..."
            }
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-[#1E293B] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* District Filter Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-[#004236] font-bold focus:outline-none focus:ring-2 focus:ring-[#004236] shadow-xs"
          >
            <option value="all">📍 {t("filter_district")}: {t("filter_all")}</option>
            {districts.map((d) => (
              <option key={d} value={d} className="bg-white text-stone-800">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-[#004236] font-bold focus:outline-none focus:ring-2 focus:ring-[#004236] shadow-xs"
          >
            <option value="newest" className="bg-white text-stone-800">⏱ {t("sort_by")}: {t("sort_newest")}</option>
            <option value="qty" className="bg-white text-stone-800">📦 {t("sort_by")}: {t("sort_qty")}</option>
          </select>
        </div>
      </div>

      {/* Category Tabs with Count Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        <button
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-xs ${
            tab === "all"
              ? "bg-[#004236] text-white shadow-sm border border-[#004236]"
              : "bg-white text-stone-700 hover:bg-[#E8F1EC] hover:text-[#004236] border border-stone-200"
          }`}
          onClick={() => setTab("all")}
        >
          <span>{t("filter_all")}</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-numeric font-bold ${
              tab === "all" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            {categoryCounts.all || 0}
          </span>
        </button>

        {marketCategories.map((c) => {
          const count = categoryCounts[c.id] || 0;
          return (
            <button
              key={c.id}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-xs ${
                tab === c.id
                  ? "bg-[#004236] text-white shadow-sm border border-[#004236]"
                  : "bg-white text-stone-700 hover:bg-[#E8F1EC] hover:text-[#004236] border border-stone-200"
              }`}
              onClick={() => setTab(c.id)}
              data-testid={MARKET.categoryTab(c.id)}
            >
              <span>{t(c.labelKey)}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-numeric font-bold ${
                  tab === c.id ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Pills */}
      <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-stone-500 font-bold flex items-center gap-1 mr-1">
            <Filter size={12} /> {t("buyer") === "Buyer" ? "Type:" : "වර්ගය:"}
          </span>
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
              typeFilter === "all"
                ? "bg-[#004236] text-white shadow-xs"
                : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
            }`}
          >
            {t("all_types")}
          </button>
          <button
            onClick={() => setTypeFilter("supplier")}
            className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
              typeFilter === "supplier"
                ? "bg-[#004236] text-white shadow-xs"
                : "bg-emerald-50 text-[#004236] hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            🌱 {t("supplier")}
          </button>
          <button
            onClick={() => setTypeFilter("buyer")}
            className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
              typeFilter === "buyer"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            🛒 {t("buyer")}
          </button>
        </div>

        {(selectedDistrict !== "all" || searchQuery || tab !== "all" || typeFilter !== "all") && (
          <button
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors border border-stone-200"
          >
            <RotateCcw size={11} /> {t("reset_filters")}
          </button>
        )}
      </div>

      {/* Listings Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-2xl border border-stone-200 shadow-xs">
            <Loader2 className="animate-spin text-[#004236]" size={36} />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300 p-6 shadow-xs">
            <Package className="mx-auto text-stone-400 mb-2.5" size={40} />
            <div className="font-bold text-[#004236] text-base">{t("empty_state")}</div>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {t("buyer") === "Buyer"
                ? "Try clearing filters or choose another category to view available trade ads."
                : "පෙරහන් ඉවත් කර හෝ වෙනත් වර්ගයක් තෝරා පවතින දැන්වීම් බලන්න."}
            </p>
            <Button
              onClick={resetAllFilters}
              variant="outline"
              className="mt-4 rounded-xl text-xs font-bold border-stone-300 text-stone-700 hover:bg-[#E8F1EC] hover:text-[#004236]"
            >
              <RotateCcw size={13} className="mr-1.5" />
              {t("reset_filters")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
            {filteredListings.map((l, i) => (
              <ListingCard
                key={l.id}
                l={l}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post New Listing Modal with LIVE PREVIEW */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-3xl rounded-3xl p-5 md:p-6 bg-white border border-stone-200 shadow-2xl text-stone-900">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#E8F1EC] text-[#004236] border border-emerald-200">
                <Sparkles size={16} />
              </span>
              <DialogTitle className="font-display text-xl font-black text-[#004236]">
                {t("buyer") === "Buyer" ? "Post Trade Listing" : "නව වෙළඳ දැන්වීමක් පළ කරන්න"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-stone-500 mt-1">
              {t("buyer") === "Buyer"
                ? "Reach thousands of coconut traders and processing mills instantly across Sri Lanka."
                : "දිවයින පුරා පොල් ගැනුම්කරුවන් සහ සැකසුම් මෝල් වෙත ඔබේ අවශ්‍යතාවය සෘජුව යොමු කරන්න."}
            </DialogDescription>
          </DialogHeader>

          {/* Mobile Preview switcher tab */}
          <div className="md:hidden flex bg-stone-100 p-1 rounded-xl mb-2 border border-stone-200">
            <button
              type="button"
              onClick={() => setPreviewTab("form")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                previewTab === "form" ? "bg-[#004236] text-white shadow-xs" : "text-stone-600"
              }`}
            >
              📝 Form
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("preview")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                previewTab === "preview" ? "bg-[#004236] text-white shadow-xs" : "text-stone-600"
              }`}
            >
              <Eye size={12} className="inline mr-1" /> {t("live_preview_title")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-2">
            {/* Form Column */}
            <form
              onSubmit={handleCreateSubmit}
              className={`md:col-span-7 space-y-3.5 text-sm ${
                previewTab === "preview" ? "hidden md:block" : "block"
              }`}
            >
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {t("buyer") === "Buyer" ? "Trade Type" : "වෙළඳ වර්ගය"}
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-[#F9FAF8] text-stone-800 font-bold text-xs focus:ring-2 focus:ring-[#004236]"
                  >
                    <option value="supplier">🌱 {t("supplier")}</option>
                    <option value="buyer">🛒 {t("buyer")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {t("filter_category")}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-[#F9FAF8] text-stone-800 font-bold text-xs focus:ring-2 focus:ring-[#004236]"
                  >
                    {marketCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {t(c.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  {t("buyer") === "Buyer" ? "Your Business Name" : "ඔබගේ හෝ ව්‍යාපාරයේ නම"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silva Agro Traders / සිල්වා වෙළඳුන්"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-[#F9FAF8] text-stone-800 text-xs focus:ring-2 focus:ring-[#004236]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {t("filter_district")}
                  </label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-[#F9FAF8] text-stone-800 font-bold text-xs focus:ring-2 focus:ring-[#004236]"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">
                    {t("quantity")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10,000 nuts / week"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-[#F9FAF8] text-stone-800 text-xs focus:ring-2 focus:ring-[#004236]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block flex items-center justify-between">
                  <span>{t("buyer") === "Buyer" ? "Phone Number" : "දුරකථන අංකය"}</span>
                  <span className="text-[10px] text-amber-700 font-bold">
                    🔒 {t("buyer") === "Buyer" ? "Protected by Paywall" : "ආරක්ෂිතයි"}
                  </span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 077 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-[#F9FAF8] text-stone-800 text-xs focus:ring-2 focus:ring-[#004236]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  {t("notes")}
                </label>
                <textarea
                  rows={2}
                  placeholder="Specifications, pickup terms, grade requirements..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-[#F9FAF8] text-stone-800 text-xs focus:ring-2 focus:ring-[#004236]"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full font-black h-11 rounded-xl shadow-md bg-[#FFCE00] hover:bg-[#E6B800] text-stone-900 border-none transition-transform hover:scale-[1.01]"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : t("buyer") === "Buyer" ? (
                    "Publish Listing Now"
                  ) : (
                    "දැන්වීම පළ කරන්න"
                  )}
                </Button>
              </DialogFooter>
            </form>

            {/* Live Card Preview Column */}
            <div
              className={`md:col-span-5 flex flex-col justify-between bg-[#E8F1EC] p-4 rounded-2xl border border-stone-300 ${
                previewTab === "form" ? "hidden md:flex" : "flex"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#004236] flex items-center gap-1">
                    <Eye size={12} /> {t("live_preview_title")}
                  </span>
                  <span className="text-[10px] bg-[#004236] text-white px-2 py-0.5 rounded-full font-bold">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 mb-3">
                  {t("live_preview_hint")}
                </p>

                {/* Simulated Preview Card */}
                <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        form.type === "buyer"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {form.type === "buyer" ? `🛒 ${t("buyer")}` : `🌱 ${t("supplier")}`}
                    </span>
                    <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                      📍 {form.district}
                    </span>
                  </div>

                  <div className="font-display font-black text-sm text-[#004236] line-clamp-1">
                    {form.name || "Your Business Name"}
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-xs bg-[#F9FAF8] p-2 rounded-xl border border-stone-200">
                    {getCategoryIcon(form.category)}
                    <span className="font-numeric font-black text-[#004236]">
                      {form.quantity || "Quantity / Volume"}
                    </span>
                  </div>

                  {form.notes && (
                    <div className="mt-2 text-[11px] text-stone-500 line-clamp-2">
                      {form.notes}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-dashed border-stone-200">
                    <div className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#F2F7F4] text-[#004236] flex items-center justify-between border border-[#BBD4C4]">
                      <span className="flex items-center gap-1.5 font-numeric text-xs font-black">
                        <Phone size={12} className="text-emerald-700" />
                        {form.phone || "+94 7X XXX XXXX"}
                      </span>
                      <span className="text-[11px] font-bold bg-[#004236] text-white px-2.5 py-0.5 rounded-lg">
                        Direct Call & WhatsApp
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-stone-500 text-center font-medium">
                🛡️ Verified by CoconutHub Sri Lanka
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketPage;


import React, { useEffect, useState, useMemo } from "react";
import { mills as fallbackMills, millCategories, districts } from "@/data/mockData";
import { millsApi } from "@/api/client";
import { useLanguage } from "@/context/LanguageContext";
import { MILLS } from "@/constants/testIds";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Phone,
  Loader2,
  Search,
  Factory,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  Navigation,
  Home,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const MillCard = ({ m, index }) => {
  const { t, lang } = useLanguage();
  const cleanPhone = m.phone ? m.phone.replace(/[^0-9+]/g, "") : "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${m.name} ${m.address || ""} ${m.district} Sri Lanka`
  )}`;

  return (
    <div
      className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md hover:border-[#004236] transition-all duration-200 flex flex-col justify-between"
      style={{ animationDelay: `${index * 30}ms` }}
      data-testid={MILLS.card(m.id)}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {m.verified ? (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300"
                data-testid={MILLS.verifiedBadge(m.id)}
              >
                <CheckCircle2 size={12} strokeWidth={2.5} />
                {t("verified")}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-500 border border-stone-200"
                data-testid={MILLS.verifiedBadge(m.id)}
              >
                {t("unverified")}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-black text-[#004236] bg-[#E8F1EC] px-2 py-0.5 rounded border border-[#BBD4C4]">
              {t(millCategories.find((c) => c.id === m.category)?.labelKey) || m.category}
            </span>
          </div>
        </div>

        <div className="font-display text-lg font-black text-[#004236] leading-snug">
          {m.name}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium mt-1.5">
          <MapPin size={13} className="text-emerald-700 shrink-0" />
          <span className="font-bold text-stone-800">{m.district}</span>
          {m.address && <span className="text-stone-500">· {m.address}</span>}
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
        <span className="font-numeric font-bold text-sm text-[#004236]">
          {m.phone}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Google Maps link */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-xs font-bold bg-stone-100 text-stone-700 hover:text-[#004236] hover:bg-stone-200 transition-colors border border-stone-200 shadow-xs"
            title={t("view_map")}
          >
            <Navigation size={13} />
          </a>

          {/* WhatsApp direct chat */}
          {cleanPhone && (
            <a
              href={`https://wa.me/${cleanPhone.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-300 shadow-xs"
              title={t("whatsapp_chat")}
            >
              <MessageSquare size={13} />
            </a>
          )}

          {/* Direct call button */}
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#004236] hover:bg-[#002D24] text-white shadow-xs transition-all"
            data-testid={MILLS.callBtn(m.id)}
          >
            <Phone size={12} className="text-[#FFCE00]" /> {t("call_now")}
          </a>
        </div>
      </div>
    </div>
  );
};

export const MillsPage = () => {
  const { t, lang } = useLanguage();
  const [cat, setCat] = useState("all");
  const [dist, setDist] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [millsList, setMillsList] = useState(fallbackMills);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    millsApi
      .getMills(cat, dist)
      .then((data) => {
        if (active && data) setMillsList(data);
      })
      .catch(() => {
        if (active) {
          const filtered = fallbackMills
            .filter((m) => (cat === "all" ? true : m.category === cat))
            .filter((m) => (dist === "all" ? true : m.district === dist));
          setMillsList(filtered);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cat, dist]);

  const filteredMills = useMemo(() => {
    if (!searchQuery.trim()) return millsList;
    const q = searchQuery.toLowerCase();
    return millsList.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.district?.toLowerCase().includes(q) ||
        m.address?.toLowerCase().includes(q)
    );
  }, [millsList, searchQuery]);

  const resetAll = () => {
    setCat("all");
    setDist("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500">
        <Link to="/" className="text-stone-600 hover:text-[#004236] flex items-center gap-1">
          <Home size={14} className="text-[#004236]" />
          <span>Home</span>
        </Link>
        <ChevronRight size={12} className="text-stone-400" />
        <span className="text-[#004236] font-bold">
          Processing Mills Directory
        </span>
      </nav>

      {/* Header Banner in CoconutHub Sage Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#E8F1EC] p-6 rounded-2xl border border-[#D0E2D6] shadow-xs text-[#004236]">
        <div>
          <div className="flex items-center gap-2">
            <span className="ch-badge">
              DIRECTORY
            </span>
            <span className="bg-white text-[#004236] text-xs px-2.5 py-0.5 rounded-full font-numeric font-bold border border-[#BBD4C4]">
              {filteredMills.length} {t("buyer") === "Buyer" ? "Verified Mills" : "සත්‍යාපිත මෝල්"}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#004236] uppercase mt-2">
            {t("mills_title")}
          </h1>
          <p className="text-xs sm:text-sm text-[#1E3E34] mt-1 font-medium max-w-xl">
            {t("mills_subtitle")} · Central Coconut Development Authority (CDA) Accredited Processing Infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#004236] bg-white border border-[#BBD4C4] px-4 py-2.5 rounded-xl font-bold self-start sm:self-auto shadow-xs">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>CDA Accredited Sourcing</span>
        </div>
      </div>

      {/* Search & District Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              t("buyer") === "Buyer"
                ? "Search mills by business name, district, location..."
                : "මෝලේ නම හෝ ස්ථානය අනුව සොයන්න..."
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

        <div>
          <Select value={dist} onValueChange={setDist}>
            <SelectTrigger
              className="w-full h-10 rounded-xl bg-white border border-stone-200 font-bold text-xs text-[#1E293B] shadow-xs"
              data-testid={MILLS.filterDistrict}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-stone-200 text-[#1E293B]">
              <SelectItem value="all">📍 {t("filter_district")}: {t("filter_all")}</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          <button
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
              cat === "all"
                ? "bg-[#004236] text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
            }`}
            onClick={() => setCat("all")}
            data-testid={MILLS.filterCategory("all")}
          >
            {t("filter_all")}
          </button>
          {millCategories.map((c) => (
            <button
              key={c.id}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                cat === c.id
                  ? "bg-[#004236] text-white shadow-xs"
                  : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
              }`}
              onClick={() => setCat(c.id)}
              data-testid={MILLS.filterCategory(c.id)}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>

        {(cat !== "all" || dist !== "all" || searchQuery) && (
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004236] bg-[#E8F1EC] hover:bg-[#D4E6DA] px-3 py-1 rounded-lg transition-colors whitespace-nowrap border border-[#BBD4C4]"
          >
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>

      {/* Mills Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-2xl border border-stone-200">
            <Loader2 className="animate-spin text-[#004236]" size={36} />
          </div>
        ) : filteredMills.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300 p-6">
            <Factory className="mx-auto text-stone-400 mb-2.5" size={40} />
            <div className="font-bold text-stone-800 text-base">{t("empty_state")}</div>
            <Button onClick={resetAll} variant="outline" className="mt-4 rounded-lg text-xs font-bold border-stone-300 text-stone-700 hover:bg-stone-50">
              <RotateCcw size={13} className="mr-1.5" />
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMills.map((m, i) => (
              <MillCard key={m.id} m={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

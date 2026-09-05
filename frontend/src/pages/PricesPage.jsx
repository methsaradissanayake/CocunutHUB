import React, { useEffect, useState, useMemo } from "react";
import {
  commodities as fallbackCommodities,
  coconutTrend as fallbackTrend,
  listings as mockListings,
  mills as mockMills
} from "@/data/mockData";
import { pricesApi, millsApi, listingsApi } from "@/api/client";
import { useLanguage } from "@/context/LanguageContext";
import { PRICES } from "@/constants/testIds";
import { Link } from "react-router-dom";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  TrendingUp,
  Droplets,
  Layers,
  CircleDot,
  Flame,
  Activity,
  ChevronRight,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Building2,
  Store,
  PlusCircle,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Award,
  CheckCircle2,
  Users,
  Code2
} from "lucide-react";

const formatPrice = (n) =>
  Number(n).toLocaleString("en-LK", {
    minimumFractionDigits: n < 1000 ? 2 : 0,
    maximumFractionDigits: 2,
  });

const getCommodityIcon = (id) => {
  switch (id?.toLowerCase()) {
    case "coconut_oil":
      return <Droplets size={20} className="text-amber-500" />;
    case "coir_fiber":
      return <Layers size={20} className="text-emerald-700" />;
    case "coconut_husk":
      return <CircleDot size={20} className="text-yellow-600" />;
    case "coconut_shell":
      return <Flame size={20} className="text-stone-600" />;
    default:
      return <Activity size={20} className="text-emerald-600" />;
  }
};

const getCommodityGradient = (id) => {
  switch (id?.toLowerCase()) {
    case "coconut_oil":
      return { stroke: "#D97706", fill: "#FEF3C7" };
    case "coir_fiber":
      return { stroke: "#059669", fill: "#D1FAE5" };
    case "coconut_husk":
      return { stroke: "#CA8A04", fill: "#FEF9C3" };
    case "coconut_shell":
      return { stroke: "#57534E", fill: "#F5F5F4" };
    default:
      return { stroke: "#004236", fill: "#E8F1EC" };
  }
};

const getTrendForCommodity = (commodity, baseTrend) => {
  if (!commodity || commodity.id === "coconut") return baseTrend;
  const curPrice = commodity.price;
  const factor = curPrice / 118.5;
  return baseTrend.map((pt) => ({
    week: pt.week,
    price: Number((pt.price * factor).toFixed(2)),
  }));
};

const PriceCard = ({ c, isSelected, onSelect, index }) => {
  const { t, lang } = useLanguage();
  const up = c.change >= 0;

  return (
    <div
      onClick={() => onSelect(c)}
      className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none ${
        isSelected
          ? "bg-white border-[#004236] ring-2 ring-[#004236]/20 shadow-md scale-[1.02]"
          : "bg-white border-stone-200/90 hover:border-[#004236]/50 hover:shadow-sm shadow-2xs"
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
      data-testid={PRICES.card(c.id)}
    >
      <div>
        <div className="flex items-start justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-2.5 rounded-xl transition-all ${
                isSelected
                  ? "bg-[#E8F1EC] text-[#004236] border border-[#BBD4C4]"
                  : "bg-stone-50 text-stone-700 border border-stone-200"
              }`}
            >
              {getCommodityIcon(c.id)}
            </span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#004236] block">
                {t(c.nameKey) || c.nameKey}
              </span>
              <span className="text-[10.5px] text-stone-500 font-bold block">
                {t(c.unitKey) || c.unitKey}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-xs font-black text-amber-600 font-numeric">{c.currency}</span>
          <span className="text-xl sm:text-2xl font-black font-numeric tracking-tight text-[#004236]">
            {formatPrice(c.price)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-full ${
            up
              ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
              : "text-rose-800 bg-rose-50 border border-rose-200"
          }`}
        >
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(c.change).toFixed(1)}%
        </span>

        <span className="text-[10px] font-bold text-stone-400">
          {isSelected ? (lang === "si" ? "● තෝරා ඇත" : "● Selected") : (lang === "si" ? "බලන්න" : "Click to view")}
        </span>
      </div>
    </div>
  );
};

export const PricesPage = () => {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState(fallbackCommodities);
  const [trendBase, setTrendBase] = useState(fallbackTrend);
  const [selectedCommodity, setSelectedCommodity] = useState(fallbackCommodities[0]);
  const [timeframe, setTimeframe] = useState(8);
  const [loading, setLoading] = useState(false);
  const [cdaAlert, setCdaAlert] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");
  const [showApiInspector, setShowApiInspector] = useState(false);
  const [liveMills, setLiveMills] = useState(mockMills);
  const [liveListings, setLiveListings] = useState(mockListings);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertRes, tRes, millsRes, listingsRes] = await Promise.allSettled([
        pricesApi.getCdaAlert(),
        pricesApi.getTrend("coconut", 8),
        millsApi.getMills(),
        listingsApi.getListings(),
      ]);
      if (alertRes.status === "fulfilled" && alertRes.value && alertRes.value.success) {
        const data = alertRes.value;
        setCdaAlert(data);
        if (data.commodities && data.commodities.length > 0) {
          setItems(data.commodities);
          const match = data.commodities.find((x) => x.id === selectedCommodity.id);
          if (match) setSelectedCommodity(match);
        }
      }
      if (tRes.status === "fulfilled" && tRes.value && tRes.value.length > 0) {
        setTrendBase(tRes.value);
      }
      if (millsRes.status === "fulfilled" && Array.isArray(millsRes.value) && millsRes.value.length > 0) {
        setLiveMills(millsRes.value);
      }
      if (listingsRes.status === "fulfilled" && Array.isArray(listingsRes.value) && listingsRes.value.length > 0) {
        setLiveListings(listingsRes.value);
      }
    } catch {
      // Fallback seamlessly
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCda = async () => {
    setSyncing(true);
    setSyncNotice("");
    try {
      const res = await pricesApi.syncCda();
      if (res && res.success) {
        setCdaAlert(res);
        if (res.commodities && res.commodities.length > 0) {
          setItems(res.commodities);
          const match = res.commodities.find((x) => x.id === selectedCommodity.id);
          if (match) setSelectedCommodity(match);
        }
        setSyncNotice(
          lang === "si"
            ? "ශ්‍රී ලංකා පොල් සංවර්ධන අධිකාරිය (CDA) සජීවී මිල සාර්ථකව ලබා ගන්නා ලදී!"
            : "Successfully synced latest auction rates from Coconut Development Authority (CDA) API!"
        );
        setTimeout(() => setSyncNotice(""), 4000);
      }
    } catch (e) {
      console.warn("CDA sync error:", e);
      setSyncNotice(
        lang === "si"
          ? "CDA සේවාදායකය හා සම්බන්ධ වීමට නොහැකි විය. පවතින දත්ත භාවිතා කෙරේ."
          : "CDA service offline. Showing cached benchmark prices."
      );
      setTimeout(() => setSyncNotice(""), 4000);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fullTrend = useMemo(() => {
    return getTrendForCommodity(selectedCommodity, trendBase);
  }, [selectedCommodity, trendBase]);

  const trendData = useMemo(() => {
    if (timeframe === 2) return fullTrend.slice(-2);
    if (timeframe === 4) return fullTrend.slice(-4);
    return fullTrend.slice(-8);
  }, [fullTrend, timeframe]);

  const growth = useMemo(() => {
    if (!trendData || trendData.length < 2) return "0.0";
    const start = trendData[0].price;
    const end = trendData[trendData.length - 1].price;
    if (!start) return "0.0";
    return (((end - start) / start) * 100).toFixed(1);
  }, [trendData]);

  const colors = useMemo(() => {
    return getCommodityGradient(selectedCommodity?.id);
  }, [selectedCommodity]);

  const activeDistrictsList = useMemo(() => {
    const set = new Set();
    if (cdaAlert?.districtPrices && cdaAlert.districtPrices.length > 0) {
      cdaAlert.districtPrices.forEach((d) => set.add(d.district));
    }
    liveMills.forEach((m) => { if (m.district) set.add(m.district); });
    liveListings.forEach((l) => { if (l.district) set.add(l.district); });
    if (set.size === 0) {
      return [
        "Kurunegala", "Puttalam", "Gampaha", "Colombo", "Kalutara",
        "Galle", "Matara", "Hambantota", "Matale", "Kandy",
        "Kegalle", "Ratnapura", "Anuradhapura", "Polonnaruwa"
      ];
    }
    return Array.from(set);
  }, [cdaAlert, liveMills, liveListings]);

  const verifiedMillsCount = useMemo(() => {
    return liveMills.filter((m) => m.verified).length;
  }, [liveMills]);

  const liveWeeklyChange = useMemo(() => {
    const nut = items.find((x) => x.id === "coconut");
    return nut ? nut.change : 1.18;
  }, [items]);

  // Top featured listings
  const featuredListings = useMemo(() => liveListings.slice(0, 3), [liveListings]);
  // Top verified mills
  const featuredMills = useMemo(() => liveMills.filter((m) => m.verified).slice(0, 3), [liveMills]);

  return (
    <div className="space-y-10" data-testid={PRICES.page}>

      {/* ═══════════════════════════════════════════════════
          1. HERO DASHBOARD BANNER
      ═══════════════════════════════════════════════════ */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#00362C] via-[#004236] to-[#08291F] text-white p-6 sm:p-10 shadow-xl border border-white/10">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFCE00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck size={14} className="text-[#FFCE00]" />
            <span>
              {lang === "si"
                ? "ශ්‍රී ලංකා පොල් සංවර්ධන අධිකාරිය (CDA) නිල දත්ත පද්ධතිය"
                : "Official CDA Coconut Market Intelligence Network"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display text-white leading-tight">
            {lang === "si" ? (
              <>ශ්‍රී ලංකාවේ ප්‍රමුඛතම <span className="text-[#FFCE00]">පොල් වෙළඳපොල</span> සහ කර්මාන්ත ද්වාරය</>
            ) : (
              <>Sri Lanka's Premier <span className="text-[#FFCE00]">Coconut Market</span> & Industry Hub</>
            )}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-stone-200 font-medium max-w-2xl leading-relaxed">
            {lang === "si"
              ? "දෛනික වෙන්දේසි මිල ගණන්, දිවයින පුරා ලියාපදිංචි පොල් මෝල්, සෘජු වෙළඳ ගනුදෙනු සහ සාකච්ඡා — සියල්ල එකම තැනකින්."
              : "Real-time CDA auction prices, island-wide verified mills directory, direct B2B trading, and live market intelligence — connecting growers with buyers."}
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/market"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#FFCE00] hover:bg-[#E5B800] text-[#004236] shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 uppercase tracking-wider"
            >
              <Store size={15} />
              <span>{lang === "si" ? "වෙළඳ දැන්වීම් බලන්න" : "Explore Marketplace"}</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/mills"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:-translate-y-0.5 uppercase tracking-wider backdrop-blur-md"
            >
              <Building2 size={15} className="text-amber-300" />
              <span>{lang === "si" ? "පොල් මෝල් නාමාවලිය" : "Find Certified Mills"}</span>
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-200 hover:text-white transition-colors"
            >
              <MessageSquare size={15} className="text-emerald-400" />
              <span>{lang === "si" ? "සජීවී කතාබහ" : "Live Trader Chat"}</span>
            </Link>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/15">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
              {lang === "si" ? "ගෙඩි පොල් සාමාන්‍ය" : "Fresh Nut Benchmark"}
            </div>
            <div className="text-lg sm:text-xl font-black text-[#FFCE00] font-numeric mt-0.5">
              Rs. {cdaAlert?.auctionLot?.weightedAveragePrice
                ? cdaAlert.auctionLot.weightedAveragePrice.toFixed(2)
                : (items.find((x) => x.id === "coconut")?.price
                    ? Number(items.find((x) => x.id === "coconut").price).toFixed(2)
                    : "117.58")}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
              {lang === "si" ? "සතිපතා වර්ධනය" : "Weekly Trend"}
            </div>
            <div className={`text-lg sm:text-xl font-black font-numeric mt-0.5 flex items-center gap-1 ${
              Number(liveWeeklyChange) >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}>
              {Number(liveWeeklyChange) >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              {Number(liveWeeklyChange) >= 0 ? `+${Number(liveWeeklyChange).toFixed(1)}%` : `${Number(liveWeeklyChange).toFixed(1)}%`}
            </div>
          </div>
          <Link
            to="/mills"
            className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 block hover:bg-white/15 transition-all group"
            title="View certified mills"
          >
            <div className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === "si" ? "ලියාපදිංචි මෝල්" : "Verified Mills"}</span>
              <ArrowRight size={13} className="text-[#FFCE00] opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-numeric mt-0.5 flex items-baseline gap-1.5">
              <span>{verifiedMillsCount > 0 ? verifiedMillsCount : (liveMills.length > 0 ? liveMills.length : 12)}</span>
              <span className="text-xs font-semibold text-stone-300">
                {lang === "si" ? "මෝල්" : "Mills"}
              </span>
            </div>
          </Link>
          <div
            onClick={() => {
              const el = document.getElementById("regional-district-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 cursor-pointer hover:bg-white/15 transition-all group"
            title="Click to view district price intelligence"
          >
            <div className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === "si" ? "ක්‍රියාකාරී දිස්ත්‍රික්ක" : "Active Districts"}</span>
              <ArrowDownRight size={13} className="text-[#FFCE00] opacity-75 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
            </div>
            <div className="text-lg sm:text-xl font-black text-[#FFCE00] font-numeric mt-0.5 flex items-baseline gap-1.5">
              <span>{activeDistrictsList.length}</span>
              <span className="text-xs font-semibold text-white">
                {lang === "si" ? "දිස්ත්‍රික්ක" : "Districts"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          2. CDA LIVE COMMODITY RATES & INTERACTIVE ANALYTICS
      ═══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        {/* Sync feedback notice */}
        {syncNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
              Verified
            </span>
          </div>
        )}

        {/* CDA Official Price Alert Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#004236] text-white shadow-md border border-[#FFCE00]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFCE00] text-[#004236]">
                <ShieldCheck size={12} />
                Official CDA Price Alert
              </span>
              <span className="text-xs font-mono text-amber-200 font-bold">
                {cdaAlert?.bulletinNumber || "CDA/PUB/2026-09-03"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live CDA Feed
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white font-display">
              {lang === "si" ? "කොළඹ නැවුම් පොල් වෙන්දේසි වාර්තාව" : "Colombo Fresh Coconut Auction Bulletin"}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-200">
              <span>{cdaAlert?.message || "Official CDA Fresh Coconut Auction & Daily Market Price Alert verified."}</span>
              <a
                href={cdaAlert?.sourceUrl || "https://www.cda.gov.lk/web/index.php?option=com_content&view=article&id=22&Itemid=135&lang=en"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#FFCE00] hover:text-amber-200 underline font-bold"
                title="Verify directly on the official Sri Lanka Coconut Development Authority portal"
              >
                <span>Verify on cda.gov.lk</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowApiInspector(!showApiInspector)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
              title="Inspect raw JSON from /api/prices/cda-alert"
            >
              <Code2 size={13} className="text-[#FFCE00]" />
              <span>{showApiInspector ? "Hide API Data" : "Inspect API JSON"}</span>
            </button>

            <button
              onClick={handleSyncCda}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-[#004236] bg-[#FFCE00] hover:bg-[#E5B800] transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
              title="Fetch live rates directly from Coconut Development Authority API"
            >
              <RefreshCw size={13} className={syncing ? "animate-spin text-[#004236]" : "text-[#004236]"} />
              <span>{syncing ? (lang === "si" ? "CDA දත්ත ලබා ගනිමින්..." : "Syncing CDA API...") : (lang === "si" ? "සජීවී CDA යාවත්කාලීන" : "Sync CDA Live API")}</span>
            </button>
          </div>
        </div>

        {/* Live Raw API JSON Inspector */}
        {showApiInspector && (
          <div className="rounded-2xl p-4 bg-stone-900 text-stone-100 border border-stone-700 shadow-inner font-mono text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Code2 size={14} /> GET /api/prices/cda-alert & POST /api/prices/sync-cda (Live Response)
              </span>
              <span className="text-[10px] text-stone-400">
                Source: {cdaAlert?.sourceUrl || "cda.gov.lk"}
              </span>
            </div>
            <pre className="overflow-x-auto max-h-64 p-2 bg-black/40 rounded-lg text-emerald-400 text-[11px] leading-relaxed">
              {JSON.stringify(cdaAlert || { status: "Fetching live CDA endpoint..." }, null, 2)}
            </pre>
          </div>
        )}

        {/* CDA Auction Lot Breakdown */}
        {cdaAlert?.auctionLot && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs">
            <div className="p-2">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {lang === "si" ? "වෙන්දේසි අංකය" : "Auction Reference"}
              </span>
              <span className="text-sm font-black text-[#004236] font-mono">
                {cdaAlert.auctionLot.auctionNumber}
              </span>
              {cdaAlert.auctionLot.nextAuctionDate && (
                <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                  Next: {cdaAlert.auctionLot.nextAuctionDate}
                </span>
              )}
            </div>
            <div className="p-2">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {lang === "si" ? "විකිණූ ගෙඩි ප්‍රමාණය" : "Nuts Cleared / Offered"}
              </span>
              <span className="text-sm font-black text-[#004236]">
                {cdaAlert.auctionLot.nutsSold.toLocaleString()} ({cdaAlert.auctionLot.clearanceRate}%)
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                of {cdaAlert.auctionLot.nutsOffered.toLocaleString()} offered
              </span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {lang === "si" ? "වෙන්දේසි පරාසය (High / Low)" : "Price Spread (High / Low)"}
              </span>
              <span className="text-sm font-black text-[#004236] font-numeric">
                Rs. {cdaAlert.auctionLot.highPrice.toFixed(2)} - {cdaAlert.auctionLot.lowPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                per fresh nut
              </span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {lang === "si" ? "භාරිත සාමාන්‍යය" : "Weighted Avg Benchmark"}
              </span>
              <span className="text-sm font-black text-[#004236] font-numeric">
                Rs. {cdaAlert.auctionLot.weightedAveragePrice.toFixed(2)} / nut
              </span>
              <span className="text-[10px] text-emerald-700 font-black block mt-0.5">
                Official Colombo Rate
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-b border-stone-200">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#004236] uppercase font-display">
              {t("prices_title") || "Daily Commodity Prices"}
            </h2>
            <span className="text-xs font-semibold text-stone-500">
              {lang === "si" ? "සියලු මිල ගණන් CDA තහවුරු කළ දෛනික අගයන් වේ" : "Official CDA Verified Spot Market Rates"}
            </span>
          </div>

          <span className="text-xs font-bold text-stone-400">
            {cdaAlert?.lastSyncedAt ? `${lang === "si" ? "අවසන් වරට යාවත්කාලීන විය: " : "Last synced: "} ${new Date(cdaAlert.lastSyncedAt).toLocaleTimeString()}` : ""}
          </span>
        </div>

        {/* Price Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {items.map((c, i) => (
            <PriceCard
              key={c.id}
              c={c}
              isSelected={selectedCommodity.id === c.id}
              onSelect={setSelectedCommodity}
              index={i}
            />
          ))}
        </div>

        {/* Interactive Price Trend Chart */}
        <div className="rounded-2xl p-5 sm:p-6 bg-white border border-stone-200/90 shadow-sm" data-testid={PRICES.chart}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  MARKET TREND
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full ${
                    Number(growth) >= 0
                      ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                      : "text-rose-800 bg-rose-50 border border-rose-200"
                  }`}
                >
                  <TrendingUp size={12} /> {Number(growth) >= 0 ? `+${growth}%` : `${growth}%`} ({timeframe}W)
                </span>
              </div>

              <div className="font-display text-xl sm:text-2xl font-black text-[#004236] mt-2 flex items-baseline gap-2">
                <span>{t(selectedCommodity.nameKey) || selectedCommodity.nameKey}</span>
                <span className="text-xs sm:text-sm font-bold text-stone-500">
                  ({t(selectedCommodity.unitKey) || selectedCommodity.unitKey})
                </span>
              </div>
            </div>

            {/* Timeframe Switcher */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 self-start sm:self-auto">
              {[2, 4, 8].map((w) => (
                <button
                  key={w}
                  onClick={() => setTimeframe(w)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    timeframe === w
                      ? "bg-[#004236] text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {w === 2 ? t("timeframe_2w") : w === 4 ? t("timeframe_4w") : t("timeframe_8w")}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-60 sm:h-72 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="chChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={colors.stroke} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12, fill: "#475569", fontWeight: 700 }}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#475569", fontWeight: 700 }}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={false}
                  width={55}
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#004236",
                    borderColor: "#002D24",
                    borderRadius: "10px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                  itemStyle={{ color: "#FFCE00" }}
                  formatter={(val) => [`Rs. ${formatPrice(val)}`, "CDA Average"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={colors.stroke}
                  strokeWidth={3}
                  fill="url(#chChartGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={colors.stroke}
                  strokeWidth={3}
                  dot={{ r: 4, fill: colors.stroke, stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional District Farmgate Price Intelligence Table/Grid */}
        {cdaAlert?.districtPrices && cdaAlert.districtPrices.length > 0 && (
          <div id="regional-district-section" className="rounded-2xl p-5 sm:p-6 bg-white border border-stone-200/90 shadow-sm space-y-4 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#004236] text-[#FFCE00]">
                    CDA Regional Intelligence
                  </span>
                  <span className="text-xs text-stone-400 font-bold">
                    {lang === "si" ? `සජීවී දිස්ත්‍රික් ${cdaAlert.districtPrices.length} දත්ත` : `Live ${cdaAlert.districtPrices.length} Districts`}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#004236] font-display mt-1">
                  {lang === "si"
                    ? "පොල් ත්‍රිකෝණය සහ ප්‍රධාන දිස්ත්‍රික්ක අනුව ගොවිපල දොරටුව මිල (Farmgate)"
                    : "Coconut Triangle & Regional Farmgate Price Breakdown"}
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                {lang === "si" ? "මිල ගණන් එක් ගෙඩියකට රුපියල් වලින්" : "Farmgate rates in LKR per fresh nut"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {cdaAlert.districtPrices.map((dist, idx) => {
                const isTriangle = ["Kurunegala", "Puttalam", "Gampaha"].includes(dist.district);
                const isUp = dist.change >= 0;
                return (
                  <div
                    key={dist.district}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isTriangle
                        ? "bg-[#F4F9F6] border-[#BBD4C4] hover:border-[#004236]"
                        : "bg-stone-50 border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-[#004236] tracking-tight">
                        {dist.district}
                      </span>
                      {isTriangle && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#004236] text-[#FFCE00]" title="Coconut Triangle Core Zone">
                          Core
                        </span>
                      )}
                    </div>

                    <div className="text-lg font-black text-[#004236] font-numeric mt-1">
                      <span className="text-xs font-bold text-amber-600 mr-0.5">Rs.</span>
                      {Number(dist.farmgatePrice).toFixed(2)}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/50">
                      <span
                        className={`inline-flex items-center text-[10.5px] font-black ${
                          isUp ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(dist.change).toFixed(1)}%
                      </span>

                      <span className="text-[9.5px] font-bold text-stone-500">
                        {dist.supplyLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          3. FOUR CORE COCONUTHUB PILLARS
      ═══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#004236] uppercase font-display">
              {lang === "si" ? "ප්‍රධාන සේවාවන්" : "Core Platform Pillars"}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {lang === "si"
                ? "පොල් වගාකරුවන් සහ ව්‍යාපාරිකයන් සඳහා වූ විශේෂාංග"
                : "Dedicated tools empowering Sri Lankan coconut growers, processors, and buyers"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Price Intelligence */}
          <Link
            to="/"
            className="group p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#004236] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-black text-sm text-[#004236] mb-1">
                {lang === "si" ? "දෛනික මිල විශ්ලේෂණ" : "Price Intelligence"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === "si"
                  ? "CDA නිල වෙන්දේසි මිල ගණන් සහ ඓතිහාසික ප්‍රවණතා විශ්ලේෂණය."
                  : "Verified CDA auction trends, district comparisons, and weekly rate volatility."}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-black text-[#004236] group-hover:text-emerald-700">
              <span>{lang === "si" ? "මිල ගණන් බලන්න" : "View CDA Rates"}</span>
              <ChevronRight size={14} />
            </div>
          </Link>

          {/* Pillar 2: Mills Directory */}
          <Link
            to="/mills"
            className="group p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#004236] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building2 size={20} />
              </div>
              <h3 className="font-black text-sm text-[#004236] mb-1">
                {lang === "si" ? "පොල් මෝල් නාමාවලිය" : "Certified Mills Directory"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === "si"
                  ? "දිවයින පුරා ලියාපදිංචි තෙල්, කොහු සහ කොප්පරා මෝල් සෘජුව සම්බන්ධ කරගන්න."
                  : "Access 120+ verified copra, oil, and coir processing mills across Sri Lanka."}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-black text-[#004236] group-hover:text-emerald-700">
              <span>{lang === "si" ? "මෝල් සොයන්න" : "Browse Mills"}</span>
              <ChevronRight size={14} />
            </div>
          </Link>

          {/* Pillar 3: B2B Marketplace */}
          <Link
            to="/market"
            className="group p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#004236] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Store size={20} />
              </div>
              <h3 className="font-black text-sm text-[#004236] mb-1">
                {lang === "si" ? "තොග වෙළඳපොල" : "B2B Trade Marketplace"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === "si"
                  ? "ගෙඩි පොල්, තෙල්, ලෙලි සහ කටු තොග වශයෙන් මිලදී ගැනීමට සහ විකිණීමට."
                  : "Buy and sell fresh coconuts, husk, copra, and fiber directly with estates."}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-black text-[#004236] group-hover:text-emerald-700">
              <span>{lang === "si" ? "දැන්වීම් බලන්න" : "Explore Market"}</span>
              <ChevronRight size={14} />
            </div>
          </Link>

          {/* Pillar 4: Live Trade Chat */}
          <Link
            to="/chat"
            className="group p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#004236] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-black text-sm text-[#004236] mb-1">
                {lang === "si" ? "වෙළෙඳ සාකච්ඡා" : "Live Trader Chat"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === "si"
                  ? "වගාකරුවන්, ගැනුම්කරුවන් සහ මෝල් හිමියන් සමඟ සජීවීව සාකච්ඡා කරන්න."
                  : "Discuss deal volumes, pricing agreements, and transport logistics in real time."}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-black text-[#004236] group-hover:text-emerald-700">
              <span>{lang === "si" ? "කතාබහට එක්වන්න" : "Join Trade Chat"}</span>
              <ChevronRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          4. LIVE MARKETPLACE DEALS SNAPSHOT
      ═══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#004236] uppercase font-display">
              {lang === "si" ? "නවතම වෙළඳ දැන්වීම්" : "Featured Market Listings"}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {lang === "si"
                ? "සත්‍යාපිත වතු සහ ගැනුම්කරුවන්ගේ සජීවී ඇණවුම්"
                : "Live supply contracts and buyer requests from verified coconut estates"}
            </p>
          </div>

          <Link
            to="/market"
            className="inline-flex items-center gap-1 text-xs font-black text-[#004236] hover:text-[#0B8A5C] transition-colors"
          >
            <span>{lang === "si" ? "සියල්ල බලන්න" : "View All Listings"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredListings.map((listing) => {
            const isBuyer = listing.type === "buyer";
            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isBuyer
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {isBuyer ? (lang === "si" ? "ගැනුම් ඉල්ලීම" : "Buyer Request") : (lang === "si" ? "සැපයුම් පිරිනැමීම" : "Supply Offer")}
                    </span>
                    <span className="text-[11px] text-stone-400 font-bold flex items-center gap-1">
                      <Clock size={11} /> {listing.posted}
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-[#004236] mb-1">
                    {listing.name}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mb-3">
                    <MapPin size={12} className="text-stone-400" />
                    <span>{listing.district}</span>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100 text-xs font-semibold text-stone-700 mb-2">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">
                      {lang === "si" ? "ප්‍රමාණය" : "Volume / Quantity"}
                    </span>
                    <span className="text-[#004236] font-bold">{listing.quantity}</span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2">
                    {listing.notes}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <a
                    href={`tel:${listing.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-[#004236]"
                  >
                    <Phone size={13} className="text-emerald-600" />
                    <span>{listing.phone}</span>
                  </a>

                  <Link
                    to="/market"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black bg-[#E8F1EC] text-[#004236] hover:bg-[#D4E6DA] transition-all"
                  >
                    <span>{lang === "si" ? "විස්තර" : "Details"}</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          5. VERIFIED COCONUT MILLS SPOTLIGHT
      ═══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#004236] uppercase font-display">
              {lang === "si" ? "සත්‍යාපිත පොල් මෝල්" : "Verified Mills Spotlight"}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {lang === "si"
                ? "පොල් ත්‍රිකෝණය තුළ පිහිටි ප්‍රමුඛතම සැකසුම් මධ්‍යස්ථාන"
                : "Direct access to CDA-registered processors in Kurunegala, Puttalam & Gampaha"}
            </p>
          </div>

          <Link
            to="/mills"
            className="inline-flex items-center gap-1 text-xs font-black text-[#004236] hover:text-[#0B8A5C] transition-colors"
          >
            <span>{lang === "si" ? "සියලු මෝල් සොයන්න" : "Explore All Mills"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredMills.map((mill) => (
            <div
              key={mill.id}
              className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    {lang === "si" ? "සත්‍යාපිත මෝල" : "CDA Verified"}
                  </span>
                  <span className="text-xs font-bold text-stone-400">
                    {mill.district}
                  </span>
                </div>

                <h3 className="font-black text-sm text-[#004236] mb-1">
                  {mill.name}
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed mb-3">
                  {mill.category === "oil_mill"
                    ? (lang === "si" ? "පොල් තෙල් සහ කොප්පරා සැකසුම් පහසුකම්." : "White coconut oil & copra extraction processing.")
                    : mill.category === "coir_mill"
                    ? (lang === "si" ? "කොහු කෙඳි සහ පීට් අපනයන නිෂ්පාදන." : "Bristle fiber, mattress fiber & coco peat manufacturing.")
                    : (lang === "si" ? "වියළි පොල් හා නැවුම් ගෙඩි තොග බෙදාහැරීම." : "Desiccated coconut and fresh nuts bulk processing.")}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
                <a
                  href={`tel:${mill.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-[#004236]"
                >
                  <Phone size={13} className="text-emerald-600" />
                  <span>{mill.phone}</span>
                </a>

                <Link
                  to="/mills"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black bg-[#E8F1EC] text-[#004236] hover:bg-[#D4E6DA] transition-all"
                >
                  <span>{lang === "si" ? "සම්බන්ධ වන්න" : "Contact"}</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          6. COCONUT INDUSTRY KNOWLEDGE & SUSTAINABILITY HUB
      ═══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#004236] uppercase font-display">
              {lang === "si" ? "වගාකරුවන්ගේ දැනුම් කේන්ද්‍රය" : "Industry Insights & Best Practices"}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {lang === "si"
                ? "පොල් අස්වැන්න වැඩිකර ගැනීම සහ අපනයන ප්‍රමිතීන් පිළිබඳ තොරතුරු"
                : "Agricultural research, harvest management, and value-addition guidelines"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Guide 1: Maximizing Coconut Yield */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="p-5 space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                AGRONOMY
              </span>
              <h3 className="text-sm font-black text-[#004236] leading-snug">
                {lang === "si"
                  ? "පොල් අස්වැන්න 30% කින් වැඩිකර ගැනීමේ පොහොර ක්‍රමවේද"
                  : "Optimizing Coconut Palm Nutrition & Organic Moisture Conservation"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === "si"
                  ? "වියළි කලාපයේ තෙතමනය රඳවා ගැනීමට ලෙලි වළලා තැබීම සහ කාබනික පොහොර යෙදීමේ කාලසටහන."
                  : "Field-tested moisture conservation using coconut husk burial and systematic potassium fertilization."}
              </p>
            </div>
            <div className="px-5 pb-4 pt-1 flex items-center justify-between text-xs text-stone-400 font-bold border-t border-stone-50">
              <span>CDA Research Wing</span>
              <span className="text-[#004236] font-black flex items-center gap-0.5">
                5 min read <ChevronRight size={13} />
              </span>
            </div>
          </div>

          {/* Guide 2: Value Added Byproducts */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="p-5 space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                EXPORTS
              </span>
              <h3 className="text-sm font-black text-[#004236] leading-snug">
                {lang === "si"
                  ? "පොල් කටු අඟුරු සහ සක්‍රීය කාබන් අපනයන අවස්ථා"
                  : "Activated Carbon & Coir Peat Value Addition for Sri Lankan Estates"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === "si"
                  ? "පොල් කටු සහ කොහු අපතේ නොයවා අපනයන ආදායම දෙගුණ කරගත හැකි ආකාරය."
                  : "Transforming raw coconut shells and husks into high-margin export-grade activated carbon and coco peat."}
              </p>
            </div>
            <div className="px-5 pb-4 pt-1 flex items-center justify-between text-xs text-stone-400 font-bold border-t border-stone-50">
              <span>Export Development Board</span>
              <span className="text-[#004236] font-black flex items-center gap-0.5">
                4 min read <ChevronRight size={13} />
              </span>
            </div>
          </div>

          {/* Guide 3: CDA Quality Standards */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="p-5 space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                COMPLIANCE
              </span>
              <h3 className="text-sm font-black text-[#004236] leading-snug">
                {lang === "si"
                  ? "වර්ජින් පොල් තෙල් (VCO) සඳහා ශ්‍රී ලංකා ප්‍රමිති සහතික"
                  : "CDA Virgin Coconut Oil (VCO) Quality Benchmarks & Lab Testing"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {lang === "si"
                  ? "ජාත්‍යන්තර වෙළඳපල සඳහා පොල් තෙල් අපනයනය කිරීමේදී අවශ්‍ය තත්ත්ව සහතික ලබාගැනීම."
                  : "Free fatty acid (FFA) thresholds, moisture percentages, and international food safety certifications."}
              </p>
            </div>
            <div className="px-5 pb-4 pt-1 flex items-center justify-between text-xs text-stone-400 font-bold border-t border-stone-50">
              <span>Standards Institute</span>
              <span className="text-[#004236] font-black flex items-center gap-0.5">
                6 min read <ChevronRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

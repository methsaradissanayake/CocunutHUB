import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { commodities as fallbackCommodities } from "@/data/mockData";
import { pricesApi } from "@/api/client";
import { useLanguage } from "@/context/LanguageContext";
import { PRICES } from "@/constants/testIds";
import { ArrowUpRight, ArrowDownRight, MessageSquare, ShieldCheck } from "lucide-react";

export const PriceTicker = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState(fallbackCommodities);

  const fetchLivePrices = async () => {
    try {
      const data = await pricesApi.getToday();
      if (data && data.length > 0) {
        setItems(data);
      }
    } catch {
      // Fallback gracefully
    }
  };

  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayItems = [...items, ...items];

  return (
    <div className="bg-[#00362C] border-b border-[#002820] text-white py-1.5 text-xs font-semibold select-none shadow-xs" data-testid={PRICES.ticker}>
      <Marquee gradient={false} speed={38} pauseOnHover>
        <span className="inline-flex items-center gap-1.5 mx-4 px-2 py-0.5 rounded bg-[#00241D] text-amber-300 font-black text-[10px] uppercase tracking-wider border border-[#004D3F]">
          <ShieldCheck size={11} className="text-emerald-400" />
          CDA Certified Rates
        </span>

        {displayItems.map((c, i) => {
          const up = c.change >= 0;
          return (
            <React.Fragment key={`${c.id}-${i}`}>
              <span className="inline-flex items-center gap-1.5 mx-3">
                <span className="name font-bold text-white/90">{t(c.nameKey) || c.nameKey}</span>
                <span className="val font-numeric font-black text-white tracking-tight">
                  <span className="text-[#FFCE00] text-[11px] font-bold mr-0.5">{c.currency}</span>
                  {Number(c.price).toLocaleString("en-LK", { minimumFractionDigits: c.price < 1000 ? 2 : 0 })}
                </span>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded ${up ? "text-emerald-300 bg-emerald-950/60" : "text-rose-300 bg-rose-950/60"}`}>
                  {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(c.change).toFixed(1)}%
                </span>
                <span className="opacity-25 ml-2 text-white/40">•</span>
              </span>
            </React.Fragment>
          );
        })}
      </Marquee>
    </div>
  );
};

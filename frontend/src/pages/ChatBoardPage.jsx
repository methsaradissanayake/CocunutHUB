import React from "react";
import { TradeChatBoard } from "@/components/TradeChatBoard";
import { useLanguage } from "@/context/LanguageContext";
import { MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

export const ChatBoardPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Community Guidelines Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#E8F1EC] p-5 rounded-3xl border border-[#D0E2D6] shadow-xs text-[#004236]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="ch-badge">
              COMMUNITY FORUM
            </span>
            <span className="text-xs font-bold text-stone-600">
              Direct Farmer & Trader Discussions
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#004236] uppercase mt-1">
            {t("chat_title")}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
            {t("chat_subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#004236] bg-white px-3.5 py-2 rounded-xl font-bold self-start sm:self-auto border border-stone-200 shadow-xs">
          <ShieldCheck size={16} className="text-[#004236]" />
          <span>Moderated Trader Community</span>
        </div>
      </div>

      {/* Main Full-Page Chat Board */}
      <TradeChatBoard isWidget={false} />
    </div>
  );
};

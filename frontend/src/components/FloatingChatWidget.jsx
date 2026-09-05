import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { MessageSquare, X, Minus, Maximize2, Sparkles } from "lucide-react";
import { TradeChatBoard } from "@/components/TradeChatBoard";

export const FloatingChatWidget = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleExpand = () => {
    setIsOpen(false);
    navigate("/chat");
  };

  return (
    <>
      {/* Prominent High-Visibility Floating Chat Launcher Button */}
      <div className="ch-chat-dock fixed bottom-[76px] md:bottom-6 right-3 sm:right-6 z-45">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            title="Open Live Trade Chat Board"
            className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs font-black shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 bg-[#004236] text-white hover:bg-[#002D24]"
            style={{
              boxShadow: "0 10px 25px rgba(0, 45, 36, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <MessageSquare size={15} className="text-[#FFCE00]" />
            <span className="tracking-tight text-white font-bold">{t("chat_floating_badge") || "Trade Chat"}</span>
            <span className="bg-white/20 text-[#FFCE00] px-1.5 py-0.5 rounded-full font-numeric text-[10px] font-black">
              Live
            </span>
          </button>
        ) : null}
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className="ch-chat-window fixed bottom-2 sm:bottom-6 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-[420px] max-w-[450px] h-[580px] max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border-2 border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 bg-white z-50"
        >
          {/* Quick window controls bar */}
          <div className="bg-[#050A07] px-3.5 py-2 flex items-center justify-between text-xs text-stone-300 border-b border-emerald-900/60">
            <span className="font-black text-xs text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CoconutHub Live Trade Chat
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExpand}
                className="p-1 hover:text-white rounded transition-colors text-stone-400 hover:bg-stone-800"
                title="Open Full Page"
              >
                <Maximize2 size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded transition-colors text-stone-400 hover:bg-stone-800"
                title="Minimize"
              >
                <Minus size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded transition-colors text-rose-400 hover:bg-rose-950/50"
                title="Close"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <TradeChatBoard isWidget={true} onExpand={handleExpand} />
          </div>
        </div>
      )}
    </>
  );
};

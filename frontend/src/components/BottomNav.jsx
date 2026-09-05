import React from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { NAV } from "@/constants/testIds";
import { TrendingUp, Factory, Store, MessageSquare, User } from "lucide-react";

const TABS = [
  { to: "/", label: "nav_prices", testId: NAV.prices, Icon: TrendingUp, end: true },
  { to: "/mills", label: "nav_mills", testId: NAV.mills, Icon: Factory, end: false },
  { to: "/market", label: "nav_market", testId: NAV.market, Icon: Store, end: false },
  { to: "/chat", label: "nav_chat", testId: "nav-chat", Icon: MessageSquare, end: false },
  { to: "/profile", label: "nav_profile", testId: "nav-profile", Icon: User, end: false },
];

export const BottomNav = () => {
  const { t } = useLanguage();

  return (
    <nav
      className="ch-bottom-dock md:hidden"
      style={{
        position: "fixed",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        width: "calc(100% - 16px)",
        maxWidth: "480px",
      }}
    >
      {/* Elevated horizontal capsule bottom dock */}
      <div
        className="flex items-center justify-around gap-1 p-1.5 rounded-3xl backdrop-blur-2xl bg-[#00362C]/95 border border-white/20 text-white shadow-2xl"
        style={{
          boxShadow: "0 12px 30px rgba(0, 30, 20, 0.5), 0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        {TABS.map(({ to, label, testId, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            data-testid={testId}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#004236] shadow-md scale-[1.02]"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.6 : 2}
                    className={isActive ? "text-[#004236]" : "text-[#FFCE00]"}
                  />
                  {to === "/chat" && !isActive && (
                    <span className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-[#FFCE00] animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-black tracking-tight mt-1 leading-none truncate max-w-[62px] text-center ${
                    isActive ? "text-[#004236]" : "text-white/90"
                  }`}
                >
                  {t(label)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

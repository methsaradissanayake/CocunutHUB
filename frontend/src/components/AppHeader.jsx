import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { notificationsApi } from "@/api/client";
import { renderHighlightedMessage } from "@/components/TradeChatBoard";
import { HEADER } from "@/constants/testIds";
import {
  Leaf,
  TrendingUp,
  Factory,
  Store,
  MessageSquare,
  User,
  ShieldCheck,
  LogIn,
  Tractor,
  ShoppingCart,
  Repeat,
  Search,
  PlusCircle,
  Globe,
  Bell,
  BellRing,
  Check,
  Clock,
  ArrowRight
} from "lucide-react";

export const AppHeader = () => {
  const { lang, setLang, t } = useLanguage();
  const { currentUser, isAuthenticated, returnToLoginScreen, openProfileDialog, openLoginModal, openRegisterModal } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifDropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!currentUser?.id) return;
    try {
      const [list, count] = await Promise.all([
        notificationsApi.getNotifications(currentUser.id, 15),
        notificationsApi.getUnreadCount(currentUser.id)
      ]);
      setNotifications(Array.isArray(list) ? list : []);
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch {
      // Background poll failure handled gracefully
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 12000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, currentUser?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.id) return;
    try {
      await notificationsApi.markAllAsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    setShowNotifications(false);
    navigate("/chat");
  };

  const navLinks = [
    { to: "/", label: t("nav_prices"), Icon: TrendingUp, end: true },
    { to: "/mills", label: t("nav_mills"), Icon: Factory, end: false },
    { to: "/market", label: t("nav_market"), Icon: Store, end: false },
    { to: "/chat", label: t("nav_chat"), Icon: MessageSquare, end: false },
    { to: "/profile", label: t("nav_profile") || "Profile", Icon: User, end: false },
  ];

  const getRoleIcon = (type) => {
    if (type === 'Buyer') return <ShoppingCart className="w-3 h-3 text-blue-600" />;
    if (type === 'Both') return <Repeat className="w-3 h-3 text-purple-600" />;
    return <Tractor className="w-3 h-3 text-emerald-600" />;
  };

  const getRoleBadgeStyle = (type) => {
    if (type === 'Buyer') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (type === 'Both') return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand Logo & Title (matches Login page) */}
        <NavLink to="/" className="flex items-center gap-2.5 sm:gap-3 group" data-testid={HEADER.brand}>
          <div
            style={{
              width: 38,
              height: 38,
              background: "#FFCE00",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              boxShadow: "0 3px 12px rgba(255, 206, 0, 0.45)",
              flexShrink: 0,
            }}
            className="group-hover:scale-105 transition-transform"
          >
            🥥
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#004236",
                  letterSpacing: "-0.01em",
                }}
              >
                CoconutHub
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Sri Lanka CDA
              </span>
            </div>
            <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider hidden sm:block">
              National Coconut Industry & Trade Portal
            </div>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80">
          {navLinks.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? "bg-white text-[#004236] shadow-xs font-black"
                    : "text-stone-600 hover:text-[#004236] hover:bg-white/60 font-bold"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={14} className={isActive ? "text-[#004236]" : "text-stone-400"} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Section */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher pill */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-bold"
            role="group"
            aria-label="Language selector"
          >
            <button
              type="button"
              className={`px-2.5 py-1 rounded text-xs font-black transition-all ${
                lang === "en"
                  ? "bg-white text-[#004236] shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 rounded text-xs font-black transition-all ${
                lang === "si"
                  ? "bg-white text-[#004236] shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              onClick={() => setLang("si")}
            >
              සිං
            </button>
          </div>

          {/* Prominent CoconutHub Action Button */}
          <Link
            to="/market"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black bg-[#004236] hover:bg-[#002D24] text-white shadow-xs transition-all hover:shadow hover:-translate-y-0.5 uppercase tracking-wider"
          >
            <PlusCircle size={14} className="text-[#FFCE00]" />
            <span>{lang === "si" ? "දැන්වීමක් පළ කරන්න" : "Post Trade Ad"}</span>
          </Link>

          {/* User Notifications Bell */}
          {isAuthenticated && currentUser && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className={`relative p-2 rounded-xl transition-all border ${
                  unreadCount > 0
                    ? "bg-emerald-50 text-[#004236] border-emerald-300 hover:bg-emerald-100"
                    : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200/80"
                }`}
                title={lang === "si" ? "දැනුම්දීම්" : "Trade Notifications"}
              >
                {unreadCount > 0 ? (
                  <BellRing size={17} className="text-[#004236]" />
                ) : (
                  <Bell size={17} />
                )}

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center animate-pulse shadow-xs border-2 border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {showNotifications && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:mt-2 sm:w-96 bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Dropdown Header */}
                  <div className="p-3.5 bg-[#004236] text-white flex items-center justify-between border-b border-[#00362C]">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-[#FFCE00]" />
                      <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                        {lang === "si" ? "වෙළඳ දැනුම්දීම්" : "Trade Notifications"}
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-black bg-[#FFCE00] text-[#004236] px-2 py-0.5 rounded-full">
                          {unreadCount} {lang === "si" ? "අලුත්" : "New"}
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] text-[#E8F1EC] hover:text-white underline font-bold"
                      >
                        {lang === "si" ? "සියල්ල කියවූ ලෙස සලකුණු කරන්න" : "Mark all read"}
                      </button>
                    )}
                  </div>

                  {/* Dropdown Notification List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 bg-[#F9FAF8]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-stone-500 text-xs">
                        <Bell size={24} className="mx-auto text-stone-300 mb-2" />
                        <div className="font-bold text-stone-700">
                          {lang === "si" ? "දැනුම්දීම් නොමැත" : "No new notifications"}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                          {lang === "si"
                            ? "ඔබගේ සාකච්ඡාවලට පිළිතුරු ලැබුණු විට මෙහි දිස්වනු ඇත."
                            : "When a trader replies to your discussions, you will be notified here."}
                        </p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3 sm:p-3.5 transition-colors cursor-pointer hover:bg-emerald-50/40 flex items-start justify-between gap-2.5 ${
                            !item.isRead ? "bg-emerald-50/25 border-l-4 border-l-[#004236]" : "bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#004236] text-[#FFCE00] text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                              {(item.senderName || "T")[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="font-black text-xs text-[#004236] truncate">
                                  {item.senderName || (lang === "si" ? "වෙළෙන්දා" : "Trader")}
                                </span>
                                <span className="text-[10px] text-stone-400 font-bold shrink-0 flex items-center gap-1">
                                  <Clock size={10} />
                                  {item.timeAgo}
                                </span>
                              </div>
                              <p className="text-xs text-stone-700 font-medium leading-snug line-clamp-2">
                                {renderHighlightedMessage(item.message)}
                              </p>
                            </div>
                          </div>

                          {!item.isRead && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(item.id, e)}
                              className="p-1 rounded-md text-stone-400 hover:text-[#004236] hover:bg-stone-100 shrink-0"
                              title="Mark read"
                            >
                              <Check size={13} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
                    <Link
                      to="/profile"
                      onClick={() => setShowNotifications(false)}
                      className="font-bold text-[#004236] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>{lang === "si" ? "පැතිකඩ සාකච්ඡා පුවරුව බලන්න" : "View Discussions in Dashboard"}</span>
                      <ArrowRight size={11} />
                    </Link>

                    <Link
                      to="/chat"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] font-bold text-stone-600 hover:text-[#004236]"
                    >
                      {lang === "si" ? "සාකච්ඡා පුවරුවට" : "Open Chat Board"}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Pill / Auth Button */}
          {isAuthenticated && currentUser ? (
            <button
              onClick={openProfileDialog}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-stone-50 border border-stone-200 hover:border-[#004236] transition-all text-[#004236] shadow-2xs hover:shadow-xs"
              title={lang === "si" ? "පැතිකඩ බලන්න" : "View Profile"}
            >
              <span className="w-6 h-6 rounded-full bg-[#004236] text-white font-black text-xs flex items-center justify-center shadow-xs">
                {(currentUser.fullName || 'T')[0]?.toUpperCase()}
              </span>
              <span className="hidden md:inline text-xs font-bold text-stone-800 truncate max-w-[85px]">
                {currentUser.fullName?.split(' ')[0]}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(currentUser.businessType)}`}>
                {getRoleIcon(currentUser.businessType)}
                <span>{currentUser.businessType || 'Supplier'}</span>
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={returnToLoginScreen}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-stone-700 hover:text-[#004236] hover:bg-stone-100 transition-all border border-stone-200"
                title={lang === "si" ? "පිවිසුම් තිරය" : "Return to Login Screen"}
              >
                <LogIn size={13} />
                <span>{lang === "si" ? "පිවිසෙන්න" : "Sign In"}</span>
              </button>
              <button
                onClick={openRegisterModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black bg-[#FFCE00] hover:bg-[#E5B800] text-[#004236] shadow-xs transition-all uppercase tracking-wider"
              >
                <span>{lang === "si" ? "ලියාපදිංචිය" : "Join Network"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

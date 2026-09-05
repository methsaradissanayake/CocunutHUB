import React, { useState, useEffect, useMemo, useRef } from "react";
import { initialChatMessages } from "@/data/mockChat";
import { districts } from "@/data/mockData";
import { chatsApi } from "@/api/client";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Search,
  Filter,
  BadgeCheck,
  Truck,
  TrendingUp,
  Factory,
  Package,
  RotateCcw,
  CheckCircle2,
  Loader2,
  CornerDownRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "coconuthub_chat_messages_v1";

const getTopicIcon = (topic) => {
  switch (topic) {
    case "prices":
      return <TrendingUp size={12} className="text-[#004236]" />;
    case "transport":
      return <Truck size={12} className="text-amber-600" />;
    case "mills":
      return <Factory size={12} className="text-blue-600" />;
    default:
      return <Package size={12} className="text-stone-600" />;
  }
};

const getTopicColor = (topic) => {
  switch (topic) {
    case "prices":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "transport":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "mills":
      return "bg-blue-50 text-blue-800 border-blue-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
};

// Formats message content with highlighted @mention badges
export const renderHighlightedMessage = (message, repliedToAuthor, knownAuthors = []) => {
  if (!message) return "";

  const authorNames = new Set();
  if (repliedToAuthor && repliedToAuthor.trim()) {
    authorNames.add(repliedToAuthor.trim());
  }
  if (Array.isArray(knownAuthors)) {
    knownAuthors.forEach((a) => {
      if (a && typeof a === "string" && a.trim()) authorNames.add(a.trim());
    });
  }

  // Sort longest names first so full names match before prefixes
  const sortedNames = Array.from(authorNames).sort((a, b) => b.length - a.length);

  if (sortedNames.length > 0) {
    const escapedNames = sortedNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const mentionRegex = new RegExp(`(@(?:${escapedNames}))`, "gi");

    if (mentionRegex.test(message)) {
      const parts = message.split(mentionRegex);
      return parts.map((part, idx) => {
        if (mentionRegex.test(part)) {
          const cleanName = part.replace(/^@/, "");
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 font-black text-[#004236] bg-[#D4EADE] border border-[#96C7A8] px-2 py-0.5 rounded-lg mr-1.5 shadow-2xs text-xs sm:text-[13px] hover:bg-[#C2E3CD] transition-colors"
            >
              <span className="text-[#004236] font-bold">@</span>
              <span>{cleanName}</span>
            </span>
          );
        }
        return <React.Fragment key={idx}>{renderFallbackMentions(part)}</React.Fragment>;
      });
    }
  }

  return renderFallbackMentions(message);
};

const renderFallbackMentions = (text) => {
  if (!text) return "";
  const parts = text.split(/(@[A-Za-z0-9_.\u0D80-\u0DFF]+)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("@") && part.length > 1) {
      return (
        <span
          key={idx}
          className="inline-flex items-center gap-0.5 font-black text-[#004236] bg-[#D4EADE] border border-[#96C7A8] px-2 py-0.5 rounded-lg mr-1.5 shadow-2xs text-xs sm:text-[13px]"
        >
          <span>{part}</span>
        </span>
      );
    }
    return part;
  });
};

export const TradeChatBoard = ({ isWidget = false, onExpand = null }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeTopic, setActiveTopic] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [toastAlert, setToastAlert] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const [form, setForm] = useState({
    author: currentUser?.fullName || localStorage.getItem("coconuthub_trader_name") || "",
    district: currentUser?.district || localStorage.getItem("coconuthub_trader_district") || "Kurunegala",
    topic: "prices",
    message: "",
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await chatsApi.getMessages(activeTopic, selectedDistrict, searchQuery);
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data);
      } else if (messages.length === 0) {
        setMessages(initialChatMessages);
      }
    } catch {
      if (messages.length === 0) {
        setMessages(initialChatMessages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeTopic, selectedDistrict]);

  useEffect(() => {
    if (currentUser) {
      setForm((f) => ({
        ...f,
        author: f.author || currentUser.fullName || currentUser.businessName || "",
        district: f.district || currentUser.district || "Kurunegala",
      }));
    }
  }, [currentUser]);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const composerRef = useRef(null);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const topic = m.topic || "prices";
      const district = m.district || "";
      const author = m.author || m.authorName || "";
      const msg = m.message || "";

      if (activeTopic !== "all" && topic.toLowerCase() !== activeTopic.toLowerCase()) return false;
      if (selectedDistrict !== "all" && district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matches =
          author.toLowerCase().includes(q) ||
          msg.toLowerCase().includes(q) ||
          district.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [messages, activeTopic, selectedDistrict, searchQuery]);

  const knownAuthors = useMemo(() => {
    const set = new Set();
    messages.forEach((m) => {
      const author = m.author || m.authorName;
      if (author) set.add(author);
      if (m.repliedToAuthor) set.add(m.repliedToAuthor);
    });
    return Array.from(set);
  }, [messages]);

  const handleLike = async (id) => {
    if (likedIds.has(id)) return;
    setLikedIds((prev) => new Set(prev).add(id));
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const currentLikes = m.likes ?? m.likesCount ?? 0;
          return { ...m, likes: currentLikes + 1, likesCount: currentLikes + 1 };
        }
        return m;
      })
    );
    try {
      await chatsApi.likeMessage(id);
    } catch {
      // Optimistic update retained
    }
  };

  const handleReply = (messageItem) => {
    const authorName = messageItem.author || messageItem.authorName || "Trader";
    const authorUserId = messageItem.userId || null;
    setReplyingTo({
      id: messageItem.id,
      author: authorName,
      userId: authorUserId,
      topic: messageItem.topic || "prices",
      snippet: messageItem.message ? (messageItem.message.length > 50 ? messageItem.message.substring(0, 50) + "..." : messageItem.message) : "",
    });

    setForm((f) => {
      const currentMsg = f.message || "";
      const prefix = `@${authorName} `;
      const newMsg = currentMsg.includes(prefix)
        ? currentMsg
        : `${prefix}${currentMsg.replace(/^@[^ ]+\s*/, "")}`;
      return {
        ...f,
        topic: messageItem.topic || f.topic,
        message: newMsg,
      };
    });

    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (messageInputRef.current) {
        messageInputRef.current.focus();
        const len = messageInputRef.current.value.length;
        messageInputRef.current.setSelectionRange(len, len);
      }
    }, 60);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!form.message.trim() || !form.author.trim() || submitting) return;

    localStorage.setItem("coconuthub_trader_name", form.author.trim());
    localStorage.setItem("coconuthub_trader_district", form.district);

    const userType = currentUser?.businessType || "Supplier";
    const roleLabel =
      userType === "Supplier"
        ? "Supplier / සැපයුම්කරු"
        : userType === "Buyer"
        ? "Buyer / ගැනුම්කරු"
        : "Both / දෙවර්ගයම";

    const payload = {
      authorName: form.author.trim(),
      district: form.district,
      role: roleLabel,
      topic: form.topic,
      message: form.message.trim(),
      userId: currentUser?.id || null,
      parentMessageId: replyingTo?.id || null,
      repliedToAuthor: replyingTo?.author || null,
      repliedToUserId: replyingTo?.userId || null,
    };

    const previousReplyingTo = replyingTo;

    try {
      setSubmitting(true);
      const created = await chatsApi.postMessage(payload);
      if (created) {
        setMessages((prev) => [
          created,
          ...prev.map((item) =>
            previousReplyingTo?.id && item.id === previousReplyingTo.id
              ? { ...item, repliesCount: (item.repliesCount || 0) + 1 }
              : item
          ),
        ]);
      }
      setReplyingTo(null);
      setForm((f) => ({ ...f, message: "" }));
      setToastAlert("පණිවිඩය සජීවීව පළ කරන ලදී! / Message posted live to trade board!");
      setTimeout(() => setToastAlert(null), 3500);
    } catch {
      // Fallback local addition if network issue
      const fallbackMsg = {
        id: `chat-${Date.now()}`,
        authorName: form.author.trim(),
        district: form.district,
        role: roleLabel,
        topic: form.topic,
        message: form.message.trim(),
        timeAgo: "Just now",
        likesCount: 0,
        repliesCount: 0,
        badge: `${userType} • Verified`,
        parentMessageId: previousReplyingTo?.id || null,
        repliedToAuthor: previousReplyingTo?.author || null,
        repliedToUserId: previousReplyingTo?.userId || null,
      };
      setMessages((prev) => [
        fallbackMsg,
        ...prev.map((item) =>
          previousReplyingTo?.id && item.id === previousReplyingTo.id
            ? { ...item, repliesCount: (item.repliesCount || 0) + 1 }
            : item
        ),
      ]);
      setReplyingTo(null);
      setForm((f) => ({ ...f, message: "" }));
      setToastAlert("පණිවිඩය පළ කරන ලදී! / Message posted to trade board!");
      setTimeout(() => setToastAlert(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden text-stone-900 ${
        isWidget ? "h-full" : "min-h-[680px]"
      }`}
    >
      {/* Toast Alert */}
      {toastAlert && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#004236] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl animate-bounce border border-[#FFCE00]">
          <CheckCircle2 size={14} className="text-[#FFCE00]" />
          <span>{toastAlert}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 md:p-5 bg-[#004236] text-white flex items-center justify-between gap-3 border-b border-[#00362C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 text-[#FFCE00] border border-white/20 shadow-xs">
              <MessageSquare size={20} />
            </span>
            <h2 className="font-display text-xl md:text-2xl font-black tracking-tight text-white uppercase">
              {t("chat_title")}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#FFCE00] animate-pulse"></span>
              28 {t("chat_active_traders")}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#E8F1EC] mt-1.5 font-medium leading-relaxed">
            {t("chat_subtitle")}
          </p>
        </div>

        {isWidget && onExpand && (
          <Button
            onClick={onExpand}
            variant="ghost"
            className="text-[#004236] hover:bg-white/90 bg-[#FFCE00] text-xs font-black rounded-xl h-9 px-3 border-none shadow-sm"
          >
            {t("chat_expand")} ↗
          </Button>
        )}
      </div>

      {/* Interactive Controls: Topic Tabs & Search */}
      <div className="p-3.5 md:p-4 bg-[#E8F1EC] border-b border-[#D0E2D6] space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              t("buyer") === "Buyer"
                ? "Search discussions by keyword, district, or trader..."
                : "වෙළෙන්දා, දිස්ත්‍රික්කය හෝ අවශ්‍යතාව අනුව සොයන්න..."
            }
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236] shadow-xs"
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

        {/* Filter Bar: Topic Pills & District Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-0.5 px-0.5 shrink-0">
            {[
              { id: "all", label: t("chat_all_topics"), icon: MessageSquare },
              { id: "prices", label: t("chat_topic_prices"), icon: TrendingUp },
              { id: "transport", label: t("chat_topic_transport"), icon: Truck },
              { id: "coconuts", label: t("chat_topic_coconuts"), icon: Package },
              { id: "mills", label: t("chat_topic_mills"), icon: Factory },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTopic === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTopic(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-xs shrink-0 ${
                    active
                      ? "bg-[#004236] text-white shadow-sm border border-[#004236]"
                      : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
                  }`}
                >
                  <Icon size={11} className={active ? "text-[#FFCE00]" : "text-stone-500"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* District Quick Filter */}
          <div className="flex items-center gap-1 sm:pl-2 sm:border-l sm:border-stone-300 w-full sm:w-auto shrink-0">
            <MapPin size={12} className="text-[#004236] shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full sm:w-auto bg-white text-[#004236] border border-stone-300 rounded-full px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#004236]"
            >
              <option value="all">{t("filter_all")} {t("filter_district")}</option>
              <option value="Kurunegala">Kurunegala / කුරුණෑගල</option>
              <option value="Puttalam">Puttalam / පුත්තලම</option>
              <option value="Gampaha">Gampaha / ගම්පහ</option>
              <option value="Colombo">Colombo / කොළඹ</option>
              <option value="Kalutara">Kalutara / කළුතර</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-3.5 max-h-[460px] bg-[#F9FAF8]">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm font-bold bg-white rounded-2xl border border-dashed border-stone-300">
            <MessageSquare size={36} className="mx-auto text-stone-400 mb-2" />
            <div className="font-black text-[#004236] text-base">No discussions found</div>
            <p className="mt-1 text-stone-500 text-xs">Be the first trader to start a discussion in this topic!</p>
          </div>
        ) : (
          filteredMessages.map((m) => {
            const isLiked = likedIds.has(m.id);
            const author = m.author || m.authorName || "Anonymous Trader";
            const timestamp = m.timestamp || m.timeAgo || "Just now";
            const likes = m.likes ?? m.likesCount ?? 0;
            const topic = m.topic || "prices";
            const district = m.district || "Sri Lanka";
            const role = m.role || "Trader";

            return (
              <div
                key={m.id}
                className={`group p-4 sm:p-5 rounded-2xl bg-white border transition-all ${
                  replyingTo?.id === m.id
                    ? "border-[#004236] ring-2 ring-[#004236]/25 shadow-md bg-emerald-50/20"
                    : "border-stone-200 shadow-xs hover:border-[#004236]"
                }`}
              >
                {/* Author Info & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar Initials */}
                    <div className="w-9 h-9 rounded-full bg-[#004236] text-[#FFCE00] text-sm font-black flex items-center justify-center shadow-xs shrink-0">
                      {author.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-black text-sm sm:text-base text-[#004236] leading-tight">
                          {author}
                        </span>
                        {m.badge && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004236] bg-[#E8F1EC] border border-[#CDE0D5] px-2 py-0.5 rounded-full">
                            <BadgeCheck size={11} className="text-[#004236]" />
                            {m.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-stone-600 font-bold mt-1">
                        <MapPin size={12} className="text-[#004236] shrink-0" />
                        <span className="text-stone-800 font-black">{district}</span>
                        <span className="text-stone-300">·</span>
                        <span className="text-stone-600">{role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getTopicColor(
                        topic
                      )}`}
                    >
                      {getTopicIcon(topic)}
                      <span className="capitalize">{topic}</span>
                    </span>
                  </div>
                </div>

                {/* Contextual Threaded Reply Banner */}
                {m.repliedToAuthor && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#004236] bg-[#E8F1EC] border border-[#BBD4C4] px-2.5 py-1 rounded-lg mb-2 font-bold w-fit shadow-2xs">
                    <CornerDownRight size={12} className="text-[#004236]" />
                    <span>Replying to <span className="font-black text-[#004236]">@{m.repliedToAuthor}</span></span>
                  </div>
                )}

                {/* Message Body */}
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium bg-[#F9FAF8] p-3.5 rounded-xl border border-stone-200">
                  {renderHighlightedMessage(m.message, m.repliedToAuthor, knownAuthors)}
                </p>

                {/* Footer Reactions & Reply */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-xs text-stone-500 font-bold">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-stone-500 font-medium">
                      <Clock size={12} className="text-stone-400" /> {timestamp}
                    </span>
                    {(m.repliesCount ?? m.replies ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <MessageSquare size={11} className="text-emerald-700" />
                        <span>{m.repliesCount ?? m.replies} replies</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReply(m)}
                      className={`font-bold px-3 py-1 rounded-lg transition-all border text-xs flex items-center gap-1.5 ${
                        replyingTo?.id === m.id
                          ? "bg-[#004236] text-white border-[#004236] shadow-xs"
                          : "text-stone-700 hover:text-[#004236] bg-stone-100 hover:bg-[#E8F1EC] border-stone-200"
                      }`}
                    >
                      <CornerDownRight size={13} className={replyingTo?.id === m.id ? "text-[#FFCE00]" : "text-stone-500"} />
                      {t("chat_reply")}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLike(m.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all text-xs ${
                        isLiked
                          ? "bg-[#004236] text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                      }`}
                    >
                      <ThumbsUp size={12} />
                      <span>{likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Footer */}
      <form
        ref={composerRef}
        onSubmit={handleSendMessage}
        className="p-3.5 md:p-4 bg-white border-t border-stone-200 space-y-2.5"
      >
        {/* Contextual Reply Indicator */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-[#E8F1EC] border border-[#BBD4C4] px-3.5 py-2 rounded-xl text-xs text-[#004236] font-bold animate-in fade-in duration-200">
            <span className="flex items-center gap-2 truncate">
              <CornerDownRight size={14} className="text-[#004236] shrink-0" />
              <span className="truncate">
                {t("chat_reply")} to <span className="font-black text-[#004236]">@{replyingTo.author}</span>:
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                const target = replyingTo.author;
                setReplyingTo(null);
                setForm((f) => ({
                  ...f,
                  message: f.message.replace(new RegExp(`^@${target}\\s*`), ""),
                }));
              }}
              className="text-stone-500 hover:text-[#004236] font-black p-0.5 ml-2 shrink-0 rounded-md hover:bg-white/60 transition-colors"
              title="Cancel reply"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Compact User / District / Topic selector */}
        {currentUser ? (
          <div className="flex items-center justify-between gap-2 p-2 bg-[#F0F5F2] rounded-xl text-xs border border-[#CDE2D5]">
            <div className="flex items-center gap-1.5 text-stone-700 font-bold truncate">
              <span className="w-5 h-5 rounded-full bg-[#004236] text-[#FFCE00] font-black text-[10px] flex items-center justify-center shrink-0">
                {(currentUser.fullName || "T")[0]?.toUpperCase()}
              </span>
              <span className="truncate text-[#004236] font-black text-[11px] sm:text-xs">
                {form.author}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-600 truncate text-[11px] sm:text-xs">
                {form.district}
              </span>
            </div>

            <select
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="bg-white text-[#004236] border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-black shrink-0 focus:outline-none focus:ring-1 focus:ring-[#004236]"
            >
              <option value="prices">📈 {t("chat_topic_prices")}</option>
              <option value="transport">🚛 {t("chat_topic_transport")}</option>
              <option value="coconuts">🥥 {t("chat_topic_coconuts")}</option>
              <option value="mills">🏭 {t("chat_topic_mills")}</option>
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              type="text"
              required
              placeholder={t("chat_your_name")}
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="p-2.5 bg-[#F9FAF8] border border-stone-300 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
            />

            <select
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="p-2.5 bg-[#F9FAF8] border border-stone-300 rounded-xl text-xs sm:text-sm font-bold text-[#004236] focus:outline-none focus:ring-2 focus:ring-[#004236]"
            >
              {districts.map((d) => (
                <option key={d} value={d} className="bg-white text-stone-900">
                  {d}
                </option>
              ))}
            </select>

            <select
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="p-2.5 bg-[#F9FAF8] border border-stone-300 rounded-xl text-xs sm:text-sm font-bold text-[#004236] focus:outline-none focus:ring-2 focus:ring-[#004236]"
            >
              <option value="prices">📈 {t("chat_topic_prices")}</option>
              <option value="transport">🚛 {t("chat_topic_transport")}</option>
              <option value="coconuts">🥥 {t("chat_topic_coconuts")}</option>
              <option value="mills">🏭 {t("chat_topic_mills")}</option>
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={messageInputRef}
            type="text"
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={t("chat_input_placeholder")}
            className="flex-1 px-3 py-2.5 sm:px-3.5 sm:py-3 bg-[#F9FAF8] border border-stone-300 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
          />

          <Button
            type="submit"
            className="rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 font-black shadow-sm text-xs sm:text-sm bg-[#FFCE00] hover:bg-[#E6B800] text-stone-900 border-none transition-transform hover:scale-[1.01] shrink-0"
          >
            <Send size={15} className="sm:mr-1.5 text-stone-900" />
            <span className="hidden sm:inline">{t("chat_send_btn")}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

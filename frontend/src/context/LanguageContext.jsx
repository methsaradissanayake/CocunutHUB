import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext(null);

const STORAGE_KEY = "coconuthub_lang";
const DEFAULT_LANG = "si"; // Sinhala default per spec

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_LANG;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "si" ? saved : DEFAULT_LANG;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.setAttribute("lang", lang === "si" ? "si-LK" : "en");
    }
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((prev) => (prev === "si" ? "en" : "si"));
  }, []);

  const t = useCallback(
    (key) => {
      const dict = translations[lang] || translations.en;
      // fallback chain: current -> english -> key
      return dict[key] ?? translations.en[key] ?? key;
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      language: lang,
      setLanguage: setLang,
      toggle,
      t,
    }),
    [lang, toggle, t]
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

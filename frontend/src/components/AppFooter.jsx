import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ShieldCheck,
  ExternalLink,
  Leaf
} from 'lucide-react';

export const AppFooter = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="relative w-full text-white overflow-hidden mt-12 bg-[#061E17]">
      {/* Coconut Palms Background Image with Dark Forest Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity"
        style={{
          backgroundImage: "url('/coconuthub_twilight_palms.jpg')",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#04140F] via-[#07241C]/90 to-[#0B3529]/95" />

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pb-16">
        {/* Top Section with Logo and 4 Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-white/15">
          {/* Logo & Intro Column (takes 2 cols on lg) */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#FFCE00",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: "0 4px 14px rgba(255, 206, 0, 0.4)",
                  flexShrink: 0,
                }}
              >
                🥥
              </div>
              <div className="leading-tight">
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                  className="block"
                >
                  CoconutHub
                </span>
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Sri Lanka Certified Agro-Network
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 max-w-sm leading-relaxed">
              {lang === 'si'
                ? 'ශ්‍රී ලංකාවේ ප්‍රමුඛතම තිරසාර පොල් නිෂ්පාදන, මිල දර්ශක සහ වෙළඳ ජාලය. ගොවීන් සහ තොග වෙළඳුන් එකම තැනක.'
                : 'Accelerating sustainable, ethical coconut production and wholesale trade across Sri Lanka in partnership with local growers and certified processors.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>CDA Verified Market Data</span>
              </span>
            </div>

            {/* Social Media Links - positioned cleanly in brand column to avoid floating docks */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FFCE00] hover:text-[#004236] flex items-center justify-center text-white transition-all shadow-xs"
                aria-label="Facebook"
              >
                <Facebook size={14} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FFCE00] hover:text-[#004236] flex items-center justify-center text-white transition-all shadow-xs"
                aria-label="Twitter"
              >
                <Twitter size={14} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FFCE00] hover:text-[#004236] flex items-center justify-center text-white transition-all shadow-xs"
                aria-label="Instagram"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FFCE00] hover:text-[#004236] flex items-center justify-center text-white transition-all shadow-xs"
                aria-label="LinkedIn"
              >
                <Linkedin size={14} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FFCE00] hover:text-[#004236] flex items-center justify-center text-white transition-all shadow-xs"
                aria-label="YouTube"
              >
                <Youtube size={14} />
              </a>
            </div>
          </div>

          {/* Column 1: Organization */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3.5 font-display">
              ORGANIZATION
            </h3>
            <ul className="space-y-2 text-xs font-medium text-stone-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('nav_prices')}
                </Link>
              </li>
              <li>
                <Link to="/mills" className="hover:text-white transition-colors">
                  {t('nav_mills')}
                </Link>
              </li>
              <li>
                <Link to="/market" className="hover:text-white transition-colors">
                  {t('nav_market')}
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-white transition-colors">
                  {t('nav_chat')}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  {t('nav_profile')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: About */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3.5 font-display">
              ABOUT
            </h3>
            <ul className="space-y-2 text-xs font-medium text-stone-300">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About CoconutHub
                </a>
              </li>
              <li>
                <a href="#certified" className="hover:text-white transition-colors">
                  Certified Coconut Oil
                </a>
              </li>
              <li>
                <a href="#growers" className="hover:text-white transition-colors">
                  Sustainable Growers
                </a>
              </li>
              <li>
                <a href="#standards" className="hover:text-white transition-colors">
                  Fair Trade Standards
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: For Business */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3.5 font-display">
              FOR BUSINESS
            </h3>
            <ul className="space-y-2 text-xs font-medium text-stone-300">
              <li>
                <Link to="/market" className="hover:text-white transition-colors">
                  Wholesale Sourcing
                </Link>
              </li>
              <li>
                <Link to="/mills" className="hover:text-white transition-colors">
                  Mill Processing
                </Link>
              </li>
              <li>
                <a href="#advisory" className="hover:text-white transition-colors">
                  Export Advisory
                </a>
              </li>
              <li>
                <a href="#certification" className="hover:text-white transition-colors">
                  Certification Program
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Info */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3.5 font-display">
              INFO
            </h3>
            <ul className="space-y-2 text-xs font-medium text-stone-300">
              <li>
                <a href="#press" className="hover:text-white transition-colors">
                  Press Room
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row: Legal & Safe Right Clearance for Floating Buttons */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400 md:pr-48">
          <div className="text-center md:text-left leading-relaxed max-w-2xl">
            {lang === 'si'
              ? 'CoconutHub ශ්‍රී ලංකා — දිවයින පුරා පොල් ගොවීන්, නිෂ්පාදකයින් සහ ගැනුම්කරුවන් සම්බන්ධ කරන ප්‍රමුඛතම ඩිජිටල් වෙළඳ ජාලය. | © 2026 CoconutHub Sri Lanka. සියලු හිමිකම් ඇවිරිණි.'
              : 'CoconutHub Sri Lanka — The premier digital agro-network connecting coconut growers, mills, and buyers nationwide. | © 2026 CoconutHub Sri Lanka. All rights reserved.'}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a href="#privacy" className="hover:text-white underline text-xs">
              Privacy Policy
            </a>
            <span className="text-stone-600">|</span>
            <a href="#cookies" className="hover:text-white underline text-xs">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Mail, Send } from 'lucide-react';

export const NewsletterSection = () => {
  const { lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
    }, 2500);
  };

  return (
    <section className="my-10 w-full rounded-2xl bg-[#E8F1EC] border border-[#D0E2D6] p-6 sm:p-10 shadow-sm text-[#004236]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Left Column: Heading & Subtitle */}
        <div className="md:max-w-md">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#004236] uppercase font-display leading-tight">
            {lang === 'si' ? 'අප හා සම්බන්ධ වන්න' : 'STAY IN TOUCH WITH US'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#1E3E34] font-medium leading-relaxed">
            {lang === 'si'
              ? 'දෛනික CDA පොල් වෙන්දේසි මිල ගණන් සහ කෘෂි වෙළඳ තොරතුරු කෙලින්ම ඔබගේ විද්‍යුත් තැපෑලට ලබා ගන්න.'
              : 'Get updates from the Certified Coconut Network, straight to your inbox.'}
          </p>
        </div>

        {/* Right Column: Form */}
        <div className="flex-1 max-w-md w-full">
          {submitted ? (
            <div className="p-4 bg-white/90 border border-emerald-300 rounded-xl flex items-center gap-3 text-[#004236] shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-sm">
                  {lang === 'si' ? 'ස්තූතියි! ඔබ සාර්ථකව ලියාපදිංචි විය.' : 'Thank you for subscribing!'}
                </div>
                <div className="text-xs text-[#2A5245]">
                  {lang === 'si'
                    ? 'නවතම මිල විශ්ලේෂණ ඔබගේ inbox වෙත එවනු ලැබේ.'
                    : 'Daily coconut market intel will be delivered to your inbox.'}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-[#004236] uppercase tracking-wider mb-1">
                  {lang === 'si' ? 'විද්‍යුත් තැපෑල (Email)' : 'Email'}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === 'si' ? 'ඔබගේ Email ලිපිනය' : 'Email Address'}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#B5CEBE] rounded-lg text-sm text-[#1E293B] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236] focus:border-transparent shadow-xs"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#004236] hover:bg-[#002D24] text-white font-bold rounded-lg text-sm tracking-wide transition-all shadow-sm hover:shadow active:scale-98 whitespace-nowrap uppercase"
                  >
                    {lang === 'si' ? 'දායක වන්න' : 'Subscribe'}
                  </button>
                </div>
              </div>

              {/* Checkbox Opt-in */}
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#004236] rounded border-[#9ABBA4] focus:ring-[#004236]"
                />
                <span className="text-xs text-[#2A5245] font-medium leading-snug">
                  {lang === 'si'
                    ? 'තිරසාර පොල් නිෂ්පාදනය සහ මිල අනාවැකි පිළිබඳ යාවත්කාලීන මට එවන්න.'
                    : 'Send me updates on how I can support sustainable coconut farming and CDA price alerts.'}
                </span>
              </label>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

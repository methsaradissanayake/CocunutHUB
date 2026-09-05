import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Tractor,
  ShoppingCart,
  Repeat
} from 'lucide-react';

const SRI_LANKA_DISTRICTS = [
  'Kurunegala',
  'Puttalam',
  'Gampaha',
  'Colombo',
  'Kalutara',
  'Galle',
  'Matara',
  'Hambantota',
  'Kandy',
  'Matale',
  'Kegalle',
  'Ratnapura',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala'
];

export const AuthModal = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    register,
    login
  } = useAuth();
  const { t, language } = useLanguage();

  const isRegister = authModalMode === 'register';

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [district, setDistrict] = useState('Kurunegala');
  const [businessType, setBusinessType] = useState('Supplier'); // 'Supplier' | 'Buyer' | 'Both'
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!email.trim() || !email.includes('@')) {
          throw new Error(language === 'si' ? 'වලංගු විද්‍යුත් තැපැල් (Email) ලිපිනයක් ඇතුළත් කරන්න' : 'Please provide a valid email address');
        }
        if (!fullName.trim()) {
          throw new Error(language === 'si' ? 'සම්පූර්ණ නම ඇතුළත් කරන්න' : 'Please enter your full name');
        }
        if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
          throw new Error(language === 'si' ? 'වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න' : 'Please enter a valid phone number');
        }
        if (password.length < 6) {
          throw new Error(language === 'si' ? 'මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුය' : 'Password must be at least 6 characters');
        }

        await register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          businessName: businessName.trim() || fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          district,
          businessType,
          bio: bio.trim()
        });

        setSuccessMsg(language === 'si' ? 'ගිණුම සාර්ථකව සාදන ලදී!' : 'Account successfully created!');
      } else {
        if (!email.trim() || !password) {
          throw new Error(language === 'si' ? 'විද්‍යුත් තැපෑල/දුරකථනය සහ මුරපදය අවශ්‍ය වේ' : 'Email/Phone and password are required');
        }
        await login({ identifier: email.trim(), password });
        setSuccessMsg(language === 'si' ? 'සාර්ථකව ඇතුල් විය!' : 'Successfully signed in!');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (type) => {
    if (type === 'supplier') {
      setEmail('sunil@silvaestate.lk');
      setPassword('demo123');
    } else if (type === 'buyer') {
      setEmail('procure@colombofoods.lk');
      setPassword('demo123');
    } else {
      setEmail('wickrama@coconuthub.lk');
      setPassword('demo123');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="relative px-6 py-5 border-b border-[#00362C] bg-[#004236] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-[#FFCE00] border border-white/20 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase">
                  {isRegister ? (language === 'si' ? 'නව ගිණුමක් සාදන්න' : 'Create Trader Account') : (language === 'si' ? 'ගිණුමට ඇතුල් වන්න' : 'Sign In to CoconutHub')}
                </h2>
                <p className="text-xs text-[#E8F1EC] font-medium">
                  {isRegister
                    ? (language === 'si' ? 'දිවයිනේ 1,200+ පොල් වෙළඳුන් සහ නිෂ්පාදකයින් හා එක්වන්න' : 'Join 1,200+ coconut producers and verified traders')
                    : (language === 'si' ? 'ඔබගේ වෙළඳපල ගිණුම වෙත පිවිසෙන්න' : 'Access your marketplace profile & contacts')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setAuthModalOpen(false)}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toggle Tab between Register & Sign In */}
          <div className="grid grid-cols-2 gap-1.5 mt-4 p-1 bg-white/10 border border-white/20 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                isRegister
                  ? 'bg-[#FFCE00] text-stone-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Tractor className="w-3.5 h-3.5" />
              {language === 'si' ? 'ලියාපදිංචි වීම (Register)' : 'Register (Free)'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                !isRegister
                  ? 'bg-[#FFCE00] text-stone-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              {language === 'si' ? 'ඇතුල් වන්න (Sign In)' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4 text-stone-900 bg-[#F9FAF8]">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-[#E8F1EC] border border-[#D0E2D6] rounded-xl flex items-center gap-3 text-[#004236] text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#004236]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                {/* Business Type Selector: Supplier / Buyer / Both */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#004236] mb-2">
                    {language === 'si' ? 'ව්‍යාපාරික කාර්යභාරය (Business Type)' : 'Your Business Role / Type'} *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Option 1: Supplier */}
                    <div
                      onClick={() => setBusinessType('Supplier')}
                      className={`cursor-pointer p-3 rounded-2xl border transition-all text-left flex flex-col justify-between shadow-2xs ${
                        businessType === 'Supplier'
                          ? 'bg-[#E8F1EC] border-[#004236] ring-1 ring-[#004236] text-[#004236]'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-[#004236]">
                          <Tractor className="w-4 h-4" />
                        </div>
                        {businessType === 'Supplier' && (
                          <CheckCircle2 className="w-4 h-4 text-[#004236]" />
                        )}
                      </div>
                      <div className="font-bold text-sm text-[#004236]">
                        {language === 'si' ? 'සැපයුම්කරු' : 'Supplier'}
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 leading-tight font-medium">
                        {language === 'si'
                          ? 'ගොවීන්, පොල් වතු සහ තෙල්/කොහු මෝල්'
                          : 'Growers, estates & processors'}
                      </p>
                    </div>

                    {/* Option 2: Buyer */}
                    <div
                      onClick={() => setBusinessType('Buyer')}
                      className={`cursor-pointer p-3 rounded-2xl border transition-all text-left flex flex-col justify-between shadow-2xs ${
                        businessType === 'Buyer'
                          ? 'bg-blue-50 border-blue-700 ring-1 ring-blue-700 text-blue-900'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        {businessType === 'Buyer' && (
                          <CheckCircle2 className="w-4 h-4 text-blue-700" />
                        )}
                      </div>
                      <div className="font-bold text-sm text-blue-900">
                        {language === 'si' ? 'ගැනුම්කරු' : 'Buyer'}
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 leading-tight font-medium">
                        {language === 'si'
                          ? 'තොග වෙළඳුන්, සුපිරි වෙළඳසැල් සහ අපනයනකරුවන්'
                          : 'Wholesalers, retailers & exporters'}
                      </p>
                    </div>

                    {/* Option 3: Both */}
                    <div
                      onClick={() => setBusinessType('Both')}
                      className={`cursor-pointer p-3 rounded-2xl border transition-all text-left flex flex-col justify-between shadow-2xs ${
                        businessType === 'Both'
                          ? 'bg-purple-50 border-purple-700 ring-1 ring-purple-700 text-purple-900'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                          <Repeat className="w-4 h-4" />
                        </div>
                        {businessType === 'Both' && (
                          <CheckCircle2 className="w-4 h-4 text-purple-700" />
                        )}
                      </div>
                      <div className="font-bold text-sm text-purple-900">
                        {language === 'si' ? 'දෙවර්ගයම' : 'Both (Buy & Sell)'}
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 leading-tight font-medium">
                        {language === 'si'
                          ? 'මිලදී ගන්නා සහ විකුණන වාණිජ වෙළඳුන්'
                          : 'Traders & brokers who buy & supply'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Name & Business Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'si' ? 'සම්පූර්ණ නම' : 'Full Name'} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sunil Perera"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'si' ? 'ව්‍යාපාරික හෝ වතු නම' : 'Business / Estate Name'}
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Silva Plantations"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'si' ? 'විද්‍යුත් තැපෑල (Email)' : 'Email Address'} *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="trader@coconuthub.lk"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'si' ? 'දුරකථන අංකය (WhatsApp/Phone)' : 'Phone Number'} *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+94 77 123 4567"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                      />
                    </div>
                  </div>
                </div>

                {/* District & Bio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'si' ? 'දිස්ත්‍රික්කය (District)' : 'District'} *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#004236]"
                      >
                        {SRI_LANKA_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist} className="bg-white text-stone-900">
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'si' ? 'මුරපදය (Password)' : 'Password (min 6)'} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {language === 'si' ? 'ව්‍යාපාරික විස්තරය (Bio / Specialties)' : 'Business Bio / Supply Capabilities'}
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={
                      language === 'si'
                        ? 'උදා: සතියකට පොල් ගෙඩි 10,000ක් සැපයීමේ හැකියාව ඇත, කුරුණෑගල ප්‍රවාහන පහසුකම් ඇත...'
                        : 'e.g. Supplying 15,000 fresh coconuts weekly, own transport available across North-Western province...'
                    }
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                  />
                </div>
              </>
            )}

            {!isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {language === 'si' ? 'විද්‍යුත් තැපෑල හෝ දුරකථනය' : 'Email Address or Phone Number'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@coconuthub.lk or +9477..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {language === 'si' ? 'මුරපදය (Password)' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                    />
                  </div>
                </div>

                {/* Demo Quick Logins */}
                <div className="pt-2 border-t border-stone-200">
                  <div className="text-[11px] font-bold text-stone-500 mb-2">
                    {language === 'si' ? 'නිරූපණ ගිණුම් වෙත ක්ෂණික පිවිසුම:' : 'Quick Demo Accounts:'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('supplier')}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700 hover:border-[#004236] transition-all text-left shadow-2xs"
                    >
                      <div className="font-bold text-[#004236]">🚜 Supplier</div>
                      <div className="text-[10px] text-stone-500 truncate">Sunil Perera</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('buyer')}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700 hover:border-blue-700 transition-all text-left shadow-2xs"
                    >
                      <div className="font-bold text-blue-700">🛒 Buyer</div>
                      <div className="text-[10px] text-stone-500 truncate">Colombo Foods</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('both')}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700 hover:border-purple-700 transition-all text-left shadow-2xs"
                    >
                      <div className="font-bold text-purple-700">🔄 Both</div>
                      <div className="text-[10px] text-stone-500 truncate">Wickrama Silva</div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#FFCE00] hover:bg-[#E6B800] text-stone-900 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm mt-4 disabled:opacity-50 uppercase tracking-wider transition-transform hover:scale-[1.01]"
            >
              {loading ? (
                <span>{language === 'si' ? 'සකසමින් පවතී...' : 'Processing...'}</span>
              ) : isRegister ? (
                <>
                  <span>{language === 'si' ? 'ගිණුම සාදන්න' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{language === 'si' ? 'ඇතුල් වන්න' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <div>
            {isRegister ? (
              <span>
                {language === 'si' ? 'දැනටමත් ගිණුමක් තිබේද?' : 'Already registered?'}{' '}
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[#004236] hover:underline font-bold"
                >
                  {language === 'si' ? 'ඇතුල් වන්න' : 'Sign In'}
                </button>
              </span>
            ) : (
              <span>
                {language === 'si' ? 'ගිණුමක් නැද්ද?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[#004236] hover:underline font-bold"
                >
                  {language === 'si' ? 'නොමිලේ ලියාපදිංචි වන්න' : 'Register Free'}
                </button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#004236]" />
            <span>{language === 'si' ? '100% නොමිලේ ලියාපදිංචිය' : '100% Free Verification'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

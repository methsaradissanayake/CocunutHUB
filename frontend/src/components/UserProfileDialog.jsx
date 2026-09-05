import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  LogOut,
  Tractor,
  ShoppingCart,
  Repeat,
  Save,
  Calendar,
  Sparkles
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

export const UserProfileDialog = () => {
  const {
    currentUser,
    profileDialogOpen,
    setProfileDialogOpen,
    updateProfile,
    switchBusinessType,
    logout
  } = useAuth();
  const { t, language } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [bio, setBio] = useState('');
  const [businessType, setBusinessType] = useState('Supplier');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when dialog opens or editing starts
  const startEdit = () => {
    if (!currentUser) return;
    setFullName(currentUser.fullName || '');
    setBusinessName(currentUser.businessName || '');
    setEmail(currentUser.email || '');
    setDistrict(currentUser.district || 'Colombo');
    setBio(currentUser.bio || '');
    setBusinessType(currentUser.businessType || 'Supplier');
    setIsEditing(true);
    setSavedSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({
      fullName,
      businessName,
      email,
      district,
      bio,
      businessType
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setIsEditing(false);
      setSavedSuccess(false);
    }, 600);
  };

  const handleQuickTypeSwitch = async (type) => {
    await switchBusinessType(type);
  };

  if (!profileDialogOpen || !currentUser) return null;

  const currentType = currentUser.businessType || 'Supplier';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setProfileDialogOpen(false)}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-[#00362C] bg-[#004236] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#FFCE00] font-black text-xl flex items-center justify-center shadow-xs border border-white/20">
                {(currentUser.fullName || 'T')[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white tracking-tight">
                    {currentUser.fullName || 'Trader'}
                  </h2>
                  {currentUser.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFCE00] text-stone-900">
                      <ShieldCheck className="w-3 h-3 text-stone-900" />
                      {language === 'si' ? 'සත්‍යාපිතයි' : 'Verified'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#E8F1EC] font-medium">
                  {currentUser.businessName || 'Independent Agro Trader'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setProfileDialogOpen(false)}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4 text-stone-900 bg-[#F9FAF8]">
          {savedSuccess && (
            <div className="p-3 bg-[#E8F1EC] border border-[#D0E2D6] rounded-xl flex items-center gap-2 text-[#004236] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#004236]" />
              <span>{language === 'si' ? 'වෙනස්කම් සාර්ථකව සුරකින ලදී!' : 'Profile successfully saved!'}</span>
            </div>
          )}

          {!isEditing ? (
            <>
              {/* Business Type Highlight & Quick Switcher */}
              <div className="p-3.5 bg-white border border-stone-200 rounded-2xl shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#004236]">
                    {language === 'si' ? 'ඔබගේ ව්‍යාපාරික වර්ගය' : 'Current Business Role'}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {language === 'si' ? 'මාරු කිරීමට ඔබන්න:' : 'Click to switch:'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Supplier Button */}
                  <button
                    onClick={() => handleQuickTypeSwitch('Supplier')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-start ${
                      currentType === 'Supplier'
                        ? 'bg-[#004236] border-[#004236] text-white shadow-xs'
                        : 'bg-[#F9FAF8] border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Tractor className={`w-3.5 h-3.5 ${currentType === 'Supplier' ? 'text-[#FFCE00]' : 'text-[#004236]'}`} />
                      <span>{language === 'si' ? 'සැපයුම්කරු' : 'Supplier'}</span>
                    </div>
                    <span className={`text-[9px] mt-0.5 ${currentType === 'Supplier' ? 'text-white/80' : 'text-stone-400'}`}>
                      {language === 'si' ? 'විකිණීම' : 'Selling'}
                    </span>
                  </button>

                  {/* Buyer Button */}
                  <button
                    onClick={() => handleQuickTypeSwitch('Buyer')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-start ${
                      currentType === 'Buyer'
                        ? 'bg-blue-700 border-blue-700 text-white shadow-xs'
                        : 'bg-[#F9FAF8] border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{language === 'si' ? 'ගැනුම්කරු' : 'Buyer'}</span>
                    </div>
                    <span className={`text-[9px] mt-0.5 ${currentType === 'Buyer' ? 'text-white/80' : 'text-stone-400'}`}>
                      {language === 'si' ? 'මිලදී ගැනීම' : 'Buying'}
                    </span>
                  </button>

                  {/* Both Button */}
                  <button
                    onClick={() => handleQuickTypeSwitch('Both')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-start ${
                      currentType === 'Both'
                        ? 'bg-purple-700 border-purple-700 text-white shadow-xs'
                        : 'bg-[#F9FAF8] border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>{language === 'si' ? 'දෙවර්ගයම' : 'Both'}</span>
                    </div>
                    <span className={`text-[9px] mt-0.5 ${currentType === 'Both' ? 'text-white/80' : 'text-stone-400'}`}>
                      {language === 'si' ? 'දෙකම' : 'Buy & Sell'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="space-y-2.5">
                <div className="p-3 bg-white border border-stone-200 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#004236] shrink-0" />
                    <div>
                      <div className="text-[10px] text-stone-400 uppercase font-black">
                        {language === 'si' ? 'විද්‍යුත් තැපෑල (Email)' : 'Email'}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-stone-800">
                        {currentUser.email || 'No email specified'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F1EC] text-[#004236] border border-[#CDE0D5] font-bold">
                    Primary
                  </span>
                </div>

                <div className="p-3 bg-white border border-stone-200 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#004236] shrink-0" />
                    <div>
                      <div className="text-[10px] text-stone-400 uppercase font-black">
                        {language === 'si' ? 'දුරකථන අංකය' : 'Phone'}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-stone-800">
                        {currentUser.phoneNumber || 'Not provided'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                    Active
                  </span>
                </div>

                <div className="p-3 bg-white border border-stone-200 rounded-2xl flex items-center gap-3 shadow-2xs">
                  <MapPin className="w-4 h-4 text-[#004236] shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-black">
                      {language === 'si' ? 'ප්‍රධාන මෙහෙයුම් දිස්ත්‍රික්කය' : 'Operating District'}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-stone-800">
                      {currentUser.district || 'Colombo'}, Sri Lanka
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-2xs">
                  <div className="text-[10px] text-stone-400 uppercase font-black mb-1">
                    {language === 'si' ? 'ව්‍යාපාරික විස්තරය (Bio)' : 'Business Bio'}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    {currentUser.bio ||
                      (language === 'si'
                        ? 'ව්‍යාපාරික විස්තරයක් එක් කර නැත. සංස්කරණය ඔබා එක් කරන්න.'
                        : 'No business bio added yet. Click edit to add your supply or purchase capabilities.')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={startEdit}
                  className="flex-1 py-2.5 px-4 bg-[#FFCE00] hover:bg-[#E6B800] text-stone-900 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{language === 'si' ? 'පැතිකඩ සංස්කරණය' : 'Edit Profile'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setProfileDialogOpen(false);
                  }}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-stone-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'si' ? 'ඉවත් වන්න' : 'Log Out'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Editing Form */
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'si' ? 'ව්‍යාපාරික වර්ගය (Business Type)' : 'Business Role'} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBusinessType('Supplier')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      businessType === 'Supplier'
                        ? 'bg-[#004236] border-[#004236] text-white shadow-xs'
                        : 'bg-white border-stone-300 text-stone-700'
                    }`}
                  >
                    <Tractor className="w-3.5 h-3.5" />
                    <span>{language === 'si' ? 'සැපයුම්කරු' : 'Supplier'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBusinessType('Buyer')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      businessType === 'Buyer'
                        ? 'bg-blue-700 border-blue-700 text-white shadow-xs'
                        : 'bg-white border-stone-300 text-stone-700'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{language === 'si' ? 'ගැනුම්කරු' : 'Buyer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBusinessType('Both')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      businessType === 'Both'
                        ? 'bg-purple-700 border-purple-700 text-white shadow-xs'
                        : 'bg-white border-stone-300 text-stone-700'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>{language === 'si' ? 'දෙවර්ගයම' : 'Both'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'si' ? 'සම්පූර්ණ නම' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'si' ? 'ව්‍යාපාරික හෝ වතු නම' : 'Business / Estate Name'}
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {language === 'si' ? 'විද්‍යුත් තැපෑල (Email)' : 'Email'} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {language === 'si' ? 'දිස්ත්‍රික්කය' : 'District'} *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
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
                  {language === 'si' ? 'ව්‍යාපාරික විස්තරය (Bio)' : 'Business Bio'}
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#FFCE00] hover:bg-[#E6B800] text-stone-900 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'si' ? 'සුරකින්න' : 'Save Changes'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all border border-stone-200"
                >
                  {language === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

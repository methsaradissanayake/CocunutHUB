import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { chatsApi } from '../api/client';
import { renderHighlightedMessage } from '../components/TradeChatBoard';
import {
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
  Sparkles,
  PlusCircle,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Tag,
  Clock,
  ThumbsUp,
  CornerDownRight,
  RefreshCw
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

export const ProfilePage = () => {
  const {
    currentUser,
    isAuthenticated,
    updateProfile,
    switchBusinessType,
    logout,
    openRegisterModal,
    openLoginModal
  } = useAuth();
  const { t, language } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [businessName, setBusinessName] = useState(currentUser?.businessName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [district, setDistrict] = useState(currentUser?.district || 'Colombo');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [businessType, setBusinessType] = useState(currentUser?.businessType || 'Supplier');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Discussions & Received Replies Tab State
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'discussions'
  const [discussionsData, setDiscussionsData] = useState({ myPosts: [], receivedReplies: [] });
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);

  const fetchDiscussions = async () => {
    if (!currentUser?.id) return;
    try {
      setLoadingDiscussions(true);
      const data = await chatsApi.getUserDiscussions(currentUser.id);
      if (data) {
        setDiscussionsData(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingDiscussions(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchDiscussions();
    }
  }, [currentUser?.id]);

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

  const currentType = currentUser?.businessType || 'Supplier';

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-stone-900">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#E8F1EC] border border-[#D0E2D6] flex items-center justify-center text-[#004236]">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-[#004236] uppercase mb-2">
          {language === 'si' ? 'පැතිකඩ බැලීමට ඇතුල් වන්න' : 'Sign in to access your profile'}
        </h1>
        <p className="text-sm text-stone-600 mb-6 font-medium">
          {language === 'si'
            ? 'වෙළඳ දැන්වීම් පළ කිරීමට සහ සත්‍යාපිත තොරතුරු බැලීමට ඔබගේ ගිණුමට පිවිසෙන්න හෝ නව ගිණුමක් සාදන්න.'
            : 'Register or sign in to manage your business identity, post listings, and contact coconut traders.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={openLoginModal}
            className="px-6 py-2.5 bg-[#004236] hover:bg-[#002D24] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            {language === 'si' ? 'ඇතුල් වන්න' : 'Sign In'}
          </button>
          <button
            onClick={openRegisterModal}
            className="px-6 py-2.5 bg-[#FFCE00] hover:bg-[#E6B800] text-stone-900 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            {language === 'si' ? 'නොමිලේ ලියාපදිංචි වීම' : 'Create Account'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-stone-900 pb-24">
      {/* Top Banner & Avatar */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#004236] text-[#FFCE00] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-sm shrink-0">
              {(currentUser.fullName || 'T')[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-[#004236] tracking-tight">
                  {currentUser.fullName}
                </h1>
                {currentUser.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F1EC] text-[#004236] border border-[#CDE0D5]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#004236]" />
                    {language === 'si' ? 'සත්‍යාපිත වෙළෙන්දා' : 'Verified Trader'}
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-600 font-semibold">
                {currentUser.businessName || 'Agro Trading Professional'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-stone-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#004236]" />
                  {currentUser.district || 'Colombo'}, Sri Lanka
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#004236]" />
                  Member since 2026
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!isEditing && (
              <button
                onClick={startEdit}
                className="flex-1 sm:flex-none justify-center py-2 px-4 bg-[#004236] hover:bg-[#002D24] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{language === 'si' ? 'සංස්කරණය' : 'Edit Profile'}</span>
              </button>
            )}
            <button
              onClick={logout}
              className="flex-1 sm:flex-none justify-center py-2 px-3 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-stone-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'si' ? 'ඉවත් වන්න' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#E8F1EC] border border-[#D0E2D6] rounded-2xl flex items-center gap-3 text-[#004236] text-sm font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#004236] shrink-0" />
          <span>{language === 'si' ? 'පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී!' : 'Profile updated successfully!'}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Role Selector & Quick Actions */}
        <div className="space-y-6">
          {/* Business Role Card */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#004236]">
                {language === 'si' ? 'ව්‍යාපාරික කාර්යභාරය' : 'Business Role'}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                {language === 'si' ? 'මාරු කිරීමට ඔබන්න' : 'Tap to switch'}
              </span>
            </div>

            <div className="space-y-2">
              {/* Supplier Option */}
              <button
                onClick={() => switchBusinessType('Supplier')}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  currentType === 'Supplier'
                    ? 'bg-[#E8F1EC] border-[#004236] text-[#004236] ring-1 ring-[#004236]'
                    : 'bg-[#F9FAF8] border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-[#004236]">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#004236]">
                      {language === 'si' ? 'සැපයුම්කරු (Supplier)' : 'Supplier'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">
                      {language === 'si' ? 'පොල්, තෙල්, කොහු විකිණීම' : 'Selling coconuts, copra & oil'}
                    </div>
                  </div>
                </div>
                {currentType === 'Supplier' && (
                  <CheckCircle2 className="w-4 h-4 text-[#004236]" />
                )}
              </button>

              {/* Buyer Option */}
              <button
                onClick={() => switchBusinessType('Buyer')}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  currentType === 'Buyer'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                    : 'bg-[#F9FAF8] border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-blue-900">
                      {language === 'si' ? 'ගැනුම්කරු (Buyer)' : 'Buyer'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">
                      {language === 'si' ? 'තොග වශයෙන් මිලදී ගැනීම' : 'Procuring wholesale & bulk'}
                    </div>
                  </div>
                </div>
                {currentType === 'Buyer' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                )}
              </button>

              {/* Both Option */}
              <button
                onClick={() => switchBusinessType('Both')}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  currentType === 'Both'
                    ? 'bg-purple-50 border-purple-600 text-purple-900 ring-1 ring-purple-600'
                    : 'bg-[#F9FAF8] border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-purple-900">
                      {language === 'si' ? 'දෙවර්ගයම (Both)' : 'Both (Buy & Sell)'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">
                      {language === 'si' ? 'මිලදී ගැනීම සහ විකිණීම' : 'Commercial buy & sell trade'}
                    </div>
                  </div>
                </div>
                {currentType === 'Both' && (
                  <CheckCircle2 className="w-4 h-4 text-purple-700" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#004236]">
              {language === 'si' ? 'ක්ෂණික ක්‍රියාකාරකම්' : 'Quick Actions'}
            </span>
            <div className="space-y-2">
              <Link
                to="/market"
                className="w-full p-3 rounded-2xl bg-[#F9FAF8] hover:bg-[#E8F1EC] border border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700 hover:text-[#004236] transition-all"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#004236]" />
                  {language === 'si' ? 'වෙළඳ දැන්වීමක් පළ කරන්න' : 'Post New Trade Ad'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                to="/chat"
                className="w-full p-3 rounded-2xl bg-[#F9FAF8] hover:bg-[#E8F1EC] border border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700 hover:text-[#004236] transition-all"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#004236]" />
                  {language === 'si' ? 'වෙළඳ සාකච්ඡා පුවරුව' : 'Open Trade Chat Board'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Tabs + Details / Discussions */}
        <div className="md:col-span-2 space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                activeTab === 'details'
                  ? 'bg-white text-[#004236] shadow-xs'
                  : 'text-stone-600 hover:text-[#004236]'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{language === 'si' ? 'ව්‍යාපාරික පැතිකඩ' : 'Business Identity'}</span>
              <span className="sm:hidden">{language === 'si' ? 'පැතිකඩ' : 'Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('discussions')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                activeTab === 'discussions'
                  ? 'bg-white text-[#004236] shadow-xs'
                  : 'text-stone-600 hover:text-[#004236]'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{language === 'si' ? 'සාකච්ඡා සහ ලැබුණු පිළිතුරු' : 'Discussions & Received Replies'}</span>
              <span className="sm:hidden">{language === 'si' ? 'සාකච්ඡා / පිළිතුරු' : 'Discussions'}</span>
              {(discussionsData.receivedReplies?.length > 0 || discussionsData.myPosts?.length > 0) && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#004236] shrink-0">
                  {discussionsData.receivedReplies.length + discussionsData.myPosts.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'details' && (
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-sm">
              {!isEditing ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                    <h2 className="text-base font-black text-[#004236] flex items-center gap-2">
                      <User className="w-4 h-4 text-[#004236]" />
                      <span>{language === 'si' ? 'ව්‍යාපාරික පැතිකඩ විස්තර' : 'Business Identity & Details'}</span>
                    </h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#E8F1EC] text-[#004236] border border-[#CDE0D5] font-bold">
                    {currentType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#F9FAF8] border border-stone-200 rounded-2xl">
                    <div className="text-[10px] text-stone-500 uppercase font-black mb-1">
                      {language === 'si' ? 'විද්‍යුත් තැපෑල (Email Address)' : 'Email Address'}
                    </div>
                    <div className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#004236] shrink-0" />
                      <span className="truncate">{currentUser.email || 'None provided'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#F9FAF8] border border-stone-200 rounded-2xl">
                    <div className="text-[10px] text-stone-500 uppercase font-black mb-1">
                      {language === 'si' ? 'දුරකථන අංකය (Phone / WhatsApp)' : 'Phone Number'}
                    </div>
                    <div className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#004236] shrink-0" />
                      <span>{currentUser.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#F9FAF8] border border-stone-200 rounded-2xl">
                    <div className="text-[10px] text-stone-500 uppercase font-black mb-1">
                      {language === 'si' ? 'ව්‍යාපාරික / වතු නම' : 'Business / Estate'}
                    </div>
                    <div className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#004236] shrink-0" />
                      <span>{currentUser.businessName || currentUser.fullName}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#F9FAF8] border border-stone-200 rounded-2xl">
                    <div className="text-[10px] text-stone-500 uppercase font-black mb-1">
                      {language === 'si' ? 'දිස්ත්‍රික්කය' : 'District'}
                    </div>
                    <div className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#004236] shrink-0" />
                      <span>{currentUser.district || 'Colombo'}, Sri Lanka</span>
                    </div>
                  </div>
                </div>

                {/* Bio / Capabilities */}
                <div className="p-4 bg-[#F9FAF8] border border-stone-200 rounded-2xl">
                  <div className="text-[10px] text-stone-500 uppercase font-black mb-1.5">
                    {language === 'si' ? 'ව්‍යාපාරික විස්තරය සහ හැකියාවන්' : 'Business Bio & Capabilities'}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed font-medium">
                    {currentUser.bio ||
                      (language === 'si'
                        ? 'ව්‍යාපාරික විස්තරයක් එක් කර නැත. ඔබ සතු පොල් සැපයුම් හෝ මිලදී ගැනීමේ හැකියාවන් සඳහන් කිරීමට සංස්කරණය ඔබන්න.'
                        : 'No business bio added yet. Click edit to add your supply or purchase capabilities.')}
                  </p>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h2 className="text-base font-black text-[#004236] flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#004236]" />
                    <span>{language === 'si' ? 'පැතිකඩ සංස්කරණය' : 'Edit Business Profile'}</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'si' ? 'සම්පූර්ණ නම' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FAF8] border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
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
                      className="w-full px-3 py-2 bg-[#F9FAF8] border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'si' ? 'විද්‍යුත් තැපෑල (Email)' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FAF8] border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'si' ? 'දිස්ත්‍රික්කය' : 'District'} *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FAF8] border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
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
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 bg-[#F9FAF8] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#004236]"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-[#FFCE00] hover:bg-[#E6B800] text-stone-900 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{language === 'si' ? 'වෙනස්කම් සුරකින්න' : 'Save Changes'}</span>
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
          )}

          {/* Discussions & Received Replies Tab View */}
          {activeTab === 'discussions' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="p-5 rounded-3xl bg-[#004236] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-[#FFCE00]" />
                    <h2 className="font-display font-black text-lg text-white uppercase tracking-tight">
                      {language === 'si' ? 'වෙළඳ සාකච්ඡා සහ ලැබුණු පිළිතුරු' : 'Trade Discussions & Received Replies'}
                    </h2>
                  </div>
                  <p className="text-xs text-[#E8F1EC] mt-1 font-medium">
                    {language === 'si'
                      ? 'ඔබ පළ කළ සාකච්ඡා සහ අනෙකුත් වෙළෙන්දන්ගෙන් ලැබුණු ප්‍රතිචාර මෙහි සජීවීව දැකගත හැක.'
                      : 'Track live discussions you started and all responses received from coconut traders across Sri Lanka.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={fetchDiscussions}
                    disabled={loadingDiscussions}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5 border border-white/20"
                    title="Refresh discussions"
                  >
                    <RefreshCw size={13} className={loadingDiscussions ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">{language === 'si' ? 'නැවත පූරණය' : 'Refresh'}</span>
                  </button>

                  <Link
                    to="/chat"
                    className="py-2 px-3.5 bg-[#FFCE00] hover:bg-[#E5B800] text-[#004236] font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <PlusCircle size={13} />
                    <span>{language === 'si' ? 'නව සාකච්ඡාවක්' : 'New Post'}</span>
                  </Link>
                </div>
              </div>

              {/* Section 1: Received Replies */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <CornerDownRight className="w-4 h-4 text-[#004236]" />
                    <h3 className="text-sm font-black text-[#004236] uppercase tracking-wider">
                      {language === 'si' ? 'වෙළෙන්දන්ගෙන් ලැබුණු පිළිතුරු' : 'Replies Received from Traders'}
                    </h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {discussionsData.receivedReplies?.length || 0} {language === 'si' ? 'පිළිතුරු' : 'replies'}
                  </span>
                </div>

                {discussionsData.receivedReplies?.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 text-xs bg-[#F9FAF8] rounded-2xl border border-dashed border-stone-300">
                    <MessageSquare size={28} className="mx-auto text-stone-300 mb-2" />
                    <div className="font-bold text-stone-700 text-sm">
                      {language === 'si' ? 'තවම පිළිතුරු ලැබී නොමැත' : 'No replies received yet'}
                    </div>
                    <p className="text-stone-500 mt-1 max-w-md mx-auto">
                      {language === 'si'
                        ? 'ඔබ වෙළඳ සාකච්ඡා පුවරුවේ විමසීමක් හෝ දැන්වීමක් පළ කළ පසු, වෙළෙන්දන් පිළිතුරු දුන් සැනින් ඒවා මෙහි දිස්වනු ඇත.'
                        : 'When other traders reply to your inquiries or rate requests, you will be notified and their replies will appear here immediately.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussionsData.receivedReplies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-4 rounded-2xl bg-[#F9FAF8] hover:bg-emerald-50/30 border border-stone-200 hover:border-[#004236] transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#004236] text-[#FFCE00] font-black text-xs flex items-center justify-center shadow-xs">
                              {(reply.authorName || 'T')[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-xs sm:text-sm text-[#004236]">
                                  {reply.authorName}
                                </span>
                                {reply.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {reply.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                                <MapPin size={11} className="text-[#004236]" />
                                <span>{reply.district}</span>
                                <span>·</span>
                                <span>{reply.role}</span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[11px] text-stone-400 font-bold flex items-center gap-1 shrink-0">
                            <Clock size={11} />
                            {reply.timeAgo}
                          </span>
                        </div>

                        {/* Reply content */}
                        <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                          {renderHighlightedMessage(reply.message, reply.repliedToAuthor)}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 text-xs">
                          <span className="text-[11px] text-stone-500 font-bold flex items-center gap-1">
                            <ThumbsUp size={11} className="text-stone-400" />
                            {reply.likesCount} {language === 'si' ? 'කැමැත්ත' : 'likes'}
                          </span>

                          <Link
                            to="/chat"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#004236] hover:bg-[#002D24] text-white transition-all shadow-xs"
                          >
                            <CornerDownRight size={12} className="text-[#FFCE00]" />
                            <span>{language === 'si' ? 'පිළිතුරු දෙන්න' : 'Reply Back in Chat'}</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: User's Own Posts */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#004236]" />
                    <h3 className="text-sm font-black text-[#004236] uppercase tracking-wider">
                      {language === 'si' ? 'මා විසින් පළ කළ සාකච්ඡා' : 'My Posted Trade Discussions'}
                    </h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {discussionsData.myPosts?.length || 0} {language === 'si' ? 'පළ කිරීම්' : 'posts'}
                  </span>
                </div>

                {discussionsData.myPosts?.length === 0 ? (
                  <div className="p-6 text-center text-stone-500 text-xs bg-[#F9FAF8] rounded-2xl border border-stone-200">
                    <p className="text-stone-600 font-medium">
                      {language === 'si' ? 'ඔබ තවම සාකච්ඡා පළ කර නැත.' : "You haven't posted any trade discussions yet."}
                    </p>
                    <Link
                      to="/chat"
                      className="inline-block mt-2 font-bold text-[#004236] hover:underline"
                    >
                      {language === 'si' ? 'දැන් සාකච්ඡාවක් ආරම්භ කරන්න →' : 'Start a discussion on the trade board →'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussionsData.myPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-2xl bg-[#F9FAF8] border border-stone-200 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#004236] border border-emerald-200">
                            {post.topic}
                          </span>
                          <span className="text-[11px] text-stone-400 font-bold flex items-center gap-1">
                            <Clock size={11} />
                            {post.timeAgo}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                          {renderHighlightedMessage(post.message, post.repliedToAuthor)}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs text-stone-500 font-bold">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <ThumbsUp size={11} />
                              {post.likesCount}
                            </span>
                            <span className="flex items-center gap-1 text-[#004236]">
                              <MessageSquare size={11} />
                              {post.repliesCount} {language === 'si' ? 'පිළිතුරු' : 'replies'}
                            </span>
                          </div>

                          <Link
                            to="/chat"
                            className="font-bold text-[#004236] hover:underline flex items-center gap-1 text-xs"
                          >
                            <span>{language === 'si' ? 'සාකච්ඡාව බලන්න' : 'View Thread'}</span>
                            <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

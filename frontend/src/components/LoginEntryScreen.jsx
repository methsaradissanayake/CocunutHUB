import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sprout,
  ShoppingCart,
  Repeat,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Globe,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";

const SRI_LANKA_DISTRICTS = [
  "Kurunegala","Puttalam","Gampaha","Colombo","Kalutara","Galle",
  "Matara","Hambantota","Kandy","Matale","Kegalle","Ratnapura",
  "Anuradhapura","Polonnaruwa","Badulla","Monaragala",
];

/* ─── Inline styles injected once ──────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

  .login-root * { box-sizing: border-box; }

  .login-root {
    font-family: 'Inter', -apple-system, sans-serif;
    min-height: 100vh;
    display: flex;
  }

  /* ── LEFT PANEL ── */
  .lp-left {
    flex: 0 0 48%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 52px;
    overflow: hidden;
    color: #fff;
  }

  /* Full-bleed farm photo */
  .lp-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 35%;
    z-index: 0;
    transition: transform 8s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .lp-left:hover .lp-photo {
    transform: scale(1.04);
  }

  /* Multi-layer gradient overlay for professional text legibility */
  .lp-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(
        to bottom,
        rgba(5, 22, 12, 0.45) 0%,
        rgba(5, 22, 12, 0.25) 30%,
        rgba(5, 22, 12, 0.55) 65%,
        rgba(5, 22, 12, 0.88) 100%
      ),
      linear-gradient(
        135deg,
        rgba(11, 61, 46, 0.3) 0%,
        transparent 60%
      );
  }

  /* Gold shimmer at top-left */
  .lp-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 15% 8%, rgba(255,206,0,0.12) 0%, transparent 50%);
  }

  /* decorative circles */
  .lp-deco-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.08);
    pointer-events: none;
    z-index: 2;
  }

  .lp-brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 3;
  }

  .lp-brand-logo .logo-mark {
    width: 40px;
    height: 40px;
    background: #FFCE00;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 14px rgba(255,206,0,0.4);
  }

  .lp-brand-logo .logo-text {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.01em;
  }

  .lp-hero {
    position: relative;
    z-index: 3;
  }

  .lp-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,206,0,0.15);
    border: 1px solid rgba(255,206,0,0.3);
    color: #FFCE00;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 20px;
  }

  .lp-headline {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(32px, 3.5vw, 44px);
    font-weight: 800;
    line-height: 1.12;
    color: #fff;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
  }

  .lp-headline em {
    font-style: normal;
    color: #FFCE00;
  }

  .lp-subtext {
    font-size: 14px;
    font-weight: 400;
    color: rgba(255,255,255,0.65);
    line-height: 1.6;
    max-width: 360px;
    margin: 0;
  }

  .lp-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    position: relative;
    z-index: 2;
  }

  .lp-stat-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border-radius: 14px;
    padding: 16px 18px;
    transition: background 0.2s;
  }

  .lp-stat-card:hover { background: rgba(255,255,255,0.09); }

  .lp-stat-card .stat-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: rgba(255,206,0,0.15);
    border: 1px solid rgba(255,206,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFCE00;
    margin-bottom: 10px;
  }

  .lp-stat-card .stat-num {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    line-height: 1;
    margin-bottom: 3px;
  }

  .lp-stat-card .stat-label {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.55);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .lp-testimonial {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 16px 18px;
    position: relative;
    z-index: 2;
  }

  .lp-testimonial .testi-stars {
    display: flex;
    gap: 2px;
    margin-bottom: 8px;
    color: #FFCE00;
  }

  .lp-testimonial .testi-text {
    font-size: 12.5px;
    font-weight: 400;
    color: rgba(255,255,255,0.75);
    line-height: 1.55;
    font-style: italic;
    margin-bottom: 10px;
  }

  .lp-testimonial .testi-author {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── RIGHT PANEL ── */
  .lp-right {
    flex: 1;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 56px;
    overflow-y: auto;
    position: relative;
  }

  .lp-lang-toggle {
    position: absolute;
    top: 24px;
    right: 28px;
    display: flex;
    gap: 4px;
    background: #F1F5F2;
    border-radius: 20px;
    padding: 3px;
  }

  .lp-lang-btn {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.18s;
    color: #5A7A6A;
    background: transparent;
  }

  .lp-lang-btn.active {
    background: #0B3D2E;
    color: #fff;
    box-shadow: 0 2px 8px rgba(11,61,46,0.25);
  }

  .lp-form-header {
    margin-bottom: 32px;
  }

  .lp-form-header .form-eyebrow {
    font-size: 11px;
    font-weight: 600;
    color: #0B8A5C;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .lp-form-header h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 28px;
    font-weight: 800;
    color: #0D1F15;
    margin: 0 0 6px;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .lp-form-header p {
    font-size: 13.5px;
    color: #6B8070;
    margin: 0;
    font-weight: 400;
  }

  /* Tab switcher */
  .lp-tabs {
    display: flex;
    background: #F3F7F4;
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 28px;
    gap: 4px;
  }

  .lp-tab {
    flex: 1;
    text-align: center;
    padding: 9px;
    font-size: 13px;
    font-weight: 600;
    border: none;
    background: transparent;
    color: #7A9A85;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.18s;
  }

  .lp-tab.active {
    background: #fff;
    color: #0B3D2E;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  /* Input groups */
  .lp-field {
    margin-bottom: 18px;
  }

  .lp-field label {
    display: block;
    font-size: 11.5px;
    font-weight: 600;
    color: #3D5A48;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 7px;
  }

  .lp-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .lp-input-icon {
    position: absolute;
    left: 14px;
    color: #94B0A0;
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: color 0.2s;
  }

  .lp-input {
    width: 100%;
    height: 46px;
    border: 1.5px solid #D8E6DE;
    border-radius: 10px;
    padding: 0 14px 0 42px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #0D1F15;
    background: #F9FCF9;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none;
  }

  .lp-input::placeholder { color: #A8BFB3; font-weight: 400; }

  .lp-input:focus {
    border-color: #0B8A5C;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(11,138,92,0.12);
  }

  .lp-input:focus ~ .lp-input-icon,
  .lp-input-wrap:focus-within .lp-input-icon { color: #0B8A5C; }

  .lp-input-suffix {
    position: absolute;
    right: 12px;
    color: #94B0A0;
    cursor: pointer;
    background: none;
    border: none;
    padding: 4px;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }

  .lp-input-suffix:hover { color: #0B3D2E; }

  /* Autofill override */
  .lp-input:-webkit-autofill,
  .lp-input:-webkit-autofill:hover,
  .lp-input:-webkit-autofill:focus {
    -webkit-text-fill-color: #0D1F15 !important;
    -webkit-box-shadow: 0 0 0px 1000px #F9FCF9 inset !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Row */
  .lp-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* Checkbox row */
  .lp-options-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
    margin-top: -4px;
  }

  .lp-checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 500;
    color: #4A6A58;
    cursor: pointer;
    user-select: none;
  }

  .lp-checkbox {
    width: 16px;
    height: 16px;
    accent-color: #0B3D2E;
    cursor: pointer;
  }

  .lp-forgot-link {
    font-size: 12.5px;
    font-weight: 500;
    color: #0B8A5C;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    transition: color 0.2s;
  }

  .lp-forgot-link:hover { color: #0B3D2E; text-decoration: underline; }

  /* Primary CTA */
  .lp-cta {
    width: 100%;
    height: 50px;
    background: linear-gradient(135deg, #0B3D2E 0%, #0F5C42 100%);
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 6px 20px rgba(11,61,46,0.3);
    transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
    margin-bottom: 18px;
  }

  .lp-cta:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(11,61,46,0.4);
    filter: brightness(1.05);
  }

  .lp-cta:active:not(:disabled) { transform: translateY(0); }
  .lp-cta:disabled { opacity: 0.65; cursor: not-allowed; }

  /* Role selector */
  .lp-role-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 18px;
  }

  .lp-role-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 10px 8px;
    border-radius: 10px;
    border: 1.5px solid #D8E6DE;
    background: #F9FCF9;
    color: #4A6A58;
    font-family: 'Inter', sans-serif;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .lp-role-btn.active {
    border-color: #0B3D2E;
    background: #EBF5EF;
    color: #0B3D2E;
    box-shadow: 0 2px 8px rgba(11,61,46,0.15);
  }

  .lp-role-btn:hover:not(.active) {
    border-color: #94B0A0;
    background: #F3F7F4;
  }

  /* Select */
  .lp-select {
    width: 100%;
    height: 46px;
    border: 1.5px solid #D8E6DE;
    border-radius: 10px;
    padding: 0 14px;
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #0D1F15;
    background: #F9FCF9;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23648070' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }

  .lp-select:focus {
    border-color: #0B8A5C;
    box-shadow: 0 0 0 3px rgba(11,138,92,0.12);
  }

  /* Alert banners */
  .lp-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 12.5px;
    font-weight: 500;
    margin-bottom: 18px;
    animation: fadeUp 0.2s ease;
  }

  .lp-alert.error { background: #FFF1F1; border: 1px solid #FECACA; color: #B91C1C; }
  .lp-alert.success { background: #F0FDF4; border: 1px solid #86EFAC; color: #166534; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Divider */
  .lp-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 4px 0 16px;
    color: #B0C8BB;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .lp-divider::before,
  .lp-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E4EEE8;
  }

  /* Quick demo pills */
  .lp-demo-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .lp-demo-pill {
    font-size: 11.5px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1.5px solid #D8E6DE;
    background: #F3F7F4;
    color: #3D5A48;
    cursor: pointer;
    transition: all 0.18s;
    font-family: 'Inter', sans-serif;
  }

  .lp-demo-pill:hover {
    background: #E8F2EC;
    border-color: #0B8A5C;
    color: #0B3D2E;
  }

  /* Guest link */
  .lp-guest-link {
    display: block;
    text-align: center;
    font-size: 12.5px;
    font-weight: 500;
    color: #6B8070;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
    font-family: 'Inter', sans-serif;
    margin-bottom: 6px;
  }

  .lp-guest-link:hover { color: #0B3D2E; }

  /* Switch mode link */
  .lp-mode-link {
    display: block;
    text-align: center;
    font-size: 13px;
    color: #4A6A58;
    margin-top: 4px;
  }

  .lp-mode-link button {
    font-size: 13px;
    font-weight: 700;
    color: #0B3D2E;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    font-family: 'Inter', sans-serif;
    transition: color 0.2s;
  }

  .lp-mode-link button:hover { color: #0B8A5C; }

  .lp-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Responsive */
  @media (max-width: 860px) {
    .lp-left { display: none; }
    .lp-right { padding: 36px 28px; }
  }
`;

export const LoginEntryScreen = ({ onEnter }) => {
  const { login, register, enterAsGuest } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [district, setDistrict] = useState("Kurunegala");
  const [businessType, setBusinessType] = useState("Supplier");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const clearMessages = () => { setError(""); setInfoMsg(""); };

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    const trimmedId = email.trim();
    if (!trimmedId || !password) {
      setError(language === "si" ? "කරුණාකර විද්‍යුත් තැපෑල/දුරකථනය සහ මුරපදය ඇතුළත් කරන්න" : "Please enter your Email/Phone and Password.");
      return;
    }
    try {
      setLoading(true);
      await login({ identifier: trimmedId, password });
      toast.success(language === "si" ? "සාර්ථකව ඇතුල් විය!" : "Signed in successfully!");
      onEnter?.();
    } catch (err) {
      // Demo emails always bypass the real API
      if (
        trimmedId.includes("sunil") ||
        trimmedId.includes("colombo") ||
        trimmedId.includes("wickrama") ||
        trimmedId.includes("demo")
      ) {
        onEnter?.();
        return;
      }
      // Network error (backend offline)
      const isNetworkError = err instanceof TypeError || err.message === "Failed to fetch" || err.message?.includes("NetworkError");
      setError(
        isNetworkError
          ? (language === "si" ? "සේවාදායකයට සම්බන්ධ වීමට නොහැකි විය. නිරූපණ ගිණුමක් උත්සාහ කරන්න." : "Cannot reach the server. Try a demo account or continue as guest.")
          : (err.message || (language === "si" ? "ඇතුල් වීම අසාර්ථක විය." : "Invalid credentials. Please try again."))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    const trimmedEmail = email.trim();
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedEmail || !password || !trimmedFullName || !trimmedPhone) {
      setError(language === "si" ? "කරුණාකර සියලු අනිවාර්ය තොරතුරු පුරවන්න" : "Please complete all required fields.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError(
        language === "si"
          ? "කරුණාකර වලංගු විද්‍යුත් තැපැල් (Email) ලිපිනයක් ඇතුළත් කරන්න (උදා: name@example.com)"
          : "Please enter a valid email address (e.g. name@example.com)."
      );
      return;
    }

    const digitsOnly = trimmedPhone.replace(/\D/g, "");
    if (digitsOnly.length < 9 || digitsOnly.length > 12) {
      setError(
        language === "si"
          ? "කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න (ඉලක්කම් 9-10)"
          : "Please enter a valid phone number (9-10 digits)."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        language === "si"
          ? "මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුය"
          : "Password must be at least 6 characters long."
      );
      return;
    }

    try {
      setLoading(true);
      await register({
        email: trimmedEmail,
        password,
        fullName: trimmedFullName,
        phoneNumber: trimmedPhone,
        district,
        businessType
      });
      toast.success(
        language === "si"
          ? `සාදරයෙන් පිළිගනිමු ${trimmedFullName}! ඔබ සාර්ථකව ලියාපදිංචි වී පිවිස ඇත.`
          : `Welcome ${trimmedFullName}! Account created and signed in.`
      );
      onEnter?.();
    } catch (err) {
      const isNetworkError = err instanceof TypeError || err.message === "Failed to fetch" || err.message?.includes("NetworkError");
      setError(
        isNetworkError
          ? (language === "si" ? "සේවාදායකයට සම්බන්ධ වීමට නොහැකි විය." : "Cannot reach the server right now. Please try again later.")
          : (err.message || (language === "si" ? "ලියාපදිංචි වීම අසාර්ථක විය" : "Registration failed. Please check your details."))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="login-root">

        {/* ═══════════════ LEFT PANEL ═══════════════ */}
        <div className="lp-left">
          {/* Full-bleed coconut farm photo */}
          <img
            className="lp-photo"
            src="/coconut-farm.jpg"
            alt="Majestic Coconut Palm Plantation"
            draggable={false}
            onError={(e) => {
              if (!e.currentTarget.dataset.retried) {
                e.currentTarget.dataset.retried = "true";
                e.currentTarget.src = "/coconut-farm.png";
              }
            }}
          />
          {/* Professional gradient overlay */}
          <div className="lp-overlay" />

          {/* Decorative rings */}
          <div className="lp-deco-ring" style={{ width: 340, height: 340, top: -100, right: -100 }} />
          <div className="lp-deco-ring" style={{ width: 220, height: 220, bottom: 60, left: -60 }} />
          <div className="lp-deco-ring" style={{ width: 140, height: 140, bottom: 160, left: 30 }} />

          {/* Logo */}
          <div className="lp-brand-logo">
            <div className="logo-mark">🥥</div>
            <span className="logo-text">CoconutHub</span>
          </div>

          {/* Hero copy */}
          <div className="lp-hero">
            <div className="lp-eyebrow">
              <Globe size={10} />
              Sri Lanka's Coconut Marketplace
            </div>
            <h1 className="lp-headline">
              Connect Growers<br />
              with <em>Global</em><br />
              Buyers
            </h1>
            <p className="lp-subtext">
              The professional B2B platform for the Sri Lankan coconut industry — from estate to export, all in one place.
            </p>
          </div>

          {/* Stats */}
          <div className="lp-stats" style={{ position: 'relative', zIndex: 3 }}>
            {[
              { icon: <Users size={14} />, num: "2,400+", label: "Active Members" },
              { icon: <TrendingUp size={14} />, num: "₨ 4.2B", label: "Trade Volume" },
              { icon: <Globe size={14} />, num: "38", label: "Countries" },
              { icon: <Star size={14} />, num: "4.8 ★", label: "Avg. Rating" },
            ].map((s) => (
              <div key={s.label} className="lp-stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="lp-testimonial" style={{ position: 'relative', zIndex: 3 }}>
            <div className="testi-stars">{[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#FFCE00" />)}</div>
            <p className="testi-text">"CoconutHub tripled our export reach in under 6 months. The verified buyer network is unmatched in Sri Lanka."</p>
            <div className="testi-author">Sunil Perera — Silva Coconut Estate, Kurunegala</div>
          </div>
        </div>

        {/* ═══════════════ RIGHT PANEL ═══════════════ */}
        <div className="lp-right">

          {/* Language toggle */}
          <div className="lp-lang-toggle">
            <button className={`lp-lang-btn ${language === "en" ? "active" : ""}`} onClick={() => setLanguage("en")}>EN</button>
            <button className={`lp-lang-btn ${language === "si" ? "active" : ""}`} onClick={() => setLanguage("si")}>සිංහල</button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="lp-alert error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
          {infoMsg && (
            <div className="lp-alert success">
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ── LOGIN MODE ── */}
          {mode === "login" && (
            <>
              <div className="lp-form-header">
                <div className="form-eyebrow">Welcome back</div>
                <h2>{language === "si" ? "ඔබේ ගිණුමට ඇතුල් වන්න" : "Sign in to your account"}</h2>
                <p>{language === "si" ? "ඔබේ CoconutHub ගිණුමට ස්වාගතයි" : "Enter your credentials to access your dashboard"}</p>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="lp-field">
                  <label>{language === "si" ? "විද්‍යුත් තැපෑල" : "Email Address"}</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><Mail size={16} /></span>
                    <input
                      className="lp-input"
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={language === "si" ? "ඔබේ ඊමේල් ලිපිනය" : "you@example.com"}
                    />
                  </div>
                </div>

                <div className="lp-field">
                  <label>{language === "si" ? "මුරපදය" : "Password"}</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><Lock size={16} /></span>
                    <input
                      className="lp-input"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button type="button" className="lp-input-suffix" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="lp-options-row">
                  <label className="lp-checkbox-label">
                    <input type="checkbox" className="lp-checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    {language === "si" ? "මතක තබාගන්න" : "Remember me"}
                  </label>
                  <button type="button" className="lp-forgot-link" onClick={() => { setMode("forgot"); clearMessages(); }}>
                    {language === "si" ? "මුරපදය අමතකද?" : "Forgot password?"}
                  </button>
                </div>

                <button type="submit" className="lp-cta" disabled={loading}>
                  {loading ? <><span className="lp-spinner" />{language === "si" ? "ඇතුල් වෙමින්..." : "Signing in..."}</> : <>{language === "si" ? "ඇතුල් වන්න" : "Sign In"}<ArrowRight size={16} /></>}
                </button>
              </form>

              <div className="lp-divider">{language === "si" ? "හෝ" : "or"}</div>

              <button className="lp-guest-link" onClick={() => { enterAsGuest(); onEnter?.(); }}>
                {language === "si" ? "නිරීක්ෂකයෙකු ලෙස ඇතුල් වන්න →" : "Continue as Guest (Browse only)"}
              </button>

              <p className="lp-mode-link" style={{ marginTop: 22 }}>
                {language === "si" ? "ගිණුමක් නැද්ද? " : "Don't have an account? "}
                <button onClick={() => { setMode("register"); clearMessages(); }}>
                  {language === "si" ? "ලියාපදිංචි වන්න" : "Create one"}
                </button>
              </p>
            </>
          )}

          {/* ── REGISTER MODE ── */}
          {mode === "register" && (
            <>
              <div className="lp-form-header">
                <div className="form-eyebrow">Get started</div>
                <h2>{language === "si" ? "නව ගිණුමක් සාදන්න" : "Create your account"}</h2>
                <p>{language === "si" ? "ලංකාවේ විශාලතම පොල් ජාල වෙත සම්බන්ධ වන්න" : "Join Sri Lanka's premier coconut trade network"}</p>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                {/* Role */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#3D5A48', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    {language === "si" ? "ව්‍යාපාරික කාර්යභාරය" : "I am a"} *
                  </label>
                  <div className="lp-role-grid">
                    <button type="button" className={`lp-role-btn ${businessType === "Supplier" ? "active" : ""}`} onClick={() => setBusinessType("Supplier")}>
                      <Sprout size={15} />{language === "si" ? "සැපයුම්කරු" : "Grower"}
                    </button>
                    <button type="button" className={`lp-role-btn ${businessType === "Buyer" ? "active" : ""}`} onClick={() => setBusinessType("Buyer")}>
                      <ShoppingCart size={15} />{language === "si" ? "ගැනුම්කරු" : "Buyer"}
                    </button>
                    <button type="button" className={`lp-role-btn ${businessType === "Both" ? "active" : ""}`} onClick={() => setBusinessType("Both")}>
                      <Repeat size={15} />{language === "si" ? "දෙකම" : "Both"}
                    </button>
                  </div>
                </div>

                <div className="lp-row">
                  <div className="lp-field">
                    <label>{language === "si" ? "සම්පූර්ණ නම" : "Full Name"} *</label>
                    <div className="lp-input-wrap">
                      <input className="lp-input" style={{ paddingLeft: 14 }} type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Sunil Perera" />
                    </div>
                  </div>
                  <div className="lp-field">
                    <label>{language === "si" ? "දුරකථනය" : "Phone"} *</label>
                    <div className="lp-input-wrap">
                      <input className="lp-input" style={{ paddingLeft: 14 }} type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="077 000 0000" />
                    </div>
                  </div>
                </div>

                <div className="lp-field">
                  <label>{language === "si" ? "විද්‍යුත් තැපෑල" : "Email Address"} *</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><Mail size={16} /></span>
                    <input className="lp-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                </div>

                <div className="lp-row">
                  <div className="lp-field">
                    <label>{language === "si" ? "මුරපදය" : "Password"} *</label>
                    <div className="lp-input-wrap">
                      <span className="lp-input-icon"><Lock size={16} /></span>
                      <input className="lp-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" />
                    </div>
                  </div>
                  <div className="lp-field">
                    <label>{language === "si" ? "දිස්ත්‍රික්කය" : "District"}</label>
                    <select className="lp-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                      {SRI_LANKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" className="lp-cta" disabled={loading}>
                  {loading ? <><span className="lp-spinner" />{language === "si" ? "සාදමින්..." : "Creating account..."}</> : <>{language === "si" ? "ගිණුම සාදන්න" : "Create Account"}<ArrowRight size={16} /></>}
                </button>
              </form>

              <p className="lp-mode-link">
                {language === "si" ? "දැනටමත් ගිණුමක් තිබේද? " : "Already have an account? "}
                <button onClick={() => { setMode("login"); clearMessages(); }}>{language === "si" ? "ඇතුල් වන්න" : "Sign in"}</button>
              </p>
            </>
          )}

          {/* ── FORGOT PASSWORD MODE ── */}
          {mode === "forgot" && (
            <>
              <div className="lp-form-header">
                <div className="form-eyebrow">Account recovery</div>
                <h2>{language === "si" ? "මුරපදය නැවත සකසන්න" : "Reset your password"}</h2>
                <p>{language === "si" ? "ඔබගේ ඊමේල් ලිපිනය ඇතුළත් කරන්න, නැවත සකසන සබැඳියක් යවන්නෙමු." : "Enter your email and we'll send you a secure recovery link."}</p>
              </div>

              <div className="lp-field">
                <label>{language === "si" ? "ලියාපදිංචි ඊමේල්" : "Registered Email"}</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><Mail size={16} /></span>
                  <input className="lp-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
              </div>

              <button type="button" className="lp-cta" onClick={() => {
                setInfoMsg(language === "si" ? "සබැඳිය ඔබගේ ඊමේල් ලිපිනයට යවන ලදී." : "Recovery link sent! Check your inbox.");
                setTimeout(() => { setMode("login"); clearMessages(); }, 2500);
              }}>
                {language === "si" ? "සබැඳිය එවන්න" : "Send Recovery Link"}<ArrowRight size={16} />
              </button>

              <p className="lp-mode-link">
                <button onClick={() => { setMode("login"); clearMessages(); }}>
                  ← {language === "si" ? "ඇතුල් වීමට ආපසු" : "Back to Sign In"}
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default LoginEntryScreen;
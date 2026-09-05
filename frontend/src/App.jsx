import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { LoginEntryScreen } from "@/components/LoginEntryScreen";
import { PricesPage } from "@/pages/PricesPage";
import { MillsPage } from "@/pages/MillsPage";
import { MarketPage } from "@/pages/MarketPage";
import { ChatBoardPage } from "@/pages/ChatBoardPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AuthModal } from "@/components/AuthModal";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import { Toaster } from "@/components/ui/sonner";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, fontFamily: "sans-serif", maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🥥</div>
          <h2 style={{ color: "#004236", margin: "0 0 8px" }}>CoconutHub Interface Notice</h2>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 20px" }}>An unexpected render issue occurred: {this.state.error?.message || "Unknown error"}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ padding: "10px 20px", background: "#004236", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
          >
            Reload CoconutHub
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentUser, hasEnteredApp, enterAsGuest } = useAuth();

  // If user is not authenticated and hasn't explicitly entered as guest, show the split login entry screen
  if (!currentUser && !hasEnteredApp) {
    return <LoginEntryScreen onEnter={() => enterAsGuest()} />;
  }

  return (
    <ErrorBoundary>
      <AppLayout>
        <Routes>
          <Route path="/" element={<PricesPage />} />
          <Route path="/mills" element={<MillsPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/chat" element={<ChatBoardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </AppLayout>
      <AuthModal />
      <UserProfileDialog />
      <Toaster position="top-center" />
    </ErrorBoundary>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;



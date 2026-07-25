import React, { useState, useEffect } from "react";
import { User, CreateLeadPayload } from "./types";
import { api } from "./services/api";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomeView } from "./views/HomeView";
import { DashboardView } from "./views/DashboardView";
import { LoginView } from "./views/LoginView";
import { RegisterView } from "./views/RegisterView";
import { NotFoundView } from "./views/NotFoundView";

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || "/");
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Sync window path history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check express-session status on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const sessionData = await api.getAuthMe();
        if (sessionData.authenticated && sessionData.user) {
          setUser(sessionData.user);
        } else {
          setUser(null);
        }
        setIsOnline(true);
      } catch (err) {
        console.warn("Session check error", err);
        setIsOnline(false);
      } finally {
        setLoadingAuth(false);
      }
    }
    checkSession();
  }, []);

  // Handlers
  const handleLogin = async (email: string, pass: string): Promise<User> => {
    const res = await api.login(email, pass);
    if (res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error("Invalid response from auth server.");
  };

  const handleRegister = async (name: string, email: string, pass: string): Promise<User> => {
    const res = await api.register(name, email, pass);
    if (res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error("Invalid response from auth server.");
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    navigate("/");
  };

  const handleSubmitLead = async (payload: CreateLeadPayload): Promise<void> => {
    await api.createLead(payload);
  };

  // Render view router based on path
  const renderContent = () => {
    if (loadingAuth) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono font-bold text-gray-500 mt-4 uppercase">
            Initialising LeadFlow Express Session...
          </span>
        </div>
      );
    }

    switch (currentPath) {
      case "/":
        return (
          <HomeView
            onSubmitLead={handleSubmitLead}
            onNavigateToDashboard={() => navigate("/dashboard")}
          />
        );

      case "/dashboard":
        return (
          <DashboardView
            currentUser={user}
            onNavigateToLogin={() => navigate("/login")}
            onSimulate404={() => navigate("/simulate-404")}
          />
        );

      case "/login":
        return (
          <LoginView
            onLogin={handleLogin}
            onRegister={handleRegister}
            onNavigateToRegister={() => navigate("/register")}
            onSuccess={() => navigate("/dashboard")}
          />
        );

      case "/register":
        return (
          <RegisterView
            onLogin={handleLogin}
            onRegister={handleRegister}
            onNavigateToLogin={() => navigate("/login")}
            onSuccess={() => navigate("/dashboard")}
          />
        );

      case "/simulate-404":
        return (
          <NotFoundView
            onNavigate={navigate}
            reason="Simulated 404 & Network Connection Test Page requested by administrator."
          />
        );

      default:
        return (
          <NotFoundView
            onNavigate={navigate}
            reason={`The path "${currentPath}" does not exist on LeadFlow server.`}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] font-sans text-gray-900 antialiased selection:bg-emerald-100 selection:text-emerald-800">
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        user={user}
        onLogout={handleLogout}
        isOnline={isOnline}
      />

      <main className="flex-1 w-full flex flex-col">{renderContent()}</main>

      <Footer />
    </div>
  );
}

export default App;

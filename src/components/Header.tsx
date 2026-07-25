import React from "react";
import { User } from "../types";

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: User | null;
  onLogout: () => void;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  user,
  onLogout,
  isOnline = true,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => onNavigate("/")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-gray-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
              LeadFlow
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
              Enterprise CRM
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate("/")}
            className={`px-3.5 py-2 rounded-md font-medium text-sm transition-all ${
              currentPath === "/"
                ? "bg-emerald-50 text-emerald-800 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Client Intake
          </button>
          <button
            onClick={() => onNavigate("/dashboard")}
            className={`px-3.5 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-1.5 ${
              currentPath === "/dashboard"
                ? "bg-emerald-50 text-emerald-800 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Admin Dashboard
          </button>
          {/* <button
            onClick={() => onNavigate("/simulate-404")}
            className={`px-3.5 py-2 rounded-md font-medium text-sm transition-all ${
              currentPath === "/simulate-404"
                ? "bg-rose-50 text-rose-700 font-semibold"
                : "text-gray-500 hover:text-rose-600 hover:bg-rose-50/50"
            }`}
            title="Test 404 / Network error boundary handling"
          >
            Network / 404 State
          </button> */}
        </nav>

        {/* User / Auth Controls */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-600">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-500" : "bg-rose-500"
              }`}
            ></span>
            <span className="font-mono text-[11px]">
              {isOnline ? "SERVER OK" : "OFFLINE"}
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div
                onClick={() => onNavigate("/dashboard")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 cursor-pointer hover:bg-gray-200/80 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.substring(0, 2)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-gray-500 capitalize">
                    {user.role} Session
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-gray-200 hover:border-rose-200 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("/login")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPath === "/login"
                    ? "bg-emerald-700 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate("/register")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs hover:shadow transition-all"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

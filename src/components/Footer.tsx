import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
            LF
          </div>
          <span className="font-medium text-gray-700">LeadFlow Intelligence</span>
          <span>© 2026 MERN Architecture. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-emerald-700 transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-emerald-700 transition-colors">
            Terms of Service
          </a>
          <a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-emerald-700 transition-colors">
            Express Session Diagnostics
          </a>
        </div>
      </div>
    </footer>
  );
};

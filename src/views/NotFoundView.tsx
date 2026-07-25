import React, { useState } from "react";

interface NotFoundViewProps {
  onNavigate: (path: string) => void;
  reason?: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate, reason }) => {
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const testServerHealth = async () => {
    setIsTesting(true);
    setPingStatus(null);
    try {
      const start = Date.now();
      const res = await fetch("/api/health");
      const elapsed = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        setPingStatus(`🟢 Express Server Online (${elapsed}ms) — Session: ${data.sessionActive ? "Active" : "Guest"}`);
      } else {
        setPingStatus(`🔴 Server responded with Status ${res.status}`);
      }
    } catch (e: any) {
      setPingStatus(`🔴 Network Error: ${e.message || "Failed to reach server"}`);
    } finally {
      setIsTesting(false);
    }
  };

  const test404Endpoint = async () => {
    setIsTesting(true);
    setPingStatus(null);
    try {
      const res = await fetch("/api/test-404");
      const data = await res.json();
      setPingStatus(`🟠 Server 404 Response Received: "${data.error || "Route not found"}" (HTTP 404)`);
    } catch (e: any) {
      setPingStatus(`🔴 Server Request Failed: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-[#f7f9fb] px-4 pt-20 pb-12 text-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-200/80 p-8 space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-extrabold text-2xl shadow-xs">
          404
        </div>

        <div>
          <span className="text-xs font-mono font-semibold text-rose-600 uppercase tracking-widest block mb-1">
            Pipeline Route Error or Connection Disruption
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Lost in the Pipeline?
          </h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {reason || "The requested route or server endpoint could not be found, or a temporary network error interrupted session sync."}
          </p>
        </div>

        {/* Diagnostic Action Box */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between font-mono text-[11px] font-bold text-gray-700">
            <span>EXPRESS SERVER DIAGNOSTICS</span>
            <span className="text-emerald-700">PORT 3000</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={testServerHealth}
              disabled={isTesting}
              className="px-3 py-2 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isTesting ? "Testing..." : "Ping /api/health"}
            </button>

            <button
              onClick={test404Endpoint}
              disabled={isTesting}
              className="px-3 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Test Server 404 Endpoint
            </button>
          </div>

          {pingStatus && (
            <div className="p-3 bg-gray-900 text-emerald-400 font-mono text-[11px] rounded-lg border border-gray-800 break-words">
              {pingStatus}
            </div>
          )}
        </div>

        {/* Quick Recovery Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate("/dashboard")}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-800 transition-all cursor-pointer"
          >
            Return to Admin Dashboard
          </button>
          <button
            onClick={() => onNavigate("/")}
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-800 font-bold text-xs rounded-xl border border-gray-200 hover:bg-gray-200 transition-all cursor-pointer"
          >
            Go to Client Intake Home
          </button>
        </div>
      </div>
    </div>
  );
};

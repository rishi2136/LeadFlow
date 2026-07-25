import React from "react";
import { LeadFormik } from "../components/LeadFormik";
import { CreateLeadPayload } from "../types";

interface HomeViewProps {
  onSubmitLead: (payload: CreateLeadPayload) => Promise<void>;
  onNavigateToDashboard: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSubmitLead, onNavigateToDashboard }) => {
  return (
    <div className="flex flex-col w-full bg-[#f7f9fb] min-h-screen">
      {/* Hero & Form Intake Section */}
      <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background SVG abstract decoration */}
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full fill-emerald-800" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M100 0 L100 100 L0 100 Q50 50 100 0 Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Hero Content Column */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-mono font-semibold uppercase tracking-widest w-max">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Efficiency Reimagined
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.12]">
              Turn every interaction into <span className="text-emerald-700 italic font-serif">measurable</span> growth.
            </h1>

            <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
              LeadFlow is the quiet engine behind the world's most high-velocity sales teams. No clutter, no friction—just pure lead conversion and seamless MERN CRM intelligence.
            </p>

            <div className="flex items-center gap-8 pt-2">
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-gray-900">12k+</span>
                <span className="text-xs uppercase font-mono tracking-wider text-gray-500">Leads Processed</span>
              </div>
              <div className="h-10 w-[1px] bg-gray-200"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-gray-900">99.9%</span>
                <span className="text-xs uppercase font-mono tracking-wider text-gray-500">Uptime Reliability</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onNavigateToDashboard}
                className="px-6 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all text-sm flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Access Admin CRM Dashboard</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Formik Lead Intake Column */}
          <div className="lg:col-span-6 lg:col-start-7">
            <LeadFormik onSubmitLead={onSubmitLead} />
          </div>
        </div>
      </section>

      {/* Trusted By Enterprise Banner */}
      <section className="py-10 bg-gray-100/70 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Trusted by leading enterprises
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-60">
            <span className="font-extrabold text-xl tracking-tighter italic text-gray-700">VERIZON</span>
            <span className="font-extrabold text-xl tracking-tighter italic text-gray-700">SPHERE</span>
            <span className="font-extrabold text-xl tracking-tighter italic text-gray-700">NEXUS</span>
            <span className="font-extrabold text-xl tracking-tighter italic text-gray-700">ALTOS</span>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider block mb-2">
            Integrated Modules
          </span>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Designed for high-performance sales operations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6 font-bold">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Precision Analytics</h3>
              <p className="text-gray-600 text-sm max-w-md">
                Visualize the journey of every lead from first intake to final close. Our real-time pipeline tracking eliminates bottlenecks.
              </p>
            </div>
            {/* Visual chart mock */}
            <div className="absolute bottom-0 right-0 w-1/2 h-36 flex items-end gap-2 px-6 py-2 opacity-20 group-hover:opacity-30 transition-opacity">
              <div className="bg-emerald-600 w-full h-1/4 rounded-t-sm"></div>
              <div className="bg-emerald-600 w-full h-2/4 rounded-t-sm"></div>
              <div className="bg-emerald-600 w-full h-3/4 rounded-t-sm"></div>
              <div className="bg-emerald-600 w-full h-full rounded-t-sm"></div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 font-bold">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Ingestion</h3>
              <p className="text-gray-400 text-sm">
                Formik schema validation ensures clean data ingestion directly into express session CRM.
              </p>
            </div>
            <div className="pt-6 border-t border-gray-800 mt-6 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Zero-latency intake</span>
              <span>→</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
            <h4 className="font-bold text-gray-900 text-base mb-1">State Filtering</h4>
            <p className="text-xs text-gray-600">
              Categorize lead states smoothly between <span className="text-blue-700 font-semibold">New</span>, <span className="text-amber-700 font-semibold">Contacted</span>, and <span className="text-emerald-700 font-semibold">Closed</span>.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
            <h4 className="font-bold text-gray-900 text-base mb-1">Budget Thresholds</h4>
            <p className="text-xs text-gray-600">
              Filter pipelines instantly by <span className="font-semibold">$5k-$10k</span>, <span className="font-semibold">$10k-$50k</span>, or <span className="font-semibold">$50k+ Enterprise</span> budget tiers.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
            <h4 className="font-bold text-gray-900 text-base mb-1">Session Protection</h4>
            <p className="text-xs text-gray-600">
              Admin routes protected via Express session middleware with instant logout and profile switching.
            </p>
          </div>
        </div>
      </section>

      {/* Corporate Call to Action Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-800 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-200">
            Ready to convert?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Elevate your lead operation with LeadFlow.
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
            Experience complete connected MERN modules with zero clutter.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={onNavigateToDashboard}
              className="px-8 py-3.5 bg-white text-emerald-900 font-bold rounded-xl hover:bg-emerald-50 transition-all text-sm shadow-md cursor-pointer"
            >
              Open Admin Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

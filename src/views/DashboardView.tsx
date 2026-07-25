import React, { useState, useEffect, useMemo } from "react";
import { Lead, LeadStatus, LeadFilterState, CreateLeadPayload, User } from "../types";
import { api } from "../services/api";

interface DashboardViewProps {
  currentUser: User | null;
  onNavigateToLogin: () => void;
  onSimulate404: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigateToLogin,
  onSimulate404,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filterState, setFilterState] = useState<LeadFilterState>({
    search: "",
    status: "all",
    budget: "all",
    sortBy: "createdAt-desc",
  });

  // Stats State
  const [stats, setStats] = useState({
    totalPipeline: "$1.2M",
    newLeadsToday: 0,
    conversionRate: "0.0%",
    activeCampaigns: 12,
  });

  // Modal States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newNoteInput, setNewNoteInput] = useState<string>("");

  // New Lead Form State for Admin Creation
  const [newLeadForm, setNewLeadForm] = useState<CreateLeadPayload>({
    name: "",
    email: "",
    phone: "",
    company: "",
    budget: "$25,000",
    budgetCategory: "10k-50k",
    scope: "",
  });
  const [addLeadError, setAddLeadError] = useState<string | null>(null);

  // Diagnostics State
  const [healthInfo, setHealthInfo] = useState<{
    mongoConnected: boolean;
    sessionStore: string;
    status: string;
  }>({
    mongoConnected: false,
    sessionStore: "Loading...",
    status: "checking",
  });

  // Load Leads & Health Diagnostics from Server
  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLeads(filterState);
      setLeads(data.leads);

      const statsData = await api.getStats();
      setStats(statsData);

      const health = await api.getHealthDiagnostics();
      setHealthInfo(health);
    } catch (err: any) {
      setError(err.message || "Failed to load leads from express session backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [filterState.status, filterState.budget, filterState.sortBy]);

  // Handle client search input changes with responsive filtering
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (filterState.search.trim()) {
      const q = filterState.search.toLowerCase().trim();
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          (lead.company && lead.company.toLowerCase().includes(q))
      );
    }

    if (filterState.status !== "all") {
      result = result.filter((l) => l.status === filterState.status);
    }

    if (filterState.budget !== "all") {
      result = result.filter((l) => l.budgetCategory === filterState.budget);
    }

    return result;
  }, [leads, filterState.search, filterState.status, filterState.budget]);

  // Update Status handler
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const updated = await api.updateLeadStatus(leadId, newStatus);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(updated);
      }
      // Refresh stats
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (err: any) {
      alert(`Failed to update lead status: ${err.message}`);
    }
  };

  // Delete Lead handler
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead from the pipeline?")) return;
    try {
      await api.deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      if (selectedLead?.id === leadId) setSelectedLead(null);
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (err: any) {
      alert(`Failed to delete lead: ${err.message}`);
    }
  };

  // Add Custom Note
  const handleAddNote = async () => {
    if (!selectedLead || !newNoteInput.trim()) return;
    try {
      const updated = await api.updateLeadStatus(
        selectedLead.id,
        selectedLead.status,
        newNoteInput.trim()
      );
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updated : l)));
      setSelectedLead(updated);
      setNewNoteInput("");
    } catch (err: any) {
      alert(`Failed to append note: ${err.message}`);
    }
  };

  // Admin Create Lead Submit
  const handleCreateLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLeadError(null);
    if (!newLeadForm.name || !newLeadForm.email) {
      setAddLeadError("Name and email are required.");
      return;
    }
    try {
      const created = await api.createLead(newLeadForm);
      setLeads((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewLeadForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        budget: "$25,000",
        budgetCategory: "10k-50k",
        scope: "",
      });
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (err: any) {
      setAddLeadError(err.message || "Failed to create lead.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Company", "Budget", "Status", "Created At", "Scope"];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.phone || ""}"`,
      `"${l.company || ""}"`,
      `"${l.budget}"`,
      l.status,
      `"${l.createdAt}"`,
      `"${(l.scope || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leadflow_pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
            New
          </span>
        );
      case "contacted":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Contacted
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
            Closed
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#f7f9fb] min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Top Header & Admin Session Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest">
                Express Session Admin Panel
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                EXPRESS SESSION ACTIVE
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold flex items-center gap-1 ${
                  healthInfo.mongoConnected
                    ? "bg-purple-100 text-purple-900 border border-purple-200"
                    : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}
                title="Express Session Store engine"
              >
                <span>Store: {healthInfo.sessionStore}</span>
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              Lead Intelligence Pipeline
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium text-xs rounded-xl shadow-xs hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-emerald-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Lead</span>
            </button>
          </div>
        </div>

        {/* Pipeline Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs relative overflow-hidden">
            <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Total Pipeline Value
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{stats.totalPipeline}</span>
              <span className="text-xs font-bold text-emerald-700">+12% MoM</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Sum of active & closed deals</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs border-l-4 border-l-blue-500">
            <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              New Leads Ingested
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{stats.newLeadsToday}</span>
              <span className="text-xs text-blue-700 font-semibold">Requires Outreach</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Status: New</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
            <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Conversion Rate
            </span>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-gray-900">{stats.conversionRate}</span>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: stats.conversionRate }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-xs font-mono font-semibold text-emerald-200 uppercase tracking-wider">
              Active Campaigns
            </span>
            <div className="mt-2">
              <span className="text-3xl font-extrabold">{stats.activeCampaigns}</span>
              <p className="text-xs text-emerald-100 mt-1">Direct Web Intake + API</p>
            </div>
          </div>
        </div>

        {/* Filter & Live Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input: Search by Name and Email */}
            <div className="relative w-full lg:w-96">
              <svg
                className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search leads by name, email or company..."
                value={filterState.search}
                onChange={(e) => setFilterState((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
              {filterState.search && (
                <button
                  onClick={() => setFilterState((prev) => ({ ...prev, search: "" }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filters: State of lead and Budget */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* State Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">State:</label>
                <select
                  value={filterState.status}
                  onChange={(e) =>
                    setFilterState((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-700 cursor-pointer"
                >
                  <option value="all">All States (New / Contacted / Closed)</option>
                  <option value="new">State: New</option>
                  <option value="contacted">State: Contacted</option>
                  <option value="closed">State: Closed</option>
                </select>
              </div>

              {/* Budget Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Budget:</label>
                <select
                  value={filterState.budget}
                  onChange={(e) =>
                    setFilterState((prev) => ({
                      ...prev,
                      budget: e.target.value as any,
                    }))
                  }
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-700 cursor-pointer"
                >
                  <option value="all">Any Budget Tier</option>
                  <option value="5k-10k">$5,000 — $10,000</option>
                  <option value="10k-50k">$10,000 — $50,000</option>
                  <option value="50k+">$50,000+ Enterprise</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadLeads}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors cursor-pointer"
                title="Reload leads from express server"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner if API error */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <div>
              <span className="font-bold">Backend Connection Alert:</span> {error}
            </div>
            <button
              onClick={onSimulate404}
              className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700"
            >
              View 404 / Network Diagnostic Page
            </button>
          </div>
        )}

        {/* Leads Table Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
              Leads Data Matrix ({filteredLeads.length} of {leads.length})
            </span>
            <span className="text-xs text-gray-400">Click lead row to inspect details</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200/60 bg-gray-50 text-[11px] font-mono text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6 font-semibold">Lead Details</th>
                  <th className="py-3.5 px-6 font-semibold">Company / Phone</th>
                  <th className="py-3.5 px-6 font-semibold">Budget Tier</th>
                  <th className="py-3.5 px-6 font-semibold">State / Status</th>
                  <th className="py-3.5 px-6 font-semibold">Created Date</th>
                  <th className="py-3.5 px-6 font-semibold text-right">State Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-emerald-700" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading leads from server...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <p className="font-semibold text-gray-700">No matching leads found.</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your search query or state/budget filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Name & Email */}
                      <td
                        onClick={() => setSelectedLead(lead)}
                        className="py-4 px-6 font-medium text-gray-900"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {lead.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {lead.name}
                            </p>
                            <p className="text-xs text-gray-500">{lead.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company & Phone */}
                      <td
                        onClick={() => setSelectedLead(lead)}
                        className="py-4 px-6 text-gray-600 text-xs"
                      >
                        <p className="font-medium text-gray-800">{lead.company || "Direct Intake"}</p>
                        <p className="text-gray-400 font-mono">{lead.phone || "—"}</p>
                      </td>

                      {/* Budget */}
                      <td
                        onClick={() => setSelectedLead(lead)}
                        className="py-4 px-6 font-semibold text-gray-900"
                      >
                        <span>{lead.budget}</span>
                        <span className="block text-[10px] text-gray-400 uppercase font-mono font-normal">
                          {lead.budgetCategory}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td
                        onClick={() => setSelectedLead(lead)}
                        className="py-4 px-6"
                      >
                        {getStatusBadge(lead.status)}
                      </td>

                      {/* Created Date */}
                      <td
                        onClick={() => setSelectedLead(lead)}
                        className="py-4 px-6 text-xs text-gray-500 font-mono"
                      >
                        {new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* State Modifier Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        {/* State Dropdown Selector */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-700 cursor-pointer shadow-2xs"
                        >
                          <option value="new">State: New</option>
                          <option value="contacted">State: Contacted</option>
                          <option value="closed">State: Closed</option>
                        </select>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLead(lead.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Lead"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* LEAD DETAIL MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                  Lead File #{selectedLead.id}
                </span>
                <h3 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h3>
                <p className="text-xs text-gray-500">{selectedLead.email} • {selectedLead.phone}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-2"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block font-mono uppercase text-[10px]">Company</span>
                <span className="font-bold text-gray-800">{selectedLead.company || "Independent"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-mono uppercase text-[10px]">Budget</span>
                <span className="font-bold text-emerald-800">{selectedLead.budget}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-mono uppercase text-[10px]">Current State</span>
                <span className="mt-1 block">{getStatusBadge(selectedLead.status)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">Project Scope & Description</h4>
              <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-700 leading-relaxed border border-gray-200/60">
                {selectedLead.scope}
              </div>
            </div>

            {/* Notes & Activity Log */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Activity Timeline & Notes</h4>
              <div className="space-y-2 mb-4 max-h-36 overflow-y-auto">
                {selectedLead.notes && selectedLead.notes.length > 0 ? (
                  selectedLead.notes.map((note, idx) => (
                    <div key={idx} className="p-2.5 bg-gray-100/70 rounded-lg text-xs text-gray-700">
                      {note}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No activity notes recorded yet.</p>
                )}
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a custom log note..."
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-emerald-700"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-lg hover:bg-emerald-800 cursor-pointer"
                >
                  Append Note
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW LEAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Add Lead to CRM</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            {addLeadError && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded border border-rose-200">
                {addLeadError}
              </p>
            )}

            <form onSubmit={handleCreateLeadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Smith"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="Acme Inc"
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 555-0000"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Budget Tier</label>
                <select
                  value={newLeadForm.budget}
                  onChange={(e) => {
                    const b = e.target.value;
                    let cat: "5k-10k" | "10k-50k" | "50k+" = "10k-50k";
                    if (b === "$8,000") cat = "5k-10k";
                    if (b === "$60,000") cat = "50k+";
                    setNewLeadForm({ ...newLeadForm, budget: b, budgetCategory: cat });
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-700"
                >
                  <option value="$8,000">$8,000 ($5k-$10k)</option>
                  <option value="$25,000">$25,000 ($10k-$50k)</option>
                  <option value="$60,000">$60,000 ($50k+ Enterprise)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Project Scope</label>
                <textarea
                  rows={2}
                  placeholder="Lead details or intake requirements..."
                  value={newLeadForm.scope}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, scope: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-700 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold text-xs rounded-lg hover:bg-emerald-800 shadow-xs cursor-pointer"
                >
                  Add Lead to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

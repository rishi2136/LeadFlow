import {
  Lead,
  LeadStatus,
  LeadFilterState,
  CreateLeadPayload,
  AuthSessionResponse,
} from "../types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const api = {
  // --- AUTH ENDPOINTS ---
  async getAuthMe(): Promise<AuthSessionResponse> {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new ApiError(`Auth check failed with status ${res.status}`, res.status);
      }
      return await res.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network Error: Unable to communicate with LeadFlow auth server.", 500);
    }
  },

  async login(email: string, password: string): Promise<AuthSessionResponse> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new ApiError(data.message || "Invalid credentials", res.status);
      }
      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network Error: Authentication service unreachable.", 500);
    }
  },

  async register(name: string, email: string, password: string): Promise<AuthSessionResponse> {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new ApiError(data.message || "Registration failed", res.status);
      }
      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network Error: Registration server unreachable.", 500);
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("Logout network request warning", e);
    }
  },

  // --- LEADS ENDPOINTS ---
  async getLeads(filters?: Partial<LeadFilterState>): Promise<{ total: number; filteredCount: number; leads: Lead[] }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status && filters.status !== "all") params.append("status", filters.status);
      if (filters?.budget && filters.budget !== "all") params.append("budget", filters.budget);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);

      const url = `/api/leads?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new ApiError(`Failed to fetch leads (Status: ${res.status})`, res.status);
      }
      return await res.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network Connection Issue: Unable to load leads database.", 503);
    }
  },

  async getStats(): Promise<{
    totalPipeline: string;
    totalPipelineRaw: number;
    newLeadsToday: number;
    conversionRate: string;
    activeCampaigns: number;
  }> {
    try {
      const res = await fetch("/api/leads/stats", { credentials: "include" });
      if (!res.ok) {
        throw new ApiError("Failed to fetch lead stats", res.status);
      }
      return await res.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network Error fetching stats", 500);
    }
  },

  async getHealthDiagnostics(): Promise<{
    status: string;
    mongoConnected: boolean;
    sessionStore: string;
    mongoUrl: string;
  }> {
    try {
      const res = await fetch("/api/health", { credentials: "include" });
      if (!res.ok) throw new ApiError("Failed to fetch health diagnostics", res.status);
      return await res.json();
    } catch (err) {
      return {
        status: "offline",
        mongoConnected: false,
        sessionStore: "MemoryStore (Fallback)",
        mongoUrl: "Disconnected",
      };
    }
  },

  async createLead(payload: CreateLeadPayload): Promise<Lead> {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new ApiError(data.message || "Failed to submit lead", res.status);
      }
      return data.lead;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network Error: Could not reach intake server to save lead.", 503);
    }
  },

  async updateLeadStatus(id: string, status: LeadStatus, note?: string): Promise<Lead> {
    try {
      const res = await fetch(`/api/leads/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new ApiError(data.message || "Failed to update lead status", res.status);
      }
      return data.lead;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network Error updating status.", 500);
    }
  },

  async deleteLead(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new ApiError("Failed to delete lead", res.status);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network Error deleting lead.", 500);
    }
  },

  // Test 404 endpoint for manual testing of Network/Server 404 issue handling
  async trigger404Test(): Promise<never> {
    const res = await fetch("/api/test-404", { credentials: "include" });
    throw new ApiError("404 Route Not Found: /api/test-404", res.status);
  },
};

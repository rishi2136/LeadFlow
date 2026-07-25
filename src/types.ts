export type LeadStatus = 'new' | 'contacted' | 'closed';

export type BudgetCategory = '5k-10k' | '10k-50k' | '50k+';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget: string;
  budgetCategory: BudgetCategory;
  budgetNumeric: number;
  status: LeadStatus;
  scope: string;
  createdAt: string;
  notes?: string[];
  assignedTo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  avatarUrl?: string;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user: User | null;
  message?: string;
}

export interface LeadFilterState {
  search: string;
  status: 'all' | LeadStatus;
  budget: 'all' | BudgetCategory;
  sortBy: 'createdAt-desc' | 'createdAt-asc' | 'budget-desc' | 'budget-asc' | 'name-asc';
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget: string;
  budgetCategory: BudgetCategory;
  scope: string;
}

export interface UpdateLeadStatusPayload {
  status: LeadStatus;
  notes?: string;
}

import { Router, Request, Response } from "express";
import { getDbStatus } from "../db/connection";
import { LeadModel } from "../models/Lead";

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  budget: string;
  budgetCategory: "5k-10k" | "10k-50k" | "50k+";
  budgetNumeric: number;
  status: "new" | "contacted" | "closed";
  scope: string;
  createdAt: string;
  notes: string[];
  assignedTo?: string;
}

// In-Memory Seed Database Fallback
let inMemoryLeads: LeadRecord[] = [
  {
    id: "lead-101",
    name: "Jordan Smith",
    email: "jordan@nexuscorp.com",
    phone: "+1 (555) 234-5678",
    company: "Nexus Corp",
    budget: "$42,500",
    budgetCategory: "10k-50k",
    budgetNumeric: 42500,
    status: "closed",
    scope: "Enterprise Sales Automation platform integration with custom Salesforce sync.",
    createdAt: "2026-07-20T10:30:00Z",
    notes: ["Initial call completed on July 21st.", "Contract signed on July 24th."],
    assignedTo: "Alexander Wright",
  },
  {
    id: "lead-102",
    name: "Elena Martinez",
    email: "elena.m@startup.io",
    phone: "+1 (555) 876-5432",
    company: "Startup.io",
    budget: "$8,200",
    budgetCategory: "5k-10k",
    budgetNumeric: 8200,
    status: "new",
    scope: "Inbound funnel setup for B2B SaaS startup launching next month.",
    createdAt: "2026-07-24T08:15:00Z",
    notes: ["Lead generated via landing page form."],
    assignedTo: "Sarah LeadManager",
  },
  {
    id: "lead-103",
    name: "Thomas Wright",
    email: "t.wright@global-sys.com",
    phone: "+1 (555) 345-6789",
    company: "Global Systems",
    budget: "$15,000",
    budgetCategory: "10k-50k",
    budgetNumeric: 15000,
    status: "contacted",
    scope: "Pro Tier workflow audit and multi-seat CRM onboarding.",
    createdAt: "2026-07-23T14:45:00Z",
    notes: ["Demo scheduled for tomorrow 2:00 PM."],
    assignedTo: "Alexander Wright",
  },
  {
    id: "lead-104",
    name: "Sarah Chen",
    email: "schen@designly.com",
    phone: "+1 (555) 987-6543",
    company: "Designly Studio",
    budget: "$55,000",
    budgetCategory: "50k+",
    budgetNumeric: 55000,
    status: "closed",
    scope: "Full stack pipeline modernization, custom dashboard design, and API Webhooks.",
    createdAt: "2026-07-19T11:20:00Z",
    notes: ["Exceeded Q3 conversion goal."],
    assignedTo: "Alexander Wright",
  },
  {
    id: "lead-105",
    name: "Marcus Vance",
    email: "marcus@vancemedia.co",
    phone: "+1 (555) 432-1098",
    company: "Vance Media",
    budget: "$28,000",
    budgetCategory: "10k-50k",
    budgetNumeric: 28000,
    status: "new",
    scope: "Lead enrichment pipeline and AI categorization for high volume ad campaigns.",
    createdAt: "2026-07-24T18:00:00Z",
    notes: ["Requires urgent response."],
  },
  {
    id: "lead-106",
    name: "Amara Patel",
    email: "a.patel@fintechpulse.com",
    phone: "+1 (555) 654-3210",
    company: "FintechPulse",
    budget: "$65,000",
    budgetCategory: "50k+",
    budgetNumeric: 65000,
    status: "contacted",
    scope: "Bank-grade encrypted lead capture with custom compliance data retention.",
    createdAt: "2026-07-22T09:10:00Z",
    notes: ["Security review in progress with IT team."],
    assignedTo: "Sarah LeadManager",
  },
  {
    id: "lead-107",
    name: "David Miller",
    email: "dmiller@apexlogistics.net",
    phone: "+1 (555) 789-0123",
    company: "Apex Logistics",
    budget: "$9,500",
    budgetCategory: "5k-10k",
    budgetNumeric: 9500,
    status: "new",
    scope: "Real-time dispatch intake form and automated SMS follow-up.",
    createdAt: "2026-07-24T21:00:00Z",
    notes: [],
  },
];

const router = Router();

// GET all leads with filtering
router.get("/", async (req: Request, res: Response) => {
  const dbStatus = getDbStatus();

  let leads: LeadRecord[] = [];

  if (dbStatus.isMongoConnected) {
    try {
      const docs = await LeadModel.find().lean();
      leads = docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone || "",
        company: doc.company || "",
        budget: doc.budget,
        budgetCategory: doc.budgetCategory as any,
        budgetNumeric: doc.budgetNumeric,
        status: doc.status as any,
        scope: doc.scope,
        createdAt: doc.createdAt,
        notes: doc.notes || [],
        assignedTo: doc.assignedTo,
      }));
      // If MongoDB is empty, seed initial data
      if (leads.length === 0) {
        await LeadModel.insertMany(inMemoryLeads as any);
        leads = [...inMemoryLeads];
      }
    } catch (e) {
      leads = [...inMemoryLeads];
    }
  } else {
    leads = [...inMemoryLeads];
  }

  let result = [...leads];
  const { search, status, budget, sortBy } = req.query;

  // Search filter
  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (status && typeof status === "string" && status !== "all") {
    result = result.filter((lead) => lead.status === status);
  }

  // Budget filter
  if (budget && typeof budget === "string" && budget !== "all") {
    if (budget === "low" || budget === "5k-10k") {
      result = result.filter((lead) => lead.budgetNumeric < 10000);
    } else if (budget === "mid" || budget === "10k-50k") {
      result = result.filter(
        (lead) => lead.budgetNumeric >= 10000 && lead.budgetNumeric <= 50000
      );
    } else if (budget === "high" || budget === "50k+") {
      result = result.filter((lead) => lead.budgetNumeric > 50000);
    }
  }

  // Sorting
  if (sortBy === "createdAt-asc") {
    result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sortBy === "budget-desc") {
    result.sort((a, b) => b.budgetNumeric - a.budgetNumeric);
  } else if (sortBy === "budget-asc") {
    result.sort((a, b) => a.budgetNumeric - b.budgetNumeric);
  } else if (sortBy === "name-asc") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({
    total: leads.length,
    filteredCount: result.length,
    leads: result,
  });
});

// GET statistics
router.get("/stats", async (req: Request, res: Response) => {
  const dbStatus = getDbStatus();
  let leads: LeadRecord[] = inMemoryLeads;

  if (dbStatus.isMongoConnected) {
    try {
      const docs = await LeadModel.find().lean();
      if (docs.length > 0) {
        leads = docs as any;
      }
    } catch (e) {
      // fallback
    }
  }

  const totalPipelineNumeric = leads.reduce((acc, curr) => acc + (curr.budgetNumeric || 0), 0);
  const newLeadsCount = leads.filter((l) => l.status === "new").length;
  const closedCount = leads.filter((l) => l.status === "closed").length;
  const totalCount = leads.length;
  const conversionRate = totalCount > 0 ? ((closedCount / totalCount) * 100).toFixed(1) : "0.0";

  res.json({
    totalPipeline: `$${(totalPipelineNumeric / 1000000).toFixed(1)}M`,
    totalPipelineRaw: totalPipelineNumeric,
    newLeadsToday: newLeadsCount,
    conversionRate: `${conversionRate}%`,
    activeCampaigns: 12,
  });
});

// POST Create new lead (Form handling submission)
router.post("/", async (req: Request, res: Response) => {
  const { name, email, phone, company, budget, budgetCategory, scope } = req.body;

  if (!name || !email || !budget) {
    return res.status(400).json({
      message: "Missing required fields: name, email, and budget are mandatory.",
    });
  }

  let numeric = 10000;
  if (typeof budget === "string") {
    const cleaned = budget.replace(/[^0-9]/g, "");
    if (cleaned) numeric = parseInt(cleaned, 10);
    if (budget === "5k-10k") numeric = 7500;
    if (budget === "10k-50k") numeric = 25000;
    if (budget === "50k+") numeric = 60000;
  }

  let cat: "5k-10k" | "10k-50k" | "50k+" = "10k-50k";
  if (numeric < 10000) cat = "5k-10k";
  else if (numeric > 50000) cat = "50k+";

  const newLead: LeadRecord = {
    id: `lead-${Date.now()}`,
    name,
    email,
    phone: phone || "+1 (555) 000-0000",
    company: company || "Independent / Direct",
    budget: budget.startsWith("$") ? budget : `$${numeric.toLocaleString()}`,
    budgetCategory: budgetCategory || cat,
    budgetNumeric: numeric,
    status: "new",
    scope: scope || "Lead intake form submission.",
    createdAt: new Date().toISOString(),
    notes: [`Ingested via LeadFlow Formik intake form at ${new Date().toLocaleTimeString()}`],
  };

  const dbStatus = getDbStatus();
  if (dbStatus.isMongoConnected) {
    try {
      await LeadModel.create(newLead);
    } catch (err) {
      console.warn("MongoDB lead insertion failed, storing in memory:", err);
    }
  }

  inMemoryLeads.unshift(newLead);

  res.status(201).json({
    success: true,
    message: "Lead successfully recorded into pipeline.",
    lead: newLead,
  });
});

// PUT Update lead status
router.put("/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!["new", "contacted", "closed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  const dbStatus = getDbStatus();
  if (dbStatus.isMongoConnected) {
    try {
      const noteStr = note ? `[${new Date().toLocaleDateString()}] ${note}` : `[${new Date().toLocaleDateString()}] Status updated to ${status.toUpperCase()}`;
      await (LeadModel as any).findOneAndUpdate(
        { id },
        { status, $push: { notes: noteStr } },
        { new: true }
      );
    } catch (e) {
      // fallback
    }
  }

  const leadIndex = inMemoryLeads.findIndex((l) => l.id === id);
  if (leadIndex !== -1) {
    inMemoryLeads[leadIndex].status = status;
    if (note) {
      inMemoryLeads[leadIndex].notes.push(`[${new Date().toLocaleDateString()}] ${note}`);
    } else {
      inMemoryLeads[leadIndex].notes.push(`[${new Date().toLocaleDateString()}] Status updated to ${status.toUpperCase()}`);
    }
    return res.json({
      success: true,
      message: `Lead status updated to ${status}`,
      lead: inMemoryLeads[leadIndex],
    });
  }

  res.status(404).json({ message: `Lead with ID ${id} not found.` });
});

// DELETE Lead
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const dbStatus = getDbStatus();
  if (dbStatus.isMongoConnected) {
    try {
      await LeadModel.deleteOne({ id });
    } catch (e) {
      // fallback
    }
  }

  const initialLen = inMemoryLeads.length;
  inMemoryLeads = inMemoryLeads.filter((l) => l.id !== id);

  if (inMemoryLeads.length === initialLen) {
    return res.status(404).json({ message: "Lead not found." });
  }

  res.json({ success: true, message: "Lead deleted successfully." });
});

export default router;

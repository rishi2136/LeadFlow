import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget: string;
  budgetCategory: "5k-10k" | "10k-50k" | "50k+";
  budgetNumeric: number;
  status: "new" | "contacted" | "closed";
  scope: string;
  createdAt: string;
  notes: string[];
  assignedTo?: string;
}

const LeadSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    company: { type: String },
    budget: { type: String, required: true },
    budgetCategory: {
      type: String,
      enum: ["5k-10k", "10k-50k", "50k+"],
      required: true,
    },
    budgetNumeric: { type: Number, required: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
    scope: { type: String, required: true },
    createdAt: { type: String, required: true },
    notes: [{ type: String }],
    assignedTo: { type: String },
  },
  { timestamps: true }
);

export const LeadModel = mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ICondominium extends Document {
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  totalUnits: number;
  type: 'residential' | 'commercial' | 'mixed';
  
  // Settings
  settings: {
    billingCutoffDay: number; // Day of month for billing cutoff
    paymentDueDays: number; // Days after cutoff for payment
    currency: string;
    timezone: string;
    language: string;
  };
  
  // Contact
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  
  // Management company
  management: {
    companyName?: string;
    companyTaxId?: string;
    companyContact?: string;
  };
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Firebase UID
  lastModifiedBy?: string; // Firebase UID
}

const CondominiumSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  region: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: 'Chile' },
  totalUnits: { type: Number, required: true, min: 1 },
  type: { 
    type: String, 
    enum: ['residential', 'commercial', 'mixed'], 
    default: 'residential' 
  },
  
  settings: {
    billingCutoffDay: { type: Number, required: true, min: 1, max: 28, default: 1 },
    paymentDueDays: { type: Number, required: true, min: 1, default: 10 },
    currency: { type: String, default: 'CLP' },
    timezone: { type: String, default: 'America/Santiago' },
    language: { type: String, default: 'es' }
  },
  
  contact: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true }
  },
  
  management: {
    companyName: { type: String, trim: true },
    companyTaxId: { type: String, trim: true },
    companyContact: { type: String, trim: true }
  },
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Indexes
CondominiumSchema.index({ name: 1 });
CondominiumSchema.index({ isActive: 1 });
CondominiumSchema.index({ createdBy: 1 });

export default mongoose.model<ICondominium>('Condominium', CondominiumSchema);

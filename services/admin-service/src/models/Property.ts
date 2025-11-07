import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  condominiumId: mongoose.Types.ObjectId;
  number: string; // Unit number
  floor?: number;
  block?: string;
  type: 'apartment' | 'house' | 'commercial' | 'storage' | 'parking';
  
  // Dimensions
  squareMeters?: number;
  bedrooms?: number;
  bathrooms?: number;
  
  // Current owner
  owner?: {
    firebaseUid: string;
    name: string;
    email: string;
    phone?: string;
    taxId?: string;
    startDate: Date;
  };
  
  // Residents
  residents: Array<{
    firebaseUid: string;
    name: string;
    email: string;
    phone?: string;
    relationship: 'owner' | 'tenant' | 'family' | 'other';
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
  }>;
  
  // Financial settings
  financialSettings: {
    commonExpensePercentage: number; // Percentage of total
    isExempt: boolean;
    notes?: string;
  };
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

const PropertySchema: Schema = new Schema({
  condominiumId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Condominium', 
    required: true,
    index: true 
  },
  number: { type: String, required: true, trim: true },
  floor: { type: Number },
  block: { type: String, trim: true },
  type: { 
    type: String, 
    enum: ['apartment', 'house', 'commercial', 'storage', 'parking'],
    default: 'apartment'
  },
  
  squareMeters: { type: Number, min: 0 },
  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  
  owner: {
    firebaseUid: { type: String },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    taxId: { type: String, trim: true },
    startDate: { type: Date }
  },
  
  residents: [{
    firebaseUid: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    relationship: { 
      type: String, 
      enum: ['owner', 'tenant', 'family', 'other'],
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true }
  }],
  
  financialSettings: {
    commonExpensePercentage: { type: Number, required: true, min: 0, max: 100, default: 1 },
    isExempt: { type: Boolean, default: false },
    notes: { type: String, trim: true }
  },
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Compound indexes
PropertySchema.index({ condominiumId: 1, number: 1 }, { unique: true });
PropertySchema.index({ condominiumId: 1, isActive: 1 });
PropertySchema.index({ 'owner.firebaseUid': 1 });
PropertySchema.index({ 'residents.firebaseUid': 1 });

export default mongoose.model<IProperty>('Property', PropertySchema);

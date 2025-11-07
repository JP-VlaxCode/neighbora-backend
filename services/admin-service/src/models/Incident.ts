import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  condominiumId: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;
  
  // Basic information
  title: string;
  description: string;
  category: 'maintenance' | 'cleaning' | 'security' | 'noise' | 'water' | 'electricity' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  
  // Reporter
  reporter: {
    firebaseUid: string;
    name: string;
    email: string;
    phone?: string;
  };
  
  // Status
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  
  // Assignment
  assignedTo?: {
    firebaseUid: string;
    name: string;
    role: string;
  };
  
  // Tracking
  tracking: Array<{
    date: Date;
    action: string;
    description: string;
    performedBy: string; // Firebase UID
    userName: string;
  }>;
  
  // Attachments
  attachments: Array<{
    type: 'image' | 'document';
    url: string;
    name: string;
    uploadDate: Date;
  }>;
  
  // Resolution
  resolution?: {
    description: string;
    date: Date;
    resolvedBy: string; // Firebase UID
    userName: string;
    estimatedCost?: number;
    actualCost?: number;
  };
  
  // Dates
  reportDate: Date;
  assignmentDate?: Date;
  resolutionDate?: Date;
  closureDate?: Date;
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

const IncidentSchema: Schema = new Schema({
  condominiumId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Condominium', 
    required: true,
    index: true 
  },
  propertyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Property'
  },
  
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['maintenance', 'cleaning', 'security', 'noise', 'water', 'electricity', 'other'],
    required: true,
    index: true
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    required: true,
    default: 'medium',
    index: true
  },
  location: { type: String, required: true, trim: true },
  
  reporter: {
    firebaseUid: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true }
  },
  
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed', 'cancelled'],
    default: 'open',
    index: true
  },
  
  assignedTo: {
    firebaseUid: { type: String },
    name: { type: String, trim: true },
    role: { type: String, trim: true }
  },
  
  tracking: [{
    date: { type: Date, default: Date.now },
    action: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    performedBy: { type: String, required: true },
    userName: { type: String, required: true, trim: true }
  }],
  
  attachments: [{
    type: { 
      type: String, 
      enum: ['image', 'document'],
      required: true
    },
    url: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    uploadDate: { type: Date, default: Date.now }
  }],
  
  resolution: {
    description: { type: String, trim: true },
    date: { type: Date },
    resolvedBy: { type: String },
    userName: { type: String, trim: true },
    estimatedCost: { type: Number, min: 0 },
    actualCost: { type: Number, min: 0 }
  },
  
  reportDate: { type: Date, default: Date.now, index: true },
  assignmentDate: { type: Date },
  resolutionDate: { type: Date },
  closureDate: { type: Date },
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Compound indexes
IncidentSchema.index({ condominiumId: 1, status: 1, reportDate: -1 });
IncidentSchema.index({ condominiumId: 1, category: 1 });
IncidentSchema.index({ 'reporter.firebaseUid': 1 });
IncidentSchema.index({ 'assignedTo.firebaseUid': 1 });

export default mongoose.model<IIncident>('Incident', IncidentSchema);

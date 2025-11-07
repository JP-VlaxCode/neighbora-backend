import mongoose, { Schema, Document } from 'mongoose';

export interface ICommonExpense extends Document {
  condominiumId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  period: string; // YYYY-MM format
  
  // Amounts
  amounts: {
    commonExpense: number;
    reserveFund: number;
    water?: number;
    gas?: number;
    other?: number;
    total: number;
  };
  
  // Dates
  issueDate: Date;
  dueDate: Date;
  
  // Payment status
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  payments: Array<{
    amount: number;
    paymentDate: Date;
    paymentMethod: 'transfer' | 'cash' | 'check' | 'webpay' | 'other';
    receipt?: string;
    notes?: string;
    registeredBy: string; // Firebase UID
  }>;
  
  // Expense details
  expenseDetails: Array<{
    concept: string;
    category: string;
    amount: number;
    percentage?: number;
  }>;
  
  // Metadata
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

const CommonExpenseSchema: Schema = new Schema({
  condominiumId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Condominium', 
    required: true,
    index: true 
  },
  propertyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Property', 
    required: true,
    index: true 
  },
  period: { 
    type: String, 
    required: true,
    match: /^\d{4}-\d{2}$/ // YYYY-MM
  },
  
  amounts: {
    commonExpense: { type: Number, required: true, min: 0 },
    reserveFund: { type: Number, required: true, min: 0, default: 0 },
    water: { type: Number, min: 0 },
    gas: { type: Number, min: 0 },
    other: { type: Number, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue', 'partial'],
    default: 'pending',
    index: true
  },
  
  payments: [{
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true },
    paymentMethod: { 
      type: String, 
      enum: ['transfer', 'cash', 'check', 'webpay', 'other'],
      required: true
    },
    receipt: { type: String, trim: true },
    notes: { type: String, trim: true },
    registeredBy: { type: String, required: true }
  }],
  
  expenseDetails: [{
    concept: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, min: 0, max: 100 }
  }],
  
  notes: { type: String, trim: true },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Compound indexes
CommonExpenseSchema.index({ condominiumId: 1, period: 1 });
CommonExpenseSchema.index({ propertyId: 1, period: 1 }, { unique: true });
CommonExpenseSchema.index({ condominiumId: 1, status: 1 });
CommonExpenseSchema.index({ dueDate: 1 });

// Methods
CommonExpenseSchema.methods.getTotalPaid = function(): number {
  return this.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
};

CommonExpenseSchema.methods.getBalance = function(): number {
  return this.amounts.total - this.getTotalPaid();
};

export default mongoose.model<ICommonExpense>('CommonExpense', CommonExpenseSchema);

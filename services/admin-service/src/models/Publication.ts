import mongoose, { Schema, Document } from 'mongoose';

export interface IPublication extends Document {
  condominiumId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: 'notice' | 'emergency' | 'maintenance' | 'event' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Author
  author: {
    firebaseUid: string;
    name: string;
    role: 'admin' | 'staff' | 'resident';
  };
  
  // Attachments
  attachments: Array<{
    type: 'image' | 'document' | 'video';
    url: string;
    name: string;
    size: number; // bytes
  }>;
  
  // Visibility
  isVisible: boolean;
  publishDate: Date;
  expirationDate?: Date;
  
  // Interactions
  views: number;
  reactions: Array<{
    firebaseUid: string;
    type: 'like' | 'important' | 'useful';
    date: Date;
  }>;
  
  // Comments
  comments: Array<{
    firebaseUid: string;
    userName: string;
    content: string;
    date: Date;
    isEdited: boolean;
  }>;
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

const PublicationSchema: Schema = new Schema({
  condominiumId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Condominium', 
    required: true,
    index: true 
  },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['notice', 'emergency', 'maintenance', 'event', 'general'],
    required: true,
    index: true
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  author: {
    firebaseUid: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { 
      type: String, 
      enum: ['admin', 'staff', 'resident'],
      required: true
    }
  },
  
  attachments: [{
    type: { 
      type: String, 
      enum: ['image', 'document', 'video'],
      required: true
    },
    url: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    size: { type: Number, required: true, min: 0 }
  }],
  
  isVisible: { type: Boolean, default: true },
  publishDate: { type: Date, default: Date.now, index: true },
  expirationDate: { type: Date },
  
  views: { type: Number, default: 0, min: 0 },
  
  reactions: [{
    firebaseUid: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['like', 'important', 'useful'],
      required: true
    },
    date: { type: Date, default: Date.now }
  }],
  
  comments: [{
    firebaseUid: { type: String, required: true },
    userName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    isEdited: { type: Boolean, default: false }
  }],
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Indexes
PublicationSchema.index({ condominiumId: 1, publishDate: -1 });
PublicationSchema.index({ condominiumId: 1, category: 1 });
PublicationSchema.index({ condominiumId: 1, isVisible: 1, publishDate: -1 });

export default mongoose.model<IPublication>('Publication', PublicationSchema);

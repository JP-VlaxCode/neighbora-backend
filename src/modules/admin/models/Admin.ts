import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  firebaseUid: string;
  email: string;
  name?: string;
  role: 'admin' | 'superadmin';
  condominiumId?: mongoose.Types.ObjectId;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

const AdminSchema = new Schema<IAdmin>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      description: 'Firebase UID del usuario'
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      description: 'Email del administrador'
    },
    name: {
      type: String,
      description: 'Nombre del administrador'
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
      description: 'Rol del administrador'
    },
    condominiumId: {
      type: Schema.Types.ObjectId,
      ref: 'Condominium',
      description: 'Condominio al que pertenece (null = acceso global)'
    },
    permissions: {
      type: [String],
      default: [],
      description: 'Permisos específicos del administrador'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
      description: 'Si el administrador está activo'
    },
    createdBy: {
      type: String,
      description: 'UID del usuario que creó este registro'
    },
    lastModifiedBy: {
      type: String,
      description: 'UID del usuario que modificó este registro por última vez'
    }
  },
  {
    timestamps: true,
    collection: 'admins'
  }
);

// Índices compuestos
AdminSchema.index({ firebaseUid: 1, isActive: 1 });
AdminSchema.index({ condominiumId: 1, isActive: 1 });

export default mongoose.model<IAdmin>('Admin', AdminSchema);

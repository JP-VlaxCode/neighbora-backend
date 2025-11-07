import { Response } from 'express';
import { AuthRequest } from '@middleware/auth';
import Admin from '../models/Admin';
import { admin as firebaseAdmin } from '@config/firebaseAdmin';

/**
 * Verify if user is admin in MongoDB
 */
export const verifyAdminInDB = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        isAdmin: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Check if user is admin in MongoDB
    const adminRecord = await Admin.findOne({
      firebaseUid: userId,
      isActive: true
    });

    if (!adminRecord) {
      res.json({
        success: true,
        isAdmin: false,
        role: 'user'
      });
      return;
    }

    res.json({
      success: true,
      isAdmin: true,
      role: adminRecord.role,
      permissions: adminRecord.permissions
    });
  } catch (error: any) {
    console.error('Error verifying admin status:', error);
    res.status(500).json({
      success: false,
      isAdmin: false,
      message: 'Error verifying admin status',
      error: error.message
    });
  }
};

/**
 * Get all admins
 */
export const getAllAdmins = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admins = await Admin.find({ isActive: true })
      .select('-createdBy -lastModifiedBy')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: admins,
      total: admins.length
    });
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};

/**
 * Create new admin
 */
export const createAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firebaseUid, email, name, role = 'admin', condominiumId, permissions = [] } = req.body;
    const userId = req.user?.uid;

    if (!firebaseUid || !email) {
      res.status(400).json({
        success: false,
        message: 'firebaseUid and email are required'
      });
      return;
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ firebaseUid });
    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'Admin already exists'
      });
      return;
    }

    // Create admin in MongoDB
    const adminData = {
      firebaseUid,
      email,
      name,
      role,
      condominiumId,
      permissions,
      isActive: true,
      createdBy: userId
    };

    const newAdmin = new Admin(adminData);
    await newAdmin.save();

    // Also set Firebase custom claims
    try {
      await firebaseAdmin.auth().setCustomUserClaims(firebaseUid, {
        admin: true,
        superadmin: role === 'superadmin'
      });
      console.log(`✅ Firebase custom claims set for ${email}`);
    } catch (firebaseError) {
      console.warn(`⚠️  Could not set Firebase custom claims: ${firebaseError}`);
    }

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: newAdmin
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin',
      error: error.message
    });
  }
};

/**
 * Update admin
 */
export const updateAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, permissions, isActive } = req.body;
    const userId = req.user?.uid;

    const admin = await Admin.findByIdAndUpdate(
      id,
      {
        name,
        role,
        permissions,
        isActive,
        lastModifiedBy: userId
      },
      { new: true, runValidators: true }
    );

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: admin
    });
  } catch (error: any) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message
    });
  }
};

/**
 * Delete admin (soft delete)
 */
export const deleteAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const admin = await Admin.findByIdAndUpdate(
      id,
      {
        isActive: false,
        lastModifiedBy: userId
      },
      { new: true }
    );

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    // Remove Firebase custom claims
    try {
      await firebaseAdmin.auth().setCustomUserClaims(admin.firebaseUid, null);
      console.log(`✅ Firebase custom claims removed for ${admin.email}`);
    } catch (firebaseError) {
      console.warn(`⚠️  Could not remove Firebase custom claims: ${firebaseError}`);
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting admin',
      error: error.message
    });
  }
};

/**
 * Get admin by ID
 */
export const getAdminById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error: any) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin',
      error: error.message
    });
  }
};

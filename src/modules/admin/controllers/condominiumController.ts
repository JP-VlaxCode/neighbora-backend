import { Response } from 'express';
import { AuthRequest } from '../../../middleware/auth';
import Condominium from '../models/Condominium';
import Property from '../models/Property';

/**
 * Get user's condominium and property
 */
export const getUserCondominiumAndProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('🔍 getUserCondominiumAndProperty called');
    const userId = req.user?.uid;
    console.log('📌 User UID:', userId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Find property where user is owner or resident
    const property = await Property.findOne({
      isActive: true,
      $or: [
        { 'owner.firebaseUid': userId },
        { 'residents.firebaseUid': userId }
      ]
    });

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'No property found for this user'
      });
      return;
    }

    // Get the condominium
    const condominium = await Condominium.findById(property.condominiumId);

    if (!condominium) {
      res.status(404).json({
        success: false,
        message: 'Condominium not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        condominium,
        property
      }
    });
  } catch (error: any) {
    console.error('Error fetching user condominium and property:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching condominium and property',
      error: error.message
    });
  }
};

/**
 * Get all condominiums for the authenticated user
 */
export const getCondominiums = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;

    const condominiums = await Condominium.find({
      isActive: true,
      $or: [
        { createdBy: userId },
        // TODO: Add check for user access to condominium
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: condominiums
    });
  } catch (error: any) {
    console.error('Error fetching condominiums:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching condominiums',
      error: error.message
    });
  }
};

/**
 * Get condominium by ID
 */
export const getCondominiumById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const condominium = await Condominium.findById(id);

    if (!condominium) {
      res.status(404).json({
        success: false,
        message: 'Condominium not found'
      });
      return;
    }

    res.json({
      success: true,
      data: condominium
    });
  } catch (error: any) {
    console.error('Error fetching condominium:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching condominium',
      error: error.message
    });
  }
};

/**
 * Create new condominium
 */
export const createCondominium = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;

    const condominiumData = {
      ...req.body,
      createdBy: userId
    };

    const condominium = new Condominium(condominiumData);
    await condominium.save();

    res.status(201).json({
      success: true,
      message: 'Condominium created successfully',
      data: condominium
    });
  } catch (error: any) {
    console.error('Error creating condominium:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating condominium',
      error: error.message
    });
  }
};

/**
 * Update condominium
 */
export const updateCondominium = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const condominium = await Condominium.findByIdAndUpdate(
      id,
      {
        ...req.body,
        lastModifiedBy: userId
      },
      { new: true, runValidators: true }
    );

    if (!condominium) {
      res.status(404).json({
        success: false,
        message: 'Condominium not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Condominium updated successfully',
      data: condominium
    });
  } catch (error: any) {
    console.error('Error updating condominium:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating condominium',
      error: error.message
    });
  }
};

/**
 * Delete condominium (soft delete)
 */
export const deleteCondominium = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const condominium = await Condominium.findByIdAndUpdate(
      id,
      {
        isActive: false,
        lastModifiedBy: userId
      },
      { new: true }
    );

    if (!condominium) {
      res.status(404).json({
        success: false,
        message: 'Condominium not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Condominium deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting condominium:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting condominium',
      error: error.message
    });
  }
};

/**
 * Verify if user is admin
 */
export const verifyAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        isAdmin: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Check if user has admin or superadmin role
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    res.json({
      success: true,
      isAdmin,
      role: userRole || 'user'
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

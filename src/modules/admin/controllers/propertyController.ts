import { Response } from 'express';
import { AuthRequest } from '@middleware/auth';
import Property from '../models/Property';

/**
 * Get properties for authenticated user (owner or resident)
 */
export const getUserProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    console.log('🔍 getUserProperties called');
    console.log('📌 User UID:', userId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Find properties where user is owner or resident
    const properties = await Property.find({
      $or: [
        { 'owner.firebaseUid': userId },
        { 'residents.firebaseUid': userId }
      ],
      isActive: true
    })
      .select('_id number block type bedrooms bathrooms squareMeters')
      .sort({ number: 1 });

    console.log('✅ Properties found:', properties.length);

    res.status(200).json({
      success: true,
      data: {
        properties: properties.map(prop => ({
          id: prop._id,
          number: prop.number,
          block: prop.block,
          type: prop.type,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          squareMeters: prop.squareMeters
        }))
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting user properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving properties',
      error: error.message
    });
  }
};

/**
 * Get all properties for a condominium
 */
export const getProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { condominiumId } = req.params;

    const properties = await Property.find({
      condominiumId,
      isActive: true
    })
      .populate('condominiumId', 'name address')
      .sort({ number: 1 });

    res.json({
      success: true,
      data: properties
    });
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
};

/**
 * Get property by ID
 */
export const getPropertyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id).populate('condominiumId', 'name address');

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error: any) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message
    });
  }
};

/**
 * Create new property
 */
export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { condominiumId } = req.params;

    const propertyData = {
      ...req.body,
      condominiumId,
      createdBy: userId
    };

    const property = new Property(propertyData);
    await property.save();

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error: any) {
    console.error('Error creating property:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Property number already exists in this condominium'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error creating property',
      error: error.message
    });
  }
};

/**
 * Update property
 */
export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const property = await Property.findByIdAndUpdate(
      id,
      {
        ...req.body,
        lastModifiedBy: userId
      },
      { new: true, runValidators: true }
    );

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error: any) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message
    });
  }
};

/**
 * Delete property (soft delete)
 */
export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const property = await Property.findByIdAndUpdate(
      id,
      {
        isActive: false,
        lastModifiedBy: userId
      },
      { new: true }
    );

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message
    });
  }
};

/**
 * Add resident to property
 */
export const addResident = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const residentData = req.body;

    const property = await Property.findByIdAndUpdate(
      id,
      {
        $push: { residents: residentData }
      },
      { new: true }
    );

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Resident added successfully',
      data: property
    });
  } catch (error: any) {
    console.error('Error adding resident:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding resident',
      error: error.message
    });
  }
};

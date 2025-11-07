import { Response } from 'express';
import { AuthRequest } from '@middleware/auth';
import Property from '../models/Property';
import Condominium from '../models/Condominium';

/**
 * Get all residents for a condominium
 */
export const getCondominiumResidents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('🔍 getCondominiumResidents called');
    const { condominiumId } = req.params;
    const { status = 'active', page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Get all properties for the condominium
    const properties = await Property.find({ 
      condominiumId,
      isActive: true 
    })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Flatten residents from all properties
    const residents: any[] = [];
    properties.forEach(property => {
      property.residents?.forEach(resident => {
        if (status === 'active' && resident.isActive) {
          residents.push({
            ...resident,
            propertyId: property._id,
            propertyNumber: property.number,
            propertyBlock: property.block,
            propertyType: property.type
          });
        } else if (status === 'all') {
          residents.push({
            ...resident,
            propertyId: property._id,
            propertyNumber: property.number,
            propertyBlock: property.block,
            propertyType: property.type
          });
        }
      });
    });

    const total = residents.length;

    console.log('✅ Residents found:', residents.length);

    res.status(200).json({
      success: true,
      data: {
        residents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting residents:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving residents',
      error: error.message
    });
  }
};

/**
 * Get residents for a specific property
 */
export const getPropertyResidents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId).lean();

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        residents: property.residents || [],
        propertyNumber: property.number,
        propertyBlock: property.block
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting property residents:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving residents',
      error: error.message
    });
  }
};

/**
 * Add resident to property
 */
export const addResident = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { name, email, phone, relationship, firebaseUid } = req.body;

    if (!propertyId || !name || !email || !relationship) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    const property = await Property.findByIdAndUpdate(
      propertyId,
      {
        $push: {
          residents: {
            firebaseUid: firebaseUid || '',
            name,
            email,
            phone: phone || '',
            relationship,
            startDate: new Date(),
            isActive: true
          }
        }
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

    console.log('✅ Resident added to property:', propertyId);

    res.status(201).json({
      success: true,
      data: property.residents,
      message: 'Resident added successfully'
    });
  } catch (error: any) {
    console.error('❌ Error adding resident:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding resident',
      error: error.message
    });
  }
};

/**
 * Update resident
 */
export const updateResident = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId, residentEmail } = req.params;
    const { name, phone, relationship, isActive } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    const residentIndex = property.residents?.findIndex(r => r.email === residentEmail);

    if (residentIndex === -1 || residentIndex === undefined) {
      res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
      return;
    }

    // Update resident fields
    if (name) property.residents![residentIndex].name = name;
    if (phone) property.residents![residentIndex].phone = phone;
    if (relationship) property.residents![residentIndex].relationship = relationship;
    if (isActive !== undefined) property.residents![residentIndex].isActive = isActive;

    await property.save();

    console.log('✅ Resident updated:', residentEmail);

    res.status(200).json({
      success: true,
      data: property.residents,
      message: 'Resident updated successfully'
    });
  } catch (error: any) {
    console.error('❌ Error updating resident:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resident',
      error: error.message
    });
  }
};

/**
 * Remove resident from property
 */
export const removeResident = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId, residentEmail } = req.params;

    const property = await Property.findByIdAndUpdate(
      propertyId,
      {
        $pull: {
          residents: { email: residentEmail }
        }
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

    console.log('✅ Resident removed from property:', propertyId);

    res.status(200).json({
      success: true,
      data: property.residents,
      message: 'Resident removed successfully'
    });
  } catch (error: any) {
    console.error('❌ Error removing resident:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing resident',
      error: error.message
    });
  }
};

/**
 * Get resident statistics for condominium
 */
export const getResidentStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { condominiumId } = req.params;

    const properties = await Property.find({ 
      condominiumId,
      isActive: true 
    }).lean();

    let totalResidents = 0;
    let activeResidents = 0;
    const residentsByRelationship: { [key: string]: number } = {};

    properties.forEach(property => {
      property.residents?.forEach(resident => {
        totalResidents++;
        if (resident.isActive) activeResidents++;
        
        const rel = resident.relationship;
        residentsByRelationship[rel] = (residentsByRelationship[rel] || 0) + 1;
      });
    });

    res.status(200).json({
      success: true,
      data: {
        totalResidents,
        activeResidents,
        inactiveResidents: totalResidents - activeResidents,
        byRelationship: residentsByRelationship,
        totalProperties: properties.length
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting resident stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: error.message
    });
  }
};

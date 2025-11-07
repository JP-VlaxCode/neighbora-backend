import { Response } from 'express';
import { AuthRequest } from '@middleware/auth';
import Publication from '../models/Publication';
import Condominium from '../models/Condominium';

/**
 * Get all publications for a condominium
 */
export const getCondominiumPublications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('🔍 getCondominiumPublications called');
    // Support both params and query for condominiumId
    const condominiumId = req.params.condominiumId || req.query.condominiumId;
    const { category, priority, page = 1, limit = 20 } = req.query;

    if (!condominiumId) {
      res.status(400).json({
        success: false,
        message: 'condominiumId is required'
      });
      return;
    }

    const filter: any = { 
      condominiumId,
      isVisible: true,
      isActive: true
    };

    if (category) {
      filter.category = category;
    }

    if (priority) {
      filter.priority = priority;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const publications = await Publication.find(filter)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Publication.countDocuments(filter);

    console.log('✅ Publications found:', publications.length);

    res.status(200).json({
      success: true,
      data: {
        publications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting publications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving publications',
      error: error.message
    });
  }
};

/**
 * Get publication by ID
 */
export const getPublicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const publication = await Publication.findById(id).lean();

    if (!publication) {
      res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
      return;
    }

    // Increment views
    await Publication.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      data: publication
    });
  } catch (error: any) {
    console.error('❌ Error getting publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving publication',
      error: error.message
    });
  }
};

/**
 * Create publication (admin only)
 */
export const createPublication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { condominiumId, title, content, category, priority, attachments } = req.body;

    if (!condominiumId || !title || !content || !category) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    const publication = new Publication({
      condominiumId,
      title,
      content,
      category,
      priority: priority || 'medium',
      attachments: attachments || [],
      author: {
        firebaseUid: req.user?.uid,
        name: req.user?.name || 'Admin',
        role: 'admin'
      },
      isVisible: true,
      publishDate: new Date(),
      createdBy: req.user?.uid
    });

    await publication.save();

    console.log('✅ Publication created:', publication._id);

    res.status(201).json({
      success: true,
      data: publication,
      message: 'Publication created successfully'
    });
  } catch (error: any) {
    console.error('❌ Error creating publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating publication',
      error: error.message
    });
  }
};

/**
 * Update publication (admin only)
 */
export const updatePublication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, isVisible } = req.body;

    const publication = await Publication.findByIdAndUpdate(
      id,
      {
        title,
        content,
        category,
        priority,
        isVisible,
        lastModifiedBy: req.user?.uid
      },
      { new: true }
    );

    if (!publication) {
      res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
      return;
    }

    console.log('✅ Publication updated:', id);

    res.status(200).json({
      success: true,
      data: publication,
      message: 'Publication updated successfully'
    });
  } catch (error: any) {
    console.error('❌ Error updating publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating publication',
      error: error.message
    });
  }
};

/**
 * Delete publication (admin only)
 */
export const deletePublication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('🗑️  Attempting to delete publication:', id);

    // Validate MongoDB ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('❌ Invalid MongoDB ID format:', id);
      res.status(400).json({
        success: false,
        message: 'Invalid publication ID format'
      });
      return;
    }

    const publication = await Publication.findByIdAndUpdate(
      id,
      { isActive: false, lastModifiedBy: req.user?.uid },
      { new: true }
    );

    if (!publication) {
      console.error('❌ Publication not found:', id);
      res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
      return;
    }

    console.log('✅ Publication deleted:', id);

    res.status(200).json({
      success: true,
      message: 'Publication deleted successfully',
      data: publication
    });
  } catch (error: any) {
    console.error('❌ Error deleting publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting publication',
      error: error.message
    });
  }
};

/**
 * Add reaction to publication
 */
export const addReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!['like', 'important', 'useful'].includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
      return;
    }

    const publication = await Publication.findByIdAndUpdate(
      id,
      {
        $push: {
          reactions: {
            firebaseUid: req.user?.uid,
            type,
            date: new Date()
          }
        }
      },
      { new: true }
    );

    if (!publication) {
      res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
      return;
    }

    console.log('✅ Reaction added to publication:', id);

    res.status(200).json({
      success: true,
      data: publication,
      message: 'Reaction added successfully'
    });
  } catch (error: any) {
    console.error('❌ Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reaction',
      error: error.message
    });
  }
};

/**
 * Add comment to publication
 */
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
      return;
    }

    const publication = await Publication.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            firebaseUid: req.user?.uid,
            userName: req.user?.name || 'Usuario',
            content,
            date: new Date(),
            isEdited: false
          }
        }
      },
      { new: true }
    );

    if (!publication) {
      res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
      return;
    }

    console.log('✅ Comment added to publication:', id);

    res.status(200).json({
      success: true,
      data: publication,
      message: 'Comment added successfully'
    });
  } catch (error: any) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

/**
 * Get publication statistics for a condominium
 */
export const getPublicationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { condominiumId } = req.params;

    const stats = await Publication.aggregate([
      { $match: { condominiumId: require('mongoose').Types.ObjectId(condominiumId), isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          avgReactions: { $avg: { $size: '$reactions' } }
        }
      }
    ]);

    const totalPublications = await Publication.countDocuments({ condominiumId, isActive: true });
    const totalViews = await Publication.aggregate([
      { $match: { condominiumId: require('mongoose').Types.ObjectId(condominiumId), isActive: true } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPublications,
        totalViews: totalViews[0]?.total || 0,
        byCategory: stats
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting publication stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: error.message
    });
  }
};

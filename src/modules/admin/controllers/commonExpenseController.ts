import { Response } from 'express';
import { AuthRequest } from '@middleware/auth';
import CommonExpense from '../models/CommonExpense';
import Property from '../models/Property';

/**
 * Get common expenses for the authenticated user's property
 */
export const getUserCommonExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('🔍 getUserCommonExpenses called');
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

    console.log('✅ Property found:', property._id);

    // Get common expenses for this property, sorted by period descending
    const commonExpenses = await CommonExpense.find({
      propertyId: property._id
    })
      .sort({ period: -1 })
      .lean();

    console.log('✅ Common expenses found:', commonExpenses.length);

    res.status(200).json({
      success: true,
      data: {
        property: {
          id: property._id,
          number: property.number,
          block: property.block,
          type: property.type
        },
        commonExpenses: commonExpenses.map(expense => ({
          id: expense._id,
          period: expense.period,
          amounts: expense.amounts,
          status: expense.status,
          issueDate: expense.issueDate,
          dueDate: expense.dueDate,
          payments: expense.payments,
          expenseDetails: expense.expenseDetails
        }))
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting user common expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving common expenses',
      error: error.message
    });
  }
};

/**
 * Get all common expenses for a specific property
 */
export const getPropertyCommonExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { period, status } = req.query;

    const filter: any = { propertyId };

    if (period) {
      filter.period = period;
    }

    if (status) {
      filter.status = status;
    }

    const commonExpenses = await CommonExpense.find(filter)
      .sort({ period: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        commonExpenses
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting property common expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving common expenses',
      error: error.message
    });
  }
};

/**
 * Get all common expenses for a condominium (admin only)
 */
export const getCondominiumCommonExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { condominiumId } = req.params;
    const { period, status, page = 1, limit = 20 } = req.query;

    const filter: any = { condominiumId };

    if (period) {
      filter.period = period;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const commonExpenses = await CommonExpense.find(filter)
      .sort({ period: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await CommonExpense.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        commonExpenses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting condominium common expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving common expenses',
      error: error.message
    });
  }
};

/**
 * Get common expense by ID
 */
export const getCommonExpenseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const commonExpense = await CommonExpense.findById(id).lean();

    if (!commonExpense) {
      res.status(404).json({
        success: false,
        message: 'Common expense not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: commonExpense
    });
  } catch (error: any) {
    console.error('❌ Error getting common expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving common expense',
      error: error.message
    });
  }
};

/**
 * Create common expense (admin only)
 */
export const createCommonExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { condominiumId, propertyId, period, amounts, issueDate, dueDate, expenseDetails } = req.body;

    // Validate required fields
    if (!condominiumId || !propertyId || !period || !amounts || !issueDate || !dueDate) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    const commonExpense = new CommonExpense({
      condominiumId,
      propertyId,
      period,
      amounts,
      issueDate,
      dueDate,
      expenseDetails: expenseDetails || [],
      status: 'pending',
      payments: [],
      createdBy: req.user?.uid
    });

    await commonExpense.save();

    console.log('✅ Common expense created:', commonExpense._id);

    res.status(201).json({
      success: true,
      data: commonExpense,
      message: 'Common expense created successfully'
    });
  } catch (error: any) {
    console.error('❌ Error creating common expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating common expense',
      error: error.message
    });
  }
};

/**
 * Update common expense (admin only)
 */
export const updateCommonExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amounts, expenseDetails, notes } = req.body;

    const commonExpense = await CommonExpense.findByIdAndUpdate(
      id,
      {
        amounts,
        expenseDetails,
        notes,
        lastModifiedBy: req.user?.uid
      },
      { new: true }
    );

    if (!commonExpense) {
      res.status(404).json({
        success: false,
        message: 'Common expense not found'
      });
      return;
    }

    console.log('✅ Common expense updated:', id);

    res.status(200).json({
      success: true,
      data: commonExpense,
      message: 'Common expense updated successfully'
    });
  } catch (error: any) {
    console.error('❌ Error updating common expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating common expense',
      error: error.message
    });
  }
};

/**
 * Record payment for common expense
 */
export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, paymentMethod, receipt, notes } = req.body;

    if (!amount || !paymentDate || !paymentMethod) {
      res.status(400).json({
        success: false,
        message: 'Missing required payment fields'
      });
      return;
    }

    const commonExpense = await CommonExpense.findById(id);

    if (!commonExpense) {
      res.status(404).json({
        success: false,
        message: 'Common expense not found'
      });
      return;
    }

    // Add payment
    commonExpense.payments.push({
      amount,
      paymentDate: new Date(paymentDate),
      paymentMethod,
      receipt,
      notes,
      registeredBy: req.user?.uid || 'system'
    });

    // Update status based on total paid
    const totalPaid = commonExpense.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalAmount = commonExpense.amounts.total;

    if (totalPaid >= totalAmount) {
      commonExpense.status = 'paid';
    } else if (totalPaid > 0) {
      commonExpense.status = 'partial';
    }

    await commonExpense.save();

    console.log('✅ Payment recorded for expense:', id);

    res.status(200).json({
      success: true,
      data: commonExpense,
      message: 'Payment recorded successfully'
    });
  } catch (error: any) {
    console.error('❌ Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
};

/**
 * Delete common expense (admin only)
 */
export const deleteCommonExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const commonExpense = await CommonExpense.findByIdAndDelete(id);

    if (!commonExpense) {
      res.status(404).json({
        success: false,
        message: 'Common expense not found'
      });
      return;
    }

    console.log('✅ Common expense deleted:', id);

    res.status(200).json({
      success: true,
      message: 'Common expense deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting common expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting common expense',
      error: error.message
    });
  }
};

/**
 * Get common expense statistics for a condominium
 */
export const getCommonExpenseStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { condominiumId } = req.params;

    const stats = await CommonExpense.aggregate([
      { $match: { condominiumId: require('mongoose').Types.ObjectId(condominiumId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amounts.total' }
        }
      }
    ]);

    const totalExpenses = await CommonExpense.countDocuments({ condominiumId });
    const totalAmount = await CommonExpense.aggregate([
      { $match: { condominiumId: require('mongoose').Types.ObjectId(condominiumId) } },
      { $group: { _id: null, total: { $sum: '$amounts.total' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalExpenses,
        totalAmount: totalAmount[0]?.total || 0,
        byStatus: stats
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting common expense stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: error.message
    });
  }
};

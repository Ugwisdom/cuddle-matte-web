import { Request, Response, NextFunction } from 'express';
import Payment from '../models/Payment';
import { paginate, createPaginationMetadata } from '../utils/helpers';

const adminListPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status = '', bookingType = '' } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (bookingType) {
      filter.bookingType = bookingType;
    }

    const payments = await Payment.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const adminGetPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate('user', 'name email');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    next(error);
  }
};

export {
  adminListPayments,
  adminGetPayment
};

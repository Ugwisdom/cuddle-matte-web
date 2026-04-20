import { Request, Response, NextFunction } from 'express';
import ApartmentBooking from '../models/ApartmentBooking';
import MassageBooking from '../models/MassageBooking';
import { paginate, createPaginationMetadata } from '../utils/helpers';

const adminListApartmentBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const bookings = await ApartmentBooking.find(filter)
      .populate('user', 'name email')
      .populate('apartment')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await ApartmentBooking.countDocuments(filter);

    res.json({
      success: true,
      bookings,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const adminListMassageBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const bookings = await MassageBooking.find(filter)
      .populate('user', 'name email')
      .populate('service')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await MassageBooking.countDocuments(filter);

    res.json({
      success: true,
      bookings,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const adminUpdateApartmentBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending_payment', 'confirmed', 'cancelled', 'completed'].includes(String(status))) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    const booking = await ApartmentBooking.findByIdAndUpdate(
      bookingId,
      { $set: { status } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      booking
    });

  } catch (error) {
    next(error);
  }
};

const adminUpdateMassageBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending_payment', 'confirmed', 'cancelled', 'completed'].includes(String(status))) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    const booking = await MassageBooking.findByIdAndUpdate(
      bookingId,
      { $set: { status } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      booking
    });

  } catch (error) {
    next(error);
  }
};

export {
  adminListApartmentBookings,
  adminListMassageBookings,
  adminUpdateApartmentBookingStatus,
  adminUpdateMassageBookingStatus
};

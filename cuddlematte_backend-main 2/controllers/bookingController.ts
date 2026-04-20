import { Request, Response, NextFunction } from 'express';
import Apartment from '../models/Apartment';
import ApartmentBooking from '../models/ApartmentBooking';
import MassageService from '../models/MassageService';
import MassageBooking from '../models/MassageBooking';
import { paginate, createPaginationMetadata } from '../utils/helpers';

const calculateNights = (checkIn: Date, checkOut: Date) => {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const createApartmentBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apartmentId } = req.params;
    const { checkIn, checkOut, guests, specialRequests, contactName, contactPhone } = req.body;

    if (!checkIn || !checkOut || !guests) {
      return res.status(400).json({ error: 'Check-in, check-out, and guests are required' });
    }

    const apartment: any = await Apartment.findOne({ _id: apartmentId, isActive: true });
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: 'Invalid check-in or check-out date' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }

    if (Number(guests) > apartment.maxGuests) {
      return res.status(400).json({ error: `Maximum guests for this apartment is ${apartment.maxGuests}` });
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    if (nights < 1) {
      return res.status(400).json({ error: 'Booking must be at least 1 night' });
    }

    const subtotal = nights * apartment.pricePerNight;
    const totalAmount = subtotal + (apartment.cleaningFee || 0);

    const booking = await ApartmentBooking.create({
      user: req.userId,
      apartment: apartment._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      nights,
      pricePerNight: apartment.pricePerNight,
      cleaningFee: apartment.cleaningFee || 0,
      subtotal,
      totalAmount,
      specialRequests: specialRequests || null,
      contactName: contactName || null,
      contactPhone: contactPhone || null
    });

    res.status(201).json({
      success: true,
      message: 'Apartment booking created. Proceed to payment to confirm.',
      booking
    });

  } catch (error) {
    next(error);
  }
};

const createMassageBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;
    const { scheduledAt, locationAddress, city, notes, contactName, contactPhone } = req.body;

    if (!scheduledAt || !locationAddress || !city) {
      return res.status(400).json({ error: 'Scheduled time, location address, and city are required' });
    }

    const service: any = await MassageService.findOne({ _id: serviceId, isActive: true });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduled time' });
    }

    const totalAmount = service.price;

    const booking = await MassageBooking.create({
      user: req.userId,
      service: service._id,
      scheduledAt: scheduledDate,
      locationAddress,
      city,
      durationMinutes: service.durationMinutes,
      price: service.price,
      totalAmount,
      notes: notes || null,
      contactName: contactName || null,
      contactPhone: contactPhone || null
    });

    res.status(201).json({
      success: true,
      message: 'Massage booking created. Proceed to payment to confirm.',
      booking
    });

  } catch (error) {
    next(error);
  }
};

const listApartmentBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const bookings = await ApartmentBooking.find({ user: req.userId })
      .populate('apartment')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await ApartmentBooking.countDocuments({ user: req.userId });

    res.json({
      success: true,
      bookings,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const listMassageBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const bookings = await MassageBooking.find({ user: req.userId })
      .populate('service')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await MassageBooking.countDocuments({ user: req.userId });

    res.json({
      success: true,
      bookings,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const cancelApartmentBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;

    const booking: any = await ApartmentBooking.findOne({ _id: bookingId, user: req.userId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Completed bookings cannot be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Apartment booking cancelled',
      booking
    });

  } catch (error) {
    next(error);
  }
};

const cancelMassageBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;

    const booking: any = await MassageBooking.findOne({ _id: bookingId, user: req.userId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Completed bookings cannot be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Massage booking cancelled',
      booking
    });

  } catch (error) {
    next(error);
  }
};

export {
  createApartmentBooking,
  createMassageBooking,
  listApartmentBookings,
  listMassageBookings,
  cancelApartmentBooking,
  cancelMassageBooking
};

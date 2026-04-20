import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import ApartmentBooking from '../models/ApartmentBooking';
import MassageBooking from '../models/MassageBooking';
import Payment from '../models/Payment';
import { generateRandomString } from '../utils/helpers';
import { paystackRequest } from '../utils/paystack';

const getBookingByType = async (bookingType: string, bookingId: string) => {
  if (bookingType === 'apartment') {
    return ApartmentBooking.findById(bookingId);
  }
  if (bookingType === 'massage') {
    return MassageBooking.findById(bookingId);
  }
  return null;
};

const initializePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingType, bookingId } = req.body;

    if (!bookingType || !bookingId) {
      return res.status(400).json({ error: 'Booking type and booking ID are required' });
    }

    if (!['apartment', 'massage'].includes(String(bookingType))) {
      return res.status(400).json({ error: 'Invalid booking type' });
    }

    const booking: any = await getBookingByType(bookingType, bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to pay for this booking' });
    }

    if (booking.status !== 'pending_payment') {
      return res.status(400).json({ error: 'Booking is not awaiting payment' });
    }

    const existingPayment = booking.payment ? await Payment.findById(booking.payment) : null;
    if (existingPayment && ['initialized', 'pending'].includes(existingPayment.status)) {
      return res.json({
        success: true,
        message: 'Payment already initialized',
        payment: existingPayment
      });
    }

    const user: any = await User.findById(req.userId).select('email name');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const amount = booking.totalAmount;
    const reference = `CM_${generateRandomString(16)}`;

    const payment = await Payment.create({
      user: req.userId,
      bookingType,
      bookingId,
      reference,
      amount,
      currency: 'NGN',
      status: 'initialized'
    });

    const paystackPayload = {
      email: user.email,
      amount: Math.round(amount * 100),
      currency: 'NGN',
      reference,
      metadata: {
        bookingType,
        bookingId,
        userId: req.userId
      }
    };

    const response = await paystackRequest('/transaction/initialize', 'POST', paystackPayload);

    if (!response.body || !response.body.status) {
      payment.status = 'failed';
      payment.rawResponse = response.body || {};
      await payment.save();

      return res.status(400).json({
        error: 'Failed to initialize payment',
        details: response.body
      });
    }

    payment.status = 'pending';
    payment.authorizationUrl = response.body.data?.authorization_url || null;
    payment.accessCode = response.body.data?.access_code || null;
    payment.rawResponse = response.body;
    await payment.save();

    booking.payment = payment._id;
    await booking.save();

    res.json({
      success: true,
      message: 'Payment initialized',
      payment
    });

  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    const payment: any = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to verify this payment' });
    }

    if (payment.status === 'success') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        payment
      });
    }

    const response = await paystackRequest(`/transaction/verify/${reference}`, 'GET');

    if (!response.body || !response.body.status) {
      return res.status(400).json({
        error: 'Failed to verify payment',
        details: response.body
      });
    }

    const data = response.body.data;

    if (data?.status === 'success') {
      payment.status = 'success';
      payment.paidAt = new Date(data.paid_at || Date.now());
      payment.rawResponse = response.body;
      await payment.save();

      const booking: any = await getBookingByType(payment.bookingType, payment.bookingId);
      if (booking && booking.status === 'pending_payment') {
        booking.status = 'confirmed';
        booking.payment = payment._id;
        await booking.save();
      }

      return res.json({
        success: true,
        message: 'Payment verified',
        payment
      });
    }

    payment.status = data?.status === 'failed' ? 'failed' : 'cancelled';
    payment.rawResponse = response.body;
    await payment.save();

    res.status(400).json({
      success: false,
      message: 'Payment not successful',
      payment
    });

  } catch (error) {
    next(error);
  }
};

export {
  initializePayment,
  verifyPayment
};

import { Router } from 'express';
import auth from '../middleware/auth';
import {
  createApartmentBooking,
  createMassageBooking,
  listApartmentBookings,
  listMassageBookings,
  cancelApartmentBooking,
  cancelMassageBooking
} from '../controllers/bookingController';

const router = Router();

router.use(auth);

router.post('/apartments/:apartmentId', createApartmentBooking);
router.post('/massages/:serviceId', createMassageBooking);
router.get('/apartments', listApartmentBookings);
router.get('/massages', listMassageBookings);
router.put('/apartments/:bookingId/cancel', cancelApartmentBooking);
router.put('/massages/:bookingId/cancel', cancelMassageBooking);

export default router;

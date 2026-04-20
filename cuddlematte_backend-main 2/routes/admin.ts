import { Router } from 'express';
import auth from '../middleware/auth';
import adminAuth from '../middleware/adminAuth';
import upload from '../middleware/upload';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUser,
  toggleBanUser,
  deleteUser,
  getAllMatches,
  getAllMessages,
  deleteMessage,
  createAdmin,
  getUserActivity,
  searchUsers,
  getPendingKyc,
  approveKyc,
  rejectKyc
} from '../controllers/adminController';
import {
  adminListApartments,
  adminGetApartment,
  adminCreateApartment,
  adminUpdateApartment,
  adminDeleteApartment,
  adminAddApartmentPhotos
} from '../controllers/adminApartmentController';
import {
  adminListMassageServices,
  adminGetMassageService,
  adminCreateMassageService,
  adminUpdateMassageService,
  adminDeleteMassageService
} from '../controllers/adminMassageController';
import {
  adminListApartmentBookings,
  adminListMassageBookings,
  adminUpdateApartmentBookingStatus,
  adminUpdateMassageBookingStatus
} from '../controllers/adminBookingController';
import { adminListPayments, adminGetPayment } from '../controllers/adminPaymentController';

const router = Router();

router.use(auth, adminAuth);

router.get('/stats', getDashboardStats);
router.post('/create-admin', createAdmin);
router.get('/search', searchUsers);
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId', updateUser);
router.put('/users/:userId/ban', toggleBanUser);
router.delete('/users/:userId', deleteUser);
router.get('/users/:userId/activity', getUserActivity);
router.get('/kyc/pending', getPendingKyc);
router.put('/kyc/:userId/approve', approveKyc);
router.put('/kyc/:userId/reject', rejectKyc);
router.get('/matches', getAllMatches);
router.get('/messages', getAllMessages);
router.delete('/messages/:messageId', deleteMessage);
router.get('/apartments', adminListApartments);
router.post('/apartments', adminCreateApartment);
router.get('/apartments/:apartmentId', adminGetApartment);
router.put('/apartments/:apartmentId', adminUpdateApartment);
router.post('/apartments/:apartmentId/photos', upload.array('photos', 10), adminAddApartmentPhotos);
router.delete('/apartments/:apartmentId', adminDeleteApartment);
router.get('/massages/services', adminListMassageServices);
router.post('/massages/services', adminCreateMassageService);
router.get('/massages/services/:serviceId', adminGetMassageService);
router.put('/massages/services/:serviceId', adminUpdateMassageService);
router.delete('/massages/services/:serviceId', adminDeleteMassageService);
router.get('/bookings/apartments', adminListApartmentBookings);
router.get('/bookings/massages', adminListMassageBookings);
router.put('/bookings/apartments/:bookingId/status', adminUpdateApartmentBookingStatus);
router.put('/bookings/massages/:bookingId/status', adminUpdateMassageBookingStatus);
router.get('/payments', adminListPayments);
router.get('/payments/:paymentId', adminGetPayment);
export default router;

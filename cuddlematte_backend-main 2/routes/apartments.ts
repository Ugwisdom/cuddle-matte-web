import { Router } from 'express';
import { listApartments, getApartment } from '../controllers/apartmentController';

const router = Router();

router.get('/', listApartments);
router.get('/:apartmentId', getApartment);

export default router;

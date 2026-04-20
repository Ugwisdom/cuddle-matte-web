import { Router } from 'express';
import { listMassageServices, getMassageService } from '../controllers/massageController';

const router = Router();

router.get('/services', listMassageServices);
router.get('/services/:serviceId', getMassageService);

export default router;

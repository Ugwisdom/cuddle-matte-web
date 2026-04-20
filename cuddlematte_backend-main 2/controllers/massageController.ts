import { Request, Response, NextFunction } from 'express';
import MassageService from '../models/MassageService';
import { paginate, createPaginationMetadata } from '../utils/helpers';

const listMassageServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const services = await MassageService.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await MassageService.countDocuments({ isActive: true });

    res.json({
      success: true,
      services,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const getMassageService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;

    const service = await MassageService.findOne({ _id: serviceId, isActive: true }).lean();

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({
      success: true,
      service
    });

  } catch (error) {
    next(error);
  }
};

export {
  listMassageServices,
  getMassageService
};

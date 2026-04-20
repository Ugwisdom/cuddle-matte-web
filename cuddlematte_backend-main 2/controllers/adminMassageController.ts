import { Request, Response, NextFunction } from 'express';
import MassageService from '../models/MassageService';
import { paginate, createPaginationMetadata } from '../utils/helpers';

const adminListMassageServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, isActive = '' } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const filter: any = {};
    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const services = await MassageService.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await MassageService.countDocuments(filter);

    res.json({
      success: true,
      services,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const adminGetMassageService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;

    const service = await MassageService.findById(serviceId);
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

const adminCreateMassageService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body || {};

    const requiredFields = ['name', 'description', 'durationMinutes', 'price'];
    for (const field of requiredFields) {
      if (!payload[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const service = await MassageService.create({
      ...payload,
      createdBy: req.userId,
      updatedBy: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Service created',
      service
    });

  } catch (error) {
    next(error);
  }
};

const adminUpdateMassageService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;

    const service = await MassageService.findByIdAndUpdate(
      serviceId,
      { $set: { ...req.body, updatedBy: req.userId } },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({
      success: true,
      message: 'Service updated',
      service
    });

  } catch (error) {
    next(error);
  }
};

const adminDeleteMassageService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;

    const service = await MassageService.findByIdAndDelete(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({
      success: true,
      message: 'Service deleted'
    });

  } catch (error) {
    next(error);
  }
};

export {
  adminListMassageServices,
  adminGetMassageService,
  adminCreateMassageService,
  adminUpdateMassageService,
  adminDeleteMassageService
};

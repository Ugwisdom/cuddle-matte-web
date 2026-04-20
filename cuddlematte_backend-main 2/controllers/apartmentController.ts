import { Request, Response, NextFunction } from 'express';
import Apartment from '../models/Apartment';
import { paginate, createPaginationMetadata, sanitizeObject } from '../utils/helpers';

const listApartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, city = '', minPrice = '', maxPrice = '', guests = '' } = req.query;

    const filter: any = { isActive: true };

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    if (minPrice !== '' || maxPrice !== '') {
      filter.pricePerNight = sanitizeObject({
        ...(minPrice !== '' ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice !== '' ? { $lte: Number(maxPrice) } : {})
      });
    }

    if (guests !== '') {
      filter.maxGuests = { $gte: Number(guests) };
    }

    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const apartments = await Apartment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Apartment.countDocuments(filter);

    res.json({
      success: true,
      apartments,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const getApartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apartmentId } = req.params;

    const apartment = await Apartment.findOne({ _id: apartmentId, isActive: true }).lean();

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    res.json({
      success: true,
      apartment
    });

  } catch (error) {
    next(error);
  }
};

export {
  listApartments,
  getApartment
};

import { Request, Response, NextFunction } from 'express';
import Apartment from '../models/Apartment';
import { paginate, createPaginationMetadata } from '../utils/helpers';
import { uploadBuffer } from '../utils/cloudinary';

const adminListApartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, isActive = '' } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const filter: any = {};
    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const apartments = await Apartment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

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

const adminGetApartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apartmentId } = req.params;
    const apartment = await Apartment.findById(apartmentId);

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

const adminCreateApartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body || {};

    const requiredFields = ['title', 'description', 'address', 'city', 'country', 'pricePerNight', 'maxGuests'];
    for (const field of requiredFields) {
      if (!payload[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const apartment = await Apartment.create({
      ...payload,
      createdBy: req.userId,
      updatedBy: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Apartment created',
      apartment
    });

  } catch (error) {
    next(error);
  }
};

const adminUpdateApartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apartmentId } = req.params;

    const apartment = await Apartment.findByIdAndUpdate(
      apartmentId,
      { $set: { ...req.body, updatedBy: req.userId } },
      { new: true, runValidators: true }
    );

    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    res.json({
      success: true,
      message: 'Apartment updated',
      apartment
    });

  } catch (error) {
    next(error);
  }
};

const adminDeleteApartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apartmentId } = req.params;

    const apartment = await Apartment.findByIdAndDelete(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    res.json({
      success: true,
      message: 'Apartment deleted'
    });

  } catch (error) {
    next(error);
  }
};

const adminAddApartmentPhotos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apartmentId } = req.params;
    const files = (req as any).files || [];

    if (!files.length) {
      return res.status(400).json({ error: 'At least one photo file is required' });
    }

    const apartment: any = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    const uploads = await Promise.all(
      files.map((file: any) => uploadBuffer(file.buffer, { folder: 'apartments', resource_type: 'image' }))
    );

    const photoUrls = uploads.map((result: any) => result.secure_url);
    apartment.photos = [...(apartment.photos || []), ...photoUrls];
    apartment.updatedBy = req.userId as any;

    await apartment.save();

    res.json({
      success: true,
      message: 'Apartment photos uploaded',
      photos: apartment.photos
    });
  } catch (error) {
    next(error);
  }
};

export {
  adminListApartments,
  adminGetApartment,
  adminCreateApartment,
  adminUpdateApartment,
  adminDeleteApartment,
  adminAddApartmentPhotos
};

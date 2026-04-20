import { Request, Response, NextFunction } from 'express';
import getCloudinary from '../utils/cloudinary';

const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const cloudinary = getCloudinary();

    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'ushering',
          resource_type: 'image'
        },
        (error, uploadResult) => {
          if (error) {
            return reject(error);
          }
          return resolve(uploadResult);
        }
      );

      stream.end(file.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    next(error);
  }
};

export {
  uploadImage
};

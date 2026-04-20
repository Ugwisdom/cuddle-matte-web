import { v2 as cloudinary } from 'cloudinary';

const getCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  return cloudinary;
};

const uploadBuffer = async (
  buffer: Buffer,
  options: { folder: string; resource_type?: 'image' | 'raw' | 'video' } = { folder: 'uploads', resource_type: 'image' }
) => {
  const client = getCloudinary();

  const result: any = await new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resource_type || 'image'
      },
      (error, uploadResult) => {
        if (error) {
          return reject(error);
        }
        return resolve(uploadResult);
      }
    );

    stream.end(buffer);
  });

  return result;
};

export default getCloudinary;
export { uploadBuffer };

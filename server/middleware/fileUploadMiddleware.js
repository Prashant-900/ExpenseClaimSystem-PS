import multer from 'multer';
import minioClient from '../config/minio.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export const uploadToMinio = async (file, userId) => {
  const fileName = `users/${userId}/${Date.now()}-${file.originalname}`;
  
  await minioClient.putObject(
    process.env.MINIO_BUCKET,
    fileName,
    file.buffer,
    file.size,
    { 'Content-Type': file.mimetype }
  );
  
  return fileName;
};

export default upload;
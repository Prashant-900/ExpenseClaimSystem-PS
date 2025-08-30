import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Create bucket if it doesn't exist
const initializeBucket = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(process.env.MINIO_BUCKET);
    if (!bucketExists) {
      await minioClient.makeBucket(process.env.MINIO_BUCKET);
      console.log(`Bucket ${process.env.MINIO_BUCKET} created successfully`);
    }
  } catch (error) {
    console.error('Error initializing MinIO bucket:', error);
  }
};

initializeBucket();

export default minioClient;
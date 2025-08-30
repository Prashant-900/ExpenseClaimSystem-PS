import express from 'express';
import minioClient from '../config/minio.js';

const router = express.Router();

router.get('/:fileName(*)', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const stream = await minioClient.getObject(process.env.MINIO_BUCKET, fileName);
    
    res.setHeader('Content-Type', 'image/jpeg');
    stream.pipe(res);
  } catch (error) {
    res.status(404).json({ message: 'Image not found' });
  }
});

export default router;
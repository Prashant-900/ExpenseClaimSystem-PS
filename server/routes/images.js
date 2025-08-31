import express from 'express';
import minioClient from '../config/minio.js';

const router = express.Router();

router.get('/:fileName(*)', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const stream = await minioClient.getObject(process.env.MINIO_BUCKET, fileName);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    stream.pipe(res);
  } catch (error) {
    console.error('Image serving error:', error);
    res.status(404).json({ message: 'Image not found' });
  }
});

export default router;
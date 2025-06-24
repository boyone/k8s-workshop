import { Router } from 'express';
import os from 'os';

function hello(req, res) {
  res.json({
    message: 'Hello, World!',
    version: '0.0.2',
    hostname: os.hostname(),
    environment: process.env.NODE_ENV || 'development',
  });
}

const router = Router();

router.get('/hello', hello);

export default router;

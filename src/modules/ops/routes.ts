import { Router, Request, Response } from 'express';

const router = Router();

// GET /ping endpoint - returns 204 No Content
router.get('/ping', (_req: Request, res: Response): void => {
  res.status(204).send();
});

// GET /startup endpoint - returns app version and features
router.get('/startup', (_req: Request, res: Response): void => {
  setTimeout(() => {
    res.status(200).json({
      latestVersion: "1.0.0",
      features: {
        chat: true
      }
    });
  }, 2000); // 2 second delay
});

export default router;

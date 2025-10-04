import { Router, Request, Response } from 'express';

const router = Router();

// GET /ping endpoint - returns 204 No Content
router.get('/ping', (_req: Request, res: Response): void => {
  res.status(204).send();
});

export default router;

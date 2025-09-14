import { Router } from 'express';
import { createUser, getUserById, updateUser, getMe } from './controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// POST /users - Create a new user
router.post('/', createUser);

// GET /users/me - Get authenticated user profile
router.get('/me', authMiddleware, getMe);

// PUT /users/me - Update authenticated user profile
router.put('/me', authMiddleware, updateUser);

// GET /users/:id - Get user by ID (requires authentication)
router.get('/:id', authMiddleware, getUserById);

export default router;

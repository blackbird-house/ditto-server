import { Router } from 'express';
import { createUser, getUserById, updateUser } from './controller';

const router = Router();

// POST /users - Create a new user
router.post('/', createUser);

// PUT /users/:id - Update user by ID
router.put('/:id', updateUser);

// GET /users/:id - Get user by ID
router.get('/:id', getUserById);

export default router;

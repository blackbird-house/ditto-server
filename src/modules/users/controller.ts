import { Request, Response } from 'express';
import { userService } from './service';
import { CreateUserRequest, CreateUserResponse, PublicUserResponse } from './types';
import { authService } from '../auth/services/authService';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateUserRequest = req.body;

    // Validate required fields
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'firstName, lastName, email, and phone are required'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
      return;
    }

    const user = await userService.createUser(userData);

    // Convert dates to ISO strings for response
    const response: CreateUserResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    res.status(201).json({
      message: 'User created successfully',
      user: response
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User with this email already exists') {
      res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create user'
      });
    }
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        error: 'Bad request',
        message: 'User ID is required'
      });
      return;
    }
    
    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
      return;
    }

    const response: PublicUserResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    res.status(200).json({
      user: response
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user'
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // The user ID is attached by the auth middleware
    const userId = (req as any).user?.id;
    const userData: Partial<CreateUserRequest> = req.body;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing authentication token'
      });
      return;
    }

    // Validate that at least one field is provided for update
    if (!userData.firstName && !userData.lastName && !userData.email && !userData.phone) {
      res.status(400).json({
        error: 'Bad request',
        message: 'At least one field (firstName, lastName, email, phone) must be provided for update'
      });
      return;
    }

    // Basic email validation if email is being updated
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        res.status(400).json({
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        });
        return;
      }
    }

    const updatedUser = await userService.updateUser(userId, userData);

    if (!updatedUser) {
      res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
      return;
    }

    // Convert dates to ISO strings for response
    const response: CreateUserResponse = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'User with this email already exists') {
      res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
    } else {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update user'
      });
    }
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // The user ID is attached by the auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing authentication token'
      });
      return;
    }

    const user = await authService.getMe(userId);
    
    if (!user) {
      res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
};


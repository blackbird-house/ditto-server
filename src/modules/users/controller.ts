import { Request, Response } from 'express';
import { userService } from './service';
import { CreateUserRequest, CreateUserResponse, PublicUserResponse } from './types';
import { authService } from '../auth/services/authService';

// Helper function to check if error is a unique constraint violation
const isUniqueConstraintError = (error: Error): boolean => {
  return (
    error.message === 'User with this email already exists' ||
    // SQLite error messages
    error.message.includes('UNIQUE constraint failed: users.email') ||
    error.message.includes('UNIQUE constraint failed: users.phone') ||
    // Supabase/PostgreSQL error messages
    error.message.includes('duplicate key value violates unique constraint') ||
    error.message.includes('users_email_key') ||
    error.message.includes('users_phone_key')
  );
};

// Helper function to validate user data character limits and formats
const validateUserDataLimits = (userData: Partial<CreateUserRequest>): string[] => {
  const validationErrors: string[] = [];
  
  if (userData.firstName && userData.firstName.length > 50) {
    validationErrors.push('First name must be 50 characters or less');
  }
  
  if (userData.lastName && userData.lastName.length > 50) {
    validationErrors.push('Last name must be 50 characters or less');
  }
  
  if (userData.email && userData.email.length > 254) {
    validationErrors.push('Email must be 254 characters or less');
  }
  
  if (userData.phone) {
    if (userData.phone.length > 20) {
      validationErrors.push('Phone number must be 20 characters or less');
    }
    
    // Phone number format validation: only numbers and optional + prefix
    const phoneRegex = /^\+?[0-9]+$/;
    if (!phoneRegex.test(userData.phone)) {
      validationErrors.push('Phone number must contain only numbers and an optional + prefix');
    }
  }
  
  return validationErrors;
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateUserRequest = req.body;

    // Validate required fields
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data'
      });
      return;
    }

    // Character limit validation
    const validationErrors = validateUserDataLimits(userData);
    
    if (validationErrors.length > 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Validation failed',
        details: validationErrors
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

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error && isUniqueConstraintError(error)) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Resource already exists'
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
        message: 'Invalid request data'
      });
      return;
    }
    
    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({
        error: 'Not found',
        message: 'Resource not found'
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
        message: 'Authentication required'
      });
      return;
    }

    // Validate that at least one field is provided for update
    if (!userData.firstName && !userData.lastName && !userData.email && !userData.phone) {
      res.status(400).json({
        error: 'Bad request',
        message: 'Invalid request data'
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

    // Character limit validation for fields being updated
    const validationErrors = validateUserDataLimits(userData);
    
    if (validationErrors.length > 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Validation failed',
        details: validationErrors
      });
      return;
    }

    const updatedUser = await userService.updateUser(userId, userData);

    if (!updatedUser) {
      res.status(404).json({
        error: 'Not found',
        message: 'Resource not found'
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
    if (error instanceof Error && isUniqueConstraintError(error)) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Resource already exists'
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
        message: 'Authentication required'
      });
      return;
    }

    const user = await authService.getMe(userId);
    
    if (!user) {
      res.status(404).json({
        error: 'Not found',
        message: 'Resource not found'
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


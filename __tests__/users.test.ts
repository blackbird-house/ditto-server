import request from 'supertest';
import app from '../src/app';
import { userService } from '../src/modules/users/service';

describe('User Module', () => {
  beforeEach(() => {
    // Clear the in-memory store before each test
    (userService as any).users.clear();
  });
  describe('POST /users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('firstName', 'John');
      expect(response.body.user).toHaveProperty('lastName', 'Doe');
      expect(response.body.user).toHaveProperty('email', 'john.doe@example.com');
      expect(response.body.user).toHaveProperty('phone', '+1234567890');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).toHaveProperty('updatedAt');
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        firstName: 'John',
        // Missing lastName, email, phone
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields');
      expect(response.body).toHaveProperty('message', 'firstName, lastName, email, and phone are required');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email format');
      expect(response.body).toHaveProperty('message', 'Please provide a valid email address');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        phone: '+1234567890'
      };

      // Create first user
      await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Conflict');
      expect(response.body).toHaveProperty('message', 'User with this email already exists');
    });
  });

  describe('PUT /users/me', () => {
    it('should update user with valid data', async () => {
      const testPhone = '+1111111111';
      const expectedOtp = '111111'; // Last 6 digits of testPhone

      // Create a user first
      const userData = {
        firstName: 'Original',
        lastName: 'Name',
        email: 'original@example.com',
        phone: testPhone
      };

      const createResponse = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.user.id;

      // Authenticate to get token
      await request(app)
        .post('/auth/send-otp')
        .send({ phone: testPhone })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      const token = verifyResponse.body.token;

      // Update the user
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
        phone: '+2222222222'
      };

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User updated successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', userId);
      expect(response.body.user).toHaveProperty('firstName', 'Updated');
      expect(response.body.user).toHaveProperty('lastName', 'Name');
      expect(response.body.user).toHaveProperty('email', 'updated@example.com');
      expect(response.body.user).toHaveProperty('phone', '+2222222222');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).toHaveProperty('updatedAt');
    });

    it('should update user with partial data', async () => {
      const testPhone = '+1111111111';
      const expectedOtp = '111111'; // Last 6 digits of testPhone

      // Create a user first
      const userData = {
        firstName: 'Original',
        lastName: 'Name',
        email: 'original@example.com',
        phone: testPhone
      };

      await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      // Authenticate to get token
      await request(app)
        .post('/auth/send-otp')
        .send({ phone: testPhone })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      const token = verifyResponse.body.token;

      // Update only firstName
      const updateData = {
        firstName: 'UpdatedFirstName'
      };

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User updated successfully');
      expect(response.body.user).toHaveProperty('firstName', 'UpdatedFirstName');
      expect(response.body.user).toHaveProperty('lastName', 'Name'); // Should remain unchanged
      expect(response.body.user).toHaveProperty('email', 'original@example.com'); // Should remain unchanged
    });

    it('should return 400 for empty update data', async () => {
      const testPhone = '+1111111111';
      const expectedOtp = '111111'; // Last 6 digits of testPhone

      // Create a user first
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: testPhone
      };

      await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      // Authenticate to get token
      await request(app)
        .post('/auth/send-otp')
        .send({ phone: testPhone })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      const token = verifyResponse.body.token;

      // Try to update with empty data
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty('message', 'At least one field (firstName, lastName, email, phone) must be provided for update');
    });

    it('should return 400 for invalid email format', async () => {
      const testPhone = '+1111111111';
      const expectedOtp = '111111'; // Last 6 digits of testPhone

      // Create a user first
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: testPhone
      };

      await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      // Authenticate to get token
      await request(app)
        .post('/auth/send-otp')
        .send({ phone: testPhone })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      const token = verifyResponse.body.token;

      // Try to update with invalid email
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email format');
      expect(response.body).toHaveProperty('message', 'Please provide a valid email address');
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .put('/users/me')
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Authorization header is required');
    });

    it('should return 401 for invalid authentication token', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should return 409 for duplicate email', async () => {
      const testPhone1 = '+1111111111';
      const testPhone2 = '+2222222222';
      const expectedOtp1 = '111111'; // Last 6 digits of testPhone1

      // Create two users
      const user1Data = {
        firstName: 'User1',
        lastName: 'Test',
        email: 'user1@example.com',
        phone: testPhone1
      };

      const user2Data = {
        firstName: 'User2',
        lastName: 'Test',
        email: 'user2@example.com',
        phone: testPhone2
      };

      await request(app)
        .post('/users')
        .send(user1Data)
        .expect(201);

      await request(app)
        .post('/users')
        .send(user2Data)
        .expect(201);

      // Authenticate user1 to get token
      await request(app)
        .post('/auth/send-otp')
        .send({ phone: testPhone1 })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: testPhone1, otp: expectedOtp1 })
        .expect(200);

      const token = verifyResponse.body.token;

      // Try to update user1 with user2's email
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'user2@example.com' })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Conflict');
      expect(response.body).toHaveProperty('message', 'User with this email already exists');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by ID', async () => {
      // Create a user first
      const userData = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1122334455'
      };

      const createResponse = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.user.id;

      const response = await request(app)
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', userId);
      expect(response.body.user).toHaveProperty('firstName', 'Bob');
      expect(response.body.user).toHaveProperty('lastName', 'Johnson');
      
      // Should NOT include sensitive information
      expect(response.body.user).not.toHaveProperty('email');
      expect(response.body.user).not.toHaveProperty('phone');
      expect(response.body.user).not.toHaveProperty('createdAt');
      expect(response.body.user).not.toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent user ID', async () => {
      const response = await request(app)
        .get('/users/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 404 for missing user ID', async () => {
      await request(app)
        .get('/users/')
        .expect(404); // This now returns 404 since GET /users route is removed
    });
  });
});

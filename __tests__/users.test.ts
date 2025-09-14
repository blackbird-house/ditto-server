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

  describe('PUT /users/:id', () => {
    it('should update user with valid data', async () => {
      // Create a user first
      const userData = {
        firstName: 'Original',
        lastName: 'Name',
        email: 'original@example.com',
        phone: '+1111111111'
      };

      const createResponse = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.user.id;

      // Update the user
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
        phone: '+2222222222'
      };

      const response = await request(app)
        .put(`/users/${userId}`)
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
      // Create a user first
      const userData = {
        firstName: 'Original',
        lastName: 'Name',
        email: 'original@example.com',
        phone: '+1111111111'
      };

      const createResponse = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.user.id;

      // Update only firstName
      const updateData = {
        firstName: 'UpdatedFirstName'
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User updated successfully');
      expect(response.body.user).toHaveProperty('firstName', 'UpdatedFirstName');
      expect(response.body.user).toHaveProperty('lastName', 'Name'); // Should remain unchanged
      expect(response.body.user).toHaveProperty('email', 'original@example.com'); // Should remain unchanged
    });

    it('should return 400 for empty update data', async () => {
      // Create a user first
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+1111111111'
      };

      const createResponse = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.user.id;

      // Try to update with empty data
      const response = await request(app)
        .put(`/users/${userId}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty('message', 'At least one field (firstName, lastName, email, phone) must be provided for update');
    });

    it('should return 400 for invalid email format', async () => {
      // Create a user first
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+1111111111'
      };

      const createResponse = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.user.id;

      // Try to update with invalid email
      const response = await request(app)
        .put(`/users/${userId}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email format');
      expect(response.body).toHaveProperty('message', 'Please provide a valid email address');
    });

    it('should return 404 for non-existent user ID', async () => {
      const response = await request(app)
        .put('/users/non-existent-id')
        .send({ firstName: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 409 for duplicate email', async () => {
      // Create two users
      const user1Data = {
        firstName: 'User1',
        lastName: 'Test',
        email: 'user1@example.com',
        phone: '+1111111111'
      };

      const user2Data = {
        firstName: 'User2',
        lastName: 'Test',
        email: 'user2@example.com',
        phone: '+2222222222'
      };

      const createResponse1 = await request(app)
        .post('/users')
        .send(user1Data)
        .expect(201);

      await request(app)
        .post('/users')
        .send(user2Data)
        .expect(201);

      const userId1 = createResponse1.body.user.id;

      // Try to update user1 with user2's email
      const response = await request(app)
        .put(`/users/${userId1}`)
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
      expect(response.body.user).toHaveProperty('email', 'bob.johnson@example.com');
      expect(response.body.user).toHaveProperty('phone', '+1122334455');
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

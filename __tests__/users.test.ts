import request from 'supertest';
import app from '../src/app';

describe('User Module', () => {
  beforeEach(() => {
    // Database is automatically cleaned between tests
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
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('firstName', 'John');
      expect(response.body).toHaveProperty('lastName', 'Doe');
      expect(response.body).toHaveProperty('email', 'john.doe@example.com');
      expect(response.body).toHaveProperty('phone', '+1234567890');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a new user with social auth fields', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        authProvider: 'google',
        socialId: 'google_123456789',
        profilePictureUrl: 'https://example.com/profile.jpg'
      };

      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('firstName', 'Jane');
      expect(response.body).toHaveProperty('lastName', 'Smith');
      expect(response.body).toHaveProperty('email', 'jane.smith@example.com');
      expect(response.body).toHaveProperty('authProvider', 'google');
      expect(response.body).toHaveProperty('socialId', 'google_123456789');
      expect(response.body).toHaveProperty('profilePictureUrl', 'https://example.com/profile.jpg');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a new user without phone (Google social auth only)', async () => {
      const userData = {
        firstName: 'Google',
        lastName: 'User',
        email: 'google.user@example.com',
        authProvider: 'google',
        socialId: 'google_987654321'
      };

      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('firstName', 'Google');
      expect(response.body).toHaveProperty('lastName', 'User');
      expect(response.body).toHaveProperty('email', 'google.user@example.com');
      expect(response.body).toHaveProperty('authProvider', 'google');
      expect(response.body).toHaveProperty('socialId', 'google_987654321');
      expect(response.body).not.toHaveProperty('phone');
      expect(response.body).not.toHaveProperty('profilePictureUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        firstName: 'John',
        // Missing lastName, email, phone
      };

      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad Request');
      expect(response.body).toHaveProperty('message', 'Invalid request data');
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
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad Request');
      expect(response.body).toHaveProperty('message', 'Invalid request data');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        phone: `+1234567${Math.floor(Math.random() * 1000)}`
      };

      // Create first user
      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Conflict');
      expect(response.body).toHaveProperty('message', 'Resource already exists');
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
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.id;

      // Authenticate to get token
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
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
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('firstName', 'Updated');
      expect(response.body).toHaveProperty('lastName', 'Name');
      expect(response.body).toHaveProperty('email', 'updated@example.com');
      expect(response.body).toHaveProperty('phone', '+2222222222');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should update user with partial data', async () => {
      const testPhone = '+1111111112';
      const expectedOtp = '111112'; // Last 6 digits of testPhone

      // Create a user first
      const userData = {
        firstName: 'Original',
        lastName: 'Name',
        email: 'original2@example.com',
        phone: testPhone
      };

      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      // Authenticate to get token
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      const token = verifyResponse.body.token;

      // Update only firstName
      const updateData = {
        firstName: 'UpdatedFirstName'
      };

      const response = await request(app)
        .put('/users/me')
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('firstName', 'UpdatedFirstName');
      expect(response.body).toHaveProperty('lastName', 'Name'); // Should remain unchanged
      expect(response.body).toHaveProperty('email', 'original2@example.com'); // Should remain unchanged
    });

    it('should return 400 for empty update data', async () => {
      const testPhone = '+1111111113';
      const expectedOtp = '111113'; // Last 6 digits of testPhone

      // Create a user first
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test3@example.com',
        phone: testPhone
      };

      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      // Authenticate to get token
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      const token = verifyResponse.body.token;

      // Try to update with empty data
      const response = await request(app)
        .put('/users/me')
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad request');
      expect(response.body).toHaveProperty('message', 'Invalid request data');
    });

    it('should return 400 for invalid email format', async () => {
      const testPhone = '+1111111114';
      const expectedOtp = '111114'; // Last 6 digits of testPhone

      // Create a user first
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test4@example.com',
        phone: testPhone
      };

      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      // Authenticate to get token
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone, otp: expectedOtp })
        .expect(200);

      const token = verifyResponse.body.token;

      // Try to update with invalid email
      const response = await request(app)
        .put('/users/me')
        .set('X-API-Secret', 'test-secret-key-67890')
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
      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should return 401 for invalid authentication token', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', 'Bearer invalid-token')
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should return 409 for duplicate email', async () => {
      const testPhone1 = `+1111111${Math.floor(Math.random() * 1000)}`;
      const testPhone2 = `+2222222${Math.floor(Math.random() * 1000)}`;
      const expectedOtp1 = testPhone1.slice(-6); // Last 6 digits of testPhone1

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
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(user1Data)
        .expect(201);

      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(user2Data)
        .expect(201);

      // Authenticate user1 to get token
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone1 })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: testPhone1, otp: expectedOtp1 })
        .expect(200);

      const token = verifyResponse.body.token;

      // Try to update user1 with user2's email
      const response = await request(app)
        .put('/users/me')
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'user2@example.com' })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Conflict');
      expect(response.body).toHaveProperty('message', 'Resource already exists');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by ID with authentication', async () => {
      // Create a user first
      const userData = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1122334455'
      };

      const createResponse = await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.id;

      // Authenticate to get token
      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: '+1122334455' })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: '+1122334455', otp: '334455' })
        .expect(200);

      const token = verifyResponse.body.token;

      const response = await request(app)
        .get(`/users/${userId}`)
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', `Bearer ${token}`)
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

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .get('/users/some-id')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should return 401 for invalid authentication token', async () => {
      const response = await request(app)
        .get('/users/some-id')
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should return 404 for non-existent user ID with valid authentication', async () => {
      // Create a user and authenticate
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test6@example.com',
        phone: '+1111111116'
      };

      await request(app)
        .post('/users')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send(userData)
        .expect(201);

      await request(app)
        .post('/auth/send-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: '+1111111116' })
        .expect(204);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .set('X-API-Secret', 'test-secret-key-67890')
        .send({ phone: '+1111111116', otp: '111116' })
        .expect(200);

      const token = verifyResponse.body.token;

      const response = await request(app)
        .get('/users/non-existent-id')
        .set('X-API-Secret', 'test-secret-key-67890')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
      expect(response.body).toHaveProperty('message', 'Resource not found');
    });

    it('should return 404 for missing user ID', async () => {
      await request(app)
        .get('/users/')
        .set('X-API-Secret', 'test-secret-key-67890')
        .expect(404); // This now returns 404 since GET /users route is removed
    });
  });
});

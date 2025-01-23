const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Authentication Routes', () => {
  let adminToken;
  let normalUserToken;

  beforeAll(async () => {
    // Setup test database connection
    await mongoose.connect(process.env.MONGODB_URI);

    // Create test users
    await User.deleteMany({});
    const adminUser = await User.create({
      username: 'admin_test',
      password: await require('bcryptjs').hash('adminpass', 10),
      role: 'admin'
    });

    const normalUser = await User.create({
      username: 'normal_test',
      password: await require('bcryptjs').hash('userpass', 10),
      role: 'normal'
    });

    // Generate tokens
    adminToken = jwt.sign(
      { userId: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    normalUserToken = jwt.sign(
      { userId: normalUser._id, role: normalUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Register Tests
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'testpassword',
          role: 'normal'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('User created successfully!');
    });

    it('should fail to register a user with existing username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicate_user',
          password: 'testpassword',
          role: 'normal'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicate_user',
          password: 'anotherpassword',
          role: 'normal'
        });

      expect(response.statusCode).toBe(500);
    });
  });

  // Login Tests
  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin_test',
          password: 'adminpass'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail login with incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin_test',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid credentials!');
    });
  });
});
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Director = require('../models/Director');
const jwt = require('jsonwebtoken');

describe('Director Routes', () => {
  let adminToken;
  let normalUserToken;
  let testDirectorId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create test users
    await User.deleteMany({});
    const adminUser = await User.create({
      username: 'admin_director_test',
      password: await require('bcryptjs').hash('adminpass', 10),
      role: 'admin'
    });

    const normalUser = await User.create({
      username: 'normal_director_test',
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

    // Create a test director
    const testDirector = await Director.create({
      firstName: 'Test',
      lastName: 'Director',
      birthDate: new Date('1980-01-01'),
      bio: 'Test bio'
    });
    testDirectorId = testDirector._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Get All Directors Tests
  describe('GET /api/directors', () => {
    it('should get all directors with authenticated user', async () => {
      const response = await request(app)
        .get('/api/directors')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject unauthenticated access', async () => {
      const response = await request(app)
        .get('/api/directors');

      expect(response.statusCode).toBe(401);
    });
  });

  // Create Director Tests
  describe('POST /api/directors', () => {
    it('should create director with admin token', async () => {
      const response = await request(app)
        .post('/api/directors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'New',
          lastName: 'Director',
          birthDate: '1990-01-01',
          bio: 'New director bio'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('firstName', 'New');
    });

    it('should reject director creation for normal user', async () => {
      const response = await request(app)
        .post('/api/directors')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          firstName: 'Unauthorized',
          lastName: 'Director',
          birthDate: '1990-01-01',
          bio: 'Unauthorized director bio'
        });

      expect(response.statusCode).toBe(403);
    });
  });

  // Delete Director Tests
  describe('DELETE /api/directors/:id', () => {
    it('should delete director with admin token', async () => {
      const response = await request(app)
        .delete(`/api/directors/${testDirectorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(204);
    });

    it('should reject director deletion for normal user', async () => {
      const response = await request(app)
        .delete(`/api/directors/${testDirectorId}`)
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(response.statusCode).toBe(403);
    });
  });
});
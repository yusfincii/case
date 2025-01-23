const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Director = require('../models/Director');
const jwt = require('jsonwebtoken');

describe('Movie Routes', () => {
  let adminToken;
  let normalUserToken;
  let testDirectorId;
  let testMovieId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create test users
    await User.deleteMany({});
    const adminUser = await User.create({
      username: 'admin_movie_test',
      password: await require('bcryptjs').hash('adminpass', 10),
      role: 'admin'
    });

    const normalUser = await User.create({
      username: 'normal_movie_test',
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

    // Create test director
    const testDirector = await Director.create({
      firstName: 'Test',
      lastName: 'Director',
      birthDate: new Date('1980-01-01'),
      bio: 'Test bio'
    });
    testDirectorId = testDirector._id;

    // Create test movie
    const testMovie = await Movie.create({
      title: 'Test Movie',
      description: 'Test description',
      releaseDate: new Date('2023-01-01'),
      genre: 'Drama',
      rating: 8.5,
      director: testDirectorId
    });
    testMovieId = testMovie._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Get All Movies Tests
  describe('GET /api/movies', () => {
    it('should get all movies with authenticated user', async () => {
      const response = await request(app)
        .get('/api/movies')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      //console.log(response.body);
      expect(response.body[7]).toHaveProperty('director');
    });

    it('should reject unauthenticated access', async () => {
      const response = await request(app)
        .get('/api/movies');

      expect(response.statusCode).toBe(401);
    });
  });

  // Create Movie Tests
  describe('POST /api/movies', () => {
    it('should create movie with admin token', async () => {
      const response = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Movie',
          description: 'New movie description',
          releaseDate: '2024-01-01',
          genre: 'Action',
          rating: 7.5,
          director: testDirectorId
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('title', 'New Movie');
    });

    it('should reject movie creation for normal user', async () => {
      const response = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          title: 'Unauthorized Movie',
          description: 'Unauthorized movie description',
          releaseDate: '2024-01-01',
          genre: 'Comedy',
          rating: 6.5,
          director: testDirectorId
        });

      expect(response.statusCode).toBe(403);
    });
  });

  // Update Movie Tests
  describe('PUT /api/movies/:id', () => {
    it('should update movie with admin token', async () => {
      const response = await request(app)
        .put(`/api/movies/${testMovieId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Movie Title',
          rating: 9.0
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Movie Title');
    });

    it('should reject movie update for normal user', async () => {
      const response = await request(app)
        .put(`/api/movies/${testMovieId}`)
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          title: 'Unauthorized Update'
        });

      expect(response.statusCode).toBe(403);
    });
  });

  // Delete Movie Tests
  describe('DELETE /api/movies/:id', () => {
    it('should delete movie with admin token', async () => {
      const response = await request(app)
        .delete(`/api/movies/${testMovieId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
    });

    it('should reject movie deletion for normal user', async () => {
      const response = await request(app)
        .delete(`/api/movies/${testMovieId}`)
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(response.statusCode).toBe(403);
    });
  });
});
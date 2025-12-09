const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');

// Mock logger
jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Rate Limiting Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  test('Should enforce rate limit', async () => {
    // Create a strict rate limiter for testing (2 requests per minute)
    const limiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      message: { success: false, message: 'Too many requests' }
    });

    app.get('/test', limiter, (req, res) => {
      res.json({ success: true });
    });

    // First request should succeed
    await request(app).get('/test').expect(200);

    // Second request should succeed
    await request(app).get('/test').expect(200);

    // Third request should be rate limited
    const response = await request(app).get('/test').expect(429);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Too many requests');
  });

  test('Should have rate limit headers', async () => {
    const limiter = rateLimit({
      windowMs: 60 * 1000,
      max: 5,
      standardHeaders: true
    });

    app.get('/test', limiter, (req, res) => {
      res.json({ success: true });
    });

    const response = await request(app).get('/test').expect(200);

    // Check for standard rate limit headers
    expect(response.headers).toHaveProperty('ratelimit-limit');
    expect(response.headers).toHaveProperty('ratelimit-remaining');
  });

  test('Should reset after window expires', async () => {
    // Very short window for testing (100ms)
    const limiter = rateLimit({
      windowMs: 100,
      max: 1
    });

    app.get('/test', limiter, (req, res) => {
      res.json({ success: true });
    });

    // First request succeeds
    await request(app).get('/test').expect(200);

    // Second request is rate limited
    await request(app).get('/test').expect(429);

    // Wait for window to reset
    await new Promise(resolve => setTimeout(resolve, 150));

    // Third request should succeed after reset
    await request(app).get('/test').expect(200);
  });
});

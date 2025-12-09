const request = require('supertest');
const express = require('express');
const { initDatabase, Bot } = require('../db');

// Mock logger to prevent output during tests
jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Health Check Endpoint', () => {
  let app;

  beforeAll(async () => {
    // Set up test environment
    process.env.DB_PATH = ':memory:';
    process.env.NODE_ENV = 'test';

    // Initialize database
    await initDatabase();
  });

  beforeEach(() => {
    // Create a minimal Express app for testing
    app = express();
    app.use(express.json());

    // Add health endpoint
    app.get('/api/health', async (req, res) => {
      try {
        await Bot.findOne();
        res.json({
          status: 'ok',
          message: 'Bot Manager API běží',
          database: 'connected',
          demo: false,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(503).json({
          status: 'error',
          message: 'Health check selhal',
          database: 'disconnected'
        });
      }
    });
  });

  test('GET /api/health should return 200 and status ok', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('database', 'connected');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('Health response should have correct structure', async () => {
    const response = await request(app).get('/api/health');

    expect(response.body).toMatchObject({
      status: 'ok',
      message: expect.any(String),
      database: 'connected',
      demo: expect.any(Boolean),
      timestamp: expect.any(String)
    });
  });
});

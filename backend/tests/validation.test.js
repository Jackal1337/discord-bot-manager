const request = require('supertest');
const express = require('express');
const { validateBotCreate, validateParseEnv } = require('../securityMiddleware');

// Mock logger
jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Input Validation Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Bot Creation Validation', () => {
    beforeEach(() => {
      app.post('/api/bots', validateBotCreate, (req, res) => {
        res.json({ success: true, data: req.body });
      });
    });

    test('Should accept valid bot data', async () => {
      const validBot = {
        name: 'Test Bot',
        type: 'nodejs',
        script_path: '/home/user/bot/index.js',
        env_vars: '{"TOKEN": "test"}',
        auto_restart: true
      };

      const response = await request(app)
        .post('/api/bots')
        .send(validBot)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Should reject bot without name', async () => {
      const invalidBot = {
        type: 'nodejs',
        script_path: '/home/user/bot/index.js'
      };

      const response = await request(app)
        .post('/api/bots')
        .send(invalidBot)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validace selhala');
    });

    test('Should reject invalid bot type', async () => {
      const invalidBot = {
        name: 'Test Bot',
        type: 'invalid',
        script_path: '/home/user/bot/index.js'
      };

      const response = await request(app)
        .post('/api/bots')
        .send(invalidBot)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('Should reject path traversal attempt in script_path', async () => {
      const maliciousBot = {
        name: 'Malicious Bot',
        type: 'nodejs',
        script_path: '../../etc/passwd'
      };

      const response = await request(app)
        .post('/api/bots')
        .send(maliciousBot)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validace selhala');
    });

    test('Should reject bot name with special characters', async () => {
      const invalidBot = {
        name: 'Test<script>alert(1)</script>',
        type: 'nodejs',
        script_path: '/home/user/bot/index.js'
      };

      const response = await request(app)
        .post('/api/bots')
        .send(invalidBot)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('Should reject invalid JSON in env_vars', async () => {
      const invalidBot = {
        name: 'Test Bot',
        type: 'nodejs',
        script_path: '/home/user/bot/index.js',
        env_vars: 'not valid json'
      };

      const response = await request(app)
        .post('/api/bots')
        .send(invalidBot)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Parse ENV Validation', () => {
    beforeEach(() => {
      app.post('/api/parse-env', validateParseEnv, (req, res) => {
        res.json({ success: true, data: req.body });
      });
    });

    test('Should accept valid script path', async () => {
      const validPath = {
        script_path: '/home/user/bot/index.js'
      };

      const response = await request(app)
        .post('/api/parse-env')
        .send(validPath)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Should reject path traversal in script_path', async () => {
      const maliciousPath = {
        script_path: '../../etc/passwd'
      };

      const response = await request(app)
        .post('/api/parse-env')
        .send(maliciousPath)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('Should reject /etc paths', async () => {
      const maliciousPath = {
        script_path: '/etc/shadow'
      };

      const response = await request(app)
        .post('/api/parse-env')
        .send(maliciousPath)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('Should reject /root paths', async () => {
      const maliciousPath = {
        script_path: '/root/.ssh/id_rsa'
      };

      const response = await request(app)
        .post('/api/parse-env')
        .send(maliciousPath)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

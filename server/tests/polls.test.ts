import request from 'supertest';
import express from 'express';
import pollsRouter from '../src/routes/polls';
import OpenAI from 'openai';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Whose laugh is the most infectious?' } }],
          }),
        },
      },
    };
  });
});

const app = express();
app.use(express.json());
app.use('/', pollsRouter);

describe('GET /generate', () => {
  it('should return a dynamically generated poll question from OpenAI', async () => {
    const res = await request(app).get('/generate');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('question');
    expect(res.body.question).toBe('Whose laugh is the most infectious?');
  });
});
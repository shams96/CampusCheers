import request from 'supertest';
import app from '../src/index'; // Assuming your Express app is exported from src/index.ts

describe('Hype API Routes', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Seed test user and friends
    const res = await request(app).post('/api/hype/seed-user-and-friends');
    testUserId = res.body.userId;
  });

  test('GET /api/hype/ - should return a hype round for user', async () => {
    const res = await request(app).get('/api/hype').query({ userId: testUserId });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('question');
    expect(res.body[0]).toHaveProperty('options');
  });

  test('POST /api/hype/round - should create a new hype round', async () => {
    const res = await request(app).post('/api/hype/round').send({ userId: testUserId });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('userId', testUserId);
  });

  test('POST /api/hype/vote - should submit a vote', async () => {
    // First get a hype round
    const hypeRes = await request(app).get('/api/hype').query({ userId: testUserId });
    const hypeRoundRes = await request(app).post('/api/hype/round').send({ userId: testUserId });

    const pollQuestionId = hypeRes.body[0].question.id;
    const recipientId = hypeRes.body[0].options[0].id;
    const hypeRoundId = hypeRoundRes.body.id;

    const voteRes = await request(app).post('/api/hype/vote').send({
      voterId: testUserId,
      recipientId,
      pollQuestionId,
      hypeRoundId,
    });

    expect(voteRes.statusCode).toBe(201);
    expect(voteRes.body).toHaveProperty('id');
  });
});

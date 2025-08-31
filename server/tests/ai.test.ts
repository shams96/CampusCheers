// Mock the openai module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

import { generateDynamicPoll } from '../src/services/ai';

describe('AI Service', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked function
    const MockOpenAI = require('openai');
    const mockInstance = new MockOpenAI();
    mockCreate = mockInstance.chat.completions.create;
  });

  describe('generateDynamicPoll', () => {
    it('should return a generated question when OpenAI responds successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Whose smile brightens up the room on a gloomy day?',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateDynamicPoll();
      expect(result).toBe('Whose smile brightens up the room on a gloomy day?');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: expect.stringContaining('generate positive and uplifting poll questions') }],
        max_tokens: 50,
        temperature: 0.7,
      });
    });

    it('should return fallback question when OpenAI response is empty', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateDynamicPoll();
      expect(result).toBe("Who's the most likely to brighten someone's day?");
    });

    it('should return fallback question when OpenAI throws an error', async () => {
      mockCreate.mockRejectedValue(new Error('OpenAI API error'));

      const result = await generateDynamicPoll();
      expect(result).toBe("Who's the most likely to brighten someone's day?");
    });

    it('should include the correct prompt structure', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Test question',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateDynamicPoll();

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('positive and uplifting poll questions');
      expect(callArgs.messages[0].content).toContain('Whose [attribute] [action] [context]?');
      expect(callArgs.messages[0].content).toContain('smile, laugh, energy, style, vibe, sense of humor');
    });
  });
});
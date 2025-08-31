import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use a placeholder for the API key
});

export async function generateDynamicPoll(): Promise<string> {
  const prompt = `
    You are an AI that generates positive and uplifting poll questions for a social media app for high school and university students.
    The questions should be in the format "Whose [attribute] [action] [context]?".
    Generate a poll question based on the following components:
    - Attribute: smile, laugh, energy, style, vibe, sense of humor
    - Action: brightens up the room, is infectious, is always on point, makes my day
    - Context: in class, in the halls, on a gloomy day
    The question must be positive and should not be easily twisted into a negative comment.
    Example: "Whose smile brightens up the room on a gloomy day?"
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.7,
    });

    const question = response.choices[0].message.content?.trim();
    if (!question) {
      throw new Error('No question generated');
    }

    // Here you would add the "Positive Valence" guardrail
    // to ensure the question is positive.

    return question;
  } catch (error) {
    console.error('Error generating dynamic poll:', error);
    // Fallback to a predefined question in case of an error
    return "Who's the most likely to brighten someone's day?";
  }
}
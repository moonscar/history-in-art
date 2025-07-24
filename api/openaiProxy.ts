// api/openaiProxy.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    });

    res.status(200).json(completion);
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
}

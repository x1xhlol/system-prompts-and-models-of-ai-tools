import type { Request, Response } from 'express';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const MODEL_NAME = 'gemini-1.0-pro';
const API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `
You are an expert AI programming assistant.
Your name is Jules.
You are to act as a pair programmer to the user.
You are to help the user with their coding tasks.
You should be helpful, friendly, and professional.
You should provide code snippets and explanations when necessary.
You should be able to understand the user's request and provide a relevant response.
You should not ask for more information unless it is absolutely necessary.
You should be able to generate code in any programming language.
You should be able to answer questions about programming, and software development in general.
You should be able to help the user with debugging their code.
You should be able to help the user with writing tests for their code.
You should be able to help the user with writing documentation for their code.
`;

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text: "You are an expert AI programming assistant." }],
        },
        {
          role: "model",
          parts: [{ text: "I am Jules, an expert AI programming assistant. How can I help you today?" }],
        },
      ],
    });

    const result = await chat.sendMessageStream(message);

    res.setHeader('Content-Type', 'text/plain');
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing your request.');
  }
}

import axios from 'axios';
import dotenv from 'dotenv';
import { reliabilityEngine } from '../services/ReliabilityEngine';

dotenv.config();

export interface GeminiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeminiOptions {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_URL = process.env.GEMINI_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_TIMEOUT = parseInt(process.env.GEMINI_TIMEOUT || '45000', 10);

function toGeminiContents(messages: GeminiMessage[]) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

function extractSystemPrompt(messages: GeminiMessage[]): string {
  return messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');
}

export async function geminiChat(
  messages: GeminiMessage[],
  options: GeminiOptions = {}
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured (GEMINI_API_KEY)');
  }

  const url = `${GEMINI_URL}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const systemPrompt = extractSystemPrompt(messages);
  const contents = toGeminiContents(messages);

  if (contents.length === 0) {
    throw new Error('Gemini requires at least one user/assistant message');
  }

  const response = await reliabilityEngine.execute<any>(
    'gemini.chat',
    () =>
      axios.post(
        url,
        {
          systemInstruction: systemPrompt
            ? {
                parts: [{ text: systemPrompt }],
              }
            : undefined,
          contents,
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            topP: options.topP ?? 0.9,
            maxOutputTokens: options.maxOutputTokens ?? 700,
          },
        },
        {
          timeout: GEMINI_TIMEOUT,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    {
      timeoutMs: GEMINI_TIMEOUT,
      maxRetries: 2,
      baseDelayMs: 300,
      maxDelayMs: 2500,
      maxConcurrent: 25,
      circuitFailureThreshold: 4,
      circuitHalfOpenAfterMs: 15000,
      circuitSuccessThreshold: 2,
    }
  );

  const text = response?.data?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text)
    ?.filter(Boolean)
    ?.join('\n')
    ?.trim();

  if (!text) {
    throw new Error('Gemini returned empty or invalid response');
  }

  return text;
}

export async function geminiHealth(): Promise<{ ok: boolean; model: string; detail?: string }> {
  if (!GEMINI_API_KEY) {
    return {
      ok: false,
      model: GEMINI_MODEL,
      detail: 'GEMINI_API_KEY is missing',
    };
  }

  try {
    const url = `${GEMINI_URL}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    await reliabilityEngine.execute<any>(
      'gemini.health',
      () =>
        axios.post(
          url,
          {
            contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
            generationConfig: { maxOutputTokens: 8 },
          },
          { timeout: 8000, headers: { 'Content-Type': 'application/json' } }
        ),
      {
        timeoutMs: 8000,
        maxRetries: 1,
        baseDelayMs: 200,
        maxDelayMs: 1000,
        maxConcurrent: 10,
        circuitFailureThreshold: 3,
        circuitHalfOpenAfterMs: 10000,
        circuitSuccessThreshold: 1,
      }
    );

    return { ok: true, model: GEMINI_MODEL, detail: 'Gemini reachable' };
  } catch (error: any) {
    return {
      ok: false,
      model: GEMINI_MODEL,
      detail: `Gemini unreachable: ${error?.message || 'unknown error'}`,
    };
  }
}

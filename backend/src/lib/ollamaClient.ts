import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaOptions {
  temperature?: number;
  num_predict?: number;
  top_p?: number;
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '90000', 10);

/**
 * Chat with the local Ollama model.
 * Returns the assistant's message content, or throws on failure.
 */
export async function ollamaChat(
  messages: OllamaMessage[],
  options: OllamaOptions = {}
): Promise<string> {
  const url = `${OLLAMA_URL}/api/chat`;

  try {
    const response = await axios.post(
      url,
      {
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.num_predict ?? 500,
          top_p: options.top_p ?? 0.9,
        },
      },
      { timeout: OLLAMA_TIMEOUT }
    );

    const content = response?.data?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Ollama returned empty or invalid response');
    }

    return content.trim();
  } catch (error: any) {
    console.error('[OllamaClient] Error:', error?.message || error);
    throw new Error(`Ollama request failed: ${error?.message || 'unknown error'}`);
  }
}

/**
 * Convenience wrapper: system prompt + user prompt → assistant response.
 */
export async function ollamaPrompt(
  systemPrompt: string,
  userPrompt: string,
  options?: OllamaOptions
): Promise<string> {
  return ollamaChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    options
  );
}

/**
 * Check if Ollama is reachable and the configured model is available.
 */
export async function ollamaHealth(): Promise<{ ok: boolean; model: string; detail?: string }> {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    const models = response?.data?.models || [];
    const found = models.some((m: any) => m.name === OLLAMA_MODEL || m.model === OLLAMA_MODEL);

    return {
      ok: found,
      model: OLLAMA_MODEL,
      detail: found ? 'model available' : 'model not pulled',
    };
  } catch (error: any) {
    return {
      ok: false,
      model: OLLAMA_MODEL,
      detail: `Ollama unreachable: ${error?.message || 'unknown error'}`,
    };
  }
}

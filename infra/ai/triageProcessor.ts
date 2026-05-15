import OpenAI from 'openai';
import { prisma } from '../db/client.ts';
import { runLocalSurrogate } from './localSurrogate.ts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processTriageRequest(caseId: string) {
  const targetCase = await prisma.case.findUnique({ where: { id: caseId } });
  if (!targetCase) return;

  try {
    console.log(`[OTEE] Analyzing Case: ${caseId}`);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Analyze triage data. Return JSON: {categoryTag: string, urgencyScore: number}" },
        { role: "user", content: targetCase.description }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    await prisma.case.update({
      where: { id: caseId },
      data: {
        categoryTag: result.categoryTag,
        urgencyScore: result.urgencyScore,
        status: 'ENRICHED'
      }
    });
    console.log("[OTEE] Success: Case Enriched via OpenAI.");
  } catch (err) {
    console.error("[OTEE-FAIL] Primary cluster offline. Engaging Surrogate.");
    const fallback = runLocalSurrogate(targetCase.description);
    
    await prisma.case.update({
      where: { id: caseId },
      data: {
        categoryTag: fallback.categoryTag,
        urgencyScore: fallback.urgencyScore,
        status: 'ENRICHED_FALLBACK'
      }
    });
  }
}
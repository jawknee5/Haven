import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { decrypt } from '../utils/XortronVault';

dotenv.config();

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const enrichCaseEngine = async (caseId: string, prismaClient: any) => {
  console.log(`[OTEE] Initiating Neural Analysis for Case: ${caseId}`);

  try {
    const targetCase = await prismaClient.case.findUnique({
      where: { id: caseId },
    });

    if (!targetCase) {
      throw new Error('Case not found');
    }

    // Decrypt with Xortron-Apex
    const decryptedDescription = decrypt(targetCase.description);

    console.log(`[OTEE] Transmitting securely to LLM cluster...`);

    const prompt = `
      You are an emergency civic triage AI. Analyze the following distress signal.
      Determine the Urgency Score (1-100) and the Primary Category (Must be exactly one of: HOUSING, FOOD, MEDICAL, UTILITIES, GOODS, EMPLOYMENT, MENTAL_HEALTH, SUBSTANCE_ABUSE, DOMESTIC_VIOLENCE, CHILD_WELFARE, EDUCATION, TRANSPORTATION, LEGAL, OTHER).
      
      Distress Signal: "${decryptedDescription}"
      
      Respond strictly in valid JSON format: {
        "urgencyScore": number,
        "categoryTag": "string"
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');

    const updatedCase = await prismaClient.case.update({
      where: { id: caseId },
      data: {
        urgencyScore: aiResponse.urgencyScore || 50,
        categoryTag: aiResponse.categoryTag || 'OTHER',
        status: 'ENRICHED',
        enrichedAt: new Date(),
      },
    });

    console.log(
      `[OTEE] Analysis Complete. Score: ${updatedCase.urgencyScore}, Category: ${updatedCase.categoryTag}`
    );
    return updatedCase;
  } catch (error) {
    console.error('[OTEE] Error:', error);
    throw error;
  }
};

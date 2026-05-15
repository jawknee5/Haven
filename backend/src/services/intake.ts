import { PrismaClient } from '@prisma/client';
import { encrypt } from '../utils/XortronVault';

const prisma = new PrismaClient();

export const createPublicIntake = async (title: string, description: string) => {
  console.log('[BB] Processing public intake with Xortron-Apex encryption...');

  try {
    // Encrypt description with Xortron-Apex (AES-256-GCM)
    const encryptedDescription = encrypt(description);

    const newCase = await prisma.case.create({
      data: {
        title,
        description: encryptedDescription,
        status: 'NEW',
        userId: null, // Anonymous submission
      },
    });

    console.log(`[BB] Case created with encrypted PII: ${newCase.id}`);
    return newCase;
  } catch (error) {
    console.error('[BB] Error creating case:', error);
    throw error;
  }
};

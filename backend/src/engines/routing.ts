import { prisma } from '../utils/prismaVault';

export const routeCaseEngine = async (caseId: string, prismaClient: any) => {
  console.log(`[HTCRM] Initiating Routing Matrix for Case: ${caseId}`);

  try {
    return await prismaClient.$transaction(async (tx: any) => {
      const targetCase = await tx.case.findUnique({
        where: { id: caseId },
      });

      if (!targetCase || targetCase.status !== 'ENRICHED') {
        throw new Error('Case must be ENRICHED before routing.');
      }

      // Find a matching resource with available capacity
      const resource = await tx.resource.findFirst({
        where: {
          category: targetCase.categoryTag || '',
          available: { gt: 0 },
          isActive: true,
        },
        orderBy: { available: 'desc' },
      });

      if (!resource) {
        throw new Error(
          `[HTCRM] FAILURE: No available resources found for category ${targetCase.categoryTag}.`
        );
      }

      // Decrement Resource Availability (ATOMIC)
      const updatedResource = await tx.resource.update({
        where: { id: resource.id },
        data: { available: { decrement: 1 } },
      });

      // Update Case Status
      const routedCase = await tx.case.update({
        where: { id: caseId },
        data: {
          status: 'ROUTED',
          assignedResourceId: resource.id,
          routedAt: new Date(),
        },
      });

      console.log(
        `[HTCRM] SUCCESS: Case ${caseId} routed to ${resource.name}. Capacity remaining: ${updatedResource.available}`
      );
      return { routedCase, resource: updatedResource };
    });
  } catch (error) {
    console.error('[HTCRM] Error:', error);
    throw error;
  }
};

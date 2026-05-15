// backend/src/services/bbApplicationTracking.ts
import { prisma } from '../utils/prismaVault';

export interface ApplicationStatus {
  applicationId: string;
  status: 'SUBMITTED' | 'PENDING' | 'APPROVED' | 'DENIED' | 'APPEAL';
  lastUpdated: Date;
  nextStep?: string;
  contactPerson?: string;
  contactPhone?: string;
  expectedDecisionDate?: Date;
  documentsRequired: string[];
  documentsSubmitted: string[];
}

/**
 * Create application tracking record
 */
export async function createApplicationTracking(
  caseId: string,
  userId: string,
  agencyName: string,
  applicationId: string,
  applicationURL: string,
  requiredDocuments: string[],
  prismaClient: any
) {
  const tracking = await prismaClient.applicationTracking.create({
    data: {
      caseId,
      userId,
      agencyName,
      applicationId,
      applicationURL,
      status: 'SUBMITTED',
      submitDate: new Date(),
      documentsRequired: requiredDocuments,
      documentsSubmitted: [],
      lastStatusCheck: new Date(),
    },
  });

  return tracking;
}

/**
 * Poll external agency for application status
 */
export async function pollApplicationStatus(
  agencyName: string,
  applicationId: string,
  trackingId: string,
  prismaClient: any
): Promise<ApplicationStatus | null> {
  try {
    // In production, integrate with agency APIs
    // For demo: simulate status updates
    const statuses = ['PENDING', 'PENDING', 'APPROVED'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const tracking = await prismaClient.applicationTracking.findUnique({
      where: { id: trackingId },
    });

    if (!tracking) return null;

    // Update tracking record
    const updated = await prismaClient.applicationTracking.update({
      where: { id: trackingId },
      data: {
        status: randomStatus as any,
        lastStatusCheck: new Date(),
      },
    });

    return {
      applicationId: updated.applicationId,
      status: updated.status,
      lastUpdated: updated.lastStatusCheck,
      nextStep: getNextStep(randomStatus),
      contactPerson: updated.contactPerson,
      contactPhone: updated.contactPhone,
      expectedDecisionDate: updated.expectedDecisionDate,
      documentsRequired: updated.documentsRequired,
      documentsSubmitted: updated.documentsSubmitted,
    };
  } catch (error) {
    console.error('[BB] Application status polling error:', error);
    return null;
  }
}

/**
 * Get next recommended step based on status
 */
function getNextStep(status: string): string {
  const steps: Record<string, string> = {
    SUBMITTED: 'Your application has been received. You should receive confirmation within 3 business days.',
    PENDING: 'Your application is under review. Check back in 5 business days or contact the agency if you have questions.',
    APPROVED: 'Congratulations! Your application has been approved. Check your email for next steps and acceptance letter.',
    DENIED: 'Your application was not approved at this time. You may have the right to appeal. We can help you prepare an appeal.',
    APPEAL: 'Your appeal has been submitted. The agency will review and provide a decision within 10 business days.',
  };

  return steps[status] || 'Waiting for status update from agency...';
}

/**
 * Send status notification to user
 */
export async function notifyApplicationStatusChange(
  userId: string,
  agencyName: string,
  newStatus: string,
  nextStep: string
) {
  console.log(`[BB] 📧 Notification sent to user ${userId}:`);
  console.log(`   Application to ${agencyName} is now: ${newStatus}`);
  console.log(`   Next step: ${nextStep}`);

  // In production: send SMS, email, push notification
  return {
    userId,
    message: `Your ${agencyName} application status: ${newStatus}`,
    nextStep,
    timestamp: new Date(),
  };
}

/**
 * Suggest optimizations for faster approval
 */
export async function suggestProcessOptimizations(
  caseId: string,
  userId: string,
  prismaClient: any
): Promise<string[]> {
  const suggestions: string[] = [];

  const caseData = await prismaClient.case.findUnique({
    where: { id: caseId },
    include: { assessments: true },
  });

  const applications = await prismaClient.applicationTracking.findMany({
    where: { userId },
  });

  // Suggestion 1: Parallel applications
  if (applications.length === 1) {
    suggestions.push(
      '💡 You may qualify for multiple assistance programs. Applying to all simultaneously can expedite your path to housing.'
    );
  }

  // Suggestion 2: Pre-position documentation
  const pendingApps = applications.filter(a => a.status === 'PENDING');
  if (pendingApps.length > 0) {
    suggestions.push(
      '📋 Gather supporting documents now while your application is being reviewed. Having them ready speeds up the next step.'
    );
  }

  // Suggestion 3: Follow up timing
  const oldApplications = applications.filter(
    a => new Date().getTime() - a.lastStatusCheck.getTime() > 7 * 24 * 60 * 60 * 1000
  );
  if (oldApplications.length > 0) {
    suggestions.push(
      '⏰ It\'s been a week since your last status check. Follow up with the agency now - showing persistence can help.'
    );
  }

  return suggestions;
}

/**
 * Generate application status summary for BB chat
 */
export async function generateApplicationSummary(userId: string, prismaClient: any) {
  const applications = await prismaClient.applicationTracking.findMany({
    where: { userId },
    orderBy: { submitDate: 'desc' },
  });

  if (applications.length === 0) {
    return 'You haven\'t submitted any applications yet. I can help you fill out and submit one right now!';
  }

  let summary = '📊 Here\'s the status of your applications:\n\n';

  applications.forEach((app, idx) => {
    summary += `${idx + 1}. **${app.agencyName}** - ${app.status}\n`;
    summary += `   Submitted: ${new Date(app.submitDate).toLocaleDateString()}\n`;
    if (app.expectedDecisionDate) {
      summary += `   Expected decision: ${new Date(app.expectedDecisionDate).toLocaleDateString()}\n`;
    }
    summary += '\n';
  });

  return summary;
}

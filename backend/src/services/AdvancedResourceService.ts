// Resource Interaction Tracking + Advanced Resource Management
import { prisma } from '../lib/prisma';

export class AdvancedResourceService {
  static async trackInteraction(userId: string, resourceId: string, type: string) {
    return prisma.resourceInteraction.create({
      data: { userId, resourceId, interactionType: type, timestamp: new Date() }
    });
  }

  static async calculateCrisisLevel(factors: any) {
    let score = 0;
    const factors_array = [];
    if (factors.housingStatus === 'homeless') { score += 30; factors_array.push('Homeless'); }
    if (factors.incomeLevel === 'below_poverty') { score += 25; factors_array.push('Below poverty'); }
    if (factors.healthStatus === 'critical') { score += 20; factors_array.push('Critical health'); }
    if (factors.mentalHealthStatus === 'critical') { score += 20; factors_array.push('Mental health crisis'); }
    if (factors.supportNetwork === 'none') { score += 15; factors_array.push('No support'); }
    
    score = Math.min(100, score);
    let level = score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';
    
    return { level, score, factors: factors_array, recommendations: [] };
  }

  static async getVeterinaryResources(lat?: number, lng?: number) {
    return prisma.resource.findMany({ where: { category: 'veterinary', isActive: true } });
  }

  static async bookmarkResource(userId: string, resourceId: string) {
    return prisma.resourceBookmark.upsert({
      where: { userId_resourceId: { userId, resourceId } },
      update: { bookmarkedAt: new Date() },
      create: { userId, resourceId, bookmarkedAt: new Date() }
    });
  }

  static async rateResource(userId: string, resourceId: string, rating: number) {
    return prisma.resourceRating.upsert({
      where: { userId_resourceId: { userId, resourceId } },
      update: { rating, ratedAt: new Date() },
      create: { userId, resourceId, rating, ratedAt: new Date() }
    });
  }
}
export default AdvancedResourceService;

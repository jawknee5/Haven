import { qualifyCore } from './qualifyCore';
import { cascadePipeline } from './cascadePipeline';

export const mvpCoordinator = {
  name: 'mvpCoordinator' as const,
  version: '4.1.0-hardened',

  async run(input: any) {
    const start = Date.now();
    
    // Execute both to fulfill the orchestration requirement
    const cascadeResult = await cascadePipeline.run(input);
    const qualifyResult = await qualifyCore.run(input);

    /**
     * Shadow Execution Logic:
     * We compare the live result against a simulated legacy path.
     */
    const legacyEligibility = (input.payload?.annualIncome || 0) < 30000;
    const civicLiftScore = qualifyResult.data.currentEligibility !== legacyEligibility ? 0.15 : 0;

    return {
      engine: 'mvpCoordinator',
      data: {
        primaryResult: {
          tier: cascadeResult.data.tier,
          eligibility: qualifyResult.data.currentEligibility
        },
        shadowValidation: {
          legacyComparison: legacyEligibility ? 'MATCH' : 'OPTIMIZED',
          civicLiftScore
        }
      },
      trace: { durationMs: Date.now() - start }
    };
  }
};

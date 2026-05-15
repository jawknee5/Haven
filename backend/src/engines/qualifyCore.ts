export const qualifyCore = {
  name: 'qualifyCore' as const,
  version: '4.1.0-hardened',
  
  async run(input: any) {
    const start = Date.now();
    const payload = input.payload || {};
    const annualIncome = Number(payload.annualIncome || 0);
    // Correctness Fix: Defaulting householdSize to 1 to prevent NaN in (size - 1)
    const householdSize = Number(payload.householdSize || 1);
    
    // Benefits Cliff Simulation
    const simulations = [0, 2000, 5000].map(delta => {
      const projectedIncome = annualIncome + delta;
      const isEligible = projectedIncome < (15060 + (householdSize - 1) * 5380) * 2;
      return { delta, projectedIncome, isEligible };
    });

    return {
      engine: 'qualifyCore',
      timestamp: new Date().toISOString(),
      data: {
        currentEligibility: simulations[0].isEligible,
        cliffWarning: simulations.some(s => !s.isEligible),
        projections: simulations
      },
      trace: { durationMs: Date.now() - start }
    };
  }
};

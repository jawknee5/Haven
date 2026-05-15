export const firstResponse = {
  name: 'firstResponse' as const,
  version: '4.1.0-hardened',

  async run(input: any) {
    const start = Date.now();
    
    // Hard-coded resource simulation
    const resources = [
      { id: 'shelter_a', capacity: 0.9, distance: 2 },
      { id: 'shelter_b', capacity: 0.2, distance: 7 }
    ];

    // Prefer lower capacity to stabilize systemic load
    const bestMatch = resources.sort((a, b) => a.capacity - b.capacity)[0];

    return {
      engine: 'firstResponse',
      data: {
        recommendedAction: 'ROUTE_TO_BALANCED_RESOURCE',
        targetId: bestMatch.id,
        logic: 'SYSTEMIC_LOAD_STABILIZATION'
      },
      trace: { durationMs: Date.now() - start }
    };
  }
};

export const civicFlow = {
  name: 'civicFlow' as const,
  version: '4.1.0-hardened',

  async run(input: any) {
    const start = Date.now();
    const { barrierDetected } = input.payload || {};

    let tasks = [{ id: 'job_app', title: 'Apply for Housing' }];

    if (barrierDetected === 'NO_TRANSPORT') {
      tasks.unshift({ id: 'bus_pass', title: 'Apply for Transit Subsidy' });
    }

    return {
      engine: 'civicFlow',
      data: { tasks, healEvent: !!barrierDetected },
      trace: { durationMs: Date.now() - start }
    };
  }
};

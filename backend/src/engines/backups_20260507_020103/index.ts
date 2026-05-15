
export const engines = {

  testEngine: {

    run: async (opts: any) => ({ status: 'success', data: 'Engine processed successfully', context: opts.context })

  }

};


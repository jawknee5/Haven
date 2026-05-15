import { router, publicProcedure } from './router';
import { z } from 'zod';
import { engines } from '../engines';

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: 'ok' })),
  runEngine: publicProcedure
    .input(
      z.object({
        engine: z.enum([
          'civicFlow',
          'cascadePipeline',
          'nexusMatch',
          'qualifyCore',
          'firstResponse',
          'mvpCoordinator'
        ]),
        context: z.object({ userId: z.string().nullable() }),
        payload: z.unknown().optional()
      })
    )
    .mutation(async ({ input }) => {
      const engine = engines[input.engine];
      const result = await engine.run({
        context: { userId: input.context.userId },
        payload: input.payload
      });
      return result;
    })
});

export type AppRouter = typeof appRouter;

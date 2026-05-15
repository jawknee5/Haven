import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

// ============================================
// MIDDLEWARE
// ============================================

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next();
});

const isCaseworker = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || !['CASEWORKER', 'ADMIN'].includes(ctx.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Caseworker access required' });
  }
  return next();
});

// ============================================
// PROCEDURES
// ============================================

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const caseworkerProcedure = t.procedure.use(isCaseworker);
export const adminProcedure = t.procedure.use(isAdmin);

export const router = t.router;
export const middleware = t.middleware;

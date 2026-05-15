import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, caseworkerProcedure } from '../lib/trpc';
import { enrichCaseEngine } from '../engines/enrichment';
import { routeCaseEngine } from '../engines/routing';
import { assessRiskEngine } from '../engines/risk';

// ============================================
// TASK ENGINE SCHEMA & VALIDATORS
// ============================================

const TaskStepSchema = z.object({
  id: z.string(),
  label: z.string(),
  completed: z.boolean(),
});

const TaskActionsSchema = z.object({
  upload: z.object({
    enabled: z.boolean(),
    acceptedTypes: z.array(z.enum(['image', 'pdf'])),
  }).optional(),
  call: z.object({
    enabled: z.boolean(),
    phoneNumber: z.string(),
  }).optional(),
  map: z.object({
    enabled: z.boolean(),
    destination: z.object({
      lat: z.number(),
      lng: z.number(),
      address: z.string(),
    }),
  }).optional(),
  openResource: z.object({
    enabled: z.boolean(),
    resourceId: z.string(),
  }).optional(),
});

const TaskAnalyticsSchema = z.object({
  streakImpact: z.number(),
  badgeTriggers: z.array(z.string()),
  completionWeight: z.number(),
});

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().datetime().nullable(),
  steps: z.array(TaskStepSchema),
  actions: TaskActionsSchema,
  analytics: TaskAnalyticsSchema,
});

// ============================================
// AUTH ROUTES
// ============================================

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const token = require('../lib/auth').generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await require('../lib/auth').createSession(ctx.prisma, user.id, token);

      return { token, user: { id: user.id, email: user.email, role: user.role } };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const token = ctx.user?.userId;
    if (token) {
      await require('../lib/auth').revokeSession(ctx.prisma, token);
    }
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
});

// ============================================
// USER PROFILE ROUTES
// ============================================

export const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    });
    return user;
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        onboardingCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: { id: ctx.user!.userId },
        data: input,
      });
    }),
});

// ============================================
// TASK ENGINE ROUTES (OFFICIAL SCHEMA)
// ============================================

export const taskRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
        dueDate: z.date().optional(),
        steps: z.array(z.object({
          label: z.string(),
          completed: z.boolean().default(false),
        })).default([]),
        actions: TaskActionsSchema.optional(),
        analytics: TaskAnalyticsSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create task
      const task = await ctx.prisma.task.create({
        data: {
          userId: ctx.user!.userId,
          title: input.title,
          description: input.description,
          category: input.category,
          priority: input.priority.toUpperCase(),
          dueDate: input.dueDate,
          actions: input.actions || {},
          analytics: input.analytics || { streakImpact: 0, badgeTriggers: [], completionWeight: 1 },
        },
      });

      // Create steps
      if (input.steps && input.steps.length > 0) {
        await ctx.prisma.taskStep.createMany({
          data: input.steps.map((step) => ({
            taskId: task.id,
            label: step.label,
            completed: step.completed,
          })),
        });
      }

      // Return formatted response
      return formatTaskResponse(task, input.steps || []);
    }),

  getByUser: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.prisma.task.findMany({
      where: { userId: ctx.user!.userId },
      include: { steps: true },
      orderBy: { dueDate: 'asc' },
    });

    return tasks.map((task) =>
      formatTaskResponse(task, task.steps)
    );
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: { steps: true },
      });

      if (!task || task.userId !== ctx.user!.userId) {
        throw new Error('Task not found or access denied');
      }

      return formatTaskResponse(task, task.steps);
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['pending', 'in_progress', 'completed']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: { steps: true },
      });

      if (!task || task.userId !== ctx.user!.userId) {
        throw new Error('Task not found or access denied');
      }

      const updated = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          status: input.status.toUpperCase(),
          completedAt: input.status === 'completed' ? new Date() : null,
        },
      });

      return formatTaskResponse(updated, task.steps);
    }),

  completeStep: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        stepId: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.taskId },
      });

      if (!task || task.userId !== ctx.user!.userId) {
        throw new Error('Task not found or access denied');
      }

      const step = await ctx.prisma.taskStep.update({
        where: { id: input.stepId },
        data: {
          completed: input.completed,
          completedAt: input.completed ? new Date() : null,
        },
      });

      return step;
    }),

  executeAction: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        action: z.enum(['upload', 'call', 'map', 'openResource']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.taskId },
      });

      if (!task || task.userId !== ctx.user!.userId) {
        throw new Error('Task not found or access denied');
      }

      const actions = task.actions as any;
      const actionConfig = actions[input.action];

      if (!actionConfig?.enabled) {
        throw new Error(`Action ${input.action} is not enabled for this task`);
      }

      // Log action execution (for analytics)
      console.log(`[TASK-ENGINE] Action executed: ${input.action} on task ${input.taskId}`);

      return {
        success: true,
        action: input.action,
        config: actionConfig,
      };
    }),
});

// ============================================
// CASE MANAGEMENT ROUTES
// ============================================

export const caseRouter = router({
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { encrypt } = require('../utils/prismaVault');
      const encryptedDescription = encrypt(input.description);

      return await ctx.prisma.case.create({
        data: {
          title: input.title,
          description: encryptedDescription,
          status: 'NEW',
          userId: ctx.user?.userId || null,
        },
      });
    }),

  getAll: caseworkerProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
      include: { assessment: true, assignedResource: true },
    });
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.case.findUnique({
        where: { id: input.id },
        include: { assessment: true, assignedResource: true, user: true },
      });
    }),

  enrich: caseworkerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await enrichCaseEngine(input.id, ctx.prisma);
      return result;
    }),

  route: caseworkerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await routeCaseEngine(input.id, ctx.prisma);
      return result;
    }),
});

// ============================================
// RISK ASSESSMENT ROUTES
// ============================================

export const riskRouter = router({
  assess: protectedProcedure.query(async ({ ctx }) => {
    const result = await assessRiskEngine(ctx.user!.userId, ctx.prisma);
    return result;
  }),

  getByCase: caseworkerProcedure
    .input(z.object({ caseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.riskAssessment.findUnique({
        where: { caseId: input.caseId },
      });
    }),
});

// ============================================
// RESOURCE ROUTES
// ============================================

export const resourceRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.resource.findMany({
        where: input.category ? { category: input.category as any } : {},
        orderBy: { name: 'asc' },
      });
    }),

  nearby: publicProcedure
    .input(z.object({ lat: z.number(), lng: z.number(), radius: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.resource.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    }),

  create: caseworkerProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        address: z.string(),
        lat: z.number(),
        lng: z.number(),
        phone: z.string().optional(),
        capacity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.resource.create({
        data: {
          name: input.name,
          description: input.description,
          category: input.category as any,
          address: input.address,
          lat: input.lat,
          lng: input.lng,
          phone: input.phone,
          capacity: input.capacity,
          available: input.capacity,
        },
      });
    }),
});

// ============================================
// ALERTS ROUTES
// ============================================

export const alertRouter = router({
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.alert.findMany({
      where: {
        isActive: true,
        OR: [{ userId: ctx.user!.userId }, { userId: null }],
      },
      orderBy: { severity: 'desc' },
    });
  }),

  create: caseworkerProcedure
    .input(
      z.object({
        message: z.string(),
        severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
        type: z.enum(['WEATHER', 'RESOURCE_ALERT', 'HEALTH_NOTICE', 'SYSTEM_STATUS', 'CASE_UPDATE', 'MATCHING_OPPORTUNITY']),
        userId: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.alert.create({
        data: input,
      });
    }),

  acknowledge: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.alert.update({
        where: { id: input.id },
        data: { acknowledgedAt: new Date() },
      });
    }),
});

// ============================================
// ROOT ROUTER
// ============================================

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  task: taskRouter,
  case: caseRouter,
  risk: riskRouter,
  resource: resourceRouter,
  alert: alertRouter,
});

export type AppRouter = typeof appRouter;

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTaskResponse(task: any, steps: any[]) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    status: task.status.toLowerCase(),
    priority: task.priority.toLowerCase(),
    dueDate: task.dueDate?.toISOString() || null,
    steps: steps.map((step) => ({
      id: step.id,
      label: step.label,
      completed: step.completed,
    })),
    actions: task.actions || {},
    analytics: task.analytics || {},
  };
}

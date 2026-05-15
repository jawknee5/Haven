#!/bin/bash

# ZERG ROUTE STERILIZATION AND INJECTION PROTOCOL



mkdir -p src/routes

mkdir -p src/lib

mkdir -p src/engines



# 1. Provide a dummy auth lib so it compiles

cat << 'EOF' > src/lib/auth.ts

import jwt from 'jsonwebtoken';

export const signToken = (payload: any) => {

  return jwt.sign(payload, process.env.JWT_SECRET || 'zerg_super_secret', { expiresIn: '1d' });

};

EOF



# 2. Provide a dummy engines registry so it compiles

cat << 'EOF' > src/engines/index.ts

export const engines = {

  testEngine: {

    run: async (opts: any) => ({ status: 'success', data: 'Engine processed successfully', context: opts.context })

  }

};

EOF



# 3. Patch Health Routes (Unchanged, they were fine)

cat << 'EOF' > src/routes/health.ts

import type { Router } from 'express';



export function registerHealthRoutes(router: Router) {

  router.get('/health', (_req, res) => {

    res.json({ status: 'ok', intelligence: 'Zerg' });

  });

  router.get('/ready', (_req, res) => {

    res.json({ ready: true });

  });

}

EOF



# 4. Patch Roadmap Routes (Unchanged, perfectly fine as a stub)

cat << 'EOF' > src/routes/roadmap.ts

import type { Router } from 'express';



export function registerRoadmapRoutes(router: Router) {

  router.get('/roadmap/:userId', async (req, res) => {

    const { userId } = req.params;

    res.json({

      id: 'demo',

      userId,

      title: 'Demo Roadmap',

      steps: [],

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString()

    });

  });

}

EOF



# 5. Patch Engines Routes (Fixed typing)

cat << 'EOF' > src/routes/engines.ts

import type { Router } from 'express';

import { engines } from '../engines';



export function registerEngineRoutes(router: Router) {

  router.post('/engines/:name/run', async (req, res, next) => {

    try {

      const name = req.params.name as keyof typeof engines;

      const engine = engines[name];

      if (!engine) {

        return res.status(404).json({ error: 'Engine not found' });

      }

      const { context = {}, payload } = req.body ?? {};

      const result = await engine.run({

        context: { userId: context.userId ?? null },

        payload

      });

      res.json(result);

    } catch (err) {

      next(err);

    }

  });

}

EOF



# 6. Patch Auth Routes (Now actually checks Prisma to see if user exists)

cat << 'EOF' > src/routes/auth.ts

import type { Router } from 'express';

import { signToken } from '../lib/auth';

import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();



export function registerAuthRoutes(router: Router) {

  router.post('/auth/login', async (req, res) => {

    const { email } = req.body;

    if (!email) {

      return res.status(400).json({ error: 'Email required' });

    }

    

    // ZERG SECURITY PATCH: Actually check if the user exists in our database

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {

      return res.status(401).json({ error: 'Unauthorized: User not found in database' });

    }



    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });

  });

}

EOF



# 7. FORGE THE MISSING RESOURCES ROUTE (Connects to our Prisma Schema)

cat << 'EOF' > src/routes/resources.ts

import type { Router } from 'express';

import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();



export function registerResourceRoutes(router: Router) {

  router.get('/resources', async (_req, res, next) => {

    try {

      const resources = await prisma.resource.findMany();

      res.json(resources);

    } catch (err) {

      next(err);

    }

  });

}

EOF



# 8. Patch the Index Router (Using standard Express Router instead of HttpApp)

cat << 'EOF' > src/routes/index.ts

import { Router } from 'express';

import { registerEngineRoutes } from './engines';

import { registerAuthRoutes } from './auth';

import { registerRoadmapRoutes } from './roadmap';

import { registerResourceRoutes } from './resources';

import { registerHealthRoutes } from './health';



export function createRouter(): Router {

  const router = Router();

  

  registerHealthRoutes(router);

  registerAuthRoutes(router);

  registerEngineRoutes(router);

  registerRoadmapRoutes(router);

  registerResourceRoutes(router);



  return router;

}

EOF
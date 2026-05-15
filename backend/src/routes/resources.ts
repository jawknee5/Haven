
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


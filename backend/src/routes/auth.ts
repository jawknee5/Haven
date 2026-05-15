
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


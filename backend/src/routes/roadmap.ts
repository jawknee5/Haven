
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


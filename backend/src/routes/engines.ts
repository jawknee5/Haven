
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



import type { Router } from 'express';



export function registerHealthRoutes(router: Router) {

  router.get('/health', (_req, res) => {

    res.json({ status: 'ok', intelligence: 'HAVEN' });

  });

  router.get('/ready', (_req, res) => {

    res.json({ ready: true });

  });

}


import type { Request, Response } from "express";
import resources from "../../../packages/resources/data/resources.json";

export async function resourcesHandler(req: Request, res: Response) {
  res.json(resources);
}

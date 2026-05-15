import type { Request, Response } from "express";
import benefits from "../../../packages/resources/data/benefits.json";

export async function benefitsHandler(req: Request, res: Response) {
  res.json(benefits);
}

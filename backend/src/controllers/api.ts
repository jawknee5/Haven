import { Request, Response } from 'express';
import { prisma } from '../utils/prismaVault';
import { enrichCaseEngine } from '../engines/enrichment';
import { routeCaseEngine } from '../engines/routing';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const login = (req: Request, res: Response) => {
  const token = jwt.sign({ role: 'ADMIN', name: 'Johnathan Rodriquez' }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
  res.json({ token });
};

export const getCases = async (req: Request, res: Response) => {
  const cases = await prisma.case.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(cases);
};

export const getResources = async (req: Request, res: Response) => {
  const resources = await prisma.resource.findMany();
  res.json(resources);
};

export const routeCase = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const result = await routeCaseEngine(id, prisma);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const enrichCase = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const result = await enrichCaseEngine(id, prisma);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

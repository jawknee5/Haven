import type { Request, Response } from "express";
import { findUserByEmail, verifyPassword } from "../core/auth/userStore";
import { signToken } from "../core/auth/jwt";

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await verifyPassword(user, password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = signToken(user.id);

  res.json({ token });
}

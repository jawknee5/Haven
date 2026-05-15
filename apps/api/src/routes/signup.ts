import type { Request, Response } from "express";
import { createUser, findUserByEmail } from "../core/auth/userStore";
import { signToken } from "../core/auth/jwt";

export async function signupHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  if (await findUserByEmail(email)) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const user = await createUser(email, password);
  const token = signToken(user.id);

  res.json({ token });
}

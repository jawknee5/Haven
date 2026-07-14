import jwt from "jsonwebtoken";

const SECRET = "HAVEN3_SECRET_KEY";

export function signToken(userId: string): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, SECRET) as { userId: string };
}

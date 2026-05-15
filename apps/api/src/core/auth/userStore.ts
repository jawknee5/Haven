import bcrypt from "bcryptjs";

interface User {
  id: string;
  email: string;
  passwordHash: string;
}

const users = new Map<string, User>();

export async function createUser(email: string, password: string): Promise<User> {
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = { id, email, passwordHash };
  users.set(email, user);

  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return users.get(email) ?? null;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

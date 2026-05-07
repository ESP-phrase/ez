import { db } from "@/lib/db";

export async function ensureUser(email: string, name?: string) {
  const safeEmail = email.trim().toLowerCase();
  const safeName = (name ?? safeEmail.split("@")[0] ?? "trader").trim();

  return db.user.upsert({
    where: { email: safeEmail },
    update: { name: safeName },
    create: { email: safeEmail, name: safeName },
  });
}

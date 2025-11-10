// database/seed/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@finsight.app" },
    update: {},
    create: {
      email: "demo@finsight.app",
      name: "Demo User",
      password: "$2a$12$PLACEHOLDER_HASH", // replace with bcrypt hashed password if desired
      currency: "INR",
    },
  });

  await prisma.transaction.createMany({
    data: [
      { userId: user.id, date: new Date("2025-10-01"), amount: 45000, currency: "INR", description: "Salary", type: "income", category: "Salary" },
      { userId: user.id, date: new Date("2025-10-02"), amount: -250, currency: "INR", description: "Uber", type: "expense", category: "Transport" },
      { userId: user.id, date: new Date("2025-10-05"), amount: -799, currency: "INR", description: "Groceries", type: "expense", category: "Food" }
    ],
  });

  console.log("Seed complete");
}
main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

import { createHash } from "crypto";
import { Transaction } from ".prisma/client";

/**
 * Computes a SHA-256 hash of a list of transactions.
 * The hash is deterministic, meaning that the same list of transactions will always produce the same hash.
 * This is achieved by sorting the transactions by date, amount, and merchant before hashing.
 *
 * @param transactions The list of transactions to hash.
 * @returns The SHA-256 hash of the transactions.
 */
export function hashTransactions(transactions: Transaction[]): string {
  // Sort transactions by date, amount, and merchant to ensure determinism
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    if (a.amount < b.amount) return -1;
    if (a.amount > b.amount) return 1;
    if (a.merchant && b.merchant && a.merchant < b.merchant) return -1;
    if (a.merchant && b.merchant && a.merchant > b.merchant) return 1;
    return 0;
  });

  // Create a canonical JSON string of the transactions
  const canonicalJson = JSON.stringify(sortedTransactions);

  // Compute the SHA-256 hash of the canonical JSON string
  return createHash("sha256").update(canonicalJson).digest("hex");
}

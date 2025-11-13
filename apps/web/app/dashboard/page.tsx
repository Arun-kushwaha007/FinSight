"use client";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: string;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      api.get("/transactions").then((res) => {
        setTransactions(res.data);
        const total = res.data.reduce(
          (acc: number, tx: Transaction) => acc + tx.amount,
          0
        );
        setBalance(total);
      });
    }
  }, [loading, user]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">
          Hello, {user.name || user.email}
        </h1>
        <div className="flex gap-4">
          <a href="/upload" className="text-blue-600 hover:underline">
            Upload
          </a>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Net Balance: ₹{balance.toFixed(2)}
        </h2>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-t">
              <td className="p-2">
                {new Date(tx.date).toLocaleDateString()}
              </td>
              <td>{tx.description}</td>
              <td
                className={`${
                  tx.amount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ₹{tx.amount}
              </td>
              <td>{tx.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

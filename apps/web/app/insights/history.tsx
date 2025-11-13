// apps/web/app/insights/history.tsx
"use client";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InsightsHistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, page]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const res = await api.get(`/insights/history?page=${page}&limit=${limit}`);
      setHistory(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "Failed to fetch insight history");
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Insight History</h1>
        <Link href="/insights" className="text-blue-600 hover:underline">
          Back to Latest Insight
        </Link>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      {loadingHistory && <p>Loading history...</p>}

      {!loadingHistory && history.length === 0 && <p>No history found.</p>}

      {!loadingHistory && history.length > 0 && (
        <div className="space-y-4">
          {history.map((insight) => (
            <div key={insight.id} className="p-4 bg-white rounded shadow">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Insight from {new Date(insight.createdAt).toLocaleString()}</h2>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${insight.isStale ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                  {insight.isStale ? "Stale" : "Active"}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Model: {insight.modelUsed} | Transactions: {insight.transactionsCount}
              </p>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer">View Details</summary>
                <div className="p-4 mt-2 bg-gray-50 rounded">
                  <h3 className="font-semibold">Summary</h3>
                  <p className="mt-1 whitespace-pre-wrap">{typeof insight.summary === "string" ? insight.summary : JSON.stringify(insight.summary, null, 2)}</p>
                  <h3 className="mt-4 font-semibold">Recommendations</h3>
                  <ul className="list-disc pl-5 mt-1">
                    {(insight.recommendations || []).map((r: string, idx: number) => <li key={idx}>{r}</li>)}
                  </ul>
                  <h3 className="mt-4 font-semibold">Anomalies</h3>
                  {insight.anomalies?.length ? (
                    <ul className="list-disc pl-5 mt-1">
                      {insight.anomalies.map((a: any, i: number) => <li key={i}>{a.explanation || a.reason || JSON.stringify(a)}</li>)}
                    </ul>
                  ) : (
                    <p className="mt-1">None</p>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={history.length < limit}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
}

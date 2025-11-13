// apps/web/app/insights/page.tsx
"use client";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useRouter } from "next/navigation";

export default function InsightsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [insight, setInsight] = useState<any>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchLatestInsight();
    }
  }, [user]);

  const fetchLatestInsight = async () => {
    setLoadingInsight(true);
    setError(null);
    try {
      const res = await api.get("/insights/latest");
      setInsight(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "Failed to fetch latest insight");
    } finally {
      setLoadingInsight(false);
    }
  };

  const regenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const res = await api.post("/insights/regenerate");
      setInsight(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "AI service failed; try again later.");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">FinSight Insights</h1>
        <div className="text-sm text-gray-500">
          Model: {insight?.modelUsed ?? "Not available"} | Tokens: {insight?.costMetadata?.tokens ?? "N/A"}
        </div>
      </div>

      {insight?.isStale && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500">
          <p className="font-bold">Outdated – Regenerate</p>
          <p>Your transaction data has changed since this insight was generated.</p>
        </div>
      )}

      <div className="space-x-3">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          disabled={regenerating}
          onClick={regenerate}
        >
          {regenerating ? "Regenerating..." : "Regenerate Insight"}
        </button>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      {loadingInsight && <p>Loading insight...</p>}

      {insight && !loadingInsight && (
        <section className="mt-6 space-y-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Summary</h2>
            <p className="mt-2 whitespace-pre-wrap">{typeof insight.summary === "string" ? insight.summary : JSON.stringify(insight.summary, null, 2)}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Recommendations</h3>
            <ul className="list-disc pl-6 mt-2">
              {(insight.recommendations || []).map((r: string, idx: number) => <li key={idx}>{r}</li>)}
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Anomalies</h3>
            {insight.anomalies?.length ? (
              <ul className="list-disc pl-6 mt-2">
                {insight.anomalies.map((a: any, i: number) => (
                  <li key={i}>
                    <div><strong>Reason:</strong> {a.explanation || a.reason || JSON.stringify(a)}</div>
                    <div className="text-sm text-gray-600">{a.transaction ? `${a.transaction.date} • ${a.transaction.description} • ${a.transaction.amount}` : ""}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-gray-600">No anomalies detected.</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

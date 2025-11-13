// apps/web/app/insights/page.tsx
"use client";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useRouter } from "next/navigation";

export default function InsightsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [insights, setInsights] = useState<any>(null);
  const [loadingI, setLoadingI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const generate = async () => {
    setError(null);
    setInsights(null);
    setLoadingI(true);
    try {
      const res = await api.post("/insights", {});
      setInsights(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "Failed to generate insights");
    } finally {
      setLoadingI(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">FinSight Insights</h1>
        <div className="text-sm text-gray-500">Model: {insights?.model_used ?? "Not generated"}</div>
      </div>

      <div className="space-x-3">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          disabled={loadingI}
          onClick={generate}
        >
          {loadingI ? "Generating..." : "Generate Insights"}
        </button>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      {insights && (
        <section className="mt-6 space-y-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Summary</h2>
            <p className="mt-2 whitespace-pre-wrap">{typeof insights.summary === "string" ? insights.summary : JSON.stringify(insights.summary, null, 2)}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Recommendations</h3>
            <ul className="list-disc pl-6 mt-2">
              {(insights.recommendations || []).map((r: string, idx: number) => <li key={idx}>{r}</li>)}
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Anomalies</h3>
            {insights.anomalies?.length ? (
              <ul className="list-disc pl-6 mt-2">
                {insights.anomalies.map((a: any, i: number) => (
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

          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-semibold">Raw model output</h4>
            <pre className="text-xs mt-2 p-2 bg-black text-white rounded max-h-64 overflow-auto">{JSON.stringify(insights.raw, null, 2)}</pre>
          </div>
        </section>
      )}
    </main>
  );
}

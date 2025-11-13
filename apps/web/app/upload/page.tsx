"use client";
import { useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  if (!loading && !user) router.push("/login");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("Uploading...");
      const res = await api.post("/transactions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus(`✅ Uploaded ${res.data.count} records successfully`);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Upload failed");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12">
      {/* Simple top nav */}
      <div className="flex justify-between w-full max-w-3xl px-4 mb-8">
        <h1 className="text-xl font-semibold text-gray-700">FinSight</h1>
        <div className="flex gap-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </a>
          <button onClick={logout} className="text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-6">Upload Transactions</h2>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded text-sm"
          />

          {/* 👇 The Upload button */}
          <button
            type="submit"
            disabled={!file}
            className={`p-2 rounded text-white transition ${
              file
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {file ? "Upload" : "Select a File First"}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">
            {status}
          </p>
        )}

        <p className="mt-8 text-xs text-gray-400">
          Expected CSV headers: Date, Description, Amount, Category
        </p>
      </div>
    </main>
  );
}

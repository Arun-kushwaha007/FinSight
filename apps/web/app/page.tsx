export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gray-50">
  
      <p className="mt-4 text-gray-600 text-lg">
        Welcome to <span className="font-semibold">FinSight</span> — your smart finance companion.
      </p>

      <div className="mt-8 flex gap-4">
        <a
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Login
        </a>
        <a
          href="/signup"
          className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          Sign Up
        </a>
      </div>
    </main>
  );
}

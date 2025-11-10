"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await login(data.email, data.password);
    router.push("/dashboard");
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold mb-6">Welcome Back</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="w-80 space-y-3">
        <input placeholder="Email" {...register("email")} className="w-full border p-2 rounded" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        <input type="password" placeholder="Password" {...register("password")} className="w-full border p-2 rounded" />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        <button disabled={isSubmitting} className="w-full bg-blue-600 text-white p-2 rounded">
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="text-sm mt-4">
        New here?{" "}
        <a href="/signup" className="text-blue-500">Create Account</a>
      </p>
    </main>
  );
}

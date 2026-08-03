import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, LogIn } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { loginEmployee } from '../services/authService';

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await loginEmployee(data.email, data.password);
      toast.success('Welcome back');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  return (
    <AuthFrame title="Employee Login" subtitle="Access Snaxlay sales, invoices, and reports">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email" error={errors.email?.message}>
          <input className="field" type="email" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <input className="field pr-11" type={showPassword ? 'text' : 'password'} {...register('password')} />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-2" onClick={() => setShowPassword((v) => !v)}>
              <Eye size={16} />
            </button>
          </div>
        </Field>
        <button className="btn-primary w-full" disabled={isSubmitting}>
          <LogIn size={18} />
          Login
        </button>
        <p className="text-center text-sm text-slate-500">
          New employee? <Link className="font-bold text-brand" to="/register">Register</Link>
        </p>
      </form>
    </AuthFrame>
  );
}

export function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4 text-ink">
      <section className="w-full max-w-md rounded-lg border border-white/70 bg-white/85 p-7 shadow-soft backdrop-blur">
        <div className="mb-6">
          <p className="text-3xl font-black text-brand">Snaxlay</p>
          <h1 className="mt-4 text-2xl font-black tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

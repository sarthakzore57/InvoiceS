import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { registerEmployee } from '../services/authService';
import { AuthFrame, Field } from './Login';

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
  email: z.email('Enter a valid email'),
  employeeId: z.string().min(3, 'Employee ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await registerEmployee(data);
      toast.success('Employee account created');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  return (
    <AuthFrame title="Employee Registration" subtitle="Create a secured Snaxlay employee account">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Full Name" error={errors.name?.message}>
          <input className="field" {...register('name')} />
        </Field>
        <Field label="Mobile Number" error={errors.mobile?.message}>
          <input className="field" {...register('mobile')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input className="field" type="email" {...register('email')} />
        </Field>
        <Field label="Employee ID" error={errors.employeeId?.message}>
          <input className="field" {...register('employeeId')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input className="field" type="password" {...register('password')} />
        </Field>
        <button className="btn-primary w-full" disabled={isSubmitting}>
          <UserPlus size={18} />
          Register
        </button>
        <p className="text-center text-sm text-slate-500">
          Already registered? <Link className="font-bold text-brand" to="/login">Login</Link>
        </p>
      </form>
    </AuthFrame>
  );
}

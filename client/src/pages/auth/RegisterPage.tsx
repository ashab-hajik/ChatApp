import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { RegisterForm, registerSchema } from '../../utils/validationSchemas';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterForm) {
    setFormError(null);
    try {
      await registerUser(values);
      navigate('/', { replace: true });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        const field = error.response.data?.message?.includes('email') ? 'email' : 'username';
        setError(field, { message: error.response.data.message });
        return;
      }
      setFormError('Could not create your account. Please try again.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Input label="Full name" placeholder="Jane Doe" error={errors.fullName?.message} {...register('fullName')} />
        <Input
          label="Email"
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input label="Username" placeholder="janedoe" error={errors.username?.message} {...register('username')} />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="text-center text-xs text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

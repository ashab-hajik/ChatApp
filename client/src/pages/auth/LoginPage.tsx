import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { LoginForm, loginSchema } from '../../utils/validationSchemas';

export function LoginPage() {
  const { loginWithGoogleIdToken, loginWithPassword } = useAuth();
  const navigate = useNavigate();
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function handleGoogleCredential(idToken: string) {
    setGoogleError(null);
    try {
      const user = await loginWithGoogleIdToken(idToken);
      navigate(user.profileComplete ? '/' : '/complete-profile', { replace: true });
    } catch {
      setGoogleError('Could not sign you in. Please try again.');
    }
  }

  async function onSubmit(values: LoginForm) {
    setFormError(null);
    try {
      await loginWithPassword(values.identifier, values.password);
      navigate('/', { replace: true });
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : null;
      setFormError(message ?? 'Could not sign you in. Please check your details.');
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <GoogleSignInButton onCredential={handleGoogleCredential} />
      {googleError && <p className="text-sm text-red-500">{googleError}</p>}

      <div className="flex w-full items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        OR
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3">
        <Input
          label="Username or email"
          placeholder="janedoe"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <Button type="submit" variant="secondary" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>

      <p className="text-center text-xs text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400">
        By continuing you agree to Chatly&apos;s Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

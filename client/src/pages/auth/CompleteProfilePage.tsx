import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/user.service';
import { CompleteProfileForm, completeProfileSchema } from '../../utils/validationSchemas';
import { isAxiosError } from 'axios';

export function CompleteProfilePage() {
  const { setUser, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CompleteProfileForm>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { fullName: user?.fullName ?? '', username: user?.username ?? '' },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      navigate('/', { replace: true });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError('username', { message: 'That username is already taken' });
      }
    },
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <p className="text-center text-sm text-gray-500">
        Almost there — tell us what to call you.
      </p>

      <Input label="Full name" placeholder="Jane Doe" error={errors.fullName?.message} {...register('fullName')} />

      <Input
        label="Username"
        placeholder="janedoe"
        error={errors.username?.message}
        {...register('username')}
      />

      <Button type="submit" isLoading={mutation.isPending} className="w-full">
        Continue
      </Button>
    </form>
  );
}

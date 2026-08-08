import { ChangeEvent, useRef, useState } from 'react';
import { ArrowLeft, Camera, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { updateProfile } from '../services/user.service';
import { uploadFile } from '../services/upload.service';
import { EditProfileForm, editProfileSchema } from '../utils/validationSchemas';
import { formatLastSeen } from '../utils/formatters';

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { fullName: user?.fullName ?? '', username: user?.username ?? '', bio: user?.bio ?? '' },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadFile(file);
      return updateProfile({ profileImage: uploaded.fileUrl });
    },
    onMutate: () => setIsUploadingAvatar(true),
    onSuccess: setUser,
    onSettled: () => setIsUploadingAvatar(false),
  });

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) avatarMutation.mutate(file);
  }

  async function onSubmit(values: EditProfileForm) {
    try {
      const updated = await updateProfile({ ...values, bio: values.bio || undefined });
      setUser(updated);
      setIsEditing(false);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError('username', { message: 'That username is already taken' });
      }
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <Link to="/" className="rounded-full p-2 hover:bg-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="flex-1 font-medium text-gray-800">Profile</h1>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 border-b border-gray-100 py-8">
        <div className="relative">
          <Avatar src={user.profileImage} name={user.fullName} size="xl" />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow hover:bg-brand-700"
          >
            {isUploadingAvatar ? <Spinner size="sm" className="border-white border-t-transparent" /> : <Camera size={16} />}
          </button>
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarChange} />
        </div>

        {!isEditing && (
          <>
            <h2 className="text-lg font-semibold text-gray-900">{user.fullName}</h2>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">
          <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Username" error={errors.username?.message} {...register('username')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea
              rows={3}
              className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50"
              {...register('bio')}
            />
            {errors.bio?.message && <span className="text-xs text-red-500">{errors.bio.message}</span>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          <ProfileField label="Bio" value={user.bio || 'No bio yet'} />
          <ProfileField label="Email" value={user.email} />
          <ProfileField label="Last seen" value={user.isOnline ? 'Online' : formatLastSeen(user.lastSeen) || 'Unknown'} />
        </div>
      )}
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-4">
      <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  );
}

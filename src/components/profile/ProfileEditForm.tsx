import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import type { Profile } from '@/types/domain'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  bio: z.string().optional(),
  location: z.string().optional(),
  hourly_rate: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(0).optional()),
  years_experience: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(0).optional()),
  languages: z.string().optional(),
  certifications: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ProfileEditFormProps {
  profile: Profile
  onSave: (data: Partial<Profile>) => Promise<void>
  onAvatarUpload: (file: File) => Promise<void>
  loading?: boolean
}

export function ProfileEditForm({ profile, onSave, onAvatarUpload, loading }: ProfileEditFormProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      full_name: profile.full_name ?? '',
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      hourly_rate: profile.hourly_rate ?? undefined,
      years_experience: profile.years_experience ?? undefined,
      languages: profile.languages?.join(', ') ?? '',
      certifications: profile.certifications?.join(', ') ?? '',
    },
  })

  useEffect(() => {
    reset({
      full_name: profile.full_name ?? '',
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      hourly_rate: profile.hourly_rate ?? undefined,
      years_experience: profile.years_experience ?? undefined,
      languages: profile.languages?.join(', ') ?? '',
      certifications: profile.certifications?.join(', ') ?? '',
    })
  }, [profile.id, reset])

  const onSubmit = async (data: FormData) => {
    await onSave({
      full_name: data.full_name,
      bio: data.bio || null,
      location: data.location || null,
      hourly_rate: data.hourly_rate ?? null,
      years_experience: data.years_experience ?? null,
      languages: data.languages ? data.languages.split(',').map((l) => l.trim()).filter(Boolean) : null,
      certifications: data.certifications ? data.certifications.split(',').map((c) => c.trim()).filter(Boolean) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors"
          >
            <Camera size={14} className="text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onAvatarUpload(file)
            }}
          />
        </div>
        <div>
          <p className="font-medium text-gray-900">Profile photo</p>
          <p className="text-sm text-gray-500">Click the camera icon to upload</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full name" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="Location" placeholder="City, State" {...register('location')} />
      </div>

      <Textarea label="Bio" placeholder="Tell families a little about yourself…" rows={4} {...register('bio')} />

      {profile.role === 'babysitter' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Hourly rate ($)"
            type="number"
            min={0}
            placeholder="15"
            error={errors.hourly_rate?.message}
            {...register('hourly_rate')}
          />
          <Input
            label="Years of experience"
            type="number"
            min={0}
            placeholder="2"
            {...register('years_experience')}
          />
        </div>
      )}

      <Input
        label="Languages"
        placeholder="English, Spanish (comma separated)"
        {...register('languages')}
      />

      {profile.role === 'babysitter' && (
        <Input
          label="Certifications"
          placeholder="CPR, First Aid (comma separated)"
          {...register('certifications')}
        />
      )}

      <Button type="submit" loading={isSubmitting || loading} size="lg">
        Save changes
      </Button>
    </form>
  )
}

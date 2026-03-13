import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useProfile } from '@/hooks/useProfile'
import type { Profile as ProfileType } from '@/types/domain'

export function Profile() {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile()
  const [saved, setSaved] = useState(false)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  )

  if (!profile) return null

  const handleSave = async (data: Partial<ProfileType>) => {
    await updateProfile(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex-1">
      <TopBar title="My Profile" />
      <div className="p-6 max-w-2xl mx-auto">
        {saved && (
          <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 text-sm">
            Profile saved successfully!
          </div>
        )}
        <Card padding="lg">
          <ProfileEditForm
            profile={profile}
            onSave={handleSave}
            onAvatarUpload={uploadAvatar}
          />
        </Card>
      </div>
    </div>
  )
}

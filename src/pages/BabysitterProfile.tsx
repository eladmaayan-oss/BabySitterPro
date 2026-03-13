import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Clock, MessageCircle, Calendar } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { BookingCalendar } from '@/components/calendar/BookingCalendar'
import { Spinner } from '@/components/ui/Spinner'
import { useProfile } from '@/hooks/useProfile'
import { useConversations } from '@/hooks/useMessages'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'

export function BabysitterProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile: currentUser } = useAuthStore()
  const { profile, loading } = useProfile(id)
  const { getOrCreateConversation } = useConversations()
  const [showCalendar, setShowCalendar] = useState(false)
  const [messaging, setMessaging] = useState(false)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  )

  if (!profile) return (
    <div className="flex-1 flex items-center justify-center text-gray-500">
      Babysitter not found.
    </div>
  )

  const handleMessage = async () => {
    if (!currentUser?.id) return
    setMessaging(true)
    try {
      const conv = await getOrCreateConversation(currentUser.id, profile.id)
      navigate(`/messages?conversation=${conv.id}`)
    } finally {
      setMessaging(false)
    }
  }

  return (
    <div className="flex-1">
      <TopBar />
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              {profile.location && (
                <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <MapPin size={14} /> {profile.location}
                </p>
              )}
              {(profile.rating_avg ?? 0) > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={profile.rating_avg ?? 0} />
                  <span className="text-sm text-gray-500">{profile.rating_avg?.toFixed(1)} ({profile.rating_count} reviews)</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-4">
                {profile.hourly_rate && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 bg-gray-50 px-3 py-1.5 rounded-xl">
                    <Clock size={15} className="text-gray-500" />
                    {formatCurrency(profile.hourly_rate)}/hr
                  </div>
                )}
                {(profile.years_experience ?? 0) > 0 && (
                  <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl">
                    {profile.years_experience} yrs experience
                  </div>
                )}
              </div>
            </div>

            {currentUser?.role === 'parent' && currentUser.id !== profile.id && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="secondary" onClick={handleMessage} loading={messaging}>
                  <MessageCircle size={16} /> Message
                </Button>
                <Button onClick={() => setShowCalendar(!showCalendar)}>
                  <Calendar size={16} /> Book Now
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Certifications & Languages */}
        {((profile.certifications?.length ?? 0) > 0 || (profile.languages?.length ?? 0) > 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(profile.certifications?.length ?? 0) > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications?.map((cert) => (
                      <Badge key={cert} variant="info">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(profile.languages?.length ?? 0) > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages?.map((lang) => (
                      <Badge key={lang} variant="default">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar */}
        {showCalendar && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Book a session</h2>
            <p className="text-sm text-gray-500 mb-4">
              Select a time slot on the calendar to book this babysitter.
            </p>
            <BookingCalendar babysitter={profile} />
          </div>
        )}
      </div>
    </div>
  )
}

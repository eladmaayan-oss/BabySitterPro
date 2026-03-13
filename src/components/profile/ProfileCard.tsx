import { useNavigate } from 'react-router-dom'
import { MapPin, Clock } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { Profile } from '@/types/domain'

interface ProfileCardProps {
  profile: Profile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      padding="none"
      className="overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
      onClick={() => navigate(`/babysitter/${profile.id}`)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-violet-700 transition-colors">
              {profile.full_name ?? 'Babysitter'}
            </h3>
            {profile.location && (
              <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin size={12} /> {profile.location}
              </p>
            )}
            {(profile.rating_avg ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <StarRating value={profile.rating_avg ?? 0} size={13} />
                <span className="text-xs text-gray-500">({profile.rating_count})</span>
              </div>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{profile.bio}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-wrap gap-1.5">
            {profile.certifications?.slice(0, 2).map((cert) => (
              <Badge key={cert} variant="info" className="text-xs">{cert}</Badge>
            ))}
            {(profile.certifications?.length ?? 0) > 2 && (
              <Badge variant="default">+{(profile.certifications?.length ?? 0) - 2}</Badge>
            )}
          </div>
          {profile.hourly_rate && (
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-800">
              <Clock size={14} className="text-gray-400" />
              {formatCurrency(profile.hourly_rate)}/hr
            </div>
          )}
        </div>
      </div>

      {(profile.years_experience ?? 0) > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500">{profile.years_experience} years experience</p>
        </div>
      )}
    </Card>
  )
}

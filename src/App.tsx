import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useLangStore } from '@/store/langStore'
import { AppShell } from '@/components/layout/AppShell'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Dashboard } from '@/pages/Dashboard'
import { Browse } from '@/pages/Browse'
import { CalendarPage } from '@/pages/CalendarPage'
import { Messages } from '@/pages/Messages'
import { Profile } from '@/pages/Profile'
import { BabysitterProfile } from '@/pages/BabysitterProfile'
import { NotFound } from '@/pages/NotFound'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore()
  if (loading) return <PageSpinner />
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore()
  if (loading) return <PageSpinner />
  if (session) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { setSession, setProfile, setLoading } = useAuthStore()
  const lang = useLangStore((s) => s.lang)

  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as never)
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as never)
            setLoading(false)
          })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setProfile, setLoading])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/babysitter/:id" element={<BabysitterProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

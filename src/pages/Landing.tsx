import { Link } from 'react-router-dom'
import { Baby, Shield, CalendarDays, MessageCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const features = [
  { icon: Shield, title: 'Verified Sitters', desc: 'All babysitters are background-checked and reviewed by parents.' },
  { icon: CalendarDays, title: 'Easy Scheduling', desc: 'Book sessions with a beautiful, intuitive calendar interface.' },
  { icon: MessageCircle, title: 'Real-time Chat', desc: 'Communicate directly with babysitters before you book.' },
  { icon: Star, title: 'Trusted Reviews', desc: 'Read honest reviews from real families in your community.' },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <Baby size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">BabySitter Pro</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <Star size={14} className="fill-violet-500" />
          Trusted by 10,000+ families
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Find the perfect<br />
          <span className="text-violet-600">babysitter</span> near you
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Connect with trusted, experienced babysitters in your area. Book sessions, manage schedules, and communicate — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/signup">
            <Button size="lg" className="px-8">Find a babysitter</Button>
          </Link>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="px-8">Become a sitter</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything you need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mb-4">
                  <Icon size={24} className="text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
        <p className="text-gray-500 mb-8">Join thousands of families and sitters today. It's free to sign up.</p>
        <Link to="/signup">
          <Button size="lg" className="px-10">Create your account</Button>
        </Link>
      </section>
    </div>
  )
}

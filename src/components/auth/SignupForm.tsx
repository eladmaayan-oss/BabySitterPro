import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useT } from '@/hooks/useT'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { RoleSelector } from './RoleSelector'
import type { UserRole } from '@/types/domain'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

export function SignupForm() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { t } = useT()
  const a = t.auth

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!role) { setError('Please select your role'); return }
    setError(null)
    try {
      await signUp(data.email, data.password, data.fullName, role)
      navigate('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  return (
    <Card className="w-full max-w-md" padding="lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{a.createAccount}</h1>
        <p className="text-gray-500 text-sm mt-1">{a.createAccountSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{a.iAm}</p>
          <RoleSelector value={role} onChange={setRole} />
        </div>

        <Input
          label={a.fullName}
          placeholder="Jane Smith"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label={a.email}
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={a.password}
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          {a.createAccountBtn}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        {a.alreadyHaveAccount}{' '}
        <Link to="/login" className="text-violet-600 font-medium hover:underline">{a.signIn}</Link>
      </p>
    </Card>
  )
}

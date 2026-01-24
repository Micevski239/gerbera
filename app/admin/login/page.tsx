'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Check if user is admin
      if (!data.user?.user_metadata?.is_admin) {
        setError('Unauthorized: You do not have admin access')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Redirect to admin products dashboard
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent-coral to-accent-fern p-4">
      <div className="w-full max-w-md rounded-lg border border-border-soft bg-surface-base p-8 shadow-lift">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-ds-section text-ink-strong">Admin Login</h1>
          <p className="text-ds-body text-ink-muted">
            {process.env.NEXT_PUBLIC_SITE_NAME || 'Christmas Decorations'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-ds-body-sm font-medium text-ink-base">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="admin@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-ds-body-sm font-medium text-ink-base">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-accent-coral/40 bg-state-hover px-4 py-3 text-ds-body-sm text-accent-coral">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-ds-body-sm text-accent-coral underline-offset-4 hover:underline">
            Back to website
          </a>
        </div>
      </div>
    </div>
  )
}

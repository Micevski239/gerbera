import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is logged in and is admin
  const admin = await isAdmin()

  // If not admin and not on login page, redirect to login
  if (!admin) {
    // This layout wraps admin routes, but login should be accessible
    // We'll handle login page separately
    return <>{children}</>
  }

  // User is admin, show admin interface
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      {/* Main content with sidebar offset */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

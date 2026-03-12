import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import AnalyticsClient from './AnalyticsClient'

export const dynamic = 'force-dynamic'

async function getAnalyticsData() {
  const supabase = await createServerSupabaseClient()
  const now = new Date()

  // Date boundaries
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29).toISOString()

  // Fetch all page views from the last 30 days in one query
  const { data: recentViews, error } = await supabase
    .from('page_views')
    .select('visitor_id, page_path, created_at')
    .gte('created_at', monthStart)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load analytics:', error.message)
    return {
      todayViews: 0,
      todayVisitors: 0,
      weekViews: 0,
      weekVisitors: 0,
      monthViews: 0,
      monthVisitors: 0,
      topPages: [] as { path: string; views: number }[],
      dailyData: [] as { date: string; views: number; visitors: number }[],
    }
  }

  const views = recentViews ?? []

  // Filter for different periods
  const todayViews = views.filter((v) => v.created_at >= todayStart)
  const weekViews = views.filter((v) => v.created_at >= weekStart)

  // Unique visitors per period
  const uniqueVisitors = (arr: typeof views) => new Set(arr.map((v) => v.visitor_id)).size

  // Top pages (last 30 days)
  const pageCounts = new Map<string, number>()
  for (const v of views) {
    pageCounts.set(v.page_path, (pageCounts.get(v.page_path) ?? 0) + 1)
  }
  const topPages = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, views: count }))

  // Daily breakdown for chart (last 30 days)
  const dailyMap = new Map<string, { views: number; visitors: Set<string> }>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dailyMap.set(key, { views: 0, visitors: new Set() })
  }
  for (const v of views) {
    const key = v.created_at.split('T')[0]
    const entry = dailyMap.get(key)
    if (entry) {
      entry.views++
      entry.visitors.add(v.visitor_id)
    }
  }
  const dailyData = Array.from(dailyMap.entries()).map(([date, d]) => ({
    date,
    views: d.views,
    visitors: d.visitors.size,
  }))

  return {
    todayViews: todayViews.length,
    todayVisitors: uniqueVisitors(todayViews),
    weekViews: weekViews.length,
    weekVisitors: uniqueVisitors(weekViews),
    monthViews: views.length,
    monthVisitors: uniqueVisitors(views),
    topPages,
    dailyData,
  }
}

export default async function AnalyticsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  const data = await getAnalyticsData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Аналитика</h1>
        <p className="text-neutral-600 mt-2">Преглед на посетители и прегледи на страници.</p>
      </div>

      <AnalyticsClient data={data} />
    </div>
  )
}

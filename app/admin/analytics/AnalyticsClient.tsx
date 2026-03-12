'use client'

import { useState } from 'react'

interface AnalyticsData {
  todayViews: number
  todayVisitors: number
  weekViews: number
  weekVisitors: number
  monthViews: number
  monthVisitors: number
  topPages: { path: string; views: number }[]
  dailyData: { date: string; views: number; visitors: number }[]
}

type ChartMode = 'views' | 'visitors'
type TimeRange = '7' | '14' | '30'

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const [chartMode, setChartMode] = useState<ChartMode>('views')
  const [timeRange, setTimeRange] = useState<TimeRange>('30')

  const filteredDaily = data.dailyData.slice(-Number(timeRange))
  const maxValue = Math.max(...filteredDaily.map((d) => (chartMode === 'views' ? d.views : d.visitors)), 1)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('mk-MK', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Денес"
          views={data.todayViews}
          visitors={data.todayVisitors}
          color="bg-blue-500"
        />
        <StatCard
          title="Последни 7 дена"
          views={data.weekViews}
          visitors={data.weekVisitors}
          color="bg-emerald-500"
        />
        <StatCard
          title="Последни 30 дена"
          views={data.monthViews}
          visitors={data.monthVisitors}
          color="bg-purple-500"
        />
      </div>

      {/* Traffic Chart */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-neutral-800">Сообраќај</h2>
          <div className="flex gap-2">
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setChartMode('views')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  chartMode === 'views'
                    ? 'bg-white text-neutral-800 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Прегледи
              </button>
              <button
                onClick={() => setChartMode('visitors')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  chartMode === 'visitors'
                    ? 'bg-white text-neutral-800 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Посетители
              </button>
            </div>
            <div className="flex bg-neutral-100 rounded-lg p-1">
              {(['7', '14', '30'] as TimeRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    timeRange === r
                      ? 'bg-white text-neutral-800 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {r}д
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="relative">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between h-64 absolute left-0 top-0 bottom-6 text-xs text-neutral-400 -ml-1">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue / 2)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-8">
            {/* Grid lines */}
            <div className="relative h-64 border-b border-neutral-200">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-neutral-100" />
                <div className="border-t border-neutral-100" />
                <div />
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end gap-[2px] px-1">
                {filteredDaily.map((day) => {
                  const value = chartMode === 'views' ? day.views : day.visitors
                  const heightPct = maxValue > 0 ? (value / maxValue) * 100 : 0
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                        <div className="bg-neutral-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                          <div className="font-medium">{formatDate(day.date)}</div>
                          <div>{day.views} прегледи</div>
                          <div>{day.visitors} посетители</div>
                        </div>
                      </div>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-200 ${
                          chartMode === 'views'
                            ? 'bg-blue-400 group-hover:bg-blue-500'
                            : 'bg-emerald-400 group-hover:bg-emerald-500'
                        }`}
                        style={{
                          height: `${heightPct}%`,
                          minHeight: value > 0 ? '2px' : '0px',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-neutral-400 overflow-hidden">
              {filteredDaily
                .filter((_, i) => {
                  const total = filteredDaily.length
                  if (total <= 7) return true
                  if (total <= 14) return i % 2 === 0
                  return i % 5 === 0 || i === total - 1
                })
                .map((day) => (
                  <span key={day.date}>{formatDate(day.date)}</span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-bold text-neutral-800 mb-4">
          Најпосетувани страници
          <span className="text-sm font-normal text-neutral-400 ml-2">(последни 30 дена)</span>
        </h2>
        {data.topPages.length === 0 ? (
          <p className="text-neutral-500 text-sm">Нема податоци за прикажување.</p>
        ) : (
          <div className="space-y-3">
            {data.topPages.map((page, i) => {
              const maxPageViews = data.topPages[0]?.views ?? 1
              const widthPct = (page.views / maxPageViews) * 100
              return (
                <div key={page.path} className="flex items-center gap-4">
                  <span className="text-sm text-neutral-400 w-6 text-right">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 truncate">
                        {page.path}
                      </span>
                      <span className="text-sm text-neutral-500 ml-3 flex-shrink-0">
                        {page.views}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-400 rounded-full transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  views,
  visitors,
  color,
}: {
  title: string
  views: number
  visitors: number
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-neutral-800">{views.toLocaleString('mk-MK')}</p>
          <p className="text-xs text-neutral-400 mt-1">Прегледи</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-neutral-800">{visitors.toLocaleString('mk-MK')}</p>
          <p className="text-xs text-neutral-400 mt-1">Посетители</p>
        </div>
      </div>
    </div>
  )
}

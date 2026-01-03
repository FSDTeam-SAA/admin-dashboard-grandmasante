"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/dashboard")
      return res.data.data
    },
  })

  if (isLoading) return <DashboardSkeleton />

  const metrics = [
    {
      label: "Total Revenue",
      value: `$${dashboardData?.totalRevenue?.toLocaleString() || "11,020"}`,
      icon: "S",
      color: "bg-[#FF5D47]",
      cardBg: "bg-[#FDE7E4]",
      border: "border-b-4 border-[#FF5D47]"
    },
    {
      label: "Total User",
      value: dashboardData?.totalUsers || "220",
      icon: <Users className="w-5 h-5 text-white" />,
      color: "bg-[#4B68FF]",
      cardBg: "bg-[#E3E8FF]",
      border: "border-b-4 border-[#4B68FF]"
    },
    {
      label: "Commercial Sales",
      value: dashboardData?.commercialSales || "28",
      icon: <Users className="w-5 h-5 text-white" />,
      color: "bg-[#C400A5]",
      cardBg: "bg-[#F8E3F4]",
      border: "border-b-4 border-[#C400A5]"
    },
    {
      label: "In House Sales",
      value: dashboardData?.inHouseSales || "40",
      icon: <Users className="w-5 h-5 text-white" />,
      color: "bg-[#00C341]",
      cardBg: "bg-[#E3F8E9]",
      border: "border-b-4 border-[#00C341]"
    },
  ]

  // Sample data to match the screenshot curve
  const chartData = dashboardData?.userJoiningOverview || [
    { month: "Jan", count: 200 }, { month: "Feb", count: 400 },
    { month: "Mar", count: 600 }, { month: "Apr", count: 550 },
    { month: "May", count: 600 }, { month: "June", count: 500 },
    { month: "July", count: 650 }, { month: "Aug", count: 800 },
    { month: "Sep", count: 1200 }, { month: "Oct", count: 1400 },
    { month: "Nov", count: 1500 }, { month: "Dec", count: 1450 },
  ]

  return (
    <div className="space-y-10 py-10">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#38B475]">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back to your admin panel</p>
        </div>
        <Button className="rounded-xl border-slate-200 bg-white/50 px-6 py-6 shadow-sm hover:bg-white transition-all gap-2 text-slate-600 font-bold">
          <Filter className="w-5 h-5" />
          Filters
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <Card key={i} className={`border-none ${metric.cardBg} ${metric.border} rounded-2xl shadow-sm overflow-hidden`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-slate-800 tracking-tight">{metric.value}</div>
                  <div className="text-sm font-semibold text-slate-500">{metric.label}</div>
                </div>
                <div className={`w-12 h-12 rounded-full ${metric.color} flex items-center justify-center shadow-lg shadow-black/5`}>
                  {typeof metric.icon === 'string' ? (
                    <span className="text-white text-xl font-bold italic">$</span>
                  ) : (
                    metric.icon
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-[#38B475]">User Joining Overview</h2>
        <Card className="border-none bg-white/40 backdrop-blur-md rounded-[32px] shadow-sm p-8">
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38B475" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#38B475" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="5 5" 
                  vertical={true} 
                  stroke="#cbd5e1" 
                  strokeOpacity={0.5} 
                />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 500 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ stroke: '#38B475', strokeWidth: 2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#E7F7ED] border-2 border-[#38B475] p-4 rounded-2xl shadow-xl">
                          <p className="text-slate-700 font-bold mb-1">15 July 2025</p>
                          <p className="text-[#38B475] text-2xl font-black">Joined: {payload[0].value}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#38B475"
                  strokeWidth={4}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{ r: 8, fill: '#fff', stroke: '#38B475', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[500px] rounded-[32px]" />
    </div>
  )
}
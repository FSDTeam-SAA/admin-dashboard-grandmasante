"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Edit2 } from "lucide-react"

export default function SubscriptionPlansPage() {
  const [activeTab, setActiveTab] = useState("user")
  const queryClient = useQueryClient()

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const res = await apiClient.get("/subscription/plans/admin")
      return res.data.data
    },
  })

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Subscription Plan</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger
              value="user"
              className="px-8 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all"
            >
              For User
            </TabsTrigger>
            <TabsTrigger
              value="commercial"
              className="px-8 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all"
            >
              For Commercial Sales
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-[300px] w-full bg-white/5 rounded-2xl" />)
          : plans?.map((plan: any) => (
              <Card key={plan._id} className="glass-card relative overflow-hidden group border-white/10">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] px-2">
                      Save {plan.savePercentage}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/ user</span>
                  </div>

                  <div className="flex items-center gap-2 text-primary">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">+ {plan.userLimit} Users</span>
                  </div>

                  <Button className="w-full gradient-button group-hover:scale-[1.02] transition-transform flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </CardContent>

                {/* Subtle accent line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-blue-500 opacity-50" />
              </Card>
            ))}
      </div>
    </div>
  )
}

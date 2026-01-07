"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";

import PlanFormModal from "./_components/PlanFormModal";
import DeletePlanModal from "./_components/DeletePlanModal";

export default function SubscriptionPlansPage() {
  const [activeTab, setActiveTab] = useState("user");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePlan, setDeletePlan] = useState<any>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const res = await apiClient.get("/subscription/plans/admin");
      return res.data.data;
    },
  });

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold text-slate-800">
            Subscription Plan
          </h1>

          <Button
            className="h-11 rounded-xl bg-slate-900 text-white hover:opacity-90 shadow-lg shadow-slate-200/50 hover:text-black border-none transition-all"
            onClick={() => {
              setFormMode("add");
              setSelectedPlan(null);
              setFormOpen(true);
            }}
          >
            + Add Plan
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
          <TabsList className="bg-slate-200/50 border border-slate-300/20 p-1 h-12 rounded-lg">
            <TabsTrigger
              value="user"
              className="px-12 h-10 rounded-md data-[state=active]:bg-emerald-200/60 data-[state=active]:text-emerald-800 transition-all font-medium"
            >
              For User
            </TabsTrigger>
            <TabsTrigger
              value="commercial"
              className="px-12 h-10 rounded-md data-[state=active]:bg-emerald-200/60 data-[state=active]:text-emerald-800 transition-all font-medium"
            >
              For Commercial Sales
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[350px] w-full rounded-3xl" />
              ))
          : plans?.map((plan: any) => (
              <Card
                key={plan._id}
                className="relative border-white/60 bg-white/70 backdrop-blur-md shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden border transition-all hover:shadow-2xl"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-3xl font-semibold text-slate-800">
                      {plan.name}
                    </CardTitle>
                    <Badge className="bg-blue-600/90 hover:bg-blue-600 text-white rounded-full px-3 py-1 text-[10px] font-bold border-none">
                      Save {plan.savePercentage}%
                    </Badge>
                  </div>
                  <p className="text-[15px] leading-relaxed text-slate-400 font-medium">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-slate-800">
                      ${plan.price}
                    </span>
                    <span className="text-slate-400 font-medium">/ user</span>
                  </div>

                  <div className="flex items-center gap-2 text-indigo-500">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-bold">
                      + {plan.userLimit} Users
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="h-12 font-semibold bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 hover:opacity-90 rounded-xl border-none text-white shadow-lg shadow-blue-200"
                      onClick={() => {
                        setFormMode("edit");
                        setSelectedPlan(plan);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      className="h-12 rounded-xl"
                      onClick={() => {
                        setDeletePlan(plan);
                        setDeleteOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <PlanFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        plan={selectedPlan}
      />

      <DeletePlanModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        plan={deletePlan}
      />
    </div>
  );
}

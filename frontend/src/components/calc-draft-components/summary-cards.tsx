"use client"

import { Card, CardContent } from "@/components/calc-draft-ui/card"
import { Users, DollarSign, Wallet, AlertTriangle } from "lucide-react"

interface SummaryCardsProps {
  draft: any
}

export default function SummaryCards({ draft }: SummaryCardsProps) {
  const stats = [
    {
      label: "Total Employees",
      value: draft?.employees || 0,
      icon: Users,
      iconBg: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
      trend: null,
    },
    {
      label: "Total Gross",
      value: `$${(draft?.totalGrossPay || draft?.employees * 50000 || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      iconBg: "bg-emerald-50 dark:bg-emerald-950",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      trend: "up",
    },
    {
      label: "Total Net",
      value: `$${(draft?.totalnetpay || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: Wallet,
      iconBg: "bg-violet-50 dark:bg-violet-950",
      iconColor: "text-violet-600 dark:text-violet-400",
      trend: "neutral",
    },
    {
      label: "Exceptions",
      value: draft?.exceptions || 0,
      icon: AlertTriangle,
      iconBg: "bg-red-50 dark:bg-red-950",
      iconColor: "text-red-600 dark:text-red-400",
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
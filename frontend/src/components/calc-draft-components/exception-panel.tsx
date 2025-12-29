"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/calc-draft-ui/card"
import { Badge } from "@/components/calc-draft-ui/badge"
import { AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/calc-draft-ui/button"

interface ExceptionPanelProps {
  exceptions: any[]
  draftId: string
}

export default function ExceptionPanel({ exceptions, draftId }: ExceptionPanelProps) {
  const getSeverityColor = (type: string) => {
    if (type === "MISSING_BANK_DETAILS") {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    } else if (type === "NEGATIVE_NET_PAY" || type === "ZERO_BASE_SALARY") {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    } else if (type === "EXCESSIVE_PENALTIES") {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
    } else if (type === "CALCULATION_ERROR") {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    }
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  }

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Exceptions ({exceptions.length})
          </CardTitle>
          {exceptions.length > 0 && (
            <Link href={`/payroll/exceptions?draftId=${draftId}`}>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                View All
                <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exceptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No exceptions found</p>
          ) : (
            exceptions.slice(0, 5).map((exc, index) => (
              <div key={index} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={getSeverityColor(exc.type)}>{getTypeLabel(exc.type)}</Badge>
                </div>
                <p className="text-sm font-medium">{exc.employeeName}</p>
                <p className="text-xs text-muted-foreground mt-1">{exc.description}</p>
              </div>
            ))
          )}

          {exceptions.length > 5 && (
            <Link
              href={`/payroll/exceptions?draftId=${draftId}`}
              className="flex items-center justify-center gap-1 text-sm text-primary hover:underline mt-4 py-2 font-medium"
            >
              View {exceptions.length - 5} more exceptions
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
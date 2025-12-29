"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/calc-draft-ui/card"
import { Button } from "@/components/calc-draft-ui/button"
import { Badge } from "@/components/calc-draft-ui/badge"
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react"

const STAGES = [
  { id: "collect", label: "Collect Inputs", description: "Employee data and run details" },
  { id: "policies", label: "Apply Policies", description: "Tax brackets and deductions" },
  { id: "gross", label: "Calculate Gross", description: "Base + allowances + bonuses" },
  { id: "deductions", label: "Apply Deductions", description: "Taxes, insurance, penalties" },
  { id: "finalize", label: "Finalize Net", description: "Final net pay calculation" },
]

interface DraftStepperProps {
  draft: any
  onRecalculate: (stage?: string) => void
  recalculating: boolean
}

export default function DraftStepper({ draft, onRecalculate, recalculating }: DraftStepperProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null)

  const getStageStatus = (stageId: string): "completed" | "in-progress" | "pending" | "failed" => {
    const draftStatus = draft?.status
    if (draftStatus === "draft") return "pending"
    if (draftStatus === "processing") return "in-progress"
    if (draftStatus === "failed") return "failed"
    if (draftStatus === "completed" || draftStatus === "under review" || draftStatus === "approved") {
      return "completed"
    }
    return "pending"
  }

  const getStatusColor = (status: "completed" | "in-progress" | "pending" | "failed") => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-800"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Calculation Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {STAGES.map((stage, index) => {
          const status = getStageStatus(stage.id)
          const isExpanded = expandedStage === stage.id

          return (
            <div key={stage.id} className="space-y-2">
              <button
                onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-border bg-background font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 justify-between">
                      <div>
                        <p className="font-medium text-sm">{stage.label}</p>
                        <p className="text-xs text-muted-foreground">{stage.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(status)}>{status}</Badge>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="ml-11 p-3 bg-muted/50 rounded-lg border border-border/50 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Key Metrics</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Employees</p>
                        <p className="font-semibold">{draft?.employees || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Exceptions</p>
                        <p className="font-semibold text-red-600">{draft?.totalExceptions || 0}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => onRecalculate(stage.id)}
                    disabled={recalculating}
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${recalculating ? "animate-spin" : ""}`} />
                    Recalculate
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
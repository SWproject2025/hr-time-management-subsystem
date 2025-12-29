"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/calc-draft-ui/button"
import { Download, RefreshCw, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DraftStepper from "@/components/calc-draft-components/draft-stepper"
import DraftPreviewTable from "@/components/calc-draft-components/draft-preview-table"
import ExceptionPanel from "@/components/calc-draft-components/exception-panel"
import SummaryCards from "@/components/calc-draft-components/summary-cards"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function DraftReviewPage() {
  const params = useParams()
  const draftId = params.id as string
  const { toast } = useToast()

  const [draft, setDraft] = useState<any>({
    _id: draftId,
    runId: "Loading...",
    employees: 0,
    totalnetpay: 0,
    status: "pending",
    payrollPeriodStart: null,
    payrollPeriodEnd: null,
  })
  const [employees, setEmployees] = useState<any[]>([])
  const [exceptions, setExceptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    const fetchDraftData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${draftId}`)
        if (!response.ok) throw new Error("Failed to fetch draft data")
        const draftData = await response.json()

        const detailsResponse = await fetch(`${API_URL}/payroll/draft/${draftId}/details`)
        let employeesData: any[] = []
        if (detailsResponse.ok) {
          employeesData = await detailsResponse.json()
          if (!Array.isArray(employeesData)) {
            employeesData = []
          }
        }

        const exceptionsData = parseExceptions(employeesData, draftData)

        setDraft(draftData)
        setEmployees(employeesData)
        setExceptions(exceptionsData)
        setLoading(false)
      } catch (err: any) {
        setLoading(false)
      }
    }

    if (draftId) {
      fetchDraftData()
    }
  }, [draftId])

  const parseExceptions = (employees: any[], draftData: any) => {
    const exceptionsList: any[] = []

    if (!Array.isArray(employees)) return exceptionsList

    employees.forEach((employee) => {
      if (employee.exceptions && typeof employee.exceptions === "string") {
        const exceptionStrings = employee.exceptions
          .split("|")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)

        exceptionStrings.forEach((excString: string, index: number) => {
          const colonIndex = excString.indexOf(":")
          if (colonIndex > -1) {
            const type = excString.substring(0, colonIndex).trim()
            const description = excString.substring(colonIndex + 1).trim()

            let severity = "MEDIUM"
            if (type === "NEGATIVE_NET_PAY" || type === "EXCESSIVE_PENALTIES") {
              severity = "HIGH"
            } else if (type === "ZERO_BASE_SALARY") {
              severity = "HIGH"
            } else if (type === "CALCULATION_ERROR") {
              severity = "CRITICAL"
            }

            exceptionsList.push({
              _id: `exc_${employee._id}_${index}`,
              employeeId: employee._id,
              employeeName: employee.name || "Unknown",
              employeeCode: employee.code || "N/A",
              payrollRunId: draftData?._id || draftId,
              runId: draftData?.runId || "N/A",
              type,
              severity,
              description,
              status: "open",
              createdAt: new Date().toISOString(),
            })
          }
        })
      }
    })

    return exceptionsList
  }

  const handleRecalculate = async (stage?: string) => {
    try {
      setRecalculating(true)

      const response = await fetch(`${API_URL}/payroll/draft/${draftId}/recalculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      })

      if (!response.ok) throw new Error("Failed to recalculate")

      toast({
        title: "Success",
        description: stage ? `${stage} recalculated successfully` : "Draft recalculated successfully",
      })

      const draftResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs/${draftId}`)
      const detailsResponse = await fetch(`${API_URL}/payroll/draft/${draftId}/details`)

      if (draftResponse.ok && detailsResponse.ok) {
        const draftData = await draftResponse.json()
        const employeesData = await detailsResponse.json()
        const exceptionsData = parseExceptions(employeesData, draftData)

        setDraft(draftData)
        setEmployees(employeesData)
        setExceptions(exceptionsData)
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to recalculate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRecalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Draft Review</h1>
          <p className="text-base text-muted-foreground">
            {draft?.runId || "N/A"} •{" "}
            {draft?.payrollPeriodStart ? new Date(draft.payrollPeriodStart).toLocaleDateString() : "-"} to{" "}
            {draft?.payrollPeriodEnd ? new Date(draft.payrollPeriodEnd).toLocaleDateString() : "-"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="default" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button size="default" onClick={() => handleRecalculate()} disabled={recalculating} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
            Recalculate All
          </Button>
          <Button size="default" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      <SummaryCards draft={draft} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
        <div className="lg:col-span-1">
          <DraftStepper draft={draft} onRecalculate={handleRecalculate} recalculating={recalculating} />
        </div>

        <div className="lg:col-span-2">
          <DraftPreviewTable employees={employees} draftId={draftId} exceptions={exceptions} />
        </div>

        <div className="lg:col-span-1">
          <ExceptionPanel exceptions={exceptions} draftId={draftId} />
        </div>
      </div>
    </div>
  )
}

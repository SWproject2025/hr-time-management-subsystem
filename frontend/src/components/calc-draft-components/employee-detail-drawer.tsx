"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/calc-draft-ui/sheet"
import { Badge } from "@/components/calc-draft-ui/badge"
import { AlertCircle } from "lucide-react"

interface EmployeeDetailDrawerProps {
  isOpen: boolean
  employee: any
  exceptions: any[]
  onClose: () => void
}

export default function EmployeeDetailDrawer({ isOpen, employee, exceptions, onClose }: EmployeeDetailDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{employee?.name}</SheetTitle>
          <SheetDescription>{employee?.employeeId}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Exceptions */}
          {exceptions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Exceptions
              </h3>
              <div className="space-y-2">
                {exceptions.map((exc, i) => (
                  <div
                    key={i}
                    className="p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900"
                  >
                    <Badge variant="outline" className="mb-2">
                      {exc.type}
                    </Badge>
                    <p className="text-sm text-red-700 dark:text-red-300">{exc.description || exc.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earnings */}
          <div>
            <h3 className="font-semibold mb-3">Earnings</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Salary</span>
                <span>${(employee?.baseSalary || 0).toFixed(2)}</span>
              </div>
              {(employee?.allowances || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Allowances</span>
                  <span>${employee.allowances.toFixed(2)}</span>
                </div>
              )}
              {(employee?.bonus || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bonus</span>
                  <span>${employee.bonus.toFixed(2)}</span>
                </div>
              )}
              {(employee?.benefit || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Benefits</span>
                  <span>${employee.benefit.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t flex justify-between font-semibold">
                <span>Gross Salary</span>
                <span>
                  $
                  {(
                    (employee?.baseSalary || 0) +
                    (employee?.allowances || 0) +
                    (employee?.bonus || 0) +
                    (employee?.benefit || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="font-semibold mb-3">Deductions</h3>
            <div className="space-y-2">
              {(employee?.deductions || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Deductions</span>
                  <span>${employee.deductions.toFixed(2)}</span>
                </div>
              )}
              {(employee?.penalties || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Penalties</span>
                  <span className="text-red-600">${employee.penalties.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t flex justify-between font-semibold">
                <span>Total Deductions</span>
                <span>${((employee?.deductions || 0) + (employee?.penalties || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Net Pay</span>
              <span className="text-2xl font-bold">${(employee?.netPay || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/calc-draft-ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/calc-draft-ui/card"
import { Button } from "@/components/calc-draft-ui/button"
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import EmployeeDetailDrawer from "./employee-detail-drawer"

interface DraftPreviewTableProps {
  employees: any[]
  draftId: string
  exceptions: any[]
}

export default function DraftPreviewTable({ employees, draftId, exceptions }: DraftPreviewTableProps) {
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "netPay" | "exceptions">("name")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getEmployeeExceptions = (employeeId: string) => {
    return exceptions.filter((e) => e.employeeId === employeeId)
  }

  const hasException = (employeeId: string) => {
    return getEmployeeExceptions(employeeId).length > 0
  }

  const toggleRow = (employeeId: string) => {
    setExpandedRows((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    )
  }

  const openEmployeeDetails = (employee: any) => {
    setSelectedEmployee(employee)
    setShowDrawer(true)
  }

  const sortedEmployees = [...employees].sort((a, b) => {
    switch (sortBy) {
      case "netPay":
        return (b.netPay || 0) - (a.netPay || 0)
      case "exceptions":
        return getEmployeeExceptions(b._id).length - getEmployeeExceptions(a._id).length
      default:
        return (a.name || "").localeCompare(b.name || "")
    }
  })

  const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employee Preview</CardTitle>
            <div className="flex gap-1">
              <Button variant={sortBy === "name" ? "default" : "outline"} size="sm" onClick={() => setSortBy("name")}>
                Name
              </Button>
              <Button
                variant={sortBy === "netPay" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("netPay")}
              >
                Net Pay
              </Button>
              <Button
                variant={sortBy === "exceptions" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("exceptions")}
              >
                Exceptions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">Allowances</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Penalties</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((employee) => {
                  const empId = employee._id
                  const isExpanded = expandedRows.includes(empId)
                  const employeeExceptions = getEmployeeExceptions(empId)
                  const employeeHasException = employeeExceptions.length > 0

                  return (
                    <>
                      <TableRow
                        key={empId}
                        className={`cursor-pointer hover:bg-muted/50 ${
                          employeeHasException ? "bg-red-50 dark:bg-red-950/20" : ""
                        }`}
                        onClick={() => openEmployeeDetails(employee)}
                      >
                        <TableCell className="w-8">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRow(empId)
                            }}
                            className="p-0"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {employee.name}
                            {employeeHasException && <AlertCircle className="w-4 h-4 text-red-600" />}
                          </div>
                        </TableCell>
                        <TableCell>{employee.department || "-"}</TableCell>
                        <TableCell className="text-right">${(employee.baseSalary || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(employee.allowances || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(employee.deductions || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(employee.penalties || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">${(employee.netPay || 0).toFixed(2)}</TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow key={`${empId}-expanded`} className="bg-muted/50">
                          <TableCell colSpan={8} className="p-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm mb-3">Earnings</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Base Salary</span>
                                      <span className="font-medium">${(employee.baseSalary || 0).toFixed(2)}</span>
                                    </div>
                                    {(employee.allowances || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Allowances</span>
                                        <span className="font-medium">${employee.allowances.toFixed(2)}</span>
                                      </div>
                                    )}
                                    {(employee.bonus || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Bonus</span>
                                        <span className="font-medium">${employee.bonus.toFixed(2)}</span>
                                      </div>
                                    )}
                                    {(employee.benefit || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Benefits</span>
                                        <span className="font-medium">${employee.benefit.toFixed(2)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm mb-3">Deductions</h4>
                                  <div className="space-y-2 text-sm">
                                    {(employee.deductions || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Total Deductions</span>
                                        <span className="font-medium">${(employee.deductions || 0).toFixed(2)}</span>
                                      </div>
                                    )}
                                    {(employee.penalties || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Penalties</span>
                                        <span className="font-medium text-red-600">
                                          ${employee.penalties.toFixed(2)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {employeeHasException && (
                                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900">
                                  <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2">
                                    Exceptions:
                                  </p>
                                  <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                                    {employeeExceptions.map((exc, i) => (
                                      <li key={i}>• {exc.description || exc.type}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedEmployees.length)} of {sortedEmployees.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              {totalPages > 5 && <span className="text-muted-foreground">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Detail Drawer */}
      {selectedEmployee && (
        <EmployeeDetailDrawer
          isOpen={showDrawer}
          employee={selectedEmployee}
          exceptions={getEmployeeExceptions(selectedEmployee._id)}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </>
  )
}
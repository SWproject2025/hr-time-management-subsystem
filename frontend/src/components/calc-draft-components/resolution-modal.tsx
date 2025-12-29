"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/calc-draft-ui/dialog"
import { Button } from "@/components/calc-draft-ui/button"
import { Input } from "@/components/calc-draft-ui/input"
import { Label } from "@/components/calc-draft-ui/label"
import { Textarea } from "@/components/calc-draft-ui/textarea"

interface ResolutionModalProps {
  isOpen: boolean
  exception: any
  onClose: () => void
  onSubmit: (resolution: any) => void
}

export default function ResolutionModal({ isOpen, exception, onClose, onSubmit }: ResolutionModalProps) {
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    iban: "",
    adjustedAmount: "",
    reason: "",
    resolutionNote: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bankName: "",
        accountNumber: "",
        iban: "",
        adjustedAmount: "",
        reason: "",
        resolutionNote: "",
      })
    }
  }, [isOpen, exception])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Build resolution note based on exception type
      let resolutionNote = formData.resolutionNote

      if (exception?.type === "MISSING_BANK_DETAILS") {
        resolutionNote = `Bank details updated: ${formData.bankName} - ${formData.accountNumber}${
          formData.iban ? ` (IBAN: ${formData.iban})` : ""
        }. ${formData.resolutionNote}`
      } else if (["NEGATIVE_NET_PAY", "EXCESSIVE_PENALTIES", "ZERO_BASE_SALARY"].includes(exception?.type)) {
        resolutionNote = `Adjusted amount: ${formData.adjustedAmount}. Reason: ${formData.reason}. ${formData.resolutionNote}`
      }

      await onSubmit({ ...formData, resolutionNote })
    } finally {
      setLoading(false)
    }
  }

  const isBankException = exception?.type === "MISSING_BANK_DETAILS"
  const isFinancialException = ["NEGATIVE_NET_PAY", "EXCESSIVE_PENALTIES", "ZERO_BASE_SALARY"].includes(exception?.type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resolve Exception</DialogTitle>
          <DialogDescription>
            {exception?.employeeName} • {exception?.type?.replace(/_/g, " ")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isBankException && (
            <div className="space-y-4">
              <h3 className="font-semibold">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="Enter bank name"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="iban">IBAN (Optional)</Label>
                <Input
                  id="iban"
                  placeholder="Enter IBAN"
                  value={formData.iban}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      iban: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {isFinancialException && (
            <div className="space-y-4">
              <h3 className="font-semibold">Adjustment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adjustedAmount">Adjusted Amount</Label>
                  <Input
                    id="adjustedAmount"
                    type="number"
                    step="0.01"
                    placeholder="Enter adjusted amount"
                    value={formData.adjustedAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adjustedAmount: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    placeholder="Adjustment reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reason: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="resolutionNote">Resolution Notes</Label>
              <Textarea
                id="resolutionNote"
                placeholder="Add any additional comments or justification for this resolution"
                value={formData.resolutionNote}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    resolutionNote: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Resolving..." : "Resolve Exception"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
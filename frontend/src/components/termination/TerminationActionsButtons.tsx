"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Eye, Check, X } from "lucide-react";

interface Props {
  termination: {
    _id: string;
    status: string;
  };
  onApprove: () => void;
  onReject: () => void;
}

const TerminationActionButtons: React.FC<Props> = ({
  termination,
  onApprove,
  onReject,
}) => {
  const router = useRouter();

  return (
    <div className="flex gap-3 mt-6">
      {/* APPROVE */}
      {(termination.status === "PENDING" ||
        termination.status === "UNDER_REVIEW") && (
        <>
          <button
            onClick={onApprove}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Check size={16} />
            Approve
          </button>

          <button
            onClick={onReject}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <X size={16} />
            Reject
          </button>
        </>
      )}

      {/* ✅ STEP 5 — VIEW CLEARANCE */}
      {termination.status === "APPROVED" && (
        <button
          onClick={() =>
            router.push(`/termination/${termination._id}/clearance`)
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Eye size={16} />
          View Clearance
        </button>
      )}
    </div>
  );
};

export default TerminationActionButtons;

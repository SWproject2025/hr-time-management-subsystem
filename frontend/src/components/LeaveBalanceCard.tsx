interface LeaveBalance {
  leaveType: {
    _id: string;
    code: string;
    name: string;
    paid: boolean;
  };
  yearlyEntitlement: number;
  accruedRounded: number;
  carryForward: number;
  taken: number;
  pending: number;
  remaining: number;
}

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

export default function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const available = balance.remaining - balance.pending;
  const utilizationPercent = ((balance.taken / balance.yearlyEntitlement) * 100).toFixed(0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{balance.leaveType.name}</h3>
          <p className="text-sm text-gray-500">{balance.leaveType.code}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            balance.leaveType.paid
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {balance.leaveType.paid ? 'Paid' : 'Unpaid'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Utilization</span>  
          <span className="font-medium">{utilizationPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, Number(utilizationPercent))}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Entitlement</span>
          <span className="font-medium">{balance.yearlyEntitlement} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Accrued</span>
          <span className="font-medium">{balance.accruedRounded} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Carry Forward</span>
          <span className="font-medium">{balance.carryForward} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Taken</span>
          <span className="font-medium text-red-600">{balance.taken} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pending</span>
          <span className="font-medium text-orange-600">{balance.pending} days</span>
        </div>
        
        {/* Remaining - Highlighted */}
        <div className="pt-3 border-t flex justify-between items-center">
          <span className="font-semibold text-gray-900">Available</span>
          <span className="text-2xl font-bold text-green-600">{available} days</span>
        </div>
      </div>
    </div>
  );
}

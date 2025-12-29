'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LeaveBalance {
  leaveType: {
    _id: string;
    name: string;
    code: string;
    paid: boolean;
  };
  yearlyEntitlement: number;
  accruedActual: number;
  accruedRounded: number;
  carryForward: number;
  taken: number;
  pending: number;
  remaining: number;
}

export default function LeaveBalancePage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leaves/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalances(response.data || []);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Leave Balance</h1>
          <p className="text-gray-600 mt-2">Overview of your leave entitlements and usage</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading balance...</p>
          </div>
        ) : balances.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No leave entitlements found</p>
            <p className="text-gray-400 text-sm mt-2">Contact HR to set up your leave entitlements</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {balances.map((balance) => (
              <div
                key={balance.leaveType._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {balance.leaveType.name}
                    </h3>
                    <p className="text-sm text-gray-500">{balance.leaveType.code}</p>
                  </div>
                  {balance.leaveType.paid && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      PAID
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Remaining - Most Important */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                    <p className="text-3xl font-bold text-blue-600">{balance.remaining}</p>
                    <p className="text-xs text-gray-500">days</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">Entitlement</p>
                      <p className="text-lg font-semibold text-gray-900">{balance.yearlyEntitlement}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">Carry Forward</p>
                      <p className="text-lg font-semibold text-gray-900">{balance.carryForward}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">Taken</p>
                      <p className="text-lg font-semibold text-red-600">{balance.taken}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">Pending</p>
                      <p className="text-lg font-semibold text-orange-600">{balance.pending}</p>
                    </div>
                  </div>

                  {/* Accrual Info */}
                  {balance.accruedActual > 0 && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Accrued: {balance.accruedRounded} days (actual: {balance.accruedActual.toFixed(2)})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Card */}
        {!loading && balances.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Overall Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-100 text-sm">Total Entitlement</p>
                <p className="text-3xl font-bold">
                  {balances.reduce((sum, b) => sum + b.yearlyEntitlement, 0)}
                </p>
                <p className="text-blue-100 text-xs">days/year</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total Available</p>
                <p className="text-3xl font-bold">
                  {balances.reduce((sum, b) => sum + b.remaining, 0)}
                </p>
                <p className="text-blue-100 text-xs">days</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total Taken</p>
                <p className="text-3xl font-bold">
                  {balances.reduce((sum, b) => sum + b.taken, 0)}
                </p>
                <p className="text-blue-100 text-xs">days</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total Pending</p>
                <p className="text-3xl font-bold">
                  {balances.reduce((sum, b) => sum + b.pending, 0)}
                </p>
                <p className="text-blue-100 text-xs">days</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
